import { requestUrl } from "obsidian";
import { expectedYm, fromFinMind, RevMonth, ymAdd } from "../calc/revenue";
import { today } from "../format";

// Monthly revenue per Taiwan code: FinMind's TaiwanStockMonthRevenue (free, no key, the last 25 months in one call), kept on
// this device (past months never change). Fetched again only while the month that should be out is missing, at most every
// 3 hours (companies report from the 1st to the 10th).
const KEY = "ledgerline-revenue";
const AGAIN_MS = 3 * 3600 * 1000;
interface Kept { months: RevMonth[]; at: number }
type Load = () => unknown; type Save = (v: unknown) => void;

export class Revenue {
    private m: Record<string, Kept> = {};
    private busy = new Set<string>();
    private subs = new Set<(code: string) => boolean>();
    private fail = new Map<string, number>();   // code → when FinMind last did not answer (asked again after 10 minutes)
    failed(code: string): boolean { return this.fail.has(code); }
    constructor(private load: Load, private save: Save) { try { this.m = (this.load() as Record<string, Kept>) ?? {}; } catch { this.m = {}; } }
    static key = KEY;
    get(code: string): RevMonth[] { return this.m[code]?.months ?? []; }
    // the newest month it has
    latest(code: string): string { const l = this.get(code); return l.length ? l[l.length - 1].ym : ""; }
    // its month for `today` is out
    isOut(code: string, day = today()): boolean { return this.latest(code) >= expectedYm(day); }
    onChange(fn: (code: string) => boolean): void { this.subs.add(fn); }
    ensure(code: string): void {
        if (!/^\d{4,6}$/.test(code) || this.busy.has(code) || Date.now() - (this.fail.get(code) ?? 0) < 10 * 60 * 1000) return;
        const k = this.m[code];
        if (k && (this.isOut(code) || Date.now() - k.at < AGAIN_MS)) return;
        void this.fetch(code);
    }
    async fetch(code: string): Promise<boolean> {
        this.busy.add(code);
        try {
            const from = `${ymAdd(today().slice(0, 7), -26)}-01`;
            const r = await requestUrl({ url: `https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockMonthRevenue&data_id=${code}&start_date=${from}`, throw: false });
            const rows = r.status === 200 ? (r.json as { data?: unknown })?.data : null;
            if (!Array.isArray(rows)) throw new Error(`finmind ${r.status}`);   // failed, not "no revenue": nothing is stamped as asked
            this.fail.delete(code);
            const months = fromFinMind(rows).sort((a, b) => a.ym.localeCompare(b.ym));
            const before = this.latest(code);
            this.m[code] = { months: months.length ? months : this.get(code), at: Date.now() };
            this.save(this.m);
            const fresh = this.latest(code) !== before;
            if (fresh) this.subs.forEach((fn) => { if (!fn(code)) this.subs.delete(fn); });
            return fresh;
        } catch {
            const first = !this.fail.has(code);
            this.fail.set(code, Date.now());
            if (first) this.subs.forEach((fn) => { if (!fn(code)) this.subs.delete(fn); });
            return false;
        } finally { this.busy.delete(code); }
    }
}
