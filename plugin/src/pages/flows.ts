import { Broker, BrokerSpan, isForeignBroker, TopBrokers } from "../calc/brokers";
import { price2 } from "../ui/chart";
import { FlowDay, flowGross, flowSides, flowSum, isEtf, lots, streak } from "../calc/flows";
import { niceTicks } from "../calc/chart";
import { Flows } from "../prices/flows";
import { Brokers } from "../prices/brokers";
import { num, shortDate } from "../format";
import { t } from "../i18n";
import { empty, h, page } from "../ui";
import { figures, summary } from "../ui/c";
import type { PageCtx, PageOut } from "./index";

// 法人 flows (mock `Invest · L 法人 flows`, agent's picks 2026-11-04), one screen: the last day's net in lots as the summary,
// a 5 / 20 day switch, daily net bars around a zero line (tap or drag = that day's numbers), then rows. The overview stacks
// 外資 (ink), 投信 (muted) and 自營商 (hatched); its rows open each one's detail (`flows:<TK>:f|t|d`): its own bars, what it
// bought and sold, on how many days. ETFs: 自營商 is mostly market makers' hedging, so it is muted.
// Nothing re-enters in place: the switch and new days redraw only the bars (they light again, Design Rules › Motion) and
// change the rows' text; the page itself is drawn once.

