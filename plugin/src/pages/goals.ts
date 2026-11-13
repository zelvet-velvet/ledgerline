import { Notice } from "obsidian";
import { buildAccounts } from "../calc/accounts";
import { buildGoals, doneBy, Expense, findExpense, Fund, Goal, Goals, Track, trackFund } from "../calc/goals";
import { FILES, FM } from "../data/store";
import { num, parseNum, shortDate, today } from "../format";
import { t } from "../i18n";
import { empty, h, page } from "../ui";
import { dropRow, figures, gridOf, homeTop, sec, summary, tileGrid, trimSteps } from "../ui/c";
import { nameSprite } from "../ui/pixel";
import { confirmSheet, FormSheet } from "../ui/sheet";
import { ACCOUNTS_FILE, accountPage, accountsPage } from "./accounts";
import type { PageCtx, PageDef, PageOut } from "./index";
import { editAllocation } from "./shared";

const NEW = "__new__";

export const goalsPage: PageDef = {
    id: "goals", label: "tabGoals", icon: "target",
    render(ctx) {
        const { store, settings } = ctx.plugin;
        const cur = settings.baseCurrency;
        const CFG = store.path(FILES.goals);
        const plan = store.fm(store.path(FILES.savings)) ?? {};
        const months = store.monthNotes();
        // a fund's savings: every month note's own amount, else the plan default
        const savedOf = (key: string) => months.reduce((s, m) => s + (Number(m.fm[key] !== undefined ? m.fm[key] : plan[key]) || 0), 0);
        const G = buildGoals(store.fm(CFG), savedOf);

        const updateGoal = (name: string, fn: (g: FM) => void) => store.update(CFG, (f) => {
            const g = (Array.isArray(f.goals) ? (f.goals as FM[]) : []).find((x) => x.name === name);
            if (g) fn(g);
        });

        // "🏖 Trip" → emoji 🏖, label Trip; no leading emoji → 🎯
        const splitFund = (s0: string | undefined) => { const m0 = /^\s*(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*)\s*(.*)$/u.exec(s0 ?? ""); return m0 ? { emoji: m0[1], label: m0[2].trim() } : { emoji: "🎯", label: (s0 ?? "").trim() }; };
        const newGoal = (fundKey?: string) => new FormSheet(ctx.app, {
            title: t("newGoal"), submitText: t("save"),
            fields: [
                // + New fund asks its name in the writing window (a leading emoji becomes the fund's); the sheet keeps its rows (owner)
                { key: "fund", label: t("fund"), type: "select", value: fundKey ?? G.funds[0]?.key ?? NEW, options: [...G.funds.map((f): [string, string] => [f.key, `${f.emoji} ${f.label}`.trim()]), [NEW, t("newFund")]],
                    ask: { value: NEW, into: "fundIn", title: t("fundName"), placeholder: t("fundNameHint") } },
                { key: "fundIn", label: t("fundName"), type: "text", off: true },
                { key: "name", label: t("goalName"), type: "text", required: true },
                { key: "goal", label: t("goalAmount"), type: "number", suffix: cur, placeholder: "0", required: true },
                { key: "date", label: t("targetDate"), type: "date" },
            ],
            validate: (v) => {
                if (G.goals.some((g) => g.name === v.name.trim())) return t("goalExists", { name: v.name.trim() });
                if (v.fund === NEW && !splitFund(v.fundIn).label) return t("required", { field: t("fundName").toLowerCase() });
                if (v.fund === NEW && G.funds.some((f) => f.key === keyOf(splitFund(v.fundIn).label))) return t("fundExists");
                return null;
            },
            onSubmit: async (v) => {
                const nf = splitFund(v.fundIn);
                v.fundName = nf.label; v.emoji = nf.emoji;
                const isNew = v.fund === NEW;
                const key = isNew ? keyOf(v.fundName) : v.fund;
                const emoji = isNew ? v.emoji || "🎯" : G.funds.find((f) => f.key === key)?.emoji || "🎯";
                const amount = parseNum(v.goal);
                await store.update(CFG, (f) => {
                    if (isNew) f.funds = [...(Array.isArray(f.funds) ? f.funds : f.funds ? [f.funds] : []), { key, label: v.fundName.trim(), emoji }];
                    const entry: FM = { name: v.name.trim(), fund: key, emoji, goal: amount };
                    if (v.date) entry.target_date = v.date;
                    entry.expenses = [];
                    f.goals = [...(Array.isArray(f.goals) ? f.goals : f.goals ? [f.goals] : []), entry];
                });
                if (isNew) {
                    await store.update(store.path(FILES.savings), (f) => { if (f[key] === undefined) f[key] = 0; });
                    new Notice(t("addedFund", { name: v.fundName.trim() }));
                } else new Notice(t("addedGoal", { name: v.name.trim(), amount: num(amount), cur }));
            },
        }).open();

        const addExpense = (g: Goal) => new FormSheet(ctx.app, {
            title: t("addExpense"), subtitle: `${g.emoji} ${g.name}`.trim(), submitText: t("save"),
            fields: [
                { key: "amount", label: t("amount"), type: "number", suffix: cur, placeholder: "0", required: true },
                { key: "item", label: t("note"), type: "text", placeholder: t("optional") },
                { key: "date", label: t("date"), type: "date", value: today(), required: true },
            ],
            onSubmit: async (v) => {
                const amount = parseNum(v.amount);
                await updateGoal(g.name, (x) => { x.expenses = [...(Array.isArray(x.expenses) ? x.expenses : []), { item: v.item || t("expenseDefault"), amount, date: v.date }]; });
                new Notice(t("addedExpense", { amount: num(amount), cur, name: g.name }));
            },
        }).open();

        const editExpense = (g: Goal, x: Expense) => new FormSheet(ctx.app, {
            title: t("editExpense"), subtitle: x.item, submitText: t("save"),
            fields: [
                { key: "amount", label: t("amount"), type: "number", suffix: cur, value: x.amount, required: true },
                { key: "item", label: t("note"), type: "text", value: x.item },
                { key: "date", label: t("date"), type: "date", value: x.date, required: true },
            ],
            onSubmit: async (v) => {
                let ok = false;
                await updateGoal(g.name, (y) => {
                    const i = findExpense(y.expenses, x);
                    if (i < 0) return;
                    const e = (y.expenses as FM[])[i];
                    e.item = v.item || t("expenseDefault"); e.amount = parseNum(v.amount); e.date = v.date;
                    ok = true;
                });
                new Notice(ok ? t("updatedExpense", { item: v.item || x.item, amount: num(parseNum(v.amount)), cur }) : t("expenseGone"));
            },
            danger: {
                text: t("deleteExpense"),
                onTap: async () => {
                    if (!(await confirmSheet(ctx.app, t("deleteExpense"), t("deleteExpenseQ", { item: x.item, amount: num(x.amount), cur }), t("delete")))) return false;
                    let ok = false;
                    await updateGoal(g.name, (y) => { const i = findExpense(y.expenses, x); if (i >= 0) { (y.expenses as FM[]).splice(i, 1); ok = true; } });
                    new Notice(ok ? t("deletedExpense", { item: x.item }) : t("expenseGone"));
                    return true;
                },
            },
        }).open();

        const editGoalAmount = (g: Goal) => new FormSheet(ctx.app, {
            title: t("goalAmount"), subtitle: g.name, submitText: t("save"),
            fields: [{ key: "v", label: t("goalAmount"), type: "number", suffix: cur, value: g.amount, required: true }],
            onSubmit: async (v) => { await updateGoal(g.name, (x) => { x.goal = parseNum(v.v); }); new Notice(t("updatedGoal", { what: t("goalAmount"), value: num(parseNum(v.v)) })); },
        }).open();

        const editTarget = (g: Goal) => new FormSheet(ctx.app, {
            title: t("targetDate"), subtitle: g.name, submitText: t("save"),
            fields: [{ key: "v", label: t("date"), type: "date", value: g.target || today(), required: true }],
            onSubmit: async (v) => { await updateGoal(g.name, (x) => { x.target_date = v.v; }); new Notice(t("updatedGoal", { what: t("targetDate"), value: shortDate(v.v) })); },
        }).open();

        const deleteGoal = async (g: Goal) => {
            if (!(await confirmSheet(ctx.app, t("deleteGoal"), t("deleteGoalQ", { name: g.name }), t("delete")))) return;
            await store.update(CFG, (f) => { if (Array.isArray(f.goals)) f.goals = (f.goals as FM[]).filter((x) => x.name !== g.name); });
            new Notice(t("deletedGoal", { name: g.name }));
            ctx.pop();
        };

        if (ctx.frame.key === "accounts" || ctx.frame.key.startsWith("accounts:")) return accountsPage(ctx);
        if (ctx.frame.key.startsWith("account:")) { const o = accountPage(ctx, ctx.frame.key.slice(8)); if (o) return o; }
        // redesign S: each fund's monthly amount and whether its goals are on track (calc/goals trackFund)
        const now = today();
        const S: Ctx = { G, cur, now, monthly: new Map(), track: new Map(), A: buildAccounts(store.fm(store.path(ACCOUNTS_FILE))) };
        for (const f of G.funds) {
            const m = store.allocation(f.key).amount;
            S.monthly.set(f.key, m);
            for (const [g, tr] of trackFund(f, m, now)) S.track.set(g, tr);
        }
        const key = ctx.frame.key;
        if (key === "funds") return fundsPage(ctx, S);
        if (key.startsWith("goals:")) { const f = G.funds.find((x) => x.key === key.slice(6)); if (f) return goalsList(ctx, f, S, () => newGoal(f.key)); }
        if (key.startsWith("paid:")) { const g = G.goals.find((x) => x.name === key.slice(5)); if (g) return paidList(g, { addExpense, editExpense }); }
        if (key.startsWith("goal:")) {
            const g = G.goals.find((x) => x.name === key.slice(5));
            if (g) return goalPage(ctx, g, S, { addExpense, editExpense, editGoalAmount, editTarget, deleteGoal });
        }
        if (key.startsWith("fund:")) {
            const f = G.funds.find((x) => x.key === key.slice(5));
            if (f) return fundPage(ctx, f, S, () => newGoal(f.key));
        }
        return firstPage(ctx, S, () => newGoal());
    },
};

