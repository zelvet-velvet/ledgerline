import { test } from "node:test";
import assert from "node:assert/strict";
import { buildAccounts } from "../src/calc/accounts";
import { addTradingDays, autoFee, autoTax, buildPortfolio, legacyFields, tradeTotal, tickOf, capOf, checkRules, grossOf, investCash, newWarnings, readJournal, newTradeId, nextDca, syncEntries, toBase, toP, toQ, tradeLinks, unbooked, cashAccountOf, guessCategory } from "../src/calc/invest";

const noPrice = () => null;
const usd = (c: string) => (c === "USD" ? 32 : 1);
const one = (assets: unknown[], price: (t: string) => number | null = noPrice, today = "") => buildPortfolio({ assets }, price, usd, today);

test("integer units: shares to 4 decimals, prices in hundredths, no float drift", () => {
    assert.equal(toQ(0.1 + 0.2), 3000);
    assert.equal(toP(150), 15000);
    assert.equal(grossOf(toQ(100), toP(150), "TWD"), 15000);
    assert.equal(grossOf(toQ(1.5), toP(412.37), "USD"), 61856);   // cents: 618.555 → 618.56
    assert.equal(toBase(61856, "USD", 32.1), 19856);
});

test("the 0050 buy costs 15,000 plus its fee", () => {
    const P = one([{ ticker: "0050", transactions: [{ type: "BUY", shares: 100, price: 150, fee: 21, date: "2026-11-02" }] }]);
    const p = P.positions[0];
    assert.equal(p.cost, 15021);
    assert.equal(p.trades[0].cash, -15021);
    assert.equal(p.fees, 21);
    assert.equal(P.bought, 15021);
});

test("value and profit at the last price", () => {
    const P = one([{ ticker: "0050", transactions: [{ type: "BUY", shares: 100, price: 150, date: "2026-11-02" }] }], () => 152.5);
    assert.equal(P.value, 15250);
    // if sold now: fee 21 (0.1425 %) + ETF tax 15 (0.1 %) come off, as brokers' 預估損益 count
    assert.equal(P.positions[0].exit, 36);
    assert.equal(P.pl, 214);
    assert.ok(P.priced);
});

test("a sell takes the average cost out; its fee and tax come off the proceeds", () => {
    const P = one([{ ticker: "2330", transactions: [
        { type: "BUY", shares: 3, price: 100, fee: 1, date: "2026-01-01" },
        { type: "SELL", shares: 1, price: 130, fee: 1, tax: 1, date: "2026-02-01" },
    ] }]);
    const p = P.positions[0];
    assert.equal(p.cost, 201);        // 301 × 2 / 3 = 200.67 → 201
    assert.equal(p.realized, 28);     // 128 − 100
    assert.equal(p.fees, 3);
    assert.equal(p.bought, 301 - 128);
});

test("selling everything leaves no cost behind, whatever the rounding", () => {
    const P = one([{ ticker: "X", transactions: [
        { type: "BUY", shares: 3, price: 10.01, date: "2026-01-01" },
        { type: "SELL", shares: 1, price: 11, date: "2026-02-01" },
        { type: "SELL", shares: 2, price: 11, date: "2026-03-01" },
    ] }]);
    const p = P.positions[0];
    assert.equal(p.q, 0);
    assert.equal(p.cost, 0);
    assert.equal(p.realized, 33 - 30);
});

test("USD trades use their own FX rate; cents stay exact", () => {
    const P = one([{ ticker: "VOO", currency: "USD", transactions: [{ type: "BUY", shares: 0.5, price: 500.01, fee: 1.5, fx: 31.5, date: "2026-01-01" }] }]);
    const p = P.positions[0];
    assert.equal(p.trades[0].gross, 25001);      // $250.005 → 250.01 in cents
    assert.equal(p.trades[0].fee, 150);
    assert.equal(p.cost, Math.round(251.51 * 31.5));
});

test("a trade settling after today is pending", () => {
    const tr = { type: "BUY", shares: 100, price: 150, date: "2026-11-02", settled: "2026-11-04" };
    assert.equal(one([{ ticker: "0050", transactions: [tr] }], noPrice, "2026-11-03").positions[0].trades[0].pending, true);
    assert.equal(one([{ ticker: "0050", transactions: [tr] }], noPrice, "2026-11-04").positions[0].trades[0].pending, false);
});

