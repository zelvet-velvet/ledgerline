import { Bars, bollinger, emptyBars, withTicks } from "./chart";

// K effects (Invest market mode, the K lab of the owner's artifact, 2026-11-09): objective rules on the bars (hundredths).
// The lab's numbers are for 5-minute candles; a longer interval moves more in one bar, so its thresholds grow with the
// square root of its length (15 min ×1.7, 60 min ×3.5, a day ×7.3): the same rarity on every interval.
// - BREAK: the forming candle's body ≥ 0.35 % (closed candles that did keep a small mark)
// - LONG: the forming body ≥ 2× the average body of the 20 candles before it and ≥ 0.25 %
// - BB: the forming close against its Bollinger band (20, 2 sd): z in sd from the middle; outside = a break of the band
export const BREAK_PCT = 0.0035, LONG_PCT = 0.0025, LONG_X = 2, BB_NEAR = 1.5;
export const kScale = (mins: number): number => Math.sqrt(Math.max(1, mins) / 5);

export interface KState {
    marks: { i: number; dir: 1 | -1 }[];   // closed candles whose body broke (index into the bars)
    dir: 1 | -1;                           // the forming candle's direction (flat counts as up)
    body: number;                          // its body, hundredths
    brk: boolean; long: boolean;
    z: number | null;                      // its close in sd from the band's middle (null: under 20 candles)
    bb: 1 | -1 | 0;                        // outside the upper / lower band
    past: number;                          // sd past that band edge (0 inside)
    ub: number | null; lb: number | null;
}

const broke = (o: number, c: number, s: number): boolean => o > 0 && Math.abs(c - o) / o >= BREAK_PCT * s;

// forming: the last candle is still forming (its market trades); else every candle is closed and nothing fires
export const kState = (B: Bars, mins: number, forming: boolean): KState => {
    const n = B.d.length, s = kScale(mins), last = forming ? n - 1 : n;
    const marks: KState["marks"] = [];
    for (let i = 0; i < last; i++) if (broke(B.o[i], B.c[i], s)) marks.push({ i, dir: B.c[i] >= B.o[i] ? 1 : -1 });
    const out: KState = { marks, dir: 1, body: 0, brk: false, long: false, z: null, bb: 0, past: 0, ub: null, lb: null };
    if (!forming || !n) return out;
    const o = B.o[n - 1], c = B.c[n - 1], body = Math.abs(c - o);
    out.dir = c >= o ? 1 : -1; out.body = body;
    out.brk = broke(o, c, s);
    const prev = B.o.slice(Math.max(0, n - 21), n - 1).map((x, k) => Math.abs(B.c[Math.max(0, n - 21) + k] - x));
    const avg = prev.length ? prev.reduce((a, b) => a + b, 0) / prev.length : 0;
    out.long = prev.length > 0 && body >= LONG_X * avg && o > 0 && body / o >= LONG_PCT * s;
    const bb = bollinger(B.c, 20, 2), m = bb.mb[n - 1], sd = bb.sd[n - 1], ub = bb.ub[n - 1], lb = bb.lb[n - 1];
    if (m !== null && sd !== null && ub !== null && lb !== null && sd > 0) {
        out.z = (c - m) / sd; out.ub = ub; out.lb = lb;
        out.bb = c > ub ? 1 : c < lb ? -1 : 0;
        out.past = out.bb > 0 ? (c - ub) / sd : out.bb < 0 ? (lb - c) / sd : 0;
    }
    return out;
};

// TODAY's 1-minute points as 5-minute candles (the index chart draws TODAY so, owner 2026-11-10); the close before stays
export const fiveMin = (B: Bars): Bars => withTicks({ ...emptyBars(), ohlc: true, ...(B.pc ? { pc: B.pc } : {}) }, B, 5);
