import { tick } from "./ui/haptic";
import { App, PluginSettingTab, setIcon, Setting } from "obsidian";
import type LedgerlinePlugin from "./main";
import { t } from "./i18n";

export type TabId = "debt" | "invest" | "log" | "ledger" | "goals";
export const TAB_ORDER: TabId[] = ["debt", "invest", "log", "ledger", "goals"];

export interface LedgerSettings {
    dataFolder: string;
    logFolder: string;
    baseCurrency: string;
    taiwan: boolean;
    openOnStartup: boolean;
    fullScreen: boolean;
    tabs: Record<TabId, boolean>;
    debugLog: boolean;
    debugPath: string;
    bigNumber: "dots" | "flap";   // the big number of each tab: flip-dot board or split-flap tiles (redesign C)
    pageMove: PageMove;           // how a sub page comes in and Back leaves (owner, 2026-11-05: try them, keep one)
    calm: boolean;                // no page moves, flips or block build-ups (also on with the system's reduce motion)
    tabOrder: TabId[];            // the bottom tab bar's order (owner, 2026-11-04)
    theme: "auto" | "light" | "dark";   // Obsidian's own light / dark mode, set from here (auto = follow the system)
    skin: boolean;                // Obsidian itself in Ledgerline's colours and type (settings, notes, sidebars)
    usNy: boolean;                // US chart and quote times in New York time; off = this device's time (owner, 2026-11-10)
    redUp: boolean;               // 台股 colours: red up, green down (owner, 2026-11-10); off = green up, red down
}

export const PAGE_MOVES = ["slide", "push", "wipe", "fade", "cascade"] as const;
export type PageMove = typeof PAGE_MOVES[number];

export const DEFAULTS: LedgerSettings = {
    dataFolder: "Config",
    logFolder: "Log",
    baseCurrency: "USD",
    taiwan: false,
    openOnStartup: true,
    fullScreen: true,
    tabs: { debt: true, invest: true, log: true, ledger: true, goals: true },
    debugLog: false,
    debugPath: ".ledgerline/debug.log",
    bigNumber: "dots",
    pageMove: "slide",
    calm: false,
    tabOrder: [...TAB_ORDER],
    theme: "auto",
    skin: true,
    redUp: true,
    usNy: false,
};

// a saved order with every tab once (new tabs at the end, unknown ones dropped)
export const tabOrderOf = (o: unknown): TabId[] => {
    const seen = (Array.isArray(o) ? o : []).filter((x): x is TabId => TAB_ORDER.includes(x as TabId));
    return [...new Set([...seen, ...TAB_ORDER])];
};
// Obsidian's theme setting: "obsidian" = dark, "moonstone" = light, "system" = follow the device
export const applyTheme = (app: App, mode: LedgerSettings["theme"]): void => {
    const v = mode === "dark" ? "obsidian" : mode === "light" ? "moonstone" : "system";
    const a = app as unknown as { changeTheme?: (t: string) => void; vault: { getConfig?: (k: string) => unknown } };
    if (a.vault.getConfig?.("theme") !== v) a.changeTheme?.(v);
};

export class LedgerSettingTab extends PluginSettingTab {
    constructor(app: App, private plugin: LedgerlinePlugin) { super(app, plugin); }

