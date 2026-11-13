import { App, Modal, Platform } from "obsidian";
import { t } from "../i18n";
import { parseNum } from "../format";
import { pixelFor, rowSprite, sprite } from "./pixel";
import { h, icon } from "./index";
import { notchFor, scrub, ScrubOpts } from "./scrub";
import { tick } from "./haptic";
// the iOS switch tick only works inside a tap: while a finger moves, only a native or vibration tick is tried
const iosOnly = (): boolean => /iPhone|iPad/.test(navigator.userAgent) && !(window as unknown as { Capacitor?: { Plugins?: { Haptics?: unknown } } }).Capacitor?.Plugins?.Haptics;
import { openPad } from "../pages/amount";

// Pop-up sheets built on Obsidian's Modal (it handles the keyboard, Escape / Back and focus). Bottom sheet on phones (styles.css).

// Sheet kit K (owner picked 2026-11-05; Design Rules › Sheets): no dropdowns and no system keyboard for numbers.
// select → words (up to 3) or chips; number → a dial row (hold and drag up / down, tap = the app's pad); date → TODAY /
// YESTERDAY / ‹ day › (drag the day, tap it for the calendar); fold → one line under the fields that opens them; auto → filled
// in from the other fields until you set it yourself.
export interface Field {
    key: string;
    label: string;
    type: "number" | "date" | "text" | "select" | "tiles" | "grid";
    cells?: (v: Record<string, string>) => { value: string; k: string; v: string; dim?: boolean }[];
    ask?: { value: string; into: string; title: string; placeholder?: string };   // select / grid: this choice asks for a name in the writing window
    tap?: (value: string, v: Record<string, string>, s: { close(): void; host: HTMLElement }) => void;   // grid: a tap acts (no picking)
    hold?: (value: string, v: Record<string, string>) => ScrubOpts | null;   // grid: hold and drag a tile   // grid: this cell asks for a name in the writing window (into = a text field kept off the sheet)   // grid: the day page's tiles (name, amount), redrawn as the others change
    options?: [string, string][];   // select: [value, label]
    tiles?: { value: string; title: string; sub?: string; icon?: string; color?: string }[];   // tiles: a 2-column grid of choices
    showIf?: (v: Record<string, string>) => boolean;   // shown (and checked) only when this is true
    value?: string | number;
    placeholder?: string;
    suffix?: string;
    required?: boolean;   // number fields: required = a number > 0
    step?: number | ((v: Record<string, string>) => number);   // number: one notch of the dial (default 1)
    dec?: number | ((v: Record<string, string>) => number);   // number: decimals it takes (default 0; a % field 4)
    auto?: (v: Record<string, string>) => string;   // filled in until set by hand
    tag?: (v: Record<string, string>) => string;    // a short word beside the value (LIVE)
    fold?: boolean;       // in the folded line
    off?: boolean;        // kept off the sheet (a value set from a window, e.g. a grid cell's name)
    brief?: (v: Record<string, string>) => string;   // folded line: a short why after the value ("0.1425 %", "T+2")
    note?: (v: Record<string, string>) => string;    // one plain line under the row: where the number comes from
}
export interface FormOpts {
    title: string;
    subtitle?: string;
    fields: Field[];
    submitText?: string | ((v: Record<string, string>) => string);   // none: no Save (the tiles act on a tap)
    total?: (v: Record<string, string>) => { text: string; bad?: boolean } | null;   // a live line above the button
    validate?: (v: Record<string, string>) => string | null;   // a message blocks Save
    onSubmit: (v: Record<string, string>) => Promise<void | false>;   // false keeps the sheet open
    danger?: { text: string; onTap: () => Promise<boolean> };   // e.g. Delete; true closes the sheet
}

// Phones: the sheet is a card in the vertical centre (styles.css). When a keyboard would cover it, it moves up just enough
// (--zl-lift), together with the keyboard, and back to the centre when the keyboard goes.
// Keyboard height: Obsidian on iOS does not resize the page; it shrinks its own app area (.app-container) once the keyboard is up.
// That is too late to move together, so on focus the card uses the height this kind of keyboard had last time (remembered per
// kind: number pad, letters, date picker); the measurement afterwards corrects it and is remembered for next time.
const KB_KEY = "ledgerline-kb";
export const kbSave = (kind: string, px: number): void => { const c = kbCache(); c[kind] = px; try { localStorage.setItem(KB_KEY, JSON.stringify(c)); } catch { /* ignore */ } };
export const kbCache = (): Record<string, number> => { try { return JSON.parse(localStorage.getItem(KB_KEY) || "{}") as Record<string, number>; } catch { return {}; } };
const isField = (el: unknown): el is HTMLInputElement | HTMLSelectElement => el instanceof HTMLInputElement || el instanceof HTMLSelectElement;
const kbKind = (el: Element | null): string => (el instanceof HTMLSelectElement ? "select" : el instanceof HTMLInputElement ? (el.type === "date" ? "date" : el.inputMode || el.type || "text") : "text");

