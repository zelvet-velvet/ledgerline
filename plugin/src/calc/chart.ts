import { dateStr } from "../format";
import type { FM } from "../data/store";

// Holding chart maths (pure). Prices are integer hundredths from the boundary on (as trades); dates are the exchange's own day.
// the chart's interval (owner, 2026-11-04): I = intraday (today's session, a 1-minute line), 1–60 minute candles, day, week, month
export type Range = "I" | "1m" | "5m" | "15m" | "30m" | "60m" | "D" | "W" | "M";
// the strip's order (owner, 2026-11-06): longest to shortest, TODAY last (right, under the thumb)
export const RANGES: Range[] = ["M", "W", "D", "60m", "30m", "15m", "5m", "1m", "I"];
export const isMinutes = (r: Range): boolean => r !== "D" && r !== "W" && r !== "M";
// d: the exchange's day "YYYY-MM-DD", or its time "YYYY-MM-DDTHH:MM" for minute bars; pc: the close before the first bar (intraday)
export interface Bars { d: string[]; o: number[]; h: number[]; l: number[]; c: number[]; v: number[]; ohlc: boolean; pc?: number }   // ohlc false = closes only
export const emptyBars = (): Bars => ({ d: [], o: [], h: [], l: [], c: [], v: [], ohlc: true });
const toP = (x: unknown): number => Math.round(Number(x) * 100);

// a time (s) as the exchange's own "YYYY-MM-DDTHH:MM" in its time zone (each bar its own offset: a range across a daylight
// saving change keeps its sessions at 09:30, owner 2026-11-10); no zone: Yahoo's one gmtoffset for the whole range
const TZF = new Map<string, Intl.DateTimeFormat>();
const zoned = (s: number, tz: string | undefined, off: number): string => {
    if (tz) {
        try {
            let f = TZF.get(tz);
            if (!f) { f = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }); TZF.set(tz, f); }
            const p: Record<string, string> = {};
            for (const x of f.formatToParts(new Date(s * 1000))) p[x.type] = x.value;
            return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
        } catch { /* an unknown zone: the offset below */ }
    }
    return new Date((s + off) * 1000).toISOString().slice(0, 16);
};
// Yahoo chart API result (`chart.result[0]`): timestamp + indicators.quote[0]; bars with a missing value are left out
export const fromYahoo = (res: unknown, minutes = false): Bars | null => {
    const r = res as { timestamp?: number[]; meta?: { gmtoffset?: number; exchangeTimezoneName?: string; chartPreviousClose?: number }; indicators?: { quote?: { open?: (number | null)[]; high?: (number | null)[]; low?: (number | null)[]; close?: (number | null)[]; volume?: (number | null)[] }[] } };
    const ts = r?.timestamp, q = r?.indicators?.quote?.[0];
    if (!ts?.length || !q) return null;
    const off = Number(r.meta?.gmtoffset) || 0, tz = r.meta?.exchangeTimezoneName, B = emptyBars();
    ts.forEach((s, i) => {
        const o = q.open?.[i], h = q.high?.[i], l = q.low?.[i], c = q.close?.[i];
        if ([o, h, l, c].some((x) => typeof x !== "number" || !(x > 0))) return;
        const d = zoned(s, tz, off).slice(0, minutes ? 16 : 10);
        if (B.d[B.d.length - 1] === d) B.d.pop(), B.o.pop(), B.h.pop(), B.l.pop(), B.c.pop(), B.v.pop();   // a live bar for today replaces the last
        B.d.push(d); B.o.push(toP(o)); B.h.push(toP(h)); B.l.push(toP(l)); B.c.push(toP(c)); B.v.push(Math.round(Number(q.volume?.[i]) || 0));
    });
    if (!B.d.length && q.close?.some((x) => typeof x === "number" && x > 0)) {   // closes only: a line chart
        ts.forEach((t, i) => { const c = q.close?.[i]; if (typeof c !== "number" || !(c > 0)) return; const p = toP(c); B.d.push(zoned(t, tz, off).slice(0, 10)); B.o.push(p); B.h.push(p); B.l.push(p); B.c.push(p); B.v.push(0); });
        B.ohlc = false;
    }
    const pc = Number(r.meta?.chartPreviousClose);
    if (minutes && pc > 0) B.pc = toP(pc);
    return B.d.length ? B : null;
};

