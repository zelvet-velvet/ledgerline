import { Notice } from "obsidian";
import { buildAccounts } from "../calc/accounts";
import { addTradingDays, autoFee, autoTax, grossOf, isTwEtf, tickOf, toP, toQ, buildPortfolio, capOf, checkRules, investCash, newWarnings, journalPath, minorOf, newTradeId, nextDca, readJournal, Position, syncEntries, tickerOf, Trade, tradeLinks } from "../calc/invest";
import { ACCOUNTS_FILE } from "./accounts";
import { FILES, FM } from "../data/store";
import { num, parseNum, shortDate, today } from "../format";
import { t } from "../i18n";
import { page } from "../ui";
import { openSearch } from "../ui/search";
import { brokersPage, flowCodes, flowsPage } from "./flows";
import { confirmSheet, Field, FormSheet, numText } from "../ui/sheet";
import type { PageDef, PageOut } from "./index";
import { PLAN_KEY, qty, X, liveBadge, flowTickers, guessCur, warnText } from "./invest-shared";
import { home } from "./invest-home";
import { mixPage, rulesPage } from "./invest-mix";
import { assetPage, tradesPage, tickerPage, journalPage } from "./invest-ticker";
import { holdingsPage } from "./invest-holdings";
import { editThesis } from "./invest-thesis";
import { revenuePage } from "./invest-revenue";
import { alertsPage } from "./invest-alerts";
import { mapPage } from "./invest-flow";
import { watchPage } from "./invest-watch";

const NEW = "__new__";
let xs!: X;   // the newest Invest page context, for the open search bar (search above)
const list = (v: unknown): FM[] => (Array.isArray(v) ? v : v ? [v] : []) as FM[];

// Phase 5 Invest (redesign C). Data: Config/Investment Config (assets with their trades, allocation targets, watchlist), in the
// same format as the v2 scripts. Prices come from the price provider in the background (prices/), never blocking a page.