const centerCard = (m: Modal): void => {
    if (!document.body.hasClass("is-phone")) return;
    const el = m.modalEl, vv = window.visualViewport;
    // the keyboard lift only animates once the card is open: Obsidian's phone pop-up changes the card's transform while it opens,
    // and the transition turned that into a glide up from the bottom
    window.setTimeout(() => el.addClass("is-ready"), 240);
    // and any slide Obsidian runs from code (not our CSS cut) is stopped, now and on the next frame
    const stopSlide = () => [el, el.parentElement].forEach((x) => x?.getAnimations().forEach((a) => { if (!("animationName" in a)) a.cancel(); }));
    stopSlide();
    window.requestAnimationFrame(stopSlide);
    const appArea = document.querySelector<HTMLElement>(".app-container");
    let kind = "text", moveTimer = 0;
    // iOS draws the text cursor itself and does not move it with an animation (it lagged behind the card): the cursor is hidden
    // while the card moves, then the selection is set again so iOS draws it at the field's new place.
    const settle = () => {
        el.removeClass("is-moving");
        const a = document.activeElement;
        if (a instanceof HTMLInputElement && el.contains(a) && a.type === "text") {
            const p0 = a.selectionStart, p1 = a.selectionEnd;
            if (p0 !== null && p1 !== null) a.setSelectionRange(p0, p1);
        }
    };
    const lift = (kb: number) => {
        const H = window.innerHeight, h = el.offsetHeight;
        // upright: a bottom sheet (kit K) that stays on the screen's bottom and grows its padding by the keyboard's height, so its
        // own colour fills the keyboard's rounded corners (iOS 26) and the buttons sit just above the keys; sideways: the centred
        // card, moved up just enough
        const side = window.innerWidth > H;
        if (!side) {
            const kbPx = `${Math.round(kb)}px`;
            el.style.removeProperty("--zl-lift");
            el.style.maxHeight = "";
            if (el.style.getPropertyValue("--zl-kb") === kbPx) return;
            el.addClass("is-moving");
            el.style.setProperty("--zl-kb", kbPx);
            window.clearTimeout(moveTimer);
            moveTimer = window.setTimeout(() => { settle(); (document.activeElement as HTMLElement | null)?.scrollIntoView?.({ block: "nearest", behavior: "smooth" }); }, 280);
            return;
        }
        const up = kb > 0 ? Math.max(0, (H + h) / 2 + 12 - (H - kb)) : 0;
        const next = `${Math.round(Math.min(up, (H - h) / 2 - 8))}px`;
        el.style.maxHeight = kb > 0 ? `${H - kb - 24}px` : "";
        if (el.style.getPropertyValue("--zl-lift") === next) return;
        el.addClass("is-moving");
        el.style.setProperty("--zl-lift", next);
        window.clearTimeout(moveTimer);
        moveTimer = window.setTimeout(settle, 280);   // the move takes 250 ms
    };
    const measure = (): number => Math.round(Math.max(
        appArea ? window.innerHeight - appArea.getBoundingClientRect().bottom : 0,
        vv ? window.innerHeight - (vv.height + vv.offsetTop) : 0, 0));
    const focused = () => el.contains(document.activeElement) && isField(document.activeElement);
    const fit = () => {
        const kb = measure();
        if (kb > 40 && focused()) { const c = kbCache(); c[kind] = kb; try { localStorage.setItem(KB_KEY, JSON.stringify(c)); } catch { /* ignore */ } }
        // only for its own fields: the writing window's keyboard leaves the sheet where it is (owner)
        if (focused()) { if (kb > 0) lift(kb); } else lift(0);   // keyboard still opening: keep the predicted place
    };
    // iOS scrolls the whole page to a focused field (the sheet jumped up, then slid): the page is held at the top while the
    // keyboard opens, so only the sheet's own padding moves (smoothly, with the keyboard)
    let holdUntil = 0;
    const hold = () => { if (Date.now() < holdUntil && (window.scrollY || document.documentElement.scrollTop)) window.scrollTo(0, 0); };
    window.addEventListener("scroll", hold, { passive: true });
    vv?.addEventListener("scroll", hold);
    const onFocusIn = (e: FocusEvent) => { if (!isField(e.target)) return; holdUntil = Date.now() + 700; kind = kbKind(e.target); lift(kbCache()[kind] || 0); };
    const onFocusOut = (e: FocusEvent) => {
        if (isField(e.relatedTarget) && el.contains(e.relatedTarget)) return;   // to another field: stay
        window.setTimeout(() => { if (!focused()) lift(0); }, 0);   // keyboard closing: back to the centre with it
    };
    el.addEventListener("focusin", onFocusIn);
    el.addEventListener("focusout", onFocusOut);
    const ro = appArea ? new ResizeObserver(fit) : null;
    if (appArea) ro?.observe(appArea);
    vv?.addEventListener("resize", fit);
    window.addEventListener("resize", fit);
    const close = m.onClose.bind(m);
    m.onClose = () => { window.removeEventListener("scroll", hold); vv?.removeEventListener("scroll", hold); ro?.disconnect(); vv?.removeEventListener("resize", fit); window.removeEventListener("resize", fit); close(); };
};

const closeLogged = new Set<string>();
const closeSeen = (x: HTMLElement): void => {
    const k = `${x.tagName}.${x.className}`;
    if (closeLogged.has(k)) return;
    closeLogged.add(k);
    (window as unknown as { zlDebug?: (m: string) => void }).zlDebug?.(`sheet close button removed: ${x.tagName.toLowerCase()}.${[...x.classList].join(".")} in ${x.parentElement?.className ?? "?"}`);
};

