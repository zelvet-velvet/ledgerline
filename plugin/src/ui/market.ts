import type { App } from "obsidian";
import type { Cal } from "../calc/calendar";
import { readPrefs } from "../calc/chart";
import { marketClock, marketOpen } from "../calc/quotes";
import type { Prices } from "../prices";
import { chartRange, chartToday, holdingChart, price2 } from "./chart";
import { Flap } from "./flap";
import { h } from "./index";
import { calm } from "./pixel";

// Invest home's market card (market mode; owner 2026-11-10: "only an index's chart, the ticker chart's interaction, no
// drawing, a few intervals, BB and MA 20 / 60; when a market opens, roll to its index"):
// - tabs TAIEX · SOX · NASDAQ (a dot on the ones whose market trades now), then the index and today's % as a small split-flap,
//   then the ticker chart (ui/chart.ts; owner, same day, round 2: no interval strip, a pinch walks TODAY → 5 → 15 → 60 → D;
//   MA20 · BB · MA60 as small toggles on the bar line; the tabs switch the index (round 3: no swipe), a sideways drag
//   pans; hold for the crosshair; no tools, no full chart, no volume pane).
// - The lead rolls by itself: TAIEX while Taiwan trades, SOX while New York trades, else the market that closed last (TAIEX
//   after 13:30, SOX after New York's close). A tap on a tab holds that index until the lead would roll next.
// - TAIEX comes from TWSE (live MIS, the 5-second file for TODAY: prices/index.ts `taiex`); SOX and NASDAQ from Yahoo.
// - The card is one element for the plugin's life: a page redraw (a live price every 5 s) moves it into the new page, so the
//   chart never blanks or loses its pan; it polls its own index every 5 s while on screen (60 s while that market is shut).
interface Idx { tk: string; name: string; mkt: "TW" | "US" }
const IDX: Idx[] = [{ tk: "^TWII", name: "TAIEX", mkt: "TW" }, { tk: "^SOX", name: "SOX", mkt: "US" }, { tk: "^IXIC", name: "NASDAQ", mkt: "US" }];
const LADDER = ["I", "5m", "15m", "60m", "D"] as const;
const LEAD_KEY = "ledgerline-mkt-lead";
const NONE = " ".repeat(6);   // no value yet: dark blank tiles

export interface CardCtx { prices: Prices; app: App; cal(): Cal | undefined; chg(tk: string): { ch: number; pct: number } | null }
interface Card { el: HTMLElement; c: CardCtx; lead: string; gen: number; paint(): void; roll(): void }
let CARD: Card | null = null, TIMER = 0;

export const marketCard = (parent: HTMLElement, c: CardCtx): HTMLElement => {
    if (!CARD) CARD = build(c); else CARD.c = c;
    parent.appendChild(CARD.el);
    CARD.roll();
    CARD.paint();
    return CARD.el;
};
export const marketUnload = (): void => { window.clearInterval(TIMER); TIMER = 0; CARD?.el.remove(); CARD = null; };

const open = (c: CardCtx, mkt: "TW" | "US", now = new Date()): boolean => marketOpen(mkt === "TW" ? "^TWII" : "^SOX", now, c.cal());
// the index the card follows by itself: the market trading now, else the one that closed last
const autoLead = (c: CardCtx): string => {
    if (open(c, "TW")) return "^TWII";
    if (open(c, "US")) return "^SOX";
    const k = marketClock("^TWII", new Date());
    return k.weekday && k.min >= 13 * 60 + 30 ? "^TWII" : "^SOX";
};
// a tab picked by hand holds while the automatic lead stays what it was then
const readPick = (c: CardCtx): string | null => {
    try { const v = JSON.parse(String(c.app.loadLocalStorage(LEAD_KEY) ?? "null")) as { tk: string; auto: string } | null; return v && v.auto === autoLead(c) && IDX.some((i) => i.tk === v.tk) ? v.tk : null; } catch { return null; }
};

