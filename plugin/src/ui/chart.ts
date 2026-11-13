import { Bands, Bars, bollinger, WINDOW, ChartPrefs, Drawing, extremes, isMinutes, MINUTES, RANGES, windowOf, withLiveMinute, withTicks, zoomAt, DrawType, fibLevels, indexOf, lineAt, movingAverage, nearestBar, niceTicks, Point, Range, snapPrice, withLive, xTicks } from "../calc/chart";
import { Platform } from "obsidian";
import type { Prices } from "../prices";
import { deviceZone, isTwSym, marketMinute, marketTime, shiftZone } from "../calc/quotes";
import { fiveMin, kState } from "../calc/keffects";
import { h } from "./index";
import { KFx, KScene } from "./keffects";

// Holding chart (Design Rules › Charts): candles (up ink, down loud), MA muted, average cost dashed, price axis on the right with
// nice ticks and the last price as a loud tag, time axis at the bottom with ticks and faint grid lines. Redraws itself in place
// (range change, size change); the range per ticker outlives page redraws.
const NS = "http://www.w3.org/2000/svg";
const AXIS = 52, BOTTOM = 22, TOP = 14;
const RANGE = new Map<string, Range>();
const ZOOM = new Map<string, number>();   // `ticker|interval` → bars on screen after a pinch (else the interval's own number)
const PAN = new Map<string, number>();   // bars hidden off the right edge (0 = the latest bar is the last one shown)
export const chartRange = (ticker: string): Range => RANGE.get(ticker) ?? "I";   // TODAY unless picked (owner, 2026-11-05)
// back to TODAY, the whole session (the index chart when its market opens)
export const chartToday = (ticker: string): void => { RANGE.set(ticker, "I"); ZOOM.delete(`${ticker}|I`); PAN.delete(ticker); };
const IV_LABEL: Record<Range, string> = { I: "TODAY", "1m": "1", "5m": "5", "15m": "15", "30m": "30", "60m": "60", D: "D", W: "W", M: "M" };

export interface ChartOpts {
    ticker: string; currency: string; prices: Prices; prefs: ChartPrefs; cost: number | null; height?: number; ranges?: Range[];
    // the drawing on the chart, at most one (owner, 2026-11-04): kept by the page while it is open, never saved; the chart
    // changes this list itself (a new drawing replaces the old one, a tap on a drawn chart empties it)
    memo: Drawing[];
    full?: boolean; onClose?(): void;   // full: the turned-phone layout (rail, top bar with O H L C, volume pane, RANGE)
    onLeave?(): void;                   // the page's own back: ‹ on a sideways full chart leaves the chart page too
    turned?: boolean;                   // full chart drawn sideways in a portrait screen (the layer is rotated 90°)
    // Invest home's index chart (market mode, 2026-11-10): no drawing tools, no full chart (nor turning into one), no volume
    // pane; alive: while it says so the chart keeps listening even off screen (a card moved from page to page on redraws)
    tools?: false; fullChart?: false; volume?: false; alive?: () => boolean;
    // ladder: no interval strip; a pinch walks the intervals instead (fine → coarse, e.g. TODAY 5 15 60 D): out past a few
    // screens of bars it steps to the next coarser interval showing the same span of time, in past a third of one it steps back
    // chips: MB 20 · BB · MA60 as small toggles on the bar line (no value cells); swipe: a sideways drag on the plot is a swipe
    // (the plot follows the finger; let go past 50 px = swipe(1) to the left, swipe(-1) to the right) instead of a pan
    ladder?: Range[]; chips?: true; swipe?: (dir: 1 | -1) => void;
    // the full chart: a line beside the MA chips (the thesis, Vellum screen "Invest · chart page with thesis", landscape)
    fullLine?: (parent: HTMLElement) => void;
}
type Tool = DrawType | "measure";
// the armed tool and a first point waiting, per ticker (a page redraw from a price refresh keeps them); a measure is not saved
const TOOL = new Map<string, { type: Tool; a: Point | null }>();
const MEASURE = new Map<string, { a: Point; b: Point }>();
const HINT: Record<Tool, string> = { measure: "Range: tap two points to measure the move.", fib: "Fib: tap a swing low, then a swing high (or high then low).", line: "Line: tap two points; it runs on to the right edge.", level: "Level: touch and drag to a price." };
export interface ChartView { el: HTMLElement; draw(): void }

