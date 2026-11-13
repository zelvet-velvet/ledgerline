import { addIcon, Notice, Platform, Plugin, TAbstractFile, TFile, View, WorkspaceLeaf, setIcon } from "obsidian";
import { spriteIcons } from "./ui/pixel";
import { DebugLog } from "./debug";
import { MarketCalendar } from "./prices/calendar";
import { Store } from "./data/store";
import { pickSource, Prices } from "./prices";
import { Flows } from "./prices/flows";
import { Revenue } from "./prices/revenue";
import { AlertWatch } from "./alerts";
import { Flow } from "./prices/flow";
import { Brokers } from "./prices/brokers";
import { TickerSearch } from "./prices/search";
import { chartUnload } from "./ui/chart";
import { marketUnload } from "./ui/market";
import { investUnload } from "./pages/invest";
import { t } from "./i18n";
import { dayFrame } from "./pages/day";
import { Frame, Router } from "./router";
import { DEFAULTS, TabId, tabOrderOf, LedgerSettingTab, LedgerSettings } from "./settings";
import { VIEW_TYPE, LedgerView } from "./view";
import { capture, SCREENS } from "./capture";
import { registerDiagramIcons } from "./diagramicons";

const FUGLE_KEY = "ledgerline-fugle-key";

export default class LedgerlinePlugin extends Plugin {
    settings: LedgerSettings = DEFAULTS;
    debug!: DebugLog;
    router!: Router;
    store!: Store;
    prices!: Prices;
    flow!: Flow;   // order flow: footprint / volume heat tape, book, market map (prices/flow.ts)
    flows!: Flows;
    revenue!: Revenue;   // monthly revenue per Taiwan code (prices/revenue.ts)
    alerts!: AlertWatch; // price and date alerts, checked once a minute (alerts.ts)
    brokers!: Brokers;
    search!: TickerSearch;
    logMonth = { year: new Date().getFullYear(), month: new Date().getMonth() };   // the month the Log tab shows
    private dataTimer = 0;
    private home!: HTMLElement;


