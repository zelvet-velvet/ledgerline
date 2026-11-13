// Market calendar (owner, 2026-11-05): the days a market does not trade on a weekday and the US early closes (pure, tested).
// Taiwan: TWSE's holiday list, Taipei work stoppages from DGPA (typhoons: TWSE closes when Taipei City stops work), and a
// weekday with no trade by 09:10. US: Nasdaq's market info (the trading days around today, today's closing time).
// Dates are the market's own "YYYY-MM-DD".
export type Why = "holiday" | "typhoon" | "notrade";
export interface Cal { tw: Record<string, Why>; us: Record<string, Why>; usEarly: Record<string, number> }   // usEarly: close, minutes after midnight New York
export const EMPTY_CAL = (): Cal => ({ tw: {}, us: {}, usEarly: {} });

const p2 = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${p2(m)}-${p2(d)}`;
const addDays = (day: string, n: number): string => { const d = new Date(`${day}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const weekday = (day: string): boolean => { const w = new Date(`${day}T12:00:00Z`).getUTCDay(); return w !== 0 && w !== 6; };

// TWSE holidaySchedule: [{ Name, Date: "1151009" (ROC year), … }]; the first / last trading day notes are not closures
export const parseTwseHolidays = (json: unknown): Record<string, Why> => {
    const out: Record<string, Why> = {};
    if (!Array.isArray(json)) return out;
    for (const x of json as { Name?: string; Date?: string }[]) {
        const m = /^(\d{2,3})(\d{2})(\d{2})$/.exec(String(x.Date ?? ""));
        if (!m || /開始交易|最後交易/.test(String(x.Name ?? ""))) continue;
        const day = iso(Number(m[1]) + 1911, Number(m[2]), Number(m[3]));
        if (weekday(day)) out[day] = "holiday";
    }
    return out;
};

// DGPA's work-stoppage page (nds.html, a table of county → notice): the days Taipei City stops work all day or in the
// morning. "今天" is the page's date, "明天" the day after, "11月6日" that day. Afternoon or evening only: the market trades.
export const parseDgpa = (html: string): string[] => {
    const lines = html.replace(/<(script|style)[\s\S]*?<\/\1>/gi, "").replace(/<[^>]+>/g, "\n").split("\n").map((l) => l.trim()).filter(Boolean);
    const head = /(\d{2,3})年\s*(\d{1,2})月\s*(\d{1,2})日/.exec(lines.join(" "));
    if (!head) return [];
    const y = Number(head[1]) + 1911, today = iso(y, Number(head[2]), Number(head[3]));
    const i = lines.findIndex((l) => l === "臺北市" || l === "台北市");
    if (i < 0) return [];
    const said: string[] = [];
    for (const l of lines.slice(i + 1)) { if (/^[一-鿿]{1,4}[縣市]$/.test(l) || /^\d+\./.test(l)) break; said.push(l); }
    const out = new Set<string>();
    for (const s of said.join("").split("。")) {
        if (!/停止上班/.test(s)) continue;
        if (/(下午|晚間)[^上]*停止上班/.test(s) && !/上午|全日|全天/.test(s)) continue;
        const md = /(\d{1,2})月(\d{1,2})日/.exec(s);
        let day = today;
        if (md) { day = iso(y, Number(md[1]), Number(md[2])); if (day < addDays(today, -200)) day = iso(y + 1, Number(md[1]), Number(md[2])); }
        else if (/明天|明日/.test(s)) day = addDays(today, 1);
        out.add(day);
    }
    return [...out];
};

// Nasdaq market-info: { data: { marketOpeningTime: "Nov 5, 2026 09:30 AM ET", marketClosingTime: "… 01:00 PM ET",
// previousTradeDate: "Nov 4, 2026", nextTradeDate: "Nov 6, 2026", isBusinessDay } }: the weekdays between the previous and
// the next trading day that are not the session it reports are holidays; a session closing before 16:00 is an early close
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const usDay = (s: unknown): string | null => {
    const m = /([A-Z][a-z]{2})\w*\s+(\d{1,2}),\s*(\d{4})/.exec(String(s ?? ""));
    const mo = m ? MON.indexOf(m[1]) : -1;
    return m && mo >= 0 ? iso(Number(m[3]), mo + 1, Number(m[2])) : null;
};
const usMin = (s: unknown): number | null => {
    const m = /(\d{1,2}):(\d{2})\s*(AM|PM)/.exec(String(s ?? ""));
    return m ? ((Number(m[1]) % 12) + (m[3] === "PM" ? 12 : 0)) * 60 + Number(m[2]) : null;
};
export const parseNasdaq = (json: unknown): { closed: Record<string, Why>; early: Record<string, number> } | null => {
    const d = (json as { data?: Record<string, unknown> })?.data;
    if (!d) return null;
    const day = usDay(d.marketOpeningTime), prev = usDay(d.previousTradeDate), next = usDay(d.nextTradeDate), close = usMin(d.marketClosingTime);
    if (!prev || !next || prev >= next) return null;
    const closed: Record<string, Why> = {}, early: Record<string, number> = {};
    for (let x = addDays(prev, 1), n = 0; x < next && n < 14; x = addDays(x, 1), n++) {
        if (weekday(x) && !(x === day && d.isBusinessDay !== false)) closed[x] = "holiday";
    }
    if (day && close !== null && close < 960 && !closed[day]) early[day] = close;
    return { closed, early };
};