// "Japan trip" → "japan_trip_fund" (the key of a new fund in the savings plan)
const keyOf = (name: string) => `${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "new"}_fund`;
const fundTitle = (f: Fund) => f.label;
const emojiAvatar = (e: string) => e || "🎯";

// Redesign S (2026-11-05, owner picked from Layouts mocks): every block answers one question. How much is saved, is each fund on
// track, what comes next. A fund row already says its monthly amount and its next goal; COMING UP gives each goal a verdict.
interface Ctx { G: Goals; cur: string; now: string; monthly: Map<string, number>; track: Map<Goal, Track>; A: ReturnType<typeof buildAccounts> }
const monthName = (ym: string) => { const [y, m] = ym.split("-").map(Number); return new Date(y, m - 1, 1).toLocaleDateString("en", { month: "short", year: "numeric" }); };
const verdict = (S: Ctx, g: Goal): { v: string; hot: boolean } => {
    const tr = S.track.get(g);
    if (!tr) return { v: `${Math.floor(g.pct)}%`, hot: false };
    return tr.short > 0 ? { v: t("gShort", { n: num(tr.short) }).toUpperCase(), hot: true } : { v: t("gOnTrack").toUpperCase(), hot: false };
};
const goalRow = (ctx: PageCtx, S: Ctx, g: Goal, sub: string) => ({ icon: "goals", k: g.name.toUpperCase(), s: sub, ...verdict(S, g), onTap: () => ctx.push({ key: "goal:" + g.name, title: g.name }) });
// a fund without goals: the target of its account (Accounts › line = the fund's key), if it has one
const fundTarget = (S: Ctx, f: Fund) => S.A.list.find((a) => a.line === f.key && a.target > 0)?.target ?? 0;