    async onload(): Promise<void> {
        await this.loadSettings();
        this.debug = new DebugLog(this);
        spriteIcons().forEach(([name, svg]) => addIcon(name, svg));   // the pixel sprites by name (zlpx-eye…), for Vellum's screens
        this.router = new Router(this.app, () => this.enabledTabs());
        this.store = new Store(this);
        this.prices = new Prices(() => this.app.loadLocalStorage(Prices.KEY), (v) => this.app.saveLocalStorage(Prices.KEY, v), () => this.dataChanged(), pickSource(() => this.fugleKey()), () => this.settings.taiwan);
        this.prices.useFugle(() => this.fugleKey());
        this.flow = new Flow(this.prices, () => this.fugleKey(), { load: (k) => this.app.loadLocalStorage(k), save: (k, v) => this.app.saveLocalStorage(k, v) });
        // holidays, typhoon days and US early closes (prices/calendar.ts): the badge and the background polling follow them
        this.prices.calendar = new MarketCalendar(() => this.app.loadLocalStorage(MarketCalendar.KEY), (v) => this.app.saveLocalStorage(MarketCalendar.KEY, v), () => this.prices.onLive?.(false));
        this.registerInterval(window.setInterval(() => this.prices.background(), 5 * 1000));
        this.prices.onLive = (opening) => this.views().forEach((v) => v.pricesMoved(opening));
        this.prices.loadSeries = () => this.app.loadLocalStorage(Prices.SERIES_KEY);
        this.prices.saveSeries = (v) => this.app.saveLocalStorage(Prices.SERIES_KEY, v);
        this.search = new TickerSearch(() => this.app.loadLocalStorage(TickerSearch.KEY), (v) => this.app.saveLocalStorage(TickerSearch.KEY, v), () => this.settings.taiwan);
        this.brokers = new Brokers(() => this.app.loadLocalStorage(Brokers.KEY), (v) => this.app.saveLocalStorage(Brokers.KEY, v));
        this.flows = new Flows(() => this.app.loadLocalStorage(Flows.KEY), (v) => this.app.saveLocalStorage(Flows.KEY, v));
        this.revenue = new Revenue(() => this.app.loadLocalStorage(Revenue.key), (v) => this.app.saveLocalStorage(Revenue.key, v));
        this.alerts = new AlertWatch(this);
        this.app.workspace.onLayoutReady(() => { void this.alerts.tick(); });
        this.registerInterval(window.setInterval(() => { void this.alerts.tick(); }, 60 * 1000));
        this.debug.note(`plugin load ${this.manifest.version} (${Platform.isMobile ? "mobile" : "desktop"})`);

        this.registerView(VIEW_TYPE, (leaf) => new LedgerView(leaf, this));
        this.addRibbonIcon("wallet", t("open"), () => { void this.activate(false); });
        this.addCommand({ id: "open", name: t("open"), callback: () => { void this.activate(false); } });
        this.addCommand({ id: "write-debug-log", name: t("writeDebug"), callback: () => { void this.debug.flush(true); } });
        // the app's pages as Vellum screens (capture.ts): the page on screen, or every tab's first page
        const shoot = async (all: boolean) => {
            const v = this.views().find((x) => x.contentEl.offsetWidth > 0); if (!v) { new Notice(t("capNoApp")); return; }   // the pane on screen
            const done: string[] = [];
            const one = async () => { const p = await capture(this.app, v.shot()); if (p) done.push(p); };
            if (all) await v.eachTab(one); else await one();
            if (done.length) new Notice(t("capDone", { n: done.length, dir: SCREENS }));
        };
        this.addCommand({ id: "capture-page", name: t("capPage"), callback: () => { void shoot(false); } });
        this.addCommand({ id: "capture-tabs", name: t("capTabs"), callback: () => { void shoot(true); } });
        this.addSettingTab(new LedgerSettingTab(this.app, this));
        registerDiagramIcons(this);   // Lucide icons in diagram icon nodes (Pele leaves the slot empty)

        // A config or log note changed: redraw (debounced, one redraw for a burst of changes, e.g. a sync)
        const onFile = (file: TAbstractFile, oldPath?: string) => { if (this.isData(file.path) || (oldPath && this.isData(oldPath))) this.dataChanged(); };
        this.registerEvent(this.app.metadataCache.on("changed", (f) => onFile(f)));
        this.registerEvent(this.app.vault.on("delete", (f) => onFile(f)));
        this.registerEvent(this.app.vault.on("rename", (f, old) => onFile(f, old)));
        this.registerEvent(this.app.workspace.on("active-leaf-change", () => this.updateBody()));
        this.registerEvent(this.app.workspace.on("file-open", () => this.updateBody()));   // the next day opens in the same tab
        this.registerEvent(this.app.workspace.on("layout-change", () => this.placeHome()));

        // Phone: a round button on every other page (daily notes, other notes) brings the app back (Obsidian's toolbar is hidden).
        // It lives inside that page, so it moves with the page and a sidebar slides over it like over the rest of the note.
        this.home = createEl("button", { cls: "zl-home", attr: { "aria-label": t("open") } });
        setIcon(this.home, "wallet");
        this.home.addEventListener("click", (e) => { e.preventDefault(); this.debug.note("home button"); void this.activate(false); });
        this.register(() => this.home.remove());

        // Phone: the Calendar plugin reacts to hover on a day (note preview), so iOS spends the first tap on that hover and only the
        // second opens the note. Hover from a finger is dropped for calendar days, so one tap opens the day.
        if (Platform.isMobile) {
            let touchAt = 0;
            const onDay = (e: Event) => (e.target as HTMLElement | null)?.closest?.(".calendar .day, #calendar-container .day") != null;
            this.registerDomEvent(document, "touchstart", () => { touchAt = Date.now(); }, { capture: true, passive: true });
            for (const ev of ["pointerover", "pointerenter", "mouseover", "mouseenter"] as const) {
                this.registerDomEvent(document, ev, (e: Event) => {
                    const touch = (e as PointerEvent).pointerType === "touch" || Date.now() - touchAt < 1000;
                    if (touch && onDay(e)) e.stopImmediatePropagation();
                }, { capture: true });
            }
        }

        this.app.workspace.onLayoutReady(() => {
            this.debug.note("layout ready");
            if (this.settings.openOnStartup) void this.activate(true);
            this.updateBody();
        });
    }

    onunload(): void {
        document.body.removeClass("zl-calm", "zl-bigflap", "zl-skin", "zl-red-up", "zl-us-ny");
        delete document.body.dataset.zlMove;
        window.clearTimeout(this.dataTimer);
        document.body.removeClass("zl-on", "zl-full");
        chartUnload();
        marketUnload();
        investUnload();
        this.flow?.stop();
        this.prices?.stop();
    }

    // the Fugle key lives in this device's local storage only (data.json is in git: the vault backup commits it)
    fugleKey(): string { return String(this.app.loadLocalStorage(FUGLE_KEY) ?? ""); }
    setFugleKey(v: string): void { this.app.saveLocalStorage(FUGLE_KEY, v.trim() || null); }

    enabledTabs(): TabId[] {
        const on = tabOrderOf(this.settings.tabOrder).filter((id) => this.settings.tabs[id]);
        return on.length ? on : ["log"];
    }

    private isData(path: string): boolean {
        const s = this.settings;
        return path.startsWith(s.dataFolder + "/") || path.startsWith(s.logFolder + "/") || path.startsWith("Invest/");   // Invest/: stock journals
    }

    private dataChanged(): void {
        window.clearTimeout(this.dataTimer);
        this.dataTimer = window.setTimeout(() => { this.views().forEach((v) => v.dataChanged()); }, 300);
    }

    views(): LedgerView[] {
        return this.app.workspace.getLeavesOfType(VIEW_TYPE).map((l) => l.view).filter((v): v is LedgerView => v instanceof LedgerView);
    }

