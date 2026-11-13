// Invest pages, shared: signs, the page context X, the market badge, the change lines (split-flaps) and today's move per ticker
import { Warning, Thought, Portfolio, Position, Trade, revalue } from "../calc/invest";
import { num, today } from "../format";
import { t } from "../i18n";
import { h, page } from "../ui";
import { liveOf, price2 } from "../ui/chart";
import { Flap } from "../ui/flap";
import { dayChange } from "../calc/chart";
import { isTwSym } from "../calc/quotes";
import type { PageCtx } from "./index";

export const PLAN_KEY = "investment";   // the savings-plan line that feeds investing
// signs: + and the true minus (U+2212) everywhere on Invest, as the split-flaps and today's price move write it
export const MINUS = "\u2212";
export const signed = (n: number) => `${n > 0 ? "+" : n < 0 ? MINUS : ""}${num(Math.abs(n))}`;
// a percent with two decimals (owner, 2026-11-05), signed; a move that rounds to 0.00 has no sign
export const pctS = (n: number) => { const r = Math.round(n * 100) / 100; return `${r > 0 ? "+" : r < 0 ? MINUS : ""}${Math.abs(r).toFixed(2)}%`; };
export const qty = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 4 });

export interface X {
    ctx: PageCtx; P: Portfolio; cur: string; cash: number; warns: Warning[]; cap: number; fx(c: string): number; links: Map<string, { booked: number; diff: number }>;
    trade(preset?: string, o?: { price?: number; type?: "BUY" | "SELL" }): void; editThesis(tk: string): void; editTrade(p: Position, tr: Trade): void; editPlan(p: Position): void; addThought(tk: string): void; journal(tk: string): Thought[]; addWatch(): void; dropWatch(tk: string): Promise<void>; moveWatch(order: string[]): Promise<void>; search(from: HTMLElement): void; watchOn(tk: string): Promise<void>;
}

// the masthead badge (owner, 2026-11-05): which market trades now (TW TRADING, US TRADING), else when the next one opens
// (US OPENS 22:30 today, TW OPENS MON 09:00 on a later day; device time; holidays, typhoon days and early closes from the
// market calendar, calc/calendar.ts). How fresh a price is shows on its chart page.
export const WHY = { holiday: "whyHoliday", typhoon: "whyTyphoon", notrade: "whyNoTrade", early: "whyEarly" } as const;
export const liveBadge = (x: X): { text: string; live: boolean } | undefined => {
    const s = x.ctx.plugin.prices.liveState();
    if (s.open.length) return { text: t("liveOn", { m: s.open.join(" · ") }).toUpperCase(), live: true };
    // a weekday in the usual hours with the market shut (owner, 2026-11-05): TW CLOSED · TYPHOON, US CLOSED · HOLIDAY
    if (s.closed) return { text: t("liveClosed", { m: s.closed.mkt, w: t(WHY[s.closed.why]) }).toUpperCase(), live: false };
    if (!s.next) return undefined;
    const d = new Date(s.next.at), hm = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const when = day === today() ? hm : `${d.toLocaleDateString("en-US", { weekday: "short" })} ${hm}`;
    return { text: t("liveOff", { m: s.next.mkt, t: when }).toUpperCase(), live: false };
};
export const findAct = (x: X, el: HTMLElement) => ({ icon: "search", label: t("iFind"), dock: true, onTap: () => x.search(el) });   // beside + TRADE in the bottom bar

