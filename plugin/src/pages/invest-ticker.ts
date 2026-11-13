// Invest chart pages: a holding (asset), any ticker, a holding's trades and journal
import { journalPath, minorOf, nextDca, Position, Trade } from "../calc/invest";
import { num, shortDate, today } from "../format";
import { t } from "../i18n";
import { empty, h, page } from "../ui";
import { figures, sec, summary, tileGrid } from "../ui/c";
import { holdingChart, liveOf, price2, shownTime } from "../ui/chart";
import { Flap } from "../ui/flap";
import { Drawing, readPrefs } from "../calc/chart";
import { DrawingsSheet } from "./drawings";
import { flowModes, sectorLine } from "./invest-flow";
import { flowCodes, flowsTile } from "./flows";
import type { PageOut } from "./index";
import { signed, pctS, qty, X, todayOf, atNow, flowTickers, guessCur } from "./invest-shared";
import { buyCheck, thesisCard, thesisLine } from "./invest-thesis";
import { revenueTile } from "./invest-revenue";

// TRADE on a chart page: the rules check first (a buy), then the trade sheet
const tradeFab = (x: X, tk: string) => ({ icon: "plus", text: t("iTrade").toUpperCase(), label: t("iTrade"), onTap: () => buyCheck(x, tk, (o) => x.trade(tk, o)) });

export const LAST = new Map<string, Flap>();   // the last price split-flap per ticker: a new price flips from the old one

// S7: when the prices are from: "13:30" today, else "Nov 3 13:30"
export const asOfText = (ms: number | null): string => {
    if (!ms) return "";
    const d = new Date(ms), hm = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return t("iAsOf", { t: day === today() ? hm : `${shortDate(day)} ${hm}` });
};

// One-screen chart page (owner, 2026-11-04: nothing much below the fold): last price, the chart taking the room left, one
// strip with what you hold, then tiles to the rest (法人 flows, trades, plan, journal)
export const assetPage = (x: X, p: Position): PageOut => {
    const { ctx } = x;
    const el = page(p.ticker);
    el.addClass("zl-c-stack");
    const costP = p.q > 0 ? Math.round((p.avg / x.fx(p.currency)) * 100) : null;   // cost per share in the asset's own currency
    chartBlock(x, el, p.ticker, p.currency, costP);
    thesisCard(x, el, p.ticker);
    const hold = h(el, "div", "zl-c-group zl-hold");
    const items: [string, string, boolean][] = [
        [t("iYouHold"), qty(p.shares), false],
        [t("iAvgCost"), costP !== null ? price2(costP) : "-", false],
        [p.price !== null ? `${t("iValueNow")} ${pctS(p.cost > 0 ? (p.pl / p.cost) * 100 : 0)}` : t("iValueNow"), num(p.value), p.pl < 0],
    ];
    const r = h(hold, "div", "zl-sum-items");
    const vals = items.map(([k, v, hot]) => { const it = h(r, "div"); return [h(it, "span", "zl-sum-k", k.toUpperCase()), h(it, "span", "zl-sum-v" + (hot ? " is-hot" : ""), v)]; });
    // VALUE NOW ±% follows each new quote in place (the page is not redrawn while it is open)
    const pr = ctx.plugin.prices, sym = pr.symbol(p.ticker);
    pr.onQuote((s) => {
        if (!el.isConnected) return false;
        if (s !== sym) return true;
        const q = atNow(pr, p.ticker, p);
        if (q.price === null) return true;
        vals[2][0].setText(`${t("iValueNow")} ${pctS(q.cost > 0 ? (q.pl / q.cost) * 100 : 0)}`.toUpperCase());
        vals[2][1].setText(num(q.value));
        vals[2][1].toggleClass("is-hot", q.pl < 0); vals[2][1].toggleClass("is-up", q.pl > 0);
        return true;
    });
    const next = nextDca(p.dca, today()), thoughts = x.journal(p.ticker);
    const off = p.trades.some((tr) => { const l = x.links.get(tr.id); return !!l && !!l.diff; }) || p.trades.some((tr) => !x.links.get(tr.id));
    const tiles = [
        flowsTile(ctx, p.ticker, flowCodes(ctx, flowTickers(x.P))),
        revenueTile(x, p.ticker),
        { k: t("iTrades"), icon: "list", v: String(p.trades.length), hot: off, onTap: () => ctx.push({ key: "trades:" + p.ticker, title: t("iTrades") }) },
        { k: t("iPlanT"), icon: "calendar", v: next ? shortDate(next) : "-", dim: !p.dca, onTap: () => x.editPlan(p) },
        { k: t("iJournal"), icon: "receipt", v: String(thoughts.length), dim: !thoughts.length, onTap: () => ctx.push({ key: "journal:" + p.ticker, title: t("iJournal") }) },
    ].filter((v): v is NonNullable<typeof v> => !!v);
    tileGrid(h(el, "div", "zl-c-group"), tiles);
    return { title: p.ticker, el, still: true, actions: [drawAct(x, p.ticker)], fab: tradeFab(x, p.ticker) };
};

