import { requestUrl } from "obsidian";
import { BrokerSpan, brokersDue, parseZco, SPAN_PAGE, TopBrokers } from "../calc/brokers";

// Top brokers from Fubon's public 主力進出 page (Big5 HTML, one request per stock and period). Read when a page asks for it,
// at most once a day per stock and period (again after 16:00 if read before), kept in local storage.
interface Item { time: number; data: TopBrokers }
interface Store { v: 1; items: Record<string, Item> }

export class Brokers {
    static KEY = "ledgerline-brokers";
    private st: Store = { v: 1, items: {} };
    private busy = new Set<string>();
    private failed = new Map<string, number>();
    private subs = new Set<(key: string) => boolean>();
    constructor(private load: () => unknown, private save: (v: unknown) => void) {
        try { const v = this.load() as Store | null; if (v && v.v === 1 && v.items) this.st = v; } catch { /* start empty */ }
    }
    static key(code: string, span: BrokerSpan): string { return `${code}|${span}`; }
    get(code: string, span: BrokerSpan): TopBrokers | null { return this.st.items[Brokers.key(code, span)]?.data ?? null; }
    loading(code: string, span: BrokerSpan): boolean { return this.busy.has(Brokers.key(code, span)); }
    failedAt(code: string, span: BrokerSpan): boolean { return this.failed.has(Brokers.key(code, span)); }
    // a listener answering false is gone and dropped; it hears the key that changed (or failed)
    onChange(fn: (key: string) => boolean): void { this.subs.add(fn); }
    ensure(code: string, span: BrokerSpan): void {
        const k = Brokers.key(code, span), have = this.st.items[k];
        if (this.busy.has(k) || !brokersDue(have?.time ?? null, new Date()) || Date.now() - (this.failed.get(k) ?? 0) < 10 * 60 * 1000) return;
        this.busy.add(k);
        void (async () => {
            const r = await requestUrl({ url: `https://fubon-ebrokerdj.fbs.com.tw/z/zc/zco/zco_${code}_${SPAN_PAGE[span]}.djhtm`, throw: false }).catch(() => null);
            let data: TopBrokers | null = null;
            if (r && r.status === 200) { try { data = parseZco(new TextDecoder("big5").decode(r.arrayBuffer)); } catch { data = null; } }
            if (!data) { this.failed.set(k, Date.now()); return; }
            this.failed.delete(k);
            this.st.items[k] = { time: Date.now(), data };
            // keep the 60 most recent lists (a few tickers × 3 periods)
            const keep = Object.entries(this.st.items).sort((a, b) => b[1].time - a[1].time).slice(0, 60);
            this.st.items = Object.fromEntries(keep);
            try { this.save(this.st); } catch { /* full storage: kept in memory */ }
        })().finally(() => { this.busy.delete(k); for (const f of [...this.subs]) if (!f(k)) this.subs.delete(f); });
    }
}