test("trade ids: typed, else ticker-date with a number for a second trade that day", () => {
    const P = one([{ ticker: "0050", transactions: [
        { type: "BUY", shares: 1, price: 1, date: "2026-11-02" },
        { type: "BUY", shares: 1, price: 1, date: "2026-11-02" },
        { id: "mine", type: "BUY", shares: 1, price: 1, date: "2026-11-03" },
    ] }]);
    assert.deepEqual(P.positions[0].trades.map((t) => t.id), ["0050-2026-11-02", "0050-2026-11-02-2", "mine"]);
});

test("accounts entries linked by trade id agree with the trade", () => {
    const P = one([{ ticker: "0050", transactions: [{ type: "BUY", shares: 100, price: 150, fee: 21, date: "2026-11-02" }] }]);
    const ok = tradeLinks(P, [{ trade: "0050-2026-11-02", amount: -15000 }, { trade: "0050-2026-11-02", amount: -21 }]);
    assert.equal(ok[0].diff, 0);
    const missingFee = tradeLinks(P, [{ trade: "0050-2026-11-02", amount: -15000 }]);
    assert.equal(missingFee[0].diff, 21);
});

test("broker from the asset, dca read as whole dollars", () => {
    const p = one([{ ticker: "0050", broker: "Broker A", dca: { amount: 3000.4, day: 6 }, transactions: [] }]).positions[0];
    assert.equal(p.broker, "Broker A");
    assert.deepEqual(p.dca, { amount: 3000, day: 6 });
});

test("next planned buy: this month's day, else next month's, clamped to the month", () => {
    assert.equal(nextDca({ amount: 1, day: 6 }, "2026-11-04"), "2026-11-06");
    assert.equal(nextDca({ amount: 1, day: 6 }, "2026-11-06"), "2026-11-06");
    assert.equal(nextDca({ amount: 1, day: 6 }, "2026-11-07"), "2026-12-06");
    assert.equal(nextDca({ amount: 1, day: 31 }, "2026-11-04"), "2026-11-30");
    assert.equal(nextDca({ amount: 1, day: 6 }, "2026-12-20"), "2027-01-06");
    assert.equal(nextDca(null, "2026-11-04"), null);
});

// S2 cash link
const accts = [{ key: "etf_cash", bucket: "etf" }, { key: "main", bucket: "" }];
const buy0050 = (extra: object = {}) => one([{ ticker: "0050", category: "etf", transactions: [{ type: "BUY", shares: 100, price: 150, fee: 21, date: "2026-11-02", settled: "2026-11-04", ...extra }] }]);

test("a new trade writes its buy and its fee into the bucket's cash account, on the settle day", () => {
    const out = syncEntries(buy0050(), accts, [], ["0050-2026-11-02"], "2026-11-05");
    assert.deepEqual(out.map((e) => [e.account, e.kind, e.amount, e.date, e.trade]), [
        ["etf_cash", "buy", -15000, "2026-11-04", "0050-2026-11-02"],
        ["etf_cash", "fee", -21, "2026-11-04", "0050-2026-11-02"],
    ]);
});

test("written entries add up to the trade's cash, also in USD with rounding", () => {
    const P = one([{ ticker: "VOO", category: "etf", currency: "USD", transactions: [{ type: "BUY", shares: 0.5, price: 500.01, fee: 1.5, fx: 31.5, date: "2026-01-01" }] }]);
    const out = syncEntries(P, accts, [], ["VOO-2026-01-01"], "2026-01-02");
    assert.equal(out.reduce((s, e) => s + e.amount, 0), P.positions[0].trades[0].cash);
});

test("a sell books the proceeds and takes fee and tax apart", () => {
    const P = one([{ ticker: "0050", category: "etf", transactions: [
        { type: "BUY", shares: 10, price: 100, date: "2026-01-01" },
        { type: "SELL", shares: 10, price: 110, fee: 20, tax: 1, date: "2026-02-01" },
    ] }]);
    const out = syncEntries(P, accts, [], ["0050-2026-02-01"], "2026-02-02");
    assert.deepEqual(out.map((e) => [e.kind, e.amount]), [["sell", 1100], ["fee", -21]]);
});

