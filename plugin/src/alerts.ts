import { Notice, requestUrl } from "obsidian";
import type LedgerlinePlugin from "./main";
import { comingDates, DateItem, fromTwt48u, hit, keepSent, readAlerts, Sent } from "./calc/alerts";
import { buildPortfolio, journalPath } from "./calc/invest";
import { readThesis } from "./calc/thesis";
import { revStats } from "./calc/revenue";
import { FILES, FM } from "./data/store";
import { shortDate, today } from "./format";
import { t } from "./i18n";
import { Flows } from "./prices/flows";

// Alerts (Vellum screen "Invest · alerts", owner picked 2026-11-10). Checked once a minute while Obsidian runs (on the
// phone only while the app is open): price alerts against the newest quote, date alerts from 08:00 on their day, revenue as
// soon as a new month is out. Each is sent once (Config/Alerts.md `sent`, kept 7 days): a notice in the app and, with a
// `topic:` in that note, a push through ntfy.
export const ALERTS_FILE = "Alerts";
const EXDIV_KEY = "ledgerline-exdiv";
const NTFY = "https://ntfy.sh";
type ExDiv = { code: string; date: string; cash: number }[];

export class AlertWatch {
    private exdiv: { day: string; rows: ExDiv } = { day: "", rows: [] };
    private sending = false;
    constructor(private plugin: LedgerlinePlugin) {
        try { this.exdiv = (plugin.app.loadLocalStorage(EXDIV_KEY) as typeof this.exdiv) ?? this.exdiv; } catch { /* fresh */ }
        // a new month of revenue for a followed code: sent at once
        plugin.revenue.onChange((code) => { void this.revenueOut(code); return true; });
    }
    path(): string { return this.plugin.store.path(ALERTS_FILE); }
    read() { return readAlerts(this.plugin.store.fm(this.path())); }

    // the tickers the date alerts follow: holdings and the watchlist; Taiwan codes for revenue and ex-dividend
    followed(): { all: string[]; tw: string[] } {
        const { store, prices } = this.plugin;
        const P = buildPortfolio(store.fm(store.path(FILES.invest)), () => null, () => 1);
        const all = [...new Set([...P.positions.filter((p) => p.shares > 0).map((p) => p.ticker), ...P.watch])];
        return { all, tw: all.filter((tk) => !!Flows.code(prices.symbol(tk))) };
    }
    exDivs(): ExDiv { return this.exdiv.rows; }
    coming(day = today()): DateItem[] {
        const f = this.followed(), rv = this.plugin.revenue;
        const codes = new Set(f.tw.map((tk) => Flows.code(this.plugin.prices.symbol(tk)) ?? tk));
        const theses = f.all.map((tk) => ({ tk, th: readThesis(this.plugin.store.fm(journalPath(tk))) })).filter((x) => x.th?.check).map((x) => ({ ticker: x.tk, check: x.th!.check, hold: x.th!.hold }));
        return comingDates(day, { tw: f.tw.filter((tk) => !/^00\d/.test(tk)), exdiv: this.exdiv.rows.filter((e) => codes.has(e.code)), theses, revOut: new Set(f.tw.filter((tk) => rv.isOut(Flows.code(this.plugin.prices.symbol(tk)) ?? tk, day))) });
    }

    // once a minute (main.ts)
    async tick(): Promise<void> {
        const { prices, revenue } = this.plugin;
        const A = this.read(), day = today(), now = new Date();
        // price alerts: their tickers stay fresh while their market trades
        prices.track(A.alerts.map((a) => prices.symbol(a.ticker)));
        for (const a of A.alerts) {
            const p = prices.price(a.ticker);
            if (p === null || !hit(a, Math.round(p * 100))) continue;
            await this.send(`price:${a.id}:${day}`, t("alSentPrice", { tk: a.ticker, k: t(a.kind === "below" ? "alBelow" : "alAbove").toLowerCase(), p: (a.price / 100).toLocaleString(undefined, { minimumFractionDigits: 2 }), now: p.toLocaleString(undefined, { minimumFractionDigits: 2 }) }));
        }
        const f = this.followed();
        // revenue: the month that should be out (prices/revenue.ts asks again at most every 3 hours while it is missing)
        for (const tk of f.tw) { const c = Flows.code(prices.symbol(tk)); if (c && !/^00\d/.test(c)) revenue.ensure(c); }
        // the ex-dividend schedule once a day
        if (this.exdiv.day !== day) void this.loadExDiv(day);
        // date alerts from 08:00 on their day
        if (now.getHours() < 8) return;
        for (const d of this.coming(day).filter((x) => x.date === day && x.kind !== "revenue")) {
            const text = d.kind === "report" ? t("alSentReport", { q: d.what }) : d.kind === "exdiv" ? t("alSentExdiv", { tk: d.ticker, n: (d.cash ?? 0) / 100 }) : t("alSentThesis", { tk: d.ticker, what: d.what });
            await this.send(`${d.kind}:${d.ticker}:${d.date}`, text);
        }
    }
    private async revenueOut(code: string): Promise<void> {
        const tk = this.followed().tw.find((x) => Flows.code(this.plugin.prices.symbol(x)) === code);
        const s = revStats(this.plugin.revenue.get(code));
        if (!tk || !s) return;
        const m = new Date(`${s.latest.ym}-15T12:00:00Z`).toLocaleDateString("en-US", { month: "long" });
        await this.send(`revenue:${tk}:${s.latest.ym}`, t("alSentRevenue", { tk, m, yoy: s.yoy === null ? "-" : `${s.yoy >= 0 ? "+" : "−"}${Math.abs(s.yoy).toFixed(1)}%` }));
    }
    private async loadExDiv(day: string): Promise<void> {
        this.exdiv.day = day;
        try {
            const r = await requestUrl({ url: "https://openapi.twse.com.tw/v1/exchangeReport/TWT48U_ALL", throw: false });
            if (r.status === 200) { this.exdiv = { day, rows: fromTwt48u(r.json) }; this.plugin.app.saveLocalStorage(EXDIV_KEY, this.exdiv); }
        } catch { /* next day */ }
    }

    // sent once per key: kept in the note (7 days), a notice here, a push through ntfy with a topic
    async send(key: string, text: string): Promise<void> {
        if (this.sending) return;
        const A = this.read();
        if (A.sent.some((s) => s.key === key)) return;
        this.sending = true;
        try {
            const day = today(), stamp = `${shortDate(day)} ${new Date().toTimeString().slice(0, 5)}`;
            await this.plugin.store.update(this.path(), (f: FM) => {
                f.sent = [...keepSent(readAlerts(f).sent, day), { key, date: day, text: `${stamp} · ${text}` } satisfies Sent];
            });
            new Notice(text, 10000);
            if (A.topic) await requestUrl({ url: `${NTFY}/${encodeURIComponent(A.topic)}`, method: "POST", body: text, headers: { Title: "Ledgerline", Tags: "chart_with_upwards_trend" }, throw: false }).catch(() => null);
        } finally { this.sending = false; }
    }
}