const fundIcon = (f: Fund) => nameSprite(f.label, "goals");
const isShort = (S: Ctx, f: Fund) => f.goals.some((g) => (S.track.get(g)?.short ?? 0) > 0);
const fundTile = (ctx: PageCtx, S: Ctx, f: Fund) => ({ icon: fundIcon(f), k: f.label.toUpperCase(), v: num(f.saved), dim: !f.saved, hot: isShort(S, f), onTap: () => ctx.push({ key: "fund:" + f.key, title: f.label }) });
const fundLine = (S: Ctx, f: Fund) => {
    const m = t("gAMonth", { n: num(S.monthly.get(f.key) ?? 0) });
    const next = f.goals.find((g) => g.pct < 100), ft = fundTarget(S, f);
    return next ? `${m} · ${t("gNext", { name: next.name, date: next.target ? shortDate(next.target) : "" }).trim()}`
        : f.goals.length ? `${m} · ${t("gAllDone").toLowerCase()}`
        : ft ? `${m} · ${t("gTargetPct", { target: num(ft), pct: Math.floor((f.saved / ft) * 100) })}` : `${m} · ${t("gNoGoalYet")}`;
};

// Home (one screen): board + 2 readouts → FUNDS as a tile grid, each fund its own picture, loud when a goal of it is short (up to
// 4 across; a 5th fund turns the last tile into "+N", the funds page) → COMING UP, the next dated goals with their verdict (trimmed
// to fit, at least 1) → Accounts.
const firstPage = (ctx: PageCtx, S: Ctx, newGoal: () => void): PageOut => {
    const { G, cur } = S;
    const title = t("tabGoals");
    const el = page(title);
    el.addClass("zl-c-stack");
    const target = G.funds.reduce((s, f) => s + (f.goals.length ? f.target : fundTarget(S, f)), 0);
    const monthly = G.funds.reduce((s, f) => s + (S.monthly.get(f.key) ?? 0), 0);
    homeTop(el, {
        key: "goals", value: num(G.totalSaved), label: t("cSaved", { cur }), right: target > 0 ? t("cOfTarget", { n: Math.floor((G.totalSaved / target) * 100) }) : undefined,
        reads: [[t("gEachMonth"), num(monthly)], [t("remainingGoal"), num(G.remaining)]],
    });
    const fab = { icon: "plus", text: t("newGoal").toUpperCase(), label: t("newGoal"), onTap: newGoal };
    if (!G.funds.length) { empty(el, { icon: "target", title: t("noGoals"), text: t("noGoalsSub") }); return { title, el, fab }; }
    const funds = () => ctx.push({ key: "funds", title: t("funds") });
    const fg = h(el, "div", "zl-c-group");
    sec(fg, t("funds").toUpperCase(), funds, t("cAll").toUpperCase());
    tileGrid(fg, gridOf(G.funds.map((f) => fundTile(ctx, S, f)), 4, (n) => ({ icon: "list", k: t("cMore").toUpperCase(), v: `+${n}`, onTap: funds })));
    const next = G.goals.filter((g) => g.target && g.pct < 100).slice(0, 3);
    let trim: (() => boolean) | undefined;
    if (next.length) {
        const ng = h(el, "div", "zl-c-group");
        sec(ng, t("gComingUp").toUpperCase());
        trim = dropRow(figures(ng, next.map((g) => goalRow(ctx, S, g, `${shortDate(g.target)} · ${num(g.amount)}`))), 1);
    }
    const banks = new Set(S.A.list.map((a) => a.bank)).size;
    sec(h(el, "div", "zl-c-group zl-c-link"), (S.A.list.length ? t("gAccounts", { n: S.A.list.length, b: banks }) : t("acTitle")).toUpperCase(), () => ctx.push({ key: "accounts", title: t("acTitle") }), t("cMore").toUpperCase());
    return { title, el, fab, trim };
};

