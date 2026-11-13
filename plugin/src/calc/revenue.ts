// Monthly revenue (Taiwan listings report the last month by the 10th). Months as "YYYY-MM", revenue in whole NT$.
export interface RevMonth { ym: string; v: number }
const ymOf = (y: number, m: number) => { const d = new Date(Date.UTC(y, m - 1, 1)); return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`; };
export const ymAdd = (ym: string, n: number): string => ymOf(Number(ym.slice(0, 4)), Number(ym.slice(5, 7)) + n);
const pct = (a: number | undefined, b: number | undefined): number | null => (a !== undefined && b !== undefined && b > 0 ? ((a - b) / b) * 100 : null);

export interface RevStats {
    latest: RevMonth; mom: number | null; yoy: number | null;
    last3: number | null; ytd: number | null;   // the last 3 months vs the same 3 a year before; Jan–latest vs the same of last year
    best: RevMonth; nextOut: string;             // the best month of the last 24; the day the next month is due (the 10th)
    months: (RevMonth & { yoy: number | null })[];   // the last 24, oldest first
}
export const revStats = (list: RevMonth[]): RevStats | null => {
    const by = new Map(list.filter((m) => m.v > 0).map((m) => [m.ym, m.v]));
    const yms = [...by.keys()].sort();
    if (!yms.length) return null;
    const last = yms[yms.length - 1], v = (ym: string) => by.get(ym);
    const sum = (end: string, n: number): number | undefined => { let t = 0; for (let i = 0; i < n; i++) { const x = v(ymAdd(end, -i)); if (x === undefined) return undefined; t += x; } return t; };
    const mo = Number(last.slice(5, 7));
    const months = Array.from({ length: 24 }, (_, i) => ymAdd(last, i - 23)).filter((ym) => by.has(ym)).map((ym) => ({ ym, v: v(ym) as number, yoy: pct(v(ym), v(ymAdd(ym, -12))) }));
    const best = months.reduce((b, m) => (m.v > b.v ? m : b), months[0]);
    return {
        latest: { ym: last, v: v(last) as number }, mom: pct(v(last), v(ymAdd(last, -1))), yoy: pct(v(last), v(ymAdd(last, -12))),
        last3: pct(sum(last, 3), sum(ymAdd(last, -12), 3)), ytd: pct(sum(last, mo), sum(ymAdd(last, -12), mo)),
        best: { ym: best.ym, v: best.v }, nextOut: `${ymAdd(last, 2)}-10`, months,
    };
};
// the newest month that should be out on `today`: last month from the 10th on, else the month before
export const expectedYm = (today: string): string => ymAdd(today.slice(0, 7), Number(today.slice(8, 10)) >= 10 ? -1 : -2);
// FinMind's TaiwanStockMonthRevenue rows: revenue_year / revenue_month and revenue (NT$)
export const fromFinMind = (rows: unknown): RevMonth[] => (Array.isArray(rows) ? rows : []).map((r: Record<string, unknown>) => ({
    ym: ymOf(Number(r.revenue_year), Number(r.revenue_month)), v: Math.round(Number(r.revenue)),
})).filter((m) => Number.isFinite(m.v) && m.v > 0 && /^\d{4}-\d{2}$/.test(m.ym));
// short money for revenue: 4.82 B, 512.3 M (NT$)
export const revShort = (v: number): string => (v >= 1e9 ? `${(v / 1e9).toFixed(2)} B` : v >= 1e6 ? `${(v / 1e6).toFixed(1)} M` : `${Math.round(v / 1e3)} K`);