test("an edited trade adds an adjust for the difference; the old entries stay", () => {
    const booked = [{ trade: "0050-2026-11-02", amount: -15000, account: "etf_cash" }];
    const out = syncEntries(buy0050(), accts, booked, ["0050-2026-11-02"], "2026-11-05");
    assert.deepEqual(out.map((e) => [e.kind, e.amount, e.date]), [["adjust", -21, "2026-11-05"]]);
    assert.deepEqual(syncEntries(buy0050(), accts, [...booked, { trade: "0050-2026-11-02", amount: -21, account: "etf_cash" }], ["0050-2026-11-02"], "2026-11-05"), []);
});

test("a bucket written in capitals or with spaces still books its category's trades", () => {
    const A = buildAccounts({ accounts: [{ key: "etf_box", bucket: "ETF " }, { key: "stock_box", bucket: "Stock" }] });
    assert.equal(cashAccountOf("etf", A.list), "etf_box");
    assert.equal(cashAccountOf(" STOCK", A.list), "stock_box");
    assert.equal(cashAccountOf("other", A.list), undefined);
    assert.equal(cashAccountOf("", A.list), undefined);
    const P = one([{ ticker: "0050", category: " ETF", transactions: [{ type: "BUY", shares: 250, price: 85.8, fee: 30, date: "2026-11-20", settled: "2026-11-24" }] }]);
    assert.equal(P.positions[0].category, "etf");
    const out = syncEntries(P, A.list, [], ["0050-2026-11-20"], "2026-11-20");
    assert.deepEqual(out.map((e) => [e.account, e.kind, e.amount, e.date]), [["etf_box", "buy", -21450, "2026-11-24"], ["etf_box", "fee", -30, "2026-11-24"]]);
});

test("trades with no cash account for their category are named, booked ones are not", () => {
    const P = one([
        { ticker: "0050", category: "etf", transactions: [{ type: "BUY", shares: 250, price: 85.8, date: "2026-11-20" }] },
        { ticker: "3515", category: "other", transactions: [{ type: "BUY", shares: 30, price: 400, date: "2026-11-20" }] },
        { ticker: "2395", transactions: [{ type: "BUY", shares: 10, price: 300, date: "2026-11-20" }] },
    ]);
    const ids = ["0050-2026-11-20", "3515-2026-11-20", "2395-2026-11-20"];
    assert.deepEqual(unbooked(P, accts, [], ids).map((m) => [m.ticker, m.category]), [["3515", "other"], ["2395", "other"]]);
    assert.deepEqual(syncEntries(P, accts, [], ids, "2026-11-20").map((e) => e.trade), ["0050-2026-11-20"]);
    // one already booked by hand is not unbooked, even with no account for its category
    assert.deepEqual(unbooked(P, accts, [{ trade: "3515-2026-11-20" }], ids).map((m) => m.ticker), ["2395"]);
});

test("a deleted trade is cancelled by an adjust", () => {
    const out = syncEntries(one([]), accts, [{ trade: "0050-2026-11-02", amount: -20789, account: "etf_cash" }], ["0050-2026-11-02"], "2026-11-05");
    assert.deepEqual(out.map((e) => [e.account, e.kind, e.amount]), [["etf_cash", "adjust", 20789]]);
});

test("no cash account for the holding's bucket: nothing is written", () => {
    const P = one([{ ticker: "2330", category: "stock", transactions: [{ type: "BUY", shares: 1, price: 1000, date: "2026-11-02" }] }]);
    assert.deepEqual(syncEntries(P, accts, [], ["2330-2026-11-02"], "2026-11-05"), []);
});

test("new trade ids never repeat", () => {
    assert.equal(newTradeId("0050", "2026-11-02", []), "0050-2026-11-02");
    assert.equal(newTradeId("0050", "2026-11-02", ["0050-2026-11-02", "0050-2026-11-02-2"]), "0050-2026-11-02-3");
});

