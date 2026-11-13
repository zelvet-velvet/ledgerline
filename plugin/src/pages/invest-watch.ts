// Invest WATCHLIST page (Taiwan / US tabs, sort, drag to reorder) and the list rows it shares
import { t } from "../i18n";
import { empty, h, page } from "../ui";
import { figures } from "../ui/c";
import { isTwSym } from "../calc/quotes";
import { sprite } from "../ui/pixel";
import type { PageOut } from "./index";
import { X, findAct, Chg, CHG, alignChg, chgEl, swipeChg, todayOf, chgOf, lastOf, openKey } from "./invest-shared";

// list rows with the change above the value: ticker and a sub line left, change and value right
export const qrows = (x: X, parent: HTMLElement, list: string, rows: { icon: string; k: string; s: string; v: string; chg: Chg | null; dim?: boolean; onTap: () => void }[], move?: (order: string[]) => void): void => {
    const box = h(parent, "div", "zl-figs zl-qrows");
    const els: HTMLElement[] = [];
    rows.forEach((r, i) => {
        const b = h(box, "button", "zl-fig zl-qrow zl-in" + (r.dim ? " is-dim" : ""));
        b.style.setProperty("--i", String(i));
        b.dataset.k = r.k;
        // the owner's row (Layouts, Invest · Ticker row, zoomed, 2026-11-04): the ticker big on the left, shares / name beside it
        // on the same level, the change as a small split-flap top right (it flips when the price moves) with the value under it
        const ic = sprite(b, move ? "grip" : r.icon, "zl-px zl-fig-ic");
        if (move) { els.push(b); dragRow(box, b, ic as unknown as HTMLElement, els, () => move(els.map((e) => e.dataset.k ?? ""))); }
        h(b, "span", "zl-qrow-k", r.k);
        h(b, "span", "zl-qrow-v", r.v);
        h(b, "span", "zl-qrow-s", r.s || "\u00a0");
        if (r.chg) chgEl(x, b, r.chg, "zl-qrow-c", `${list}|${r.k}`); else h(b, "span", "zl-qrow-c is-none");
        sprite(b, "back", "zl-px zl-fig-go");
        b.addEventListener("click", (e) => { e.preventDefault(); r.onTap(); });
        if (r.chg) swipeChg(x, b);
    });
    alignChg(x, box);
};

// MANUAL watchlist (owner, 2026-11-05): a row is dragged by its grip (the icon's place) like the tab order in Settings; the
// others slide aside, the rows settle in place on the drop and the new order is written to the note
export const dragRow = (box: HTMLElement, row: HTMLElement, grip: HTMLElement, els: HTMLElement[], done: () => void): void => {
    grip.addClass("zl-qrow-grip");
    let pressed = false;
    // the grip's touches are the drag's: no Today-change swipe, no row tap
    grip.addEventListener("touchstart", (e) => e.stopPropagation(), { passive: true });
    grip.addEventListener("touchmove", (e) => e.stopPropagation(), { passive: true });
    row.addEventListener("click", (e) => { if (pressed) { e.preventDefault(); e.stopImmediatePropagation(); pressed = false; } }, true);
    grip.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        pressed = true;
        grip.setPointerCapture(e.pointerId);
        const from = els.indexOf(row), y0 = e.clientY, ht = row.offsetHeight || 1;
        let to = from;
        box.addClass("is-reorder");
        row.addClass("is-dragging");
        const mv = (m: PointerEvent) => {
            const dy = m.clientY - y0;
            row.style.transform = `translateY(${dy}px)`;
            to = Math.max(0, Math.min(els.length - 1, from + Math.round(dy / ht)));
            els.forEach((r, j) => {
                if (j === from) return;
                const shift = from < to && j > from && j <= to ? -ht : from > to && j < from && j >= to ? ht : 0;
                r.style.transform = shift ? `translateY(${shift}px)` : "";
            });
        };
        const up = () => {
            grip.removeEventListener("pointermove", mv);
            grip.removeEventListener("pointerup", up);
            grip.removeEventListener("pointercancel", up);
            box.addClass("is-settling");
            els.forEach((r) => { r.style.transform = ""; r.removeClass("is-dragging"); });
            box.removeClass("is-reorder");
            window.requestAnimationFrame(() => box.removeClass("is-settling"));
            window.setTimeout(() => { pressed = false; }, 400);
            if (to === from || !row.isConnected) return;
            const [r] = els.splice(from, 1);
            els.splice(to, 0, r);
            const next = els[to + 1];
            if (next) next.before(r); else els[to - 1].after(r);
            done();
        };
        grip.addEventListener("pointermove", mv);
        grip.addEventListener("pointerup", up);
        grip.addEventListener("pointercancel", up);
    });
};

