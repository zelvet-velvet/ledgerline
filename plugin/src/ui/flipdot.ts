import { calm, GLYPH } from "./pixel";

// Flip-dot board for the big number (redesign C). Like a real panel: the dots are bistable discs; the controller scans column by
// column and pulses only the dots that differ, each disc turning over on its axis. A finger drag moves the digits one column per
// column of travel and re-scans in the drag direction; a tap sends a ripple in the loud colour. Ported from the approved mock.
const SCAN_DELAY = 30;     // ms before a refresh starts (the controller "thinks" first)
// a refresh sweep, ms per column (owner, 2026-11-04: faster; was 9 first / 7 after): 80 columns ≈ 0.3 s first, 0.25 s after
const SWEEP_FIRST_MS = 4, SWEEP_MS = 3;
const SCAN_COL_MS = 4;     // ms per column while dragging (80 columns ≈ 0.32 s per sweep)
const DISC_MS = 220;       // one disc turning over (owner picked in the flip-dot lab, 2026-11-06; was 90)

// A theme change (light ↔ dark) swaps body classes: every live board reads its colours again and repaints.
const LIVE = new Set<FlipDot>();
let themeWatch: MutationObserver | null = null;
const watchTheme = (): void => {
    if (themeWatch) return;
    themeWatch = new MutationObserver(() => { for (const b of LIVE) { if (b.el.isConnected) b.recolor(); else LIVE.delete(b); } });
    themeWatch.observe(document.body, { attributes: true, attributeFilter: ["class"] });
};

export class FlipDot {
    readonly el: HTMLCanvasElement;
    private cols = 80;
    private readonly rows = 24;   // readability redesign: 80 × 24 dots, 120 px high
    private readonly pitch = 5;
    private readonly cell = 4;
    private readonly dpr = Math.min(3, window.devicePixelRatio || 1);
    private state = new Uint8Array(0);
    private target = new Uint8Array(0);
    private start = new Float64Array(0);
    private base = new Uint8Array(0);
    private text: string | null = null;
    private shift = 0;
    private want = 0;
    private dur = 110;
    private dragRaf = 0;
    private running = false;
    private ripple: { x: number; y: number; t: number; end: number } | null = null;
    private colors: [string, string, string] | null = null;   // off, on, loud (read once per change: getComputedStyle per frame stuttered)
    dragged = false;
    private waits = 0;

    constructor(parent: HTMLElement) {
        this.el = document.createElement("canvas");
        this.el.className = "zl-board";
        parent.appendChild(this.el);
        LIVE.add(this);
        watchTheme();
        // a tab change asks the board to refresh (view.ts sends zl-replay to the boards of the page coming in)
        this.el.addEventListener("zl-replay", () => this.replay());
        this.el.addEventListener("click", (e) => {
            if (this.dragged) return;
            const r = this.el.getBoundingClientRect();
            // a ring in the loud colour, a true circle, growing until it has left every corner of the board (owner, 2026-11-06)
            const x = ((e.clientX - r.left) / r.width) * this.cols, y = ((e.clientY - r.top) / r.height) * this.rows, C = this.cols, R = this.rows;
            const end = Math.max(Math.hypot(x, y), Math.hypot(C - x, y), Math.hypot(x, R - y), Math.hypot(C - x, R - y)) + 2;
            this.ripple = { x, y, t: performance.now(), end };
            this.kick();
        });
        // A cached page goes back on screen without a redraw (view.ts replaceChildren). The loop stops while the canvas is off
        // the page, so a board left mid-flip stayed frozen on that frame. Restart it whenever the board is visible again:
        // flips that were due finish at once, and the theme's colours are read again in case they changed meanwhile.
        new IntersectionObserver((entries) => {
            if (entries.some((e) => e.isIntersecting)) { this.colors = null; this.kick(); }
        }).observe(this.el);
    }

    private size(cols: number): void {
        if (cols === this.cols && this.state.length) return;
        this.cols = cols;
        const n = cols * this.rows;
        this.state = new Uint8Array(n); this.target = new Uint8Array(n); this.start = new Float64Array(n).fill(-1); this.base = new Uint8Array(n);
        this.el.width = cols * this.pitch * this.dpr; this.el.height = this.rows * this.pitch * this.dpr;
    }

