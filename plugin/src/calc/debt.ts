import { dateStr, localDate } from "../format";
import type { FM } from "../data/store";

export interface Payment { date: string; amount: number; note: string; index: number }
export interface Debt {
    exists: boolean;
    principal: number;
    rate: number;              // annual, as a fraction (0.00775 = 0.775%)
    start: string;             // YYYY-MM-DD
    monthlyMin: number;
    payments: Payment[];       // file order (index = position in the frontmatter list)
    paid: number;
    balance: number;
    progress: number;          // % of the principal paid
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
    const principal = Number(f.initial_principal) || 0;
    const rate = f.interest_rate === undefined || f.interest_rate === null || f.interest_rate === "" ? DEFAULT_RATE : Number(f.interest_rate) || 0;
    const start = dateStr(f.start_date, "");
    const raw = Array.isArray(f.payments) ? f.payments : f.payments ? [f.payments] : [];
    const payments: Payment[] = raw.map((p: unknown, index: number) => {
        const o = (p ?? {}) as FM;
        return { date: dateStr(o.date, ""), amount: Number(o.amount) || 0, note: String(o.note ?? ""), index };
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
    return {
        exists: !!fm, principal, rate, start, monthlyMin: Number(f.monthly_min_payment) || 0, payments, paid,
        balance: Math.max(0, principal - paid), progress: principal > 0 ? (paid / principal) * 100 : 0,
        daysUntilStart, grace, planAmount, repayment: Number(f.repayment) || planAmount, toInvestment, loanPrep,
    };
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
