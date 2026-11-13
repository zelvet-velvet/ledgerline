import { ItemView, Platform, TFile, WorkspaceLeaf } from "obsidian";
import type LedgerlinePlugin from "./main";
import { t } from "./i18n";
import { Action, PAGES, PageCtx, PageOut } from "./pages";
import { padPage } from "./pages/amount";
import type { Frame } from "./router";
import type { Shot } from "./capture";
import type { TabId } from "./settings";
import { h, icon, skeleton, titleText } from "./ui";
import { calm, hasSprite, sprite } from "./ui/pixel";
import { dock, liveTick } from "./ui/c";

export const VIEW_TYPE = "ledgerline";

interface Entry { out: PageOut; scroll: number; stale: boolean }

// The app screen: top bar, page area, tab bar. Only this code changes what is on screen, and a page is always swapped in one step:
// a cached page (or a skeleton on a first visit) appears in the same task as the tap, the fresh page replaces it when it is ready.
export class LedgerView extends ItemView {
    private appEl!: HTMLElement;
    private topEl!: HTMLElement;
    private backEl!: HTMLButtonElement;
    private topTitleEl!: HTMLElement;
    private actsEl!: HTMLElement;
    private scrollEl!: HTMLElement;
    private tabsEl!: HTMLElement;
    private fabEl!: HTMLElement;
    private cache = new Map<string, Entry>();
    private tokens = new Map<string, number>();
    private shown = "";   // key of the page on screen

    constructor(leaf: WorkspaceLeaf, private plugin: LedgerlinePlugin) { super(leaf); }

    getViewType(): string { return VIEW_TYPE; }
    getDisplayText(): string { return t("appName"); }
    getIcon(): string { return "wallet"; }

    private get router() { return this.plugin.router; }
    private key(tab: TabId = this.router.tab, f: Frame = this.router.top(tab)): string { return `${tab}/${f.key}`; }

    async onOpen(): Promise<void> {
        const c = this.contentEl;
        c.empty();
        c.addClass("zl-host");
        this.appEl = h(c, "div", "zl-app");
        this.setFull();
        this.topEl = h(this.appEl, "div", "zl-top");
        this.backEl = h(this.topEl, "button", "zl-btn zl-back");
        sprite(this.backEl, "back");
        this.backEl.setAttribute("aria-label", t("back"));
        this.backEl.addEventListener("click", (e) => { e.preventDefault(); this.back(); });
        this.topTitleEl = h(this.topEl, "div", "zl-top-title");
        this.actsEl = h(this.topEl, "div", "zl-acts");
        this.scrollEl = h(this.appEl, "div", "zl-scroll");
        this.registerDomEvent(this.scrollEl, "scroll", () => this.topEl.toggleClass("is-scrolled", this.scrollEl.scrollTop > 36), { passive: true });
        this.fabEl = h(this.appEl, "div", "zl-fab");
        this.tabsEl = h(this.appEl, "div", "zl-tabs");
        // a turned phone: the dock lines up with the left column of a two-column page (CSS reads --zl-dock-x / --zl-dock-w)
        const ro = new ResizeObserver(() => this.placeDock());
        ro.observe(this.scrollEl);
        this.register(() => ro.disconnect());
        // Drags reach Obsidian: pull down opens the command palette, the edge swipes open the sidebars (owner, 2026-11-03).
        // no double-tap zoom / text selection on the app chrome; a dblclick never does anything here
        this.registerDomEvent(this.appEl, "dblclick", (e) => { e.preventDefault(); e.stopPropagation(); });
        // except on chart pages (owner, 2026-11-04): there a drag is the chart's, so Obsidian never hears the touch
        for (const t of ["touchstart", "touchmove", "touchend"] as const) this.registerDomEvent(this.appEl, t, (e) => { if (this.appEl.hasClass("is-still")) e.stopPropagation(); }, { passive: true });
        this.buildTabs();
        this.plugin.debug.note(`view open, tab ${this.router.tab}`);
        this.draw();
        window.setTimeout(() => this.logLayout(), 1000);
        // a turn of the phone: the layout is logged again once it settles (sideways spacing is checked from the log)
        let turnT = 0;
        if (Platform.isMobile) this.registerDomEvent(window, "resize", () => { window.clearTimeout(turnT); turnT = window.setTimeout(() => { this.placeDock(); this.logLayout(); }, 1200); });
    }

