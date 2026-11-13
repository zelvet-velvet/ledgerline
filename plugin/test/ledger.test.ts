import { test } from "node:test";
import assert from "node:assert/strict";
import { balanceAfter, buildLedger, settleOf } from "../src/calc/ledger";

const L = buildLedger([
    { friend: "W", action: "paid_for", amount: 2500, date: "2026-08-28" },
    { friend: "W", action: "paid_to_me", amount: 1000, date: "2026-03-18" },
    { friend: "W", action: "paid_to_me", amount: 500, date: "2026-08-28" },
    { friend: "Z", action: "paid_by", amount: 2500, date: "2026-08-31" },
    { friend: "W", action: "paid_for", amount: 800, date: "2026-10-05" },
]);
const W = L.friends.find((f) => f.name === "W")!, Z = L.friends.find((f) => f.name === "Z")!;

test("balance after each record, oldest first, same day in file order", () => {
    const b = balanceAfter(W.records);
    const by = (amount: number, date: string) => b.get(W.records.find((r) => r.amount === amount && r.date === date)!);
    assert.equal(by(1000, "2026-03-18"), -1000);
    assert.equal(by(2500, "2026-08-28"), 1500);
    assert.equal(by(500, "2026-08-28"), 1000);
    assert.equal(by(800, "2026-10-05"), 1800);
    assert.equal(W.net, 1800);
});

test("settle: the full balance in the right direction", () => {
    assert.deepEqual(settleOf(W), { action: "paid_to_me", amount: 1800 });
    assert.deepEqual(settleOf(Z), { action: "paid_to_them", amount: 2500 });
    assert.equal(settleOf({ ...W, net: 0 }), null);
});
