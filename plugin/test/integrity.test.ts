import { test } from "node:test";
import assert from "node:assert/strict";
import { int } from "../src/calc/money";
import { budgetItems, computeMonth, monthIncome, spentOnDay } from "../src/calc/log";
import { computeDebt, findPayment } from "../src/calc/debt";
import { buildGoals, findExpense } from "../src/calc/goals";
import { balanceAfter, buildLedger, daysSince, findRecord } from "../src/calc/ledger";
import { buildPortfolio, findTrade, tradeEntries } from "../src/calc/invest";
import { findAlert, readAlerts } from "../src/calc/alerts";
import { fiveSecBars, parseMisIndex } from "../src/calc/market";
import { closedWhy, marketClock } from "../src/calc/quotes";
import { moveSince } from "../src/calc/thesis";
import { emptyBars } from "../src/calc/chart";

// Review 2026-11, group D: money read from notes is whole and never NaN; rows are found by what they are, not where they sat.

test("int: whole dollars from a number or a typed \"1,000\"; anything else is 0", () => {
    assert.equal(int(1000), 1000);
    assert.equal(int("1,000"), 1000);
    assert.equal(int(" 250 "), 250);
    assert.equal(int(12.5), 13);
    assert.equal(int("abc"), 0);
    assert.equal(int(""), 0);
    assert.equal(int(undefined), 0);
    assert.equal(int(null), 0);
    assert.equal(int(NaN), 0);
    assert.equal(int(true), 0);
});

const plan = { living: 10000, investment: 5000 };
test("computeMonth: a hand-typed \"1,000\" in the month note is 1,000, never NaN", () => {
    const M = computeMonth({ month: { investment: "4,000", rent: "1,000" }, days: [], plan, daily: [{ name: "Food", quota: 100, spending: ["lunch"] }], fixed: [{ name: "Rent", quota: 900, spending: ["rent"] }], income: 15000 });
    assert.deepEqual(M.savings, [["investment", 4000]]);
    assert.equal(M.fixedTotal, 1000);
    assert.equal(M.fixedRows[0].paid, 1000);
    assert.equal(M.remaining, 10000);   // living = 15,000 − 4,000 set aside, less the 1,000 bill
    assert.ok(Number.isFinite(M.spent));
});
test("computeMonth: junk in the month note counts as 0, the month stays a number", () => {
    const M = computeMonth({ month: { investment: "soon", rent: "?" }, days: [], plan, daily: [], fixed: [{ name: "Rent", quota: 900, spending: ["rent"] }], income: 15000 });
    assert.deepEqual(M.savings, [["investment", 0]]);
    assert.equal(M.fixedTotal, 0);
    assert.equal(M.remaining, 15000);
});
test("monthIncome: base lines, this month's override, a bonus in its month, one-offs", () => {
    const cfg = { salary: 50000, side: 2000, bonuses: [{ name: "Year end", month: 1, amount: 30000 }, { name: "Mid", month: 7, amount: 9000 }] };
    const jan = monthIncome(cfg, { income_override: { side: 0 }, extra_income: { gift: 500 } }, 1);
    assert.equal(jan.total, 50000 + 0 + 30000 + 500);
    assert.deepEqual(jan.rows.map((r) => r.kind), ["base", "base", "bonus", "extra"]);
    assert.equal(jan.rows[1].overridden, true);
    assert.equal(monthIncome(cfg, null, 3).total, 52000);
    assert.equal(monthIncome(null, null, 3).total, 0);
});
test("spentOnDay: the day's numbers, less the note's own fields", () => {
    assert.equal(spentOnDay({ lunch: 120, coffee: 55, date: "2026-11-12", tags: ["x"], title: 3, note: "text" }), 175);
    assert.equal(spentOnDay({}), 0);
});
test("budgetItems: a list, one item, or nothing", () => {
    assert.deepEqual(budgetItems({ budget: [{ name: "Food", quota: 60, spending: ["lunch", "dinner"] }, "junk"] }), [{ name: "Food", quota: 60, spending: ["lunch", "dinner"] }]);
    assert.deepEqual(budgetItems({ budget: { name: "One", quota: "x", spending: "a" } }), [{ name: "One", quota: 0, spending: ["a"] }]);
    assert.deepEqual(budgetItems(null), []);
});

