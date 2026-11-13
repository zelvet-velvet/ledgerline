import { test } from "node:test";
import assert from "node:assert/strict";
import { brokersDue, isForeignBroker, parseZco } from "../src/calc/brokers";

const td = (s: string) => `<TD class="t3n1">${s}</TD>`;
const name = (s: string) => `<TD class="t4t1" nowrap><a href="/z/x?a=1&b=2">${s}</a></TD>`;
const HTML = `<div class="t11">單位：張　最後更新日：2026/11/3</div>
<TR id="oScrollMenu"><TD class="t2" nowrap>買超券商</TD><TD class="t2">買進</TD><TD class="t2">賣出</TD><TD class="t2">買超</TD><TD class="t2">佔成交比重</TD><TD class="t2" nowrap>賣超券商</TD><TD class="t2">買進</TD><TD class="t2">賣出</TD><TD class="t2">賣超</TD><TD class="t2">佔成交比重</TD></TR>
<TR>${name("甲-一")}${td("18,580")}${td("2,857")}${td("15,723")}${td("5.2%")}${name("乙&amp;丙")}${td("11,096")}${td("93,559")}${td("82,463")}${td("27.27%")}</tr>
<TR>${name("丁")}${td("10")}${td("0")}${td("10")}${td("0.01%")}<TD class="t4t1">&nbsp;</TD>${td("")}${td("")}${td("")}${td("")}</tr>
<TR id="oScrollFoot"><TD class="t4t1" nowrap>合計買超張數</td><td class="t3n1" colspan=4>42,296</td><TD class="t4t1" nowrap>合計賣超張數</td><td class="t3n1" colspan=4>208,419</td></TR>
<TR id="oScrollFoot"><TD class="t4t1" nowrap>平均買超成本</td><td class="t3n1" colspan=4>101.74</td><TD class="t4t1" nowrap>平均賣超成本</td><td class="t3n1" colspan=4>101.7</td></TR>`;

test("Top brokers page: both lists, empty sell cells skipped, totals and costs, the date", () => {
    const x = parseZco(HTML)!;
    assert.equal(x.asOf, "2026-11-03");
    assert.deepEqual(x.buy, [{ name: "甲-一", b: 18580, s: 2857, net: 15723, pct: 520 }, { name: "丁", b: 10, s: 0, net: 10, pct: 1 }]);
    assert.deepEqual(x.sell, [{ name: "乙&丙", b: 11096, s: 93559, net: -82463, pct: 2727 }]);
    assert.deepEqual([x.buyTotal, x.sellTotal, x.buyCost, x.sellCost], [42296, 208419, 10174, 10170]);
    assert.equal(parseZco("<html>no list</html>"), null);
});

test("Top brokers: foreign branches, when a stored list is old", () => {
    assert.ok(isForeignBroker("美商高盛"));
    assert.ok(isForeignBroker("台灣摩根士丹利"));
    assert.ok(!isForeignBroker("國泰-敦南"));
    const at = (d: number, h: number) => new Date(2026, 10, d, h).getTime();
    assert.equal(brokersDue(null, new Date(2026, 10, 4, 10)), true);
    assert.equal(brokersDue(at(4, 9), new Date(2026, 10, 4, 15)), false);
    assert.equal(brokersDue(at(4, 9), new Date(2026, 10, 4, 16)), true);
    assert.equal(brokersDue(at(4, 17), new Date(2026, 10, 4, 20)), false);
    assert.equal(brokersDue(at(3, 20), new Date(2026, 10, 4, 8)), true);
});