// The rest of a tap that closed a sheet on its dim is eaten (owner: the dim let taps through to the page under it): the sheet is
// gone before the finger lifts, so its release and the late click landed on whatever row sat below. Swallowed on the whole
// window until 350 ms after the finger is up.
export const eatTap = (): void => {
    const evs = ["pointerup", "pointermove", "touchend", "touchmove", "mousedown", "mouseup", "click", "contextmenu"];
    const stop = (e: Event) => { if (e.cancelable) e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); };
    let t = 0;
    const done = () => evs.forEach((ev) => window.removeEventListener(ev, stop, true));
    const up = () => { window.clearTimeout(t); t = window.setTimeout(done, 350); };
    window.addEventListener("pointerup", up, { capture: true, once: true });   // before the swallowing ones (they stop the rest)
    window.addEventListener("pointercancel", up, { capture: true, once: true });
    evs.forEach((ev) => window.addEventListener(ev, stop, { capture: true, passive: false }));
    t = window.setTimeout(done, 1500);   // a finger that never lifts (lost event): give the page back anyway
};

// Closing: the keyboard goes first, the card fades out, then it is hidden before Obsidian removes it (Obsidian's own closing
// animation would otherwise play on top and bring the card back for a moment).
const upright = () => document.body.hasClass("is-phone") && window.innerWidth <= window.innerHeight;
const slideClose = (m: Modal): void => {
    const close = m.close.bind(m);
    let leaving = false;
    m.close = () => {
        if (leaving) return;
        leaving = true;
        (document.activeElement as HTMLElement | null)?.blur?.();
        if (!document.body.hasClass("is-phone")) { close(); return; }
        const el = m.modalEl, bg = m.containerEl.querySelector<HTMLElement>(".modal-bg");
        if (upright()) {
            // kit K: the bottom sheet slides down off the screen from wherever it is (also mid-drag), the dim fades with it
            el.getAnimations().forEach((a) => a.cancel());
            el.addClass("is-drag");   // no other transition on it
            el.style.transition = "translate .22s cubic-bezier(.4, 0, 1, 1)";
            el.style.translate = `0 ${el.offsetHeight + 40}px`;
            if (bg) { bg.style.transition = "opacity .22s"; bg.style.opacity = "0"; }
        } else el.addClass("is-leaving");
        window.setTimeout(() => { el.style.visibility = "hidden"; m.containerEl.style.visibility = "hidden"; close(); }, 220);
    };
    // a press on the dim closes at once (the click came late on the phone and Obsidian's own close waited for it)
    const bindBg = () => m.containerEl.querySelector<HTMLElement>(".modal-bg")?.addEventListener("pointerdown", (e) => { e.preventDefault(); eatTap(); m.close(); });
    window.requestAnimationFrame(bindBg);
};

// Kit K: the bottom sheet follows a finger dragging down (from anywhere on it while it is scrolled to the top, not on a date
// block, a text field or a dial being held); let go past 120 px or with a fast flick down and it closes, else it springs back
const dragClose = (m: Modal): void => {
    const el = m.modalEl;
    let y0 = 0, x0 = 0, dy = 0, on = false, skip = false, track: { y: number; t: number }[] = [];
    el.addEventListener("touchstart", (e) => {
        const tch = e.touches[0];
        skip = e.touches.length !== 1 || !upright() || !!(e.target as HTMLElement).closest(".zl-dateblk, input, textarea, .zl-tgrid");
        on = false; dy = 0; y0 = tch.clientY; x0 = tch.clientX; track = [{ y: tch.clientY, t: e.timeStamp }];
    }, { passive: true });
    el.addEventListener("touchmove", (e) => {
        if (skip) return;
        const tch = e.touches[0], d = tch.clientY - y0;
        if (!on) {
            if (el.querySelector(".is-scrub")) { skip = true; return; }   // a dial is being held: its drag, not ours
            if (d > 6 && Math.abs(d) > Math.abs(tch.clientX - x0) && el.scrollTop <= 0) { on = true; el.addClass("is-drag"); el.style.transition = "none"; }
            else if (Math.abs(d) > 6) { skip = true; return; }
            else return;
        }
        e.preventDefault();
        dy = Math.max(0, d);
        el.style.translate = `0 ${dy}px`;
        track.push({ y: tch.clientY, t: e.timeStamp });
        if (track.length > 6) track.shift();
    }, { passive: false });
    const end = () => {
        if (!on) return;
        on = false;
        const a = track[0], b = track[track.length - 1];
        const v = b && a && b.t > a.t ? (b.y - a.y) / (b.t - a.t) : 0;   // px per ms over the last moves
        if (dy > 120 || v > 0.5) { m.close(); return; }
        el.style.transition = "translate .25s cubic-bezier(.38, .7, .125, 1)";
        el.style.translate = "";
        window.setTimeout(() => { el.removeClass("is-drag"); el.style.transition = ""; }, 260);
    };
    el.addEventListener("touchend", end);
    el.addEventListener("touchcancel", end);
};

