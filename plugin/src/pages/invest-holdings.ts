// Invest HOLDINGS page
import { Position } from "../calc/invest";
import { num, today } from "../format";
import { t } from "../i18n";
import { h, page } from "../ui";
import { summary } from "../ui/c";
import type { PageOut } from "./index";
import { signed, pctS, qty, X, findAct, Chg, chgEl, todayOf, atNow, lastOf } from "./invest-shared";

// C list: every holding: ticker and shares on the left, the change (a tap cycles it) above what it is worth now on the right;
// sold-out positions after them, dim
export const holdingsPage = (x: X): PageOut => {
    const { ctx, P } = x;
    const title = t("iHoldingsT");
    const el = page(title);
    el.addClass("zl-c-list");
    summary(el, { label: t("iWorth"), value: num(P.value), items: [[t("iCost"), num(P.cost)], [t("iPL"), signed(P.pl), P.pl < 0], [t("iRealized"), signed(P.realized), P.realized < 0]] });
    const g = h(el, "div", "zl-c-group");
    hrows(x, g, P.positions);
    return { title, el, actions: [findAct(x, el)], fab: { icon: "plus", text: t("iTrade").toUpperCase(), label: t("iTrade"), onTap: () => x.trade() } };
};

// Holdings rows (owner picked Layouts row B, 2026-11-05): three columns like a broker's list, ticker / shares, last price /
// today's % (up / down colour), value / your return (light split-flap tiles). Both moves always show, so no swipe; a new
// quote changes the row in place. Sold-out positions last, dim.
export const retOf = (x: X, tk: string, p: Position): Chg => {
    const pr = x.ctx.plugin.prices, ok = p.price !== null;
    return { t: [ok ? pctS(p.cost > 0 ? (p.pl / p.cost) * 100 : 0) : "-"], hot: [p.pl < 0], k: [""], ret: [true], tk, re: () => retOf(x, tk, atNow(pr, tk, p)) };
};
export const hrows = (x: X, parent: HTMLElement, ps: Position[]): void => {
    const pr = x.ctx.plugin.prices;
    const box = h(parent, "div", "zl-figs zl-hrows");
    ps.forEach((p, i) => {
        const on = p.shares > 0;
        const b = h(box, "button", "zl-fig zl-hrow zl-in" + (on ? "" : " is-dim"));
        b.style.setProperty("--i", String(i));
        b.dataset.k = p.ticker;   // a live redraw keeps the row still (owner, 2026-11-05: Holdings rows blinked on every price)
        h(b, "span", "zl-hrow-k", p.ticker);
        const price = h(b, "span", "zl-hrow-p", on ? lastOf(x, p.ticker) : "");
        const value = h(b, "span", "zl-hrow-v", num(p.value));
        h(b, "span", "zl-hrow-s", on ? t("iSharesN", { n: qty(p.shares) }) : t("iClosed"));
        const today = h(b, "span", "zl-hrow-d");
        const paint = () => { const d = on ? todayOf(pr, p.ticker) : null; today.setText(d ? pctS(d.pct) : on ? "-" : ""); today.toggleClass("is-hot", !!d && d.ch < 0); today.toggleClass("is-up", !!d && d.ch > 0); };
        paint();
        if (on) chgEl(x, b, retOf(x, p.ticker, p), "zl-hrow-r", `holdings|${p.ticker}`); else h(b, "span", "zl-hrow-r");
        b.addEventListener("click", (e) => { e.preventDefault(); x.ctx.push({ key: "asset:" + p.ticker, title: p.ticker }); });
        if (!on) return;
        const sym = pr.symbol(p.ticker);
        pr.onQuote((s) => {
            if (!b.isConnected) return false;
            if (s !== sym) return true;
            price.setText(lastOf(x, p.ticker));
            value.setText(num(atNow(pr, p.ticker, p).value));
            paint();
            return true;
        });
    });
};
