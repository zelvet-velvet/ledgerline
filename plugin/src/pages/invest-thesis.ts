// Long-term tools on the chart page (owner picked 2026-11-10, Vellum screens "Invest · chart page with thesis" and
// "Invest · rules check before a buy"): the THESIS card (why, next check, sell if, vs 0050), its edit sheet, the one-line
// thesis on the full chart, and the rules check a buy opens first (informs, never blocks).
import { FILES, type FM } from "../data/store";
import { journalPath } from "../calc/invest";
import { buyRules, checkState, daysBetween, readThesis, satVsBench, emergencyMinOf, RuleRow, Thesis, vsBench } from "../calc/thesis";
import { buildAccounts } from "../calc/accounts";
import { num, parseNum, shortDate, today } from "../format";
import { t } from "../i18n";
import { h } from "../ui";
import { sprite } from "../ui/pixel";
import { price2 } from "../ui/chart";
import { FormSheet } from "../ui/sheet";
import { Modal } from "obsidian";
import { base } from "../ui/sheet";
import { ACCOUNTS_FILE } from "./accounts";
import { pctS, X } from "./invest-shared";

export const BENCH = "0050";
const list = (v: unknown): FM[] => (Array.isArray(v) ? v : v ? [v] : []) as FM[];
export const thesisOf = (x: X, tk: string): Thesis | null => readThesis(x.ctx.plugin.store.fm(journalPath(tk)));

// the ticker against 0050 since it was watched (or the thesis written); the day bars load in the background
const vs0050 = (x: X, tk: string, since: string): { diff: number; from: string } | null => {
    const pr = x.ctx.plugin.prices;
    pr.refreshSeries(tk, "D"); pr.refreshSeries(BENCH, "D");
    return tk === BENCH ? null : vsBench(pr.series(tk, "D")?.bars, pr.series(BENCH, "D")?.bars, since);
};

// the edit sheet: four short fields (kit K), kept in Invest/<ticker>.md as `thesis`; the first save also sets `since`
export const editThesis = (x: X, tk: string, then?: () => void): void => {
    const th = thesisOf(x, tk), store = x.ctx.plugin.store;
    new FormSheet(x.ctx.app, {
        title: t("thTitle"), subtitle: tk, submitText: t("save"),
        fields: [
            { key: "why", label: t("thWhy"), type: "text", value: th?.why ?? "", required: true, placeholder: t("thWhyPh") },
            { key: "check", label: t("thCheck"), type: "date", value: th?.check || "", required: false, note: () => t("thCheckNote") },
            { key: "hold", label: t("thHold"), type: "text", value: th?.hold ?? "", required: false, placeholder: t("thHoldPh") },
            { key: "sell", label: t("thSell"), type: "text", value: th?.sell ?? "", required: false, placeholder: t("thSellPh") },
        ],
        onSubmit: async (v) => {
            await store.update(journalPath(tk), (f) => {
                f.ticker = tk;
                const old = (f.thesis ?? {}) as FM;
                f.thesis = { why: v.why.trim(), check: v.check || "", hold: (v.hold ?? "").trim(), sell: (v.sell ?? "").trim(), since: old.since || today() };
            });
            then?.();
        },
    }).open();
};

// on or after the check day: DID IT HOLD? YES / NO goes into the journal, then the sheet asks for the next check
const answer = async (x: X, tk: string, th: Thesis, held: boolean) => {
    await x.ctx.plugin.store.update(journalPath(tk), (f) => {
        f.ticker = tk;
        f.journal = [...list(f.journal), { date: today(), why: t(held ? "thHeldJ" : "thNotHeldJ", { d: shortDate(th.check), what: th.hold || th.why }) }];
    });
    editThesis(x, tk);
};