export const base = (m: Modal, title: string, subtitle?: string): HTMLElement => {
    m.modalEl.addClass("zl-sheet");
    // Tap outside to close: no close button. Obsidian adds it in different places per version / platform (a CSS rule and a
    // removal inside the sheet both missed it on the phone), so anything close-like in the whole pop-up container goes, after
    // Obsidian has finished building it.
    // Selectors by name missed it twice, so this keeps only what the sheet needs: in the container the backdrop and the sheet,
    // in the sheet the title (and a header holding it) and the content, in such a header only the title. Everything else goes.
    const keep = (x: Element, ...need: Element[]) => need.some((n) => n === x || x.contains(n));
    const dropClose = () => {
        const drop = (x: Element) => { closeSeen(x as HTMLElement); x.remove(); };
        [...m.containerEl.children].forEach((x) => { if (!keep(x, m.modalEl) && !x.classList.contains("modal-bg")) drop(x); });
        [...m.modalEl.children].forEach((x) => {
            if (!keep(x, m.titleEl, m.contentEl)) { drop(x); return; }
            if (x !== m.titleEl && x !== m.contentEl && x.contains(m.titleEl)) [...x.children].forEach((y) => { if (!keep(y, m.titleEl)) drop(y); });
        });
    };
    dropClose();
    window.requestAnimationFrame(dropClose);
    window.setTimeout(dropClose, 50);
    centerCard(m);
    slideClose(m);
    dragClose(m);
    m.titleEl.setText(title);
    const c = m.contentEl;
    c.empty();
    if (subtitle) h(c, "div", "zl-sheet-sub", subtitle);
    return c;
};

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WD = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const ymdOf = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const dayAdd = (s: string, n: number): string => { const [y, m, d] = s.split("-").map(Number); return ymdOf(new Date(y, (m || 1) - 1, (d || 1) + n)); };
const dayDiff = (a: string, b: string): number => { const t = (s: string) => { const [y, m, d] = s.split("-").map(Number); return Date.UTC(y, (m || 1) - 1, d || 1); }; return Math.round((t(a) - t(b)) / 864e5); };
const dayText = (s: string): string => { if (!s) return "—"; const [y, m, d] = s.split("-").map(Number); return `${MON[(m || 1) - 1]} ${d}${y !== new Date().getFullYear() ? ` ${y}` : ""}`; };
export const numText = (s: string, dec = 0): string => {
    if (s === "") return "—";
    const n = parseNum(s);
    return isNaN(n) ? s : n.toLocaleString("en", { minimumFractionDigits: dec === 2 ? 2 : 0, maximumFractionDigits: dec });
};

interface Ctl { get(): string; set(v: string): void; text(): string }

export class FormSheet extends Modal {
    private busy = false;
    constructor(app: App, private o: FormOpts) { super(app); }

