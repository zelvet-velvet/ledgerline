// Invest MIX and RULES pages
import { FILES } from "../data/store";
import { investBuckets } from "../calc/log";
import { num, parseNum } from "../format";
import { FormSheet } from "../ui/sheet";
import { toast } from "../ui/toast";
import { t } from "../i18n";
import { empty, h, page } from "../ui";
import { bline, figures, sec, summary } from "../ui/c";
import type { PageOut } from "./index";
import { PLAN_KEY, X, findAct, warnText } from "./invest-shared";
import { home } from "./invest-home";

// MIX (from Invest home's link): cash waiting and what is still to buy this month, the mix against its targets (a loud tick at
// each target; the head's N WARNINGS › opens the rules), then this month's buying plan per bucket
export const mixPage = (x: X): PageOut => {
    const { ctx, P } = x;
    const title = t("iMixT");
    const el = page(title);
    el.addClass("zl-c-stack");
    const fab = { icon: "plus", text: t("iTrade").toUpperCase(), label: t("iTrade"), onTap: () => x.buy(undefined, el) };
    const sel = new Date(), mk = `${sel.getFullYear()}-${String(sel.getMonth() + 1).padStart(2, "0")}`;
    const { plan, month } = ctx.plugin.store.monthData(sel.getFullYear(), sel.getMonth());
    const amt = Number(month?.[PLAN_KEY] ?? plan[PLAN_KEY]) || 0;
    const bs = investBuckets(ctx.plugin.store.fm(ctx.plugin.store.path(FILES.invest)), amt, mk, x.fx, x.cur);
    const toBuy = bs ? bs.reduce((s, b) => s + Math.max(0, b.target - b.bought), 0) : null;
    summary(el, { key: "mix", label: t("iCashWait"), value: num(x.cash), items: toBuy !== null ? [[t("iToBuy"), num(toBuy)]] : [] });
    const toHoldings = () => ctx.push({ key: "holdings", title: t("iHoldingsT") });
    const toRules = () => ctx.push({ key: "rules", title: t("iRules") });
    if (P.buckets.length && P.value > 0) {
        const g = h(el, "div", "zl-c-group");
        sec(g, t("iMixT").toUpperCase(), x.warns.length ? toRules : undefined, x.warns.length ? (x.warns.length === 1 ? t("iWarn1") : t("iWarnN", { n: x.warns.length })).toUpperCase() : undefined, x.warns.length > 0);
        for (const b of P.buckets) bline(g, { name: b.label, spent: b.pct, quota: 100, pace: b.target / 100, value: `${Math.round(b.pct)}%`, of: t("iTargetN", { n: b.target }), hot: Math.abs(b.drift) > P.threshold, mix: true, onTap: toHoldings });
    }
    if (bs?.length) {
        const g = h(el, "div", "zl-c-group");
        sec(g, t("iPlan", { n: num(amt) }).toUpperCase());
        for (const b of bs) bline(g, { name: b.label, spent: b.bought, quota: b.target, pace: 0, value: num(Math.max(0, b.target - b.bought)), of: t("cLeftOf", { n: num(b.target) }), hot: false, onTap: () => x.buy(undefined, el) });
    }
    if (!P.buckets.length && !bs?.length) empty(el, { icon: "trending-up", title: t("iNone"), text: t("iNoneSub") });
    return { title, el, fab, actions: [findAct(x, el)] };
};

// S5 C list: what breaks a rule now (loud), then the rules themselves (dim)
export const rulesPage = (x: X): PageOut => {
    const { ctx, P } = x;
    const title = t("iRules");
    const el = page(title);
    el.addClass("zl-c-list");
    const g = h(el, "div", "zl-c-group");
    sec(g, t("iRulesNow").toUpperCase());
    figures(g, x.warns.length ? x.warns.map((w) => ({
        icon: w.rule === "reason" ? "list" : "invest", k: w.key, s: warnText(w), v: w.rule === "cap" ? `+${num(w.over)}` : w.rule === "mix" ? `${w.over > 0 ? "+" : w.over < 0 ? "\u2212" : ""}${Math.abs(w.over)}%` : "", hot: true,
        onTap: w.rule === "reason" ? () => ctx.push({ key: "journal:" + w.key, title: t("iJournal") }) : w.rule === "cap" ? () => ctx.push({ key: "asset:" + w.key, title: w.key }) : undefined,
    })) : [{ k: t("iRulesOk").toUpperCase(), v: "-", dim: true }]);
    const r = h(el, "div", "zl-c-group");
    sec(r, t("iRulesT").toUpperCase());
    figures(r, [
        { k: t("iRuleCap").toUpperCase(), s: x.capShare !== null ? t("iRuleCapShare", { p: x.capShare }) : t("iRuleCapS"), v: num(x.cap), dim: true, onTap: () => editCap(x) },
        { k: t("iRuleMix").toUpperCase(), s: t("iRuleMixS"), v: `${P.threshold}%`, dim: true },
        { k: t("iRuleReason").toUpperCase(), s: t("iRuleReasonS"), v: "", dim: true },
    ]);
    return { title, el };
};

// the single-stock cap, edited in the app (owner picked the Vellum mock "Single-stock cap · share", 2026-11-20): Share of
// stock | Flat amount, one number (a whole % with the pad, or whole TWD; a decimal share can be typed into the config), what it comes to now under it; SAVE writes
// single_stock_cap ("40%" or 15000) into Investment Config. The maths: capRule in calc/invest.ts.
const editCap = (x: X): void => {
    const { store } = x.ctx.plugin, base = x.capBase, bucket = base.cash + base.cost;
    const share = x.capShare ?? 40, flat = x.capShare === null ? x.cap : 15000;
    const pctOf = (v: Record<string, string>) => Math.min(100, parseNum(v.share));
    new FormSheet(x.ctx.app, {
        title: t("iRuleCap"), subtitle: t("iCapSub"),
        submitText: (v) => `${t("save").toUpperCase()} ${v.mode === "share" ? `${pctOf(v) || 0}%` : num(parseNum(v.amount) || 0)} →`,
        fields: [
            { key: "mode", label: t("iCapMode"), type: "select", value: x.capShare === null ? "flat" : "share", options: [["share", t("iCapShareOpt")], ["flat", t("iCapFlatOpt")]] },
            { key: "share", label: t("iCapShareL"), type: "number", value: Math.round(share), required: true, showIf: (v) => v.mode === "share",
                note: (v) => t("iCapNow", { n: num(Math.round(bucket * pctOf(v) / 100)), p: pctOf(v) || 0, c: num(base.cash), k: num(base.cost) }) },
            { key: "amount", label: t("iCapAmountL", { cur: x.cur }), type: "number", value: flat, required: true, showIf: (v) => v.mode === "flat", note: () => t("iCapFlatNote") },
        ],
        validate: (v) => (v.mode === "share" ? (parseNum(v.share) > 0 && parseNum(v.share) <= 100 ? null : t("invalidNumber")) : parseNum(v.amount) > 0 ? null : t("invalidAmount")),
        onSubmit: async (v) => {
            const next: string | number = v.mode === "share" ? `${pctOf(v)}%` : Math.round(parseNum(v.amount));
            await store.update(store.path(FILES.invest), (f) => { f.single_stock_cap = next; });
            toast(t("iCapSaved", { v: typeof next === "string" ? next : num(next) }));
        },
    }).open();
};
