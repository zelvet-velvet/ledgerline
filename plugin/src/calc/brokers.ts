// Top brokers (券商分點) per stock: the 15 branches that bought most and the 15 that sold most over 1 / 5 / 20 days, read
// from Fubon's public 主力進出 page (owner's pick 2026-11-04; TWSE's own report sits behind a captcha). Counts are lots
// (張); share of the volume in hundredths of a percent; average cost in hundredths.
export interface Broker { name: string; b: number; s: number; net: number; pct: number }
export interface TopBrokers { asOf: string; buy: Broker[]; sell: Broker[]; buyTotal: number; sellTotal: number; buyCost: number; sellCost: number }
export type BrokerSpan = 1 | 5 | 20;
export const SPAN_PAGE: Record<BrokerSpan, number> = { 1: 1, 5: 2, 20: 4 };   // the page's own period numbers

const ent = (s: string) => s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(Number(n)));
const txt = (s: string) => ent(s.replace(/<[^>]*>/g, "")).trim();
const int = (s: string) => { const n = Number(s.replace(/,/g, "")); return Number.isFinite(n) ? Math.round(n) : NaN; };
const hund = (s: string) => { const n = Number(s.replace(/[,%]/g, "")); return Number.isFinite(n) ? Math.round(n * 100) : 0; };

// the page's HTML → its two lists; null when it holds no list (wrong code, changed page)
export const parseZco = (html: string): TopBrokers | null => {
    const d = /最後更新日：\s*(\d{4})\/(\d{1,2})\/(\d{1,2})/.exec(html);
    const out: TopBrokers = { asOf: d ? `${d[1]}-${d[2].padStart(2, "0")}-${d[3].padStart(2, "0")}` : "", buy: [], sell: [], buyTotal: 0, sellTotal: 0, buyCost: 0, sellCost: 0 };
    for (const tr of html.split(/<tr\b/i).slice(1)) {
        const cells = [...tr.split(/<\/tr>/i)[0].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map((m) => txt(m[1]));
        if (cells[0] === "合計買超張數") { out.buyTotal = int(cells[1]) || 0; out.sellTotal = int(cells[3]) || 0; continue; }
        if (cells[0] === "平均買超成本") { out.buyCost = hund(cells[1]); out.sellCost = hund(cells[3]); continue; }
        if (cells.length < 10) continue;
        const side = (c: string[], sign: 1 | -1): Broker | null => {
            const [name, b, s, n] = [c[0], int(c[1]), int(c[2]), int(c[3])];
            return name && Number.isFinite(b) && Number.isFinite(s) && Number.isFinite(n) ? { name, b, s, net: sign * Math.abs(n), pct: hund(c[4]) } : null;
        };
        const a = side(cells.slice(0, 5), 1), z = side(cells.slice(5, 10), -1);
        if (a) out.buy.push(a);
        if (z) out.sell.push(z);
    }
    return out.buy.length || out.sell.length ? out : null;
};

// branches of foreign banks and brokers: mostly foreign money (a hint, not what 外資 itself reports)
const FOREIGN = /^(美商|港商|新加坡商|法商|瑞士商|德商|英商|日商|荷商|澳商|台灣摩根士丹利|摩根大通|花旗|香港上海匯豐|匯豐|麥格理|瑞銀|高盛|美林|大和國泰|野村|法銀巴黎)/;
export const isForeignBroker = (name: string): boolean => FOREIGN.test(name);

// a stored list is old once the calendar day changed, or from 16:00 (the day's report is out) if it was read before then
export const brokersDue = (fetched: number | null, now: Date): boolean => {
    if (!fetched) return true;
    const f = new Date(fetched);
    if (f.toDateString() !== now.toDateString()) return true;
    return now.getHours() >= 16 && f.getHours() < 16;
};