// TODAY from a few days of minute bars: the last session that has bars (right after the open Yahoo has none for today yet,
// so the previous session shows until today's first bar), pc = the last close of the day before it, else Yahoo's
export const lastSession = (B: Bars | null): Bars | null => {
    if (!B?.d.length) return null;
    const n = B.d.length, day = B.d[n - 1].slice(0, 10);
    let k = n;
    while (k > 0 && B.d[k - 1].slice(0, 10) === day) k--;
    const S: Bars = { d: B.d.slice(k), o: B.o.slice(k), h: B.h.slice(k), l: B.l.slice(k), c: B.c.slice(k), v: B.v.slice(k), ohlc: B.ohlc };
    const pc = k > 0 ? B.c[k - 1] : B.pc;
    if (pc) S.pc = pc;
    return S;
};

// Fugle MarketData intraday candles (`data: [{ date: "2026-11-05T09:00:00.000+08:00", open, high, low, close, volume }]`):
// the exchange's own minute from the date string, pc = the close before (Fugle's previousClose); null when no bar yet
export const fromFugle = (json: unknown, pc?: number): Bars | null => {
    const rows = (json as { data?: { date?: string; open?: number; high?: number; low?: number; close?: number; volume?: number }[] })?.data;
    if (!Array.isArray(rows)) return null;
    const B = emptyBars();
    for (const r of [...rows].sort((a, b) => String(a.date).localeCompare(String(b.date)))) {
        const d = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.exec(String(r.date ?? ""))?.[0];
        const o = Number(r.open), h = Number(r.high), l = Number(r.low), c = Number(r.close);
        if (!d || ![o, h, l, c].every((x) => x > 0) || B.d[B.d.length - 1] === d) continue;
        B.d.push(d); B.o.push(toP(o)); B.h.push(toP(h)); B.l.push(toP(l)); B.c.push(toP(c)); B.v.push(Math.round(Number(r.volume) || 0));
    }
    if (pc && pc > 0) B.pc = toP(pc);
    return B.d.length ? B : null;
};

// TWSE STOCK_DAY (one month): rows [ROC date "115/11/03", shares, value, open, high, low, close, change, trades]
export const fromTwseMonth = (json: unknown): Bars | null => {
    const rows = (json as { data?: string[][] })?.data;
    if (!Array.isArray(rows) || !rows.length) return null;
    const n = (s: string) => Number(String(s).replace(/,/g, "")), B = emptyBars();
    for (const r of rows) {
        const m = /^(\d{2,3})\/(\d{2})\/(\d{2})$/.exec(String(r[0]).trim());
        const o = n(r[3]), h = n(r[4]), l = n(r[5]), c = n(r[6]);
        if (!m || ![o, h, l, c].every((x) => x > 0)) continue;
        B.d.push(`${Number(m[1]) + 1911}-${m[2]}-${m[3]}`); B.o.push(toP(o)); B.h.push(toP(h)); B.l.push(toP(l)); B.c.push(toP(c)); B.v.push(Math.round(n(r[1]) || 0));
    }
    return B.d.length ? B : null;
};
// months joined in date order, a day only once
export const joinBars = (parts: Bars[]): Bars => {
    const B = emptyBars(), seen = new Set<string>();
    const all = parts.flatMap((p) => p.d.map((d, i) => ({ d, i, p }))).sort((a, b) => a.d.localeCompare(b.d));
    for (const { d, i, p } of all) { if (seen.has(d)) continue; seen.add(d); B.d.push(d); B.o.push(p.o[i]); B.h.push(p.h[i]); B.l.push(p.l[i]); B.c.push(p.c[i]); B.v.push(p.v[i]); }
    B.ohlc = parts.every((p) => p.ohlc);
    return B;
};
// how many bars one screen shows (a drag pans back through the rest); intraday: every bar of the last session
export const WINDOW: Record<Range, number> = { I: 0, "1m": 120, "5m": 96, "15m": 80, "30m": 64, "60m": 60, D: 66, W: 78, M: 60 };
export const windowOf = (B: Bars, r: Range): number => {
    const n = B.d.length;
    if (r !== "I") return Math.min(n, WINDOW[r]);
    const day = B.d[n - 1]?.slice(0, 10) ?? "";
    let k = n;
    while (k > 0 && B.d[k - 1].slice(0, 10) === day) k--;
    return n - k;
};