    // Debug: where the screen and each wrapper around it start, and the spacing they add (for layout gaps on phones)
    private logLayout(): void {
        const lines: string[] = [`layout: window ${window.innerWidth}x${window.innerHeight}, body ${document.body.className.split(" ").filter((c) => /mobile|phone|ios|floating|zl-|ze-/.test(c)).join(" ")}`];
        for (let el: HTMLElement | null = this.topEl; el && el !== document.documentElement; el = el.parentElement) {
            const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
            lines.push(`  ${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 4).join(".")} top ${Math.round(r.top)} h ${Math.round(r.height)} pad-top ${cs.paddingTop} margin-top ${cs.marginTop} pos ${cs.position}${cs.transform !== "none" ? " transform " + cs.transform : ""}`);
        }
        const tr = this.topEl.getBoundingClientRect(), tt = this.scrollEl.querySelector(".zl-title")?.getBoundingClientRect();
        lines.push(`  top bar ${Math.round(tr.top)}-${Math.round(tr.bottom)}, large title at ${tt ? Math.round(tt.top) : "-"}, tabs at ${Math.round(this.tabsEl.getBoundingClientRect().top)}`);
        // across (a turned phone): the safe insets, where the app, the left column and the dock sit
        const probe = h(document.body, "div");
        probe.style.cssText = "position:fixed;visibility:hidden;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)";
        const ps = getComputedStyle(probe), ins = `safe l ${ps.paddingLeft} r ${ps.paddingRight} b ${ps.paddingBottom}`;
        probe.remove();
        const box = (el: Element | null) => { if (!el) return "-"; const b = el.getBoundingClientRect(); return `${Math.round(b.left)}..${Math.round(b.right)} y ${Math.round(b.top)}..${Math.round(b.bottom)}`; };
        const as = getComputedStyle(this.appEl);
        lines.push(`  across: ${ins}; app ${box(this.appEl)} pad-l ${as.paddingLeft} app-x ${as.getPropertyValue("--zl-app-x")}; left col ${box(this.scrollEl.querySelector(".zl-page > .zl-c-top"))}; dock ${box(this.fabEl)}; tabs ${box(this.tabsEl)}`);
        for (let el: HTMLElement | null = this.appEl.parentElement; el && el !== document.documentElement; el = el.parentElement) {
            const cs = getComputedStyle(el);
            if (cs.paddingLeft !== "0px" || cs.marginLeft !== "0px") lines.push(`  ${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 3).join(".")} pad-l ${cs.paddingLeft} margin-l ${cs.marginLeft}`);
        }
        this.plugin.debug.note(lines.join("\n"));
        void this.plugin.debug.flush();
    }

    async onClose(): Promise<void> { this.cache.clear(); this.plugin.debug.note("view closed"); }

    // Phone full screen is a property of the screen itself (set when it is built), not of which tab Obsidian says is active:
    // that news arrives a moment after the screen shows, and the layout jumped in between.
    private setFull(): void { this.appEl.toggleClass("is-full", Platform.isMobile && this.plugin.settings.fullScreen); }

