import { requestUrl } from "obsidian";
import { fugleTrade, FTrade, misStep, MisSnap, parseBfiamu, parseMi5, parseMisSnap } from "../calc/flow";
import { fugleCode, MIS_ROWS, Prices } from "./index";

// Order flow (market mode step 2, 2026-11-10): the trade tape behind the chart page's FOOTPRINT and VOLUME HEAT, the 5-level
// book behind its pressure strip, and the market map's sectors and whole-market orders.
// Tape per Taiwan stock, for today: with a Fugle key, intraday/trades (500 a call) fills the day once, then the stream's trades
// (they carry the bid and ask) keep it live; without one, TWSE MIS every 5 s: the new lots since the last call at the last
// price, sided by the book before (coarse, and only from when the page opened). Fetching only while a page asks for it.
const FUGLE = "https://api.fugle.tw/marketdata/v1.0/stock/intraday";
const MIS = "https://mis.twse.com.tw/stock/api/getStockInfo.jsp";
const taipeiDay = (ms = Date.now()) => new Date(ms + 8 * 3600e3).toISOString().slice(0, 10);

export interface Tape { day: string; trades: FTrade[]; src: "fugle" | "mis"; since: number; snap: MisSnap | null; press: { t: number; v: number }[]; filled: boolean; cut?: number }
// TWSE's leaf sector indices (MIS tse_tNN; t07 and t13 are sums of others and left out), with BFIAMU's names
export const SECTORS: [string, string][] = [
    ["t01", "水泥"], ["t02", "食品"], ["t03", "塑膠"], ["t04", "紡織纖維"], ["t05", "電機機械"], ["t06", "電器電纜"], ["t08", "玻璃陶瓷"],
    ["t09", "造紙"], ["t10", "鋼鐵"], ["t11", "橡膠"], ["t12", "汽車"], ["t14", "建材營造"], ["t15", "航運"], ["t16", "觀光餐旅"],
    ["t17", "金融保險"], ["t18", "貿易百貨"], ["t20", "其他"], ["t21", "化學"], ["t22", "生技醫療"], ["t23", "油電燃氣"], ["t24", "半導體"],
    ["t25", "電腦週邊"], ["t26", "光電"], ["t27", "通信網路"], ["t28", "電子零組件"], ["t29", "電子通路"], ["t30", "資訊服務"], ["t31", "其他電子"],
];
const BFI: Record<string, string> = { 航運: "航運業", 電腦週邊: "電腦及週邊設備" };   // BFIAMU names where they differ
export interface Sector { code: string; name: string; w: number; pct: number | null; at: number }

export class Flow {
    private tapes = new Map<string, Tape>();
    private want = new Map<string, number>();   // symbol → pages asking
    private subs = new Set<(symbol: string) => boolean>();
    private busy = new Set<string>();
    constructor(private prices: Prices, private key: () => string, private store?: { load(k: string): unknown; save(k: string, v: unknown): void }) {
        MIS_ROWS.fn = (rows) => this.bgRows(rows);
        prices.onTrade = (sym, raw) => {
            const tp = this.tapes.get(sym), tr = fugleTrade(raw as Parameters<typeof fugleTrade>[0]);
            if (!tp || tp.src !== "fugle" || !tr || taipeiDay(tr.t) !== tp.day || tr.t < (tp.cut ?? 0)) return;
            const last = tp.trades[tp.trades.length - 1];
            if (last && tr.t < last.t) return;
            tp.trades.push(tr);
            this.told(sym);
        };
    }
    // the background's 5-second MIS rows (prices/index.ts, every Taiwan holding and watched ticker while the market trades):
    // each stock keeps its tape from the moment the app opened, not only from when its chart page opened
    private bgRows(rows: Record<string, unknown>[]): void {
        for (const a of rows) {
            const c = String(a.c ?? ""), ex = String(a.ex ?? "");
            if (!/^\d{4,6}[A-Z]?$/.test(c)) continue;
            const sym = `${c}.${ex === "otc" ? "TWO" : "TW"}`;
            this.ingest(sym, a, this.ensure(sym));
        }
    }
    private ensure(sym: string): Tape {
        const day = taipeiDay();
        let tp = this.tapes.get(sym);
        if (!tp || tp.day !== day) { tp = { day, trades: [], src: this.key() ? "fugle" : "mis", since: Date.now(), snap: null, press: [], filled: false }; this.tapes.set(sym, tp); }
        return tp;
    }
    // one MIS row: a newer snapshot adds the lots traded since the last one (MIS tapes) and a book pressure point
    private ingest(sym: string, a: Record<string, unknown>, tp: Tape): void {
        const snap = parseMisSnap(a);
        if (!snap || (tp.snap && snap.at <= tp.snap.at)) return;
        if (tp.src === "mis") { const tr = misStep(tp.snap, snap); if (tr && taipeiDay(tr.t) === tp.day) tp.trades.push(tr); }
        tp.snap = snap;
        const bq = snap.bq.reduce((x, y) => x + y, 0), aq = snap.aq.reduce((x, y) => x + y, 0);
        if (bq + aq > 0) { tp.press.push({ t: snap.at, v: (bq - aq) / (bq + aq) }); if (tp.press.length > 3300) tp.press.shift(); }
        this.told(sym);
    }
    tape(symbol: string): Tape | null { return this.tapes.get(symbol) ?? null; }