test("debt: amounts are whole; a payment is found by what it is after the note changed", () => {
    const fm = { initial_principal: "420,000", payments: [{ date: "2026-09-01", amount: 6000, note: "a" }, { date: "2026-10-01", amount: 6000.4, note: "b" }] };
    const d = computeDebt(fm, 6000, [], new Date(2026, 10, 17));
    assert.equal(d.principal, 420000);
    assert.equal(d.paid, 12000);
    assert.equal(d.balance, 408000);
    const b = d.payments[1];
    assert.equal(findPayment(fm.payments, b), 1);
    const moved = [{ date: "2026-08-01", amount: 1, note: "new" }, ...fm.payments];   // a sync put a row in front
    assert.equal(findPayment(moved, b), 2);
    assert.equal(findPayment([fm.payments[0]], b), -1);
    assert.equal(findPayment(undefined, b), -1);
});

test("goals: a goal of 0 takes nothing from its fund", () => {
    const G = buildGoals({ funds: [{ key: "t", label: "Trip" }], goals: [{ name: "Free", fund: "t", goal: 0, target_date: "2026-12-01" }, { name: "Trip", fund: "t", goal: 1000, target_date: "2027-01-01" }] }, () => 1000);
    const [free, trip] = G.funds[0].goals;
    assert.equal(free.alloc, 0);
    assert.equal(free.pct, 100);
    assert.equal(trip.alloc, 1000);   // was 999: the empty goal took 1
    assert.equal(G.funds[0].surplus, 0);
});
test("goals: an expense is found by what it is", () => {
    const G = buildGoals({ funds: [{ key: "t", label: "Trip" }], goals: [{ name: "Trip", fund: "t", goal: 1000, expenses: [{ item: "Flights", amount: 300, date: "2026-10-12" }, { item: "Hotel", amount: 200, date: "2026-10-13" }] }] }, () => 0);
    const hotel = G.goals[0].expenses[1];
    assert.equal(findExpense([{ item: "Hotel", amount: 200, date: "2026-10-13" }], hotel), 0);
    assert.equal(findExpense([{ item: "Hotel", amount: 201, date: "2026-10-13" }], hotel), -1);
    assert.equal(findExpense(null, hotel), -1);
});

test("ledger: a repayment settles the oldest amount of its own side, whatever sits before it", () => {
    const L = buildLedger([
        { friend: "A", action: "paid_by", amount: 100, date: "2026-01-01" },    // you owe A (oldest)
        { friend: "A", action: "paid_for", amount: 300, date: "2026-02-01" },   // A owes you
        { friend: "A", action: "paid_for", amount: 50, date: "2026-03-01" },
        { friend: "A", action: "paid_to_me", amount: 300, date: "2026-04-01" }, // settles February's 300, not blocked by January's
    ]);
    const a = L.friends[0];
    assert.equal(a.net, -50);                     // you owe 100, they owe 50
    assert.equal(a.activeSince, "2026-01-01");   // what you owe is the open side
    const L2 = buildLedger([
        { friend: "B", action: "paid_by", amount: 100, date: "2026-01-01" },
        { friend: "B", action: "paid_for", amount: 300, date: "2026-02-01" },
        { friend: "B", action: "paid_for", amount: 500, date: "2026-03-01" },
        { friend: "B", action: "paid_to_me", amount: 300, date: "2026-04-01" },
    ]);
    assert.equal(L2.friends[0].net, 400);
    assert.equal(L2.friends[0].activeSince, "2026-03-01");   // February was repaid; March is the oldest they still owe
});
test("ledger: an unknown action moves nothing, in the balance and in the running balance alike", () => {
    const L = buildLedger([{ friend: "A", action: "paid_for", amount: 100, date: "2026-01-01" }, { friend: "A", action: "gift", amount: 999, date: "2026-01-02" }]);
    const f = L.friends[0], after = balanceAfter(f.records);
    assert.equal(f.net, 100);
    assert.equal(Math.max(...after.values()), 100);
    assert.equal(after.get(f.records.find((r) => r.action === "gift")!), 100);
});
test("ledger: a record is found by what it is; days since a date", () => {
    const list = [{ friend: "A", action: "paid_for", amount: 100, date: "2026-01-01", note: "x" }, { friend: "A", action: "paid_for", amount: 100, date: "2026-01-02", note: "y" }];
    const r = buildLedger(list).friends[0].records.find((x) => x.note === "y")!;
    assert.equal(findRecord(list, r), 1);
    assert.equal(findRecord([{ friend: "Z" }, ...list], r), 2);
    assert.equal(findRecord([list[0]], r), -1);
    assert.equal(daysSince("2026-11-10", new Date(2026, 10, 17, 9)), 7);
    assert.equal(daysSince("2026-11-20", new Date(2026, 10, 17)), 0);
});

