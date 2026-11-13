// Invest home (market mode): the board, the index card (ui/market.ts), the watchlist marquee, HOLDINGS / MIX links
import { Position, todayMove, toBase } from "../calc/invest";
import { num, today } from "../format";
import { t } from "../i18n";
import { h, page } from "../ui";
import { homeTop, sec } from "../ui/c";
import { marketCard } from "../ui/market";
import { calm } from "../ui/pixel";
import type { PageOut } from "./index";
import { MINUS, signed, pctS, X, liveBadge, findAct, alignChg, chgEl, todayOf, chgOf, lastOf, openKey } from "./invest-shared";

// Invest home, market mode (owner's artifact rounds 1–10, 2026-11-09; Vellum "Invest home · market mode"; built 2026-11-10):
// the board with what the holdings are worth (today's move beside it in the up / down colour, gain / loss as a split-flap under
// it) → the index card (TAIEX · SOX · NASDAQ, TODAY in 5-minute candles with the K effects: ui/market.ts) → the watchlist as a marquee → HOLDINGS · MAP ·
// ALERTS · MIX links (the mix, cash waiting and this month's buying plan moved to the MIX page)
export const home = (x: X): PageOut => {
    const { ctx, P } = x;
    const title = t("tabInvest");
    const el = page(title);
    el.addClass("zl-c-stack", "zl-mm");
    const held = P.positions.filter((p) => p.shares > 0).sort((a, b) => b.value - a.value);
    const fab = { icon: "plus", text: t("iTrade").toUpperCase(), label: t("iTrade"), onTap: () => x.trade() };
    const day = todayHeld(x, held);
    const rp = P.cost > 0 ? (P.pl / P.cost) * 100 : 0, r1 = Math.round(rp * 10) / 10;
    const tone = (n: number) => (n > 0 ? "up" as const : n < 0 ? "down" as const : undefined);
    homeTop(el, {
        key: "invest", value: num(P.value), label: t("iHoldings"),
        right: !held.length ? undefined : !P.priced ? t("iPricing") : day ? t("iTodayChg", { v: signed(day.ch), p: pctS(day.pct) }) : undefined,
        tone: P.priced && day ? tone(day.ch) : undefined,
        reads: held.length && P.priced
            ? [[t("iGainLoss"), signed(P.pl), { sub: [`${r1 > 0 ? "+" : r1 < 0 ? MINUS : ""}${Math.abs(r1).toFixed(1)}%`, t("iSinceBought")], tone: tone(P.pl) }]]
            : [[t("iCashWait"), num(x.cash)]],
    });
    marketCard(el, { prices: ctx.plugin.prices, app: ctx.app, cal: () => ctx.plugin.prices.calendar?.cal, chg: (tk) => todayOf(ctx.plugin.prices, tk) });
    watchStrip(x, el);   // always kept: the market card's chart gives up the room (owner, 2026-11-13)
    keepSideways(el);
    // the links at the foot, one line of four titles, each centred in its button (owner, 2026-11-13, Vellum screen
    // "Invest home · marquee back"): HOLDINGS | MAP | ALERTS | MIX; no counts, no warnings text (Mix shows them)
    const lk = h(el, "div", "zl-c-group zl-mlinks");
    const link = (label: string, onTap: () => void) => {
        const b = h(lk, "button", "zl-mlink", label);
        b.addEventListener("click", (e) => { e.preventDefault(); onTap(); });
    };
    link(t("iHoldingsT").toUpperCase(), () => ctx.push({ key: "holdings", title: t("iHoldingsT") }));
    link(t("fMapLink").toUpperCase(), () => ctx.push({ key: "map", title: t("fMapT") }));
    link(t("alLink").toUpperCase(), () => ctx.push({ key: "alerts", title: t("alTitle") }));
    link(t("iMixLink").toUpperCase(), () => ctx.push({ key: "mix", title: t("iMixT") }));
    return { title, el, fab, actions: [findAct(x, el)], badge: liveBadge(x) };
};