export const investPage: PageDef = {
    id: "invest", label: "tabInvest", icon: "trending-up",
    render(ctx) {
        const { store, settings, prices } = ctx.plugin;
        const cur = settings.baseCurrency;
        const CFG = store.path(FILES.invest);
        const fm = store.fm(CFG);
        const fb = (fm?.fx_fallback ?? {}) as Record<string, number>;
        const P = buildPortfolio(fm, (tk) => prices.price(tk), (c) => prices.fx(c, cur, fb), today());
        // what is due: every held ticker, the watchlist, the FX rates they need
        const curs = [...new Set(P.positions.map((p) => p.currency).filter((c) => c !== cur))];
        const held = [...P.positions.filter((p) => p.shares > 0).map((p) => prices.symbol(p.ticker)), ...P.watch.map((w) => prices.symbol(w))];
        prices.refresh([...held, ...curs.map((c) => prices.fxSymbol(c, cur))]);
        prices.track(held);   // kept up to date while their market trades (prices.background: Taiwan every 5 s, US every 15 s)

        // money put into investing so far (every month note's own amount, else the plan default) minus what was bought net
        const plan = store.fm(store.path(FILES.savings)) ?? {};
        const contributed = store.monthNotes().reduce((s, m) => s + (Number(m.fm[PLAN_KEY] !== undefined ? m.fm[PLAN_KEY] : plan[PLAN_KEY]) || 0), 0);
        // S2: cash to invest = what the buckets' cash accounts hold (Accounts), else the old way (plan money − net bought)
        const ACC = store.path(ACCOUNTS_FILE);
        const A = buildAccounts(store.fm(ACC));
        const cash = investCash(A.list, P.buckets.map((b) => b.key)) ?? contributed - P.bought;
        const links = new Map(tradeLinks(P, [...A.list.flatMap((a) => a.entries), ...A.unknown]).map((l) => [l.id, l]));
        const snap = (f: FM): FM => JSON.parse(JSON.stringify(f)) as FM;
        // after a trade is saved, edited or deleted: append the Accounts entries that make the books agree (never rewrite old ones)
        const book = async (fresh: FM, ids: string[]) => {
            if (!store.file(ACC)) return;
            const Q = buildPortfolio(fresh, (tk) => prices.price(tk), (c) => prices.fx(c, cur, fb), today());
            let n = 0;
            await store.update(ACC, (a) => {
                const B = buildAccounts(a);
                const out = syncEntries(Q, B.list, [...B.list.flatMap((x) => x.entries), ...B.unknown], ids, today());
                n = out.length;
                if (n) a.entries = [...list(a.entries), ...out];
            });
            if (n) new Notice(t("iBooked"));
        };

        const updateAsset = async (ticker: string, fn: (a: FM) => void): Promise<FM> => { let fresh: FM = {}; await store.update(CFG, (f) => { const a = list(f.assets).find((x) => tickerOf(x) === ticker); if (a) fn(a); fresh = snap(f); }); return fresh; };
        const recalc = (a: FM) => {   // keep the v2 fields (shares, avg_cost in the asset's currency) in step with the trades
            let held = 0, cost = 0;
            for (const tr of list(a.transactions)) { const n = Number(tr.shares) || 0, pr = Number(tr.price) || 0; if (String(tr.type).toUpperCase() === "BUY") { held += n; cost += n * pr; } else if (held > 0) { const s = Math.min(n, held); cost -= s * (cost / held); held -= s; } }
            a.shares = +held.toFixed(6); a.avg_cost = held > 0 ? +(cost / held).toFixed(4) : 0;
        };

        const trade = (preset?: string, pre: { price?: number; type?: "BUY" | "SELL" } = {}) => {
            const tickers = P.positions.map((p) => p.ticker);
            const buckets = list(fm?.allocation).map((b): [string, string] => [String(b.key), String(b.label ?? b.key)]);
            // sheet kit K: BUY | SELL words, ticker chips, shares / price dials (price from the live quote, shares from your last
            // trade), date chips, fee / tax / settles / FX folded and filled in (calc/invest: autoFee, autoTax, addTradingDays), a live total
            // a ticker not held yet, traded from its chart page: its currency from its market (a US listing is USD)
            const presetCur = preset && !P.positions.some((p) => p.ticker === preset) ? guessCur(prices.symbol(preset)) : null;
            const tkOf = (v: Record<string, string>) => preset ?? (v.asset === NEW ? (v.ticker ?? "").trim().toUpperCase() : v.asset ?? tickers[0] ?? "");
            const posOf = (v: Record<string, string>) => P.positions.find((p) => p.ticker === tkOf(v));
            const curOf = (v: Record<string, string>) => (!preset && v.asset === NEW ? v.currency || cur : posOf(v)?.currency ?? presetCur ?? cur);
            const grossV = (v: Record<string, string>) => { const n = parseNum(v.shares), pr = parseNum(v.price); return n > 0 && pr >= 0 ? grossOf(toQ(n), toP(pr), curOf(v)) : 0; };
            const major = (minor: number, c: string) => String(minor / minorOf(c));
            const minor = (s: string | undefined, c: string) => Math.round((parseNum(s ?? "") || 0) * minorOf(c));
            const live = (v: Record<string, string>) => { const q = prices.price(tkOf(v)); return q && q > 0 ? Math.round(q * 100) / 100 : null; };
            const closed = (c: string) => (d: string) => !!(c === "TWD" ? prices.calendar?.cal.tw : prices.calendar?.cal.us)?.[d];
            const money = (v: Record<string, string>) => {
                const c = curOf(v), g = grossV(v), fee = minor(v.fee, c), tax = v.type === "SELL" ? minor(v.tax, c) : 0;
                return { c, g, n: v.type === "SELL" ? g - fee - tax : g + fee };
            };
            new FormSheet(ctx.app, {
                title: t("iTrade"), subtitle: preset,
                submitText: (v) => { const m = money(v); return `${t("save").toUpperCase()} ${(v.type === "SELL" ? t("iSell") : t("iBuy")).toUpperCase()}${m.g ? ` · ${numText(major(m.n, m.c), minorOf(m.c) > 1 ? 2 : 0)}` : ""}`; },
                total: (v) => {
                    const m = money(v);
                    if (!m.g) return null;
                    const held = posOf(v)?.shares ?? 0;
                    return { text: `${v.type === "SELL" ? t("iYouGet") : t("iYouPay")} ${numText(major(m.n, m.c), minorOf(m.c) > 1 ? 2 : 0)} ${m.c}${v.type === "SELL" ? ` · ${t("iHoldN", { n: qty(held) })}` : ""}`, bad: v.type === "SELL" && parseNum(v.shares) > held + 1e-9 };
                },
                fields: [
                    { key: "type", label: t("iType"), type: "select", value: pre.type ?? "BUY", options: [["BUY", t("iBuy")], ["SELL", t("iSell")]] },
                    ...(preset ? [] : ([
                        { key: "asset", label: t("iAsset"), type: "select" as const, value: tickers[0] ?? NEW, options: [...tickers.map((x): [string, string] => [x, x]), [NEW, t("iNewAsset")] as [string, string]] },
                        { key: "ticker", label: t("iTicker"), type: "text" as const, required: true, showIf: (v: Record<string, string>) => v.asset === NEW },
                        { key: "currency", label: t("iCurrency"), type: "select" as const, value: cur, options: [[cur, cur], ...["USD", "TWD", "EUR", "JPY"].filter((c) => c !== cur).map((c): [string, string] => [c, c])], showIf: (v: Record<string, string>) => v.asset === NEW },
                        { key: "bucket", label: t("iBucket"), type: "select" as const, value: buckets[0]?.[0] ?? "other", options: buckets.length ? buckets : [["other", "Other"] as [string, string]], showIf: (v: Record<string, string>) => v.asset === NEW },
                    ] as Field[])),
                    { key: "shares", label: t("iShares"), type: "number", required: true, dec: 4,
                        step: (v) => (curOf(v) === "TWD" && parseNum(v.shares) >= 1000 ? 1000 : 1),
                        auto: (v) => { const last = posOf(v)?.trades.filter((x) => x.type === (v.type === "SELL" ? "SELL" : "BUY")).at(-1); return last ? String(last.shares) : ""; } },
                    { key: "price", label: t("iPrice"), type: "number", required: true, dec: 2, ...(pre.price ? { value: pre.price } : {}),
                        step: (v) => tickOf(toP(v.price), curOf(v), tkOf(v)) / 100,
                        auto: (v) => { const q = live(v); return q === null ? "" : String(q); },
                        tag: (v) => (live(v) !== null && parseNum(v.price) === live(v) ? t("iLive") : "") },
                    { key: "date", label: t("date"), type: "date", value: today(), required: true },
                    { key: "fee", label: t("iFee"), type: "number", required: false, fold: true, dec: (v) => (minorOf(curOf(v)) > 1 ? 2 : 0), step: (v) => (minorOf(curOf(v)) > 1 ? 0.01 : 1),
                        auto: (v) => { const c = curOf(v); return major(autoFee(grossV(v), c), c); },
                        brief: (v) => (curOf(v) === "TWD" ? "0.1425 %" : ""),
                        note: (v) => (curOf(v) === "TWD" ? t("iFeeNote", { gross: num(grossV(v)) }) : t("iFeeNoteX")) },
                    { key: "tax", label: t("iTax"), type: "number", required: false, fold: true, showIf: (v) => v.type === "SELL", dec: (v) => (minorOf(curOf(v)) > 1 ? 2 : 0), step: (v) => (minorOf(curOf(v)) > 1 ? 0.01 : 1),
                        auto: (v) => { const c = curOf(v); return major(autoTax(grossV(v), c, tkOf(v)), c); },
                        brief: (v) => (curOf(v) === "TWD" ? (isTwEtf(tkOf(v)) ? "0.1 %" : "0.3 %") : ""),
                        note: (v) => (curOf(v) === "TWD" ? t("iTaxNote", { pct: isTwEtf(tkOf(v)) ? "0.1 %" : "0.3 %", what: isTwEtf(tkOf(v)) ? "ETF" : t("iStock") }) : t("iFeeNoteX")) },
                    { key: "settled", label: t("iSettled"), type: "date", required: false, fold: true, auto: (v) => (v.date ? addTradingDays(v.date, curOf(v) === "TWD" ? 2 : 1, closed(curOf(v))) : ""),
                        brief: (v) => (curOf(v) === "TWD" ? "T+2" : "T+1"), note: (v) => t("iSettleNote", { when: curOf(v) === "TWD" ? "2 trading days after the trade" : "the next trading day" }) },
                    { key: "fx", label: t("iFx", { cur }), type: "number", required: false, fold: true, dec: 4, step: 0.01, showIf: (v) => curOf(v) !== cur,
                        auto: (v) => (curOf(v) !== cur ? String(prices.fx(curOf(v), cur, fb)) : ""), brief: () => t("iLive").toLowerCase() },
                    { key: "why", label: t("iWhy"), type: "text", required: false },
                ],
                validate: (v) => {
                    if (!preset && v.asset === NEW && tickers.includes(v.ticker.trim().toUpperCase())) return t("iExists");
                    if (!(parseNum(v.shares) > 0) || !(parseNum(v.price) >= 0)) return t("invalidNumber");
                    const held = P.positions.find((p) => p.ticker === (preset ?? v.asset))?.shares ?? 0;
                    if (v.type === "SELL" && parseNum(v.shares) > held + 1e-9) return t("iTooMany", { n: qty(held) });
                    return null;
                },
                onSubmit: async (v) => {
                    const tk = preset ?? (v.asset === NEW ? v.ticker.trim().toUpperCase() : v.asset);
                    const tr: FM = { type: v.type, shares: parseNum(v.shares), price: parseNum(v.price), date: v.date || today() };
                    if (v.fx && parseNum(v.fx) > 0) tr.fx = parseNum(v.fx);
                    if (parseNum(v.fee) > 0) tr.fee = parseNum(v.fee);
                    if (v.type === "SELL" && parseNum(v.tax) > 0) tr.tax = parseNum(v.tax);
                    if (v.settled) tr.settled = v.settled;
                    let fresh: FM = {}, id = "";
                    await store.update(CFG, (f) => {
                        const assets = list(f.assets);
                        let a = assets.find((x) => tickerOf(x) === tk);
                        const nc = preset ? presetCur : v.currency;
                        if (!a) { a = { name: tk, ticker: tk, category: v.bucket || "other", ...(nc && nc !== "TWD" ? { currency: nc } : {}), shares: 0, avg_cost: 0, transactions: [] }; assets.push(a); }
                        const P2 = buildPortfolio({ assets: [a] }, () => null, () => 1);
                        id = tr.id = newTradeId(tk, String(tr.date), P2.positions[0]?.trades.map((x) => x.id) ?? []);
                        a.transactions = [...list(a.transactions), tr];
                        recalc(a);
                        f.assets = assets;
                        fresh = snap(f);
                    });
                    await book(fresh, [id]);
                    // S5: say which rule this trade newly broke (a warning, the trade is saved)
                    const broke = newWarnings(checkRules(P, cap, () => true), checkRules(buildPortfolio(fresh, (q) => prices.price(q), (c) => prices.fx(c, cur, fb), today()), cap, () => true));
                    if (broke.length) new Notice(broke.map(warnText).join("\n"), 8000);
                    if (v.why?.trim()) await think(tk, { date: tr.date, trade: id, why: v.why.trim() });
                    new Notice(t("iSaved", { what: v.type === "SELL" ? t("iSell") : t("iBuy"), n: qty(parseNum(v.shares)), tk }));
                },
            }).open();
        };

        const editTrade = (p: Position, tr: Trade) => new FormSheet(ctx.app, {
            title: `${tr.type === "SELL" ? t("iSell") : t("iBuy")} · ${p.ticker}`, subtitle: tr.date ? shortDate(tr.date) : undefined, submitText: t("save"),
            fields: [
                { key: "shares", label: t("iShares"), type: "number", value: tr.shares, required: true, dec: 4, step: (v) => (p.currency === "TWD" && parseNum(v.shares) >= 1000 ? 1000 : 1) },
                { key: "price", label: t("iPrice"), type: "number", value: tr.price, required: true, dec: 2, step: (v) => tickOf(toP(v.price), p.currency, p.ticker) / 100 },
                { key: "date", label: t("date"), type: "date", value: tr.date, required: true },
                { key: "fee", label: t("iFee"), type: "number", value: tr.fee ? tr.fee / minorOf(p.currency) : "", required: false, fold: true, dec: minorOf(p.currency) > 1 ? 2 : 0 },
                ...(tr.type === "SELL" ? [{ key: "tax", label: t("iTax"), type: "number" as const, value: tr.tax ? tr.tax / minorOf(p.currency) : "", required: false, fold: true, dec: minorOf(p.currency) > 1 ? 2 : 0 }] : []),
                { key: "settled", label: t("iSettled"), type: "date", value: tr.settled, required: false, fold: true },
                ...(p.currency !== cur ? [{ key: "fx", label: t("iFx", { cur }), type: "number" as const, value: tr.fx || "", required: false, fold: true, dec: 4, step: 0.01 }] : []),
            ],
            onSubmit: async (v) => {
                const fresh = await updateAsset(p.ticker, (a) => {
                    const x = list(a.transactions)[tr.index]; if (!x) return;
                    x.id = tr.id;   // keep the id the Accounts entries link to, even when the date changes
                    x.shares = parseNum(v.shares); x.price = parseNum(v.price); x.date = v.date;
                    if (v.fx !== undefined) { if (parseNum(v.fx) > 0) x.fx = parseNum(v.fx); else delete x.fx; }
                    for (const k of ["fee", "tax"] as const) if (v[k] !== undefined) { if (parseNum(v[k]) > 0) x[k] = parseNum(v[k]); else delete x[k]; }
                    if (v.settled) x.settled = v.settled; else delete x.settled;
                    recalc(a);
                });
                await book(fresh, [tr.id]);
                new Notice(t("iUpdated", { tk: p.ticker }));
            },
            danger: { text: t("iDeleteTrade"), onTap: async () => {
                if (!(await confirmSheet(ctx.app, t("iDeleteTrade"), t("iDeleteTradeQ", { n: qty(tr.shares), tk: p.ticker, date: tr.date || "-" }), t("delete")))) return false;
                // the other trades keep their ids: write the default ids before one is taken out
                const fresh = await updateAsset(p.ticker, (a) => { const xs = list(a.transactions); p.trades.forEach((q) => { if (xs[q.index]) xs[q.index].id = q.id; }); if (xs[tr.index]) { xs.splice(tr.index, 1); a.transactions = xs; recalc(a); } });
                await book(fresh, [tr.id]);
                return true;
            } },
        }).open();

        // S5: rules (warnings only)
        const cap = capOf(fm);
        const warns = checkRules(P, cap, (tk) => readJournal(store.fm(journalPath(tk))).length > 0);

        // S4: one line in the holding's journal (the note is made on the first line)
        const think = (tk: string, j: FM) => store.update(journalPath(tk), (f) => { f.ticker = tk; f.journal = [...list(f.journal), j]; });
        const addThought = (tk: string) => new FormSheet(ctx.app, {
            title: t("iThought"), subtitle: tk, submitText: t("save"),
            fields: [{ key: "why", label: t("iWhyNote"), type: "text", required: true }, { key: "date", label: t("date"), type: "date", value: today(), required: true }],
            onSubmit: async (v) => { await think(tk, { date: v.date || today(), why: v.why.trim() }); },
        }).open();
        const journal = (tk: string) => readJournal(store.fm(journalPath(tk)));

        // S3: the holding's broker and monthly buy (dca: amount on a day of the month)
        const editPlan = (p: Position) => new FormSheet(ctx.app, {
            title: t("iPlanT"), subtitle: p.ticker, submitText: t("save"),
            fields: [
                { key: "broker", label: t("iBroker"), type: "text", value: p.broker, required: false },
                { key: "amount", label: t("iDcaAmount", { cur }), type: "number", value: p.dca?.amount ?? "", required: false, step: 100 },
                { key: "day", label: t("iDcaDay"), type: "number", value: p.dca?.day ?? "", required: false, step: 1,
                    tag: (v) => { const d = Math.round(parseNum(v.day)); const n = d >= 1 && d <= 31 ? nextDca({ amount: 1, day: d }, today()) : null; return n ? shortDate(n).toUpperCase() : ""; } },
            ],
            validate: (v) => (v.day && !(parseNum(v.day) >= 1 && parseNum(v.day) <= 31) ? t("invalidNumber") : null),
            onSubmit: async (v) => {
                await updateAsset(p.ticker, (a) => {
                    if (v.broker.trim()) a.broker = v.broker.trim(); else delete a.broker;
                    if (parseNum(v.amount) > 0) a.dca = { amount: Math.round(parseNum(v.amount)), day: Math.round(parseNum(v.day)) || 1 }; else delete a.dca;
                });
                new Notice(t("iUpdated", { tk: p.ticker }));
            },
        }).open();

        const addWatch = () => new FormSheet(ctx.app, {
            title: t("iWatchAdd"), submitText: t("add"),
            fields: [{ key: "tk", label: t("iTicker"), type: "text", required: true }],
            validate: (v) => (P.watch.includes(v.tk.trim().toUpperCase()) ? t("iExists") : null),
            onSubmit: async (v) => { await store.update(CFG, (f) => { f.watchlist = [...list(f.watchlist), { ticker: v.tk.trim().toUpperCase() }]; }); },
        }).open();
        const dropWatch = async (tk: string) => {
            if (!(await confirmSheet(ctx.app, t("iWatchRemove"), t("iWatchRemoveQ", { tk }), t("remove")))) return;
            await store.update(CFG, (f) => { f.watchlist = list(f.watchlist).filter((w) => String(w.ticker ?? "").toUpperCase() !== tk); });
        };

        // the scope: a search bar across the top line (ui/search.ts); a pick opens the ticker's chart (a holding: its page)
        // the search reads the newest page context (xs, set on every render): it stays open through live redraws
        const search = (from: HTMLElement) => {
            const src = ctx.plugin.search, held = () => xs.P.positions.filter((p) => p.shares > 0).map((p) => p.ticker);
            openSearch(from, src, {
                mine: (q) => {
                    const s = q.toUpperCase(), hit = (tk: string) => tk.startsWith(s) || src.nameOf(tk).toUpperCase().includes(s);
                    return [...held().filter(hit).map((tk) => ({ tk, name: src.nameOf(tk), ex: "", mine: "held" as const })), ...xs.P.watch.filter(hit).map((tk) => ({ tk, name: src.nameOf(tk), ex: "", mine: "watch" as const }))];
                },
                pick: (tk) => xs.ctx.push(held().includes(tk) ? { key: "asset:" + tk, title: tk } : { key: "chart:" + tk, title: tk }),
                texts: { placeholder: t("sPlaceholder"), cancel: t("sCancel"), recent: t("sRecent"), clear: t("sClear"), none: t("sNone"), held: t("sHeld"), watch: t("sWatch") },
            });
        };
        // a new order for some watched tickers (a drag in MANUAL): they take the places they held, in the given order, so the
        // other market's tickers stay where they are in the note
        const moveWatch = async (order: string[]) => {
            const set = new Set(order), tkOf = (w: Record<string, unknown>) => String(w.ticker ?? "").toUpperCase();
            await store.update(CFG, (f) => {
                const ws = list(f.watchlist), by = new Map(ws.map((w) => [tkOf(w), w]));
                let i = 0;
                f.watchlist = ws.map((w) => (set.has(tkOf(w)) ? by.get(order[i++]) ?? w : w));
            });
        };
        const watchOn = async (tk: string) => { await store.update(CFG, (f) => { f.watchlist = [...list(f.watchlist), { ticker: tk }]; }); };

        const x: X = { ctx, P, cur, cash, links, warns, cap, fx: (c: string) => prices.fx(c, cur, fb), trade, editThesis: (tk: string) => editThesis(x, tk), editTrade, editPlan, addThought, journal, addWatch, dropWatch, moveWatch, search, watchOn };
        xs = x;
        const pageFor = (key: string): PageOut => {
            if (key === "holdings") return holdingsPage(x);
            if (key === "watch") return watchPage(x);
            if (key.startsWith("chart:")) return tickerPage(x, key.slice(6));
            if (key === "rules") return rulesPage(x);
            if (key === "mix") return mixPage(x);
            if (key === "map") return mapPage(x);
            if (key.startsWith("revenue:")) return revenuePage(x, key.slice(8));
            if (key === "alerts") return alertsPage(x);
            if (key.startsWith("brokers:")) return brokersPage(ctx, key.slice(8), (tk) => trade(tk));
            if (key.startsWith("flows:")) return flowsPage(ctx, key.slice(6), flowCodes(ctx, flowTickers(P)), (tk) => trade(tk));
            if (key.startsWith("trades:")) { const p = P.positions.find((q) => q.ticker === key.slice(7)); if (p) return tradesPage(x, p); }
            if (key.startsWith("journal:")) return journalPage(x, key.slice(8));
            if (key.startsWith("asset:")) { const p = P.positions.find((q) => q.ticker === key.slice(6)); if (p) return assetPage(x, p); }
            return home(x);
        };
        // every Invest page carries the market badge (TW TRADING / US OPENS 22:30)
        const out = pageFor(ctx.frame.key);
        out.badge ??= liveBadge(x);
        return out;
    },
};
export { investUnload } from "./invest-home";
