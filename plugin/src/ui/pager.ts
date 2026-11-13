import { h } from "./index";

// How a card swipe is read, the same everywhere (Design Rules, Cards and swipes; from Morellonomicon): the direction is decided after
// `slop` px (sideways unless clearly more vertical, `bias`); a drag past `at` of the width, or a flick (`flick` px/ms over `flickMin` px), turns the card.
export const SWIPE = { slop: 6, bias: 0.7, at: 0.25, flick: 0.5, flickMin: 24 };

export interface PagerSpec {
    count: number;
    start?: number;
    card(el: HTMLElement, i: number): void;   // fills one card
    onTap?(i: number): void;                   // tapping a card opens its detail page
    onLand?(i: number): void;                  // a swipe landed on card i
    dots?: boolean;                            // default true; at most 7 dots, more shows "3 / 12"
}

// Card pager: cards follow the finger sideways and land on one. Vertical drags scroll the page as usual.
export const pager = (parent: HTMLElement, o: PagerSpec): HTMLElement => {
    const box = h(parent, "div", "zl-pager");
    const track = h(box, "div", "zl-pager-track");
    const cards: HTMLElement[] = [];
    for (let i = 0; i < o.count; i++) {
        const c = h(track, "div", "zl-card" + (o.onTap ? " is-tap" : ""));
        o.card(c, i);
        cards.push(c);
    }
    let cur = Math.max(0, Math.min(o.count - 1, o.start ?? 0));
    const dotsEl = o.dots !== false && o.count > 1 ? h(box, "div", "zl-dots") : null;
    const paintDots = () => {
        if (!dotsEl) return;
        dotsEl.empty();
        if (o.count > 7) { dotsEl.textContent = `${cur + 1} / ${o.count}`; return; }
        for (let i = 0; i < o.count; i++) h(dotsEl, "span", "zl-dot" + (i === cur ? " is-on" : ""));
    };
    const place = (dx: number, anim: boolean) => {
        track.style.transition = anim ? "transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1)" : "none";
        track.style.transform = `translateX(calc(${-cur} * (100% + 12px) + ${dx}px))`;   // 12 px gap between cards
    };
    place(0, false);
    paintDots();

    let x0 = 0, y0 = 0, t0 = 0, dx = 0, mode: "" | "x" | "y" = "", id = -1;
    box.addEventListener("pointerdown", (e) => { id = e.pointerId; x0 = e.clientX; y0 = e.clientY; t0 = e.timeStamp; dx = 0; mode = ""; });
    box.addEventListener("pointermove", (e) => {
        if (e.pointerId !== id) return;
        const mx = e.clientX - x0, my = e.clientY - y0;
        if (!mode) {
            if (Math.hypot(mx, my) < SWIPE.slop) return;
            mode = Math.abs(my) > Math.abs(mx) / SWIPE.bias ? "y" : "x";
            if (mode === "x") { box.setPointerCapture(id); box.addClass("is-drag"); }
        }
        if (mode !== "x") return;
        // the first and last card resist being pulled past the edge
        dx = (cur === 0 && mx > 0) || (cur === o.count - 1 && mx < 0) ? mx / 3 : mx;
        place(dx, false);
    });
    const end = (e: PointerEvent) => {
        if (e.pointerId !== id) return;
        id = -1;
        box.removeClass("is-drag");
        if (mode !== "x") return;
        const v = Math.abs(dx) / Math.max(1, e.timeStamp - t0);
        const turn = Math.abs(dx) > box.clientWidth * SWIPE.at || (v > SWIPE.flick && Math.abs(dx) > SWIPE.flickMin);
        const next = turn ? Math.max(0, Math.min(o.count - 1, cur + (dx < 0 ? 1 : -1))) : cur;
        const moved = next !== cur;
        cur = next;
        place(0, true);
        paintDots();
        if (moved && o.onLand) { const n = cur; window.setTimeout(() => o.onLand!(n), 280); }
    };
    box.addEventListener("pointerup", end);
    box.addEventListener("pointercancel", end);
    // sideways drags on cards are ours: Obsidian would open a sidebar
    box.addEventListener("touchmove", (e) => { if (mode === "x") e.stopPropagation(); }, { passive: true });
    // a drag is not a tap
    box.addEventListener("click", (e) => {
        if (mode === "x") { e.preventDefault(); e.stopPropagation(); mode = ""; return; }
        if (o.onTap && (e.target as HTMLElement).closest(".zl-card")) { e.preventDefault(); o.onTap(cur); }
    }, true);
    return box;
};

// What goes on a card: a label, one big figure, an optional split bar and up to three small figures
export interface CardBody { label: string; value: string; unit?: string; color?: string; split?: [number, string][]; items?: [string, string, string?][] }
export const cardBody = (el: HTMLElement, o: CardBody): void => {
    h(el, "div", "zl-card-l", o.label);
    const v = h(el, "div", "zl-card-v");
    const n = h(v, "span", "", o.value);
    if (o.color) n.style.color = o.color;
    if (o.unit) h(v, "span", "zl-card-u", o.unit);
    const total = (o.split ?? []).reduce((t, [n]) => t + Math.max(0, n), 0);
    if (total > 0) {
        const bar = h(el, "div", "zl-prog zl-split");
        for (const [n, col] of o.split!) { const p = h(bar, "div", "zl-prog-f"); p.style.width = `${(Math.max(0, n) / total) * 100}%`; p.style.background = col; }
    }
    if (o.items?.length) {
        const grid = h(el, "div", "zl-card-items");
        for (const [l, val, col] of o.items) {
            const it = h(grid, "div", "zl-card-it");
            h(it, "div", "zl-card-il", l);
            const x = h(it, "div", "zl-card-iv", val);
            if (col) x.style.color = col;
        }
    }
};

// Tiles: two per row, a label, a figure (in its meaning's colour) and an optional small line
export interface TileSpec { label: string; value: string; color?: string; sub?: string; onTap?: () => void }
export const tiles = (parent: HTMLElement, list: TileSpec[]): HTMLElement => {
    const g = h(parent, "div", "zl-tiles");
    for (const s of list) {
        const el = h(g, "div", "zl-tile" + (s.onTap ? " is-tap" : ""));
        h(el, "div", "zl-tile-l", s.label);
        const v = h(el, "div", "zl-tile-v", s.value);
        if (s.color) v.style.color = s.color;
        if (s.sub) h(el, "div", "zl-tile-s", s.sub);
        if (s.onTap) { const fn = s.onTap; el.addEventListener("click", (e) => { e.preventDefault(); fn(); }); }
    }
    return g;
};
