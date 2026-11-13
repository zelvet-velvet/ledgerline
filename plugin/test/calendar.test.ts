import { test } from "node:test";
import assert from "node:assert/strict";
import { EMPTY_CAL, parseDgpa, parseNasdaq, parseTwseHolidays } from "../src/calc/calendar";
import { closedInHours, marketOpen, nextOpen } from "../src/calc/quotes";

test("parseTwseHolidays: weekday closures by ROC date, trading-day notes left out", () => {
    const h = parseTwseHolidays([
        { Name: "國慶日", Date: "1151009" },
        { Name: "國曆新年開始交易日", Date: "1150102" },
        { Name: "農曆春節前最後交易日", Date: "1150211" },
        { Name: "市場無交易，僅辦理結算交割作業", Date: "1150212" },
        { Name: "國慶日", Date: "1151010" },   // a Saturday
    ]);
    assert.deepEqual(h, { "2026-10-09": "holiday", "2026-02-12": "holiday" });
    assert.deepEqual(parseTwseHolidays(null), {});
});

const page = (taipei: string, others = "") => `<html><body><div>115年</div><div>11月</div><div>5日 天然災害停止上班及上課情形</div>
<table><tr><td>縣市名稱</td><td>是否停止上班上課情形</td></tr>${others}<tr><td>臺北市</td><td>${taipei}</td></tr><tr><td>新北市</td><td>明天停止上班、停止上課。</td></tr></table><p>1.若欲進入本總處網站首頁版面</p></body></html>`;

test("parseDgpa: Taipei City's whole-day or morning stoppage, today or tomorrow", () => {
    assert.deepEqual(parseDgpa(page("今天停止上班、停止上課。")), ["2026-11-05"]);
    assert.deepEqual(parseDgpa(page("今天照常上班、照常上課。明天停止上班、停止上課。")), ["2026-11-06"]);
    assert.deepEqual(parseDgpa(page("11月6日上午停止上班、停止上課。")), ["2026-11-06"]);
    assert.deepEqual(parseDgpa(page("今天下午停止上班、停止上課。")), []);
    assert.deepEqual(parseDgpa(page("照常上班、照常上課。", "<tr><td>宜蘭縣</td><td>今天停止上班、停止上課。</td></tr>")), []);   // only another county
    assert.deepEqual(parseDgpa("<p>無停班停課訊息。</p>"), []);
});

test("parseNasdaq: holidays between the trading days, early close", () => {
    const d = (o: Record<string, unknown>) => ({ data: { isBusinessDay: true, ...o } });
    // Thanksgiving: Wednesday's session, next trade Friday (closing 13:00)
    assert.deepEqual(parseNasdaq(d({ marketOpeningTime: "Nov 25, 2026 09:30 AM ET", marketClosingTime: "Nov 25, 2026 04:00 PM ET", previousTradeDate: "Nov 24, 2026", nextTradeDate: "Nov 27, 2026" })),
        { closed: { "2026-11-26": "holiday" }, early: {} });
    assert.deepEqual(parseNasdaq(d({ marketOpeningTime: "Nov 27, 2026 09:30 AM ET", marketClosingTime: "Nov 27, 2026 01:00 PM ET", previousTradeDate: "Nov 25, 2026", nextTradeDate: "Nov 30, 2026" })),
        { closed: { "2026-11-26": "holiday" }, early: { "2026-11-27": 780 } });
    // an ordinary day: nothing
    assert.deepEqual(parseNasdaq(d({ marketOpeningTime: "Nov 5, 2026 09:30 AM ET", marketClosingTime: "Nov 5, 2026 04:00 PM ET", previousTradeDate: "Nov 4, 2026", nextTradeDate: "Nov 6, 2026" })),
        { closed: {}, early: {} });
    assert.equal(parseNasdaq({}), null);
});

test("marketOpen / nextOpen / closedInHours follow the calendar", () => {
    const cal = EMPTY_CAL();
    cal.tw["2026-11-06"] = "typhoon";
    cal.us["2026-11-26"] = "holiday";
    cal.usEarly["2026-11-27"] = 780;
    // Friday 2026-11-06 10:00 Taipei: closed by the typhoon, next open Monday 09:00
    const fri = new Date("2026-11-06T02:00:00Z");
    assert.equal(marketOpen("0050.TW", fri), true);
    assert.equal(marketOpen("0050.TW", fri, cal), false);
    assert.equal(closedInHours("0050.TW", fri, cal), "typhoon");
    assert.equal(nextOpen("0050.TW", new Date("2026-11-05T06:00:00Z"), cal)!.toISOString(), "2026-11-09T01:00:00.000Z");
    // Thanksgiving: the US opens Friday 09:30; Friday closes at 13:00 (13:05 with the close's minutes)
    assert.equal(nextOpen("VOO", new Date("2026-11-25T22:00:00Z"), cal)!.toISOString(), "2026-11-27T14:30:00.000Z");
    assert.equal(marketOpen("VOO", new Date("2026-11-27T18:00:00Z"), cal), true);    // 13:00 New York
    assert.equal(marketOpen("VOO", new Date("2026-11-27T18:30:00Z"), cal), false);   // 13:30
    assert.equal(closedInHours("VOO", new Date("2026-11-27T18:30:00Z"), cal), "early");
    assert.equal(closedInHours("VOO", new Date("2026-11-27T22:00:00Z"), cal), null);   // 17:00: past the usual hours
});
