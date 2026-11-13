import { Notice } from "obsidian";
import { monthLong, num, parseNum } from "../format";
import { t } from "../i18n";
import { ChoiceSheet, FormSheet } from "../ui/sheet";
import type { PageCtx } from "./index";

// Change a savings-plan amount (loan, a fund): the new amount, then "only this month" (this month's note) or "this month onwards"
// (the plan default; earlier months without their own value keep the old one). Used by Debt and Goals.
export const editAllocation = (ctx: PageCtx, key: string, what: string): void => {
    const { store, settings } = ctx.plugin;
    const cur = settings.baseCurrency;
    const info = store.allocation(key);
    const month = monthLong(new Date());
    new FormSheet(ctx.app, {
        title: what, subtitle: t("fromSavingsPlan"), submitText: t("save"),
        fields: [{ key: "v", label: t("amount"), type: "number", value: info.amount, suffix: cur }],
        validate: (v) => (parseNum(v.v) === info.amount ? t("sameValue") : null),
        onSubmit: async (v) => {
            const next = parseNum(v.v);
            const choices = [];
            if (info.hasNote) choices.push({ value: "once", label: t("onlyMonth", { month }), hint: t("onlyMonthHint", { amount: num(info.def), cur }) });
            choices.push({ value: "onward", label: t("fromMonth", { month }), hint: t("fromMonthHint") });
            new ChoiceSheet(ctx.app, `${num(info.amount)} → ${num(next)} ${cur}`, choices, async (mode) => {
                const frozen = await store.setAllocation(key, next, mode as "once" | "onward");
                new Notice(mode === "once" ? t("allocOnce", { what, amount: num(next), cur, month })
                    : t("allocOnward", { what, amount: num(next), cur, month }) + (frozen ? t("allocFrozen", { n: frozen }) : ""));
            }).open();
        },
    }).open();
};