// The change line (owner, 2026-11-04, like Apple's Stocks): a sideways swipe on a row switches every one on the page together, today's % → today's
// price change → (holdings) your profit; remembered on the device. Watchlist tickers stop at the price change.
// t = the texts per kind, hot = down, k = its label, ret = your return (not today's move: its own tile colour)
// tk / re: the ticker and how to work it out again (a new quote changes the line in place)
export interface Chg { t: string[]; hot: boolean[]; k: string[]; ret: boolean[]; tk?: string; re?: () => Chg }
export const CHG_KEY = "ledgerline-chg";
export let CHG = -1;
export const CHGS = new WeakMap<HTMLElement, { c: Chg; f: Flap }>();
export const CHG_FLAPS = new Map<string, Flap>();   // one small split-flap per list and ticker: a new price flips from the old number
export const chgMode = (x: X): number => { if (CHG < 0) CHG = Number(x.ctx.app.loadLocalStorage(CHG_KEY)) || 0; return CHG; };
export const paintChg = (e: HTMLElement, m: number) => {
    const o = CHGS.get(e);
    if (!o) return;
    const i = Math.min(m, o.c.t.length - 1);
    o.f.set(o.c.t[i]);
    e.toggleClass("is-hot", o.c.hot[i]);
    e.toggleClass("is-up", /^\+/.test(o.c.t[i]));   // market mode's marquee colours a rise (CSS scopes it there)
    e.toggleClass("is-ret", o.c.ret[i]);
    const k = e.querySelector(".zl-chg-k");
    if (k) k.textContent = o.c.k[i];
};
// every change line in a page shows the same kind (owner, 2026-11-04): the page only offers the kinds all of its rows have
// (holdings: return %, today's %, today's price change, profit; watchlist: today's % and price change)
export const chgKinds = (scope: Element): number => Math.min(4, ...Array.from(scope.querySelectorAll<HTMLElement>(".zl-chg"), (e) => CHGS.get(e)?.c.t.length ?? 4));
export const alignChg = (x: X, scope: Element | null): void => {
    if (!scope) return;
    const m = Math.min(chgMode(x), chgKinds(scope) - 1);
    scope.querySelectorAll<HTMLElement>(".zl-chg").forEach((n) => paintChg(n, m));
};
export const chgEl = (x: X, parent: HTMLElement, c: Chg, cls: string, key: string): HTMLElement => {
    const e = h(parent, "span", `zl-chg ${cls}`);
    h(e, "span", "zl-chg-k");
    let f = CHG_FLAPS.get(key);
    if (!f) { f = new Flap("xs"); CHG_FLAPS.set(key, f); }
    e.appendChild(f.el);
    const o = { c, f };
    CHGS.set(e, o);
    paintChg(e, chgMode(x));
    const re = c.re, pr = x.ctx.plugin.prices;
    if (c.tk && re) {
        const sym = pr.symbol(c.tk);
        pr.onQuote((s) => {
            if (!e.isConnected) return false;
            if (s !== sym) return true;
            o.c = re();
            const pg = e.closest(".zl-page");
            paintChg(e, Math.min(chgMode(x), (pg ? chgKinds(pg) : o.c.t.length) - 1));
            return true;
        });
    }
    return e;
};
// a sideways swipe on a row (owner, 2026-11-04: a tap on the change felt odd): left = the next display, right = the one before;
// every change line on the page follows; a tap still opens the row. The swipe is kept from Obsidian (no sidebar).
export const swipeChg = (x: X, row: HTMLElement): void => {
    let x0 = 0, y0 = 0, lock: "x" | "y" | null = null, done = false;
    const step = (d: 1 | -1) => {
        const pg = row.closest(".zl-page"), n = pg ? chgKinds(pg) : 3;
        CHG = (Math.min(chgMode(x), n - 1) + d + n) % n;
        x.ctx.app.saveLocalStorage(CHG_KEY, CHG);
        alignChg(x, pg);
    };
    const at = (cx: number, cy: number, stop: () => void) => {
        const dx = cx - x0, dy = cy - y0;
        if (!lock && Math.abs(dx) + Math.abs(dy) > 8) lock = Math.abs(dx) > Math.abs(dy) * 1.3 ? "x" : "y";
        if (lock !== "x") return;
        stop();
        if (!done && Math.abs(dx) > 36) { done = true; step(dx < 0 ? 1 : -1); }
    };
    row.addEventListener("touchstart", (e) => { const t = e.touches[0]; x0 = t.clientX; y0 = t.clientY; lock = null; done = false; }, { passive: true });
    row.addEventListener("touchmove", (e) => { const t = e.touches[0]; at(t.clientX, t.clientY, () => e.stopPropagation()); }, { passive: true });
    // desktop: the same with a mouse drag
    row.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") return; x0 = e.clientX; y0 = e.clientY; lock = null; done = false; });
    row.addEventListener("pointermove", (e) => { if (e.pointerType === "mouse" && e.buttons) at(e.clientX, e.clientY, () => undefined); });
    // the click that ends a swipe does not open the row
    row.addEventListener("click", (e) => { if (done || lock === "x") { e.preventDefault(); e.stopImmediatePropagation(); done = false; lock = null; } }, true);
};
// today's move of a ticker (hundredths): the quote against its reference price when it names one (Taiwan), else the day
// bars; with no live quote, the last day bar's own move
export const todayOf = (pr: X["ctx"]["plugin"]["prices"], tk: string): { ch: number; pct: number } | null => {
    const q = pr.get(tk), B = pr.series(tk, "D")?.bars, lv = liveOf(pr, tk);
    if (lv) return dayChange(B, lv, q?.closes?.map((c) => Math.round(c * 100)), q?.prev ? Math.round(q.prev * 100) : undefined);
    const n = B?.c.length ?? 0;
    return B && n > 1 ? { ch: B.c[n - 1] - B.c[n - 2], pct: ((B.c[n - 1] - B.c[n - 2]) / B.c[n - 2]) * 100 } : null;
};
// a holding at the newest quote (between page redraws): its value scaled by the price move, profit = value − cost
export const atNow = (pr: X["ctx"]["plugin"]["prices"], tk: string, p: Position): Position => {
    const np = pr.price(tk);
    return np === null ? p : revalue(p, np);
};
export const chgOf = (x: X, tk: string, p?: Position): Chg => {
    const pr = x.ctx.plugin.prices;
    pr.refreshSeries(tk, "D");
    const d = todayOf(pr, tk);
    const down = !!d && d.ch < 0, sg = (n: number) => (n > 0 ? "+" : n < 0 ? "\u2212" : "");
    const c: Chg = { t: [d ? pctS(d.pct) : "-", d ? `${sg(d.ch)}${price2(Math.abs(d.ch))}` : "-"], hot: [down, down], k: [t("chgToday"), t("chgToday")], ret: [false, false], tk, re: () => chgOf(x, tk, p && atNow(pr, tk, p)) };
    if (!p) return c;
    // a holding (owner, 2026-11-05): your return first (today's % is the chart page's), then today's move, then the profit
    const priced = p.price !== null, rp = p.cost > 0 ? (p.pl / p.cost) * 100 : 0;
    return { ...c, t: [priced ? pctS(rp) : "-", ...c.t, priced ? signed(p.pl) : "-"], hot: [p.pl < 0, ...c.hot, p.pl < 0], k: ["", ...c.k, t("chgProfit")]   /* return: no label (owner, 2026-11-05), its light tiles say it */, ret: [true, false, false, true] };
};
export const lastOf = (x: X, tk: string): string => { const q = x.ctx.plugin.prices.get(tk); return q ? price2(Math.round(q.price * 100)) : "-"; };

// 法人 flows are fetched for the holdings and the watchlist
export const flowTickers = (P: Portfolio): string[] => [...P.positions.filter((p) => p.shares > 0).map((p) => p.ticker), ...P.watch];
// a ticker's page from a list: a holding opens its holding page (shares, cost, trades), any other ticker its chart
export const openKey = (x: X, tk: string) => (x.P.positions.some((p) => p.ticker === tk && p.shares > 0) ? { key: "asset:" + tk, title: tk } : { key: "chart:" + tk, title: tk });
// the currency a looked-up ticker trades in (a holding knows its own): Taiwan listings TWD, the rest USD
export const guessCur = (sym: string) => (isTwSym(sym) ? "TWD" : "USD");

// S5: one warning in words
export const warnText = (w: Warning): string => w.rule === "cap" ? t("iWarnCap", { tk: w.key, n: num(w.over) })
    : w.rule === "mix" ? t(w.over > 0 ? "iWarnMixOver" : "iWarnMixUnder", { b: w.key, n: Math.abs(w.over) }) : t("iWarnReason", { tk: w.key });