    onOpen(): void {
        const c = base(this, this.o.title, this.o.subtitle);
        this.containerEl.addClass("zl-sheet-host");   // the pad and the drag bubble open in here, with the colours
        const ctl: Record<string, Ctl> = {};
        const rows: Record<string, HTMLElement> = {};
        const touched = new Set<string>();
        const repaint: (() => void)[] = [];   // grids redrawn from the current values
        const notes: (() => void)[] = [];     // the lines under rows
        let group: HTMLElement | null = null, foldBody: HTMLElement | null = null, foldLine: HTMLElement | null = null;
        const values = (): Record<string, string> => Object.fromEntries(Object.entries(ctl).map(([k, x]) => [k, x.get().trim()]));
        const shown = (f: Field, v: Record<string, string>) => !f.showIf || f.showIf(v);
        const changed = (k: string) => { touched.add(k); refresh(); };
        const foldHost = (): HTMLElement => {
            if (foldBody) return foldBody;
            const box = h(c, "div", "zl-fold");
            foldLine = h(box, "button", "zl-fold-line");
            foldBody = h(box, "div", "zl-group zl-form zl-fold-body");
            foldLine.addEventListener("click", (e) => { e.preventDefault(); box.toggleClass("is-open", !box.hasClass("is-open")); });
            return foldBody;
        };
        const rowFor = (f: Field, cls: string): HTMLElement => {
            const parent = f.fold ? foldHost() : (group ??= h(c, "div", "zl-group zl-form"));
            const r = h(parent, "div", `zl-row zl-field ${cls}`);
            const l = h(r, "span", "zl-field-l", f.label);
            if (f.suffix) h(l, "span", "zl-field-x", ` · ${f.suffix}`);
            rows[f.key] = r;
            if (f.note) { const fn = f.note; const n = h(parent, "div", "zl-field-note"); notes.push(() => { const v = values(); n.textContent = fn(v); n.toggleClass("is-hidden", !shown(f, v)); }); }
            return r;
        };
        for (const f of this.o.fields) {
            const val = f.value === undefined || f.value === null ? "" : String(f.value);
            if (f.off) { let cur = val; ctl[f.key] = { get: () => cur, set: (v) => { cur = v; }, text: () => cur }; rows[f.key] = createDiv(); continue; }
            if (val !== "") touched.add(f.key);
            if (f.type === "tiles") {   // its own block: a header and a grid of tappable tiles; the fields after it start a new group
                group = null;
                const box = h(c, "div", "zl-tiles-box");
                rows[f.key] = box;
                h(box, "div", "zl-gh", f.label);
                const grid = h(box, "div", "zl-tiles");
                let cur = String(f.value ?? f.tiles?.[0]?.value ?? "");
                const paint = () => grid.querySelectorAll<HTMLElement>(".zl-tile").forEach((x) => x.toggleClass("is-on", x.dataset.v === cur));
                ctl[f.key] = { get: () => cur, set: (v) => { cur = v; paint(); }, text: () => cur };
                for (const tl of f.tiles ?? []) {
                    const b = h(grid, "button", "zl-tile");
                    b.dataset.v = tl.value;
                    if (tl.icon) sprite(b, pixelFor(tl.icon, tl.title), "zl-px zl-tile-ic");
                    h(b, "div", "zl-tile-t", tl.title);
                    if (tl.sub) h(b, "div", "zl-tile-s", tl.sub);
                    b.addEventListener("click", (e) => { e.preventDefault(); cur = tl.value; paint(); changed(f.key); });
                }
                paint();
                continue;
            }
            if (f.type === "select") {   // words (up to 3) or chips: every choice in sight, one tap
                const opts = f.options ?? [];
                const r = rowFor(f, "zl-pick");
                const box = h(r, "div", opts.length <= 3 ? "zl-words" : "zl-chips");
                let cur = val || (opts[0]?.[0] ?? "");
                const a = f.ask;   // a chip that asks for a name in the writing window (+ New fund): it then shows the name
                const paint = () => box.querySelectorAll<HTMLElement>("button").forEach((x) => {
                    x.toggleClass("is-on", x.dataset.v === cur);
                    if (a && x.dataset.v === a.value) { const nm = ctl[a.into]?.get(); x.textContent = nm || (opts.find((o) => o[0] === a.value)?.[1] ?? ""); }
                });
                for (const [v, lab] of opts) {
                    const b = h(box, "button", "zl-chip", lab);
                    b.dataset.v = v;
                    b.addEventListener("click", (e) => {
                        e.preventDefault();
                        if (a && v === a.value) {
                            openText(this.containerEl, { title: a.title, sub: this.o.title, value: ctl[a.into]?.get() ?? "", placeholder: a.placeholder, save: (nm) => {
                                if (!nm) return;
                                ctl[a.into]?.set(nm); touched.add(a.into); cur = v; paint(); changed(f.key);
                            } });
                            return;
                        }
                        cur = v; paint(); changed(f.key);
                    });
                }
                ctl[f.key] = { get: () => cur, set: (v) => { cur = v; paint(); }, text: () => opts.find((x) => x[0] === cur)?.[1] ?? cur };
                paint();
                continue;
            }
            if (f.type === "number") {   // a dial row: hold and drag up / down, tap for the pad
                const r = rowFor(f, "zl-dial");
                const right = h(r, "span", "zl-dial-r");
                const tag = h(right, "span", "zl-dial-tag");
                const out = h(right, "span", "zl-dial-v");
                // defaults: a % field takes 4 decimals and steps 0.1; an amount steps by its currency's notch (10 for TWD)
                const decOf = () => (typeof f.dec === "function" ? f.dec(values()) : f.dec ?? (f.suffix === "%" ? 4 : 0));
                const stepOf = () => (typeof f.step === "function" ? f.step(values()) : f.step ?? (f.suffix === "%" ? 0.1 : f.suffix ? notchFor(f.suffix) : 1));
                let cur = val;
                const paint = () => { const dec = decOf(); out.textContent = numText(cur, dec); out.toggleClass("is-empty", cur === ""); const tg = f.tag?.(values()) ?? ""; tag.textContent = tg; };
                ctl[f.key] = { get: () => cur, set: (v) => { cur = v; paint(); }, text: () => numText(cur, decOf()) };
                const put = (n: number) => { const sc = 10 ** decOf(); cur = String(Math.round(n * sc) / sc); paint(); changed(f.key); };
                scrub(r, () => {
                    const dec = decOf(), scale = 10 ** dec, st = stepOf();
                    return { value: Math.round((parseNum(cur) || 0) * scale), step: Math.max(1, Math.round(st * scale)), label: f.label, fmt: (n) => numText(String(n / scale), dec), live: (n) => { out.textContent = numText(String(n / scale), dec); }, done: (n) => put(n / scale) };
                });
                r.addEventListener("click", (e) => {
                    e.preventDefault();
                    openPad({} as never, { title: f.label, sub: this.o.title, current: parseNum(cur) || 0, cur: "", setOnly: true, dec: decOf(), chips: [], host: this.containerEl, save: async (n) => put(n) });
                });
                paint();
                continue;
            }
            if (f.type === "grid") {   // the day page's tiles (name and amount); a tap picks one, the picked one inverts
                const r = rowFor(f, "zl-pick");
                const grid = h(r, "div", "zl-tgrid");
                let cur = val;
                const paint = () => {
                    const cs = f.cells?.(values()) ?? [];
                    if (!cs.some((x) => x.value === cur)) cur = cs[0]?.value ?? "";
                    grid.empty();
                    for (const x of cs) {
                        const b = h(grid, "button", "zl-tg" + (x.dim ? " is-dim" : "") + (!f.tap && x.value === cur ? " is-on" : ""));
                        const top = h(b, "span", "zl-tg-top");
                        sprite(top, rowSprite(x.k), "zl-px zl-tg-ic");
                        h(top, "span", "zl-tg-k", x.k);
                        const vEl = h(b, "span", "zl-tg-v", x.v);
                        if (f.hold) { const hd = f.hold; scrub(b, () => { const o = hd(x.value, values()) ?? { value: 0, step: 1, label: x.k, fmt: String, done: () => undefined }; return { ...o, live: (n) => { vEl.textContent = o.fmt(n); b.toggleClass("is-dim", !n); o.live?.(n); } }; }); }
                        b.addEventListener("click", (e) => {
                            e.preventDefault();
                            if (f.tap) { f.tap(x.value, values(), { close: () => this.close(), host: this.containerEl }); return; }
                            const a = f.ask;
                            if (a && x.value === a.value) {   // a new window for the name, the sheet keeps its rows (owner)
                                openText(this.containerEl, { title: a.title, sub: this.o.title, value: ctl[a.into]?.get() ?? "", placeholder: a.placeholder, save: (name) => {
                                    if (!name) return;
                                    ctl[a.into]?.set(name); touched.add(a.into); cur = x.value; changed(f.key);
                                } });
                                return;
                            }
                            cur = x.value; changed(f.key);
                        });
                    }
                };
                ctl[f.key] = { get: () => cur, set: (v) => { cur = v; }, text: () => cur };
                repaint.push(paint);
                continue;
            }
            if (f.type === "date") {   // one block: swipe left / right for the day before / after, tap for the calendar
                const r = rowFor(f, "zl-datek");
                const blk = h(r, "div", "zl-dateblk");   // a div: the date field lies inside it (no field inside a button)
                blk.setAttribute("role", "button");
                h(blk, "span", "zl-dateblk-a", "‹");
                const mid = h(blk, "span", "zl-dateblk-m");
                const rel = h(mid, "span", "zl-dateblk-r");
                const day = h(mid, "span", "zl-dateblk-d");
                h(blk, "span", "zl-dateblk-a", "›");
                // the real date field, clear, over the whole block: a tap lands on it and iOS opens its own calendar (a picker
                // opened from code on a hidden field did nothing on the phone); a swipe moves too far to be a tap, so it only swipes
                const pick = h(blk, "input", "zl-date-pick");
                pick.type = "date"; pick.tabIndex = -1;
                let cur = val;
                const now = () => ymdOf(new Date());
                const show = (d: string) => {
                    const n = d ? dayDiff(d, now()) : NaN;
                    rel.textContent = !d ? "—" : n === 0 ? t("today").toUpperCase() : n === -1 ? t("yesterday").toUpperCase() : n === 1 ? t("tomorrow").toUpperCase() : WD[new Date(`${d}T12:00:00`).getDay()];
                    day.textContent = d ? dayText(d) : "";
                };
                const paint = () => { show(cur); pick.value = cur || ymdOf(new Date()); };
                ctl[f.key] = { get: () => cur, set: (v) => { cur = v; paint(); }, text: () => dayText(cur) };
                const put = (v: string) => { cur = v; paint(); changed(f.key); };
                // a sideways swipe moves a day every 36 px while the finger moves (the block follows a little); a still tap opens the calendar
                const STEP = 36;
                let x0 = 0, y0 = 0, id = -1, moved = false, base = "", n = 0;
                blk.addEventListener("pointerdown", (e) => { id = e.pointerId; x0 = e.clientX; y0 = e.clientY; moved = false; n = 0; base = cur || now(); });
                blk.addEventListener("pointermove", (e) => {
                    if (e.pointerId !== id) return;
                    const dx = e.clientX - x0;
                    if (!moved && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(e.clientY - y0)) { moved = true; try { blk.setPointerCapture(id); } catch { /* gone */ } blk.addClass("is-swipe"); }
                    if (!moved) return;
                    const k = -Math.trunc(dx / STEP);   // finger left = the next day, as a page turns
                    if (k !== n) { n = k; show(dayAdd(base, n)); if (!iosOnly()) tick(); }
                    mid.style.transform = `translateX(${Math.max(-24, Math.min(24, dx - Math.trunc(dx / STEP) * STEP))}px)`;
                });
                const end = (e: PointerEvent) => {
                    if (e.pointerId !== id) return;
                    id = -1; mid.style.transform = ""; blk.removeClass("is-swipe");
                    if (moved && n) { put(dayAdd(base, n)); tick(); }   // the release is a tap for iOS: its tick comes here
                };
                blk.addEventListener("pointerup", end);
                blk.addEventListener("pointercancel", (e) => { if (e.pointerId === id) { id = -1; mid.style.transform = ""; blk.removeClass("is-swipe"); paint(); } });
                blk.addEventListener("click", (e) => {
                    if (moved) { e.preventDefault(); moved = false; return; }
                    // a computer: a click on the clear field does not open its calendar by itself
                    if (!Platform.isMobile) { try { (pick as HTMLInputElement & { showPicker?: () => void }).showPicker?.(); } catch { /* old browser */ } }
                });
                pick.addEventListener("change", () => { if (pick.value) { put(pick.value); tick(); } });
                paint();
                continue;
            }
            // text: a row with what was written; a tap opens the writing panel (the keyboard only there, the sheet stays still)
            const r = rowFor(f, "zl-text");
            const out = h(r, "span", "zl-text-v");
            let cur = val;
            const up = f.key === "ticker";
            const paint = () => { out.textContent = cur || f.placeholder || "—"; out.toggleClass("is-empty", !cur); };
            ctl[f.key] = { get: () => cur, set: (v) => { cur = v; paint(); }, text: () => cur || "—" };
            r.addEventListener("click", (e) => {
                e.preventDefault();
                openText(this.containerEl, { title: f.label, sub: this.o.title, value: cur, placeholder: f.placeholder, upper: up, save: (v) => { cur = v; paint(); changed(f.key); } });
            });
            paint();
        }
        const totalEl = h(c, "div", "zl-sheet-total" + (this.o.total ? "" : " is-hidden"));   // keeps its line (nothing moves when it fills)
        const bar = h(c, "div", "zl-sheet-btns");
        // the hint (Enter an amount greater than 0) floats at the top of the screen, above the sheet, for a second when it first
        // appears: it covers nothing and nothing moves for it. It lives in the pop-up's container (added at the first hint, after
        // Obsidian has built the pop-up and its extra parts were cleared)
        const msg = createDiv({ cls: "zl-sheet-msg" });
        // owner: only when Save is pressed with something not picked or filled (not while filling in)
        let msgT = 0;
        const hint = (m: string) => {
            window.clearTimeout(msgT);
            if (!m) { msg.removeClass("is-on"); return; }
            if (!msg.isConnected) this.containerEl.appendChild(msg);
            msg.textContent = m; msg.addClass("is-on");
            msgT = window.setTimeout(() => msg.removeClass("is-on"), 2000);
        };
        const ok = h(bar, "button", "mod-cta zl-sheet-ok");
        if (!this.o.submitText) ok.addClass("is-hidden");
        const check = (): string | null => {
            const v = values();
            for (const f of this.o.fields) {
                if (!shown(f, v)) continue;
                if (f.type === "number" && v[f.key] !== "") {
                    const n = parseNum(v[f.key]);
                    if (isNaN(n) || n < 0) return t("invalidNumber");
                    if (f.required && !(n > 0)) return t("invalidAmount");
                } else if (f.required && !v[f.key]) return f.type === "number" ? t("invalidAmount") : t("required", { field: f.label.toLowerCase() });
            }
            return this.o.validate ? this.o.validate(v) : null;
        };
        let first = true;
        const refresh = () => {
            for (const f of this.o.fields) if (f.auto && !touched.has(f.key)) ctl[f.key].set(f.auto(values()));
            const v = values();
            for (const f of this.o.fields) rows[f.key].toggleClass("is-hidden", !shown(f, v));
            repaint.forEach((p) => p());
            Object.assign(v, values());   // a grid may have picked its first cell
            for (const f of this.o.fields) if (f.type === "number" && f.tag) ctl[f.key].set(ctl[f.key].get());   // repaint its tag
            if (foldLine) foldLine.textContent = this.o.fields.filter((f) => f.fold && shown(f, v)).map((f) => { const b = f.brief?.(v); return `${f.label.replace(/ \(.*\)$/, "")} ${ctl[f.key].text()}${b ? ` (${b})` : ""}`; }).join(" · ") + " ›";
            notes.forEach((n) => n());
            const tot = this.o.total?.(v) ?? null;
            totalEl.textContent = tot?.text ?? "\u00a0"; totalEl.toggleClass("is-bad", !!tot?.bad);
            ok.textContent = typeof this.o.submitText === "function" ? this.o.submitText(v) : this.o.submitText ?? "";
            const m = check(); ok.toggleClass("is-blocked", !!m); ok.disabled = this.busy;   // dimmed, still pressable: a press says what is missing
        };
        refresh();
        first = false;   // no message before the first change; the button is simply disabled
        const submit = async () => {
            if (this.busy) return;
            const m = check();
            if (m) { hint(m); return; }
            this.busy = true; refresh();
            try { if ((await this.o.onSubmit(values())) !== false) this.close(); }
            finally { this.busy = false; refresh(); }
        };
        ok.addEventListener("click", () => { void submit(); });
        if (this.o.submitText) this.scope.register([], "Enter", () => { void submit(); return false; });
        if (this.o.danger) {
            const d = this.o.danger;
            const b = h(bar, "button", "mod-warning zl-sheet-danger", d.text);
            b.addEventListener("click", async () => { if (await d.onTap()) this.close(); });
        }
    }

