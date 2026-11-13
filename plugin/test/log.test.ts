import { test } from "node:test";
import assert from "node:assert/strict";
import { allocation, computeMonth } from "../src/calc/log";

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
