import { Notice } from "obsidian";
import { BudgetRow, computeMonth, investBuckets, monthIncome, slug, spentOnDay } from "../calc/log";
import { FILES, FM } from "../data/store";
import { MONTHS, num, parseNum, shortDate, today } from "../format";
import { t } from "../i18n";
import { C, empty, group, h, hero, page, row } from "../ui";
import { bigLabel, bline, board, budgetBar, dragBoard, figures, reads, sec, summary, waffle } from "../ui/c";
import { openPad } from "./amount";
import { notchFor } from "../ui/scrub";
import { spriteFor } from "../ui/pixel";
import { confirmSheet, FormSheet, MonthSheet } from "../ui/sheet";
import { Flap } from "../ui/flap";
import { dayAmountPage, dayPage, expenseSheet, itemGroupPage, itemsPage } from "./day";
import type { PageCtx, PageDef, PageOut } from "./index";
import type { TabId } from "../settings";

const FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const cap = (s: string) => { const x = String(s).replace(/_/g, " "); return x.charAt(0).toUpperCase() + x.slice(1); };
const LEVEL = { ok: C.pos, warn: C.warn, over: C.neg };

export const logPage: PageDef = {
    id: "log", label: "tabLog", icon: "calendar-days",
    render(ctx) {
        const { store, settings } = ctx.plugin;
        const cur = settings.baseCurrency;
        const sel = ctx.plugin.logMonth;
        const label = `${FULL[sel.month]} ${sel.year}`;
        const key = ctx.frame.key;
        if (key.startsWith("day:")) return dayPage(ctx, key.slice(4));
        if (key.startsWith("amt:") || key.startsWith("amt1:")) return dayAmountPage(ctx, key);
        if (key === "items") return itemsPage(ctx);
        if (key.startsWith("items:")) return itemGroupPage(ctx, Number(key.slice(6)));
        const { monthPath, month, days, plan, inc, daily, fixed, M } = store.monthData(sel.year, sel.month);

        const gotoMonth = (y: number, m: number) => { ctx.plugin.logMonth = { year: y, month: m }; ctx.goTab("log"); ctx.redraw(); };
        const step = (d: -1 | 0 | 1) => {
            if (d === 0) return pickMonth();
            const m = sel.month + d;
            gotoMonth(sel.year + Math.floor(m / 12), (m + 12) % 12);
        };
        const pickMonth = () => new MonthSheet(ctx.app, t("chooseMonth"), sel, gotoMonth).open();


        // a month with no notes yet: the same home page, blank (board "-", empty readouts and waffle), still dragged to change month
        const blank = !month && !days.length;
        if (blank && key !== "root") return { title: label, el: page(label) };


        // writes to this month's note (it must exist: it is created with the month's first daily note)
        const writeMonth = async (fn: (f: FM) => void): Promise<boolean> => {
            if (!month) { new Notice(t("needMonth", { month: label })); return false; }
            await store.update(monthPath, fn);
            return true;
        };
        // every amount on Log's pages is typed on the pad page (Design Rules: entering a number is a full page)
        const editAmount = (title: string, value: number, save: (n: number) => Promise<boolean | void>, _neg = false, note?: string) =>
            openPad(ctx, { title, sub: label, current: value, cur, setOnly: true, note, save: async (n) => { await save(n); } });

        const x = { ctx, cur, label, month, M, inc, plan, writeMonth, editAmount };
        if (key === "income") return incomePage(x);
        if (key === "savings") return savingsPage(x);
        if (key === "fixed") return fixedPage(x);
        if (key.startsWith("fixed:")) { const r = M.fixedRows.find((f) => f.prop === key.slice(6)); if (r) return fixedItemPage(x, r); }
        if (key === "extra") return extraPage(x);
        if (key.startsWith("extra:")) { const r = M.extras.find((e) => e.prop === key.slice(6)); if (r) return extraItemPage(x, r); }
        if (key === "month") return thisMonthPage(x, fixed.length);
        if (key.startsWith("budget:")) { const b = M.budget[Number(key.slice(7))]; if (b) return budgetPage(x, b, days); }

        // ---- first page (readability redesign): the flip-dot board with what is left (drag it to change month), Spent / Left
        // today as split-flaps, the daily budget as lines, and This month as two rows; the groups spread down to the bottom bar
        const el = page(label);
        el.addClass("zl-c-stack");
        const now = new Date();
        const isNow = sel.year === now.getFullYear() && sel.month === now.getMonth();
        const dim = new Date(sel.year, sel.month + 1, 0).getDate(), daysLeft = dim - now.getDate() + 1;
        const fab = { icon: "plus", text: t("cAddExpense").toUpperCase(), hint: t("today").toUpperCase(), label: t("cAddExpense"), onTap: () => expenseSheet(ctx) };
        const top0 = h(el, "div", "zl-c-group zl-c-top");
        const b = board(top0, "log", blank ? "-" : num(M.remaining));
        dragBoard(top0, b, (d) => step(d), () => true);
        const fmtM = (d: number) => { const m = sel.month + d; return MONTHS[(m + 12) % 12]; };
        const fact = !blank && isNow ? t("cADay", { n: num(Math.max(0, M.remaining) / Math.max(1, daysLeft)) }) : `‹ ${fmtM(-1)} · ${fmtM(1)} ›`;
        bigLabel(top0, blank ? t("cNoNotes") : t("cLeftMonth"), fact);
        if (blank) {
            reads(top0, [[t("cMonth"), "log-r1", "-"], [t("saved"), "log-r2", "-"]]);
            return { title: label, el, fab };
        }
        const tq = M.budget.reduce((s, x) => s + x.quota, 0), ts = M.budget.reduce((s, x) => s + x.spent, 0);
        if (isNow) {
            const todayLog = days.find((d) => d.name === today());
            const spentToday = todayLog ? spentOnDay(todayLog.fm) : 0;
            const perDay = Math.max(0, tq - ts + spentToday) / Math.max(1, daysLeft);
            reads(top0, [[t("cSpentToday"), "log-r1", num(spentToday)], [t("cLeftToday"), "log-r2", num(Math.round(perDay - spentToday))]]);
        } else reads(top0, [[t("cMonth"), "log-r1", t("cClosed")], [t("saved"), "log-r2", num(M.saved)]]);

        if (M.budget.length) {
            const g = h(el, "div", "zl-c-group");
            sec(g, t("cDailyBudget").toUpperCase());
            for (const x of M.budget) {
                const over = x.remain < 0;
                bline(g, { name: x.item.name, spent: x.spent, quota: x.quota, pace: 0, hot: over,   // no pace tick: the words already say what is left
                    value: over ? t("cOverBy", { n: num(-x.remain) }) : num(x.remain), of: over ? t("cOfN", { n: num(x.quota) }) : t("cLeftOf", { n: num(x.quota) }),
                    onTap: () => ctx.push({ key: "budget:" + x.index, title: x.item.name }) });
            }
        }
        // This month: the salary plan (it must add up to the salary; a gap is said in loud words) and the bills and one-offs
        const g = h(el, "div", "zl-c-group");
        sec(g, t("cThisMonth").toUpperCase());
        const gap = M.alloc.gap, open = () => ctx.push({ key: "month", title: t("cThisMonth") });
        const ne = M.extras.length;
        figures(g, [
            { icon: "wallet", k: t("cSalaryPlan"), s: gap ? t("cPlanGap", { gap: num(Math.abs(gap)), dir: gap < 0 ? t("cPlanOver") : t("cPlanUnder") }) : t("cPlanAddsUp"), v: gap ? num(Math.abs(gap)) : "", hot: gap !== 0, onTap: open },
            { icon: "receipt", k: t("cBillsOneOffs"), s: t(ne === 1 ? "cBillsSub" : "cBillsSubN", { p: M.paidCount, n: fixed.length, e: ne }), v: num(M.fixedTotal + M.extraTotal), onTap: open },
        ]);
        return { title: label, el, fab };
    },
};

