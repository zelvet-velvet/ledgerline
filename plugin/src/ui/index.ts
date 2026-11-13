import { setIcon } from "obsidian";
import { pixelFor, rowSprite, sprite } from "./pixel";

// Small DOM helpers. Text always goes in through textContent (never innerHTML).
export const h = <K extends keyof HTMLElementTagNameMap>(parent: HTMLElement | null, tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    parent?.appendChild(e);
    return e;
};

// Display titles (Anton has no Chinese): runs of CJK characters go in their own span (zl-cjk), set in a heavy CJK face at
// Anton's height, so "0050 自營商" reads as one title (owner, 2026-11-04)
const CJK = /[\u2e80-\u9fff\uf900-\ufaff\uff00-\uffef]+/g;
export const titleText = (el: HTMLElement, text: string): void => {
    el.empty();
    let at = 0;
    for (const m of text.matchAll(CJK)) {
        if (m.index! > at) el.appendText(text.slice(at, m.index));
        h(el, "span", "zl-cjk", m[0]);
        at = m.index! + m[0].length;
    }
    if (at < text.length) el.appendText(text.slice(at));
};

// An icon by name. "a,b" tries the names in order (Lucide renamed icons between versions, e.g. helping-hand → hand-helping);
// "…|y" flips it upside down, "|x" left-right, "|xy" both. None found: a plain hand / circle.
export const icon = (parent: HTMLElement, name: string, cls = "zl-ic"): HTMLElement => {
    const [names, flip = ""] = name.split("|");
    const list = names.split(",");
    const s = h(parent, "span", cls);
    for (const n of list) { setIcon(s, n); if (s.querySelector("svg")) break; }
    if (!s.querySelector("svg")) setIcon(s, list[0].includes("hand") ? "hand" : "circle");
    const svg = s.querySelector("svg");
    if (svg && flip) svg.style.transform = `scale(${flip.includes("x") ? -1 : 1}, ${flip.includes("y") ? -1 : 1})`;
    return s;
};

// A large title page (the title collapses into the top bar while scrolling).
// The page's actions (the +) sit at the right of this title row on first pages (view.ts fills .zl-title-acts).
export const page = (title: string): HTMLElement => {
    const p = h(null, "div", "zl-page");
    const r = h(p, "div", "zl-title-row");
    titleText(h(r, "h1", "zl-title"), title);
    h(r, "div", "zl-title-acts");
    return p;
};

// Inset grouped list
export const group = (parent: HTMLElement, title?: string, footer?: string): HTMLElement => {
    if (title) h(parent, "div", "zl-gh", title);
    const g = h(parent, "div", "zl-group");
    if (footer) h(parent, "div", "zl-gf", footer);
    return g;
};

export interface RowSpec { check?: { on: boolean; color?: string; onToggle: (on: boolean) => void }; progress?: [number, string]; icon?: string; badge?: boolean; avatar?: string; tint?: string; title: string; titleColor?: string; sub?: string; value?: string; valueColor?: string; chevron?: boolean; muted?: boolean; onTap?: () => void }
export const row = (parent: HTMLElement, r: RowSpec): HTMLElement => {
    const el = h(parent, "div", "zl-row zl-in" + (r.onTap ? " is-tap" : "") + (r.muted ? " is-muted" : ""));
    el.style.setProperty("--i", String(parent.childElementCount - 1));
    if (r.check) {   // a tick circle at the start; tapping it toggles without opening the row
        const c = r.check;
        const b = h(el, "button", "zl-check" + (c.on ? " is-on" : ""));
        if (c.on && c.color) b.style.background = c.color;
        if (c.on) icon(b, "check");
        b.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); c.onToggle(!c.on); });
    }
    // redesign C: every row carries a pixel icon (the Lucide name maps to its pixel twin; a person is a person)
    if (!r.check) sprite(el, r.avatar !== undefined ? "person" : r.icon ? pixelFor(r.icon, r.title) : rowSprite(r.title), "zl-px zl-fig-ic");
    const main = h(el, "div", "zl-row-main");
    const tt = h(main, "div", "zl-row-t", r.title);
    if (r.titleColor) tt.style.color = r.titleColor;
    if (r.sub) h(main, "div", "zl-row-s", r.sub);
    if (r.progress) {   // a thin bar under the text: [percent, colour]
        const bar = h(main, "div", "zl-prog zl-row-prog");
        const f = h(bar, "div", "zl-prog-f");
        f.style.width = `${Math.max(0, Math.min(100, r.progress[0]))}%`;
        f.style.background = r.progress[1];
    }
    if (r.value) { const v = h(el, "div", "zl-row-v", r.value); if (r.valueColor) v.style.color = r.valueColor; }
    if (r.chevron) sprite(el, "back", "zl-px zl-fig-go");   // the same pixel arrow as the C figure rows
    if (r.onTap) { const fn = r.onTap; el.addEventListener("click", (e) => { e.preventDefault(); fn(); }); }
    return el;
};

// Grey placeholder blocks while a page is built the first time (never a blank screen)
export const skeleton = (title: string): HTMLElement => {
    const p = page(title);
    for (let i = 0; i < 3; i++) h(p, "div", "zl-skel");
    return p;
};

// Colours (tokens with Obsidian fallbacks, defined in styles.css)
export const C = { pos: "var(--zl-pos)", neg: "var(--zl-neg)", info: "var(--zl-info)", warn: "var(--zl-warn)", accent: "var(--zl-accent)", faint: "var(--zl-faint)" };

