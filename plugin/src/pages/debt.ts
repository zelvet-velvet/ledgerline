import { Notice } from "obsidian";
import { computeDebt, Debt, Payment, projectDebt } from "../calc/debt";
import { FILES } from "../data/store";
import { dateStr, MONTHS, num, parseNum, shortDate, today } from "../format";
import { t } from "../i18n";
import { empty, h, page } from "../ui";
import { figures, homeTop, sec, summary, yearBricks } from "../ui/c";
import { confirmSheet, FormSheet } from "../ui/sheet";
import { editAllocation as editAlloc } from "./shared";
import { netWorth, netWorthPage } from "./networth";
import { ACCOUNTS_FILE, accountPage, accountsPage } from "./accounts";
import { buildAccounts } from "../calc/accounts";
import type { PageCtx, PageDef, PageOut } from "./index";

const PLAN_KEY = "student_loan";   // the savings-plan line that feeds the loan

export const debtPage: PageDef = {
    id: "debt", label: "tabDebt", icon: "landmark",
    render(ctx) {
        const { store, settings } = ctx.plugin;
        const cur = settings.baseCurrency;
        const CFG = store.path(FILES.debt);
        const fm = store.fm(CFG);
        const planDefault = Number(store.fm(store.path(FILES.savings))?.[PLAN_KEY]) || 0;
        const d = computeDebt(fm, planDefault, store.monthLines(PLAN_KEY), new Date());
        const money = (n: number) => num(n);   // rows: no currency (it is shown once, in the card)

        // ---- sheets
        const recordPayment = () => new FormSheet(ctx.app, {
            title: t("recordPayment"), subtitle: `${t("remaining")} ${money(d.balance)}`, submitText: t("savePayment"),
            fields: [
                { key: "amount", label: t("amount"), type: "number", suffix: cur, placeholder: "0", required: true, value: !d.grace && d.monthlyMin > 0 ? d.monthlyMin : "" },
                { key: "date", label: t("date"), type: "date", value: today(), required: true },
                { key: "note", label: t("note"), type: "text", value: t("defaultPaymentNote") },
            ],
            onSubmit: async (v) => {
                const amount = parseNum(v.amount);
                await store.update(CFG, (f) => {
                    const list = Array.isArray(f.payments) ? f.payments : f.payments ? [f.payments] : [];
                    list.push({ date: v.date || today(), amount, note: v.note || t("defaultPaymentNote") });
                    f.payments = list;
                });
                new Notice(t("loggedPayment", { amount: num(amount), left: num(Math.max(0, d.balance - amount)), cur }));
            },
        }).open();

        const editPayment = (p: Payment) => new FormSheet(ctx.app, {
            title: t("editPayment"), subtitle: p.note || t("defaultPaymentNote"), submitText: t("save"),
            fields: [
                { key: "amount", label: t("amount"), type: "number", suffix: cur, value: p.amount, required: true },
                { key: "date", label: t("date"), type: "date", value: p.date, required: true },
                { key: "note", label: t("note"), type: "text", value: p.note, placeholder: t("optional") },
            ],
            onSubmit: async (v) => {
                await store.update(CFG, (f) => {
                    const x = Array.isArray(f.payments) ? (f.payments[p.index] as Record<string, unknown> | undefined) : undefined;
                    if (!x) return;
                    x.amount = parseNum(v.amount); x.date = v.date; x.note = v.note;
                });
                new Notice(t("updatedPayment", { amount: num(parseNum(v.amount)), cur }));
            },
            danger: {
                text: t("deletePayment"),
                onTap: async () => {
                    if (!(await confirmSheet(ctx.app, t("deletePayment"), t("deletePaymentQ", { amount: num(p.amount), cur, date: p.date || "-" }), t("delete")))) return false;
                    await store.update(CFG, (f) => { if (Array.isArray(f.payments) && f.payments[p.index] !== undefined) f.payments.splice(p.index, 1); });
                    new Notice(t("deletedPayment", { amount: num(p.amount), cur }));
                    return true;
                },
            },
        }).open();

        // one number in the debt note (percent: shown and typed in %, stored as a fraction)
        const editNumber = (what: string, key: string, value: number, percent = false) => new FormSheet(ctx.app, {
            title: what, submitText: t("save"),
            fields: [{ key: "v", label: what, type: "number", value: percent ? +(value * 100).toFixed(4) : value, suffix: percent ? "%" : cur, required: !percent }],
            onSubmit: async (v) => {
                const n = parseNum(v.v);
                await store.update(CFG, (f) => { f[key] = percent ? +(n / 100).toFixed(8) : n; });
                new Notice(t("updated", { what, value: percent ? `${n}%` : money(n) }));
            },
        }).open();

        const editStart = () => new FormSheet(ctx.app, {
            title: d.grace || !d.start ? t("repaymentStarts") : t("repayingSince"), submitText: t("save"),
            fields: [{ key: "v", label: t("date"), type: "date", value: d.start || today(), required: true }],
            onSubmit: async (v) => {
                await store.update(CFG, (f) => { f.start_date = v.v; });
                new Notice(t("updated", { what: t("repaymentStarts"), value: v.v }));
            },
        }).open();

        const editAllocation = () => editAlloc(ctx, PLAN_KEY, t("monthlyAllocation"));

        const setUp = () => new FormSheet(ctx.app, {
            title: t("setUpLoan"), submitText: t("save"),
            fields: [
                { key: "principal", label: t("initialPrincipal"), type: "number", suffix: cur, required: true },
                { key: "rate", label: t("interestRate"), type: "number", suffix: "%", placeholder: t("rateHint") },
                { key: "start", label: t("repaymentStarts"), type: "date", value: today(), required: true },
                { key: "min", label: t("monthlyMin"), type: "number", suffix: cur },
            ],
            onSubmit: async (v) => {
                await store.update(CFG, (f) => {
                    f.initial_principal = parseNum(v.principal);
                    f.interest_rate = v.rate ? +(parseNum(v.rate) / 100).toFixed(8) : 0;
                    f.start_date = v.start;
                    f.monthly_min_payment = v.min ? parseNum(v.min) : 0;
                    f.payments = [];
                });
            },
        }).open();

        const acts = { recordPayment, editNumber, editStart, editAllocation, setUp, allocation: store.allocation(PLAN_KEY).amount };
        if (ctx.frame.key === "history") return history(ctx, d, money, recordPayment, editPayment);
        if (ctx.frame.key === "accounts" || ctx.frame.key.startsWith("accounts:")) return accountsPage(ctx);
        if (ctx.frame.key.startsWith("account:")) { const o = accountPage(ctx, ctx.frame.key.slice(8)); if (o) return o; }
        if (ctx.frame.key === "networth") return netWorthPage(ctx);
        if (ctx.frame.key === "loan") return loan(ctx, d, money, acts);
        return first(ctx, d, money, cur, acts);
    },
};

