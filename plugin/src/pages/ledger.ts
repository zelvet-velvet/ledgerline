import { Notice } from "obsidian";
import { Action, ACTIONS, balanceAfter, buildLedger, daysSince, findRecord, Friend, Rec, settleOf } from "../calc/ledger";
import { FILES, FM } from "../data/store";
import { num, parseNum, shortDate, today } from "../format";
import { StrKey, t } from "../i18n";
import { C, colorFor, h, page } from "../ui";
import { dropRow, figures, homeTop, sec, summary } from "../ui/c";
import { confirmSheet, FormSheet } from "../ui/sheet";
import type { PageCtx, PageDef, PageOut } from "./index";

// Icons (chosen by the user): paying for something = the helping hand upside down (palm down; "They…" mirrored so the hand comes
// from the other side); paying back = a check square. Colour = which way the balance moves.
const ACT: Record<Action, { label: StrKey; tile: StrKey; tileSub: StrKey; icon: string; color: string }> = {
    paid_for: { label: "aPaidFor", tile: "tPaidFor", tileSub: "tPaidForSub", icon: "down", color: C.pos },
    paid_by: { label: "aPaidBy", tile: "tPaidBy", tileSub: "tPaidBySub", icon: "debt", color: C.warn },
    paid_to_me: { label: "aPaidToMe", tile: "tPaidToMe", tileSub: "tPaidToMeSub", icon: "up", color: C.warn },
    paid_to_them: { label: "aPaidToThem", tile: "tPaidToThem", tileSub: "tPaidToThemSub", icon: "square-check,check-square", color: C.pos },
};
const act = (a: string) => ACT[a as Action] ?? { label: "aPaidToMe" as StrKey, tile: "tPaidToMe" as StrKey, tileSub: "tPaidToMeSub" as StrKey, icon: "square-check,check-square", color: C.warn };
const NEW = "__new__";

