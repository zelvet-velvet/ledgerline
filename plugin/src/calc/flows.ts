// 法人 flows (TWSE T86, the three big institutions' net buying per listed stock and day). All counts are whole shares;
// pages show lots (張 = 1,000 shares). One T86 request answers every listed stock for one day; only our tickers are kept.

// one stock on one day: 外資 (foreign, their dealers included), 投信 (trusts), 自營商 own trading and hedging: net, then
// shares bought (…b) and sold (…s) by each
export interface Flow { f: number; t: number; ds: number; dh: number; fb: number; fs: number; tb: number; ts: number; dsb: number; dss: number; dhb: number; dhs: number }
const ZERO: Flow = { f: 0, t: 0, ds: 0, dh: 0, fb: 0, fs: 0, tb: 0, ts: 0, dsb: 0, dss: 0, dhb: 0, dhs: 0 };
export interface FlowDay extends Flow { date: string; d: number; total: number }
// date "YYYY-MM-DD" → code → flow; null = no trading that day (holiday)
export type FlowDays = Record<string, Record<string, Flow> | null>;

const int = (s: unknown): number => { const n = Number(String(s ?? "").replace(/,/g, "").trim()); return Number.isFinite(n) ? Math.round(n) : 0; };

// a T86 answer → the rows of these codes; null when the exchange had nothing that day; the columns are found by their names
export const parseT86 = (json: unknown, codes: string[]): Record<string, Flow> | null => {
    const j = json as { stat?: string; fields?: string[]; data?: string[][] } | null;
    if (!j || j.stat !== "OK" || !Array.isArray(j.data) || !Array.isArray(j.fields)) return null;
    const F = j.fields, col = (want: string) => F.findIndex((x) => x.includes(want));
    const fx = col("外陸資買賣超"), fd = col("外資自營商買賣超"), tr = col("投信買賣超"), ds = col("自營商買賣超股數(自行"), dh = col("自營商買賣超股數(避險");
    const G = { fb: col("外陸資買進"), fs: col("外陸資賣出"), fdb: col("外資自營商買進"), fds: col("外資自營商賣出"), tb: col("投信買進"), ts: col("投信賣出"), dsb: col("自營商買進股數(自行"), dss: col("自營商賣出股數(自行"), dhb: col("自營商買進股數(避險"), dhs: col("自營商賣出股數(避險") };
    if ([fx, tr, ds, dh].some((i) => i < 0)) return null;
    const at = (r: string[], i: number) => (i >= 0 ? int(r[i]) : 0);
    const want = new Set(codes), out: Record<string, Flow> = {};
    for (const r of j.data) {
        const c = String(r[0] ?? "").trim();
        if (want.has(c)) out[c] = {
            f: int(r[fx]) + at(r, fd), t: int(r[tr]), ds: int(r[ds]), dh: int(r[dh]),
            fb: at(r, G.fb) + at(r, G.fdb), fs: at(r, G.fs) + at(r, G.fds), tb: at(r, G.tb), ts: at(r, G.ts), dsb: at(r, G.dsb), dss: at(r, G.dss), dhb: at(r, G.dhb), dhs: at(r, G.dhs),
        };
    }
    return out;
};

// one code's trading days, oldest first (days the stock had no row count as zero: no institution traded it)
export const flowSeries = (days: FlowDays, code: string): FlowDay[] =>
    Object.keys(days).sort().filter((k) => days[k]).map((date) => {
        const x = { ...ZERO, ...days[date]![code] }, d = x.ds + x.dh;
        return { date, ...x, d, total: x.f + x.t + d };
    });

export type Who = "f" | "t" | "d" | "total";
// the last n days' sum for one of them
export const flowSum = (s: FlowDay[], who: Who, n: number): number => s.slice(-n).reduce((a, x) => a + x[who], 0);
// shares bought / sold by one of them over the last n days (自營商: own trading and hedging together)
export const flowGross = (s: FlowDay[], who: "f" | "t" | "d", side: "b" | "s", n: number): number =>
    s.slice(-n).reduce((a, x) => a + (who === "d" ? x[`ds${side}`] + x[`dh${side}`] : x[`${who}${side}`]), 0);
// of the last n days: how many they bought on, how many they sold on
export const flowSides = (s: FlowDay[], who: Who, n: number): [number, number] => {
    const w = s.slice(-n);
    return [w.filter((x) => x[who] > 0).length, w.filter((x) => x[who] < 0).length];
};
// days running on the same side up to the last day: +3 = bought 3 days running, −4 = sold 4 days running, 0 = flat last day
export const streak = (s: FlowDay[], who: Who): number => {
    let k = 0;
    for (let i = s.length - 1; i >= 0; i--) {
        const v = Math.sign(s[i][who]);
        if (!v || (k && v !== Math.sign(k))) break;
        k += v;
    }
    return k;
};
// shares → lots, rounded half away from zero
export const lots = (shares: number): number => Math.sign(shares) * Math.round(Math.abs(shares) / 1000);

const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
// the weekdays to know for `n` trading days, newest first: the last `back` calendar days (20 trading days with room for holidays; today only from 15:00, when T86
// is out), minus the ones already known
export const flowDue = (now: Date, known: FlowDays, back = 35): string[] => {
    const out: string[] = [];
    for (let k = now.getHours() >= 15 ? 0 : 1; k <= back; k++) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - k), s = ymd(d);
        if (d.getDay() % 6 && !(s in known)) out.push(s);
    }
    return out;
};
// keep only the last `back` calendar days
export const flowTrim = (days: FlowDays, now: Date, back = 35): FlowDays => {
    const from = ymd(new Date(now.getFullYear(), now.getMonth(), now.getDate() - back));
    return Object.fromEntries(Object.entries(days).filter(([k]) => k >= from));
};
// ETFs (codes starting 00): 自營商 is mostly market makers' hedging, not a view on the fund
export const isEtf = (code: string): boolean => /^00/.test(code);