interface X {
    ctx: PageCtx; cur: string; label: string; month: FM | null;
    M: ReturnType<typeof computeMonth>; inc: ReturnType<typeof monthIncome>; plan: FM;
    writeMonth(fn: (f: FM) => void): Promise<boolean>;
    editAmount(title: string, value: number, save: (n: number) => Promise<boolean | void>, allowNegative?: boolean, note?: string): void;
}
const del = (o: FM, k: string, key: string) => { const m = o[k] as FM | undefined; if (m) { delete m[key]; if (!Object.keys(m).length) delete o[k]; } };

// ---- This month (readability redesign; replaces the Income / Savings / Fixed / Extra sub pages as the way in, they stay one
// tap deeper): the salary as a split-flap, the salary plan as a stacked bar with a row per line and the sum check, the fixed bills
// with tick boxes, the one-off spending; + adds a one-off
const thisMonthPage = (x: X, nFixed: number): PageOut => {
    const { ctx, cur, label, M, inc } = x;
    const { store } = ctx.plugin;
    const el = page(t("cThisMonth"));
    el.addClass("zl-c-list");
    const top = h(el, "div", "zl-c-group");
    const sal = h(top, "button", "zl-read zl-tm-sal");
    h(sal, "span", "zl-read-k", t("cSalaryMonth"));
    const f = new Flap("md", 6);
    sal.appendChild(f.el);
    f.set(num(inc.total));
    sal.addEventListener("click", (e) => { e.preventDefault(); ctx.push({ key: "income", title: t("income") }); });
    // the plan lines, living first; each a shade of ink stepping down, the same shade as its key square
    const goalFunds = (Array.isArray(store.fm(store.path(FILES.goals))?.funds) ? (store.fm(store.path(FILES.goals))!.funds as FM[]) : []).map((g) => String(g.key));
    const lines: [string, number, TabId | null][] = [[t("living"), M.alloc.living, null], ...M.savings.map(([k, v]): [string, number, TabId | null] =>
        [cap(k), Number(v) || 0, k === "investment" ? "invest" : k === "student_loan" ? "debt" : goalFunds.includes(k) ? "goals" : null])];
    const n = lines.length, shade = (i: number) => `color-mix(in srgb, var(--zl-text) ${n > 1 ? Math.round(100 - (i * 100) / (n - 1)) : 100}%, var(--zl-dim))`;
    const bar = h(top, "div", "zl-tm-bar");
    lines.forEach(([, v], i) => { const s = h(bar, "span"); s.style.flex = String(Math.max(0, v)); s.style.background = shade(i); });
    const gap = M.alloc.gap;
    const list = h(top, "div", "zl-tm-lines");
    lines.forEach(([k, v, owner], i) => {
        const r = h(list, owner ? "button" : "div", "zl-tm-line");
        const kk = h(r, "span", "zl-tm-k");
        h(kk, "i").style.background = shade(i);
        kk.appendChild(document.createTextNode(k));
        h(r, "strong", gap ? "is-hot" : "", num(v));
        if (owner) r.addEventListener("click", (e) => { e.preventDefault(); ctx.goTab(owner); });
    });
    h(top, "p", "zl-c-note" + (gap ? " is-hot" : ""), gap ? t("cPlanCheckOff", { gap: num(Math.abs(gap)), dir: gap < 0 ? t("cPlanOver") : t("cPlanUnder") }) : t("cPlanCheck"));

    if (nFixed) {
        const g = h(el, "div", "zl-c-group");
        sec(g, t("cFixedBills", { p: M.paidCount, n: nFixed }).toUpperCase());
        for (const r of M.fixedRows) {
            const on = r.paid !== 0;
            const row = h(g, "div", "zl-tm-bill" + (on ? "" : " is-off"));
            const box = h(row, "button", "zl-tick" + (on ? " is-on" : ""));
            box.setAttribute("aria-label", r.item.name);
            box.addEventListener("click", (e) => { e.preventDefault(); void setPaid(x, r, !on); });
            const nm = h(row, "button", "zl-tm-bn", r.item.name);
            nm.addEventListener("click", (e) => { e.preventDefault(); ctx.push({ key: "fixed:" + r.prop, title: r.item.name }); });
            h(row, "strong", "", num(r.paid || r.def));
        }
    }
    const og = h(el, "div", "zl-c-group");
    sec(og, t("cOneOffs").toUpperCase());
    if (!M.extras.length) h(og, "p", "zl-c-note", t("cNoOneOffs"));
    for (const e of M.extras) {
        const r = h(og, "button", "zl-tm-line");
        const kk = h(r, "span", "zl-tm-k", cap(e.prop));
        if (e.days.length) h(kk, "span", "zl-tm-d", " " + shortDate(e.days[e.days.length - 1].name));
        h(r, "strong", "", num(e.total));
        r.addEventListener("click", (ev) => { ev.preventDefault(); ctx.push({ key: "extra:" + e.prop, title: cap(e.prop) }); });
    }
    const add = () => new FormSheet(ctx.app, {
        title: t("cAddOneOff"), subtitle: label, submitText: t("save"),
        fields: [{ key: "name", label: t("name"), type: "text", required: true }, { key: "amount", label: t("amount"), type: "number", suffix: cur, required: true }],
        validate: (v) => (v.amount === "" || isNaN(parseNum(v.amount)) ? t("invalidNumber") : null),
        onSubmit: async (v) => {
            const k = slug(v.name), amount = parseNum(v.amount);
            if (!(await x.writeMonth((f) => { const e = { ...((f.extra_expenses as FM) ?? {}) }; e[k] = amount + (Number(e[k]) || 0); f.extra_expenses = e; }))) return false;
            new Notice(t("savedX", { name: v.name.trim(), amount: num(amount), cur }));
        },
    }).open();
    return { title: t("cThisMonth"), el, fab: { icon: "plus", text: t("cAddOneOff").toUpperCase(), label: t("cAddOneOff"), onTap: add } };
};