    onClose(): void { this.contentEl.empty(); }
}

export interface Choice { value: string; label: string; hint?: string }
export class ChoiceSheet extends Modal {
    constructor(app: App, private title: string, private choices: Choice[], private onChoose: (v: string) => void | Promise<void>, private subtitle?: string) { super(app); }
    onOpen(): void {
        const c = base(this, this.title, this.subtitle);
        const g = h(c, "div", "zl-group");
        for (const ch of this.choices) {
            const r = h(g, "div", "zl-row is-tap");
            const main = h(r, "div", "zl-row-main");
            h(main, "div", "zl-row-t", ch.label);
            if (ch.hint) h(main, "div", "zl-row-s", ch.hint);
            r.addEventListener("click", () => { this.close(); void this.onChoose(ch.value); });
        }
        const bar = h(c, "div", "zl-sheet-btns");
        h(bar, "button", "", t("cancel")).addEventListener("click", () => this.close());
    }
    onClose(): void { this.contentEl.empty(); }
}

// Yes / no question; resolves true when confirmed
export const confirmSheet = (app: App, title: string, text: string, okText: string): Promise<boolean> => new Promise((resolve) => {
    const m = new Modal(app);
    let answer = false;
    const c = base(m, title, text);
    const bar = h(c, "div", "zl-sheet-btns");
    h(bar, "button", "mod-warning", okText).addEventListener("click", () => { answer = true; m.close(); });
    h(bar, "button", "", t("cancel")).addEventListener("click", () => m.close());
    const done = m.onClose.bind(m);   // keeps the clean-up of centerCard
    m.onClose = () => { done(); resolve(answer); };
    m.open();
});

