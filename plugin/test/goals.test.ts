import { test } from "node:test";
import assert from "node:assert/strict";
import { buildGoals, doneBy, monthsTo, trackFund } from "../src/calc/goals";

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
