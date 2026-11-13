// Order flow for the chart page's FOOTPRINT and VOLUME HEAT modes and the market map (market mode step 2, artifact "Invest
// Market Mode" sections 2 and 2b, 2026-11-09; built 2026-11-10). Prices in hundredths, sizes in lots (張), times in ms.
// A trade's side: bought at the ask (+1, buyers aggressive), sold into the bid (−1), or unknown (0, counted in the volume only).

export interface FTrade { t: number; p: number; q: number; side: 1 | -1 | 0 }
export interface Cell { b: number; a: number }   // lots sold into the bid, lots bought at the ask
export interface FBar { m: string; o: number; h: number; l: number; c: number; v: number; d: number; cells: Map<number, Cell> }

// the side of a trade at price p against the best bid / ask quoted just before it (hundredths; 0 = not known)
export const sideOf = (p: number, bid: number, ask: number): 1 | -1 | 0 => {
    if (ask > 0 && p >= ask) return 1;
    if (bid > 0 && p <= bid) return -1;
    if (bid > 0 && ask > 0) { const mid = (bid + ask) / 2; return p > mid ? 1 : p < mid ? -1 : 0; }
    return 0;
};

// Taiwan's tick for a stock price (hundredths): under 10 → 0.01, 50 → 0.05, 100 → 0.1, 500 → 0.5, 1000 → 1, else 5
export const twTick = (p: number): number => (p < 1000 ? 1 : p < 5000 ? 5 : p < 10000 ? 10 : p < 50000 ? 50 : p < 100000 ? 100 : 500);

// TWSE MIS, one stock (getStockInfo msgArray item): the day's lots so far, the last trade, the 5-level book
export interface MisSnap { at: number; v: number; z: number; bids: number[]; bq: number[]; asks: number[]; aq: number[] }
const nums = (s: unknown, f: (x: number) => number): number[] => String(s ?? "").split("_").filter(Boolean).map((x) => f(Number(x))).filter((x) => x > 0);
export const parseMisSnap = (a: Record<string, unknown> | undefined): MisSnap | null => {
    if (!a) return null;
    const v = Number(a.v), at = Number(a.tlong);
    if (!(v >= 0) || !(at > 0)) return null;
    const tr = a.trade as { z?: string } | undefined;
    const z = Number(a.z) > 0 ? Number(a.z) : Number(tr?.z) > 0 ? Number(tr?.z) : 0;
    const P = (x: number) => Math.round(x * 100);
    return { at, v, z: P(z), bids: nums(a.b, P), bq: nums(a.g, Math.round), asks: nums(a.a, P), aq: nums(a.f, Math.round) };
};
// what traded between two snapshots 5 s apart: the new lots at the last price, sided against the book before them. One
// trade per step (the free feed has no tape): coarse, but every lot of the day lands in a cell.
export const misStep = (prev: MisSnap | null, cur: MisSnap): FTrade | null => {
    if (!prev || cur.at <= prev.at || !cur.z) return null;
    const q = cur.v - prev.v;
    if (q <= 0) return null;
    return { t: cur.at, p: cur.z, q, side: sideOf(cur.z, prev.bids[0] ?? 0, prev.asks[0] ?? 0) };
};

// Fugle trades (intraday/trades rows or the stream's trades data): { price, size, bid?, ask?, time µs }
export const fugleTrade = (r: { price?: number; size?: number; bid?: number; ask?: number; time?: number } | undefined): FTrade | null => {
    const p = Math.round(Number(r?.price) * 100), q = Math.round(Number(r?.size)), us = Number(r?.time);
    if (!(p > 0) || !(q > 0) || !(us > 0)) return null;
    return { t: Math.round(us / 1000), p, q, side: sideOf(p, Math.round(Number(r?.bid) * 100) || 0, Math.round(Number(r?.ask) * 100) || 0) };
};

