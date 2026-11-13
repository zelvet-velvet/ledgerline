import { requestUrl } from "obsidian";
import { fromTwseAll, fromYahooSearch, Hit, matchListed, pushHistory } from "../calc/search";

// Where the magnifier looks: TWSE's list of listed codes and names (fetched once a week, kept in local storage, so Chinese
// names work offline) and Yahoo's search (the rest of the world, asked while typing). Recent searches kept too.
interface Store { v: 1; time: number; list: [string, string][]; recent: string[]; names?: Record<string, string> }   // names: of tickers picked from search
const WEEK = 7 * 24 * 60 * 60 * 1000;

export class TickerSearch {
    static KEY = "ledgerline-search";
    private st: Store = { v: 1, time: 0, list: [], recent: [] };
    private busy = false;
    constructor(private load: () => unknown, private save: (v: unknown) => void, private taiwan: () => boolean) {
        try { const v = this.load() as Store | null; if (v && v.v === 1) this.st = v; } catch { /* start empty */ }
    }
    private keep(): void { try { this.save(this.st); } catch { /* full storage */ } }
    recent(): string[] { return this.st.recent; }
    remember(tk: string, name = ""): void { this.st.recent = pushHistory(this.st.recent, tk); if (name) this.st.names = { ...this.st.names, [tk]: name }; this.keep(); }
    forget(): void { this.st.recent = []; this.keep(); }
    nameOf(tk: string): string { return this.st.list.find(([c]) => c === tk)?.[1] ?? this.st.names?.[tk] ?? ""; }
    // the TWSE list, when a week old (in the background)
    warm(): void {
        if (this.busy || Date.now() - this.st.time < WEEK) return;
        this.busy = true;
        void requestUrl({ url: "https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL", throw: false }).then((r) => {
            const list = r.status === 200 ? fromTwseAll(r.json) : [];
            if (list.length) { this.st.list = list; this.st.time = Date.now(); this.keep(); }
        }).catch(() => undefined).finally(() => { this.busy = false; });
    }
    listed(q: string): Hit[] { return matchListed(this.st.list, q).map(([c, name]) => ({ tk: c, name, ex: "TWSE" })); }
    async remote(q: string): Promise<Hit[]> {
        const s = q.trim();
        if (!s || !/[A-Za-z0-9]/.test(s)) return [];   // Yahoo answers Latin letters and digits only
        const r = await requestUrl({ url: `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(s)}&quotesCount=8&newsCount=0`, throw: false }).catch(() => null);
        return r && r.status === 200 ? fromYahooSearch(r.json, this.taiwan()) : [];
    }
}
