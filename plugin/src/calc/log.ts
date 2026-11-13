import type { FM } from "../data/store";

// Pure Log maths, ported from v2 (Scripts/calc/log.js + FinanceHelpers.getMonthIncome / resolveDailyQuotas).
export const IGNORE = ["file", "sticker", "cssclasses", "ledger", "date", "title", "tags", "aliases"];
export interface Day { name: string; path: string; fm: FM }                  // a daily note (name = YYYY-MM-DD)
export interface BudgetItem { name: string; quota: number; spending: string[] }
export interface IncomeRow { key: string; label: string; base: number; amount: number; kind: "base" | "bonus" | "extra"; overridden: boolean }
export interface BudgetRow { item: BudgetItem; index: number; quotaKey: string; quota: number; isPercent: boolean; spent: number; remain: number; progress: number; level: "ok" | "warn" | "over" }
export interface FixedRow { item: BudgetItem; prop: string; def: number; paid: number }
export interface ExtraRow { prop: string; total: number; fromDays: number; fromMonth: number; days: { name: string; path: string; amount: number }[] }

export const slug = (s: string): string => String(s || "").trim().toLowerCase().replace(/[^a-z0-9一-鿿]+/g, "_").replace(/^_|_$/g, "");
const arr = <T = FM>(v: unknown): T[] => (Array.isArray(v) ? v : v === undefined || v === null ? [] : [v]) as T[];
export const budgetItems = (fm: FM | null): BudgetItem[] => arr(fm?.budget).filter((x) => x && typeof x === "object")
    .map((x) => ({ name: String(x.name ?? ""), quota: Number(x.quota) || 0, spending: arr<string>(x.spending).map(String) }));

export const monthIncome = (incomeCfg: FM | null, month: FM | null, monthNumber: number) => {
    const ov = (month?.income_override ?? {}) as FM;
    const rows: IncomeRow[] = [];
    for (const [k, v] of Object.entries(incomeCfg ?? {})) {
        if (k.startsWith("file") || typeof v !== "number") continue;
        const has = ov[k] !== undefined;
        rows.push({ key: k, label: k, base: v, amount: has ? Number(ov[k]) || 0 : v, kind: "base", overridden: has });
    }
    for (const b of arr(incomeCfg?.bonuses)) {
        if (!b || Number(b.month) !== monthNumber) continue;
        const key = "bonus_" + slug(String(b.name));
        const has = ov[key] !== undefined;
        rows.push({ key, label: String(b.name), base: Number(b.amount) || 0, amount: has ? Number(ov[key]) || 0 : Number(b.amount) || 0, kind: "bonus", overridden: has });
    }
    for (const [k, v] of Object.entries((month?.extra_income ?? {}) as FM)) rows.push({ key: k, label: k, base: Number(v) || 0, amount: Number(v) || 0, kind: "extra", overridden: false });
    return { rows, total: rows.reduce((t, r) => t + r.amount, 0) };
};

// The monthly allocation template ("Saving n Loan"): every line is a share of the salary. `living` is the money to live on
// (fixed bills + daily budget groups + one-offs); every other line is set aside. The lines must add up to the income.
export const LIVING = "living";
export interface Allocation { living: number; saved: number; income: number; gap: number }   // gap = income − saved − living
export const allocation = (plan: FM, month: FM | null, income: number): Allocation => {
    const val = (k: string) => (month && month[k] !== undefined ? Number(month[k]) || 0 : Number(plan[k]) || 0);
    const saved = Object.keys(plan).filter((k) => !k.startsWith("file") && k !== LIVING && typeof plan[k] === "number").reduce((s, k) => s + val(k), 0);
    // a month note made before the living line existed: living is whatever the savings left (as the app always read it)
    const hasLiving = month ? month[LIVING] !== undefined : plan[LIVING] !== undefined;
    const living = hasLiving ? val(LIVING) : income - saved;
    return { living, saved, income, gap: income - saved - living };
};