test("cash to invest is what the buckets' cash accounts hold", () => {
    const list = [{ bucket: "etf", balance: 75000 }, { bucket: "stock", balance: 40000 }, { bucket: "bond", balance: 8000 }, { bucket: "", balance: 8000 }];
    assert.equal(investCash(list, ["etf", "stock", "bond"]), 123000);
    assert.equal(investCash([{ bucket: "", balance: 1 }], ["etf"]), null);
});

test("journal: newest first, empty lines left out", () => {
    const js = readJournal({ journal: [{ date: "2026-11-02", trade: "0050-2026-11-02", why: "core ETF" }, { date: "2026-11-04", why: "  " }, { date: "2026-11-03", why: "hold" }] });
    assert.deepEqual(js.map((j) => [j.date, j.trade, j.why]), [["2026-11-03", "", "hold"], ["2026-11-02", "0050-2026-11-02", "core ETF"]]);
});

// S5 rules
const rulesFm = (stockShares: number) => ({
    rebalance_threshold: 5,
    allocation: [{ key: "etf", label: "ETF", pct: 60 }, { key: "stock", label: "Stocks", pct: 40 }],
    assets: [
        { ticker: "0050", category: "etf", transactions: [{ type: "BUY", shares: 200, price: 100, date: "2026-11-02" }] },
        { ticker: "2330", category: "stock", transactions: [{ type: "BUY", shares: stockShares, price: 1000, fee: 20, date: "2026-11-02" }] },
    ],
});
const P5 = (n: number) => buildPortfolio(rulesFm(n), noPrice, usd);

test("single-stock cap: total cost held in one stock, fees included; ETFs are free", () => {
    assert.deepEqual(checkRules(P5(14), 15000, () => true).filter((w) => w.rule === "cap"), []);
    assert.deepEqual(checkRules(P5(15), 15000, () => true).filter((w) => w.rule === "cap"), [{ rule: "cap", key: "2330", over: 20 }]);
    assert.equal(capOf({}), 15000);
    assert.equal(capOf({ single_stock_cap: 20000 }), 20000);
});

test("mix past the threshold warns per bucket", () => {
    const w = checkRules(P5(10), 15000, () => true).filter((x) => x.rule === "mix");   // 20,000 / 10,020: 67% / 33%
    assert.deepEqual(w.map((x) => [x.key, x.over]), [["ETF", 7], ["Stocks", -7]]);
});

test("a holding with nothing in its journal warns", () => {
    assert.deepEqual(checkRules(P5(10), 15000, (tk) => tk === "0050").filter((x) => x.rule === "reason").map((x) => x.key), ["2330"]);
});

test("a trade's new warnings leave out what was already broken", () => {
    const before = checkRules(P5(10), 15000, () => true), after = checkRules(P5(16), 15000, () => true);
    assert.deepEqual(newWarnings(before, after).map((w) => w.rule), ["cap"]);
});

test("sheet kit: Taiwan fee rounded down with a 20 minimum, none elsewhere", () => {
    assert.equal(autoFee(15000, "TWD"), 21);
    assert.equal(autoFee(5000, "TWD"), 20);
    assert.equal(autoFee(0, "TWD"), 0);
    assert.equal(autoFee(61856, "USD"), 0);
});

test("sheet kit: sell tax 0.3 %, ETFs 0.1 %, rounded down", () => {
    assert.equal(autoTax(182350, "TWD", "2330"), 547);
    assert.equal(autoTax(15000, "TWD", "0050"), 15);
    assert.equal(autoTax(15000, "USD", "VOO"), 0);
});

test("sheet kit: TWSE price steps", () => {
    assert.equal(tickOf(995, "TWD", "2330"), 1);
    assert.equal(tickOf(4995, "TWD", "2330"), 5);
    assert.equal(tickOf(18235, "TWD", "2317"), 50);
    assert.equal(tickOf(105000, "TWD", "2330"), 500);
    assert.equal(tickOf(15000, "TWD", "0050"), 5);
    assert.equal(tickOf(4000, "TWD", "00878"), 1);
    assert.equal(tickOf(41237, "USD", "VOO"), 1);
});

test("sheet kit: settles two trading days later, weekends and closed days skipped", () => {
    assert.equal(addTradingDays("2026-11-05", 2), "2026-11-09");   // Thu → Mon
    assert.equal(addTradingDays("2026-11-03", 2), "2026-11-05");
    assert.equal(addTradingDays("2026-11-05", 2, (d) => d === "2026-11-06"), "2026-11-10");
});

