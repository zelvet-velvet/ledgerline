// Order-flow drawing (market mode step 2, artifact "Invest Market Mode" sections 2 and 2b): the chart page's FOOTPRINT and
// VOLUME HEAT, the book pressure strip, the market map's treemap and its whole-market orders strip. Canvas, in the page's
// up / down / mark colours; the numbers come from calc/flow.ts.
import { dayCells, FBar, foldSmall, group, imbalances, pocOf, stacked, treemap, twTick, valueArea, Cell } from "../calc/flow";
import type { MisSnap } from "../calc/flow";

export interface Pal { ink: string; mut: string; dim: string; paper: string; up: string; dn: string; mark: string; loud: string; font: string }
export const palOf = (el: HTMLElement): Pal => {
    const s = getComputedStyle(el), v = (k: string, d: string) => s.getPropertyValue(k).trim() || d;
    return { ink: v("--zl-ink", "#1C1B19"), mut: v("--zl-mut", "#6D6A63"), dim: v("--zl-dim", "#D5D1C7"), paper: v("--zl-paper", "#ECE9E1"), up: v("--zl-up", "#126B55"), dn: v("--zl-down", "#C9503B"), mark: v("--zl-mark", "#2E5E73"), loud: v("--zl-loud", "#E8461F"), font: '"ZL IBM Plex Mono", ui-monospace, Menlo, monospace' };
};
export const alpha = (c: string, a: number): string => {
    const m = /^#([0-9a-f]{6})$/i.exec(c.trim());
    if (!m) return c;
    const n = parseInt(m[1], 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
export const fit = (cv: HTMLCanvasElement): { x: CanvasRenderingContext2D; w: number; h: number } | null => {
    const r = cv.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.round(r.width), h = Math.round(r.height);
    if (w < 2 || h < 2) return null;
    if (cv.width !== w * d || cv.height !== h * d) { cv.width = w * d; cv.height = h * d; }
    const x = cv.getContext("2d");
    if (!x) return null;
    x.setTransform(d, 0, 0, d, 0, 0);
    x.clearRect(0, 0, w, h);
    return { x, w, h };
};
const p0 = (p: number) => (p / 100).toLocaleString("en-US", { maximumFractionDigits: 2 });
const lots = (n: number) => (n >= 10000 ? `${(n / 1000).toFixed(0)}K` : Math.round(n).toLocaleString("en-US"));
const sgn = (n: number, d = 0) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })}`;
// a row height of at least `px` for the price span: the step (a whole number of ticks) for these rows
const rowStep = (lo: number, hi: number, rows: number): number => {
    const t = twTick((lo + hi) / 2);
    let s = t;
    while ((hi - lo) / s + 1 > rows) s += t;
    return s;
};
export interface Read { r1: string; r2: string; hint: string; why: string; detail: string; maxOff: number; colW: number }   // why: what the hint means and the levels to watch (a tap on the hint)
// what the page asks of a drawing: bars hidden off the right edge (pan), the finger's place for the crosshair (hold)
export interface View { off: number; cross: { x: number; y: number } | null; win?: number }
// the crosshair: a dashed line across at the row, one down the column, the price in a pill on the axis and the time under
const crossAt = (x: CanvasRenderingContext2D, P: Pal, cx: number, cy: number, x0: number, x1: number, y0: number, y1: number, price: string, time: string, bottom: number) => {
    x.strokeStyle = P.ink; x.lineWidth = 1; x.setLineDash([3, 3]);
    x.beginPath(); x.moveTo(x0, cy); x.lineTo(x1, cy); x.moveTo(cx, y0); x.lineTo(cx, y1); x.stroke(); x.setLineDash([]);
    x.font = `700 10px ${P.font}`; x.textBaseline = "middle";
    const pw = x.measureText(price).width + 8;
    x.fillStyle = P.ink; x.fillRect(0, cy - 8, pw, 16); x.fillStyle = P.paper; x.textAlign = "left"; x.fillText(price, 4, cy);
    const tw = x.measureText(time).width + 8, tx = Math.max(x0, Math.min(x1 - tw, cx - tw / 2));
    x.fillStyle = P.ink; x.fillRect(tx, bottom - 15, tw, 15); x.fillStyle = P.paper; x.fillText(time, tx + 4, bottom - 7.5);
};

// FOOTPRINT: the bars side by side (1 / 5 / 15 minutes each), each row sold-into-bid × bought-at-ask lots; darker rows traded
// more; a buy imbalance on an up block, a sell imbalance in the down colour; the bar's POC boxed in the mark colour; Δ under
// each bar. Held: the crosshair names the row's bar, price, both sides and their Δ.
export const drawFoot = (cv: HTMLCanvasElement, bars: FBar[], P: Pal, v: View): Read | null => {
    const f = fit(cv);
    if (!f) return null;
    const { x, w, h } = f;
    if (!bars.length) return null;
    const axisW = 46, dRow = 32, colMin = w < 520 ? 78 : 100;
    const nB = Math.max(1, Math.min(10, Math.floor((w - axisW) / colMin), bars.length));
    const maxOff = Math.max(0, bars.length - nB), off = Math.min(maxOff, Math.max(0, Math.round(v.off)));
    const vb = bars.slice(bars.length - nB - off, bars.length - off), t = twTick(vb[vb.length - 1].c);
    let lo = Math.min(...vb.map((b) => b.l)) - t, hi = Math.max(...vb.map((b) => b.h)) + t;
    const maxRows = Math.max(4, Math.floor((h - dRow - 8) / 17)), rs = rowStep(lo, hi, maxRows);
    lo = Math.floor(lo / rs) * rs; hi = Math.ceil(hi / rs) * rs;
    const rows = (hi - lo) / rs + 1, rh = Math.min(34, (h - dRow - 8) / rows), top = Math.max(4, (h - dRow - rows * rh) / 2), cw = (w - axisW) / vb.length;
    const Y = (p: number) => top + ((hi - p) / rs) * rh;
    x.textBaseline = "middle";
    x.font = `600 10px ${P.font}`; x.fillStyle = P.mut; x.textAlign = "left";
    const lstep = Math.max(1, Math.ceil(14 / rh));
    for (let k = 0, p = hi; p >= lo; p -= rs, k++) if (k % lstep === 0) x.fillText(p0(p), 2, Y(p) + rh / 2);
    let hint = "", why = "";
    const fs = cw < 90 ? 9.5 : 10.5, groups = vb.map((b) => group(b.cells, rs));
    vb.forEach((b, i) => {
        const x0 = axisW + i * cw, g = groups[i], ks = [...g.keys()].sort((a, c) => c - a);
        if (!ks.length) return;
        const vmax = Math.max(1, ...ks.map((k) => g.get(k)!.a + g.get(k)!.b)), poc = pocOf(g)!, im = imbalances(g, rs);
        const st = stacked(im.buy, rs) ?? stacked(im.sell, rs);
        if (st && i >= vb.length - 3 && !off) {
            const buy = im.buy.has(st[0]), z = `${p0(st[0])}\u2013${p0(st[1])}`;
            hint = `STACKED ${buy ? "BUY" : "SELL"} IMBALANCE ${z} \u203a`;
            why = buy ? `Buyers took 3\u00d7 the sellers on 3+ rows in a row (${z}): aggressive buying. On a pullback this zone often holds as support; a close back under ${p0(st[0])} cancels it.`
                : `Sellers hit 3\u00d7 the buyers on 3+ rows in a row (${z}): aggressive selling. On a bounce this zone often caps the price; a close back over ${p0(st[1])} cancels it.`;
        }
        for (const k of ks) {
            const q = g.get(k)!, y = Y(k), tv = (q.a + q.b) / vmax, mid = x0 + 10 + (cw - 14) / 2;
            x.fillStyle = alpha(P.ink, 0.05 + 0.22 * tv); x.fillRect(x0 + 10, y + 1, cw - 14, rh - 2);
            const bi = im.buy.has(k), si = im.sell.has(k);
            x.font = `${si ? 700 : 500} ${fs}px ${P.font}`; x.textAlign = "right"; x.fillStyle = si ? P.dn : P.ink; x.fillText(lots(q.b), mid - 5, y + rh / 2);
            x.font = `500 ${fs}px ${P.font}`; x.textAlign = "center"; x.fillStyle = P.mut; x.fillText("\u00d7", mid, y + rh / 2);
            x.textAlign = "left"; x.font = `${bi ? 700 : 500} ${fs}px ${P.font}`;
            if (bi) { const tw = x.measureText(lots(q.a)).width + 6; x.fillStyle = P.up; x.fillRect(mid + 3, y + 3, tw, rh - 6); x.fillStyle = P.paper; } else x.fillStyle = P.ink;
            x.fillText(lots(q.a), mid + 6, y + rh / 2);
        }
        x.strokeStyle = P.mark; x.lineWidth = 2; x.strokeRect(x0 + 10, Y(poc) + 1, cw - 14, rh - 2);
        const rY = (p: number) => Y(Math.floor(p / rs) * rs) + rh / 2;
        x.fillStyle = b.c >= b.o ? P.up : P.dn;
        x.fillRect(x0 + 5, rY(b.h), 1, Math.max(1, rY(b.l) - rY(b.h)));
        x.fillRect(x0 + 4, Math.min(rY(b.o), rY(b.c)) - 1, 3, Math.abs(rY(b.c) - rY(b.o)) + 2);
        if (i === vb.length - 1 && !off) { x.strokeStyle = P.ink; x.lineWidth = 1; x.setLineDash([2, 2]); x.strokeRect(x0 + 2, top, cw - 4, rows * rh); x.setLineDash([]); }
        x.textAlign = "center"; x.font = `700 11px ${P.font}`; x.fillStyle = b.d < 0 ? P.dn : P.up; x.fillText(`\u0394 ${sgn(Math.round(b.d))}`, x0 + cw / 2, h - dRow + 10);
        x.font = `500 9.5px ${P.font}`; x.fillStyle = P.mut; x.fillText(b.m, x0 + cw / 2, h - dRow + 24);
    });
    x.strokeStyle = P.ink; x.lineWidth = 2; x.beginPath(); x.moveTo(axisW, h - dRow); x.lineTo(w, h - dRow); x.stroke();
    let detail = "";
    if (v.cross) {
        const i = Math.max(0, Math.min(vb.length - 1, Math.floor((v.cross.x - axisW) / cw)));
        const k = Math.max(lo, Math.min(hi, hi - Math.floor((v.cross.y - top) / rh) * rs)), q = groups[i].get(k), b = vb[i];
        x.strokeStyle = P.ink; x.lineWidth = 1.5; x.strokeRect(axisW + i * cw + 8, top, cw - 10, rows * rh);
        crossAt(x, P, axisW + i * cw + cw / 2, Y(k) + rh / 2, axisW, w, top, top + rows * rh, p0(k), b.m, h);
        detail = q ? `${b.m} \u00b7 ${p0(k)} \u00b7 SOLD ${lots(q.b)} \u00d7 BOUGHT ${lots(q.a)} \u00b7 \u0394 ${sgn(Math.round(q.a - q.b))}` : `${b.m} \u00b7 ${p0(k)} \u00b7 no trades`;
    }
    const b = vb[vb.length - 1], bp = pocOf(b.cells);
    return { r1: `${off ? `BAR ${b.m}` : "THIS BAR"} \u00b7 \u0394 ${sgn(Math.round(b.d))} \u00b7 VOL ${lots(b.v)} \u00b7 POC ${bp !== null ? p0(bp) : "-"}`, r2: "bid \u00d7 ask \u00b7 lots", hint, why, detail, maxOff, colW: cw };
};

// VOLUME HEAT: price × minute over the window (30 min, 1 h or the day), each cell's lots (darker = more), tinted up where
// buyers lifted the ask and down where sellers hit the bid; the price line; the window's profile at the right with its POC
// (dashed, mark) and value area (dotted); the live 5-level ladder at the far right while showing the latest minutes
export const drawHeat = (cv: HTMLCanvasElement, all: FBar[], snap: MisSnap | null, P: Pal, v: View): Read | null => {
    const f = fit(cv);
    if (!f) return null;
    const { x, w, h } = f;
    if (!all.length) return null;
    const win = v.win && v.win < all.length ? v.win : all.length, maxOff = all.length - win, off = Math.min(maxOff, Math.max(0, Math.round(v.off)));
    const bars = all.slice(all.length - win - off, all.length - off);
    const live = !off && !!snap, bottom = 16;
    const axisW = 46, ladW = live ? 58 : 0, profW = 46, cw = (w - axisW - ladW - profW - 6) / bars.length;
    let lo = Math.min(...bars.map((b) => b.l)), hi = Math.max(...bars.map((b) => b.h));
    if (live && snap) { lo = Math.min(lo, ...snap.bids); hi = Math.max(hi, ...snap.asks); }
    const t = twTick(bars[bars.length - 1].c);
    lo -= t; hi += t;
    const rs = rowStep(lo, hi, Math.max(6, Math.floor((h - 12 - bottom) / 7)));
    lo = Math.floor(lo / rs) * rs; hi = Math.ceil(hi / rs) * rs;
    const rows = (hi - lo) / rs + 1, rh = (h - 12 - bottom) / rows, Y = (p: number) => 6 + ((hi - p) / rs) * rh;
    const grid = bars.map((b) => group(b.cells, rs));
    let vmax = 1;
    grid.forEach((g) => g.forEach((q) => { vmax = Math.max(vmax, q.a + q.b); }));
    grid.forEach((g, i) => {
        const x0 = axisW + i * cw;
        g.forEach((q, k) => {
            const vv = q.a + q.b, imb = vv ? (q.a - q.b) / vv : 0, a = Math.pow(vv / vmax, 0.7);
            x.fillStyle = alpha(Math.abs(imb) < 0.15 ? P.ink : imb > 0 ? P.up : P.dn, 0.06 + 0.8 * a);
            x.fillRect(x0, Y(k), cw + 0.5, rh - 1);
        });
    });
    x.strokeStyle = P.ink; x.lineWidth = 1.6; x.beginPath();
    bars.forEach((b, i) => { const px = axisW + i * cw + cw / 2, py = Y(Math.floor(b.c / rs) * rs) + rh / 2; if (i) x.lineTo(px, py); else x.moveTo(px, py); });
    x.stroke();
    // time labels under the cells: about every 70 px
    x.font = `500 9.5px ${P.font}`; x.fillStyle = P.mut; x.textBaseline = "bottom"; x.textAlign = "center";
    const every = Math.max(1, Math.ceil(70 / cw));
    bars.forEach((b, i) => { if (i % every === 0 && i) x.fillText(b.m, axisW + i * cw, h); });
    const day = group(dayCells(bars), rs), va = valueArea(day), whole = win === all.length;
    const px0 = w - ladW - profW - 2;
    if (va) {
        const pmax = Math.max(1, ...[...day.values()].map((q) => q.a + q.b));
        day.forEach((q, k) => { const inV = k >= va.val && k <= va.vah; x.fillStyle = alpha(inV ? P.ink : P.mut, inV ? 0.45 : 0.25); x.fillRect(px0, Y(k) + 1, ((q.a + q.b) / pmax) * (profW - 4), rh - 2); });
        x.strokeStyle = P.mark; x.lineWidth = 1.5; x.setLineDash([6, 4]);
        x.beginPath(); x.moveTo(axisW, Y(va.poc) + rh / 2); x.lineTo(px0 + profW - 4, Y(va.poc) + rh / 2); x.stroke();
        x.setLineDash([2, 3]); x.lineWidth = 1;
        for (const yy of [Y(va.vah), Y(va.val) + rh]) { x.beginPath(); x.moveTo(axisW, yy); x.lineTo(px0 + profW - 4, yy); x.stroke(); }
        x.setLineDash([]);
        x.fillStyle = P.mark; x.font = `700 9.5px ${P.font}`; x.textBaseline = "bottom"; x.textAlign = "left";
        x.fillText(`${whole ? "DAY " : ""}POC ${p0(va.poc)}`, axisW + 4, Y(va.poc) - 1);
        // the value area's edges carry their prices (owner, 2026-11-10: only the hint text had them), at the profile's left
        x.font = `600 9px ${P.font}`; x.textAlign = "right";
        x.fillText(`VA ${p0(va.vah + rs - twTick(va.vah))}`, px0 - 4, Y(va.vah) - 2);
        x.textBaseline = "top"; x.fillText(`VA ${p0(va.val)}`, px0 - 4, Y(va.val) + rh + 2);
    }
    x.textBaseline = "middle"; x.font = `600 10px ${P.font}`;
    if (live && snap) {
        const lx = w - ladW + 4, mx = Math.max(1, ...snap.bq, ...snap.aq);
        x.strokeStyle = P.ink; x.lineWidth = 2; x.beginPath(); x.moveTo(lx - 4, 0); x.lineTo(lx - 4, h); x.stroke();
        const lvl = (p: number, q: number, ask: boolean) => {
            const yy = Y(Math.floor(p / rs) * rs) + rh / 2;
            x.fillStyle = alpha(ask ? P.dn : P.up, 0.2); x.fillRect(lx, yy - 6, Math.min(ladW - 8, (q / mx) * (ladW - 8)), 12);
            x.fillStyle = ask ? P.dn : P.up; x.textAlign = "left"; x.fillText(lots(q), lx + 3, yy);
        };
        snap.bids.forEach((p, i) => lvl(p, snap.bq[i] ?? 0, false));
        snap.asks.forEach((p, i) => lvl(p, snap.aq[i] ?? 0, true));
        // what the column is (owner, 2026-11-10: the numbers were a mystery): the 5 best asks over the 5 best bids, in lots
        x.font = `700 9px ${P.font}`; x.textAlign = "left";
        x.fillStyle = P.dn; x.textBaseline = "top"; x.fillText("ASK", lx, 1);
        x.fillStyle = P.up; x.textBaseline = "bottom"; x.fillText("BID", lx, h - 2);
        x.textBaseline = "middle"; x.font = `600 10px ${P.font}`;
    }
    x.fillStyle = P.mut; x.textAlign = "left";
    const lstep = Math.max(1, Math.ceil(16 / rh));
    for (let k = 0, p = hi; p >= lo; p -= rs, k++) if (k % lstep === 0) x.fillText(p0(p), 2, Y(p) + rh / 2);
    let detail = "";
    if (v.cross) {
        const i = Math.max(0, Math.min(bars.length - 1, Math.floor((v.cross.x - axisW) / cw)));
        const k = Math.max(lo, Math.min(hi, hi - Math.floor((v.cross.y - 6) / rh) * rs)), q = grid[i].get(k), b = bars[i];
        crossAt(x, P, axisW + i * cw + cw / 2, Y(k) + rh / 2, axisW, px0 + profW, 0, h - bottom, p0(k), b.m, h);
        const vv = q ? q.a + q.b : 0;
        detail = q && vv ? `${b.m} \u00b7 ${p0(k)} \u00b7 ${lots(vv)} lots \u00b7 ${Math.round((q.a / vv) * 100)}% bought at the ask` : `${b.m} \u00b7 ${p0(k)} \u00b7 no trades`;
    }
    if (!va) return null;
    const lp = bars[bars.length - 1].c, where = lp > va.vah + rs - 1 ? "above" : lp < va.val ? "below" : "inside";
    const vah = p0(va.vah + rs - twTick(va.vah)), val = p0(va.val), poc = p0(va.poc);
    const why = where === "above" ? `Price is above the value area (${val}\u2013${vah}, where 70 % of the volume traded): buyers are paying up. Holding above ${vah} = the higher price is accepted; falling back inside = a failed break that often drifts to the POC ${poc}.`
        : where === "below" ? `Price is below the value area (${val}\u2013${vah}, where 70 % of the volume traded): sellers are pushing down. Staying under ${val} = the lower price is accepted; coming back inside = a failed break that often drifts to the POC ${poc}.` : "";
    return { r1: `${whole ? "TODAY" : `${bars[0].m}\u2013${bars[bars.length - 1].m}`} \u00b7 POC ${p0(va.poc)} \u00b7 value area ${p0(va.val)}\u2013${p0(va.vah + rs - twTick(va.vah))} \u00b7 price ${where}`, r2: "cell = lots per price per minute \u00b7 tint = aggressor", hint: off || where === "inside" ? "" : `PRICE ${where.toUpperCase()} VALUE AREA ${where === "above" ? "\u2191" : "\u2193"} \u203a`, why, detail, maxOff, colW: cw };
};

// the book pressure strip: one sliver per 5 s, up colour while bids queue more, down while asks do, stronger the more uneven
export const drawPress = (cv: HTMLCanvasElement, press: { v: number }[], P: Pal): number | null => {
    const f = fit(cv);
    if (!f || !press.length) return null;
    const n = Math.min(press.length, Math.floor(f.w / 3)), cw = f.w / n, sl = press.slice(-n);
    sl.forEach((p, i) => { f.x.fillStyle = alpha(p.v >= 0 ? P.up : P.dn, Math.min(1, 0.08 + Math.abs(p.v) * 1.6)); f.x.fillRect(i * cw, 0, cw + 0.4, f.h); });
    return sl[sl.length - 1].v;
};

// the market map: tiles sized by weight, coloured by today's % (±3 % = full colour). Tiles too small for a label (under about
// 56 × 34 px) fold into one "+N" tile (its % weighted); each label is fitted: name and % (big on a big tile), then % alone,
// then nothing; a chosen tile gets an ink outline
export interface Tile { k: string; w: number; pct: number | null; tap?: () => void; fold?: Tile[] }
const fitText = (x: CanvasRenderingContext2D, s: string, max: number): string => {
    if (x.measureText(s).width <= max) return s;
    let t = s;
    while (t.length > 1 && x.measureText(t + "\u2026").width > max) t = t.slice(0, -1);
    return t.length > 1 ? t + "\u2026" : "";
};
export const drawMap = (cv: HTMLCanvasElement, items: Tile[], P: Pal, chosen = ""): { rects: { t: Tile; x: number; y: number; w: number; h: number }[] } | null => {
    const f = fit(cv);
    if (!f) return null;
    const { x, w, h } = f;
    const { keep, small } = foldSmall(items.filter((i) => i.w > 0), w * h, 56 * 34);
    const list: Tile[] = [...keep];
    if (small.length) {
        const sw = small.reduce((s, i) => s + i.w, 0), known = small.filter((i) => i.pct !== null), kw = known.reduce((s, i) => s + i.w, 0);
        list.push({ k: `+${small.length}`, w: sw, pct: kw ? known.reduce((s, i) => s + i.w * (i.pct ?? 0), 0) / kw : null, fold: small });
    }
    const out = treemap(list, 0, 0, w, h);
    for (const r of out) {
        const pc = r.it.pct ?? 0, a = Math.min(1, Math.abs(pc) / 3), fold = !!r.it.fold;
        x.fillStyle = r.it.pct === null || Math.abs(pc) < 0.1 ? alpha(P.ink, 0.08) : alpha(pc > 0 ? P.up : P.dn, 0.12 + 0.83 * a);
        x.fillRect(r.x + 1, r.y + 1, r.w - 2, r.h - 2);
        if (fold) {   // the folded tile: hatched, so it reads as a group
            x.save(); x.beginPath(); x.rect(r.x + 1, r.y + 1, r.w - 2, r.h - 2); x.clip();
            x.strokeStyle = alpha(P.ink, 0.18); x.lineWidth = 1;
            for (let d = -r.h; d < r.w; d += 6) { x.beginPath(); x.moveTo(r.x + d, r.y + r.h); x.lineTo(r.x + d + r.h, r.y); x.stroke(); }
            x.restore();
        }
        if (r.it.k === chosen) { x.strokeStyle = P.ink; x.lineWidth = 3; x.strokeRect(r.x + 2.5, r.y + 2.5, r.w - 5, r.h - 5); }
        x.fillStyle = a > 0.45 ? P.paper : P.ink; x.textAlign = "left"; x.textBaseline = "top";
        const pt = r.it.pct === null ? "-" : `${sgn(pc, 2)}%`, room = r.w - 12, big = r.w > 150 && r.h > 90;
        if (big) {
            x.font = `700 18px ${P.font}`; x.fillText(fitText(x, r.it.k, room), r.x + 7, r.y + 7);
            x.font = `700 24px ${P.font}`; x.fillText(fitText(x, pt, room), r.x + 7, r.y + 31);
        } else if (r.h >= 34 && r.w >= 44) {
            x.font = `700 11px ${P.font}`; const nm = fitText(x, r.it.k, room);
            x.font = `600 11px ${P.font}`; const pv = fitText(x, pt, room);
            x.font = `700 11px ${P.font}`; if (nm) x.fillText(nm, r.x + 6, r.y + 6);
            x.font = `600 11px ${P.font}`; if (pv) x.fillText(pv, r.x + 6, r.y + 20);
        } else if (r.h >= 16 && r.w >= 30) {
            x.font = `600 9px ${P.font}`; const pv = fitText(x, r.it.pct === null ? "-" : sgn(pc, 1), r.w - 6); if (pv) x.fillText(pv, r.x + 3, r.y + 3);
        }
    }
    return { rects: out.map((r) => ({ t: r.it, x: r.x, y: r.y, w: r.w, h: r.h })) };
};

// the whole market's net buy − sell order lots per 5 minutes (blocks), and their running sum (the line under them). The
// 13:25–13:30 closing auction is left out (its orders dwarf the session's and flattened everything); the colour scale is the
// 90th percentile, so one big slot does not wash out the rest
export const drawOrders = (cv: HTMLCanvasElement, t: string[], all: number[], P: Pal): number | null => {
    const f = fit(cv);
    const net = all.filter((_, i) => t[i] < "13:30");
    if (!f || !net.length) return null;
    const { x, w, h } = f, n = net.length, cw = w / n, abs = net.map(Math.abs).sort((a, b) => a - b), mx = Math.max(1, abs[Math.floor(abs.length * 0.9)]);
    net.forEach((v, i) => { x.fillStyle = alpha(v >= 0 ? P.up : P.dn, 0.12 + 0.83 * Math.min(1, Math.abs(v) / mx)); x.fillRect(i * cw, 0, Math.max(1, cw - 1), 18); });
    let cum = 0;
    const cs = net.map((v) => (cum += v)), cl = Math.min(0, ...cs), ch = Math.max(0, ...cs), Y = (v: number) => 24 + ((ch - v) / (ch - cl || 1)) * (h - 36);
    x.strokeStyle = alpha(P.mut, 0.6); x.lineWidth = 1; x.setLineDash([2, 3]); x.beginPath(); x.moveTo(0, Y(0)); x.lineTo(w, Y(0)); x.stroke(); x.setLineDash([]);
    x.strokeStyle = cs[n - 1] >= 0 ? P.up : P.dn; x.lineWidth = 1.8; x.beginPath();
    cs.forEach((v, i) => { if (i) x.lineTo(i * cw + cw / 2, Y(v)); else x.moveTo(i * cw + cw / 2, Y(v)); });
    x.stroke();
    x.fillStyle = P.mut; x.font = `600 9px ${P.font}`; x.textBaseline = "bottom"; x.textAlign = "left"; x.fillText("09:00", 0, h);
    x.textAlign = "right"; x.fillText("13:25", w, h);
    return cs[n - 1];
};
export type { Cell };
