import { dateStr } from "../format";
import type { FM } from "../data/store";

// Investment Config (`assets`): { ticker, name, category, currency?, broker?, dca?: { amount, day },
//   transactions: [{ id?, type: BUY | SELL, shares, price, fee?, tax?, fx?, date, settled?, broker? }] }
// Money is integer (stock S1): shares in 1/10,000, prices in hundredths, amounts in the currency's minor unit
// (TWD / JPY whole, others cents), totals in whole base currency. Average-cost method; buy fees are part of the cost,
// sell fees and tax come off the proceeds. FX = base units per 1 unit of the currency, the trade's own rate when given.
export interface Trade {
    id: string; type: "BUY" | "SELL"; date: string; settled: string; broker: string; index: number;
    shares: number; price: number; fx: number;   // as typed (display)
    rate: number;                                // FX used: the trade's own, else today's (1 for TWD)
    q: number; p: number;                        // shares × 10,000 and price × 100, integers
    gross: number; fee: number; tax: number;     // minor units of the trade's currency
    cash: number;                                // what moved in the base currency: buy −(gross + fee), sell gross − fee − tax
    pending: boolean;                            // settles after today: the cash has not moved yet
}
export interface Dca { amount: number; day: number }
export interface Position {
    ticker: string; name: string; category: string; currency: string; broker: string; dca: Dca | null; trades: Trade[];
    shares: number;       // held now
    q: number;            // held now × 10,000
    cost: number;         // cost of what is held (base, whole), buy fees included
    avg: number;          // cost per share held (display)
    realized: number;     // profit already taken by sells, after their fees and tax
    fees: number;         // every fee and tax paid (base)
    bought: number;       // net cash put in: buys − sells (base)
    price: number | null; // last price (its own currency), null = unknown
    value: number;        // what is held at the last price (cost when the price is unknown)
    exit: number;         // what selling it all now would cost (base): Taiwan broker fee + securities tax, as brokers' 預估損益 count
    pl: number;           // value − exit − cost: the gain or loss if sold now
    index: number;        // position in the `assets` list
}
export interface Bucket { key: string; label: string; target: number; value: number; pct: number; drift: number }
export interface Portfolio { positions: Position[]; buckets: Bucket[]; value: number; cost: number; pl: number; realized: number; fees: number; bought: number; priced: boolean; threshold: number; watch: string[] }

const arr = (v: unknown): FM[] => (Array.isArray(v) ? v : v ? [v] : []).filter((x) => x && typeof x === "object") as FM[];
const num = (v: unknown): number => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
export const tickerOf = (a: FM): string => String(a.ticker ?? a.name ?? "").toUpperCase();

// minor units per 1 unit of a currency
export const minorOf = (currency: string): number => (["TWD", "JPY", "KRW"].includes(currency) ? 1 : 100);
export const toQ = (shares: unknown): number => Math.round(num(shares) * 10000);
export const toP = (price: unknown): number => Math.round(num(price) * 100);
export const toMinor = (amount: unknown, currency: string): number => Math.round(num(amount) * minorOf(currency));
// q shares at p hundredths, in minor units of the currency
export const grossOf = (q: number, p: number, currency: string): number => Math.round((q * p * minorOf(currency)) / 1e6);
// minor units of a currency at a rate to whole base units
export const toBase = (minor: number, currency: string, rate: number): number => Math.round((minor / minorOf(currency)) * rate);

// The trade id that Accounts entries link to (`trade:`): the typed `id`, else TICKER-date, with -2, -3 … for more trades that day.
const tradeIds = (ticker: string, rows: FM[]): string[] => {
    const seen = new Map<string, number>();
    return rows.map((t) => {
        if (t.id) return String(t.id);
        const base = `${ticker}-${dateStr(t.date, "")}`, n = (seen.get(base) ?? 0) + 1;
        seen.set(base, n);
        return n === 1 ? base : `${base}-${n}`;
    });
};

// Next planned buy on or after today: the dca day this month, else next month (clamped to the month's length).
export const nextDca = (dca: Dca | null, today: string): string | null => {
    if (!dca || !(dca.day >= 1)) return null;
    const [y, m, d] = today.split("-").map(Number);
    const at = (yy: number, mm: number) => { const last = new Date(yy, mm, 0).getDate(); return `${yy}-${String(mm).padStart(2, "0")}-${String(Math.min(dca.day, last)).padStart(2, "0")}`; };
    const here = at(y, m);
    if (Number(here.slice(8)) >= d) return here;
    return m === 12 ? at(y + 1, 1) : at(y, m + 1);
};

