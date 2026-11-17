import { test } from "node:test";
import assert from "node:assert/strict";
import { computeDebt, projectDebt } from "../src/calc/debt";

const cfg = { initial_principal: 600000, interest_rate: 0.00775, start_date: "2027-08-01", monthly_min_payment: 0, repayment: 6000, payments: [] };
const now = new Date(2026, 10, 4);

test("grace: older months kept half the 6,000 line, new months keep the whole reserve line", () => {
    const months = [...Array(5)].map(() => ({ amount: 6000, legacy: true })).concat([{ amount: 3000, legacy: false }]);
    const d = computeDebt(cfg, 3000, months, now);
    assert.equal(d.grace, true);
    assert.equal(d.loanPrep, 18000);          // five old months at half the line, then this month whole
    assert.equal(d.toInvestment, 5 * 3000);
});

test("an odd legacy line splits into whole dollars", () => {
    const d = computeDebt(cfg, 0, [{ amount: 6001, legacy: true }], now);
    assert.equal(d.loanPrep + d.toInvestment, 6001);
    assert.ok(Number.isInteger(d.loanPrep));
});

test("the projection pays the planned repayment, not the reserve line", () => {
    const d = computeDebt(cfg, 3000, [], now);
    assert.equal(d.repayment, 6000);
    const p = projectDebt(d, Math.max(d.repayment, d.monthlyMin), now);
    assert.equal(p.firstYear, 2027);
    assert.equal(p.payoff, "2036-03");   // 100 payments from 2027-08 plus a little interest
});

test("no repayment set: falls back to the plan amount", () => {
    const { repayment, ...rest } = cfg;
    assert.equal(computeDebt(rest, 3000, [], now).repayment, 3000);
});

// Owner, 2026-11-17: what is still to pay back includes the interest since repayment started
const running = { initial_principal: 120000, interest_rate: 0.12, start_date: "2026-01-15", payments: [{ date: "2026-02-01", amount: 20000 }] };
test("interest is charged each month after the start on what is owed then", () => {
    const d = computeDebt(running, 0, [], new Date(2026, 3, 20));
    // Feb 15: 100,000 × 1% = 1,000; Mar 15: 101,000 → 1,010; Apr 15: 102,010 → 1,020
    assert.equal(d.interest, 3030);
    assert.equal(d.balance, 103030);
    assert.equal(d.progress.toFixed(2), (20000 / 123030 * 100).toFixed(2));
});
test("no interest before the start, and none on the start day itself", () => {
    assert.equal(computeDebt(running, 0, [], new Date(2026, 0, 10)).interest, 0);
    assert.equal(computeDebt(running, 0, [], new Date(2026, 1, 14)).interest, 0);
    assert.equal(computeDebt({ ...running, payments: [] }, 0, [], new Date(2026, 1, 15)).interest, 1200);
});
test("a start on the 31st charges on each month's last day", () => {
    const d = computeDebt({ initial_principal: 12000, interest_rate: 0.12, start_date: "2026-01-31" }, 0, [], new Date(2026, 1, 28));
    assert.equal(d.interest, 120);
});
test("a loan paid off stops charging", () => {
    const d = computeDebt({ ...running, payments: [{ date: "2026-01-20", amount: 120000 }] }, 0, [], new Date(2026, 5, 1));
    assert.equal(d.interest, 0);
    assert.equal(d.balance, 0);
});