// C list: watched tickers: ticker and its name left, the change (a tap cycles it) above the last price right; a tap opens
// the ticker's chart (stop watching is there)
export const WSORT_KEY = "ledgerline-watch-sort", WMKT_KEY = "ledgerline-watch-market";
// sort (owner, 2026-11-05): MANUAL (the note's order) / CHG % / NAME; a tap on the chosen one turns the order round.
// First tap: manual and name ascending, CHG % descending (biggest rise first); tickers with no quote stay last either way
export type WSortBy = "manual" | "pct" | "name";
export interface WSort { by: WSortBy; desc: boolean }
export let WSORT: WSort | null = null, WMKT: "tw" | "us" | null = null, SHOWN_MKT: "tw" | "us" | null = null;
export const watchSort = (x: X): WSort => {
    if (!WSORT) {
        const [k, d] = (x.ctx.app.loadLocalStorage(WSORT_KEY) as string | null ?? "").split(":");
        const by: WSortBy = k === "pct" ? "pct" : k === "name" || k === "az" ? "name" : "manual";
        WSORT = { by, desc: d ? d === "desc" : by === "pct" };
    }
    return WSORT;
};
export const setWatchSort = (x: X, by: WSortBy): void => {
    const cur = watchSort(x);
    WSORT = cur.by === by ? { by, desc: !cur.desc } : { by, desc: by === "pct" };
    x.ctx.app.saveLocalStorage(WSORT_KEY, `${WSORT.by}:${WSORT.desc ? "desc" : "asc"}`);
};
// the watchlist in Taiwan / US groups (empty ones left out), each in the chosen sort: the Watchlist page and the search page
export const watchMarkets = (x: X): { tw: string[]; us: string[] } => {
    const pr = x.ctx.plugin.prices, sort = watchSort(x), W = x.P.watch, dir = sort.desc ? -1 : 1;
    const pct = (tk: string) => todayOf(pr, tk)?.pct;
    const sorted = (l: string[]): string[] => {
        if (sort.by === "manual") return sort.desc ? [...l].reverse() : l;
        if (sort.by === "name") return [...l].sort((a, b) => dir * a.localeCompare(b));
        const has = l.filter((tk) => pct(tk) !== undefined), none = l.filter((tk) => pct(tk) === undefined);
        return [...has.sort((a, b) => dir * ((pct(a) as number) - (pct(b) as number))), ...none];
    };
    const tw = W.filter((tk) => isTwSym(pr.symbol(tk)));
    return { tw: sorted(tw), us: sorted(W.filter((tk) => !tw.includes(tk))) };
};
export const watchPage = (x: X): PageOut => {
    const { ctx, P } = x;
    const title = t("iWatch");
    const el = page(title);
    el.addClass("zl-c-list");
    const g = h(el, "div", "zl-c-group");
    if (!P.watch.length) figures(g, [{ k: t("iWatchNone").toUpperCase(), v: "-", dim: true }]);
    else {
        // Taiwan and US on their own tabs (owner, 2026-11-05: the two sections sat too close), the tab remembered on the
        // device; first visit: the first market with tickers
        const m = watchMarkets(x);
        if (!WMKT) { const v = ctx.app.loadLocalStorage(WMKT_KEY); WMKT = v === "us" || v === "tw" ? v : m.tw.length || !m.us.length ? "tw" : "us"; }
        const mkt = WMKT;
        // the tabs and the sort are the page's top: on a turned phone they sit in the left column, the rows on the right
        const top = h(el, "div", "zl-c-group zl-c-top zl-wtop");
        el.insertBefore(top, g);
        const tabs = h(top, "div", "zl-fl-seg zl-wmkt");
        ([["tw", t("iMktTw")], ["us", t("iMktUs")]] as const).forEach(([k, label]) => {
            const b = h(tabs, "button", "zl-fl-segb" + (mkt === k ? " is-on" : ""), label.toUpperCase());
            b.addEventListener("click", (e) => { e.preventDefault(); if (WMKT === k) return; WMKT = k; ctx.app.saveLocalStorage(WMKT_KEY, k); ctx.redraw(); });
        });
        const sort = watchSort(x);
        // the sort as a quiet line of words under the tabs (owner, 2026-11-05: a second segment bar looked like more tabs)
        const seg = h(top, "div", "zl-wsort");
        h(seg, "span", "zl-wsort-l", t("iSort").toUpperCase());
        ([["manual", t("iSortManual")], ["pct", t("iSortPct")], ["name", t("iSortName")]] as const).forEach(([k, label]) => {
            const on = sort.by === k, b = h(seg, "button", "zl-wsort-b" + (on ? " is-on" : ""), label.toUpperCase());
            if (on) sprite(b, sort.desc ? "down" : "up", "zl-px zl-wsort-dir");
            b.setAttribute("aria-label", on ? `${label}, ${sort.desc ? t("iSortDesc") : t("iSortAsc")}` : label);
            b.addEventListener("click", (e) => { e.preventDefault(); setWatchSort(x, k); ctx.redraw(); });
        });
        const l = mkt === "tw" ? m.tw : m.us;
        // a market switch swaps the list at once (owner, 2026-11-05: the rows blinked in): the other market's rows are not
        // new, so they come in as kept rows (zl-kept, no reveal); only a ticker added to the note reveals
        const swapped = SHOWN_MKT !== null && SHOWN_MKT !== mkt;
        SHOWN_MKT = mkt;
        if (!l.length) figures(g, [{ k: t("iWatchNone").toUpperCase(), v: "-", dim: true }]);
        // MANUAL: drag a row by its grip to set the order (reversed MANUAL is written back the right way round)
        else qrows(x, g, "watch", l.map((tk) => ({ icon: "eye", k: tk, s: ctx.plugin.search.nameOf(tk), chg: chgOf(x, tk), v: lastOf(x, tk), onTap: () => ctx.push(openKey(x, tk)) })),
            sort.by === "manual" && l.length > 1 ? (order) => { void x.moveWatch(sort.desc ? [...order].reverse() : order); } : undefined);
        if (swapped) g.querySelectorAll(".zl-in").forEach((r) => { r.removeClass("zl-in"); r.addClass("zl-kept"); });
    }
    return { title, el, actions: [findAct(x, el)], fab: { icon: "plus", text: t("iWatchAdd").toUpperCase(), label: t("iWatchAdd"), onTap: x.addWatch } };
};