export const ledgerPage: PageDef = {
    id: "ledger", label: "tabLedger", icon: "handshake",
    render(ctx) {
        const { store, settings } = ctx.plugin;
        const cur = settings.baseCurrency;
        const CFG = store.path(FILES.ledger);
        const L = buildLedger(store.fm(CFG)?.ledger);
        const order = L.friends.map((f) => f.name);
        const tint = (name: string) => colorFor(Math.max(0, order.indexOf(name)));

        // New transaction; `preset` = the friend when opened from a friend page; `pre` = type and amount (Settle up)
        const newTx = (preset?: string, pre?: { action: Action; amount: number }) => {
            const names = L.friends.map((f) => f.name);
            new FormSheet(ctx.app, {
                title: t("newTx"), subtitle: preset, submitText: t("save"),
                fields: [
                    ...(preset ? [] : [
                        { key: "friend", label: t("friend"), type: "select" as const, options: [...names.map((n): [string, string] => [n, n]), [NEW, t("newFriend")] as [string, string]], value: names[0] ?? NEW },
                        { key: "name", label: t("name"), type: "text" as const, placeholder: t("newFriendName"), required: true, showIf: (v: Record<string, string>) => v.friend === NEW },
                    ]),
                    { key: "action", label: t("whoPaid"), type: "tiles", value: pre?.action ?? "paid_for", tiles: ACTIONS.map((a) => ({ value: a, title: t(ACT[a].tile), sub: t(ACT[a].tileSub), icon: ACT[a].icon, color: ACT[a].color })) },
                    { key: "amount", label: t("amount"), type: "number", suffix: cur, placeholder: "0", required: true, value: pre ? pre.amount : "" },
                    { key: "note", label: t("note"), type: "text", placeholder: t("optional") },
                    { key: "date", label: t("date"), type: "date", value: today(), required: true },
                ],
                validate: (v) => (!preset && v.friend === NEW && names.includes(v.name.trim()) ? t("nameTaken", { name: v.name.trim() }) : null),
                onSubmit: async (v) => {
                    const friend = preset ?? (v.friend === NEW ? v.name.trim() : v.friend);
                    const amount = parseNum(v.amount);
                    await store.update(CFG, (f) => {
                        const list = Array.isArray(f.ledger) ? f.ledger : [];
                        list.push({ friend, action: v.action, amount, date: v.date || today(), note: v.note });
                        f.ledger = list;
                    });
                    new Notice(t("savedTx", { friend, what: t(act(v.action).label).toLowerCase(), amount: num(amount), cur }));
                },
            }).open();
        };

        const editTx = (r: Rec) => new FormSheet(ctx.app, {
            title: t("editTx"), subtitle: `${r.friend} · ${t(act(r.action).label)}`, submitText: t("save"),
            fields: [
                { key: "amount", label: t("amount"), type: "number", suffix: cur, value: r.amount, required: true },
                { key: "date", label: t("date"), type: "date", value: r.date, required: true },
                { key: "note", label: t("note"), type: "text", value: r.note, placeholder: t("optional") },
            ],
            onSubmit: async (v) => {
                let ok = false;
                await store.update(CFG, (f) => {
                    const i = findRecord(f.ledger, r);
                    if (i < 0) return;
                    const e = (f.ledger as FM[])[i];
                    e.amount = parseNum(v.amount); e.date = v.date; e.note = v.note;
                    ok = true;
                });
                new Notice(ok ? t("updatedTx", { friend: r.friend, amount: num(parseNum(v.amount)), cur }) : t("txGone"));
            },
            danger: {
                text: t("deleteTx"),
                onTap: async () => {
                    if (!(await confirmSheet(ctx.app, t("deleteTx"), t("deleteTxQ", { amount: num(r.amount), cur, date: r.date || "-" }), t("delete")))) return false;
                    let ok = false;
                    await store.update(CFG, (f) => { const i = findRecord(f.ledger, r); if (i >= 0) { (f.ledger as FM[]).splice(i, 1); ok = true; } });
                    new Notice(ok ? t("deletedTx", { friend: r.friend, amount: num(r.amount), cur }) : t("txGone"));
                    return true;
                },
            },
        }).open();

        const key = ctx.frame.key;
        const friend = key.startsWith("friend:") ? L.friends.find((f) => f.name === key.slice(7)) : undefined;
        if (friend) return friendPage(ctx, friend, () => newTx(friend.name), (p) => newTx(friend.name, p), editTx);
        const all = key.startsWith("history:") ? L.friends.find((f) => f.name === key.slice(8)) : undefined;
        if (all) return historyPage(all, () => newTx(all.name), editTx);
        if (key === "activity") return activityPage(ctx, L, () => newTx(), editTx);
        return firstPage(ctx, L, cur, tint, newTx, editTx);
    },
};

// Readable Ledger: a person's name is set large (display type); what happened is a plain sentence ("Z paid for you"), not a code
// like "Z · THEY PAID"; who owes whom is said in words under the name, the amount needs no sign (colour + words carry it).
const status = (f: Friend) => {
    const d = f.activeSince ? daysSince(f.activeSince) : 0;
    if (f.net === 0) return t("settled");
    const w = f.net > 0 ? t("cOwesYou") : t("cYouOweThem");
    return d ? `${w} · ${t("daysN", { n: d })}` : w;
};
const SAY: Record<Action, StrKey> = { paid_for: "sPaidFor", paid_by: "sPaidBy", paid_to_me: "sPaidToMe", paid_to_them: "sPaidToThem" };
// on a friend's own page the name is already the title: "They paid for you", "You paid for them"
const say = (r: Rec, pronoun = false) => t(SAY[r.action as Action] ?? "sPaidToMe", { name: !pronoun ? r.friend : r.action === "paid_by" || r.action === "paid_to_me" ? t("cThey") : t("cThem") });

