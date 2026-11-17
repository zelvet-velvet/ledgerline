import { test } from "node:test";
import assert from "node:assert/strict";
import { allocation, computeMonth, investBuckets } from "../src/calc/log";

// a sample template: living + every set-aside line = the salary
const SALARY = 45000;
const plan = { living: 8000, emgy_fund: 3000, travel_fund: 2000, student_loan: 3000, investment: 27500, study_fund: 1500 };
const fixed = [500, 300, 1200, 1000].map((q, i) => ({ name: `f${i}`, quota: q, spending: [`f${i}`] }));
const daily = [{ name: "Food", quota: 60, spending: ["lunch"] }, { name: "Fun", quota: 20, spending: ["fun"] }, { name: "Misc", quota: 20, spending: ["medic"] }];

test("template sums to the salary: no gap", () => {
    const a = allocation(plan, null, SALARY);
    assert.deepEqual(a, { living: 8000, saved: 37000, income: SALARY, gap: 0 });
});

test("a template that does not sum shows the gap", () => {
    assert.equal(allocation({ ...plan, living: 7700 }, null, SALARY).gap, 300);
    assert.equal(allocation({ ...plan, investment: 28400 }, null, SALARY).gap, -900);
});

test("a month note's own lines win over the template", () => {
    const a = allocation(plan, { living: 9000, investment: 26500 }, SALARY);
    assert.equal(a.living, 9000);
    assert.equal(a.gap, 0);
});

test("an old month note without a living line: living is what savings leave", () => {
    const old = { travel_fund: 2000, emgy_fund: 3000, study_fund: 1500, investment: 27500, student_loan: 6000 };
    const a = allocation(plan, old, SALARY);
    assert.equal(a.saved, 40000);
    assert.equal(a.living, 5000);
    assert.equal(a.gap, 0);
});

test("savings is the set-aside lines only, never living", () => {
    const M = computeMonth({ month: null, days: [], plan, daily, fixed, income: SALARY });
    assert.equal(M.saved, 37000);
    assert.ok(!M.savings.some(([k]) => k === "living"));
});

test("left to spend = living − everything spent; daily groups share living − fixed bills", () => {
    const days = [{ name: "2026-11-03", path: "", fm: { lunch: 120, fun: 0, medic: 0 } }];
    const M = computeMonth({ month: null, days, plan, daily, fixed, income: SALARY });
    assert.equal(M.fixedTotal, 3000);
    assert.equal(M.remaining, 8000 - 3000 - 120);
    // 5,000 to share: 60 / 20 / 20 %, whole dollars (rounded down)
    assert.deepEqual(M.budget.map((b) => b.quota), [3000, 1000, 1000]);
    assert.equal(M.budget[0].remain, 3000 - 120);
});

test("integer money stays integer", () => {
    const M = computeMonth({ month: null, days: [], plan, daily, fixed, income: SALARY });
    for (const b of M.budget) assert.ok(Number.isInteger(b.quota));
    assert.ok(Number.isInteger(M.remaining));
});

// ---- review 2026-11, group A: this month's buying per bucket, in the base currency
const inv = { allocation: [{ key: "etf", label: "ETFs", pct: 70 }, { key: "stock", label: "Single stocks", pct: 30 }], assets: [
    { ticker: "0050", category: "etf", transactions: [{ type: "BUY", shares: 100, price: 150, fee: 21, date: "2026-11-02" }, { type: "BUY", shares: 100, price: 150, date: "2026-10-02" }] },
    { ticker: "VOO", category: "etf", currency: "USD", transactions: [{ type: "BUY", shares: 1.5, price: 612.4, fx: 31.85, date: "2026-11-03" }] },
    { ticker: "AAPL", category: "stock", currency: "USD", transactions: [{ type: "BUY", shares: 1, price: 200, date: "2026-11-04" }] },
    { ticker: "2330", category: "Single stocks", transactions: [{ type: "BUY", shares: 2, price: 1000, date: "2026-11-05" }, { type: "SELL", shares: 1, price: 1100, fee: 20, tax: 3, date: "2026-11-06" }] },
] };
test("investBuckets: the plan split by target, the last bucket takes the rest", () => {
    const b = investBuckets(inv, 22001, "2026-11")!;
    assert.deepEqual(b.map((x) => x.target), [15400, 6601]);
});
test("investBuckets: buys in the base currency with fees, a foreign buy at its own rate, never 1 : 1", () => {
    const b = investBuckets(inv, 22000, "2026-11", () => 32)!;
    assert.equal(b[0].bought, 15021 + 29257);        // 0050 with its fee + VOO 918.60 USD at 31.85 (October's buy is another month)
    assert.equal(b[1].bought, 6400 + 2000 - 1077);   // AAPL at today's 32, 2330 bought, less what its sale brought after fee and tax
});
test("investBuckets: a foreign buy with no rate known is left out, not counted as that many TWD", () => {
    const b = investBuckets(inv, 22000, "2026-11")!;
    assert.equal(b[1].bought, 2000 - 1077);
});
test("investBuckets: no allocation or no plan = null", () => {
    assert.equal(investBuckets({ assets: [] }, 22000, "2026-11"), null);
    assert.equal(investBuckets(inv, 0, "2026-11"), null);
});
