import { requestUrl } from "obsidian";
import { Cal, EMPTY_CAL, parseDgpa, parseNasdaq, parseTwseHolidays } from "../calc/calendar";

// Fetches the market calendar (calc/calendar.ts) while the app is open, each source at most this often; kept on the device.
// A failed source keeps what it had and tries again in 30 minutes; with nothing known, the weekday rule alone applies.
const TWSE = "https://openapi.twse.com.tw/v1/holidaySchedule/holidaySchedule";
const DGPA = "https://www.dgpa.gov.tw/typh/daily/nds.html";
const NASDAQ = "https://api.nasdaq.com/api/market-info";
const EVERY = { twse: 24 * 3600e3, dgpa: 30 * 60e3, nasdaq: 6 * 3600e3 }, RETRY = 30 * 60e3;
type Src = keyof typeof EVERY;
const UA = { "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)", Accept: "application/json, text/html" };

export class MarketCalendar {
    static KEY = "ledgerline-market-cal";
    cal: Cal = EMPTY_CAL();
    private at: Partial<Record<Src, number>> = {};
    private busy = new Set<Src>();
    constructor(private load: () => unknown, private save: (v: unknown) => void, private changed: () => void) {
        try {
            const v = this.load() as { cal?: Cal; at?: Partial<Record<Src, number>> } | null;
            if (v?.cal) this.cal = { ...EMPTY_CAL(), ...v.cal };
            this.at = v?.at ?? {};
        } catch { /* start empty */ }
    }
    // days over 40 days old are dropped, so the stored calendar stays small
    private store(): void {
        const old = new Date(Date.now() - 40 * 864e5).toISOString().slice(0, 10), fresh = <T,>(m: Record<string, T>) => Object.fromEntries(Object.entries(m).filter(([d]) => d >= old));
        this.cal = { tw: fresh(this.cal.tw), us: fresh(this.cal.us), usEarly: fresh(this.cal.usEarly) };
        try { this.save({ cal: this.cal, at: this.at }); } catch { /* full storage: kept in memory */ }
    }

    // called with the background tick: what is due for the markets you follow
    tick(tw: boolean, us: boolean): void {
        if (tw) { this.due("twse", (j) => { this.cal.tw = { ...keep(this.cal.tw, "holiday"), ...parseTwseHolidays(j) }; }); this.due("dgpa", (h) => { this.typhoon(parseDgpa(String(h))); }, true); }
        if (us) this.due("nasdaq", (j) => { const r = parseNasdaq(j); if (!r) throw new Error("nasdaq"); this.cal.us = { ...this.cal.us, ...r.closed }; this.cal.usEarly = { ...this.cal.usEarly, ...r.early }; });
    }
    // a Taiwan weekday with no trade by 09:10 (calc: Prices.background), or a trade after all
    noTrade(day: string, none: boolean): void {
        const was = this.cal.tw[day];
        if (none && !was) this.cal.tw[day] = "notrade";
        else if (!none && was === "notrade") delete this.cal.tw[day];
        else return;
        this.store();
        this.changed();
    }
    private typhoon(days: string[]): void {
        for (const d of days) if (!this.cal.tw[d]) this.cal.tw[d] = "typhoon";
    }
    private due(src: Src, use: (body: unknown) => void, text = false): void {
        const now = Date.now();
        if (this.busy.has(src) || now - (this.at[src] ?? 0) < EVERY[src]) return;
        this.busy.add(src);
        const url = src === "twse" ? TWSE : src === "dgpa" ? DGPA : NASDAQ;
        void requestUrl({ url, headers: UA, throw: false })
            .then((r) => {
                if (r.status !== 200) throw new Error(String(r.status));
                const before = JSON.stringify(this.cal);
                use(text ? r.text : r.json);
                this.at[src] = now;
                this.store();
                if (JSON.stringify(this.cal) !== before) this.changed();
            })
            .catch(() => { this.at[src] = now - EVERY[src] + RETRY; })
            .finally(() => this.busy.delete(src));
    }
}
// the entries of other kinds (typhoon, no trade) survive a fresh holiday list
const keep = (m: Record<string, string>, drop: string) => Object.fromEntries(Object.entries(m).filter(([, w]) => w !== drop)) as Cal["tw"];