// ---- income: this month's amounts; + adds a one-off, a yearly bonus, or changes the salary from this month on
const incomePage = (x: X): PageOut => {
    const { ctx, cur, label, inc } = x;
    const { store } = ctx.plugin;
    const el = page(t("income"));
    hero(el, { label: t("totalIncome"), value: num(inc.total), unit: cur, color: C.pos });
    if (!inc.rows.length) empty(el, { icon: "arrow-down-to-line", title: t("noIncome") });
    const g = group(el);
    for (const r of inc.rows) {
        const name = cap(r.label);
        const write = (val: number) => x.writeMonth((f) => {
            if (r.kind === "extra") { f.extra_income = { ...((f.extra_income as FM) ?? {}), [r.key]: val }; return; }
            const ov = { ...((f.income_override as FM) ?? {}) };
            if (val === r.base) delete ov[r.key]; else ov[r.key] = val;
            if (Object.keys(ov).length) f.income_override = ov; else delete f.income_override;
        });
        const edit = () => new FormSheet(ctx.app, {
            title: name, subtitle: r.kind === "extra" ? label : `${label} · ${t("thisMonthOnly").toLowerCase()}`, submitText: t("save"),
            fields: [{ key: "v", label: t("amount"), type: "number", suffix: cur, value: r.amount }],
            validate: (v) => (v.v === "" || isNaN(parseNum(v.v)) ? t("invalidNumber") : null),
            onSubmit: async (v) => { if (!(await write(parseNum(v.v)))) return false; new Notice(t("savedX", { name, amount: num(parseNum(v.v)), cur })); },
            danger: {
                text: r.kind === "extra" ? t("removeIncome") : t("skipMonth"),
                onTap: async () => {
                    if (r.kind === "extra") { if (!(await x.writeMonth((f) => del(f, "extra_income", r.key)))) return false; new Notice(t("removedX", { name })); }
                    else { if (!(await write(0))) return false; new Notice(t("skippedX", { name, month: label })); }
                    return true;
                },
            },
        }).open();
        const tag = r.kind === "extra" ? t("oneOff") : r.kind === "bonus" ? t("recurringBonus") : r.overridden ? (r.amount === 0 ? t("skipped") : t("thisMonthOnly")) : undefined;
        row(g, { title: name, sub: tag, value: num(r.amount), valueColor: r.amount ? C.pos : C.faint, chevron: true, onTap: edit });
    }
    const add = () => new FormSheet(ctx.app, {
        title: t("addIncome"), subtitle: label, submitText: t("save"),
        fields: [
            { key: "kind", label: t("incomeKind"), type: "tiles", value: "extra", tiles: [
                { value: "extra", title: t("kOneOff"), sub: t("kOneOffSub"), icon: "plus", color: C.pos },
                { value: "bonus", title: t("kBonus"), sub: t("kBonusSub"), icon: "calendar", color: C.pos },
                { value: "base", title: t("kBase"), sub: t("kBaseSub"), icon: "pencil", color: C.accent },
            ] },
            { key: "name", label: t("name"), type: "text", required: true, showIf: (v) => v.kind !== "base" },
            { key: "which", label: t("name"), type: "select", options: inc.rows.filter((r) => r.kind === "base").map((r): [string, string] => [r.key, cap(r.label)]), showIf: (v) => v.kind === "base" },
            { key: "bmonth", label: t("whichMonth"), type: "select", value: String(ctx.plugin.logMonth.month + 1), options: MONTHS.map((m, i): [string, string] => [String(i + 1), m]), showIf: (v) => v.kind === "bonus" },
            { key: "amount", label: t("amount"), type: "number", suffix: cur, required: true },
        ],
        onSubmit: async (v) => {
            const amount = parseNum(v.amount);
            if (v.kind === "extra") {
                const k = slug(v.name);
                if (!(await x.writeMonth((f) => { const e = { ...((f.extra_income as FM) ?? {}) }; e[k] = amount + (Number(e[k]) || 0); f.extra_income = e; }))) return false;
                new Notice(t("savedX", { name: v.name, amount: num(amount), cur }));
            } else if (v.kind === "bonus") {
                const m = Number(v.bmonth);
                await store.update(store.path(FILES.income), (f) => {
                    const list = (Array.isArray(f.bonuses) ? f.bonuses : f.bonuses ? [f.bonuses] : []).filter((b: FM) => b && slug(String(b.name)) !== slug(v.name));
                    list.push({ name: v.name.trim(), month: m, amount });
                    f.bonuses = list;
                });
                new Notice(t("bonusSaved", { name: v.name.trim(), month: MONTHS[m - 1], amount: num(amount), cur }));
            } else {
                const r = inc.rows.find((y) => y.key === v.which);
                if (!r) return false;
                const cutoff = ctx.plugin.logMonth.year * 12 + ctx.plugin.logMonth.month;
                for (const n of store.monthNotes()) {   // earlier months keep what they had
                    if (n.year * 12 + n.month - 1 >= cutoff || ((n.fm.income_override as FM | undefined)?.[r.key]) !== undefined) continue;
                    await store.update(n.path, (f) => { f.income_override = { ...((f.income_override as FM) ?? {}), [r.key]: r.base }; });
                }
                await store.update(store.path(FILES.income), (f) => { f[r.key] = amount; });
                new Notice(t("baseChanged", { name: cap(r.label), from: num(r.base), to: num(amount), cur, month: label }));
            }
        },
    }).open();
    return { title: t("income"), el, fab: { icon: "plus", text: t("addIncome").toUpperCase(), label: t("addIncome"), onTap: add } };
};

