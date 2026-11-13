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