test("selling cost: a stock pays 0.3 % tax, a US holding none", () => {
    const P = one([{ ticker: "2330", transactions: [{ type: "BUY", shares: 10, price: 1000, fee: 20, date: "2026-11-02" }] }, { ticker: "AAPL", currency: "USD", transactions: [{ type: "BUY", shares: 1, price: 100, fx: 32, date: "2026-11-02" }] }], (t) => (t === "2330" ? 1100 : 110));
    const tw = P.positions.find((p) => p.ticker === "2330")!, us = P.positions.find((p) => p.ticker === "AAPL")!;
    assert.equal(tw.exit, 20 + 33);   // fee floor(11,000 × 0.1425 %) = 15 → the 20 minimum; tax 33
    assert.equal(tw.pl, 11000 - 53 - 10020);
    assert.equal(us.exit, 0);
});

test("today's move: old shares by today's change, today's buys from their buy price", async () => {
    const { todayMove, revalue } = await import("../src/calc/invest");
    const P = one([{ ticker: "2330", transactions: [
        { type: "BUY", shares: 10, price: 1000, date: "2026-11-09" },
        { type: "BUY", shares: 5, price: 1090, date: "2026-11-10" },
    ] }], () => 1100);
    const p = P.positions[0];
    // yesterday's close 1,080 → change +20: 10 old shares +200; 5 bought at 1,090 today +50
    assert.equal(todayMove(p, 2000, 110000, "2026-11-10"), 250);
    assert.equal(todayMove(p, 2000, 110000, "2026-11-11"), 300);   // the next day all 15 count by the change
    const sold = one([{ ticker: "2330", transactions: [{ type: "BUY", shares: 10, price: 1000, date: "2026-11-09" }, { type: "SELL", shares: 4, price: 1100, date: "2026-11-10" }] }], () => 1100).positions[0];
    assert.equal(todayMove(sold, 2000, 110000, "2026-11-10"), 120);   // 6 still held
    const r = revalue(p, 1200);
    assert.equal(r.value, 18000);
    assert.equal(r.exit, autoFee(18000, "TWD") + autoTax(18000, "TWD", "2330"));
    assert.equal(r.pl, 18000 - r.exit - p.cost);
});