    private bitmap(text: string): Uint8Array {
        // each glyph dot is drawn 2 wide × 3 tall: tall, slim digits
        const k = 2, ky = 3, glyphs = [...text].map((ch) => GLYPH[ch] ?? GLYPH[" "]);
        const w = (glyphs.reduce((s, g) => s + g[0].length + 1, -1)) * k;
        this.size(Math.max(80, w + 6));
        const bm = new Uint8Array(this.cols * this.rows);
        let x0 = Math.floor((this.cols - w) / 2);
        const y0 = Math.floor((this.rows - 7 * ky) / 2);
        for (const g of glyphs) {
            g.forEach((row, gy) => [...row].forEach((p, gx) => {
                if (p !== "#") return;
                for (let a = 0; a < k; a++) for (let b = 0; b < ky; b++) { const x = x0 + gx * k + a, y = y0 + gy * ky + b; if (x >= 0 && x < this.cols && y < this.rows) bm[y * this.cols + x] = 1; }
            }));
            x0 += (g[0].length + 1) * k;
        }
        return bm;
    }

    private shifted(s: number): Uint8Array {
        if (!s) return this.base;
        const out = new Uint8Array(this.base.length);
        for (let i = 0; i < out.length; i++) { const sc = (i % this.cols) - s; if (sc >= 0 && sc < this.cols) out[i] = this.base[i - s]; }
        return out;
    }

    // scan: dir 1 sweeps left → right, -1 right → left; colMs per column, jitter = the small mechanical spread, each column top to bottom
    private apply(bm: Uint8Array, dir: number, colMs: number, jitter: number, dur: number): void {
        const now = performance.now(), still = calm();
        this.dur = dur;
        for (let i = 0; i < bm.length; i++) {
            this.target[i] = bm[i];
            if (still || this.state[i] === bm[i]) { this.state[i] = bm[i]; this.start[i] = -1; continue; }
            const col = i % this.cols, row = (i / this.cols) | 0, order = dir > 0 ? col : this.cols - 1 - col;
            this.start[i] = now + SCAN_DELAY + order * colMs + row * (colMs / this.rows) + Math.random() * jitter;
        }
        this.kick();
    }

    // Every new number, a live price tick included (owner, 2026-11-05: the odometer roll is gone), is the refresh's sweep:
    // left to right, column by column, each column top to bottom; in a column the old number's dots go dark and the new
    // one's light in the same pass, so the old number disappears as the new one shows. Every page's board uses it.
    set(text: string, _dir = 1): void {
        this.colors = null;
        LIVE.add(this);
        if (this.dragRaf) { cancelAnimationFrame(this.dragRaf); this.dragRaf = 0; }
        if (text === this.text && !this.shift) { this.kick(); return; }
        const first = this.text === null;
        const oldCols = this.cols;
        this.text = text; this.base = this.bitmap(text); this.shift = 0;
        if (this.cols !== oldCols) this.state = new Uint8Array(this.base.length);
        // always from the upper left: column by column, each column top to bottom (the owner wants the sweep easy to see)
        this.apply(this.base, 1, first ? SWEEP_FIRST_MS : SWEEP_MS, first ? 8 : 3, DISC_MS);
    }

    // finger travel in px since the drag started (moves gathered per frame: a quick finger never queues more than one refresh)
    drag(px: number): void {
        this.want = px;
        if (this.dragRaf) return;
        this.dragRaf = requestAnimationFrame(() => {
            this.dragRaf = 0;
            const w = this.el.getBoundingClientRect().width || 1, s = Math.round((this.want / w) * this.cols);
            if (s === this.shift) return;
            this.shift = s;
            this.sweep(this.shifted(s));
        });
    }

