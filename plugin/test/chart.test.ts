import { test } from "node:test";
import assert from "node:assert/strict";
import { fromFugle, addTick, withTicks, lastSession, bollinger, extremes, windowOf, withLiveMinute, zoomAt, closeBefore, fibLevels, withLive, fromTwseMonth, fromYahoo, indexOf, joinBars, lineAt, movingAverage, newDrawingId, niceTicks, readDrawings, readPrefs, snapPrice, xTicks } from "../src/calc/chart";

test("Yahoo bars: integer hundredths, the exchange's day, gaps left out", () => {
    const B = fromYahoo({
        meta: { gmtoffset: 28800 },
        timestamp: [1793581200, 1793667600, 1793754000],   // 2026-11-02 / 03 / 04 at 09:00 Taipei
        indicators: { quote: [{ open: [100.1, null, 101], high: [101.05, 1, 102.3], low: [99.95, 1, 100.6], close: [100.6, 1, 101.55], volume: [1200, 5, 900] }] },
    })!;
    assert.deepEqual(B.d, ["2026-11-02", "2026-11-04"]);
    assert.deepEqual(B.o, [10010, 10100]);
    assert.deepEqual(B.h, [10105, 10230]);
    assert.deepEqual(B.c, [10060, 10155]);
    assert.deepEqual(B.v, [1200, 900]);
    assert.equal(fromYahoo({}), null);
});

test("Yahoo minute bars across a daylight saving change: each at New York's own clock", () => {
    const B = fromYahoo({
        meta: { gmtoffset: -18000, exchangeTimezoneName: "America/New_York" },   // Yahoo's offset is today's (EST) only
        timestamp: [1793367000, 1794234600],   // 2026-10-30 09:30 EDT, 2026-11-09 09:30 EST
        indicators: { quote: [{ open: [1, 1], high: [1, 1], low: [1, 1], close: [1, 1], volume: [0, 0] }] },
    }, true)!;
    assert.deepEqual(B.d, ["2026-10-30T09:30", "2026-11-09T09:30"]);
});

test("TWSE month: ROC dates, commas, a bad row skipped", () => {
    const B = fromTwseMonth({ data: [
        ["115/11/02", "12,345,678", "1", "103.80", "104.20", "103.10", "103.85", "+0.5", "9"],
        ["115/11/03", "1,000", "1", "--", "--", "--", "--", "", "0"],
    ] })!;
    assert.deepEqual(B.d, ["2026-11-02"]);
    assert.deepEqual([B.o[0], B.h[0], B.l[0], B.c[0], B.v[0]], [10380, 10420, 10310, 10385, 12345678]);
    assert.equal(fromTwseMonth({ stat: "no data" }), null);
});

test("months join in date order without repeats; a window is N bars, intraday = the last session", () => {
    const m = (d: string[]) => ({ d, o: d.map(() => 1), h: d.map(() => 1), l: d.map(() => 1), c: d.map((_, i) => i + 1), v: d.map(() => 0), ohlc: true });
    const B = joinBars([m(["2026-11-02", "2026-11-03"]), m(["2026-09-30", "2026-10-15", "2026-11-02"])]);
    assert.deepEqual(B.d, ["2026-09-30", "2026-10-15", "2026-11-02", "2026-11-03"]);
    assert.equal(windowOf(B, "D"), 4);
    const I = m(["2026-11-03T13:29", "2026-11-04T09:00", "2026-11-04T09:01", "2026-11-04T09:02"]);
    assert.equal(windowOf(I, "I"), 3);
    assert.equal(windowOf(m([...Array(200)].map((_, i) => `2026-01-01T${i}`)), "5m"), 96);
    assert.deepEqual(extremes({ ...B, h: [5, 9, 9, 2], l: [3, 1, 4, 1] }, 0, 4), { hi: 1, lo: 1 });
});

test("MA20 waits for 20 bars", () => {
    const ma = movingAverage([...Array(21)].map((_, i) => (i + 1) * 100), 20);
    assert.equal(ma[18], null);
    assert.equal(ma[19], 1050);
    assert.equal(ma[20], 1150);
});

test("nice ticks are round steps, 4–5 of them", () => {
    assert.deepEqual(niceTicks(9861, 10527), [10000, 10200, 10400]);     // 98.61–105.27 → 100, 102, 104 (step 2.00)
    assert.deepEqual(niceTicks(4410, 5862), [4500, 5000, 5500]);
    for (const [lo, hi] of [[123, 9876], [10010, 10090], [99950, 104321]]) {
        const t = niceTicks(lo, hi);
        assert.ok(t.length >= 2 && t.length <= 5, `${lo}-${hi}: ${t}`);
        const step = t[1] - t[0], mag = 10 ** Math.floor(Math.log10(step));
        assert.ok([1, 2, 2.5, 5].includes(step / mag), `step ${step}`);
    }
});