// every fund (C list): name with its picture, monthly amount and next goal, what it holds
const fundsPage = (ctx: PageCtx, S: Ctx): PageOut => {
    const title = t("funds");
    const el = page(title);
    el.addClass("zl-c-list");
    const g = h(el, "div", "zl-c-group");
    figures(g, S.G.funds.map((f) => ({ icon: fundIcon(f), name: true, k: f.label.toUpperCase(), s: fundLine(S, f), v: num(f.saved), hot: isShort(S, f), onTap: () => ctx.push({ key: "fund:" + f.key, title: f.label }) })));
    return { title, el };
};

// one fund (one screen): saved, its goals' total, monthly amount, done by → the monthly amount (tap: change) → its goals in the
// order they fill (trimmed to fit; ALL › lists them all)
const fundPage = (ctx: PageCtx, f: Fund, S: Ctx, newGoal: () => void): PageOut => {
    const title = f.label;
    const el = page(title);
    el.addClass("zl-c-stack");
    const monthly = S.monthly.get(f.key) ?? 0;
    const ft = f.goals.length ? f.target : fundTarget(S, f);
    const done = doneBy(f, monthly, S.now);
    summary(el, { key: "fund-" + f.key, label: t("savedSoFar"), value: num(f.saved), items: [[f.goals.length ? t("gGoalTotal") : t("cTarget"), ft > 0 ? num(ft) : "-"], [t("remainingGoal"), ft > 0 ? num(Math.max(0, ft - f.saved)) : "-"], [t("gDoneBy"), !f.goals.length ? "-" : f.saved >= f.target ? t("gAllDone") : done ? monthName(done) : t("gNever")]] });
    const g = h(el, "div", "zl-c-group");
    figures(g, [{ icon: fundIcon(f), k: t("monthlyAmount").toUpperCase(), s: t("fromSavingsPlan"), v: num(monthly), onTap: () => editAllocation(ctx, f.key, `${f.label}: ${t("monthlyAmount").toLowerCase()}`) }]);
    const gg = h(el, "div", "zl-c-group");
    sec(gg, t("gInOrder").toUpperCase(), f.goals.length > 1 ? () => ctx.push({ key: "goals:" + f.key, title: f.label }) : undefined, t("cAll").toUpperCase());
    let trim: (() => boolean) | undefined;
    if (f.goals.length) trim = dropRow(figures(gg, f.goals.map((goal) => goalRow(ctx, S, goal, goalSub(goal)))), 1);
    else figures(gg, [{ k: t("gNoGoalYet").toUpperCase(), v: "-", dim: true }]);
    return { title, el, trim, fab: { icon: "plus", text: t("newGoal").toUpperCase(), label: t("newGoal"), onTap: newGoal } };
};
const goalSub = (goal: Goal) => (goal.target ? `${shortDate(goal.target)} · ${num(goal.amount)} · ${Math.floor(goal.pct)}%` : t("gNoDate", { pct: Math.floor(goal.pct) }));

