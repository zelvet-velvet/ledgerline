import { test } from "node:test";
import assert from "node:assert/strict";
import { buildGoals, doneBy, lineHeld, monthsTo, planSaved, trackFund } from "../src/calc/goals";

const fm = {
    funds: [{ key: "t", label: "Trip" }, { key: "e", label: "Rainy" }],
    goals: [
        { name: "B", fund: "t", goal: 20000, target_date: "2027-08-01" },
        { name: "A", fund: "t", goal: 15000, target_date: "2027-05-01" },
        { name: "C", fund: "t", goal: 5000 },
    ],
};
const G = buildGoals(fm, (k) => (k === "t" ? 12000 : 0));
const trip = G.funds[0];

test("months to a date counts the month firsts after today", () => {
    assert.equal(monthsTo("2026-11-05", "2027-05-01"), 6);
    assert.equal(monthsTo("2026-11-05", "2026-11-30"), 0);
    assert.equal(monthsTo("2026-11-05", "2026-10-01"), 0);
});

test("goals are tracked in date order against saved + monthly", () => {
    const tr = trackFund(trip, 2000, "2026-11-05");
    const a = tr.get(trip.goals[0])!, b = tr.get(trip.goals[1])!;
    assert.equal(trip.goals[0].name, "A");
    // A: 12,000 + 6 × 2,000 = 24,000 ≥ 15,000
    assert.deepEqual(a, { short: 0, months: 6, perMonth: 500 });
    // B: needs 35,000 by Aug: 12,000 + 9 × 2,000 = 30,000 → short 5,000; (35,000 − 12,000) / 9 = 2,555.6 → 2,556
    assert.deepEqual(b, { short: 5000, months: 9, perMonth: 2556 });
    assert.equal(tr.has(trip.goals[2]), false);   // no date
});

test("covered goals need nothing more; a past date needs the whole gap", () => {
    const rich = buildGoals(fm, () => 40000).funds[0];
    assert.equal(trackFund(rich, 0, "2026-11-05").get(rich.goals[1])!.perMonth, 0);
    const late = trackFund(trip, 2000, "2027-09-10").get(trip.goals[0])!;
    assert.deepEqual(late, { short: 3000, months: 0, perMonth: 3000 });
});

test("done by: the month every goal is covered", () => {
    assert.equal(doneBy(trip, 2000, "2026-11-05"), "2028-01");   // 28,000 left / 2,000 = 14 months
    assert.equal(doneBy(trip, 0, "2026-11-05"), "");
    assert.equal(doneBy(G.funds[1], 1000, "2026-11-05"), "");   // no goals
});

// Owner, 2026-11-17: Accounts is the truth for "saved", the plan is the pace
test("a fund with an account: saved is its balance, goals fill from balance + what they paid out", () => {
    const cfg = { funds: [{ key: "t", label: "Trip" }], goals: [{ name: "Japan", fund: "t", goal: 30000, target_date: "2027-04-01", expenses: [{ item: "Flights", amount: 14800, date: "2026-10-12" }] }] };
    const f = buildGoals(cfg, () => 9000, () => 6200).funds[0];
    assert.equal(f.saved, 6200);          // what the account holds now
    assert.equal(f.collected, 21000);     // 6,200 + the 14,800 the flights took from it
    assert.equal(f.goals[0].alloc, 21000);
    assert.equal(f.goals[0].cash, 6200);
    assert.equal(f.behind, 0);
    assert.equal(f.fromAccounts, true);
});
test("an account short of the plan says how far behind", () => {
    const G = buildGoals({ funds: [{ key: "e", label: "Rainy" }], goals: [{ name: "Cushion", fund: "e", goal: 20000 }] }, () => 9000, () => 3000);
    assert.equal(G.funds[0].behind, 6000);
    assert.equal(G.goals[0].alloc, 3000);
    assert.equal(G.remaining, 17000);
    assert.equal(G.totalSaved, 3000);
});
test("no account: the plan is what was collected, saved is that minus what goals paid out", () => {
    const cfg = { funds: [{ key: "t", label: "Trip" }], goals: [{ name: "Japan", fund: "t", goal: 30000, expenses: [{ item: "Flights", amount: 1000, date: "2026-10-12" }] }] };
    const f = buildGoals(cfg, () => 9000).funds[0];
    assert.deepEqual([f.collected, f.saved, f.behind, f.fromAccounts], [9000, 8000, 0, false]);
});
test("plan amounts and line balances", () => {
    const months = [{ fm: { t: 2000 } }, { fm: {} }, { fm: { t: "1500.4" } }];
    assert.equal(planSaved(months, { t: 1000 }, "t"), 4500);
    const acc = [{ line: "t", balance: 400 }, { line: "t", balance: 100 }, { line: "", balance: 9 }];
    assert.equal(lineHeld(acc, "t"), 500);
    assert.equal(lineHeld(acc, "x"), null);
});