// ---- savings: each bucket opens the tab that owns it; this month's investment buckets
const savingsPage = (x: X): PageOut => {
    const { ctx, cur, M } = x;
    const { store } = ctx.plugin;
    const el = page(t("savings"));
    hero(el, { label: t("setAsideMonth"), value: num(M.saved), unit: cur, color: C.info });
    const goalFunds = (Array.isArray(store.fm(store.path(FILES.goals))?.funds) ? (store.fm(store.path(FILES.goals))!.funds as FM[]) : []).map((f) => String(f.key));
    const g = group(el);
    row(g, { title: t("living"), sub: t("livingSub"), value: num(M.alloc.living), chevron: false });
    for (const [k, v] of M.savings) {
        const owner = k === "investment" ? "invest" : k === "student_loan" ? "debt" : goalFunds.includes(k) ? "goals" : null;
        row(g, { title: cap(k), value: num(v), valueColor: C.info, chevron: !!owner, onTap: owner ? () => ctx.goTab(owner) : undefined });
    }
    const plan = Number(M.savings.find(([k]) => k === "investment")?.[1]) || 0;
    const sel = ctx.plugin.logMonth;
    const buckets = investBuckets(store.fm(store.path(FILES.invest)), plan, `${sel.year}-${String(sel.month + 1).padStart(2, "0")}`);
    if (buckets) {
        const bg = group(el, t("investThisMonth"));
        for (const b of buckets) {
            const hit = b.target > 0 && b.bought >= b.target;
            row(bg, { title: b.label, value: `${num(Math.max(0, b.bought))} / ${num(b.target)}`, valueColor: hit ? C.pos : undefined, progress: [b.target > 0 ? (Math.max(0, b.bought) / b.target) * 100 : 0, C.pos], chevron: true, onTap: () => ctx.goTab("invest") });
        }
    }
    return { title: t("savings"), el };
};

