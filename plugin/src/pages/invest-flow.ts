// Market mode step 2 (artifact "Invest Market Mode" sections 2 and 2b, built 2026-11-10): the chart page's CANDLE · FOOTPRINT ·
// VOLUME HEAT switch for Taiwan stocks, and the MARKET MAP page (TWSE sectors or the watchlist as a treemap, with the whole
// market's orders under it). Data: prices/flow.ts; drawing: ui/flow.ts.
import { toBars, FBar, FTrade } from "../calc/flow";
import { t } from "../i18n";
import { h, page } from "../ui";
import { drawFoot, drawHeat, drawMap, drawOrders, drawPress, palOf, Read, Tile } from "../ui/flow";
import { fugleCode } from "../prices";
import type { PageOut } from "./index";
import { X, todayOf, openKey } from "./invest-shared";

type Mode = "candle" | "foot" | "heat";
let MODE: Mode = "candle";   // the last mode picked, for every Taiwan chart (this session)
// the range bar: FOOTPRINT's bar size (minutes), HEAT's window (minutes, 0 = the whole day); a pinch steps along the list
const FOOT_TF = [1, 5, 15], HEAT_WIN = [30, 60, 0];
let footTf = 1, heatWin = 0;
const hm = (ms: number) => new Date(ms + 8 * 3600e3).toISOString().slice(11, 16);   // Taipei's clock

