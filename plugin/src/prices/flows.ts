import { requestUrl } from "obsidian";
import { FlowDay, FlowDays, flowDue, flowSeries, flowTrim, parseT86 } from "../calc/flows";

// 法人 flows from TWSE T86 (listed stocks only; TPEx has its own report, not read yet). One request per trading day answers
// every stock (warrants left out: ~190 KB); only our tickers' rows are kept, for the last 35 calendar days, in local
// storage. Fetched in the background when a flows row or page is on screen: the missing days, newest first, slowly
// (TWSE turns away fast callers). Today's report is out after 15:00; until it is, today is tried again every 10 minutes.
interface Store { v: 2; codes: string[]; days: FlowDays }   // v: the stored shape (2: bought / sold kept too)
const GAP = 400, RETRY = 10 * 60 * 1000;

export class Flows {
    static KEY = "ledgerline-flows";
    private st: Store = { v: 2, codes: [], days: {} };
    private busy = false;
    private tried = 0;
    private subs = new Set<() => boolean>();
    constructor(private load: () => unknown, private save: (v: unknown) => void) {
        try { const v = this.load() as Store | null; if (v && v.v === 2 && Array.isArray(v.codes) && v.days) this.st = v; } catch { /* start empty */ }
    }
    // a 4–6 digit code, or null for tickers T86 does not cover
    static code(symbol: string): string | null { const m = /^(\d{4,6}[A-Z]?)\.TW$/.exec(symbol); return m ? m[1] : null; }
    // this code's trading days, oldest first; null while nothing is known for it
    series(code: string): FlowDay[] | null {
        if (!this.st.codes.includes(code)) return null;
        const s = flowSeries(this.st.days, code);
        return s.length ? s : null;
    }
    loading(): boolean { return this.busy; }
    // a listener answering false is gone and dropped
    onChange(fn: () => boolean): void { this.subs.add(fn); }
    private tell(): void { for (const f of [...this.subs]) if (!f()) this.subs.delete(f); }
    // fetch what is missing for these codes (a new code means every day again: the stored days only hold the old codes)
    ensure(codes: string[]): void {
        const want = [...new Set(codes)].sort();
        if (!want.length || this.busy) return;
        if (want.some((c) => !this.st.codes.includes(c))) { this.st = { v: 2, codes: [...new Set([...this.st.codes, ...want])].sort(), days: {} }; this.tried = 0; }
        if (Date.now() - this.tried < RETRY) return;
        const now = new Date(), due = flowDue(now, this.st.days);
        if (!due.length) return;
        this.busy = true;
        this.tried = Date.now();
        const today = flowDue(now, {}, 0)[0] ?? "";   // "" before 15:00 or at the weekend
        void (async () => {
            let got = 0;
            for (const date of due) {
                const r = await requestUrl({ url: `https://www.twse.com.tw/rwd/zh/fund/T86?date=${date.replace(/-/g, "")}&selectType=ALLBUT0999&response=json`, throw: false }).catch(() => null);
                if (!r || r.status !== 200) break;   // offline or turned away: the rest next time
                let json: unknown = null;
                try { json = r.json; } catch { break; }
                const rows = parseT86(json, this.st.codes);
                if (rows || date !== today) this.st.days[date] = rows;   // today without a report: not out yet, not a holiday
                if (++got % 5 === 0) this.tell();
                await new Promise((ok) => setTimeout(ok, GAP));
            }
            this.st.days = flowTrim(this.st.days, now);
            try { this.save(this.st); } catch { /* full storage: kept in memory */ }
        })().finally(() => { this.busy = false; this.tell(); });
    }
}
