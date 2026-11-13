import { requestUrl } from "obsidian";
import { fiveSecBars, parseMisIndex } from "../calc/market";
import { FugleStream } from "./stream";
import type { MarketCalendar } from "./calendar";
import type { Why } from "../calc/calendar";
import { addTick, Bars, fromFugle, fromTwseMonth, fromYahoo, isMinutes, joinBars, lastSession, Range } from "../calc/chart";

// Prices (Phase 5). A provider answers one symbol; Yahoo is the default, others can be added behind the same interface.
// Prices and FX rates are kept in memory and in the plugin's local storage (last good value, shown at once on the next start)
// and refreshed in the background when older than TTL. Pages never wait for the network: they draw with what is known and
// redraw when fresh numbers arrive.
import { closedInHours, isTwSym, marketClock, marketMinute, marketOpen, nextOpen, parseFugleQuote, parseTwse, parseTwseAll, Quote } from "../calc/quotes";
export type { Quote };
export interface PriceProvider { quote(symbol: string, range?: "1mo" | "6mo" | "1y"): Promise<Quote | null>; bars?(symbol: string, range: Range): Promise<Bars | null> }
// Bars for a chart interval, fetched further back than one screen (panning, and the averages from the left edge).
// Yahoo keeps 1-minute bars 7 days, 5–30 minutes 60 days, 60 minutes 2 years.
export interface Series { bars: Bars; time: number; source: string }
const YQ: Record<Range, [string, string]> = { I: ["1m", "5d"], "1m": ["1m", "5d"], "5m": ["5m", "1mo"], "15m": ["15m", "1mo"], "30m": ["30m", "60d"], "60m": ["60m", "6mo"], D: ["1d", "2y"], W: ["1wk", "10y"], M: ["1mo", "max"] };

export const yahoo: PriceProvider = {
    async quote(symbol, range = "1mo") {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=${range}`;
        const r = await requestUrl({ url, throw: false });
        if (r.status !== 200) return null;
        const res = r.json?.chart?.result?.[0];
        const price = Number(res?.meta?.regularMarketPrice);
        if (!(price > 0)) return null;
        const closes = ((res?.indicators?.quote?.[0]?.close ?? []) as (number | null)[]).filter((x): x is number => typeof x === "number");
        const asOf = Number(res?.meta?.regularMarketTime) * 1000;
        return { price, time: Date.now(), closes, asOf: asOf > 0 ? asOf : Date.now(), source: "yahoo" };
    },
    async bars(symbol, range) {
        const [iv, span] = YQ[range];
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${iv}&range=${span}`;
        const r = await requestUrl({ url, throw: false });
        const B = r.status === 200 ? fromYahoo(r.json?.chart?.result?.[0], isMinutes(range)) : null;
        return range === "I" ? lastSession(B) : B;   // TODAY: the last session with bars (none for today just after the open)
    },
};

