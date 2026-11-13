import type { App } from "obsidian";
import type LedgerlinePlugin from "../main";
import type { Frame } from "../router";
import type { TabId } from "../settings";
import { StrKey, t } from "../i18n";
import { group, page, row } from "../ui";
import { debtPage } from "./debt";
import { ledgerPage } from "./ledger";
import { goalsPage } from "./goals";
import { logPage } from "./log";
import { investPage } from "./invest";

export interface Action { icon?: string; text?: string; hint?: string; label: string; loud?: boolean; dock?: boolean; onTap: () => void }   // dock: an icon button in the bottom bar beside the page's action, not in the masthead   // loud: the filled save button (C2)   // text + hint: the docked bar (redesign C)
export interface PageOut { title: string; el: HTMLElement; actions?: Action[]; fab?: Action; still?: boolean; trim?: () => boolean; badge?: { text: string; live: boolean } }   // badge: beside the title (Invest: TW / US TRADING while a market trades, blinking once per update; else the next open, US OPENS 22:30)   // trim: a one-screen page still too tall drops its least needed item ("N MORE"); false = nothing left to drop   // still: touches stay in the page (chart pages: no Obsidian edge swipe / pull-down)   // fab: the floating action (bottom right, above the tab bar)
export interface PageCtx {
    app: App;
    plugin: LedgerlinePlugin;
    frame: Frame;
    push(f: Frame): void;
    replace(f: Frame): void;        // swap the page on screen for another (same depth)
    pop(): void;
    redraw(): void;                 // draw this page again (e.g. after switching the month)
    goTab(id: TabId): void;         // jump to another tab's first page
    openNote(path: string): void;   // open a note in its own Obsidian tab
}
export interface PageDef { id: TabId; label: StrKey; icon: string; render(ctx: PageCtx): PageOut | Promise<PageOut> }

// Phase 1: every tab is a placeholder with a detail page, to check tabs, the page stack and the back button.
const placeholder = (id: TabId, label: StrKey, iconName: string): PageDef => ({
    id, label, icon: iconName,
    render(ctx) {
        const f = ctx.frame;
        const level = f.key === "root" ? 0 : Number(f.params?.level || 1);
        const title = level ? `${t("detailTitle")} ${level}` : t(label);
        const el = page(title);
        row(group(el), { icon: "hammer", title: t("comingSoon"), sub: t("comingSoonSub") });
        row(group(el), {
            icon: "layers", title: t("detailTest"), sub: t("detailTestSub"), chevron: true,
            onTap: () => ctx.push({ key: `detail-${level + 1}`, title: `${t("detailTitle")} ${level + 1}`, params: { level: level + 1 } }),
        });
        return { title, el };
    },
});

export const PAGES: Record<TabId, PageDef> = {
    debt: debtPage,
    invest: investPage,
    log: logPage,
    ledger: ledgerPage,
    goals: goalsPage,
};