    // ---- capture for Vellum (capture.ts): the page on screen as named parts, and where it sits in the screen map
    shot(): Shot {
        const tab = this.router.tab, stack = this.router.stack(tab), f = this.router.top(tab);
        const idOf = (fr: Frame | undefined) => fr && fr.key !== "root" ? `${tab}-${fr.key.split(":")[0].replace(/[^a-z0-9-]+/gi, "-")}` : tab;
        // the page's sections: its children (through any single wrapper), named by their first words or their class
        let pageEl = this.scrollEl.firstElementChild as HTMLElement | null;
        while (pageEl && pageEl.children.length === 1) pageEl = pageEl.firstElementChild as HTMLElement;
        const nameOf = (el: HTMLElement) => (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 24) || ([...el.classList].find((c) => c.startsWith("zl-")) ?? "section").replace(/^zl-/, "");
        const kindOf = (el: HTMLElement) => el.querySelector("canvas, svg.zl-chart, .zl-fchart") ? "card" : el.querySelector(".zl-flap, .zl-board") ? "hero" : el.querySelector("button, input") && !el.querySelector(".zl-row") ? "action" : "list";
        const parts: [string, string, HTMLElement][] = [["Top bar", "nav", this.topEl]];
        for (const c of Array.from(pageEl?.children ?? []) as HTMLElement[]) parts.push([nameOf(c), kindOf(c), c]);
        parts.push(["Dock", "action", this.fabEl], ["Tab bar", "nav", this.tabsEl]);
        const below = stack.length > 1 ? stack[stack.length - 2] : undefined;
        return { appEl: this.appEl, parts, id: idOf(f), name: f.key === "root" ? t(PAGES[tab].label) : f.title || f.key, parent: f.key === "root" ? undefined : idOf(below) };
    }
    // every enabled tab's first page in turn (for capture): calls back once each page has drawn and settled
    async eachTab(cb: () => Promise<void>): Promise<void> {
        for (const id of this.plugin.enabledTabs()) {
            this.go(id);
            await new Promise((r) => window.setTimeout(r, 2500));
            await cb();
        }
    }

    // ---- tab bar
    buildTabs(): void {
        this.router.fix();
        this.tabsEl.empty();
        const on = this.plugin.enabledTabs();
        this.tabsEl.style.setProperty("--n", String(on.length));
        for (const id of on) {
            const def = PAGES[id];
            const b = h(this.tabsEl, "button", "zl-tab" + (id === this.router.tab ? " is-on" : ""));
            b.dataset.tab = id;
            sprite(b, id);
            h(b, "span", "zl-tab-l", t(def.label));
            b.addEventListener("click", (e) => { e.preventDefault(); this.tapTab(id); });
        }
    }

    private markTab(): void {
        this.tabsEl.querySelectorAll<HTMLElement>(".zl-tab").forEach((b) => b.toggleClass("is-on", b.dataset.tab === this.router.tab));
    }

    // Open a tab (on its first page, or with one page on top), e.g. from a daily note
    go(tab: TabId, f?: Frame): void {
        const kind = tab !== this.router.tab ? "tab" : f ? "push" : "pop";
        this.router.setTab(tab);
        this.router.popToRoot();
        if (f) this.router.push(f);
        this.markTab();
        this.move(kind, () => this.draw());
    }

    tapTab(id: TabId): void {
        this.plugin.debug.note(`tab tap ${id} (on ${this.router.tab}, depth ${this.router.depth()})`);
        if (id === this.router.tab) {
            if (this.router.popToRoot()) this.move("pop", () => this.draw());
            else this.scrollEl.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }
        this.router.setTab(id);
        this.markTab();
        this.move("tab", () => this.draw());
    }