// pinch zoom: `want` bars on screen (at least `min`, at most all), the bar under the fingers (fractional index `at` in the
// window of `win` bars starting at bar k) stays where it is; off = bars hidden off the right edge
export const zoomAt = (len: number, k: number, win: number, at: number, want: number, min = 12): { win: number; off: number } => {
    const w = Math.round(Math.max(Math.min(min, len), Math.min(len, want)));
    const frac = (at + 0.5) / Math.max(1, win), k2 = Math.round(k + at + 0.5 - frac * w);
    return { win: w, off: Math.max(0, Math.min(len - w, len - k2 - w)) };
};

// the highest high and the lowest low of bars [from, to) (their indexes), for the chart's two price marks
export const extremes = (B: Bars, from: number, to: number): { hi: number; lo: number } => {
    let hi = from, lo = from;
    for (let i = from; i < to; i++) { if (B.h[i] > B.h[hi]) hi = i; if (B.l[i] < B.l[lo]) lo = i; }
    return { hi, lo };
};

// moving average of the closes (null until n bars exist), in hundredths
export const movingAverage = (c: number[], n: number): (number | null)[] => {
    let sum = 0;
    return c.map((x, i) => { sum += x; if (i >= n) sum -= c[i - n]; return i >= n - 1 ? sum / n : null; });
};

// Bollinger bands over the closes: middle = the n-bar average, upper / lower = middle ± k standard deviations (population, as
// TradingView), σ itself kept for the legend; null until n bars exist. Hundredths, not rounded (drawn, never booked).
export interface Bands { mb: (number | null)[]; ub: (number | null)[]; lb: (number | null)[]; sd: (number | null)[] }
export const bollinger = (c: number[], n = 20, k = 2): Bands => {
    const mb = movingAverage(c, n), out: Bands = { mb, ub: [], lb: [], sd: [] };
    c.forEach((_, i) => {
        const m = mb[i];
        if (m === null) { out.ub.push(null); out.lb.push(null); out.sd.push(null); return; }
        let v = 0;
        for (let j = i - n + 1; j <= i; j++) v += (c[j] - m) ** 2;
        const sd = Math.sqrt(v / n);
        out.sd.push(sd); out.ub.push(m + k * sd); out.lb.push(m - k * sd);
    });
    return out;
};

// 4–5 round price ticks covering [lo, hi] (hundredths): steps of 1, 2, 2.5 or 5 × 10^k
export const niceTicks = (lo: number, hi: number, want = 5): number[] => {
    if (!(hi > lo)) { const p = Math.round(lo); return [p]; }
    const raw = (hi - lo) / want, mag = 10 ** Math.floor(Math.log10(raw));
    const count = (s: number) => Math.floor(hi / s + 1e-9) - Math.ceil(lo / s - 1e-9) + 1;
    const step = [1, 2, 2.5, 5, 10, 20].map((f) => f * mag).find((s) => count(s) <= want) ?? 20 * mag;   // the finest round step with ≤ want ticks
    const out: number[] = [];
    for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(Math.round(v));
    return out;
};