type Attrs = Record<string, string | number>;
const svgEl = <K extends keyof SVGElementTagNameMap>(p: Element, tag: K, a: Attrs, cls?: string): SVGElementTagNameMap[K] => {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(a)) e.setAttribute(k, String(v));
    if (cls) e.setAttribute("class", cls);
    p.appendChild(e);
    return e;
};
const text = (p: Element, x: number, y: number, s: string, cls: string, anchor: "start" | "middle" | "end" = "start") => { const t = svgEl(p, "text", { x, y, "text-anchor": anchor }, cls); t.textContent = s; return t; };
export const price2 = (p: number): string => (p / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// the plot's geometry for the bars on screen: index → x, hundredths → y and back (y1 = the price pane's bottom)
// the price axis line sits on the left edge and its labels just right of it, over the plot (owner, 2026-11-06: no label
// column left of the axis), so the bars get the whole width
export interface Geo { W: number; H: number; x0: number; x1: number; y0: number; y1: number; n: number; step: number; lo: number; hi: number; x(i: number): number; y(p: number): number; i(x: number): number; p(y: number): number }
const geometry = (W: number, H: number, y1: number, n: number, lo: number, hi: number): Geo => {
    const x0 = 1, x1 = W - 2, y0 = TOP, step = (x1 - x0) / Math.max(1, n);
    return { W, H, x0, x1, y0, y1, n, step, lo, hi, x: (i) => x0 + (i + 0.5) * step, y: (p) => y1 - ((p - lo) / (hi - lo || 1)) * (y1 - y0), i: (x) => (x - x0) / step - 0.5, p: (y) => lo + ((y1 - y) / (y1 - y0)) * (hi - lo) };
};
interface Lines { ma60: (number | null)[]; bb: Bands | null }

// BB / MA20 / MA60 toggles: what was tapped this session, for every chart (the note's `chart:` is only where BB starts); no
// note write, so a tap never redraws the page. MA20 and MA60 each on or off on their own, off at first (owner, 2026-11-05)
const SHOW: { bb?: boolean } = {};
// MB (BB's middle, the 20-day average: no MA20 of its own, owner 2026-11-05) and MA60 each on or off on their own
const LINE_ON = { mb: false, ma60: false };

export const holdingChart = (parent: HTMLElement, o: ChartOpts): ChartView => {
    const full = !!o.full;
    Object.assign(o.prefs, SHOW);
    const box = h(parent, "div", full ? "zl-ch zl-ch-full" : "zl-ch");
    let ranges: HTMLElement, tools: HTMLElement, plot: HTMLElement, note: HTMLElement, ind: HTMLElement;
    if (full) {   // rail on the left, top bar (ticker, the touched candle, ranges), the MA / BB chips, then the chart
        tools = h(box, "div", "zl-ch-rail");
        const main = h(box, "div", "zl-ch-main");
        const bar = h(main, "div", "zl-ch-bar");
        h(bar, "div", "zl-ch-tk", o.ticker);
        note = h(bar, "div", "zl-ch-ohlc");
        ranges = h(bar, "div", "zl-ch-ranges");
        if (o.fullLine) { const r = h(main, "div", "zl-ch-indrow"); ind = h(r, "div", "zl-ch-ind"); o.fullLine(h(r, "div", "zl-ch-line")); }
        else ind = h(main, "div", "zl-ch-ind");
        plot = h(main, "div", "zl-ch-plot");
    } else {
        ranges = o.ladder ? document.createElement("div") : h(box, "div", "zl-ch-ranges is-seg");
        tools = o.tools === false ? document.createElement("div") : h(box, "div", "zl-ch-tools");
        if (o.chips) { const r = h(box, "div", "zl-ch-nrow"); note = h(r, "div", "zl-ch-note"); ind = h(r, "div", "zl-ch-ind is-chips"); }
        else { ind = h(box, "div", "zl-ch-ind"); note = h(box, "div", "zl-ch-note"); }   // note: the bar's O H L C Vol, or what to tap next
        plot = h(box, "div", "zl-ch-plot");
        if (o.height === 0) box.addClass("is-fill");   // 0: the chart takes the room the page leaves (one-screen chart pages)
        else plot.style.height = `${o.height ?? 340}px`;
        if (o.fullChart !== false) {
            const foot = h(box, "div", "zl-ch-foot");
            const link = h(foot, "button", "zl-ch-link", "FULL CHART ›");
            link.addEventListener("click", (e) => { e.preventDefault(); openFull(box, o); });
        }
    }
    let cross: { x: number; y: number } | null = null, hold = 0;
    const fx = new KFx(plot);   // the K effects (ui/keffects.ts) on every chart's TODAY (owner, 2026-11-10)
    let waited = false;   // the plot showed LOADING: the first bars fade in, not appear at once (owner, 2026-11-05)
    let lastW = 0, maxPan = 0, curWin = 0, len = 0, dayN = 0, geo: Geo | null = null, shown: { k: number; B: Bars } | null = null;
    // a finger on the plot in the plot's own units (a turned layer: screen down = plot right, screen left = plot down)
    const local = (e: MouseEvent): { x: number; y: number } => {
        const r = plot.getBoundingClientRect();
        return o.turned ? { x: e.clientY - r.top, y: r.right - e.clientX } : { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    // a tap while a tool is armed (the tool stays armed): the first tap on a chart that already has a drawing clears it;
    // otherwise point A, then point B (a level takes one tap). The point: the nearest bar's date, the price under the finger
    // (snapped to the bar's high / low for FIB and LINE).
    const put = (type: DrawType, a: Point, b: Point | null) => o.memo.splice(0, o.memo.length, { id: "d1", type, a, b, hidden: false, note: "", drawn: "" });
    const tap = (x: number, y: number) => {
        const tool = TOOL.get(o.ticker);
        if (!tool || !geo || !shown || !shown.B.d.length) return;
        if (!tool.a && (tool.type === "measure" ? MEASURE.has(o.ticker) : o.memo.length > 0)) {
            if (tool.type === "measure") MEASURE.delete(o.ticker); else o.memo.length = 0;
            draw(); return;
        }
        const i = nearestBar(shown.B.d.length, geo.i(x)), raw = Math.round(geo.p(y));
        const pt: Point = { date: shown.B.d[i], price: (tool.type === "fib" || tool.type === "line") && o.prefs.snap ? snapPrice(shown.B, i, raw) : raw };
        if (!tool.a) { tool.a = pt; draw(); return; }
        const a = tool.a;
        tool.a = null;
        if (tool.type === "measure") MEASURE.set(o.ticker, { a, b: pt });
        else put(tool.type, a, pt);
        draw();
    };
    // zoom to `want` bars, the bar under x staying put; TODAY too (owner, 2026-11-10: a pinch in did nothing until one out):
    // zoomed out to its whole session again it is drawn across the session's full width
    // the ladder's interval sizes in minutes (D = one session: Taiwan 270, else 390)
    const mins = (r: Range): number => (r === "D" ? (isTwSym(o.prices.symbol(o.ticker)) ? 270 : 390) : MINUTES[r] ?? 1);
    const stepTo = (r: Range, win?: number) => {
        RANGE.set(o.ticker, r); PAN.delete(o.ticker);
        if (win) ZOOM.set(`${o.ticker}|${r}`, Math.max(12, Math.round(win)));
        o.prices.refreshSeries(o.ticker, r);
        draw();
        if (pinch && fingers.size >= 2) pinch = { d: spread().d, win: curWin };   // the pinch goes on from the new interval
    };
    const zoomTo = (want: number, x: number) => {
        const r = chartRange(o.ticker);
        const L = o.ladder, li = L ? L.indexOf(r) : -1;
        if (L && li >= 0) {
            const day = mins("D");
            if (li < L.length - 1 && (r === "I" ? want > dayN * 1.25 : want > WINDOW[r] * 2.5)) {
                const span = r === "I" ? day * 1.25 : want * mins(r), nr = L[li + 1];
                stepTo(nr, nr === "I" ? undefined : span / mins(nr));
                return;
            }
            const pr = li > 0 ? L[li - 1] : null;
            if (pr && r !== "I" && want < (pr === "I" ? day / mins(r) : WINDOW[r] / 2.5)) { stepTo(pr, pr === "I" ? undefined : (want * mins(r)) / mins(pr)); return; }
        }
        if (!geo || !shown || !len) return;
        if (r === "I" && want >= dayN) {   // the whole session again
            if (!ZOOM.has(`${o.ticker}|I`)) return;
            ZOOM.delete(`${o.ticker}|I`); PAN.delete(o.ticker); draw(); return;
        }
        const z = zoomAt(len, shown.k, curWin, geo.i(x), want);
        if (z.win === curWin && z.off === (PAN.get(o.ticker) ?? 0)) return;
        ZOOM.set(`${o.ticker}|${r}`, z.win); PAN.set(o.ticker, z.off); draw();
    };
    // LEVEL armed: a finger on the plot puts the level at its height and drags it (no crosshair, no pan)
    const levelAt = (y: number) => {
        if (!geo || !shown || !shown.B.d.length) return;
        put("level", { date: shown.B.d[shown.B.d.length - 1], price: Math.round(geo.p(Math.max(geo.y0, Math.min(geo.y1, y)))) }, null);
        draw();
    };
    let dragLevel = false;
    // one finger: still = a tap (draws when a tool is armed); held still 0.35 s = the crosshair (follows the finger until it
    // lifts); a sideways drag = pan through older bars. Two fingers: pinch = zoom (more or fewer bars), ends the rest.
    let press: { x: number; y: number; off: number; moved: boolean; pan: boolean; swipe?: boolean; dx?: number } | null = null;
    const settle = (go: number) => {   // a swipe let go: the plot slides back, or off to its side before the next index comes in
        plot.style.transition = "transform .18s ease-out";
        plot.style.transform = go ? `translateX(${go * -60}px)` : "";
        window.setTimeout(() => { plot.style.transition = ""; if (!go) plot.style.transform = ""; }, 200);
    };
    const fingers = new Map<number, { x: number; y: number }>();
    let pinch: { d: number; win: number } | null = null;
    const spread = () => { const [a, b] = [...fingers.values()]; return { d: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)), x: (a.x + b.x) / 2 }; };
    const capture = (id: number) => { try { plot.setPointerCapture(id); } catch { /* the pointer is already gone: nothing to hold */ } };
    plot.addEventListener("pointerdown", (e) => {
        if ((e.target as Element).closest?.(".zl-ch-latest")) return;
        const at = local(e);
        fingers.set(e.pointerId, at);
        if (fingers.size === 2) {   // the second finger: a pinch starts, no tap / pan / crosshair
            fx.pause();   // the effects stop for a pinch (it gets every frame); a held crosshair keeps them (owner, 2026-11-10)
            window.clearTimeout(hold); press = null; cross = null; dragLevel = false;
            for (const id of fingers.keys()) capture(id);
            pinch = { d: spread().d, win: curWin };
            return;
        }
        if (fingers.size > 2) return;
        if (TOOL.get(o.ticker)?.type === "level") { dragLevel = true; capture(e.pointerId); levelAt(at.y); return; }
        press = { ...at, off: PAN.get(o.ticker) ?? 0, moved: false, pan: false };
        window.clearTimeout(hold);
        hold = window.setTimeout(() => { if (press && !press.moved) { cross = at; capture(e.pointerId); draw(); } }, 350);
    });
    plot.addEventListener("pointermove", (e) => {
        const at = local(e);
        if (fingers.has(e.pointerId)) fingers.set(e.pointerId, at);
        if (pinch) { if (fingers.size >= 2) { const s = spread(); zoomTo((pinch.win * pinch.d) / s.d, s.x); } return; }
        if (dragLevel) { levelAt(at.y); return; }
        if (cross) { cross = at; draw(); return; }
        if (!press || !geo) return;
        const dx = at.x - press.x, dy = at.y - press.y;
        if (!press.moved && Math.hypot(dx, dy) > 8) { press.moved = true; window.clearTimeout(hold); if (Math.abs(dx) > Math.abs(dy)) { if (o.swipe) press.swipe = true; else press.pan = true; capture(e.pointerId); } }
        if (press.swipe) { press.dx = dx; plot.style.transform = `translateX(${dx}px)`; return; }
        if (!press.pan) return;
        const next = Math.max(0, Math.min(maxPan, Math.round(press.off + dx / geo.step)));
        if (next !== (PAN.get(o.ticker) ?? 0)) { PAN.set(o.ticker, next); draw(); }
    });
    const lift = (e: PointerEvent): boolean => {   // true while a pinch is on or just ended (that finger does nothing else)
        fingers.delete(e.pointerId);
        if (!pinch) return false;
        if (fingers.size < 2) pinch = null;
        press = null;
        return true;
    };
    plot.addEventListener("pointerup", (e) => {
        window.clearTimeout(hold);
        if (lift(e)) return;
        if (dragLevel) { dragLevel = false; return; }
        const p = press;
        press = null;
        if (p?.swipe) { const dx = p.dx ?? 0, go = Math.abs(dx) > 50 ? (dx < 0 ? 1 : -1) : 0; settle(go); if (go) o.swipe?.(go as 1 | -1); return; }
        if (cross) { cross = null; draw(); return; }
        if (p && !p.moved) tap(p.x, p.y);
    });
    plot.addEventListener("pointercancel", (e) => { lift(e); window.clearTimeout(hold); if (press?.swipe) settle(0); press = null; dragLevel = false; if (cross) { cross = null; draw(); } });
    // a drag on the chart never scrolls the page (owner, 2026-11-04): sideways pans, up / down does nothing
    plot.addEventListener("touchmove", (e) => e.preventDefault(), { passive: false });
    plot.addEventListener("contextmenu", (e) => e.preventDefault());
    // desktop: a trackpad pinch (wheel with ctrl) zooms the same way
    plot.addEventListener("wheel", (e) => { if (!e.ctrlKey) return; e.preventDefault(); zoomTo(curWin * Math.exp(e.deltaY * 0.01), local(e).x); }, { passive: false });

    const setShow = (p: { bb?: boolean; line?: "mb" | "ma60" }) => {
        if (p.line) LINE_ON[p.line] = !LINE_ON[p.line];
        if (p.bb !== undefined) { SHOW.bb = p.bb; o.prefs.bb = p.bb; }
        draw();
    };
    const draw = () => {
        const range = chartRange(o.ticker);
        ranges.empty();
        for (const r of o.ranges ?? RANGES) {
            const b = h(ranges, "button", "zl-ch-range" + (r === range ? " is-on" : ""), IV_LABEL[r]);
            b.addEventListener("click", (e) => { e.preventDefault(); RANGE.set(o.ticker, r); PAN.delete(o.ticker); o.prices.refreshSeries(o.ticker, r); draw(); });
        }
        // tools: FIB / LINE / LEVEL (and RANGE in the full chart) arm one; the armed one inverted, tap it again to disarm
        const tool = TOOL.get(o.ticker);
        tools.empty();
        if (full) { const b = h(tools, "button", "zl-ch-tool is-back", "‹"); b.setAttribute("aria-label", "Back"); b.addEventListener("click", (e) => { e.preventDefault(); o.onClose?.(); }); }
        const kinds: [Tool, string][] = [["fib", "FIB"], ["line", "LINE"], ["level", "LEVEL"], ...(full ? [["measure", "RANGE"] as [Tool, string]] : [])];
        for (const [k, label] of kinds) {
            const b = h(tools, "button", "zl-ch-tool" + (tool?.type === k ? " is-on" : ""), label);
            b.addEventListener("click", (e) => { e.preventDefault(); 
                // turning a tool off (or picking another) takes its drawing off the chart too (owner, 2026-11-04)
                if (tool) { o.memo.length = 0; MEASURE.delete(o.ticker); }
                if (tool?.type === k) TOOL.delete(o.ticker); else TOOL.set(o.ticker, { type: k, a: null });
                draw();
            });
        }
        plot.toggleClass("is-armed", !!tool);
        o.prices.refreshSeries(o.ticker, range);
        const S = o.prices.series(o.ticker, range);
        plot.empty();
        const W = plot.clientWidth || lastW, H = full || o.height === 0 ? plot.clientHeight || lastH || 300 : o.height ?? 340;
        lastW = W;
        if (!W || !H) return;   // not on screen yet: the size observer draws it
        if (!S?.bars.d.length) {   // loading: the chips stay (no values), the plot keeps its size and shows blocks lighting in turn
            indicators(ind, o, { ma60: [], bb: { mb: [], ub: [], lb: [], sd: [] } }, 0, setShow);
            const wait = h(plot, "div", "zl-ch-wait");
            const row = h(wait, "div", "zl-ch-wait-b");
            for (let i = 0; i < 8; i++) h(row, "i").style.animationDelay = `${i * 0.1}s`;
            waited = true;
            h(wait, "div", "zl-ch-wait-t", `LOADING ${IV_LABEL[range]}${isMinutes(range) && range !== "I" ? " MIN" : ""}`);
            note.setText(tool ? HINT[tool.type] : "\u00a0");
            return;
        }
        const live = liveOf(o.prices, o.ticker);
        // the live quote patches today's day bar, or the current minute bar (a new one when its minute starts)
        const raw = !live ? S.bars : range === "D" ? withLive(S.bars, live.day, live.price) : MINUTES[range] ? withLiveMinute(withTicks(S.bars, o.prices.ticks(o.ticker), MINUTES[range]!, range === "I"), live.at, live.price, MINUTES[range]!) : S.bars;
        const all = range === "I" ? fiveMin(raw) : raw;   // TODAY in 5-minute candles on every chart (owner, 2026-11-10)
        // TODAY for a Taiwan ticker once today's session has started (the quote is from today, 09:00 on) but nothing of today
        // is drawn yet (no Fugle key: Yahoo's minute bars run about 20 minutes behind): not yesterday's line, a hint instead
        if (range === "I" && live && isTwSym(o.prices.symbol(o.ticker)) && live.at.slice(11) >= "09:00" && live.day === marketMinute(o.prices.symbol(o.ticker), Date.now()).slice(0, 10) && (all.d[all.d.length - 1] ?? "").slice(0, 10) < live.day) {
            indicators(ind, o, { ma60: [], bb: { mb: [], ub: [], lb: [], sd: [] } }, 0, setShow);
            const wait = h(plot, "div", "zl-ch-wait");
            h(wait, "div", "zl-ch-wait-t", "TODAY STARTS WITH THE NEXT TRADE");
            if (!o.prices.hasFugle() && !o.ticker.startsWith("^")) h(wait, "div", "zl-ch-wait-s", "For the whole day live, add a Fugle API key in Settings.");
            note.setText("\u00a0");
            return;
        }
        dayN = range === "I" ? windowOf(all, range) : 0;
        const win = range === "I" ? Math.min(dayN, ZOOM.get(`${o.ticker}|I`) ?? dayN) : Math.min(all.d.length, ZOOM.get(`${o.ticker}|${range}`) ?? windowOf(all, range));
        curWin = win; len = all.d.length;
        maxPan = Math.max(0, all.d.length - win);
        const off = Math.min(PAN.get(o.ticker) ?? 0, maxPan);
        // readouts always (BB, MA20, MA60); a tap on a name shows or hides its line on the chart
        const L: Lines = { ma60: movingAverage(all.c, 60), bb: bollinger(all.c, 20, 2) };
        const out = drawBars(plot, all, win, off, range, W, H, o, L, cross);
        geo = out.G; shown = { k: out.k, B: out.B };
        fx.update(pinch ? null : kScene(plot, o, all, range, out.G, out.k, out.B.d.length, off, live, L));
        // the first bars fade in once; the class goes when it ends, so a move of the chart (the index card into a redrawn page)
        // never plays it again
        if (waited) { waited = false; [...plot.children].forEach((c) => { c.addClass("zl-ch-in"); c.addEventListener("animationend", () => c.removeClass("zl-ch-in"), { once: true }); }); }
        if (off > 0) {   // panned back: a way home to the latest bar
            const b = h(plot, "button", "zl-ch-latest", "LATEST ›");
            b.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); PAN.delete(o.ticker); draw(); });
        }
        // the bar the readouts talk about: the held one under the crosshair, else the last one on screen
        const gi = out.crossI !== null ? out.k + out.crossI : out.k + out.B.d.length - 1;
        indicators(ind, o, L, gi, setShow);
        // the note: what to tap next while a tool is armed (loud while a first point waits); else the bar's O H L C
        note.toggleClass("is-hot", !!tool?.a);
        const hasDrawing = tool?.type === "measure" ? MEASURE.has(o.ticker) : o.memo.length > 0;
        if (tool) note.setText(tool.a ? "Now tap the second point." : hasDrawing ? (tool.type === "level" ? "Drag to move it." : "Tap the chart to clear it.") : HINT[tool.type]);
        else barLine(note, all, gi, range, o.prices.symbol(o.ticker));
    };
    let lastH = 0;
    const alive = () => (o.alive ? o.alive() : box.isConnected);
    // a live quote for this ticker: only the chart redraws (not while a finger is on it)
    o.prices.onQuote((sym) => {
        if (!alive()) return false;
        if (!box.isConnected) return true;
        if (sym === o.prices.symbol(o.ticker) && !press && !pinch && !cross) draw();
        return true;
    });
    // new bars for this chart: only the chart redraws (a page redraw would replay the rows' entry and blink them)
    o.prices.onSeries((key) => {
        if (!alive()) return false;
        if (!box.isConnected) return true;
        if (key === `${o.prices.symbol(o.ticker)}|${chartRange(o.ticker)}`) draw();
        return true;
    });
    new ResizeObserver(() => { if (plot.clientWidth && (plot.clientWidth !== lastW || plot.clientHeight !== lastH)) { lastH = plot.clientHeight; draw(); } }).observe(plot);
    draw();
    if (!full && o.fullChart !== false) watchTurn(box, o);
    // minute charts and TODAY: new bars every 15 s while the chart is on screen (owner, 2026-11-05; was a minute)
    const tick = window.setInterval(() => {
        if (!alive()) { window.clearInterval(tick); return; }
        if (!box.isConnected) return;
        const r = chartRange(o.ticker);
        if (isMinutes(r) && !document.hidden) o.prices.refreshSeries(o.ticker, r);
    }, 15 * 1000);
    return { el: box, draw };
};