// every raw MIS row the background poll gets (prices/flow.ts keeps a trade tape from them for the stocks you follow)
export const MIS_ROWS: { fn: ((rows: Record<string, unknown>[]) => void) | null } = { fn: null };
// S7: the Taiwan exchange's own quote service (parseTwse in calc/quotes.ts)
// every Taiwan ticker in one request (TWSE turns away callers asking more than about 3 times in 5 s): symbol → quote
export const twseMany = async (symbols: string[]): Promise<Record<string, Quote>> => {
    const ms = symbols.map((s) => /^(\d{4,6}[A-Z]?)\.(TW|TWO)$/.exec(s)).filter((m): m is RegExpExecArray => !!m);
    if (!ms.length) return {};
    const ex = ms.map((m) => `${m[2] === "TWO" ? "otc" : "tse"}_${m[1].toLowerCase()}.tw`).join("|");
    const r = await requestUrl({ url: `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=${encodeURIComponent(ex)}&json=1&delay=0`, throw: false });
    if (r.status === 200) MIS_ROWS.fn?.(r.json?.msgArray ?? []);
    const by = r.status === 200 ? parseTwseAll(r.json) : {}, out: Record<string, Quote> = {};
    for (const m of ms) if (by[m[1]]) out[m[0]] = by[m[1]];
    return out;
};
export const twse: PriceProvider = {
    async quote(symbol) {
        const m = /^(\d{4,6}[A-Z]?)\.(TW|TWO)$/.exec(symbol);
        if (!m) return null;
        const url = `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=${m[2] === "TWO" ? "otc" : "tse"}_${m[1].toLowerCase()}.tw&json=1&delay=0`;
        const r = await requestUrl({ url, throw: false });
        return r.status === 200 ? parseTwse(r.json) : null;
    },
    // STOCK_DAY: one request per month (TWSE listings only): day bars, 4 months (a screen and the averages); the rest is Yahoo's
    async bars(symbol, range) { return range === "D" ? twseMonths(symbol, 4) : null; },
};
// the last `back` months and this one from TWSE STOCK_DAY (TWSE listings `.TW` only), joined; null when none came
const twseMonths = async (symbol: string, back: number): Promise<Bars | null> => {
    const m = /^(\d{4,6}[A-Z]?)\.TW$/.exec(symbol);
    if (!m) return null;
    const parts: Bars[] = [], now = new Date();
    for (let k = back; k >= 0; k--) {
        const d = new Date(now.getFullYear(), now.getMonth() - k, 1);
        const url = `https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date=${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}01&stockNo=${m[1]}`;
        const r = await requestUrl({ url, throw: false }).catch(() => null);
        const b = r && r.status === 200 ? fromTwseMonth(r.json) : null;
        if (b) parts.push(b);
        if (k) await new Promise((ok) => setTimeout(ok, 350));   // TWSE turns away fast callers
    }
    return parts.length ? joinBars(parts) : null;
};
// Yahoo's daily bars for Taiwan run a day or two behind its last price: the newest days come from TWSE's month report
// (it wins where both have a day); without TWSE the Yahoo bars stand alone
const yahooTw: PriceProvider = {
    quote: (symbol, range) => yahoo.quote(symbol, range),
    async bars(symbol, range) {
        const y = await yahoo.bars!(symbol, range);
        if (!y || range !== "D" || !/\.TW$/.test(symbol)) return y;   // only day bars mix with TWSE's days
        const last = y.d[y.d.length - 1] ?? "", now = new Date(), thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        const tail = await twseMonths(symbol, last.slice(0, 7) < thisMonth ? 1 : 0).catch(() => null);
        return tail ? { ...joinBars([tail, y]), ohlc: y.ohlc } : y;
    },
};

// Fugle MarketData for Taiwan tickers (real time, needs a key): quotes and TODAY's minute bars; null = no key, no bar yet or
// an error, and the next source answers. Its close before is asked once a day per stock (a quote also sets it).
const FUGLE = "https://api.fugle.tw/marketdata/v1.0/stock/intraday";
const fuglePc: Record<string, { day: string; pc: number }> = {};
export const fugleCode = (symbol: string) => /^(\d{4,6}[A-Z]?)\.TWO?$/.exec(symbol)?.[1] ?? null;
export const fugle = (key: () => string): PriceProvider => ({
    async quote(symbol) {
        const code = fugleCode(symbol), k = key();
        if (!code || !k) return null;
        const r = await requestUrl({ url: `${FUGLE}/quote/${code}`, headers: { "X-API-KEY": k }, throw: false });
        const q = r.status === 200 ? parseFugleQuote(r.json) : null;
        const pc = Number(r.status === 200 ? r.json?.previousClose : 0);
        if (pc > 0) fuglePc[code] = { day: new Date().toDateString(), pc };
        return q;
    },
    async bars(symbol, range) {
        const m = /^(\d{4,6}[A-Z]?)\.TWO?$/.exec(symbol), k = key();
        if (range !== "I" || !m || !k) return null;
        const headers = { "X-API-KEY": k }, day = new Date().toDateString();
        if (fuglePc[m[1]]?.day !== day) {
            const q = await requestUrl({ url: `${FUGLE}/quote/${m[1]}`, headers, throw: false }).catch(() => null);
            const pc = Number(q?.status === 200 ? q.json?.previousClose : 0);
            if (pc > 0) fuglePc[m[1]] = { day, pc };
        }
        const r = await requestUrl({ url: `${FUGLE}/candles/${m[1]}?timeframe=1`, headers, throw: false });
        return r.status === 200 ? fromFugle(r.json, fuglePc[m[1]]?.pc) : null;
    },
});