// time ticks: I / 1m / 5m = each new hour ("10:00", a new day says "Nov 4"), 15m–60m = each new day, D = each new month ("SEP"),
// W = each new quarter ("APR", January says the year), M = each new year
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export interface XTick { i: number; label: string }
export const xTicks = (d: string[], r: Range): XTick[] => {
    const out: XTick[] = [];
    const day = (s: string) => `${MON[Number(s.slice(5, 7)) - 1]} ${Number(s.slice(8, 10))}`;
    d.forEach((s, i) => {
        if (i === 0) return;   // the first bar starts the window: no tick at the very edge
        const p = d[i - 1], m = Number(s.slice(5, 7)) - 1, newDay = s.slice(0, 10) !== p.slice(0, 10);
        if (r === "I" || r === "1m" || r === "5m") { if (newDay) out.push({ i, label: day(s) }); else if (s.slice(11, 13) !== p.slice(11, 13)) out.push({ i, label: `${s.slice(11, 13)}:00` }); }
        else if (isMinutes(r)) { if (newDay) out.push({ i, label: day(s) }); }
        else if (r === "D") { if (s.slice(0, 7) !== p.slice(0, 7)) out.push({ i, label: MON[m].toUpperCase() }); }
        else if (r === "M") { if (s.slice(0, 4) !== p.slice(0, 4)) out.push({ i, label: s.slice(0, 4) }); }
        else if (s.slice(0, 7) !== p.slice(0, 7) && m % 3 === 0) out.push({ i, label: m === 0 ? s.slice(0, 4) : MON[m].toUpperCase() });
    });
    return out;
};

// Fib: levels from B back toward A, price = B − (B − A) × r (hundredths)
export const FIB_DEFAULT = [0.236, 0.382, 0.5, 0.618, 0.786];
export const FIB_ALL = [0.236, 0.382, 0.5, 0.618, 0.786, 1.272, 1.618, 2.618];
export const fibLevels = (a: number, b: number, ratios: number[]): { r: number; price: number }[] =>
    [0, ...ratios, 1].sort((x, y) => x - y).filter((r, i, s) => s.indexOf(r) === i).map((r) => ({ r, price: Math.round(b - (b - a) * r) }));

// the bar nearest to a fractional index; snap = that bar's high or low, whichever is nearer the tapped price
export const nearestBar = (n: number, x: number): number => Math.max(0, Math.min(n - 1, Math.round(x)));
export const snapPrice = (B: Bars, i: number, price: number): number => (Math.abs(B.h[i] - price) <= Math.abs(B.l[i] - price) ? B.h[i] : B.l[i]);
// index of a date in the bars (the nearest bar on or before it; a date before the first bar = a negative fraction off the left)
export const indexOf = (d: string[], date: string): number => {
    if (!d.length) return 0;
    if (date < d[0]) return -(Date.parse(d[0]) - Date.parse(date)) / 86400000 / 1.4;   // about 5 bars a week
    let k = 0;
    for (let i = 0; i < d.length; i++) if (d[i] <= date) k = i;
    return k;
};
// a line through A and B (index, price) carried on to index x
export const lineAt = (ai: number, ap: number, bi: number, bp: number, x: number): number => (bi === ai ? bp : ap + ((bp - ap) * (x - ai)) / (bi - ai));