export interface MonthInput { month: FM | null; days: Day[]; plan: FM; daily: BudgetItem[]; fixed: BudgetItem[]; income: number }
export const computeMonth = ({ month, days, plan, daily, fixed, income }: MonthInput) => {
    const has = (k: string) => !!month && month[k] !== undefined;
    const savings: [string, number][] = Object.keys(plan).filter((k) => !k.startsWith("file") && k !== LIVING && typeof plan[k] === "number").map((k) => [k, has(k) ? Number(month![k]) : Number(plan[k]) || 0]);
    const alloc = allocation(plan, month, income);
    const saved = alloc.saved;
    const dailyProps = [...new Set(daily.flatMap((x) => x.spending))];
    const custom = new Set<string>();
    for (const d of days) for (const k of Object.keys(d.fm)) if (!IGNORE.includes(k) && typeof d.fm[k] === "number" && !dailyProps.includes(k)) custom.add(k);
    const spending: Record<string, number> = {};
    for (const d of days) for (const p of [...dailyProps, ...custom]) spending[p] = (spending[p] || 0) + (Number(d.fm[p]) || 0);
    const fixedRows: FixedRow[] = fixed.map((item) => {
        let total = 0;
        for (const p of item.spending) { const v = has(p) ? Number(month![p]) : item.quota; spending[p] = (spending[p] || 0) + v; total += v; }
        const prop = item.spending[0] ?? "";
        return { item, prop, def: item.quota, paid: has(prop) ? Number(month![prop]) || 0 : 0 };
    });
    const fixedTotal = fixed.reduce((s, item) => s + item.spending.reduce((t, p) => t + (has(p) ? Number(month![p]) : item.quota), 0), 0);
    const extraMonth = Object.entries((month?.extra_expenses ?? {}) as FM);
    const extras: ExtraRow[] = [];
    for (const prop of new Set([...custom, ...extraMonth.map(([k]) => k)])) {
        const fromDays = spending[prop] || 0;
        const fromMonth = Number(((month?.extra_expenses ?? {}) as FM)[prop]) || 0;
        spending[prop] = fromDays + fromMonth;
        if (fromDays + fromMonth > 0) extras.push({ prop, total: fromDays + fromMonth, fromDays, fromMonth, days: days.filter((d) => Number(d.fm[prop]) > 0).map((d) => ({ name: d.name, path: d.path, amount: Number(d.fm[prop]) })).sort((a, b) => a.name.localeCompare(b.name)) });
    }
    const spent = Object.values(spending).reduce((s, v) => s + v, 0);
    const spendable = Math.max(0, alloc.living - fixedTotal);   // the daily budget groups share what living leaves after the bills
    const budget: BudgetRow[] = daily.map((item, index) => {
        const quotaKey = (item.spending[0] ?? "") + "_quota";
        const isPercent = !has(quotaKey);
        const quota = isPercent ? Math.floor((spendable * item.quota) / 100) : Number(month![quotaKey]) || 0;
        const s = item.spending.reduce((t, p) => t + (spending[p] || 0), 0);
        const remain = quota - s;
        const progress = quota > 0 ? Math.min((s / quota) * 100, 100) : 0;
        return { item, index, quotaKey, quota, isPercent, spent: s, remain, progress, level: remain < 0 ? "over" : progress > 85 ? "warn" : "ok" };
    });
    return {
        savings, saved, spending, fixedRows, fixedTotal, extras, extraTotal: extras.reduce((s, e) => s + e.total, 0), spent,
        remaining: alloc.living - spent, alloc, budget, paidCount: fixedRows.filter((r) => r.paid !== 0).length,
    };
};

export const spentOnDay = (fm: FM): number => Object.keys(fm).filter((k) => !IGNORE.includes(k) && typeof fm[k] === "number").reduce((s, k) => s + (Number(fm[k]) || 0), 0);

// This month's investment plan split over the allocation buckets, and what was bought in each (from the investment config)
export const investBuckets = (inv: FM | null, plan: number, monthKey: string) => {
    const alloc = arr(inv?.allocation);
    if (!alloc.length || !(plan > 0)) return null;
    const keyOf = (c: unknown) => { const x = String(c ?? "").toLowerCase(); const m = alloc.find((b) => String(b.key).toLowerCase() === x || String(b.label).toLowerCase() === x); return m ? String(m.key).toLowerCase() : null; };
    let assigned = 0;
    const buckets = alloc.map((b, i) => {
        const target = i === alloc.length - 1 ? plan - assigned : Math.floor((plan * (Number(b.pct) || 0)) / 100);
        assigned += target;
        return { key: String(b.key).toLowerCase(), label: String(b.label ?? b.key), target, bought: 0 };
    });
    for (const a of arr(inv?.assets)) {
        const b = buckets.find((x) => x.key === keyOf(a.category));
        if (!b) continue;
        for (const tx of arr(a.transactions)) {
            if (String(tx.date ?? "").slice(0, 7) !== monthKey) continue;
            const amt = (Number(tx.shares) || 0) * (Number(tx.price) || 0) * (Number(tx.fx) || 1);
            b.bought += tx.type === "SELL" ? -amt : amt;
        }
    }
    return buckets;
};