// the switch above a Taiwan stock's chart; FOOTPRINT / VOLUME HEAT hide the candles and draw the tape instead: a range bar,
// the plot (hold = crosshair with the cell's numbers, drag sideways = back in time, pinch = the next range step), the book
// pressure strip and a read-out line. Loading: a light runs over the plot until the first trades; modes cross-fade.
export const flowModes = (x: X, top: HTMLElement, cg: HTMLElement, tk: string, chart: HTMLElement): void => {
    const prices = x.ctx.plugin.prices, flow = x.ctx.plugin.flow, sym = prices.symbol(tk);
    if (!fugleCode(sym)) return;
    // thin stocks (owner, 2026-11-10: 4585's switch was hidden and nothing said why): every Taiwan stock gets the switch; under
    // 1,000 lots a day on average over the last 5 days the read-out says THIN, the tape has few cells to read
    const thin = (): string => {
        const D = prices.series(tk, "D")?.bars, vs = D ? D.v.slice(-6, -1).filter((v) => v > 0) : [];
        if (vs.length < 3) return "";
        const avg = vs.reduce((a, b) => a + b, 0) / vs.length / 1000;
        return avg < 1000 ? t("fThin", { n: Math.round(avg).toLocaleString("en-US") }) : "";
    };
    const seg = h(top, "div", "zl-fmode");
    const box = h(cg, "div", "zl-flow");
    const bar = h(box, "div", "zl-flow-bar"), rng = h(bar, "div", "zl-fmode is-sm"), latest = h(bar, "button", "zl-flow-latest", t("fLatest"));
    const plot = h(box, "div", "zl-flow-plot is-loading"), cv = h(plot, "canvas");
    const load = h(plot, "div", "zl-flow-load", t("fTapeLoad"));
    const hint = h(plot, "button", "zl-flow-hint");
    const whyEl = h(plot, "div", "zl-flow-why");   // the hint's meaning: floats over the plot's foot, the page never moves
    let whyUntil = 0;
    // a tap on the hint: what it means and the levels to watch, in the read-out line for 10 s (another tap closes it)
    hint.addEventListener("pointerdown", (e) => e.stopPropagation());
    whyEl.addEventListener("pointerdown", (e) => { e.stopPropagation(); whyUntil = 0; later(); });
    hint.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); whyUntil = whyUntil > Date.now() ? 0 : Date.now() + 10000; draw(); window.setTimeout(later, 10050); });
    const ps = h(box, "div", "zl-flow-ps");
    h(ps, "span", "zl-flow-k", t("fPress"));
    const pcv = h(ps, "canvas"), pv = h(ps, "span", "zl-flow-k");
    const rd = h(box, "div", "zl-flow-read"), r1 = h(rd, "span"), r2 = h(rd, "span", "zl-flow-r2");
    let watching = false, raf = 0, off = 0, cross: { x: number; y: number } | null = null, last: Read | null = null;
    // bars kept until the tape or the bar size changes (a pan or a crosshair redraws many times a second)
    let memo: { n: number; tf: number; bars: FBar[] } | null = null;
    const barsOf = (trades: FTrade[], tf: number) => {
        if (!memo || memo.n !== trades.length || memo.tf !== tf) memo = { n: trades.length, tf, bars: toBars(trades, hm, tf) };
        return memo.bars;
    };
    const draw = () => {
        raf = 0;
        if (MODE === "candle" || !box.isConnected) return;
        const tp = flow.tape(sym), P = palOf(box), bars = tp ? barsOf(tp.trades, MODE === "foot" ? footTf : 1) : [];
        const r = MODE === "foot" ? drawFoot(cv, bars, P, { off, cross }) : drawHeat(cv, bars, tp?.snap ?? null, P, { off, cross, win: heatWin });
        last = r;
        if (r) off = Math.min(off, r.maxOff);
        plot.toggleClass("is-loading", !r);
        load.setText(!tp || tp.src === "fugle" && !tp.trades.length ? t("fTapeLoad") : prices.isOpen(tk) ? t("fWait") : t("fClosed"));
        latest.toggleClass("is-on", off > 0);
        const v = drawPress(pcv, tp?.press ?? [], P);
        pv.setText(v === null ? "-" : `${v >= 0 ? t("fBids") : t("fAsks")} ${Math.round(Math.abs(v) * 100)}%`);
        pv.toggleClass("is-up", v !== null && v > 0); pv.toggleClass("is-hot", v !== null && v < 0);
        const th = thin(), src = (!tp ? "" : tp.src === "fugle" ? t("fSrcFugle") : t("fSrcMis", { t: hm(tp.since) })) + (th ? ` \u00b7 ${th}` : "");
        const why = r?.why && whyUntil > Date.now() && !cross ? r.why : "";
        if (why) whyEl.setText(why);
        whyEl.toggleClass("is-on", !!why);
        if (r) { r1.setText(r.detail || r.r1); r1.toggleClass("is-cross", !!r.detail); r2.setText(`${r.r2} \u00b7 ${src}`); }
        else { r1.setText("\u00a0"); r2.setText(src || "\u00a0"); }
        hint.setText(r?.hint ?? ""); hint.toggleClass("is-on", !!r?.hint && !cross);
    };
    const later = () => { if (!raf) raf = requestAnimationFrame(draw); };
    // the range bar for the mode on screen
    const ranges = () => {
        rng.empty();
        const list = MODE === "foot" ? FOOT_TF : HEAT_WIN, cur = MODE === "foot" ? footTf : heatWin;
        for (const n of list) {
            const b = h(rng, "button", "zl-fmode-b" + (n === cur ? " is-on" : ""), MODE === "foot" ? `${n}M` : n ? (n < 60 ? `${n}M` : `${n / 60}H`) : t("fDay"));
            b.addEventListener("click", (e) => { e.preventDefault(); pick(n); });
        }
    };
    const pick = (n: number) => { if (MODE === "foot") footTf = n; else heatWin = n; off = 0; ranges(); fade(); };
    const step = (finer: boolean) => {   // a pinch: out = a longer range, in = a shorter one
        const list = MODE === "foot" ? FOOT_TF : HEAT_WIN, i = list.indexOf(MODE === "foot" ? footTf : heatWin), j = Math.max(0, Math.min(list.length - 1, i + (finer ? -1 : 1)));
        if (j !== i) pick(list[j]);
    };
    // a cross-fade: out, draw the new picture, in
    let fadeT = 0;
    const fade = () => { plot.addClass("is-out"); window.clearTimeout(fadeT); fadeT = window.setTimeout(() => { draw(); plot.removeClass("is-out"); }, 160); };
    latest.addEventListener("click", (e) => { e.preventDefault(); off = 0; later(); });
    // fingers on the plot: hold 0.3 s = crosshair (follows the finger until it lifts); a sideways drag = back in time by
    // whole bars; two fingers = a pinch, one range step per 25 % spread or squeeze
    const pts = new Map<number, { x: number; y: number }>();
    let holdT = 0, x0 = 0, y0 = 0, off0 = 0, panning = false, pinch0 = 0;
    const loc = (e: PointerEvent) => { const r = plot.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const spread = () => { const [a, b] = [...pts.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
    plot.addEventListener("pointerdown", (e) => {
        pts.set(e.pointerId, loc(e));
        try { plot.setPointerCapture(e.pointerId); } catch { /* gone */ }
        window.clearTimeout(holdT);
        if (pts.size === 2) { pinch0 = spread(); cross = null; panning = false; later(); return; }
        const p = loc(e); x0 = p.x; y0 = p.y; off0 = off; panning = false;
        holdT = window.setTimeout(() => { if (!panning && pts.size === 1) { cross = p; plot.addClass("is-cross"); later(); } }, 300);
    });
    plot.addEventListener("pointermove", (e) => {
        if (!pts.has(e.pointerId)) return;
        const p = loc(e);
        pts.set(e.pointerId, p);
        if (pts.size === 2 && pinch0) {
            const d = spread();
            if (d > pinch0 * 1.25) { step(true); pinch0 = d; } else if (d < pinch0 * 0.8) { step(false); pinch0 = d; }
            return;
        }
        if (cross) { cross = p; later(); return; }
        if (!panning && Math.abs(p.x - x0) > 8 && Math.abs(p.x - x0) > Math.abs(p.y - y0)) { panning = true; window.clearTimeout(holdT); }
        if (!panning && Math.hypot(p.x - x0, p.y - y0) > 8) window.clearTimeout(holdT);
        if (panning && last) { off = Math.max(0, Math.min(last.maxOff, off0 + Math.round((p.x - x0) / Math.max(4, last.colW)))); later(); }
    });
    const up = (e: PointerEvent) => {
        pts.delete(e.pointerId);
        if (pts.size < 2) pinch0 = 0;
        if (pts.size) return;
        window.clearTimeout(holdT);
        if (cross) { cross = null; plot.removeClass("is-cross"); later(); }
        panning = false;
    };
    plot.addEventListener("pointerup", up);
    plot.addEventListener("pointercancel", up);
    const set = (m: Mode) => {
        const was = MODE;
        MODE = m;
        btns.forEach(([k, b]) => b.toggleClass("is-on", k === m));
        const on = m !== "candle";
        chart.toggleClass("zl-hide", on); box.toggleClass("zl-hide", !on);
        if (on && !watching) { watching = true; flow.watch(sym); }
        if (!on && watching) { watching = false; flow.unwatch(sym); }
        off = 0; cross = null;
        if (on) { ranges(); if (was !== m) fade(); else later(); }
        (on ? box : chart).addClass("zl-fade-in");
        window.setTimeout(() => (on ? box : chart).removeClass("zl-fade-in"), 400);
    };
    const btns = ([["candle", t("fCandle")], ["foot", t("fFoot")], ["heat", t("fHeat")]] as [Mode, string][]).map(([k, label]) => {
        const b = h(seg, "button", "zl-fmode-b", label);
        b.addEventListener("click", (e) => { e.preventDefault(); if (k !== MODE) set(k); });
        return [k, b] as const;
    });
    flow.on((s) => { if (!box.isConnected) return false; if (s === sym && !cross) later(); return true; });
    new ResizeObserver(later).observe(plot);
    // the page left: the tape stops being fetched for it
    const gone = window.setInterval(() => { if (box.isConnected) return; window.clearInterval(gone); if (watching) { watching = false; flow.unwatch(sym); } }, 5000);
    set(MODE);
};

// MARKET MAP (MAP on Invest home): SECTORS = TWSE's sector indices live, tile size = the last day's trading value, colour =
// today's %; WATCHLIST = your watchlist, size = what you hold of it (unheld: the smallest held size), colour = today's %, a tap
// opens its chart. Under it the whole market's net buy − sell orders per 5 minutes (MI_5MINS: the last full day in the session).
let KIND: "sec" | "wl" = "sec";
const MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const dayTxt = (d: string) => { const m = /^(\d{4})-?(\d{2})-?(\d{2})$/.exec(d); return m ? `${MON[Number(m[2]) - 1]} ${Number(m[3])}` : d; };
export const mapPage = (x: X): PageOut => {
    const { ctx, P } = x, prices = ctx.plugin.prices, flow = ctx.plugin.flow;
    const title = t("fMapT");
    const el = page(title);
    el.addClass("zl-c-stack", "zl-mapg");
    const g = h(el, "div", "zl-c-group zl-c-fill zl-map");
    const top = h(g, "div", "zl-flow-top");
    const back = h(top, "button", "zl-flow-latest", t("fMapAll"));   // after a "+N" tap: back to every tile (its room kept)
    const src = h(top, "div", "zl-ch-src", t("fMapSrc"));
    const seg = h(top, "div", "zl-fmode");
    const plot = h(g, "div", "zl-flow-plot is-loading"), cv = h(plot, "canvas");
    h(plot, "div", "zl-flow-load", t("fTapeLoad"));
    const rd = h(g, "div", "zl-flow-read"), r1 = h(rd, "span"), r2 = h(rd, "span", "zl-flow-r2");
    const og = h(el, "div", "zl-c-group zl-orders");
    const oh = h(og, "div", "zl-flow-read"), o1 = h(oh, "span", "", t("fOrders")), o2 = h(oh, "span", "zl-flow-r2", "\u00a0");
    const ocv = h(h(og, "div", "zl-orders-plot"), "canvas");
    let rects: { t: Tile; x: number; y: number; w: number; h: number }[] = [], raf = 0, chosen = "", chosenAt = 0, inside: Tile[] | null = null;
    const tiles = (): Tile[] => {
        if (inside) return inside;
        if (KIND === "sec") return flow.sectors.map((s) => ({ k: s.name, w: s.w, pct: s.pct }));
        const held = new Map(P.positions.filter((p) => p.shares > 0).map((p) => [p.ticker, p.value]));
        const vals = [...held.values()].filter((v) => v > 0), floor = vals.length ? Math.min(...vals) : 1;
        return P.watch.map((tk) => ({ k: tk, w: held.get(tk) || floor, pct: todayOf(prices, tk)?.pct ?? null, tap: () => ctx.push(openKey(x, tk)) }));
    };
    const pc = (n: number) => `${n > 0 ? "+" : n < 0 ? "\u2212" : ""}${Math.abs(n).toFixed(2)}%`;
    const draw = () => {
        raf = 0;
        if (!el.isConnected) return;
        if (chosen && Date.now() - chosenAt > 8000) chosen = "";
        const Pl = palOf(g), list = tiles();
        rects = drawMap(cv, list, Pl, chosen)?.rects ?? [];
        plot.toggleClass("is-loading", !list.some((i) => i.pct !== null));
        back.toggleClass("is-on", !!inside);
        src.setText(inside ? t("fMapIn", { n: inside.length }) : KIND === "sec" ? t("fMapSrc") : t("fMapWlSrc"));
        const all = KIND === "sec" && !inside ? list : list, known = all.filter((i) => i.pct !== null), up = known.filter((i) => (i.pct ?? 0) > 0).length;
        const tw = known.reduce((s, i) => s + i.w, 0), idx = tw ? known.reduce((s, i) => s + i.w * (i.pct ?? 0), 0) / tw : 0;
        const pick = chosen ? rects.find((r) => r.t.k === chosen)?.t : undefined;
        if (pick) {   // a chosen tile: its own numbers
            const share = tw ? (pick.w / tw) * 100 : 0, gives = tw && pick.pct !== null ? (pick.w * pick.pct) / tw : null;
            r1.setText(t("fMapPick", { k: pick.fold ? t("fMapSmall", { n: pick.fold.length }) : pick.k, p: pick.pct === null ? "-" : pc(pick.pct), s: share.toFixed(1), g: gives === null ? "-" : pc(gives) }));
            r2.setText(pick.fold ? t("fMapOpenFold") : pick.tap ? t("fMapOpen") : "\u00a0");
        } else if (!known.length) { r1.setText(t("fMapWait")); r2.setText("\u00a0"); }
        else if (KIND === "sec") {
            const topS = [...known].sort((a, b) => b.w * Math.abs(b.pct ?? 0) - a.w * Math.abs(a.pct ?? 0))[0], share = tw ? (topS.w * (topS.pct ?? 0)) / tw : 0;
            r1.setText(t("fMapSec", { u: up, n: known.length, p: pc(idx), k: topS.k, s: pc(share) }));
            r2.setText(t("fMapSize", { d: dayTxt(flow.weightsDay()) || "-" }));
        } else { r1.setText(t("fMapWl", { u: up, n: known.length, p: pc(idx) })); r2.setText(t("fMapWlSize")); }
        const m = flow.mi5;
        // no orders yet (loading, or TWSE did not answer): the strip folds away and the map takes its room (owner, 2026-11-11:
        // an empty band under the map)
        ocv.parentElement?.toggleClass("zl-hide", !m);
        const end = m ? drawOrders(ocv, m.t, m.net, Pl) : null;
        const today = new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10);
        o2.setText(m ? `${m.date === today ? t("fMapToday") : t("fLastSession", { d: dayTxt(m.date) })}${end !== null ? ` \u00b7 ${end >= 0 ? t("fBuyHeavy") : t("fSellHeavy")}` : ""}` : t("fMapWait"));
        o1.setText(t("fOrders"));
    };
    const later = () => { if (!raf) raf = requestAnimationFrame(draw); };
    const swap = () => { plot.addClass("is-out"); window.setTimeout(() => { draw(); plot.removeClass("is-out"); }, 160); };
    const btns = ([["sec", t("fSectors")], ["wl", t("fWatch")]] as ["sec" | "wl", string][]).map(([k, label]) => {
        const b = h(seg, "button", "zl-fmode-b" + (KIND === k ? " is-on" : ""), label);
        b.addEventListener("click", (e) => { e.preventDefault(); KIND = k; inside = null; chosen = ""; btns.forEach(([q, bb]) => bb.toggleClass("is-on", q === k)); swap(); });
        return [k, b] as const;
    });
    back.addEventListener("click", (e) => { e.preventDefault(); inside = null; chosen = ""; swap(); });
    // a tap chooses a tile (its numbers in the line under the map); a second tap on it opens it: a ticker's chart, or the
    // folded small tiles
    cv.addEventListener("click", (e) => {
        const r = cv.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
        const hit = rects.find((q) => px >= q.x && px < q.x + q.w && py >= q.y && py < q.y + q.h)?.t;
        if (!hit) return;
        if (chosen === hit.k && Date.now() - chosenAt < 8000) {
            if (hit.fold) { inside = hit.fold; chosen = ""; swap(); return; }
            if (hit.tap) { hit.tap(); return; }
        }
        chosen = hit.k; chosenAt = Date.now(); later();
        window.setTimeout(later, 8050);
    });
    flow.map(true, () => { if (!el.isConnected) return false; later(); return true; });
    const gone = window.setInterval(() => { if (el.isConnected) return; window.clearInterval(gone); flow.map(false); }, 5000);
    prices.refresh(P.watch.map((tk) => prices.symbol(tk)));
    new ResizeObserver(later).observe(plot);
    new ResizeObserver(later).observe(ocv);
    later();
    return { title, el, still: true };
};

// the sector line under a Taiwan stock's price (owner, 2026-11-10): its sector index and TAIEX today, and the stock against its
// sector (REL: the stock's % − the sector's %), so a move reads at once as the stock's own or the whole group's; REL has its own
// line under the sector / TAIEX one (2026-11-10: beside a full price it was cut off), kept even while empty so nothing jumps
export const sectorLine = (x: X, parent: HTMLElement, tk: string): void => {
    const prices = x.ctx.plugin.prices, flow = x.ctx.plugin.flow, sym = prices.symbol(tk);
    if (!fugleCode(sym)) return;
    const line = h(parent, "div", "zl-lastp-x"), rel = h(parent, "div", "zl-lastp-x");
    const pc = (n: number, d = 2) => `${n > 0 ? "+" : n < 0 ? "\u2212" : ""}${Math.abs(n).toFixed(d)}%`;
    const part = (k: string, v: number | null, into = line) => {
        const s = h(into, "span");
        h(s, "span", "zl-lastp-xk", k);
        h(s, "span", v === null ? "" : v > 0 ? "is-up" : v < 0 ? "is-hot" : "", v === null ? "-" : pc(v));
    };
    const paint = () => {
        if (!line.isConnected) return false;
        line.empty(); rel.empty();
        const sec = flow.sectorOf(sym), sp = sec ? flow.idx.get(sec.code) ?? null : null, ix = flow.idx.get("t00") ?? null, me = todayOf(prices, tk)?.pct ?? null;
        if (sec) part(sec.name, sp);
        part("TAIEX", ix);
        if (sec && sp !== null && me !== null) part("REL", me - sp, rel);
        return true;
    };
    let stop: (() => void) | null = null, codes = "";
    const start = () => {
        const sec = flow.sectorOf(sym), want = ["t00", ...(sec ? [sec.code] : [])];
        if (want.join() === codes) return;
        stop?.(); codes = want.join();
        stop = flow.follow(want, () => { if (!line.isConnected) { stop?.(); return false; } start(); return paint(); });
    };
    start(); paint();
    prices.onQuote((s) => { if (!line.isConnected) return false; if (s === sym) paint(); return true; });
};
