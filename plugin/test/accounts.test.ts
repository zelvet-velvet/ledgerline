import { test } from "node:test";
import assert from "node:assert/strict";
import { balanceAfter, buildAccounts, purposeOf } from "../src/calc/accounts";

const fm = {
    accounts: [
        { key: "main", label: "Main", bank: "A" },
        { key: "fund", label: "Fund", bank: "A", target: 25000 },
        { key: "etf", label: "ETF cash", bank: "B", bucket: "etf" },
    ],
    entries: [
        { date: "2026-11-04", account: "fund", amount: 18000, kind: "opening" },
        { date: "2026-11-01", account: "fund", amount: -10500, kind: "expense" },
        { date: "2026-11-04", account: "etf", amount: 95000, kind: "opening" },
        { date: "2026-11-04", account: "etf", amount: -20000, kind: "buy" },
        { date: "2026-11-04", account: "main", amount: 8000, kind: "deposit", planned: true },
        { date: "2026-11-05", account: "gone", amount: 1, kind: "adjust" },
    ],
};

test("a balance is the sum of its entries", () => {
    const A = buildAccounts(fm);
    assert.deepEqual(A.list.map((a) => [a.key, a.balance]), [["main", 8000], ["fund", 7500], ["etf", 75000]]);
    assert.equal(A.total, 8000 + 7500 + 75000);
});

test("totals by bank", () => {
    assert.deepEqual(buildAccounts(fm).banks, [{ bank: "A", total: 15500 }, { bank: "B", total: 75000 }]);
});

test("planned money counts, and is shown apart", () => {
    const A = buildAccounts(fm);
    assert.equal(A.planned, 8000);
    assert.equal(A.list[0].planned, 8000);
});

test("a buy moves cash to holdings: the cash bucket drops by the cost", () => {
    const etf = buildAccounts(fm).list.find((a) => a.key === "etf")!;
    assert.equal(etf.balance, 95000 - 20000);
});

test("balance as of a date leaves later entries out", () => {
    const A = buildAccounts({ ...fm, entries: fm.entries.slice(0, 2) }, "2026-11-02");
    assert.equal(A.list.find((a) => a.key === "fund")!.balance, -10500);
});

test("entries for an unknown account are kept apart, not lost", () => {
    const A = buildAccounts(fm);
    assert.equal(A.unknown.length, 1);
    assert.equal(A.total, 90500);
});

test("money is whole dollars", () => {
    const A = buildAccounts({ accounts: [{ key: "x" }], entries: [{ account: "x", amount: 10.6 }, { account: "x", amount: "abc" }] });
    assert.equal(A.list[0].balance, 11);
});

test("balance after each entry and purpose", () => {
    const A = buildAccounts(fm);
    const f = A.list.find((a) => a.key === "fund")!;
    const b = balanceAfter(f.entries);
    assert.equal(b.get(f.entries.find((e) => e.kind === "expense")!), -10500);
    assert.equal(b.get(f.entries.find((e) => e.kind === "opening")!), 7500);
    assert.deepEqual(A.list.map(purposeOf), ["everyday", "everyday", "investing"]);
    assert.equal(purposeOf({ key: "t", label: "T", bank: "A", line: "travel_fund", bucket: "", target: 0 }), "saving");
});