// The K effects' scene (calc/keffects.ts rules): closed candles that broke get a small mark in the SVG (candle intervals);
// the forming candle's effects go to the canvas, only while its market trades and the latest bar is on screen (a held
// crosshair keeps them, owner 2026-11-10; a pinch stops them); only on TODAY (owner, 2026-11-10: the intraday view while the market trades), which every chart
// draws as 5-minute candles: the effects sit on the forming one.
const kScene = (plot: HTMLElement, o: ChartOpts, all: Bars, range: Range, G: Geo, k: number, n: number, off: number, live: { day: string } | null, L: Lines): KScene | null => {
    const sym = o.prices.symbol(o.ticker), line = !all.ohlc, end = all.d.length - 1;
    const forming = !!live && end >= 0 && all.d[end].slice(0, 10) === live.day && o.prices.isOpen(o.ticker);
    const mins = range === "I" ? 5 : range === "D" ? (isTwSym(sym) ? 270 : 390) : MINUTES[range] ?? 390 * 5;
    const st = kState(all, mins, forming);
    const svg = plot.querySelector("svg.zl-ch-svg");
    if (svg && !line) for (const m of st.marks) {
        if (m.i < k || m.i >= k + n) continue;
        const x = G.x(m.i - k), y = m.dir > 0 ? G.y(all.h[m.i]) - 7 : G.y(all.l[m.i]) + 3;
        svgEl(svg, "rect", { x: x - 2, y, width: 4, height: 4 }, (m.dir > 0 ? "zl-ch-up" : "zl-ch-down") + " zl-ch-kmark");
    }
    if (!forming || range !== "I" || off > 0 || !n || !all.d.length) return null;
    const j = all.d.length - 1, x = G.x(n - 1), dir = st.dir;
    const z = st.z ?? 0, side = st.bb || (Math.abs(z) >= 1.5 ? (z > 0 ? 1 : -1) : 0);
    let edge: [number, number][] | null = null, slope = 0;
    if (!line && L.bb && side) {
        const e = side > 0 ? L.bb.ub : L.bb.lb, a = e[end - 1], b = e[end];
        if (a !== null && b !== null) slope = (G.y(b) - G.y(a)) / (G.step || 1);
        if (!o.prefs.bb) { edge = []; for (let i = 0; i < n; i++) { const v = e[k + i]; if (v !== null) edge.push([G.x(i), G.y(v)]); } }
    }
    const bbV = side > 0 ? st.ub : side < 0 ? st.lb : null;
    return {
        key: `${o.ticker}|${range}|${all.d[j]}`, x, bw: line ? 6 : Math.max(1, Math.min(18, G.step * 0.64)), dir,
        tipY: dir > 0 ? G.y(all.h[j]) - 6 : G.y(all.l[j]) + 6, closeY: G.y(all.c[j]), body: st.body,
        brk: st.brk, long: st.long, bb: st.bb, past: st.past, bbY: bbV === null ? null : G.y(bbV), slope,
        edge, near: st.bb ? 1 : Math.abs(z) >= 1.5 ? Math.min(1, (Math.abs(z) - 1.3) / 0.7) : 0, floor: G.y1,
    };
};