// S6: sources tried in order until one answers; for Taiwan tickers the setting picks which goes first, the other is the fallback
export const chain = (...ps: PriceProvider[]): PriceProvider => ({
    async quote(symbol, range) {
        for (const p of ps) { const q = await p.quote(symbol, range).catch(() => null); if (q) return q; }
        return null;
    },
    async bars(symbol, range) {
        for (const p of ps) { const b = p.bars ? await p.bars(symbol, range).catch(() => null) : null; if (b) return b; }
        return null;
    },
});
// TAIEX (^TWII) from TWSE (market mode, 2026-11-10; Yahoo's runs 20 minutes behind): the live index from MIS; TODAY from the
// 5-second file, read again at most every 2 minutes (it is 1.2 MB) and kept once the session is whole, the live quotes filling
// the minutes between as ticks; the other intervals from Yahoo
let FIVE: { day: string; at: number; done: boolean; B: Bars } | null = null;
const misIndex = async () => {
    const r = await requestUrl({ url: "https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=tse_t00.tw&json=1&delay=0", throw: false });
    return r.status === 200 ? parseMisIndex(r.json) : null;
};
export const taiex: PriceProvider = {
    async quote() { const q = await misIndex(); if (!q) return null; const { day: _day, ...x } = q; return x; },
    async bars(symbol, range) {
        if (range !== "I") return yahoo.bars!(symbol, range);
        const q = await misIndex();
        if (!q?.day) return yahoo.bars!(symbol, range);
        if (FIVE?.day === q.day && (FIVE.done || Date.now() - FIVE.at < 120 * 1000)) return FIVE.B;
        const r = await requestUrl({ url: `https://www.twse.com.tw/rwd/zh/TAIEX/MI_5MINS_INDEX?response=json&date=${q.day.replace(/-/g, "")}`, throw: false });
        const B = r.status === 200 ? fiveSecBars(r.json, q.day) : null;
        if (B) {
            if (!B.pc && q.prev) B.pc = Math.round(q.prev * 100);
            FIVE = { day: q.day, at: Date.now(), done: B.d[B.d.length - 1].slice(11) >= "13:29", B };
            return B;
        }
        return FIVE?.day === q.day ? FIVE.B : yahoo.bars!(symbol, range);
    },
};

// Taiwan tickers (owner, 2026-11-05): quotes Fugle (with a key) → TWSE → Yahoo (Yahoo's Taiwan quotes run about 20 minutes
// behind); bars Fugle (TODAY only) → Yahoo with TWSE's newest days → TWSE. Everything else: Yahoo.
export const pickSource = (fugleKey: () => string = () => ""): PriceProvider => {
    const f = fugle(fugleKey), tq = chain(f, twse, yahoo), tb = chain(f, yahooTw, twse);
    const tw = (symbol: string) => /\.TWO?$/.test(symbol);
    const ix = chain(taiex, yahoo), pick = (symbol: string) => (symbol === "^TWII" ? ix : tw(symbol) ? null : yahoo);
    return { quote: (symbol, range) => (pick(symbol) ?? tq).quote(symbol, range), bars: (symbol, range) => (pick(symbol) ?? tb).bars!(symbol, range) };
};