    // While the finger is down, a scan head keeps running across the board from the left (one column every SCAN_COL_MS, each
    // column top to bottom, then from the left again). A dot that has to change turns over when the head next passes it, so the
    // moved digits show up as a sweep from the upper left to the lower right instead of everywhere at once.
    private sweepT0 = 0;
    private sweep(bm: Uint8Array): void {
        const now = performance.now(), still = calm(), period = this.cols * SCAN_COL_MS;
        if (now - this.sweepT0 > period * 2) this.sweepT0 = now;   // no sweep running: a new one starts at the left edge
        this.dur = DISC_MS;
        for (let i = 0; i < bm.length; i++) {
            this.target[i] = bm[i];
            if (still) { this.state[i] = bm[i]; this.start[i] = -1; continue; }
            if (this.state[i] === bm[i] && !(this.start[i] >= 0 && this.start[i] <= now)) { this.start[i] = -1; continue; }   // back where it is: no flip
            if (this.start[i] > now) continue;   // already waiting for the head
            if (this.start[i] >= 0 && now - this.start[i] < this.dur) continue;   // turning over right now
            const col = i % this.cols, row = (i / this.cols) | 0;
            const at = col * SCAN_COL_MS + row * (SCAN_COL_MS / this.rows);
            const k = Math.ceil((now - this.sweepT0 - at) / period);
            this.start[i] = this.sweepT0 + Math.max(0, k) * period + at;
        }
        this.kick();
    }

    // Refresh like a real panel coming on: every dot goes dark, then the digits turn over column by column from the upper left
    // (the same sweep as the first time the board is drawn). Calm motion: nothing happens.
    replay(): void {
        if (calm() || this.text === null) return;
        if (this.dragRaf) { cancelAnimationFrame(this.dragRaf); this.dragRaf = 0; }
        this.colors = null;
        this.state = new Uint8Array(this.base.length);
        this.start = new Float64Array(this.base.length).fill(-1);
        this.shift = 0;
        this.apply(this.base, 1, SWEEP_MS, 3, DISC_MS);
    }

    recolor(): void { LIVE.add(this); this.colors = null; this.kick(); }

    private kick(): void { if (!this.running) { this.running = true; requestAnimationFrame((t) => this.frame(t)); } }
    // paint() itself waits (a bounded number of frames) while the canvas is not on the page yet: a board set during a redraw is
    // attached a moment later, and stopping here left it unpainted, in the old theme's colours
    private frame(t: number): void { if (this.paint(t)) requestAnimationFrame((x) => this.frame(x)); else this.running = false; }

    private paint(now: number): boolean {
        const x = this.el.getContext("2d");
        if (!x) return false;
        // a page is built before it is on screen: off screen the theme's colours read empty and the light fallbacks drew the
        // board inverted on charcoal. Wait (up to ~2 s of frames) until the canvas is in the page, then read them.
        // Connected is not enough: a redraw builds the page in the document before it is inside the app, where the tokens are
        // empty; caching the fallbacks then kept the light colours in dark mode. Wait until the tokens can be read.
        const cs = this.colors ? null : getComputedStyle(this.el), dim = cs?.getPropertyValue("--zl-dim").trim();
        if (!this.el.isConnected || (cs && !dim)) { this.waits = (this.waits ?? 0) + 1; return this.waits < 120; }
        this.waits = 0;
        if (cs) this.colors = [dim || "#D5D1C7", cs.getPropertyValue("--zl-text").trim() || "#1C1B19", cs.getPropertyValue("--zl-loud").trim() || "#E8461F"];
        if (!this.colors) return false;
        const [off, on, loud] = this.colors, p = this.pitch, c = this.cell;
        x.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        x.clearRect(0, 0, this.cols * p, this.rows * p);
        let busy = false;
        const rp = this.ripple, rt = rp ? (now - rp.t) / 16 : 0;
        if (rp && rt > rp.end) this.ripple = null;
        for (let i = 0; i < this.state.length; i++) {
            const col = i % this.cols, row = (i / this.cols) | 0;
            let s = this.state[i], w = 1;
            if (this.start[i] >= 0) {
                const k = (now - this.start[i]) / this.dur;   // one disc turning over
                if (k >= 1) { this.state[i] = this.target[i]; this.start[i] = -1; s = this.target[i]; }
                else { busy = true; if (k > 0) { w = Math.abs(Math.cos(k * Math.PI)); if (k > 0.5) s = this.target[i]; } }
            }
            let color = s ? on : off;
            if (this.ripple && rp) { busy = true; if (Math.abs(Math.hypot(col + 0.5 - rp.x, row + 0.5 - rp.y) - rt) < 0.9) color = loud; }
            const cw = Math.max(0.5, c * w);
            x.fillStyle = color;
            x.fillRect(col * p + (c - cw) / 2, row * p, cw, c);
        }
        return busy;
    }
}