    // Design Rules, moving between pages (round 3): no cover over the page. The old page goes at once; the new page's groups
    // come in one after another with a short move (deeper: from the right, Back: from the left, tab: up) and a fade, about 0.3 s
    // in all. Applied when the page mounts (also when the fresh page replaces the skeleton a moment later).
    private scrollSaved = false;   // the page being left already gave its scroll position
    private enter: "push" | "pop" | "tab" | null = null;
    private enterT = 0;
    private move(kind: "push" | "pop" | "tab", swap: () => void): void {
        const prev = this.cache.get(this.shown);
        if (prev) prev.scroll = this.scrollEl.scrollTop;
        this.scrollSaved = true;
        this.enter = calm() ? null : kind;
        window.clearTimeout(this.enterT);
        this.enterT = window.setTimeout(() => { this.enter = null; }, 300);
        // deeper / Back (owner, 2026-11-05: sub pages need a transition): a still copy of the page being left stays in place;
        // deeper, the new page slides in from the right over it while it eases left and dims; Back, the copy slides off to the
        // right and uncovers the page below easing back in. A tab change has no slide (the page fades, the board sweeps).
        // Settings › Page move: "cascade" keeps no copy, the new page's rows come in one after another instead (c.css)
        const ghost = kind !== "tab" && !calm() && document.body.dataset.zlMove !== "cascade" ? this.ghostOf() : null;
        swap();
        if (!ghost) return;
        const s = this.scrollEl;
        this.appEl.appendChild(ghost);
        s.removeClass("is-push", "is-pop"); void s.offsetWidth;
        ghost.addClass(kind === "push" ? "is-under" : "is-over");
        s.addClass(kind === "push" ? "is-push" : "is-pop");
        window.clearTimeout(this.slideT);
        this.slideT = window.setTimeout(() => { s.removeClass("is-push", "is-pop"); this.appEl.querySelectorAll(".zl-ghost").forEach((g) => g.remove()); }, 340);
    }
    private slideT = 0;
    private ghostOf(): HTMLElement | null {
        const s = this.scrollEl, pg = s.firstElementChild as HTMLElement | null;
        if (!pg) return null;
        this.appEl.querySelectorAll(".zl-ghost").forEach((g) => g.remove());
        const g = document.createElement("div");
        g.className = "zl-ghost";
        const cs = getComputedStyle(s);
        Object.assign(g.style, { top: `${s.offsetTop}px`, left: `${s.offsetLeft}px`, width: `${s.offsetWidth}px`, height: `${s.offsetHeight}px`, right: "auto", padding: cs.padding, boxSizing: cs.boxSizing });
        const c = pg.cloneNode(true) as HTMLElement;
        c.removeClass("zl-enter");
        c.style.transform = `translateY(${-s.scrollTop}px)`;
        g.appendChild(c);
        return g;
    }
    private animateIn(el: HTMLElement): void {
        if (!this.enter) return;
        el.dataset.enter = this.enter;
        let i = 0;
        for (const c of Array.from(el.children) as HTMLElement[]) {
            if (c.hasClass("zl-title-row")) continue;
            c.style.setProperty("--e", String(Math.min(i++, 6)));
        }
        el.removeClass("zl-enter"); void el.offsetWidth; el.addClass("zl-enter");
        // a tab change also refreshes the page's big number board (Design Rules, Motion: the board sweeps in again)
        if (this.enter === "tab") el.querySelectorAll(".zl-board").forEach((b) => b.dispatchEvent(new Event("zl-replay")));
        // every split-flap on a page coming on screen (open, Back, tab) appears again from blank cards (owner, 2026-11-06);
        // the big number's flap already replays with its board above
        el.querySelectorAll(".zl-flap").forEach((f) => { if (!(this.enter === "tab" && f.closest(".zl-board"))) f.dispatchEvent(new Event("zl-flap-replay")); });
    }

    private openSettings(): void {
        const s = (this.app as unknown as { setting?: { open(): void; openTabById(id: string): void } }).setting;
        if (!s) return;
        s.open();
        s.openTabById(this.plugin.manifest.id);
    }

    // ---- page stack
    push(f: Frame): void {
        this.plugin.debug.note(`push ${this.router.tab}/${f.key}`);
        if (this.router.push(f)) this.move("push", () => this.draw());
    }

    replace(f: Frame): void {
        this.plugin.debug.note(`replace ${this.router.tab}/${f.key}`);
        if (this.router.replace(f)) this.draw();
    }

    back(): void {
        this.plugin.debug.note(`back on ${this.key()}`);
        if (this.router.pop()) this.move("pop", () => this.draw());
    }

    // ---- drawing
    // Synchronous: what is on screen changes in this task (cached page or skeleton); a fresh page follows when needed.
    draw(): void {
        const key = this.key();
        const hit = this.cache.get(key);
        if (hit) this.mount(key, hit, true);
        else this.mountSkeleton(key);
        if (!hit || hit.stale) void this.render(key);
    }

    // Data changed (a config or log note): every cached page is out of date; the one on screen is redrawn in place.
    dataChanged(): void {
        this.cache.forEach((e) => { e.stale = true; });
        this.plugin.debug.note(`data changed, redraw ${this.key()}`);
        void this.render(this.key());
    }

