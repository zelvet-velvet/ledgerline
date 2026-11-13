import { test } from "node:test";
import assert from "node:assert/strict";
import { fiveMin, kScale, kState } from "../src/calc/keffects";
import type { Bars } from "../src/calc/chart";

// n candles of `body` hundredths around 10,000.00 (alternating up / down so the band stays put), then the last as given
const bars = (n: number, body: number, last: [number, number]): Bars => {
    const B: Bars = { d: [], o: [], h: [], l: [], c: [], v: [], ohlc: true };
    for (let i = 0; i < n; i++) {
        const o = 1000000, c = o + (i % 2 ? -body : body);
        B.d.push(`2026-11-10T09:${String(i).padStart(2, "0")}`); B.o.push(o); B.c.push(c); B.h.push(Math.max(o, c)); B.l.push(Math.min(o, c)); B.v.push(0);
    }
    const [o, c] = last;
    B.d.push("2026-11-10T10:00"); B.o.push(o); B.c.push(c); B.h.push(Math.max(o, c)); B.l.push(Math.min(o, c)); B.v.push(0);
    return B;
};

test("thresholds grow with the interval's square root", () => {
    assert.equal(kScale(5), 1);
    assert.equal(kScale(20), 2);
    assert.equal(kScale(0), kScale(1));
});

test("a forming candle of 0.35 % breaks; a closed one of the same size keeps a mark", () => {
    const B = bars(25, 500, [1000000, 1003500]);   // +0.35 %
    const k = kState(B, 5, true);
    assert.equal(k.brk, true);
    assert.equal(k.dir, 1);
    assert.deepEqual(k.marks, []);
    const shut = kState(B, 5, false);
    assert.equal(shut.brk, false);
    assert.deepEqual(shut.marks, [{ i: 25, dir: 1 }]);
    assert.equal(kState(B, 60, true).brk, false);   // on 60 min it takes 3.5× that
});

test("long candle: 2× the last 20 bodies and at least 0.25 %", () => {
    assert.equal(kState(bars(25, 1000, [1000000, 997400]), 5, true).long, true);    // 2,600 vs 1,000 avg, −0.26 %
    assert.equal(kState(bars(25, 1000, [1000000, 998200]), 5, true).long, false);   // 1.8× only
    assert.equal(kState(bars(25, 100, [1000000, 998000]), 5, true).long, false);    // 20× but −0.2 %
    assert.equal(kState(bars(25, 1000, [1000000, 997400]), 5, true).dir, -1);
});

test("Bollinger: z from the middle, a close outside is a band break with its sd past the edge", () => {
    const flat = bars(25, 500, [1000000, 1000000]);
    const k0 = kState(flat, 5, true);
    assert.equal(k0.bb, 0);
    assert.ok(k0.z !== null && Math.abs(k0.z) < 1);
    const up = kState(bars(25, 500, [1000000, 1003000]), 5, true);
    assert.equal(up.bb, 1);
    assert.ok(up.past > 0 && up.z! > 2);
    const dn = kState(bars(25, 500, [1000000, 997000]), 5, true);
    assert.equal(dn.bb, -1);
    assert.ok(dn.past > 0);
    assert.equal(kState(bars(5, 500, [1000000, 1003000]), 5, true).z, null);   // under 20 candles: no band
});

test("TODAY's minute points read as 5-minute candles", () => {
    const B: Bars = { d: ["2026-11-10T09:00", "2026-11-10T09:03", "2026-11-10T09:05", "2026-11-10T09:07"], o: [100, 102, 103, 99], h: [101, 104, 103, 100], l: [99, 101, 98, 99], c: [100, 103, 99, 100], v: [0, 0, 0, 0], ohlc: false };
    const F = fiveMin(B);
    assert.deepEqual(F.d, ["2026-11-10T09:00", "2026-11-10T09:05"]);
    assert.deepEqual([F.o, F.h, F.l, F.c], [[100, 103], [104, 103], [99, 98], [103, 100]]);
});

test("5-minute candles add up the minutes' volume", () => {
    const B: Bars = { d: ["2026-11-10T09:00", "2026-11-10T09:01", "2026-11-10T09:05"], o: [100, 101, 102], h: [101, 102, 103], l: [99, 100, 101], c: [101, 102, 103], v: [120, 30, 7], ohlc: true };
    assert.deepEqual(fiveMin(B).v, [150, 7]);
});
