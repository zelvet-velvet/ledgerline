import { test } from "node:test";
import assert from "node:assert/strict";
import { foldSmall, dayCells, fugleTrade, group, imbalances, misStep, parseMi5, parseMisSnap, pocOf, pressure, sideOf, stacked, toBars, treemap, twTick, valueArea, Cell, FTrade } from "../src/calc/flow";

const hm = (ms: number) => { const d = new Date(ms); return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`; };
const at = (h: number, m: number, s = 0) => Date.UTC(2026, 10, 10, h, m, s);

test("a trade's side against the book before it", () => {
    assert.equal(sideOf(225500, 225000, 225500), 1);
    assert.equal(sideOf(225000, 225000, 225500), -1);
    assert.equal(sideOf(226000, 225000, 225500), 1);   // through the ask
    assert.equal(sideOf(225300, 225000, 225500), 1);   // inside the spread, nearer the ask
    assert.equal(sideOf(225250, 225000, 225500), 0);   // the middle
    assert.equal(sideOf(225250, 0, 0), 0);
});

test("Taiwan ticks", () => {
    assert.deepEqual([999, 1000, 4999, 5000, 9999, 10000, 49999, 50000, 99999, 100000].map(twTick), [1, 5, 5, 10, 10, 50, 50, 100, 100, 500]);
});

test("MIS snapshots: new lots at the last price, sided by the book before", () => {
    const a = parseMisSnap({ v: "16116", tlong: "1794279355000", z: "-", trade: { z: "2255.0000" }, a: "2255.0000_2260.0000_", f: "267_263_", b: "2250.0000_2245.0000_", g: "246_475_" })!;
    assert.deepEqual(a, { at: 1794279355000, v: 16116, z: 225500, bids: [225000, 224500], bq: [246, 475], asks: [225500, 226000], aq: [267, 263] });
    const b = { ...a, at: a.at + 5000, v: 16150, z: 225500 };
    assert.deepEqual(misStep(a, b), { t: a.at + 5000, p: 225500, q: 34, side: 1 });
    assert.equal(misStep(a, { ...b, v: 16116 }), null);   // nothing traded
    assert.equal(misStep(null, b), null);
    assert.equal(misStep(b, a), null);   // older
});

test("Fugle trades", () => {
    assert.deepEqual(fugleTrade({ price: 1240, size: 3, bid: 1235, ask: 1240, time: 1794279355000123 }), { t: 1794279355000, p: 124000, q: 3, side: 1 });
    assert.equal(fugleTrade({ price: 1240, size: 0, time: 1 }), null);
});

test("trades into minute bars with cells, delta and OHLC", () => {
    const T: FTrade[] = [
        { t: at(1, 0, 5), p: 1000, q: 10, side: 1 },
        { t: at(1, 0, 30), p: 995, q: 4, side: -1 },
        { t: at(1, 0, 50), p: 1005, q: 6, side: 0 },
        { t: at(1, 1, 2), p: 1005, q: 2, side: 1 },
    ];
    const B = toBars(T, hm);
    assert.equal(B.length, 2);
    assert.deepEqual([B[0].m, B[0].o, B[0].h, B[0].l, B[0].c, B[0].v, B[0].d], ["01:00", 1000, 1005, 995, 1005, 20, 6]);
    assert.deepEqual(B[0].cells.get(1005), { a: 3, b: 3 });   // unknown side: half each
    assert.equal(toBars(T, hm, 5).length, 1);
    assert.deepEqual(dayCells(B).get(1005), { a: 5, b: 3 });
});

test("rows, POC, value area, imbalances", () => {
    const c = new Map<number, Cell>([[100, { b: 5, a: 5 }], [105, { b: 10, a: 30 }], [110, { b: 2, a: 60 }], [115, { b: 1, a: 2 }], [120, { b: 1, a: 1 }]]);
    assert.equal(pocOf(c), 110);
    assert.deepEqual(valueArea(c), { poc: 110, val: 105, vah: 110 });   // 102 of 117 lots
    assert.deepEqual(group(c, 10).get(110), { b: 3, a: 62 });
    const im = imbalances(c, 5);
    assert.deepEqual([...im.buy].sort(), [105, 110]);
    assert.deepEqual(stacked(new Set([100, 105, 110, 120]), 5), [100, 110]);
    assert.equal(stacked(new Set([100, 110]), 5), null);
});

test("book pressure", () => {
    assert.equal(pressure([300, 100], [100]), 0.6);
    assert.equal(pressure([], []), 0);
});

test("MI_5MINS: net order lots per 5 minutes", () => {
    const j = { stat: "OK", date: "20261109", data: [
        ["09:00:00", "1", "1,000", "1", "500", "0", "0", "0"],
        ["09:00:05", "1", "1,100", "1", "550", "0", "0", "0"],
        ["09:05:00", "1", "1,400", "1", "600", "0", "0", "0"],
        ["09:10:00", "1", "1,500", "1", "900", "0", "0", "0"],
    ] };
    assert.deepEqual(parseMi5(j), { date: "2026-11-09", t: ["09:05", "09:10"], net: [300, -200] });
    assert.equal(parseMi5({ stat: "很抱歉" }), null);
});

test("treemap fills the rect by weight", () => {
    const r = treemap([{ w: 50 }, { w: 30 }, { w: 20 }], 0, 0, 100, 50);
    assert.equal(r.length, 3);
    const area = r.reduce((s, x) => s + x.w * x.h, 0);
    assert.ok(Math.abs(area - 5000) < 1e-6);
    assert.ok(Math.abs(r[0].w * r[0].h - 2500) < 1e-6);
});

test("squarified tiles stay near square; small items fold", () => {
    const r = treemap([{ w: 6 }, { w: 6 }, { w: 4 }, { w: 3 }, { w: 2 }, { w: 2 }, { w: 1 }], 0, 0, 600, 400);
    assert.equal(r.length, 7);
    assert.ok(Math.abs(r.reduce((s, x) => s + x.w * x.h, 0) - 240000) < 1e-6);
    for (const x of r) assert.ok(Math.max(x.w / x.h, x.h / x.w) < 3.5);
    const f = foldSmall([{ w: 90 }, { w: 6 }, { w: 2 }, { w: 1 }, { w: 1 }], 10000, 300);
    assert.deepEqual([f.keep.length, f.small.length], [2, 3]);
    assert.equal(foldSmall([{ w: 90 }, { w: 10 }, { w: 1 }], 10000, 300).small.length, 0);   // one alone is not folded
});