    // A background quote moved while its market trades: Invest pages redraw so every total and percent follows (rows stay
    // still, only changed numbers flip); chart and holding pages change in place (their quote listeners)
    // opening: the market just opened (or closed: false) — a normal redraw; true at the open also sweeps the board once
    // (the opening bell); undefined = a price update: the live tick (Design Rules › Motion › Live tick)
    pricesMoved(opening?: boolean): void {
        const k = this.key();
        // only the pages that show live prices (owner, 2026-11-05: nothing under Invest may blink on a tick): home, holdings,
        // watchlist. Chart and holding pages change in place; flows, brokers, trades, journal and rules show no live price
        // (redrawing them every 5 s re-lit their bars). The others are only marked stale for their next visit.
        // a watchlist row being dragged, a finger on Invest home's chart or marquee (zl-touching): no redraw under the finger (the drop saves the order, and that redraws)
        if (this.scrollEl.querySelector(".zl-qrows.is-reorder, .zl-touching")) { this.cache.forEach((e) => { e.stale = true; }); return; }
        if (!/^invest\/(root|holdings|watch)$/.test(k)) { if (k.startsWith("invest")) this.cache.forEach((e) => { e.stale = true; }); return; }
        this.cache.forEach((e) => { e.stale = true; });
        liveTick(opening === undefined);
        void this.render(k).finally(() => {
            liveTick(false);
            if (opening && this.key() === k) this.scrollEl.querySelectorAll(".zl-board").forEach((b) => b.dispatchEvent(new Event("zl-replay")));
        });
    }

    // Settings changed: tabs may differ and every page may look different.
    settingsChanged(): void {
        this.setFull();
        this.cache.clear();
        this.buildTabs();
        this.draw();
    }

    private async render(key: string): Promise<void> {
        const [tab, ...rest] = key.split("/") as [TabId, ...string[]];
        const frame = this.router.stack(tab).find((f) => f.key === rest.join("/")) ?? { key: "root", title: "" };
        const mine = (this.tokens.get(key) ?? 0) + 1;
        this.tokens.set(key, mine);
        let out: PageOut;
        try {
            const ctx: PageCtx = { app: this.app, plugin: this.plugin, frame, push: (f) => this.push(f), replace: (f) => this.replace(f), pop: () => this.back(),
                redraw: () => { void this.render(this.key()); },
                goTab: (id) => { this.router.popToRoot(); if (id !== this.router.tab) this.tapTab(id); else this.draw(); },
                openNote: (path) => { void this.plugin.openPath(path); },
            };
            // a number pad page ("pad:…", opened by openPad on any tab) is drawn the same way everywhere
            out = frame.key.startsWith("pad:") ? padPage(ctx) : await PAGES[tab].render(ctx);
        } catch (e) {
            this.plugin.debug.error(`render ${key}`, e);
            out = this.errorPage(e, key);
        }
        if (this.tokens.get(key) !== mine) return;   // a newer render of this page started meanwhile: it wins
        const old = this.cache.get(key);
        const entry: Entry = { out, scroll: old?.scroll ?? 0, stale: false };
        this.cache.set(key, entry);
        if (this.key() === key) this.mount(key, entry, false);
    }

