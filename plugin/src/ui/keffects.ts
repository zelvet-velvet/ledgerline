import { calm } from "./pixel";

// K effects on every chart's TODAY (owner 2026-11-10; first on the index chart, market mode; the owner's artifact K lab, 2026-11-09; rules in calc/keffects.ts). A canvas over
// the chart's SVG, in the chart's own pixels; only the forming candle moves:
// - BREAK: a pulsing square in the candle's colour at its tip (above for up, below for down); chips drip off it and fall
// - BB: the band edge the candle nears (1.5 sd and out) fades in (when BB is off); on a break the edge cracks like a ceiling /
//   floor and mark-colour shards fly through it, more the further past the band (owner, 2026-11-10: no shake, the chart
//   itself never moves under a live update)
// - LONG: the growing edge grinds: steel sparks spray back against the move, cool into the candle's colour and drop
// The loop runs only while something moves and the chart is on screen, not during a pinch (pause: it gets every frame; a held
// crosshair keeps them, owner 2026-11-10); calm (reduced motion): the dot and the edge, still.
export interface KScene {
    key: string;              // the forming candle (its time): a new key is a new candle
    x: number; bw: number;    // its centre and body width
    dir: 1 | -1; tipY: number; closeY: number; body: number;
    brk: boolean; long: boolean;
    bb: 1 | -1 | 0; past: number;
    bbY: number | null; slope: number;   // the edge broken (or neared) at the candle, and its slope (px per px)
    edge: [number, number][] | null; near: number;   // the edge to fade in (BB off) and how near: 0 … 1
    floor: number;            // what falls lands here
}
interface Part { k: "s" | "c"; x: number; y: number; vx: number; vy: number; life: number; dec: number; col: string; s: number; b: number }
interface Crack { x: number; y: number; d: number; life: number; w: number; sl: number }

export class KFx {
    readonly cv: HTMLCanvasElement;
    private sc: KScene | null = null;
    private parts: Part[] = []; private cracks: Crack[] = [];
    private edgeA = 0; private raf = 0; private t = 0;
    private brkKey = ""; private bbKey = ""; private bbT = 0; private bodyKey = ""; private bodyMax = 0; private growT = 0;
    private C = { up: "", dn: "", mark: "", spark: "", mut: "" };

    constructor(private plot: HTMLElement) {
        this.cv = document.createElement("canvas");
        this.cv.className = "zl-ch-fx";
    }

    // after each chart draw (the plot was emptied): back on top, with what the forming candle does now (null: nothing fires)
    update(sc: KScene | null): void {
        this.plot.appendChild(this.cv);
        const st = getComputedStyle(this.plot), v = (k: string) => st.getPropertyValue(k).trim();
        this.C = { up: v("--zl-up"), dn: v("--zl-down"), mark: v("--zl-mark"), spark: v("--zl-spark"), mut: v("--zl-mut") };
        if (!sc) { this.pause(); return; }
        const now = performance.now(), still = calm(), col = sc.dir > 0 ? this.C.up : this.C.dn;
        if (sc.brk && this.brkKey !== sc.key) {   // the candle breaks for the first time: a burst of chips
            this.brkKey = sc.key;
            if (!still) for (let j = 0; j < 10; j++) this.chip(sc.x, sc.tipY, (Math.random() - 0.5) * 3, sc.dir > 0 ? -(0.5 + Math.random() * 2.2) : 0.2 + Math.random() * 1.2, col, Math.random() < 0.4 ? 3 : 2);
        }
        if (sc.bb && sc.bbY !== null && this.bbKey !== sc.key) {   // through the band: crack and shards (once a candle)
            this.bbKey = sc.key; this.bbT = now;
            const kk = Math.max(0.2, Math.min(3, sc.past));
            if (!still) {
                this.cracks.push({ x: sc.x, y: sc.bbY, d: sc.bb, life: 1, w: 16 + kk * 16, sl: sc.slope });
                for (let j = 0, m = Math.round(10 + kk * 16); j < m; j++) {
                    const a = (sc.bb > 0 ? -Math.PI / 2 : Math.PI / 2) + (Math.random() - 0.5) * 2.4, sp = 1.5 + Math.random() * (2 + kk * 2);
                    this.chip(sc.x + (Math.random() - 0.5) * 10, sc.bbY, Math.cos(a) * sp, Math.sin(a) * sp, this.C.mark, Math.random() < 0.5 ? 3 : 2);
                }
            }
        }
        if (this.bodyKey !== sc.key) { this.bodyKey = sc.key; this.bodyMax = sc.body; this.growT = 0; }
        else if (sc.body > this.bodyMax) { this.bodyMax = sc.body; this.growT = now; }   // still extending
        this.sc = sc;
        if (still) { this.edgeA = sc.edge ? sc.near : 0; this.paint(now); return; }
        this.t = 0;
        if (!this.raf) this.raf = requestAnimationFrame((t) => this.frame(t));
    }

    stop(): void { if (this.raf) cancelAnimationFrame(this.raf); this.raf = 0; }
    // a pinch (or no scene): nothing animates and nothing is left drawn; the next chart draw with a scene starts again
    pause(): void {
        this.stop(); this.sc = null; this.parts = []; this.cracks = []; this.edgeA = 0;
        const x = this.cv.getContext("2d");
        x?.clearRect(0, 0, this.cv.width, this.cv.height);
    }