// trades into bars of `mins` minutes (keyed by the bar's first minute, "HH:MM" from minuteOf), in time order
export const toBars = (trades: FTrade[], minuteOf: (ms: number) => string, mins = 1): FBar[] => {
    const out: FBar[] = [];
    const key = (ms: number) => {
        const m = minuteOf(ms), n = Number(m.slice(0, 2)) * 60 + Number(m.slice(3, 5)), k = n - (n % mins);
        return `${String(Math.floor(k / 60)).padStart(2, "0")}:${String(k % 60).padStart(2, "0")}`;
    };
    for (const tr of [...trades].sort((a, b) => a.t - b.t)) {
        const m = key(tr.t);
        let b = out[out.length - 1];
        if (!b || b.m !== m) { b = { m, o: tr.p, h: tr.p, l: tr.p, c: tr.p, v: 0, d: 0, cells: new Map() }; out.push(b); }
        b.h = Math.max(b.h, tr.p); b.l = Math.min(b.l, tr.p); b.c = tr.p; b.v += tr.q; b.d += tr.side * tr.q;
        const c = b.cells.get(tr.p) ?? { b: 0, a: 0 };
        if (tr.side > 0) c.a += tr.q; else if (tr.side < 0) c.b += tr.q; else { c.a += tr.q / 2; c.b += tr.q / 2; }
        b.cells.set(tr.p, c);
    }
    return out;
};

// cells grouped into rows of `step` hundredths (a row = floor(p / step) × step)
export const group = (cells: Map<number, Cell>, step: number): Map<number, Cell> => {
    const g = new Map<number, Cell>();
    for (const [p, c] of cells) { const k = Math.floor(p / step) * step, x = g.get(k) ?? { b: 0, a: 0 }; x.b += c.b; x.a += c.a; g.set(k, x); }
    return g;
};
// the busiest row (the point of control); ties: the lower price
export const pocOf = (cells: Map<number, Cell>): number | null => {
    let best: number | null = null, bv = -1;
    for (const [p, c] of [...cells].sort((x, y) => x[0] - y[0])) { const v = c.a + c.b; if (v > bv) { bv = v; best = p; } }
    return best;
};
// the value area: from the POC, add the busier neighbouring row (above or below, in price order) until `share` of the volume
// is in; { poc, val, vah } as row prices
export const valueArea = (cells: Map<number, Cell>, share = 0.7): { poc: number; val: number; vah: number } | null => {
    const ks = [...cells.keys()].sort((a, b) => a - b);
    if (!ks.length) return null;
    const vol = (k: number) => { const c = cells.get(k)!; return c.a + c.b; };
    const tot = ks.reduce((s, k) => s + vol(k), 0), poc = pocOf(cells)!;
    let lo = ks.indexOf(poc), hi = lo, inV = vol(poc);
    while (inV < tot * share && (lo > 0 || hi < ks.length - 1)) {
        const up = hi < ks.length - 1 ? vol(ks[hi + 1]) : -1, dn = lo > 0 ? vol(ks[lo - 1]) : -1;
        if (up >= dn) { hi++; inV += up; } else { lo--; inV += dn; }
    }
    return { poc, val: ks[lo], vah: ks[hi] };
};
// imbalances (rows `step` apart): a buy imbalance where the ask lots are ≥ ratio × the bid lots one row lower (and ≥ min);
// a sell imbalance where the bid lots are ≥ ratio × the ask lots one row higher
export const imbalances = (cells: Map<number, Cell>, step: number, ratio = 3, min = 20): { buy: Set<number>; sell: Set<number> } => {
    const buy = new Set<number>(), sell = new Set<number>();
    for (const [p, c] of cells) {
        const below = cells.get(p - step), above = cells.get(p + step);
        if (below && c.a >= min && c.a >= ratio * Math.max(1, below.b)) buy.add(p);
        if (above && c.b >= min && c.b >= ratio * Math.max(1, above.a)) sell.add(p);
    }
    return { buy, sell };
};
// the longest run of buy (or sell) imbalances on rows next to each other: [low, high] row prices, null under `n`
export const stacked = (rows: Set<number>, step: number, n = 3): [number, number] | null => {
    const ks = [...rows].sort((a, b) => a - b);
    let best: [number, number] | null = null, s = 0;
    for (let i = 0; i < ks.length; i++) {
        if (i && ks[i] - ks[i - 1] !== step) s = i;
        if (i - s + 1 >= n && (!best || ks[i] - ks[s] > best[1] - best[0])) best = [ks[s], ks[i]];
    }
    return best;
};
// the day's cells (every bar added up)
export const dayCells = (bars: FBar[]): Map<number, Cell> => {
    const g = new Map<number, Cell>();
    for (const b of bars) for (const [p, c] of b.cells) { const x = g.get(p) ?? { b: 0, a: 0 }; x.b += c.b; x.a += c.a; g.set(p, x); }
    return g;
};
// bid size against ask size over the book: +1 all bids, −1 all asks, 0 even (or no book)
export const pressure = (bq: number[], aq: number[]): number => {
    const b = bq.reduce((s, x) => s + x, 0), a = aq.reduce((s, x) => s + x, 0);
    return a + b > 0 ? (b - a) / (a + b) : 0;
};

