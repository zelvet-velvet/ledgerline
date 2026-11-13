import type { Cal, Why } from "./calendar";
// Quotes as the sources send them (pure, tested). time = fetched, asOf = the market's own time, prev = the price today's
// change is measured from (the exchange's reference price, usually yesterday's close; Taiwan sources only)
// is this ticker's market trading now (weekdays, less the calendar's closed days: calc/calendar.ts): Taiwan 09:00–13:35 Taipei,
// the rest US 09:30–16:05 New York
const FMT = new Map<string, Intl.DateTimeFormat>();
// a Taiwan symbol: a listing (2330.TW, 6488.TWO) or TAIEX itself (^TWII: Taipei clock, Taipei session)
export const isTwSym = (symbol: string): boolean => /\.TWO?$/.test(symbol) || symbol === "^TWII";
const isTw = isTwSym;
// the market's own clock for this ticker: its date "YYYY-MM-DD", minutes after midnight, weekday or not
export const marketClock = (symbol: string, now: Date): { day: string; min: number; weekday: boolean } => {
    const tz = isTw(symbol) ? "Asia/Taipei" : "America/New_York";
    let f = FMT.get(tz);
    if (!f) { f = new Intl.DateTimeFormat("en-US", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }); FMT.set(tz, f); }
    const parts = f.formatToParts(now), get = (k: string) => parts.find((p) => p.type === k)?.value ?? "";
    const wd = get("weekday");
    return { day: `${get("year")}-${get("month")}-${get("day")}`, min: (Number(get("hour")) % 24) * 60 + Number(get("minute")), weekday: wd !== "Sat" && wd !== "Sun" };
};
// a moment as the market's own minute "YYYY-MM-DDTHH:MM" (bars are keyed by it): New York time for a US ticker, whatever
// this device's zone (2026-11-06: US live ticks were keyed in Taipei time, a day ahead, and broke TODAY)
export const marketMinute = (symbol: string, t: number): string => {
    const c = marketClock(symbol, new Date(t)), p = (n: number) => String(n).padStart(2, "0");
    return `${c.day}T${p(Math.floor(c.min / 60))}:${p(c.min % 60)}`;
};
// a wall time "YYYY-MM-DDTHH:MM" in zone `from` as the same moment's wall time in zone `to` (US bars are keyed by New York's
// clock; owner, 2026-11-10: show them in Taipei time by default). Two passes find the offset across a daylight saving change.
const WALL = new Map<string, Intl.DateTimeFormat>();
const wallOf = (ms: number, tz: string): string => {
    let f = WALL.get(tz);
    if (!f) { f = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }); WALL.set(tz, f); }
    const p: Record<string, string> = {};
    for (const x of f.formatToParts(new Date(ms))) p[x.type] = x.value;
    return `${p.year}-${p.month}-${p.day}T${p.hour === "24" ? "00" : p.hour}:${p.minute}`;
};
const asUtc = (d: string): number => Date.UTC(Number(d.slice(0, 4)), Number(d.slice(5, 7)) - 1, Number(d.slice(8, 10)), Number(d.slice(11, 13)) || 0, Number(d.slice(14, 16)) || 0);
export const shiftZone = (d: string, from: string, to: string): string => {
    if (from === to || d.length < 16) return d;
    const want = asUtc(d);
    let t = want;
    for (let k = 0; k < 2; k++) t += want - asUtc(wallOf(t, from));
    return wallOf(t, to) + d.slice(16);
};
export const deviceZone = (): string => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Taipei"; } catch { return "Asia/Taipei"; } };
// the market's clock time "HH:MM:SS" (the price's source line)
export const marketTime = (symbol: string, t: number): string => new Date(t).toLocaleTimeString("en-GB", { timeZone: isTw(symbol) ? "Asia/Taipei" : "America/New_York", hour12: false });
// the usual session window on a weekday: Taiwan 09:00–13:35 (the close auction included), US 09:30–16:05
const inWindow = (symbol: string, c: { min: number; weekday: boolean }): boolean => c.weekday && (isTw(symbol) ? c.min >= 540 && c.min <= 815 : c.min >= 570 && c.min <= 965);
// why the market does not trade today although it is a weekday (holiday, typhoon, no trade, early close), else null
export const closedWhy = (symbol: string, now: Date, cal?: Cal): Why | "early" | null => {
    if (!cal) return null;
    const c = marketClock(symbol, now);
    if (!c.weekday) return null;
    const w = (isTw(symbol) ? cal.tw : cal.us)[c.day];
    if (w) return w;
    const e = isTw(symbol) ? undefined : cal.usEarly[c.day];
    return e !== undefined && c.min > e + 5 ? "early" : null;
};
export const marketOpen = (symbol: string, now: Date, cal?: Cal): boolean => inWindow(symbol, marketClock(symbol, now)) && !closedWhy(symbol, now, cal);
// is now within the usual hours but the calendar says closed (a holiday, typhoon, early close)
export const closedInHours = (symbol: string, now: Date, cal?: Cal): Why | "early" | null => (inWindow(symbol, marketClock(symbol, now)) ? closedWhy(symbol, now, cal) : null);
// when this ticker's market next opens: both open on the half hour and Taipei / New York are whole hours from UTC, so the
// first open half-hour mark after now is the open. null if none within 14 days
export const nextOpen = (symbol: string, now: Date, cal?: Cal): Date | null => {
    const step = 30 * 60 * 1000;
    for (let t = Math.ceil((now.getTime() + 1) / step) * step, end = now.getTime() + 14 * 864e5; t <= end; t += step) {
        if (marketOpen(symbol, new Date(t), cal)) return new Date(t);
    }
    return null;
};

