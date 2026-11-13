import { test } from "node:test";
import assert from "node:assert/strict";
import { marketOpen, nextOpen, parseFugleQuote, parseTwse, parseTwseAll } from "../src/calc/quotes";
import { dayChange } from "../src/calc/chart";

const mis = (o: Record<string, string>) => ({ msgArray: [{ y: "50.0000", tlong: "1700000000000", ...o }] });

test("parseTwse: the last trade when there is one", () => {
    const q = parseTwse(mis({ z: "49.5000", t: "10:00:00", b: "49.45_49.40_", a: "49.50_49.55_" }))!;
    assert.equal(q.price, 49.5);
    assert.equal(q.prev, 50);
    assert.equal(q.source, "twse");
});
test("parseTwse: no last trade mid-session = the middle of the best bid and ask, not yesterday's close", () => {
    assert.equal(parseTwse(mis({ z: "-", t: "10:08:19", b: "49.05_49.00_", a: "49.10_49.15_" }))!.price, 49.08);
    assert.equal(parseTwse(mis({ z: "-", t: "10:08:19", b: "49.05_", a: "-" }))!.price, 49.05);
});
test("parseTwse: before 09:00 (trial book) yesterday's close", () => {
    assert.equal(parseTwse(mis({ z: "-", t: "08:45:00", b: "48.00_", a: "48.05_" }))!.price, 50);
});
test("parseTwse: nothing usable = null", () => {
    assert.equal(parseTwse({ msgArray: [] }), null);
    assert.equal(parseTwse(mis({ y: "-", z: "-", t: "08:00:00" })), null);
});

test("parseFugleQuote: the last trade, the reference price, microseconds to ms", () => {
    const q = parseFugleQuote({ referencePrice: 50, previousClose: 50.2, closePrice: 49.4, closeTime: 1700000000123456, lastTrade: { price: 49.45, time: 1700000000654321 } })!;
    assert.equal(q.price, 49.45);
    assert.equal(q.prev, 50);
    assert.equal(q.asOf, 1700000000654);
    assert.equal(q.source, "fugle");
});
test("parseFugleQuote: before the first trade the reference price, no reference = previous close", () => {
    const q = parseFugleQuote({ previousClose: 50, lastUpdated: 1700000000000000 })!;
    assert.equal(q.price, 50);
    assert.equal(q.prev, 50);
    assert.equal(parseFugleQuote({}), null);
});

test("dayChange: the quote's reference price wins over day bars missing yesterday", () => {
    // bars end two days back (yesterday's bar missing): 51.00; reference (yesterday) 50.00; now 49.00
    const B = { d: ["2026-11-02", "2026-11-03"], o: [5100, 5100], h: [5100, 5100], l: [5100, 5100], c: [5100, 5100], v: [0, 0] };
    const live = { day: "2026-11-05", price: 4900 };
    assert.equal(dayChange(B, live)!.ch, -200);
    const d = dayChange(B, live, undefined, 5000)!;
    assert.equal(d.ch, -100);
    assert.equal(d.pct, -2);
});

test("marketOpen: Taiwan 09:00–13:35 Taipei on weekdays, US 09:30–16:05 New York", () => {
    // 2026-11-05 is a Thursday; Taipei = UTC+8, New York = UTC−5 in November
    assert.equal(marketOpen("0050.TW", new Date("2026-11-05T00:59:00Z")), false);   // 08:59
    assert.equal(marketOpen("0050.TW", new Date("2026-11-05T01:00:00Z")), true);    // 09:00
    assert.equal(marketOpen("6488.TWO", new Date("2026-11-05T05:35:00Z")), true);   // 13:35
    assert.equal(marketOpen("0050.TW", new Date("2026-11-05T05:36:00Z")), false);   // 13:36
    assert.equal(marketOpen("0050.TW", new Date("2026-11-07T02:00:00Z")), false);   // Saturday
    assert.equal(marketOpen("AAPL", new Date("2026-11-05T14:29:00Z")), false);      // 09:29
    assert.equal(marketOpen("AAPL", new Date("2026-11-05T14:30:00Z")), true);       // 09:30
    assert.equal(marketOpen("AAPL", new Date("2026-11-05T21:05:00Z")), true);       // 16:05
    assert.equal(marketOpen("AAPL", new Date("2026-11-05T21:06:00Z")), false);
});

