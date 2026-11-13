import { t } from "../i18n";
import { h } from "./index";
import { Flap } from "./flap";
import { FlipDot } from "./flipdot";
import { calm, rowSprite, sprite } from "./pixel";
import { scrub, ScrubOpts } from "./scrub";

// Redesign C building blocks: section heads, split-flap readouts, pixel charts (blocks that appear one by one), budget rows.
const NS = "http://www.w3.org/2000/svg";
type Cell = [number, number, number, number, string, number?, string?];   // x, y, w, h, colour, delay ms, class

// Live tick (Design Rules › Motion › Live tick): while on, a redraw is a price update during trading, not a page coming in:
// the board rolls only its changed digits, bars change only at their tip, the label line marks only its changed characters
let TICK = false;
export const liveTick = (on: boolean): void => { TICK = on; };

const svgEl = (parent: HTMLElement, w: number, ht: number, cls = "zl-chart"): SVGSVGElement => {
    const s = document.createElementNS(NS, "svg");
    s.setAttribute("class", cls + " zl-grow");
    s.setAttribute("viewBox", `0 0 ${w} ${ht}`);
    s.setAttribute("shape-rendering", "crispEdges");
    parent.appendChild(s);
    return s;
};
// Motion (owner, 2026-11-04): every chart lights the same way, left to right column by column, bottom-up inside a column, the
// whole chart within LIGHT_MS (each block then turns in .12 s). The order comes from the blocks' places, not from each chart.
const LIGHT_MS = 300, COL_UP_MS = 30;
const blocks = (svg: SVGSVGElement, cells: Cell[], keep = false): void => {   // keep: the cells' own delays (live tick)
    const still = calm();
    const lit = cells.filter((c) => c[5] !== DARK);
    const xs = lit.map((c) => c[0]), ys = lit.map((c) => c[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const order = (c: Cell) => (c[5] === DARK ? DARK : Math.round(((c[0] - x0) / (x1 - x0 || 1)) * LIGHT_MS + ((y1 - c[1]) / (y1 - y0 || 1)) * COL_UP_MS));
    if (!keep) cells = cells.map((c) => [c[0], c[1], c[2], c[3], c[4], order(c), c[6]]);
    cells.forEach((c, i) => {
        const r = document.createElementNS(NS, "rect");
        r.setAttribute("x", String(c[0])); r.setAttribute("y", String(c[1])); r.setAttribute("width", String(c[2])); r.setAttribute("height", String(c[3]));
        r.setAttribute("fill", c[4]);
        if (c[6]) r.setAttribute("class", c[6]);
        r.style.setProperty("--d", `${still ? 0 : c[5] ?? i * 4}ms`);
        svg.appendChild(r);
    });
};

// Design Rules (charts): every pixel chart lays its whole grid of dark squares down at once, then turns its lit blocks over on
// top of them (the disc turn of the flip-dot board), never blocks popping out of an empty page. `lit` = the cells that light up.
const DARK = -500;   // delay that puts a cell at its end state at once
const grid = (cells: Cell[]): Cell[] => cells.map((c) => [c[0], c[1], c[2], c[3], "var(--zl-dim)", DARK]);

// The big number: a flip-dot board, or split-flap tiles (Settings › Big number). Either survives redraws (one per key), so a
// new value turns over from the old one instead of from blank.
export interface Board { readonly el: HTMLElement; dragged: boolean; set(text: string, dir?: number): void; drag(px: number): void }
class FlapBoard implements Board {
    readonly el: HTMLElement;
    private f = new Flap("xl");
    dragged = false;
    private text = "";
    constructor(parent: HTMLElement) {
        this.el = h(parent, "div", "zl-flapboard zl-board");
        this.el.appendChild(this.f.el);
        // a tab change: the tiles appear again from blank cards (the flap also replays with every page open, view.ts)
        this.el.addEventListener("zl-replay", () => this.f.replay());
    }
    set(text: string): void { this.text = text; this.f.set(text); }
    drag(px: number): void { this.f.el.style.transition = px ? "none" : "transform .2s cubic-bezier(.2,.8,.2,1)"; this.f.el.style.transform = px ? `translateX(${px * 0.35}px)` : ""; }
}
const BOARDS = new Map<string, Board>();
export const board = (parent: HTMLElement, key: string, text: string, dir = 1): Board => {
    const wrap = h(parent, "div", "zl-boardwrap");
    const flap = document.body.hasClass("zl-bigflap"), id = (flap ? "f:" : "d:") + key;
    let b = BOARDS.get(id);
    if (!b) { b = flap ? new FlapBoard(wrap) : new FlipDot(wrap); BOARDS.set(id, b); } else wrap.appendChild(b.el);
    b.set(text, dir);   // a live tick too: the same left-to-right sweep (FlipDot.set)
    return b;
};

// Horizontal drag on an element: the board follows, letting go past a quarter of the width calls onPass(-1 | 1)
export const dragBoard = (el: HTMLElement, b: Board, onPass: (step: -1 | 1) => void, can: (step: -1 | 1) => boolean): void => {
    let x0 = 0, y0 = 0, on = false, lock: "x" | "y" | null = null, dx = 0;
    el.addEventListener("touchstart", (e) => { const t = e.touches[0]; x0 = t.clientX; y0 = t.clientY; on = true; lock = null; dx = 0; b.dragged = false; }, { passive: true });
    el.addEventListener("touchmove", (e) => {
        if (!on) return;
        const t = e.touches[0], mx = t.clientX - x0, my = t.clientY - y0;
        if (!lock && Math.hypot(mx, my) > 8) lock = Math.abs(mx) > Math.abs(my) ? "x" : "y";
        if (lock !== "x") return;
        e.stopPropagation();
        dx = mx; b.dragged = true;
        b.drag(dx);
    }, { passive: true });
    const end = () => {
        if (!on) return;
        on = false;
        if (lock !== "x") return;
        const w = el.getBoundingClientRect().width || 1, step: -1 | 1 = dx < 0 ? 1 : -1;
        window.setTimeout(() => { b.dragged = false; }, 50);
        if (Math.abs(dx) > w / 4 && can(step)) onPass(step);
        else b.drag(0);
    };
    el.addEventListener("touchend", end);
    el.addEventListener("touchcancel", end);
};

// (key: a live tick marks the characters of `right` that changed since the last draw, each turning over once)
const BIGL = new Map<string, string>();
export const bigLabel = (parent: HTMLElement, left: string, right?: string, key?: string): HTMLElement => {
    const r = h(parent, "div", "zl-bigl");
    h(r, "span", "", left);
    if (!right) return r;
    const was = key ? BIGL.get(key) : undefined;
    if (key) BIGL.set(key, right);
    if (!TICK || was === undefined || was.length !== right.length || was === right) { h(r, "span", "", right); return r; }
    const sp = h(r, "span");
    [...right].forEach((ch, i) => { if (ch === was[i]) sp.appendText(ch); else h(sp, "span", "zl-tickc", ch); });
    return r;
};

// readouts: a label and a split-flap value per line (flaps persist per id, so a change flips from the old value)
const FLAPS = new Map<string, Flap>();
// extra (market mode, 2026-11-10): a line under the label (its first part in the up / down colour) and up / down tiles
export interface ReadX { sub?: [string, string]; tone?: "up" | "down" }
export const reads = (parent: HTMLElement, list: [string, string, string, ReadX?][]): HTMLElement => {
    const box = h(parent, "div", "zl-reads");
    for (const [label, id, value, x] of list) {
        const r = h(box, "div", "zl-read");
        if (x?.sub) {
            const k = h(r, "span", "zl-read-kk");
            h(k, "span", "zl-read-k", label);
            const s = h(k, "span", "zl-read-s");
            h(s, "span", x.tone ? `zl-${x.tone}` : "", x.sub[0]);
            s.appendText(` ${x.sub[1]}`);
        } else h(r, "span", "zl-read-k", label);
        let f = FLAPS.get(id);
        // a number is a fixed row of 5 tiles (more when it needs them), the unused ones dark blanks; words ("NOV 16") are not padded, their space is a blank tile
        if (!f) { f = new Flap("md", /^[+\-\u2212]?[\d,]+$/.test(value) ? 5 : 0); FLAPS.set(id, f); }
        r.appendChild(f.el);
        f.set(value.replace(/ /g, "\u00a0"));   // a space inside a word ("AUG 27") is a blank tile, not a gap (owner)
        f.el.toggleClass("is-up", x?.tone === "up"); f.el.toggleClass("is-down", x?.tone === "down");
    }
    return box;
};

// a section head in pixel type; with onMore it is a button with "MORE ‹"
export const sec = (parent: HTMLElement, label: string, onMore?: () => void, moreText = "MORE"): HTMLElement => {
    const s = h(parent, onMore ? "button" : "div", "zl-sec");
    h(s, "span", "", label);
    if (onMore) {
        const g = h(s, "span", "zl-sec-go", moreText);
        sprite(g, "back");
        s.addEventListener("click", (e) => { e.preventDefault(); onMore(); });
    }
    return s;
};

// 10 × 10 waffle of the month's income: out (ink), saved (muted), left (loud), with a key beside it; the blocks appear
// from the upper left, column by column, each column top to bottom (like the flip-dot board)
export const waffle = (parent: HTMLElement, o: { inc: number; out: number; saved: number; left: number; labels: [string, string, string]; fmt: (n: number) => string }, size = 11): HTMLElement => {
    const box = h(parent, "div", "zl-waffle");
    const total = Math.max(1, o.inc), outN = Math.round((Math.max(0, o.out) / total) * 100), saveN = Math.round((Math.max(0, o.saved) / total) * 100), p = size + 3;
    const cells: Cell[] = [];
    for (let i = 0; i < 100; i++) cells.push([(i % 10) * p, (9 - ((i / 10) | 0)) * p, size, size, "var(--zl-dim)", DARK]);   // the dark squares are there at once, like the budget bars
    if (o.inc > 0) for (let i = 0; i < 100; i++) cells.push([(i % 10) * p, (9 - ((i / 10) | 0)) * p, size, size, i < outN ? "var(--zl-text)" : i < outN + saveN ? "var(--zl-muted)" : "var(--zl-loud)", ((i % 10) * 10 + 9 - ((i / 10) | 0)) * 7]);
    const s = svgEl(box, 10 * p - 3, 10 * p - 3);
    s.style.width = `${10 * p - 3}px`;
    blocks(s, cells);
    const key = h(box, "div", "zl-wkey");
    const vals = [o.out, o.saved, o.left], cols = ["var(--zl-text)", "var(--zl-muted)", "var(--zl-loud)"];
    o.labels.forEach((l, i) => {
        const d = h(key, "div");
        const k = h(d, "span", "zl-wkey-k");
        h(k, "i").style.background = cols[i];
        k.appendChild(document.createTextNode(l));
        const v = h(d, "span", "zl-wkey-v", o.fmt(vals[i]));
        if (i === 2) v.style.color = "var(--zl-loud)";
    });
    return box;
};

// a budget bar in blocks with the pace line (where spending should be by today): ink while behind the pace, loud past it
// loudPast = false: past the line is not a problem by itself (a mix target), the caller says when it is with `hot`
// (key: the bar remembers how many blocks it had lit; on a live tick only the difference at the tip turns, 40 ms apiece)
const BAR_LIT = new Map<string, number>();
export const budgetBar = (parent: HTMLElement, spent: number, quota: number, pace: number, n = 20, cw = 7, ht = 12, loudPast = true, key?: string): SVGSVGElement => {
    const used = quota > 0 ? Math.min(n, Math.round((Math.max(0, spent) / quota) * n)) : 0, pc = Math.round(pace * n), p = cw + 2;
    const all: Cell[] = [], lit: Cell[] = [];
    const col = loudPast && pace > 0 && used > pc ? "var(--zl-loud)" : "var(--zl-text)";
    for (let i = 0; i < n; i++) { const c: Cell = [i * p, 3, cw, ht, col, 80 + i * 15]; all.push(c); if (i < used) lit.push(c); }
    const s = svgEl(parent, n * p, ht + 6);
    const was = key ? BAR_LIT.get(key) : undefined;
    if (key) BAR_LIT.set(key, used);
    const ticking = TICK && was !== undefined && !calm();
    if (ticking) {   // live tick: lit blocks stay; new ones light at the tip, lost ones go dark from the tip
        const tip: Cell[] = [];
        for (let i = 0; i < Math.max(used, was); i++) {
            if (i < Math.min(used, was)) tip.push([i * p, 3, cw, ht, col, DARK]);
            else if (i < used) tip.push([i * p, 3, cw, ht, col, (i - was) * 40]);
            else tip.push([i * p, 3, cw, ht, col, (was - 1 - i) * 40, "zl-out"]);
        }
        blocks(s, [...grid(all), ...tip], true);
    } else blocks(s, [...grid(all), ...lit]);
    // the pace / target line: on a live tick it stays lit (it blinked on every price, owner 2026-11-05)
    if (pace > 0 && pace < 1) blocks(s, [[pc * p - 1.5, 0, 2, ht + 6, "var(--zl-loud)", ticking ? DARK : 0]], ticking);
    return s;
};

// one budget line (readability redesign): the name left, "1,480 left of 3,000" (or "80 over", loud) right, the block bar full
// width under it with the pace line; a tap opens the group's page
export const bline = (parent: HTMLElement, o: { name: string; spent: number; quota: number; pace: number; value: string; of: string; hot: boolean; mix?: boolean; onTap: () => void }): HTMLElement => {
    const b = h(parent, "button", "zl-bline");
    const top = h(b, "span", "zl-bline-t");
    h(top, "span", "zl-bline-n", o.name);
    const v = h(top, "span", "zl-bline-v");
    h(v, "strong", o.hot ? "is-hot" : "", o.value);
    h(v, "span", "zl-bline-of", " " + o.of);
    const s = budgetBar(b, o.spent, o.quota, o.pace, 40, 7, 10, !o.mix, `${o.mix ? "mix" : "bud"}:${o.name}`);   // mix: the line is the target, loud only when off by too much
    s.setAttribute("preserveAspectRatio", "none");
    s.classList.add("zl-bline-bar");
    b.addEventListener("click", (e) => { e.preventDefault(); o.onTap(); });
    return b;
};

// one budget line: pixel icon, name, bar, what is left (loud when nearly gone)
export const brow = (parent: HTMLElement, o: { icon: string; name: string; spent: number; quota: number; pace: number; value: string; hot: boolean; onTap: () => void }): HTMLElement => {
    const b = h(parent, "button", "zl-brow");
    sprite(b, o.icon);
    h(b, "span", "zl-brow-n", o.name);
    budgetBar(b, o.spent, o.quota, o.pace);
    h(b, "span", "zl-brow-v" + (o.hot ? " is-hot" : ""), o.value);
    b.addEventListener("click", (e) => { e.preventDefault(); o.onTap(); });
    return b;
};

// ruled figures: pixel label left, display number right; a row with onTap opens its page
// `name`: k is a name (a person, a thing), set in display type so it reads at a glance; `scrub`: hold and drag sets the amount
export interface Fig { k: string; s?: string; v: string; icon?: string; hot?: boolean; dim?: boolean; name?: boolean; beam?: number; onTap?: () => void; scrub?: () => ScrubOpts }
export const figures = (parent: HTMLElement, list: Fig[]): HTMLElement => {
    const box = h(parent, "div", "zl-figs");
    list.forEach((f, i) => {
        const r = h(box, f.onTap ? "button" : "div", "zl-fig zl-in" + (f.dim ? " is-dim" : "") + (f.name ? " is-name" : ""));
        r.style.setProperty("--i", String(i));
        sprite(r, f.icon ?? rowSprite(f.k), "zl-px zl-fig-ic");
        if (f.s) { const m = h(r, "span", "zl-fig-main"); h(m, "span", "zl-fig-k", f.k); h(m, "span", "zl-fig-s", f.s); }
        else h(r, "span", "zl-fig-k", f.k);
        const v = h(r, "span", "zl-fig-v" + (f.hot ? " is-hot" : ""), f.v);
        if (f.onTap) { const fn = f.onTap; sprite(r, "back", "zl-px zl-fig-go"); r.addEventListener("click", (e) => { e.preventDefault(); fn(); }); }
        if (f.beam !== undefined) { r.addClass("is-beam"); beamStrip(r, f.beam, i); }
        if (f.scrub) { const g = f.scrub; scrub(r, () => { const o = g(); return { ...o, live: (n) => { v.textContent = o.fmt(n); o.live?.(n); } }; }); }
    });
    return box;
};

// one row's balance under it: blocks from the centre, left (loud) when you owe, right (ink) when owed; r = −1 … 1
const beamStrip = (parent: HTMLElement, r: number, li: number, half = 18): void => {
    const cw = 8, gap = 2, p = cw + gap, W = half * 2 * p + 4, all: Cell[] = [], lit: Cell[] = [];
    const n = r === 0 ? 0 : Math.max(1, Math.round(Math.min(1, Math.abs(r)) * half));
    for (let i = 0; i < half; i++) {
        const left: Cell = [(half - 1 - i) * p, 0, cw, 6, "var(--zl-loud)", 120 + li * 60 + i * 18];
        const right: Cell = [half * p + 4 + i * p, 0, cw, 6, "var(--zl-text)", 120 + li * 60 + i * 18];
        all.push(left, right);
        if (r < 0 && i < n) lit.push(left);
        if (r > 0 && i < n) lit.push(right);
    }
    const s = svgEl(parent, W, 6, "zl-chart zl-fig-beam");
    s.setAttribute("preserveAspectRatio", "none");
    blocks(s, [...grid(all), [half * p, -2, 2, 10, "var(--zl-muted)", DARK], ...lit]);
};

// a grid of small tiles (3 per row): pixel name, display amount; an empty one is dim. Many items stay on one screen.
// cols: force the columns (2 = an even two-across grid, an odd last tile spans the row); s = a small line under the amount
export const tileGrid = (parent: HTMLElement, list: { k: string; v: string; s?: string; icon?: string; dim?: boolean; hot?: boolean; onTap: () => void; scrub?: () => ScrubOpts; ref?: (b: HTMLElement) => void }[], cols?: 2): HTMLElement => {
    const g = h(parent, "div", "zl-tgrid" + (cols === 2 ? " is-2 is-span" : list.length === 4 ? " is-4" : list.length <= 2 ? " is-2" : ""));
    for (const x of list) {
        const b = h(g, "button", "zl-tg" + (x.dim ? " is-dim" : "") + (x.hot ? " is-hot" : ""));
        const top = h(b, "span", "zl-tg-top");
        sprite(top, x.icon ?? rowSprite(x.k), "zl-px zl-tg-ic");
        h(top, "span", "zl-tg-k", x.k);
        const v = h(b, "span", "zl-tg-v", x.v);
        if (x.s) h(b, "span", "zl-tg-s", x.s);
        b.addEventListener("click", (e) => { e.preventDefault(); x.onTap(); });
        x.ref?.(b);
        if (x.scrub) { const gt = x.scrub; scrub(b, () => { const o = gt(); return { ...o, live: (n) => { v.textContent = o.fmt(n); b.toggleClass("is-dim", !n); o.live?.(n); } }; }); }
    }
    return g;
};

// One screen, every page: a step for PageOut.trim. Drops the last row of a figures box (never below `keep`; at 0 its group goes
// too) and returns true, or false when there is nothing left to drop. Pages chain steps from least to most needed.
export const dropRow = (box: HTMLElement, keep = 1): (() => boolean) => () => {
    const rows = box.querySelectorAll(":scope > .zl-fig");
    if (!rows.length || rows.length <= keep) return false;
    rows[rows.length - 1].remove();
    if (rows.length - 1 === 0) box.closest(".zl-c-group")?.remove();
    return true;
};
export const trimSteps = (...steps: (() => boolean)[]): (() => boolean) => () => steps.some((s) => s());
// a tile grid's columns for n tiles: 2 across for 1–2, 4 across for 4, else 3 (Design Rules: up to 4 across)
export const gridOf = <T>(list: T[], max: number, more: (n: number) => T): T[] => (list.length > max ? [...list.slice(0, max - 1), more(list.length - max + 1)] : list);

// The bottom bar (Gravity: hands at the bottom). On a deeper page Back lives here, not in a corner: "‹ BACK · <where to>" on the
// left, the page's own action (if any) beside it. The buttons swap in one frame, never wiped or emptied (that read as a blink);
// pressed, Back's arrow steps left.
export interface DockAct { text: string; label: string; hint?: string; loud?: boolean; onTap: () => void }
// A redraw with the same buttons keeps them (only their taps are updated): rebuilding them made Back blink.
const DOCK_TAPS = new WeakMap<HTMLElement, { back?: () => void; act?: () => void; side?: (() => void)[] }>();
// side: square icon buttons after the action (owner, 2026-11-05: the scope sits beside + TRADE)
export const dock = (host: HTMLElement, o: { back?: { to: string; onTap: () => void }; act?: DockAct; side?: { icon: string; label: string; onTap: () => void }[] }): void => {
    const side = o.side ?? [];
    const sig = JSON.stringify([o.back?.to ?? null, o.act ? [o.act.text, o.act.label, o.act.hint ?? "", !!o.act.loud] : null, side.map((s) => s.icon)]);
    const taps = { back: o.back?.onTap, act: o.act?.onTap, side: side.map((s) => s.onTap) };
    if (host.dataset.sig === sig && host.childElementCount) { DOCK_TAPS.set(host, taps); return; }
    host.dataset.sig = sig;
    DOCK_TAPS.set(host, taps);
    host.empty();
    host.toggleClass("is-on", !!(o.back || o.act || side.length));
    host.toggleClass("is-split", !!(o.back && o.act));
    if (o.back) {
        const back = o.back;
        const b = h(host, "button", "zl-dock-b zl-dock-back");
        b.setAttribute("aria-label", back.to);
        sprite(b, "back");
        h(b, "span", "zl-dock-t", back.to.toUpperCase());
        b.addEventListener("click", (e) => { e.preventDefault(); DOCK_TAPS.get(host)?.back?.(); });
    }
    if (o.act) {
        const a = o.act;
        const b = h(host, "button", "zl-dock-b zl-dock-act" + (a.loud ? " is-loud" : ""));
        b.setAttribute("aria-label", a.label);
        if (!a.loud) sprite(b, "plus");
        h(b, "span", "zl-dock-t", a.text);
        if (a.hint && !o.back) h(b, "span", "zl-dock-h", a.hint);
        b.addEventListener("click", (e) => { e.preventDefault(); DOCK_TAPS.get(host)?.act?.(); });
    }
    side.forEach((s, i) => {
        const b = h(host, "button", "zl-dock-b zl-dock-ico");
        b.setAttribute("aria-label", s.label);
        sprite(b, s.icon);
        b.addEventListener("click", (e) => { e.preventDefault(); DOCK_TAPS.get(host)?.side?.[i]?.(); });
    });
};

// ---- the top of a tab's first page (Design Rules, "C home"): the flip-dot board with the one number, its label line, and
// at most two split-flap readouts under it. Every tab's first page starts with this, so they all read the same way.
export const homeTop = (parent: HTMLElement, o: { key: string; value: string; label: string; right?: string; tone?: "up" | "down"; reads?: ([string, string] | [string, string, ReadX])[]; onDrag?: { pass: (d: -1 | 1) => void; can: (d: -1 | 1) => boolean } }): HTMLElement => {
    const g = h(parent, "div", "zl-c-group zl-c-top");
    const b = board(g, o.key, o.value);
    if (o.onDrag) dragBoard(g, b, o.onDrag.pass, o.onDrag.can);
    const bl = bigLabel(g, o.label, o.right, o.key);   // sentence case: what the number is, and one plain fact
    if (o.tone && o.right) (bl.lastElementChild as HTMLElement | null)?.addClass(`zl-${o.tone}`);
    if (o.reads?.length) reads(g, o.reads.map(([k, v, x], i) => [k, `${o.key}-r${i + 1}`, v, x]));
    return g;
};

// a detail page's summary (Design Rules, "C detail"): label in pixel type, the number in display type, up to three small figures
// The number is a split-flap (one per key, so a change flips from the old value); long numbers use smaller tiles.
const SUMS = new Map<string, Flap>();
export const summary = (parent: HTMLElement, o: { key?: string; label: string; value: string; hot?: boolean; dim?: boolean; items?: [string, string, boolean?][] }): HTMLElement => {
    const g = h(parent, "div", "zl-c-group zl-c-top zl-sum");
    h(g, "div", "zl-sum-l", o.label.toUpperCase());
    const size = o.value.length > 7 ? "md" : o.value.length > 6 ? "lg" : "xl";
    const id = `${o.key ?? o.label}|${size}`;
    let f = SUMS.get(id);
    if (!f) { f = new Flap(size); SUMS.set(id, f); }
    const box = h(g, "div", "zl-sum-flap" + (o.hot ? " is-hot" : "") + (o.dim ? " is-dim" : ""));
    box.appendChild(f.el);
    f.set(o.value);
    if (o.items?.length) {
        const r = h(g, "div", "zl-sum-items");
        for (const [k, v, hot] of o.items) { const it = h(r, "div"); h(it, "span", "zl-sum-k", k.toUpperCase()); h(it, "span", "zl-sum-v" + (hot ? " is-hot" : ""), v); }
    }
    return g;
};

// staircase: one column of blocks per step (e.g. the debt at the end of each year), height = value / the first value;
// a column whose value is 0 shows one loud block (paid off). Labels under the first and last column.
export const stairs = (parent: HTMLElement, vals: number[], first: string, last: string, rows = 10): HTMLElement => {
    const box = h(parent, "div", "zl-stairs");
    const n = Math.max(1, vals.length), W = 396, gap = n > 24 ? 2 : 4, cw = Math.max(4, Math.floor((W - gap * (n - 1)) / n)), bh = 8, p = bh + 3;
    const top = Math.max(1, ...vals), all: Cell[] = [], lit: Cell[] = [];
    vals.forEach((v, i) => {
        const k = v <= 0 ? 0 : Math.max(1, Math.round((v / top) * rows));
        for (let r = 0; r < rows; r++) {
            const c: Cell = [i * (cw + gap), (rows - 1 - r) * p, cw, bh, "var(--zl-text)", 80 + r * 45 + i * 6];
            all.push(c);
            if (r < k) lit.push(c);
        }
        if (!k) lit.push([i * (cw + gap), (rows - 1) * p, cw, bh, "var(--zl-loud)", 80 + i * 6]);
    });
    const s = svgEl(box, n * (cw + gap) - gap, rows * p - 3);
    s.setAttribute("preserveAspectRatio", "none");
    blocks(s, [...grid(all), ...lit]);
    const l = h(box, "div", "zl-stairs-l");
    h(l, "span", "", first.toUpperCase());
    h(l, "span", "", last.toUpperCase());
    return box;
};

// year bricks (Debt, readability redesign): one column of bricks per year, height = what is left at the end of that year against
// the first; the column of `loud` (this year) is loud, a year label under every column. Stretches with zl-c-fill.
export const yearBricks = (parent: HTMLElement, vals: number[], labels: string[], loud: number, rows = 10): HTMLElement => {
    const box = h(parent, "div", "zl-stairs zl-years");
    const n = Math.max(1, vals.length), W = 396, gap = 6, cw = Math.max(4, Math.floor((W - gap * (n - 1)) / n)), bh = 8, p = bh + 3;
    const top = Math.max(1, ...vals), all: Cell[] = [], lit: Cell[] = [];
    vals.forEach((v, i) => {
        const k = v <= 0 ? 0 : Math.max(1, Math.round((v / top) * rows));
        for (let r = 0; r < rows; r++) {
            const c: Cell = [i * (cw + gap), (rows - 1 - r) * p, cw, bh, i === loud ? "var(--zl-loud)" : "var(--zl-text)", 80 + r * 45 + i * 6];
            all.push(c);
            if (r < k) lit.push(c);
        }
    });
    const s = svgEl(box, n * (cw + gap) - gap, rows * p - 3);
    s.setAttribute("preserveAspectRatio", "none");
    blocks(s, [...grid(all), ...lit]);
    const l = h(box, "div", "zl-years-l");
    l.style.setProperty("--n", String(n));
    for (const x of labels) h(l, "span", "", x);
    return box;
};

// a bar chart someone picks from (Rules - Charts: a month of revenue): one column of bricks per value against the biggest, a
// strip of one cell under each column in up / down (e.g. its change on a year before; null = dark), labels under it; a tap or a
// drag across the bars picks one: the picked column ink, the others muted, onPick says which (the rows show its numbers)
export const pickBars = (parent: HTMLElement, o: { vals: number[]; strip: (number | null)[]; labels: string[]; pick: number; onPick: (i: number) => void }, rows = 12): HTMLElement => {
    const box = h(parent, "div", "zl-stairs zl-years zl-pickbars");
    const n = Math.max(1, o.vals.length), W = 396, gap = 4, cw = Math.max(4, Math.floor((W - gap * (n - 1)) / n)), bh = 6, p = bh + 2;
    const top = Math.max(1, ...o.vals), all: Cell[] = [], lit: Cell[] = [], H = rows * p + 6 + bh;
    const tone = (i: number) => (i === o.pick ? "var(--zl-text)" : "var(--zl-muted)");
    o.vals.forEach((v, i) => {
        const k = v <= 0 ? 0 : Math.max(1, Math.round((v / top) * rows));
        for (let r = 0; r < rows; r++) {
            const c: Cell = [i * (cw + gap), (rows - 1 - r) * p, cw, bh, tone(i), 80 + r * 45 + i * 6, `zl-pb-b zl-pb-${i}`];
            all.push(c);
            if (r < k) lit.push(c);
        }
        const d = o.strip[i];
        const sc: Cell = [i * (cw + gap), rows * p + 6, cw, bh, d === null || d === undefined ? "var(--zl-dim)" : d >= 0 ? "var(--zl-up)" : "var(--zl-down)", 80 + i * 6];
        all.push(sc);
        if (d !== null && d !== undefined) lit.push(sc);
    });
    const s = svgEl(box, n * (cw + gap) - gap, H);
    s.setAttribute("preserveAspectRatio", "none");
    blocks(s, [...grid(all), ...lit]);
    const l = h(box, "div", "zl-years-l");
    l.style.setProperty("--n", String(n));
    for (const x of o.labels) h(l, "span", "", x);
    let cur = o.pick;
    const paint = (i: number) => {
        if (i === cur) return;
        cur = i;
        s.querySelectorAll<SVGRectElement>(".zl-pb-b").forEach((r) => { const c = Number(/zl-pb-(\d+)/.exec(r.getAttribute("class") ?? "")?.[1]); if (r.getAttribute("fill") !== "var(--zl-dim)") r.setAttribute("fill", c === i ? "var(--zl-text)" : "var(--zl-muted)"); });
        o.onPick(i);
    };
    // only the lit bricks change colour: the dark grid under them keeps its own fill
    s.querySelectorAll<SVGRectElement>(".zl-pb-b").forEach((r) => { if (r.getAttribute("fill") === "var(--zl-dim)") r.removeAttribute("class"); });
    const at = (cx: number) => { const b = s.getBoundingClientRect(); paint(Math.max(0, Math.min(n - 1, Math.floor(((cx - b.left) / (b.width || 1)) * n)))); };
    let down = false;
    box.addEventListener("pointerdown", (e) => { down = true; at(e.clientX); });
    box.addEventListener("pointermove", (e) => { if (down) at(e.clientX); });
    for (const ev of ["pointerup", "pointercancel", "pointerleave"]) box.addEventListener(ev, () => { down = false; });
    box.addEventListener("touchmove", (e) => e.stopPropagation(), { passive: true });
    return box;
};

// towers: one tower of blocks per thing (a fund), filled to done / target from the bottom, its name and amount under it; a tap opens it
// (no target: the height is its share of the biggest one, in ink; loud only when a target is reached)
export const towers = (parent: HTMLElement, list: { k: string; v: string; done: number; target: number; onTap: () => void }[], rows = 12): HTMLElement => {
    const box = h(parent, "div", "zl-towers");
    const most = Math.max(1, ...list.map((x) => x.done));
    box.style.setProperty("--n", String(Math.max(1, list.length)));
    list.forEach((x, i) => {
        const b = h(box, "button", "zl-tower");
        const k = Math.min(rows, Math.round((Math.max(0, x.done) / (x.target > 0 ? x.target : most)) * rows)), full = x.target > 0 && x.done >= x.target;
        const all: Cell[] = [];
        for (let r = 0; r < rows; r++) for (let b = 0; b < 4; b++) all.push([b * 10.5, (rows - 1 - r) * 10, 9, 7, full ? "var(--zl-loud)" : "var(--zl-text)", 80 + r * 45 + i * 12]);   // a row = 4 bricks, lit together
        const cells = [...grid(all), ...all.slice(0, k * 4)];
        const sv = svgEl(b, 40, rows * 10 - 3, "zl-chart zl-tower-c");
        sv.setAttribute("preserveAspectRatio", "none");
        blocks(sv, cells);
        h(b, "span", "zl-tower-k", x.k.toUpperCase());
        h(b, "span", "zl-tower-v", x.v);
        b.addEventListener("click", (e) => { e.preventDefault(); x.onTap(); });
    });
    return box;
};

// a price line as pixel columns (one per close), scaled between the low and the high; the last column is loud
export const spark = (parent: HTMLElement, vals: number[], rows = 12): HTMLElement => {
    const box = h(parent, "div", "zl-spark");
    const n = Math.max(1, vals.length), lo = Math.min(...vals), hi = Math.max(...vals), W = 396, gap = 3, cw = Math.max(3, Math.floor((W - gap * (n - 1)) / n)), bh = 6, p = bh + 2;
    const all: Cell[] = [], lit: Cell[] = [];
    vals.forEach((v, i) => {
        const k = hi > lo ? 1 + Math.round(((v - lo) / (hi - lo)) * (rows - 1)) : Math.ceil(rows / 2);
        for (let r = 0; r < rows; r++) { const c: Cell = [i * (cw + gap), (rows - 1 - r) * p, cw, bh, i === n - 1 ? "var(--zl-loud)" : "var(--zl-text)", 80 + i * 12 + r * 6]; all.push(c); if (r < k) lit.push(c); }
    });
    blocks(svgEl(box, n * (cw + gap) - gap, rows * p - 2), [...grid(all), ...lit]);
    return box;
};

// balance beam: one line per person; blocks fill out from the centre, to the left (loud) when you owe them, to the right (ink)
// when they owe you; length = the amount against the largest. Lights from the centre outwards, line by line.
export const beam = (parent: HTMLElement, list: { k: string; v: number; onTap: () => void }[], half = 14): HTMLElement => {
    const box = h(parent, "div", "zl-beam");
    const most = Math.max(1, ...list.map((x) => Math.abs(x.v)));
    list.forEach((x, li) => {
        const b = h(box, "button", "zl-beam-r");
        h(b, "span", "zl-beam-k", x.k.toUpperCase());
        const cw = 9, gap = 2, p = cw + gap, W = half * 2 * p + 4, all: Cell[] = [], lit: Cell[] = [];
        const n = Math.max(1, Math.round((Math.abs(x.v) / most) * half));
        for (let i = 0; i < half; i++) {
            const left: Cell = [(half - 1 - i) * p, 0, cw, 10, "var(--zl-loud)", 80 + li * 60 + i * 22];
            const right: Cell = [half * p + 4 + i * p, 0, cw, 10, "var(--zl-text)", 80 + li * 60 + i * 22];
            all.push(left, right);
            if (x.v < 0 && i < n) lit.push(left);
            if (x.v > 0 && i < n) lit.push(right);
        }
        const s = svgEl(b, W, 10);
        blocks(s, [...grid(all), [half * p, -3, 2, 16, "var(--zl-muted)", DARK], ...lit]);
        b.addEventListener("click", (e) => { e.preventDefault(); x.onTap(); });
    });
    const l = h(box, "div", "zl-stairs-l");
    h(l, "span", "", t("cYouOweShort"));
    h(l, "span", "", t("cOwedShort"));
    return box;
};