test("x ticks: hours on minute charts (a new day by its date), months on D, quarters on W, years on M; none at the left edge", () => {
    assert.deepEqual(xTicks(["2026-11-03T13:25", "2026-11-04T09:00", "2026-11-04T09:55", "2026-11-04T10:00"], "5m"), [{ i: 1, label: "Nov 4" }, { i: 3, label: "10:00" }]);
    assert.deepEqual(xTicks(["2026-11-03T13:00", "2026-11-03T13:30", "2026-11-04T09:00"], "30m"), [{ i: 2, label: "Nov 4" }]);
    assert.deepEqual(xTicks(["2026-10-08", "2026-10-30", "2026-11-02"], "D"), [{ i: 2, label: "NOV" }]);
    assert.deepEqual(xTicks(["2026-02-23", "2026-03-02", "2026-04-06", "2026-12-28", "2027-01-04"], "W"), [{ i: 2, label: "APR" }, { i: 4, label: "2027" }]);
    assert.deepEqual(xTicks(["2025-12-01", "2026-01-01"], "M"), [{ i: 1, label: "2026" }]);
});

test("Fib levels run from B back toward A", () => {
    const L = fibLevels(4410, 5862, [0.5, 0.618]);
    assert.deepEqual(L, [{ r: 0, price: 5862 }, { r: 0.5, price: 5136 }, { r: 0.618, price: 4965 }, { r: 1, price: 4410 }]);
    assert.equal(fibLevels(4410, 5862, [1.618]).find((x) => x.r === 1.618)!.price, Math.round(5862 - 1452 * 1.618));
});

test("snap takes the candle's high or low, whichever is nearer", () => {
    const B = { d: ["x"], o: [100], h: [110], l: [90], c: [105], v: [0], ohlc: true };
    assert.equal(snapPrice(B, 0, 104), 110);
    assert.equal(snapPrice(B, 0, 96), 90);
});

test("a line runs on past B", () => {
    assert.equal(lineAt(0, 100, 10, 200, 20), 300);
    assert.equal(indexOf(["2026-11-02", "2026-11-04"], "2026-11-03"), 0);
    assert.equal(indexOf(["2026-11-02", "2026-11-04"], "2026-11-09"), 1);
});

test("drawings read from the note: bad ones left out, a level has no B", () => {
    const D = readDrawings({ drawings: [
        { id: "d1", type: "fib", a: { date: "2026-10-01", price: 4410 }, b: { date: "2026-10-20", price: 5862 } },
        { id: "d2", type: "level", a: { date: "2026-10-01", price: 5000 }, b: { date: "x", price: 1 }, hidden: true },
        { type: "line", a: { date: "2026-10-01", price: 4410 } },
        { type: "circle", a: { date: "2026-10-01", price: 1 } },
    ] });
    assert.deepEqual(D.map((d) => [d.id, d.type, d.b?.price ?? null, d.hidden]), [["d1", "fib", 5862, false], ["d2", "level", null, true]]);
    assert.equal(newDrawingId(D), "d3");
});

test("chart prefs default to the mock: 23.6–78.6, snap, cost line, MA20", () => {
    assert.deepEqual(readPrefs(null), { fib: [0.236, 0.382, 0.5, 0.618, 0.786], snap: true, cost: true, ma: 20, bb: false });
    assert.deepEqual(readPrefs({ chart: { fib: [0.5, 1.618, 0.3], snap: false, ma: 60 } }), { fib: [0.5, 1.618], snap: false, cost: true, ma: 60, bb: false });
    assert.equal(readPrefs({ chart: { bb: true } }).bb, true);
});

test("join: on a day both have, the first part wins (TWSE over a lagging Yahoo)", () => {
    const one = (d: string, c: number) => ({ d: [d], o: [c], h: [c], l: [c], c: [c], v: [0], ohlc: true });
    assert.deepEqual(joinBars([one("2026-11-03", 10060), one("2026-11-03", 1)]).c, [10060]);
});

test("the live quote fixes its own day's bar; today's change is against the close before that day", () => {
    const B = { d: ["2026-11-02", "2026-11-03"], o: [10340, 10250], h: [10445, 10335], l: [10305, 10120], c: [10410, 10130], v: [1, 1], ohlc: true };
    const L = withLive(B, "2026-11-03", 10060);
    assert.deepEqual([L.c[1], L.h[1], L.l[1]], [10060, 10335, 10060]);
    assert.equal(withLive(B, "2026-11-04", 10060), B);
    assert.equal(closeBefore(B, "2026-11-03"), 10410);
    assert.equal(closeBefore(B, "2026-11-02"), null);
});