// volume, short: 311.6M, 13.3K, 950
const volS = (v: number): string => (v >= 1e9 ? `${(v / 1e9).toFixed(1)}B` : v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1e4 ? `${(v / 1e3).toFixed(1)}K` : String(Math.round(v)));
// the bar's time, O H L C and the move from the close before it (volume: the pane's own readout); one line, keys muted and
// values ink, the move loud when down. A bar without its own O H L (a close line: TODAY, a line-only source) shows only its
// close: four equal numbers say nothing
const barLine = (el: HTMLElement, B: Bars, i: number, range: Range, sym: string): void => {
    el.empty();
    const before = i > 0 ? B.c[i - 1] : B.pc ?? null, ch = before ? B.c[i] - before : null;
    h(el, "span", "zl-ch-bl-d", dayLabel(shownD(sym, B.d[i], range), range));
    const kv = (k: string, v: number) => { h(el, "span", "zl-ch-bl-k", k); h(el, "span", "zl-ch-bl-v", price2(v)); };
    const flat = !B.ohlc || (B.o[i] === B.c[i] && B.h[i] === B.c[i] && B.l[i] === B.c[i]);
    if (flat) h(el, "span", "zl-ch-bl-v", price2(B.c[i]));
    else { kv("O", B.o[i]); kv("H", B.h[i]); kv("L", B.l[i]); kv("C", B.c[i]); }
    if (ch !== null && before) h(el, "span", "zl-ch-bl-v zl-ch-bl-m" + (ch < 0 ? " is-hot" : ch > 0 ? " is-up" : ""), `${ch >= 0 ? "+" : "\u2212"}${(Math.abs(ch) / before * 100).toFixed(2)}%`);
};

