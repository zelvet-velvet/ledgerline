import { dateStr, localDate } from "../format";
import type { FM } from "../data/store";
import { int } from "./money";

export interface Payment { date: string; amount: number; note: string; index: number }
export interface Debt {
    exists: boolean;
    principal: number;
    rate: number;              // annual, as a fraction (0.00775 = 0.775%)
    start: string;             // YYYY-MM-DD
    monthlyMin: number;
    payments: Payment[];       // file order (index = position in the frontmatter list)
    paid: number;
    interest: number;          // charged since repayment started (owner, 2026-11-17: it is part of what is still to pay back)
    balance: number;           // principal + interest − paid
    progress: number;          // % of principal + interest paid
    daysUntilStart: number;
    grace: boolean;            // repayment has not started yet
    planAmount: number;        // monthly amount in the savings plan
    repayment: number;         // planned monthly repayment once it starts (Debt Config `repayment`), else the plan amount
    toInvestment: number;      // grace period: what older months sent on to investing...
    loanPrep: number;          // ...and what was put aside for the loan
}
// One month's loan line. `legacy`: a month note from before the living line (2026-11), when half of the loan line
// went on to investing during the grace period; from then on the line is the reserve itself.
export interface LoanMonth { amount: number; legacy: boolean }

export const DEFAULT_RATE = 0.00775;

// Pure: the debt picture from the debt note, the savings-plan amount and the number of month notes.
export const computeDebt = (fm: FM | null, planAmount: number, months: LoanMonth[], now: Date): Debt => {
    const f = fm ?? {};
    const principal = int(f.initial_principal);
    const rate = f.interest_rate === undefined || f.interest_rate === null || f.interest_rate === "" ? DEFAULT_RATE : Number(f.interest_rate) || 0;
    const start = dateStr(f.start_date, "");
    const raw = Array.isArray(f.payments) ? f.payments : f.payments ? [f.payments] : [];
    const payments: Payment[] = raw.map((p: unknown, index: number) => {
        const o = (p ?? {}) as FM;
        return { date: dateStr(o.date, ""), amount: int(o.amount), note: String(o.note ?? ""), index };
    });
    const paid = payments.reduce((s, p) => s + p.amount, 0);
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const daysUntilStart = start ? Math.ceil((localDate(start).getTime() - day.getTime()) / 86400000) : 0;
    const grace = daysUntilStart > 0;
    let toInvestment = 0, loanPrep = 0;
    if (grace) for (const m of months) {
        const keep = m.legacy ? Math.floor(m.amount / 2) : m.amount;
        loanPrep += keep; toInvestment += m.amount - keep;
    }
    const interest = grace ? 0 : accrued(principal, rate, start, payments, day);
    const owed = principal + interest;
    return {
        exists: !!fm, principal, rate, start, monthlyMin: int(f.monthly_min_payment), payments, paid, interest,
        balance: Math.max(0, owed - paid), progress: owed > 0 ? (paid / owed) * 100 : 0,
        daysUntilStart, grace, planAmount, repayment: int(f.repayment) || planAmount, toInvestment, loanPrep,
    };
};

// Interest charged from the repayment start to `day`: on each monthly date after the start (the 31st falls back to the month's
// last day), a month's interest (rate / 12) on what was owed then: principal + interest so far − payments made before that date.
// Whole dollars each month. A payment without a date counts from the start.
export const accrued = (principal: number, rate: number, start: string, payments: Payment[], day: Date): number => {
    if (!start || !(rate > 0) || !(principal > 0)) return 0;
    const s = localDate(start);
    let interest = 0;
    for (let k = 1; k < 1200; k++) {
        const last = new Date(s.getFullYear(), s.getMonth() + k + 1, 0).getDate();
        const at = new Date(s.getFullYear(), s.getMonth() + k, Math.min(s.getDate(), last));
        if (at > day) break;
        const iso = `${at.getFullYear()}-${String(at.getMonth() + 1).padStart(2, "0")}-${String(at.getDate()).padStart(2, "0")}`;
        const paid = payments.filter((p) => !p.date || p.date < iso).reduce((t, p) => t + p.amount, 0);
        const owed = principal + interest - paid;
        if (owed <= 0) break;
        interest += Math.round((owed * rate) / 12);
    }
    return interest;
};

// The stored payment for a displayed one: the same position if it still matches, else the first identical one (-1: gone).
// A note changed by a sync between drawing and saving must never make Save or Delete hit another row.
export const findPayment = (list: unknown, p: Payment): number => {
    const a = Array.isArray(list) ? (list as FM[]) : [];
    const same = (e: FM | undefined) => !!e && typeof e === "object" && int(e.amount) === p.amount && dateStr(e.date, "") === p.date && String(e.note ?? "") === p.note;
    return same(a[p.index]) ? p.index : a.findIndex((e) => same(e));
};

// Pure: the balance at the end of each year if `pay` goes in every month from the repayment start (or now, if it already began),
// with monthly interest. Stops when paid off, or after 40 years. payoff = "YYYY-MM" of the last payment, "" if it never ends.
export const projectDebt = (d: Debt, pay: number, now: Date): { years: number[]; firstYear: number; payoff: string } => {
    const from = d.start && d.grace ? new Date(d.start + "T00:00:00") : new Date(now.getFullYear(), now.getMonth(), 1);
    let bal = d.balance, y = from.getFullYear(), m = from.getMonth();
    const years: number[] = [bal];   // start of the first year
    const r = d.rate / 12;
    if (pay <= bal * r || bal <= 0) return { years: bal > 0 ? [bal] : [0], firstYear: y, payoff: bal > 0 ? "" : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}` };
    for (let i = 0; i < 480 && bal > 0; i++) {
        bal = Math.max(0, bal * (1 + r) - pay);
        if (bal <= 0) return { years: [...years, 0], firstYear: from.getFullYear(), payoff: `${y}-${String(m + 1).padStart(2, "0")}` };
        if (m === 11) years.push(bal);
        m++; if (m === 12) { m = 0; y++; }
    }
    return { years, firstYear: from.getFullYear(), payoff: "" };
};
