import { dateStr } from "../format";
import type { FM } from "../data/store";

// Accounts (Config/Accounts.md): where the money really is, by name only (never account numbers). A balance is the sum of its
// entries; nothing is overwritten: a wrong balance gets an "adjust" entry. Amounts are whole TWD (integers).
export type EntryKind = "opening" | "adjust" | "expense" | "deposit" | "transfer" | "buy" | "sell" | "fee";
export const KINDS: EntryKind[] = ["opening", "adjust", "expense", "deposit", "transfer", "buy", "sell", "fee"];
export interface Account { key: string; label: string; bank: string; line: string; bucket: string; target: number }
export interface Entry { date: string; account: string; amount: number; kind: EntryKind; note: string; planned: boolean; trade?: string; index: number }   // trade = id of the Invest trade it pays for
export interface AccountRow extends Account { balance: number; planned: number; entries: Entry[] }   // planned = part not moved yet
export interface Accounts { list: AccountRow[]; banks: { bank: string; total: number }[]; total: number; planned: number; unknown: Entry[] }

const arr = (v: unknown): FM[] => (Array.isArray(v) ? v : v ? [v] : []).filter((x) => x && typeof x === "object") as FM[];
// whole dollars only: a fraction in the note is a typing mistake, not money the app should carry
const int = (v: unknown): number => { const n = Number(v); return Number.isFinite(n) ? Math.round(n) : 0; };

export const buildAccounts = (fm: FM | null, upTo?: string): Accounts => {
    const accounts: Account[] = arr(fm?.accounts).map((a) => ({
        key: String(a.key ?? ""), label: String(a.label ?? a.key ?? ""), bank: String(a.bank ?? ""),
        line: String(a.line ?? ""), bucket: String(a.bucket ?? ""), target: int(a.target),
    })).filter((a) => a.key);
    const entries: Entry[] = arr(fm?.entries).map((e, index) => ({
        date: dateStr(e.date, ""), account: String(e.account ?? ""), amount: int(e.amount),
        kind: (KINDS.includes(e.kind as EntryKind) ? e.kind : "adjust") as EntryKind, note: String(e.note ?? ""), planned: e.planned === true, ...(e.trade ? { trade: String(e.trade) } : {}), index,
    })).filter((e) => !upTo || !e.date || e.date <= upTo);
    const list: AccountRow[] = accounts.map((a) => {
        const own = entries.filter((e) => e.account === a.key).sort((x, y) => y.date.localeCompare(x.date) || y.index - x.index);
        return { ...a, entries: own, balance: own.reduce((s, e) => s + e.amount, 0), planned: own.filter((e) => e.planned).reduce((s, e) => s + e.amount, 0) };
    });
    const banks: { bank: string; total: number }[] = [];
    for (const a of list) { const b = banks.find((x) => x.bank === a.bank); if (b) b.total += a.balance; else banks.push({ bank: a.bank, total: a.balance }); }
    const keys = new Set(accounts.map((a) => a.key));
    return {
        list, banks, total: list.reduce((s, a) => s + a.balance, 0), planned: list.reduce((s, a) => s + a.planned, 0),
        unknown: entries.filter((e) => !keys.has(e.account)),   // entries for an account that is not listed: shown, never lost
    };
};

// Redesign S: an account's balance after each entry (oldest first, same day in file order)
export const balanceAfter = (entries: Entry[]): Map<Entry, number> => {
    const out = new Map<Entry, number>();
    let b = 0;
    for (const e of [...entries].sort((x, y) => x.date.localeCompare(y.date) || x.index - y.index)) { b += e.amount; out.set(e, b); }
    return out;
};
// what the money is for: everyday (no plan line, no bucket), saving (a savings-plan line), investing cash (an Invest bucket)
export type Purpose = "everyday" | "saving" | "investing";
export const purposeOf = (a: Account): Purpose => (a.bucket ? "investing" : a.line ? "saving" : "everyday");