// The legend strip above the plot (owner, 2026-11-05): three equal cells MB 20 · BB 2σ · MA60, each the toggle for its line
// (the whole cell is the button): a swatch drawn like its line, the name in pixel type over the value at the bar talked about
// (the held one, else the last). A line switched on shows its name and value in its own colour; off, the cell is dimmed with
// a hollow swatch. Values stay either way, so nothing jumps. MB is BB's middle, the 20-day average (no separate MA20).
const indicators = (el: HTMLElement, o: ChartOpts, L: Lines, i: number, set: (p: { bb?: boolean; line?: "mb" | "ma60" }) => void) => {
    el.empty();
    const v = (a: (number | null)[] | undefined) => { const x = a?.[i]; return x === null || x === undefined ? "-" : price2(Math.round(x)); };
    const cell = (cls: string, label: string, on: boolean, p: { bb?: boolean; line?: "mb" | "ma60" }, value: string, extra = "") => {
        if (o.chips) {   // a small toggle: the swatch and the name, no value
            const c = h(el, "button", `zl-ch-chip ${cls}` + (on ? " is-on" : ""));
            c.setAttribute("aria-pressed", String(on));
            h(c, "i", "zl-ch-lg-sw");
            h(c, "span", "", label === "MB 20" ? "MA20" : label.replace(" 2\u03c3", ""));
            c.addEventListener("click", (e) => { e.preventDefault(); set(p); });
            return;
        }
        const b = h(el, "button", `zl-ch-lg ${cls}` + (on ? " is-on" : ""));
        b.setAttribute("aria-pressed", String(on));
        const top = h(b, "span", "zl-ch-lg-t");
        h(top, "i", "zl-ch-lg-sw");
        h(top, "span", "zl-ch-lg-k", label);
        if (extra) h(top, "span", "zl-ch-lg-x", extra);
        h(b, "span", "zl-ch-lg-v", value);
        b.addEventListener("click", (e) => { e.preventDefault(); set(p); });
    };
    cell("is-mb", "MB 20", LINE_ON.mb, { line: "mb" }, v(L.bb?.mb));
    const lb = v(L.bb?.lb), ub = v(L.bb?.ub), sd = v(L.bb?.sd);
    cell("is-bb", "BB 2\u03c3", !!o.prefs.bb, { bb: !o.prefs.bb }, lb === "-" ? "-" : `${lb}\u2013${ub}`, sd === "-" ? "" : `\u03c3${sd}`);
    cell("is-ma60", "MA60", LINE_ON.ma60, { line: "ma60" }, v(L.ma60));
};

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// US times on this device's clock (owner, 2026-11-10: New York's 12:59 read as an hour late at 01:59 Taipei); Settings ›
// "US times in New York time" (body class zl-us-ny) keeps New York's. Only the labels move: bars stay keyed by New York's
// clock, and day bars keep the exchange's date.
const usLocal = (sym: string): boolean => !isTwSym(sym) && !document.body.hasClass("zl-us-ny");
const SHOWN = new Map<string, string>();
const shownD = (sym: string, d: string, range: Range): string => {
    if (!isMinutes(range) || !usLocal(sym)) return d;
    let v = SHOWN.get(d);
    if (v === undefined) { v = shiftZone(d, "America/New_York", deviceZone()); if (SHOWN.size > 5000) SHOWN.clear(); SHOWN.set(d, v); }
    return v;
};
// the price's source time "HH:MM:SS": the market's clock, or this device's for a US ticker (as above)
export const shownTime = (sym: string, t: number): string => (usLocal(sym) ? new Date(t).toLocaleTimeString("en-GB", { hour12: false }) : marketTime(sym, t));
const shortDay = (d: string) => `${MON[Number(d.slice(5, 7)) - 1]} ${Number(d.slice(8, 10))}`;
// the crosshair's time: "Nov 2 13:30" on minute charts, "Nov 2 2026" on D / W, "Nov 2026" on M
const dayLabel = (d: string, range: Range) => (isMinutes(range) ? `${shortDay(d)} ${d.slice(11, 16)}` : range === "M" ? `${MON[Number(d.slice(5, 7)) - 1]} ${d.slice(0, 4)}` : `${shortDay(d)} ${d.slice(0, 4)}`);