test("nice ticks use the finest round step that still fits 5 ticks", () => {
    assert.deepEqual(niceTicks(9200, 11700), [9500, 10000, 10500, 11000, 11500]);
});

test("bollinger: middle = average, bands = ± k population σ, null until n bars", () => {
    const B = bollinger([200, 400, 600, 800], 4, 2);
    assert.deepEqual(B.mb.slice(0, 3), [null, null, null]);
    assert.equal(B.mb[3], 500);
    const sd = Math.sqrt((300 ** 2 + 100 ** 2 + 100 ** 2 + 300 ** 2) / 4);
    assert.ok(Math.abs(B.sd[3]! - sd) < 1e-9);
    assert.ok(Math.abs(B.ub[3]! - (500 + 2 * sd)) < 1e-9 && Math.abs(B.lb[3]! - (500 - 2 * sd)) < 1e-9);
    const flat = bollinger(Array(20).fill(5000));
    assert.equal(flat.sd[19], 0); assert.equal(flat.ub[19], 5000); assert.equal(flat.lb[19], 5000);
});

test("minute bars: Yahoo times in the exchange's zone, the close before; drawings keep their time", () => {
    const B = fromYahoo({ timestamp: [1762218000, 1762218300], meta: { gmtoffset: 28800, chartPreviousClose: 100.5 }, indicators: { quote: [{ open: [1, 2], high: [1, 2], low: [1, 2], close: [1, 2], volume: [5, 6] }] } }, true)!;
    assert.deepEqual(B.d, ["2025-11-04T09:00", "2025-11-04T09:05"]);
    assert.equal(B.pc, 10050);
    const D = readDrawings({ drawings: [{ type: "level", a: { date: "2026-11-04T10:30", price: 9800 } }, { type: "level", a: { date: "2026-11-04", price: 9800 } }] });
    assert.deepEqual(D.map((d) => d.a.date), ["2026-11-04T10:30", "2026-11-04"]);
});

test("pinch zoom keeps the bar under the fingers in place, within 12 bars and all of them", () => {
    assert.deepEqual(zoomAt(100, 50, 50, 25, 25), { win: 25, off: 12 });   // bars 63–87: bar 75 still in the middle
    assert.deepEqual(zoomAt(100, 50, 50, 49, 25), { win: 25, off: 0 });    // at the right edge: stays at the latest
    assert.deepEqual(zoomAt(100, 50, 50, 25, 5), { win: 12, off: 19 });
    assert.deepEqual(zoomAt(100, 50, 50, 25, 400), { win: 100, off: 0 });
});

test("live quote on minute bars: moves the last bar, starts the next one, leaves other days alone", () => {
    const B = { d: ["2026-11-04T10:00", "2026-11-04T10:05"], o: [100, 101], h: [102, 103], l: [99, 100], c: [101, 102], v: [5, 6], ohlc: true };
    const a = withLiveMinute(B, "2026-11-04T10:08", 104, 5);
    assert.deepEqual([a.d.length, a.c[1], a.h[1], a.l[1]], [2, 104, 104, 100]);
    const b = withLiveMinute(B, "2026-11-04T10:11", 99, 5);
    assert.deepEqual([b.d[2], b.o[2], b.c[2], b.v[2]], ["2026-11-04T10:10", 99, 99, 0]);
    assert.equal(withLiveMinute(B, "2026-11-05T09:00", 99, 5), B);
    assert.equal(withLiveMinute(B, "2026-11-04T09:55", 99, 5), B);
    assert.equal(withLiveMinute(B, "2026-11-04T10:44", 99, 60).d.length, 2);   // 60-minute bars at :30 (US): still the last one
});

test("Day change: against the close before the quote's day; a stale close is its own bar's move; closes fallback", async () => {
    const { dayChange } = await import("../src/calc/chart");
    const B = { d: ["2026-11-02", "2026-11-03", "2026-11-04"], o: [0, 0, 0], h: [0, 0, 0], l: [0, 0, 0], c: [10000, 10100, 9950], v: [0, 0, 0] };
    assert.deepEqual(dayChange(B, { day: "2026-11-04", price: 9985 }), { ch: -115, pct: (-115 / 10100) * 100 });
    assert.equal(dayChange(B, { day: "2026-11-05", price: 9950 })!.ch, -150);   // yesterday's close read today
    assert.equal(dayChange(B, { day: "2026-11-05", price: 9990 })!.ch, 40);     // a new day's price
    assert.equal(dayChange(null, { day: "2026-11-04", price: 9950 }, [10000, 10100, 9950])!.ch, -150);
    assert.equal(dayChange(null, { day: "2026-11-04", price: 9990 }, [10000, 10100, 9950])!.ch, 40);
    assert.equal(dayChange(null, null), null);
    assert.equal(dayChange(null, { day: "2026-11-04", price: 1 }, []), null);
});

