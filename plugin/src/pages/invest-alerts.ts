// Alerts (Vellum screen "Invest · alerts", owner picked 2026-11-10): a C list page. COMING: the price alerts (how far away)
// and the date alerts that come by themselves (revenue out, report deadlines, ex-dividend, thesis checks), soonest first;
// SENT: the last 7 days. + NEW ALERT sets a price alert. Checking and sending: src/alerts.ts.
import type { FM } from "../data/store";
import { away, PriceAlert } from "../calc/alerts";
import { daysBetween } from "../calc/thesis";
import { parseNum, shortDate, today } from "../format";
import { t } from "../i18n";
import { h, page } from "../ui";
import { figures, Fig, sec } from "../ui/c";
import { confirmSheet, FormSheet } from "../ui/sheet";
import type { PageOut } from "./index";
import { X } from "./invest-shared";

type Filter = "all" | "price" | "date";
let FILTER: Filter = "all";
const list = (v: unknown): FM[] => (Array.isArray(v) ? v : v ? [v] : []) as FM[];
const p2 = (n: number) => (n / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// the price alert sheet: ticker, below / above, the price (a dial; tap = pad); an existing one can be removed
export const alertSheet = (x: X, a?: PriceAlert, preset?: string): void => {
    const { store, alerts, prices } = x.ctx.plugin;
    const path = alerts.path();
    new FormSheet(x.ctx.app, {
        title: a ? t("alEdit") : t("alNew"), subtitle: a?.ticker ?? preset, submitText: t("save"),
        fields: [
            ...(a || preset ? [] : [{ key: "tk", label: t("iTicker"), type: "text" as const, required: true }]),
            { key: "kind", label: t("alKind"), type: "select", value: a?.kind ?? "below", options: [["below", t("alBelow")], ["above", t("alAbove")]] },
            { key: "price", label: t("iPrice"), type: "number", required: true, dec: 2, step: 0.05, value: a ? a.price / 100 : "",
                auto: (v) => { const q = prices.price(a?.ticker ?? preset ?? (v.tk ?? "").trim().toUpperCase()); return q ? String(Math.round(q * 100) / 100) : ""; },
                note: () => t("alPriceNote") },
        ],
        validate: (v) => (parseNum(v.price) > 0 ? null : t("invalidNumber")),
        onSubmit: async (v) => {
            const tk = a?.ticker ?? preset ?? v.tk.trim().toUpperCase();
            await store.update(path, (f) => {
                const xs = list(f.alerts);
                const row = { id: a?.id ?? `a${Date.now().toString(36)}`, ticker: tk, kind: v.kind === "above" ? "above" : "below", price: parseNum(v.price) };
                if (a && xs[a.index]) xs[a.index] = row; else xs.push(row);
                f.alerts = xs;
            });
        },
        danger: a ? { text: t("alRemove"), onTap: async () => {
            if (!(await confirmSheet(x.ctx.app, t("alRemove"), t("alRemoveQ", { tk: a.ticker, p: p2(a.price) }), t("remove")))) return false;
            await store.update(path, (f) => { const xs = list(f.alerts); xs.splice(a.index, 1); f.alerts = xs; });
            return true;
        } } : undefined,
    }).open();
};

export const alertsPage = (x: X): PageOut => {
    const { alerts, prices } = x.ctx.plugin;
    const title = t("alTitle");
    const el = page(title);
    el.addClass("zl-c-list");
    const A = alerts.read(), day = today();
    // ALL · PRICES · DATES, and whether pushes go out (a topic in Config/Alerts.md)
    const top = h(el, "div", "zl-c-group zl-al-top");
    const words = h(top, "div", "zl-words");
    for (const [k, label] of [["all", t("alAll")], ["price", t("alPrices")], ["date", t("alDates")]] as [Filter, string][]) {
        const b = h(words, "button", "zl-chip" + (FILTER === k ? " is-on" : ""), label.toUpperCase());
        b.addEventListener("click", (e) => { e.preventDefault(); FILTER = k; x.ctx.redraw(); });
    }
    const push = h(top, "button", "zl-al-push", (A.topic ? t("alPushOn") : t("alPushOff")).toUpperCase());
    push.addEventListener("click", (e) => { e.preventDefault(); void x.ctx.plugin.openPath(alerts.path()); });
    const rows: (Fig & { at: string })[] = [];
    if (FILTER !== "date") for (const a of A.alerts) {
        const q = prices.price(a.ticker), now = q === null ? null : Math.round(q * 100);
        rows.push({ at: "", icon: a.kind === "below" ? "down" : "up", k: t("alPriceK", { tk: a.ticker, k: a.kind === "below" ? "≤" : "≥", p: p2(a.price) }),
            s: now === null ? t("alNoPrice") : t("alAway", { now: p2(now), n: Math.max(0, away(a, now)).toFixed(1) }), v: p2(a.price), onTap: () => alertSheet(x, a) });
    }
    if (FILTER !== "price") for (const d of alerts.coming(day)) {
        const n = daysBetween(day, d.date), when = n <= 0 ? t("alToday") : shortDate(d.date);
        const k = d.kind === "revenue" ? t("alRevK", { tk: d.ticker }) : d.kind === "report" ? t("alReportK", { q: d.what }) : d.kind === "exdiv" ? t("alExdivK", { tk: d.ticker }) : t("alThesisK", { tk: d.ticker });
        const s = d.kind === "revenue" ? t("alRevS") : d.kind === "report" ? t("alReportS") : d.kind === "exdiv" ? t("alExdivS", { n: ((d.cash ?? 0) / 100).toLocaleString() }) : d.what || t("alThesisS");
        rows.push({ at: d.date, icon: d.kind === "thesis" ? "receipt" : "clock", k, s, v: when.toUpperCase(), hot: n <= 0, onTap: d.ticker ? () => x.ctx.push({ key: d.kind === "revenue" ? "revenue:" + d.ticker : "chart:" + d.ticker, title: d.ticker }) : undefined });
    }
    const g = h(el, "div", "zl-c-group");
    sec(g, `${t("alComing").toUpperCase()} · ${rows.length}`);
    // price alerts first (they can fire any minute), then the dates, soonest first
    figures(g, rows.length ? rows.sort((a, b) => (a.at || "0").localeCompare(b.at || "0")) : [{ k: t("alNone"), v: "-", dim: true }]);
    const sent = [...A.sent].reverse();
    if (sent.length) {
        const s = h(el, "div", "zl-c-group");
        sec(s, t("alSent").toUpperCase());
        figures(s, sent.map((x2) => ({ icon: "check", k: x2.text.split(" · ").slice(1).join(" · ") || x2.text, s: x2.text.split(" · ")[0], v: t("alSentV").toUpperCase(), dim: true })));
    }
    h(el, "div", "zl-field-note", t("alFoot"));
    return { title, el, fab: { icon: "plus", text: t("alNew").toUpperCase(), label: t("alNew"), onTap: () => alertSheet(x) } };
};
