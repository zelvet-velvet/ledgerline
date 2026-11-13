import { test } from "node:test";
import assert from "node:assert/strict";
import { flowDue, flowGross, flowSides, flowSeries, flowSum, flowTrim, lots, parseT86, streak } from "../src/calc/flows";

const FIELDS = ["證券代號", "證券名稱", "外陸資買進股數(不含外資自營商)", "外陸資賣出股數(不含外資自營商)", "外陸資買賣超股數(不含外資自營商)", "外資自營商買進股數", "外資自營商賣出股數", "外資自營商買賣超股數", "投信買進股數", "投信賣出股數", "投信買賣超股數", "自營商買賣超股數", "自營商買進股數(自行買賣)", "自營商賣出股數(自行買賣)", "自營商買賣超股數(自行買賣)", "自營商買進股數(避險)", "自營商賣出股數(避險)", "自營商買賣超股數(避險)", "三大法人買賣超股數"];
const row = (c: string, f: string, fd: string, t: string, ds: string, dh: string, g = ["0", "0", "0", "0", "0", "0", "0", "0", "0", "0"]) => [c, "X", g[0], g[1], f, g[2], g[3], fd, g[4], g[5], t, "0", g[6], g[7], ds, g[8], g[9], dh, "0"];

test("T86: our codes only, commas, foreign dealers added to 外資; a day without data is null", () => {
    const j = { stat: "OK", fields: FIELDS, data: [row("1111 ", "-78,883,057", "1,000", "0", "-6,822,000", "-138,206,180", ["13,136,085", "92,019,142", "1,000", "0", "0", "0", "1,049,000", "7,871,000", "15,177,736", "153,383,916"]), row("2222", "5", "0", "7", "0", "0")] };
    assert.deepEqual(parseT86(j, ["1111"]), { "1111": { f: -78882057, t: 0, ds: -6822000, dh: -138206180, fb: 13137085, fs: 92019142, tb: 0, ts: 0, dsb: 1049000, dss: 7871000, dhb: 15177736, dhs: 153383916 } });
    assert.equal(parseT86({ stat: "很抱歉，沒有符合條件的資料!", total: 0 }, ["1111"]), null);
    assert.equal(parseT86({ stat: "OK", fields: ["證券代號"], data: [] }, ["1111"]), null);
});

test("Flows: series oldest first, holidays skipped, missing row = 0; sums, streaks, lots", () => {
    const z = { f: 0, t: 0, ds: 0, dh: 0, fb: 0, fs: 0, tb: 0, ts: 0, dsb: 0, dss: 0, dhb: 0, dhs: 0 };
    const days = { "2026-11-04": { A: { ...z, f: -3000, t: 1000, ds: 400, dh: -900, fb: 500, fs: 3500, dsb: 400, dhb: 100, dhs: 1000 } }, "2026-11-02": { A: { ...z, f: -1 } }, "2026-11-01": null, "2026-11-03": { B: z }, "2026-10-30": { A: { ...z, f: 2000 } } };
    const s = flowSeries(days, "A");
    assert.deepEqual(s.map((x) => x.date), ["2026-10-30", "2026-11-02", "2026-11-03", "2026-11-04"]);
    assert.equal(s[3].d, -500);
    assert.equal(s[3].total, -2500);
    assert.equal(flowSum(s, "f", 2), -3000);
    assert.equal(flowSum(s, "f", 20), -1001);
    assert.equal(streak(s, "f"), -1);   // 11-03 was flat
    assert.equal(streak(s.slice(0, 2), "f"), -1);
    assert.equal(streak(s.slice(0, 1), "f"), 1);
    assert.equal(streak([...s, { ...s[3], date: "2026-11-05" }], "f"), -2);
    assert.equal(streak(s.slice(0, 3), "f"), 0);
    assert.equal(flowGross(s, "f", "s", 20), 3500);
    assert.equal(flowGross(s, "d", "b", 1), 500);
    assert.equal(flowGross(s, "d", "s", 1), 1000);
    assert.deepEqual(flowSides(s, "f", 20), [1, 2]);
    assert.deepEqual(flowSides(s, "f", 2), [0, 1]);
    assert.equal(lots(-223911237), -223911);
    assert.equal(lots(1500), 2);
    assert.equal(lots(-1500), -2);
    assert.equal(lots(499), 0);
});

test("Flows: due weekdays newest first, today only from 15:00, known days skipped; trim keeps the window", () => {
    const wed = (h: number) => new Date(2026, 10, 4, h);   // Wednesday
    assert.deepEqual(flowDue(wed(14), {}, 6), ["2026-11-03", "2026-11-02", "2026-10-30", "2026-10-29"]);
    assert.deepEqual(flowDue(wed(15), { "2026-11-03": null }, 1), ["2026-11-04"]);
    assert.deepEqual(Object.keys(flowTrim({ "2026-10-01": null, "2026-10-29": null, "2026-11-04": {} }, wed(10), 6)), ["2026-10-29", "2026-11-04"]);
});