test("TODAY keeps the last session with bars, the close before it from the day before", () => {
    const B = { d: ["2026-11-03T13:29", "2026-11-04T09:00", "2026-11-04T09:01"], o: [1, 2, 3], h: [1, 2, 3], l: [1, 2, 3], c: [100, 200, 300], v: [1, 1, 1], ohlc: true, pc: 50 };
    const S = lastSession(B)!;
    assert.deepEqual(S.d, ["2026-11-04T09:00", "2026-11-04T09:01"]);
    assert.deepEqual(S.c, [200, 300]);
    assert.equal(S.pc, 100);
    assert.equal(lastSession({ ...B, d: B.d.slice(0, 1), c: [100], o: [1], h: [1], l: [1], v: [1] })!.pc, 50);   // one day only: Yahoo's close before
    assert.equal(lastSession(null), null);
});

test("live ticks: 1-minute bars from quotes, joined after the fetched bars; TODAY starts today over yesterday", () => {
    let T = addTick(null, "2026-11-05T09:06", 20000);
    T = addTick(T, "2026-11-05T09:06", 20100);
    T = addTick(T, "2026-11-05T09:07", 19900);
    T = addTick(T, "2026-11-05T09:05", 50000);   // older quote: ignored
    assert.deepEqual(T.d, ["2026-11-05T09:06", "2026-11-05T09:07"]);
    assert.deepEqual([T.o[0], T.h[0], T.l[0], T.c[0]], [20000, 20100, 20000, 20100]);
    assert.equal(addTick(T, "2026-11-06T09:00", 100).d.length, 1);   // a new day starts over
    const Y = { d: ["2026-11-04T13:29", "2026-11-04T13:30"], o: [1, 1], h: [1, 1], l: [1, 1], c: [19500, 19600], v: [9, 9], ohlc: true, pc: 19000 };
    const I = withTicks(Y, T, 1, true);
    assert.deepEqual(I.d, T.d); assert.equal(I.pc, 19600);
    const M = withTicks(Y, T, 5, false);   // 5-minute candles: both ticks in the 09:05 bar, after yesterday's
    assert.deepEqual(M.d, ["2026-11-04T13:29", "2026-11-04T13:30", "2026-11-05T09:05"]);
    assert.deepEqual([M.o[2], M.h[2], M.l[2], M.c[2]], [20000, 20100, 19900, 19900]);
    const S = { ...Y, d: ["2026-11-05T09:06"], c: [20050], o: [1], h: [20050], l: [1], v: [9] };   // fetched bars reach 09:06
    const J = withTicks(S, T, 1, true);
    assert.deepEqual(J.d, ["2026-11-05T09:06", "2026-11-05T09:07"]); assert.equal(J.c[0], 20100); assert.equal(J.v[0], 9);
    assert.equal(withTicks(Y, null, 1), Y);
});

test("Fugle candles: the exchange's minute from the date, in order, the close before", () => {
    const B = fromFugle({ data: [
        { date: "2026-11-05T09:01:00.000+08:00", open: 201.1, high: 201.5, low: 201, close: 201.35, volume: 120 },
        { date: "2026-11-05T09:00:00.000+08:00", open: 200, high: 201.2, low: 199.95, close: 201.1, volume: 900 },
        { date: "2026-11-05T09:02:00.000+08:00", open: 0, high: 0, low: 0, close: 0, volume: 0 },
    ] }, 199.5)!;
    assert.deepEqual(B.d, ["2026-11-05T09:00", "2026-11-05T09:01"]);
    assert.deepEqual(B.c, [20110, 20135]); assert.deepEqual(B.l, [19995, 20100]); assert.deepEqual(B.v, [900, 120]);
    assert.equal(B.pc, 19950);
    assert.equal(fromFugle({ data: [] }), null); assert.equal(fromFugle({}), null);
});

test("live ticks carry their minute's volume; a tick inside the last fetched bar adds none", async () => {
    const { addTick, withTicks } = await import("../src/calc/chart");
    let T = addTick(null, "2026-11-10T10:00", 100000, 5000);
    T = addTick(T, "2026-11-10T10:00", 100500, 2000);
    T = addTick(T, "2026-11-10T10:01", 100500, 3000);
    assert.deepEqual(T.v, [7000, 3000]);
    const B = { d: ["2026-11-10T10:00"], o: [100000], h: [100000], l: [100000], c: [100000], v: [9000], ohlc: true };
    assert.deepEqual(withTicks(B, T, 1).v, [9000, 3000]);
});