// Summary card: a big number, an optional progress bar, and up to three small figures under it
export interface HeroSpec { label: string; value: string; unit?: string; color?: string; sub?: string; progress?: number; progressColor?: string; split?: [number, string][]; items?: [string, string, string?][]; button?: { text: string; onTap: () => void } }
export const hero = (parent: HTMLElement, o: HeroSpec): HTMLElement => {
    const card = h(parent, "div", "zl-hero");
    h(card, "div", "zl-hero-l", o.label);
    const v = h(card, "div", "zl-hero-v");
    const n = h(v, "span", "", o.value);
    if (o.color) n.style.color = o.color;
    if (o.unit) h(v, "span", "zl-hero-u", o.unit);
    if (o.sub) h(card, "div", "zl-hero-s", o.sub);
    const total = (o.split ?? []).reduce((t, [n]) => t + Math.max(0, n), 0);
    if (total > 0) {   // a bar split into coloured parts (e.g. owed to you / owed by you)
        const bar = h(card, "div", "zl-prog zl-split");
        for (const [n, col] of o.split!) { const p = h(bar, "div", "zl-prog-f"); p.style.width = `${(Math.max(0, n) / total) * 100}%`; p.style.background = col; }
    }
    if (o.progress !== undefined) {
        const bar = h(card, "div", "zl-prog");
        const fill = h(bar, "div", "zl-prog-f");
        fill.style.width = `${Math.max(0, Math.min(100, o.progress))}%`;
        if (o.progressColor) fill.style.background = o.progressColor;
    }
    if (o.items?.length) {
        const grid = h(card, "div", "zl-hero-items");
        for (const [l, val, col] of o.items) {
            const it = h(grid, "div", "zl-hero-it");
            h(it, "div", "zl-hero-il", l);
            const x = h(it, "div", "zl-hero-iv", val);
            if (col) x.style.color = col;
        }
    }
    if (o.button) { const b = o.button; const btn = h(card, "button", "zl-pill zl-hero-btn", b.text); btn.addEventListener("click", (e) => { e.preventDefault(); b.onTap(); }); }
    return card;
};

export const empty = (parent: HTMLElement, o: { icon: string; title: string; text?: string; button?: string; onTap?: () => void }): HTMLElement => {
    const box = h(parent, "div", "zl-empty");
    icon(box, o.icon, "zl-empty-ic");
    h(box, "div", "zl-empty-t", o.title);
    if (o.text) h(box, "div", "zl-empty-s", o.text);
    if (o.button && o.onTap) { const b = h(box, "button", "zl-pill", o.button); const fn = o.onTap; b.addEventListener("click", () => fn()); }
    return box;
};

// Colour for a name (friends, funds): the same name always gets the same series colour
const SERIES = ["var(--zl-s1)", "var(--zl-s2)", "var(--zl-s3)", "var(--zl-s4)", "var(--zl-s5)", "var(--zl-s6)", "var(--zl-s7)"];
export const colorFor = (i: number): string => SERIES[((i % SERIES.length) + SERIES.length) % SERIES.length];

// Three-part month switcher: ‹ previous · current (tap: pick) · next ›
export const monthBar = (parent: HTMLElement, prev: string, cur: string, next: string, on: (step: -1 | 0 | 1) => void): HTMLElement => {
    const bar = h(parent, "div", "zl-monthbar");
    let swiped = false;
    const b = (txt: string, cls: string, step: -1 | 0 | 1) => { const x = h(bar, "button", cls, txt); x.addEventListener("click", (e) => { e.preventDefault(); if (!swiped) on(step); }); };
    b(`‹ ${prev}`, "zl-mb-side", -1);
    b(cur, "zl-mb-cur", 0);
    b(`${next} ›`, "zl-mb-side", 1);
    // swipe the bar sideways: the dates follow the finger; let go past 48 px (or a quick flick) → the next / previous one
    let x0 = 0, y0 = 0, t0 = 0, dx = 0, lock: "x" | "y" | null = null;
    const slide = (px: number, ease: boolean) => { for (const c of Array.from(bar.children) as HTMLElement[]) { c.style.transition = ease ? "transform .18s cubic-bezier(.2,.8,.2,1)" : "none"; c.style.transform = px ? `translateX(${px}px)` : ""; } };
    bar.addEventListener("touchstart", (e) => { const t = e.touches[0]; x0 = t.clientX; y0 = t.clientY; t0 = performance.now(); dx = 0; lock = null; swiped = false; }, { passive: true });
    bar.addEventListener("touchmove", (e) => {
        const t = e.touches[0], mx = t.clientX - x0, my = t.clientY - y0;
        if (!lock && Math.hypot(mx, my) > 6) lock = Math.abs(mx) > Math.abs(my) * 0.7 ? "x" : "y";
        if (lock !== "x") return;
        e.stopPropagation();
        swiped = true; dx = mx;
        slide(Math.max(-90, Math.min(90, dx * 0.6)), false);
    }, { passive: true });
    const end = () => {
        if (lock !== "x") return;
        const fast = Math.abs(dx) / Math.max(1, performance.now() - t0) > 0.5 && Math.abs(dx) > 24;
        slide(0, true);
        if (Math.abs(dx) > 48 || fast) on(dx < 0 ? 1 : -1);
        window.setTimeout(() => { swiped = false; }, 50);
    };
    bar.addEventListener("touchend", end);
    bar.addEventListener("touchcancel", end);
    return bar;
};