// TWSE MI_5MINS (the whole market every 5 s): net new buy − sell order lots per 5 minutes, in time order; rows
// [time, buy orders, buy lots, sell orders, sell lots, trades, lots, value] with thousands commas
export const parseMi5 = (json: unknown): { date: string; t: string[]; net: number[] } | null => {
    const j = json as { stat?: string; date?: string; data?: string[][] };
    if (j?.stat !== "OK" || !Array.isArray(j.data) || !j.data.length) return null;
    const n = (s: string) => Number(String(s).replace(/,/g, "")) || 0;
    const t: string[] = [], net: number[] = [];
    let last: [number, number] | null = null;
    for (const r of j.data) {
        const hm = String(r[0]).slice(0, 5), slot = Number(hm.slice(3, 5)) % 5 === 0 && String(r[0]).slice(6) === "00";
        const cur: [number, number] = [n(r[2]), n(r[4])];
        if (!last) { last = cur; continue; }
        if (!slot) continue;
        t.push(hm); net.push((cur[0] - last[0]) - (cur[1] - last[1]));
        last = cur;
    }
    const d = String(j.date ?? "");
    return t.length ? { date: /^\d{8}$/.test(d) ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}` : "", t, net } : null;
};

// TWSE BFIAMU (the day's trading value per sector index): name → value (TWD); rows [name, shares, value, trades, change]
export const parseBfiamu = (json: unknown): Record<string, number> => {
    const out: Record<string, number> = {};
    for (const r of (json as { data?: string[][] })?.data ?? []) {
        const k = String(r[0] ?? "").trim(), v = Number(String(r[2] ?? "").replace(/,/g, ""));
        if (k && v > 0) out[k] = v;
    }
    return out;
};

// a squarified treemap (Bruls et al.): items heaviest first, laid in rows along the shorter side, each row kept while it makes
// its tiles closer to squares; near-square tiles leave room for a label (the slice layout made long slivers)
export interface Rect<T> { it: T; x: number; y: number; w: number; h: number }
export const treemap = <T extends { w: number }>(items: T[], x: number, y: number, w: number, h: number): Rect<T>[] => {
    const out: Rect<T>[] = [], list = items.filter((i) => i.w > 0).sort((a, b) => b.w - a.w);
    const tot = list.reduce((s, i) => s + i.w, 0);
    if (!list.length || w <= 0 || h <= 0) return out;
    const k = (w * h) / tot;   // area per unit of weight
    const worst = (row: number[], side: number) => {
        const sum = row.reduce((s, a) => s + a, 0), mx = Math.max(...row), mn = Math.min(...row);
        return Math.max((side * side * mx) / (sum * sum), (sum * sum) / (side * side * mn));
    };
    let i = 0;
    while (i < list.length) {
        const side = Math.min(w, h), row: number[] = [list[i].w * k];
        let j = i + 1;
        while (j < list.length && worst([...row, list[j].w * k], side) <= worst(row, side)) { row.push(list[j].w * k); j++; }
        const sum = row.reduce((s, a) => s + a, 0), thick = sum / side;
        let at = 0;
        row.forEach((a, n) => {
            const len = a / thick, it = list[i + n];
            out.push(w >= h ? { it, x, y: y + at, w: thick, h: len } : { it, x: x + at, y, w: len, h: thick });
            at += len;
        });
        if (w >= h) { x += thick; w -= thick; } else { y += thick; h -= thick; }
        i = j;
    }
    return out;
};
// the small items folded into one: those whose tile would be under `minArea` (px²) join the last tile, "+N" (tap it to see them)
export const foldSmall = <T extends { w: number }>(items: T[], area: number, minArea: number): { keep: T[]; small: T[] } => {
    const list = [...items].filter((i) => i.w > 0).sort((a, b) => b.w - a.w), tot = list.reduce((s, i) => s + i.w, 0);
    const small = list.filter((i) => (i.w / tot) * area < minArea);
    return small.length >= 2 ? { keep: list.filter((i) => !small.includes(i)), small } : { keep: list, small: [] };
};