// Pure. price(ticker) = last price in the asset's currency (or null); fx(currency) = base units per 1 unit of it now.
export const buildPortfolio = (fm: FM | null, price: (t: string) => number | null, fx: (c: string) => number, today = ""): Portfolio => {
    const alloc = arr(fm?.allocation);
    const positions: Position[] = arr(fm?.assets).map((a, index) => {
        const currency = String(a.currency ?? "TWD").toUpperCase(), ticker = tickerOf(a), broker = String(a.broker ?? "");
        const fxNow = fx(currency);
        const rows = arr(a.transactions), ids = tradeIds(ticker, rows);
        const trades: Trade[] = rows.map((t, i) => {
            const type = String(t.type).toUpperCase() === "SELL" ? "SELL" : "BUY";
            const q = toQ(t.shares), p = toP(t.price), gross = grossOf(q, p, currency);
            const fee = toMinor(t.fee, currency), tax = toMinor(t.tax, currency), rate = currency === "TWD" ? 1 : num(t.fx) || fxNow;
            const cash = type === "BUY" ? -toBase(gross + fee, currency, rate) : toBase(gross - fee - tax, currency, rate);
            const settled = dateStr(t.settled, "");
            return { id: ids[i], type, date: dateStr(t.date, ""), settled, broker: String(t.broker ?? broker), index: i, rate, shares: num(t.shares), price: num(t.price), fx: num(t.fx), q, p, gross, fee, tax, cash, pending: !!today && !!settled && settled > today } as Trade;
        });
        let held = 0, cost = 0, realized = 0, fees = 0, bought = 0;
        [...trades].sort((x, y) => x.date.localeCompare(y.date) || x.index - y.index).forEach((t) => {
            fees += toBase(t.fee + t.tax, currency, t.rate);
            bought -= t.cash;
            if (t.type === "BUY") { held += t.q; cost -= t.cash; }
            else if (held > 0) {
                const sold = Math.min(t.q, held);
                const out = sold === held ? cost : Math.round((cost * sold) / held);   // the last share takes what is left: no cent lost
                const proceeds = sold === t.q ? t.cash : Math.round((t.cash * sold) / t.q);
                realized += proceeds - out; held -= sold; cost -= out;
            }
        });
        if (!trades.length && num(a.shares) > 0) { held = toQ(a.shares); cost = toBase(grossOf(held, toP(a.avg_cost), currency), currency, fxNow); }
        const last = price(ticker);
        const g = last !== null ? grossOf(held, toP(last), currency) : 0;
        const value = last !== null ? toBase(g, currency, fxNow) : cost;
        const exit = held > 0 && last !== null ? toBase(autoFee(g, currency) + autoTax(g, currency, ticker), currency, fxNow) : 0;
        const d = a.dca && typeof a.dca === "object" ? (a.dca as FM) : null;
        const dca = d && num(d.amount) > 0 ? { amount: Math.round(num(d.amount)), day: Math.round(num(d.day)) || 1 } : null;
        return { ticker, name: String(a.name ?? ticker), category: String(a.category ?? "other").toLowerCase(), currency, broker, dca, trades, shares: held / 10000, q: held, cost, avg: held > 0 ? (cost * 10000) / held : 0, realized, fees, bought, price: last, value, exit, pl: value - exit - cost, index };
    });
    const value = positions.reduce((s, p) => s + p.value, 0);
    const buckets: Bucket[] = alloc.map((b) => {
        const key = String(b.key ?? "").toLowerCase(), label = String(b.label ?? key);
        const v = positions.filter((p) => p.category === key || p.category === label.toLowerCase()).reduce((s, p) => s + p.value, 0);
        const pct = value > 0 ? (v / value) * 100 : 0, target = num(b.pct);
        return { key, label, target, value: v, pct, drift: pct - target };
    });
    const sum = (k: "cost" | "pl" | "realized" | "fees" | "bought") => positions.reduce((s, p) => s + p[k], 0);
    return {
        positions: positions.sort((a, b) => b.value - a.value), buckets, value,
        cost: sum("cost"), pl: sum("pl"), realized: sum("realized"), fees: sum("fees"), bought: sum("bought"),
        priced: positions.every((p) => p.q <= 0 || p.price !== null), threshold: num(fm?.rebalance_threshold) || 5,
        watch: arr(fm?.watchlist).map((w) => String(w.ticker ?? "").toUpperCase()).filter(Boolean),
    };
};