const MAX_HOME = 3;   // friend rows on the first page; the rest are one tap deeper (the page fits one screen)
const recLine = (r: Rec) => [r.date ? shortDate(r.date) : t("noDate"), r.note.trim()].filter(Boolean).join(" · ");
// Colour means something: what you owe is loud; what comes back to you is ink.
const owes = (a: string) => a === "paid_by";
const txIcon = (a: string) => (a === "paid_by" ? "debt" : a === "paid_to_me" ? "up" : "down");
const person = (ctx: PageCtx, f: Friend, most: number) => ({ icon: "person", name: true, k: f.name.toUpperCase(), s: status(f), v: num(Math.abs(f.net)), hot: f.net < 0, dim: f.net === 0, beam: f.net / most, onTap: () => ctx.push({ key: "friend:" + f.name, title: f.name }) });
const txRow = (r: Rec, editTx: (r: Rec) => void, pronoun = false) => ({ icon: txIcon(r.action), name: true, k: say(r, pronoun).toUpperCase(), s: recLine(r), v: num(r.amount), hot: owes(r.action), onTap: () => editTx(r) });

// Redesign S (2026-11-05, owner picked from Layouts mocks): who owes what, settled people folded into one row, the last 3 things
// that happened as sentences. Settling is one tap on the person's page.
const firstPage = (ctx: PageCtx, L: ReturnType<typeof buildLedger>, cur: string, _tint: (n: string) => string, newTx: () => void, editTx: (r: Rec) => void): PageOut => {
    const title = t("tabLedger");
    const el = page(title);
    el.addClass("zl-c-stack");
    const open = L.friends.filter((f) => f.net !== 0);
    const settled = L.friends.length - open.length;
    const all = () => ctx.push({ key: "activity", title: t("cAllActivity") });
    homeTop(el, {
        key: "ledger", value: num(Math.abs(L.net)), label: (L.net >= 0 ? t("cOwedAll", { cur }) : t("cOweAll", { cur })),
        right: open.length ? t("cOpenN", { n: open.length }) : t("allSettled"),
        reads: [[t("theyOweMe"), num(L.oweMe)], [t("iOweThem"), num(L.oweThem)]],
    });
    const most = Math.max(1, ...open.map((f) => Math.abs(f.net)));
    const g = h(el, "div", "zl-c-group");
    sec(g, t("openBalances").toUpperCase(), L.count ? all : undefined, t("cAllActivity").toUpperCase());
    if (open.length) figures(g, open.slice(0, MAX_HOME).map((f) => person(ctx, f, most)));
    if (!open.length) figures(g, [{ k: (L.count ? t("allSettled") : t("noTx")).toUpperCase(), s: L.count ? t("nothingOwed") : t("noTxSub"), v: "0", dim: true }]);
    // more people than fit: one row says how many more (and settled ones), into All activity
    const more = Math.max(0, open.length - MAX_HOME);
    const tail = more || settled ? sec(h(el, "div", "zl-c-group zl-c-link"), [more ? t("cMoreN", { n: more }) : "", settled ? t("lSettledN", { n: settled }) : ""].filter(Boolean).join(" · ").toUpperCase(), all, t("cMore").toUpperCase()) : null;
    // the last things that happened, while the room allows (the page fits one screen)
    // recent activity takes the room left (one screen: trim drops its rows first)
    const recent = L.friends.flatMap((f) => f.records).sort((a, b) => b.date.localeCompare(a.date) || b.index - a.index).slice(0, 3);
    let rbox: HTMLElement | null = null;
    if (recent.length) {
        const r = h(el, "div", "zl-c-group");
        sec(r, t("recentActivity").toUpperCase());
        rbox = figures(r, recent.map((x) => txRow(x, editTx)));
    }
    if (tail) el.appendChild(tail.parentElement!);   // the count row sits last, on the bottom bar
    const trim = rbox ? dropRow(rbox, 0) : undefined;
    return { title, el, trim, fab: { icon: "plus", text: t("newTx").toUpperCase(), label: t("newTx"), onTap: () => newTx() } };
};

// every friend (open first, then settled) and every transaction, newest first (C list)
const activityPage = (ctx: PageCtx, L: ReturnType<typeof buildLedger>, newTx: () => void, editTx: (r: Rec) => void): PageOut => {
    const title = t("cAllActivity");
    const el = page(title);
    el.addClass("zl-c-list");
    const g = h(el, "div", "zl-c-group");
    sec(g, t("cPeople").toUpperCase());
    const most = Math.max(1, ...L.friends.map((f) => Math.abs(f.net)));
    figures(g, L.friends.map((f) => person(ctx, f, most)));
    const all = L.friends.flatMap((f) => f.records).sort((a, b) => b.date.localeCompare(a.date) || b.index - a.index);
    const r = h(el, "div", "zl-c-group");
    sec(r, t("recentActivity").toUpperCase());
    figures(r, all.map((x) => txRow(x, editTx)));
    return { title, el, fab: { icon: "plus", text: t("newTx").toUpperCase(), label: t("newTx"), onTap: newTx } };
};