// a fund's goals, all of them (C list)
const goalsList = (ctx: PageCtx, f: Fund, S: Ctx, newGoal: () => void): PageOut => {
    const title = f.label;
    const el = page(title);
    el.addClass("zl-c-list");
    const g = h(el, "div", "zl-c-group");
    sec(g, t("gInOrder").toUpperCase());
    figures(g, f.goals.map((goal) => goalRow(ctx, S, goal, goalSub(goal))));
    return { title, el, fab: { icon: "plus", text: t("newGoal").toUpperCase(), label: t("newGoal"), onTap: newGoal } };
};

interface GoalActions {
    addExpense(g: Goal): void;
    editExpense(g: Goal, x: Expense): void;
    editGoalAmount(g: Goal): void;
    editTarget(g: Goal): void;
    deleteGoal(g: Goal): Promise<void>;
}

// one goal (one screen): set aside → the verdict in one sentence → Goal / By as two tiles (tap: change) → what was paid (trimmed
// to fit; ALL › lists it all) → delete, quiet, at the end
const goalPage = (ctx: PageCtx, g: Goal, S: Ctx, a: GoalActions): PageOut => {
    const title = g.name;
    const el = page(title);
    el.addClass("zl-c-stack");
    summary(el, { key: "goal-" + g.name, label: t("setAside"), value: num(g.alloc), items: [[t("goal"), num(g.amount)], [t("progress"), `${Math.floor(g.pct)}%`], [t("alreadyPaid"), num(g.spent)]] });
    const f = S.G.funds.find((x) => x.goals.includes(g));
    const tr = S.track.get(g), m = num(S.monthly.get(f?.key ?? "") ?? 0), fund = f?.label ?? "";
    const say = !tr ? t("gSayNoDate", { pct: Math.floor(g.pct) })
        : tr.short > 0 ? t("gSayShort", { n: num(tr.short), date: shortDate(g.target), fund, per: num(tr.perMonth), m })
        : g.pct >= 100 ? t("gSayCovered", { fund })
        : t("gSayOnTrack", { fund, m, date: shortDate(g.target) });
    const d = h(el, "div", "zl-c-group");
    h(d, "p", "zl-c-note" + (tr && tr.short > 0 ? " is-hot" : ""), say);
    tileGrid(d, [
        { icon: "goals", k: t("goal").toUpperCase(), v: num(g.amount), onTap: () => a.editGoalAmount(g) },
        { icon: "log", k: t("targetDate").toUpperCase(), v: g.target ? shortDate(g.target) : t("noTarget"), dim: !g.target, onTap: () => a.editTarget(g) },
    ]);
    const ex = h(el, "div", "zl-c-group");
    sec(ex, t("expenses").toUpperCase(), g.expenses.length > 1 ? () => ctx.push({ key: "paid:" + g.name, title: g.name }) : undefined, t("cAll").toUpperCase());
    let trim: (() => boolean) | undefined;
    if (!g.expenses.length) figures(ex, [{ k: t("nothingPaid").toUpperCase(), v: "0", dim: true }]);
    else trim = dropRow(figures(ex, paidRows(g, a)), 1);
    sec(h(el, "div", "zl-c-group zl-c-danger"), t("deleteGoal").toUpperCase(), () => { void a.deleteGoal(g); }, "");
    return { title, el, trim, fab: { icon: "plus", text: t("addExpense").toUpperCase(), label: t("addExpense"), onTap: () => a.addExpense(g) } };
};
const paidRows = (g: Goal, a: Pick<GoalActions, "editExpense">) => [...g.expenses].sort((p, q) => q.date.localeCompare(p.date) || q.index - p.index).map((x) => ({ icon: "receipt", k: (x.item || t("expenseDefault")).toUpperCase(), s: x.date ? shortDate(x.date) : undefined, v: num(x.amount), hot: true, onTap: () => a.editExpense(g, x) }));
// everything paid for a goal (C list)
const paidList = (g: Goal, a: Pick<GoalActions, "addExpense" | "editExpense">): PageOut => {
    const el = page(g.name);
    el.addClass("zl-c-list");
    const ex = h(el, "div", "zl-c-group");
    sec(ex, t("expenses").toUpperCase());
    figures(ex, paidRows(g, a));
    return { title: g.name, el, fab: { icon: "plus", text: t("addExpense").toUpperCase(), label: t("addExpense"), onTap: () => a.addExpense(g) } };
};