// C list: one holding's trades, newest first (the list grows: it may scroll), with realized profit and fees in the summary
export const tradesPage = (x: X, p: Position): PageOut => {
    const title = t("iTrades");
    const el = page(title);
    el.addClass("zl-c-list");
    summary(el, { key: "trades-" + p.ticker, label: `${p.ticker} · ${t("iRealized")}`, value: signed(p.realized), hot: p.realized < 0, items: [[t("iFees"), num(p.fees)], [t("iTrades"), String(p.trades.length)]] });
    const g = h(el, "div", "zl-c-group");
    // S2: a trade whose Accounts entries do not add up to it says so (not booked at all, or off by how much)
    const gap = (tr: Trade): string => { const l = x.links.get(tr.id); return !l || !l.diff ? "" : ` · ${l.booked ? t("iBooksOff", { n: num(l.diff) }) : t("iNotBooked")}`; };
    figures(g, [...p.trades].sort((a, b) => b.date.localeCompare(a.date) || b.index - a.index).map((tr) => ({
        icon: tr.type === "SELL" ? "up" : "down", k: `${tr.type === "SELL" ? t("iSell") : t("iBuy")} ${qty(tr.shares)}`.toUpperCase(), s: `${tr.date ? shortDate(tr.date) : t("noDate")} · @ ${tr.price.toLocaleString()} ${p.currency}${tr.fee + tr.tax ? ` · ${t("iFeeN", { n: ((tr.fee + tr.tax) / minorOf(p.currency)).toLocaleString() })}` : ""}${tr.pending ? ` · ${t("iPending")}` : ""}${gap(tr)}`,
        v: num(Math.abs(tr.cash)), hot: !!gap(tr), onTap: () => x.editTrade(p, tr),
    })));
    return { title, el, fab: { icon: "plus", text: t("iTrade").toUpperCase(), label: t("iTrade"), onTap: () => x.trade(p.ticker) } };
};

// chart page (approved mock K): last price with today's change, then the chart. The drawing belongs to the open page (its
// frame: kept through redraws, gone once the page is left; owner, 2026-11-04); chart settings come from the ticker's note
// (Invest/<ticker>.md, beside its journal) and are changed in its settings sheet.
export const DRAWN = new WeakMap<object, Drawing[]>();
export const chartBlock = (x: X, el: HTMLElement, tk: string, currency: string, cost: number | null): void => {
    const { ctx } = x;
    // today's change always from the day bars (whatever interval the chart shows)
    const prices = ctx.plugin.prices, q = prices.get(tk), bars = prices.series(tk, "D")?.bars, live = liveOf(prices, tk);
    prices.refreshSeries(tk, "D");
    const lastP = live?.price ?? bars?.c[bars.c.length - 1] ?? null;
    const td = todayOf(prices, tk), ch = td?.ch ?? null;
    const top = h(el, "div", "zl-c-group zl-c-top zl-lastp");
    const lt = h(top, "div", "zl-lastp-l");
    // CURRENT PRICE while its market trades (prices.isOpen: clock + market calendar; before the open TWSE's fresh quote is
    // only yesterday's close), else LAST PRICE
    const isOpen = () => prices.isOpen(tk);
    // where the price is from, at the market's time (FUGLE · 11:43:53): its own line above the chart (owner, 2026-11-05: it
    // was cut beside the label)
    const kText = () => t(isOpen() ? "iNowPrice" : "iLastPrice");
    const srcText = () => { const q2 = prices.get(tk), a = q2?.asOf; const tm = a ? shownTime(prices.symbol(tk), a) : ""; return q2?.source ? `${q2.source.toUpperCase()}${tm ? ` · ${tm}` : ""}` : "\u00a0"; };
    const kEl = h(lt, "div", "zl-lastp-k", kText());
    h(lt, "div", "zl-lastp-s" + (ch !== null && ch < 0 ? " is-hot" : ch !== null && ch > 0 ? " is-up" : ""), !td ? asOfText(q?.asOf ?? null) : t("iToday", { n: `${td.ch > 0 ? "+" : td.ch < 0 ? "\u2212" : ""}${price2(Math.abs(td.ch))}`, p: pctS(td.pct) }));
    let f = LAST.get(tk);
    if (!f) { f = new Flap("md"); LAST.set(tk, f); }
    top.appendChild(f.el);
    // no price yet (a first look at a ticker; owner, 2026-11-05: the top sat empty while it loaded): dark blank tiles with a
    // light running across them, the lines under the label dim bars; the first quote flips the tiles to the price
    let loading = lastP === null;
    f.set(lastP !== null ? price2(lastP) : "\u00a0".repeat(6));
    const flap = f, todayEl = lt.lastElementChild as HTMLElement;
    sectorLine(x, lt, tk);   // 半導體 +1.20% · TAIEX +0.85% · REL +0.35% (Taiwan stocks)
    const loaded = (text: string) => { if (!loading) return; loading = false; top.removeClass("is-loading"); flap.set(text); };
    if (loading) {
        top.addClass("is-loading");
        // nothing after 15 s (no source has it): the dash, as before
        window.setTimeout(() => loaded("-"), 15000);
    }
    // live: a quote every 5 s while this page is on screen and its market trades (the exchanges publish about every 5 s;
    // faster only repeats the same number and risks being turned away), every 60 s while it is shut. The split-flap
    // and today's change update in place; the chart redraws itself.
    prices.onQuote((sym) => {
        if (!el.isConnected) return false;
        if (sym !== prices.symbol(tk)) return true;
        const lv = liveOf(prices, tk);
        if (!lv) return true;
        if (loading) loaded(price2(lv.price)); else flap.set(price2(lv.price));
        kEl.setText(kText()); srcEl.setText(srcText());
        const d = todayOf(prices, tk);
        if (d) { todayEl.setText(t("iToday", { n: `${d.ch > 0 ? "+" : d.ch < 0 ? "\u2212" : ""}${price2(Math.abs(d.ch))}`, p: pctS(d.pct) })); todayEl.toggleClass("is-hot", d.ch < 0); todayEl.toggleClass("is-up", d.ch > 0); }
        return true;
    });
    // with a Fugle key, Taiwan tickers stream their trades instead (polling stops while the stream is up)
    prices.watch(tk);
    let tick = 0;
    const poll = window.setInterval(() => {
        if (!el.isConnected) { window.clearInterval(poll); prices.unwatch(tk); return; }
        if (document.hidden || (!prices.isOpen(tk) && tick++ % 12)) return;
        void prices.live(tk);
    }, 5000);
    const cg = h(el, "div", "zl-c-group zl-c-fill zl-chartg");
    const srcRow = h(cg, "div", "zl-flow-top");
    const srcEl = h(srcRow, "div", "zl-ch-src", srcText());
    const memo = DRAWN.get(ctx.frame) ?? [];
    DRAWN.set(ctx.frame, memo);
    const cv = holdingChart(cg, { ticker: tk, currency, prices, prefs: readPrefs(ctx.plugin.store.fm(journalPath(tk))), cost, memo, height: 0, onLeave: () => ctx.pop(), fullLine: thesisLine(x, tk) });
    flowModes(x, srcRow, cg, tk, cv.el);   // Taiwan stocks: CANDLE · FOOTPRINT · VOLUME HEAT
};
// CHART (masthead): the settings sheet (Fib levels, snap, cost line, MA), kept in the ticker's note
export const drawAct = (x: X, tk: string) => ({ text: t("iChartSet"), label: t("dTitle", { tk }), onTap: () => new DrawingsSheet(x.ctx.app, x.ctx.plugin.store, tk, () => x.addThought(tk)).open() });

