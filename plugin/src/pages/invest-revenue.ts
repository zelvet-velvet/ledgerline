// Monthly revenue (Vellum screen "Invest · monthly revenue", owner picked 2026-11-10): a C detail page for a Taiwan stock.
// The latest month with its change on a year before and on the month before, the last 24 months as bars you pick from with a
// strip of each month's change on a year before, then what a long-term holder compares. Data: prices/revenue.ts (FinMind).
import { revStats, revShort, RevStats, ymAdd } from "../calc/revenue";
import { Flows } from "../prices/flows";
import { shortDate } from "../format";
import { t } from "../i18n";
import { h, page } from "../ui";
import { figures, pickBars, sec, summary } from "../ui/c";
import type { PageOut } from "./index";
import { pctS, X } from "./invest-shared";

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthName = (ym: string, year = false) => `${MON[Number(ym.slice(5, 7)) - 1]}${year ? ` ${ym.slice(0, 4)}` : ""}`;
const SEEN = "ledgerline-revenue-seen";   // per code, the newest month opened: NEW until the page has shown it
const seen = (x: X): Record<string, string> => { try { return (x.ctx.app.loadLocalStorage(SEEN) as Record<string, string>) ?? {}; } catch { return {}; } };

export const revCode = (x: X, tk: string): string | null => Flows.code(x.ctx.plugin.prices.symbol(tk));
const statsOf = (x: X, code: string): RevStats | null => revStats(x.ctx.plugin.revenue.get(code));

// the REVENUE tile on a Taiwan stock's chart page: last month against a year before, NEW until the page is opened
export const revenueTile = (x: X, tk: string) => {
    const code = revCode(x, tk);
    if (!code || /^00\d/.test(code)) return null;   // ETFs report no revenue
    const rv = x.ctx.plugin.revenue;
    rv.ensure(code);
    const val = () => { const s = statsOf(x, code); return s ? { v: s.yoy === null ? revShort(s.latest.v) : pctS(s.yoy), s: `${monthName(s.latest.ym).toUpperCase()} · ${t("rvYoy")}`, n: s.yoy ?? 0, fresh: seen(x)[code] !== s.latest.ym } : { v: "-", s: "", n: 0, fresh: false }; };
    const v0 = val();
    const paint = (b: HTMLElement) => {
        const v = val();
        b.querySelector(".zl-tg-v")?.setText(v.v);
        (b.querySelector(".zl-tg-s") ?? b.createSpan({ cls: "zl-tg-s" })).setText(v.s);
        b.toggleClass("is-up", v.n > 0); b.toggleClass("is-hot", v.n < 0); b.toggleClass("is-dim", v.v === "-"); b.toggleClass("is-new", v.fresh);
    };
    return {
        k: t("rvTile"), icon: "receipt", v: v0.v, s: v0.s, dim: v0.v === "-", onTap: () => x.ctx.push({ key: "revenue:" + tk, title: t("rvTitle", { tk }) }),
        ref: (b: HTMLElement) => { b.addClass("is-mkt"); paint(b); rv.onChange((c) => { if (!b.isConnected) return false; if (c === code) paint(b); return true; }); },
    };
};

export const revenuePage = (x: X, tk: string): PageOut => {
    const title = t("rvTitle", { tk });
    const el = page(title);
    el.addClass("zl-c-stack");
    const code = revCode(x, tk), rv = x.ctx.plugin.revenue;
    if (code) rv.ensure(code);
    const s = code ? statsOf(x, code) : null;
    if (!code || !s) {
        summary(el, { key: "rev-" + tk, label: t("rvNone"), value: "-", dim: true });
        h(el, "div", "zl-field-note", t("rvNoneS"));
        if (code) rv.onChange((c) => { if (!el.isConnected) return false; if (c === code) x.ctx.redraw(); return true; });
        return { title, el };
    }
    // opened: the newest month is not NEW any more
    try { x.ctx.app.saveLocalStorage(SEEN, { ...seen(x), [code]: s.latest.ym }); } catch { /* ignore */ }
    const tone = (n: number | null) => (n === null ? "-" : pctS(n));
    const top = summary(el, {
        key: "rev-" + tk, label: t("rvMonth", { m: monthName(s.latest.ym) }), value: revShort(s.latest.v),
        items: [[t("rvVs", { m: monthName(ymAdd(s.latest.ym, -12), true) }), tone(s.yoy), (s.yoy ?? 0) < 0], [t("rvVs", { m: monthName(ymAdd(s.latest.ym, -1)) }), tone(s.mom), (s.mom ?? 0) < 0]],
    });
    top.querySelectorAll(".zl-sum-v").forEach((v) => v.toggleClass("is-up", /^\+/.test(v.textContent ?? "")));
    // the 24 months: a tap or drag picks one, the line above the bars shows its numbers
    const g = h(el, "div", "zl-c-group zl-c-fill zl-rev");
    sec(g, t("rvBars", { n: s.months.length }));
    const line = h(g, "div", "zl-rev-pick");
    const show = (i: number) => { const m = s.months[i]; line.setText(`${monthName(m.ym, true).toUpperCase()} · ${revShort(m.v)} · ${t("rvYoy")} ${tone(m.yoy)}`); };
    show(s.months.length - 1);
    pickBars(g, { vals: s.months.map((m) => m.v), strip: s.months.map((m) => m.yoy), labels: s.months.map((m, i) => (i % 3 === 2 ? monthName(m.ym)[0] : "")), pick: s.months.length - 1, onPick: show });
    const f = h(el, "div", "zl-c-group");
    sec(f, t("rvCompared"));
    const last3 = s.months.slice(-3);
    figures(f, [
        { icon: "clock", k: t("rvLast3"), s: last3.length === 3 ? `${monthName(last3[0].ym)}–${monthName(last3[2].ym)} ${t("rvYearAgo")}` : "", v: tone(s.last3), hot: (s.last3 ?? 0) < 0 },
        { icon: "list", k: t("rvYtd"), s: t("rvYtdS", { m: monthName(s.latest.ym), y: String(Number(s.latest.ym.slice(0, 4)) - 1) }), v: tone(s.ytd), hot: (s.ytd ?? 0) < 0 },
        { icon: "up", k: t("rvBest", { n: s.months.length }), s: monthName(s.best.ym, true), v: revShort(s.best.v) },
        { icon: "clock", k: t("rvNext"), s: t("rvNextS", { m: monthName(ymAdd(s.latest.ym, 1)) }), v: shortDate(s.nextOut).toUpperCase(), onTap: () => x.ctx.push({ key: "alerts", title: t("alTitle") }) },
    ]);
    f.querySelectorAll(".zl-fig-v").forEach((v, i) => { if (i < 2) v.toggleClass("is-up", /^\+/.test(v.textContent ?? "")); });
    h(el, "div", "zl-field-note zl-rev-src", t("rvSrc"));
    return { title, el, still: true };
};
