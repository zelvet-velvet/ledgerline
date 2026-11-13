import { AccountRow, balanceAfter, buildAccounts, Entry, EntryKind, Purpose, purposeOf } from "../calc/accounts";
import { shortDate, num } from "../format";
import { StrKey, t } from "../i18n";
import { h, page } from "../ui";
import { figures, gridOf, sec, summary, tileGrid } from "../ui/c";
import { nameSprite } from "../ui/pixel";
import type { PageCtx, PageOut } from "./index";

// P2 Accounts (read-only): where the money is, from Config/Accounts.md. Opened from Net worth (Debt) and from Goals.
// Frames: "accounts" (every account by bank) and "account:<key>" (one account's entries, newest first).
export const ACCOUNTS_FILE = "Accounts";
const KIND: Record<EntryKind, { label: StrKey; icon: string }> = {
    opening: { label: "acOpening", icon: "wallet" }, adjust: { label: "acAdjust", icon: "swap" }, expense: { label: "acExpense", icon: "receipt" },
    deposit: { label: "acDeposit", icon: "down" }, transfer: { label: "acTransfer", icon: "swap" }, buy: { label: "acBuy", icon: "up" },
    sell: { label: "acSell", icon: "down" }, fee: { label: "acFee", icon: "receipt" },
};
const signed = (n: number) => `${n < 0 ? "−" : n > 0 ? "+" : ""}${num(Math.abs(n))}`;
const load = (ctx: PageCtx) => buildAccounts(ctx.plugin.store.fm(ctx.plugin.store.path(ACCOUNTS_FILE)));
const entryRow = (e: Entry) => ({
    icon: KIND[e.kind].icon, k: (t(KIND[e.kind].label) + (e.planned ? ` · ${t("acPlanned")}` : "")).toUpperCase(),
    s: [e.date ? shortDate(e.date) : t("noDate"), e.note].filter(Boolean).join(" · "), v: signed(e.amount), hot: e.amount < 0, dim: e.planned,
});

// Redesign S (2026-11-05, owner picked from Layouts mocks): accounts by what the money is for, not by bank (the bank is the
// small line). Free money first; an account's entries by month with the balance after each.
const GROUPS: [Purpose, StrKey][] = [["everyday", "acEveryday"], ["saving", "acSaving"], ["investing", "acInvesting"]];
const accRow = (ctx: PageCtx, a: AccountRow) => ({
    icon: "wallet", name: true, k: a.label.toUpperCase(), v: num(a.balance), hot: a.balance < 0,
    s: [a.bank, a.target > 0 ? t("acOfTarget", { pct: Math.floor((a.balance / a.target) * 100), target: num(a.target) }) : a.planned ? t("acPlannedN", { n: num(a.planned) }) : ""].filter(Boolean).join(" · "),
    onTap: () => ctx.push({ key: "account:" + a.key, title: a.label }),
});

// Accounts (one screen): the total, free / set aside / planned → one tile grid per purpose, each account its picture and balance
// (two across, an odd last tile takes the row; past 4, the last tile is "+N", that purpose's list page) → entries with no account, if any.
const accTile = (ctx: PageCtx, a: AccountRow) => ({
    icon: nameSprite(a.label, a.bucket ? "invest" : /loan|debt/i.test(a.label) ? "debt" : "wallet"), k: a.label.toUpperCase(), v: num(a.balance),
    s: a.target > 0 ? t("acOfTarget", { pct: Math.floor((a.balance / a.target) * 100), target: num(a.target) }) : a.planned ? t("acPlannedN", { n: num(a.planned) }) : undefined,
    hot: a.balance < 0, dim: !a.balance, onTap: () => ctx.push({ key: "account:" + a.key, title: a.label }),
});
export const accountsPage = (ctx: PageCtx): PageOut => {
    const A = load(ctx), cur = ctx.plugin.settings.baseCurrency;
    const key = ctx.frame.key, only = key.startsWith("accounts:") ? key.slice(9) as Purpose : null;
    const title = only ? t(GROUPS.find(([p]) => p === only)?.[1] ?? "acTitle") : t("acTitle");
    const el = page(title);
    if (only) {   // one purpose, every account (C list)
        el.addClass("zl-c-list");
        const g = h(el, "div", "zl-c-group");
        if ((only as string) === "unknown") figures(g, A.unknown.map((e) => ({ ...entryRow(e), k: e.account.toUpperCase() })));
        else figures(g, A.list.filter((a) => purposeOf(a) === only).map((a) => accRow(ctx, a)));
        return { title, el };
    }
    el.addClass("zl-c-stack");
    const free = A.list.filter((a) => purposeOf(a) === "everyday").reduce((s, a) => s + a.balance, 0);
    summary(el, { key: "accounts", label: t("acTotal", { cur }), value: num(A.total), items: [[t("acFree"), num(free)], [t("acSetAside"), num(A.total - free)], [t("acPlanned"), num(A.planned)]] });
    if (!A.list.length) { h(el, "div", "zl-c-note", t("acNone")); return { title, el }; }
    for (const [p, label] of GROUPS) {
        const list = A.list.filter((a) => purposeOf(a) === p);
        if (!list.length) continue;
        const g = h(el, "div", "zl-c-group");
        sec(g, `${t(label)} · ${num(list.reduce((s, a) => s + a.balance, 0))}`.toUpperCase());
        const all = () => ctx.push({ key: "accounts:" + p, title: t(label) });
        tileGrid(g, gridOf(list.map((a) => accTile(ctx, a)), 4, (n) => ({ icon: "list", k: t("cMore").toUpperCase(), v: `+${n}`, onTap: all })), 2);
    }
    if (A.unknown.length) sec(h(el, "div", "zl-c-group zl-c-link"), t("acUnknown").toUpperCase() + ` · ${A.unknown.length}`, () => ctx.push({ key: "accounts:unknown", title: t("acUnknown") }), t("cMore").toUpperCase());
    return { title, el };
};

const monthHead = (d: string) => { const m = /^(\d{4})-(\d{2})/.exec(d); return m ? new Date(Number(m[1]), Number(m[2]) - 1, 1).toLocaleDateString("en", { month: "long", year: "numeric" }) : t("noDate"); };
export const accountPage = (ctx: PageCtx, key: string): PageOut | null => {
    const a = load(ctx).list.find((x) => x.key === key);
    if (!a) return null;
    const el = page(a.label);
    el.addClass("zl-c-list");
    summary(el, { key: "account-" + a.key, label: `${a.bank} · ${a.label}`, value: num(a.balance), hot: a.balance < 0,
        items: [[t("cTarget"), a.target > 0 ? `${num(a.target)} · ${Math.floor((a.balance / a.target) * 100)}%` : "-"], [t("acPlanned"), num(a.planned)], [t("txCount"), String(a.entries.length)]] });
    const after = balanceAfter(a.entries);
    const byMonth = new Map<string, Entry[]>();
    for (const e of a.entries) { const k = e.date.slice(0, 7); if (!byMonth.has(k)) byMonth.set(k, []); byMonth.get(k)!.push(e); }
    for (const [m, list] of byMonth) {
        const g = h(el, "div", "zl-c-group");
        sec(g, monthHead(m).toUpperCase());
        figures(g, list.map((e) => { const r = entryRow(e); return { ...r, s: [r.s, t("acThen", { n: num(after.get(e) ?? 0) })].join(" · ") }; }));
    }
    return { title: a.label, el };
};