// Kit K month pick: ‹ year › and the twelve months as a 4 × 3 grid; a tap is the answer (no Save), THIS MONTH under it
export class MonthSheet extends Modal {
    constructor(app: App, private title: string, private sel: { year: number; month: number }, private go: (year: number, month: number) => void) { super(app); }
    onOpen(): void {
        const c = base(this, this.title);
        let year = this.sel.year;
        const head = h(c, "div", "zl-words zl-mpick-y");
        const prev = h(head, "button", "zl-chip zl-chip-arw", "‹");
        const yl = h(head, "button", "zl-chip is-on");
        const next = h(head, "button", "zl-chip zl-chip-arw", "›");
        const grid = h(c, "div", "zl-mpick");
        const now = new Date();
        const paint = () => {
            yl.textContent = String(year);
            grid.empty();
            MON.forEach((m, i) => {
                const b = h(grid, "button", "zl-chip" + (year === this.sel.year && i === this.sel.month ? " is-on" : "") + (year === now.getFullYear() && i === now.getMonth() ? " is-now" : ""), m.toUpperCase());
                b.addEventListener("click", (e) => { e.preventDefault(); this.close(); this.go(year, i); });
            });
        };
        prev.addEventListener("click", (e) => { e.preventDefault(); year--; paint(); });
        next.addEventListener("click", (e) => { e.preventDefault(); year++; paint(); });
        const bar = h(c, "div", "zl-sheet-btns");
        h(bar, "button", "", t("thisMonth")).addEventListener("click", () => { this.close(); this.go(now.getFullYear(), now.getMonth()); });
        paint();
    }
    onClose(): void { this.contentEl.empty(); }
}