// ---- fixed expenses: tick to mark paid (at the default amount); a row opens its page
const setPaid = async (x: X, r: ReturnType<typeof computeMonth>["fixedRows"][number], on: boolean, amount?: number) => {
    if (!(await x.writeMonth((f) => { f[r.prop] = on ? amount ?? r.def : 0; }))) return;
    new Notice(on ? t("markedPaid", { name: r.item.name }) : t("markedUnpaid", { name: r.item.name }));
};
const fixedPage = (x: X): PageOut => {
    const { ctx, cur, M } = x;
    const el = page(t("fixedExpenses"));
    hero(el, { label: t("fixedThisMonth"), value: num(M.fixedTotal), unit: cur, color: C.neg, sub: t("paidN", { n: M.paidCount, m: M.fixedRows.length }) });
    const g = group(el);
    for (const r of M.fixedRows) {
        row(g, {
            check: { on: r.paid !== 0, color: C.pos, onToggle: (on) => { void setPaid(x, r, on); } },
            title: r.item.name, value: num(r.paid || r.def), valueColor: r.paid ? C.neg : C.faint, chevron: true,
            onTap: () => ctx.push({ key: "fixed:" + r.prop, title: r.item.name }),
        });
    }
    return { title: t("fixedExpenses"), el };
};
const fixedItemPage = (x: X, r: ReturnType<typeof computeMonth>["fixedRows"][number]): PageOut => {
    const { cur } = x;
    const el = page(r.item.name);
    const on = r.paid !== 0;
    hero(el, { label: on ? t("paidThisMonth") : t("notPaid"), value: num(r.paid), unit: cur, color: on ? C.neg : C.faint });
    const g = group(el);
    row(g, { check: { on, color: C.pos, onToggle: (v) => { void setPaid(x, r, v); } }, title: t("paidThisMonth"), onTap: () => { void setPaid(x, r, !on); } });
    row(g, { icon: "pencil", tint: C.accent, title: t("paidAmount"), value: num(r.paid), chevron: true, onTap: () => x.editAmount(t("paidAmount"), r.paid, async (n) => { if (!(await x.writeMonth((f) => { f[r.prop] = n; }))) return false; new Notice(t("savedX", { name: r.item.name, amount: num(n), cur })); }) });
    row(g, { icon: "pin", tint: C.faint, title: t("defaultAmount"), value: num(r.def) });
    return { title: r.item.name, el };
};