type W = "f" | "t" | "d";
const NS = "http://www.w3.org/2000/svg";
const signed = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${num(Math.abs(n))}`;
const L = (n: number) => signed(lots(n));
const short = (n: number) => { const a = Math.abs(n), s = n < 0 ? "−" : ""; return a >= 1e6 ? `${s}${+(a / 1e6).toFixed(1)}M` : a >= 1e3 ? `${s}${+(a / 1e3).toFixed(a >= 1e5 ? 0 : 1)}K` : `${s}${a}`; };
const streakText = (k: number) => !k ? t("fFlat") : Math.abs(k) === 1 ? t(k > 0 ? "fBuy1" : "fSell1") : t(k > 0 ? "fBuyN" : "fSellN", { n: Math.abs(k) });
const NAME: Record<W, "fF" | "fT" | "fD"> = { f: "fF", t: "fT", d: "fD" };
const EN: Record<W, "fFEn" | "fTEn" | "fDEn"> = { f: "fFEn", t: "fTEn", d: "fDEn" };   // the masthead stays English (owner, 2026-11-04)
let SPAN: 5 | 20 = 20;   // the days shown, for every ticker, this session

// the codes worth fetching: holdings and the watchlist, TWSE listings only
export const flowCodes = (ctx: PageCtx, tickers: string[]): string[] =>
    tickers.map((tk) => Flows.code(ctx.plugin.prices.symbol(tk))).filter((c): c is string => !!c);

// the tile on a chart page (one-screen chart pages, 2026-11-04): 三大法人 on the last report, short; fills itself in
export const flowsTile = (ctx: PageCtx, tk: string, codes: string[]): { k: string; v: string; s: string; icon: string; hot?: boolean; dim?: boolean; onTap: () => void; ref: (b: HTMLElement) => void } | null => {
    const code = Flows.code(ctx.plugin.prices.symbol(tk));
    if (!code || !codes.includes(code)) return null;
    const flows = ctx.plugin.flows;
    // the number in lots with its report day under it (owner, 2026-11-10: "-195" alone had no unit or date); up / down colours
    const val = () => { const s = flows.series(code), last = s?.[s.length - 1]; return last ? { v: short(lots(last.total)), s: `${shortDate(last.date).toUpperCase()} \u00b7 ${t("fLots")}`, n: last.total } : { v: "-", s: "", n: 0 }; };
    const v0 = val();
    flows.ensure(codes);
    const paint = (b: HTMLElement) => {
        const x = val();
        b.querySelector(".zl-tg-v")?.setText(x.v);
        (b.querySelector(".zl-tg-s") ?? b.createSpan({ cls: "zl-tg-s" })).setText(x.s);
        b.toggleClass("is-hot", x.n < 0); b.toggleClass("is-up", x.n > 0); b.toggleClass("is-dim", x.v === "-");
    };
    return {
        k: t("fRowK"), icon: "flows", v: v0.v, s: v0.s, dim: v0.v === "-", onTap: () => ctx.push({ key: "flows:" + tk, title: t("fTitle", { tk }) }),
        ref: (b) => { b.addClass("is-mkt"); paint(b); flows.onChange(() => { if (!b.isConnected) return false; paint(b); return true; }); },
    };
};

// the way in, under the chart (mock `L way in`): 三大法人 on the last report and 外資's streak; fills itself in when the days arrive
export const flowsRow = (ctx: PageCtx, parent: HTMLElement, tk: string, codes: string[]): void => {
    const code = Flows.code(ctx.plugin.prices.symbol(tk));
    if (!code || !codes.includes(code)) return;
    const flows = ctx.plugin.flows, g = h(parent, "div", "zl-c-group");
    const go = () => ctx.push({ key: "flows:" + tk, title: t("fTitle", { tk }) });
    const row = (): Row => {
        const s = flows.series(code), last = s?.[s.length - 1];
        return last ? { s: `${shortDate(last.date)} · ${t("fF")} ${streakText(streak(s!, "f"))}`, v: L(last.total), hot: last.total < 0 } : { s: t("fLoading"), v: "-" };
    };
    const r0 = row();
    figures(g, [{ icon: "flows", k: t("fRowK").toUpperCase(), s: r0.s, v: r0.v, hot: r0.hot, onTap: go }]);
    flows.onChange(() => { if (!g.isConnected) return false; const r = g.querySelector<HTMLElement>(".zl-fig"); if (r) setRow(r, row()); return true; });
    flows.ensure(codes);
};

// one row's text, changed in place (no re-entry)
interface Row { k?: string; s: string; v: string; hot?: boolean; dim?: boolean; onTap?: () => void }
const setRow = (r: HTMLElement, x: Row) => {
    if (x.k) r.querySelector(".zl-fig-k")?.setText(x.k);
    r.querySelector(".zl-fig-s")?.setText(x.s);
    const v = r.querySelector(".zl-fig-v");
    if (v) { v.setText(x.v); v.toggleClass("is-hot", !!x.hot); }
    r.toggleClass("is-dim", !!x.dim);
};

export const flowsPage = (ctx: PageCtx, arg: string, codes: string[], trade: (tk: string) => void): PageOut => {
    const [tk, w0] = arg.split(":"), who = (w0 === "f" || w0 === "t" || w0 === "d" ? w0 : null) as W | null;
    const title = who ? `${tk} ${t(EN[who])}` : t("fTitle", { tk });
    const el = page(title);
    el.addClass("zl-c-stack");
    const fab = { icon: "plus", text: t("iTrade").toUpperCase(), label: t("iTrade"), onTap: () => trade(tk) };
    const flows = ctx.plugin.flows, code = Flows.code(ctx.plugin.prices.symbol(tk));
    if (!code) { empty(el, { icon: "flows", title: t("fNone"), text: t("fNoneS") }); return { title, el, fab }; }
    flows.ensure(Array.from(new Set([...codes, code])));
    let s = flows.series(code);
    if (!s) {   // first visit: the page waits, then is drawn once when the first days arrive
        empty(el, { icon: "flows", title: t("fLoading"), text: t("fLoadingS") });
        flows.onChange(() => { if (!el.isConnected) return false; if (!flows.series(code)) return true; ctx.redraw(); return false; });
        return { title, el, fab };
    }
    const etf = isEtf(code);
    // summary: the last day's net, 5 / 20 day sums (a detail page adds its streak); a new value flips from the old one
    let sumEl: HTMLElement | null = null;
    const top = () => {
        const x = s!, last = x[x.length - 1], k = who ?? "total";
        const items: [string, string, boolean?][] = [[t("fDays", { n: 5 }), L(flowSum(x, k, 5)), flowSum(x, k, 5) < 0], [t("fDays", { n: 20 }), L(flowSum(x, k, 20)), flowSum(x, k, 20) < 0]];
        if (who) { const r = streak(x, who); items.push([t("fRun"), r ? t(r > 0 ? "fRunB" : "fRunS", { n: Math.abs(r) }) : t("fFlat"), r < 0]); }
        const g = summary(createDiv(), { key: "flows", label: t("fToday", { w: who ? t(NAME[who]) : t("fRowK"), d: shortDate(last.date) }), value: L(last[k]), hot: last[k] < 0, dim: who === "d" && etf, items });
        if (sumEl) sumEl.replaceWith(g); else el.appendChild(g);
        sumEl = g;
    };
    top();
    // the chart group takes the room that is left
    const cg = h(el, "div", "zl-c-group zl-c-fill zl-fl");
    const seg = h(cg, "div", "zl-fl-seg");
    const segs = ([5, 20] as const).map((n) => {
        const b = h(seg, "button", "zl-fl-segb" + (SPAN === n ? " is-on" : ""), t("fDays", { n }).toUpperCase());
        b.addEventListener("click", (e) => { e.preventDefault(); if (SPAN === n) return; SPAN = n; segs.forEach((x, i) => x.toggleClass("is-on", [5, 20][i] === n)); pick = -1; update(); });
        return b;
    });
    const legend = h(cg, "div", "zl-fl-legend");
    const plot = h(cg, "div", "zl-fl-plot");
    const shown = () => s!.slice(-SPAN);
    const say = (x: FlowDay) => legend.setText(!who
        ? t("fHeld", { d: shortDate(x.date), f: L(x.f), t: L(x.t), dd: L(x.d) })
        : who === "d" ? t("fHeldD", { d: shortDate(x.date), own: L(x.ds), hedge: L(x.dh), net: L(x.d) })
        : t("fHeldW", { d: shortDate(x.date), b: num(lots(x[`${who}b`])), s: num(lots(x[`${who}s`])), net: L(x[who]) }));
    let pick = -1, Wd = 0, Hd = 0;
    const draw = (light: boolean) => {
        Wd = plot.clientWidth || Wd; Hd = plot.clientHeight || Hd;
        if (!Wd || !Hd) return;
        const x = shown(), p = pick < 0 ? x.length - 1 : pick;
        plot.empty();
        say(x[p]);
        bars(plot, x, Wd, Hd, p, stacks(who, etf), light);
    };
    const at = (ev: PointerEvent) => {
        const x = shown(), r = plot.getBoundingClientRect(), i = Math.floor(((ev.clientX - r.left - AXIS) / (r.width - AXIS)) * x.length);
        const k = Math.max(0, Math.min(x.length - 1, i));
        if (k !== (pick < 0 ? x.length - 1 : pick)) { pick = k; draw(false); }
    };
    plot.addEventListener("pointerdown", at);
    plot.addEventListener("pointermove", (ev) => { if (ev.buttons || ev.pointerType === "touch") at(ev); });
    let first = true;
    new ResizeObserver(() => { if (plot.clientWidth && (plot.clientWidth !== Wd || plot.clientHeight !== Hd)) { draw(first); first = false; } }).observe(plot);
    // the top brokers row (overview: all branches; 外資: the foreign ones): the biggest buyer and seller for the days shown
    const B = ctx.plugin.brokers;
    const brokerRow = (foreign: boolean): Row => {
        B.ensure(code, SPAN);
        const d = B.get(code, SPAN), open = () => ctx.push({ key: `brokers:${tk}${foreign ? ":foreign" : ""}`, title: t("bTitle", { tk }) });
        const k = t(foreign ? "bForeignK" : "bTopK");
        if (!d) return { k, s: B.failedAt(code, SPAN) ? t("bFailed") : t("fLoading"), v: "-", dim: true, onTap: open };
        const by = (l: Broker[]) => (foreign ? l.filter((b) => isForeignBroker(b.name)) : l)[0];
        const a = by(d.buy), z = by(d.sell);
        return { k, s: [a ? `${a.name} ${signed(a.net)}` : "", z ? `${z.name} ${signed(z.net)}` : ""].filter(Boolean).join(" · ") || t("bNoneForeign"), v: "", onTap: open };
    };
    // rows: the overview's three open their details; a detail shows bought / sold (自營商: own trading / hedging) and days
    const g = h(el, "div", "zl-c-group");
    const rowsOf = (): Row[] => {
        const x = s!, last = x[x.length - 1], n = SPAN, w = x.slice(-n);
        if (!who) return [...(["f", "t", "d"] as W[]).map((k) => {
            const hedge = k === "d" && etf;
            return { k: t(NAME[k]), dim: hedge, s: [...(hedge ? [t("fHedge")] : []), streakText(streak(x, k)), `${n}d ${L(flowSum(x, k, n))}`].join(" · "), v: L(last[k]), hot: !hedge && last[k] < 0, onTap: () => ctx.push({ key: `flows:${tk}:${k}`, title: `${tk} ${t(EN[k])}` }) };
        }), brokerRow(false)];
        const [up, dn] = flowSides(x, who, n);
        const days: Row = { k: t("fDaysK"), s: t("fDaysS", { n }), v: `${up} / ${dn}`, hot: dn > up };
        if (who === "d") {
            const net = (k: "ds" | "dh") => w.reduce((a, y) => a + y[k], 0);
            const bs = (k: "ds" | "dh") => t("fBS", { b: num(lots(w.reduce((a, y) => a + y[`${k}b`], 0))), s: num(lots(w.reduce((a, y) => a + y[`${k}s`], 0))) });
            return [{ k: t("fOwn"), s: bs("ds"), v: L(net("ds")), hot: net("ds") < 0 }, { k: t("fHedgeK"), s: etf ? `${bs("dh")} · ${t("fHedgeEtf")}` : bs("dh"), v: L(net("dh")), dim: true }, days];
        }
        return [
            { k: t("fBought"), s: t("fDaysS", { n }), v: num(lots(flowGross(x, who, "b", n))) },
            { k: t("fSold"), s: t("fDaysS", { n }), v: num(lots(flowGross(x, who, "s", n))), hot: true },
            days,
            ...(who === "f" ? [brokerRow(true)] : []),
        ];
    };
    figures(g, rowsOf().map((r) => ({ icon: "flows", k: r.k!, s: r.s, v: r.v, hot: r.hot, dim: r.dim, onTap: r.onTap })));
    const update = () => {
        draw(true);
        const rs = g.querySelectorAll<HTMLElement>(".zl-fig");
        rowsOf().forEach((r, i) => { if (rs[i]) setRow(rs[i], r); });
    };
    B.onChange(() => { if (!el.isConnected) return false; const rs = g.querySelectorAll<HTMLElement>(".zl-fig"); rowsOf().forEach((r, i) => { if (rs[i]) setRow(rs[i], r); }); return true; });
    // new days while the page is open: the summary flips, the bars light again, the rows change their text
    flows.onChange(() => {
        if (!el.isConnected) return false;
        const n = flows.series(code);
        if (!n || (n.length === s!.length && n[n.length - 1].date === s![s!.length - 1].date)) return true;
        s = n; pick = -1; top(); update();
        return true;
    });
    return { title, el, fab };
};

// what each day's bar is made of: [lots, class, hatched]
type Part = (x: FlowDay) => [number, string, boolean][];
const stacks = (who: W | null, etf: boolean): Part => {
    const d = etf ? "zl-fl-d is-mut" : "zl-fl-d";
    if (!who) return (x) => [[lots(x.f), "zl-fl-f", false], [lots(x.t), "zl-fl-t", false], [lots(x.d), d, true]];
    if (who === "d") return (x) => [[lots(x.ds), "zl-fl-f", false], [lots(x.dh), d, true]];
    return (x) => [[lots(x[who]), x[who] < 0 ? "zl-fl-down" : "zl-fl-f", false]];
};

// daily net bars, stacked per day around the zero line: positives up, negatives down. `light`: every bar is a dark block
// first and lights in one stepped beat, left to right (zl-grow); a tap only moves the picked day (nothing lights again)
const AXIS = 44, TOP = 8, BOT = 20;
let PAT = 0;
const bars = (plot: HTMLElement, s: FlowDay[], W: number, H: number, pick: number, parts: Part, light: boolean): void => {
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("width", String(W));
    svg.setAttribute("height", String(H));
    svg.setAttribute("class", "zl-ch-svg zl-fl-svg" + (light ? " is-light" : ""));
    plot.appendChild(svg);
    const el = (p: Element, tag: string, a: Record<string, string | number>, cls?: string) => {
        const e = document.createElementNS(NS, tag);
        for (const [k, v] of Object.entries(a)) e.setAttribute(k, String(v));
        if (cls) e.setAttribute("class", cls);
        p.appendChild(e);
        return e;
    };
    const id = `zl-fl-hatch-${++PAT}`, idm = `${id}-m`;
    const defs = el(svg, "defs", {});
    for (const [pid, cls] of [[id, "zl-fl-hatch"], [idm, "zl-fl-hatch is-mut"]]) {
        const pat = el(defs, "pattern", { id: pid, width: 4, height: 4, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" });
        el(pat, "line", { x1: 0, y1: 0, x2: 0, y2: 4 }, cls);
    }
    const P = s.map(parts);
    let hi = 0, lo = 0;
    for (const r of P) { hi = Math.max(hi, r.filter(([v]) => v > 0).reduce((a, [v]) => a + v, 0)); lo = Math.min(lo, r.filter(([v]) => v < 0).reduce((a, [v]) => a + v, 0)); }
    if (hi === lo) hi = 1;
    const y0 = TOP, y1 = H - BOT, y = (v: number) => y1 - ((v - lo) / (hi - lo)) * (y1 - y0);
    const x0 = AXIS, step = (W - x0 - 2) / s.length, bw = Math.max(2, Math.min(18, step * 0.7));
    const ticks = niceTicks(lo, hi, 4);
    for (const v of ticks) {
        el(svg, "line", { x1: x0, x2: W - 2, y1: Math.round(y(v)) + 0.5, y2: Math.round(y(v)) + 0.5 }, v === 0 ? "zl-ch-axis" : "zl-ch-grid");
        el(svg, "text", { x: x0 - 6, y: y(v) + 4, "text-anchor": "end" }, "zl-ch-yl").textContent = short(v);
    }
    if (!ticks.includes(0)) el(svg, "line", { x1: x0, x2: W - 2, y1: Math.round(y(0)) + 0.5, y2: Math.round(y(0)) + 0.5 }, "zl-ch-axis");
    el(svg, "rect", { x: x0 + pick * step, y: y0, width: step, height: y1 - y0 }, "zl-fl-pick");
    const beat = Math.min(30, 300 / Math.max(1, s.length));   // the whole chart lights within 0.3 s (Design Rules › Motion)
    P.forEach((r, i) => {
        const cx = x0 + (i + 0.5) * step;
        let up = 0, dn = 0;
        r.forEach(([v, cls, hatch]) => {
            if (!v) return;
            const a = v > 0 ? up : dn, b = a + v;
            if (v > 0) up = b; else dn = b;
            const rc = el(svg, "rect", { x: cx - bw / 2, y: y(Math.max(a, b)), width: bw, height: Math.max(1, Math.abs(y(a) - y(b))) }, `zl-fl-bar ${cls}`) as SVGElement;
            if (hatch) rc.setAttribute("fill", `url(#${cls.includes("is-mut") ? idm : id})`);
            rc.style.setProperty("--d", `${Math.round(i * beat)}ms`);
        });
    });
    // dates: the first, the middle and the last day
    const marks = s.length > 2 ? [0, Math.floor((s.length - 1) / 2), s.length - 1] : s.map((_, i) => i);
    for (const i of marks) {
        el(svg, "text", { x: i === 0 ? x0 : i === s.length - 1 ? W - 2 : x0 + (i + 0.5) * step, y: H - 5, "text-anchor": i === 0 ? "start" : i === s.length - 1 ? "end" : "middle" }, "zl-ch-xl").textContent = shortDate(s[i].date);
    }
};