    // a listed stock's sector (TWSE OpenAPI t187ap03_L: 產業別 = the sector index's number, 2330 → 24 半導體), fetched once a
    // week and kept on the device; OTC stocks and ETFs have none
    private ind: { at: number; by: Record<string, string> } | null = null;
    sectorOf(symbol: string): { code: string; name: string } | null {
        if (!this.ind) { try { this.ind = (this.store?.load("ledgerline-sectors") as typeof this.ind) ?? null; } catch { this.ind = null; } }
        if ((!this.ind || Date.now() - this.ind.at > 7 * 86400e3) && !this.busy.has("ind")) void this.loadInd();
        const m = /^(\d{4,6}[A-Z]?)\.TW$/.exec(symbol), n = m ? this.ind?.by[m[1]] : undefined, code = n ? `t${n.padStart(2, "0")}` : "";
        const name = SECTORS.find(([c]) => c === code)?.[1];
        return name ? { code, name } : null;
    }
    private async loadInd(): Promise<void> {
        this.busy.add("ind");
        try {
            const r = await requestUrl({ url: "https://openapi.twse.com.tw/v1/opendata/t187ap03_L", throw: false });
            const rows = r.status === 200 ? (r.json as { 公司代號?: string; 產業別?: string }[]) : null;
            if (!Array.isArray(rows) || !rows.length) return;
            const by: Record<string, string> = {};
            for (const x of rows) if (x.公司代號 && x.產業別) by[String(x.公司代號).trim()] = String(x.產業別).trim();
            this.ind = { at: Date.now(), by };
            try { this.store?.save("ledgerline-sectors", this.ind); } catch { /* memory only */ }
            this.idxTold();
        } catch { /* next time */ } finally { this.busy.delete("ind"); }
    }
    // index quotes (a sector and TAIEX) for the chart pages that show them, every 5 s while one is on screen
    idx = new Map<string, number>();   // code (t24, t00) → today's %
    private idxWant = new Map<string, number>();
    private idxSubs = new Set<() => boolean>();
    follow(codes: string[], fn: () => boolean): () => void {
        codes.forEach((c) => this.idxWant.set(c, (this.idxWant.get(c) ?? 0) + 1));
        this.idxSubs.add(fn);
        if (!this.timer) { this.timer = window.setInterval(() => this.tick(), 5000); this.tick(); }
        return () => {
            codes.forEach((c) => { const n = (this.idxWant.get(c) ?? 1) - 1; if (n > 0) this.idxWant.set(c, n); else this.idxWant.delete(c); });
            this.idxSubs.delete(fn);
            if (!this.want.size && !this.mapOn && !this.idxWant.size) this.stopTimer();
        };
    }
    private idxTold(): void { for (const f of [...this.idxSubs]) if (!f()) this.idxSubs.delete(f); }
    // charts on screen hear about new trades or a new book (at most every 0.3 s); false = gone
    on(fn: (symbol: string) => boolean): void { this.subs.add(fn); }
    private pend = new Set<string>();
    private told(sym: string): void {
        if (this.pend.has(sym)) return;
        this.pend.add(sym);
        window.setTimeout(() => { this.pend.delete(sym); for (const f of [...this.subs]) if (!f(sym)) this.subs.delete(f); }, 300);
    }
    watch(symbol: string): void {
        if (!fugleCode(symbol)) return;
        this.want.set(symbol, (this.want.get(symbol) ?? 0) + 1);
        const tp = this.ensure(symbol);
        if (this.key() && tp.src === "mis" && !tp.trades.length) tp.src = "fugle";   // a key added since
        if (tp.src === "fugle" && !tp.filled) void this.fill(symbol, tp);
        if (!this.timer) { this.timer = window.setInterval(() => this.tick(), 5000); this.tick(); }
    }
    unwatch(symbol: string): void {
        const n = (this.want.get(symbol) ?? 1) - 1;
        if (n > 0) this.want.set(symbol, n); else this.want.delete(symbol);
        if (!this.want.has(symbol) && this.streamed.delete(symbol)) this.prices.unwatch(symbol);
        if (!this.want.size && !this.mapOn && !this.idxWant.size) this.stopTimer();
    }
    stop(): void { this.want.clear(); this.mapOn = 0; this.stopTimer(); MIS_ROWS.fn = null; }
    private timer = 0;
    private stopTimer(): void { window.clearInterval(this.timer); this.timer = 0; }
    // the whole day from Fugle, once per day per stock: the stream starts at once (trades from now on), intraday/trades pages
    // back from now (500 a call, newest first; about one call a second, the free plan allows 60 a minute) and each page goes in
    // front as it comes, so the heat fills backwards to 09:00
    private async fill(sym: string, tp: Tape): Promise<void> {
        const code = fugleCode(sym), k = this.key();
        if (!code || !k || this.busy.has(`fill|${sym}`)) return;
        this.busy.add(`fill|${sym}`);
        tp.cut = Date.now();
        if (!this.streamed.has(sym)) { this.streamed.add(sym); this.prices.watch(sym); }
        try {
            for (let off = 0; off < 50000; off += 500) {
                const r = await requestUrl({ url: `${FUGLE}/trades/${code}?limit=500&offset=${off}`, headers: { "X-API-KEY": k }, throw: false });
                const rows = r.status === 200 ? (r.json?.data as unknown[]) : null;
                if (!Array.isArray(rows)) { if (!off) tp.src = "mis"; break; }
                const page = rows.map((x) => fugleTrade(x as Parameters<typeof fugleTrade>[0])).filter((x): x is FTrade => !!x && x.t < tp.cut! && taipeiDay(x.t) === tp.day);
                const first = tp.trades[0]?.t ?? Infinity;
                tp.trades = [...page.filter((x) => x.t <= first).sort((a, b) => a.t - b.t), ...tp.trades];
                this.told(sym);
                if (rows.length < 500 || !this.want.has(sym)) break;
                await new Promise((ok) => setTimeout(ok, 1100));
            }
            tp.filled = tp.src === "fugle";
        } catch { if (!tp.trades.length) tp.src = "mis"; } finally { this.busy.delete(`fill|${sym}`); }
    }
    private streamed = new Set<string>();
    // every 5 s while asked: one MIS call for the watched stocks (book, pressure; without Fugle their tape too) and, with the
    // map on screen, the sectors; MI_5MINS every 5 minutes
    private n = 0;
    private tick(): void {
        if (document.hidden) return;
        const fresh = (s: string) => { const at = this.tapes.get(s)?.snap?.at; return !!at && Date.now() - at < 6000; };
        const syms = [...this.want.keys()].filter((s) => (this.prices.isOpen(s) || !this.tapes.get(s)?.snap) && !fresh(s));
        const ex = syms.map((s) => { const m = /^(\d{4,6}[A-Z]?)\.(TW|TWO)$/.exec(s)!; return `${m[2] === "TWO" ? "otc" : "tse"}_${m[1].toLowerCase()}.tw`; });
        const mapSec = this.mapOn && (this.n % 2 === 0 || !this.sectors.length) ? SECTORS.map(([c]) => c) : [];
        const sec = [...new Set([...mapSec, ...this.idxWant.keys()])].map((c) => `tse_${c}.tw`);
        if (this.mapOn && this.n % 60 === 0) void this.loadMi5();
        if (this.mapOn && !this.wDay) void this.loadWeights();
        this.n++;
        if ((!ex.length && !sec.length) || this.busy.has("mis")) return;
        this.busy.add("mis");
        void requestUrl({ url: `${MIS}?ex_ch=${encodeURIComponent([...ex, ...sec].join("|"))}&json=1&delay=0&_=${Date.now()}`, throw: false }).then((r) => {
            const arr = (r.status === 200 ? r.json?.msgArray : null) as Record<string, unknown>[] | null;
            if (!arr) return;
            for (const a of arr) {
                const c = String(a.c ?? "");
                if (/^t\d\d$/.test(c)) {
                    const z = Number(a.z), y = Number(a.y);
                    if (z > 0 && y > 0) this.idx.set(c, ((z - y) / y) * 100);
                    if (c !== "t00") this.sector(c, a);
                    continue;
                }
                const sym = syms.find((s) => fugleCode(s) === c), tp = sym ? this.tapes.get(sym) : null;
                if (sym && tp) this.ingest(sym, a, tp);
            }
            if (mapSec.length) this.mapTold();
            if (this.idxWant.size) this.idxTold();
        }).catch(() => undefined).finally(() => this.busy.delete("mis"));
    }