// the THESIS card above the tiles; with none written, one loud line opens the sheet
export const thesisCard = (x: X, parent: HTMLElement, tk: string): void => {
    const th = thesisOf(x, tk);
    const g = h(parent, "div", "zl-c-group zl-thesis");
    if (!th) {
        const b = h(g, "button", "zl-th-write");
        sprite(b, "receipt", "zl-px");
        h(b, "span", "", t("thWrite").toUpperCase());
        sprite(b, "back", "zl-px zl-th-go");
        b.addEventListener("click", (e) => { e.preventDefault(); editThesis(x, tk); });
        return;
    }
    const head = h(g, "button", "zl-sec");
    h(head, "span", "", t("thHead").toUpperCase());
    const go = h(head, "span", "zl-sec-go", t("thEdit").toUpperCase()); sprite(go, "back");
    head.addEventListener("click", (e) => { e.preventDefault(); editThesis(x, tk); });
    const row = (k: string, cls = "") => { const r = h(g, "div", "zl-th-row " + cls); h(r, "span", "zl-th-k", k); return h(r, "span", "zl-th-v"); };
    row(t("thWhy")).setText(th.why);
    const st = checkState(th.check, today());
    if (st === "due") {
        const r = h(g, "div", "zl-th-row is-due");
        h(r, "span", "zl-th-k", t("thCheck"));
        const v = h(r, "span", "zl-th-v");
        h(v, "span", "zl-th-q", t("thDidHold", { d: shortDate(th.check).toUpperCase() }));
        if (th.hold) h(v, "span", "zl-th-s", th.hold);
        const bs = h(r, "span", "zl-th-yn");
        h(bs, "button", "zl-chip", t("thYes").toUpperCase()).addEventListener("click", (e) => { e.preventDefault(); void answer(x, tk, th, true); });
        h(bs, "button", "zl-chip", t("thNo").toUpperCase()).addEventListener("click", (e) => { e.preventDefault(); void answer(x, tk, th, false); });
    } else if (st !== "none") {
        const v = row(t("thCheck"), st === "soon" ? "is-soon" : "");
        const top = h(v, "span", "zl-th-line");
        h(top, "span", "zl-th-t", th.hold || "-");
        h(top, "span", "zl-th-d", shortDate(th.check).toUpperCase());
        h(v, "span", "zl-th-s", t("thDays", { n: daysBetween(today(), th.check) }));
    }
    if (th.sell) row(t("thSell")).setText(th.sell);
    // vs 0050 since watching: keeps its line while the day bars load (space kept)
    if (tk !== BENCH) {
        const r = h(g, "div", "zl-th-row zl-th-vs");
        const k = h(r, "span", "zl-th-k");
        const v = h(r, "span", "zl-th-n");
        const paint = () => {
            const d = th.since ? vs0050(x, tk, th.since) : null;
            k.setText(d ? t("thVs", { b: BENCH, d: shortDate(d.from) }) : t("thVsNone", { b: BENCH }));
            v.setText(d ? pctS(d.diff) : " ");
            v.toggleClass("is-up", !!d && d.diff > 0); v.toggleClass("is-hot", !!d && d.diff < 0);
        };
        paint();
        x.ctx.plugin.prices.onSeries(() => { if (!r.isConnected) return false; paint(); return true; });
    }
};

// the full chart (sideways): the thesis as one line beside the MA chips; a tap = the card as a floating panel
export const thesisLine = (x: X, tk: string) => (parent: HTMLElement): void => {
    const th = thesisOf(x, tk);
    const b = h(parent, "button", "zl-th-strip");
    if (!th) { b.addClass("is-loud"); h(b, "span", "", t("thWrite").toUpperCase() + " ›"); b.addEventListener("click", (e) => { e.preventDefault(); editThesis(x, tk); }); return; }
    const st = checkState(th.check, today());
    h(b, "span", "zl-th-strip-k", t("thHead").toUpperCase());
    if (st !== "none") h(b, "span", "zl-th-strip-c" + (st === "later" ? "" : " is-loud"), `${st === "due" ? t("thDidHold", { d: shortDate(th.check).toUpperCase() }) : `${t("thCheck").toUpperCase()} ${shortDate(th.check).toUpperCase()}`}${th.hold ? ` · ${th.hold}` : ""}`);
    else h(b, "span", "zl-th-strip-c", th.why);
    const d = th.since ? vs0050(x, tk, th.since) : null;
    if (d) h(b, "span", "zl-th-strip-n" + (d.diff > 0 ? " is-up" : d.diff < 0 ? " is-hot" : ""), `${t("thVsShort", { b: BENCH })} ${pctS(d.diff)}`);
    b.addEventListener("click", (e) => {
        e.preventDefault();
        const layer = b.closest(".zl-fchart") ?? document.body;
        const pane = h(layer as HTMLElement, "div", "zl-th-float");
        thesisCard(x, pane, tk);
        const off = (ev: Event) => { if (!pane.contains(ev.target as Node) || (ev.target as HTMLElement).closest("button")) { pane.remove(); document.removeEventListener("pointerdown", off, true); } };
        window.setTimeout(() => document.addEventListener("pointerdown", off, true), 0);
    });
};