export interface Quote { price: number; time: number; closes?: number[]; asOf?: number; source?: string; prev?: number; vol?: number }   // vol: the day's shares so far (TWSE MIS)

// The Taiwan exchange's own quote service (mis.twse.com.tw). Its last trade `z` is "-" in
// most 5-second snapshots, also mid-session (checked 2026-11-05: 0050 traded all morning, z "-"): then, from 09:00, the middle
// of the best bid and ask (b / a, "98.05_98.00_…"); before the open, yesterday's close `y` (the pre-open book is a trial).
// many tickers in one answer (`ex_ch=tse_0050.tw|tse_2330.tw`): code → quote
export const parseTwseAll = (json: unknown): Record<string, Quote> => {
    const out: Record<string, Quote> = {};
    for (const a of (json as { msgArray?: Record<string, string>[] })?.msgArray ?? []) {
        const q = parseTwse({ msgArray: [a] });
        if (q && a.c) out[a.c] = q;
    }
    return out;
};
export const parseTwse = (json: unknown): Quote | null => {
    const a = (json as { msgArray?: Record<string, string>[] })?.msgArray?.[0];
    if (!a) return null;
    const best = (x?: string) => Number(String(x ?? "").split("_")[0]);
    const last = Number(a.z), prev = Number(a.y), bid = best(a.b), ask = best(a.a);
    const book = bid > 0 && ask > 0 ? Math.round(((bid + ask) / 2) * 100) / 100 : bid > 0 ? bid : ask > 0 ? ask : 0;
    const price = last > 0 ? last : String(a.t ?? "") >= "09:00:00" && book > 0 ? book : prev;
    if (!(price > 0)) return null;
    const at = Number(a.tlong);
    const lots = Number(a.v);   // the day's lots so far (1 lot = 1,000 shares): live minute volume (prices/index.ts apply)
    return { price, time: Date.now(), asOf: at > 0 ? at : Date.now(), source: "twse", ...(prev > 0 ? { prev } : {}), ...(lots >= 0 && String(a.v ?? "") !== "" && !isNaN(lots) ? { vol: lots * 1000 } : {}) };
};
// Fugle's intraday quote: the last real trade (closePrice; lastPrice also counts trial matching), else before the first trade
// the reference price; prev = the reference price (yesterday's close, ex-dividend adjusted); times in microseconds
export const parseFugleQuote = (json: unknown): Quote | null => {
    const j = json as { referencePrice?: number; previousClose?: number; closePrice?: number; closeTime?: number; lastUpdated?: number; lastTrade?: { price?: number; time?: number } };
    if (!j) return null;
    const prev = Number(j.referencePrice) || Number(j.previousClose) || 0;
    const last = Number(j.lastTrade?.price) || Number(j.closePrice) || 0, price = last > 0 ? last : prev;
    if (!(price > 0)) return null;
    const us = Number(j.lastTrade?.time) || Number(j.closeTime) || Number(j.lastUpdated) || 0;
    return { price, time: Date.now(), asOf: us > 0 ? Math.round(us / 1000) : Date.now(), source: "fugle", ...(prev > 0 ? { prev } : {}) };
};
