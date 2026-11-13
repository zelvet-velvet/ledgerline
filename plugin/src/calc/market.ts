import { Bars, emptyBars } from "./chart";
import type { Quote } from "./quotes";

// TAIEX from the exchange itself (market mode, 2026-11-10; Yahoo's ^TWII runs 20 minutes behind): pure parsers for TWSE MIS
// (the live index) and TWSE's 5-second file (MI_5MINS_INDEX: the whole session), used by prices/index.ts for ^TWII.

const num = (s: unknown): number => { const n = Number(String(s ?? "").replace(/,/g, "")); return Number.isFinite(n) && n > 0 ? n : 0; };

// MIS getStockInfo for tse_t00 (TAIEX): z last, y the previous close, tlong the time, d the session's date (YYYYMMDD)
export const parseMisIndex = (json: unknown, code = "t00"): (Quote & { day: string }) | null => {
    const r = ((json as { msgArray?: Record<string, string>[] })?.msgArray ?? []).find((x) => x.c === code);
    if (!r) return null;
    const prev = num(r.y), price = num(r.z) || num(r.pz) || prev;
    if (!price) return null;
    const asOf = Number(r.tlong) || Date.now(), d = r.d ?? "";
    return { price, prev: prev || undefined, time: Date.now(), asOf, source: "twse", day: /^\d{8}$/.test(d) ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}` : "" };
};

// MI_5MINS_INDEX (column 1 = TAIEX) as 1-minute bars keyed "YYYY-MM-DDTHH:MM" (Taipei, like Yahoo's minute bars): a point at
// 09:01:00 closes the 09:00 bar. The 09:00:00 row is the previous close (pc), not a trade. Prices in hundredths; no volume.
export const fiveSecBars = (json: unknown, day: string): Bars | null => {
    const rows = (json as { data?: string[][] })?.data;
    if (!Array.isArray(rows) || !rows.length) return null;
    const B = emptyBars();
    let key = "";
    for (const r of rows) {
        const m = /^(\d\d):(\d\d):(\d\d)$/.exec(r[0] ?? ""), v = Math.round(num(r[1]) * 100);
        if (!m || !v) continue;
        const s = Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
        if (s <= 9 * 3600) { B.pc = v; continue; }
        const mi = Math.floor((s - 1) / 60), k = `${day}T${String(Math.floor(mi / 60)).padStart(2, "0")}:${String(mi % 60).padStart(2, "0")}`;
        if (k !== key) { B.d.push(k); B.o.push(v); B.h.push(v); B.l.push(v); B.c.push(v); B.v.push(0); key = k; continue; }
        const n = B.c.length - 1;
        B.h[n] = Math.max(B.h[n], v); B.l[n] = Math.min(B.l[n], v); B.c[n] = v;
    }
    return B.d.length ? B : null;
};
