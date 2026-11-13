import { test } from "node:test";
import assert from "node:assert/strict";
import { buyRules, checkState, readThesis, satVsBench, vsBench, emergencyMinOf } from "../src/calc/thesis";
import { expectedYm, fromFinMind, revShort, revStats } from "../src/calc/revenue";
import { away, comingDates, fromTwt48u, hit, keepSent, readAlerts, rocDate } from "../src/calc/alerts";
import type { Bars } from "../src/calc/chart";

const bars = (d: string[], c: number[]): Bars => ({ d, o: c, h: c, l: c, c, v: c.map(() => 0), ohlc: false });

test("thesis: read, check state", () => {
    assert.equal(readThesis(null), null);
    assert.equal(readThesis({ thesis: { why: "" } }), null);
    const th = readThesis({ thesis: { why: "Rack servers", check: "2026-11-14", hold: "margin", sell: "two quarters", since: "2026-09-02" } });
    assert.deepEqual(th, { why: "Rack servers", check: "2026-11-14", hold: "margin", sell: "two quarters", since: "2026-09-02" });
    assert.equal(checkState("", "2026-11-10"), "none");
    assert.equal(checkState("2026-11-30", "2026-11-10"), "later");
    assert.equal(checkState("2026-11-17", "2026-11-10"), "soon");
    assert.equal(checkState("2026-11-10", "2026-11-10"), "due");
    assert.equal(checkState("2026-11-01", "2026-11-10"), "due");
});

test("thesis: vs 0050 from the same day", () => {
    const s = bars(["2026-09-01", "2026-09-02", "2026-11-10"], [10000, 10000, 11000]);   // +10%
    const b = bars(["2026-09-02", "2026-11-10"], [20000, 21000]);                       // +5%
    const v = vsBench(s, b, "2026-09-02");
    assert.ok(v && Math.abs(v.diff - 5) < 1e-9);
    assert.equal(v?.from, "2026-09-02");
    assert.equal(vsBench(null, b, "2026-09-02"), null);
    // before the first bar: from the first bar both have
    const v2 = vsBench(s, b, "2026-01-01");
    assert.equal(v2?.from, "2026-09-02");
    assert.equal(satVsBench([{ cost: 10000, diff: 2 }, { cost: 30000, diff: -2 }, { cost: 5000, diff: null }]), -1);
    assert.equal(satVsBench([]), null);
});

test("buy rules: a single stock, an ETF", () => {
    const th = { why: "w", check: "2026-11-14", hold: "", sell: "", since: "" };
    const r = buyRules({ thesis: th, single: true, cost: 5800, cap: 15000, buys: 1, emergency: 25000, emergencyMin: 25000, limit: 51200, sat: 1.2 });
    assert.deepEqual(r.rows.map((x) => x.met), [true, false, true, true, true, true, true]);
    assert.equal(r.met, 6);
    assert.equal(r.rows[2].left, 9200);
    assert.deepEqual([r.rows[3].n, r.rows[3].of, r.rows[3].per], [2, 3, 5000]);
    const over = buyRules({ thesis: null, single: true, cost: 15000, cap: 15000, buys: 3, emergency: null, emergencyMin: 25000, limit: null, sat: null });
    assert.deepEqual(over.rows.map((x) => x.met), [false, false, false, false, null, false, null]);
    const etf = buyRules({ thesis: null, single: false, cost: 90000, cap: 15000, buys: 5, emergency: 1000, emergencyMin: 25000, limit: null, sat: -0.5 });
    assert.deepEqual(etf.rows.map((x) => x.met), [false, false, true, true, false, false, false]);
});

