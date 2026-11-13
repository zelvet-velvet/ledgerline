import { Hit, mergeHits } from "../calc/search";
import type { TickerSearch } from "../prices/search";
import { h } from "./index";
import { sprite } from "./pixel";
import { kbCache, kbSave } from "./sheet";

// The magnifier opens search at the bottom (owner picked A, 2026-11-05: CANCEL at the top was out of reach): its own page
// over the whole screen, the field and CANCEL in a bar riding just above the keyboard. The room above the bar is one list
// scrolling on its own: the recent searches, or the matches while typing (yours first, then TWSE listings, then Yahoo); the
// watchlist is no longer here (owner, 2026-11-13: the marquee on Invest home shows it). Enter opens what was typed; CANCEL
// closes. Touches stay in the page: no Obsidian pull-down (command palette) or edge swipes here, and no swipe-to-close.
export interface SearchOpts {
    mine(q: string): Hit[]; pick(tk: string): void;
    texts: { placeholder: string; cancel: string; recent: string; clear: string; none: string; held: string; watch: string } }

export const openSearch = (from: HTMLElement, src: TickerSearch, o: SearchOpts): void => {
    const app = from.closest(".zl-app");
    if (!app || app.hasClass("zl-searching")) return;
    src.warm();
    app.addClass("zl-searching");
    // its own page over the whole screen (owner, 2026-11-05: no INVEST masthead above it); fixed to the screen, so Obsidian
    // shrinking its app area for the keyboard moves nothing: the list stays where it is, only the bar rides the keyboard
    const layer = h(app as HTMLElement, "div", "zl-search");
    // its height is the screen's, fixed (owner, 2026-11-06: the recent block jumped up once more and back): Obsidian shrinks
    // its app area for the keyboard a moment after the bar rises, and a layer that shrank with it was lifted twice for a frame.
    // At the screen's height it never resizes; the part under the keyboard is just covered by it.
    const fixH = () => { if (!open) { layer.style.bottom = "auto"; layer.style.height = `${window.innerHeight}px`; } };
    const halves = h(layer, "div", "zl-shalves");
    const bot = h(halves, "div", "zl-shalf"), botHead = h(bot, "div", "zl-slist-h zl-shalf-h"), list = h(bot, "div", "zl-shalf-b zl-slist");
    const bar = h(layer, "div", "zl-sbar");
    sprite(bar, "search", "zl-px zl-sbar-ic");
    const input = h(bar, "input", "zl-sbar-in");
    Object.assign(input, { type: "search", placeholder: o.texts.placeholder, autocomplete: "off", spellcheck: false });
    input.setAttribute("autocapitalize", "characters");
    input.setAttribute("autocorrect", "off");
    input.setAttribute("enterkeyhint", "go");
    const cancel = h(bar, "button", "zl-sbar-x", o.texts.cancel);
    // The bar moves with the keyboard, not after it: it starts the moment the keyboard does (the field gains or loses focus),
    // at the keyboard's own pace (.25 s, iOS's curve), to the height the keyboard had last time; a measurement afterwards only
    // corrects it. The list keeps room under its last row for the bar and the keyboard (padding: nothing on it moves).
    const vv = window.visualViewport, appArea = document.querySelector<HTMLElement>(".app-container");
    const kbNow = () => Math.round(Math.max(appArea ? window.innerHeight - appArea.getBoundingClientRect().bottom : 0, vv ? window.innerHeight - (vv.height + vv.offsetTop) : 0, 0));
    const c0 = kbCache();
    let kbUp = c0.search || c0.text || Math.round(window.innerHeight * 0.4), open = false;
    fixH();
    window.addEventListener("resize", fixH);   // a turn of the phone (the keyboard is down then)
    // y: the keyboard's height from the screen's foot. On the phone Obsidian shrinks its app area for the keyboard, and the
    // layer shrinks with it (owner, 2026-11-06: the bar sat a whole keyboard too high), so the bar is lifted only by what
    // the layer's own foot is not already lifted; when the layer resizes, the bar is put right in the same frame (no slide)
    let cur = 0;
    const put = (y: number, instant = false) => {
        cur = y;
        const lifted = Math.max(0, Math.round(window.innerHeight - layer.getBoundingClientRect().bottom)), t = Math.max(0, y - lifted);
        if (instant) bar.style.transition = "none";
        bar.style.transform = `translateY(${-t}px)`;
        // the halves end over the bar, wherever it is
        halves.style.bottom = `${t + bar.offsetHeight + (parseFloat(getComputedStyle(bar).bottom) || 0) + 12}px`;
        layer.toggleClass("has-kb", y > 0);
        if (instant) { void bar.offsetWidth; bar.style.transition = ""; }
    };
    const log = (w: string) => (window as unknown as { zlDebug?: (m: string) => void }).zlDebug?.(`search ${w}: inner ${window.innerHeight}, vv ${vv ? `${Math.round(vv.height)}+${Math.round(vv.offsetTop)}` : "-"}, app foot ${appArea ? Math.round(appArea.getBoundingClientRect().bottom) : "-"}, layer foot ${Math.round(layer.getBoundingClientRect().bottom)}, kb ${kbUp}, bar foot ${Math.round(bar.getBoundingClientRect().bottom)}`);
    // the measured height is kept for this keyboard (owner, 2026-11-06: the bar rose a little too high and came down: it
    // started from the text keyboard's height the sheets had saved, a little taller than the search keyboard)
    const measure = () => { const m = kbNow(); if (open && m > 40 && Math.abs(m - kbUp) > 2) { kbUp = m; kbSave("search", m); put(m); } };
    const lro = new ResizeObserver(() => put(cur, true));
    lro.observe(layer);
    const hold = () => { if (window.scrollY || document.documentElement.scrollTop) window.scrollTo(0, 0); };   // iOS scrolls to the field
    window.addEventListener("scroll", hold, { passive: true });
    vv?.addEventListener("scroll", hold);
    vv?.addEventListener("resize", measure);
    const ro = appArea ? new ResizeObserver(measure) : null;
    if (appArea) ro?.observe(appArea);
    input.addEventListener("focus", () => { open = true; put(kbUp); window.setTimeout(() => log("kb up"), 900); });
    input.addEventListener("blur", () => { open = false; put(0); });
    put(0); void bar.offsetWidth;   // from the foot, so the first rise is a slide
    layer.addClass("is-on");
    input.focus({ preventScroll: true });   // inside the tap: iOS opens the keyboard (focus above starts the bar)
    let seq = 0, timer = 0, closed = false;
    const close = () => {
        if (closed) return;
        closed = true;
        window.clearTimeout(timer); seq++;
        window.removeEventListener("scroll", hold); window.removeEventListener("resize", fixH); vv?.removeEventListener("scroll", hold); vv?.removeEventListener("resize", measure); ro?.disconnect(); lro.disconnect();
        input.blur();   // the bar goes down with the keyboard while the page fades
        layer.addClass("is-out");
        app.removeClass("zl-searching");
        window.setTimeout(() => layer.remove(), 260);
    };
    // a finger moving up on a half puts the keyboard away (the bar drops with it, the halves grow); no touch leaves the page,
    // so Obsidian's pull-down and edge swipes stay off here
    let y0 = 0;
    layer.addEventListener("touchstart", (e) => { y0 = e.touches[0].clientY; e.stopPropagation(); }, { passive: true });
    layer.addEventListener("touchmove", (e) => {
        e.stopPropagation();
        if (e.touches[0].clientY - y0 < -12 && document.activeElement === input && !bar.contains(e.target as Node)) input.blur();
    }, { passive: true });
    layer.addEventListener("touchend", (e) => e.stopPropagation(), { passive: true });
    // a tap, not a scroll (owner, 2026-11-11: a finger meant to scroll RECENT opened the ticker): pointerdown only arms it
    // (and keeps the keyboard up, so the list does not move under the finger); it fires on pointerup when the finger stayed
    // within 8 px and the list did not scroll; the browser's pointercancel (it took the touch to scroll) disarms it
    const tap = (el: HTMLElement, box: HTMLElement, fn: () => void) => {
        let x0 = 0, y0t = 0, s0 = 0, armed = false;
        el.addEventListener("pointerdown", (e) => { e.preventDefault(); armed = true; x0 = e.clientX; y0t = e.clientY; s0 = box.scrollTop; });
        el.addEventListener("pointermove", (e) => { if (armed && Math.hypot(e.clientX - x0, e.clientY - y0t) > 8) armed = false; });
        el.addEventListener("pointercancel", () => { armed = false; });
        el.addEventListener("pointerleave", () => { armed = false; });
        el.addEventListener("pointerup", (e) => { if (!armed) return; armed = false; if (Math.abs(box.scrollTop - s0) > 2) return; e.preventDefault(); fn(); });
    };
    const go = (tk: string, name = "") => { const k = tk.trim().toUpperCase(); if (!k) return; src.remember(k, name); input.blur(); close(); o.pick(k); };
    const headOf = (hd: HTMLElement, head: string, act?: () => void, label = o.texts.clear) => {
        hd.empty();
        hd.toggleClass("is-hidden", !head);
        h(hd, "span", "", head);
        if (act) { const c = h(hd, "button", "zl-slist-c", label); c.addEventListener("pointerdown", (e) => { e.preventDefault(); act(); }); }
    };
    const rows = (hits: Hit[], head = "", clear?: () => void) => {
        list.empty();
        list.scrollTop = 0;
        headOf(botHead, head, clear);
        if (!hits.length) { h(list, "div", "zl-slist-none", o.texts.none); return; }
        for (const x of hits) {
            const r = h(list, "button", "zl-slist-r");
            h(r, "span", "zl-slist-tk", x.tk);
            h(r, "span", "zl-slist-n", x.name);
            h(r, "span", "zl-slist-ex", x.mine === "held" ? o.texts.held : x.mine === "watch" ? o.texts.watch : x.ex);
            tap(r, list, () => go(x.tk, x.name));
        }
    };
    // nothing typed: the recent searches
    const recent = () => {
        const r = src.recent();
        rows(r.map((tk) => ({ tk, name: src.nameOf(tk), ex: "" })), o.texts.recent, r.length ? () => { src.forget(); recent(); } : undefined);
        if (!r.length) list.empty();
    };
    const update = () => {
        const q = input.value.trim();
        window.clearTimeout(timer);
        const n = ++seq;
        if (!q) { recent(); return; }
        const here = mergeHits(o.mine(q), src.listed(q));
        rows(here);
        timer = window.setTimeout(() => { void src.remote(q).then((far) => { if (n === seq) rows(mergeHits(here, far).slice(0, 12)); }); }, 250);
    };
    input.addEventListener("input", update);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); go(input.value); } else if (e.key === "Escape") close(); });
    cancel.addEventListener("click", (e) => { e.preventDefault(); input.blur(); close(); });
    // the page underneath changed (a tab, Back): the bar goes with it. The same page redrawn (a live price tick every 5 s,
    // owner, 2026-11-05: the search closed by itself) keeps the bar
    const page = from.dataset.page;
    const watch = new MutationObserver(() => {
        if (closed) { watch.disconnect(); return; }
        if (from.isConnected) return;
        const now = app.querySelector<HTMLElement>("[data-page]");
        if (page && now && now.dataset.page === page) { from = now; return; }
        watch.disconnect(); close();
    });
    watch.observe(app, { childList: true, subtree: true });
    recent();
};