    display(): void {
        const { containerEl: c } = this;
        const s = this.plugin.settings;
        const save = () => this.plugin.saveSettings();
        c.empty();
        new Setting(c).setName(t("sDataFolder")).setDesc(t("sDataFolderDesc"))
            .addText((x) => x.setValue(s.dataFolder).onChange(async (v) => { s.dataFolder = v.trim() || DEFAULTS.dataFolder; await save(); }));
        new Setting(c).setName(t("sLogFolder")).setDesc(t("sLogFolderDesc"))
            .addText((x) => x.setValue(s.logFolder).onChange(async (v) => { s.logFolder = v.trim() || DEFAULTS.logFolder; await save(); }));
        new Setting(c).setName(t("sCurrency")).setDesc(t("sCurrencyDesc"))
            .addText((x) => x.setValue(s.baseCurrency).onChange(async (v) => { s.baseCurrency = v.trim().toUpperCase() || DEFAULTS.baseCurrency; await save(); }));
        new Setting(c).setName(t("sTaiwan")).setDesc(t("sTaiwanDesc"))
            .addToggle((x) => x.setValue(s.taiwan).onChange(async (v) => { s.taiwan = v; await save(); }));
        // the Fugle key: kept on this device only (never in data.json, which the vault backup commits); a change redraws
        new Setting(c).setName(t("sFugle")).setDesc(t("sFugleDesc"))
            .addText((x) => { x.inputEl.type = "password"; x.setValue(this.plugin.fugleKey()).onChange(async (v) => { this.plugin.setFugleKey(v); await save(); }); });
        new Setting(c).setName(t("sStartup")).setDesc(t("sStartupDesc"))
            .addToggle((x) => x.setValue(s.openOnStartup).onChange(async (v) => { s.openOnStartup = v; await save(); }));
        new Setting(c).setName(t("sFullScreen")).setDesc(t("sFullScreenDesc"))
            .addToggle((x) => x.setValue(s.fullScreen).onChange(async (v) => { s.fullScreen = v; await save(); }));
        new Setting(c).setName(t("sLook")).setHeading();
        new Setting(c).setName(t("sBigNumber")).setDesc(t("sBigNumberDesc"))
            .addDropdown((x) => x.addOption("dots", t("sDots")).addOption("flap", t("sFlap")).setValue(s.bigNumber).onChange(async (v) => { s.bigNumber = v === "flap" ? "flap" : "dots"; await save(); }));
        new Setting(c).setName(t("sMove")).setDesc(t("sMoveDesc"))
            .addDropdown((x) => {
                const names = { slide: "sMoveSlide", push: "sMovePush", wipe: "sMoveWipe", fade: "sMoveFade", cascade: "sMoveCascade" } as const;
                PAGE_MOVES.forEach((k) => x.addOption(k, t(names[k])));
                x.setValue(s.pageMove).onChange(async (v) => { s.pageMove = PAGE_MOVES.includes(v as PageMove) ? v as PageMove : "slide"; await save(); });
            });
        new Setting(c).setName(t("sCalm")).setDesc(t("sCalmDesc"))
            .addToggle((x) => x.setValue(s.calm).onChange(async (v) => { s.calm = v; await save(); }));
        new Setting(c).setName(t("sTheme")).setDesc(t("sThemeDesc"))
            .addDropdown((x) => x.addOption("auto", t("sThemeAuto")).addOption("light", t("sThemeLight")).addOption("dark", t("sThemeDark")).setValue(s.theme)
                .onChange(async (v) => { s.theme = v === "light" || v === "dark" ? v : "auto"; applyTheme(this.app, s.theme); await save(); }));
        new Setting(c).setName(t("sRedUp")).setDesc(t("sRedUpDesc"))
            .addToggle((x) => x.setValue(s.redUp).onChange(async (v) => { s.redUp = v; await save(); }));
        new Setting(c).setName(t("sUsNy")).setDesc(t("sUsNyDesc"))
            .addToggle((x) => x.setValue(s.usNy).onChange(async (v) => { s.usNy = v; await save(); }));
        new Setting(c).setName(t("sSkin")).setDesc(t("sSkinDesc"))
            .addToggle((x) => x.setValue(s.skin).onChange(async (v) => { s.skin = v; document.body.toggleClass("zl-skin", v); await save(); }));
        new Setting(c).setName(t("sModules")).setDesc(t("sModulesDesc")).setHeading();
        const names: Record<TabId, Parameters<typeof t>[0]> = { debt: "tabDebt", invest: "tabInvest", log: "tabLog", ledger: "tabLedger", goals: "tabGoals" };
        // the tab bar's order: drag a row by its grip (like the command palette's pinned list); the switch shows or hides it
        const order = tabOrderOf(s.tabOrder);
        const rows: HTMLElement[] = [];
        order.forEach((id) => {
            const set = new Setting(c).setName(t(names[id]))
                .addToggle((x) => x.setValue(s.tabs[id]).onChange(async (v) => { s.tabs[id] = v; await save(); }));
            set.settingEl.addClass("zl-set-drag");
            const grip = set.settingEl.createDiv({ cls: "zl-set-grip", attr: { "aria-label": t("sDrag") } });
            setIcon(grip, "grip-vertical");
            set.settingEl.prepend(grip);
            rows.push(set.settingEl);
            grip.addEventListener("pointerdown", (e) => {
                e.preventDefault();
                grip.setPointerCapture(e.pointerId);
                const el = set.settingEl, from = rows.indexOf(el), y0 = e.clientY, ht = el.offsetHeight || 1;
                let to = from;
                el.addClass("is-dragging");
                const move = (m: PointerEvent) => {
                    const dy = m.clientY - y0;
                    el.style.transform = `translateY(${dy}px)`;
                    to = Math.max(0, Math.min(rows.length - 1, from + Math.round(dy / ht)));
                    rows.forEach((r, j) => {
                        if (j === from) return;
                        const shift = from < to && j > from && j <= to ? -ht : from > to && j < from && j >= to ? ht : 0;
                        r.style.transform = shift ? `translateY(${shift}px)` : "";
                    });
                };
                const up = async () => {
                    grip.removeEventListener("pointermove", move);
                    grip.removeEventListener("pointerup", onUp);
                    grip.removeEventListener("pointercancel", onUp);
                    // the rows settle without their slide (they are already where they belong)
                    rows.forEach((r) => { r.addClass("is-settling"); r.style.transform = ""; r.removeClass("is-dragging"); });
                    window.requestAnimationFrame(() => rows.forEach((r) => r.removeClass("is-settling")));
                    if (to === from) return;
                    // moved in place: no redraw of the settings (it jumped back to the top; owner, 2026-11-04)
                    const [r] = rows.splice(from, 1);
                    rows.splice(to, 0, r);
                    const [o] = order.splice(from, 1);
                    order.splice(to, 0, o);
                    const next = rows[to + 1];
                    if (next) next.before(r); else rows[to - 1].after(r);
                    s.tabOrder = [...order];
                    await save();
                };
                const onUp = () => { void up(); };
                grip.addEventListener("pointermove", move);
                grip.addEventListener("pointerup", onUp);
                grip.addEventListener("pointercancel", onUp);
            });
        });
        // which way this phone gives the tick (ui/haptic.ts, Morellonomicon's method)
        const hap = new Setting(c).setName("Test haptic").setDesc("Tap: the phone should tick once.");
        hap.addButton((b) => b.setButtonText("Tick").onClick(() => {
            const how = tick();
            hap.setDesc({ capacitor: "Used: Obsidian's haptics.", vibrate: "Used: web vibration.", switch: "Used: the iOS 18 switch tick. Felt nothing? Then Obsidian has no haptics here.", "": "No haptics found on this device." }[how] ?? how);
        }));
        new Setting(c).setName(t("sDebug")).setDesc(t("sDebugDesc")).setHeading()
            .addToggle((x) => x.setValue(s.debugLog).onChange(async (v) => { s.debugLog = v; await save(); }));
        new Setting(c).setName(t("sDebugPath"))
            .addText((x) => x.setValue(s.debugPath).onChange(async (v) => { s.debugPath = v.trim() || DEFAULTS.debugPath; await save(); }));
    }
}