const TTL = 10 * 60 * 1000, TTL_MIN = 15 * 1000;   // quotes and day / week / month bars: 10 minutes; minute bars: 15 s (owner, 2026-11-05)
const KEY = "ledgerline-prices";

export class Prices {
    private q: Record<string, Quote> = {};
    private busy = new Set<string>();
    constructor(private load: () => unknown, private save: (v: unknown) => void, private onFresh: () => void, private provider: PriceProvider = yahoo, private taiwan = () => false) {
        try { this.q = (this.load() as Record<string, Quote>) ?? {}; } catch { this.q = {}; }
    }
    // a ticker as the provider wants it: 4–6 digit tickers are Taiwan listings with the Taiwan option on ("2330" → "2330.TW")
    symbol(ticker: string): string { const t = ticker.trim().toUpperCase(); return this.taiwan() && /^\d{4,6}[A-Z]?$/.test(t) ? `${t}.TW` : t; }
    get(ticker: string): Quote | null { return this.q[this.symbol(ticker)] ?? null; }
    price(ticker: string): number | null { return this.get(ticker)?.price ?? null; }
    // base-currency units per 1 unit of `cur` (fallback: the config's fx_fallback, then 1)
    fx(cur: string, base: string, fallback: Record<string, number> = {}): number {
        if (cur === base) return 1;
        return this.q[`${cur}${base}=X`]?.price ?? (Number(fallback[cur]) || 1);
    }
    fxSymbol(cur: string, base: string): string { return `${cur}${base}=X`; }
    // fetch what is missing or old, in the background; one redraw when anything changed
    refresh(symbols: string[], force = false): void {
        // a Taiwan quote saved without its reference price (before 2026-11-05) is old at once: today's change is measured from it
        const due = [...new Set(symbols)].filter((s) => s && !this.busy.has(s) && (force || !this.q[s] || Date.now() - this.q[s].time > TTL || (isTwSym(s) && !this.q[s].prev)));
        if (!due.length) return;
        due.forEach((s) => this.busy.add(s));
        void Promise.all(due.map((s) => this.provider.quote(s).then((x) => { if (x) this.q[s] = { ...x, closes: x.closes?.length ? x.closes : this.q[s]?.closes }; return !!x; }).catch(() => false).finally(() => this.busy.delete(s))))
            .then((ok) => { if (ok.some(Boolean)) { try { this.save(this.q); } catch { /* ignore */ } this.onFresh(); } });
    }
    // Background (owner, 2026-11-05), called every 5 s (main.ts): while their market trades, the tickers the Invest pages asked
    // for (holdings, watchlist), on any page. Taiwan: with a Fugle key every one streams its trades; the rest (no key, or
    // past the plan's subscription limit) one TWSE request for all every 5 s. Others: Yahoo, one request each every 15 s.
    // TODAY's minute bars every minute. Change lines and chart pages hear through onQuote / onSeries and change in place;
    // the other Invest pages redraw (onLive, at most every 5 s) so every total and percent follows.
    private tracked = new Set<string>();
    private bg = new Set<string>();   // Fugle codes the background streams
    private bgN = 0;
    track(symbols: string[]): void { symbols.forEach((s) => { if (s && !s.endsWith("=X")) this.tracked.add(s); }); }
    background(): void {
        if (document.hidden) return;
        const n = this.bgN++, now = new Date(), cal = this.calendar?.cal, due = [...this.tracked].filter((s) => marketOpen(s, now, cal));
        // the market calendar (holidays, typhoons, US early closes) for the markets you follow, checked once a minute
        if (n % 12 === 0) { const ts = [...this.tracked]; this.calendar?.tick(ts.some((s) => isTwSym(s)), ts.some((s) => !isTwSym(s))); }
        this.noTradeCheck(now);
        // the market opening (or closing) while the app is open: the Invest pages redraw once (the opening: a full board sweep)
        const open = due.length > 0;
        if (this.wasOpen === null || !this.tracked.size) this.wasOpen = open;
        else if (open !== this.wasOpen) { this.wasOpen = open; this.onLive?.(open); }
        const tw = due.filter((s) => fugleCode(s)), other = due.filter((s) => !fugleCode(s));
        const want = new Set(tw.map((s) => fugleCode(s)!));
        if (this.stream && this.fkey()) tw.forEach((s) => { const c = fugleCode(s)!; if (!this.bg.has(c)) { this.bg.add(c); this.codes.set(c, s); this.stream!.watch(c); } });
        for (const c of [...this.bg]) if (!want.has(c) || !this.fkey()) { this.bg.delete(c); if (!this.watchers.has(c)) this.stream?.unwatch(c); }
        const jobs: Promise<boolean>[] = [];
        const poll = tw.filter((s) => !(this.stream?.on(fugleCode(s)!) && this.q[s]?.prev));
        if (poll.length && !this.busy.has("bg|twse")) {
            this.busy.add("bg|twse");
            jobs.push(twseMany(poll).then((qs) => Object.entries(qs).map(([s, x]) => this.apply(s, x)).some(Boolean)).catch(() => false).finally(() => this.busy.delete("bg|twse")));
        }
        if (n % 3 === 0) other.forEach((s) => jobs.push(this.live(s)));
        if (n % 12 === 0) due.forEach((s) => this.refreshSeries(s, "I"));
        void Promise.all(jobs).then((m) => { if (m.some(Boolean)) this.moved(); });
    }
    // a price moved: the pages with totals and percents redraw (main.ts; chart pages change in place instead), at most every 5 s
    onLive?: (opening?: boolean) => void;
    private wasOpen: boolean | null = null;   // null: not known yet (the app opening mid-session is not the market opening)
    calendar?: MarketCalendar;
    // a Taiwan weekday with no trade by 09:10 (a typhoon day the work-stoppage page missed): from 09:10, when every Taiwan
    // quote fetched since then is from before 09:00, Taiwan is closed today; a trade today (a chart page still asks) opens it again
    private noTradeCheck(now: Date): void {
        const tw = [...this.tracked].filter((s) => isTwSym(s));
        if (!tw.length || !this.calendar) return;
        const c = marketClock(tw[0], now);
        if (!c.weekday || c.min < 550 || c.min > 815) return;
        const t910 = now.getTime() - (c.min - 550) * 60e3 - now.getSeconds() * 1e3, t900 = t910 - 10 * 60e3;
        const fresh = tw.map((s) => this.q[s]).filter((q): q is Quote => !!q && q.time >= t910 && !!q.asOf);
        if (!fresh.length) return;
        if (fresh.some((q) => q.asOf! >= t900)) this.calendar.noTrade(c.day, false);
        else if (fresh.length === tw.length) this.calendar.noTrade(c.day, true);
    }
    // which of the tracked tickers' markets trade now (TW, US); when none does: a market closed in its usual hours (holiday,
    // typhoon, early close), and the soonest next open among them
    // is this ticker's market trading now: the one rule every page uses (clock, holidays, typhoon days, early closes)
    isOpen(ticker: string, now = new Date()): boolean { return marketOpen(this.symbol(ticker), now, this.calendar?.cal); }
    liveState(): { open: ("TW" | "US")[]; closed: { mkt: "TW" | "US"; why: Why | "early" } | null; next: { mkt: "TW" | "US"; at: number } | null } {
        const now = new Date(), ts = [...this.tracked], cal = this.calendar?.cal, mkt = (s: string) => (isTwSym(s) ? "TW" as const : "US" as const);
        const open = (["TW", "US"] as const).filter((m) => ts.some((s) => mkt(s) === m && marketOpen(s, now, cal)));
        if (open.length) return { open, closed: null, next: null };
        let closed: { mkt: "TW" | "US"; why: Why | "early" } | null = null;
        for (const s of ts) { const why = closedInHours(s, now, cal); if (why) { closed = { mkt: mkt(s), why }; break; } }
        let next: { mkt: "TW" | "US"; at: number } | null = null;
        for (const m of new Set(ts.map(mkt))) {
            const at = nextOpen(ts.find((s) => mkt(s) === m)!, now, cal)?.getTime();
            if (at && (!next || at < next.at)) next = { mkt: m, at };
        }
        return { open, closed, next };
    }
    private movedT = 0;
    private lastLive = 0;
    private moved(): void {
        if (this.movedT) return;
        this.movedT = window.setTimeout(() => { this.movedT = 0; this.lastLive = Date.now(); this.onLive?.(); }, Math.max(0, 5000 - (Date.now() - this.lastLive)));
    }
    // the oldest market time among these tickers (what "prices as of" means for a page), null when none is known
    asOf(tickers: string[]): number | null {
        const ts = tickers.map((t) => this.get(t)?.asOf ?? this.get(t)?.time).filter((x): x is number => !!x);
        return ts.length ? Math.min(...ts) : null;
    }
    // chart bars per ticker and range: kept like quotes (memory + local storage), refreshed in the background when old
    private s: Record<string, Series> = {};
    private sLoaded = false;
    private sKey = (ticker: string, range: Range) => `${this.symbol(ticker)}|${range}`;
    series(ticker: string, range: Range): Series | null {
        if (!this.sLoaded) { this.sLoaded = true; try { this.s = (this.loadSeries?.() as Record<string, Series>) ?? {}; } catch { this.s = {}; } }
        return this.s[this.sKey(ticker, range)] ?? null;
    }
    // Live: one quote fetched now, whatever its age (a chart page asks every few seconds); pages on screen hear about it and
    // update in place (no page redraw); not stored (the 10-minute refresh stores quotes)
    private qsubs = new Set<(symbol: string) => boolean>();
    onQuote(fn: (symbol: string) => boolean): void { this.qsubs.add(fn); }
    // live quotes as 1-minute bars, memory only (fills what the fetched minute bars do not have yet)
    private t: Record<string, Bars> = {};
    ticks(ticker: string): Bars | null { return this.t[this.symbol(ticker)] ?? null; }
    // Fugle's trade stream for the chart page on screen (with a key): trades update the quote and its minute bars at once,
    // listeners hear about them at most every 0.3 s; a streaming code is not polled
    private stream: FugleStream | null = null;
    private codes = new Map<string, string>();   // Fugle code → our symbol
    private pend = new Set<string>();
    private fkey: () => string = () => "";
    useFugle(key: () => string): void { this.fkey = key; this.stream = new FugleStream(key, (code, price, ms, raw) => { this.trade(code, price, ms); const sym = this.codes.get(code); if (sym) this.onTrade?.(sym, raw); }); }
    // every streamed trade as Fugle sent it (the footprint's tape: prices/flow.ts)
    onTrade?: (symbol: string, raw: Record<string, unknown>) => void;
    hasFugle(): boolean { return !!this.fkey(); }
    // counted: a page redraw builds the new page (watch) before the old one lets go (unwatch), the stream stays up
    private watchers = new Map<string, number>();
    watch(ticker: string): void { const s = this.symbol(ticker), c = fugleCode(s); if (c && this.stream) { this.codes.set(c, s); this.watchers.set(c, (this.watchers.get(c) ?? 0) + 1); this.stream.watch(c); } }
    unwatch(ticker: string): void {
        const c = fugleCode(this.symbol(ticker));
        if (!c || !this.watchers.has(c)) return;
        const n = (this.watchers.get(c) ?? 1) - 1;
        if (n > 0) { this.watchers.set(c, n); return; }
        this.watchers.delete(c);
        if (!this.bg.has(c)) this.stream?.unwatch(c);   // the background still streams it while the market trades
    }
    stop(): void { this.stream?.stop(); }
    private trade(code: string, price: number, ms: number): void {
        const s = this.codes.get(code);
        if (!s) return;
        const was = this.q[s];
        if (was?.asOf && ms < was.asOf) return;   // older than what we have
        this.q[s] = { ...was, price, asOf: ms, time: Date.now(), source: "fugle" };
        this.t[s] = addTick(this.t[s], marketMinute(s, ms), Math.round(price * 100));
        if (this.pend.has(s)) return;
        this.pend.add(s);
        window.setTimeout(() => { this.pend.delete(s); for (const f of [...this.qsubs]) if (!f(s)) this.qsubs.delete(f); this.moved(); }, 300);
    }
    // true = the price moved
    async live(ticker: string): Promise<boolean> {
        const s = this.symbol(ticker), k = `live|${s}`, c = fugleCode(s);
        if (this.busy.has(k) || (c && this.stream?.on(c) && this.q[s]?.prev)) return false;   // streaming, and the reference price is known
        this.busy.add(k);
        try {
            const x = await this.provider.quote(s);
            return x ? this.apply(s, x) : false;
        } catch { return false; /* offline: the next tick tries again */ } finally { this.busy.delete(k); }
    }
    // a fresh quote kept (memory only: the 10-minute refresh stores quotes); listeners hear when anything changed; true = the price moved
    private apply(s: string, x: Quote): boolean {
        const was = this.q[s];
        this.q[s] = { ...x, closes: x.closes?.length ? x.closes : was?.closes };
        if (was && was.price === x.price && was.asOf === x.asOf) { if (was.vol !== undefined && x.vol === undefined) this.q[s].vol = was.vol; return false; }   // nothing new: nobody redraws
        // the shares traded since the last quote of the same day go into this minute's bar (TWSE MIS sends the day's total)
        const sameDay = !!was?.asOf && !!x.asOf && marketMinute(s, was.asOf).slice(0, 10) === marketMinute(s, x.asOf).slice(0, 10);
        const dv = x.vol !== undefined && was?.vol !== undefined && sameDay ? Math.max(0, x.vol - was.vol) : 0;
        this.t[s] = addTick(this.t[s], marketMinute(s, x.asOf ?? x.time), Math.round(x.price * 100), dv);
        for (const f of [...this.qsubs]) if (!f(s)) this.qsubs.delete(f);
        return !was || was.price !== x.price;
    }
    // charts on screen hear about their new bars and redraw themselves; a listener answering false is gone and dropped
    private subs = new Set<(key: string) => boolean>();
    onSeries(fn: (key: string) => boolean): void { this.subs.add(fn); }
    refreshSeries(ticker: string, range: Range, force = false): void {
        const k = this.sKey(ticker, range), have = this.series(ticker, range);
        if (this.busy.has(k) || (!force && have && Date.now() - have.time < (isMinutes(range) ? TTL_MIN : TTL)) || !this.provider.bars) return;
        this.busy.add(k);
        void this.provider.bars(this.symbol(ticker), range).then((b) => {
            if (!b) return;
            this.s[k] = { bars: b, time: Date.now(), source: b.ohlc ? "" : "line" };
            // only day / week / month bars are stored (minute bars go stale in a minute and would fill the storage)
            try { this.saveSeries?.(Object.fromEntries(Object.entries(this.s).filter(([key]) => !isMinutes(key.split("|")[1] as Range)))); } catch { /* full storage: kept in memory */ }
            for (const f of [...this.subs]) if (!f(k)) this.subs.delete(f);
            if (range === "D" && !have) this.onFresh();   // the first day bars: the page's "today" line needs them too
        }).catch(() => undefined).finally(() => this.busy.delete(k));
    }
    loadSeries?: () => unknown;
    saveSeries?: (v: unknown) => void;
    static KEY = KEY;
    static SERIES_KEY = "ledgerline-bars";
}