interface FirstActions {
    recordPayment(): void;
    editNumber(what: string, key: string, value: number, percent?: boolean): void;
    editStart(): void;
    editAllocation(): void;
    setUp(): void;
    allocation: number;
}

// Redesign C. First page (C home): the board with what is left, paid / days to start, the payoff staircase, then two figure rows.
const first = (ctx: PageCtx, d: Debt, money: (n: number) => string, cur: string, a: FirstActions): PageOut => {
    const title = t("tabDebt");
    const el = page(title);
    if (!d.exists) {
        el.addClass("zl-c-stack");
        empty(el, { icon: "landmark", title: t("noDebt"), text: t("noDebtSub"), button: t("setUpLoan"), onTap: a.setUp });
        return { title, el };
    }
    el.addClass("zl-c-stack");
    // readability redesign: the board with what is still to pay back, the first payment (or what is paid) and the monthly amount
    // as split-flaps, what is left year by year as brick columns (this year loud), then Saved for it so far and Net worth
    const pay = Math.max(d.repayment, d.monthlyMin);
    const mon = (s: string) => { const [y, m] = s.split("-").map(Number); return `${MONTHS[(m || 1) - 1]} ${String(y).slice(2)}`.toUpperCase(); };
    homeTop(el, {
        key: "debt", value: num(d.balance), label: t("cRemaining"), right: t("cPaidPct", { n: d.progress.toFixed(d.progress ? 1 : 0) }),
        reads: d.grace && d.start ? [[t("dFirstPay"), mon(d.start)], [t("dEachMonth"), num(pay)]] : [[t("dPaidSoFar"), num(d.paid)], [t("dEachMonthNow"), num(pay)]],
    });
    const P = projectDebt(d, pay, new Date());
    const g = h(el, "div", "zl-c-group zl-c-fill");
    sec(g, t("dYears").toUpperCase());
    const cols = P.years.slice(1).length ? P.years.slice(1) : P.years;   // the end of each year
    const labels = cols.map((_, i) => { const y = P.firstYear + i; return cols.length > 6 ? `'${String(y).slice(2)}` : String(y); });
    const at = new Date().getFullYear() - P.firstYear;
    const loud = at >= 0 && at < cols.length ? at : -1;
    yearBricks(g, cols, labels, loud);
    h(g, "p", "zl-c-note", t(loud >= 0 ? "dYearsNoteNow" : "dYearsNote", { n: num(pay) }));
    const n = d.payments.length;
    const acc = buildAccounts(ctx.plugin.store.fm(ctx.plugin.store.path(ACCOUNTS_FILE)));
    const own = acc.list.filter((x) => x.line === "student_loan");
    const saved = own.length ? own.reduce((s, x) => s + x.balance, 0) : d.loanPrep;
    const nw = netWorth(ctx.plugin).total;
    figures(h(el, "div", "zl-c-group"), [
        { icon: "wallet", k: t("dSaved"), s: t("dSavedSub"), v: money(saved), onTap: () => ctx.push({ key: "loan", title: t("loanDetails") }) },
        ...(n ? [{ icon: "receipt", k: t("dPayments"), s: n === 1 ? t("cPayment1") : t("cPayments", { n }), v: money(d.paid), onTap: () => ctx.push({ key: "history", title: t("repaymentHistory") }) }] : []),
        { icon: "wallet", k: t("nwTitle"), s: t("nwSub"), v: `${nw < 0 ? "-" : ""}${money(Math.abs(nw))}`, hot: nw < 0, onTap: () => ctx.push({ key: "networth", title: t("nwTitle") }) },
    ]);
    return { title, el, fab: { icon: "plus", text: t("recordPayment").toUpperCase(), label: t("recordPayment"), onTap: a.recordPayment } };
};