    // Show the app: the existing screen if there is one, else in the current tab (phone, start-up) or a new tab (desktop).
    async activate(startup: boolean): Promise<void> {
        const ws = this.app.workspace;
        let leaf: WorkspaceLeaf | null = ws.getLeavesOfType(VIEW_TYPE)[0] ?? null;
        if (!leaf) {
            leaf = ws.getLeaf(startup || Platform.isMobile ? false : "tab");
            await leaf.setViewState({ type: VIEW_TYPE, active: true });
        }
        await ws.revealLeaf(leaf);
        ws.setActiveLeaf(leaf, { focus: true });
        this.debug.note(`activate (${startup ? "start-up" : "user"})`);
        this.updateBody();
    }

    // The app on screen, on a tab (and a page on top of it)
    async showInApp(tab: TabId, f?: Frame): Promise<void> {
        await this.activate(false);
        this.views()[0]?.go(tab, f);
    }

    // A note in a tab of its own; a tab that already shows it is brought forward instead of opening a second one
    async openPath(path: string, leafPath?: string): Promise<void> {
        const f = this.app.vault.getAbstractFileByPath(path);
        if (!(f instanceof TFile)) return;
        const ws = this.app.workspace;
        const has = (p?: string) => ws.getLeavesOfType("markdown").find((l) => (l.view as { file?: TFile }).file?.path === p);
        const open = has(path);
        if (open) { await ws.revealLeaf(open); ws.setActiveLeaf(open, { focus: false }); return; }
        const leaf = (leafPath && has(leafPath)) || ws.getLeaf("tab");   // from a daily note: the next day replaces it in the same tab
        await leaf.openFile(f, { state: { mode: "preview" } });
    }

    // A day's page in the app (its daily note is started first if it does not exist yet; the note only holds the day's data)
    async openDay(date: string): Promise<void> {
        try {
            if (!this.store.day(date)) await this.store.createDay(date);
            await this.showInApp("log", dayFrame(date));
        } catch (e) { new Notice(String(e instanceof Error ? e.message : e)); }
    }

    // body classes: zl-on while the app is the active screen; zl-full additionally hides Obsidian's phone toolbars
    private updateBody(): void {
        this.placeHome();
        const on = !!this.app.workspace.getActiveViewOfType(LedgerView);
        document.body.toggleClass("zl-on", on);
        document.body.toggleClass("zl-full", on && Platform.isMobile && this.settings.fullScreen);
    }

    // Put the return button into the page on screen (a note in the main area), or take it away while the app is on screen
    private placeHome(): void {
        if (!Platform.isMobile) return;
        const ws = this.app.workspace, v = ws.getActiveViewOfType(View);
        if (!v || v instanceof LedgerView || v.leaf.getRoot() !== ws.rootSplit) { if (!v || v instanceof LedgerView) this.home.remove(); return; }
        if (this.home.parentElement !== v.containerEl) { v.containerEl.addClass("zl-home-host"); v.containerEl.appendChild(this.home); }
    }

    async loadSettings(): Promise<void> {
        const d = (await this.loadData()) as Partial<LedgerSettings> | null;
        // a key saved by the first Fugle build (2026-11-05) moves to local storage; the old price-source choice is gone
        const old = d as (Partial<LedgerSettings> & { fugleKey?: string; priceSource?: string }) | null;
        if (old?.fugleKey) this.setFugleKey(old.fugleKey);
        const stale = !!old && ("fugleKey" in old || "priceSource" in old);
        if (old) { delete old.fugleKey; delete old.priceSource; }
        this.settings = { ...DEFAULTS, ...d, tabs: { ...DEFAULTS.tabs, ...(d?.tabs ?? {}) } };
        if (stale) await this.saveData(this.settings);
        // light / dark is Obsidian's own setting: never forced at start; the first time, the choice shows what Obsidian uses now
        if (!d?.theme) { const v = (this.app.vault as unknown as { getConfig?: (k: string) => unknown }).getConfig?.("theme"); this.settings.theme = v === "obsidian" ? "dark" : v === "moonstone" ? "light" : "auto"; }
        this.applyLook();
    }

    // Settings › Look: body classes read by the shared parts (ui/c.ts board, ui/pixel.ts calm) and the CSS
    private applyLook(): void {
        document.body.toggleClass("zl-calm", this.settings.calm);
        document.body.toggleClass("zl-bigflap", this.settings.bigNumber === "flap");
        document.body.dataset.zlMove = this.settings.pageMove;
        document.body.toggleClass("zl-skin", this.settings.skin);
        document.body.toggleClass("zl-red-up", this.settings.redUp);
        document.body.toggleClass("zl-us-ny", this.settings.usNy);
    }

    async saveSettings(): Promise<void> {
        await this.saveData(this.settings);
        this.applyLook();
        this.views().forEach((v) => v.settingsChanged());
        this.updateBody();
    }
}