// ---------- the rules check before a buy ----------
const RULE_K: Record<RuleRow["key"], string> = { thesis: "rkThesis", sell: "rkSell", cap: "rkCap", batch: "rkBatch", emergency: "rkEmergency", limit: "rkLimit", sat: "rkSat" };
// TRADE on a chart page opens this first; CONTINUE (always allowed) goes on to the trade sheet with the limit price set here
export const buyCheck = (x: X, tk: string, go: (o: { price?: number; type?: "BUY" | "SELL" }) => void): void => {
    const { store, prices } = x.ctx.plugin;
    const p = x.P.positions.find((q) => q.ticker === tk);
    const single = p ? p.category === "stock" : !/^00\d/.test(tk) && /^\d{4}$/.test(tk);
    const A = buildAccounts(store.fm(store.path(ACCOUNTS_FILE)));
    const em = A.list.find((a) => a.key === "emergency" || /emergency/i.test(a.label));
    const minE = Math.max(emergencyMinOf(store.fm(store.path(FILES.invest))), em?.target ?? 0);
    // the satellite: each single stock held against 0050 since its first buy (the day bars that are loaded)
    const sat = satVsBench(x.P.positions.filter((q) => q.shares > 0 && q.category === "stock").map((q) => {
        const first = q.trades.find((tr) => tr.type === "BUY")?.date ?? "";
        const d = first ? vs0050(x, q.ticker, first) : null;
        return { cost: q.cost, diff: d ? d.diff : null };
    }));
    let limit: number | null = null;
    const live = prices.price(tk);
    const m = new Modal(x.ctx.app);
    const c = base(m, t("bcTitle", { tk }));
    m.containerEl.addClass("zl-sheet-host");
    const meta = h(c, "div", "zl-bc-met");
    const box = h(c, "div", "zl-figs is-compact zl-bc-rows");
    const note = h(c, "div", "zl-field-note");
    const paint = () => {
        const th = thesisOf(x, tk);
        const R = buyRules({ thesis: th, single, cost: p?.cost ?? 0, cap: x.cap, buys: p?.trades.filter((tr) => tr.type === "BUY").length ?? 0, emergency: em ? em.balance : null, emergencyMin: minE, limit, sat });
        meta.setText(t("bcMet", { n: R.met, of: R.rows.length }));
        box.empty();
        for (const r of R.rows) {
            const row = h(box, "button", "zl-fig" + (r.met === false ? " is-not" : ""));
            sprite(row, r.met === true ? "check" : r.met === false ? "close" : "list", "zl-px zl-fig-ic");
            const mm = h(row, "span", "zl-fig-main");
            h(mm, "span", "zl-fig-k", t(RULE_K[r.key] as never, { n: num(x.cap), e: num(minE), b: BENCH }));
            const sub = r.key === "cap" ? (single ? t("rsCap", { n: num(Math.max(0, r.left ?? 0)) }) : t("rsCapFree"))
                : r.key === "batch" ? (single ? t("rsBatch", { n: r.n ?? 1, of: r.of ?? 3, per: num(r.per ?? 0) }) : t("rsBatchFree"))
                : r.key === "emergency" ? (em ? t("rsEmergency", { n: num(em.balance) }) : t("rsNone"))
                : r.key === "limit" ? t("rsLimit") : r.key === "sat" ? t("rsSat") : r.key === "thesis" ? t("rsThesis") : t("rsSell");
            h(mm, "span", "zl-fig-s", sub);
            const val = r.key === "limit" ? (limit ? price2(limit) : t("rvSet")) : r.key === "sat" ? (sat === null ? "-" : pctS(sat))
                : r.met === null ? "-" : r.met ? t("rvMet") : (r.key === "thesis" || r.key === "sell") ? t("rvWrite") : t("rvNot");
            h(row, "span", "zl-fig-v" + (r.met === false ? " is-hot" : r.key === "sat" && sat !== null && sat > 0 ? " is-up" : ""), val.toUpperCase());
            const tap = r.key === "thesis" || r.key === "sell" ? () => editThesis(x, tk, paint)
                : r.key === "limit" ? () => new FormSheet(x.ctx.app, {
                    title: t("rkLimit"), subtitle: tk, submitText: t("save"),
                    fields: [{ key: "price", label: t("iPrice"), type: "number", required: true, dec: 2, step: 0.05, value: limit ? limit / 100 : live ?? "", note: () => t("rsLimitNote") }],
                    onSubmit: async (v) => { limit = Math.round(parseNum(v.price) * 100) || null; paint(); },
                }).open() : null;
            if (tap) { sprite(row, "back", "zl-px zl-fig-go"); row.addEventListener("click", (e) => { e.preventDefault(); tap(); }); }
        }
        const open = R.rows.filter((r) => (r.key === "thesis" || r.key === "sell") && r.met === false).length;
        note.setText(open ? t("bcNoteOpen", { n: open }) : t("bcNote"));
    };
    paint();
    const bar = h(c, "div", "zl-sheet-btns");
    // a holding can still be sold from here (the check is for buys); else WRITE THESIS beside CONTINUE
    if (p && p.shares > 0) h(bar, "button", "", t("iSell").toUpperCase()).addEventListener("click", () => { m.close(); go({ type: "SELL" }); });
    else h(bar, "button", "", t("bcWrite").toUpperCase()).addEventListener("click", () => editThesis(x, tk, paint));
    h(bar, "button", "mod-cta", t("bcGo").toUpperCase() + " ›").addEventListener("click", () => { m.close(); go({ type: "BUY", price: limit ? limit / 100 : undefined }); });
    m.open();
};