// ---- extra (one-time) expenses: from daily notes and the month note
const extraPage = (x: X): PageOut => {
    const { ctx, cur, M } = x;
    const el = page(t("extraExpenses"));
    hero(el, { label: t("extraTotal"), value: num(M.extraTotal), unit: cur, color: C.warn });
    if (!M.extras.length) empty(el, { icon: "sparkles", title: t("noExtra") });
    else {
        const g = group(el);
        for (const e of M.extras) row(g, { title: cap(e.prop), sub: e.days.length ? t("daysN", { n: e.days.length }) : undefined, value: num(e.total), valueColor: C.warn, chevron: true, onTap: () => ctx.push({ key: "extra:" + e.prop, title: cap(e.prop) }) });
    }
    return { title: t("extraExpenses"), el };
};
const extraItemPage = (x: X, e: ReturnType<typeof computeMonth>["extras"][number]): PageOut => {
    const { ctx, cur } = x;
    const name = cap(e.prop);
    const el = page(name);
    hero(el, { label: t("extraTotal"), value: num(e.total), unit: cur, color: C.warn });
    if (e.fromMonth > 0) {
        const g = group(el, t("monthlyEntry"));
        row(g, { icon: "pencil", tint: C.warn, title: t("monthlyEntry"), value: num(e.fromMonth), chevron: true, onTap: () => x.editAmount(t("monthlyEntry"), e.fromMonth, async (n) => { if (!(await x.writeMonth((f) => { f.extra_expenses = { ...((f.extra_expenses as FM) ?? {}), [e.prop]: n }; }))) return false; new Notice(t("savedX", { name, amount: num(n), cur })); }) });
        row(g, { icon: "trash-2", tint: C.neg, title: t("removeEntry"), titleColor: C.neg, onTap: async () => {
            if (!(await confirmSheet(ctx.app, t("removeEntry"), `${name} · ${num(e.fromMonth)} ${cur}`, t("delete")))) return;
            if (await x.writeMonth((f) => del(f, "extra_expenses", e.prop))) new Notice(t("removedX", { name }));
        } });
    }
    if (e.days.length) {
        const g = group(el, t("days"));
        for (const d of e.days) row(g, { icon: "calendar", tint: C.faint, title: shortDate(d.name), value: num(d.amount), valueColor: C.warn, chevron: true, onTap: () => void ctx.plugin.openDay(d.name) });
    }
    return { title: name, el };
};