// loan details (C detail): every number of the loan note as a figure row; a tap changes it
const loan = (ctx: PageCtx, d: Debt, money: (n: number) => string, a: FirstActions): PageOut => {
    const title = t("loanDetails");
    const el = page(title);
    el.addClass("zl-c-stack");
    summary(el, { label: t("remaining"), value: num(d.balance), hot: d.balance > 0, items: [[t("cPaid"), num(d.paid)], [t("progress"), `${d.progress.toFixed(1)}%`], [t("cMonthly"), num(Math.max(d.repayment, d.monthlyMin))]] });
    const list: Parameters<typeof figures>[1] = [
        { icon: "debt", k: t("initialPrincipal").toUpperCase(), v: money(d.principal), onTap: () => a.editNumber(t("initialPrincipal"), "initial_principal", d.principal) },
        { icon: "percent", k: t("interestRate").toUpperCase(), v: `${(d.rate * 100).toFixed(3)}%`, onTap: () => a.editNumber(t("interestRate"), "interest_rate", d.rate, true) },
        { icon: "wallet", k: t("monthlyAllocation").toUpperCase(), s: t("fromSavingsPlan"), v: money(a.allocation), onTap: a.editAllocation },
        { icon: "receipt", k: t("monthlyMin").toUpperCase(), v: money(d.monthlyMin), onTap: () => a.editNumber(t("monthlyMin"), "monthly_min_payment", d.monthlyMin) },
        { icon: "log", k: (d.grace || !d.start ? t("repaymentStarts") : t("repayingSince")).toUpperCase(), s: d.grace ? t("inDaysShort", { d: d.daysUntilStart }) : undefined, v: d.start ? shortDate(d.start) : t("notSet"), onTap: a.editStart },
    ];
    if (d.grace) list.push({ icon: "swap", k: t("graceSplit").toUpperCase(), v: `${num(d.toInvestment)} · ${num(d.loanPrep)}` });
    figures(h(el, "div", "zl-c-group"), list);
    return { title, el, fab: { icon: "plus", text: t("recordPayment").toUpperCase(), label: t("recordPayment"), onTap: a.recordPayment } };
};

// repayment history (C list): the total, then one figure row per payment, newest first; a tap edits it
const history = (ctx: PageCtx, d: Debt, money: (n: number) => string, recordPayment: () => void, editPayment: (p: Payment) => void): PageOut => {
    const title = t("repaymentHistory");
    const el = page(title);
    el.addClass("zl-c-list");
    summary(el, { label: t("cPaidTotal"), value: num(d.paid), items: [[t("cCount"), String(d.payments.length)], [t("progress"), `${d.progress.toFixed(1)}%`]] });
    if (!d.payments.length) empty(el, { icon: "receipt", title: t("noPayments"), text: t("noPaymentsSub") });
    else figures(h(el, "div", "zl-c-group"), [...d.payments].sort((x, y) => (y.date || "").localeCompare(x.date || "") || y.index - x.index).map((p) => ({
        icon: "receipt", k: (p.note || t("defaultPaymentNote")).toUpperCase(), s: shortDate(dateStr(p.date, "-")), v: money(p.amount), onTap: () => editPayment(p),
    })));
    return { title, el, fab: { icon: "plus", text: t("recordPayment").toUpperCase(), label: t("recordPayment"), onTap: recordPayment } };
};
