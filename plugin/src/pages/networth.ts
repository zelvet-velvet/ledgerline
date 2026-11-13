import { computeDebt } from "../calc/debt";
import { buildGoals } from "../calc/goals";
import { buildAccounts } from "../calc/accounts";
import { buildPortfolio, investCash } from "../calc/invest";
import { ACCOUNTS_FILE } from "./accounts";
import { buildLedger } from "../calc/ledger";
import { FILES } from "../data/store";
import { num } from "../format";
import { t } from "../i18n";
import type LedgerlinePlugin from "../main";
import type { TabId } from "../settings";
import { h, page } from "../ui";
import { figures, sec, summary } from "../ui/c";
import type { PageCtx, PageOut } from "./index";

// 4c Net worth: what the other tabs hold, added up. Funds (saved minus paid out for goals), investments (worth now plus cash
// not yet invested), the loan's savings during the grace period, friends (owed to you minus what you owe), minus the debt.
// No bank balance is tracked: spending money of the month is not in it.
export interface NetPart { key: TabId; label: string; value: number }
export const netWorth = (plugin: LedgerlinePlugin): { parts: NetPart[]; total: number; assets: number; debts: number } => {
    const { store, settings, prices } = plugin;
    const cur = settings.baseCurrency;
    const plan = store.fm(store.path(FILES.savings)) ?? {};
    const months = store.monthNotes();
    const savedOf = (key: string) => months.reduce((s, m) => s + (Number(m.fm[key] !== undefined ? m.fm[key] : plan[key]) || 0), 0);
    const G = buildGoals(store.fm(store.path(FILES.goals)), savedOf);
    const inv = store.fm(store.path(FILES.invest));
    const fb = (inv?.fx_fallback ?? {}) as Record<string, number>;
    const P = buildPortfolio(inv, (tk) => prices.price(tk), (c) => prices.fx(c, cur, fb));
    const d = computeDebt(store.fm(store.path(FILES.debt)), Number(plan.student_loan) || 0, store.monthLines("student_loan"), new Date());
    const L = buildLedger(store.fm(store.path(FILES.ledger))?.ledger);
    const parts: NetPart[] = [
        { key: "goals", label: t("nwFunds"), value: G.totalSaved - G.spent },
        { key: "invest", label: t("nwInvest"), value: P.value + (investCash(buildAccounts(store.fm(store.path(ACCOUNTS_FILE))).list, P.buckets.map((b) => b.key)) ?? savedOf("investment") - P.bought) },
        ...(d.exists && d.grace ? [{ key: "debt" as TabId, label: t("nwLoanSavings"), value: d.toInvestment + d.loanPrep }] : []),
        { key: "ledger", label: t("nwFriends"), value: L.net },
        ...(d.exists ? [{ key: "debt" as TabId, label: t("nwDebt"), value: -d.balance }] : []),
    ];
    const assets = parts.filter((p) => p.value > 0).reduce((s, p) => s + p.value, 0), debts = parts.filter((p) => p.value < 0).reduce((s, p) => s - p.value, 0);
    return { parts, total: assets - debts, assets, debts };
};

const signed = (n: number) => `${n < 0 ? "-" : ""}${num(Math.abs(n))}`;

// C detail: net worth, what you have / owe, one row per part (a tap opens its tab)
export const netWorthPage = (ctx: PageCtx): PageOut => {
    const N = netWorth(ctx.plugin);
    const title = t("nwTitle");
    const el = page(title);
    el.addClass("zl-c-stack");
    summary(el, { label: t("nwLabel", { cur: ctx.plugin.settings.baseCurrency }), value: signed(N.total), hot: N.total < 0, items: [[t("nwHave"), num(N.assets)], [t("nwOwe"), num(N.debts), N.debts > 0]] });
    const g = h(el, "div", "zl-c-group");
    sec(g, t("nwParts").toUpperCase());
    figures(g, N.parts.map((p) => ({ k: p.label.toUpperCase(), v: signed(p.value), hot: p.value < 0, onTap: () => ctx.goTab(p.key) })));
    figures(h(el, "div", "zl-c-group"), [{ icon: "wallet", k: t("acTitle").toUpperCase(), s: t("acSeeWhere"), v: "", onTap: () => ctx.push({ key: "accounts", title: t("acTitle") }) }]);
    h(el, "div", "zl-c-note", t("nwNote"));
    return { title, el };
};