test("parseTwseAll: one answer for many tickers, by code; unusable ones left out", () => {
    const all = parseTwseAll({ msgArray: [
        { c: "0050", z: "49.5000", y: "50.0000", t: "10:00:00", tlong: "1700000000000" },
        { c: "2330", z: "-", y: "1000.0000", t: "10:00:00", b: "990.00_", a: "991.00_", tlong: "1700000000000" },
        { c: "9999", z: "-", y: "-", t: "08:00:00" },
    ] });
    assert.deepEqual(Object.keys(all).sort(), ["0050", "2330"]);
    assert.equal(all["0050"].price, 49.5);
    assert.equal(all["2330"].price, 990.5);
    assert.equal(all["2330"].prev, 1000);
});

test("nextOpen: the next weekday open of the ticker's market", () => {
    // Thursday 2026-11-05 14:00 Taipei (06:00Z): Taiwan next Friday 09:00 Taipei, US today 09:30 New York (14:30Z, EST)
    assert.equal(nextOpen("0050.TW", new Date("2026-11-05T06:00:00Z"))!.toISOString(), "2026-11-06T01:00:00.000Z");
    assert.equal(nextOpen("VOO", new Date("2026-11-05T06:00:00Z"))!.toISOString(), "2026-11-05T14:30:00.000Z");
    // Friday after the US close: Monday 09:30 New York
    assert.equal(nextOpen("VOO", new Date("2026-11-06T22:00:00Z"))!.toISOString(), "2026-11-09T14:30:00.000Z");
    // summer time (EDT): 13:30Z
    assert.equal(nextOpen("VOO", new Date("2026-07-01T02:00:00Z"))!.toISOString(), "2026-07-01T13:30:00.000Z");
});

// 2026-11-06: US live ticks were keyed in the device's zone (Taipei, a day ahead of New York), so TODAY broke after the open
import { marketMinute, marketTime } from "../src/calc/quotes";
test("marketMinute: a US quote is keyed at New York's minute, a Taiwan one at Taipei's", () => {
    const t = Date.UTC(2026, 10, 5, 18, 35, 20);   // 13:35:20 in New York (EST), 02:35:20 next day in Taipei
    assert.equal(marketMinute("AAPL", t), "2026-11-05T13:35");
    assert.equal(marketMinute("0050.TW", t), "2026-11-06T02:35");
    assert.equal(marketMinute("6488.TWO", Date.UTC(2026, 10, 6, 1, 0)), "2026-11-06T09:00");
});
test("marketMinute: summer time in New York (EDT, UTC−4)", () => {
    assert.equal(marketMinute("VOO", Date.UTC(2026, 6, 1, 13, 30)), "2026-07-01T09:30");
});
test("marketMinute: the US day bar a live quote patches is New York's day, so today's change is against yesterday", async () => {
    const { dayChange } = await import("../src/calc/chart");
    const B = { d: ["2026-11-04", "2026-11-05"], o: [0, 0], h: [0, 0], l: [0, 0], c: [34962, 34287], v: [0, 0], ohlc: true };
    const at = marketMinute("AAPL", Date.UTC(2026, 10, 5, 18, 35));
    const d = dayChange(B, { day: at.slice(0, 10), price: 34266 })!;
    assert.equal(d.ch, 34266 - 34962);
});
test("marketTime: the source line's clock is the market's", () => {
    assert.equal(marketTime("AAPL", Date.UTC(2026, 10, 5, 18, 36, 15)), "13:36:15");
    assert.equal(marketTime("0050.TW", Date.UTC(2026, 10, 6, 3, 1, 2)), "11:01:02");
});
