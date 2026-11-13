import type { App } from "obsidian";
import { TAB_ORDER, TabId } from "./settings";

// One page of a tab's stack. The tab's first page is { key: "root" }.
export interface Frame { key: string; title: string; params?: Record<string, string | number> }

interface Saved { tab: TabId; stacks: Partial<Record<TabId, Frame[]>>; t: number }
const KEY = "ledgerline-nav";
const STACK_TTL = 30 * 60 * 1000;   // detail pages are restored for 30 minutes after a restart; the tab always is

// Which tab is open and the page stack of every tab. Plain state, no DOM.
export class Router {
    tab: TabId = "log";
    private stacks: Partial<Record<TabId, Frame[]>> = {};

    constructor(private app: App, private enabled: () => TabId[]) {
        try {
            const s = this.app.loadLocalStorage(KEY) as Saved | null;
            if (s && TAB_ORDER.includes(s.tab)) {
                this.tab = s.tab;
                if (Date.now() - s.t < STACK_TTL) this.stacks = s.stacks || {};
            }
        } catch { /* fresh start */ }
        this.fix();
    }

    // the open tab must be an enabled one
    fix(): void {
        const on = this.enabled();
        if (!on.includes(this.tab)) this.tab = on.includes("log") ? "log" : on[0] ?? "log";
    }

    stack(tab: TabId = this.tab): Frame[] { return (this.stacks[tab] ??= []); }
    top(tab: TabId = this.tab): Frame { const s = this.stack(tab); return s[s.length - 1] ?? { key: "root", title: "" }; }
    depth(tab: TabId = this.tab): number { return this.stack(tab).length; }

    setTab(tab: TabId): void { this.tab = tab; this.save(); }
    push(f: Frame): boolean {
        if (this.top().key === f.key) return false;   // a double tap must not push the same page twice
        this.stack().push(f);
        this.save();
        return true;
    }
    // swap the page on top (e.g. the previous / next day) without going back first
    replace(f: Frame): boolean {
        if (!this.depth()) return this.push(f);
        this.stack()[this.depth() - 1] = f;
        this.save();
        return true;
    }
    pop(): boolean { if (!this.depth()) return false; this.stack().pop(); this.save(); return true; }
    popToRoot(): boolean { if (!this.depth()) return false; this.stacks[this.tab] = []; this.save(); return true; }

    private save(): void {
        try { this.app.saveLocalStorage(KEY, { tab: this.tab, stacks: this.stacks, t: Date.now() } satisfies Saved); } catch { /* ignore */ }
    }
}