// ---- review 2026-11, group A: foreign holdings, FX never guessed
const voo = [{ ticker: "VOO", currency: "USD", transactions: [{ type: "BUY", shares: 1.5, price: 612.4, fx: 31.85, date: "2026-10-21" }] }];
test("a foreign holding's average cost stays in its own currency whatever today's FX", () => {
    const at = (rate: number) => buildPortfolio({ assets: voo }, () => 680.26, () => rate).positions[0];
    assert.equal(at(31.85).avgP, 61240);
    assert.equal(at(32.967).avgP, 61240);   // was 591.64 when the TWD cost was divided by today's rate
    assert.equal(at(32.967).cost, 29257);   // 918.60 USD at the trade's own 31.85
});
test("the average cost in its own currency counts the buy fee and follows a partial sale", () => {
    const p = buildPortfolio({ assets: [{ ticker: "AAA", currency: "USD", transactions: [
        { type: "BUY", shares: 2, price: 100, fee: 1, fx: 32, date: "2026-01-02" },
        { type: "SELL", shares: 1, price: 120, fx: 32, date: "2026-02-02" },
    ] }] }, noPrice, usd).positions[0];
    assert.equal(p.avgP, 10050);   // (200 + 1) / 2 per share, the share left keeps it
    assert.equal(p.shares, 1);
});
test("an unknown FX rate is never 1: the holding is marked, valued at its cost, and the portfolio is not priced", () => {
    const P = buildPortfolio({ assets: voo }, () => 680.26, () => 0);
    const p = P.positions[0];
    assert.equal(p.fxMissing, true);
    assert.equal(p.value, p.cost);
    assert.equal(p.pl, 0);
    assert.equal(P.priced, false);
    assert.deepEqual(P.missing, ["VOO"]);
});
test("a foreign trade without its own rate and with none known now marks the holding", () => {
    const P = buildPortfolio({ assets: [{ ticker: "VOO", currency: "USD", transactions: [{ type: "BUY", shares: 1, price: 600, date: "2026-10-21" }] }] }, () => 600, () => 0);
    assert.equal(P.positions[0].fxMissing, true);
    assert.equal(P.positions[0].cost, 0);
});
test("a holding without a price is named in missing", () => {
    const P = one([{ ticker: "00679B", transactions: [{ type: "BUY", shares: 200, price: 27.9, date: "2026-10-01" }] }, { ticker: "0050", transactions: [{ type: "BUY", shares: 1, price: 100, date: "2026-10-01" }] }], (tk) => (tk === "0050" ? 100 : null));
    assert.deepEqual(P.missing, ["00679B"]);
    assert.equal(P.priced, false);
});
test("the base currency is a parameter: a USD base holds USD at 1 and converts TWD", () => {
    const P = buildPortfolio({ assets: [
        { ticker: "VOO", currency: "USD", transactions: [{ type: "BUY", shares: 1, price: 600, date: "2026-10-21" }] },
        { ticker: "0050", currency: "TWD", transactions: [{ type: "BUY", shares: 100, price: 160, fx: 0.03125, date: "2026-10-21" }] },
    ] }, () => 100, (c) => (c === "TWD" ? 0.03125 : 0), "", "USD");
    assert.equal(P.positions.find((p) => p.ticker === "VOO")!.cost, 600);
    assert.equal(P.positions.find((p) => p.ticker === "0050")!.cost, 500);
    assert.equal(P.priced, true);
});
test("bond ETFs pay no securities tax; stock ETFs 0.1 %, stocks 0.3 %", () => {
    assert.equal(autoTax(100000, "TWD", "00679B"), 0);
    assert.equal(autoTax(100000, "TWD", "0050"), 100);
    assert.equal(autoTax(100000, "TWD", "2330"), 300);
});
test("tradeTotal: a buy costs gross + fee, a sale brings gross − fee − tax", () => {
    assert.equal(tradeTotal("BUY", 15000, 21, 99), 15021);
    assert.equal(tradeTotal("SELL", 15000, 21, 45), 14934);
    assert.equal(tradeTotal("sell", 15000, 21, 45), 14934);
});
test("legacyFields: shares and the average buy price in integers, fees left out", () => {
    assert.deepEqual(legacyFields([{ type: "BUY", shares: 10, price: 100 }, { type: "BUY", shares: 10, price: 110 }]), { shares: 20, avg_cost: 105 });
    assert.deepEqual(legacyFields([{ type: "BUY", shares: 0.1, price: 612.4 }, { type: "BUY", shares: 0.2, price: 612.4 }]), { shares: 0.3, avg_cost: 612.4 });
    assert.deepEqual(legacyFields([{ type: "BUY", shares: 3, price: 10 }, { type: "SELL", shares: 3, price: 12 }]), { shares: 0, avg_cost: 0 });
    assert.deepEqual(legacyFields([{ type: "SELL", shares: 3, price: 12 }]), { shares: 0, avg_cost: 0 });
    assert.deepEqual(legacyFields(undefined), { shares: 0, avg_cost: 0 });
});

test("a new ticker's category is guessed from the ticker or the search, never other", () => {
    const keys = ["etf", "stock", "bond"];
    assert.deepEqual(guessCategory("2395", true, false, keys), { key: "stock", why: "tw-stock" });
    assert.deepEqual(guessCategory("0050", true, false, keys), { key: "etf", why: "tw-etf" });
    assert.deepEqual(guessCategory("00679B", true, false, keys), { key: "bond", why: "tw-bond" });
    assert.deepEqual(guessCategory("VOO", false, true, keys), { key: "etf", why: "etf" });
    assert.deepEqual(guessCategory("NVDA", false, false, keys), { key: "stock", why: "stock" });
    // a mix without that bucket: stock when it has one, else its first; no mix: the guess itself
    assert.equal(guessCategory("00679B", true, false, ["etf", "stock"]).key, "stock");
    assert.equal(guessCategory("00679B", true, false, ["core", "satellite"]).key, "core");
    assert.equal(guessCategory("3515", true, false, []).key, "stock");
});