// Trades against the Accounts entries that name them (`trade: <id>`): booked = sum of those entries (buy + fee …),
// diff = booked − cash (0 = the books agree). A pending trade with nothing booked yet is not a mismatch.
export interface TradeLink { id: string; ticker: string; cash: number; booked: number; diff: number; pending: boolean }
export const tradeLinks = (P: Portfolio, entries: { trade?: string; amount: number }[]): TradeLink[] =>
    P.positions.flatMap((p) => p.trades.map((t) => {
        const own = entries.filter((e) => e.trade === t.id), booked = own.reduce((s, e) => s + e.amount, 0);
        return { id: t.id, ticker: p.ticker, cash: t.cash, booked, diff: t.pending && !own.length ? 0 : booked - t.cash, pending: t.pending };
    }));

// A new trade's id, kept in the trade so it never shifts: TICKER-date, then -2, -3 … when taken.
export const newTradeId = (ticker: string, date: string, taken: string[]): string => {
    const base = `${ticker}-${date}`;
    if (!taken.includes(base)) return base;
    let n = 2;
    while (taken.includes(`${base}-${n}`)) n++;
    return `${base}-${n}`;
};

// S2 cash link. The Accounts entries a trade writes into its cash account: the trade amount (buy / sell) and, apart, the
// fee and tax (`fee`), so that they add up to the trade's cash exactly. Dated when the cash moves (settled, else traded).
export interface CashEntry { date: string; account: string; amount: number; kind: "buy" | "sell" | "fee" | "adjust"; trade: string; note: string }
export const tradeEntries = (t: Trade, ticker: string, currency: string, account: string): CashEntry[] => {
    const main = (t.type === "BUY" ? -1 : 1) * toBase(t.gross, currency, t.rate), rest = t.cash - main, date = t.settled || t.date;
    const note = `${ticker} x ${t.shares} @ ${t.price}${currency === "TWD" ? "" : ` ${currency}`}`;
    return [
        { date, account, amount: main, kind: t.type === "BUY" ? "buy" : "sell", trade: t.id, note },
        ...(rest ? [{ date, account, amount: rest, kind: "fee" as const, trade: t.id, note: `${ticker} fee` }] : []),
    ];
};

// After trades `ids` were added, edited or deleted: the entries to append so the books agree again. A trade with nothing booked
// gets its entries; a booked one that changed gets an `adjust` for the difference (old entries are never rewritten);
// a deleted one gets an `adjust` that cancels what was booked. No cash account for the holding's category: nothing is written.
export const syncEntries = (P: Portfolio, accounts: { key: string; bucket: string }[], entries: { trade?: string; amount: number; account: string }[], ids: string[], today: string): CashEntry[] => {
    const out: CashEntry[] = [];
    for (const id of ids) {
        const own = entries.filter((e) => e.trade === id), booked = own.reduce((s, e) => s + e.amount, 0);
        const p = P.positions.find((x) => x.trades.some((t) => t.id === id)), t = p?.trades.find((x) => x.id === id);
        const account = own[0]?.account ?? accounts.find((a) => a.bucket && a.bucket === p?.category)?.key;
        if (!account) continue;
        if (!t) { if (booked) out.push({ date: today, account, amount: -booked, kind: "adjust", trade: id, note: "trade deleted" }); continue; }
        if (!own.length) { out.push(...tradeEntries(t, p!.ticker, p!.currency, account)); continue; }
        if (booked !== t.cash) out.push({ date: today, account, amount: t.cash - booked, kind: "adjust", trade: id, note: "trade edited" });
    }
    return out;
};

// Cash waiting to invest: what the cash accounts of the allocation buckets hold now; null when no account names a bucket.
export const investCash = (accounts: { bucket: string; balance: number }[], keys: string[]): number | null => {
    const own = accounts.filter((a) => a.bucket && keys.includes(a.bucket));
    return own.length ? own.reduce((s, a) => s + a.balance, 0) : null;
};

// S4 decision journal: Invest/<ticker>.md, frontmatter `journal: [{ date, trade?, why }]` (the note's body is the owner's own).
export interface Thought { date: string; trade: string; why: string; index: number }
export const journalPath = (ticker: string): string => `Invest/${ticker}.md`;
export const readJournal = (fm: FM | null): Thought[] =>
    arr(fm?.journal).map((j, index) => ({ date: dateStr(j.date, ""), trade: String(j.trade ?? ""), why: String(j.why ?? "").trim(), index }))
        .filter((j) => j.why).sort((a, b) => b.date.localeCompare(a.date) || b.index - a.index);

