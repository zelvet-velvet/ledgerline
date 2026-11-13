import { h } from "./index";

// Hold and drag (Design Rules, "Numbers"): hold a tile or row ~0.3 s, then drag up to raise its amount, down to lower it;
// let go to save. A plain tap still does what it did (the pad page, to type an exact number). The finger hides the tile,
// so the amount shows in a bubble above it. Steps grow the further the finger goes, so small and large amounts both work.
export interface ScrubOpts {
    value: number;               // stored now
    step: number;                // one notch (e.g. 10 for TWD)
    label: string;               // what (shown in the bubble)
    fmt(n: number): string;
    min?: number;                // default 0
    live?(n: number): void;      // while dragging (e.g. the tile's own number)
    done(n: number): void;       // let go with a changed amount
}

const HOLD = 280, SLOP = 8, PX = 9;
export const notches = (dy: number): number => { const u = Math.abs(dy) / PX; return Math.sign(dy) * Math.floor(u < 10 ? u : 10 + Math.pow(u - 10, 1.35)); };

export const scrub = (el: HTMLElement, get: () => ScrubOpts): void => {
    el.addClass("zl-scrubbable");
    let timer = 0, active = false, x0 = 0, y0 = 0, id = -1, o: ScrubOpts | null = null, n = 0;
    let bub: HTMLElement | null = null, bv: HTMLElement | null = null, bd: HTMLElement | null = null;
    // iOS decides at touchstart whether a page scroll can be stopped: the listener must be there from the start (not passive)
    el.addEventListener("touchmove", (e) => { if (active) e.preventDefault(); }, { passive: false });
    el.addEventListener("contextmenu", (e) => { if (active || timer) e.preventDefault(); });
    const stop = () => { window.clearTimeout(timer); timer = 0; };
    const paint = () => {
        if (!o || !bv || !bd) return;
        const d = n - o.value;
        bv.textContent = o.fmt(n);
        bd.textContent = d ? `${d > 0 ? "+" : "−"}${o.fmt(Math.abs(d))}` : "↕";
        bub!.toggleClass("is-up", d > 0); bub!.toggleClass("is-down", d < 0);
        o.live?.(n);
    };
    const begin = () => {
        timer = 0; o = get(); n = o.value; active = true;
        el.addClass("is-scrub");
        const r = el.getBoundingClientRect();
        bub = h((el.closest(".zl-app, .zl-sheet-host") as HTMLElement | null) ?? document.body, "div", "zl-bubble");   // inside the view: it carries the colour tokens
        h(bub, "div", "zl-bubble-k", o.label.toUpperCase());
        bv = h(bub, "div", "zl-bubble-v");
        bd = h(bub, "div", "zl-bubble-d");
        bub.style.left = `${Math.min(window.innerWidth - 90, Math.max(90, r.left + r.width / 2))}px`;
        bub.style.top = `${Math.max(8, r.top - 12)}px`;
        paint();
    };
    const end = (save: boolean) => {
        stop();
        if (!active) return;
        active = false;
        el.removeClass("is-scrub");
        bub?.remove(); bub = null;
        // the click that follows the hold must not also open the pad
        const eat = (e: Event) => { e.preventDefault(); e.stopPropagation(); };
        el.addEventListener("click", eat, { capture: true, once: true });
        window.setTimeout(() => el.removeEventListener("click", eat, { capture: true }), 400);
        if (o && n !== o.value) { if (save) o.done(n); else o.live?.(o.value); }
        o = null;
    };
    el.addEventListener("pointerdown", (e) => {
        if (e.button !== 0 || active) return;
        x0 = e.clientX; y0 = e.clientY; id = e.pointerId;
        stop();
        timer = window.setTimeout(() => { try { el.setPointerCapture(id); } catch { /* gone */ } begin(); }, HOLD);
    });
    el.addEventListener("pointermove", (e) => {
        if (e.pointerId !== id) return;
        if (!active) { if (timer && Math.hypot(e.clientX - x0, e.clientY - y0) > SLOP) stop(); return; }
        e.preventDefault();
        const m = o!.min ?? 0;
        const next = Math.max(m, o!.value + notches(y0 - e.clientY) * o!.step);
        if (next !== n) { n = next; paint(); bv!.removeClass("is-tick"); void bv!.offsetWidth; bv!.addClass("is-tick"); }
    });
    el.addEventListener("pointerup", (e) => { if (e.pointerId === id) end(true); });
    el.addEventListener("pointercancel", (e) => { if (e.pointerId === id) end(false); });
};

// one notch for a currency: whole tens where amounts are large (TWD, JPY, KRW), whole units elsewhere
export const notchFor = (cur: string): number => (/^(TWD|NTD|JPY|KRW|VND|IDR|HUF|INR|PHP|THB)$/i.test(cur) ? 10 : 1);