    // the market map: sectors live from MIS (every 10 s), sized by the last day's trading value (BFIAMU)
    sectors: Sector[] = [];
    mi5: ReturnType<typeof parseMi5> = null;
    private mapOn = 0;
    private mapSubs = new Set<() => boolean>();
    private weights: Record<string, number> = {};
    private wDay = "";
    map(on: boolean, fn?: () => boolean): void {
        this.mapOn = Math.max(0, this.mapOn + (on ? 1 : -1));
        if (fn) this.mapSubs.add(fn);
        if (on && !this.timer) { this.timer = window.setInterval(() => this.tick(), 5000); this.tick(); }
        if (!this.mapOn && !this.want.size && !this.idxWant.size) this.stopTimer();
    }
    private mapTold(): void { for (const f of [...this.mapSubs]) if (!f()) this.mapSubs.delete(f); }
    private sector(code: string, a: Record<string, unknown>): void {
        const z = Number(a.z), y = Number(a.y), name = SECTORS.find(([c]) => c === code)?.[1] ?? code;
        const pct = z > 0 && y > 0 ? ((z - y) / y) * 100 : null;
        const w = this.weights[name] ?? 1, at = Number(a.tlong) || Date.now();
        const i = this.sectors.findIndex((s) => s.code === code);
        if (i < 0) this.sectors.push({ code, name, w, pct, at }); else this.sectors[i] = { code, name, w, pct, at };
    }
    private async loadWeights(): Promise<void> {
        if (this.busy.has("bfi")) return;
        this.busy.add("bfi");
        try {
            const r = await requestUrl({ url: "https://www.twse.com.tw/rwd/zh/afterTrading/BFIAMU?response=json", throw: false });
            const v = r.status === 200 ? parseBfiamu(r.json) : {};
            if (!Object.keys(v).length) return;
            for (const [, name] of SECTORS) this.weights[name] = v[`${BFI[name] ?? name}類指數`] ?? 1;
            this.sectors.forEach((s) => { s.w = this.weights[s.name] ?? 1; });
            this.wDay = String(r.json?.date ?? taipeiDay());
            this.mapTold();
        } catch { /* the next tick tries again */ } finally { this.busy.delete("bfi"); }
    }
    weightsDay(): string { return this.wDay; }
    // the whole market's orders every 5 s (TWSE fills the file after the close; during the session it is the last day's)
    private async loadMi5(): Promise<void> {
        if (this.busy.has("mi5")) return;
        this.busy.add("mi5");
        try {
            const r = await requestUrl({ url: "https://www.twse.com.tw/rwd/zh/afterTrading/MI_5MINS?response=json", throw: false });
            const m = r.status === 200 ? parseMi5(r.json) : null;
            if (m) { this.mi5 = m; this.mapTold(); }
        } catch { /* later */ } finally { this.busy.delete("mi5"); }
    }
}