// The full chart: a layer over the whole screen (on the body: nothing above it can box it in; its colours come from the
// .zl-fchart rule). Opened by "FULL CHART ›" or by turning the phone (closed again by turning it back, when turning opened
// it). Opened from a phone held upright, it is drawn turned (rotated 90°), so the chart is always wide; turning the phone then
// redraws it straight. A page redraw (new prices, a saved drawing) rebuilds it in place.
let FULL: { ticker: string; layer: HTMLElement; auto: boolean; turned: boolean; anchor: HTMLElement; o: ChartOpts } | null = null;
const closeFull = () => { FULL?.layer.remove(); FULL = null; };
const openFull = (anchor: HTMLElement, o: ChartOpts, auto = false) => {
    closeFull();
    const turned = Platform.isMobile && !wide();
    const layer = h(document.body, "div", "zl-fchart" + (turned ? " is-turned" : "") + (anchor.closest(".theme-dark") ? " theme-dark" : ""));   // not "zl-full": that is the body class for phone full screen
    FULL = { ticker: o.ticker, layer, auto, turned, anchor, o };
    for (const t of ["touchstart", "touchmove", "touchend"]) layer.addEventListener(t, (e) => e.stopPropagation(), { passive: true });   // no Obsidian edge swipe over it
    // sideways the chart page is always the full chart (owner, 2026-11-05: after ‹ the half layout had no way back in):
    // ‹ there goes back past the chart page to where it was opened from; upright, ‹ only closes the layer
    const close = () => { const leave = Platform.isMobile && wide(); closeFull(); if (leave) o.onLeave?.(); };
    holdingChart(layer, { ...o, full: true, turned, onClose: close });
};
let PORTRAIT: { box: HTMLElement; o: ChartOpts } | null = null;
let onTurn: (() => void) | null = null, onTurnLate: (() => void) | null = null;
const wide = () => window.innerWidth > window.innerHeight;
// the plugin unloads: no window listener or layer may outlive it
export const chartUnload = (): void => {
    if (onTurn) window.removeEventListener("resize", onTurn);
    if (onTurnLate) window.removeEventListener("orientationchange", onTurnLate);
    onTurn = onTurnLate = null; closeFull(); PORTRAIT = null;
};
const watchTurn = (box: HTMLElement, o: ChartOpts) => {
    PORTRAIT = { box, o };
    if (FULL && FULL.ticker === o.ticker && FULL.layer.isConnected) { const auto = FULL.auto; closeFull(); openFull(box, o, auto); }
    else if (FULL && !FULL.layer.isConnected) FULL = null;
    if (!Platform.isMobile) return;
    if (!onTurn) {
        onTurn = () => {
            const p = PORTRAIT, f = FULL;
            if (wide()) {
                if (f?.turned) openFull(f.anchor, f.o, f.auto);   // drawn sideways, now the phone is sideways: draw it straight
                else if (!f && p?.box.isConnected) openFull(p.box, p.o, true);
            } else if (f?.auto) closeFull();
            else if (f && !f.turned) openFull(f.anchor, f.o, false);   // opened sideways by the button, turned back: keep it wide
        };
        onTurnLate = () => window.setTimeout(() => onTurn?.(), 300);   // iOS: the new size can land after the event
        window.addEventListener("resize", onTurn);
        window.addEventListener("orientationchange", onTurnLate);
    }
    // already turned when the page was drawn: open once it is on screen
    if (wide() && !FULL) requestAnimationFrame(() => { if (box.isConnected && wide() && !FULL) openFull(box, o, true); });
};

// the quote as (exchange day, hundredths); the day comes from its market time in this device's zone (Taiwan for the owner)
// (at: its minute "YYYY-MM-DDTHH:MM", for minute bars)
// the live quote at the market's own minute and day (New York for a US ticker, as its bars are keyed)
export const liveOf = (prices: Prices, ticker: string): { day: string; at: string; price: number } | null => {
    const q = prices.get(ticker);
    if (!q) return null;
    const at = marketMinute(prices.symbol(ticker), q.asOf ?? q.time);
    return { day: at.slice(0, 10), at, price: Math.round(q.price * 100) };
};