// Drawings in Invest/<ticker>.md: `drawings: [{ id, type, a: { date, price }, b?, hidden?, note? }]`, price in hundredths
export type DrawType = "fib" | "line" | "level";
export interface Point { date: string; price: number }
export interface Drawing { id: string; type: DrawType; a: Point; b: Point | null; hidden: boolean; note: string; drawn: string }
const pt = (v: unknown): Point | null => {   // a point from a minute chart keeps its time ("2026-11-04T10:30")
    const o = v as FM, price = Math.round(Number(o?.price)), t = String(o?.date ?? "").trim();
    return o && price > 0 ? { date: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(t) ? t : dateStr(o.date, ""), price } : null;
};
export const readDrawings = (fm: FM | null): Drawing[] => (Array.isArray(fm?.drawings) ? (fm!.drawings as FM[]) : []).flatMap((x, k) => {
    const type = String(x?.type) as DrawType, a = pt(x?.a), b = pt(x?.b);
    if (!["fib", "line", "level"].includes(type) || !a || (type !== "level" && !b)) return [];
    return [{ id: String(x.id ?? `d${k + 1}`), type, a, b: type === "level" ? null : b, hidden: x.hidden === true, note: String(x.note ?? ""), drawn: dateStr(x.drawn, "") }];
});
export const newDrawingId = (list: Drawing[]): string => { let n = list.length + 1; while (list.some((d) => d.id === `d${n}`)) n++; return `d${n}`; };
// chart settings per holding (`chart:` in the same note): Fib ratios shown, snap, average cost line, moving average
export interface ChartPrefs { fib: number[]; snap: boolean; cost: boolean; ma: 0 | 20 | 60; bb: boolean }   // bb: Bollinger 20, 2σ
export const readPrefs = (fm: FM | null): ChartPrefs => {
    const c = (fm?.chart ?? {}) as FM, fib = Array.isArray(c.fib) ? c.fib.map(Number).filter((r) => FIB_ALL.some((x) => Math.abs(x - r) < 1e-9)) : FIB_DEFAULT;
    const ma = Number(c.ma);
    return { fib, snap: c.snap !== false, cost: c.cost !== false, ma: ma === 0 || ma === 60 ? ma : 20, bb: c.bb === true };
};

// The live quote on its own day: that bar's close becomes the quote (high / low widened to it); a quote for a newer day than
// the last bar leaves the bars alone (no open to draw a candle from). Also the close before that day, for "today's" change.
export const withLive = (B: Bars, day: string, price: number): Bars => {
    const n = B.d.length;
    if (!n || B.d[n - 1] !== day || !(price > 0)) return B;
    const c = [...B.c], h = [...B.h], l = [...B.l];
    c[n - 1] = price; h[n - 1] = Math.max(h[n - 1], price); l[n - 1] = Math.min(l[n - 1], price);
    return { ...B, c, h, l };
};
// The live quote on minute bars: `at` = the quote's minute ("YYYY-MM-DDTHH:MM", the exchange's clock). Inside the last bar's
// span (or before the next bar starts) its close / high / low move; a later bar of the same day starts as a new bar at the
// price (open = high = low = close, no volume yet); another day, or a time before the last bar, leaves the bars alone.
export const MINUTES: Partial<Record<Range, number>> = { I: 1, "1m": 1, "5m": 5, "15m": 15, "30m": 30, "60m": 60 };
export const withLiveMinute = (B: Bars, at: string, price: number, size: number): Bars => {
    const n = B.d.length, last = B.d[n - 1] ?? "";
    if (!n || !(price > 0) || at.slice(0, 10) !== last.slice(0, 10) || at < last) return B;
    const m = Number(at.slice(11, 13)) * 60 + Number(at.slice(14, 16)), f = m - (m % size);
    const key = `${at.slice(0, 11)}${String(Math.floor(f / 60)).padStart(2, "0")}:${String(f % 60).padStart(2, "0")}`;
    if (key <= last) {
        const c = [...B.c], h = [...B.h], l = [...B.l];
        c[n - 1] = price; h[n - 1] = Math.max(h[n - 1], price); l[n - 1] = Math.min(l[n - 1], price);
        return { ...B, c, h, l };
    }
    return { ...B, d: [...B.d, key], o: [...B.o, price], h: [...B.h, price], l: [...B.l, price], c: [...B.c, price], v: [...B.v, 0] };
};
// the start of the `size`-minute bar a minute "YYYY-MM-DDTHH:MM" falls in
const bucket = (at: string, size: number): string => {
    const m = Number(at.slice(11, 13)) * 60 + Number(at.slice(14, 16)), f = m - (m % size);
    return `${at.slice(0, 11)}${String(Math.floor(f / 60)).padStart(2, "0")}:${String(f % 60).padStart(2, "0")}`;
};
// live quotes kept as 1-minute bars while a chart is open, with the shares traded since the quote before (vol); a quote on a
// new day starts over
export const addTick = (T: Bars | null | undefined, at: string, price: number, vol = 0): Bars => {
    const B = T && T.d.length && T.d[T.d.length - 1].slice(0, 10) === at.slice(0, 10) ? T : emptyBars();
    if (!(price > 0)) return B;
    const n = B.d.length, key = bucket(at, 1);
    if (n && key < B.d[n - 1]) return B;   // an older quote than the last tick
    if (n && key === B.d[n - 1]) {
        const c = [...B.c], h = [...B.h], l = [...B.l];
        c[n - 1] = price; h[n - 1] = Math.max(h[n - 1], price); l[n - 1] = Math.min(l[n - 1], price);
        const v = [...B.v]; v[n - 1] += vol;
        return { ...B, c, h, l, v };
    }
    return { ...B, d: [...B.d, key], o: [...B.o, price], h: [...B.h, price], l: [...B.l, price], c: [...B.c, price], v: [...B.v, vol] };
};
// the ticks newer than the fetched bars, joined as `size`-minute bars; TODAY (intraday) with only an older session fetched:
// today's ticks alone, the close before = that session's last close
export const withTicks = (B: Bars, T: Bars | null | undefined, size: number, intraday = false): Bars => {
    if (!T?.d.length) return B;
    const n = B.d.length, last = B.d[n - 1] ?? "", tday = T.d[0].slice(0, 10);
    const fresh = intraday && n > 0 && last.slice(0, 10) < tday;
    let out: Bars = fresh ? { ...emptyBars(), ohlc: B.ohlc, pc: B.c[n - 1] } : { ...B, d: [...B.d], o: [...B.o], h: [...B.h], l: [...B.l], c: [...B.c], v: [...B.v] };
    const fetched = fresh ? 0 : n;
    T.d.forEach((d, i) => {
        const key = bucket(d, size), m = out.d.length, end = out.d[m - 1] ?? "";
        if (key < end) return;   // the fetched bars already cover it
        // volume adds up (1-minute bars into 5-minute candles; live ticks carry none); 2026-11-10: it was dropped, VOL read 0
        // (a tick inside the last fetched bar adds none: that bar already counts its own volume)
        if (key === end) { out.c[m - 1] = T.c[i]; out.h[m - 1] = Math.max(out.h[m - 1], T.h[i]); out.l[m - 1] = Math.min(out.l[m - 1], T.l[i]); if (m > fetched) out.v[m - 1] += T.v[i] || 0; return; }
        out.d.push(key); out.o.push(T.o[i]); out.h.push(T.h[i]); out.l.push(T.l[i]); out.c.push(T.c[i]); out.v.push(T.v[i] || 0);
    });
    return out;
};
export const closeBefore = (B: Bars, day: string): number | null => { for (let i = B.d.length - 1; i >= 0; i--) if (B.d[i] < day) return B.c[i]; return null; };