    private mount(key: string, e: Entry, restoreScroll: boolean): void {
        const prev = this.cache.get(this.shown);
        if (prev && this.shown !== key && !this.scrollSaved) prev.scroll = this.scrollEl.scrollTop;
        this.scrollSaved = false;
        const same = this.shown === key;
        const keep = this.scrollEl.scrollTop;
        // a redraw of the page on screen (new data, a watchlist add): rows that were already there stay still, only new
        // ones reveal (Design Rules › Motion: nothing re-enters); a row is known by its key (data-k: a ticker row's numbers change
        // with every live price), else its name
        if (same) {
            // a kept row trades zl-in for zl-kept, so the next redraw still finds it (owner, 2026-11-05: Watchlist rows blinked on
            // every second tick and on a sort change: kept rows had lost zl-in and were not matched any more). The class list
            // without those two, plus the key, says which row it is (Design Rules › Motion › Rows).
            const sig = (r: Element) => `${Array.from(r.classList).filter((c) => c !== "zl-in" && c !== "zl-kept").join(" ")}|${(r as HTMLElement).dataset.k ?? r.querySelector(".zl-fig-k")?.textContent ?? r.textContent}`;
            const had = new Set(Array.from(this.scrollEl.querySelectorAll(".zl-in, .zl-kept"), sig));
            if (had.size) e.out.el.querySelectorAll(".zl-in").forEach((r) => { if (had.has(sig(r))) { r.removeClass("zl-in"); r.addClass("zl-kept"); } });
        }
        // the page's key on its element: the open search bar (ui/search.ts) tells a redraw of the same page from a new page
        e.out.el.dataset.page = key;
        e.out.el.toggleClass("zl-invest", this.router.tab === "invest");   // Invest pages: market mode's up / down colours
        this.scrollEl.replaceChildren(e.out.el);
        this.animateIn(e.out.el);
        this.scrollEl.toggleClass("is-fit", e.out.el.hasClass("zl-c-stack"));
        this.appEl.toggleClass("is-still", !!e.out.still);
        this.shown = key;
        this.scrollEl.scrollTop = same && !restoreScroll ? keep : e.scroll;
        this.topEl.toggleClass("is-scrolled", this.scrollEl.scrollTop > 36);
        const acts = e.out.actions ?? [];
        this.setBar(e.out.title, acts.filter((a) => !a.dock), e.out.badge);
        this.setFab(e.out.fab, acts.filter((a) => a.dock));
        if (e.out.el.hasClass("zl-c-stack")) window.requestAnimationFrame(() => this.fit(e.out.el, key, e.out.trim));
        else {   // Balance: a short list page centres its content in the room under the masthead
            const el = e.out.el;
            el.removeClass("is-short");
            window.requestAnimationFrame(() => { if (el.isConnected && el.scrollHeight < this.scrollEl.clientHeight * 0.7) el.addClass("is-short"); });
        }
        if (!this.firstShown) { this.firstShown = true; this.plugin.debug.note(`first page shown ${key}`); }
    }
    private firstShown = false;

    // A one-screen page must never scroll (Design Rules, Room). Phones differ by a few px, so after it is drawn: if it is taller
    // than the room, tighten its spacing one step at a time (gaps, then row padding) until it fits; only past the last step does
    // it scroll. The step is kept on the page, so a redraw starts from it.
    private fit(el: HTMLElement, key: string, trim?: () => boolean): void {
        const s = this.scrollEl;
        if (!el.isConnected) return;
        const over = () => el.scrollHeight - s.clientHeight;
        for (const step of ["", "is-tight", "is-tighter"]) {
            if (step) el.addClass(step);
            if (over() <= 0) break;
        }
        // still too tall at the tightest: the page drops items it can do without (e.g. holdings past the first few)
        for (let i = 0; i < 20 && over() > 0 && trim?.(); i++) { /* drop one more */ }
        s.toggleClass("is-fit", over() <= 0);   // fits: no scrolling at all; still over: it may scroll rather than cut rows
        s.scrollTop = 0;
        this.plugin.debug.note(`fit ${key}: content ${el.scrollHeight} / room ${s.clientHeight}${el.hasClass("is-tighter") ? " (tighter)" : el.hasClass("is-tight") ? " (tight)" : ""}`);
    }

    private mountSkeleton(key: string): void {
        const prev = this.cache.get(this.shown);
        if (prev && this.shown !== key && !this.scrollSaved) prev.scroll = this.scrollEl.scrollTop;
        this.scrollSaved = false;
        const f = this.router.top();
        const def = PAGES[this.router.tab];
        const title = f.key === "root" ? t(def.label) : f.title;
        this.scrollEl.replaceChildren(skeleton(title));
        this.shown = key;
        this.scrollEl.scrollTop = 0;
        this.topEl.removeClass("is-scrolled");
        this.setBar(title, []);
        // the bottom bar keeps its buttons until the page is there (a few ms), then swaps them in one frame
    }