// S5 rules: warnings only, never a block. cap = most cost held in one single stock (category `stock`; ETFs and bonds are free);
// mix = a bucket further from its target than the threshold; reason = a holding with nothing in its journal.
export interface Warning { rule: "cap" | "mix" | "reason"; key: string; over: number }   // key = ticker or bucket; over = by how much
export const DEFAULT_CAP = 15000;
export const capOf = (fm: FM | null): number => { const n = Math.round(num(fm?.single_stock_cap)); return n > 0 ? n : DEFAULT_CAP; };
export const checkRules = (P: Portfolio, cap: number, hasReason: (ticker: string) => boolean): Warning[] => [
    ...P.positions.filter((p) => p.q > 0 && p.category === "stock" && p.cost > cap).map((p) => ({ rule: "cap" as const, key: p.ticker, over: p.cost - cap })),
    ...(P.value > 0 ? P.buckets.filter((b) => Math.abs(b.drift) > P.threshold).map((b) => ({ rule: "mix" as const, key: b.label, over: Math.round(b.drift) })) : []),
    ...P.positions.filter((p) => p.q > 0 && !hasReason(p.ticker)).map((p) => ({ rule: "reason" as const, key: p.ticker, over: 0 })),
];
// the warnings in `after` that were not there before (what one trade newly broke)
export const newWarnings = (before: Warning[], after: Warning[]): Warning[] => after.filter((w) => !before.some((b) => b.rule === w.rule && b.key === w.key));

// Sheet kit K (2026-11-05): what the trade sheet fills in for you. Taiwan (TWD): broker fee 0.1425 % of the trade, rounded
// down, at least 20 (a 15,000 buy → 21); securities tax on a sale 0.3 %, ETFs (codes from 00) 0.1 %, rounded down;
// price steps by the TWSE tick table; settlement two trading days later. Elsewhere no fee or tax is guessed, a cent step.
export const isTwEtf = (ticker: string): boolean => /^00\d/.test(ticker);
export const autoFee = (gross: number, currency: string): number => (currency === "TWD" && gross > 0 ? Math.max(20, Math.floor(gross * 0.001425)) : 0);
export const autoTax = (gross: number, currency: string, ticker: string): number => (currency === "TWD" && gross > 0 ? Math.floor(gross * (isTwEtf(ticker) ? 0.001 : 0.003)) : 0);
// one price step in hundredths, at price p (hundredths)
export const tickOf = (p: number, currency: string, ticker: string): number => {
    if (currency !== "TWD") return 1;
    if (isTwEtf(ticker)) return p < 5000 ? 1 : 5;
    return p < 1000 ? 1 : p < 5000 ? 5 : p < 10000 ? 10 : p < 50000 ? 50 : p < 100000 ? 100 : 500;
};
// n trading days after day ("YYYY-MM-DD"): weekends and the market's closed days skipped
export const addTradingDays = (day: string, n: number, closed: (d: string) => boolean = () => false): string => {
    const d = new Date(`${day}T12:00:00Z`);
    if (isNaN(d.getTime())) return day;
    let left = n;
    while (left > 0) { d.setUTCDate(d.getUTCDate() + 1); const w = d.getUTCDay(); if (w !== 0 && w !== 6 && !closed(d.toISOString().slice(0, 10))) left--; }
    return d.toISOString().slice(0, 10);
};

// a holding at a newer price (between page redraws): value scaled by the move, the selling cost again (Taiwan: on the new
// value; elsewhere scaled), profit = value − exit − cost
export const revalue = (p: Position, np: number): Position => {
    if (p.price === null || !(p.price > 0) || np === p.price) return p;
    const value = Math.round((p.value * np) / p.price);
    const exit = p.q <= 0 ? 0 : p.currency === "TWD" ? autoFee(value, "TWD") + autoTax(value, "TWD", p.ticker) : Math.round((p.exit * np) / p.price);
    return { ...p, price: np, value, exit, pl: value - exit - p.cost };
};
// today's move of one holding in its own currency's minor units (TWD whole, USD cents): shares held from before today move by
// today's change, shares bought today from their own buy price; today's sells come out of the older shares first (their
// profit is realized). ch, last and trade prices in hundredths; q in shares × 10,000
export const todayMove = (p: Position, ch: number, last: number, today: string): number => {
    const buys = p.trades.filter((t) => t.date === today && t.type === "BUY");
    const boughtQ = buys.reduce((s, t) => s + t.q, 0);
    const old = Math.max(0, p.q - boughtQ), keptNew = Math.max(0, p.q - old), share = boughtQ > 0 ? keptNew / boughtQ : 0, m = minorOf(p.currency);
    const fromBuys = buys.reduce((s, t) => s + (t.q * share * (last - t.p) * m) / 1e6, 0);
    return Math.round((old * ch * m) / 1e6 + fromBuys);
};
