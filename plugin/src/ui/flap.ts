import { calm } from "./pixel";

// Split-flap display (redesign C; owner picked the demo "Split-Flap Motion", 2026-11-06: every card, slow). Each tile is a drum
// of cards that only turns forward: to change it turns card by card until it shows its target (6 → 7 8 9 blank 0 1 2 3 → 4).
// The target may move while it turns: the tile never restarts, it just stops on the latest target, so fast typing reads as a
// board spinning and settling. The drums hold no symbols: a change to or from , . + − % is one card straight to it.
const BLANK = "\u00a0";
const NUM = [BLANK, ..."0123456789"];
const TXT = [BLANK, ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ", ..."0123456789"];
// Readability redesign: a field is a fixed row of `pad` tiles; the ones not used yet are dark blanks (BLANK), so the width never
// jumps and the digit count shows. A leading + / − is drawn as bars on the tiles' seam in the loud colour (class sg), not a glyph.
const isSign = (c: string) => c === "+" || c === "-" || c === "\u2212";
// Pace: every tile reaches its target in ROLL ms however many cards it passes (its cards share the time, the landing card takes
// 2.2 shares), tiles start STAGGER ms apart, so the tile that starts first also finishes first. Each hand-off between cards
// costs about a frame; more cards than fit skip ahead to the last ones that do.
const ROLL = 500, STAGGER = 45, HANDOFF = 22, PER_CARD = 34;

// One card turns as one piece: a single leaf hinged at the seam, its front the old top half, its back the new bottom half,
// turns 0 → −180°. While it falls the new top is already behind it; the old bottom stays until the leaf lands on it.
interface Tile {
    el: HTMLElement; st: HTMLElement; sb: HTMLElement; fr: HTMLElement; bk: HTMLElement; lf: HTMLElement;
    frSh: HTMLElement; bkSh: HTMLElement; dr: HTMLElement;
    shown: string; target: string; rolling: boolean; deadline: number; wait: number; gen: number;
}
const TILES = new WeakMap<HTMLElement, Tile>();

export class Flap {
    readonly el: HTMLElement;
    private cur = "";

    // direct is kept for the callers (the amount pad); every field now turns the same way
    constructor(cls: "xs" | "md" | "lg" | "xl" | "amt" = "md", private pad = 0, _direct = false) {
        this.el = document.createElement("div");
        this.el.className = "zl-flap is-" + cls;
        // a page coming on screen (view.ts: open, Back, tab) plays the appear again: blank cards, then the value
        this.el.addEventListener("zl-flap-replay", () => this.replay());
    }

    private mk(): HTMLElement {
        const t = document.createElement("span");
        t.className = "t";
        const half = (cls: string, shade: boolean) => {
            const i = document.createElement("i");
            i.className = cls;
            const em = document.createElement("em");
            em.appendChild(document.createElement("u"));
            i.appendChild(em);
            if (shade) { const b = document.createElement("b"); b.className = "sh"; i.appendChild(b); }
            return i;
        };
        const st = half("st", false), sb = half("sb", false), fr = half("fr", true), bk = half("bk", true);
        const dr = document.createElement("b"); dr.className = "dr";
        const lf = document.createElement("span"); lf.className = "lf";
        lf.append(fr, bk);
        t.append(st, sb, dr, lf);
        const x: Tile = { el: t, st, sb, fr, bk, lf, frSh: fr.lastChild as HTMLElement, bkSh: bk.lastChild as HTMLElement, dr, shown: BLANK, target: BLANK, rolling: false, deadline: 0, wait: 0, gen: 0 };
        TILES.set(t, x);
        this.show(x, BLANK);
        return t;
    }
    // % is drawn smaller than the digits (owner, 2026-11-06: too big on the big cards), on every face it shows on
    private txt(i: HTMLElement, ch: string): void { const u = (i.firstChild as HTMLElement).firstChild as HTMLElement; u.textContent = ch; u.classList.toggle("sym", ch === "%"); }
    private stop(x: Tile): void { [x.lf, x.frSh, x.bkSh, x.dr].forEach((e) => e.getAnimations().forEach((a) => a.cancel())); }

    // at rest: both halves the same character, the leaf put away
    private show(x: Tile, ch: string): void {
        const t = x.el;
        x.shown = ch;
        t.dataset.ch = ch;
        t.classList.toggle("sp", ch === " ");
        t.classList.toggle("bl", ch === BLANK);
        const sg = isSign(ch) && t.parentElement?.firstElementChild === t;   // only a leading sign; a dash inside stays a tile
        t.classList.toggle("sg", sg);
        t.classList.toggle("is-plus", sg && ch === "+");
        t.classList.remove("c");   // , . are tiles like the digits
        this.stop(x);
        this.txt(x.st, ch); this.txt(x.sb, ch);
        x.lf.style.visibility = "hidden";
    }

    private drumOf(a: string, b: string): string[] { return NUM.includes(a) && NUM.includes(b) ? NUM : TXT; }
    private remaining(x: Tile): number {
        if (x.shown === x.target) return 0;
        const d = this.drumOf(x.shown, x.target), i = d.indexOf(x.shown), j = d.indexOf(x.target);
        return i < 0 || j < 0 ? 1 : (j - i + d.length) % d.length;
    }

    // one card: the leaf turns about the seam; resolves when it has landed
    private turn(x: Tile, a: string, b: string, ms: number, last: boolean): Promise<void> {
        return new Promise((done) => {
            const t = x.el;
            t.classList.remove("bl", "sp", "sg", "is-plus");
            this.txt(x.st, b);    // behind the falling card: the new top
            this.txt(x.sb, a);    // under it: the old bottom, until the card lands
            this.txt(x.fr, a);    // the card's front: the old top half
            this.txt(x.bk, b);    // the card's back: the new bottom half
            x.lf.style.visibility = "visible";
            // the landing card eases onto the stop (no bounce: a target that moves mid-turn must not hiccup)
            const anim = x.lf.animate([{ transform: "rotateX(0deg)" }, { transform: "rotateX(-180deg)" }],
                { duration: ms, easing: last ? "cubic-bezier(.25,.1,.25,1)" : "cubic-bezier(.4,0,.7,1)", fill: "both" });
            // light: the front darkens as it tips away, the back starts dark and lightens facing up; a shadow crosses the old bottom
            x.frSh.animate([{ opacity: 0 }, { opacity: 0.55 }], { duration: ms * 0.5, fill: "both" });
            x.bkSh.animate([{ opacity: 0.5 }, { opacity: 0.5, offset: 0.5 }, { opacity: 0 }], { duration: ms, fill: "both" });
            x.dr.animate([{ opacity: 0 }, { opacity: 0.9, offset: 0.45 }, { opacity: 0, offset: 0.6 }, { opacity: 0 }], { duration: ms, fill: "both" });
            let ended = false;
            const g = x.gen;   // a replay in between must not be set back by this card landing late
            const end = () => { if (ended) return; ended = true; if (x.gen === g) this.show(x, b); done(); };
            anim.onfinish = end;
            window.setTimeout(end, ms + 80);   // off-screen pages may not run animations: the card lands anyway
        });
    }
    private async roll(x: Tile): Promise<void> {
        if (x.rolling) return;
        x.rolling = true;
        const g = x.gen;
        while (x.shown !== x.target && x.gen === g) {
            const left = Math.max(0, x.deadline - performance.now());
            const fit = Math.max(1, Math.floor(left / PER_CARD));
            let n = this.remaining(x), next: string;
            const d = this.drumOf(x.shown, x.target), i = d.indexOf(x.shown), j = d.indexOf(x.target);
            if (i < 0 || j < 0) { next = x.target; n = 1; }
            else if (n > fit) { next = fit > 1 ? d[(j - fit + 1 + d.length) % d.length] : x.target; n = fit; }
            else next = d[(i + 1) % d.length];
            const last = n === 1;
            const unit = Math.max(0, left - n * HANDOFF) / (n - 1 + 2.2);
            await this.turn(x, x.shown, next, last ? Math.max(unit * 2.2, 60) : Math.max(unit, 4), last);
        }
        if (x.gen === g) x.rolling = false;
    }

    // the side the number leans on: right when it sits against its box's right edge (readouts, the pad), else left; before
    // layout, a fixed row of tiles (pad > 0) is a right-aligned readout
    private leansRight(): boolean {
        const p = this.el.parentElement, r = this.el.getBoundingClientRect();
        if (!p || !r.width) return this.pad > 0 || p?.classList.contains("zl-read") === true;
        const q = p.getBoundingClientRect();
        return q.right - r.right < r.left - q.left;
    }

    // the appear again: every tile back to a blank card, then the value (owner, 2026-11-06: each time a page opens)
    replay(): void {
        if (!this.cur || calm()) return;
        const text = this.cur;
        for (const t of Array.from(this.el.children) as HTMLElement[]) {
            const x = TILES.get(t);
            if (!x) continue;
            window.clearTimeout(x.wait); x.gen++; x.rolling = false;
            const keep = isSign(x.shown) || x.shown === " ";
            this.show(x, keep ? x.shown : BLANK); x.target = x.shown;
        }
        this.cur = "";
        this.set(text);
    }

    // dir "del": a delete runs from the leftmost tile (its digits move right, the left finishes first); anything else starts
    // from the side the number leans on
    set(text: string, dir?: "del"): void {
        text = text.toUpperCase();
        // a fixed row (pad) keeps its tiles like a real board: a shorter number turns the spare ones blank, and a sign always
        // stays on the first tile (owner, 2026-11-09: after a long amount the + landed mid-row as a white glyph); a free field
        // (the big number) drops spare tiles, so it stays centred
        if (this.pad) {
            const sign = isSign(text[0] ?? "") ? text[0] : "", body = sign ? text.slice(1) : text;
            text = sign + body.padStart(Math.max(this.pad, this.el.children.length - sign.length), BLANK);
        }
        if (text === this.cur && this.el.children.length === text.length) return;
        this.cur = text;
        while (this.el.children.length > text.length) this.el.firstChild?.remove();
        while (this.el.children.length < text.length) this.el.insertBefore(this.mk(), this.el.firstChild);   // new tiles: blank cards
        const tiles = (Array.from(this.el.children) as HTMLElement[]).map((t) => TILES.get(t)!);
        const n = text.length, fromLeft = dir === "del" || !this.leansRight();
        const tile = this.el.hasClass("is-xs"), still = calm(), punct = (c: string) => c === " " || (!tile && isSign(c));
        const now = performance.now();
        let order = 0;
        for (let k = 0; k < n; k++) {
            const i = fromLeft ? k : n - 1 - k, x = tiles[i], ch = text[i];
            // spaces and a big field's sign bars are not cards: they just show
            if (still || punct(ch) || punct(x.shown)) { window.clearTimeout(x.wait); x.gen++; x.rolling = false; x.target = ch; this.show(x, ch); continue; }
            if (x.target === ch && (x.rolling || x.shown === ch)) continue;
            x.target = ch;
            if (x.shown === ch && !x.rolling) continue;
            const delay = order++ * STAGGER;
            x.deadline = now + delay + ROLL;
            if (!x.rolling) { window.clearTimeout(x.wait); x.wait = window.setTimeout(() => { void this.roll(x); }, delay); }
        }
    }
}