const P1 = (tx: unknown[]) => buildPortfolio({ assets: [{ ticker: "2330", transactions: tx }] }, () => null, () => 1).positions[0];
test("invest: a sale before any buy, or of more than is held, is counted as dropped, not lost in silence", () => {
    const early = P1([{ type: "SELL", shares: 5, price: 100, date: "2026-01-01" }, { type: "BUY", shares: 10, price: 100, date: "2026-02-01" }]);
    assert.equal(early.shares, 10);
    assert.equal(early.dropped, 5);
    assert.equal(early.realized, 0);
    const over = P1([{ type: "BUY", shares: 10, price: 100, date: "2026-01-01" }, { type: "SELL", shares: 15, price: 120, date: "2026-02-01" }]);
    assert.equal(over.shares, 0);
    assert.equal(over.dropped, 5);
    assert.equal(over.realized, 200);   // the 10 held, at their share of the sale
    assert.equal(P1([{ type: "BUY", shares: 10, price: 100, date: "2026-01-01" }, { type: "SELL", shares: 4, price: 120, date: "2026-02-01" }]).dropped, 0);
});
test("invest: a trade is found by its id, else by what it is, never by position alone", () => {
    const rows = [{ type: "BUY", shares: 10, price: 100, date: "2026-01-01" }, { id: "2330-x", type: "BUY", shares: 5, price: 110, date: "2026-02-01" }, { type: "SELL", shares: 3, price: 120, date: "2026-03-01" }];
    const p = P1(rows), [a, b, c] = p.trades;
    assert.equal(findTrade(rows, b), 1);
    assert.equal(findTrade(rows, c), 2);
    const shifted = [{ type: "BUY", shares: 1, price: 90, date: "2025-12-01" }, ...rows];   // a sync put a row in front
    assert.equal(findTrade(shifted, a), 1);
    assert.equal(findTrade(shifted, b), 2);
    assert.equal(findTrade(shifted, c), 3);
    assert.equal(findTrade([rows[0]], c), -1);
    assert.equal(findTrade("junk", a), -1);
});
test("invest: the Accounts entries of a trade add up to its cash", () => {
    const buy = P1([{ type: "BUY", shares: 10, price: 1000, fee: 20, date: "2026-11-09", settled: "2026-11-11" }]).trades[0];
    const e = tradeEntries(buy, "2330", "TWD", "stock_cash");
    assert.deepEqual(e.map((x) => [x.kind, x.amount, x.date]), [["buy", -10000, "2026-11-11"], ["fee", -20, "2026-11-11"]]);
    assert.equal(e.reduce((s, x) => s + x.amount, 0), buy.cash);
    const sell = P1([{ type: "BUY", shares: 10, price: 1000, date: "2026-11-01" }, { type: "SELL", shares: 10, price: 1100, fee: 20, tax: 33, date: "2026-11-09" }]).trades[1];
    const s = tradeEntries(sell, "2330", "TWD", "stock_cash");
    assert.deepEqual(s.map((x) => [x.kind, x.amount]), [["sell", 11000], ["fee", -53]]);
    assert.equal(tradeEntries(P1([{ type: "BUY", shares: 1, price: 100, date: "2026-11-01" }]).trades[0], "2330", "TWD", "c").length, 1);
});

