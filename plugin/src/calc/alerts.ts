import type { FM } from "../data/store";
import { dateStr } from "../format";
import { daysBetween } from "./thesis";

// Alerts (Vellum screen "Invest · alerts"), kept in Config/Alerts.md:
//   topic: the private ntfy topic the phone listens to (empty = only a notice in the app)
//   alerts: [{ id, ticker, kind: below | above, price }]   price alerts set by hand (prices in hundredths in the app)
//   sent: [{ key, date, text }]                             what was sent, kept 7 days; a key is sent once
// Date alerts come by themselves: revenue out (Taiwan holdings and watchlist), the report deadlines, ex-dividend days, thesis checks.
export interface PriceAlert { id: string; ticker: string; kind: "below" | "above"; price: number; index: number }
export interface Sent { key: string; date: string; text: string }
const arr = (v: unknown): FM[] => (Array.isArray(v) ? v : v ? [v] : []).filter((x) => x && typeof x === "object") as FM[];
export const readAlerts = (fm: FM | null): { topic: string; alerts: PriceAlert[]; sent: Sent[] } => ({
    topic: String(fm?.topic ?? "").trim(),
    alerts: arr(fm?.alerts).map((a, index) => ({ id: String(a.id ?? `a${index}`), ticker: String(a.ticker ?? "").toUpperCase(), kind: (a.kind === "above" ? "above" : "below") as PriceAlert["kind"], price: Math.round(Number(a.price) * 100), index }))
        .filter((a) => a.ticker && a.price > 0),
    sent: arr(fm?.sent).map((s) => ({ key: String(s.key ?? ""), date: dateStr(s.date, ""), text: String(s.text ?? "") })).filter((s) => s.key),
});
// a price alert is hit at or past its price (price in hundredths)
export const hit = (a: PriceAlert, price: number): boolean => (a.kind === "below" ? price <= a.price : price >= a.price);
// how far the price is from the alert, in % of the price (positive = still to go)
export const away = (a: PriceAlert, price: number): number => (price > 0 ? ((a.kind === "below" ? price - a.price : a.price - price) / price) * 100 : 0);
// what was sent, kept for 7 days
export const keepSent = (sent: Sent[], today: string): Sent[] => sent.filter((s) => s.date && daysBetween(s.date, today) <= 7);

// Taiwan report deadlines: annual by Mar 31, Q1 by May 15, Q2 by Aug 14, Q3 by Nov 14
export const REPORTS: [string, string][] = [["03-31", "Annual"], ["05-15", "Q1"], ["08-14", "Q2"], ["11-14", "Q3"]];
export interface DateItem { kind: "revenue" | "report" | "exdiv" | "thesis"; date: string; ticker: string; what: string; cash?: number }
// the date alerts in the next `days` days (today included), soonest first
export const comingDates = (today: string, o: { tw: string[]; exdiv: { code: string; date: string; cash: number }[]; theses: { ticker: string; check: string; hold: string }[]; revOut: Set<string> }, days = 45): DateItem[] => {
    const out: DateItem[] = [], y = Number(today.slice(0, 4));
    const inRange = (d: string) => { const n = daysBetween(today, d); return n >= 0 && n <= days; };
    for (const yr of [y, y + 1]) for (const [md, what] of REPORTS) { const d = `${yr}-${md}`; if (inRange(d)) out.push({ kind: "report", date: d, ticker: "", what }); }
    // revenue: due by the 10th; a ticker whose month is already out drops off until next month
    const day = Number(today.slice(8, 10)), m0 = today.slice(0, 7);
    const due = day <= 10 ? `${m0}-10` : `${new Date(Date.UTC(y, Number(today.slice(5, 7)), 10)).toISOString().slice(0, 10)}`;
    for (const tk of o.tw) if (!(due.slice(0, 7) === m0 && o.revOut.has(tk))) out.push({ kind: "revenue", date: due, ticker: tk, what: "" });
    for (const e of o.exdiv) if (inRange(e.date)) out.push({ kind: "exdiv", date: e.date, ticker: e.code, what: "", cash: e.cash });
    for (const th of o.theses) if (th.check && daysBetween(today, th.check) <= days) out.push({ kind: "thesis", date: th.check, ticker: th.ticker, what: th.hold });
    return out.sort((a, b) => a.date.localeCompare(b.date) || a.ticker.localeCompare(b.ticker));
};
// TWSE TWT48U_ALL rows (ex-rights / ex-dividend schedule): Date in ROC years "1151106" → 2026-11-06, CashDividend per share
export const rocDate = (s: string): string => { const m = /^(\d{3})(\d{2})(\d{2})$/.exec(s.trim()); return m ? `${Number(m[1]) + 1911}-${m[2]}-${m[3]}` : ""; };
export const fromTwt48u = (rows: unknown): { code: string; date: string; cash: number }[] => (Array.isArray(rows) ? rows : []).map((r: Record<string, unknown>) => ({
    code: String(r.Code ?? "").trim(), date: rocDate(String(r.Date ?? "")), cash: Math.round(Number(r.CashDividend || 0) * 100),
})).filter((e) => e.code && e.date);
