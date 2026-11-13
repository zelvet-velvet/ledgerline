import { test } from "node:test";
import assert from "node:assert/strict";
import { addTradingDays, autoFee, autoTax, buildPortfolio, tickOf, capOf, checkRules, grossOf, investCash, newWarnings, readJournal, newTradeId, nextDca, syncEntries, toBase, toP, toQ, tradeLinks } from "../src/calc/invest";

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