const build = (c0: CardCtx): Card => {
    const el = document.createElement("div");
    el.className = "zl-c-group zl-c-fill zl-mkt";
    const tabs = h(el, "div", "zl-mkt-tabs");
    const row = h(el, "div", "zl-mkt-row");
    const val = h(row, "span", "zl-mkt-v", "-");
    const f = new Flap("xs");
    row.appendChild(f.el);
    const host = h(el, "div", "zl-mkt-ch");
    // a finger on the card: the page does not redraw under it (view.ts pricesMoved), so a hold or a pan is never cut off
    const touch = (on: boolean) => el.toggleClass("zl-touching", on);
    el.addEventListener("pointerdown", () => touch(true), true);
    for (const ev of ["pointerup", "pointercancel"]) el.addEventListener(ev, () => touch(false), true);

    const card: Card = {
        el, c: c0, lead: "", gen: 0,
        roll() {
            const want = readPick(card.c) ?? autoLead(card.c);
            if (want !== card.lead) show(want);
        },
        paint() {
            const { prices } = card.c, q = prices.get(card.lead), d = card.c.chg(card.lead);
            tabs.querySelectorAll<HTMLElement>(".zl-mkt-tab").forEach((b) => {
                const i = IDX.find((x) => x.tk === b.dataset.k)!;
                b.toggleClass("is-on", i.tk === card.lead);
                b.toggleClass("is-live", open(card.c, i.mkt));
            });
            val.setText(q ? price2(Math.round(q.price * 100)) : "-");
            const p = d ? Math.round(d.pct * 100) / 100 : null;
            f.set(p === null ? NONE : `${p > 0 ? "+" : p < 0 ? "−" : ""}${Math.abs(p).toFixed(2)}%`);
            f.el.toggleClass("is-up", !!p && p > 0); f.el.toggleClass("is-down", !!p && p < 0);
        },
    };
    for (const i of IDX) {
        const b = h(tabs, "button", "zl-mkt-tab");
        b.dataset.k = i.tk;
        h(b, "i", "zl-mkt-dot");
        h(b, "span", "", i.name);
        b.addEventListener("click", (e) => {
            e.preventDefault();
            pick(i.tk, IDX.findIndex((x) => x.tk === i.tk) > IDX.findIndex((x) => x.tk === card.lead) ? 1 : -1);
        });
    }
    // a tab: that index holds until the automatic lead would roll next
    const pick = (tk: string, dir: 1 | -1) => {
        if (tk === card.lead) return;
        card.c.app.saveLocalStorage(LEAD_KEY, JSON.stringify({ tk, auto: autoLead(card.c) }));
        show(tk, dir);
    };
    // a new lead: its own chart (the interval stays per index: ui/chart.ts remembers it by ticker)
    const show = (tk: string, dir: 1 | -1 | 0 = 0) => {
        card.lead = tk;
        const gen = ++card.gen, { prices } = card.c;
        host.empty();
        prices.refresh([tk]);
        prices.refreshSeries(tk, "D");
        void prices.live(tk);
        holdingChart(host, { ticker: tk, currency: "", prices, prefs: readPrefs(null), cost: null, memo: [], height: 0, ladder: [...LADDER], chips: true, tools: false, fullChart: false, volume: false, alive: () => CARD === card && card.gen === gen });
        // slides in from the side swiped from, once: the class goes when it ends, or the next page redraw (which moves the card
        // into the new page) would play it again (owner, 2026-11-10: an update never slides in)
        const ch = host.firstElementChild;
        if (ch && dir && !calm()) { ch.addClass(dir > 0 ? "is-in-r" : "is-in-l"); ch.addEventListener("animationend", () => ch.removeClasses(["is-in-r", "is-in-l"]), { once: true }); }
        prices.onQuote((sym) => { if (CARD !== card || card.gen !== gen) return false; if (sym === prices.symbol(tk) && el.isConnected) card.paint(); return true; });
        card.paint();
    };
    // its own poll: every 5 s while its market trades, every 60 s while shut; the lead rolls when a market opens or closes.
    // A market opening puts its index back on TODAY (owner, 2026-11-10: intraday once the market opens, where the K effects run)
    let n = 0;
    const was = new Map<string, boolean>(IDX.map((i) => [i.tk, open(c0, i.mkt)]));
    window.clearInterval(TIMER);
    TIMER = window.setInterval(() => {
        if (CARD !== card || !el.isConnected || document.hidden) return;
        for (const x of IDX) {
            const on = open(card.c, x.mkt);
            if (on && was.get(x.tk) === false && chartRange(x.tk) !== "I") { chartToday(x.tk); if (x.tk === card.lead) show(x.tk); }
            was.set(x.tk, on);
        }
        card.roll();
        const i = IDX.find((x) => x.tk === card.lead);
        if (i && (open(card.c, i.mkt) || n % 12 === 0)) void card.c.prices.live(card.lead).then((moved) => { if (moved) card.paint(); });
        n++;
    }, 5000);
    return card;
};