    private chip(x: number, y: number, vx: number, vy: number, col: string, s: number) { this.parts.push({ k: "c", x, y, vx, vy, life: 1, dec: 0.009 + Math.random() * 0.008, col, s, b: 0 }); }
    private streak(x: number, y: number, ang: number, sp: number, col: string) { this.parts.push({ k: "s", x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 1, dec: 0.028 + Math.random() * 0.03, col, s: 1, b: 0 }); }
    private growing(now: number): boolean { return !!this.sc?.long && this.growT > 0 && now - this.growT < 1500; }

    private frame(now: number) {
        this.raf = 0;
        if (!this.plot.isConnected || document.hidden) return;
        const f = this.t ? Math.max(0.2, Math.min(3, (now - this.t) / 16.7)) : 1;   // 60 Hz steps on any refresh rate
        this.t = now;
        const sc = this.sc;
        if (sc && this.growing(now)) {   // friction: sparks back against the move from the growing edge
            const col = sc.dir > 0 ? this.C.up : this.C.dn, back = sc.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
            if (Math.random() < 0.7 * f) for (let k = 0; k < 2; k++) this.streak(sc.x + (Math.random() - 0.5) * sc.bw, sc.closeY, back + (Math.random() - 0.5) * 2.3, 2.5 + Math.random() * 5, col);
            if (Math.random() < 0.2 * f) this.chip(sc.x + (Math.random() - 0.5) * sc.bw, sc.closeY, (Math.random() - 0.5), sc.dir > 0 ? 0.4 : -0.6, col, 2);
        }
        if (sc?.brk && Math.random() < 0.3 * f) this.chip(sc.x + (Math.random() - 0.5) * 3, sc.tipY + 2 * sc.dir * -1, (Math.random() - 0.5) * 0.5, Math.random() * 0.5, sc.dir > 0 ? this.C.up : this.C.dn, Math.random() < 0.3 ? 3 : 2);
        const want = sc?.edge ? (now - this.bbT < 2500 ? 1 : sc.near) : 0;
        this.edgeA += (want - this.edgeA) * Math.min(1, 0.12 * f);
        this.paint(now, f);
        const busy = this.parts.length || this.cracks.length || sc?.brk || this.growing(now) || Math.abs(want - this.edgeA) > 0.01;
        if (busy) this.raf = requestAnimationFrame((t) => this.frame(t));
    }

    private paint(now: number, f = 1) {
        const cv = this.cv, W = this.plot.clientWidth, H = this.plot.clientHeight, d = Math.min(2, window.devicePixelRatio || 1);
        if (!W || !H) return;
        if (cv.width !== Math.round(W * d) || cv.height !== Math.round(H * d)) { cv.width = Math.round(W * d); cv.height = Math.round(H * d); }
        const x = cv.getContext("2d");
        if (!x) return;
        x.setTransform(d, 0, 0, d, 0, 0);
        x.clearRect(0, 0, W, H);
        const sc = this.sc, C = this.C;
        if (!sc) return;
        if (sc.edge && this.edgeA > 0.03) {   // the band edge the candle nears
            x.globalAlpha = this.edgeA; x.strokeStyle = C.mark; x.lineWidth = 1.5;
            x.beginPath(); sc.edge.forEach(([px, py], i) => (i ? x.lineTo(px, py) : x.moveTo(px, py))); x.stroke();
            x.globalAlpha = 1;
        }
        this.cracks = this.cracks.filter((c) => c.life > 0);
        for (const c of this.cracks) {
            x.globalAlpha = Math.max(0, c.life); x.strokeStyle = C.mark; x.lineWidth = 2; x.beginPath();
            for (let i = 0; i <= 8; i++) { const xx = c.x - c.w * 1.6 + (i * c.w) / 4, yy = c.y + (xx - c.x) * c.sl + (i % 2 ? -1 : 1) * c.d * (2 + ((i * 37) % 5)); if (i) x.lineTo(xx, yy); else x.moveTo(xx, yy); }
            x.stroke(); c.life -= 0.012 * f;
        }
        x.globalAlpha = 1;
        const col = sc.dir > 0 ? C.up : C.dn;
        if (this.growing(now) && Math.sin(now / 40) > -0.3) { x.fillStyle = C.spark; x.fillRect(sc.x - sc.bw / 2 - 2, sc.closeY - 1, sc.bw + 4, 2); }   // the grinding edge
        if (sc.brk) {   // the break dot, pulsing
            const p = calm() ? 0.5 : (Math.sin(now / 130) + 1) / 2;
            x.globalAlpha = 0.18 + 0.22 * p; x.fillStyle = col; x.fillRect(sc.x - 6 - p * 3, sc.tipY - 6 - p * 3, 12 + p * 6, 12 + p * 6);
            x.globalAlpha = 1; x.fillRect(sc.x - 3, sc.tipY - 3, 6, 6);
        }
        for (const p of this.parts) {   // sparks are streaks (steel, then the candle's colour), chips are squares that bounce once
            p.vy += (p.k === "s" ? 0.09 : 0.14) * f; p.x += p.vx * f; p.y += p.vy * f; p.life -= p.dec * f;
            if (p.y > sc.floor - p.s && p.vy > 0) { p.y = sc.floor - p.s; p.vy *= -0.25; p.vx *= 0.5; p.b++; }
            x.globalAlpha = Math.max(0, Math.min(1, p.life * 1.6));
            if (p.k === "s") { x.strokeStyle = p.life > 0.55 ? C.spark : p.col; x.lineWidth = 1.3; x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(p.x - p.vx * 2.4, p.y - p.vy * 2.4); x.stroke(); }
            else { x.fillStyle = p.life > 0.35 ? p.col : C.mut; x.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s); }
        }
        x.globalAlpha = 1;
        this.parts = this.parts.filter((p) => p.life > 0 && p.b < 2);
    }
}
