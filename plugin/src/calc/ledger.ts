import { dateStr } from "../format";
import type { FM } from "../data/store";

// Record shape (Ledger Config → `ledger`): { friend, action, amount, date, note }
//   paid_for: you paid, they owe you · paid_by: they paid, you owe them · paid_to_me: they repaid you · paid_to_them: you repaid them
export type Action = "paid_for" | "paid_by" | "paid_to_me" | "paid_to_them";
export const ACTIONS: Action[] = ["paid_for", "paid_by", "paid_to_me", "paid_to_them"];

export interface Rec { friend: string; action: string; amount: number; date: string; note: string; index: number }
export interface Friend { name: string; net: number; activeSince: string | null; records: Rec[] }   // net > 0: they owe you; records newest first
export interface Ledger { friends: Friend[]; oweMe: number; oweThem: number; net: number; count: number }

// Pure. Per friend: the balance, and the date of the oldest amount still open (repayments settle the oldest amounts first).
// Friends: biggest balance first. Same maths as the v2 page (Scripts/calc/ledger.js).
export const buildLedger = (list: unknown): Ledger => {
    const raw = Array.isArray(list) ? list : [];
    const people = new Map<string, Rec[]>();
    raw.forEach((x: unknown, index: number) => {
        const r = (x ?? {}) as FM;
        if (!r.friend) return;
        const rec: Rec = { friend: String(r.friend), action: String(r.action ?? ""), amount: Number(r.amount) || 0, date: dateStr(r.date, ""), note: String(r.note ?? ""), index };
        if (!people.has(rec.friend)) people.set(rec.friend, []);
        people.get(rec.friend)!.push(rec);
    });
    const friends: Friend[] = [];
    let oweMe = 0, oweThem = 0;
    for (const [name, recs0] of people) {
        const recs = recs0.slice().sort((a, b) => a.date.localeCompare(b.date));   // oldest first; same day keeps file order
        const queue: { d: string; a: number; t: "me" | "them" }[] = [];
        const consume = (t: "me" | "them", amt: number) => {
            let rem = amt;
            while (rem > 0 && queue.length && queue[0].t === t) {
                if (queue[0].a <= rem) { rem -= queue[0].a; queue.shift(); } else { queue[0].a -= rem; rem = 0; }
            }
        };
        let me = 0, them = 0;
        for (const r of recs) {
            if (r.action === "paid_for") { me += r.amount; queue.push({ d: r.date, a: r.amount, t: "me" }); }
            else if (r.action === "paid_by") { them += r.amount; queue.push({ d: r.date, a: r.amount, t: "them" }); }
            else if (r.action === "paid_to_me") { me -= r.amount; consume("me", r.amount); }
            else if (r.action === "paid_to_them") { them -= r.amount; consume("them", r.amount); }
        }
        const net = me - them;
        if (net > 0) oweMe += net; else if (net < 0) oweThem -= net;
        friends.push({ name, net, activeSince: queue[0]?.d || null, records: recs.reverse() });
    }
    friends.sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
    return { friends, oweMe, oweThem, net: oweMe - oweThem, count: raw.length };
};

// Redesign S: a friend's balance after each record (oldest first, same day in file order); > 0 = they owe you
const SIGN: Record<string, number> = { paid_for: 1, paid_by: -1, paid_to_me: -1, paid_to_them: 1 };
export const balanceAfter = (recs: Rec[]): Map<Rec, number> => {
    const out = new Map<Rec, number>();
    let b = 0;
    for (const r of [...recs].sort((x, y) => x.date.localeCompare(y.date) || x.index - y.index)) { b += (SIGN[r.action] ?? -1) * r.amount; out.set(r, b); }
    return out;
};
// the record that settles a friend: they pay you back what they owe, or you pay them back
export const settleOf = (f: Friend): { action: Action; amount: number } | null =>
    f.net > 0 ? { action: "paid_to_me", amount: f.net } : f.net < 0 ? { action: "paid_to_them", amount: -f.net } : null;

// The stored record for a displayed one: the same index if it still matches, else the first identical record (-1: gone)
export const findRecord = (list: unknown, r: Rec): number => {
    const arr = Array.isArray(list) ? (list as FM[]) : [];
    const same = (e: FM | undefined) => !!e && String(e.friend) === r.friend && String(e.action) === r.action && Number(e.amount) === r.amount
        && dateStr(e.date, "") === r.date && String(e.note ?? "") === r.note;
    return same(arr[r.index]) ? r.index : arr.findIndex((e) => same(e));
};

export const daysSince = (d: string, now = new Date()): number => {
    const [y, m, dd] = d.split("-").map(Number);
    return Math.max(0, Math.floor((new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() - new Date(y, (m || 1) - 1, dd || 1).getTime()) / 86400000));
};