test("revenue: stats over 24 months", () => {
    const list = Array.from({ length: 25 }, (_, i) => {
        const d = new Date(Date.UTC(2024, 9 + i, 1));
        return { ym: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`, v: 1000 + i * 10 };
    });   // 2024-10 … 2026-10
    const s = revStats(list)!;
    assert.equal(s.latest.ym, "2026-10");
    assert.equal(s.latest.v, 1240);
    assert.ok(Math.abs((s.yoy as number) - ((1240 - 1120) / 1120) * 100) < 1e-9);
    assert.ok(Math.abs((s.mom as number) - ((1240 - 1230) / 1230) * 100) < 1e-9);
    assert.ok(Math.abs((s.last3 as number) - (((1220 + 1230 + 1240) - (1100 + 1110 + 1120)) / (1100 + 1110 + 1120)) * 100) < 1e-9);
    assert.equal(s.months.length, 24);
    assert.equal(s.months[0].ym, "2024-11");
    assert.equal(s.months[0].yoy, null);
    assert.equal(s.best.ym, "2026-10");
    assert.equal(s.nextOut, "2026-12-10");
    // Jan–Oct 2025 is not all there (starts at 2024-10 → 2025-01 … 2025-10 is there): ytd works
    assert.ok(s.ytd !== null);
    assert.equal(revStats([]), null);
    assert.equal(expectedYm("2026-11-10"), "2026-10");
    assert.equal(expectedYm("2026-11-09"), "2026-09");
    assert.equal(expectedYm("2026-01-15"), "2025-12");
    assert.deepEqual(fromFinMind([{ revenue_year: 2024, revenue_month: 8, revenue: 250866368000 }, { revenue_year: 2024, revenue_month: 9, revenue: 0 }]), [{ ym: "2024-08", v: 250866368000 }]);
    assert.equal(revShort(4823000000), "4.82 B");
    assert.equal(revShort(512340000), "512.3 M");
});

test("alerts: price hits, sent kept 7 days, dates", () => {
    const A = readAlerts({ topic: " t ", alerts: [{ ticker: "7711", kind: "below", price: 512 }, { ticker: "2330", kind: "above", price: "1500.5" }, { ticker: "", price: 1 }], sent: [{ key: "k", date: "2026-11-01", text: "x" }] });
    assert.equal(A.topic, "t");
    assert.equal(A.alerts.length, 2);
    assert.equal(A.alerts[1].price, 150050);
    assert.ok(hit(A.alerts[0], 51200) && !hit(A.alerts[0], 51205));
    assert.ok(hit(A.alerts[1], 150050) && !hit(A.alerts[1], 150049));
    assert.ok(Math.abs(away(A.alerts[0], 51800) - (600 / 51800) * 100) < 1e-9);
    assert.equal(keepSent(A.sent, "2026-11-08").length, 1);
    assert.equal(keepSent(A.sent, "2026-11-09").length, 0);
    assert.equal(rocDate("1151106"), "2026-11-06");
    assert.deepEqual(fromTwt48u([{ Date: "1151218", Code: "0050", CashDividend: "1.000000" }]), [{ code: "0050", date: "2026-12-18", cash: 100 }]);
    const c = comingDates("2026-11-10", { tw: ["7711", "2330"], exdiv: [{ code: "0050", date: "2026-12-18", cash: 100 }, { code: "0050", date: "2027-03-01", cash: 100 }], theses: [{ ticker: "7711", check: "2026-11-14", hold: "margin" }], revOut: new Set(["2330"]) });
    assert.deepEqual(c.map((x) => `${x.kind}:${x.ticker}:${x.date}`), ["revenue:7711:2026-11-10", "report::2026-11-14", "thesis:7711:2026-11-14", "exdiv:0050:2026-12-18"]);
    // after the 10th the next revenue day is next month's 10th
    assert.equal(comingDates("2026-11-11", { tw: ["7711"], exdiv: [], theses: [], revOut: new Set() }).find((x) => x.kind === "revenue")?.date, "2026-12-10");
    assert.equal(comingDates("2026-12-20", { tw: ["7711"], exdiv: [], theses: [], revOut: new Set() }).find((x) => x.kind === "revenue")?.date, "2027-01-10");
});

test("emergency minimum comes from Investment Config, none by default", () => {
    assert.equal(emergencyMinOf(null), 0);
    assert.equal(emergencyMinOf({}), 0);
    assert.equal(emergencyMinOf({ emergency_min: 30000 }), 30000);
    assert.equal(emergencyMinOf({ emergency_min: "abc" }), 0);
});