// the window: `win` bars ending `off` bars before the latest
const sliceBars = (B: Bars, from: number, to: number): Bars => ({ d: B.d.slice(from, to), o: B.o.slice(from, to), h: B.h.slice(from, to), l: B.l.slice(from, to), c: B.c.slice(from, to), v: B.v.slice(from, to), ohlc: B.ohlc });
const drawBars = (plot: HTMLElement, full: Bars, win: number, off: number, range: Range, W: number, H: number, o: ChartOpts, L: Lines, cross: { x: number; y: number } | null = null): { G: Geo; k: number; B: Bars; crossI: number | null } => {
    const to = full.d.length - off, k = Math.max(0, to - win), B = sliceBars(full, k, to), n = B.d.length;
    const bbOn = o.prefs.bb ? L.bb : null;   // the readouts always have every value, the chart only the lines switched on
    const ma60 = LINE_ON.ma60 ? L.ma60.slice(k, to) : [], mb = LINE_ON.mb && L.bb ? L.bb.mb.slice(k, to) : [], ub = bbOn?.ub.slice(k, to) ?? [], lb = bbOn?.lb.slice(k, to) ?? [];
    let lo = Math.min(...B.l), hi = Math.max(...B.h);
    for (const x of lb) if (x !== null) lo = Math.min(lo, x);   // the bands stay on the chart
    for (const x of ub) if (x !== null) hi = Math.max(hi, x);
    const pc = range === "I" && full.pc ? full.pc : null;   // TODAY: the close before the session, a dashed reference
    if (pc) { lo = Math.min(lo, pc); hi = Math.max(hi, pc); }
    const cost = o.prefs.cost && o.cost ? o.cost : null;
    if (cost && !isMinutes(range) && cost > lo * 0.7 && cost < hi * 1.3) { lo = Math.min(lo, cost); hi = Math.max(hi, cost); }   // a far-off cost stays off the chart
    const pad = (hi - lo) * 0.06 || hi * 0.02;
    const vol = o.volume !== false && B.v.some((v) => v > 0);   // no volume known (index, live ticks only): no pane of zeros
    const yb = H - BOTTOM, y1 = vol ? Math.round(TOP + (yb - TOP) * 0.74) : yb;   // the price pane's bottom; volume below it
    // TODAY: room for the whole session (Taiwan 09:00–13:30 = 270 minutes, else 6.5 hours), the bars so far from the left
    // (zoomed into TODAY: just the bars on screen, like any interval)
    const tw = isTwSym(o.prices.symbol(o.ticker)), slots = range === "I" && win >= windowOf(full, "I") ? Math.max(n, tw ? 55 : 79) : n;
    // the last price tag rides just right of the latest bar (owner, 2026-11-10: option B), so a gap that wide is kept after
    // it on every interval (a full TODAY session, a zoom, D…): no candle is ever under the tag
    const tagW = (n ? price2(B.c[n - 1]).length : 4) * 6.6 + 8, gap = tagW + 6, span = W - 3;
    const free = n ? ((slots - n) * span) / Math.max(1, slots) : span;
    const sl = free >= gap || span <= gap * 2 ? slots : n + Math.ceil((gap * n) / (span - gap));
    const G = geometry(W, H, y1, sl, lo - pad, hi + pad);
    const crossI = cross && n ? nearestBar(n, G.i(cross.x)) : null, at = crossI ?? n - 1;   // the bar the readouts talk about
    const svg = svgEl(plot, "svg", { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, "zl-ch-svg");
    // everything drawn from data (MA, cost, drawings) stays inside the plot: a line that runs off it is cut at the edge
    const clipId = `zl-ch-clip-${o.ticker.replace(/\W/g, "")}-${Math.round(H)}`;
    const cp = svgEl(svgEl(svg, "defs", {}), "clipPath", { id: clipId });
    svgEl(cp, "rect", { x: G.x0, y: G.y0 - 6, width: G.x1 - G.x0, height: G.y1 - G.y0 + 6 });
    const inPlot = () => svgEl(svg, "g", { "clip-path": `url(#${clipId})` });

    // price grid + the axis on the left, labels inside the plot right of it (a tick label too close to the last price tag gives way to it)
    const yLast = Math.max(G.y0, Math.min(G.y1, G.y(B.c[n - 1])));
    for (const t of niceTicks(G.lo, G.hi)) {
        const y = G.y(t);
        if (y < G.y0 - 1 || y > G.y1 + 1) continue;
        svgEl(svg, "line", { x1: G.x0, x2: G.x1, y1: y, y2: y }, "zl-ch-grid");
        svgEl(svg, "line", { x1: G.x0, x2: G.x0 + 4, y1: y, y2: y }, "zl-ch-axis");
        if (Math.abs(y - yLast) >= 14 && y >= 24) text(svg, G.x0 + 7, y + 4, price2(t), "zl-ch-yl");
    }
    text(svg, G.x0 + 7, 10, o.currency, "zl-ch-cur");
    // time ticks: tick, faint grid line, label clear of both edges
    let right = -Infinity;   // where the last drawn label ends: a label that would touch it is left out
    const sym = o.prices.symbol(o.ticker);
    for (const t of xTicks(B.d.map((d) => shownD(sym, d, range)), range)) {
        const x = G.x(t.i), w = t.label.length * 6.6;
        svgEl(svg, "line", { x1: x, x2: x, y1: G.y0, y2: yb }, "zl-ch-grid zl-ch-vgrid");
        svgEl(svg, "line", { x1: x, x2: x, y1: yb, y2: yb + 4 }, "zl-ch-axis");
        if (x - w / 2 >= G.x0 + 2 && x + w / 2 <= G.x1 - 2 && x - w / 2 > right + 6) { text(svg, x, yb + 16, t.label, "zl-ch-xl", "middle"); right = x + w / 2; }
    }
    svgEl(svg, "line", { x1: G.x0, x2: G.x0, y1: G.y0 - 6, y2: yb }, "zl-ch-axis");
    svgEl(svg, "line", { x1: G.x0, x2: G.x1, y1: yb, y2: yb }, "zl-ch-axis");
    if (vol) {   // VOLUME pane: a divider, VOL / VOL5 / VOL10 at the bar talked about, one bar per candle (up ink, down loud), the 5 and 10 bar averages
        const vt = y1 + 16, vmax = Math.max(1, ...B.v), vy = (v: number) => yb - (v / vmax) * (yb - vt - 6);
        const v5 = movingAverage(full.v, 5).slice(k, k + n), v10 = movingAverage(full.v, 10).slice(k, k + n);
        svgEl(svg, "line", { x1: G.x0, x2: G.x1, y1: y1 + 6, y2: y1 + 6 }, "zl-ch-axis");
        const vn = (x: number | null) => (x === null ? "-" : volS(x));
        const vl = svgEl(svg, "text", { x: G.x0 + 4, y: vt + 2 }, "zl-ch-vl");
        for (const [k2, v, cls] of [["VOL", B.v[at], ""], ["VOL5", v5[at], "is-5"], ["VOL10", v10[at], "is-10"]] as [string, number | null, string][]) {
            const a = svgEl(vl, "tspan", { dx: k2 === "VOL" ? 0 : 8 }, "zl-ch-vk " + cls); a.textContent = k2 + " ";
            const b = svgEl(vl, "tspan", {}); b.textContent = vn(v);
        }
        const vw = Math.max(1, Math.min(18, G.step * 0.64));
        for (let i = 0; i < n; i++) { const ht = yb - vy(B.v[i]); if (ht > 0) svgEl(svg, "rect", { x: G.x(i) - vw / 2, y: yb - ht, width: vw, height: ht }, B.c[i] >= B.o[i] ? "zl-ch-up zl-ch-vol" : "zl-ch-down zl-ch-vol"); }
        for (const [a, cls] of [[v5, "zl-ch-v5"], [v10, "zl-ch-v10"]] as [(number | null)[], string][]) {
            const pts = a.map((m, i) => (m === null ? "" : `${G.x(i)},${vy(m)}`)).filter(Boolean);
            if (pts.length > 1) svgEl(svg, "polyline", { points: pts.join(" ") }, cls);
        }
    }

    // Bollinger: a faint fill between UB and LB, both edges muted (BB 2σ); MB its own line (MB 20), drawn with MA60 over the candles
    const path = (a: (number | null)[]) => a.map((m, i) => (m === null ? "" : `${G.x(i)},${G.y(m)}`)).filter(Boolean);
    if (bbOn) {
        const g = inPlot(), u = path(ub), l = path(lb);
        if (u.length > 1) { svgEl(g, "polygon", { points: [...u, ...l.reverse()].join(" ") }, "zl-ch-bbf"); svgEl(g, "polyline", { points: u.join(" ") }, "zl-ch-bb"); svgEl(g, "polyline", { points: path(lb).join(" ") }, "zl-ch-bb"); }
    }
    // candles, or a close line (TODAY, or a source with no OHLC); TODAY: the close before as a dashed line with its price
    const cw = Math.max(1, Math.min(18, G.step * 0.64));   // zoomed in, candles grow up to 18 px
    if (pc) { const y = G.y(pc); svgEl(svg, "line", { x1: G.x0, x2: G.x1, y1: y, y2: y }, "zl-ch-cost"); text(svg, G.x1 - 4, y - 4, `prev ${price2(pc)}`, "zl-ch-dl", "end"); }
    if (B.ohlc) for (let i = 0; i < n; i++) {
        const up = B.c[i] >= B.o[i], x = G.x(i), cls = up ? "zl-ch-up" : "zl-ch-down";
        svgEl(svg, "line", { x1: x, x2: x, y1: G.y(B.h[i]), y2: G.y(B.l[i]) }, cls + " zl-ch-wick");
        const yt = G.y(Math.max(B.o[i], B.c[i])), yb = G.y(Math.min(B.o[i], B.c[i]));
        svgEl(svg, "rect", { x: x - cw / 2, y: yt, width: cw, height: Math.max(1, yb - yt) }, cls);
    }
    else svgEl(svg, "polyline", { points: B.c.map((c, i) => `${G.x(i)},${G.y(c)}`).join(" ") }, "zl-ch-line");
    for (const [a, cls] of [[mb, "zl-ch-ma is-mb"], [ma60, "zl-ch-ma is-60"]] as [(number | null)[], string][]) {
        const pts = path(a);
        if (pts.length > 1) svgEl(inPlot(), "polyline", { points: pts.join(" ") }, cls);
    }
    if (cost) { const y = G.y(cost); if (y >= G.y0 && y <= G.y1) svgEl(svg, "line", { x1: G.x0, x2: G.x1, y1: y, y2: y }, "zl-ch-cost"); }

    drawings(inPlot(), G, full, k, o);
    // RANGE: the measured move, shaded, with its size in words
    const m = MEASURE.get(o.ticker);
    if (m) {
        const g = inPlot(), ia = indexOf(full.d, m.a.date) - k, ib = indexOf(full.d, m.b.date) - k;
        const xa = G.x(ia), xb = G.x(ib), ya = G.y(m.a.price), yB = G.y(m.b.price), d = m.b.price - m.a.price;
        svgEl(g, "rect", { x: Math.min(xa, xb), y: Math.min(ya, yB), width: Math.abs(xb - xa), height: Math.abs(yB - ya) }, "zl-ch-meas");
        const label = `${d >= 0 ? "+" : "\u2212"}${price2(Math.abs(d))} (${d >= 0 ? "+" : "\u2212"}${(Math.abs(d) / m.a.price * 100).toFixed(1)}%) · ${Math.round(Math.abs(ib - ia))} bars`;
        text(g, Math.min(G.x1 - 4, Math.max(xa, xb)), Math.min(ya, yB) - 5, label, "zl-ch-dl is-loud", "end");
    }

    // the window's highest high and lowest low, their prices beside the candle (pointing inward near an edge)
    if (n > 1) {
        const e = extremes(B, 0, n);
        for (const [i, p, dy] of [[e.hi, B.h[e.hi], -5], [e.lo, B.l[e.lo], 13]] as [number, number, number][]) {
            const x = G.x(i), endSide = x > (G.x0 + G.x1) / 2;
            text(svg, endSide ? x - 3 : x + 3, Math.max(G.y0 + 8, Math.min(G.y1 - 2, G.y(p) + dy)), price2(p), "zl-ch-dl is-ext", endSide ? "end" : "start");
        }
    }
    // the last price as a loud tag right of the latest bar, a dotted line back to the left edge; panned back, the close of
    // the bar at the right edge in an outlined tag (not the price now)
    const last = B.c[n - 1], yl = yLast, tx = Math.min(G.x1 - tagW, G.x(n - 1) + cw / 2 + 4);
    svgEl(svg, "line", { x1: G.x0, x2: tx, y1: yl, y2: yl }, off ? "zl-ch-now is-old" : "zl-ch-now");
    svgEl(svg, "rect", { x: tx, y: yl - 9, width: tagW, height: 18 }, off ? "zl-ch-tag is-old" : "zl-ch-tag");
    text(svg, tx + 4, yl + 4, price2(last), off ? "zl-ch-tagt is-old" : "zl-ch-tagt");
    // crosshair (touch-hold): lines through the held candle at its close (not the finger's height), its date on the time axis,
    // the close on the price axis
    if (cross && crossI !== null) {
        const x = G.x(crossI), cy = Math.max(G.y0, Math.min(G.y1, G.y(B.c[crossI])));
        svgEl(svg, "line", { x1: x, x2: x, y1: G.y0, y2: yb }, "zl-ch-cross");
        svgEl(svg, "line", { x1: G.x0, x2: G.x1, y1: cy, y2: cy }, "zl-ch-cross");
        svgEl(svg, "rect", { x: G.x0, y: cy - 9, width: AXIS - 2, height: 18 }, "zl-ch-ctag");
        text(svg, G.x0 + 4, cy + 4, price2(B.c[crossI]), "zl-ch-ctagt");
        const dl = dayLabel(shownD(o.prices.symbol(o.ticker), B.d[crossI], range), range), dw = dl.length * 6.6 + 10, dx = Math.max(G.x0, Math.min(G.x1 - dw, x - dw / 2));
        svgEl(svg, "rect", { x: dx, y: yb + 3, width: dw, height: 17 }, "zl-ch-ctag");
        text(svg, dx + dw / 2, yb + 15, dl, "zl-ch-ctagt", "middle");
    }
    return { G, k, B, crossI };
};

// Drawings, in data units mapped onto this window (clipped to the plot). Fib: levels from B back toward A, 50 and 61.8 loud with
// a light loud band between them, other levels muted, labels "61.8%  51.20" right-aligned inside the plot; the A→B leg dashed loud
// with square handles; older Fibs dimmed. Line: A through B on to the right edge. Level: a line with its price.
const drawings = (g: SVGGElement, G: Geo, full: Bars, k: number, o: ChartOpts) => {
    const xi = (date: string) => G.x(indexOf(full.d, date) - k);
    const fibs = o.memo.filter((d) => d.type === "fib" && !d.hidden), newest = fibs[fibs.length - 1];
    const handle = (x: number, y: number) => svgEl(g, "rect", { x: x - 3, y: y - 3, width: 6, height: 6 }, "zl-ch-handle");
    for (const d of o.memo) {
        if (d.hidden) continue;
        const ya = G.y(d.a.price);
        if (d.type === "level") {
            svgEl(g, "line", { x1: G.x0, x2: G.x1, y1: ya, y2: ya }, "zl-ch-level");
            text(g, G.x1 - 4, ya - 4, price2(d.a.price), "zl-ch-dl", "end");
            continue;
        }
        const b = d.b!, xa = xi(d.a.date), xb = xi(b.date), yb = G.y(b.price);
        if (d.type === "line") {
            const ia = indexOf(full.d, d.a.date) - k, ib = indexOf(full.d, b.date) - k, iEnd = G.i(G.x1);
            svgEl(g, "line", { x1: xa, y1: ya, x2: G.x1, y2: G.y(lineAt(ia, d.a.price, ib, b.price, iEnd)) }, "zl-ch-tline");
            handle(xa, ya); handle(xb, yb);
            continue;
        }
        const fg = svgEl(g, "g", {}, d === newest ? "zl-ch-fib" : "zl-ch-fib is-old");
        const L = fibLevels(d.a.price, b.price, o.prefs.fib), x0 = Math.min(xa, xb);
        const y50 = L.find((l) => l.r === 0.5), y618 = L.find((l) => Math.abs(l.r - 0.618) < 1e-9);
        if (y50 && y618) { const t = Math.min(G.y(y50.price), G.y(y618.price)); svgEl(fg, "rect", { x: x0, y: t, width: G.x1 - x0, height: Math.abs(G.y(y50.price) - G.y(y618.price)) }, "zl-ch-band"); }
        const isLoud = (r: number) => r === 0.5 || Math.abs(r - 0.618) < 1e-9, placed: number[] = [];
        for (const l of L) { const y = G.y(l.price); svgEl(fg, "line", { x1: x0, x2: G.x1, y1: y, y2: y }, isLoud(l.r) ? "zl-ch-fl is-loud" : "zl-ch-fl"); }
        // labels: 50 and 61.8 first, then the rest where they do not touch a label already placed
        for (const l of [...L].sort((p, q) => Number(isLoud(q.r)) - Number(isLoud(p.r)))) {
            const y = G.y(l.price);
            if (placed.some((py) => Math.abs(py - y) < 11)) continue;
            placed.push(y);
            text(fg, G.x1 - 4, y - 3, `${+(l.r * 100).toFixed(1)}%  ${price2(l.price)}`, isLoud(l.r) ? "zl-ch-dl is-loud" : "zl-ch-dl", "end");
        }
        svgEl(fg, "line", { x1: xa, y1: ya, x2: xb, y2: yb }, "zl-ch-leg");
        handle(xa, ya); handle(xb, yb);
    }
    // a first point waiting: its handle, loud
    const t = TOOL.get(o.ticker);
    if (t?.a) svgEl(g, "rect", { x: xi(t.a.date) - 4, y: G.y(t.a.price) - 4, width: 8, height: 8 }, "zl-ch-handle is-wait");
};
