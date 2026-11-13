import { App, Modal } from "obsidian";
import { FIB_ALL, readPrefs } from "../calc/chart";
import { journalPath } from "../calc/invest";
import type { FM, Store } from "../data/store";
import { t } from "../i18n";
import { h } from "../ui";
import { base } from "../ui/sheet";

// Chart settings sheet (was the drawings sheet; drawings are no longer saved, owner 2026-11-04): the Fib levels shown,
// snap / cost line, and a note to the journal. Each change is written to Invest/<ticker>.md at once.

export class DrawingsSheet extends Modal {
    constructor(app: App, private store: Store, private ticker: string, private addNote: () => void) { super(app); }
    private get path() { return journalPath(this.ticker); }
    private fm(): FM | null { return this.store.fm(this.path); }
    private async write(fn: (f: FM) => void) { await this.store.update(this.path, (f) => { f.ticker = this.ticker; fn(f); }); }
    onOpen(): void { this.draw(); }
    onClose(): void { this.contentEl.empty(); }

    // redraw from what is written (the cache catches up a moment after a write: the change is applied here too)
    private draw(local?: (f: FM) => void): void {
        this.contentEl.empty();
        const f: FM = JSON.parse(JSON.stringify(this.fm() ?? {})) as FM;
        local?.(f);
        const P = readPrefs(f);
        const c = base(this, t("dTitle", { tk: this.ticker }), t("dSavedIn", { path: this.path }));
        c.addClass("zl-dsheet");
        const change = (fn: (f: FM) => void) => { this.draw(fn); void this.write(fn); };

        h(c, "div", "zl-dsec", t("dFibShown").toUpperCase());
        const chips = h(c, "div", "zl-dchips");
        for (const r of FIB_ALL) {
            const on = P.fib.some((x) => Math.abs(x - r) < 1e-9), loud = r === 0.5 || Math.abs(r - 0.618) < 1e-9;
            const b = h(chips, "button", "zl-dchip" + (on ? " is-on" : "") + (on && loud ? " is-loud" : ""), String(+(r * 100).toFixed(1)));
            b.addEventListener("click", () => change((x) => { const ch = (x.chart ?? {}) as FM; ch.fib = on ? P.fib.filter((y) => Math.abs(y - r) > 1e-9) : [...P.fib, r].sort((a, b2) => a - b2); x.chart = ch; }));
        }
        h(c, "div", "zl-drow-s", t("dFibNote"));

        h(c, "div", "zl-dsec", t("dDrawing").toUpperCase());
        const sw = (label: string, sub: string, on: boolean, key: "snap" | "cost") => {
            const r = h(c, "div", "zl-drow");
            const m = h(r, "div", "zl-drow-m");
            h(m, "div", "zl-drow-t", label); h(m, "div", "zl-drow-s", sub);
            const b = h(r, "button", "zl-dcheck" + (on ? " is-on" : ""));
            b.setAttribute("aria-label", label);
            b.addEventListener("click", () => change((x) => { const ch = (x.chart ?? {}) as FM; ch[key] = !on; x.chart = ch; }));
        };
        sw(t("dSnap"), t("dSnapS"), P.snap, "snap");
        sw(t("dCost"), t("dCostS"), P.cost, "cost");
        // no moving average row: the chart shows BB only (its MB is the 20-day average; owner, 2026-11-05)

        const bar = h(c, "div", "zl-sheet-btns zl-dbtns");
        h(bar, "button", "", t("close")).addEventListener("click", () => this.close());
        h(bar, "button", "mod-cta", t("dAddNote")).addEventListener("click", () => { this.close(); this.addNote(); });
    }
}
