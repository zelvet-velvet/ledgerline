// Invest MIX and RULES pages
import { FILES } from "../data/store";
import { investBuckets } from "../calc/log";
import { num } from "../format";
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
    const fab = { icon: "plus", text: t("iTrade").toUpperCase(), label: t("iTrade"), onTap: () => x.trade() };
    const sel = new Date(), mk = `${sel.getFullYear()}-${String(sel.getMonth() + 1).padStart(2, "0")}`;
    const { plan, month } = ctx.plugin.store.monthData(sel.getFullYear(), sel.getMonth());
    const amt = Number(month?.[PLAN_KEY] ?? plan[PLAN_KEY]) || 0;
    const bs = investBuckets(ctx.plugin.store.fm(ctx.plugin.store.path(FILES.invest)), amt, mk);
    const toBuy = bs ? bs.reduce((s, b) => s + Math.max(0, b.target - b.bought), 0) : null;
    summary(el, { key: "mix", label: t("iCashWait"), value: num(x.cash), items: toBuy !== null ? [[t("iToBuy"), num(toBuy)]] : [] });
    const toHoldings = () => ctx.push({ key: "holdings", title: t("iHoldingsT") });
    const toRules = () => ctx.push({ key: "rules", title: t("iRules") });
    if (P.buckets.length && P.value > 0) {
        const g = h(el, "div", "zl-c-group");
        sec(g, t("iMixT").toUpperCase(), x.warns.length ? toRules : undefined, x.warns.length ? (x.warns.length === 1 ? t("iWarn1") : t("iWarnN", { n: x.warns.length })).toUpperCase() : undefined);
        for (const b of P.buckets) bline(g, { name: b.label, spent: b.pct, quota: 100, pace: b.target / 100, value: `${Math.round(b.pct)}%`, of: t("iTargetN", { n: b.target }), hot: Math.abs(b.drift) > P.threshold, mix: true, onTap: toHoldings });
    }
    if (bs?.length) {
        const g = h(el, "div", "zl-c-group");
        sec(g, t("iPlan", { n: num(amt) }).toUpperCase());
        for (const b of bs) bline(g, { name: b.label, spent: b.bought, quota: b.target, pace: 0, value: num(Math.max(0, b.target - b.bought)), of: t("cLeftOf", { n: num(b.target) }), hot: false, onTap: () => x.trade() });
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
        icon: w.rule === "reason" ? "list" : "invest", k: w.key, s: warnText(w), v: w.rule === "cap" ? `+${num(w.over)}` : w.rule === "mix" ? `${w.over > 0 ? "+" : ""}${w.over}%` : "", hot: true,
        onTap: w.rule === "reason" ? () => ctx.push({ key: "journal:" + w.key, title: t("iJournal") }) : w.rule === "cap" ? () => ctx.push({ key: "asset:" + w.key, title: w.key }) : undefined,
    })) : [{ k: t("iRulesOk").toUpperCase(), v: "-", dim: true }]);
    const r = h(el, "div", "zl-c-group");
    sec(r, t("iRulesT").toUpperCase());
    figures(r, [
        { k: t("iRuleCap").toUpperCase(), s: t("iRuleCapS"), v: num(x.cap), dim: true },
        { k: t("iRuleMix").toUpperCase(), s: t("iRuleMixS"), v: `${P.threshold}%`, dim: true },
        { k: t("iRuleReason").toUpperCase(), s: t("iRuleReasonS"), v: "", dim: true },
    ]);
    return { title, el };
};