// today's move for a quote (hundredths): against the close before the quote's day in the day bars; a quote that is just the
// last bar's close read on a later day (a US close the next Taiwan morning) is that bar's own move. Without day bars, the
// quote's own daily closes: the one before the last when the last is the quote itself. A quote that names its own
// reference price (`ref`, Taiwan sources: yesterday's close, ex-dividend adjusted, as brokers count) wins over both: the day
// bars can miss yesterday (Yahoo left 0050's 2026-11-04 bar empty). null = not known yet.
export const dayChange = (B: Bars | null | undefined, live: { day: string; price: number } | null, closes?: number[], ref?: number): { ch: number; pct: number } | null => {
    if (!live) return null;
    let prev: number | null = null;
    const n = B?.c.length ?? 0;
    if (ref && ref > 0) prev = ref;
    else if (B && n) {
        const same = live.day > B.d[n - 1] && live.price === B.c[n - 1];
        prev = same ? B.c[n - 2] ?? null : closeBefore(B, live.day);
    } else if (closes && closes.length) {
        const last = closes[closes.length - 1];
        prev = Math.abs(last - live.price) < 1 ? closes[closes.length - 2] ?? null : last;
    }
    return prev ? { ch: live.price - prev, pct: ((live.price - prev) / prev) * 100 } : null;
};