// today's move of what you hold, in the base currency: each holding's shares × today's price change × its FX rate; % of the
// value before today's move. null until any holding has today's change
export const todayHeld = (x: X, held: Position[]): { ch: number; pct: number } | null => {
    const pr = x.ctx.plugin.prices;
    let ch = 0, any = false;
    for (const p of held) {
        pr.refreshSeries(p.ticker, "D");
        const d = todayOf(pr, p.ticker);
        if (!d) continue;
        any = true;
        // shares bought today count from their buy price, not yesterday's close (calc/invest.ts todayMove)
        const last = Math.round((pr.price(p.ticker) ?? p.price ?? 0) * 100);
        ch += toBase(todayMove(p, d.ch, last, today()), p.currency, x.fx(p.currency));
    }
    if (!any) return null;
    ch = Math.round(ch);
    const before = x.P.value - ch;
    return { ch, pct: before > 0 ? (ch / before) * 100 : 0 };
};

// a sideways swipe anywhere on Invest home stays in the page (owner, 2026-11-10): it drags the marquee or pans the chart, and
// never opens Obsidian's sidebars; up / down still reach Obsidian (pull-down)
export const keepSideways = (el: HTMLElement): void => {
    let x0 = 0, y0 = 0, side: boolean | null = null;
    el.addEventListener("touchstart", (e) => { const t = e.touches[0]; x0 = t.clientX; y0 = t.clientY; side = null; }, { passive: true });
    el.addEventListener("touchmove", (e) => {
        const t = e.touches[0], dx = t.clientX - x0, dy = t.clientY - y0;
        if (side === null && Math.abs(dx) + Math.abs(dy) > 6) side = Math.abs(dx) > Math.abs(dy);
        if (side) e.stopPropagation();
    }, { passive: true });
    el.addEventListener("touchend", (e) => { if (side) e.stopPropagation(); }, { passive: true });
};