// An overlay over a sheet (writing window, number pad) keeps its taps: they must not reach the sheet's pop-up, whose dim
// closes the sheet (owner: tapping the WHY window's dim closed the trade sheet too)
export const keepTaps = (wrap: HTMLElement): void => {
    for (const ev of ["pointerdown", "pointerup", "mousedown", "mouseup", "click", "touchstart", "touchend"]) wrap.addEventListener(ev, (e) => e.stopPropagation());
};

// Writing window (owner, 2026-11-05): a card in the middle of the room above the keyboard, over the dimmed sheet; the title on
// top, three lines of text, CANCEL | DONE at its foot. The sheet behind stays where it is (the page is held still while the
// keyboard opens). Tap the dim to cancel, Return = DONE.
export const openText = (host: HTMLElement, o: { title: string; sub?: string; value: string; placeholder?: string; upper?: boolean; save(v: string): void }): void => {
    const wrap = h(host, "div", "zl-txt");
    keepTaps(wrap);
    const scrim = h(wrap, "div", "zl-txt-scrim");
    const card = h(wrap, "div", "zl-txt-card");
    const head = h(card, "div", "zl-txt-h");
    h(head, "div", "zl-txt-t", o.title.replace(/ \(.*\)$/, ""));
    if (o.sub) h(head, "div", "zl-txt-s", o.sub);
    const ta = h(card, "textarea", "zl-txt-in");
    ta.value = o.value;
    ta.placeholder = o.placeholder ?? "";
    ta.rows = 3;
    ta.setAttribute("enterkeyhint", "done");
    if (o.upper) { ta.setAttribute("autocapitalize", "characters"); ta.setAttribute("autocorrect", "off"); ta.spellcheck = false; }
    const btns = h(card, "div", "zl-txt-btns");
    const cancel = h(btns, "button", "zl-txt-b", t("cancel").toUpperCase());
    const done = h(btns, "button", "zl-txt-b is-loud", t("done").toUpperCase());
    // the middle of what the keyboard leaves: its height as last seen for letters, corrected once it is measured
    const vv = window.visualViewport, appArea = document.querySelector<HTMLElement>(".app-container");
    const kbNow = () => Math.round(Math.max(appArea ? window.innerHeight - appArea.getBoundingClientRect().bottom : 0, vv ? window.innerHeight - (vv.height + vv.offsetTop) : 0, 0));
    let kb = kbCache().text || Math.round(window.innerHeight * 0.4), caretT = 0;
    const place = () => {
        const m = kbNow();
        if (m > 40) kb = m;
        const room = window.innerHeight - kb;
        const top = `${Math.max(12, Math.round((room - card.offsetHeight) / 2))}px`;
        if (card.style.top === top) return;
        card.style.top = top;   // the first place is set before it shows (no slide); later corrections glide (is-set)
        // iOS loses the caret when the field moves after it was focused: set it again once the card has settled
        window.clearTimeout(caretT);
        caretT = window.setTimeout(() => { if (document.activeElement === ta) { const p0 = ta.selectionStart, p1 = ta.selectionEnd; ta.setSelectionRange(p0, p1); } }, 300);
    };
    // hold the page still: iOS scrolls it to the focused field, which moved the sheet behind
    const hold = () => { if (window.scrollY || document.documentElement.scrollTop) window.scrollTo(0, 0); };
    window.addEventListener("scroll", hold, { passive: true });
    vv?.addEventListener("scroll", hold);
    vv?.addEventListener("resize", place);
    const ro = appArea ? new ResizeObserver(place) : null;
    if (appArea) ro?.observe(appArea);
    let closed = false;
    const close = () => {
        if (closed) return;
        closed = true;
        window.removeEventListener("scroll", hold); vv?.removeEventListener("scroll", hold); vv?.removeEventListener("resize", place); ro?.disconnect();
        ta.blur(); wrap.addClass("is-out"); window.setTimeout(() => wrap.remove(), 450);   // stays (invisible) until the tap is over
    };
    const ok = () => { const v = ta.value.replace(/\s+/g, " ").trim(); o.save(o.upper ? v.toUpperCase() : v); close(); };
    cancel.addEventListener("click", (e) => { e.preventDefault(); close(); });
    done.addEventListener("click", (e) => { e.preventDefault(); ok(); });
    scrim.addEventListener("pointerdown", (e) => { e.preventDefault(); close(); });
    ta.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); ok(); }
        else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); }
    });
    place();
    window.setTimeout(() => card.addClass("is-set"), 260);
    // in the same tap, so iOS opens the keyboard; preventScroll keeps the page where it is where the browser honours it
    ta.focus({ preventScroll: true });
    ta.setSelectionRange(ta.value.length, ta.value.length);
};