// one friend (one screen): the balance in words → SETTLE UP (the sheet filled with the full amount and the right direction) →
// the latest lines with the balance after each (trimmed to fit; ALL › is the whole history by month)
const monthHead = (d: string) => { const m = /^(\d{4})-(\d{2})/.exec(d); return m ? new Date(Number(m[1]), Number(m[2]) - 1, 1).toLocaleDateString("en", { month: "long", year: "numeric" }) : t("noDate"); };
const newestFirst = (f: Friend) => [...f.records].sort((a, b) => b.date.localeCompare(a.date) || b.index - a.index);
const histRows = (f: Friend, recs: Rec[], editTx: (r: Rec) => void) => {
    const after = balanceAfter(f.records);
    return recs.map((r) => {
        const b = after.get(r) ?? 0;
        return { ...txRow(r, editTx, true), s: [r.date ? shortDate(r.date) : "", r.note.trim(), b < 0 ? t("lBalAfterNeg", { n: num(-b) }) : b > 0 ? t("lBalAfter", { n: num(b) }) : t("lBalAfterZero")].filter(Boolean).join(" · ") };
    });
};
const friendPage = (ctx: PageCtx, f: Friend, newTx: () => void, settle: (p: { action: Action; amount: number }) => void, editTx: (r: Rec) => void): PageOut => {
    const el = page(f.name);
    el.addClass("zl-c-stack");
    const dates = f.records.map((r) => r.date).filter(Boolean).sort();
    summary(el, {
        key: "friend-" + f.name, label: f.net > 0 ? t("lOwesYouN", { name: f.name }) : f.net < 0 ? t("lYouOweN", { name: f.name }) : t("settled"), value: num(Math.abs(f.net)), hot: f.net < 0, dim: f.net === 0,
        items: [[t("lOpenSince"), f.activeSince ? shortDate(f.activeSince) : "-"], [t("last"), dates.length ? shortDate(dates[dates.length - 1]) : "-"], [t("txCount"), String(f.records.length)]],
    });
    const st = settleOf(f);
    if (st) figures(h(el, "div", "zl-c-group"), [{ icon: txIcon(st.action), k: t("lSettleUp").toUpperCase(), s: say({ friend: f.name, action: st.action, amount: st.amount, date: "", note: "", index: -1 }, true), v: num(st.amount), hot: f.net < 0, onTap: () => settle(st) }]);
    const g = h(el, "div", "zl-c-group");
    sec(g, t("recentActivity").toUpperCase(), f.records.length > 1 ? () => ctx.push({ key: "history:" + f.name, title: f.name }) : undefined, t("cAll").toUpperCase());
    const box = figures(g, histRows(f, newestFirst(f), editTx));
    return { title: f.name, el, trim: dropRow(box, 1), fab: { icon: "plus", text: t("newTx").toUpperCase(), label: t("newTx"), onTap: newTx } };
};

// a friend's whole history by month, each line with the balance after it (C list: the growing list scrolls)
const historyPage = (f: Friend, newTx: () => void, editTx: (r: Rec) => void): PageOut => {
    const el = page(f.name);
    el.addClass("zl-c-list");
    const byMonth = new Map<string, Rec[]>();
    for (const r of newestFirst(f)) { const k = r.date.slice(0, 7); if (!byMonth.has(k)) byMonth.set(k, []); byMonth.get(k)!.push(r); }
    for (const [m, recs] of byMonth) {
        const g = h(el, "div", "zl-c-group");
        sec(g, monthHead(m).toUpperCase());
        figures(g, histRows(f, recs, editTx));
    }
    return { title: f.name, el, fab: { icon: "plus", text: t("newTx").toUpperCase(), label: t("newTx"), onTap: newTx } };
};