// ---- one daily-budget group (C detail + list): what is left, the month's limit (a share of the money left to spend, or a fixed
// amount for this month), spending against the pace, and the days. The limit row says in words what the number is.
const budgetPage = (x: X, b: BudgetRow, days: { name: string; path: string; fm: FM }[]): PageOut => {
    const { ctx, cur, label } = x;
    const el = page(b.item.name);
    el.addClass("zl-c-list");
    const sel = ctx.plugin.logMonth, now = new Date();
    const isNow = sel.year === now.getFullYear() && sel.month === now.getMonth();
    const dim = new Date(sel.year, sel.month + 1, 0).getDate(), daysLeft = isNow ? dim - now.getDate() + 1 : 0;
    summary(el, {
        key: "budget-" + b.index, label: `${b.item.name} · ${b.remain >= 0 ? t("leftInBudget") : t("overBudget")}`, value: num(Math.abs(b.remain)), hot: b.level !== "ok",
        items: [[t("cLimit"), num(b.quota)], [t("spent"), num(b.spent)], isNow ? [t("cPerDayLeft"), num(Math.max(0, b.remain) / Math.max(1, daysLeft)), b.remain < 0] : [t("used"), `${b.quota > 0 ? Math.round((b.spent / b.quota) * 100) : 0}%`]],
    });
    const bar = h(el, "div", "zl-c-group");
    sec(bar, (isNow ? t("cVsPace") : t("spent")).toUpperCase());
    budgetBar(bar, b.spent, b.quota, isNow ? now.getDate() / dim : 0, 30, 10, 18);
    const lim = h(el, "div", "zl-c-group");
    const pct = b.item.quota;
    const setLimit = () => x.editAmount(t("cLimitOf", { name: b.item.name }), b.quota,
        async (n) => { if (!(await x.writeMonth((f) => { f[b.quotaKey] = n; }))) return false; new Notice(t("savedX", { name: b.item.name, amount: num(n), cur })); },
        false, t("cLimitNote", { name: b.item.name, month: label, pct }));
    figures(lim, [
        { icon: "wallet", k: t("cLimit").toUpperCase(), s: b.isPercent ? t("cLimitPct", { pct }) : t("cLimitFixed", { pct }), v: num(b.quota), onTap: setLimit,
            scrub: () => ({ value: b.quota, step: notchFor(cur) * 10, label: t("cLimit"), fmt: num, done: (n: number) => { void x.writeMonth((f) => { f[b.quotaKey] = n; }).then((ok) => { if (ok) new Notice(t("savedX", { name: b.item.name, amount: num(n), cur })); }); } }) },
        ...(!b.isPercent ? [{ icon: "back", k: t("backToPct", { pct }).toUpperCase(), s: t("cLimitBack"), v: `${pct}%`, onTap: async () => { if (await x.writeMonth((f) => { delete f[b.quotaKey]; })) new Notice(t("savedX", { name: b.item.name, amount: `${pct}%`, cur: "" })); } }] : []),
    ]);
    const rows = days.map((d) => ({ d, items: b.item.spending.map((p): [string, number] => [p, Number(d.fm[p]) || 0]).filter(([, v]) => v > 0) }))
        .filter((r) => r.items.length).sort((p, q) => q.d.name.localeCompare(p.d.name));
    const dg = h(el, "div", "zl-c-group");
    sec(dg, t("days").toUpperCase());
    if (rows.length) figures(dg, rows.map(({ d, items }) => ({ icon: "log", k: shortDate(d.name).toUpperCase(), s: items.map(([k, v]) => `${cap(k)} ${num(v)}`).join(" · "), v: num(items.reduce((s, [, v]) => s + v, 0)), onTap: () => void ctx.plugin.openDay(d.name) })));
    else figures(dg, [{ icon: "log", k: t("nothingSpent").toUpperCase(), v: "0", dim: true }]);
    return { title: b.item.name, el };
};