// C detail: any ticker's chart (watchlist rows, the scope): the chart, then watch / stop watching
export const tickerPage = (x: X, tk: string): PageOut => {
    const { ctx, P } = x;
    const prices = ctx.plugin.prices;
    prices.refresh([prices.symbol(tk)]);
    const el = page(tk);
    el.addClass("zl-c-stack");
    const watched = P.watch.includes(tk);
    chartBlock(x, el, tk, guessCur(prices.symbol(tk)), null);
    thesisCard(x, el, tk);
    const tiles = [
        watched
            ? { k: "", icon: "eye", v: t("iWatching").toUpperCase(), onTap: () => { void x.dropWatch(tk); } }
            : { k: t("iWatch"), icon: "plus", v: t("iWatchAdd"), onTap: () => { void x.watchOn(tk); } },
        flowsTile(ctx, tk, flowCodes(ctx, flowTickers(P))),
        revenueTile(x, tk),
    ].filter((v): v is NonNullable<typeof v> => !!v);
    tileGrid(h(el, "div", "zl-c-group"), tiles);
    return { title: tk, el, still: true, actions: [drawAct(x, tk)], fab: tradeFab(x, tk) };
};

// S4 C list: the holding's journal, newest first (each trade's "why" and loose thoughts); the last row opens the note itself
export const journalPage = (x: X, tk: string): PageOut => {
    const { ctx } = x;
    const title = t("iJournal");
    const el = page(title);
    el.addClass("zl-c-list");
    const g = h(el, "div", "zl-c-group");
    sec(g, tk);
    const js = x.journal(tk);
    figures(g, [
        ...(js.length ? js.map((j) => ({ icon: j.trade ? "invest" : "list", k: j.date ? shortDate(j.date).toUpperCase() : t("noDate").toUpperCase(), s: j.why, v: "" })) : [{ k: t("iJournalNone").toUpperCase(), v: "-", dim: true }]),
        ...(ctx.plugin.store.file(journalPath(tk)) ? [{ icon: "receipt", k: t("iOpenNote").toUpperCase(), v: "", onTap: () => { void ctx.plugin.openPath(journalPath(tk)); } }] : []),
    ]);
    return { title, el, fab: { icon: "plus", text: t("iThought").toUpperCase(), label: t("iThought"), onTap: () => x.addThought(tk) } };
};