// rows kept in place: existing rows change their text, missing ones are added (without a reveal), extra ones removed
const syncFigs = (g: HTMLElement, rows: Row[]): void => {
    const fig = (r: Row) => ({ icon: r.k && isForeignBroker(r.k) ? "person" : "flows", k: r.k ?? "", s: r.s, v: r.v, hot: r.hot, dim: r.dim, onTap: r.onTap });
    const box = g.querySelector<HTMLElement>(".zl-figs");
    if (!box) { figures(g, rows.map(fig)); return; }
    const have = Array.from(box.children) as HTMLElement[];
    rows.forEach((r, i) => {
        if (have[i]) { setRow(have[i], r); have[i].querySelector(".zl-px")?.replaceWith(figures(createDiv(), [fig(r)]).querySelector(".zl-px")!); return; }
        const n = figures(createDiv(), [fig(r)]).firstElementChild as HTMLElement;
        n.removeClass("zl-in");
        box.appendChild(n);
    });
    have.slice(rows.length).forEach((e) => e.remove());
};

// Top brokers (Fubon's 主力進出, owner's pick): the 15 branches that bought most and the 15 that sold most over 1 / 5 / 20
// days; FOREIGN keeps the branches of foreign banks and brokers (mostly foreign money: a hint, not 外資's own report).
// A list page; switches and arriving lists change it in place (the old list waits dimmed while a new one loads).
let BSPAN: BrokerSpan = 20;
export const brokersPage = (ctx: PageCtx, arg: string, trade: (tk: string) => void): PageOut => {
    const [tk, f0] = arg.split(":");
    let foreign = f0 === "foreign";
    const title = t("bTitle", { tk });
    const el = page(title);
    el.addClass("zl-c-list");
    const fab = { icon: "plus", text: t("iTrade").toUpperCase(), label: t("iTrade"), onTap: () => trade(tk) };
    const B = ctx.plugin.brokers, code = Flows.code(ctx.plugin.prices.symbol(tk));
    if (!code) { empty(el, { icon: "flows", title: t("fNone"), text: t("fNoneS") }); return { title, el, fab }; }
    B.ensure(code, BSPAN);
    const any = () => B.get(code, BSPAN) ?? B.get(code, 20) ?? B.get(code, 5) ?? B.get(code, 1);
    if (!any()) {
        empty(el, { icon: "flows", title: B.failedAt(code, BSPAN) ? t("bFailed") : t("bLoading"), text: t("bSource") });
        B.onChange(() => { if (!el.isConnected) return false; if (!any()) { if (B.failedAt(code, BSPAN)) { ctx.redraw(); return false; } return true; } ctx.redraw(); return false; });
        return { title, el, fab };
    }
    let sumEl: HTMLElement | null = null;
    const head = h(el, "div", "zl-c-group zl-fl");
    const seg = (opts: [string, () => boolean, () => void][]) => {
        const box = h(head, "div", "zl-fl-seg" + (opts.length === 3 ? " is-3" : ""));
        const bs = opts.map(([label, on, tap]) => {
            const b = h(box, "button", "zl-fl-segb", label);
            b.addEventListener("click", (e) => { e.preventDefault(); tap(); bs.forEach((x, i) => x.toggleClass("is-on", opts[i][1]())); render(); });
            return b;
        });
        bs.forEach((x, i) => x.toggleClass("is-on", opts[i][1]()));
    };
    seg(([1, 5, 20] as BrokerSpan[]).map((n) => [n === 1 ? t("bDay1").toUpperCase() : t("fDays", { n }).toUpperCase(), () => BSPAN === n, () => { BSPAN = n; B.ensure(code, n); }]));
    seg([[t("bAll").toUpperCase(), () => !foreign, () => { foreign = false; }], [t("bForeign").toUpperCase(), () => foreign, () => { foreign = true; }]]);
    const gb = h(el, "div", "zl-c-group"), secB = h(gb, "div", "zl-sec");
    const gs = h(el, "div", "zl-c-group"), secS = h(gs, "div", "zl-sec");
    const note = h(el, "div", "zl-fl-legend zl-fl-src", t("bSource"));
    const rows = (l: Broker[], none: string): Row[] => {
        const k = foreign ? l.filter((b) => isForeignBroker(b.name)) : l;
        return k.length ? k.map((b) => ({ k: b.name, s: t("bRowS", { b: num(b.b), s: num(b.s), p: (b.pct / 100).toFixed(1) }), v: signed(b.net), hot: b.net < 0 })) : [{ k: none, s: t("bNoneS"), v: "-", dim: true }];
    };
    const render = () => {
        const d: TopBrokers = B.get(code, BSPAN) ?? any()!, wait = !B.get(code, BSPAN);
        const fl = foreign ? [...d.buy, ...d.sell].filter((b) => isForeignBroker(b.name)) : [];
        const net = foreign ? fl.reduce((a, b) => a + b.net, 0) : d.buyTotal - d.sellTotal;
        const span = BSPAN === 1 ? t("bDay1") : t("fDays", { n: BSPAN });
        const items: [string, string, boolean?][] = foreign
            ? [[t("bBuyers"), signed(fl.filter((b) => b.net > 0).reduce((a, b) => a + b.net, 0))], [t("bSellers"), signed(fl.filter((b) => b.net < 0).reduce((a, b) => a + b.net, 0)), true], [t("bBranches"), String(fl.length)]]
            : [[t("bBuyers"), signed(d.buyTotal)], [t("bSellers"), signed(-d.sellTotal), true], [t("bCost"), d.buyCost ? price2(d.buyCost) : "-"]];
        const label = wait ? (B.failedAt(code, BSPAN) ? t("bFailed") : t("bLoading")) : t(foreign ? "bSumF" : "bSum", { span, d: d.asOf ? shortDate(d.asOf) : "-" });
        const g = summary(createDiv(), { key: "brokers", label, value: signed(net), hot: net < 0, items });
        if (sumEl) sumEl.replaceWith(g); else el.insertBefore(g, head);
        sumEl = g;
        secB.setText(t("bBuying").toUpperCase()); secS.setText(t("bSelling").toUpperCase());
        syncFigs(gb, rows(d.buy, t("bNoneForeign")));
        syncFigs(gs, rows(d.sell, t("bNoneForeign")));
        for (const x of [gb, gs, g]) x.toggleClass("is-wait", wait);
        el.appendChild(note);
    };
    render();
    B.onChange((k) => { if (!el.isConnected) return false; if (k === Brokers.key(code, BSPAN)) render(); return true; });
    return { title, el, fab };
};
