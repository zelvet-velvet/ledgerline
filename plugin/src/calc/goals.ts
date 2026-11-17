import { dateStr } from "../format";
import type { FM } from "../data/store";
import { int } from "./money";

export interface Expense { item: string; amount: number; date: string; index: number }
export interface Goal {
    name: string; fundKey: string; emoji: string; amount: number; target: string; expenses: Expense[];
    alloc: number;    // set aside for it from its fund
    spent: number;    // already paid
    cash: number;     // alloc - spent
    pct: number;      // alloc / amount, %
}
// saved: what the fund holds now (its accounts' balance; with no account, the plan's amounts minus what its goals paid out).
// collected: saved + what its goals paid out, the money that fills its goals. planned: what the savings plan put in so far.
// behind: how far collected trails planned (only known when the fund has an account; else collected is the plan).
export interface Fund { key: string; label: string; emoji: string; goals: Goal[]; saved: number; collected: number; planned: number; behind: number; fromAccounts: boolean; target: number; surplus: number }
export interface Goals { funds: Fund[]; goals: Goal[]; totalSaved: number; collected: number; spent: number; remaining: number }

const list = (v: unknown): FM[] => (Array.isArray(v) ? v : v ? [v] : []).filter((x) => x && typeof x === "object") as FM[];

// What the savings plan put into a line so far: each month note's own amount, else the plan default (whole dollars).
export const planSaved = (months: { fm: FM }[], plan: FM, key: string): number =>
    months.reduce((s, m) => s + int(m.fm[key] !== undefined ? m.fm[key] : plan[key]), 0);
// What a line's accounts hold now (Accounts › `line`); null when no account carries that line.
export const lineHeld = (accounts: { line: string; balance: number }[], key: string): number | null => {
    const own = accounts.filter((a) => a.line === key);
    return own.length ? own.reduce((s, a) => s + a.balance, 0) : null;
};

// Pure. Each fund's collected money fills its goals in target-date order (no date = last); what is left is the fund's surplus.
// Same maths as the v2 page (Scripts/calc/goals.js). Owner, 2026-11-17: Accounts is the truth for what is saved, the plan is the
// pace. plannedOf(key) = what the plan put in so far; heldOf(key) = what the fund's accounts hold now, null: no account (the plan
// is all there is). A goal's expense is paid from its fund's account, so the balance has already lost it.
export const buildGoals = (fm: FM | null, plannedOf: (key: string) => number, heldOf: (key: string) => number | null = () => null): Goals => {
    const funds: Fund[] = list(fm?.funds).map((f) => ({ key: String(f.key ?? ""), label: String(f.label ?? f.key ?? ""), emoji: String(f.emoji ?? ""), goals: [], saved: 0, collected: 0, planned: 0, behind: 0, fromAccounts: false, target: 0, surplus: 0 }));
    const goals: Goal[] = list(fm?.goals).map((g) => {
        const expenses = list(g.expenses).map((e, index) => ({ item: String(e.item ?? ""), amount: int(e.amount), date: dateStr(e.date, ""), index }));
        return { name: String(g.name ?? ""), fundKey: String(g.fund ?? ""), emoji: String(g.emoji ?? ""), amount: int(g.goal), target: dateStr(g.target_date, ""), expenses, alloc: 0, spent: expenses.reduce((s, e) => s + e.amount, 0), cash: 0, pct: 0 };
    }).sort((a, b) => (a.target || "9999").localeCompare(b.target || "9999"));
    for (const g of goals) (funds.find((f) => f.key === g.fundKey) ?? funds[0])?.goals.push(g);
    for (const f of funds) {
        const out = f.goals.reduce((s, g) => s + g.spent, 0);
        const held = heldOf(f.key);
        f.planned = int(plannedOf(f.key));
        f.fromAccounts = held !== null;
        f.collected = held !== null ? int(held) + out : f.planned;
        f.saved = f.collected - out;
        f.behind = f.fromAccounts ? Math.max(0, f.planned - f.collected) : 0;
        let pool = f.collected;
        for (const g of f.goals) {
            if (!(g.amount > 0)) { g.alloc = 0; g.pct = 100; continue; }   // a goal of 0 needs nothing: it takes nothing from the fund
            const amount = g.amount;
            g.alloc = Math.min(pool, amount);
            pool -= g.alloc;
            g.pct = (g.alloc / amount) * 100;
        }
        f.surplus = pool;
        f.target = f.goals.reduce((s, g) => s + g.amount, 0);
    }
    for (const g of goals) g.cash = g.alloc - g.spent;
    return {
        funds, goals,
        totalSaved: funds.reduce((s, f) => s + f.saved, 0),
        collected: funds.reduce((s, f) => s + f.collected, 0),
        spent: goals.reduce((s, g) => s + g.spent, 0),
        remaining: funds.reduce((s, f) => s + Math.max(0, f.target - f.collected), 0),
    };
};

// The stored expense for a displayed one: same position if it still matches, else the first identical one (-1: gone)
export const findExpense = (arr: unknown, x: Expense): number => {
    const a = Array.isArray(arr) ? (arr as FM[]) : [];
    const same = (e: FM | undefined) => !!e && String(e.item ?? "") === x.item && int(e.amount) === x.amount && dateStr(e.date, "") === x.date;
    return same(a[x.index]) ? x.index : a.findIndex((e) => same(e));
};

// ---- Redesign S: is each goal on track? A fund gets its monthly amount on each month's first day; its savings fill its goals in
// date order. By a goal's date the fund holds saved + monthly × (month firsts after today up to that date); the goal is short by
// what that leaves missing of it and every earlier goal. perMonth = the monthly amount that would make it (0: already covered).
export interface Track { short: number; perMonth: number; months: number }
const mIdx = (d: string) => Number(d.slice(0, 4)) * 12 + Number(d.slice(5, 7)) - 1;
export const monthsTo = (from: string, to: string): number => Math.max(0, mIdx(to) - mIdx(from));
export const trackFund = (f: Fund, monthly: number, today: string): Map<Goal, Track> => {
    const out = new Map<Goal, Track>();
    let need = 0;
    for (const g of f.goals) {
        need += g.amount;
        if (!g.target) continue;   // no date: nothing to be late for
        const months = monthsTo(today, g.target);
        const short = Math.max(0, need - (f.collected + monthly * months));
        const gap = Math.max(0, need - f.collected);
        out.set(g, { short, months, perMonth: !gap ? 0 : months ? Math.ceil(gap / months) : gap });
    }
    return out;
};
// the month (YYYY-MM) the fund holds all its goals at this monthly amount; "" = never (no monthly amount) or no goals
export const doneBy = (f: Fund, monthly: number, today: string): string => {
    const gap = f.target - f.collected;
    if (!f.goals.length) return "";
    const n = gap <= 0 ? 0 : monthly > 0 ? Math.ceil(gap / monthly) : -1;
    if (n < 0) return "";
    const i = mIdx(today) + n;
    return `${Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, "0")}`;
};
