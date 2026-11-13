import type { FM } from "../data/store";
import type { Bars } from "./chart";
import { dateStr } from "../format";

// Long-term tools (owner picked 2026-11-10, Vellum screens "Invest · chart page with thesis" and "rules check before a buy").
// A thesis lives in the ticker's note (Invest/<ticker>.md, beside its journal and chart settings):
//   thesis: { why, check: YYYY-MM-DD, hold: what must be true on that day, sell: when you would sell, since: watched since }
// The rules it checks (each one set in Investment Config): write the thesis, the expected outcome and the reason to sell first; a
// cap on the cost held in one single stock (`single_stock_cap`; ETFs and bonds free); buy in 2–3 batches; an emergency fund
// first (`emergency_min`, or the emergency account's target); limit orders, no chasing; single stocks against 0050. The check
// informs, never blocks.
export interface Thesis { why: string; check: string; hold: string; sell: string; since: string }
const s = (v: unknown) => String(v ?? "").trim();
export const readThesis = (fm: FM | null): Thesis | null => {
    const x = fm?.thesis as FM | undefined;
    if (!x || typeof x !== "object") return null;
    const th = { why: s(x.why), check: dateStr(x.check, ""), hold: s(x.hold), sell: s(x.sell), since: dateStr(x.since, "") };
    return th.why || th.sell || th.check ? th : null;
};

// whole days from a to b (YYYY-MM-DD), b − a
export const daysBetween = (a: string, b: string): number => Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86400000);
// the next check: none, later, soon (7 days or less: loud), due (on or after its day: DID IT HOLD?)
export type CheckState = "none" | "later" | "soon" | "due";
export const checkState = (check: string, today: string): CheckState => {
    if (!check) return "none";
    const d = daysBetween(today, check);
    return d <= 0 ? "due" : d <= 7 ? "soon" : "later";
};

// a ticker's % move from the first day bar on or after `from` to the last bar (closes in hundredths); null with no bars
export const moveSince = (b: Bars | null | undefined, from: string): { pct: number; from: string } | null => {
    if (!b || b.c.length < 2) return null;
    let i = b.d.findIndex((d) => d.slice(0, 10) >= from);
    if (i < 0) return null;
    if (i >= b.c.length - 1) i = b.c.length - 2;
    const a = b.c[i], z = b.c[b.c.length - 1];
    return a > 0 ? { pct: ((z - a) / a) * 100, from: b.d[i].slice(0, 10) } : null;
};
// the ticker against a benchmark (0050) over the same days: its % minus the benchmark's %, from the later of both first bars
export const vsBench = (stock: Bars | null | undefined, bench: Bars | null | undefined, from: string): { diff: number; from: string } | null => {
    const a0 = moveSince(stock, from);
    if (!a0) return null;
    const start = a0.from > from ? a0.from : from;
    const a = moveSince(stock, start), b = moveSince(bench, start);
    return a && b ? { diff: a.pct - b.pct, from: a.from > b.from ? a.from : b.from } : null;
};
// the satellite (single stocks) against 0050: each holding's own lead, weighted by its cost
export const satVsBench = (list: { cost: number; diff: number | null }[]): number | null => {
    const ok = list.filter((x) => x.diff !== null && x.cost > 0);
    const w = ok.reduce((t, x) => t + x.cost, 0);
    return w > 0 ? ok.reduce((t, x) => t + (x.diff as number) * x.cost, 0) / w : null;
};

// The rules before a buy, in the order of the screen. met: true / false, or null when the app cannot tell (no data).
export type RuleKey = "thesis" | "sell" | "cap" | "batch" | "emergency" | "limit" | "sat";
export interface RuleRow { key: RuleKey; met: boolean | null; left?: number; n?: number; per?: number; of?: number }
export interface BuyIn {
    thesis: Thesis | null; single: boolean;   // single = a single stock (the cap and batches apply; ETFs and bonds are free)
    cost: number; cap: number; buys: number; batches?: number;   // cost = what is held of it now (whole TWD), buys = earlier buys
    emergency: number | null; emergencyMin: number; limit: number | null; sat: number | null;
}
export const buyRules = (x: BuyIn): { rows: RuleRow[]; met: number } => {
    const of = x.batches ?? 3, n = x.buys + 1;
    const rows: RuleRow[] = [
        { key: "thesis", met: !!x.thesis?.why && !!x.thesis.check },
        { key: "sell", met: !!x.thesis?.sell },
        x.single ? { key: "cap", met: x.cap - x.cost > 0, left: x.cap - x.cost } : { key: "cap", met: true },
        x.single ? { key: "batch", met: n <= of, n, of, per: Math.round(x.cap / of / 100) * 100 } : { key: "batch", met: true, n, of },
        { key: "emergency", met: x.emergency === null ? null : x.emergency >= x.emergencyMin, left: x.emergency ?? undefined },
        { key: "limit", met: x.limit !== null && x.limit > 0 },
        { key: "sat", met: x.sat === null ? null : x.sat >= 0 },
    ];
    return { rows, met: rows.filter((r) => r.met === true).length };
};
// the least the emergency fund should hold before a buy (Investment Config `emergency_min`; none set: only the account's target)
export const emergencyMinOf = (fm: FM | null): number => { const n = Math.round(Number(fm?.emergency_min)); return n > 0 ? n : 0; };