test("alerts: an alert is found by its id; one saved without an id by its place while it is still the same", () => {
    const rows = [{ ticker: "2330", kind: "below", price: 980 }, { id: "ab1", ticker: "0050", kind: "above", price: 175 }];
    const [a, b] = readAlerts({ alerts: rows }).alerts;
    assert.equal(findAlert(rows, b), 1);
    assert.equal(findAlert([{ id: "zz", ticker: "VOO", kind: "below", price: 1 }, ...rows], b), 2);
    assert.equal(findAlert(rows, a), 0);
    assert.equal(findAlert([{ ticker: "2454", kind: "below", price: 980 }], a), -1);
    assert.equal(findAlert(undefined, a), -1);
});

test("market: the live index from MIS, and the 5-second file as minute bars", () => {
    const q = parseMisIndex({ msgArray: [{ c: "t00", z: "40,374.40", y: "41167.76", tlong: "1700000000000", d: "20261117" }] })!;
    assert.equal(q.price, 40374.4);
    assert.equal(q.prev, 41167.76);
    assert.equal(q.day, "2026-11-17");
    assert.equal(parseMisIndex({ msgArray: [{ c: "x" }] }), null);
    assert.equal(parseMisIndex({ msgArray: [{ c: "t00", z: "-", y: "-" }] }), null);
    const B = fiveSecBars({ data: [["09:00:00", "41,167.76"], ["09:00:05", "41,100.00"], ["09:01:00", "41,050.00"], ["09:01:05", "41,200.00"], ["bad", "1"]] }, "2026-11-17")!;
    assert.equal(B.pc, 4116776);
    assert.deepEqual(B.d, ["2026-11-17T09:00", "2026-11-17T09:01"]);
    assert.deepEqual([B.o[0], B.h[0], B.l[0], B.c[0]], [4110000, 4110000, 4105000, 4105000]);   // the 09:01:00 point closes the 09:00 bar
    assert.equal(B.c[1], 4120000);
    assert.equal(fiveSecBars({ data: [] }, "2026-11-17"), null);
});
test("quotes: the market's own clock, and why a weekday does not trade", () => {
    const t = new Date(Date.UTC(2026, 10, 17, 2, 30));   // 10:30 Taipei, 21:30 the day before in New York
    assert.deepEqual(marketClock("2330.TW", t), { day: "2026-11-17", min: 630, weekday: true });
    assert.deepEqual(marketClock("VOO", t), { day: "2026-11-16", min: 21 * 60 + 30, weekday: true });
    assert.equal(marketClock("2330.TW", new Date(Date.UTC(2026, 10, 14, 2, 30))).weekday, false);   // a Saturday
    const cal = { tw: { "2026-11-17": "typhoon" as const }, us: {}, usEarly: { "2026-11-27": 780 } };
    assert.equal(closedWhy("2330.TW", t, cal), "typhoon");
    assert.equal(closedWhy("VOO", t, cal), null);
    assert.equal(closedWhy("2330.TW", t), null);
    assert.equal(closedWhy("VOO", new Date(Date.UTC(2026, 10, 27, 18, 30)), cal), "early");   // 13:30 New York, past the 13:00 close
    assert.equal(closedWhy("VOO", new Date(Date.UTC(2026, 10, 27, 17, 0)), cal), null);
});
test("thesis: the move since a day, from the first bar on or after it", () => {
    const B = { ...emptyBars(), d: ["2026-10-14", "2026-10-15", "2026-10-16", "2026-10-19"], c: [10000, 10000, 11000, 12100] };
    assert.deepEqual(moveSince(B, "2026-10-15"), { pct: 21, from: "2026-10-15" });
    assert.equal(moveSince(B, "2026-10-17")!.from, "2026-10-16");   // the last bar alone: from the one before it
    assert.equal(moveSince(B, "2026-11-01"), null);
    assert.equal(moveSince(null, "2026-10-15"), null);
});