export const RUN = 27, RUN_V = RUN / 1000;   // px a second; px a ms
// the watchlist as a marquee (market mode): cells (ticker, last price, today's change as a small split-flap) run left at 27 px
// a second (a cell about every 5 s). A finger drags it either way (owner, 2026-11-10; it loops both ways); let go, it never
// stops: it keeps the flick's speed and eases back into the run (a flick to the right turns round into it); a tap opens the
// ticker's chart. Three or fewer stand
// still. Moved by a transform from script (never the browser's own scroll, which a phone smooths and stops), its place kept
// here, so a redraw (a live price every 5 s) carries on where it was. Calm motion: no run, a finger still drags it.
export const WM = { pos: 0, v: RUN_V, el: null as HTMLElement | null, run: null as HTMLElement | null, raf: 0, last: 0, held: false };
export const wmPlace = (): void => {
    const r = WM.run, half = r ? r.scrollWidth / 2 : 0;
    if (!r || half <= 0) return;
    WM.pos = ((WM.pos % half) + half) % half;
    r.style.transform = `translateX(${-WM.pos}px)`;
};
// fingers on the screen, counted at the window: once the last one lifts, the marquee runs again and any "a finger is on it"
// mark (zl-touching: no page redraw under it) is cleared. A page redraw while a finger was down puts a new strip in place,
// so its own lift never reaches the strip that took the press (owner, 2026-11-10: the marquee stopped for good)
export let DOWN = 0, WATCH: ((e: PointerEvent) => void) | null = null;
export const fingers = (on: boolean): void => {
    if (on && !WATCH) {
        WATCH = (e) => {
            DOWN = Math.max(0, DOWN + (e.type === "pointerdown" ? 1 : -1));
            if (DOWN) return;
            WM.held = false;
            activeDocument.querySelectorAll(".zl-touching").forEach((n) => n.removeClass("zl-touching"));
        };
        for (const ev of ["pointerdown", "pointerup", "pointercancel"]) window.addEventListener(ev, WATCH as EventListener, true);
    } else if (!on && WATCH) {
        for (const ev of ["pointerdown", "pointerup", "pointercancel"]) window.removeEventListener(ev, WATCH as EventListener, true);
        WATCH = null; DOWN = 0;
    }
};
export const investUnload = (): void => { fingers(false); if (WM.raf) cancelAnimationFrame(WM.raf); WM.raf = 0; WM.el = WM.run = null; };
export const runWm = (t: number): void => {
    const vp = WM.el;
    if (!vp?.isConnected) { WM.raf = 0; WM.last = 0; return; }
    const dt = WM.last ? Math.min(64, t - WM.last) : 0;
    WM.last = t;
    if (!WM.held) {
        // the speed eases toward the run's (calm motion: toward a stop), about half the way in 0.2 s
        const to = calm() ? 0 : RUN / 1000;
        WM.v += (to - WM.v) * (1 - Math.pow(0.94, dt / 16));
        if (Math.abs(WM.v) > 0.001) { WM.pos += WM.v * dt; wmPlace(); }
    }
    WM.raf = requestAnimationFrame(runWm);
};
export const watchStrip = (x: X, el: HTMLElement): HTMLElement => {
    const { ctx } = x, tks = x.P.watch;
    const g = h(el, "div", "zl-c-group zl-wstrip");
    sec(g, t("iWatchN", { n: tks.length }).toUpperCase(), () => ctx.push({ key: "watch", title: t("iWatch") }), t("iAll").toUpperCase());
    const vp = h(g, "div", "zl-wm");
    if (!tks.length) {
        const b = h(vp, "button", "zl-wm-none", t("iWatchNone"));
        b.addEventListener("click", (e) => { e.preventDefault(); x.search(el); });
        return g;
    }
    const run = h(vp, "div", "zl-wm-run");
    const loop = tks.length > 3;
    let dragged = false;
    const copy = (n: number) => tks.forEach((tk) => {
        const b = h(run, "button", "zl-wcell");
        b.dataset.k = `${tk}|${n}`;
        if (n) b.setAttribute("aria-hidden", "true");
        const top = h(b, "span", "zl-wcell-t");
        h(top, "span", "zl-wcell-k", tk);
        h(top, "span", "zl-wcell-p", lastOf(x, tk));
        chgEl(x, b, chgOf(x, tk), "zl-wcell-c", `WM|${tk}|${n}`);
        b.addEventListener("click", (e) => { e.preventDefault(); if (dragged) return; x.ctx.push(openKey(x, tk)); });
    });
    copy(0);
    if (loop) copy(1);
    alignChg(x, g);
    if (!loop) { vp.addClass("is-still"); return g; }
    vp.addClass("is-loop");
    // a finger: the run waits, the strip follows it (sideways only; up / down is left alone), the page does not redraw under it
    let x0 = 0, y0 = 0, p0 = 0, side: boolean | null = null, lastX = 0, lastT = 0, id = -1;
    vp.addEventListener("pointerdown", (e) => {
        id = e.pointerId; x0 = lastX = e.clientX; y0 = e.clientY; p0 = WM.pos; lastT = e.timeStamp; side = null; dragged = false;
        WM.held = true; WM.v = 0; vp.addClass("zl-touching");
    });
    vp.addEventListener("pointermove", (e) => {
        if (e.pointerId !== id || !WM.held) return;
        const dx = e.clientX - x0, dy = e.clientY - y0;
        if (side === null && Math.abs(dx) + Math.abs(dy) > 6) { side = Math.abs(dx) > Math.abs(dy); if (side) { dragged = true; try { vp.setPointerCapture(id); } catch { /* gone */ } } }
        if (!side) return;
        const dt = Math.max(1, e.timeStamp - lastT);
        WM.v = 0.7 * WM.v + 0.3 * (-(e.clientX - lastX) / dt);   // px per ms, for the glide
        lastX = e.clientX; lastT = e.timeStamp;
        WM.pos = p0 - dx; wmPlace();
    });
    const up = (e: PointerEvent) => {
        if (e.pointerId !== id) return;
        id = -1; WM.held = false; vp.removeClass("zl-touching");
        if (!side) WM.v = 0;   // a tap or a hold: the run picks up again from still
    };
    vp.addEventListener("pointerup", up);
    vp.addEventListener("pointercancel", up);
    WM.el = vp; WM.run = run;
    fingers(true);
    // on screen (the page mounts after it is built, or comes back from the cache): back to its place, the run going again
    new ResizeObserver(() => {
        if (!vp.isConnected || !vp.clientWidth || WM.el !== vp) return;
        wmPlace();
        if (!WM.raf) WM.raf = requestAnimationFrame(runWm);
    }).observe(vp);
    return g;
};