    // the bottom bar: Back on deeper pages (to the page below), the page's action beside it
    private setFab(a: Action | undefined, side: Action[] = []): void {
        const depth = this.router.depth(), st = this.router.stack();
        const below = depth > 1 ? st[st.length - 2] : depth === 1 ? { key: "root", title: "" } : undefined;
        const to = below ? (below.key === "root" ? t(PAGES[this.router.tab].label) : below.title) : "";
        dock(this.fabEl, {
            back: depth > 0 ? { to: `${t("back")} · ${to}`, onTap: () => this.back() } : undefined,
            act: a ? { text: a.text ?? a.label, label: a.label, hint: a.hint, loud: a.loud, onTap: () => { this.plugin.debug.note(`dock ${a.label}`); a.onTap(); } } : undefined,
            side: side.map((s) => ({ icon: s.icon ?? "coin", label: s.label, onTap: () => { this.plugin.debug.note(`dock ${s.label}`); s.onTap(); } })),
        });
        this.appEl.toggleClass("has-fab", this.fabEl.hasClass("is-on"));
        window.requestAnimationFrame(() => this.placeDock());
    }

    // the left column's edges, measured (its width depends on the page, the notch side and the rail)
    private placeDock(): void {
        // the page's top, else (a page without one) its first group, which then takes the left column
        // where the app starts on the screen: a turned phone pads only the notch space the app does not already start past
        const a = this.appEl.getBoundingClientRect();
        this.appEl.style.setProperty("--zl-app-x", `${Math.max(0, Math.round(a.left))}px`);
        const col = this.scrollEl.querySelector<HTMLElement>(".zl-page > .zl-c-top") ?? this.scrollEl.querySelector<HTMLElement>(".zl-page.zl-c-list > .zl-title-row + .zl-c-group");
        if (!col) return;
        const r = col.getBoundingClientRect();
        if (!r.width) return;
        this.appEl.style.setProperty("--zl-dock-x", `${Math.round(r.left - a.left)}px`);
        this.appEl.style.setProperty("--zl-dock-w", `${Math.round(r.width)}px`);
    }

    private setBar(title: string, actions: Action[], badge?: PageOut["badge"]): void {
        titleText(this.topTitleEl, title);
        // a new badge each time: its dot blinks once per redraw (a live update)
        if (badge) h(this.topTitleEl, "span", "zl-live" + (badge.live ? " is-on" : ""), badge.text);
        this.topEl.toggleClass("has-back", this.router.depth() > 0);
        // redesign C: the masthead is always there (title, Back on deeper pages, the page's actions, the gear on first pages)
        const first = this.router.depth() === 0;
        this.appEl.addClass("has-bar");
        this.topEl.toggleClass("is-first", first);
        const fill = (host: HTMLElement) => {
            host.empty();
            for (const a of actions) {
                const b = h(host, "button", a.text && !a.icon ? "zl-btn is-text" : "zl-btn");
                b.setAttribute("aria-label", a.label);
                if (a.icon) { if (hasSprite(a.icon)) sprite(b, a.icon); else icon(b, a.icon); }
                if (a.text) h(b, "span", "", a.text);
                b.addEventListener("click", (ev) => { ev.preventDefault(); this.plugin.debug.note(`action ${a.label}`); a.onTap(); });
            }
            if (first && this.router.tab === "log") {   // settings only on Log's first page (owner, 2026-11-03)
                const g = h(host, "button", "zl-btn zl-gear");
                g.setAttribute("aria-label", t("settings"));
                sprite(g, "settings");
                g.addEventListener("click", (ev) => { ev.preventDefault(); this.openSettings(); });
            }
        };
        fill(this.actsEl);
    }

    private errorPage(e: unknown, key: string): PageOut {
        const el = h(null, "div", "zl-page");
        const box = h(el, "div", "zl-empty");
        icon(box, "alert-triangle", "zl-empty-ic");
        h(box, "div", "zl-empty-t", t("pageFailed"));
        h(box, "div", "zl-empty-s", String(e instanceof Error ? e.message : e).slice(0, 200));
        const retry = h(box, "button", "zl-btn", t("retry"));
        retry.addEventListener("click", () => { void this.render(key); });
        return { title: t("pageFailed"), el };
    }
}
