// Ticker search (the magnifier, 2026-11-04): what you hold or watch first, then TWSE listings by code or Chinese name, then
// Yahoo's search for the rest of the world. A hit is a ticker as the app keeps it (Taiwan listings without ".TW").
export interface Hit { tk: string; name: string; ex: string; mine?: "held" | "watch" }

// the app's ticker for a provider symbol: "2330.TW" → "2330" when Taiwan tickers are typed bare
export const appTicker = (sym: string, taiwan: boolean): string => { const s = sym.trim().toUpperCase(); return taiwan ? s.replace(/^(\d{4,6}[A-Z]?)\.TW$/, "$1") : s; };

// TWSE's day report (STOCK_DAY_ALL) → [code, name] pairs
export const fromTwseAll = (json: unknown): [string, string][] =>
    Array.isArray(json) ? (json as { Code?: string; Name?: string }[]).filter((r) => r.Code && r.Name).map((r) => [String(r.Code).trim(), String(r.Name).trim()]) : [];

// listings matching what is typed: digits match the code's start, anything else the name (or code) anywhere; exact first
export const matchListed = (list: [string, string][], q: string, n = 8): [string, string][] => {
    const s = q.trim().toUpperCase();
    if (!s) return [];
    const score = ([c, name]: [string, string]) => c === s ? 0 : c.startsWith(s) ? 1 : name.toUpperCase().startsWith(s) ? 2 : name.toUpperCase().includes(s) || (!/^\d+$/.test(s) && c.includes(s)) ? 3 : -1;
    return list.map((x) => [x, score(x)] as const).filter(([, k]) => k >= 0)
        .sort((a, b) => a[1] - b[1] || a[0][0].length - b[0][0].length || a[0][0].localeCompare(b[0][0])).slice(0, n).map(([x]) => x);
};

// Yahoo search → hits (stocks, ETFs, funds, indexes; no options or futures)
export const fromYahooSearch = (json: unknown, taiwan: boolean): Hit[] => {
    const qs = (json as { quotes?: { symbol?: string; shortname?: string; longname?: string; exchDisp?: string; quoteType?: string }[] })?.quotes ?? [];
    return qs.filter((q) => q.symbol && /^(EQUITY|ETF|MUTUALFUND|INDEX)$/.test(q.quoteType ?? ""))
        .map((q) => ({ tk: appTicker(q.symbol!, taiwan), name: q.shortname ?? q.longname ?? "", ex: q.exchDisp ?? "" }));
};

// one list, each ticker once, in the order given
export const mergeHits = (...lists: Hit[][]): Hit[] => {
    const seen = new Set<string>(), out: Hit[] = [];
    for (const l of lists) for (const x of l) if (!seen.has(x.tk)) { seen.add(x.tk); out.push(x); }
    return out;
};

// recent searches: newest first, each once, at most `max`
export const pushHistory = (list: string[], tk: string, max = 10): string[] => [tk, ...list.filter((x) => x !== tk)].slice(0, max);
