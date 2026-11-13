import { test } from "node:test";
import assert from "node:assert/strict";
import { appTicker, fromTwseAll, fromYahooSearch, matchListed, mergeHits, pushHistory } from "../src/calc/search";

test("Search: app tickers, TWSE list, matching by code and name", () => {
    assert.equal(appTicker("2330.tw", true), "2330");
    assert.equal(appTicker("2330.TW", false), "2330.TW");
    assert.equal(appTicker("6488.TWO", true), "6488.TWO");
    const L = fromTwseAll([{ Code: "2330", Name: "台積電" }, { Code: "0050", Name: "元大台灣50" }, { Code: "00878", Name: "國泰永續高股息" }, { Code: "2303", Name: "聯電" }, { Name: "x" }]);
    assert.equal(L.length, 4);
    assert.deepEqual(matchListed(L, "23").map((x) => x[0]), ["2303", "2330"]);
    assert.deepEqual(matchListed(L, "2330").map((x) => x[0]), ["2330"]);
    assert.deepEqual(matchListed(L, "台積").map((x) => x[0]), ["2330"]);
    assert.deepEqual(matchListed(L, "台灣").map((x) => x[0]), ["0050"]);
    assert.deepEqual(matchListed(L, " "), []);
});

test("Search: Yahoo hits without options, merged once each, history", () => {
    const y = fromYahooSearch({ quotes: [{ symbol: "2330.TW", shortname: "TSMC", exchDisp: "Taiwan", quoteType: "EQUITY" }, { symbol: "X261231P1", quoteType: "OPTION" }, { symbol: "QQQ", longname: "Invesco QQQ", exchDisp: "NASDAQ", quoteType: "ETF" }] }, true);
    assert.deepEqual(y.map((h) => h.tk), ["2330", "QQQ"]);
    assert.deepEqual(mergeHits([{ tk: "2330", name: "台積電", ex: "TWSE", mine: "held" }], y).map((h) => h.name), ["台積電", "Invesco QQQ"]);
    assert.deepEqual(pushHistory(["A", "B", "C"], "B", 3), ["B", "A", "C"]);
    assert.deepEqual(pushHistory(["A", "B", "C"], "D", 3), ["D", "A", "B"]);
});
