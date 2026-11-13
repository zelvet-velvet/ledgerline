"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => LedgerlinePlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian28 = require("obsidian");

// src/ui/pixel.ts
var SPR = {
  log: [".#.....#.", "#########", "#.......#", "#########", "#.#.#.#.#", "#.......#", "#.#.#.#.#", "#.......#", "#########"],
  debt: [".........", "#########", "#.......#", "#########", "#########", "#.......#", "#.##..#.#", "#.......#", "#########"],
  invest: ["......###", ".......##", "......#.#", "#....#...", "##..#....", "#.##.....", "#........", "#........", "#########"],
  ledger: [".##...##.", "#..#.#..#", "#..#.#..#", ".##...##.", ".........", ".##...##.", "####.####", "####.####", "####.####"],
  goals: ["##.......", "#######..", "#######..", "#####....", "#........", "#........", "#........", "#........", "###......"],
  plus: [".........", "...###...", "...###...", ".#######.", ".#######.", ".#######.", "...###...", "...###...", "........."],
  close: [".........", ".##...##.", "..##.##..", "...###...", "...###...", "..##.##..", ".##...##.", ".........", "........."],
  back: [".........", "....#....", "...##....", "..#######", ".########", "..#######", "...##....", "....#....", "........."],
  // settings: two sliders (a pixel gear read as noise at 24 px)
  settings: [".........", "..##.....", "#########", "..##.....", ".........", ".....##..", "#########", ".....##..", "........."],
  flows: [".........", "..#......", "..#..#...", "#########", "....#..#.", "....#..#.", ".......#.", ".........", "........."],
  list: [".........", "##.######", ".........", ".........", "##.######", ".........", ".........", "##.######", "........."],
  coin: ["..#####..", ".#.....#.", "#..###..#", "#..#....#", "#..###..#", "#....#..#", "#..###..#", ".#.....#.", "..#####.."],
  food: ["..#..#...", "...#..#..", "..#..#...", ".........", "#########", "#.......#", ".#.....#.", "..#####..", "........."],
  fun: [".........", ".#######.", "#.......#", "#.#...#.#", "###..#.##", "#.#.....#", "#.......#", ".##...##.", "........."],
  transport: [".#######.", "#.......#", "#.##.##.#", "#.##.##.#", "#.......#", "#########", "#.#...#.#", "#########", ".#.....#."],
  home: ["....#....", "...###...", "..#####..", ".#######.", "#########", ".#.....#.", ".#.##..#.", ".#.##..#.", ".#######."],
  drinks: [".....##..", "....#....", ".#######.", ".#.....##", ".#.....#.", ".#.....##", ".#.....#.", "..#####..", "........."],
  // row icons (redesign C: every row carries one, so a line is never text alone)
  percent: ["##.....#.", "##....#..", "......#..", ".....#...", "....#....", "...#.....", "..#......", "..#....##", ".#.....##"],
  person: ["...###...", "..#####..", "..#####..", "...###...", ".........", ".#######.", "#########", "#########", "#########"],
  search: ["..###....", ".#...#...", "#.....#..", "#.....#..", "#.....#..", ".#...#...", "..####...", "......##.", ".......##"],
  grip: [".........", "..##.##..", "..##.##..", ".........", "..##.##..", "..##.##..", ".........", "..##.##..", "..##.##.."],
  eye: [".........", ".........", "..#####..", ".##...##.", "##..#..##", ".##...##.", "..#####..", ".........", "........."],
  clock: ["..#####..", ".#.....#.", "#...#...#", "#...#...#", "#...###.#", "#.......#", "#.......#", ".#.....#.", "..#####.."],
  receipt: [".#######.", ".#.....#.", ".#.###.#.", ".#.....#.", ".#.###.#.", ".#.....#.", ".#.##..#.", ".#.....#.", ".#.#.#.#."],
  up: ["....#....", "...###...", "..#####..", ".#######.", "...###...", "...###...", "...###...", "...###...", "........."],
  down: [".........", "...###...", "...###...", "...###...", "...###...", ".#######.", "..#####..", "...###...", "....#...."],
  wallet: [".........", "#######..", "#.......#", "#########", "#.....###", "#.....#.#", "#.....###", "#########", "........."],
  trash: ["...###...", "#########", ".........", ".#######.", ".#.#.#.#.", ".#.#.#.#.", ".#.#.#.#.", ".#.#.#.#.", ".#######."],
  check: [".........", "........#", ".......##", "#.....##.", "##...##..", ".##.##...", "..###....", "...#.....", "........."],
  swap: ["......#..", "#########", "......#..", ".........", "..#......", "#########", "..#......", ".........", "........."],
  // funds (2026-11-05): each fund its own picture
  travel: ["....#....", "...###...", "...###...", ".#######.", "#########", "...###...", "...###...", "..#####..", ".##...##."],
  shield: ["#########", "#.......#", "#...#...#", "#..###..#", "#...#...#", ".#.....#.", ".#.....#.", "..#...#..", "...###..."],
  study: [".........", "....#....", "..#####..", "#########", "..#####.#", "..#...#.#", "..#####.#", ".........", "........."],
  gifts: ["..#...#..", "...#.#...", "#########", "#...#...#", "#########", ".#..#..#.", ".#..#..#.", ".#..#..#.", ".#######."]
};
var KEYS = [
  [/food|meal|breakfast|lunch|dinner|brunch|snack|dessert|ice|eat|grocer|飯|餐|食|吃|點心/i, "food"],
  [/medic|doctor|health|pharma|clinic|藥|醫/i, "plus"],
  [/drink|coffee|tea|飲|咖啡|茶/i, "drinks"],
  [/fun|game|movie|play|hobby|entertain|娛樂|遊戲|電影/i, "fun"],
  [/transport|mrt|bus|taxi|car|fuel|gas|train|交通|捷運|油/i, "transport"],
  [/home|rent|house|util|bill|家|房|水電/i, "home"],
  [/gift|present|禮/i, "gifts"],
  [/travel|trip|vacation|holiday|journey|旅/i, "travel"],
  [/emergenc|rainy|safety|backup|buffer|急|備/i, "shield"],
  [/study|school|grad|learn|course|edu|tuition|學|教/i, "study"]
];
var ROW_KEYS = [
  [/interest|rate|%|percent|share|mix|progress|used/i, "percent"],
  [/history|payment|paid|expense|receipt|bought|cost/i, "receipt"],
  [/loan|debt|principal|owe/i, "debt"],
  [/date|start|since|day|month|calendar|today|last/i, "log"],
  [/watch/i, "eye"],
  [/holding|invest|trade|worth|profit|stock|etf/i, "invest"],
  [/goal|target|next/i, "goals"],
  [/fund|saving|saved|allocation|monthly|amount|set aside|cash|wallet|limit|quota/i, "wallet"],
  [/income|salary|bonus|in\b/i, "up"],
  [/people|friend|person|activity|ledger/i, "ledger"],
  [/delete|remove/i, "trash"],
  [/fixed|bill|rent/i, "home"],
  [/net worth|total/i, "coin"]
];
var nameSprite = (label, or) => KEYS.find(([re]) => re.test(label))?.[1] ?? or;
var rowSprite = (label) => KEYS.find(([re]) => re.test(label))?.[1] ?? ROW_KEYS.find(([re]) => re.test(label))?.[1] ?? "coin";
var LUCIDE = {
  "book-open": "receipt",
  landmark: "debt",
  percent: "percent",
  wallet: "wallet",
  "trending-down": "down",
  "trending-up": "invest",
  calendar: "log",
  "calendar-plus": "log",
  "calendar-days": "log",
  split: "swap",
  target: "goals",
  "piggy-bank": "wallet",
  receipt: "receipt",
  "trash-2": "trash",
  "check-circle": "check",
  "undo-2": "back",
  list: "list",
  layers: "list",
  banknote: "coin",
  coins: "coin",
  "circle-dollar-sign": "coin",
  "arrow-down-left": "up",
  "arrow-up-right": "down",
  plus: "plus",
  "shopping-bag": "gifts",
  gift: "gifts",
  "hand-coins": "wallet"
};
var pixelFor = (lucide, title = "") => {
  const n = lucide.split("|")[0].split(",")[0];
  if (n in SPR) return n;
  if (n.includes("hand")) return "ledger";
  if (n.includes("check")) return "check";
  return LUCIDE[n] ?? rowSprite(title);
};
var hasSprite = (name) => name in SPR;
var spriteIcons = () => [...Object.entries(SPR), ["go", SPR.back.map((r) => [...r].reverse().join(""))]].map(([name, rows]) => {
  const n = rows.length, k = 100 / n, out = [];
  rows.forEach((row2, y) => {
    let x = 0;
    while (x < n) {
      if (row2[x] !== "#") {
        x++;
        continue;
      }
      let w = 1;
      while (row2[x + w] === "#") w++;
      out.push(`<rect x="${+(x * k).toFixed(3)}" y="${+(y * k).toFixed(3)}" width="${+(w * k).toFixed(3)}" height="${+k.toFixed(3)}" style="fill:currentColor;stroke:none"/>`);
      x += w;
    }
  });
  return [`zlpx-${name}`, `<g shape-rendering="crispEdges">${out.join("")}</g>`];
});
var NS = "http://www.w3.org/2000/svg";
var sprite = (parent, name, cls = "zl-px") => {
  const rows = SPR[name] ?? SPR.coin, n = rows.length;
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class", cls);
  svg.dataset.px = SPR[name] ? name : "coin";
  svg.setAttribute("viewBox", `0 0 ${n} ${n}`);
  svg.setAttribute("fill", "currentColor");
  svg.setAttribute("aria-hidden", "true");
  rows.forEach((row2, y) => {
    let x = 0;
    while (x < n) {
      if (row2[x] !== "#") {
        x++;
        continue;
      }
      let w = 1;
      while (row2[x + w] === "#") w++;
      const r = document.createElementNS(NS, "rect");
      r.setAttribute("x", String(x));
      r.setAttribute("y", String(y));
      r.setAttribute("width", String(w));
      r.setAttribute("height", "1");
      svg.appendChild(r);
      x += w;
    }
  });
  parent?.appendChild(svg);
  return svg;
};
var GLYPH = {
  "0": [".###.", "#...#", "#..##", "#.#.#", "##..#", "#...#", ".###."],
  "1": ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", ".###."],
  "2": [".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####"],
  "3": ["#####", "...#.", "..#..", "...#.", "....#", "#...#", ".###."],
  "4": ["...#.", "..##.", ".#.#.", "#..#.", "#####", "...#.", "...#."],
  "5": ["#####", "#....", "####.", "....#", "....#", "#...#", ".###."],
  "6": ["..##.", ".#...", "#....", "####.", "#...#", "#...#", ".###."],
  "7": ["#####", "....#", "...#.", "..#..", ".#...", ".#...", ".#..."],
  "8": [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."],
  "9": [".###.", "#...#", "#...#", ".####", "....#", "...#.", ".##.."],
  ",": ["..", "..", "..", "..", "..", ".#", "#."],
  ".": [".", ".", ".", ".", ".", ".", "#"],
  " ": ["..", "..", "..", "..", "..", "..", ".."],
  "-": ["....", "....", "....", "####", "....", "....", "...."],
  "\u2014": ["....", "....", "....", "####", "....", "....", "...."]
};
var calm = () => document.body.hasClass("zl-calm") || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// src/debug.ts
var import_obsidian = require("obsidian");
var DebugLog = class {
  constructor(plugin) {
    this.plugin = plugin;
    this.lines = [];
    this.dirty = false;
    this.writing = false;
    window.zlDebug = (m) => this.note(m);
    plugin.registerInterval(window.setInterval(() => {
      void this.flush();
    }, 1e4));
  }
  note(msg) {
    this.lines.push(`${(/* @__PURE__ */ new Date()).toISOString()} +${Math.round(performance.now())}ms ${msg}`);
    if (this.lines.length > 200) this.lines.shift();
    this.dirty = true;
  }
  error(where, e) {
    const err = e instanceof Error ? `${e.message}
    ${(e.stack || "").split("\n").slice(1, 4).join("\n    ")}` : String(e);
    console.error("Ledgerline:", where, e);
    this.note(`ERROR ${where}: ${err}`);
    void this.flush();
  }
  async flush(force = false) {
    const s2 = this.plugin.settings;
    if (!(s2.debugLog && import_obsidian.Platform.isMobile) && !force || !this.dirty || this.writing) return;
    this.writing = true;
    try {
      const ad = this.plugin.app.vault.adapter, p = s2.debugPath;
      const dir = p.includes("/") ? p.slice(0, p.lastIndexOf("/")) : "";
      if (dir && !await ad.exists(dir)) await ad.mkdir(dir);
      const old = await ad.exists(p) ? await ad.read(p) : "";
      const body = `${old}
## ${(/* @__PURE__ */ new Date()).toISOString()}
${this.lines.join("\n")}
`;
      await ad.write(p, body.length > 2e5 ? body.slice(-1e5) : body);
      this.lines = [];
      this.dirty = false;
    } catch (e) {
      console.error("Ledgerline: debug log write failed", e);
    } finally {
      this.writing = false;
    }
  }
};

// src/prices/calendar.ts
var import_obsidian2 = require("obsidian");

// src/calc/calendar.ts
var EMPTY_CAL = () => ({ tw: {}, us: {}, usEarly: {} });
var p2 = (n) => String(n).padStart(2, "0");
var iso = (y, m, d) => `${y}-${p2(m)}-${p2(d)}`;
var addDays = (day, n) => {
  const d = /* @__PURE__ */ new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
var weekday = (day) => {
  const w = (/* @__PURE__ */ new Date(`${day}T12:00:00Z`)).getUTCDay();
  return w !== 0 && w !== 6;
};
var parseTwseHolidays = (json) => {
  const out = {};
  if (!Array.isArray(json)) return out;
  for (const x of json) {
    const m = /^(\d{2,3})(\d{2})(\d{2})$/.exec(String(x.Date ?? ""));
    if (!m || /開始交易|最後交易/.test(String(x.Name ?? ""))) continue;
    const day = iso(Number(m[1]) + 1911, Number(m[2]), Number(m[3]));
    if (weekday(day)) out[day] = "holiday";
  }
  return out;
};
var parseDgpa = (html) => {
  const lines = html.replace(/<(script|style)[\s\S]*?<\/\1>/gi, "").replace(/<[^>]+>/g, "\n").split("\n").map((l) => l.trim()).filter(Boolean);
  const head = /(\d{2,3})年\s*(\d{1,2})月\s*(\d{1,2})日/.exec(lines.join(" "));
  if (!head) return [];
  const y = Number(head[1]) + 1911, today3 = iso(y, Number(head[2]), Number(head[3]));
  const i = lines.findIndex((l) => l === "\u81FA\u5317\u5E02" || l === "\u53F0\u5317\u5E02");
  if (i < 0) return [];
  const said = [];
  for (const l of lines.slice(i + 1)) {
    if (/^[一-鿿]{1,4}[縣市]$/.test(l) || /^\d+\./.test(l)) break;
    said.push(l);
  }
  const out = /* @__PURE__ */ new Set();
  for (const s2 of said.join("").split("\u3002")) {
    if (!/停止上班/.test(s2)) continue;
    if (/(下午|晚間)[^上]*停止上班/.test(s2) && !/上午|全日|全天/.test(s2)) continue;
    const md = /(\d{1,2})月(\d{1,2})日/.exec(s2);
    let day = today3;
    if (md) {
      day = iso(y, Number(md[1]), Number(md[2]));
      if (day < addDays(today3, -200)) day = iso(y + 1, Number(md[1]), Number(md[2]));
    } else if (/明天|明日/.test(s2)) day = addDays(today3, 1);
    out.add(day);
  }
  return [...out];
};
var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var usDay = (s2) => {
  const m = /([A-Z][a-z]{2})\w*\s+(\d{1,2}),\s*(\d{4})/.exec(String(s2 ?? ""));
  const mo = m ? MON.indexOf(m[1]) : -1;
  return m && mo >= 0 ? iso(Number(m[3]), mo + 1, Number(m[2])) : null;
};
var usMin = (s2) => {
  const m = /(\d{1,2}):(\d{2})\s*(AM|PM)/.exec(String(s2 ?? ""));
  return m ? (Number(m[1]) % 12 + (m[3] === "PM" ? 12 : 0)) * 60 + Number(m[2]) : null;
};
var parseNasdaq = (json) => {
  const d = json?.data;
  if (!d) return null;
  const day = usDay(d.marketOpeningTime), prev = usDay(d.previousTradeDate), next = usDay(d.nextTradeDate), close = usMin(d.marketClosingTime);
  if (!prev || !next || prev >= next) return null;
  const closed = {}, early = {};
  for (let x = addDays(prev, 1), n = 0; x < next && n < 14; x = addDays(x, 1), n++) {
    if (weekday(x) && !(x === day && d.isBusinessDay !== false)) closed[x] = "holiday";
  }
  if (day && close !== null && close < 960 && !closed[day]) early[day] = close;
  return { closed, early };
};

// src/prices/calendar.ts
var TWSE = "https://openapi.twse.com.tw/v1/holidaySchedule/holidaySchedule";
var DGPA = "https://www.dgpa.gov.tw/typh/daily/nds.html";
var NASDAQ = "https://api.nasdaq.com/api/market-info";
var EVERY = { twse: 24 * 36e5, dgpa: 30 * 6e4, nasdaq: 6 * 36e5 };
var RETRY = 30 * 6e4;
var UA = { "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)", Accept: "application/json, text/html" };
var MarketCalendar = class {
  constructor(load2, save, changed) {
    this.load = load2;
    this.save = save;
    this.changed = changed;
    this.cal = EMPTY_CAL();
    this.at = {};
    this.busy = /* @__PURE__ */ new Set();
    try {
      const v = this.load();
      if (v?.cal) this.cal = { ...EMPTY_CAL(), ...v.cal };
      this.at = v?.at ?? {};
    } catch {
    }
  }
  // days over 40 days old are dropped, so the stored calendar stays small
  store() {
    const old = new Date(Date.now() - 40 * 864e5).toISOString().slice(0, 10), fresh = (m) => Object.fromEntries(Object.entries(m).filter(([d]) => d >= old));
    this.cal = { tw: fresh(this.cal.tw), us: fresh(this.cal.us), usEarly: fresh(this.cal.usEarly) };
    try {
      this.save({ cal: this.cal, at: this.at });
    } catch {
    }
  }
  // called with the background tick: what is due for the markets you follow
  tick(tw, us) {
    if (tw) {
      this.due("twse", (j) => {
        this.cal.tw = { ...keep(this.cal.tw, "holiday"), ...parseTwseHolidays(j) };
      });
      this.due("dgpa", (h2) => {
        this.typhoon(parseDgpa(String(h2)));
      }, true);
    }
    if (us) this.due("nasdaq", (j) => {
      const r = parseNasdaq(j);
      if (!r) throw new Error("nasdaq");
      this.cal.us = { ...this.cal.us, ...r.closed };
      this.cal.usEarly = { ...this.cal.usEarly, ...r.early };
    });
  }
  // a Taiwan weekday with no trade by 09:10 (calc: Prices.background), or a trade after all
  noTrade(day, none) {
    const was = this.cal.tw[day];
    if (none && !was) this.cal.tw[day] = "notrade";
    else if (!none && was === "notrade") delete this.cal.tw[day];
    else return;
    this.store();
    this.changed();
  }
  typhoon(days) {
    for (const d of days) if (!this.cal.tw[d]) this.cal.tw[d] = "typhoon";
  }
  due(src, use, text2 = false) {
    const now = Date.now();
    if (this.busy.has(src) || now - (this.at[src] ?? 0) < EVERY[src]) return;
    this.busy.add(src);
    const url = src === "twse" ? TWSE : src === "dgpa" ? DGPA : NASDAQ;
    void (0, import_obsidian2.requestUrl)({ url, headers: UA, throw: false }).then((r) => {
      if (r.status !== 200) throw new Error(String(r.status));
      const before = JSON.stringify(this.cal);
      use(text2 ? r.text : r.json);
      this.at[src] = now;
      this.store();
      if (JSON.stringify(this.cal) !== before) this.changed();
    }).catch(() => {
      this.at[src] = now - EVERY[src] + RETRY;
    }).finally(() => this.busy.delete(src));
  }
};
MarketCalendar.KEY = "ledgerline-market-cal";
var keep = (m, drop) => Object.fromEntries(Object.entries(m).filter(([, w]) => w !== drop));

// src/data/store.ts
var import_obsidian3 = require("obsidian");

// src/format.ts
var num = (n) => Math.round(Number(n) || 0).toLocaleString();
var pad = (n) => String(n).padStart(2, "0");
var ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
var today = () => ymd(/* @__PURE__ */ new Date());
var dateStr = (v, fallback = "") => {
  if (v instanceof Date && !isNaN(v.getTime())) return ymd(v);
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(String(v ?? "").trim());
  return m ? `${m[1]}-${pad(Number(m[2]))}-${pad(Number(m[3]))}` : fallback;
};
var localDate = (s2) => {
  const [y, m, d] = s2.split("-").map(Number);
  return new Date(y || 1970, (m || 1) - 1, d || 1);
};
var shortDate = (s2) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s2);
  if (!m) return s2;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.toLocaleDateString("en", d.getFullYear() === (/* @__PURE__ */ new Date()).getFullYear() ? { month: "short", day: "numeric" } : { month: "short", day: "numeric", year: "numeric" });
};
var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var monthLong = (d) => d.toLocaleString("en", { month: "long" }) + " " + d.getFullYear();
var parseNum = (v) => {
  const s2 = String(v ?? "").replace(/,/g, "").trim();
  return s2 === "" ? NaN : Number(s2);
};

// src/calc/log.ts
var IGNORE = ["file", "sticker", "cssclasses", "ledger", "date", "title", "tags", "aliases"];
var slug = (s2) => String(s2 || "").trim().toLowerCase().replace(/[^a-z0-9一-鿿]+/g, "_").replace(/^_|_$/g, "");
var arr = (v) => Array.isArray(v) ? v : v === void 0 || v === null ? [] : [v];
var budgetItems = (fm) => arr(fm?.budget).filter((x) => x && typeof x === "object").map((x) => ({ name: String(x.name ?? ""), quota: Number(x.quota) || 0, spending: arr(x.spending).map(String) }));
var monthIncome = (incomeCfg, month, monthNumber) => {
  const ov = month?.income_override ?? {};
  const rows = [];
  for (const [k, v] of Object.entries(incomeCfg ?? {})) {
    if (k.startsWith("file") || typeof v !== "number") continue;
    const has = ov[k] !== void 0;
    rows.push({ key: k, label: k, base: v, amount: has ? Number(ov[k]) || 0 : v, kind: "base", overridden: has });
  }
  for (const b of arr(incomeCfg?.bonuses)) {
    if (!b || Number(b.month) !== monthNumber) continue;
    const key = "bonus_" + slug(String(b.name));
    const has = ov[key] !== void 0;
    rows.push({ key, label: String(b.name), base: Number(b.amount) || 0, amount: has ? Number(ov[key]) || 0 : Number(b.amount) || 0, kind: "bonus", overridden: has });
  }
  for (const [k, v] of Object.entries(month?.extra_income ?? {})) rows.push({ key: k, label: k, base: Number(v) || 0, amount: Number(v) || 0, kind: "extra", overridden: false });
  return { rows, total: rows.reduce((t2, r) => t2 + r.amount, 0) };
};
var LIVING = "living";
var allocation = (plan, month, income) => {
  const val = (k) => month && month[k] !== void 0 ? Number(month[k]) || 0 : Number(plan[k]) || 0;
  const saved = Object.keys(plan).filter((k) => !k.startsWith("file") && k !== LIVING && typeof plan[k] === "number").reduce((s2, k) => s2 + val(k), 0);
  const hasLiving = month ? month[LIVING] !== void 0 : plan[LIVING] !== void 0;
  const living = hasLiving ? val(LIVING) : income - saved;
  return { living, saved, income, gap: income - saved - living };
};
var computeMonth = ({ month, days, plan, daily, fixed, income }) => {
  const has = (k) => !!month && month[k] !== void 0;
  const savings = Object.keys(plan).filter((k) => !k.startsWith("file") && k !== LIVING && typeof plan[k] === "number").map((k) => [k, has(k) ? Number(month[k]) : Number(plan[k]) || 0]);
  const alloc = allocation(plan, month, income);
  const saved = alloc.saved;
  const dailyProps = [...new Set(daily.flatMap((x) => x.spending))];
  const custom = /* @__PURE__ */ new Set();
  for (const d of days) for (const k of Object.keys(d.fm)) if (!IGNORE.includes(k) && typeof d.fm[k] === "number" && !dailyProps.includes(k)) custom.add(k);
  const spending = {};
  for (const d of days) for (const p of [...dailyProps, ...custom]) spending[p] = (spending[p] || 0) + (Number(d.fm[p]) || 0);
  const fixedRows = fixed.map((item) => {
    let total = 0;
    for (const p of item.spending) {
      const v = has(p) ? Number(month[p]) : item.quota;
      spending[p] = (spending[p] || 0) + v;
      total += v;
    }
    const prop = item.spending[0] ?? "";
    return { item, prop, def: item.quota, paid: has(prop) ? Number(month[prop]) || 0 : 0 };
  });
  const fixedTotal = fixed.reduce((s2, item) => s2 + item.spending.reduce((t2, p) => t2 + (has(p) ? Number(month[p]) : item.quota), 0), 0);
  const extraMonth = Object.entries(month?.extra_expenses ?? {});
  const extras = [];
  for (const prop of /* @__PURE__ */ new Set([...custom, ...extraMonth.map(([k]) => k)])) {
    const fromDays = spending[prop] || 0;
    const fromMonth = Number((month?.extra_expenses ?? {})[prop]) || 0;
    spending[prop] = fromDays + fromMonth;
    if (fromDays + fromMonth > 0) extras.push({ prop, total: fromDays + fromMonth, fromDays, fromMonth, days: days.filter((d) => Number(d.fm[prop]) > 0).map((d) => ({ name: d.name, path: d.path, amount: Number(d.fm[prop]) })).sort((a, b) => a.name.localeCompare(b.name)) });
  }
  const spent = Object.values(spending).reduce((s2, v) => s2 + v, 0);
  const spendable = Math.max(0, alloc.living - fixedTotal);
  const budget = daily.map((item, index) => {
    const quotaKey = (item.spending[0] ?? "") + "_quota";
    const isPercent = !has(quotaKey);
    const quota = isPercent ? Math.floor(spendable * item.quota / 100) : Number(month[quotaKey]) || 0;
    const s2 = item.spending.reduce((t2, p) => t2 + (spending[p] || 0), 0);
    const remain = quota - s2;
    const progress = quota > 0 ? Math.min(s2 / quota * 100, 100) : 0;
    return { item, index, quotaKey, quota, isPercent, spent: s2, remain, progress, level: remain < 0 ? "over" : progress > 85 ? "warn" : "ok" };
  });
  return {
    savings,
    saved,
    spending,
    fixedRows,
    fixedTotal,
    extras,
    extraTotal: extras.reduce((s2, e) => s2 + e.total, 0),
    spent,
    remaining: alloc.living - spent,
    alloc,
    budget,
    paidCount: fixedRows.filter((r) => r.paid !== 0).length
  };
};
var spentOnDay = (fm) => Object.keys(fm).filter((k) => !IGNORE.includes(k) && typeof fm[k] === "number").reduce((s2, k) => s2 + (Number(fm[k]) || 0), 0);
var investBuckets = (inv, plan, monthKey) => {
  const alloc = arr(inv?.allocation);
  if (!alloc.length || !(plan > 0)) return null;
  const keyOf2 = (c) => {
    const x = String(c ?? "").toLowerCase();
    const m = alloc.find((b) => String(b.key).toLowerCase() === x || String(b.label).toLowerCase() === x);
    return m ? String(m.key).toLowerCase() : null;
  };
  let assigned = 0;
  const buckets = alloc.map((b, i) => {
    const target = i === alloc.length - 1 ? plan - assigned : Math.floor(plan * (Number(b.pct) || 0) / 100);
    assigned += target;
    return { key: String(b.key).toLowerCase(), label: String(b.label ?? b.key), target, bought: 0 };
  });
  for (const a of arr(inv?.assets)) {
    const b = buckets.find((x) => x.key === keyOf2(a.category));
    if (!b) continue;
    for (const tx of arr(a.transactions)) {
      if (String(tx.date ?? "").slice(0, 7) !== monthKey) continue;
      const amt = (Number(tx.shares) || 0) * (Number(tx.price) || 0) * (Number(tx.fx) || 1);
      b.bought += tx.type === "SELL" ? -amt : amt;
    }
  }
  return buckets;
};

// src/data/store.ts
var FILES = { debt: "Debt Config", savings: "Saving n Loan", ledger: "Ledger Config", goals: "Goals Config", income: "Income", daily: "Daily Expenses Config", fixed: "Monthly Expenses Config", invest: "Investment Config" };
var DAY_BODY = "";
var Store = class {
  constructor(plugin) {
    this.plugin = plugin;
  }
  get app() {
    return this.plugin.app;
  }
  get s() {
    return this.plugin.settings;
  }
  path(name) {
    return (0, import_obsidian3.normalizePath)(`${this.s.dataFolder}/${name}.md`);
  }
  file(path) {
    const f = this.app.vault.getAbstractFileByPath(path);
    return f instanceof import_obsidian3.TFile ? f : null;
  }
  fm(path) {
    const f = this.file(path);
    return f ? this.app.metadataCache.getFileCache(f)?.frontmatter ?? {} : null;
  }
  // Change a note's frontmatter; the note is created (with that frontmatter) if it does not exist yet
  async update(path, fn) {
    let f = this.file(path);
    if (!f) {
      const dir = path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";
      if (dir && !this.app.vault.getAbstractFileByPath(dir)) await this.app.vault.createFolder(dir);
      f = await this.app.vault.create(path, "");
    }
    await this.app.fileManager.processFrontMatter(f, fn);
  }
  // Month notes: <log folder>/YYYY/MM Mon/Mon Config.md
  monthNotes() {
    const re = new RegExp(`^${this.s.logFolder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/(\\d{4})/(\\d{2}) [^/]+/[^/]+ Config\\.md$`, "i");
    const out = [];
    for (const f of this.app.vault.getMarkdownFiles()) {
      const m = re.exec(f.path);
      if (m) out.push({ path: f.path, year: Number(m[1]), month: Number(m[2]), fm: this.app.metadataCache.getFileCache(f)?.frontmatter ?? {} });
    }
    return out.sort((a, b) => a.year * 12 + a.month - (b.year * 12 + b.month));
  }
  // The daily notes (YYYY-MM-DD.md) anywhere under a month's folder
  days(year, month) {
    const dir = this.monthDir(year, month) + "/";
    return this.app.vault.getMarkdownFiles().filter((f) => f.path.startsWith(dir) && /^\d{4}-\d{2}-\d{2}$/.test(f.basename)).map((f) => ({ name: f.basename, path: f.path, fm: this.app.metadataCache.getFileCache(f)?.frontmatter ?? {} }));
  }
  monthDir(year, month) {
    return (0, import_obsidian3.normalizePath)(`${this.s.logFolder}/${year}/${String(month + 1).padStart(2, "0")} ${MONTHS[month]}`);
  }
  // Everything the Log tab needs for one month (month note, daily notes, income, budget groups, the maths)
  monthData(year, month) {
    const monthPath = this.monthNotePath(new Date(year, month, 1));
    const fm = this.fm(monthPath);
    const days = this.days(year, month);
    const plan = this.fm(this.path(FILES.savings)) ?? {};
    const inc = monthIncome(this.fm(this.path(FILES.income)), fm, month + 1);
    const daily = budgetItems(this.fm(this.path(FILES.daily)));
    const fixed = budgetItems(this.fm(this.path(FILES.fixed)));
    return { monthPath, month: fm, days, plan, inc, daily, fixed, M: computeMonth({ month: fm, days, plan, daily, fixed, income: inc.total }) };
  }
  // A day's note ("YYYY-MM-DD"), wherever it is filed in its month
  day(date) {
    const [y, m] = date.split("-").map(Number);
    return this.days(y, m - 1).find((d) => d.name === date) ?? null;
  }
  // Start a day, like the daily-note template: <log>/YYYY/MM Mon/Week N/YYYY-MM-DD.md with every daily item at 0, and the
  // month note (savings plan amounts + fixed expenses) if this is the month's first day.
  async createDay(date) {
    const [y, m, d] = date.split("-").map(Number);
    const first2 = (new Date(y, m - 1, 1).getDay() + 6) % 7;
    const dir = `${this.monthDir(y, m - 1)}/Week ${Math.floor((d + first2 - 1) / 7) + 1}`;
    let at = "";
    for (const part of dir.split("/")) {
      at = at ? `${at}/${part}` : part;
      if (this.app.vault.getAbstractFileByPath(at)) continue;
      await this.app.vault.createFolder(at);
      try {
        await this.app.plugins?.plugins?.["make-md"]?.superstate?.spaceManager?.saveSpace(at, (def) => ({ ...def, sort: { field: "name", asc: true, group: false, recursive: false } }));
      } catch {
      }
    }
    const monthPath = this.monthNotePath(new Date(y, m - 1, 1));
    if (!this.file(monthPath)) {
      const lines = [];
      for (const [k, v] of Object.entries(this.fm(this.path(FILES.savings)) ?? {})) if (!k.startsWith("file") && typeof v === "number") lines.push(`${k}: ${v}`);
      const fixed = this.fm(this.path(FILES.fixed))?.budget;
      for (const it of Array.isArray(fixed) ? fixed : []) {
        const prop = Array.isArray(it.spending) ? it.spending[0] : it.spending;
        if (it.daily === false && prop) lines.push(`${String(prop)}: ${Number(it.quota) || 0}`);
      }
      await this.app.vault.create(monthPath, `---
${lines.join("\n")}${lines.length ? "\n" : ""}---
# ${MONTHS[m - 1]} ${y} Configuration
`);
    }
    const props = [...new Set(budgetItems(this.fm(this.path(FILES.daily))).flatMap((b) => b.spending))];
    const path = `${dir}/${date}.md`;
    await this.app.vault.create(path, `---
${props.map((p) => `${p}: 0
`).join("")}---
${DAY_BODY}`);
    return path;
  }
  monthNotePath(d) {
    const M = MONTHS[d.getMonth()];
    return (0, import_obsidian3.normalizePath)(`${this.s.logFolder}/${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")} ${M}/${M} Config.md`);
  }
  // Every month note's amount for a savings-plan key (its own value, else the plan default); legacy = made before the living line
  monthLines(key) {
    const plan = this.fm(this.path(FILES.savings)) ?? {};
    return this.monthNotes().map((m) => ({ amount: Number(m.fm[key] !== void 0 ? m.fm[key] : plan[key]) || 0, legacy: m.fm[LIVING] === void 0 }));
  }
  // This month's amount for a savings-plan key: the month note's own value, else the plan default
  allocation(key, now = /* @__PURE__ */ new Date()) {
    const path = this.monthNotePath(now);
    const def = Number(this.fm(this.path(FILES.savings))?.[key]) || 0;
    const own = this.fm(path);
    return { path, hasNote: !!own, def, amount: own && own[key] !== void 0 ? Number(own[key]) || 0 : def };
  }
  // Set a savings-plan amount. "once": this month's note only. "onward": the plan default from this month on; earlier month notes
  // without their own value are frozen at the old default (their history does not change), and this month's own value follows.
  async setAllocation(key, next, mode, now = /* @__PURE__ */ new Date()) {
    const info = this.allocation(key, now);
    if (mode === "once") {
      await this.update(info.path, (fm) => {
        fm[key] = next;
      });
      return 0;
    }
    const cutoff = now.getFullYear() * 12 + now.getMonth();
    let frozen = 0;
    for (const n of this.monthNotes()) {
      const idx = n.year * 12 + (n.month - 1);
      if (idx < cutoff && n.fm[key] === void 0) {
        await this.update(n.path, (fm) => {
          fm[key] = info.def;
        });
        frozen++;
      } else if (idx === cutoff && n.fm[key] !== void 0) await this.update(n.path, (fm) => {
        fm[key] = next;
      });
    }
    await this.update(this.path(FILES.savings), (fm) => {
      fm[key] = next;
    });
    return frozen;
  }
};

// src/prices/index.ts
var import_obsidian4 = require("obsidian");

// src/calc/chart.ts
var RANGES = ["M", "W", "D", "60m", "30m", "15m", "5m", "1m", "I"];
var isMinutes = (r) => r !== "D" && r !== "W" && r !== "M";
var emptyBars = () => ({ d: [], o: [], h: [], l: [], c: [], v: [], ohlc: true });
var toP = (x) => Math.round(Number(x) * 100);
var TZF = /* @__PURE__ */ new Map();
var zoned = (s2, tz, off) => {
  if (tz) {
    try {
      let f = TZF.get(tz);
      if (!f) {
        f = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
        TZF.set(tz, f);
      }
      const p = {};
      for (const x of f.formatToParts(new Date(s2 * 1e3))) p[x.type] = x.value;
      return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
    } catch {
    }
  }
  return new Date((s2 + off) * 1e3).toISOString().slice(0, 16);
};
var fromYahoo = (res, minutes = false) => {
  const r = res;
  const ts = r?.timestamp, q = r?.indicators?.quote?.[0];
  if (!ts?.length || !q) return null;
  const off = Number(r.meta?.gmtoffset) || 0, tz = r.meta?.exchangeTimezoneName, B = emptyBars();
  ts.forEach((s2, i) => {
    const o = q.open?.[i], h2 = q.high?.[i], l = q.low?.[i], c = q.close?.[i];
    if ([o, h2, l, c].some((x) => typeof x !== "number" || !(x > 0))) return;
    const d = zoned(s2, tz, off).slice(0, minutes ? 16 : 10);
    if (B.d[B.d.length - 1] === d) B.d.pop(), B.o.pop(), B.h.pop(), B.l.pop(), B.c.pop(), B.v.pop();
    B.d.push(d);
    B.o.push(toP(o));
    B.h.push(toP(h2));
    B.l.push(toP(l));
    B.c.push(toP(c));
    B.v.push(Math.round(Number(q.volume?.[i]) || 0));
  });
  if (!B.d.length && q.close?.some((x) => typeof x === "number" && x > 0)) {
    ts.forEach((t2, i) => {
      const c = q.close?.[i];
      if (typeof c !== "number" || !(c > 0)) return;
      const p = toP(c);
      B.d.push(zoned(t2, tz, off).slice(0, 10));
      B.o.push(p);
      B.h.push(p);
      B.l.push(p);
      B.c.push(p);
      B.v.push(0);
    });
    B.ohlc = false;
  }
  const pc = Number(r.meta?.chartPreviousClose);
  if (minutes && pc > 0) B.pc = toP(pc);
  return B.d.length ? B : null;
};
var lastSession = (B) => {
  if (!B?.d.length) return null;
  const n = B.d.length, day = B.d[n - 1].slice(0, 10);
  let k = n;
  while (k > 0 && B.d[k - 1].slice(0, 10) === day) k--;
  const S = { d: B.d.slice(k), o: B.o.slice(k), h: B.h.slice(k), l: B.l.slice(k), c: B.c.slice(k), v: B.v.slice(k), ohlc: B.ohlc };
  const pc = k > 0 ? B.c[k - 1] : B.pc;
  if (pc) S.pc = pc;
  return S;
};
var fromFugle = (json, pc) => {
  const rows = json?.data;
  if (!Array.isArray(rows)) return null;
  const B = emptyBars();
  for (const r of [...rows].sort((a, b) => String(a.date).localeCompare(String(b.date)))) {
    const d = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.exec(String(r.date ?? ""))?.[0];
    const o = Number(r.open), h2 = Number(r.high), l = Number(r.low), c = Number(r.close);
    if (!d || ![o, h2, l, c].every((x) => x > 0) || B.d[B.d.length - 1] === d) continue;
    B.d.push(d);
    B.o.push(toP(o));
    B.h.push(toP(h2));
    B.l.push(toP(l));
    B.c.push(toP(c));
    B.v.push(Math.round(Number(r.volume) || 0));
  }
  if (pc && pc > 0) B.pc = toP(pc);
  return B.d.length ? B : null;
};
var fromTwseMonth = (json) => {
  const rows = json?.data;
  if (!Array.isArray(rows) || !rows.length) return null;
  const n = (s2) => Number(String(s2).replace(/,/g, "")), B = emptyBars();
  for (const r of rows) {
    const m = /^(\d{2,3})\/(\d{2})\/(\d{2})$/.exec(String(r[0]).trim());
    const o = n(r[3]), h2 = n(r[4]), l = n(r[5]), c = n(r[6]);
    if (!m || ![o, h2, l, c].every((x) => x > 0)) continue;
    B.d.push(`${Number(m[1]) + 1911}-${m[2]}-${m[3]}`);
    B.o.push(toP(o));
    B.h.push(toP(h2));
    B.l.push(toP(l));
    B.c.push(toP(c));
    B.v.push(Math.round(n(r[1]) || 0));
  }
  return B.d.length ? B : null;
};
var joinBars = (parts) => {
  const B = emptyBars(), seen2 = /* @__PURE__ */ new Set();
  const all = parts.flatMap((p) => p.d.map((d, i) => ({ d, i, p }))).sort((a, b) => a.d.localeCompare(b.d));
  for (const { d, i, p } of all) {
    if (seen2.has(d)) continue;
    seen2.add(d);
    B.d.push(d);
    B.o.push(p.o[i]);
    B.h.push(p.h[i]);
    B.l.push(p.l[i]);
    B.c.push(p.c[i]);
    B.v.push(p.v[i]);
  }
  B.ohlc = parts.every((p) => p.ohlc);
  return B;
};
var WINDOW = { I: 0, "1m": 120, "5m": 96, "15m": 80, "30m": 64, "60m": 60, D: 66, W: 78, M: 60 };
var windowOf = (B, r) => {
  const n = B.d.length;
  if (r !== "I") return Math.min(n, WINDOW[r]);
  const day = B.d[n - 1]?.slice(0, 10) ?? "";
  let k = n;
  while (k > 0 && B.d[k - 1].slice(0, 10) === day) k--;
  return n - k;
};
var zoomAt = (len, k, win, at, want, min = 12) => {
  const w = Math.round(Math.max(Math.min(min, len), Math.min(len, want)));
  const frac = (at + 0.5) / Math.max(1, win), k2 = Math.round(k + at + 0.5 - frac * w);
  return { win: w, off: Math.max(0, Math.min(len - w, len - k2 - w)) };
};
var extremes = (B, from, to) => {
  let hi = from, lo = from;
  for (let i = from; i < to; i++) {
    if (B.h[i] > B.h[hi]) hi = i;
    if (B.l[i] < B.l[lo]) lo = i;
  }
  return { hi, lo };
};
var movingAverage = (c, n) => {
  let sum = 0;
  return c.map((x, i) => {
    sum += x;
    if (i >= n) sum -= c[i - n];
    return i >= n - 1 ? sum / n : null;
  });
};
var bollinger = (c, n = 20, k = 2) => {
  const mb = movingAverage(c, n), out = { mb, ub: [], lb: [], sd: [] };
  c.forEach((_, i) => {
    const m = mb[i];
    if (m === null) {
      out.ub.push(null);
      out.lb.push(null);
      out.sd.push(null);
      return;
    }
    let v = 0;
    for (let j = i - n + 1; j <= i; j++) v += (c[j] - m) ** 2;
    const sd = Math.sqrt(v / n);
    out.sd.push(sd);
    out.ub.push(m + k * sd);
    out.lb.push(m - k * sd);
  });
  return out;
};
var niceTicks = (lo, hi, want = 5) => {
  if (!(hi > lo)) {
    const p = Math.round(lo);
    return [p];
  }
  const raw = (hi - lo) / want, mag = 10 ** Math.floor(Math.log10(raw));
  const count = (s2) => Math.floor(hi / s2 + 1e-9) - Math.ceil(lo / s2 - 1e-9) + 1;
  const step = [1, 2, 2.5, 5, 10, 20].map((f) => f * mag).find((s2) => count(s2) <= want) ?? 20 * mag;
  const out = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(Math.round(v));
  return out;
};
var MON2 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var xTicks = (d, r) => {
  const out = [];
  const day = (s2) => `${MON2[Number(s2.slice(5, 7)) - 1]} ${Number(s2.slice(8, 10))}`;
  d.forEach((s2, i) => {
    if (i === 0) return;
    const p = d[i - 1], m = Number(s2.slice(5, 7)) - 1, newDay = s2.slice(0, 10) !== p.slice(0, 10);
    if (r === "I" || r === "1m" || r === "5m") {
      if (newDay) out.push({ i, label: day(s2) });
      else if (s2.slice(11, 13) !== p.slice(11, 13)) out.push({ i, label: `${s2.slice(11, 13)}:00` });
    } else if (isMinutes(r)) {
      if (newDay) out.push({ i, label: day(s2) });
    } else if (r === "D") {
      if (s2.slice(0, 7) !== p.slice(0, 7)) out.push({ i, label: MON2[m].toUpperCase() });
    } else if (r === "M") {
      if (s2.slice(0, 4) !== p.slice(0, 4)) out.push({ i, label: s2.slice(0, 4) });
    } else if (s2.slice(0, 7) !== p.slice(0, 7) && m % 3 === 0) out.push({ i, label: m === 0 ? s2.slice(0, 4) : MON2[m].toUpperCase() });
  });
  return out;
};
var FIB_DEFAULT = [0.236, 0.382, 0.5, 0.618, 0.786];
var FIB_ALL = [0.236, 0.382, 0.5, 0.618, 0.786, 1.272, 1.618, 2.618];
var fibLevels = (a, b, ratios) => [0, ...ratios, 1].sort((x, y) => x - y).filter((r, i, s2) => s2.indexOf(r) === i).map((r) => ({ r, price: Math.round(b - (b - a) * r) }));
var nearestBar = (n, x) => Math.max(0, Math.min(n - 1, Math.round(x)));
var snapPrice = (B, i, price) => Math.abs(B.h[i] - price) <= Math.abs(B.l[i] - price) ? B.h[i] : B.l[i];
var indexOf = (d, date) => {
  if (!d.length) return 0;
  if (date < d[0]) return -(Date.parse(d[0]) - Date.parse(date)) / 864e5 / 1.4;
  let k = 0;
  for (let i = 0; i < d.length; i++) if (d[i] <= date) k = i;
  return k;
};
var lineAt = (ai, ap, bi, bp, x) => bi === ai ? bp : ap + (bp - ap) * (x - ai) / (bi - ai);
var readPrefs = (fm) => {
  const c = fm?.chart ?? {}, fib = Array.isArray(c.fib) ? c.fib.map(Number).filter((r) => FIB_ALL.some((x) => Math.abs(x - r) < 1e-9)) : FIB_DEFAULT;
  const ma = Number(c.ma);
  return { fib, snap: c.snap !== false, cost: c.cost !== false, ma: ma === 0 || ma === 60 ? ma : 20, bb: c.bb === true };
};
var withLive = (B, day, price) => {
  const n = B.d.length;
  if (!n || B.d[n - 1] !== day || !(price > 0)) return B;
  const c = [...B.c], h2 = [...B.h], l = [...B.l];
  c[n - 1] = price;
  h2[n - 1] = Math.max(h2[n - 1], price);
  l[n - 1] = Math.min(l[n - 1], price);
  return { ...B, c, h: h2, l };
};
var MINUTES = { I: 1, "1m": 1, "5m": 5, "15m": 15, "30m": 30, "60m": 60 };
var withLiveMinute = (B, at, price, size) => {
  const n = B.d.length, last = B.d[n - 1] ?? "";
  if (!n || !(price > 0) || at.slice(0, 10) !== last.slice(0, 10) || at < last) return B;
  const m = Number(at.slice(11, 13)) * 60 + Number(at.slice(14, 16)), f = m - m % size;
  const key = `${at.slice(0, 11)}${String(Math.floor(f / 60)).padStart(2, "0")}:${String(f % 60).padStart(2, "0")}`;
  if (key <= last) {
    const c = [...B.c], h2 = [...B.h], l = [...B.l];
    c[n - 1] = price;
    h2[n - 1] = Math.max(h2[n - 1], price);
    l[n - 1] = Math.min(l[n - 1], price);
    return { ...B, c, h: h2, l };
  }
  return { ...B, d: [...B.d, key], o: [...B.o, price], h: [...B.h, price], l: [...B.l, price], c: [...B.c, price], v: [...B.v, 0] };
};
var bucket = (at, size) => {
  const m = Number(at.slice(11, 13)) * 60 + Number(at.slice(14, 16)), f = m - m % size;
  return `${at.slice(0, 11)}${String(Math.floor(f / 60)).padStart(2, "0")}:${String(f % 60).padStart(2, "0")}`;
};
var addTick = (T, at, price, vol = 0) => {
  const B = T && T.d.length && T.d[T.d.length - 1].slice(0, 10) === at.slice(0, 10) ? T : emptyBars();
  if (!(price > 0)) return B;
  const n = B.d.length, key = bucket(at, 1);
  if (n && key < B.d[n - 1]) return B;
  if (n && key === B.d[n - 1]) {
    const c = [...B.c], h2 = [...B.h], l = [...B.l];
    c[n - 1] = price;
    h2[n - 1] = Math.max(h2[n - 1], price);
    l[n - 1] = Math.min(l[n - 1], price);
    const v = [...B.v];
    v[n - 1] += vol;
    return { ...B, c, h: h2, l, v };
  }
  return { ...B, d: [...B.d, key], o: [...B.o, price], h: [...B.h, price], l: [...B.l, price], c: [...B.c, price], v: [...B.v, vol] };
};
var withTicks = (B, T, size, intraday = false) => {
  if (!T?.d.length) return B;
  const n = B.d.length, last = B.d[n - 1] ?? "", tday = T.d[0].slice(0, 10);
  const fresh = intraday && n > 0 && last.slice(0, 10) < tday;
  let out = fresh ? { ...emptyBars(), ohlc: B.ohlc, pc: B.c[n - 1] } : { ...B, d: [...B.d], o: [...B.o], h: [...B.h], l: [...B.l], c: [...B.c], v: [...B.v] };
  const fetched = fresh ? 0 : n;
  T.d.forEach((d, i) => {
    const key = bucket(d, size), m = out.d.length, end = out.d[m - 1] ?? "";
    if (key < end) return;
    if (key === end) {
      out.c[m - 1] = T.c[i];
      out.h[m - 1] = Math.max(out.h[m - 1], T.h[i]);
      out.l[m - 1] = Math.min(out.l[m - 1], T.l[i]);
      if (m > fetched) out.v[m - 1] += T.v[i] || 0;
      return;
    }
    out.d.push(key);
    out.o.push(T.o[i]);
    out.h.push(T.h[i]);
    out.l.push(T.l[i]);
    out.c.push(T.c[i]);
    out.v.push(T.v[i] || 0);
  });
  return out;
};
var closeBefore = (B, day) => {
  for (let i = B.d.length - 1; i >= 0; i--) if (B.d[i] < day) return B.c[i];
  return null;
};
var dayChange = (B, live, closes, ref) => {
  if (!live) return null;
  let prev = null;
  const n = B?.c.length ?? 0;
  if (ref && ref > 0) prev = ref;
  else if (B && n) {
    const same = live.day > B.d[n - 1] && live.price === B.c[n - 1];
    prev = same ? B.c[n - 2] ?? null : closeBefore(B, live.day);
  } else if (closes && closes.length) {
    const last = closes[closes.length - 1];
    prev = Math.abs(last - live.price) < 1 ? closes[closes.length - 2] ?? null : last;
  }
  return prev ? { ch: live.price - prev, pct: (live.price - prev) / prev * 100 } : null;
};

// src/calc/market.ts
var num2 = (s2) => {
  const n = Number(String(s2 ?? "").replace(/,/g, ""));
  return Number.isFinite(n) && n > 0 ? n : 0;
};
var parseMisIndex = (json, code = "t00") => {
  const r = (json?.msgArray ?? []).find((x) => x.c === code);
  if (!r) return null;
  const prev = num2(r.y), price = num2(r.z) || num2(r.pz) || prev;
  if (!price) return null;
  const asOf = Number(r.tlong) || Date.now(), d = r.d ?? "";
  return { price, prev: prev || void 0, time: Date.now(), asOf, source: "twse", day: /^\d{8}$/.test(d) ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}` : "" };
};
var fiveSecBars = (json, day) => {
  const rows = json?.data;
  if (!Array.isArray(rows) || !rows.length) return null;
  const B = emptyBars();
  let key = "";
  for (const r of rows) {
    const m = /^(\d\d):(\d\d):(\d\d)$/.exec(r[0] ?? ""), v = Math.round(num2(r[1]) * 100);
    if (!m || !v) continue;
    const s2 = Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
    if (s2 <= 9 * 3600) {
      B.pc = v;
      continue;
    }
    const mi = Math.floor((s2 - 1) / 60), k = `${day}T${String(Math.floor(mi / 60)).padStart(2, "0")}:${String(mi % 60).padStart(2, "0")}`;
    if (k !== key) {
      B.d.push(k);
      B.o.push(v);
      B.h.push(v);
      B.l.push(v);
      B.c.push(v);
      B.v.push(0);
      key = k;
      continue;
    }
    const n = B.c.length - 1;
    B.h[n] = Math.max(B.h[n], v);
    B.l[n] = Math.min(B.l[n], v);
    B.c[n] = v;
  }
  return B.d.length ? B : null;
};

// src/prices/stream.ts
var URL = "wss://api.fugle.tw/marketdata/v1.0/stock/streaming";
var FugleStream = class {
  constructor(key, onTrade) {
    this.key = key;
    this.onTrade = onTrade;
    this.ws = null;
    this.authed = false;
    this.want = /* @__PURE__ */ new Set();
    this.ids = /* @__PURE__ */ new Map();
    // code → subscription id (subscribed)
    this.retry = 0;
    this.timer = 0;
  }
  // is this code streaming now (its quotes need no polling)
  on(code) {
    return this.authed && this.ids.has(code);
  }
  watch(code) {
    if (!this.key()) return;
    if (!this.want.has(code)) {
      this.want.add(code);
      if (this.authed) this.sub(code);
    }
    this.open();
  }
  unwatch(code) {
    if (!this.want.delete(code)) return;
    const id = this.ids.get(code);
    this.ids.delete(code);
    if (id && this.authed) this.send({ event: "unsubscribe", data: { id } });
    if (!this.want.size) this.close();
  }
  close() {
    window.clearTimeout(this.timer);
    const ws = this.ws;
    this.ws = null;
    this.authed = false;
    this.ids.clear();
    if (ws) {
      ws.onclose = null;
      ws.close();
    }
  }
  stop() {
    this.want.clear();
    this.close();
  }
  send(m) {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(m));
  }
  sub(code) {
    this.send({ event: "subscribe", data: { channel: "trades", symbol: code } });
  }
  open() {
    if (this.ws || !this.want.size || !this.key()) return;
    let ws;
    try {
      ws = new WebSocket(URL);
    } catch {
      this.later();
      return;
    }
    this.ws = ws;
    ws.onopen = () => this.send({ event: "auth", data: { apikey: this.key() } });
    ws.onmessage = (e) => {
      let m;
      try {
        m = JSON.parse(String(e.data));
      } catch {
        return;
      }
      const d = m.data ?? {};
      if (m.event === "authenticated") {
        this.authed = true;
        this.retry = 0;
        this.want.forEach((c) => this.sub(c));
        return;
      }
      if (m.event === "subscribed" && typeof d.symbol === "string" && typeof d.id === "string") {
        this.ids.set(d.symbol, d.id);
        return;
      }
      if ((m.event === "data" || m.event === "snapshot") && m.channel === "trades" && typeof d.symbol === "string" && !d.isTrial) {
        const price = Number(d.price), us = Number(d.time);
        if (price > 0) this.onTrade(d.symbol, price, us > 0 ? Math.round(us / 1e3) : Date.now(), d);
        return;
      }
      if (m.event === "error") console.warn("Ledgerline: Fugle stream", d.message ?? d);
    };
    ws.onclose = () => {
      this.ws = null;
      this.authed = false;
      this.ids.clear();
      this.later();
    };
    ws.onerror = () => {
    };
  }
  later() {
    if (!this.want.size) return;
    window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => this.open(), Math.min(3e4, 1e3 * 2 ** this.retry++));
  }
};

// src/calc/quotes.ts
var FMT = /* @__PURE__ */ new Map();
var isTwSym = (symbol) => /\.TWO?$/.test(symbol) || symbol === "^TWII";
var isTw = isTwSym;
var marketClock = (symbol, now) => {
  const tz = isTw(symbol) ? "Asia/Taipei" : "America/New_York";
  let f = FMT.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
    FMT.set(tz, f);
  }
  const parts = f.formatToParts(now), get = (k) => parts.find((p) => p.type === k)?.value ?? "";
  const wd = get("weekday");
  return { day: `${get("year")}-${get("month")}-${get("day")}`, min: Number(get("hour")) % 24 * 60 + Number(get("minute")), weekday: wd !== "Sat" && wd !== "Sun" };
};
var marketMinute = (symbol, t2) => {
  const c = marketClock(symbol, new Date(t2)), p = (n) => String(n).padStart(2, "0");
  return `${c.day}T${p(Math.floor(c.min / 60))}:${p(c.min % 60)}`;
};
var WALL = /* @__PURE__ */ new Map();
var wallOf = (ms, tz) => {
  let f = WALL.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
    WALL.set(tz, f);
  }
  const p = {};
  for (const x of f.formatToParts(new Date(ms))) p[x.type] = x.value;
  return `${p.year}-${p.month}-${p.day}T${p.hour === "24" ? "00" : p.hour}:${p.minute}`;
};
var asUtc = (d) => Date.UTC(Number(d.slice(0, 4)), Number(d.slice(5, 7)) - 1, Number(d.slice(8, 10)), Number(d.slice(11, 13)) || 0, Number(d.slice(14, 16)) || 0);
var shiftZone = (d, from, to) => {
  if (from === to || d.length < 16) return d;
  const want = asUtc(d);
  let t2 = want;
  for (let k = 0; k < 2; k++) t2 += want - asUtc(wallOf(t2, from));
  return wallOf(t2, to) + d.slice(16);
};
var deviceZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Taipei";
  } catch {
    return "Asia/Taipei";
  }
};
var marketTime = (symbol, t2) => new Date(t2).toLocaleTimeString("en-GB", { timeZone: isTw(symbol) ? "Asia/Taipei" : "America/New_York", hour12: false });
var inWindow = (symbol, c) => c.weekday && (isTw(symbol) ? c.min >= 540 && c.min <= 815 : c.min >= 570 && c.min <= 965);
var closedWhy = (symbol, now, cal) => {
  if (!cal) return null;
  const c = marketClock(symbol, now);
  if (!c.weekday) return null;
  const w = (isTw(symbol) ? cal.tw : cal.us)[c.day];
  if (w) return w;
  const e = isTw(symbol) ? void 0 : cal.usEarly[c.day];
  return e !== void 0 && c.min > e + 5 ? "early" : null;
};
var marketOpen = (symbol, now, cal) => inWindow(symbol, marketClock(symbol, now)) && !closedWhy(symbol, now, cal);
var closedInHours = (symbol, now, cal) => inWindow(symbol, marketClock(symbol, now)) ? closedWhy(symbol, now, cal) : null;
var nextOpen = (symbol, now, cal) => {
  const step = 30 * 60 * 1e3;
  for (let t2 = Math.ceil((now.getTime() + 1) / step) * step, end = now.getTime() + 14 * 864e5; t2 <= end; t2 += step) {
    if (marketOpen(symbol, new Date(t2), cal)) return new Date(t2);
  }
  return null;
};
var parseTwseAll = (json) => {
  const out = {};
  for (const a of json?.msgArray ?? []) {
    const q = parseTwse({ msgArray: [a] });
    if (q && a.c) out[a.c] = q;
  }
  return out;
};
var parseTwse = (json) => {
  const a = json?.msgArray?.[0];
  if (!a) return null;
  const best = (x) => Number(String(x ?? "").split("_")[0]);
  const last = Number(a.z), prev = Number(a.y), bid = best(a.b), ask = best(a.a);
  const book = bid > 0 && ask > 0 ? Math.round((bid + ask) / 2 * 100) / 100 : bid > 0 ? bid : ask > 0 ? ask : 0;
  const price = last > 0 ? last : String(a.t ?? "") >= "09:00:00" && book > 0 ? book : prev;
  if (!(price > 0)) return null;
  const at = Number(a.tlong);
  const lots3 = Number(a.v);
  return { price, time: Date.now(), asOf: at > 0 ? at : Date.now(), source: "twse", ...prev > 0 ? { prev } : {}, ...lots3 >= 0 && String(a.v ?? "") !== "" && !isNaN(lots3) ? { vol: lots3 * 1e3 } : {} };
};
var parseFugleQuote = (json) => {
  const j = json;
  if (!j) return null;
  const prev = Number(j.referencePrice) || Number(j.previousClose) || 0;
  const last = Number(j.lastTrade?.price) || Number(j.closePrice) || 0, price = last > 0 ? last : prev;
  if (!(price > 0)) return null;
  const us = Number(j.lastTrade?.time) || Number(j.closeTime) || Number(j.lastUpdated) || 0;
  return { price, time: Date.now(), asOf: us > 0 ? Math.round(us / 1e3) : Date.now(), source: "fugle", ...prev > 0 ? { prev } : {} };
};

// src/prices/index.ts
var YQ = { I: ["1m", "5d"], "1m": ["1m", "5d"], "5m": ["5m", "1mo"], "15m": ["15m", "1mo"], "30m": ["30m", "60d"], "60m": ["60m", "6mo"], D: ["1d", "2y"], W: ["1wk", "10y"], M: ["1mo", "max"] };
var yahoo = {
  async quote(symbol, range = "1mo") {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=${range}`;
    const r = await (0, import_obsidian4.requestUrl)({ url, throw: false });
    if (r.status !== 200) return null;
    const res = r.json?.chart?.result?.[0];
    const price = Number(res?.meta?.regularMarketPrice);
    if (!(price > 0)) return null;
    const closes = (res?.indicators?.quote?.[0]?.close ?? []).filter((x) => typeof x === "number");
    const asOf = Number(res?.meta?.regularMarketTime) * 1e3;
    return { price, time: Date.now(), closes, asOf: asOf > 0 ? asOf : Date.now(), source: "yahoo" };
  },
  async bars(symbol, range) {
    const [iv, span] = YQ[range];
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${iv}&range=${span}`;
    const r = await (0, import_obsidian4.requestUrl)({ url, throw: false });
    const B = r.status === 200 ? fromYahoo(r.json?.chart?.result?.[0], isMinutes(range)) : null;
    return range === "I" ? lastSession(B) : B;
  }
};
var MIS_ROWS = { fn: null };
var twseMany = async (symbols) => {
  const ms = symbols.map((s2) => /^(\d{4,6}[A-Z]?)\.(TW|TWO)$/.exec(s2)).filter((m) => !!m);
  if (!ms.length) return {};
  const ex = ms.map((m) => `${m[2] === "TWO" ? "otc" : "tse"}_${m[1].toLowerCase()}.tw`).join("|");
  const r = await (0, import_obsidian4.requestUrl)({ url: `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=${encodeURIComponent(ex)}&json=1&delay=0`, throw: false });
  if (r.status === 200) MIS_ROWS.fn?.(r.json?.msgArray ?? []);
  const by = r.status === 200 ? parseTwseAll(r.json) : {}, out = {};
  for (const m of ms) if (by[m[1]]) out[m[0]] = by[m[1]];
  return out;
};
var twse = {
  async quote(symbol) {
    const m = /^(\d{4,6}[A-Z]?)\.(TW|TWO)$/.exec(symbol);
    if (!m) return null;
    const url = `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=${m[2] === "TWO" ? "otc" : "tse"}_${m[1].toLowerCase()}.tw&json=1&delay=0`;
    const r = await (0, import_obsidian4.requestUrl)({ url, throw: false });
    return r.status === 200 ? parseTwse(r.json) : null;
  },
  // STOCK_DAY: one request per month (TWSE listings only): day bars, 4 months (a screen and the averages); the rest is Yahoo's
  async bars(symbol, range) {
    return range === "D" ? twseMonths(symbol, 4) : null;
  }
};
var twseMonths = async (symbol, back) => {
  const m = /^(\d{4,6}[A-Z]?)\.TW$/.exec(symbol);
  if (!m) return null;
  const parts = [], now = /* @__PURE__ */ new Date();
  for (let k = back; k >= 0; k--) {
    const d = new Date(now.getFullYear(), now.getMonth() - k, 1);
    const url = `https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date=${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}01&stockNo=${m[1]}`;
    const r = await (0, import_obsidian4.requestUrl)({ url, throw: false }).catch(() => null);
    const b = r && r.status === 200 ? fromTwseMonth(r.json) : null;
    if (b) parts.push(b);
    if (k) await new Promise((ok) => setTimeout(ok, 350));
  }
  return parts.length ? joinBars(parts) : null;
};
var yahooTw = {
  quote: (symbol, range) => yahoo.quote(symbol, range),
  async bars(symbol, range) {
    const y = await yahoo.bars(symbol, range);
    if (!y || range !== "D" || !/\.TW$/.test(symbol)) return y;
    const last = y.d[y.d.length - 1] ?? "", now = /* @__PURE__ */ new Date(), thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const tail = await twseMonths(symbol, last.slice(0, 7) < thisMonth ? 1 : 0).catch(() => null);
    return tail ? { ...joinBars([tail, y]), ohlc: y.ohlc } : y;
  }
};
var FUGLE = "https://api.fugle.tw/marketdata/v1.0/stock/intraday";
var fuglePc = {};
var fugleCode = (symbol) => /^(\d{4,6}[A-Z]?)\.TWO?$/.exec(symbol)?.[1] ?? null;
var fugle = (key) => ({
  async quote(symbol) {
    const code = fugleCode(symbol), k = key();
    if (!code || !k) return null;
    const r = await (0, import_obsidian4.requestUrl)({ url: `${FUGLE}/quote/${code}`, headers: { "X-API-KEY": k }, throw: false });
    const q = r.status === 200 ? parseFugleQuote(r.json) : null;
    const pc = Number(r.status === 200 ? r.json?.previousClose : 0);
    if (pc > 0) fuglePc[code] = { day: (/* @__PURE__ */ new Date()).toDateString(), pc };
    return q;
  },
  async bars(symbol, range) {
    const m = /^(\d{4,6}[A-Z]?)\.TWO?$/.exec(symbol), k = key();
    if (range !== "I" || !m || !k) return null;
    const headers = { "X-API-KEY": k }, day = (/* @__PURE__ */ new Date()).toDateString();
    if (fuglePc[m[1]]?.day !== day) {
      const q = await (0, import_obsidian4.requestUrl)({ url: `${FUGLE}/quote/${m[1]}`, headers, throw: false }).catch(() => null);
      const pc = Number(q?.status === 200 ? q.json?.previousClose : 0);
      if (pc > 0) fuglePc[m[1]] = { day, pc };
    }
    const r = await (0, import_obsidian4.requestUrl)({ url: `${FUGLE}/candles/${m[1]}?timeframe=1`, headers, throw: false });
    return r.status === 200 ? fromFugle(r.json, fuglePc[m[1]]?.pc) : null;
  }
});
var chain = (...ps) => ({
  async quote(symbol, range) {
    for (const p of ps) {
      const q = await p.quote(symbol, range).catch(() => null);
      if (q) return q;
    }
    return null;
  },
  async bars(symbol, range) {
    for (const p of ps) {
      const b = p.bars ? await p.bars(symbol, range).catch(() => null) : null;
      if (b) return b;
    }
    return null;
  }
});
var FIVE = null;
var misIndex = async () => {
  const r = await (0, import_obsidian4.requestUrl)({ url: "https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=tse_t00.tw&json=1&delay=0", throw: false });
  return r.status === 200 ? parseMisIndex(r.json) : null;
};
var taiex = {
  async quote() {
    const q = await misIndex();
    if (!q) return null;
    const { day: _day, ...x } = q;
    return x;
  },
  async bars(symbol, range) {
    if (range !== "I") return yahoo.bars(symbol, range);
    const q = await misIndex();
    if (!q?.day) return yahoo.bars(symbol, range);
    if (FIVE?.day === q.day && (FIVE.done || Date.now() - FIVE.at < 120 * 1e3)) return FIVE.B;
    const r = await (0, import_obsidian4.requestUrl)({ url: `https://www.twse.com.tw/rwd/zh/TAIEX/MI_5MINS_INDEX?response=json&date=${q.day.replace(/-/g, "")}`, throw: false });
    const B = r.status === 200 ? fiveSecBars(r.json, q.day) : null;
    if (B) {
      if (!B.pc && q.prev) B.pc = Math.round(q.prev * 100);
      FIVE = { day: q.day, at: Date.now(), done: B.d[B.d.length - 1].slice(11) >= "13:29", B };
      return B;
    }
    return FIVE?.day === q.day ? FIVE.B : yahoo.bars(symbol, range);
  }
};
var pickSource = (fugleKey = () => "") => {
  const f = fugle(fugleKey), tq = chain(f, twse, yahoo), tb = chain(f, yahooTw, twse);
  const tw = (symbol) => /\.TWO?$/.test(symbol);
  const ix = chain(taiex, yahoo), pick = (symbol) => symbol === "^TWII" ? ix : tw(symbol) ? null : yahoo;
  return { quote: (symbol, range) => (pick(symbol) ?? tq).quote(symbol, range), bars: (symbol, range) => (pick(symbol) ?? tb).bars(symbol, range) };
};
var TTL = 10 * 60 * 1e3;
var TTL_MIN = 15 * 1e3;
var KEY = "ledgerline-prices";
var Prices = class {
  constructor(load2, save, onFresh, provider = yahoo, taiwan = () => false) {
    this.load = load2;
    this.save = save;
    this.onFresh = onFresh;
    this.provider = provider;
    this.taiwan = taiwan;
    this.q = {};
    this.busy = /* @__PURE__ */ new Set();
    // Background (owner, 2026-11-05), called every 5 s (main.ts): while their market trades, the tickers the Invest pages asked
    // for (holdings, watchlist), on any page. Taiwan: with a Fugle key every one streams its trades; the rest (no key, or
    // past the plan's subscription limit) one TWSE request for all every 5 s. Others: Yahoo, one request each every 15 s.
    // TODAY's minute bars every minute. Change lines and chart pages hear through onQuote / onSeries and change in place;
    // the other Invest pages redraw (onLive, at most every 5 s) so every total and percent follows.
    this.tracked = /* @__PURE__ */ new Set();
    this.bg = /* @__PURE__ */ new Set();
    // Fugle codes the background streams
    this.bgN = 0;
    this.wasOpen = null;
    this.movedT = 0;
    this.lastLive = 0;
    // chart bars per ticker and range: kept like quotes (memory + local storage), refreshed in the background when old
    this.s = {};
    this.sLoaded = false;
    this.sKey = (ticker, range) => `${this.symbol(ticker)}|${range}`;
    // Live: one quote fetched now, whatever its age (a chart page asks every few seconds); pages on screen hear about it and
    // update in place (no page redraw); not stored (the 10-minute refresh stores quotes)
    this.qsubs = /* @__PURE__ */ new Set();
    // live quotes as 1-minute bars, memory only (fills what the fetched minute bars do not have yet)
    this.t = {};
    // Fugle's trade stream for the chart page on screen (with a key): trades update the quote and its minute bars at once,
    // listeners hear about them at most every 0.3 s; a streaming code is not polled
    this.stream = null;
    this.codes = /* @__PURE__ */ new Map();
    // Fugle code → our symbol
    this.pend = /* @__PURE__ */ new Set();
    this.fkey = () => "";
    // counted: a page redraw builds the new page (watch) before the old one lets go (unwatch), the stream stays up
    this.watchers = /* @__PURE__ */ new Map();
    // charts on screen hear about their new bars and redraw themselves; a listener answering false is gone and dropped
    this.subs = /* @__PURE__ */ new Set();
    try {
      this.q = this.load() ?? {};
    } catch {
      this.q = {};
    }
  }
  // a ticker as the provider wants it: 4–6 digit tickers are Taiwan listings with the Taiwan option on ("2330" → "2330.TW")
  symbol(ticker) {
    const t2 = ticker.trim().toUpperCase();
    return this.taiwan() && /^\d{4,6}[A-Z]?$/.test(t2) ? `${t2}.TW` : t2;
  }
  get(ticker) {
    return this.q[this.symbol(ticker)] ?? null;
  }
  price(ticker) {
    return this.get(ticker)?.price ?? null;
  }
  // base-currency units per 1 unit of `cur` (fallback: the config's fx_fallback, then 1)
  fx(cur, base2, fallback = {}) {
    if (cur === base2) return 1;
    return this.q[`${cur}${base2}=X`]?.price ?? (Number(fallback[cur]) || 1);
  }
  fxSymbol(cur, base2) {
    return `${cur}${base2}=X`;
  }
  // fetch what is missing or old, in the background; one redraw when anything changed
  refresh(symbols, force = false) {
    const due = [...new Set(symbols)].filter((s2) => s2 && !this.busy.has(s2) && (force || !this.q[s2] || Date.now() - this.q[s2].time > TTL || isTwSym(s2) && !this.q[s2].prev));
    if (!due.length) return;
    due.forEach((s2) => this.busy.add(s2));
    void Promise.all(due.map((s2) => this.provider.quote(s2).then((x) => {
      if (x) this.q[s2] = { ...x, closes: x.closes?.length ? x.closes : this.q[s2]?.closes };
      return !!x;
    }).catch(() => false).finally(() => this.busy.delete(s2)))).then((ok) => {
      if (ok.some(Boolean)) {
        try {
          this.save(this.q);
        } catch {
        }
        this.onFresh();
      }
    });
  }
  track(symbols) {
    symbols.forEach((s2) => {
      if (s2 && !s2.endsWith("=X")) this.tracked.add(s2);
    });
  }
  background() {
    if (document.hidden) return;
    const n = this.bgN++, now = /* @__PURE__ */ new Date(), cal = this.calendar?.cal, due = [...this.tracked].filter((s2) => marketOpen(s2, now, cal));
    if (n % 12 === 0) {
      const ts = [...this.tracked];
      this.calendar?.tick(ts.some((s2) => isTwSym(s2)), ts.some((s2) => !isTwSym(s2)));
    }
    this.noTradeCheck(now);
    const open2 = due.length > 0;
    if (this.wasOpen === null || !this.tracked.size) this.wasOpen = open2;
    else if (open2 !== this.wasOpen) {
      this.wasOpen = open2;
      this.onLive?.(open2);
    }
    const tw = due.filter((s2) => fugleCode(s2)), other = due.filter((s2) => !fugleCode(s2));
    const want = new Set(tw.map((s2) => fugleCode(s2)));
    if (this.stream && this.fkey()) tw.forEach((s2) => {
      const c = fugleCode(s2);
      if (!this.bg.has(c)) {
        this.bg.add(c);
        this.codes.set(c, s2);
        this.stream.watch(c);
      }
    });
    for (const c of [...this.bg]) if (!want.has(c) || !this.fkey()) {
      this.bg.delete(c);
      if (!this.watchers.has(c)) this.stream?.unwatch(c);
    }
    const jobs = [];
    const poll = tw.filter((s2) => !(this.stream?.on(fugleCode(s2)) && this.q[s2]?.prev));
    if (poll.length && !this.busy.has("bg|twse")) {
      this.busy.add("bg|twse");
      jobs.push(twseMany(poll).then((qs) => Object.entries(qs).map(([s2, x]) => this.apply(s2, x)).some(Boolean)).catch(() => false).finally(() => this.busy.delete("bg|twse")));
    }
    if (n % 3 === 0) other.forEach((s2) => jobs.push(this.live(s2)));
    if (n % 12 === 0) due.forEach((s2) => this.refreshSeries(s2, "I"));
    void Promise.all(jobs).then((m) => {
      if (m.some(Boolean)) this.moved();
    });
  }
  // a Taiwan weekday with no trade by 09:10 (a typhoon day the work-stoppage page missed): from 09:10, when every Taiwan
  // quote fetched since then is from before 09:00, Taiwan is closed today; a trade today (a chart page still asks) opens it again
  noTradeCheck(now) {
    const tw = [...this.tracked].filter((s2) => isTwSym(s2));
    if (!tw.length || !this.calendar) return;
    const c = marketClock(tw[0], now);
    if (!c.weekday || c.min < 550 || c.min > 815) return;
    const t910 = now.getTime() - (c.min - 550) * 6e4 - now.getSeconds() * 1e3, t900 = t910 - 10 * 6e4;
    const fresh = tw.map((s2) => this.q[s2]).filter((q) => !!q && q.time >= t910 && !!q.asOf);
    if (!fresh.length) return;
    if (fresh.some((q) => q.asOf >= t900)) this.calendar.noTrade(c.day, false);
    else if (fresh.length === tw.length) this.calendar.noTrade(c.day, true);
  }
  // which of the tracked tickers' markets trade now (TW, US); when none does: a market closed in its usual hours (holiday,
  // typhoon, early close), and the soonest next open among them
  // is this ticker's market trading now: the one rule every page uses (clock, holidays, typhoon days, early closes)
  isOpen(ticker, now = /* @__PURE__ */ new Date()) {
    return marketOpen(this.symbol(ticker), now, this.calendar?.cal);
  }
  liveState() {
    const now = /* @__PURE__ */ new Date(), ts = [...this.tracked], cal = this.calendar?.cal, mkt = (s2) => isTwSym(s2) ? "TW" : "US";
    const open2 = ["TW", "US"].filter((m) => ts.some((s2) => mkt(s2) === m && marketOpen(s2, now, cal)));
    if (open2.length) return { open: open2, closed: null, next: null };
    let closed = null;
    for (const s2 of ts) {
      const why = closedInHours(s2, now, cal);
      if (why) {
        closed = { mkt: mkt(s2), why };
        break;
      }
    }
    let next = null;
    for (const m of new Set(ts.map(mkt))) {
      const at = nextOpen(ts.find((s2) => mkt(s2) === m), now, cal)?.getTime();
      if (at && (!next || at < next.at)) next = { mkt: m, at };
    }
    return { open: open2, closed, next };
  }
  moved() {
    if (this.movedT) return;
    this.movedT = window.setTimeout(() => {
      this.movedT = 0;
      this.lastLive = Date.now();
      this.onLive?.();
    }, Math.max(0, 5e3 - (Date.now() - this.lastLive)));
  }
  // the oldest market time among these tickers (what "prices as of" means for a page), null when none is known
  asOf(tickers) {
    const ts = tickers.map((t2) => this.get(t2)?.asOf ?? this.get(t2)?.time).filter((x) => !!x);
    return ts.length ? Math.min(...ts) : null;
  }
  series(ticker, range) {
    if (!this.sLoaded) {
      this.sLoaded = true;
      try {
        this.s = this.loadSeries?.() ?? {};
      } catch {
        this.s = {};
      }
    }
    return this.s[this.sKey(ticker, range)] ?? null;
  }
  onQuote(fn) {
    this.qsubs.add(fn);
  }
  ticks(ticker) {
    return this.t[this.symbol(ticker)] ?? null;
  }
  useFugle(key) {
    this.fkey = key;
    this.stream = new FugleStream(key, (code, price, ms, raw) => {
      this.trade(code, price, ms);
      const sym = this.codes.get(code);
      if (sym) this.onTrade?.(sym, raw);
    });
  }
  hasFugle() {
    return !!this.fkey();
  }
  watch(ticker) {
    const s2 = this.symbol(ticker), c = fugleCode(s2);
    if (c && this.stream) {
      this.codes.set(c, s2);
      this.watchers.set(c, (this.watchers.get(c) ?? 0) + 1);
      this.stream.watch(c);
    }
  }
  unwatch(ticker) {
    const c = fugleCode(this.symbol(ticker));
    if (!c || !this.watchers.has(c)) return;
    const n = (this.watchers.get(c) ?? 1) - 1;
    if (n > 0) {
      this.watchers.set(c, n);
      return;
    }
    this.watchers.delete(c);
    if (!this.bg.has(c)) this.stream?.unwatch(c);
  }
  stop() {
    this.stream?.stop();
  }
  trade(code, price, ms) {
    const s2 = this.codes.get(code);
    if (!s2) return;
    const was = this.q[s2];
    if (was?.asOf && ms < was.asOf) return;
    this.q[s2] = { ...was, price, asOf: ms, time: Date.now(), source: "fugle" };
    this.t[s2] = addTick(this.t[s2], marketMinute(s2, ms), Math.round(price * 100));
    if (this.pend.has(s2)) return;
    this.pend.add(s2);
    window.setTimeout(() => {
      this.pend.delete(s2);
      for (const f of [...this.qsubs]) if (!f(s2)) this.qsubs.delete(f);
      this.moved();
    }, 300);
  }
  // true = the price moved
  async live(ticker) {
    const s2 = this.symbol(ticker), k = `live|${s2}`, c = fugleCode(s2);
    if (this.busy.has(k) || c && this.stream?.on(c) && this.q[s2]?.prev) return false;
    this.busy.add(k);
    try {
      const x = await this.provider.quote(s2);
      return x ? this.apply(s2, x) : false;
    } catch {
      return false;
    } finally {
      this.busy.delete(k);
    }
  }
  // a fresh quote kept (memory only: the 10-minute refresh stores quotes); listeners hear when anything changed; true = the price moved
  apply(s2, x) {
    const was = this.q[s2];
    this.q[s2] = { ...x, closes: x.closes?.length ? x.closes : was?.closes };
    if (was && was.price === x.price && was.asOf === x.asOf) {
      if (was.vol !== void 0 && x.vol === void 0) this.q[s2].vol = was.vol;
      return false;
    }
    const sameDay = !!was?.asOf && !!x.asOf && marketMinute(s2, was.asOf).slice(0, 10) === marketMinute(s2, x.asOf).slice(0, 10);
    const dv = x.vol !== void 0 && was?.vol !== void 0 && sameDay ? Math.max(0, x.vol - was.vol) : 0;
    this.t[s2] = addTick(this.t[s2], marketMinute(s2, x.asOf ?? x.time), Math.round(x.price * 100), dv);
    for (const f of [...this.qsubs]) if (!f(s2)) this.qsubs.delete(f);
    return !was || was.price !== x.price;
  }
  onSeries(fn) {
    this.subs.add(fn);
  }
  refreshSeries(ticker, range, force = false) {
    const k = this.sKey(ticker, range), have = this.series(ticker, range);
    if (this.busy.has(k) || !force && have && Date.now() - have.time < (isMinutes(range) ? TTL_MIN : TTL) || !this.provider.bars) return;
    this.busy.add(k);
    void this.provider.bars(this.symbol(ticker), range).then((b) => {
      if (!b) return;
      this.s[k] = { bars: b, time: Date.now(), source: b.ohlc ? "" : "line" };
      try {
        this.saveSeries?.(Object.fromEntries(Object.entries(this.s).filter(([key]) => !isMinutes(key.split("|")[1]))));
      } catch {
      }
      for (const f of [...this.subs]) if (!f(k)) this.subs.delete(f);
      if (range === "D" && !have) this.onFresh();
    }).catch(() => void 0).finally(() => this.busy.delete(k));
  }
};
Prices.KEY = KEY;
Prices.SERIES_KEY = "ledgerline-bars";

// src/prices/flows.ts
var import_obsidian5 = require("obsidian");

// src/calc/flows.ts
var ZERO = { f: 0, t: 0, ds: 0, dh: 0, fb: 0, fs: 0, tb: 0, ts: 0, dsb: 0, dss: 0, dhb: 0, dhs: 0 };
var int = (s2) => {
  const n = Number(String(s2 ?? "").replace(/,/g, "").trim());
  return Number.isFinite(n) ? Math.round(n) : 0;
};
var parseT86 = (json, codes) => {
  const j = json;
  if (!j || j.stat !== "OK" || !Array.isArray(j.data) || !Array.isArray(j.fields)) return null;
  const F = j.fields, col = (want2) => F.findIndex((x) => x.includes(want2));
  const fx = col("\u5916\u9678\u8CC7\u8CB7\u8CE3\u8D85"), fd = col("\u5916\u8CC7\u81EA\u71DF\u5546\u8CB7\u8CE3\u8D85"), tr = col("\u6295\u4FE1\u8CB7\u8CE3\u8D85"), ds = col("\u81EA\u71DF\u5546\u8CB7\u8CE3\u8D85\u80A1\u6578(\u81EA\u884C"), dh = col("\u81EA\u71DF\u5546\u8CB7\u8CE3\u8D85\u80A1\u6578(\u907F\u96AA");
  const G = { fb: col("\u5916\u9678\u8CC7\u8CB7\u9032"), fs: col("\u5916\u9678\u8CC7\u8CE3\u51FA"), fdb: col("\u5916\u8CC7\u81EA\u71DF\u5546\u8CB7\u9032"), fds: col("\u5916\u8CC7\u81EA\u71DF\u5546\u8CE3\u51FA"), tb: col("\u6295\u4FE1\u8CB7\u9032"), ts: col("\u6295\u4FE1\u8CE3\u51FA"), dsb: col("\u81EA\u71DF\u5546\u8CB7\u9032\u80A1\u6578(\u81EA\u884C"), dss: col("\u81EA\u71DF\u5546\u8CE3\u51FA\u80A1\u6578(\u81EA\u884C"), dhb: col("\u81EA\u71DF\u5546\u8CB7\u9032\u80A1\u6578(\u907F\u96AA"), dhs: col("\u81EA\u71DF\u5546\u8CE3\u51FA\u80A1\u6578(\u907F\u96AA") };
  if ([fx, tr, ds, dh].some((i) => i < 0)) return null;
  const at = (r, i) => i >= 0 ? int(r[i]) : 0;
  const want = new Set(codes), out = {};
  for (const r of j.data) {
    const c = String(r[0] ?? "").trim();
    if (want.has(c)) out[c] = {
      f: int(r[fx]) + at(r, fd),
      t: int(r[tr]),
      ds: int(r[ds]),
      dh: int(r[dh]),
      fb: at(r, G.fb) + at(r, G.fdb),
      fs: at(r, G.fs) + at(r, G.fds),
      tb: at(r, G.tb),
      ts: at(r, G.ts),
      dsb: at(r, G.dsb),
      dss: at(r, G.dss),
      dhb: at(r, G.dhb),
      dhs: at(r, G.dhs)
    };
  }
  return out;
};
var flowSeries = (days, code) => Object.keys(days).sort().filter((k) => days[k]).map((date) => {
  const x = { ...ZERO, ...days[date][code] }, d = x.ds + x.dh;
  return { date, ...x, d, total: x.f + x.t + d };
});
var flowSum = (s2, who, n) => s2.slice(-n).reduce((a, x) => a + x[who], 0);
var flowGross = (s2, who, side, n) => s2.slice(-n).reduce((a, x) => a + (who === "d" ? x[`ds${side}`] + x[`dh${side}`] : x[`${who}${side}`]), 0);
var flowSides = (s2, who, n) => {
  const w = s2.slice(-n);
  return [w.filter((x) => x[who] > 0).length, w.filter((x) => x[who] < 0).length];
};
var streak = (s2, who) => {
  let k = 0;
  for (let i = s2.length - 1; i >= 0; i--) {
    const v = Math.sign(s2[i][who]);
    if (!v || k && v !== Math.sign(k)) break;
    k += v;
  }
  return k;
};
var lots = (shares) => Math.sign(shares) * Math.round(Math.abs(shares) / 1e3);
var ymd2 = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
var flowDue = (now, known, back = 35) => {
  const out = [];
  for (let k = now.getHours() >= 15 ? 0 : 1; k <= back; k++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - k), s2 = ymd2(d);
    if (d.getDay() % 6 && !(s2 in known)) out.push(s2);
  }
  return out;
};
var flowTrim = (days, now, back = 35) => {
  const from = ymd2(new Date(now.getFullYear(), now.getMonth(), now.getDate() - back));
  return Object.fromEntries(Object.entries(days).filter(([k]) => k >= from));
};
var isEtf = (code) => /^00/.test(code);

// src/prices/flows.ts
var GAP = 400;
var RETRY2 = 10 * 60 * 1e3;
var Flows = class {
  constructor(load2, save) {
    this.load = load2;
    this.save = save;
    this.st = { v: 2, codes: [], days: {} };
    this.busy = false;
    this.tried = 0;
    this.subs = /* @__PURE__ */ new Set();
    try {
      const v = this.load();
      if (v && v.v === 2 && Array.isArray(v.codes) && v.days) this.st = v;
    } catch {
    }
  }
  // a 4–6 digit code, or null for tickers T86 does not cover
  static code(symbol) {
    const m = /^(\d{4,6}[A-Z]?)\.TW$/.exec(symbol);
    return m ? m[1] : null;
  }
  // this code's trading days, oldest first; null while nothing is known for it
  series(code) {
    if (!this.st.codes.includes(code)) return null;
    const s2 = flowSeries(this.st.days, code);
    return s2.length ? s2 : null;
  }
  loading() {
    return this.busy;
  }
  // a listener answering false is gone and dropped
  onChange(fn) {
    this.subs.add(fn);
  }
  tell() {
    for (const f of [...this.subs]) if (!f()) this.subs.delete(f);
  }
  // fetch what is missing for these codes (a new code means every day again: the stored days only hold the old codes)
  ensure(codes) {
    const want = [...new Set(codes)].sort();
    if (!want.length || this.busy) return;
    if (want.some((c) => !this.st.codes.includes(c))) {
      this.st = { v: 2, codes: [.../* @__PURE__ */ new Set([...this.st.codes, ...want])].sort(), days: {} };
      this.tried = 0;
    }
    if (Date.now() - this.tried < RETRY2) return;
    const now = /* @__PURE__ */ new Date(), due = flowDue(now, this.st.days);
    if (!due.length) return;
    this.busy = true;
    this.tried = Date.now();
    const today3 = flowDue(now, {}, 0)[0] ?? "";
    void (async () => {
      let got = 0;
      for (const date of due) {
        const r = await (0, import_obsidian5.requestUrl)({ url: `https://www.twse.com.tw/rwd/zh/fund/T86?date=${date.replace(/-/g, "")}&selectType=ALLBUT0999&response=json`, throw: false }).catch(() => null);
        if (!r || r.status !== 200) break;
        let json = null;
        try {
          json = r.json;
        } catch {
          break;
        }
        const rows = parseT86(json, this.st.codes);
        if (rows || date !== today3) this.st.days[date] = rows;
        if (++got % 5 === 0) this.tell();
        await new Promise((ok) => setTimeout(ok, GAP));
      }
      this.st.days = flowTrim(this.st.days, now);
      try {
        this.save(this.st);
      } catch {
      }
    })().finally(() => {
      this.busy = false;
      this.tell();
    });
  }
};
Flows.KEY = "ledgerline-flows";

// src/prices/revenue.ts
var import_obsidian6 = require("obsidian");

// src/calc/revenue.ts
var ymOf = (y, m) => {
  const d = new Date(Date.UTC(y, m - 1, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
};
var ymAdd = (ym, n) => ymOf(Number(ym.slice(0, 4)), Number(ym.slice(5, 7)) + n);
var pct = (a, b) => a !== void 0 && b !== void 0 && b > 0 ? (a - b) / b * 100 : null;
var revStats = (list5) => {
  const by = new Map(list5.filter((m) => m.v > 0).map((m) => [m.ym, m.v]));
  const yms = [...by.keys()].sort();
  if (!yms.length) return null;
  const last = yms[yms.length - 1], v = (ym) => by.get(ym);
  const sum = (end, n) => {
    let t2 = 0;
    for (let i = 0; i < n; i++) {
      const x = v(ymAdd(end, -i));
      if (x === void 0) return void 0;
      t2 += x;
    }
    return t2;
  };
  const mo = Number(last.slice(5, 7));
  const months = Array.from({ length: 24 }, (_, i) => ymAdd(last, i - 23)).filter((ym) => by.has(ym)).map((ym) => ({ ym, v: v(ym), yoy: pct(v(ym), v(ymAdd(ym, -12))) }));
  const best = months.reduce((b, m) => m.v > b.v ? m : b, months[0]);
  return {
    latest: { ym: last, v: v(last) },
    mom: pct(v(last), v(ymAdd(last, -1))),
    yoy: pct(v(last), v(ymAdd(last, -12))),
    last3: pct(sum(last, 3), sum(ymAdd(last, -12), 3)),
    ytd: pct(sum(last, mo), sum(ymAdd(last, -12), mo)),
    best: { ym: best.ym, v: best.v },
    nextOut: `${ymAdd(last, 2)}-10`,
    months
  };
};
var expectedYm = (today3) => ymAdd(today3.slice(0, 7), Number(today3.slice(8, 10)) >= 10 ? -1 : -2);
var fromFinMind = (rows) => (Array.isArray(rows) ? rows : []).map((r) => ({
  ym: ymOf(Number(r.revenue_year), Number(r.revenue_month)),
  v: Math.round(Number(r.revenue))
})).filter((m) => Number.isFinite(m.v) && m.v > 0 && /^\d{4}-\d{2}$/.test(m.ym));
var revShort = (v) => v >= 1e9 ? `${(v / 1e9).toFixed(2)} B` : v >= 1e6 ? `${(v / 1e6).toFixed(1)} M` : `${Math.round(v / 1e3)} K`;

// src/prices/revenue.ts
var KEY2 = "ledgerline-revenue";
var AGAIN_MS = 3 * 3600 * 1e3;
var Revenue = class {
  constructor(load2, save) {
    this.load = load2;
    this.save = save;
    this.m = {};
    this.busy = /* @__PURE__ */ new Set();
    this.subs = /* @__PURE__ */ new Set();
    try {
      this.m = this.load() ?? {};
    } catch {
      this.m = {};
    }
  }
  get(code) {
    return this.m[code]?.months ?? [];
  }
  // the newest month it has
  latest(code) {
    const l = this.get(code);
    return l.length ? l[l.length - 1].ym : "";
  }
  // its month for `today` is out
  isOut(code, day = today()) {
    return this.latest(code) >= expectedYm(day);
  }
  onChange(fn) {
    this.subs.add(fn);
  }
  ensure(code) {
    if (!/^\d{4,6}$/.test(code) || this.busy.has(code)) return;
    const k = this.m[code];
    if (k && (this.isOut(code) || Date.now() - k.at < AGAIN_MS)) return;
    void this.fetch(code);
  }
  async fetch(code) {
    this.busy.add(code);
    try {
      const from = `${ymAdd(today().slice(0, 7), -26)}-01`;
      const r = await (0, import_obsidian6.requestUrl)({ url: `https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockMonthRevenue&data_id=${code}&start_date=${from}`, throw: false });
      const rows = r.status === 200 ? r.json?.data : null;
      const months = fromFinMind(rows).sort((a, b) => a.ym.localeCompare(b.ym));
      const before = this.latest(code);
      this.m[code] = { months: months.length ? months : this.get(code), at: Date.now() };
      this.save(this.m);
      const fresh = this.latest(code) !== before;
      if (fresh) this.subs.forEach((fn) => {
        if (!fn(code)) this.subs.delete(fn);
      });
      return fresh;
    } catch {
      return false;
    } finally {
      this.busy.delete(code);
    }
  }
};
Revenue.key = KEY2;

// src/alerts.ts
var import_obsidian7 = require("obsidian");

// src/calc/thesis.ts
var s = (v) => String(v ?? "").trim();
var readThesis = (fm) => {
  const x = fm?.thesis;
  if (!x || typeof x !== "object") return null;
  const th = { why: s(x.why), check: dateStr(x.check, ""), hold: s(x.hold), sell: s(x.sell), since: dateStr(x.since, "") };
  return th.why || th.sell || th.check ? th : null;
};
var daysBetween = (a, b) => Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 864e5);
var checkState = (check, today3) => {
  if (!check) return "none";
  const d = daysBetween(today3, check);
  return d <= 0 ? "due" : d <= 7 ? "soon" : "later";
};
var moveSince = (b, from) => {
  if (!b || b.c.length < 2) return null;
  let i = b.d.findIndex((d) => d.slice(0, 10) >= from);
  if (i < 0) return null;
  if (i >= b.c.length - 1) i = b.c.length - 2;
  const a = b.c[i], z = b.c[b.c.length - 1];
  return a > 0 ? { pct: (z - a) / a * 100, from: b.d[i].slice(0, 10) } : null;
};
var vsBench = (stock, bench, from) => {
  const a0 = moveSince(stock, from);
  if (!a0) return null;
  const start = a0.from > from ? a0.from : from;
  const a = moveSince(stock, start), b = moveSince(bench, start);
  return a && b ? { diff: a.pct - b.pct, from: a.from > b.from ? a.from : b.from } : null;
};
var satVsBench = (list5) => {
  const ok = list5.filter((x) => x.diff !== null && x.cost > 0);
  const w = ok.reduce((t2, x) => t2 + x.cost, 0);
  return w > 0 ? ok.reduce((t2, x) => t2 + x.diff * x.cost, 0) / w : null;
};
var buyRules = (x) => {
  const of = x.batches ?? 3, n = x.buys + 1;
  const rows = [
    { key: "thesis", met: !!x.thesis?.why && !!x.thesis.check },
    { key: "sell", met: !!x.thesis?.sell },
    x.single ? { key: "cap", met: x.cap - x.cost > 0, left: x.cap - x.cost } : { key: "cap", met: true },
    x.single ? { key: "batch", met: n <= of, n, of, per: Math.round(x.cap / of / 100) * 100 } : { key: "batch", met: true, n, of },
    { key: "emergency", met: x.emergency === null ? null : x.emergency >= x.emergencyMin, left: x.emergency ?? void 0 },
    { key: "limit", met: x.limit !== null && x.limit > 0 },
    { key: "sat", met: x.sat === null ? null : x.sat >= 0 }
  ];
  return { rows, met: rows.filter((r) => r.met === true).length };
};
var emergencyMinOf = (fm) => {
  const n = Math.round(Number(fm?.emergency_min));
  return n > 0 ? n : 0;
};

// src/calc/alerts.ts
var arr2 = (v) => (Array.isArray(v) ? v : v ? [v] : []).filter((x) => x && typeof x === "object");
var readAlerts = (fm) => ({
  topic: String(fm?.topic ?? "").trim(),
  alerts: arr2(fm?.alerts).map((a, index) => ({ id: String(a.id ?? `a${index}`), ticker: String(a.ticker ?? "").toUpperCase(), kind: a.kind === "above" ? "above" : "below", price: Math.round(Number(a.price) * 100), index })).filter((a) => a.ticker && a.price > 0),
  sent: arr2(fm?.sent).map((s2) => ({ key: String(s2.key ?? ""), date: dateStr(s2.date, ""), text: String(s2.text ?? "") })).filter((s2) => s2.key)
});
var hit = (a, price) => a.kind === "below" ? price <= a.price : price >= a.price;
var away = (a, price) => price > 0 ? (a.kind === "below" ? price - a.price : a.price - price) / price * 100 : 0;
var keepSent = (sent, today3) => sent.filter((s2) => s2.date && daysBetween(s2.date, today3) <= 7);
var REPORTS = [["03-31", "Annual"], ["05-15", "Q1"], ["08-14", "Q2"], ["11-14", "Q3"]];
var comingDates = (today3, o, days = 45) => {
  const out = [], y = Number(today3.slice(0, 4));
  const inRange = (d) => {
    const n = daysBetween(today3, d);
    return n >= 0 && n <= days;
  };
  for (const yr of [y, y + 1]) for (const [md, what] of REPORTS) {
    const d = `${yr}-${md}`;
    if (inRange(d)) out.push({ kind: "report", date: d, ticker: "", what });
  }
  const day = Number(today3.slice(8, 10)), m0 = today3.slice(0, 7);
  const due = day <= 10 ? `${m0}-10` : `${new Date(Date.UTC(y, Number(today3.slice(5, 7)), 10)).toISOString().slice(0, 10)}`;
  for (const tk of o.tw) if (!(due.slice(0, 7) === m0 && o.revOut.has(tk))) out.push({ kind: "revenue", date: due, ticker: tk, what: "" });
  for (const e of o.exdiv) if (inRange(e.date)) out.push({ kind: "exdiv", date: e.date, ticker: e.code, what: "", cash: e.cash });
  for (const th of o.theses) if (th.check && daysBetween(today3, th.check) <= days) out.push({ kind: "thesis", date: th.check, ticker: th.ticker, what: th.hold });
  return out.sort((a, b) => a.date.localeCompare(b.date) || a.ticker.localeCompare(b.ticker));
};
var rocDate = (s2) => {
  const m = /^(\d{3})(\d{2})(\d{2})$/.exec(s2.trim());
  return m ? `${Number(m[1]) + 1911}-${m[2]}-${m[3]}` : "";
};
var fromTwt48u = (rows) => (Array.isArray(rows) ? rows : []).map((r) => ({
  code: String(r.Code ?? "").trim(),
  date: rocDate(String(r.Date ?? "")),
  cash: Math.round(Number(r.CashDividend || 0) * 100)
})).filter((e) => e.code && e.date);

// src/calc/invest.ts
var arr3 = (v) => (Array.isArray(v) ? v : v ? [v] : []).filter((x) => x && typeof x === "object");
var num3 = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
var tickerOf = (a) => String(a.ticker ?? a.name ?? "").toUpperCase();
var minorOf = (currency) => ["TWD", "JPY", "KRW"].includes(currency) ? 1 : 100;
var toQ = (shares) => Math.round(num3(shares) * 1e4);
var toP2 = (price) => Math.round(num3(price) * 100);
var toMinor = (amount, currency) => Math.round(num3(amount) * minorOf(currency));
var grossOf = (q, p, currency) => Math.round(q * p * minorOf(currency) / 1e6);
var toBase = (minor, currency, rate) => Math.round(minor / minorOf(currency) * rate);
var tradeIds = (ticker, rows) => {
  const seen2 = /* @__PURE__ */ new Map();
  return rows.map((t2) => {
    if (t2.id) return String(t2.id);
    const base2 = `${ticker}-${dateStr(t2.date, "")}`, n = (seen2.get(base2) ?? 0) + 1;
    seen2.set(base2, n);
    return n === 1 ? base2 : `${base2}-${n}`;
  });
};
var nextDca = (dca, today3) => {
  if (!dca || !(dca.day >= 1)) return null;
  const [y, m, d] = today3.split("-").map(Number);
  const at = (yy, mm) => {
    const last = new Date(yy, mm, 0).getDate();
    return `${yy}-${String(mm).padStart(2, "0")}-${String(Math.min(dca.day, last)).padStart(2, "0")}`;
  };
  const here = at(y, m);
  if (Number(here.slice(8)) >= d) return here;
  return m === 12 ? at(y + 1, 1) : at(y, m + 1);
};
var buildPortfolio = (fm, price, fx, today3 = "") => {
  const alloc = arr3(fm?.allocation);
  const positions = arr3(fm?.assets).map((a, index) => {
    const currency = String(a.currency ?? "TWD").toUpperCase(), ticker = tickerOf(a), broker = String(a.broker ?? "");
    const fxNow = fx(currency);
    const rows = arr3(a.transactions), ids = tradeIds(ticker, rows);
    const trades = rows.map((t2, i) => {
      const type = String(t2.type).toUpperCase() === "SELL" ? "SELL" : "BUY";
      const q = toQ(t2.shares), p = toP2(t2.price), gross = grossOf(q, p, currency);
      const fee = toMinor(t2.fee, currency), tax = toMinor(t2.tax, currency), rate = currency === "TWD" ? 1 : num3(t2.fx) || fxNow;
      const cash = type === "BUY" ? -toBase(gross + fee, currency, rate) : toBase(gross - fee - tax, currency, rate);
      const settled = dateStr(t2.settled, "");
      return { id: ids[i], type, date: dateStr(t2.date, ""), settled, broker: String(t2.broker ?? broker), index: i, rate, shares: num3(t2.shares), price: num3(t2.price), fx: num3(t2.fx), q, p, gross, fee, tax, cash, pending: !!today3 && !!settled && settled > today3 };
    });
    let held = 0, cost = 0, realized = 0, fees = 0, bought = 0;
    [...trades].sort((x, y) => x.date.localeCompare(y.date) || x.index - y.index).forEach((t2) => {
      fees += toBase(t2.fee + t2.tax, currency, t2.rate);
      bought -= t2.cash;
      if (t2.type === "BUY") {
        held += t2.q;
        cost -= t2.cash;
      } else if (held > 0) {
        const sold = Math.min(t2.q, held);
        const out = sold === held ? cost : Math.round(cost * sold / held);
        const proceeds = sold === t2.q ? t2.cash : Math.round(t2.cash * sold / t2.q);
        realized += proceeds - out;
        held -= sold;
        cost -= out;
      }
    });
    if (!trades.length && num3(a.shares) > 0) {
      held = toQ(a.shares);
      cost = toBase(grossOf(held, toP2(a.avg_cost), currency), currency, fxNow);
    }
    const last = price(ticker);
    const g = last !== null ? grossOf(held, toP2(last), currency) : 0;
    const value2 = last !== null ? toBase(g, currency, fxNow) : cost;
    const exit = held > 0 && last !== null ? toBase(autoFee(g, currency) + autoTax(g, currency, ticker), currency, fxNow) : 0;
    const d = a.dca && typeof a.dca === "object" ? a.dca : null;
    const dca = d && num3(d.amount) > 0 ? { amount: Math.round(num3(d.amount)), day: Math.round(num3(d.day)) || 1 } : null;
    return { ticker, name: String(a.name ?? ticker), category: String(a.category ?? "other").toLowerCase(), currency, broker, dca, trades, shares: held / 1e4, q: held, cost, avg: held > 0 ? cost * 1e4 / held : 0, realized, fees, bought, price: last, value: value2, exit, pl: value2 - exit - cost, index };
  });
  const value = positions.reduce((s2, p) => s2 + p.value, 0);
  const buckets = alloc.map((b) => {
    const key = String(b.key ?? "").toLowerCase(), label = String(b.label ?? key);
    const v = positions.filter((p) => p.category === key || p.category === label.toLowerCase()).reduce((s2, p) => s2 + p.value, 0);
    const pct2 = value > 0 ? v / value * 100 : 0, target = num3(b.pct);
    return { key, label, target, value: v, pct: pct2, drift: pct2 - target };
  });
  const sum = (k) => positions.reduce((s2, p) => s2 + p[k], 0);
  return {
    positions: positions.sort((a, b) => b.value - a.value),
    buckets,
    value,
    cost: sum("cost"),
    pl: sum("pl"),
    realized: sum("realized"),
    fees: sum("fees"),
    bought: sum("bought"),
    priced: positions.every((p) => p.q <= 0 || p.price !== null),
    threshold: num3(fm?.rebalance_threshold) || 5,
    watch: arr3(fm?.watchlist).map((w) => String(w.ticker ?? "").toUpperCase()).filter(Boolean)
  };
};
var tradeLinks = (P, entries) => P.positions.flatMap((p) => p.trades.map((t2) => {
  const own = entries.filter((e) => e.trade === t2.id), booked = own.reduce((s2, e) => s2 + e.amount, 0);
  return { id: t2.id, ticker: p.ticker, cash: t2.cash, booked, diff: t2.pending && !own.length ? 0 : booked - t2.cash, pending: t2.pending };
}));
var newTradeId = (ticker, date, taken) => {
  const base2 = `${ticker}-${date}`;
  if (!taken.includes(base2)) return base2;
  let n = 2;
  while (taken.includes(`${base2}-${n}`)) n++;
  return `${base2}-${n}`;
};
var tradeEntries = (t2, ticker, currency, account) => {
  const main = (t2.type === "BUY" ? -1 : 1) * toBase(t2.gross, currency, t2.rate), rest = t2.cash - main, date = t2.settled || t2.date;
  const note = `${ticker} x ${t2.shares} @ ${t2.price}${currency === "TWD" ? "" : ` ${currency}`}`;
  return [
    { date, account, amount: main, kind: t2.type === "BUY" ? "buy" : "sell", trade: t2.id, note },
    ...rest ? [{ date, account, amount: rest, kind: "fee", trade: t2.id, note: `${ticker} fee` }] : []
  ];
};
var syncEntries = (P, accounts, entries, ids, today3) => {
  const out = [];
  for (const id of ids) {
    const own = entries.filter((e) => e.trade === id), booked = own.reduce((s2, e) => s2 + e.amount, 0);
    const p = P.positions.find((x) => x.trades.some((t3) => t3.id === id)), t2 = p?.trades.find((x) => x.id === id);
    const account = own[0]?.account ?? accounts.find((a) => a.bucket && a.bucket === p?.category)?.key;
    if (!account) continue;
    if (!t2) {
      if (booked) out.push({ date: today3, account, amount: -booked, kind: "adjust", trade: id, note: "trade deleted" });
      continue;
    }
    if (!own.length) {
      out.push(...tradeEntries(t2, p.ticker, p.currency, account));
      continue;
    }
    if (booked !== t2.cash) out.push({ date: today3, account, amount: t2.cash - booked, kind: "adjust", trade: id, note: "trade edited" });
  }
  return out;
};
var investCash = (accounts, keys) => {
  const own = accounts.filter((a) => a.bucket && keys.includes(a.bucket));
  return own.length ? own.reduce((s2, a) => s2 + a.balance, 0) : null;
};
var journalPath = (ticker) => `Invest/${ticker}.md`;
var readJournal = (fm) => arr3(fm?.journal).map((j, index) => ({ date: dateStr(j.date, ""), trade: String(j.trade ?? ""), why: String(j.why ?? "").trim(), index })).filter((j) => j.why).sort((a, b) => b.date.localeCompare(a.date) || b.index - a.index);
var DEFAULT_CAP = 15e3;
var capOf = (fm) => {
  const n = Math.round(num3(fm?.single_stock_cap));
  return n > 0 ? n : DEFAULT_CAP;
};
var checkRules = (P, cap3, hasReason) => [
  ...P.positions.filter((p) => p.q > 0 && p.category === "stock" && p.cost > cap3).map((p) => ({ rule: "cap", key: p.ticker, over: p.cost - cap3 })),
  ...P.value > 0 ? P.buckets.filter((b) => Math.abs(b.drift) > P.threshold).map((b) => ({ rule: "mix", key: b.label, over: Math.round(b.drift) })) : [],
  ...P.positions.filter((p) => p.q > 0 && !hasReason(p.ticker)).map((p) => ({ rule: "reason", key: p.ticker, over: 0 }))
];
var newWarnings = (before, after) => after.filter((w) => !before.some((b) => b.rule === w.rule && b.key === w.key));
var isTwEtf = (ticker) => /^00\d/.test(ticker);
var autoFee = (gross, currency) => currency === "TWD" && gross > 0 ? Math.max(20, Math.floor(gross * 1425e-6)) : 0;
var autoTax = (gross, currency, ticker) => currency === "TWD" && gross > 0 ? Math.floor(gross * (isTwEtf(ticker) ? 1e-3 : 3e-3)) : 0;
var tickOf = (p, currency, ticker) => {
  if (currency !== "TWD") return 1;
  if (isTwEtf(ticker)) return p < 5e3 ? 1 : 5;
  return p < 1e3 ? 1 : p < 5e3 ? 5 : p < 1e4 ? 10 : p < 5e4 ? 50 : p < 1e5 ? 100 : 500;
};
var addTradingDays = (day, n, closed = () => false) => {
  const d = /* @__PURE__ */ new Date(`${day}T12:00:00Z`);
  if (isNaN(d.getTime())) return day;
  let left = n;
  while (left > 0) {
    d.setUTCDate(d.getUTCDate() + 1);
    const w = d.getUTCDay();
    if (w !== 0 && w !== 6 && !closed(d.toISOString().slice(0, 10))) left--;
  }
  return d.toISOString().slice(0, 10);
};
var revalue = (p, np) => {
  if (p.price === null || !(p.price > 0) || np === p.price) return p;
  const value = Math.round(p.value * np / p.price);
  const exit = p.q <= 0 ? 0 : p.currency === "TWD" ? autoFee(value, "TWD") + autoTax(value, "TWD", p.ticker) : Math.round(p.exit * np / p.price);
  return { ...p, price: np, value, exit, pl: value - exit - p.cost };
};
var todayMove = (p, ch, last, today3) => {
  const buys = p.trades.filter((t2) => t2.date === today3 && t2.type === "BUY");
  const boughtQ = buys.reduce((s2, t2) => s2 + t2.q, 0);
  const old = Math.max(0, p.q - boughtQ), keptNew = Math.max(0, p.q - old), share = boughtQ > 0 ? keptNew / boughtQ : 0, m = minorOf(p.currency);
  const fromBuys = buys.reduce((s2, t2) => s2 + t2.q * share * (last - t2.p) * m / 1e6, 0);
  return Math.round(old * ch * m / 1e6 + fromBuys);
};

// src/i18n.ts
var en = {
  appName: "Ledgerline",
  sDrag: "Drag to reorder",
  sTheme: "Light or dark",
  sThemeDesc: "Auto follows the phone.",
  sThemeAuto: "Auto",
  sThemeLight: "Light",
  sThemeDark: "Dark",
  sSkin: "Obsidian in Ledgerline's look",
  sSkinDesc: "Paper / charcoal, square corners.",
  sRedUp: "Red up, green down",
  sUsNy: "US times in New York time",
  sUsNyDesc: "Off: US charts and prices show your phone's time (the session runs 22:30\u201305:00 in Taipei in winter).",
  sRedUpDesc: "Taiwan's colours for price moves. Off: green up, red down.",
  open: "Open Ledgerline",
  back: "Back",
  tabDebt: "Debt",
  tabInvest: "Invest",
  tabLog: "Log",
  tabLedger: "Ledger",
  tabGoals: "Goals",
  comingSoon: "Coming soon",
  comingSoonSub: "This page is built in a later phase.",
  detailTest: "Open a detail page",
  detailTestSub: "Checks the page stack and the back button",
  detailTitle: "Detail",
  pageFailed: "This page could not be drawn",
  retry: "Retry",
  writeDebug: "Write the debug log now",
  capPage: "Capture this page for Vellum",
  capTabs: "Capture every tab's first page for Vellum",
  capNoApp: "Open Ledgerline first (on screen).",
  capDone: "Captured {n} screen(s) into {dir}.",
  // sheets
  cancel: "Cancel",
  save: "Save",
  invalidAmount: "Enter an amount greater than 0.",
  invalidNumber: "Enter a valid number.",
  required: "Fill in {field}.",
  sameValue: "Same value: nothing to change.",
  onlyMonth: "Only {month}",
  onlyMonthHint: "The plan stays {amount} {cur}",
  fromMonth: "{month} onwards",
  fromMonthHint: "New plan amount; earlier months keep what they had",
  delete: "Delete",
  // debt
  debtSub: "Loan",
  remaining: "Remaining",
  paid: "Paid",
  principal: "Principal",
  done: "Done",
  repayment: "Repayment",
  repaymentHistory: "Repayment history",
  paymentsN: "{n} payments",
  payment1: "1 payment",
  noneYet: "None yet",
  loanDetails: "Loan details",
  tapToChange: "Tap a value to change it.",
  initialPrincipal: "Initial principal",
  interestRate: "Interest rate",
  annual: "Annual",
  monthlyAllocation: "Monthly allocation",
  fromSavingsPlan: "From your savings plan",
  monthlyMin: "Monthly minimum payment",
  repaymentStarts: "Repayment starts",
  repayingSince: "Repaying since",
  inDays: "In {d} days (about {m} months)",
  notSet: "Not set",
  gracePeriod: "Grace period",
  graceFooter: "Each month {amount} {cur} is split in half ({half} {cur} each) until repayment starts.",
  toInvestment: "To investment",
  loanPrep: "Loan prep",
  halfOfPlan: "50% of the allocation",
  recordPayment: "Record payment",
  savePayment: "Save payment",
  editPayment: "Edit payment",
  deletePayment: "Delete payment",
  deletePaymentQ: "Delete the payment of {amount} {cur} on {date}?",
  amount: "Amount",
  date: "Date",
  note: "Note",
  optional: "Optional",
  defaultPaymentNote: "Monthly payment",
  noPayments: "No payments yet",
  noPaymentsSub: "Tap + when you make one.",
  tapToEditPayment: "Tap a payment to edit or delete it.",
  loggedPayment: "Logged a payment of {amount} {cur}. Remaining: {left} {cur}.",
  updatedPayment: "Updated the payment: {amount} {cur}.",
  deletedPayment: "Deleted the payment of {amount} {cur}.",
  updated: "{what}: {value}",
  allocOnce: "{what}: {amount} {cur} for {month} only",
  allocOnward: "{what}: {amount} {cur} from {month}",
  allocFrozen: " ({n} earlier months kept as before)",
  noDebt: "No loan set up",
  noDebtSub: "Add your loan to track what is left and every payment.",
  setUpLoan: "Set up loan",
  rateHint: "Annual rate in %, e.g. 0.775",
  // ledger
  ledgerNetOwed: "Net balance \xB7 you are owed",
  ledgerNetOwe: "Net balance \xB7 you owe",
  noFriends: "No friends yet",
  allSettled: "Everyone is settled",
  openFriends: "{n} friends with an open balance",
  openFriend1: "1 friend with an open balance",
  theyOweMe: "They owe me",
  iOweThem: "I owe them",
  openCount: "Open",
  openBalances: "Open balances",
  settled: "Settled",
  owesYou: "Owes you",
  youOwe: "You owe",
  daysN: "{n} days",
  theyOweYou: "They owe you",
  youOweThem: "You owe them",
  balance: "Balance",
  noTx: "No transactions yet",
  noTxSub: "Tap + to record the first one.",
  nothingOwed: "Nobody owes anything right now.",
  tapToEditTx: "Tap a transaction to edit or delete it.",
  newTx: "New transaction",
  editTx: "Edit transaction",
  deleteTx: "Delete transaction",
  deleteTxQ: "Delete this transaction ({amount} {cur}, {date})?",
  friend: "Friend",
  newFriend: "New friend\u2026",
  name: "Name",
  newFriendName: "New friend's name",
  whoPaid: "Who paid?",
  tPaidFor: "I paid",
  tPaidForSub: "They owe me",
  tPaidBy: "They paid",
  tPaidBySub: "I owe them",
  tPaidToMe: "They paid back",
  tPaidToMeSub: "Settles what they owe",
  tPaidToThem: "I paid back",
  tPaidToThemSub: "Settles what I owe",
  summary: "Summary",
  timesN: "{n} times",
  time1: "1 time",
  since: "Since",
  last: "Last",
  recentActivity: "Recent activity",
  txCount: "Transactions",
  nameTaken: "{name} is already in the list: pick them above.",
  aPaidFor: "You paid",
  aPaidBy: "They paid",
  aPaidToMe: "They repaid",
  aPaidToThem: "You repaid",
  aPaidForLong: "You paid for them (they owe you)",
  aPaidByLong: "They paid for you (you owe them)",
  aPaidToMeLong: "They repaid you",
  aPaidToThemLong: "You repaid them",
  savedTx: "Saved: {friend}, {what}, {amount} {cur}",
  updatedTx: "Updated: {friend} \xB7 {amount} {cur}",
  deletedTx: "Deleted: {friend} \xB7 {amount} {cur}",
  txGone: "That transaction changed meanwhile: nothing was saved.",
  noDate: "No date",
  paidLine: "{paid} paid \xB7 {pct}",
  inDaysShort: "in {d} days",
  graceSplit: "Investment \xB7 Loan prep",
  // goals
  totalSaved: "Total saved",
  remainingGoal: "Still to save",
  funds: "Funds",
  perMonth: "+{n}/mo",
  noGoals: "No goals yet",
  noGoalsSub: "Tap + to add one.",
  savedSoFar: "Saved so far",
  ofN: "of {n}",
  monthlyAmount: "Monthly amount",
  goals: "Goals",
  surplus: "Surplus {n}",
  pot: "A savings pot: no goals, it just collects its monthly amount.",
  cashOnHand: "Cash on hand",
  progress: "Progress",
  goal: "Goal",
  details: "Details",
  goalAmount: "Goal amount",
  targetDate: "Target date",
  setAside: "Set aside",
  alreadyPaid: "Already paid",
  deleteGoal: "Delete goal",
  deleteGoalQ: 'Delete the goal "{name}" and its expenses?',
  deletedGoal: "Deleted goal: {name}",
  expenses: "Expenses",
  nothingPaid: "Nothing paid yet",
  addExpense: "Add expense",
  editExpense: "Edit expense",
  deleteExpense: "Delete expense",
  deleteExpenseQ: 'Delete "{item}" ({amount} {cur})?',
  addedExpense: "Added {amount} {cur} to {name}",
  updatedExpense: "Updated {item}: {amount} {cur}",
  deletedExpense: "Deleted expense: {item}",
  expenseGone: "That expense changed meanwhile: nothing was saved.",
  expenseDefault: "Expense",
  newGoal: "New goal",
  fund: "Fund",
  newFund: "New fund\u2026",
  fundName: "Fund name",
  emoji: "Emoji",
  goalName: "Goal name",
  goalExists: "A goal named {name} already exists.",
  fundExists: "A fund with that name already exists.",
  addedGoal: "Goal added: {name} ({amount} {cur})",
  addedFund: 'New fund "{name}" added; set its monthly amount on the fund page.',
  updatedGoal: "{what}: {value}",
  noTarget: "No date",
  // log
  leftThisMonth: "Left this month",
  income: "Income",
  saved: "Saved",
  spent: "Spent",
  today: "Today",
  yesterday: "Yesterday",
  tomorrow: "Tomorrow",
  dailyBudget: "Daily budget",
  leftOfN: "{left} left of {total}",
  spentOfN: "{spent} / {quota}",
  thisMonth: "This month",
  savings: "Savings",
  fixedExpenses: "Fixed expenses",
  extraExpenses: "Extra expenses",
  paidN: "{n} of {m} paid",
  noMonth: "Nothing set up for {month}",
  noMonthSub: "Start a day in this month (or tap a day in Calendar); the month is set up with it.",
  needMonth: "No month note yet for {month}. Start a day in this month first.",
  openToday: "Open Today",
  chooseMonth: "Choose a month",
  month: "Month",
  year: "Year",
  go: "Show",
  totalIncome: "Total income",
  noIncome: "No income yet",
  oneOff: "One-off",
  recurringBonus: "Yearly bonus",
  thisMonthOnly: "This month only",
  skipped: "Skipped",
  addIncome: "Add income",
  incomeKind: "What kind?",
  kOneOff: "One-off",
  kOneOffSub: "Only this month",
  kBonus: "Yearly bonus",
  kBonusSub: "Every year in a month",
  kBase: "Change salary",
  kBaseSub: "From this month on",
  whichMonth: "Month (1\u201312)",
  newDefault: "New amount",
  skipMonth: "Skip this month",
  removeIncome: "Remove",
  removedX: "Removed {name}",
  skippedX: "{name} skipped for {month}",
  savedX: "{name}: {amount} {cur}",
  bonusSaved: "Yearly bonus saved: {name} \xB7 {month} \xB7 {amount} {cur}",
  baseChanged: "{name}: {from} \u2192 {to} {cur} from {month}",
  setAsideMonth: "Set aside this month",
  investThisMonth: "Investment this month",
  fixedThisMonth: "Fixed this month",
  markedPaid: "{name} marked paid",
  markedUnpaid: "{name} marked unpaid",
  paidThisMonth: "Paid this month",
  paidAmount: "Paid amount",
  defaultAmount: "Default amount",
  notPaid: "Not paid yet",
  extraTotal: "One-time expenses",
  noExtra: "No extra expenses this month",
  monthlyEntry: "Monthly entry",
  removeEntry: "Remove monthly entry",
  days: "Days",
  leftInBudget: "Left in budget",
  overBudget: "Over budget",
  quota: "Quota",
  used: "Used",
  quotaPct: "Quota ({pct}%)",
  backToPct: "Back to {pct}%",
  nothingSpent: "Nothing spent in this group yet.",
  notStarted: "Not started",
  // day page
  chooseDay: "Choose a day",
  noDay: "Nothing logged on this day",
  noDaySub: "Starting the day creates its daily note (and the month note, on a month's first day).",
  startDay: "Start This Day",
  dayStarted: "{date} started",
  spentOnDay: "Spent this day",
  groupN: "Group {n}",
  leftMonthN: "{left} left this month",
  noItems: "No items",
  oneTime: "One-time",
  openNote: "Open the note",
  resetZero: "Reset to 0",
  remove: "Remove",
  add: "Add",
  cOther: "+ Other",
  cItem: "Item",
  what: "Name of the expense",
  whatHint: "e.g. Haircut, Taxi, Desk lamp",
  needName: "Enter a name",
  addOneTime: "One-time expense",
  addOneTimeSub: "Something that is not one of your daily items. Name it here, type the amount on the next page.",
  addedTo: "Added {amount} {cur} to {name}",
  // daily items
  dailyItems: "Daily items",
  noGroups: "No budget groups yet",
  newGroup: "New group",
  groupSub: "A share of what is left after savings and fixed expenses",
  share: "Share",
  pctTotal: "Total {n}%",
  over100: "Groups add up to {n}%, keep them at 100% or less",
  itemsSaved: "Daily items saved",
  nameAndShare: "Name and share",
  shareHint: "Of the money left to spend",
  items: "Items",
  itemsHint: "Every day page lists these. Tap an item to remove it.",
  addItem: "Add item",
  itemExists: "{name} is already an item",
  removeItem: "Remove {name}?",
  removeItemSub: "Days that have an amount keep it (shown as one-time).",
  deleteGroup: "Delete group",
  deleteGroupSub: "Delete {name} and its items from the daily items? Past days keep their amounts.",
  // redesign C
  cLeftMonth: "Left to spend this month",
  cPlanGap: "Plan is {gap} {dir} the salary",
  cPlanOver: "over",
  acTitle: "Accounts",
  acSeeWhere: "Where the money is, by bank",
  acTotal: "In the accounts \xB7 {cur}",
  acPlanned: "Planned",
  acPlannedN: "{n} planned, not moved yet",
  acOfTarget: "{pct}% of {target}",
  acEntriesN: "{n} entries",
  acEntry1: "1 entry",
  acEntries: "Entries",
  acFree: "Free to spend",
  acSetAside: "Set aside",
  acEveryday: "Everyday",
  acSaving: "Saving",
  acInvesting: "Investing cash",
  acThen: "then {n}",
  acUnknown: "Entries for unknown accounts",
  acNone: "No accounts yet: add them in Config/Accounts.md.",
  acNote: "Balances are the sum of the entries in Config/Accounts.md. A wrong balance gets an adjust entry; old entries are never edited. Holdings (shares) are on Invest.",
  acOpening: "Opening",
  acAdjust: "Adjust",
  acExpense: "Expense",
  acDeposit: "Deposit",
  acTransfer: "Transfer",
  acBuy: "Buy",
  acSell: "Sell",
  acFee: "Fee",
  living: "Living",
  livingSub: "Bills, daily groups, one-offs",
  cPlanUnder: "under",
  cDrag: "Drag \xB7 {n} / {m}",
  cSpentToday: "Spent today",
  cLeftToday: "Left today",
  cMonth: "Month",
  cClosed: "Closed",
  cWhereWent: "Where it went",
  cNoNotes: "No notes this month",
  cOut: "Out",
  cLeft: "Left",
  cBudgetLeft: "Budget \xB7 {n} left",
  cAddExpense: "Add expense",
  cADay: "\u2248 {n} a day",
  cLeftOf: "left of {n}",
  cOverBy: "{n} over",
  cOfN: "of {n}",
  cDailyBudget: "Daily budget",
  cThisMonth: "This month",
  cSalaryPlan: "Salary plan",
  cPlanAddsUp: "Adds up to your salary",
  cBillsOneOffs: "Bills and one-offs",
  cBillsSub: "{p} of {n} bills paid \xB7 {e} one-off",
  cSalaryMonth: "Salary this month",
  cPlanCheck: "Adds up to your salary. A line turns orange when it does not.",
  cPlanCheckOff: "The lines are {gap} {dir} your salary.",
  cFixedBills: "Fixed bills \xB7 {p} of {n} paid",
  cOneOffs: "One-off spending",
  cNoOneOffs: "Nothing one-off this month",
  cAddOneOff: "Add one-off",
  cBillsSubN: "{p} of {n} bills paid \xB7 {e} one-offs",
  cMore: "More",
  cAll: "All",
  cRemaining: "Still to pay back",
  cPaidPct: "{n}% paid",
  dFirstPay: "First payment",
  dEachMonth: "Each month from then",
  dEachMonthNow: "Each month",
  dPaidSoFar: "Paid so far",
  dYears: "What's left, year by year",
  dYearsNote: "Debt left at the end of each year if you pay {n} a month.",
  dYearsNoteNow: "Debt left at the end of each year if you pay {n} a month. Orange = this year.",
  dSaved: "Saved for it so far",
  dSavedSub: "Loan details",
  dPayments: "Payments",
  cPaid: "Paid",
  cPaidTotal: "Paid so far",
  cCount: "Payments",
  cDaysToStart: "Days to start",
  cPayoff: "Paid off \xB7 {when}",
  cNoPayoff: "No payoff at this pace",
  cPayments: "{n} payments",
  cPayment1: "1 payment",
  cOwedToYou: "Owed to you \xB7 {cur}",
  cYouOwe: "You owe \xB7 {cur}",
  cOpenN: "{n} open",
  cAllActivity: "All activity",
  cMoreN: "{n} more",
  cPeople: "People",
  lSettleUp: "Settle up",
  lSettledN: "{n} settled",
  lOwesYouN: "{name} owes you",
  lYouOweN: "You owe {name}",
  lOpenSince: "Open since",
  lBalAfter: "then owes you {n}",
  lBalAfterZero: "then settled",
  lBalAfterNeg: "then you owe {n}",
  cYouOweShort: "\u2039 You owe",
  cOwedShort: "Owed to you \u203A",
  cWhoOwes: "Who owes whom",
  cOwedAll: "Owed to you, all in",
  cOweAll: "You owe, all in",
  cOwesYou: "Owes you",
  cYouOweThem: "You owe them",
  cThey: "They",
  cThem: "them",
  sPaidFor: "You paid for {name}",
  sPaidBy: "{name} paid for you",
  sPaidToMe: "{name} paid you back",
  sPaidToThem: "You paid {name} back",
  cScrubHint: "Hold a tile and drag up or down to change it \xB7 tap to type",
  cSaved: "Saved for your goals",
  cOfTarget: "{n}% of target",
  cNextGoals: "Next goals",
  gEachMonth: "Saving each month",
  gComingUp: "Coming up",
  gOnTrack: "On track",
  gShort: "Short {n}",
  gAMonth: "{n} a month",
  gNext: "next {name} {date}",
  gNoGoalYet: "no goal yet",
  gTargetPct: "target {target} \xB7 {pct}%",
  gAllDone: "All covered",
  gDoneBy: "All done by",
  gNever: "Never at 0",
  gGoalTotal: "Its goals",
  gInOrder: "Goals in the order they fill",
  gNoDate: "{pct}% \xB7 no date",
  gSayOnTrack: "On track: {fund}'s {m} a month covers it by {date}.",
  gSayCovered: "Covered: {fund} already holds it.",
  gSayShort: "Short {n} on {date}: {fund} needs {per} a month (now {m}).",
  gSayNoDate: "No date set: {pct}% is set aside so far.",
  gAccounts: "Accounts \xB7 {n} in {b} banks",
  cTarget: "Target",
  cSurplus: "Surplus",
  cMonthly: "Monthly",
  cAddTo: "Add to it",
  cSetTo: "Replace",
  cNow: "Now",
  cAlready: "Already {n}",
  cNewTotal: "New total",
  cNewTotalToday: "New total for today",
  cClear: "Clear",
  cDelete: "Delete",
  cTypeAmount: "Type an amount first.",
  cNext: "Next",
  cTypeNew: "type the new amount",
  cLimit: "Monthly limit",
  cLimitOf: "{name} limit",
  cLimitPct: "{pct}% of the money left to spend",
  cLimitFixed: "Fixed for this month (usually {pct}%)",
  cLimitBack: "Use the share again",
  cLimitNote: "How much {name} may spend in {month}. Normally it is {pct}% of the money left to spend after savings and fixed costs; a number typed here is used for this month only.",
  cPerDayLeft: "Per day left",
  cVsPace: "Spent \xB7 the line is where you should be today",
  nwTitle: "Net worth",
  nwSub: "Every tab added up",
  nwLabel: "Net worth \xB7 {cur}",
  nwHave: "You have",
  nwOwe: "You owe",
  nwParts: "Made of",
  nwFunds: "Goal funds",
  nwInvest: "Investments",
  nwLoanSavings: "Loan savings",
  nwFriends: "Friends",
  nwDebt: "Debt",
  nwNote: "Spending money of the month and bank balances are not tracked, so they are not in it.",
  iHoldings: "What you hold is worth",
  iHoldingsT: "Holdings",
  iHoldingsN: "Holdings \xB7 {n}",
  iMixLink: "Mix",
  fMapLink: "Map",
  fLatest: "LATEST \u203A",
  fTapeLoad: "LOADING TAPE",
  fDay: "DAY",
  fThin: "THIN: ~{n} lots a day, few cells",
  fMapAll: "\u2039 ALL",
  fMapIn: "{n} SMALL TILES",
  fMapWlSrc: "WATCHLIST \xB7 LIVE",
  fMapPick: "{k} {p} \xB7 {s}% of the weight \xB7 gives {g}",
  fMapSmall: "{n} small ones",
  fMapOpenFold: "tap again to open them",
  fMapOpen: "tap again for its chart",
  fMapToday: "TODAY",
  fLastSession: "LAST SESSION {d} (today's fills after the close)",
  fMapT: "Market map",
  fCandle: "Candle",
  fFoot: "Footprint",
  fHeat: "Heat",
  fPress: "BOOK",
  fBids: "BIDS",
  fAsks: "ASKS",
  fSrcFugle: "FUGLE TAPE",
  fSrcMis: "MIS 5 S FROM {t} (no Fugle key)",
  fWait: "Waiting for trades",
  fClosed: "Market closed: the tape fills from 09:00",
  fSectors: "SECTORS",
  fWatch: "WATCHLIST",
  fMapSrc: "TWSE SECTORS \xB7 LIVE 10 S",
  fMapWait: "Loading",
  fMapSec: "{u} of {n} up \xB7 weighted {p} \xB7 {k} gives {s}",
  fMapSize: "size = trading value {d} \xB7 colour = today's % (\xB13 % full) \xB7 tap a tile",
  fMapWl: "{u} of {n} up \xB7 weighted by what you hold {p}",
  fMapWlSize: "size = what you hold \xB7 tap a tile, again for its chart",
  fOrders: "MARKET ORDERS \xB7 NET BUY \u2212 SELL PER 5 MIN",
  fBuyHeavy: "BUY-HEAVY",
  fSellHeavy: "SELL-HEAVY",
  iTodayChg: "{v} \xB7 {p} today",
  iGainLoss: "Net gain / loss",
  iSinceBought: "since bought",
  iWatchN: "Watchlist \xB7 {n}",
  mktTitle: "Market",
  mktWait: "Loading the session",
  iCashWait: "Cash waiting to invest",
  iToBuy: "Still to buy this month",
  iMixT: "Mix vs your target",
  iTargetN: "target {n}%",
  iSharesN: "{n} shares",
  iMoreN: "{n} more",
  iAll: "All",
  iNoneHeld: "Nothing held yet",
  sPlaceholder: "Ticker or name",
  sCancel: "CANCEL",
  sRecent: "RECENT",
  sClear: "CLEAR",
  sNone: "No match: Enter opens it anyway",
  sHeld: "HELD",
  sWatch: "WATCHING",
  iPricing: "Prices\u2026",
  iPL: "Net profit",
  iCash: "Cash to invest",
  iNone: "No holdings yet",
  iNoneSub: "Record a trade to start; prices load by themselves.",
  iMix: "Mix \xB7 target \xB1{n}%",
  iCount: "{n} tickers",
  iCount1: "1 ticker",
  iPlan: "This month \xB7 {n} to buy",
  iWatch: "Watchlist",
  iWatchNone: "Nothing watched",
  iSort: "Sort",
  iSortManual: "Manual",
  iSortPct: "Chg %",
  iSortName: "Name",
  iSortAsc: "ascending",
  iSortDesc: "descending",
  iMktTw: "TW",
  iMktUs: "US",
  iWatchAdd: "Watch",
  iWatchRemove: "Stop watching",
  iWatchRemoveQ: "Remove {tk} from the watchlist?",
  iFind: "Find a ticker",
  iFindGo: "Show chart",
  iWatching: "On the watchlist",
  iWatchingS: "Its chart settings are kept in its note",
  iWatchAddS: "Keep it on the watchlist",
  fTitle: "{tk} flows",
  fRowK: "\u4E09\u5927\u6CD5\u4EBA",
  fToday: "{w} \xB7 {d} \xB7 \u5F35",
  fRun: "Run",
  fRunB: "{n} bought",
  fRunS: "{n} sold",
  fHeldD: "{d} \xB7 own {own} \xB7 hedging {hedge} \xB7 net {net}",
  fHeldW: "{d} \xB7 bought {b} \xB7 sold {s} \xB7 net {net}",
  fDaysK: "Days bought / sold",
  fDaysS: "in the last {n} days",
  fBS: "bought {b} \xB7 sold {s}",
  fOwn: "Own trading",
  fHedgeK: "Hedging",
  fHedgeEtf: "market making",
  fBought: "Bought",
  fSold: "Sold",
  bTitle: "{tk} brokers",
  bTopK: "Top brokers",
  bForeignK: "Foreign brokers",
  bFailed: "Could not read the broker list",
  bNoneForeign: "None in the top 15",
  bNoneS: "for these days",
  bLoading: "Loading the top brokers",
  bSource: "Top 15 buying and selling branches, from Fubon's \u4E3B\u529B\u9032\u51FA page. FOREIGN: branches of foreign banks and brokers, mostly foreign money.",
  bDay1: "1 day",
  bAll: "All",
  bForeign: "Foreign",
  bBuyers: "Top buyers",
  bSellers: "Top sellers",
  bBranches: "Branches",
  bCost: "Buyers' cost",
  bSum: "Top 15 \xB7 {span} \xB7 {d} \xB7 \u5F35",
  bSumF: "Foreign branches \xB7 {span} \xB7 {d} \xB7 \u5F35",
  bBuying: "Bought most \xB7 buy / sell \xB7 share of volume",
  bSelling: "Sold most \xB7 buy / sell \xB7 share of volume",
  bRowS: "{b} / {s} \xB7 {p}%",
  fDays: "{n} days",
  fF: "\u5916\u8CC7",
  fT: "\u6295\u4FE1",
  fD: "\u81EA\u71DF\u5546",
  fFEn: "Foreign",
  fTEn: "Trusts",
  fDEn: "Dealers",
  fBuyN: "bought {n} days",
  fSellN: "sold {n} days",
  fBuy1: "bought",
  fSell1: "sold",
  fFlat: "flat",
  fHedge: "hedging",
  fHeld: "{d} \xB7 \u5916\u8CC7 {f} \xB7 \u6295\u4FE1 {t} \xB7 \u81EA\u71DF\u5546 {dd}",
  fLoading: "Loading \u6CD5\u4EBA flows",
  fLots: "\u5F35",
  fLoadingS: "20 trading days from TWSE; then once a day after 15:00.",
  fNone: "Taiwan listings only",
  fNoneS: "TWSE reports \u6CD5\u4EBA flows for listed stocks (.TW).",
  iWorth: "Worth now",
  iCost: "Cost",
  iRealized: "Realized",
  iClosed: "Sold out",
  iShares: "Shares",
  iAvg: "Avg \xB7 {cur}",
  iMonth: "1 month \xB7 {price} {c}",
  iMonthCh: "1 month {p}",
  iTrades: "Trades",
  iTrade: "Trade",
  iAsset: "Asset",
  iNewAsset: "+ New",
  iYouPay: "You pay",
  iYouGet: "You get",
  iHoldN: "you hold {n}",
  iLive: "LIVE",
  fundNameHint: "e.g. \u{1F3D6} Trip (an emoji first is its icon)",
  iFeeNote: "Taiwan broker fee: 0.1425 % of {gross}, rounded down, at least 20. Less if your broker gives a discount: drag or tap it.",
  iFeeNoteX: "Not worked out for this market: enter what your broker charged.",
  iTaxNote: "Securities tax on a sale: {pct} for a {what}, rounded down.",
  iStock: "stock",
  iSettleNote: "The cash moves {when} (weekends and holidays skipped); until then the trade shows as pending.",
  iTicker: "Ticker",
  iCurrency: "Currency",
  iBucket: "Bucket",
  iType: "Buy or sell",
  iBuy: "Buy",
  iSell: "Sell",
  iPrice: "Price per share",
  iFx: "{cur} per 1 unit (optional)",
  iFee: "Broker fee (optional)",
  iTax: "Tax (optional)",
  iSettled: "Settles on (optional)",
  iFeeN: "fee {n}",
  iPending: "settles later",
  iBooked: "Written in Accounts",
  iBooksOff: "Accounts off by {n}",
  iNotBooked: "not in Accounts",
  iPlanT: "Plan",
  iBroker: "Broker",
  iDcaAmount: "Monthly buy, {cur} (empty = none)",
  iDcaDay: "Day of the month",
  iNextBuy: "next buy {d}",
  iDetails: "Plan and journal",
  iNoBroker: "no broker",
  iDcaN: "{n} on day {day}",
  iNoDca: "no monthly buy",
  iFeesPaid: "fees paid {n}",
  iFees: "Fees paid",
  iWhy: "Why (goes in its journal, optional)",
  iWhyNote: "What you think",
  iThought: "Add thought",
  iJournal: "Journal",
  iJournalNone: "nothing written yet",
  iOpenNote: "Open the note",
  iRules: "Rules",
  iRulesNow: "Breaking a rule now",
  iRulesOk: "nothing, all rules kept",
  iRulesT: "Your rules",
  iWarn1: "1 warning",
  iWarnN: "{n} warnings",
  iWarnCap: "{tk} is {n} over the single-stock cap",
  iWarnMixOver: "{b} is {n}% over its target",
  iWarnMixUnder: "{b} is {n}% under its target",
  iWarnReason: "{tk}: no reason in its journal",
  iRuleCap: "Single-stock cap",
  iRuleCapS: "most cost held in one stock (single_stock_cap)",
  iRuleMix: "Mix",
  iRuleMixS: "a bucket this far from its target (rebalance_threshold)",
  iRuleReason: "A reason for each holding",
  iRuleReasonS: "at least one line in its journal",
  iAsOf: "prices {t}",
  iLastPrice: "Last price",
  iNowPrice: "Current price",
  chgToday: "Today",
  liveOn: "{m} trading",
  liveOff: "{m} opens {t}",
  liveClosed: "{m} closed \xB7 {w}",
  whyHoliday: "Holiday",
  whyTyphoon: "Typhoon",
  whyNoTrade: "No trading",
  whyEarly: "Early close",
  iAllHeld: "All holdings \xB7 {n}",
  chgProfit: "Profit",
  iToday: "{n} ({p}) today",
  iYouHold: "You hold",
  iAvgCost: "Average cost",
  iDashed: "dashed line",
  iValueNow: "Value now",
  iChartSet: "CHART",
  close: "Close",
  dTitle: "Chart settings \xB7 {tk}",
  dSavedIn: "Saved in {path}",
  dFibShown: "Fib levels shown",
  dFibNote: "Orange levels get the shaded band (50\u201361.8%). 127.2 and up are extensions past the high.",
  dDrawing: "Drawing",
  dSnap: "Snap to candle high / low",
  dSnapS: "Swing points land exactly",
  dCost: "Show my average cost",
  dCostS: "Dashed line on every chart",
  dMa: "Moving average",
  dMaN: "{n} days",
  dMaOff: "off",
  dAddNote: "+ Add note to journal",
  iExists: "Already there.",
  iTooMany: "You hold {n}.",
  iSaved: "{what} {n} \xD7 {tk} saved.",
  iUpdated: "{tk} trade updated.",
  iDeleteTrade: "Delete trade",
  iDeleteTradeQ: "Delete the trade of {n} \xD7 {tk} on {date}?",
  cPerMonth: "{n} a month",
  settings: "Settings",
  // settings
  sDataFolder: "Data folder",
  sDataFolderDesc: "Config notes.",
  sLogFolder: "Log folder",
  sLogFolderDesc: "Daily and month notes.",
  sCurrency: "Base currency",
  sCurrencyDesc: "e.g. TWD.",
  sTaiwan: "Taiwan market",
  sTaiwanDesc: "4\u20136 digit tickers are TWSE.",
  sFugle: "Fugle API key",
  sFugleDesc: "Live Taiwan prices. This device only.",
  sStartup: "Open on start-up",
  sStartupDesc: "",
  sFullScreen: "Full screen on phones",
  sFullScreenDesc: "Hide Obsidian's toolbars.",
  sLook: "Look",
  sBigNumber: "Big number",
  sBigNumberDesc: "",
  sDots: "Flip-dot board",
  sFlap: "Split-flap tiles",
  sMove: "Page move",
  sMoveDesc: "Opening a page and Back.",
  sMoveSlide: "Slide over",
  sMovePush: "Push across",
  sMoveWipe: "Wipe in steps",
  sMoveFade: "Cross-fade",
  sMoveCascade: "Rows in turn",
  sCalm: "Calm motion",
  sCalmDesc: "No moves or flips.",
  sModules: "Tabs",
  sModulesDesc: "Drag to reorder. Switch: show.",
  sDebug: "Debug log",
  sDebugDesc: "For bug reports.",
  sDebugPath: "Debug log file",
  // long-term tools (2026-11-10): thesis card, rules check before a buy, monthly revenue, alerts
  thHead: "Thesis",
  thEdit: "Edit",
  thTitle: "Thesis",
  thWrite: "Write the thesis",
  thWhy: "Why",
  thWhyPh: "Why you watch or hold it",
  thCheck: "Next check",
  thCheckNote: "The day you look again (a report, the revenue). The card turns loud 7 days before.",
  thHold: "Must hold",
  thHoldPh: "What must be true that day",
  thSell: "Sell if",
  thSellPh: "When you would sell it",
  thDays: "in {n} days",
  thDidHold: "{d}: did it hold?",
  thYes: "Yes",
  thNo: "No",
  thHeldJ: "Check {d}: it held. {what}",
  thNotHeldJ: "Check {d}: it did not hold. {what}",
  thVs: "vs {b} since {d}",
  thVsNone: "vs {b}: loading",
  thVsShort: "vs {b}",
  bcTitle: "Before you buy \xB7 {tk}",
  bcMet: "{n} of {of} met",
  bcNote: "The rules are met.",
  bcNoteOpen: "{n} not written yet. You can still go on.",
  bcWrite: "Write thesis",
  bcGo: "Continue",
  rkThesis: "Thesis written",
  rkSell: "Sell rule written",
  rkCap: "Room under the cap",
  rkBatch: "Batch",
  rkEmergency: "Emergency fund \u2265 {e}",
  rkLimit: "Limit price",
  rkSat: "Satellites vs {b}",
  rsThesis: "Why and the next check",
  rsSell: "When you would sell it",
  rsCap: "{n} left under the cap",
  rsCapFree: "ETFs and bonds have no cap",
  rsBatch: "{n} of {of} \xB7 about {per}",
  rsBatchFree: "ETFs: buy on the plan",
  rsEmergency: "{n} in the emergency account",
  rsNone: "No emergency account found",
  rsLimit: "No chasing: set the price first",
  rsLimitNote: "Your limit price. The trade sheet starts with it.",
  rsSat: "Single stocks since bought",
  rvMet: "Met",
  rvNot: "Not yet",
  rvWrite: "Write it",
  rvSet: "Set",
  rvTile: "Revenue",
  rvTitle: "{tk} revenue",
  rvYoy: "YoY",
  rvMonth: "{m} revenue",
  rvVs: "vs {m}",
  rvBars: "{n} months",
  rvCompared: "Compared",
  rvLast3: "Last 3 months",
  rvYearAgo: "vs a year ago",
  rvYtd: "This year so far",
  rvYtdS: "Jan\u2013{m} vs {y}",
  rvBest: "Best month in {n}",
  rvNext: "Next out",
  rvNextS: "{m} \xB7 by the 10th",
  rvNone: "No revenue yet",
  rvNoneS: "Loading from FinMind. Taiwan stocks only.",
  rvSrc: "FinMind monthly revenue \xB7 NT$ \xB7 consolidated",
  alTitle: "Alerts",
  alLink: "Alerts",
  alAll: "All",
  alPrices: "Prices",
  alDates: "Dates",
  alPushOn: "ntfy \xB7 on",
  alPushOff: "ntfy \xB7 off",
  alComing: "Coming",
  alSent: "Sent \xB7 last 7 days",
  alSentV: "Sent",
  alNone: "Nothing coming",
  alNew: "New alert",
  alEdit: "Price alert",
  alKind: "When",
  alBelow: "At or below",
  alAbove: "At or above",
  alPriceNote: "Sent once a day when the price reaches it.",
  alRemove: "Remove alert",
  alRemoveQ: "Remove the alert for {tk} at {p}?",
  alPriceK: "{tk} {k} {p}",
  alNoPrice: "No price yet",
  alAway: "Now {now} \xB7 {n}% away",
  alToday: "Today",
  alRevK: "Revenue out \xB7 {tk}",
  alRevS: "Last month's revenue, by the 10th",
  alReportK: "{q} report deadline",
  alReportS: "Every listed company",
  alExdivK: "Ex-dividend \xB7 {tk}",
  alExdivS: "{n} a share",
  alThesisK: "Thesis check \xB7 {tk}",
  alThesisS: "Did it hold?",
  alFoot: "Checked every minute while Ledgerline runs; dates from 08:00. Pushes need a topic in Config/Alerts.md.",
  alSentPrice: "{tk} {k} {p} (now {now})",
  alSentReport: "{q} report deadline today",
  alSentExdiv: "{tk} goes ex-dividend today ({n} a share)",
  alSentThesis: "Thesis check {tk}: {what}",
  alSentRevenue: "{tk} {m} revenue out: {yoy} YoY"
};
var t = (k, v) => v ? en[k].replace(/\{(\w+)\}/g, (m, x) => x in v ? String(v[x]) : m) : en[k];

// src/alerts.ts
var ALERTS_FILE = "Alerts";
var EXDIV_KEY = "ledgerline-exdiv";
var NTFY = "https://ntfy.sh";
var AlertWatch = class {
  constructor(plugin) {
    this.plugin = plugin;
    this.exdiv = { day: "", rows: [] };
    this.sending = false;
    try {
      this.exdiv = plugin.app.loadLocalStorage(EXDIV_KEY) ?? this.exdiv;
    } catch {
    }
    plugin.revenue.onChange((code) => {
      void this.revenueOut(code);
      return true;
    });
  }
  path() {
    return this.plugin.store.path(ALERTS_FILE);
  }
  read() {
    return readAlerts(this.plugin.store.fm(this.path()));
  }
  // the tickers the date alerts follow: holdings and the watchlist; Taiwan codes for revenue and ex-dividend
  followed() {
    const { store, prices } = this.plugin;
    const P = buildPortfolio(store.fm(store.path(FILES.invest)), () => null, () => 1);
    const all = [.../* @__PURE__ */ new Set([...P.positions.filter((p) => p.shares > 0).map((p) => p.ticker), ...P.watch])];
    return { all, tw: all.filter((tk) => !!Flows.code(prices.symbol(tk))) };
  }
  exDivs() {
    return this.exdiv.rows;
  }
  coming(day = today()) {
    const f = this.followed(), rv = this.plugin.revenue;
    const codes = new Set(f.tw.map((tk) => Flows.code(this.plugin.prices.symbol(tk)) ?? tk));
    const theses = f.all.map((tk) => ({ tk, th: readThesis(this.plugin.store.fm(journalPath(tk))) })).filter((x) => x.th?.check).map((x) => ({ ticker: x.tk, check: x.th.check, hold: x.th.hold }));
    return comingDates(day, { tw: f.tw.filter((tk) => !/^00\d/.test(tk)), exdiv: this.exdiv.rows.filter((e) => codes.has(e.code)), theses, revOut: new Set(f.tw.filter((tk) => rv.isOut(Flows.code(this.plugin.prices.symbol(tk)) ?? tk, day))) });
  }
  // once a minute (main.ts)
  async tick() {
    const { prices, revenue } = this.plugin;
    const A = this.read(), day = today(), now = /* @__PURE__ */ new Date();
    prices.track(A.alerts.map((a) => prices.symbol(a.ticker)));
    for (const a of A.alerts) {
      const p = prices.price(a.ticker);
      if (p === null || !hit(a, Math.round(p * 100))) continue;
      await this.send(`price:${a.id}:${day}`, t("alSentPrice", { tk: a.ticker, k: t(a.kind === "below" ? "alBelow" : "alAbove").toLowerCase(), p: (a.price / 100).toLocaleString(void 0, { minimumFractionDigits: 2 }), now: p.toLocaleString(void 0, { minimumFractionDigits: 2 }) }));
    }
    const f = this.followed();
    for (const tk of f.tw) {
      const c = Flows.code(prices.symbol(tk));
      if (c && !/^00\d/.test(c)) revenue.ensure(c);
    }
    if (this.exdiv.day !== day) void this.loadExDiv(day);
    if (now.getHours() < 8) return;
    for (const d of this.coming(day).filter((x) => x.date === day && x.kind !== "revenue")) {
      const text2 = d.kind === "report" ? t("alSentReport", { q: d.what }) : d.kind === "exdiv" ? t("alSentExdiv", { tk: d.ticker, n: (d.cash ?? 0) / 100 }) : t("alSentThesis", { tk: d.ticker, what: d.what });
      await this.send(`${d.kind}:${d.ticker}:${d.date}`, text2);
    }
  }
  async revenueOut(code) {
    const tk = this.followed().tw.find((x) => Flows.code(this.plugin.prices.symbol(x)) === code);
    const s2 = revStats(this.plugin.revenue.get(code));
    if (!tk || !s2) return;
    const m = (/* @__PURE__ */ new Date(`${s2.latest.ym}-15T12:00:00Z`)).toLocaleDateString("en-US", { month: "long" });
    await this.send(`revenue:${tk}:${s2.latest.ym}`, t("alSentRevenue", { tk, m, yoy: s2.yoy === null ? "-" : `${s2.yoy >= 0 ? "+" : "\u2212"}${Math.abs(s2.yoy).toFixed(1)}%` }));
  }
  async loadExDiv(day) {
    this.exdiv.day = day;
    try {
      const r = await (0, import_obsidian7.requestUrl)({ url: "https://openapi.twse.com.tw/v1/exchangeReport/TWT48U_ALL", throw: false });
      if (r.status === 200) {
        this.exdiv = { day, rows: fromTwt48u(r.json) };
        this.plugin.app.saveLocalStorage(EXDIV_KEY, this.exdiv);
      }
    } catch {
    }
  }
  // sent once per key: kept in the note (7 days), a notice here, a push through ntfy with a topic
  async send(key, text2) {
    if (this.sending) return;
    const A = this.read();
    if (A.sent.some((s2) => s2.key === key)) return;
    this.sending = true;
    try {
      const day = today(), stamp = `${shortDate(day)} ${(/* @__PURE__ */ new Date()).toTimeString().slice(0, 5)}`;
      await this.plugin.store.update(this.path(), (f) => {
        f.sent = [...keepSent(readAlerts(f).sent, day), { key, date: day, text: `${stamp} \xB7 ${text2}` }];
      });
      new import_obsidian7.Notice(text2, 1e4);
      if (A.topic) await (0, import_obsidian7.requestUrl)({ url: `${NTFY}/${encodeURIComponent(A.topic)}`, method: "POST", body: text2, headers: { Title: "Ledgerline", Tags: "chart_with_upwards_trend" }, throw: false }).catch(() => null);
    } finally {
      this.sending = false;
    }
  }
};

// src/prices/flow.ts
var import_obsidian8 = require("obsidian");

// src/calc/flow.ts
var sideOf = (p, bid, ask) => {
  if (ask > 0 && p >= ask) return 1;
  if (bid > 0 && p <= bid) return -1;
  if (bid > 0 && ask > 0) {
    const mid = (bid + ask) / 2;
    return p > mid ? 1 : p < mid ? -1 : 0;
  }
  return 0;
};
var twTick = (p) => p < 1e3 ? 1 : p < 5e3 ? 5 : p < 1e4 ? 10 : p < 5e4 ? 50 : p < 1e5 ? 100 : 500;
var nums = (s2, f) => String(s2 ?? "").split("_").filter(Boolean).map((x) => f(Number(x))).filter((x) => x > 0);
var parseMisSnap = (a) => {
  if (!a) return null;
  const v = Number(a.v), at = Number(a.tlong);
  if (!(v >= 0) || !(at > 0)) return null;
  const tr = a.trade;
  const z = Number(a.z) > 0 ? Number(a.z) : Number(tr?.z) > 0 ? Number(tr?.z) : 0;
  const P = (x) => Math.round(x * 100);
  return { at, v, z: P(z), bids: nums(a.b, P), bq: nums(a.g, Math.round), asks: nums(a.a, P), aq: nums(a.f, Math.round) };
};
var misStep = (prev, cur) => {
  if (!prev || cur.at <= prev.at || !cur.z) return null;
  const q = cur.v - prev.v;
  if (q <= 0) return null;
  return { t: cur.at, p: cur.z, q, side: sideOf(cur.z, prev.bids[0] ?? 0, prev.asks[0] ?? 0) };
};
var fugleTrade = (r) => {
  const p = Math.round(Number(r?.price) * 100), q = Math.round(Number(r?.size)), us = Number(r?.time);
  if (!(p > 0) || !(q > 0) || !(us > 0)) return null;
  return { t: Math.round(us / 1e3), p, q, side: sideOf(p, Math.round(Number(r?.bid) * 100) || 0, Math.round(Number(r?.ask) * 100) || 0) };
};
var toBars = (trades, minuteOf, mins = 1) => {
  const out = [];
  const key = (ms) => {
    const m = minuteOf(ms), n = Number(m.slice(0, 2)) * 60 + Number(m.slice(3, 5)), k = n - n % mins;
    return `${String(Math.floor(k / 60)).padStart(2, "0")}:${String(k % 60).padStart(2, "0")}`;
  };
  for (const tr of [...trades].sort((a, b) => a.t - b.t)) {
    const m = key(tr.t);
    let b = out[out.length - 1];
    if (!b || b.m !== m) {
      b = { m, o: tr.p, h: tr.p, l: tr.p, c: tr.p, v: 0, d: 0, cells: /* @__PURE__ */ new Map() };
      out.push(b);
    }
    b.h = Math.max(b.h, tr.p);
    b.l = Math.min(b.l, tr.p);
    b.c = tr.p;
    b.v += tr.q;
    b.d += tr.side * tr.q;
    const c = b.cells.get(tr.p) ?? { b: 0, a: 0 };
    if (tr.side > 0) c.a += tr.q;
    else if (tr.side < 0) c.b += tr.q;
    else {
      c.a += tr.q / 2;
      c.b += tr.q / 2;
    }
    b.cells.set(tr.p, c);
  }
  return out;
};
var group = (cells, step) => {
  const g = /* @__PURE__ */ new Map();
  for (const [p, c] of cells) {
    const k = Math.floor(p / step) * step, x = g.get(k) ?? { b: 0, a: 0 };
    x.b += c.b;
    x.a += c.a;
    g.set(k, x);
  }
  return g;
};
var pocOf = (cells) => {
  let best = null, bv = -1;
  for (const [p, c] of [...cells].sort((x, y) => x[0] - y[0])) {
    const v = c.a + c.b;
    if (v > bv) {
      bv = v;
      best = p;
    }
  }
  return best;
};
var valueArea = (cells, share = 0.7) => {
  const ks = [...cells.keys()].sort((a, b) => a - b);
  if (!ks.length) return null;
  const vol = (k) => {
    const c = cells.get(k);
    return c.a + c.b;
  };
  const tot = ks.reduce((s2, k) => s2 + vol(k), 0), poc = pocOf(cells);
  let lo = ks.indexOf(poc), hi = lo, inV = vol(poc);
  while (inV < tot * share && (lo > 0 || hi < ks.length - 1)) {
    const up = hi < ks.length - 1 ? vol(ks[hi + 1]) : -1, dn = lo > 0 ? vol(ks[lo - 1]) : -1;
    if (up >= dn) {
      hi++;
      inV += up;
    } else {
      lo--;
      inV += dn;
    }
  }
  return { poc, val: ks[lo], vah: ks[hi] };
};
var imbalances = (cells, step, ratio = 3, min = 20) => {
  const buy = /* @__PURE__ */ new Set(), sell = /* @__PURE__ */ new Set();
  for (const [p, c] of cells) {
    const below = cells.get(p - step), above = cells.get(p + step);
    if (below && c.a >= min && c.a >= ratio * Math.max(1, below.b)) buy.add(p);
    if (above && c.b >= min && c.b >= ratio * Math.max(1, above.a)) sell.add(p);
  }
  return { buy, sell };
};
var stacked = (rows, step, n = 3) => {
  const ks = [...rows].sort((a, b) => a - b);
  let best = null, s2 = 0;
  for (let i = 0; i < ks.length; i++) {
    if (i && ks[i] - ks[i - 1] !== step) s2 = i;
    if (i - s2 + 1 >= n && (!best || ks[i] - ks[s2] > best[1] - best[0])) best = [ks[s2], ks[i]];
  }
  return best;
};
var dayCells = (bars2) => {
  const g = /* @__PURE__ */ new Map();
  for (const b of bars2) for (const [p, c] of b.cells) {
    const x = g.get(p) ?? { b: 0, a: 0 };
    x.b += c.b;
    x.a += c.a;
    g.set(p, x);
  }
  return g;
};
var parseMi5 = (json) => {
  const j = json;
  if (j?.stat !== "OK" || !Array.isArray(j.data) || !j.data.length) return null;
  const n = (s2) => Number(String(s2).replace(/,/g, "")) || 0;
  const t2 = [], net = [];
  let last = null;
  for (const r of j.data) {
    const hm2 = String(r[0]).slice(0, 5), slot = Number(hm2.slice(3, 5)) % 5 === 0 && String(r[0]).slice(6) === "00";
    const cur = [n(r[2]), n(r[4])];
    if (!last) {
      last = cur;
      continue;
    }
    if (!slot) continue;
    t2.push(hm2);
    net.push(cur[0] - last[0] - (cur[1] - last[1]));
    last = cur;
  }
  const d = String(j.date ?? "");
  return t2.length ? { date: /^\d{8}$/.test(d) ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}` : "", t: t2, net } : null;
};
var parseBfiamu = (json) => {
  const out = {};
  for (const r of json?.data ?? []) {
    const k = String(r[0] ?? "").trim(), v = Number(String(r[2] ?? "").replace(/,/g, ""));
    if (k && v > 0) out[k] = v;
  }
  return out;
};
var treemap = (items2, x, y, w, h2) => {
  const out = [], list5 = items2.filter((i2) => i2.w > 0).sort((a, b) => b.w - a.w);
  const tot = list5.reduce((s2, i2) => s2 + i2.w, 0);
  if (!list5.length || w <= 0 || h2 <= 0) return out;
  const k = w * h2 / tot;
  const worst = (row2, side) => {
    const sum = row2.reduce((s2, a) => s2 + a, 0), mx = Math.max(...row2), mn = Math.min(...row2);
    return Math.max(side * side * mx / (sum * sum), sum * sum / (side * side * mn));
  };
  let i = 0;
  while (i < list5.length) {
    const side = Math.min(w, h2), row2 = [list5[i].w * k];
    let j = i + 1;
    while (j < list5.length && worst([...row2, list5[j].w * k], side) <= worst(row2, side)) {
      row2.push(list5[j].w * k);
      j++;
    }
    const sum = row2.reduce((s2, a) => s2 + a, 0), thick = sum / side;
    let at = 0;
    row2.forEach((a, n) => {
      const len = a / thick, it = list5[i + n];
      out.push(w >= h2 ? { it, x, y: y + at, w: thick, h: len } : { it, x: x + at, y, w: len, h: thick });
      at += len;
    });
    if (w >= h2) {
      x += thick;
      w -= thick;
    } else {
      y += thick;
      h2 -= thick;
    }
    i = j;
  }
  return out;
};
var foldSmall = (items2, area, minArea) => {
  const list5 = [...items2].filter((i) => i.w > 0).sort((a, b) => b.w - a.w), tot = list5.reduce((s2, i) => s2 + i.w, 0);
  const small = list5.filter((i) => i.w / tot * area < minArea);
  return small.length >= 2 ? { keep: list5.filter((i) => !small.includes(i)), small } : { keep: list5, small: [] };
};

// src/prices/flow.ts
var FUGLE2 = "https://api.fugle.tw/marketdata/v1.0/stock/intraday";
var MIS = "https://mis.twse.com.tw/stock/api/getStockInfo.jsp";
var taipeiDay = (ms = Date.now()) => new Date(ms + 8 * 36e5).toISOString().slice(0, 10);
var SECTORS = [
  ["t01", "\u6C34\u6CE5"],
  ["t02", "\u98DF\u54C1"],
  ["t03", "\u5851\u81A0"],
  ["t04", "\u7D21\u7E54\u7E96\u7DAD"],
  ["t05", "\u96FB\u6A5F\u6A5F\u68B0"],
  ["t06", "\u96FB\u5668\u96FB\u7E9C"],
  ["t08", "\u73BB\u7483\u9676\u74F7"],
  ["t09", "\u9020\u7D19"],
  ["t10", "\u92FC\u9435"],
  ["t11", "\u6A61\u81A0"],
  ["t12", "\u6C7D\u8ECA"],
  ["t14", "\u5EFA\u6750\u71DF\u9020"],
  ["t15", "\u822A\u904B"],
  ["t16", "\u89C0\u5149\u9910\u65C5"],
  ["t17", "\u91D1\u878D\u4FDD\u96AA"],
  ["t18", "\u8CBF\u6613\u767E\u8CA8"],
  ["t20", "\u5176\u4ED6"],
  ["t21", "\u5316\u5B78"],
  ["t22", "\u751F\u6280\u91AB\u7642"],
  ["t23", "\u6CB9\u96FB\u71C3\u6C23"],
  ["t24", "\u534A\u5C0E\u9AD4"],
  ["t25", "\u96FB\u8166\u9031\u908A"],
  ["t26", "\u5149\u96FB"],
  ["t27", "\u901A\u4FE1\u7DB2\u8DEF"],
  ["t28", "\u96FB\u5B50\u96F6\u7D44\u4EF6"],
  ["t29", "\u96FB\u5B50\u901A\u8DEF"],
  ["t30", "\u8CC7\u8A0A\u670D\u52D9"],
  ["t31", "\u5176\u4ED6\u96FB\u5B50"]
];
var BFI = { \u822A\u904B: "\u822A\u904B\u696D", \u96FB\u8166\u9031\u908A: "\u96FB\u8166\u53CA\u9031\u908A\u8A2D\u5099" };
var Flow = class {
  constructor(prices, key, store) {
    this.prices = prices;
    this.key = key;
    this.store = store;
    this.tapes = /* @__PURE__ */ new Map();
    this.want = /* @__PURE__ */ new Map();
    // symbol → pages asking
    this.subs = /* @__PURE__ */ new Set();
    this.busy = /* @__PURE__ */ new Set();
    // a listed stock's sector (TWSE OpenAPI t187ap03_L: 產業別 = the sector index's number, 2330 → 24 半導體), fetched once a
    // week and kept on the device; OTC stocks and ETFs have none
    this.ind = null;
    // index quotes (a sector and TAIEX) for the chart pages that show them, every 5 s while one is on screen
    this.idx = /* @__PURE__ */ new Map();
    // code (t24, t00) → today's %
    this.idxWant = /* @__PURE__ */ new Map();
    this.idxSubs = /* @__PURE__ */ new Set();
    this.pend = /* @__PURE__ */ new Set();
    this.timer = 0;
    this.streamed = /* @__PURE__ */ new Set();
    // every 5 s while asked: one MIS call for the watched stocks (book, pressure; without Fugle their tape too) and, with the
    // map on screen, the sectors; MI_5MINS every 5 minutes
    this.n = 0;
    // the market map: sectors live from MIS (every 10 s), sized by the last day's trading value (BFIAMU)
    this.sectors = [];
    this.mi5 = null;
    this.mapOn = 0;
    this.mapSubs = /* @__PURE__ */ new Set();
    this.weights = {};
    this.wDay = "";
    MIS_ROWS.fn = (rows) => this.bgRows(rows);
    prices.onTrade = (sym, raw) => {
      const tp = this.tapes.get(sym), tr = fugleTrade(raw);
      if (!tp || tp.src !== "fugle" || !tr || taipeiDay(tr.t) !== tp.day || tr.t < (tp.cut ?? 0)) return;
      const last = tp.trades[tp.trades.length - 1];
      if (last && tr.t < last.t) return;
      tp.trades.push(tr);
      this.told(sym);
    };
  }
  // the background's 5-second MIS rows (prices/index.ts, every Taiwan holding and watched ticker while the market trades):
  // each stock keeps its tape from the moment the app opened, not only from when its chart page opened
  bgRows(rows) {
    for (const a of rows) {
      const c = String(a.c ?? ""), ex = String(a.ex ?? "");
      if (!/^\d{4,6}[A-Z]?$/.test(c)) continue;
      const sym = `${c}.${ex === "otc" ? "TWO" : "TW"}`;
      this.ingest(sym, a, this.ensure(sym));
    }
  }
  ensure(sym) {
    const day = taipeiDay();
    let tp = this.tapes.get(sym);
    if (!tp || tp.day !== day) {
      tp = { day, trades: [], src: this.key() ? "fugle" : "mis", since: Date.now(), snap: null, press: [], filled: false };
      this.tapes.set(sym, tp);
    }
    return tp;
  }
  // one MIS row: a newer snapshot adds the lots traded since the last one (MIS tapes) and a book pressure point
  ingest(sym, a, tp) {
    const snap = parseMisSnap(a);
    if (!snap || tp.snap && snap.at <= tp.snap.at) return;
    if (tp.src === "mis") {
      const tr = misStep(tp.snap, snap);
      if (tr && taipeiDay(tr.t) === tp.day) tp.trades.push(tr);
    }
    tp.snap = snap;
    const bq = snap.bq.reduce((x, y) => x + y, 0), aq = snap.aq.reduce((x, y) => x + y, 0);
    if (bq + aq > 0) {
      tp.press.push({ t: snap.at, v: (bq - aq) / (bq + aq) });
      if (tp.press.length > 3300) tp.press.shift();
    }
    this.told(sym);
  }
  tape(symbol) {
    return this.tapes.get(symbol) ?? null;
  }
  sectorOf(symbol) {
    if (!this.ind) {
      try {
        this.ind = this.store?.load("ledgerline-sectors") ?? null;
      } catch {
        this.ind = null;
      }
    }
    if ((!this.ind || Date.now() - this.ind.at > 7 * 864e5) && !this.busy.has("ind")) void this.loadInd();
    const m = /^(\d{4,6}[A-Z]?)\.TW$/.exec(symbol), n = m ? this.ind?.by[m[1]] : void 0, code = n ? `t${n.padStart(2, "0")}` : "";
    const name = SECTORS.find(([c]) => c === code)?.[1];
    return name ? { code, name } : null;
  }
  async loadInd() {
    this.busy.add("ind");
    try {
      const r = await (0, import_obsidian8.requestUrl)({ url: "https://openapi.twse.com.tw/v1/opendata/t187ap03_L", throw: false });
      const rows = r.status === 200 ? r.json : null;
      if (!Array.isArray(rows) || !rows.length) return;
      const by = {};
      for (const x of rows) if (x.\u516C\u53F8\u4EE3\u865F && x.\u7522\u696D\u5225) by[String(x.\u516C\u53F8\u4EE3\u865F).trim()] = String(x.\u7522\u696D\u5225).trim();
      this.ind = { at: Date.now(), by };
      try {
        this.store?.save("ledgerline-sectors", this.ind);
      } catch {
      }
      this.idxTold();
    } catch {
    } finally {
      this.busy.delete("ind");
    }
  }
  follow(codes, fn) {
    codes.forEach((c) => this.idxWant.set(c, (this.idxWant.get(c) ?? 0) + 1));
    this.idxSubs.add(fn);
    if (!this.timer) {
      this.timer = window.setInterval(() => this.tick(), 5e3);
      this.tick();
    }
    return () => {
      codes.forEach((c) => {
        const n = (this.idxWant.get(c) ?? 1) - 1;
        if (n > 0) this.idxWant.set(c, n);
        else this.idxWant.delete(c);
      });
      this.idxSubs.delete(fn);
      if (!this.want.size && !this.mapOn && !this.idxWant.size) this.stopTimer();
    };
  }
  idxTold() {
    for (const f of [...this.idxSubs]) if (!f()) this.idxSubs.delete(f);
  }
  // charts on screen hear about new trades or a new book (at most every 0.3 s); false = gone
  on(fn) {
    this.subs.add(fn);
  }
  told(sym) {
    if (this.pend.has(sym)) return;
    this.pend.add(sym);
    window.setTimeout(() => {
      this.pend.delete(sym);
      for (const f of [...this.subs]) if (!f(sym)) this.subs.delete(f);
    }, 300);
  }
  watch(symbol) {
    if (!fugleCode(symbol)) return;
    this.want.set(symbol, (this.want.get(symbol) ?? 0) + 1);
    const tp = this.ensure(symbol);
    if (this.key() && tp.src === "mis" && !tp.trades.length) tp.src = "fugle";
    if (tp.src === "fugle" && !tp.filled) void this.fill(symbol, tp);
    if (!this.timer) {
      this.timer = window.setInterval(() => this.tick(), 5e3);
      this.tick();
    }
  }
  unwatch(symbol) {
    const n = (this.want.get(symbol) ?? 1) - 1;
    if (n > 0) this.want.set(symbol, n);
    else this.want.delete(symbol);
    if (!this.want.has(symbol) && this.streamed.delete(symbol)) this.prices.unwatch(symbol);
    if (!this.want.size && !this.mapOn && !this.idxWant.size) this.stopTimer();
  }
  stop() {
    this.want.clear();
    this.mapOn = 0;
    this.stopTimer();
    MIS_ROWS.fn = null;
  }
  stopTimer() {
    window.clearInterval(this.timer);
    this.timer = 0;
  }
  // the whole day from Fugle, once per day per stock: the stream starts at once (trades from now on), intraday/trades pages
  // back from now (500 a call, newest first; about one call a second, the free plan allows 60 a minute) and each page goes in
  // front as it comes, so the heat fills backwards to 09:00
  async fill(sym, tp) {
    const code = fugleCode(sym), k = this.key();
    if (!code || !k || this.busy.has(`fill|${sym}`)) return;
    this.busy.add(`fill|${sym}`);
    tp.cut = Date.now();
    if (!this.streamed.has(sym)) {
      this.streamed.add(sym);
      this.prices.watch(sym);
    }
    try {
      for (let off = 0; off < 5e4; off += 500) {
        const r = await (0, import_obsidian8.requestUrl)({ url: `${FUGLE2}/trades/${code}?limit=500&offset=${off}`, headers: { "X-API-KEY": k }, throw: false });
        const rows = r.status === 200 ? r.json?.data : null;
        if (!Array.isArray(rows)) {
          if (!off) tp.src = "mis";
          break;
        }
        const page3 = rows.map((x) => fugleTrade(x)).filter((x) => !!x && x.t < tp.cut && taipeiDay(x.t) === tp.day);
        const first2 = tp.trades[0]?.t ?? Infinity;
        tp.trades = [...page3.filter((x) => x.t <= first2).sort((a, b) => a.t - b.t), ...tp.trades];
        this.told(sym);
        if (rows.length < 500 || !this.want.has(sym)) break;
        await new Promise((ok) => setTimeout(ok, 1100));
      }
      tp.filled = tp.src === "fugle";
    } catch {
      if (!tp.trades.length) tp.src = "mis";
    } finally {
      this.busy.delete(`fill|${sym}`);
    }
  }
  tick() {
    if (document.hidden) return;
    const fresh = (s2) => {
      const at = this.tapes.get(s2)?.snap?.at;
      return !!at && Date.now() - at < 6e3;
    };
    const syms = [...this.want.keys()].filter((s2) => (this.prices.isOpen(s2) || !this.tapes.get(s2)?.snap) && !fresh(s2));
    const ex = syms.map((s2) => {
      const m = /^(\d{4,6}[A-Z]?)\.(TW|TWO)$/.exec(s2);
      return `${m[2] === "TWO" ? "otc" : "tse"}_${m[1].toLowerCase()}.tw`;
    });
    const mapSec = this.mapOn && (this.n % 2 === 0 || !this.sectors.length) ? SECTORS.map(([c]) => c) : [];
    const sec2 = [.../* @__PURE__ */ new Set([...mapSec, ...this.idxWant.keys()])].map((c) => `tse_${c}.tw`);
    if (this.mapOn && this.n % 60 === 0) void this.loadMi5();
    if (this.mapOn && !this.wDay) void this.loadWeights();
    this.n++;
    if (!ex.length && !sec2.length || this.busy.has("mis")) return;
    this.busy.add("mis");
    void (0, import_obsidian8.requestUrl)({ url: `${MIS}?ex_ch=${encodeURIComponent([...ex, ...sec2].join("|"))}&json=1&delay=0&_=${Date.now()}`, throw: false }).then((r) => {
      const arr5 = r.status === 200 ? r.json?.msgArray : null;
      if (!arr5) return;
      for (const a of arr5) {
        const c = String(a.c ?? "");
        if (/^t\d\d$/.test(c)) {
          const z = Number(a.z), y = Number(a.y);
          if (z > 0 && y > 0) this.idx.set(c, (z - y) / y * 100);
          if (c !== "t00") this.sector(c, a);
          continue;
        }
        const sym = syms.find((s2) => fugleCode(s2) === c), tp = sym ? this.tapes.get(sym) : null;
        if (sym && tp) this.ingest(sym, a, tp);
      }
      if (mapSec.length) this.mapTold();
      if (this.idxWant.size) this.idxTold();
    }).catch(() => void 0).finally(() => this.busy.delete("mis"));
  }
  map(on, fn) {
    this.mapOn = Math.max(0, this.mapOn + (on ? 1 : -1));
    if (fn) this.mapSubs.add(fn);
    if (on && !this.timer) {
      this.timer = window.setInterval(() => this.tick(), 5e3);
      this.tick();
    }
    if (!this.mapOn && !this.want.size && !this.idxWant.size) this.stopTimer();
  }
  mapTold() {
    for (const f of [...this.mapSubs]) if (!f()) this.mapSubs.delete(f);
  }
  sector(code, a) {
    const z = Number(a.z), y = Number(a.y), name = SECTORS.find(([c]) => c === code)?.[1] ?? code;
    const pct2 = z > 0 && y > 0 ? (z - y) / y * 100 : null;
    const w = this.weights[name] ?? 1, at = Number(a.tlong) || Date.now();
    const i = this.sectors.findIndex((s2) => s2.code === code);
    if (i < 0) this.sectors.push({ code, name, w, pct: pct2, at });
    else this.sectors[i] = { code, name, w, pct: pct2, at };
  }
  async loadWeights() {
    if (this.busy.has("bfi")) return;
    this.busy.add("bfi");
    try {
      const r = await (0, import_obsidian8.requestUrl)({ url: "https://www.twse.com.tw/rwd/zh/afterTrading/BFIAMU?response=json", throw: false });
      const v = r.status === 200 ? parseBfiamu(r.json) : {};
      if (!Object.keys(v).length) return;
      for (const [, name] of SECTORS) this.weights[name] = v[`${BFI[name] ?? name}\u985E\u6307\u6578`] ?? 1;
      this.sectors.forEach((s2) => {
        s2.w = this.weights[s2.name] ?? 1;
      });
      this.wDay = String(r.json?.date ?? taipeiDay());
      this.mapTold();
    } catch {
    } finally {
      this.busy.delete("bfi");
    }
  }
  weightsDay() {
    return this.wDay;
  }
  // the whole market's orders every 5 s (TWSE fills the file after the close; during the session it is the last day's)
  async loadMi5() {
    if (this.busy.has("mi5")) return;
    this.busy.add("mi5");
    try {
      const r = await (0, import_obsidian8.requestUrl)({ url: "https://www.twse.com.tw/rwd/zh/afterTrading/MI_5MINS?response=json", throw: false });
      const m = r.status === 200 ? parseMi5(r.json) : null;
      if (m) {
        this.mi5 = m;
        this.mapTold();
      }
    } catch {
    } finally {
      this.busy.delete("mi5");
    }
  }
};

// src/prices/brokers.ts
var import_obsidian9 = require("obsidian");

// src/calc/brokers.ts
var SPAN_PAGE = { 1: 1, 5: 2, 20: 4 };
var ent = (s2) => s2.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
var txt = (s2) => ent(s2.replace(/<[^>]*>/g, "")).trim();
var int2 = (s2) => {
  const n = Number(s2.replace(/,/g, ""));
  return Number.isFinite(n) ? Math.round(n) : NaN;
};
var hund = (s2) => {
  const n = Number(s2.replace(/[,%]/g, ""));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
};
var parseZco = (html) => {
  const d = /最後更新日：\s*(\d{4})\/(\d{1,2})\/(\d{1,2})/.exec(html);
  const out = { asOf: d ? `${d[1]}-${d[2].padStart(2, "0")}-${d[3].padStart(2, "0")}` : "", buy: [], sell: [], buyTotal: 0, sellTotal: 0, buyCost: 0, sellCost: 0 };
  for (const tr of html.split(/<tr\b/i).slice(1)) {
    const cells = [...tr.split(/<\/tr>/i)[0].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map((m) => txt(m[1]));
    if (cells[0] === "\u5408\u8A08\u8CB7\u8D85\u5F35\u6578") {
      out.buyTotal = int2(cells[1]) || 0;
      out.sellTotal = int2(cells[3]) || 0;
      continue;
    }
    if (cells[0] === "\u5E73\u5747\u8CB7\u8D85\u6210\u672C") {
      out.buyCost = hund(cells[1]);
      out.sellCost = hund(cells[3]);
      continue;
    }
    if (cells.length < 10) continue;
    const side = (c, sign) => {
      const [name, b, s2, n] = [c[0], int2(c[1]), int2(c[2]), int2(c[3])];
      return name && Number.isFinite(b) && Number.isFinite(s2) && Number.isFinite(n) ? { name, b, s: s2, net: sign * Math.abs(n), pct: hund(c[4]) } : null;
    };
    const a = side(cells.slice(0, 5), 1), z = side(cells.slice(5, 10), -1);
    if (a) out.buy.push(a);
    if (z) out.sell.push(z);
  }
  return out.buy.length || out.sell.length ? out : null;
};
var FOREIGN = /^(美商|港商|新加坡商|法商|瑞士商|德商|英商|日商|荷商|澳商|台灣摩根士丹利|摩根大通|花旗|香港上海匯豐|匯豐|麥格理|瑞銀|高盛|美林|大和國泰|野村|法銀巴黎)/;
var isForeignBroker = (name) => FOREIGN.test(name);
var brokersDue = (fetched, now) => {
  if (!fetched) return true;
  const f = new Date(fetched);
  if (f.toDateString() !== now.toDateString()) return true;
  return now.getHours() >= 16 && f.getHours() < 16;
};

// src/prices/brokers.ts
var _Brokers = class _Brokers {
  constructor(load2, save) {
    this.load = load2;
    this.save = save;
    this.st = { v: 1, items: {} };
    this.busy = /* @__PURE__ */ new Set();
    this.failed = /* @__PURE__ */ new Map();
    this.subs = /* @__PURE__ */ new Set();
    try {
      const v = this.load();
      if (v && v.v === 1 && v.items) this.st = v;
    } catch {
    }
  }
  static key(code, span) {
    return `${code}|${span}`;
  }
  get(code, span) {
    return this.st.items[_Brokers.key(code, span)]?.data ?? null;
  }
  loading(code, span) {
    return this.busy.has(_Brokers.key(code, span));
  }
  failedAt(code, span) {
    return this.failed.has(_Brokers.key(code, span));
  }
  // a listener answering false is gone and dropped; it hears the key that changed (or failed)
  onChange(fn) {
    this.subs.add(fn);
  }
  ensure(code, span) {
    const k = _Brokers.key(code, span), have = this.st.items[k];
    if (this.busy.has(k) || !brokersDue(have?.time ?? null, /* @__PURE__ */ new Date()) || Date.now() - (this.failed.get(k) ?? 0) < 10 * 60 * 1e3) return;
    this.busy.add(k);
    void (async () => {
      const r = await (0, import_obsidian9.requestUrl)({ url: `https://fubon-ebrokerdj.fbs.com.tw/z/zc/zco/zco_${code}_${SPAN_PAGE[span]}.djhtm`, throw: false }).catch(() => null);
      let data = null;
      if (r && r.status === 200) {
        try {
          data = parseZco(new TextDecoder("big5").decode(r.arrayBuffer));
        } catch {
          data = null;
        }
      }
      if (!data) {
        this.failed.set(k, Date.now());
        return;
      }
      this.failed.delete(k);
      this.st.items[k] = { time: Date.now(), data };
      const keep2 = Object.entries(this.st.items).sort((a, b) => b[1].time - a[1].time).slice(0, 60);
      this.st.items = Object.fromEntries(keep2);
      try {
        this.save(this.st);
      } catch {
      }
    })().finally(() => {
      this.busy.delete(k);
      for (const f of [...this.subs]) if (!f(k)) this.subs.delete(f);
    });
  }
};
_Brokers.KEY = "ledgerline-brokers";
var Brokers = _Brokers;

// src/prices/search.ts
var import_obsidian10 = require("obsidian");

// src/calc/search.ts
var appTicker = (sym, taiwan) => {
  const s2 = sym.trim().toUpperCase();
  return taiwan ? s2.replace(/^(\d{4,6}[A-Z]?)\.TW$/, "$1") : s2;
};
var fromTwseAll = (json) => Array.isArray(json) ? json.filter((r) => r.Code && r.Name).map((r) => [String(r.Code).trim(), String(r.Name).trim()]) : [];
var matchListed = (list5, q, n = 8) => {
  const s2 = q.trim().toUpperCase();
  if (!s2) return [];
  const score = ([c, name]) => c === s2 ? 0 : c.startsWith(s2) ? 1 : name.toUpperCase().startsWith(s2) ? 2 : name.toUpperCase().includes(s2) || !/^\d+$/.test(s2) && c.includes(s2) ? 3 : -1;
  return list5.map((x) => [x, score(x)]).filter(([, k]) => k >= 0).sort((a, b) => a[1] - b[1] || a[0][0].length - b[0][0].length || a[0][0].localeCompare(b[0][0])).slice(0, n).map(([x]) => x);
};
var fromYahooSearch = (json, taiwan) => {
  const qs = json?.quotes ?? [];
  return qs.filter((q) => q.symbol && /^(EQUITY|ETF|MUTUALFUND|INDEX)$/.test(q.quoteType ?? "")).map((q) => ({ tk: appTicker(q.symbol, taiwan), name: q.shortname ?? q.longname ?? "", ex: q.exchDisp ?? "" }));
};
var mergeHits = (...lists) => {
  const seen2 = /* @__PURE__ */ new Set(), out = [];
  for (const l of lists) for (const x of l) if (!seen2.has(x.tk)) {
    seen2.add(x.tk);
    out.push(x);
  }
  return out;
};
var pushHistory = (list5, tk, max = 10) => [tk, ...list5.filter((x) => x !== tk)].slice(0, max);

// src/prices/search.ts
var WEEK = 7 * 24 * 60 * 60 * 1e3;
var TickerSearch = class {
  constructor(load2, save, taiwan) {
    this.load = load2;
    this.save = save;
    this.taiwan = taiwan;
    this.st = { v: 1, time: 0, list: [], recent: [] };
    this.busy = false;
    try {
      const v = this.load();
      if (v && v.v === 1) this.st = v;
    } catch {
    }
  }
  keep() {
    try {
      this.save(this.st);
    } catch {
    }
  }
  recent() {
    return this.st.recent;
  }
  remember(tk, name = "") {
    this.st.recent = pushHistory(this.st.recent, tk);
    if (name) this.st.names = { ...this.st.names, [tk]: name };
    this.keep();
  }
  forget() {
    this.st.recent = [];
    this.keep();
  }
  nameOf(tk) {
    return this.st.list.find(([c]) => c === tk)?.[1] ?? this.st.names?.[tk] ?? "";
  }
  // the TWSE list, when a week old (in the background)
  warm() {
    if (this.busy || Date.now() - this.st.time < WEEK) return;
    this.busy = true;
    void (0, import_obsidian10.requestUrl)({ url: "https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL", throw: false }).then((r) => {
      const list5 = r.status === 200 ? fromTwseAll(r.json) : [];
      if (list5.length) {
        this.st.list = list5;
        this.st.time = Date.now();
        this.keep();
      }
    }).catch(() => void 0).finally(() => {
      this.busy = false;
    });
  }
  listed(q) {
    return matchListed(this.st.list, q).map(([c, name]) => ({ tk: c, name, ex: "TWSE" }));
  }
  async remote(q) {
    const s2 = q.trim();
    if (!s2 || !/[A-Za-z0-9]/.test(s2)) return [];
    const r = await (0, import_obsidian10.requestUrl)({ url: `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(s2)}&quotesCount=8&newsCount=0`, throw: false }).catch(() => null);
    return r && r.status === 200 ? fromYahooSearch(r.json, this.taiwan()) : [];
  }
};
TickerSearch.KEY = "ledgerline-search";

// src/ui/chart.ts
var import_obsidian12 = require("obsidian");

// src/calc/keffects.ts
var BREAK_PCT = 35e-4;
var LONG_PCT = 25e-4;
var LONG_X = 2;
var kScale = (mins) => Math.sqrt(Math.max(1, mins) / 5);
var broke = (o, c, s2) => o > 0 && Math.abs(c - o) / o >= BREAK_PCT * s2;
var kState = (B, mins, forming) => {
  const n = B.d.length, s2 = kScale(mins), last = forming ? n - 1 : n;
  const marks = [];
  for (let i = 0; i < last; i++) if (broke(B.o[i], B.c[i], s2)) marks.push({ i, dir: B.c[i] >= B.o[i] ? 1 : -1 });
  const out = { marks, dir: 1, body: 0, brk: false, long: false, z: null, bb: 0, past: 0, ub: null, lb: null };
  if (!forming || !n) return out;
  const o = B.o[n - 1], c = B.c[n - 1], body = Math.abs(c - o);
  out.dir = c >= o ? 1 : -1;
  out.body = body;
  out.brk = broke(o, c, s2);
  const prev = B.o.slice(Math.max(0, n - 21), n - 1).map((x, k) => Math.abs(B.c[Math.max(0, n - 21) + k] - x));
  const avg = prev.length ? prev.reduce((a, b) => a + b, 0) / prev.length : 0;
  out.long = prev.length > 0 && body >= LONG_X * avg && o > 0 && body / o >= LONG_PCT * s2;
  const bb = bollinger(B.c, 20, 2), m = bb.mb[n - 1], sd = bb.sd[n - 1], ub = bb.ub[n - 1], lb = bb.lb[n - 1];
  if (m !== null && sd !== null && ub !== null && lb !== null && sd > 0) {
    out.z = (c - m) / sd;
    out.ub = ub;
    out.lb = lb;
    out.bb = c > ub ? 1 : c < lb ? -1 : 0;
    out.past = out.bb > 0 ? (c - ub) / sd : out.bb < 0 ? (lb - c) / sd : 0;
  }
  return out;
};
var fiveMin = (B) => withTicks({ ...emptyBars(), ohlc: true, ...B.pc ? { pc: B.pc } : {} }, B, 5);

// src/ui/index.ts
var import_obsidian11 = require("obsidian");
var h = (parent, tag, cls, text2) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text2 !== void 0) e.textContent = text2;
  parent?.appendChild(e);
  return e;
};
var CJK = /[\u2e80-\u9fff\uf900-\ufaff\uff00-\uffef]+/g;
var titleText = (el, text2) => {
  el.empty();
  let at = 0;
  for (const m of text2.matchAll(CJK)) {
    if (m.index > at) el.appendText(text2.slice(at, m.index));
    h(el, "span", "zl-cjk", m[0]);
    at = m.index + m[0].length;
  }
  if (at < text2.length) el.appendText(text2.slice(at));
};
var icon = (parent, name, cls = "zl-ic") => {
  const [names, flip = ""] = name.split("|");
  const list5 = names.split(",");
  const s2 = h(parent, "span", cls);
  for (const n of list5) {
    (0, import_obsidian11.setIcon)(s2, n);
    if (s2.querySelector("svg")) break;
  }
  if (!s2.querySelector("svg")) (0, import_obsidian11.setIcon)(s2, list5[0].includes("hand") ? "hand" : "circle");
  const svg = s2.querySelector("svg");
  if (svg && flip) svg.style.transform = `scale(${flip.includes("x") ? -1 : 1}, ${flip.includes("y") ? -1 : 1})`;
  return s2;
};
var page = (title) => {
  const p = h(null, "div", "zl-page");
  const r = h(p, "div", "zl-title-row");
  titleText(h(r, "h1", "zl-title"), title);
  h(r, "div", "zl-title-acts");
  return p;
};
var group2 = (parent, title, footer) => {
  if (title) h(parent, "div", "zl-gh", title);
  const g = h(parent, "div", "zl-group");
  if (footer) h(parent, "div", "zl-gf", footer);
  return g;
};
var row = (parent, r) => {
  const el = h(parent, "div", "zl-row zl-in" + (r.onTap ? " is-tap" : "") + (r.muted ? " is-muted" : ""));
  el.style.setProperty("--i", String(parent.childElementCount - 1));
  if (r.check) {
    const c = r.check;
    const b = h(el, "button", "zl-check" + (c.on ? " is-on" : ""));
    if (c.on && c.color) b.style.background = c.color;
    if (c.on) icon(b, "check");
    b.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      c.onToggle(!c.on);
    });
  }
  if (!r.check) sprite(el, r.avatar !== void 0 ? "person" : r.icon ? pixelFor(r.icon, r.title) : rowSprite(r.title), "zl-px zl-fig-ic");
  const main = h(el, "div", "zl-row-main");
  const tt = h(main, "div", "zl-row-t", r.title);
  if (r.titleColor) tt.style.color = r.titleColor;
  if (r.sub) h(main, "div", "zl-row-s", r.sub);
  if (r.progress) {
    const bar = h(main, "div", "zl-prog zl-row-prog");
    const f = h(bar, "div", "zl-prog-f");
    f.style.width = `${Math.max(0, Math.min(100, r.progress[0]))}%`;
    f.style.background = r.progress[1];
  }
  if (r.value) {
    const v = h(el, "div", "zl-row-v", r.value);
    if (r.valueColor) v.style.color = r.valueColor;
  }
  if (r.chevron) sprite(el, "back", "zl-px zl-fig-go");
  if (r.onTap) {
    const fn = r.onTap;
    el.addEventListener("click", (e) => {
      e.preventDefault();
      fn();
    });
  }
  return el;
};
var skeleton = (title) => {
  const p = page(title);
  for (let i = 0; i < 3; i++) h(p, "div", "zl-skel");
  return p;
};
var C = { pos: "var(--zl-pos)", neg: "var(--zl-neg)", info: "var(--zl-info)", warn: "var(--zl-warn)", accent: "var(--zl-accent)", faint: "var(--zl-faint)" };
var hero = (parent, o) => {
  const card = h(parent, "div", "zl-hero");
  h(card, "div", "zl-hero-l", o.label);
  const v = h(card, "div", "zl-hero-v");
  const n = h(v, "span", "", o.value);
  if (o.color) n.style.color = o.color;
  if (o.unit) h(v, "span", "zl-hero-u", o.unit);
  if (o.sub) h(card, "div", "zl-hero-s", o.sub);
  const total = (o.split ?? []).reduce((t2, [n2]) => t2 + Math.max(0, n2), 0);
  if (total > 0) {
    const bar = h(card, "div", "zl-prog zl-split");
    for (const [n2, col] of o.split) {
      const p = h(bar, "div", "zl-prog-f");
      p.style.width = `${Math.max(0, n2) / total * 100}%`;
      p.style.background = col;
    }
  }
  if (o.progress !== void 0) {
    const bar = h(card, "div", "zl-prog");
    const fill2 = h(bar, "div", "zl-prog-f");
    fill2.style.width = `${Math.max(0, Math.min(100, o.progress))}%`;
    if (o.progressColor) fill2.style.background = o.progressColor;
  }
  if (o.items?.length) {
    const grid2 = h(card, "div", "zl-hero-items");
    for (const [l, val, col] of o.items) {
      const it = h(grid2, "div", "zl-hero-it");
      h(it, "div", "zl-hero-il", l);
      const x = h(it, "div", "zl-hero-iv", val);
      if (col) x.style.color = col;
    }
  }
  if (o.button) {
    const b = o.button;
    const btn = h(card, "button", "zl-pill zl-hero-btn", b.text);
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      b.onTap();
    });
  }
  return card;
};
var empty = (parent, o) => {
  const box = h(parent, "div", "zl-empty");
  icon(box, o.icon, "zl-empty-ic");
  h(box, "div", "zl-empty-t", o.title);
  if (o.text) h(box, "div", "zl-empty-s", o.text);
  if (o.button && o.onTap) {
    const b = h(box, "button", "zl-pill", o.button);
    const fn = o.onTap;
    b.addEventListener("click", () => fn());
  }
  return box;
};
var SERIES = ["var(--zl-s1)", "var(--zl-s2)", "var(--zl-s3)", "var(--zl-s4)", "var(--zl-s5)", "var(--zl-s6)", "var(--zl-s7)"];
var colorFor = (i) => SERIES[(i % SERIES.length + SERIES.length) % SERIES.length];
var monthBar = (parent, prev, cur, next, on) => {
  const bar = h(parent, "div", "zl-monthbar");
  let swiped = false;
  const b = (txt2, cls, step) => {
    const x = h(bar, "button", cls, txt2);
    x.addEventListener("click", (e) => {
      e.preventDefault();
      if (!swiped) on(step);
    });
  };
  b(`\u2039 ${prev}`, "zl-mb-side", -1);
  b(cur, "zl-mb-cur", 0);
  b(`${next} \u203A`, "zl-mb-side", 1);
  let x0 = 0, y0 = 0, t0 = 0, dx = 0, lock = null;
  const slide = (px, ease) => {
    for (const c of Array.from(bar.children)) {
      c.style.transition = ease ? "transform .18s cubic-bezier(.2,.8,.2,1)" : "none";
      c.style.transform = px ? `translateX(${px}px)` : "";
    }
  };
  bar.addEventListener("touchstart", (e) => {
    const t2 = e.touches[0];
    x0 = t2.clientX;
    y0 = t2.clientY;
    t0 = performance.now();
    dx = 0;
    lock = null;
    swiped = false;
  }, { passive: true });
  bar.addEventListener("touchmove", (e) => {
    const t2 = e.touches[0], mx = t2.clientX - x0, my = t2.clientY - y0;
    if (!lock && Math.hypot(mx, my) > 6) lock = Math.abs(mx) > Math.abs(my) * 0.7 ? "x" : "y";
    if (lock !== "x") return;
    e.stopPropagation();
    swiped = true;
    dx = mx;
    slide(Math.max(-90, Math.min(90, dx * 0.6)), false);
  }, { passive: true });
  const end = () => {
    if (lock !== "x") return;
    const fast = Math.abs(dx) / Math.max(1, performance.now() - t0) > 0.5 && Math.abs(dx) > 24;
    slide(0, true);
    if (Math.abs(dx) > 48 || fast) on(dx < 0 ? 1 : -1);
    window.setTimeout(() => {
      swiped = false;
    }, 50);
  };
  bar.addEventListener("touchend", end);
  bar.addEventListener("touchcancel", end);
  return bar;
};

// src/ui/keffects.ts
var KFx = class {
  constructor(plot) {
    this.plot = plot;
    this.sc = null;
    this.parts = [];
    this.cracks = [];
    this.edgeA = 0;
    this.raf = 0;
    this.t = 0;
    this.brkKey = "";
    this.bbKey = "";
    this.bbT = 0;
    this.bodyKey = "";
    this.bodyMax = 0;
    this.growT = 0;
    this.C = { up: "", dn: "", mark: "", spark: "", mut: "" };
    this.cv = document.createElement("canvas");
    this.cv.className = "zl-ch-fx";
  }
  // after each chart draw (the plot was emptied): back on top, with what the forming candle does now (null: nothing fires)
  update(sc) {
    this.plot.appendChild(this.cv);
    const st = getComputedStyle(this.plot), v = (k) => st.getPropertyValue(k).trim();
    this.C = { up: v("--zl-up"), dn: v("--zl-down"), mark: v("--zl-mark"), spark: v("--zl-spark"), mut: v("--zl-mut") };
    if (!sc) {
      this.pause();
      return;
    }
    const now = performance.now(), still = calm(), col = sc.dir > 0 ? this.C.up : this.C.dn;
    if (sc.brk && this.brkKey !== sc.key) {
      this.brkKey = sc.key;
      if (!still) for (let j = 0; j < 10; j++) this.chip(sc.x, sc.tipY, (Math.random() - 0.5) * 3, sc.dir > 0 ? -(0.5 + Math.random() * 2.2) : 0.2 + Math.random() * 1.2, col, Math.random() < 0.4 ? 3 : 2);
    }
    if (sc.bb && sc.bbY !== null && this.bbKey !== sc.key) {
      this.bbKey = sc.key;
      this.bbT = now;
      const kk = Math.max(0.2, Math.min(3, sc.past));
      if (!still) {
        this.cracks.push({ x: sc.x, y: sc.bbY, d: sc.bb, life: 1, w: 16 + kk * 16, sl: sc.slope });
        for (let j = 0, m = Math.round(10 + kk * 16); j < m; j++) {
          const a = (sc.bb > 0 ? -Math.PI / 2 : Math.PI / 2) + (Math.random() - 0.5) * 2.4, sp = 1.5 + Math.random() * (2 + kk * 2);
          this.chip(sc.x + (Math.random() - 0.5) * 10, sc.bbY, Math.cos(a) * sp, Math.sin(a) * sp, this.C.mark, Math.random() < 0.5 ? 3 : 2);
        }
      }
    }
    if (this.bodyKey !== sc.key) {
      this.bodyKey = sc.key;
      this.bodyMax = sc.body;
      this.growT = 0;
    } else if (sc.body > this.bodyMax) {
      this.bodyMax = sc.body;
      this.growT = now;
    }
    this.sc = sc;
    if (still) {
      this.edgeA = sc.edge ? sc.near : 0;
      this.paint(now);
      return;
    }
    this.t = 0;
    if (!this.raf) this.raf = requestAnimationFrame((t2) => this.frame(t2));
  }
  stop() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }
  // a pinch (or no scene): nothing animates and nothing is left drawn; the next chart draw with a scene starts again
  pause() {
    this.stop();
    this.sc = null;
    this.parts = [];
    this.cracks = [];
    this.edgeA = 0;
    const x = this.cv.getContext("2d");
    x?.clearRect(0, 0, this.cv.width, this.cv.height);
  }
  chip(x, y, vx, vy, col, s2) {
    this.parts.push({ k: "c", x, y, vx, vy, life: 1, dec: 9e-3 + Math.random() * 8e-3, col, s: s2, b: 0 });
  }
  streak(x, y, ang, sp, col) {
    this.parts.push({ k: "s", x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 1, dec: 0.028 + Math.random() * 0.03, col, s: 1, b: 0 });
  }
  growing(now) {
    return !!this.sc?.long && this.growT > 0 && now - this.growT < 1500;
  }
  frame(now) {
    this.raf = 0;
    if (!this.plot.isConnected || document.hidden) return;
    const f = this.t ? Math.max(0.2, Math.min(3, (now - this.t) / 16.7)) : 1;
    this.t = now;
    const sc = this.sc;
    if (sc && this.growing(now)) {
      const col = sc.dir > 0 ? this.C.up : this.C.dn, back = sc.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
      if (Math.random() < 0.7 * f) for (let k = 0; k < 2; k++) this.streak(sc.x + (Math.random() - 0.5) * sc.bw, sc.closeY, back + (Math.random() - 0.5) * 2.3, 2.5 + Math.random() * 5, col);
      if (Math.random() < 0.2 * f) this.chip(sc.x + (Math.random() - 0.5) * sc.bw, sc.closeY, Math.random() - 0.5, sc.dir > 0 ? 0.4 : -0.6, col, 2);
    }
    if (sc?.brk && Math.random() < 0.3 * f) this.chip(sc.x + (Math.random() - 0.5) * 3, sc.tipY + 2 * sc.dir * -1, (Math.random() - 0.5) * 0.5, Math.random() * 0.5, sc.dir > 0 ? this.C.up : this.C.dn, Math.random() < 0.3 ? 3 : 2);
    const want = sc?.edge ? now - this.bbT < 2500 ? 1 : sc.near : 0;
    this.edgeA += (want - this.edgeA) * Math.min(1, 0.12 * f);
    this.paint(now, f);
    const busy = this.parts.length || this.cracks.length || sc?.brk || this.growing(now) || Math.abs(want - this.edgeA) > 0.01;
    if (busy) this.raf = requestAnimationFrame((t2) => this.frame(t2));
  }
  paint(now, f = 1) {
    const cv = this.cv, W = this.plot.clientWidth, H = this.plot.clientHeight, d = Math.min(2, window.devicePixelRatio || 1);
    if (!W || !H) return;
    if (cv.width !== Math.round(W * d) || cv.height !== Math.round(H * d)) {
      cv.width = Math.round(W * d);
      cv.height = Math.round(H * d);
    }
    const x = cv.getContext("2d");
    if (!x) return;
    x.setTransform(d, 0, 0, d, 0, 0);
    x.clearRect(0, 0, W, H);
    const sc = this.sc, C2 = this.C;
    if (!sc) return;
    if (sc.edge && this.edgeA > 0.03) {
      x.globalAlpha = this.edgeA;
      x.strokeStyle = C2.mark;
      x.lineWidth = 1.5;
      x.beginPath();
      sc.edge.forEach(([px, py], i) => i ? x.lineTo(px, py) : x.moveTo(px, py));
      x.stroke();
      x.globalAlpha = 1;
    }
    this.cracks = this.cracks.filter((c) => c.life > 0);
    for (const c of this.cracks) {
      x.globalAlpha = Math.max(0, c.life);
      x.strokeStyle = C2.mark;
      x.lineWidth = 2;
      x.beginPath();
      for (let i = 0; i <= 8; i++) {
        const xx = c.x - c.w * 1.6 + i * c.w / 4, yy = c.y + (xx - c.x) * c.sl + (i % 2 ? -1 : 1) * c.d * (2 + i * 37 % 5);
        if (i) x.lineTo(xx, yy);
        else x.moveTo(xx, yy);
      }
      x.stroke();
      c.life -= 0.012 * f;
    }
    x.globalAlpha = 1;
    const col = sc.dir > 0 ? C2.up : C2.dn;
    if (this.growing(now) && Math.sin(now / 40) > -0.3) {
      x.fillStyle = C2.spark;
      x.fillRect(sc.x - sc.bw / 2 - 2, sc.closeY - 1, sc.bw + 4, 2);
    }
    if (sc.brk) {
      const p = calm() ? 0.5 : (Math.sin(now / 130) + 1) / 2;
      x.globalAlpha = 0.18 + 0.22 * p;
      x.fillStyle = col;
      x.fillRect(sc.x - 6 - p * 3, sc.tipY - 6 - p * 3, 12 + p * 6, 12 + p * 6);
      x.globalAlpha = 1;
      x.fillRect(sc.x - 3, sc.tipY - 3, 6, 6);
    }
    for (const p of this.parts) {
      p.vy += (p.k === "s" ? 0.09 : 0.14) * f;
      p.x += p.vx * f;
      p.y += p.vy * f;
      p.life -= p.dec * f;
      if (p.y > sc.floor - p.s && p.vy > 0) {
        p.y = sc.floor - p.s;
        p.vy *= -0.25;
        p.vx *= 0.5;
        p.b++;
      }
      x.globalAlpha = Math.max(0, Math.min(1, p.life * 1.6));
      if (p.k === "s") {
        x.strokeStyle = p.life > 0.55 ? C2.spark : p.col;
        x.lineWidth = 1.3;
        x.beginPath();
        x.moveTo(p.x, p.y);
        x.lineTo(p.x - p.vx * 2.4, p.y - p.vy * 2.4);
        x.stroke();
      } else {
        x.fillStyle = p.life > 0.35 ? p.col : C2.mut;
        x.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s);
      }
    }
    x.globalAlpha = 1;
    this.parts = this.parts.filter((p) => p.life > 0 && p.b < 2);
  }
};

// src/ui/chart.ts
var NS2 = "http://www.w3.org/2000/svg";
var AXIS = 52;
var BOTTOM = 22;
var TOP = 14;
var RANGE = /* @__PURE__ */ new Map();
var ZOOM = /* @__PURE__ */ new Map();
var PAN = /* @__PURE__ */ new Map();
var chartRange = (ticker) => RANGE.get(ticker) ?? "I";
var chartToday = (ticker) => {
  RANGE.set(ticker, "I");
  ZOOM.delete(`${ticker}|I`);
  PAN.delete(ticker);
};
var IV_LABEL = { I: "TODAY", "1m": "1", "5m": "5", "15m": "15", "30m": "30", "60m": "60", D: "D", W: "W", M: "M" };
var TOOL = /* @__PURE__ */ new Map();
var MEASURE = /* @__PURE__ */ new Map();
var HINT = { measure: "Range: tap two points to measure the move.", fib: "Fib: tap a swing low, then a swing high (or high then low).", line: "Line: tap two points; it runs on to the right edge.", level: "Level: touch and drag to a price." };
var svgEl = (p, tag, a, cls) => {
  const e = document.createElementNS(NS2, tag);
  for (const [k, v] of Object.entries(a)) e.setAttribute(k, String(v));
  if (cls) e.setAttribute("class", cls);
  p.appendChild(e);
  return e;
};
var text = (p, x, y, s2, cls, anchor = "start") => {
  const t2 = svgEl(p, "text", { x, y, "text-anchor": anchor }, cls);
  t2.textContent = s2;
  return t2;
};
var price2 = (p) => (p / 100).toLocaleString(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
var geometry = (W, H, y1, n, lo, hi) => {
  const x0 = 1, x1 = W - 2, y0 = TOP, step = (x1 - x0) / Math.max(1, n);
  return { W, H, x0, x1, y0, y1, n, step, lo, hi, x: (i) => x0 + (i + 0.5) * step, y: (p) => y1 - (p - lo) / (hi - lo || 1) * (y1 - y0), i: (x) => (x - x0) / step - 0.5, p: (y) => lo + (y1 - y) / (y1 - y0) * (hi - lo) };
};
var SHOW = {};
var LINE_ON = { mb: false, ma60: false };
var holdingChart = (parent, o) => {
  const full = !!o.full;
  Object.assign(o.prefs, SHOW);
  const box = h(parent, "div", full ? "zl-ch zl-ch-full" : "zl-ch");
  let ranges, tools, plot, note, ind;
  if (full) {
    tools = h(box, "div", "zl-ch-rail");
    const main = h(box, "div", "zl-ch-main");
    const bar = h(main, "div", "zl-ch-bar");
    h(bar, "div", "zl-ch-tk", o.ticker);
    note = h(bar, "div", "zl-ch-ohlc");
    ranges = h(bar, "div", "zl-ch-ranges");
    if (o.fullLine) {
      const r = h(main, "div", "zl-ch-indrow");
      ind = h(r, "div", "zl-ch-ind");
      o.fullLine(h(r, "div", "zl-ch-line"));
    } else ind = h(main, "div", "zl-ch-ind");
    plot = h(main, "div", "zl-ch-plot");
  } else {
    ranges = o.ladder ? document.createElement("div") : h(box, "div", "zl-ch-ranges is-seg");
    tools = o.tools === false ? document.createElement("div") : h(box, "div", "zl-ch-tools");
    if (o.chips) {
      const r = h(box, "div", "zl-ch-nrow");
      note = h(r, "div", "zl-ch-note");
      ind = h(r, "div", "zl-ch-ind is-chips");
    } else {
      ind = h(box, "div", "zl-ch-ind");
      note = h(box, "div", "zl-ch-note");
    }
    plot = h(box, "div", "zl-ch-plot");
    if (o.height === 0) box.addClass("is-fill");
    else plot.style.height = `${o.height ?? 340}px`;
    if (o.fullChart !== false) {
      const foot = h(box, "div", "zl-ch-foot");
      const link = h(foot, "button", "zl-ch-link", "FULL CHART \u203A");
      link.addEventListener("click", (e) => {
        e.preventDefault();
        openFull(box, o);
      });
    }
  }
  let cross = null, hold = 0;
  const fx = new KFx(plot);
  let waited = false;
  let lastW = 0, maxPan = 0, curWin = 0, len = 0, dayN = 0, geo = null, shown2 = null;
  const local = (e) => {
    const r = plot.getBoundingClientRect();
    return o.turned ? { x: e.clientY - r.top, y: r.right - e.clientX } : { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const put = (type, a, b) => o.memo.splice(0, o.memo.length, { id: "d1", type, a, b, hidden: false, note: "", drawn: "" });
  const tap = (x, y) => {
    const tool = TOOL.get(o.ticker);
    if (!tool || !geo || !shown2 || !shown2.B.d.length) return;
    if (!tool.a && (tool.type === "measure" ? MEASURE.has(o.ticker) : o.memo.length > 0)) {
      if (tool.type === "measure") MEASURE.delete(o.ticker);
      else o.memo.length = 0;
      draw();
      return;
    }
    const i = nearestBar(shown2.B.d.length, geo.i(x)), raw = Math.round(geo.p(y));
    const pt = { date: shown2.B.d[i], price: (tool.type === "fib" || tool.type === "line") && o.prefs.snap ? snapPrice(shown2.B, i, raw) : raw };
    if (!tool.a) {
      tool.a = pt;
      draw();
      return;
    }
    const a = tool.a;
    tool.a = null;
    if (tool.type === "measure") MEASURE.set(o.ticker, { a, b: pt });
    else put(tool.type, a, pt);
    draw();
  };
  const mins = (r) => r === "D" ? isTwSym(o.prices.symbol(o.ticker)) ? 270 : 390 : MINUTES[r] ?? 1;
  const stepTo = (r, win) => {
    RANGE.set(o.ticker, r);
    PAN.delete(o.ticker);
    if (win) ZOOM.set(`${o.ticker}|${r}`, Math.max(12, Math.round(win)));
    o.prices.refreshSeries(o.ticker, r);
    draw();
    if (pinch && fingers2.size >= 2) pinch = { d: spread().d, win: curWin };
  };
  const zoomTo = (want, x) => {
    const r = chartRange(o.ticker);
    const L2 = o.ladder, li = L2 ? L2.indexOf(r) : -1;
    if (L2 && li >= 0) {
      const day = mins("D");
      if (li < L2.length - 1 && (r === "I" ? want > dayN * 1.25 : want > WINDOW[r] * 2.5)) {
        const span = r === "I" ? day * 1.25 : want * mins(r), nr = L2[li + 1];
        stepTo(nr, nr === "I" ? void 0 : span / mins(nr));
        return;
      }
      const pr = li > 0 ? L2[li - 1] : null;
      if (pr && r !== "I" && want < (pr === "I" ? day / mins(r) : WINDOW[r] / 2.5)) {
        stepTo(pr, pr === "I" ? void 0 : want * mins(r) / mins(pr));
        return;
      }
    }
    if (!geo || !shown2 || !len) return;
    if (r === "I" && want >= dayN) {
      if (!ZOOM.has(`${o.ticker}|I`)) return;
      ZOOM.delete(`${o.ticker}|I`);
      PAN.delete(o.ticker);
      draw();
      return;
    }
    const z = zoomAt(len, shown2.k, curWin, geo.i(x), want);
    if (z.win === curWin && z.off === (PAN.get(o.ticker) ?? 0)) return;
    ZOOM.set(`${o.ticker}|${r}`, z.win);
    PAN.set(o.ticker, z.off);
    draw();
  };
  const levelAt = (y) => {
    if (!geo || !shown2 || !shown2.B.d.length) return;
    put("level", { date: shown2.B.d[shown2.B.d.length - 1], price: Math.round(geo.p(Math.max(geo.y0, Math.min(geo.y1, y)))) }, null);
    draw();
  };
  let dragLevel = false;
  let press = null;
  const settle = (go) => {
    plot.style.transition = "transform .18s ease-out";
    plot.style.transform = go ? `translateX(${go * -60}px)` : "";
    window.setTimeout(() => {
      plot.style.transition = "";
      if (!go) plot.style.transform = "";
    }, 200);
  };
  const fingers2 = /* @__PURE__ */ new Map();
  let pinch = null;
  const spread = () => {
    const [a, b] = [...fingers2.values()];
    return { d: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)), x: (a.x + b.x) / 2 };
  };
  const capture2 = (id) => {
    try {
      plot.setPointerCapture(id);
    } catch {
    }
  };
  plot.addEventListener("pointerdown", (e) => {
    if (e.target.closest?.(".zl-ch-latest")) return;
    const at = local(e);
    fingers2.set(e.pointerId, at);
    if (fingers2.size === 2) {
      fx.pause();
      window.clearTimeout(hold);
      press = null;
      cross = null;
      dragLevel = false;
      for (const id of fingers2.keys()) capture2(id);
      pinch = { d: spread().d, win: curWin };
      return;
    }
    if (fingers2.size > 2) return;
    if (TOOL.get(o.ticker)?.type === "level") {
      dragLevel = true;
      capture2(e.pointerId);
      levelAt(at.y);
      return;
    }
    press = { ...at, off: PAN.get(o.ticker) ?? 0, moved: false, pan: false };
    window.clearTimeout(hold);
    hold = window.setTimeout(() => {
      if (press && !press.moved) {
        cross = at;
        capture2(e.pointerId);
        draw();
      }
    }, 350);
  });
  plot.addEventListener("pointermove", (e) => {
    const at = local(e);
    if (fingers2.has(e.pointerId)) fingers2.set(e.pointerId, at);
    if (pinch) {
      if (fingers2.size >= 2) {
        const s2 = spread();
        zoomTo(pinch.win * pinch.d / s2.d, s2.x);
      }
      return;
    }
    if (dragLevel) {
      levelAt(at.y);
      return;
    }
    if (cross) {
      cross = at;
      draw();
      return;
    }
    if (!press || !geo) return;
    const dx = at.x - press.x, dy = at.y - press.y;
    if (!press.moved && Math.hypot(dx, dy) > 8) {
      press.moved = true;
      window.clearTimeout(hold);
      if (Math.abs(dx) > Math.abs(dy)) {
        if (o.swipe) press.swipe = true;
        else press.pan = true;
        capture2(e.pointerId);
      }
    }
    if (press.swipe) {
      press.dx = dx;
      plot.style.transform = `translateX(${dx}px)`;
      return;
    }
    if (!press.pan) return;
    const next = Math.max(0, Math.min(maxPan, Math.round(press.off + dx / geo.step)));
    if (next !== (PAN.get(o.ticker) ?? 0)) {
      PAN.set(o.ticker, next);
      draw();
    }
  });
  const lift = (e) => {
    fingers2.delete(e.pointerId);
    if (!pinch) return false;
    if (fingers2.size < 2) pinch = null;
    press = null;
    return true;
  };
  plot.addEventListener("pointerup", (e) => {
    window.clearTimeout(hold);
    if (lift(e)) return;
    if (dragLevel) {
      dragLevel = false;
      return;
    }
    const p = press;
    press = null;
    if (p?.swipe) {
      const dx = p.dx ?? 0, go = Math.abs(dx) > 50 ? dx < 0 ? 1 : -1 : 0;
      settle(go);
      if (go) o.swipe?.(go);
      return;
    }
    if (cross) {
      cross = null;
      draw();
      return;
    }
    if (p && !p.moved) tap(p.x, p.y);
  });
  plot.addEventListener("pointercancel", (e) => {
    lift(e);
    window.clearTimeout(hold);
    if (press?.swipe) settle(0);
    press = null;
    dragLevel = false;
    if (cross) {
      cross = null;
      draw();
    }
  });
  plot.addEventListener("touchmove", (e) => e.preventDefault(), { passive: false });
  plot.addEventListener("contextmenu", (e) => e.preventDefault());
  plot.addEventListener("wheel", (e) => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    zoomTo(curWin * Math.exp(e.deltaY * 0.01), local(e).x);
  }, { passive: false });
  const setShow = (p) => {
    if (p.line) LINE_ON[p.line] = !LINE_ON[p.line];
    if (p.bb !== void 0) {
      SHOW.bb = p.bb;
      o.prefs.bb = p.bb;
    }
    draw();
  };
  const draw = () => {
    const range = chartRange(o.ticker);
    ranges.empty();
    for (const r of o.ranges ?? RANGES) {
      const b = h(ranges, "button", "zl-ch-range" + (r === range ? " is-on" : ""), IV_LABEL[r]);
      b.addEventListener("click", (e) => {
        e.preventDefault();
        RANGE.set(o.ticker, r);
        PAN.delete(o.ticker);
        o.prices.refreshSeries(o.ticker, r);
        draw();
      });
    }
    const tool = TOOL.get(o.ticker);
    tools.empty();
    if (full) {
      const b = h(tools, "button", "zl-ch-tool is-back", "\u2039");
      b.setAttribute("aria-label", "Back");
      b.addEventListener("click", (e) => {
        e.preventDefault();
        o.onClose?.();
      });
    }
    const kinds = [["fib", "FIB"], ["line", "LINE"], ["level", "LEVEL"], ...full ? [["measure", "RANGE"]] : []];
    for (const [k, label] of kinds) {
      const b = h(tools, "button", "zl-ch-tool" + (tool?.type === k ? " is-on" : ""), label);
      b.addEventListener("click", (e) => {
        e.preventDefault();
        if (tool) {
          o.memo.length = 0;
          MEASURE.delete(o.ticker);
        }
        if (tool?.type === k) TOOL.delete(o.ticker);
        else TOOL.set(o.ticker, { type: k, a: null });
        draw();
      });
    }
    plot.toggleClass("is-armed", !!tool);
    o.prices.refreshSeries(o.ticker, range);
    const S = o.prices.series(o.ticker, range);
    plot.empty();
    const W = plot.clientWidth || lastW, H = full || o.height === 0 ? plot.clientHeight || lastH || 300 : o.height ?? 340;
    lastW = W;
    if (!W || !H) return;
    if (!S?.bars.d.length) {
      indicators(ind, o, { ma60: [], bb: { mb: [], ub: [], lb: [], sd: [] } }, 0, setShow);
      const wait = h(plot, "div", "zl-ch-wait");
      const row2 = h(wait, "div", "zl-ch-wait-b");
      for (let i = 0; i < 8; i++) h(row2, "i").style.animationDelay = `${i * 0.1}s`;
      waited = true;
      h(wait, "div", "zl-ch-wait-t", `LOADING ${IV_LABEL[range]}${isMinutes(range) && range !== "I" ? " MIN" : ""}`);
      note.setText(tool ? HINT[tool.type] : "\xA0");
      return;
    }
    const live = liveOf(o.prices, o.ticker);
    const raw = !live ? S.bars : range === "D" ? withLive(S.bars, live.day, live.price) : MINUTES[range] ? withLiveMinute(withTicks(S.bars, o.prices.ticks(o.ticker), MINUTES[range], range === "I"), live.at, live.price, MINUTES[range]) : S.bars;
    const all = range === "I" ? fiveMin(raw) : raw;
    if (range === "I" && live && isTwSym(o.prices.symbol(o.ticker)) && live.at.slice(11) >= "09:00" && live.day === marketMinute(o.prices.symbol(o.ticker), Date.now()).slice(0, 10) && (all.d[all.d.length - 1] ?? "").slice(0, 10) < live.day) {
      indicators(ind, o, { ma60: [], bb: { mb: [], ub: [], lb: [], sd: [] } }, 0, setShow);
      const wait = h(plot, "div", "zl-ch-wait");
      h(wait, "div", "zl-ch-wait-t", "TODAY STARTS WITH THE NEXT TRADE");
      if (!o.prices.hasFugle() && !o.ticker.startsWith("^")) h(wait, "div", "zl-ch-wait-s", "For the whole day live, add a Fugle API key in Settings.");
      note.setText("\xA0");
      return;
    }
    dayN = range === "I" ? windowOf(all, range) : 0;
    const win = range === "I" ? Math.min(dayN, ZOOM.get(`${o.ticker}|I`) ?? dayN) : Math.min(all.d.length, ZOOM.get(`${o.ticker}|${range}`) ?? windowOf(all, range));
    curWin = win;
    len = all.d.length;
    maxPan = Math.max(0, all.d.length - win);
    const off = Math.min(PAN.get(o.ticker) ?? 0, maxPan);
    const L2 = { ma60: movingAverage(all.c, 60), bb: bollinger(all.c, 20, 2) };
    const out = drawBars(plot, all, win, off, range, W, H, o, L2, cross);
    geo = out.G;
    shown2 = { k: out.k, B: out.B };
    fx.update(pinch ? null : kScene(plot, o, all, range, out.G, out.k, out.B.d.length, off, live, L2));
    if (waited) {
      waited = false;
      [...plot.children].forEach((c) => {
        c.addClass("zl-ch-in");
        c.addEventListener("animationend", () => c.removeClass("zl-ch-in"), { once: true });
      });
    }
    if (off > 0) {
      const b = h(plot, "button", "zl-ch-latest", "LATEST \u203A");
      b.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        PAN.delete(o.ticker);
        draw();
      });
    }
    const gi = out.crossI !== null ? out.k + out.crossI : out.k + out.B.d.length - 1;
    indicators(ind, o, L2, gi, setShow);
    note.toggleClass("is-hot", !!tool?.a);
    const hasDrawing = tool?.type === "measure" ? MEASURE.has(o.ticker) : o.memo.length > 0;
    if (tool) note.setText(tool.a ? "Now tap the second point." : hasDrawing ? tool.type === "level" ? "Drag to move it." : "Tap the chart to clear it." : HINT[tool.type]);
    else barLine(note, all, gi, range, o.prices.symbol(o.ticker));
  };
  let lastH = 0;
  const alive = () => o.alive ? o.alive() : box.isConnected;
  o.prices.onQuote((sym) => {
    if (!alive()) return false;
    if (!box.isConnected) return true;
    if (sym === o.prices.symbol(o.ticker) && !press && !pinch && !cross) draw();
    return true;
  });
  o.prices.onSeries((key) => {
    if (!alive()) return false;
    if (!box.isConnected) return true;
    if (key === `${o.prices.symbol(o.ticker)}|${chartRange(o.ticker)}`) draw();
    return true;
  });
  new ResizeObserver(() => {
    if (plot.clientWidth && (plot.clientWidth !== lastW || plot.clientHeight !== lastH)) {
      lastH = plot.clientHeight;
      draw();
    }
  }).observe(plot);
  draw();
  if (!full && o.fullChart !== false) watchTurn(box, o);
  const tick2 = window.setInterval(() => {
    if (!alive()) {
      window.clearInterval(tick2);
      return;
    }
    if (!box.isConnected) return;
    const r = chartRange(o.ticker);
    if (isMinutes(r) && !document.hidden) o.prices.refreshSeries(o.ticker, r);
  }, 15 * 1e3);
  return { el: box, draw };
};
var kScene = (plot, o, all, range, G, k, n, off, live, L2) => {
  const sym = o.prices.symbol(o.ticker), line = !all.ohlc, end = all.d.length - 1;
  const forming = !!live && end >= 0 && all.d[end].slice(0, 10) === live.day && o.prices.isOpen(o.ticker);
  const mins = range === "I" ? 5 : range === "D" ? isTwSym(sym) ? 270 : 390 : MINUTES[range] ?? 390 * 5;
  const st = kState(all, mins, forming);
  const svg = plot.querySelector("svg.zl-ch-svg");
  if (svg && !line) for (const m of st.marks) {
    if (m.i < k || m.i >= k + n) continue;
    const x2 = G.x(m.i - k), y = m.dir > 0 ? G.y(all.h[m.i]) - 7 : G.y(all.l[m.i]) + 3;
    svgEl(svg, "rect", { x: x2 - 2, y, width: 4, height: 4 }, (m.dir > 0 ? "zl-ch-up" : "zl-ch-down") + " zl-ch-kmark");
  }
  if (!forming || range !== "I" || off > 0 || !n || !all.d.length) return null;
  const j = all.d.length - 1, x = G.x(n - 1), dir = st.dir;
  const z = st.z ?? 0, side = st.bb || (Math.abs(z) >= 1.5 ? z > 0 ? 1 : -1 : 0);
  let edge = null, slope = 0;
  if (!line && L2.bb && side) {
    const e = side > 0 ? L2.bb.ub : L2.bb.lb, a = e[end - 1], b = e[end];
    if (a !== null && b !== null) slope = (G.y(b) - G.y(a)) / (G.step || 1);
    if (!o.prefs.bb) {
      edge = [];
      for (let i = 0; i < n; i++) {
        const v = e[k + i];
        if (v !== null) edge.push([G.x(i), G.y(v)]);
      }
    }
  }
  const bbV = side > 0 ? st.ub : side < 0 ? st.lb : null;
  return {
    key: `${o.ticker}|${range}|${all.d[j]}`,
    x,
    bw: line ? 6 : Math.max(1, Math.min(18, G.step * 0.64)),
    dir,
    tipY: dir > 0 ? G.y(all.h[j]) - 6 : G.y(all.l[j]) + 6,
    closeY: G.y(all.c[j]),
    body: st.body,
    brk: st.brk,
    long: st.long,
    bb: st.bb,
    past: st.past,
    bbY: bbV === null ? null : G.y(bbV),
    slope,
    edge,
    near: st.bb ? 1 : Math.abs(z) >= 1.5 ? Math.min(1, (Math.abs(z) - 1.3) / 0.7) : 0,
    floor: G.y1
  };
};
var volS = (v) => v >= 1e9 ? `${(v / 1e9).toFixed(1)}B` : v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1e4 ? `${(v / 1e3).toFixed(1)}K` : String(Math.round(v));
var barLine = (el, B, i, range, sym) => {
  el.empty();
  const before = i > 0 ? B.c[i - 1] : B.pc ?? null, ch = before ? B.c[i] - before : null;
  h(el, "span", "zl-ch-bl-d", dayLabel(shownD(sym, B.d[i], range), range));
  const kv = (k, v) => {
    h(el, "span", "zl-ch-bl-k", k);
    h(el, "span", "zl-ch-bl-v", price2(v));
  };
  const flat = !B.ohlc || B.o[i] === B.c[i] && B.h[i] === B.c[i] && B.l[i] === B.c[i];
  if (flat) h(el, "span", "zl-ch-bl-v", price2(B.c[i]));
  else {
    kv("O", B.o[i]);
    kv("H", B.h[i]);
    kv("L", B.l[i]);
    kv("C", B.c[i]);
  }
  if (ch !== null && before) h(el, "span", "zl-ch-bl-v zl-ch-bl-m" + (ch < 0 ? " is-hot" : ch > 0 ? " is-up" : ""), `${ch >= 0 ? "+" : "\u2212"}${(Math.abs(ch) / before * 100).toFixed(2)}%`);
};
var indicators = (el, o, L2, i, set) => {
  el.empty();
  const v = (a) => {
    const x = a?.[i];
    return x === null || x === void 0 ? "-" : price2(Math.round(x));
  };
  const cell = (cls, label, on, p, value, extra = "") => {
    if (o.chips) {
      const c = h(el, "button", `zl-ch-chip ${cls}` + (on ? " is-on" : ""));
      c.setAttribute("aria-pressed", String(on));
      h(c, "i", "zl-ch-lg-sw");
      h(c, "span", "", label === "MB 20" ? "MA20" : label.replace(" 2\u03C3", ""));
      c.addEventListener("click", (e) => {
        e.preventDefault();
        set(p);
      });
      return;
    }
    const b = h(el, "button", `zl-ch-lg ${cls}` + (on ? " is-on" : ""));
    b.setAttribute("aria-pressed", String(on));
    const top = h(b, "span", "zl-ch-lg-t");
    h(top, "i", "zl-ch-lg-sw");
    h(top, "span", "zl-ch-lg-k", label);
    if (extra) h(top, "span", "zl-ch-lg-x", extra);
    h(b, "span", "zl-ch-lg-v", value);
    b.addEventListener("click", (e) => {
      e.preventDefault();
      set(p);
    });
  };
  cell("is-mb", "MB 20", LINE_ON.mb, { line: "mb" }, v(L2.bb?.mb));
  const lb = v(L2.bb?.lb), ub = v(L2.bb?.ub), sd = v(L2.bb?.sd);
  cell("is-bb", "BB 2\u03C3", !!o.prefs.bb, { bb: !o.prefs.bb }, lb === "-" ? "-" : `${lb}\u2013${ub}`, sd === "-" ? "" : `\u03C3${sd}`);
  cell("is-ma60", "MA60", LINE_ON.ma60, { line: "ma60" }, v(L2.ma60));
};
var MON3 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var usLocal = (sym) => !isTwSym(sym) && !document.body.hasClass("zl-us-ny");
var SHOWN = /* @__PURE__ */ new Map();
var shownD = (sym, d, range) => {
  if (!isMinutes(range) || !usLocal(sym)) return d;
  let v = SHOWN.get(d);
  if (v === void 0) {
    v = shiftZone(d, "America/New_York", deviceZone());
    if (SHOWN.size > 5e3) SHOWN.clear();
    SHOWN.set(d, v);
  }
  return v;
};
var shownTime = (sym, t2) => usLocal(sym) ? new Date(t2).toLocaleTimeString("en-GB", { hour12: false }) : marketTime(sym, t2);
var shortDay = (d) => `${MON3[Number(d.slice(5, 7)) - 1]} ${Number(d.slice(8, 10))}`;
var dayLabel = (d, range) => isMinutes(range) ? `${shortDay(d)} ${d.slice(11, 16)}` : range === "M" ? `${MON3[Number(d.slice(5, 7)) - 1]} ${d.slice(0, 4)}` : `${shortDay(d)} ${d.slice(0, 4)}`;
var FULL = null;
var closeFull = () => {
  FULL?.layer.remove();
  FULL = null;
};
var openFull = (anchor, o, auto = false) => {
  closeFull();
  const turned = import_obsidian12.Platform.isMobile && !wide();
  const layer = h(document.body, "div", "zl-fchart" + (turned ? " is-turned" : "") + (anchor.closest(".theme-dark") ? " theme-dark" : ""));
  FULL = { ticker: o.ticker, layer, auto, turned, anchor, o };
  for (const t2 of ["touchstart", "touchmove", "touchend"]) layer.addEventListener(t2, (e) => e.stopPropagation(), { passive: true });
  const close = () => {
    const leave = import_obsidian12.Platform.isMobile && wide();
    closeFull();
    if (leave) o.onLeave?.();
  };
  holdingChart(layer, { ...o, full: true, turned, onClose: close });
};
var PORTRAIT = null;
var onTurn = null;
var onTurnLate = null;
var wide = () => window.innerWidth > window.innerHeight;
var chartUnload = () => {
  if (onTurn) window.removeEventListener("resize", onTurn);
  if (onTurnLate) window.removeEventListener("orientationchange", onTurnLate);
  onTurn = onTurnLate = null;
  closeFull();
  PORTRAIT = null;
};
var watchTurn = (box, o) => {
  PORTRAIT = { box, o };
  if (FULL && FULL.ticker === o.ticker && FULL.layer.isConnected) {
    const auto = FULL.auto;
    closeFull();
    openFull(box, o, auto);
  } else if (FULL && !FULL.layer.isConnected) FULL = null;
  if (!import_obsidian12.Platform.isMobile) return;
  if (!onTurn) {
    onTurn = () => {
      const p = PORTRAIT, f = FULL;
      if (wide()) {
        if (f?.turned) openFull(f.anchor, f.o, f.auto);
        else if (!f && p?.box.isConnected) openFull(p.box, p.o, true);
      } else if (f?.auto) closeFull();
      else if (f && !f.turned) openFull(f.anchor, f.o, false);
    };
    onTurnLate = () => window.setTimeout(() => onTurn?.(), 300);
    window.addEventListener("resize", onTurn);
    window.addEventListener("orientationchange", onTurnLate);
  }
  if (wide() && !FULL) requestAnimationFrame(() => {
    if (box.isConnected && wide() && !FULL) openFull(box, o, true);
  });
};
var liveOf = (prices, ticker) => {
  const q = prices.get(ticker);
  if (!q) return null;
  const at = marketMinute(prices.symbol(ticker), q.asOf ?? q.time);
  return { day: at.slice(0, 10), at, price: Math.round(q.price * 100) };
};
var sliceBars = (B, from, to) => ({ d: B.d.slice(from, to), o: B.o.slice(from, to), h: B.h.slice(from, to), l: B.l.slice(from, to), c: B.c.slice(from, to), v: B.v.slice(from, to), ohlc: B.ohlc });
var drawBars = (plot, full, win, off, range, W, H, o, L2, cross = null) => {
  const to = full.d.length - off, k = Math.max(0, to - win), B = sliceBars(full, k, to), n = B.d.length;
  const bbOn = o.prefs.bb ? L2.bb : null;
  const ma60 = LINE_ON.ma60 ? L2.ma60.slice(k, to) : [], mb = LINE_ON.mb && L2.bb ? L2.bb.mb.slice(k, to) : [], ub = bbOn?.ub.slice(k, to) ?? [], lb = bbOn?.lb.slice(k, to) ?? [];
  let lo = Math.min(...B.l), hi = Math.max(...B.h);
  for (const x of lb) if (x !== null) lo = Math.min(lo, x);
  for (const x of ub) if (x !== null) hi = Math.max(hi, x);
  const pc = range === "I" && full.pc ? full.pc : null;
  if (pc) {
    lo = Math.min(lo, pc);
    hi = Math.max(hi, pc);
  }
  const cost = o.prefs.cost && o.cost ? o.cost : null;
  if (cost && !isMinutes(range) && cost > lo * 0.7 && cost < hi * 1.3) {
    lo = Math.min(lo, cost);
    hi = Math.max(hi, cost);
  }
  const pad2 = (hi - lo) * 0.06 || hi * 0.02;
  const vol = o.volume !== false && B.v.some((v) => v > 0);
  const yb = H - BOTTOM, y1 = vol ? Math.round(TOP + (yb - TOP) * 0.74) : yb;
  const tw = isTwSym(o.prices.symbol(o.ticker)), slots = range === "I" && win >= windowOf(full, "I") ? Math.max(n, tw ? 55 : 79) : n;
  const tagW = (n ? price2(B.c[n - 1]).length : 4) * 6.6 + 8, gap = tagW + 6, span = W - 3;
  const free = n ? (slots - n) * span / Math.max(1, slots) : span;
  const sl = free >= gap || span <= gap * 2 ? slots : n + Math.ceil(gap * n / (span - gap));
  const G = geometry(W, H, y1, sl, lo - pad2, hi + pad2);
  const crossI = cross && n ? nearestBar(n, G.i(cross.x)) : null, at = crossI ?? n - 1;
  const svg = svgEl(plot, "svg", { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, "zl-ch-svg");
  const clipId = `zl-ch-clip-${o.ticker.replace(/\W/g, "")}-${Math.round(H)}`;
  const cp = svgEl(svgEl(svg, "defs", {}), "clipPath", { id: clipId });
  svgEl(cp, "rect", { x: G.x0, y: G.y0 - 6, width: G.x1 - G.x0, height: G.y1 - G.y0 + 6 });
  const inPlot = () => svgEl(svg, "g", { "clip-path": `url(#${clipId})` });
  const yLast = Math.max(G.y0, Math.min(G.y1, G.y(B.c[n - 1])));
  for (const t2 of niceTicks(G.lo, G.hi)) {
    const y = G.y(t2);
    if (y < G.y0 - 1 || y > G.y1 + 1) continue;
    svgEl(svg, "line", { x1: G.x0, x2: G.x1, y1: y, y2: y }, "zl-ch-grid");
    svgEl(svg, "line", { x1: G.x0, x2: G.x0 + 4, y1: y, y2: y }, "zl-ch-axis");
    if (Math.abs(y - yLast) >= 14 && y >= 24) text(svg, G.x0 + 7, y + 4, price2(t2), "zl-ch-yl");
  }
  text(svg, G.x0 + 7, 10, o.currency, "zl-ch-cur");
  let right = -Infinity;
  const sym = o.prices.symbol(o.ticker);
  for (const t2 of xTicks(B.d.map((d) => shownD(sym, d, range)), range)) {
    const x = G.x(t2.i), w = t2.label.length * 6.6;
    svgEl(svg, "line", { x1: x, x2: x, y1: G.y0, y2: yb }, "zl-ch-grid zl-ch-vgrid");
    svgEl(svg, "line", { x1: x, x2: x, y1: yb, y2: yb + 4 }, "zl-ch-axis");
    if (x - w / 2 >= G.x0 + 2 && x + w / 2 <= G.x1 - 2 && x - w / 2 > right + 6) {
      text(svg, x, yb + 16, t2.label, "zl-ch-xl", "middle");
      right = x + w / 2;
    }
  }
  svgEl(svg, "line", { x1: G.x0, x2: G.x0, y1: G.y0 - 6, y2: yb }, "zl-ch-axis");
  svgEl(svg, "line", { x1: G.x0, x2: G.x1, y1: yb, y2: yb }, "zl-ch-axis");
  if (vol) {
    const vt = y1 + 16, vmax = Math.max(1, ...B.v), vy = (v) => yb - v / vmax * (yb - vt - 6);
    const v5 = movingAverage(full.v, 5).slice(k, k + n), v10 = movingAverage(full.v, 10).slice(k, k + n);
    svgEl(svg, "line", { x1: G.x0, x2: G.x1, y1: y1 + 6, y2: y1 + 6 }, "zl-ch-axis");
    const vn = (x) => x === null ? "-" : volS(x);
    const vl = svgEl(svg, "text", { x: G.x0 + 4, y: vt + 2 }, "zl-ch-vl");
    for (const [k2, v, cls] of [["VOL", B.v[at], ""], ["VOL5", v5[at], "is-5"], ["VOL10", v10[at], "is-10"]]) {
      const a = svgEl(vl, "tspan", { dx: k2 === "VOL" ? 0 : 8 }, "zl-ch-vk " + cls);
      a.textContent = k2 + " ";
      const b = svgEl(vl, "tspan", {});
      b.textContent = vn(v);
    }
    const vw = Math.max(1, Math.min(18, G.step * 0.64));
    for (let i = 0; i < n; i++) {
      const ht = yb - vy(B.v[i]);
      if (ht > 0) svgEl(svg, "rect", { x: G.x(i) - vw / 2, y: yb - ht, width: vw, height: ht }, B.c[i] >= B.o[i] ? "zl-ch-up zl-ch-vol" : "zl-ch-down zl-ch-vol");
    }
    for (const [a, cls] of [[v5, "zl-ch-v5"], [v10, "zl-ch-v10"]]) {
      const pts = a.map((m2, i) => m2 === null ? "" : `${G.x(i)},${vy(m2)}`).filter(Boolean);
      if (pts.length > 1) svgEl(svg, "polyline", { points: pts.join(" ") }, cls);
    }
  }
  const path = (a) => a.map((m2, i) => m2 === null ? "" : `${G.x(i)},${G.y(m2)}`).filter(Boolean);
  if (bbOn) {
    const g = inPlot(), u = path(ub), l = path(lb);
    if (u.length > 1) {
      svgEl(g, "polygon", { points: [...u, ...l.reverse()].join(" ") }, "zl-ch-bbf");
      svgEl(g, "polyline", { points: u.join(" ") }, "zl-ch-bb");
      svgEl(g, "polyline", { points: path(lb).join(" ") }, "zl-ch-bb");
    }
  }
  const cw = Math.max(1, Math.min(18, G.step * 0.64));
  if (pc) {
    const y = G.y(pc);
    svgEl(svg, "line", { x1: G.x0, x2: G.x1, y1: y, y2: y }, "zl-ch-cost");
    text(svg, G.x1 - 4, y - 4, `prev ${price2(pc)}`, "zl-ch-dl", "end");
  }
  if (B.ohlc) for (let i = 0; i < n; i++) {
    const up = B.c[i] >= B.o[i], x = G.x(i), cls = up ? "zl-ch-up" : "zl-ch-down";
    svgEl(svg, "line", { x1: x, x2: x, y1: G.y(B.h[i]), y2: G.y(B.l[i]) }, cls + " zl-ch-wick");
    const yt = G.y(Math.max(B.o[i], B.c[i])), yb2 = G.y(Math.min(B.o[i], B.c[i]));
    svgEl(svg, "rect", { x: x - cw / 2, y: yt, width: cw, height: Math.max(1, yb2 - yt) }, cls);
  }
  else svgEl(svg, "polyline", { points: B.c.map((c, i) => `${G.x(i)},${G.y(c)}`).join(" ") }, "zl-ch-line");
  for (const [a, cls] of [[mb, "zl-ch-ma is-mb"], [ma60, "zl-ch-ma is-60"]]) {
    const pts = path(a);
    if (pts.length > 1) svgEl(inPlot(), "polyline", { points: pts.join(" ") }, cls);
  }
  if (cost) {
    const y = G.y(cost);
    if (y >= G.y0 && y <= G.y1) svgEl(svg, "line", { x1: G.x0, x2: G.x1, y1: y, y2: y }, "zl-ch-cost");
  }
  drawings(inPlot(), G, full, k, o);
  const m = MEASURE.get(o.ticker);
  if (m) {
    const g = inPlot(), ia = indexOf(full.d, m.a.date) - k, ib = indexOf(full.d, m.b.date) - k;
    const xa = G.x(ia), xb = G.x(ib), ya = G.y(m.a.price), yB = G.y(m.b.price), d = m.b.price - m.a.price;
    svgEl(g, "rect", { x: Math.min(xa, xb), y: Math.min(ya, yB), width: Math.abs(xb - xa), height: Math.abs(yB - ya) }, "zl-ch-meas");
    const label = `${d >= 0 ? "+" : "\u2212"}${price2(Math.abs(d))} (${d >= 0 ? "+" : "\u2212"}${(Math.abs(d) / m.a.price * 100).toFixed(1)}%) \xB7 ${Math.round(Math.abs(ib - ia))} bars`;
    text(g, Math.min(G.x1 - 4, Math.max(xa, xb)), Math.min(ya, yB) - 5, label, "zl-ch-dl is-loud", "end");
  }
  if (n > 1) {
    const e = extremes(B, 0, n);
    for (const [i, p, dy] of [[e.hi, B.h[e.hi], -5], [e.lo, B.l[e.lo], 13]]) {
      const x = G.x(i), endSide = x > (G.x0 + G.x1) / 2;
      text(svg, endSide ? x - 3 : x + 3, Math.max(G.y0 + 8, Math.min(G.y1 - 2, G.y(p) + dy)), price2(p), "zl-ch-dl is-ext", endSide ? "end" : "start");
    }
  }
  const last = B.c[n - 1], yl = yLast, tx = Math.min(G.x1 - tagW, G.x(n - 1) + cw / 2 + 4);
  svgEl(svg, "line", { x1: G.x0, x2: tx, y1: yl, y2: yl }, off ? "zl-ch-now is-old" : "zl-ch-now");
  svgEl(svg, "rect", { x: tx, y: yl - 9, width: tagW, height: 18 }, off ? "zl-ch-tag is-old" : "zl-ch-tag");
  text(svg, tx + 4, yl + 4, price2(last), off ? "zl-ch-tagt is-old" : "zl-ch-tagt");
  if (cross && crossI !== null) {
    const x = G.x(crossI), cy = Math.max(G.y0, Math.min(G.y1, G.y(B.c[crossI])));
    svgEl(svg, "line", { x1: x, x2: x, y1: G.y0, y2: yb }, "zl-ch-cross");
    svgEl(svg, "line", { x1: G.x0, x2: G.x1, y1: cy, y2: cy }, "zl-ch-cross");
    svgEl(svg, "rect", { x: G.x0, y: cy - 9, width: AXIS - 2, height: 18 }, "zl-ch-ctag");
    text(svg, G.x0 + 4, cy + 4, price2(B.c[crossI]), "zl-ch-ctagt");
    const dl = dayLabel(shownD(o.prices.symbol(o.ticker), B.d[crossI], range), range), dw = dl.length * 6.6 + 10, dx = Math.max(G.x0, Math.min(G.x1 - dw, x - dw / 2));
    svgEl(svg, "rect", { x: dx, y: yb + 3, width: dw, height: 17 }, "zl-ch-ctag");
    text(svg, dx + dw / 2, yb + 15, dl, "zl-ch-ctagt", "middle");
  }
  return { G, k, B, crossI };
};
var drawings = (g, G, full, k, o) => {
  const xi = (date) => G.x(indexOf(full.d, date) - k);
  const fibs = o.memo.filter((d) => d.type === "fib" && !d.hidden), newest = fibs[fibs.length - 1];
  const handle = (x, y) => svgEl(g, "rect", { x: x - 3, y: y - 3, width: 6, height: 6 }, "zl-ch-handle");
  for (const d of o.memo) {
    if (d.hidden) continue;
    const ya = G.y(d.a.price);
    if (d.type === "level") {
      svgEl(g, "line", { x1: G.x0, x2: G.x1, y1: ya, y2: ya }, "zl-ch-level");
      text(g, G.x1 - 4, ya - 4, price2(d.a.price), "zl-ch-dl", "end");
      continue;
    }
    const b = d.b, xa = xi(d.a.date), xb = xi(b.date), yb = G.y(b.price);
    if (d.type === "line") {
      const ia = indexOf(full.d, d.a.date) - k, ib = indexOf(full.d, b.date) - k, iEnd = G.i(G.x1);
      svgEl(g, "line", { x1: xa, y1: ya, x2: G.x1, y2: G.y(lineAt(ia, d.a.price, ib, b.price, iEnd)) }, "zl-ch-tline");
      handle(xa, ya);
      handle(xb, yb);
      continue;
    }
    const fg = svgEl(g, "g", {}, d === newest ? "zl-ch-fib" : "zl-ch-fib is-old");
    const L2 = fibLevels(d.a.price, b.price, o.prefs.fib), x0 = Math.min(xa, xb);
    const y50 = L2.find((l) => l.r === 0.5), y618 = L2.find((l) => Math.abs(l.r - 0.618) < 1e-9);
    if (y50 && y618) {
      const t3 = Math.min(G.y(y50.price), G.y(y618.price));
      svgEl(fg, "rect", { x: x0, y: t3, width: G.x1 - x0, height: Math.abs(G.y(y50.price) - G.y(y618.price)) }, "zl-ch-band");
    }
    const isLoud = (r) => r === 0.5 || Math.abs(r - 0.618) < 1e-9, placed = [];
    for (const l of L2) {
      const y = G.y(l.price);
      svgEl(fg, "line", { x1: x0, x2: G.x1, y1: y, y2: y }, isLoud(l.r) ? "zl-ch-fl is-loud" : "zl-ch-fl");
    }
    for (const l of [...L2].sort((p, q) => Number(isLoud(q.r)) - Number(isLoud(p.r)))) {
      const y = G.y(l.price);
      if (placed.some((py) => Math.abs(py - y) < 11)) continue;
      placed.push(y);
      text(fg, G.x1 - 4, y - 3, `${+(l.r * 100).toFixed(1)}%  ${price2(l.price)}`, isLoud(l.r) ? "zl-ch-dl is-loud" : "zl-ch-dl", "end");
    }
    svgEl(fg, "line", { x1: xa, y1: ya, x2: xb, y2: yb }, "zl-ch-leg");
    handle(xa, ya);
    handle(xb, yb);
  }
  const t2 = TOOL.get(o.ticker);
  if (t2?.a) svgEl(g, "rect", { x: xi(t2.a.date) - 4, y: G.y(t2.a.price) - 4, width: 8, height: 8 }, "zl-ch-handle is-wait");
};

// src/ui/flap.ts
var BLANK = "\xA0";
var NUM = [BLANK, ..."0123456789"];
var TXT = [BLANK, ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ", ..."0123456789"];
var isSign = (c) => c === "+" || c === "-" || c === "\u2212";
var ROLL = 500;
var STAGGER = 45;
var HANDOFF = 22;
var PER_CARD = 34;
var TILES = /* @__PURE__ */ new WeakMap();
var Flap = class {
  // direct is kept for the callers (the amount pad); every field now turns the same way
  constructor(cls = "md", pad2 = 0, _direct = false) {
    this.pad = pad2;
    this.cur = "";
    this.el = document.createElement("div");
    this.el.className = "zl-flap is-" + cls;
    this.el.addEventListener("zl-flap-replay", () => this.replay());
  }
  mk() {
    const t2 = document.createElement("span");
    t2.className = "t";
    const half = (cls, shade) => {
      const i = document.createElement("i");
      i.className = cls;
      const em = document.createElement("em");
      em.appendChild(document.createElement("u"));
      i.appendChild(em);
      if (shade) {
        const b = document.createElement("b");
        b.className = "sh";
        i.appendChild(b);
      }
      return i;
    };
    const st = half("st", false), sb = half("sb", false), fr = half("fr", true), bk = half("bk", true);
    const dr = document.createElement("b");
    dr.className = "dr";
    const lf = document.createElement("span");
    lf.className = "lf";
    lf.append(fr, bk);
    t2.append(st, sb, dr, lf);
    const x = { el: t2, st, sb, fr, bk, lf, frSh: fr.lastChild, bkSh: bk.lastChild, dr, shown: BLANK, target: BLANK, rolling: false, deadline: 0, wait: 0, gen: 0 };
    TILES.set(t2, x);
    this.show(x, BLANK);
    return t2;
  }
  // % is drawn smaller than the digits (owner, 2026-11-06: too big on the big cards), on every face it shows on
  txt(i, ch) {
    const u = i.firstChild.firstChild;
    u.textContent = ch;
    u.classList.toggle("sym", ch === "%");
  }
  stop(x) {
    [x.lf, x.frSh, x.bkSh, x.dr].forEach((e) => e.getAnimations().forEach((a) => a.cancel()));
  }
  // at rest: both halves the same character, the leaf put away
  show(x, ch) {
    const t2 = x.el;
    x.shown = ch;
    t2.dataset.ch = ch;
    t2.classList.toggle("sp", ch === " ");
    t2.classList.toggle("bl", ch === BLANK);
    const sg = isSign(ch) && t2.parentElement?.firstElementChild === t2;
    t2.classList.toggle("sg", sg);
    t2.classList.toggle("is-plus", sg && ch === "+");
    t2.classList.remove("c");
    this.stop(x);
    this.txt(x.st, ch);
    this.txt(x.sb, ch);
    x.lf.style.visibility = "hidden";
  }
  drumOf(a, b) {
    return NUM.includes(a) && NUM.includes(b) ? NUM : TXT;
  }
  remaining(x) {
    if (x.shown === x.target) return 0;
    const d = this.drumOf(x.shown, x.target), i = d.indexOf(x.shown), j = d.indexOf(x.target);
    return i < 0 || j < 0 ? 1 : (j - i + d.length) % d.length;
  }
  // one card: the leaf turns about the seam; resolves when it has landed
  turn(x, a, b, ms, last) {
    return new Promise((done) => {
      const t2 = x.el;
      t2.classList.remove("bl", "sp", "sg", "is-plus");
      this.txt(x.st, b);
      this.txt(x.sb, a);
      this.txt(x.fr, a);
      this.txt(x.bk, b);
      x.lf.style.visibility = "visible";
      const anim = x.lf.animate(
        [{ transform: "rotateX(0deg)" }, { transform: "rotateX(-180deg)" }],
        { duration: ms, easing: last ? "cubic-bezier(.25,.1,.25,1)" : "cubic-bezier(.4,0,.7,1)", fill: "both" }
      );
      x.frSh.animate([{ opacity: 0 }, { opacity: 0.55 }], { duration: ms * 0.5, fill: "both" });
      x.bkSh.animate([{ opacity: 0.5 }, { opacity: 0.5, offset: 0.5 }, { opacity: 0 }], { duration: ms, fill: "both" });
      x.dr.animate([{ opacity: 0 }, { opacity: 0.9, offset: 0.45 }, { opacity: 0, offset: 0.6 }, { opacity: 0 }], { duration: ms, fill: "both" });
      let ended = false;
      const g = x.gen;
      const end = () => {
        if (ended) return;
        ended = true;
        if (x.gen === g) this.show(x, b);
        done();
      };
      anim.onfinish = end;
      window.setTimeout(end, ms + 80);
    });
  }
  async roll(x) {
    if (x.rolling) return;
    x.rolling = true;
    const g = x.gen;
    while (x.shown !== x.target && x.gen === g) {
      const left = Math.max(0, x.deadline - performance.now());
      const fit2 = Math.max(1, Math.floor(left / PER_CARD));
      let n = this.remaining(x), next;
      const d = this.drumOf(x.shown, x.target), i = d.indexOf(x.shown), j = d.indexOf(x.target);
      if (i < 0 || j < 0) {
        next = x.target;
        n = 1;
      } else if (n > fit2) {
        next = fit2 > 1 ? d[(j - fit2 + 1 + d.length) % d.length] : x.target;
        n = fit2;
      } else next = d[(i + 1) % d.length];
      const last = n === 1;
      const unit = Math.max(0, left - n * HANDOFF) / (n - 1 + 2.2);
      await this.turn(x, x.shown, next, last ? Math.max(unit * 2.2, 60) : Math.max(unit, 4), last);
    }
    if (x.gen === g) x.rolling = false;
  }
  // the side the number leans on: right when it sits against its box's right edge (readouts, the pad), else left; before
  // layout, a fixed row of tiles (pad > 0) is a right-aligned readout
  leansRight() {
    const p = this.el.parentElement, r = this.el.getBoundingClientRect();
    if (!p || !r.width) return this.pad > 0 || p?.classList.contains("zl-read") === true;
    const q = p.getBoundingClientRect();
    return q.right - r.right < r.left - q.left;
  }
  // the appear again: every tile back to a blank card, then the value (owner, 2026-11-06: each time a page opens)
  replay() {
    if (!this.cur || calm()) return;
    const text2 = this.cur;
    for (const t2 of Array.from(this.el.children)) {
      const x = TILES.get(t2);
      if (!x) continue;
      window.clearTimeout(x.wait);
      x.gen++;
      x.rolling = false;
      const keep2 = isSign(x.shown) || x.shown === " ";
      this.show(x, keep2 ? x.shown : BLANK);
      x.target = x.shown;
    }
    this.cur = "";
    this.set(text2);
  }
  // dir "del": a delete runs from the leftmost tile (its digits move right, the left finishes first); anything else starts
  // from the side the number leans on
  set(text2, dir) {
    text2 = text2.toUpperCase();
    if (this.pad) {
      const sign = isSign(text2[0] ?? "") ? text2[0] : "", body = sign ? text2.slice(1) : text2;
      text2 = sign + body.padStart(Math.max(this.pad, this.el.children.length - sign.length), BLANK);
    }
    if (text2 === this.cur && this.el.children.length === text2.length) return;
    this.cur = text2;
    while (this.el.children.length > text2.length) this.el.firstChild?.remove();
    while (this.el.children.length < text2.length) this.el.insertBefore(this.mk(), this.el.firstChild);
    const tiles = Array.from(this.el.children).map((t2) => TILES.get(t2));
    const n = text2.length, fromLeft = dir === "del" || !this.leansRight();
    const tile = this.el.hasClass("is-xs"), still = calm(), punct = (c) => c === " " || !tile && isSign(c);
    const now = performance.now();
    let order = 0;
    for (let k = 0; k < n; k++) {
      const i = fromLeft ? k : n - 1 - k, x = tiles[i], ch = text2[i];
      if (still || punct(ch) || punct(x.shown)) {
        window.clearTimeout(x.wait);
        x.gen++;
        x.rolling = false;
        x.target = ch;
        this.show(x, ch);
        continue;
      }
      if (x.target === ch && (x.rolling || x.shown === ch)) continue;
      x.target = ch;
      if (x.shown === ch && !x.rolling) continue;
      const delay = order++ * STAGGER;
      x.deadline = now + delay + ROLL;
      if (!x.rolling) {
        window.clearTimeout(x.wait);
        x.wait = window.setTimeout(() => {
          void this.roll(x);
        }, delay);
      }
    }
  }
};

// src/ui/market.ts
var IDX = [{ tk: "^TWII", name: "TAIEX", mkt: "TW" }, { tk: "^SOX", name: "SOX", mkt: "US" }, { tk: "^IXIC", name: "NASDAQ", mkt: "US" }];
var LADDER = ["I", "5m", "15m", "60m", "D"];
var LEAD_KEY = "ledgerline-mkt-lead";
var NONE = "\xA0".repeat(6);
var CARD = null;
var TIMER = 0;
var marketCard = (parent, c) => {
  if (!CARD) CARD = build(c);
  else CARD.c = c;
  parent.appendChild(CARD.el);
  CARD.roll();
  CARD.paint();
  return CARD.el;
};
var marketUnload = () => {
  window.clearInterval(TIMER);
  TIMER = 0;
  CARD?.el.remove();
  CARD = null;
};
var open = (c, mkt, now = /* @__PURE__ */ new Date()) => marketOpen(mkt === "TW" ? "^TWII" : "^SOX", now, c.cal());
var autoLead = (c) => {
  if (open(c, "TW")) return "^TWII";
  if (open(c, "US")) return "^SOX";
  const k = marketClock("^TWII", /* @__PURE__ */ new Date());
  return k.weekday && k.min >= 13 * 60 + 30 ? "^TWII" : "^SOX";
};
var readPick = (c) => {
  try {
    const v = JSON.parse(String(c.app.loadLocalStorage(LEAD_KEY) ?? "null"));
    return v && v.auto === autoLead(c) && IDX.some((i) => i.tk === v.tk) ? v.tk : null;
  } catch {
    return null;
  }
};
var build = (c0) => {
  const el = document.createElement("div");
  el.className = "zl-c-group zl-c-fill zl-mkt";
  const tabs = h(el, "div", "zl-mkt-tabs");
  const row2 = h(el, "div", "zl-mkt-row");
  const val = h(row2, "span", "zl-mkt-v", "-");
  const f = new Flap("xs");
  row2.appendChild(f.el);
  const host = h(el, "div", "zl-mkt-ch");
  const touch = (on) => el.toggleClass("zl-touching", on);
  el.addEventListener("pointerdown", () => touch(true), true);
  for (const ev of ["pointerup", "pointercancel"]) el.addEventListener(ev, () => touch(false), true);
  const card = {
    el,
    c: c0,
    lead: "",
    gen: 0,
    roll() {
      const want = readPick(card.c) ?? autoLead(card.c);
      if (want !== card.lead) show(want);
    },
    paint() {
      const { prices } = card.c, q = prices.get(card.lead), d = card.c.chg(card.lead);
      tabs.querySelectorAll(".zl-mkt-tab").forEach((b) => {
        const i = IDX.find((x) => x.tk === b.dataset.k);
        b.toggleClass("is-on", i.tk === card.lead);
        b.toggleClass("is-live", open(card.c, i.mkt));
      });
      val.setText(q ? price2(Math.round(q.price * 100)) : "-");
      const p = d ? Math.round(d.pct * 100) / 100 : null;
      f.set(p === null ? NONE : `${p > 0 ? "+" : p < 0 ? "\u2212" : ""}${Math.abs(p).toFixed(2)}%`);
      f.el.toggleClass("is-up", !!p && p > 0);
      f.el.toggleClass("is-down", !!p && p < 0);
    }
  };
  for (const i of IDX) {
    const b = h(tabs, "button", "zl-mkt-tab");
    b.dataset.k = i.tk;
    h(b, "i", "zl-mkt-dot");
    h(b, "span", "", i.name);
    b.addEventListener("click", (e) => {
      e.preventDefault();
      pick(i.tk, IDX.findIndex((x) => x.tk === i.tk) > IDX.findIndex((x) => x.tk === card.lead) ? 1 : -1);
    });
  }
  const pick = (tk, dir) => {
    if (tk === card.lead) return;
    card.c.app.saveLocalStorage(LEAD_KEY, JSON.stringify({ tk, auto: autoLead(card.c) }));
    show(tk, dir);
  };
  const show = (tk, dir = 0) => {
    card.lead = tk;
    const gen = ++card.gen, { prices } = card.c;
    host.empty();
    prices.refresh([tk]);
    prices.refreshSeries(tk, "D");
    void prices.live(tk);
    holdingChart(host, { ticker: tk, currency: "", prices, prefs: readPrefs(null), cost: null, memo: [], height: 0, ladder: [...LADDER], chips: true, tools: false, fullChart: false, volume: false, alive: () => CARD === card && card.gen === gen });
    const ch = host.firstElementChild;
    if (ch && dir && !calm()) {
      ch.addClass(dir > 0 ? "is-in-r" : "is-in-l");
      ch.addEventListener("animationend", () => ch.removeClasses(["is-in-r", "is-in-l"]), { once: true });
    }
    prices.onQuote((sym) => {
      if (CARD !== card || card.gen !== gen) return false;
      if (sym === prices.symbol(tk) && el.isConnected) card.paint();
      return true;
    });
    card.paint();
  };
  let n = 0;
  const was = new Map(IDX.map((i) => [i.tk, open(c0, i.mkt)]));
  window.clearInterval(TIMER);
  TIMER = window.setInterval(() => {
    if (CARD !== card || !el.isConnected || document.hidden) return;
    for (const x of IDX) {
      const on = open(card.c, x.mkt);
      if (on && was.get(x.tk) === false && chartRange(x.tk) !== "I") {
        chartToday(x.tk);
        if (x.tk === card.lead) show(x.tk);
      }
      was.set(x.tk, on);
    }
    card.roll();
    const i = IDX.find((x) => x.tk === card.lead);
    if (i && (open(card.c, i.mkt) || n % 12 === 0)) void card.c.prices.live(card.lead).then((moved) => {
      if (moved) card.paint();
    });
    n++;
  }, 5e3);
  return card;
};

// src/pages/invest.ts
var import_obsidian17 = require("obsidian");

// src/calc/accounts.ts
var KINDS = ["opening", "adjust", "expense", "deposit", "transfer", "buy", "sell", "fee"];
var arr4 = (v) => (Array.isArray(v) ? v : v ? [v] : []).filter((x) => x && typeof x === "object");
var int3 = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : 0;
};
var buildAccounts = (fm, upTo) => {
  const accounts = arr4(fm?.accounts).map((a) => ({
    key: String(a.key ?? ""),
    label: String(a.label ?? a.key ?? ""),
    bank: String(a.bank ?? ""),
    line: String(a.line ?? ""),
    bucket: String(a.bucket ?? ""),
    target: int3(a.target)
  })).filter((a) => a.key);
  const entries = arr4(fm?.entries).map((e, index) => ({
    date: dateStr(e.date, ""),
    account: String(e.account ?? ""),
    amount: int3(e.amount),
    kind: KINDS.includes(e.kind) ? e.kind : "adjust",
    note: String(e.note ?? ""),
    planned: e.planned === true,
    ...e.trade ? { trade: String(e.trade) } : {},
    index
  })).filter((e) => !upTo || !e.date || e.date <= upTo);
  const list5 = accounts.map((a) => {
    const own = entries.filter((e) => e.account === a.key).sort((x, y) => y.date.localeCompare(x.date) || y.index - x.index);
    return { ...a, entries: own, balance: own.reduce((s2, e) => s2 + e.amount, 0), planned: own.filter((e) => e.planned).reduce((s2, e) => s2 + e.amount, 0) };
  });
  const banks = [];
  for (const a of list5) {
    const b = banks.find((x) => x.bank === a.bank);
    if (b) b.total += a.balance;
    else banks.push({ bank: a.bank, total: a.balance });
  }
  const keys = new Set(accounts.map((a) => a.key));
  return {
    list: list5,
    banks,
    total: list5.reduce((s2, a) => s2 + a.balance, 0),
    planned: list5.reduce((s2, a) => s2 + a.planned, 0),
    unknown: entries.filter((e) => !keys.has(e.account))
    // entries for an account that is not listed: shown, never lost
  };
};
var balanceAfter = (entries) => {
  const out = /* @__PURE__ */ new Map();
  let b = 0;
  for (const e of [...entries].sort((x, y) => x.date.localeCompare(y.date) || x.index - y.index)) {
    b += e.amount;
    out.set(e, b);
  }
  return out;
};
var purposeOf = (a) => a.bucket ? "investing" : a.line ? "saving" : "everyday";

// src/ui/flipdot.ts
var SCAN_DELAY = 30;
var SWEEP_FIRST_MS = 4;
var SWEEP_MS = 3;
var SCAN_COL_MS = 4;
var DISC_MS = 220;
var LIVE = /* @__PURE__ */ new Set();
var themeWatch = null;
var watchTheme = () => {
  if (themeWatch) return;
  themeWatch = new MutationObserver(() => {
    for (const b of LIVE) {
      if (b.el.isConnected) b.recolor();
      else LIVE.delete(b);
    }
  });
  themeWatch.observe(document.body, { attributes: true, attributeFilter: ["class"] });
};
var FlipDot = class {
  constructor(parent) {
    this.cols = 80;
    this.rows = 24;
    // readability redesign: 80 × 24 dots, 120 px high
    this.pitch = 5;
    this.cell = 4;
    this.dpr = Math.min(3, window.devicePixelRatio || 1);
    this.state = new Uint8Array(0);
    this.target = new Uint8Array(0);
    this.start = new Float64Array(0);
    this.base = new Uint8Array(0);
    this.text = null;
    this.shift = 0;
    this.want = 0;
    this.dur = 110;
    this.dragRaf = 0;
    this.running = false;
    this.ripple = null;
    this.colors = null;
    // off, on, loud (read once per change: getComputedStyle per frame stuttered)
    this.dragged = false;
    this.waits = 0;
    // While the finger is down, a scan head keeps running across the board from the left (one column every SCAN_COL_MS, each
    // column top to bottom, then from the left again). A dot that has to change turns over when the head next passes it, so the
    // moved digits show up as a sweep from the upper left to the lower right instead of everywhere at once.
    this.sweepT0 = 0;
    this.el = document.createElement("canvas");
    this.el.className = "zl-board";
    parent.appendChild(this.el);
    LIVE.add(this);
    watchTheme();
    this.el.addEventListener("zl-replay", () => this.replay());
    this.el.addEventListener("click", (e) => {
      if (this.dragged) return;
      const r = this.el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width * this.cols, y = (e.clientY - r.top) / r.height * this.rows, C2 = this.cols, R = this.rows;
      const end = Math.max(Math.hypot(x, y), Math.hypot(C2 - x, y), Math.hypot(x, R - y), Math.hypot(C2 - x, R - y)) + 2;
      this.ripple = { x, y, t: performance.now(), end };
      this.kick();
    });
    new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        this.colors = null;
        this.kick();
      }
    }).observe(this.el);
  }
  size(cols) {
    if (cols === this.cols && this.state.length) return;
    this.cols = cols;
    const n = cols * this.rows;
    this.state = new Uint8Array(n);
    this.target = new Uint8Array(n);
    this.start = new Float64Array(n).fill(-1);
    this.base = new Uint8Array(n);
    this.el.width = cols * this.pitch * this.dpr;
    this.el.height = this.rows * this.pitch * this.dpr;
  }
  bitmap(text2) {
    const k = 2, ky = 3, glyphs = [...text2].map((ch) => GLYPH[ch] ?? GLYPH[" "]);
    const w = glyphs.reduce((s2, g) => s2 + g[0].length + 1, -1) * k;
    this.size(Math.max(80, w + 6));
    const bm = new Uint8Array(this.cols * this.rows);
    let x0 = Math.floor((this.cols - w) / 2);
    const y0 = Math.floor((this.rows - 7 * ky) / 2);
    for (const g of glyphs) {
      g.forEach((row2, gy) => [...row2].forEach((p, gx) => {
        if (p !== "#") return;
        for (let a = 0; a < k; a++) for (let b = 0; b < ky; b++) {
          const x = x0 + gx * k + a, y = y0 + gy * ky + b;
          if (x >= 0 && x < this.cols && y < this.rows) bm[y * this.cols + x] = 1;
        }
      }));
      x0 += (g[0].length + 1) * k;
    }
    return bm;
  }
  shifted(s2) {
    if (!s2) return this.base;
    const out = new Uint8Array(this.base.length);
    for (let i = 0; i < out.length; i++) {
      const sc = i % this.cols - s2;
      if (sc >= 0 && sc < this.cols) out[i] = this.base[i - s2];
    }
    return out;
  }
  // scan: dir 1 sweeps left → right, -1 right → left; colMs per column, jitter = the small mechanical spread, each column top to bottom
  apply(bm, dir, colMs, jitter, dur) {
    const now = performance.now(), still = calm();
    this.dur = dur;
    for (let i = 0; i < bm.length; i++) {
      this.target[i] = bm[i];
      if (still || this.state[i] === bm[i]) {
        this.state[i] = bm[i];
        this.start[i] = -1;
        continue;
      }
      const col = i % this.cols, row2 = i / this.cols | 0, order = dir > 0 ? col : this.cols - 1 - col;
      this.start[i] = now + SCAN_DELAY + order * colMs + row2 * (colMs / this.rows) + Math.random() * jitter;
    }
    this.kick();
  }
  // Every new number, a live price tick included (owner, 2026-11-05: the odometer roll is gone), is the refresh's sweep:
  // left to right, column by column, each column top to bottom; in a column the old number's dots go dark and the new
  // one's light in the same pass, so the old number disappears as the new one shows. Every page's board uses it.
  set(text2, _dir = 1) {
    this.colors = null;
    LIVE.add(this);
    if (this.dragRaf) {
      cancelAnimationFrame(this.dragRaf);
      this.dragRaf = 0;
    }
    if (text2 === this.text && !this.shift) {
      this.kick();
      return;
    }
    const first2 = this.text === null;
    const oldCols = this.cols;
    this.text = text2;
    this.base = this.bitmap(text2);
    this.shift = 0;
    if (this.cols !== oldCols) this.state = new Uint8Array(this.base.length);
    this.apply(this.base, 1, first2 ? SWEEP_FIRST_MS : SWEEP_MS, first2 ? 8 : 3, DISC_MS);
  }
  // finger travel in px since the drag started (moves gathered per frame: a quick finger never queues more than one refresh)
  drag(px) {
    this.want = px;
    if (this.dragRaf) return;
    this.dragRaf = requestAnimationFrame(() => {
      this.dragRaf = 0;
      const w = this.el.getBoundingClientRect().width || 1, s2 = Math.round(this.want / w * this.cols);
      if (s2 === this.shift) return;
      this.shift = s2;
      this.sweep(this.shifted(s2));
    });
  }
  sweep(bm) {
    const now = performance.now(), still = calm(), period = this.cols * SCAN_COL_MS;
    if (now - this.sweepT0 > period * 2) this.sweepT0 = now;
    this.dur = DISC_MS;
    for (let i = 0; i < bm.length; i++) {
      this.target[i] = bm[i];
      if (still) {
        this.state[i] = bm[i];
        this.start[i] = -1;
        continue;
      }
      if (this.state[i] === bm[i] && !(this.start[i] >= 0 && this.start[i] <= now)) {
        this.start[i] = -1;
        continue;
      }
      if (this.start[i] > now) continue;
      if (this.start[i] >= 0 && now - this.start[i] < this.dur) continue;
      const col = i % this.cols, row2 = i / this.cols | 0;
      const at = col * SCAN_COL_MS + row2 * (SCAN_COL_MS / this.rows);
      const k = Math.ceil((now - this.sweepT0 - at) / period);
      this.start[i] = this.sweepT0 + Math.max(0, k) * period + at;
    }
    this.kick();
  }
  // Refresh like a real panel coming on: every dot goes dark, then the digits turn over column by column from the upper left
  // (the same sweep as the first time the board is drawn). Calm motion: nothing happens.
  replay() {
    if (calm() || this.text === null) return;
    if (this.dragRaf) {
      cancelAnimationFrame(this.dragRaf);
      this.dragRaf = 0;
    }
    this.colors = null;
    this.state = new Uint8Array(this.base.length);
    this.start = new Float64Array(this.base.length).fill(-1);
    this.shift = 0;
    this.apply(this.base, 1, SWEEP_MS, 3, DISC_MS);
  }
  recolor() {
    LIVE.add(this);
    this.colors = null;
    this.kick();
  }
  kick() {
    if (!this.running) {
      this.running = true;
      requestAnimationFrame((t2) => this.frame(t2));
    }
  }
  // paint() itself waits (a bounded number of frames) while the canvas is not on the page yet: a board set during a redraw is
  // attached a moment later, and stopping here left it unpainted, in the old theme's colours
  frame(t2) {
    if (this.paint(t2)) requestAnimationFrame((x) => this.frame(x));
    else this.running = false;
  }
  paint(now) {
    const x = this.el.getContext("2d");
    if (!x) return false;
    const cs = this.colors ? null : getComputedStyle(this.el), dim = cs?.getPropertyValue("--zl-dim").trim();
    if (!this.el.isConnected || cs && !dim) {
      this.waits = (this.waits ?? 0) + 1;
      return this.waits < 120;
    }
    this.waits = 0;
    if (cs) this.colors = [dim || "#D5D1C7", cs.getPropertyValue("--zl-text").trim() || "#1C1B19", cs.getPropertyValue("--zl-loud").trim() || "#E8461F"];
    if (!this.colors) return false;
    const [off, on, loud] = this.colors, p = this.pitch, c = this.cell;
    x.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    x.clearRect(0, 0, this.cols * p, this.rows * p);
    let busy = false;
    const rp = this.ripple, rt = rp ? (now - rp.t) / 16 : 0;
    if (rp && rt > rp.end) this.ripple = null;
    for (let i = 0; i < this.state.length; i++) {
      const col = i % this.cols, row2 = i / this.cols | 0;
      let s2 = this.state[i], w = 1;
      if (this.start[i] >= 0) {
        const k = (now - this.start[i]) / this.dur;
        if (k >= 1) {
          this.state[i] = this.target[i];
          this.start[i] = -1;
          s2 = this.target[i];
        } else {
          busy = true;
          if (k > 0) {
            w = Math.abs(Math.cos(k * Math.PI));
            if (k > 0.5) s2 = this.target[i];
          }
        }
      }
      let color = s2 ? on : off;
      if (this.ripple && rp) {
        busy = true;
        if (Math.abs(Math.hypot(col + 0.5 - rp.x, row2 + 0.5 - rp.y) - rt) < 0.9) color = loud;
      }
      const cw = Math.max(0.5, c * w);
      x.fillStyle = color;
      x.fillRect(col * p + (c - cw) / 2, row2 * p, cw, c);
    }
    return busy;
  }
};

// src/ui/scrub.ts
var HOLD = 280;
var SLOP = 8;
var PX = 9;
var notches = (dy) => {
  const u = Math.abs(dy) / PX;
  return Math.sign(dy) * Math.floor(u < 10 ? u : 10 + Math.pow(u - 10, 1.35));
};
var scrub = (el, get) => {
  el.addClass("zl-scrubbable");
  let timer = 0, active = false, x0 = 0, y0 = 0, id = -1, o = null, n = 0;
  let bub = null, bv = null, bd = null;
  el.addEventListener("touchmove", (e) => {
    if (active) e.preventDefault();
  }, { passive: false });
  el.addEventListener("contextmenu", (e) => {
    if (active || timer) e.preventDefault();
  });
  const stop = () => {
    window.clearTimeout(timer);
    timer = 0;
  };
  const paint = () => {
    if (!o || !bv || !bd) return;
    const d = n - o.value;
    bv.textContent = o.fmt(n);
    bd.textContent = d ? `${d > 0 ? "+" : "\u2212"}${o.fmt(Math.abs(d))}` : "\u2195";
    bub.toggleClass("is-up", d > 0);
    bub.toggleClass("is-down", d < 0);
    o.live?.(n);
  };
  const begin = () => {
    timer = 0;
    o = get();
    n = o.value;
    active = true;
    el.addClass("is-scrub");
    const r = el.getBoundingClientRect();
    bub = h(el.closest(".zl-app, .zl-sheet-host") ?? document.body, "div", "zl-bubble");
    h(bub, "div", "zl-bubble-k", o.label.toUpperCase());
    bv = h(bub, "div", "zl-bubble-v");
    bd = h(bub, "div", "zl-bubble-d");
    bub.style.left = `${Math.min(window.innerWidth - 90, Math.max(90, r.left + r.width / 2))}px`;
    bub.style.top = `${Math.max(8, r.top - 12)}px`;
    paint();
  };
  const end = (save) => {
    stop();
    if (!active) return;
    active = false;
    el.removeClass("is-scrub");
    bub?.remove();
    bub = null;
    const eat = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
    el.addEventListener("click", eat, { capture: true, once: true });
    window.setTimeout(() => el.removeEventListener("click", eat, { capture: true }), 400);
    if (o && n !== o.value) {
      if (save) o.done(n);
      else o.live?.(o.value);
    }
    o = null;
  };
  el.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || active) return;
    x0 = e.clientX;
    y0 = e.clientY;
    id = e.pointerId;
    stop();
    timer = window.setTimeout(() => {
      try {
        el.setPointerCapture(id);
      } catch {
      }
      begin();
    }, HOLD);
  });
  el.addEventListener("pointermove", (e) => {
    if (e.pointerId !== id) return;
    if (!active) {
      if (timer && Math.hypot(e.clientX - x0, e.clientY - y0) > SLOP) stop();
      return;
    }
    e.preventDefault();
    const m = o.min ?? 0;
    const next = Math.max(m, o.value + notches(y0 - e.clientY) * o.step);
    if (next !== n) {
      n = next;
      paint();
      bv.removeClass("is-tick");
      void bv.offsetWidth;
      bv.addClass("is-tick");
    }
  });
  el.addEventListener("pointerup", (e) => {
    if (e.pointerId === id) end(true);
  });
  el.addEventListener("pointercancel", (e) => {
    if (e.pointerId === id) end(false);
  });
};
var notchFor = (cur) => /^(TWD|NTD|JPY|KRW|VND|IDR|HUF|INR|PHP|THB)$/i.test(cur) ? 10 : 1;

// src/ui/c.ts
var NS3 = "http://www.w3.org/2000/svg";
var TICK = false;
var liveTick = (on) => {
  TICK = on;
};
var svgEl2 = (parent, w, ht, cls = "zl-chart") => {
  const s2 = document.createElementNS(NS3, "svg");
  s2.setAttribute("class", cls + " zl-grow");
  s2.setAttribute("viewBox", `0 0 ${w} ${ht}`);
  s2.setAttribute("shape-rendering", "crispEdges");
  parent.appendChild(s2);
  return s2;
};
var LIGHT_MS = 300;
var COL_UP_MS = 30;
var blocks = (svg, cells, keep2 = false) => {
  const still = calm();
  const lit = cells.filter((c) => c[5] !== DARK);
  const xs2 = lit.map((c) => c[0]), ys = lit.map((c) => c[1]);
  const x0 = Math.min(...xs2), x1 = Math.max(...xs2), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const order = (c) => c[5] === DARK ? DARK : Math.round((c[0] - x0) / (x1 - x0 || 1) * LIGHT_MS + (y1 - c[1]) / (y1 - y0 || 1) * COL_UP_MS);
  if (!keep2) cells = cells.map((c) => [c[0], c[1], c[2], c[3], c[4], order(c), c[6]]);
  cells.forEach((c, i) => {
    const r = document.createElementNS(NS3, "rect");
    r.setAttribute("x", String(c[0]));
    r.setAttribute("y", String(c[1]));
    r.setAttribute("width", String(c[2]));
    r.setAttribute("height", String(c[3]));
    r.setAttribute("fill", c[4]);
    if (c[6]) r.setAttribute("class", c[6]);
    r.style.setProperty("--d", `${still ? 0 : c[5] ?? i * 4}ms`);
    svg.appendChild(r);
  });
};
var DARK = -500;
var grid = (cells) => cells.map((c) => [c[0], c[1], c[2], c[3], "var(--zl-dim)", DARK]);
var FlapBoard = class {
  constructor(parent) {
    this.f = new Flap("xl");
    this.dragged = false;
    this.text = "";
    this.el = h(parent, "div", "zl-flapboard zl-board");
    this.el.appendChild(this.f.el);
    this.el.addEventListener("zl-replay", () => this.f.replay());
  }
  set(text2) {
    this.text = text2;
    this.f.set(text2);
  }
  drag(px) {
    this.f.el.style.transition = px ? "none" : "transform .2s cubic-bezier(.2,.8,.2,1)";
    this.f.el.style.transform = px ? `translateX(${px * 0.35}px)` : "";
  }
};
var BOARDS = /* @__PURE__ */ new Map();
var board = (parent, key, text2, dir = 1) => {
  const wrap = h(parent, "div", "zl-boardwrap");
  const flap2 = document.body.hasClass("zl-bigflap"), id = (flap2 ? "f:" : "d:") + key;
  let b = BOARDS.get(id);
  if (!b) {
    b = flap2 ? new FlapBoard(wrap) : new FlipDot(wrap);
    BOARDS.set(id, b);
  } else wrap.appendChild(b.el);
  b.set(text2, dir);
  return b;
};
var dragBoard = (el, b, onPass, can) => {
  let x0 = 0, y0 = 0, on = false, lock = null, dx = 0;
  el.addEventListener("touchstart", (e) => {
    const t2 = e.touches[0];
    x0 = t2.clientX;
    y0 = t2.clientY;
    on = true;
    lock = null;
    dx = 0;
    b.dragged = false;
  }, { passive: true });
  el.addEventListener("touchmove", (e) => {
    if (!on) return;
    const t2 = e.touches[0], mx = t2.clientX - x0, my = t2.clientY - y0;
    if (!lock && Math.hypot(mx, my) > 8) lock = Math.abs(mx) > Math.abs(my) ? "x" : "y";
    if (lock !== "x") return;
    e.stopPropagation();
    dx = mx;
    b.dragged = true;
    b.drag(dx);
  }, { passive: true });
  const end = () => {
    if (!on) return;
    on = false;
    if (lock !== "x") return;
    const w = el.getBoundingClientRect().width || 1, step = dx < 0 ? 1 : -1;
    window.setTimeout(() => {
      b.dragged = false;
    }, 50);
    if (Math.abs(dx) > w / 4 && can(step)) onPass(step);
    else b.drag(0);
  };
  el.addEventListener("touchend", end);
  el.addEventListener("touchcancel", end);
};
var BIGL = /* @__PURE__ */ new Map();
var bigLabel = (parent, left, right, key) => {
  const r = h(parent, "div", "zl-bigl");
  h(r, "span", "", left);
  if (!right) return r;
  const was = key ? BIGL.get(key) : void 0;
  if (key) BIGL.set(key, right);
  if (!TICK || was === void 0 || was.length !== right.length || was === right) {
    h(r, "span", "", right);
    return r;
  }
  const sp = h(r, "span");
  [...right].forEach((ch, i) => {
    if (ch === was[i]) sp.appendText(ch);
    else h(sp, "span", "zl-tickc", ch);
  });
  return r;
};
var FLAPS = /* @__PURE__ */ new Map();
var reads = (parent, list5) => {
  const box = h(parent, "div", "zl-reads");
  for (const [label, id, value, x] of list5) {
    const r = h(box, "div", "zl-read");
    if (x?.sub) {
      const k = h(r, "span", "zl-read-kk");
      h(k, "span", "zl-read-k", label);
      const s2 = h(k, "span", "zl-read-s");
      h(s2, "span", x.tone ? `zl-${x.tone}` : "", x.sub[0]);
      s2.appendText(` ${x.sub[1]}`);
    } else h(r, "span", "zl-read-k", label);
    let f = FLAPS.get(id);
    if (!f) {
      f = new Flap("md", /^[+\-\u2212]?[\d,]+$/.test(value) ? 5 : 0);
      FLAPS.set(id, f);
    }
    r.appendChild(f.el);
    f.set(value.replace(/ /g, "\xA0"));
    f.el.toggleClass("is-up", x?.tone === "up");
    f.el.toggleClass("is-down", x?.tone === "down");
  }
  return box;
};
var sec = (parent, label, onMore, moreText = "MORE") => {
  const s2 = h(parent, onMore ? "button" : "div", "zl-sec");
  h(s2, "span", "", label);
  if (onMore) {
    const g = h(s2, "span", "zl-sec-go", moreText);
    sprite(g, "back");
    s2.addEventListener("click", (e) => {
      e.preventDefault();
      onMore();
    });
  }
  return s2;
};
var BAR_LIT = /* @__PURE__ */ new Map();
var budgetBar = (parent, spent, quota, pace, n = 20, cw = 7, ht = 12, loudPast = true, key) => {
  const used = quota > 0 ? Math.min(n, Math.round(Math.max(0, spent) / quota * n)) : 0, pc = Math.round(pace * n), p = cw + 2;
  const all = [], lit = [];
  const col = loudPast && pace > 0 && used > pc ? "var(--zl-loud)" : "var(--zl-text)";
  for (let i = 0; i < n; i++) {
    const c = [i * p, 3, cw, ht, col, 80 + i * 15];
    all.push(c);
    if (i < used) lit.push(c);
  }
  const s2 = svgEl2(parent, n * p, ht + 6);
  const was = key ? BAR_LIT.get(key) : void 0;
  if (key) BAR_LIT.set(key, used);
  const ticking = TICK && was !== void 0 && !calm();
  if (ticking) {
    const tip = [];
    for (let i = 0; i < Math.max(used, was); i++) {
      if (i < Math.min(used, was)) tip.push([i * p, 3, cw, ht, col, DARK]);
      else if (i < used) tip.push([i * p, 3, cw, ht, col, (i - was) * 40]);
      else tip.push([i * p, 3, cw, ht, col, (was - 1 - i) * 40, "zl-out"]);
    }
    blocks(s2, [...grid(all), ...tip], true);
  } else blocks(s2, [...grid(all), ...lit]);
  if (pace > 0 && pace < 1) blocks(s2, [[pc * p - 1.5, 0, 2, ht + 6, "var(--zl-loud)", ticking ? DARK : 0]], ticking);
  return s2;
};
var bline = (parent, o) => {
  const b = h(parent, "button", "zl-bline");
  const top = h(b, "span", "zl-bline-t");
  h(top, "span", "zl-bline-n", o.name);
  const v = h(top, "span", "zl-bline-v");
  h(v, "strong", o.hot ? "is-hot" : "", o.value);
  h(v, "span", "zl-bline-of", " " + o.of);
  const s2 = budgetBar(b, o.spent, o.quota, o.pace, 40, 7, 10, !o.mix, `${o.mix ? "mix" : "bud"}:${o.name}`);
  s2.setAttribute("preserveAspectRatio", "none");
  s2.classList.add("zl-bline-bar");
  b.addEventListener("click", (e) => {
    e.preventDefault();
    o.onTap();
  });
  return b;
};
var figures = (parent, list5) => {
  const box = h(parent, "div", "zl-figs");
  list5.forEach((f, i) => {
    const r = h(box, f.onTap ? "button" : "div", "zl-fig zl-in" + (f.dim ? " is-dim" : "") + (f.name ? " is-name" : ""));
    r.style.setProperty("--i", String(i));
    sprite(r, f.icon ?? rowSprite(f.k), "zl-px zl-fig-ic");
    if (f.s) {
      const m = h(r, "span", "zl-fig-main");
      h(m, "span", "zl-fig-k", f.k);
      h(m, "span", "zl-fig-s", f.s);
    } else h(r, "span", "zl-fig-k", f.k);
    const v = h(r, "span", "zl-fig-v" + (f.hot ? " is-hot" : ""), f.v);
    if (f.onTap) {
      const fn = f.onTap;
      sprite(r, "back", "zl-px zl-fig-go");
      r.addEventListener("click", (e) => {
        e.preventDefault();
        fn();
      });
    }
    if (f.beam !== void 0) {
      r.addClass("is-beam");
      beamStrip(r, f.beam, i);
    }
    if (f.scrub) {
      const g = f.scrub;
      scrub(r, () => {
        const o = g();
        return { ...o, live: (n) => {
          v.textContent = o.fmt(n);
          o.live?.(n);
        } };
      });
    }
  });
  return box;
};
var beamStrip = (parent, r, li, half = 18) => {
  const cw = 8, gap = 2, p = cw + gap, W = half * 2 * p + 4, all = [], lit = [];
  const n = r === 0 ? 0 : Math.max(1, Math.round(Math.min(1, Math.abs(r)) * half));
  for (let i = 0; i < half; i++) {
    const left = [(half - 1 - i) * p, 0, cw, 6, "var(--zl-loud)", 120 + li * 60 + i * 18];
    const right = [half * p + 4 + i * p, 0, cw, 6, "var(--zl-text)", 120 + li * 60 + i * 18];
    all.push(left, right);
    if (r < 0 && i < n) lit.push(left);
    if (r > 0 && i < n) lit.push(right);
  }
  const s2 = svgEl2(parent, W, 6, "zl-chart zl-fig-beam");
  s2.setAttribute("preserveAspectRatio", "none");
  blocks(s2, [...grid(all), [half * p, -2, 2, 10, "var(--zl-muted)", DARK], ...lit]);
};
var tileGrid = (parent, list5, cols) => {
  const g = h(parent, "div", "zl-tgrid" + (cols === 2 ? " is-2 is-span" : list5.length === 4 ? " is-4" : list5.length <= 2 ? " is-2" : ""));
  for (const x of list5) {
    const b = h(g, "button", "zl-tg" + (x.dim ? " is-dim" : "") + (x.hot ? " is-hot" : ""));
    const top = h(b, "span", "zl-tg-top");
    sprite(top, x.icon ?? rowSprite(x.k), "zl-px zl-tg-ic");
    h(top, "span", "zl-tg-k", x.k);
    const v = h(b, "span", "zl-tg-v", x.v);
    if (x.s) h(b, "span", "zl-tg-s", x.s);
    b.addEventListener("click", (e) => {
      e.preventDefault();
      x.onTap();
    });
    x.ref?.(b);
    if (x.scrub) {
      const gt = x.scrub;
      scrub(b, () => {
        const o = gt();
        return { ...o, live: (n) => {
          v.textContent = o.fmt(n);
          b.toggleClass("is-dim", !n);
          o.live?.(n);
        } };
      });
    }
  }
  return g;
};
var dropRow = (box, keep2 = 1) => () => {
  const rows = box.querySelectorAll(":scope > .zl-fig");
  if (!rows.length || rows.length <= keep2) return false;
  rows[rows.length - 1].remove();
  if (rows.length - 1 === 0) box.closest(".zl-c-group")?.remove();
  return true;
};
var gridOf = (list5, max, more) => list5.length > max ? [...list5.slice(0, max - 1), more(list5.length - max + 1)] : list5;
var DOCK_TAPS = /* @__PURE__ */ new WeakMap();
var dock = (host, o) => {
  const side = o.side ?? [];
  const sig = JSON.stringify([o.back?.to ?? null, o.act ? [o.act.text, o.act.label, o.act.hint ?? "", !!o.act.loud] : null, side.map((s2) => s2.icon)]);
  const taps = { back: o.back?.onTap, act: o.act?.onTap, side: side.map((s2) => s2.onTap) };
  if (host.dataset.sig === sig && host.childElementCount) {
    DOCK_TAPS.set(host, taps);
    return;
  }
  host.dataset.sig = sig;
  DOCK_TAPS.set(host, taps);
  host.empty();
  host.toggleClass("is-on", !!(o.back || o.act || side.length));
  host.toggleClass("is-split", !!(o.back && o.act));
  if (o.back) {
    const back = o.back;
    const b = h(host, "button", "zl-dock-b zl-dock-back");
    b.setAttribute("aria-label", back.to);
    sprite(b, "back");
    h(b, "span", "zl-dock-t", back.to.toUpperCase());
    b.addEventListener("click", (e) => {
      e.preventDefault();
      DOCK_TAPS.get(host)?.back?.();
    });
  }
  if (o.act) {
    const a = o.act;
    const b = h(host, "button", "zl-dock-b zl-dock-act" + (a.loud ? " is-loud" : ""));
    b.setAttribute("aria-label", a.label);
    if (!a.loud) sprite(b, "plus");
    h(b, "span", "zl-dock-t", a.text);
    if (a.hint && !o.back) h(b, "span", "zl-dock-h", a.hint);
    b.addEventListener("click", (e) => {
      e.preventDefault();
      DOCK_TAPS.get(host)?.act?.();
    });
  }
  side.forEach((s2, i) => {
    const b = h(host, "button", "zl-dock-b zl-dock-ico");
    b.setAttribute("aria-label", s2.label);
    sprite(b, s2.icon);
    b.addEventListener("click", (e) => {
      e.preventDefault();
      DOCK_TAPS.get(host)?.side?.[i]?.();
    });
  });
};
var homeTop = (parent, o) => {
  const g = h(parent, "div", "zl-c-group zl-c-top");
  const b = board(g, o.key, o.value);
  if (o.onDrag) dragBoard(g, b, o.onDrag.pass, o.onDrag.can);
  const bl = bigLabel(g, o.label, o.right, o.key);
  if (o.tone && o.right) bl.lastElementChild?.addClass(`zl-${o.tone}`);
  if (o.reads?.length) reads(g, o.reads.map(([k, v, x], i) => [k, `${o.key}-r${i + 1}`, v, x]));
  return g;
};
var SUMS = /* @__PURE__ */ new Map();
var summary = (parent, o) => {
  const g = h(parent, "div", "zl-c-group zl-c-top zl-sum");
  h(g, "div", "zl-sum-l", o.label.toUpperCase());
  const size = o.value.length > 7 ? "md" : o.value.length > 6 ? "lg" : "xl";
  const id = `${o.key ?? o.label}|${size}`;
  let f = SUMS.get(id);
  if (!f) {
    f = new Flap(size);
    SUMS.set(id, f);
  }
  const box = h(g, "div", "zl-sum-flap" + (o.hot ? " is-hot" : "") + (o.dim ? " is-dim" : ""));
  box.appendChild(f.el);
  f.set(o.value);
  if (o.items?.length) {
    const r = h(g, "div", "zl-sum-items");
    for (const [k, v, hot] of o.items) {
      const it = h(r, "div");
      h(it, "span", "zl-sum-k", k.toUpperCase());
      h(it, "span", "zl-sum-v" + (hot ? " is-hot" : ""), v);
    }
  }
  return g;
};
var yearBricks = (parent, vals, labels, loud, rows = 10) => {
  const box = h(parent, "div", "zl-stairs zl-years");
  const n = Math.max(1, vals.length), W = 396, gap = 6, cw = Math.max(4, Math.floor((W - gap * (n - 1)) / n)), bh = 8, p = bh + 3;
  const top = Math.max(1, ...vals), all = [], lit = [];
  vals.forEach((v, i) => {
    const k = v <= 0 ? 0 : Math.max(1, Math.round(v / top * rows));
    for (let r = 0; r < rows; r++) {
      const c = [i * (cw + gap), (rows - 1 - r) * p, cw, bh, i === loud ? "var(--zl-loud)" : "var(--zl-text)", 80 + r * 45 + i * 6];
      all.push(c);
      if (r < k) lit.push(c);
    }
  });
  const s2 = svgEl2(box, n * (cw + gap) - gap, rows * p - 3);
  s2.setAttribute("preserveAspectRatio", "none");
  blocks(s2, [...grid(all), ...lit]);
  const l = h(box, "div", "zl-years-l");
  l.style.setProperty("--n", String(n));
  for (const x of labels) h(l, "span", "", x);
  return box;
};
var pickBars = (parent, o, rows = 12) => {
  const box = h(parent, "div", "zl-stairs zl-years zl-pickbars");
  const n = Math.max(1, o.vals.length), W = 396, gap = 4, cw = Math.max(4, Math.floor((W - gap * (n - 1)) / n)), bh = 6, p = bh + 2;
  const top = Math.max(1, ...o.vals), all = [], lit = [], H = rows * p + 6 + bh;
  const tone = (i) => i === o.pick ? "var(--zl-text)" : "var(--zl-muted)";
  o.vals.forEach((v, i) => {
    const k = v <= 0 ? 0 : Math.max(1, Math.round(v / top * rows));
    for (let r = 0; r < rows; r++) {
      const c = [i * (cw + gap), (rows - 1 - r) * p, cw, bh, tone(i), 80 + r * 45 + i * 6, `zl-pb-b zl-pb-${i}`];
      all.push(c);
      if (r < k) lit.push(c);
    }
    const d = o.strip[i];
    const sc = [i * (cw + gap), rows * p + 6, cw, bh, d === null || d === void 0 ? "var(--zl-dim)" : d >= 0 ? "var(--zl-up)" : "var(--zl-down)", 80 + i * 6];
    all.push(sc);
    if (d !== null && d !== void 0) lit.push(sc);
  });
  const s2 = svgEl2(box, n * (cw + gap) - gap, H);
  s2.setAttribute("preserveAspectRatio", "none");
  blocks(s2, [...grid(all), ...lit]);
  const l = h(box, "div", "zl-years-l");
  l.style.setProperty("--n", String(n));
  for (const x of o.labels) h(l, "span", "", x);
  let cur = o.pick;
  const paint = (i) => {
    if (i === cur) return;
    cur = i;
    s2.querySelectorAll(".zl-pb-b").forEach((r) => {
      const c = Number(/zl-pb-(\d+)/.exec(r.getAttribute("class") ?? "")?.[1]);
      if (r.getAttribute("fill") !== "var(--zl-dim)") r.setAttribute("fill", c === i ? "var(--zl-text)" : "var(--zl-muted)");
    });
    o.onPick(i);
  };
  s2.querySelectorAll(".zl-pb-b").forEach((r) => {
    if (r.getAttribute("fill") === "var(--zl-dim)") r.removeAttribute("class");
  });
  const at = (cx) => {
    const b = s2.getBoundingClientRect();
    paint(Math.max(0, Math.min(n - 1, Math.floor((cx - b.left) / (b.width || 1) * n))));
  };
  let down = false;
  box.addEventListener("pointerdown", (e) => {
    down = true;
    at(e.clientX);
  });
  box.addEventListener("pointermove", (e) => {
    if (down) at(e.clientX);
  });
  for (const ev of ["pointerup", "pointercancel", "pointerleave"]) box.addEventListener(ev, () => {
    down = false;
  });
  box.addEventListener("touchmove", (e) => e.stopPropagation(), { passive: true });
  return box;
};

// src/pages/accounts.ts
var ACCOUNTS_FILE = "Accounts";
var KIND = {
  opening: { label: "acOpening", icon: "wallet" },
  adjust: { label: "acAdjust", icon: "swap" },
  expense: { label: "acExpense", icon: "receipt" },
  deposit: { label: "acDeposit", icon: "down" },
  transfer: { label: "acTransfer", icon: "swap" },
  buy: { label: "acBuy", icon: "up" },
  sell: { label: "acSell", icon: "down" },
  fee: { label: "acFee", icon: "receipt" }
};
var signed = (n) => `${n < 0 ? "\u2212" : n > 0 ? "+" : ""}${num(Math.abs(n))}`;
var load = (ctx) => buildAccounts(ctx.plugin.store.fm(ctx.plugin.store.path(ACCOUNTS_FILE)));
var entryRow = (e) => ({
  icon: KIND[e.kind].icon,
  k: (t(KIND[e.kind].label) + (e.planned ? ` \xB7 ${t("acPlanned")}` : "")).toUpperCase(),
  s: [e.date ? shortDate(e.date) : t("noDate"), e.note].filter(Boolean).join(" \xB7 "),
  v: signed(e.amount),
  hot: e.amount < 0,
  dim: e.planned
});
var GROUPS = [["everyday", "acEveryday"], ["saving", "acSaving"], ["investing", "acInvesting"]];
var accRow = (ctx, a) => ({
  icon: "wallet",
  name: true,
  k: a.label.toUpperCase(),
  v: num(a.balance),
  hot: a.balance < 0,
  s: [a.bank, a.target > 0 ? t("acOfTarget", { pct: Math.floor(a.balance / a.target * 100), target: num(a.target) }) : a.planned ? t("acPlannedN", { n: num(a.planned) }) : ""].filter(Boolean).join(" \xB7 "),
  onTap: () => ctx.push({ key: "account:" + a.key, title: a.label })
});
var accTile = (ctx, a) => ({
  icon: nameSprite(a.label, a.bucket ? "invest" : /loan|debt/i.test(a.label) ? "debt" : "wallet"),
  k: a.label.toUpperCase(),
  v: num(a.balance),
  s: a.target > 0 ? t("acOfTarget", { pct: Math.floor(a.balance / a.target * 100), target: num(a.target) }) : a.planned ? t("acPlannedN", { n: num(a.planned) }) : void 0,
  hot: a.balance < 0,
  dim: !a.balance,
  onTap: () => ctx.push({ key: "account:" + a.key, title: a.label })
});
var accountsPage = (ctx) => {
  const A = load(ctx), cur = ctx.plugin.settings.baseCurrency;
  const key = ctx.frame.key, only = key.startsWith("accounts:") ? key.slice(9) : null;
  const title = only ? t(GROUPS.find(([p]) => p === only)?.[1] ?? "acTitle") : t("acTitle");
  const el = page(title);
  if (only) {
    el.addClass("zl-c-list");
    const g = h(el, "div", "zl-c-group");
    if (only === "unknown") figures(g, A.unknown.map((e) => ({ ...entryRow(e), k: e.account.toUpperCase() })));
    else figures(g, A.list.filter((a) => purposeOf(a) === only).map((a) => accRow(ctx, a)));
    return { title, el };
  }
  el.addClass("zl-c-stack");
  const free = A.list.filter((a) => purposeOf(a) === "everyday").reduce((s2, a) => s2 + a.balance, 0);
  summary(el, { key: "accounts", label: t("acTotal", { cur }), value: num(A.total), items: [[t("acFree"), num(free)], [t("acSetAside"), num(A.total - free)], [t("acPlanned"), num(A.planned)]] });
  if (!A.list.length) {
    h(el, "div", "zl-c-note", t("acNone"));
    return { title, el };
  }
  for (const [p, label] of GROUPS) {
    const list5 = A.list.filter((a) => purposeOf(a) === p);
    if (!list5.length) continue;
    const g = h(el, "div", "zl-c-group");
    sec(g, `${t(label)} \xB7 ${num(list5.reduce((s2, a) => s2 + a.balance, 0))}`.toUpperCase());
    const all = () => ctx.push({ key: "accounts:" + p, title: t(label) });
    tileGrid(g, gridOf(list5.map((a) => accTile(ctx, a)), 4, (n) => ({ icon: "list", k: t("cMore").toUpperCase(), v: `+${n}`, onTap: all })), 2);
  }
  if (A.unknown.length) sec(h(el, "div", "zl-c-group zl-c-link"), t("acUnknown").toUpperCase() + ` \xB7 ${A.unknown.length}`, () => ctx.push({ key: "accounts:unknown", title: t("acUnknown") }), t("cMore").toUpperCase());
  return { title, el };
};
var monthHead = (d) => {
  const m = /^(\d{4})-(\d{2})/.exec(d);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, 1).toLocaleDateString("en", { month: "long", year: "numeric" }) : t("noDate");
};
var accountPage = (ctx, key) => {
  const a = load(ctx).list.find((x) => x.key === key);
  if (!a) return null;
  const el = page(a.label);
  el.addClass("zl-c-list");
  summary(el, {
    key: "account-" + a.key,
    label: `${a.bank} \xB7 ${a.label}`,
    value: num(a.balance),
    hot: a.balance < 0,
    items: [[t("cTarget"), a.target > 0 ? `${num(a.target)} \xB7 ${Math.floor(a.balance / a.target * 100)}%` : "-"], [t("acPlanned"), num(a.planned)], [t("txCount"), String(a.entries.length)]]
  });
  const after = balanceAfter(a.entries);
  const byMonth = /* @__PURE__ */ new Map();
  for (const e of a.entries) {
    const k = e.date.slice(0, 7);
    if (!byMonth.has(k)) byMonth.set(k, []);
    byMonth.get(k).push(e);
  }
  for (const [m, list5] of byMonth) {
    const g = h(el, "div", "zl-c-group");
    sec(g, monthHead(m).toUpperCase());
    figures(g, list5.map((e) => {
      const r = entryRow(e);
      return { ...r, s: [r.s, t("acThen", { n: num(after.get(e) ?? 0) })].join(" \xB7 ") };
    }));
  }
  return { title: a.label, el };
};

// src/ui/sheet.ts
var import_obsidian14 = require("obsidian");

// src/ui/haptic.ts
var tickBox = null;
function tick() {
  try {
    const hp = window.Capacitor?.Plugins?.Haptics;
    if (hp?.impact) {
      void hp.impact({ style: "LIGHT" });
      return "capacitor";
    }
    if (hp?.selectionChanged) {
      void hp.selectionChanged();
      return "capacitor";
    }
  } catch {
  }
  try {
    if (navigator.vibrate?.(8)) return "vibrate";
  } catch {
  }
  if (!tickBox) {
    tickBox = document.createElement("label");
    tickBox.className = "zl-haptic";
    tickBox.setAttribute("aria-hidden", "true");
    const box = document.createElement("input");
    box.type = "checkbox";
    box.setAttribute("switch", "");
    box.tabIndex = -1;
    tickBox.appendChild(box);
    document.body.appendChild(tickBox);
  }
  tickBox.click();
  return /iPhone|iPad/.test(navigator.userAgent) ? "switch" : "";
}

// src/pages/amount.ts
var import_obsidian13 = require("obsidian");
var MAX = 7;
var BLANK2 = "\xA0";
var shown = (s2) => {
  const [a, b] = s2.split(".");
  return num(Number(a || "0")) + (b !== void 0 ? `.${b}` : "");
};
var flap = null;
var openNow = null;
var openPad = (_ctx, o) => {
  openNow?.();
  const host = o.host ?? (document.querySelector(".workspace-leaf.mod-active .zl-app") ?? document.querySelector(".zl-app"));
  if (!host) return;
  const st = { s: "", mode: o.current > 0 && !o.setOnly ? "add" : "set" };
  const wrap = h(host, "div", "zl-drw-wrap");
  if (o.host) keepTaps(wrap);
  const scrim = h(wrap, "div", "zl-drw-scrim");
  const d = h(wrap, "section", "zl-drw");
  d.setAttribute("role", "dialog");
  d.setAttribute("aria-label", `${o.title} \xB7 ${o.sub}`);
  const head = h(d, "div", "zl-drw-head");
  h(head, "span", "zl-drw-t", `${o.title} \xB7 ${o.sub.toLowerCase() === t("today").toLowerCase() ? o.sub.toLowerCase() : o.sub}`);
  if (o.current > 0) h(head, "span", "zl-drw-now", t("cAlready", { n: num(o.current) }));
  if (o.note) h(d, "p", "zl-c-note zl-drw-note", o.note);
  const words = h(d, "div", "zl-drw-words");
  const word = (m, label) => {
    const b = h(words, "button", "zl-drw-word" + (st.mode === m ? " is-on" : ""), label.toUpperCase());
    b.addEventListener("click", (e) => {
      e.preventDefault();
      st.mode = m;
      words.querySelectorAll(".zl-drw-word").forEach((x) => x.toggleClass("is-on", x === b));
      paint();
    });
  };
  if (o.current > 0 && !o.setOnly) {
    word("add", t("cAddTo"));
    word("set", t("cSetTo"));
  } else words.remove();
  if (!flap) flap = new Flap("amt");
  const fb = h(d, "div", "zl-drw-flap");
  fb.appendChild(flap.el);
  const totalRow = h(d, "div", "zl-drw-total");
  const totalK = h(totalRow, "span", "", t("cNewTotal"));
  const totalV = h(totalRow, "strong");
  const chips = h(d, "div", "zl-drw-chips");
  const dec = o.dec ?? 0;
  const W = MAX + Math.floor((MAX - 1) / 3) + (dec ? dec + 1 : 0);
  if (o.chips && !o.chips.length) chips.remove();
  for (const n of o.chips ?? [50, 100, 200]) {
    const c = h(chips, "button", "zl-drw-chip", `+${n}`);
    c.addEventListener("click", (e) => {
      e.preventDefault();
      st.s = String(Math.min(10 ** MAX - 1, value() + n));
      paint();
    });
  }
  const pad2 = h(d, "div", "zl-drw-pad");
  for (const k of ["1", "2", "3", "4", "5", "6", "7", "8", "9", dec ? "." : "C", "0", "<"]) {
    const b = h(pad2, "button", "zl-drw-key" + (k === "C" ? " is-fn" : k === "<" ? " is-del" : ""), k === "C" ? t("cClear").toUpperCase() : k === "<" ? "\u232B" : k);
    b.setAttribute("aria-label", k === "C" ? t("cClear") : k === "<" ? t("cDelete") : k);
    b.addEventListener("click", (e) => {
      e.preventDefault();
      press(k);
    });
  }
  const acts = h(d, "div", "zl-drw-acts" + (o.remove ? " has-rm" : ""));
  if (o.remove) {
    const r = o.remove;
    const rm = h(acts, "button", "zl-drw-b is-rm", r.text.toUpperCase());
    rm.addEventListener("click", (e) => {
      e.preventDefault();
      void r.run().then(close);
    });
  }
  const cancel = h(acts, "button", "zl-drw-b", t("cancel").toUpperCase());
  cancel.addEventListener("click", (e) => {
    e.preventDefault();
    close();
  });
  const save = h(acts, "button", "zl-drw-b is-loud");
  save.addEventListener("click", (e) => {
    e.preventDefault();
    void doSave();
  });
  scrim.addEventListener("click", (e) => {
    e.preventDefault();
    close();
  });
  const value = () => {
    const n = Number(st.s || "0");
    return dec ? Math.round(n * 10 ** dec) / 10 ** dec : n;
  };
  const total = () => st.mode === "add" ? o.current + value() : value();
  function paint(dir) {
    const body = st.s ? dec ? shown(st.s) : num(value()) : "0";
    const lead = o.current > 0 && !o.setOnly ? st.mode === "add" ? "+" : BLANK2 : "";
    flap.set(lead + body.padStart(W, BLANK2), dir);
    flap.el.style.transform = "";
    const room = fb.clientWidth, w = flap.el.scrollWidth;
    if (room && w > room) flap.el.style.transform = `scale(${room / w})`;
    totalRow.toggleClass("is-off", !(o.current > 0));
    totalK.textContent = o.sub.toLowerCase() === t("today").toLowerCase() ? t("cNewTotalToday") : t("cNewTotal");
    totalV.textContent = num(total());
    save.textContent = st.s ? `${t("save").toUpperCase()} ${dec ? shown(st.s) : num(total())} \u2192` : t("save").toUpperCase();
  }
  function press(k) {
    if (k === "C") st.s = "";
    else if (k === "<") st.s = st.s.slice(0, -1);
    else if (k === ".") {
      if (!st.s.includes(".")) st.s = (st.s || "0") + ".";
    } else {
      const [a, b] = st.s.split(".");
      if (b !== void 0 ? b.length >= dec : a.length >= MAX) return;
      st.s = (st.s + k).replace(/^0+(?=\d)/, "");
    }
    paint(k === "<" ? "del" : void 0);
  }
  const onKey = (e) => {
    if (/^[0-9]$/.test(e.key) || dec && e.key === ".") press(e.key);
    else if (e.key === "Backspace") press("<");
    else if (e.key === "Escape") close();
    else if (e.key === "Enter") void doSave();
    else return;
    e.preventDefault();
    e.stopPropagation();
  };
  document.addEventListener("keydown", onKey, true);
  let busy = false;
  async function doSave() {
    if (busy) return;
    if (!st.s) {
      new import_obsidian13.Notice(t("cTypeAmount"));
      return;
    }
    busy = true;
    try {
      await o.save(total());
      close();
    } finally {
      busy = false;
    }
  }
  let closed = false;
  function close() {
    if (closed) return;
    closed = true;
    if (openNow === close) openNow = null;
    document.removeEventListener("keydown", onKey, true);
    if (calm()) {
      if (o.host) {
        wrap.style.opacity = "0";
        window.setTimeout(() => wrap.remove(), 450);
      } else wrap.remove();
      return;
    }
    wrap.addClass("is-out");
    window.setTimeout(() => wrap.remove(), o.host ? 450 : 200);
  }
  openNow = close;
  paint();
  if (!calm()) requestAnimationFrame(() => wrap.addClass("is-in"));
  else wrap.addClass("is-in", "is-still");
};
var padPage = (ctx) => {
  window.setTimeout(() => ctx.pop(), 0);
  return { title: ctx.frame.title, el: page(ctx.frame.title) };
};

// src/ui/sheet.ts
var iosOnly = () => /iPhone|iPad/.test(navigator.userAgent) && !window.Capacitor?.Plugins?.Haptics;
var KB_KEY = "ledgerline-kb";
var kbSave = (kind, px) => {
  const c = kbCache();
  c[kind] = px;
  try {
    localStorage.setItem(KB_KEY, JSON.stringify(c));
  } catch {
  }
};
var kbCache = () => {
  try {
    return JSON.parse(localStorage.getItem(KB_KEY) || "{}");
  } catch {
    return {};
  }
};
var isField = (el) => el instanceof HTMLInputElement || el instanceof HTMLSelectElement;
var kbKind = (el) => el instanceof HTMLSelectElement ? "select" : el instanceof HTMLInputElement ? el.type === "date" ? "date" : el.inputMode || el.type || "text" : "text";
var centerCard = (m) => {
  if (!document.body.hasClass("is-phone")) return;
  const el = m.modalEl, vv = window.visualViewport;
  window.setTimeout(() => el.addClass("is-ready"), 240);
  const stopSlide = () => [el, el.parentElement].forEach((x) => x?.getAnimations().forEach((a) => {
    if (!("animationName" in a)) a.cancel();
  }));
  stopSlide();
  window.requestAnimationFrame(stopSlide);
  const appArea = document.querySelector(".app-container");
  let kind = "text", moveTimer = 0;
  const settle = () => {
    el.removeClass("is-moving");
    const a = document.activeElement;
    if (a instanceof HTMLInputElement && el.contains(a) && a.type === "text") {
      const p02 = a.selectionStart, p1 = a.selectionEnd;
      if (p02 !== null && p1 !== null) a.setSelectionRange(p02, p1);
    }
  };
  const lift = (kb) => {
    const H = window.innerHeight, h2 = el.offsetHeight;
    const side = window.innerWidth > H;
    if (!side) {
      const kbPx = `${Math.round(kb)}px`;
      el.style.removeProperty("--zl-lift");
      el.style.maxHeight = "";
      if (el.style.getPropertyValue("--zl-kb") === kbPx) return;
      el.addClass("is-moving");
      el.style.setProperty("--zl-kb", kbPx);
      window.clearTimeout(moveTimer);
      moveTimer = window.setTimeout(() => {
        settle();
        document.activeElement?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
      }, 280);
      return;
    }
    const up = kb > 0 ? Math.max(0, (H + h2) / 2 + 12 - (H - kb)) : 0;
    const next = `${Math.round(Math.min(up, (H - h2) / 2 - 8))}px`;
    el.style.maxHeight = kb > 0 ? `${H - kb - 24}px` : "";
    if (el.style.getPropertyValue("--zl-lift") === next) return;
    el.addClass("is-moving");
    el.style.setProperty("--zl-lift", next);
    window.clearTimeout(moveTimer);
    moveTimer = window.setTimeout(settle, 280);
  };
  const measure = () => Math.round(Math.max(
    appArea ? window.innerHeight - appArea.getBoundingClientRect().bottom : 0,
    vv ? window.innerHeight - (vv.height + vv.offsetTop) : 0,
    0
  ));
  const focused = () => el.contains(document.activeElement) && isField(document.activeElement);
  const fit2 = () => {
    const kb = measure();
    if (kb > 40 && focused()) {
      const c = kbCache();
      c[kind] = kb;
      try {
        localStorage.setItem(KB_KEY, JSON.stringify(c));
      } catch {
      }
    }
    if (focused()) {
      if (kb > 0) lift(kb);
    } else lift(0);
  };
  let holdUntil = 0;
  const hold = () => {
    if (Date.now() < holdUntil && (window.scrollY || document.documentElement.scrollTop)) window.scrollTo(0, 0);
  };
  window.addEventListener("scroll", hold, { passive: true });
  vv?.addEventListener("scroll", hold);
  const onFocusIn = (e) => {
    if (!isField(e.target)) return;
    holdUntil = Date.now() + 700;
    kind = kbKind(e.target);
    lift(kbCache()[kind] || 0);
  };
  const onFocusOut = (e) => {
    if (isField(e.relatedTarget) && el.contains(e.relatedTarget)) return;
    window.setTimeout(() => {
      if (!focused()) lift(0);
    }, 0);
  };
  el.addEventListener("focusin", onFocusIn);
  el.addEventListener("focusout", onFocusOut);
  const ro = appArea ? new ResizeObserver(fit2) : null;
  if (appArea) ro?.observe(appArea);
  vv?.addEventListener("resize", fit2);
  window.addEventListener("resize", fit2);
  const close = m.onClose.bind(m);
  m.onClose = () => {
    window.removeEventListener("scroll", hold);
    vv?.removeEventListener("scroll", hold);
    ro?.disconnect();
    vv?.removeEventListener("resize", fit2);
    window.removeEventListener("resize", fit2);
    close();
  };
};
var closeLogged = /* @__PURE__ */ new Set();
var closeSeen = (x) => {
  const k = `${x.tagName}.${x.className}`;
  if (closeLogged.has(k)) return;
  closeLogged.add(k);
  window.zlDebug?.(`sheet close button removed: ${x.tagName.toLowerCase()}.${[...x.classList].join(".")} in ${x.parentElement?.className ?? "?"}`);
};
var eatTap = () => {
  const evs = ["pointerup", "pointermove", "touchend", "touchmove", "mousedown", "mouseup", "click", "contextmenu"];
  const stop = (e) => {
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  };
  let t2 = 0;
  const done = () => evs.forEach((ev) => window.removeEventListener(ev, stop, true));
  const up = () => {
    window.clearTimeout(t2);
    t2 = window.setTimeout(done, 350);
  };
  window.addEventListener("pointerup", up, { capture: true, once: true });
  window.addEventListener("pointercancel", up, { capture: true, once: true });
  evs.forEach((ev) => window.addEventListener(ev, stop, { capture: true, passive: false }));
  t2 = window.setTimeout(done, 1500);
};
var upright = () => document.body.hasClass("is-phone") && window.innerWidth <= window.innerHeight;
var slideClose = (m) => {
  const close = m.close.bind(m);
  let leaving = false;
  m.close = () => {
    if (leaving) return;
    leaving = true;
    document.activeElement?.blur?.();
    if (!document.body.hasClass("is-phone")) {
      close();
      return;
    }
    const el = m.modalEl, bg = m.containerEl.querySelector(".modal-bg");
    if (upright()) {
      el.getAnimations().forEach((a) => a.cancel());
      el.addClass("is-drag");
      el.style.transition = "translate .22s cubic-bezier(.4, 0, 1, 1)";
      el.style.translate = `0 ${el.offsetHeight + 40}px`;
      if (bg) {
        bg.style.transition = "opacity .22s";
        bg.style.opacity = "0";
      }
    } else el.addClass("is-leaving");
    window.setTimeout(() => {
      el.style.visibility = "hidden";
      m.containerEl.style.visibility = "hidden";
      close();
    }, 220);
  };
  const bindBg = () => m.containerEl.querySelector(".modal-bg")?.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    eatTap();
    m.close();
  });
  window.requestAnimationFrame(bindBg);
};
var dragClose = (m) => {
  const el = m.modalEl;
  let y0 = 0, x0 = 0, dy = 0, on = false, skip = false, track = [];
  el.addEventListener("touchstart", (e) => {
    const tch = e.touches[0];
    skip = e.touches.length !== 1 || !upright() || !!e.target.closest(".zl-dateblk, input, textarea, .zl-tgrid");
    on = false;
    dy = 0;
    y0 = tch.clientY;
    x0 = tch.clientX;
    track = [{ y: tch.clientY, t: e.timeStamp }];
  }, { passive: true });
  el.addEventListener("touchmove", (e) => {
    if (skip) return;
    const tch = e.touches[0], d = tch.clientY - y0;
    if (!on) {
      if (el.querySelector(".is-scrub")) {
        skip = true;
        return;
      }
      if (d > 6 && Math.abs(d) > Math.abs(tch.clientX - x0) && el.scrollTop <= 0) {
        on = true;
        el.addClass("is-drag");
        el.style.transition = "none";
      } else if (Math.abs(d) > 6) {
        skip = true;
        return;
      } else return;
    }
    e.preventDefault();
    dy = Math.max(0, d);
    el.style.translate = `0 ${dy}px`;
    track.push({ y: tch.clientY, t: e.timeStamp });
    if (track.length > 6) track.shift();
  }, { passive: false });
  const end = () => {
    if (!on) return;
    on = false;
    const a = track[0], b = track[track.length - 1];
    const v = b && a && b.t > a.t ? (b.y - a.y) / (b.t - a.t) : 0;
    if (dy > 120 || v > 0.5) {
      m.close();
      return;
    }
    el.style.transition = "translate .25s cubic-bezier(.38, .7, .125, 1)";
    el.style.translate = "";
    window.setTimeout(() => {
      el.removeClass("is-drag");
      el.style.transition = "";
    }, 260);
  };
  el.addEventListener("touchend", end);
  el.addEventListener("touchcancel", end);
};
var base = (m, title, subtitle) => {
  m.modalEl.addClass("zl-sheet");
  const keep2 = (x, ...need) => need.some((n) => n === x || x.contains(n));
  const dropClose = () => {
    const drop = (x) => {
      closeSeen(x);
      x.remove();
    };
    [...m.containerEl.children].forEach((x) => {
      if (!keep2(x, m.modalEl) && !x.classList.contains("modal-bg")) drop(x);
    });
    [...m.modalEl.children].forEach((x) => {
      if (!keep2(x, m.titleEl, m.contentEl)) {
        drop(x);
        return;
      }
      if (x !== m.titleEl && x !== m.contentEl && x.contains(m.titleEl)) [...x.children].forEach((y) => {
        if (!keep2(y, m.titleEl)) drop(y);
      });
    });
  };
  dropClose();
  window.requestAnimationFrame(dropClose);
  window.setTimeout(dropClose, 50);
  centerCard(m);
  slideClose(m);
  dragClose(m);
  m.titleEl.setText(title);
  const c = m.contentEl;
  c.empty();
  if (subtitle) h(c, "div", "zl-sheet-sub", subtitle);
  return c;
};
var MON4 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var WD = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
var ymdOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
var dayAdd = (s2, n) => {
  const [y, m, d] = s2.split("-").map(Number);
  return ymdOf(new Date(y, (m || 1) - 1, (d || 1) + n));
};
var dayDiff = (a, b) => {
  const t2 = (s2) => {
    const [y, m, d] = s2.split("-").map(Number);
    return Date.UTC(y, (m || 1) - 1, d || 1);
  };
  return Math.round((t2(a) - t2(b)) / 864e5);
};
var dayText = (s2) => {
  if (!s2) return "\u2014";
  const [y, m, d] = s2.split("-").map(Number);
  return `${MON4[(m || 1) - 1]} ${d}${y !== (/* @__PURE__ */ new Date()).getFullYear() ? ` ${y}` : ""}`;
};
var numText = (s2, dec = 0) => {
  if (s2 === "") return "\u2014";
  const n = parseNum(s2);
  return isNaN(n) ? s2 : n.toLocaleString("en", { minimumFractionDigits: dec === 2 ? 2 : 0, maximumFractionDigits: dec });
};
var FormSheet = class extends import_obsidian14.Modal {
  constructor(app, o) {
    super(app);
    this.o = o;
    this.busy = false;
  }
  onOpen() {
    const c = base(this, this.o.title, this.o.subtitle);
    this.containerEl.addClass("zl-sheet-host");
    const ctl = {};
    const rows = {};
    const touched = /* @__PURE__ */ new Set();
    const repaint = [];
    const notes = [];
    let group3 = null, foldBody = null, foldLine = null;
    const values = () => Object.fromEntries(Object.entries(ctl).map(([k, x]) => [k, x.get().trim()]));
    const shown2 = (f, v) => !f.showIf || f.showIf(v);
    const changed = (k) => {
      touched.add(k);
      refresh();
    };
    const foldHost = () => {
      if (foldBody) return foldBody;
      const box = h(c, "div", "zl-fold");
      foldLine = h(box, "button", "zl-fold-line");
      foldBody = h(box, "div", "zl-group zl-form zl-fold-body");
      foldLine.addEventListener("click", (e) => {
        e.preventDefault();
        box.toggleClass("is-open", !box.hasClass("is-open"));
      });
      return foldBody;
    };
    const rowFor = (f, cls) => {
      const parent = f.fold ? foldHost() : group3 ?? (group3 = h(c, "div", "zl-group zl-form"));
      const r = h(parent, "div", `zl-row zl-field ${cls}`);
      const l = h(r, "span", "zl-field-l", f.label);
      if (f.suffix) h(l, "span", "zl-field-x", ` \xB7 ${f.suffix}`);
      rows[f.key] = r;
      if (f.note) {
        const fn = f.note;
        const n = h(parent, "div", "zl-field-note");
        notes.push(() => {
          const v = values();
          n.textContent = fn(v);
          n.toggleClass("is-hidden", !shown2(f, v));
        });
      }
      return r;
    };
    for (const f of this.o.fields) {
      const val = f.value === void 0 || f.value === null ? "" : String(f.value);
      if (f.off) {
        let cur2 = val;
        ctl[f.key] = { get: () => cur2, set: (v) => {
          cur2 = v;
        }, text: () => cur2 };
        rows[f.key] = createDiv();
        continue;
      }
      if (val !== "") touched.add(f.key);
      if (f.type === "tiles") {
        group3 = null;
        const box = h(c, "div", "zl-tiles-box");
        rows[f.key] = box;
        h(box, "div", "zl-gh", f.label);
        const grid2 = h(box, "div", "zl-tiles");
        let cur2 = String(f.value ?? f.tiles?.[0]?.value ?? "");
        const paint2 = () => grid2.querySelectorAll(".zl-tile").forEach((x) => x.toggleClass("is-on", x.dataset.v === cur2));
        ctl[f.key] = { get: () => cur2, set: (v) => {
          cur2 = v;
          paint2();
        }, text: () => cur2 };
        for (const tl of f.tiles ?? []) {
          const b = h(grid2, "button", "zl-tile");
          b.dataset.v = tl.value;
          if (tl.icon) sprite(b, pixelFor(tl.icon, tl.title), "zl-px zl-tile-ic");
          h(b, "div", "zl-tile-t", tl.title);
          if (tl.sub) h(b, "div", "zl-tile-s", tl.sub);
          b.addEventListener("click", (e) => {
            e.preventDefault();
            cur2 = tl.value;
            paint2();
            changed(f.key);
          });
        }
        paint2();
        continue;
      }
      if (f.type === "select") {
        const opts = f.options ?? [];
        const r2 = rowFor(f, "zl-pick");
        const box = h(r2, "div", opts.length <= 3 ? "zl-words" : "zl-chips");
        let cur2 = val || (opts[0]?.[0] ?? "");
        const a = f.ask;
        const paint2 = () => box.querySelectorAll("button").forEach((x) => {
          x.toggleClass("is-on", x.dataset.v === cur2);
          if (a && x.dataset.v === a.value) {
            const nm = ctl[a.into]?.get();
            x.textContent = nm || (opts.find((o) => o[0] === a.value)?.[1] ?? "");
          }
        });
        for (const [v, lab] of opts) {
          const b = h(box, "button", "zl-chip", lab);
          b.dataset.v = v;
          b.addEventListener("click", (e) => {
            e.preventDefault();
            if (a && v === a.value) {
              openText(this.containerEl, { title: a.title, sub: this.o.title, value: ctl[a.into]?.get() ?? "", placeholder: a.placeholder, save: (nm) => {
                if (!nm) return;
                ctl[a.into]?.set(nm);
                touched.add(a.into);
                cur2 = v;
                paint2();
                changed(f.key);
              } });
              return;
            }
            cur2 = v;
            paint2();
            changed(f.key);
          });
        }
        ctl[f.key] = { get: () => cur2, set: (v) => {
          cur2 = v;
          paint2();
        }, text: () => opts.find((x) => x[0] === cur2)?.[1] ?? cur2 };
        paint2();
        continue;
      }
      if (f.type === "number") {
        const r2 = rowFor(f, "zl-dial");
        const right = h(r2, "span", "zl-dial-r");
        const tag = h(right, "span", "zl-dial-tag");
        const out2 = h(right, "span", "zl-dial-v");
        const decOf = () => typeof f.dec === "function" ? f.dec(values()) : f.dec ?? (f.suffix === "%" ? 4 : 0);
        const stepOf = () => typeof f.step === "function" ? f.step(values()) : f.step ?? (f.suffix === "%" ? 0.1 : f.suffix ? notchFor(f.suffix) : 1);
        let cur2 = val;
        const paint2 = () => {
          const dec = decOf();
          out2.textContent = numText(cur2, dec);
          out2.toggleClass("is-empty", cur2 === "");
          const tg = f.tag?.(values()) ?? "";
          tag.textContent = tg;
        };
        ctl[f.key] = { get: () => cur2, set: (v) => {
          cur2 = v;
          paint2();
        }, text: () => numText(cur2, decOf()) };
        const put = (n) => {
          const sc = 10 ** decOf();
          cur2 = String(Math.round(n * sc) / sc);
          paint2();
          changed(f.key);
        };
        scrub(r2, () => {
          const dec = decOf(), scale = 10 ** dec, st = stepOf();
          return { value: Math.round((parseNum(cur2) || 0) * scale), step: Math.max(1, Math.round(st * scale)), label: f.label, fmt: (n) => numText(String(n / scale), dec), live: (n) => {
            out2.textContent = numText(String(n / scale), dec);
          }, done: (n) => put(n / scale) };
        });
        r2.addEventListener("click", (e) => {
          e.preventDefault();
          openPad({}, { title: f.label, sub: this.o.title, current: parseNum(cur2) || 0, cur: "", setOnly: true, dec: decOf(), chips: [], host: this.containerEl, save: async (n) => put(n) });
        });
        paint2();
        continue;
      }
      if (f.type === "grid") {
        const r2 = rowFor(f, "zl-pick");
        const grid2 = h(r2, "div", "zl-tgrid");
        let cur2 = val;
        const paint2 = () => {
          const cs = f.cells?.(values()) ?? [];
          if (!cs.some((x) => x.value === cur2)) cur2 = cs[0]?.value ?? "";
          grid2.empty();
          for (const x of cs) {
            const b = h(grid2, "button", "zl-tg" + (x.dim ? " is-dim" : "") + (!f.tap && x.value === cur2 ? " is-on" : ""));
            const top = h(b, "span", "zl-tg-top");
            sprite(top, rowSprite(x.k), "zl-px zl-tg-ic");
            h(top, "span", "zl-tg-k", x.k);
            const vEl = h(b, "span", "zl-tg-v", x.v);
            if (f.hold) {
              const hd = f.hold;
              scrub(b, () => {
                const o = hd(x.value, values()) ?? { value: 0, step: 1, label: x.k, fmt: String, done: () => void 0 };
                return { ...o, live: (n) => {
                  vEl.textContent = o.fmt(n);
                  b.toggleClass("is-dim", !n);
                  o.live?.(n);
                } };
              });
            }
            b.addEventListener("click", (e) => {
              e.preventDefault();
              if (f.tap) {
                f.tap(x.value, values(), { close: () => this.close(), host: this.containerEl });
                return;
              }
              const a = f.ask;
              if (a && x.value === a.value) {
                openText(this.containerEl, { title: a.title, sub: this.o.title, value: ctl[a.into]?.get() ?? "", placeholder: a.placeholder, save: (name) => {
                  if (!name) return;
                  ctl[a.into]?.set(name);
                  touched.add(a.into);
                  cur2 = x.value;
                  changed(f.key);
                } });
                return;
              }
              cur2 = x.value;
              changed(f.key);
            });
          }
        };
        ctl[f.key] = { get: () => cur2, set: (v) => {
          cur2 = v;
        }, text: () => cur2 };
        repaint.push(paint2);
        continue;
      }
      if (f.type === "date") {
        const r2 = rowFor(f, "zl-datek");
        const blk = h(r2, "div", "zl-dateblk");
        blk.setAttribute("role", "button");
        h(blk, "span", "zl-dateblk-a", "\u2039");
        const mid = h(blk, "span", "zl-dateblk-m");
        const rel = h(mid, "span", "zl-dateblk-r");
        const day = h(mid, "span", "zl-dateblk-d");
        h(blk, "span", "zl-dateblk-a", "\u203A");
        const pick = h(blk, "input", "zl-date-pick");
        pick.type = "date";
        pick.tabIndex = -1;
        let cur2 = val;
        const now = () => ymdOf(/* @__PURE__ */ new Date());
        const show = (d) => {
          const n2 = d ? dayDiff(d, now()) : NaN;
          rel.textContent = !d ? "\u2014" : n2 === 0 ? t("today").toUpperCase() : n2 === -1 ? t("yesterday").toUpperCase() : n2 === 1 ? t("tomorrow").toUpperCase() : WD[(/* @__PURE__ */ new Date(`${d}T12:00:00`)).getDay()];
          day.textContent = d ? dayText(d) : "";
        };
        const paint2 = () => {
          show(cur2);
          pick.value = cur2 || ymdOf(/* @__PURE__ */ new Date());
        };
        ctl[f.key] = { get: () => cur2, set: (v) => {
          cur2 = v;
          paint2();
        }, text: () => dayText(cur2) };
        const put = (v) => {
          cur2 = v;
          paint2();
          changed(f.key);
        };
        const STEP = 36;
        let x0 = 0, y0 = 0, id = -1, moved = false, base2 = "", n = 0;
        blk.addEventListener("pointerdown", (e) => {
          id = e.pointerId;
          x0 = e.clientX;
          y0 = e.clientY;
          moved = false;
          n = 0;
          base2 = cur2 || now();
        });
        blk.addEventListener("pointermove", (e) => {
          if (e.pointerId !== id) return;
          const dx = e.clientX - x0;
          if (!moved && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(e.clientY - y0)) {
            moved = true;
            try {
              blk.setPointerCapture(id);
            } catch {
            }
            blk.addClass("is-swipe");
          }
          if (!moved) return;
          const k = -Math.trunc(dx / STEP);
          if (k !== n) {
            n = k;
            show(dayAdd(base2, n));
            if (!iosOnly()) tick();
          }
          mid.style.transform = `translateX(${Math.max(-24, Math.min(24, dx - Math.trunc(dx / STEP) * STEP))}px)`;
        });
        const end = (e) => {
          if (e.pointerId !== id) return;
          id = -1;
          mid.style.transform = "";
          blk.removeClass("is-swipe");
          if (moved && n) {
            put(dayAdd(base2, n));
            tick();
          }
        };
        blk.addEventListener("pointerup", end);
        blk.addEventListener("pointercancel", (e) => {
          if (e.pointerId === id) {
            id = -1;
            mid.style.transform = "";
            blk.removeClass("is-swipe");
            paint2();
          }
        });
        blk.addEventListener("click", (e) => {
          if (moved) {
            e.preventDefault();
            moved = false;
            return;
          }
          if (!import_obsidian14.Platform.isMobile) {
            try {
              pick.showPicker?.();
            } catch {
            }
          }
        });
        pick.addEventListener("change", () => {
          if (pick.value) {
            put(pick.value);
            tick();
          }
        });
        paint2();
        continue;
      }
      const r = rowFor(f, "zl-text");
      const out = h(r, "span", "zl-text-v");
      let cur = val;
      const up = f.key === "ticker";
      const paint = () => {
        out.textContent = cur || f.placeholder || "\u2014";
        out.toggleClass("is-empty", !cur);
      };
      ctl[f.key] = { get: () => cur, set: (v) => {
        cur = v;
        paint();
      }, text: () => cur || "\u2014" };
      r.addEventListener("click", (e) => {
        e.preventDefault();
        openText(this.containerEl, { title: f.label, sub: this.o.title, value: cur, placeholder: f.placeholder, upper: up, save: (v) => {
          cur = v;
          paint();
          changed(f.key);
        } });
      });
      paint();
    }
    const totalEl = h(c, "div", "zl-sheet-total" + (this.o.total ? "" : " is-hidden"));
    const bar = h(c, "div", "zl-sheet-btns");
    const msg = createDiv({ cls: "zl-sheet-msg" });
    let msgT = 0;
    const hint = (m) => {
      window.clearTimeout(msgT);
      if (!m) {
        msg.removeClass("is-on");
        return;
      }
      if (!msg.isConnected) this.containerEl.appendChild(msg);
      msg.textContent = m;
      msg.addClass("is-on");
      msgT = window.setTimeout(() => msg.removeClass("is-on"), 2e3);
    };
    const ok = h(bar, "button", "mod-cta zl-sheet-ok");
    if (!this.o.submitText) ok.addClass("is-hidden");
    const check = () => {
      const v = values();
      for (const f of this.o.fields) {
        if (!shown2(f, v)) continue;
        if (f.type === "number" && v[f.key] !== "") {
          const n = parseNum(v[f.key]);
          if (isNaN(n) || n < 0) return t("invalidNumber");
          if (f.required && !(n > 0)) return t("invalidAmount");
        } else if (f.required && !v[f.key]) return f.type === "number" ? t("invalidAmount") : t("required", { field: f.label.toLowerCase() });
      }
      return this.o.validate ? this.o.validate(v) : null;
    };
    let first2 = true;
    const refresh = () => {
      for (const f of this.o.fields) if (f.auto && !touched.has(f.key)) ctl[f.key].set(f.auto(values()));
      const v = values();
      for (const f of this.o.fields) rows[f.key].toggleClass("is-hidden", !shown2(f, v));
      repaint.forEach((p) => p());
      Object.assign(v, values());
      for (const f of this.o.fields) if (f.type === "number" && f.tag) ctl[f.key].set(ctl[f.key].get());
      if (foldLine) foldLine.textContent = this.o.fields.filter((f) => f.fold && shown2(f, v)).map((f) => {
        const b = f.brief?.(v);
        return `${f.label.replace(/ \(.*\)$/, "")} ${ctl[f.key].text()}${b ? ` (${b})` : ""}`;
      }).join(" \xB7 ") + " \u203A";
      notes.forEach((n) => n());
      const tot = this.o.total?.(v) ?? null;
      totalEl.textContent = tot?.text ?? "\xA0";
      totalEl.toggleClass("is-bad", !!tot?.bad);
      ok.textContent = typeof this.o.submitText === "function" ? this.o.submitText(v) : this.o.submitText ?? "";
      const m = check();
      ok.toggleClass("is-blocked", !!m);
      ok.disabled = this.busy;
    };
    refresh();
    first2 = false;
    const submit = async () => {
      if (this.busy) return;
      const m = check();
      if (m) {
        hint(m);
        return;
      }
      this.busy = true;
      refresh();
      try {
        if (await this.o.onSubmit(values()) !== false) this.close();
      } finally {
        this.busy = false;
        refresh();
      }
    };
    ok.addEventListener("click", () => {
      void submit();
    });
    if (this.o.submitText) this.scope.register([], "Enter", () => {
      void submit();
      return false;
    });
    if (this.o.danger) {
      const d = this.o.danger;
      const b = h(bar, "button", "mod-warning zl-sheet-danger", d.text);
      b.addEventListener("click", async () => {
        if (await d.onTap()) this.close();
      });
    }
  }
  onClose() {
    this.contentEl.empty();
  }
};
var ChoiceSheet = class extends import_obsidian14.Modal {
  constructor(app, title, choices, onChoose, subtitle) {
    super(app);
    this.title = title;
    this.choices = choices;
    this.onChoose = onChoose;
    this.subtitle = subtitle;
  }
  onOpen() {
    const c = base(this, this.title, this.subtitle);
    const g = h(c, "div", "zl-group");
    for (const ch of this.choices) {
      const r = h(g, "div", "zl-row is-tap");
      const main = h(r, "div", "zl-row-main");
      h(main, "div", "zl-row-t", ch.label);
      if (ch.hint) h(main, "div", "zl-row-s", ch.hint);
      r.addEventListener("click", () => {
        this.close();
        void this.onChoose(ch.value);
      });
    }
    const bar = h(c, "div", "zl-sheet-btns");
    h(bar, "button", "", t("cancel")).addEventListener("click", () => this.close());
  }
  onClose() {
    this.contentEl.empty();
  }
};
var confirmSheet = (app, title, text2, okText) => new Promise((resolve) => {
  const m = new import_obsidian14.Modal(app);
  let answer2 = false;
  const c = base(m, title, text2);
  const bar = h(c, "div", "zl-sheet-btns");
  h(bar, "button", "mod-warning", okText).addEventListener("click", () => {
    answer2 = true;
    m.close();
  });
  h(bar, "button", "", t("cancel")).addEventListener("click", () => m.close());
  const done = m.onClose.bind(m);
  m.onClose = () => {
    done();
    resolve(answer2);
  };
  m.open();
});
var MonthSheet = class extends import_obsidian14.Modal {
  constructor(app, title, sel, go) {
    super(app);
    this.title = title;
    this.sel = sel;
    this.go = go;
  }
  onOpen() {
    const c = base(this, this.title);
    let year = this.sel.year;
    const head = h(c, "div", "zl-words zl-mpick-y");
    const prev = h(head, "button", "zl-chip zl-chip-arw", "\u2039");
    const yl = h(head, "button", "zl-chip is-on");
    const next = h(head, "button", "zl-chip zl-chip-arw", "\u203A");
    const grid2 = h(c, "div", "zl-mpick");
    const now = /* @__PURE__ */ new Date();
    const paint = () => {
      yl.textContent = String(year);
      grid2.empty();
      MON4.forEach((m, i) => {
        const b = h(grid2, "button", "zl-chip" + (year === this.sel.year && i === this.sel.month ? " is-on" : "") + (year === now.getFullYear() && i === now.getMonth() ? " is-now" : ""), m.toUpperCase());
        b.addEventListener("click", (e) => {
          e.preventDefault();
          this.close();
          this.go(year, i);
        });
      });
    };
    prev.addEventListener("click", (e) => {
      e.preventDefault();
      year--;
      paint();
    });
    next.addEventListener("click", (e) => {
      e.preventDefault();
      year++;
      paint();
    });
    const bar = h(c, "div", "zl-sheet-btns");
    h(bar, "button", "", t("thisMonth")).addEventListener("click", () => {
      this.close();
      this.go(now.getFullYear(), now.getMonth());
    });
    paint();
  }
  onClose() {
    this.contentEl.empty();
  }
};
var keepTaps = (wrap) => {
  for (const ev of ["pointerdown", "pointerup", "mousedown", "mouseup", "click", "touchstart", "touchend"]) wrap.addEventListener(ev, (e) => e.stopPropagation());
};
var openText = (host, o) => {
  const wrap = h(host, "div", "zl-txt");
  keepTaps(wrap);
  const scrim = h(wrap, "div", "zl-txt-scrim");
  const card = h(wrap, "div", "zl-txt-card");
  const head = h(card, "div", "zl-txt-h");
  h(head, "div", "zl-txt-t", o.title.replace(/ \(.*\)$/, ""));
  if (o.sub) h(head, "div", "zl-txt-s", o.sub);
  const ta = h(card, "textarea", "zl-txt-in");
  ta.value = o.value;
  ta.placeholder = o.placeholder ?? "";
  ta.rows = 3;
  ta.setAttribute("enterkeyhint", "done");
  if (o.upper) {
    ta.setAttribute("autocapitalize", "characters");
    ta.setAttribute("autocorrect", "off");
    ta.spellcheck = false;
  }
  const btns = h(card, "div", "zl-txt-btns");
  const cancel = h(btns, "button", "zl-txt-b", t("cancel").toUpperCase());
  const done = h(btns, "button", "zl-txt-b is-loud", t("done").toUpperCase());
  const vv = window.visualViewport, appArea = document.querySelector(".app-container");
  const kbNow = () => Math.round(Math.max(appArea ? window.innerHeight - appArea.getBoundingClientRect().bottom : 0, vv ? window.innerHeight - (vv.height + vv.offsetTop) : 0, 0));
  let kb = kbCache().text || Math.round(window.innerHeight * 0.4), caretT = 0;
  const place = () => {
    const m = kbNow();
    if (m > 40) kb = m;
    const room = window.innerHeight - kb;
    const top = `${Math.max(12, Math.round((room - card.offsetHeight) / 2))}px`;
    if (card.style.top === top) return;
    card.style.top = top;
    window.clearTimeout(caretT);
    caretT = window.setTimeout(() => {
      if (document.activeElement === ta) {
        const p02 = ta.selectionStart, p1 = ta.selectionEnd;
        ta.setSelectionRange(p02, p1);
      }
    }, 300);
  };
  const hold = () => {
    if (window.scrollY || document.documentElement.scrollTop) window.scrollTo(0, 0);
  };
  window.addEventListener("scroll", hold, { passive: true });
  vv?.addEventListener("scroll", hold);
  vv?.addEventListener("resize", place);
  const ro = appArea ? new ResizeObserver(place) : null;
  if (appArea) ro?.observe(appArea);
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    window.removeEventListener("scroll", hold);
    vv?.removeEventListener("scroll", hold);
    vv?.removeEventListener("resize", place);
    ro?.disconnect();
    ta.blur();
    wrap.addClass("is-out");
    window.setTimeout(() => wrap.remove(), 450);
  };
  const ok = () => {
    const v = ta.value.replace(/\s+/g, " ").trim();
    o.save(o.upper ? v.toUpperCase() : v);
    close();
  };
  cancel.addEventListener("click", (e) => {
    e.preventDefault();
    close();
  });
  done.addEventListener("click", (e) => {
    e.preventDefault();
    ok();
  });
  scrim.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    close();
  });
  ta.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      ok();
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      close();
    }
  });
  place();
  window.setTimeout(() => card.addClass("is-set"), 260);
  ta.focus({ preventScroll: true });
  ta.setSelectionRange(ta.value.length, ta.value.length);
};

// src/ui/search.ts
var openSearch = (from, src, o) => {
  const app = from.closest(".zl-app");
  if (!app || app.hasClass("zl-searching")) return;
  src.warm();
  app.addClass("zl-searching");
  const layer = h(app, "div", "zl-search");
  const fixH = () => {
    if (!open2) {
      layer.style.bottom = "auto";
      layer.style.height = `${window.innerHeight}px`;
    }
  };
  const halves = h(layer, "div", "zl-shalves");
  const bot = h(halves, "div", "zl-shalf"), botHead = h(bot, "div", "zl-slist-h zl-shalf-h"), list5 = h(bot, "div", "zl-shalf-b zl-slist");
  const bar = h(layer, "div", "zl-sbar");
  sprite(bar, "search", "zl-px zl-sbar-ic");
  const input = h(bar, "input", "zl-sbar-in");
  Object.assign(input, { type: "search", placeholder: o.texts.placeholder, autocomplete: "off", spellcheck: false });
  input.setAttribute("autocapitalize", "characters");
  input.setAttribute("autocorrect", "off");
  input.setAttribute("enterkeyhint", "go");
  const cancel = h(bar, "button", "zl-sbar-x", o.texts.cancel);
  const vv = window.visualViewport, appArea = document.querySelector(".app-container");
  const kbNow = () => Math.round(Math.max(appArea ? window.innerHeight - appArea.getBoundingClientRect().bottom : 0, vv ? window.innerHeight - (vv.height + vv.offsetTop) : 0, 0));
  const c0 = kbCache();
  let kbUp = c0.search || c0.text || Math.round(window.innerHeight * 0.4), open2 = false;
  fixH();
  window.addEventListener("resize", fixH);
  let cur = 0;
  const put = (y, instant = false) => {
    cur = y;
    const lifted = Math.max(0, Math.round(window.innerHeight - layer.getBoundingClientRect().bottom)), t2 = Math.max(0, y - lifted);
    if (instant) bar.style.transition = "none";
    bar.style.transform = `translateY(${-t2}px)`;
    halves.style.bottom = `${t2 + bar.offsetHeight + (parseFloat(getComputedStyle(bar).bottom) || 0) + 12}px`;
    layer.toggleClass("has-kb", y > 0);
    if (instant) {
      void bar.offsetWidth;
      bar.style.transition = "";
    }
  };
  const log = (w) => window.zlDebug?.(`search ${w}: inner ${window.innerHeight}, vv ${vv ? `${Math.round(vv.height)}+${Math.round(vv.offsetTop)}` : "-"}, app foot ${appArea ? Math.round(appArea.getBoundingClientRect().bottom) : "-"}, layer foot ${Math.round(layer.getBoundingClientRect().bottom)}, kb ${kbUp}, bar foot ${Math.round(bar.getBoundingClientRect().bottom)}`);
  const measure = () => {
    const m = kbNow();
    if (open2 && m > 40 && Math.abs(m - kbUp) > 2) {
      kbUp = m;
      kbSave("search", m);
      put(m);
    }
  };
  const lro = new ResizeObserver(() => put(cur, true));
  lro.observe(layer);
  const hold = () => {
    if (window.scrollY || document.documentElement.scrollTop) window.scrollTo(0, 0);
  };
  window.addEventListener("scroll", hold, { passive: true });
  vv?.addEventListener("scroll", hold);
  vv?.addEventListener("resize", measure);
  const ro = appArea ? new ResizeObserver(measure) : null;
  if (appArea) ro?.observe(appArea);
  input.addEventListener("focus", () => {
    open2 = true;
    put(kbUp);
    window.setTimeout(() => log("kb up"), 900);
  });
  input.addEventListener("blur", () => {
    open2 = false;
    put(0);
  });
  put(0);
  void bar.offsetWidth;
  layer.addClass("is-on");
  input.focus({ preventScroll: true });
  let seq = 0, timer = 0, closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    window.clearTimeout(timer);
    seq++;
    window.removeEventListener("scroll", hold);
    window.removeEventListener("resize", fixH);
    vv?.removeEventListener("scroll", hold);
    vv?.removeEventListener("resize", measure);
    ro?.disconnect();
    lro.disconnect();
    input.blur();
    layer.addClass("is-out");
    app.removeClass("zl-searching");
    window.setTimeout(() => layer.remove(), 260);
  };
  let y0 = 0;
  layer.addEventListener("touchstart", (e) => {
    y0 = e.touches[0].clientY;
    e.stopPropagation();
  }, { passive: true });
  layer.addEventListener("touchmove", (e) => {
    e.stopPropagation();
    if (e.touches[0].clientY - y0 < -12 && document.activeElement === input && !bar.contains(e.target)) input.blur();
  }, { passive: true });
  layer.addEventListener("touchend", (e) => e.stopPropagation(), { passive: true });
  const tap = (el, box, fn) => {
    let x0 = 0, y0t = 0, s0 = 0, armed = false;
    el.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      armed = true;
      x0 = e.clientX;
      y0t = e.clientY;
      s0 = box.scrollTop;
    });
    el.addEventListener("pointermove", (e) => {
      if (armed && Math.hypot(e.clientX - x0, e.clientY - y0t) > 8) armed = false;
    });
    el.addEventListener("pointercancel", () => {
      armed = false;
    });
    el.addEventListener("pointerleave", () => {
      armed = false;
    });
    el.addEventListener("pointerup", (e) => {
      if (!armed) return;
      armed = false;
      if (Math.abs(box.scrollTop - s0) > 2) return;
      e.preventDefault();
      fn();
    });
  };
  const go = (tk, name = "") => {
    const k = tk.trim().toUpperCase();
    if (!k) return;
    src.remember(k, name);
    input.blur();
    close();
    o.pick(k);
  };
  const headOf = (hd, head, act2, label = o.texts.clear) => {
    hd.empty();
    hd.toggleClass("is-hidden", !head);
    h(hd, "span", "", head);
    if (act2) {
      const c = h(hd, "button", "zl-slist-c", label);
      c.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        act2();
      });
    }
  };
  const rows = (hits, head = "", clear) => {
    list5.empty();
    list5.scrollTop = 0;
    headOf(botHead, head, clear);
    if (!hits.length) {
      h(list5, "div", "zl-slist-none", o.texts.none);
      return;
    }
    for (const x of hits) {
      const r = h(list5, "button", "zl-slist-r");
      h(r, "span", "zl-slist-tk", x.tk);
      h(r, "span", "zl-slist-n", x.name);
      h(r, "span", "zl-slist-ex", x.mine === "held" ? o.texts.held : x.mine === "watch" ? o.texts.watch : x.ex);
      tap(r, list5, () => go(x.tk, x.name));
    }
  };
  const recent = () => {
    const r = src.recent();
    rows(r.map((tk) => ({ tk, name: src.nameOf(tk), ex: "" })), o.texts.recent, r.length ? () => {
      src.forget();
      recent();
    } : void 0);
    if (!r.length) list5.empty();
  };
  const update = () => {
    const q = input.value.trim();
    window.clearTimeout(timer);
    const n = ++seq;
    if (!q) {
      recent();
      return;
    }
    const here = mergeHits(o.mine(q), src.listed(q));
    rows(here);
    timer = window.setTimeout(() => {
      void src.remote(q).then((far) => {
        if (n === seq) rows(mergeHits(here, far).slice(0, 12));
      });
    }, 250);
  };
  input.addEventListener("input", update);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      go(input.value);
    } else if (e.key === "Escape") close();
  });
  cancel.addEventListener("click", (e) => {
    e.preventDefault();
    input.blur();
    close();
  });
  const page3 = from.dataset.page;
  const watch = new MutationObserver(() => {
    if (closed) {
      watch.disconnect();
      return;
    }
    if (from.isConnected) return;
    const now = app.querySelector("[data-page]");
    if (page3 && now && now.dataset.page === page3) {
      from = now;
      return;
    }
    watch.disconnect();
    close();
  });
  watch.observe(app, { childList: true, subtree: true });
  recent();
};

// src/pages/flows.ts
var NS4 = "http://www.w3.org/2000/svg";
var signed2 = (n) => `${n > 0 ? "+" : n < 0 ? "\u2212" : ""}${num(Math.abs(n))}`;
var L = (n) => signed2(lots(n));
var short = (n) => {
  const a = Math.abs(n), s2 = n < 0 ? "\u2212" : "";
  return a >= 1e6 ? `${s2}${+(a / 1e6).toFixed(1)}M` : a >= 1e3 ? `${s2}${+(a / 1e3).toFixed(a >= 1e5 ? 0 : 1)}K` : `${s2}${a}`;
};
var streakText = (k) => !k ? t("fFlat") : Math.abs(k) === 1 ? t(k > 0 ? "fBuy1" : "fSell1") : t(k > 0 ? "fBuyN" : "fSellN", { n: Math.abs(k) });
var NAME = { f: "fF", t: "fT", d: "fD" };
var EN = { f: "fFEn", t: "fTEn", d: "fDEn" };
var SPAN = 20;
var flowCodes = (ctx, tickers) => tickers.map((tk) => Flows.code(ctx.plugin.prices.symbol(tk))).filter((c) => !!c);
var flowsTile = (ctx, tk, codes) => {
  const code = Flows.code(ctx.plugin.prices.symbol(tk));
  if (!code || !codes.includes(code)) return null;
  const flows = ctx.plugin.flows;
  const val = () => {
    const s2 = flows.series(code), last = s2?.[s2.length - 1];
    return last ? { v: short(lots(last.total)), s: `${shortDate(last.date).toUpperCase()} \xB7 ${t("fLots")}`, n: last.total } : { v: "-", s: "", n: 0 };
  };
  const v0 = val();
  flows.ensure(codes);
  const paint = (b) => {
    const x = val();
    b.querySelector(".zl-tg-v")?.setText(x.v);
    (b.querySelector(".zl-tg-s") ?? b.createSpan({ cls: "zl-tg-s" })).setText(x.s);
    b.toggleClass("is-hot", x.n < 0);
    b.toggleClass("is-up", x.n > 0);
    b.toggleClass("is-dim", x.v === "-");
  };
  return {
    k: t("fRowK"),
    icon: "flows",
    v: v0.v,
    s: v0.s,
    dim: v0.v === "-",
    onTap: () => ctx.push({ key: "flows:" + tk, title: t("fTitle", { tk }) }),
    ref: (b) => {
      b.addClass("is-mkt");
      paint(b);
      flows.onChange(() => {
        if (!b.isConnected) return false;
        paint(b);
        return true;
      });
    }
  };
};
var setRow = (r, x) => {
  if (x.k) r.querySelector(".zl-fig-k")?.setText(x.k);
  r.querySelector(".zl-fig-s")?.setText(x.s);
  const v = r.querySelector(".zl-fig-v");
  if (v) {
    v.setText(x.v);
    v.toggleClass("is-hot", !!x.hot);
  }
  r.toggleClass("is-dim", !!x.dim);
};
var flowsPage = (ctx, arg, codes, trade) => {
  const [tk, w0] = arg.split(":"), who = w0 === "f" || w0 === "t" || w0 === "d" ? w0 : null;
  const title = who ? `${tk} ${t(EN[who])}` : t("fTitle", { tk });
  const el = page(title);
  el.addClass("zl-c-stack");
  const fab = { icon: "plus", text: t("iTrade").toUpperCase(), label: t("iTrade"), onTap: () => trade(tk) };
  const flows = ctx.plugin.flows, code = Flows.code(ctx.plugin.prices.symbol(tk));
  if (!code) {
    empty(el, { icon: "flows", title: t("fNone"), text: t("fNoneS") });
    return { title, el, fab };
  }
  flows.ensure(Array.from(/* @__PURE__ */ new Set([...codes, code])));
  let s2 = flows.series(code);
  if (!s2) {
    empty(el, { icon: "flows", title: t("fLoading"), text: t("fLoadingS") });
    flows.onChange(() => {
      if (!el.isConnected) return false;
      if (!flows.series(code)) return true;
      ctx.redraw();
      return false;
    });
    return { title, el, fab };
  }
  const etf = isEtf(code);
  let sumEl = null;
  const top = () => {
    const x = s2, last = x[x.length - 1], k = who ?? "total";
    const items2 = [[t("fDays", { n: 5 }), L(flowSum(x, k, 5)), flowSum(x, k, 5) < 0], [t("fDays", { n: 20 }), L(flowSum(x, k, 20)), flowSum(x, k, 20) < 0]];
    if (who) {
      const r = streak(x, who);
      items2.push([t("fRun"), r ? t(r > 0 ? "fRunB" : "fRunS", { n: Math.abs(r) }) : t("fFlat"), r < 0]);
    }
    const g2 = summary(createDiv(), { key: "flows", label: t("fToday", { w: who ? t(NAME[who]) : t("fRowK"), d: shortDate(last.date) }), value: L(last[k]), hot: last[k] < 0, dim: who === "d" && etf, items: items2 });
    if (sumEl) sumEl.replaceWith(g2);
    else el.appendChild(g2);
    sumEl = g2;
  };
  top();
  const cg = h(el, "div", "zl-c-group zl-c-fill zl-fl");
  const seg = h(cg, "div", "zl-fl-seg");
  const segs = [5, 20].map((n) => {
    const b = h(seg, "button", "zl-fl-segb" + (SPAN === n ? " is-on" : ""), t("fDays", { n }).toUpperCase());
    b.addEventListener("click", (e) => {
      e.preventDefault();
      if (SPAN === n) return;
      SPAN = n;
      segs.forEach((x, i) => x.toggleClass("is-on", [5, 20][i] === n));
      pick = -1;
      update();
    });
    return b;
  });
  const legend = h(cg, "div", "zl-fl-legend");
  const plot = h(cg, "div", "zl-fl-plot");
  const shown2 = () => s2.slice(-SPAN);
  const say2 = (x) => legend.setText(!who ? t("fHeld", { d: shortDate(x.date), f: L(x.f), t: L(x.t), dd: L(x.d) }) : who === "d" ? t("fHeldD", { d: shortDate(x.date), own: L(x.ds), hedge: L(x.dh), net: L(x.d) }) : t("fHeldW", { d: shortDate(x.date), b: num(lots(x[`${who}b`])), s: num(lots(x[`${who}s`])), net: L(x[who]) }));
  let pick = -1, Wd = 0, Hd = 0;
  const draw = (light) => {
    Wd = plot.clientWidth || Wd;
    Hd = plot.clientHeight || Hd;
    if (!Wd || !Hd) return;
    const x = shown2(), p = pick < 0 ? x.length - 1 : pick;
    plot.empty();
    say2(x[p]);
    bars(plot, x, Wd, Hd, p, stacks(who, etf), light);
  };
  const at = (ev) => {
    const x = shown2(), r = plot.getBoundingClientRect(), i = Math.floor((ev.clientX - r.left - AXIS2) / (r.width - AXIS2) * x.length);
    const k = Math.max(0, Math.min(x.length - 1, i));
    if (k !== (pick < 0 ? x.length - 1 : pick)) {
      pick = k;
      draw(false);
    }
  };
  plot.addEventListener("pointerdown", at);
  plot.addEventListener("pointermove", (ev) => {
    if (ev.buttons || ev.pointerType === "touch") at(ev);
  });
  let first2 = true;
  new ResizeObserver(() => {
    if (plot.clientWidth && (plot.clientWidth !== Wd || plot.clientHeight !== Hd)) {
      draw(first2);
      first2 = false;
    }
  }).observe(plot);
  const B = ctx.plugin.brokers;
  const brokerRow = (foreign) => {
    B.ensure(code, SPAN);
    const d = B.get(code, SPAN), open2 = () => ctx.push({ key: `brokers:${tk}${foreign ? ":foreign" : ""}`, title: t("bTitle", { tk }) });
    const k = t(foreign ? "bForeignK" : "bTopK");
    if (!d) return { k, s: B.failedAt(code, SPAN) ? t("bFailed") : t("fLoading"), v: "-", dim: true, onTap: open2 };
    const by = (l) => (foreign ? l.filter((b) => isForeignBroker(b.name)) : l)[0];
    const a = by(d.buy), z = by(d.sell);
    return { k, s: [a ? `${a.name} ${signed2(a.net)}` : "", z ? `${z.name} ${signed2(z.net)}` : ""].filter(Boolean).join(" \xB7 ") || t("bNoneForeign"), v: "", onTap: open2 };
  };
  const g = h(el, "div", "zl-c-group");
  const rowsOf = () => {
    const x = s2, last = x[x.length - 1], n = SPAN, w = x.slice(-n);
    if (!who) return [...["f", "t", "d"].map((k) => {
      const hedge = k === "d" && etf;
      return { k: t(NAME[k]), dim: hedge, s: [...hedge ? [t("fHedge")] : [], streakText(streak(x, k)), `${n}d ${L(flowSum(x, k, n))}`].join(" \xB7 "), v: L(last[k]), hot: !hedge && last[k] < 0, onTap: () => ctx.push({ key: `flows:${tk}:${k}`, title: `${tk} ${t(EN[k])}` }) };
    }), brokerRow(false)];
    const [up, dn] = flowSides(x, who, n);
    const days = { k: t("fDaysK"), s: t("fDaysS", { n }), v: `${up} / ${dn}`, hot: dn > up };
    if (who === "d") {
      const net = (k) => w.reduce((a, y) => a + y[k], 0);
      const bs = (k) => t("fBS", { b: num(lots(w.reduce((a, y) => a + y[`${k}b`], 0))), s: num(lots(w.reduce((a, y) => a + y[`${k}s`], 0))) });
      return [{ k: t("fOwn"), s: bs("ds"), v: L(net("ds")), hot: net("ds") < 0 }, { k: t("fHedgeK"), s: etf ? `${bs("dh")} \xB7 ${t("fHedgeEtf")}` : bs("dh"), v: L(net("dh")), dim: true }, days];
    }
    return [
      { k: t("fBought"), s: t("fDaysS", { n }), v: num(lots(flowGross(x, who, "b", n))) },
      { k: t("fSold"), s: t("fDaysS", { n }), v: num(lots(flowGross(x, who, "s", n))), hot: true },
      days,
      ...who === "f" ? [brokerRow(true)] : []
    ];
  };
  figures(g, rowsOf().map((r) => ({ icon: "flows", k: r.k, s: r.s, v: r.v, hot: r.hot, dim: r.dim, onTap: r.onTap })));
  const update = () => {
    draw(true);
    const rs = g.querySelectorAll(".zl-fig");
    rowsOf().forEach((r, i) => {
      if (rs[i]) setRow(rs[i], r);
    });
  };
  B.onChange(() => {
    if (!el.isConnected) return false;
    const rs = g.querySelectorAll(".zl-fig");
    rowsOf().forEach((r, i) => {
      if (rs[i]) setRow(rs[i], r);
    });
    return true;
  });
  flows.onChange(() => {
    if (!el.isConnected) return false;
    const n = flows.series(code);
    if (!n || n.length === s2.length && n[n.length - 1].date === s2[s2.length - 1].date) return true;
    s2 = n;
    pick = -1;
    top();
    update();
    return true;
  });
  return { title, el, fab };
};
var stacks = (who, etf) => {
  const d = etf ? "zl-fl-d is-mut" : "zl-fl-d";
  if (!who) return (x) => [[lots(x.f), "zl-fl-f", false], [lots(x.t), "zl-fl-t", false], [lots(x.d), d, true]];
  if (who === "d") return (x) => [[lots(x.ds), "zl-fl-f", false], [lots(x.dh), d, true]];
  return (x) => [[lots(x[who]), x[who] < 0 ? "zl-fl-down" : "zl-fl-f", false]];
};
var AXIS2 = 44;
var TOP2 = 8;
var BOT = 20;
var PAT = 0;
var bars = (plot, s2, W, H, pick, parts, light) => {
  const svg = document.createElementNS(NS4, "svg");
  svg.setAttribute("width", String(W));
  svg.setAttribute("height", String(H));
  svg.setAttribute("class", "zl-ch-svg zl-fl-svg" + (light ? " is-light" : ""));
  plot.appendChild(svg);
  const el = (p, tag, a, cls) => {
    const e = document.createElementNS(NS4, tag);
    for (const [k, v] of Object.entries(a)) e.setAttribute(k, String(v));
    if (cls) e.setAttribute("class", cls);
    p.appendChild(e);
    return e;
  };
  const id = `zl-fl-hatch-${++PAT}`, idm = `${id}-m`;
  const defs = el(svg, "defs", {});
  for (const [pid, cls] of [[id, "zl-fl-hatch"], [idm, "zl-fl-hatch is-mut"]]) {
    const pat = el(defs, "pattern", { id: pid, width: 4, height: 4, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" });
    el(pat, "line", { x1: 0, y1: 0, x2: 0, y2: 4 }, cls);
  }
  const P = s2.map(parts);
  let hi = 0, lo = 0;
  for (const r of P) {
    hi = Math.max(hi, r.filter(([v]) => v > 0).reduce((a, [v]) => a + v, 0));
    lo = Math.min(lo, r.filter(([v]) => v < 0).reduce((a, [v]) => a + v, 0));
  }
  if (hi === lo) hi = 1;
  const y0 = TOP2, y1 = H - BOT, y = (v) => y1 - (v - lo) / (hi - lo) * (y1 - y0);
  const x0 = AXIS2, step = (W - x0 - 2) / s2.length, bw = Math.max(2, Math.min(18, step * 0.7));
  const ticks = niceTicks(lo, hi, 4);
  for (const v of ticks) {
    el(svg, "line", { x1: x0, x2: W - 2, y1: Math.round(y(v)) + 0.5, y2: Math.round(y(v)) + 0.5 }, v === 0 ? "zl-ch-axis" : "zl-ch-grid");
    el(svg, "text", { x: x0 - 6, y: y(v) + 4, "text-anchor": "end" }, "zl-ch-yl").textContent = short(v);
  }
  if (!ticks.includes(0)) el(svg, "line", { x1: x0, x2: W - 2, y1: Math.round(y(0)) + 0.5, y2: Math.round(y(0)) + 0.5 }, "zl-ch-axis");
  el(svg, "rect", { x: x0 + pick * step, y: y0, width: step, height: y1 - y0 }, "zl-fl-pick");
  const beat = Math.min(30, 300 / Math.max(1, s2.length));
  P.forEach((r, i) => {
    const cx = x0 + (i + 0.5) * step;
    let up = 0, dn = 0;
    r.forEach(([v, cls, hatch]) => {
      if (!v) return;
      const a = v > 0 ? up : dn, b = a + v;
      if (v > 0) up = b;
      else dn = b;
      const rc = el(svg, "rect", { x: cx - bw / 2, y: y(Math.max(a, b)), width: bw, height: Math.max(1, Math.abs(y(a) - y(b))) }, `zl-fl-bar ${cls}`);
      if (hatch) rc.setAttribute("fill", `url(#${cls.includes("is-mut") ? idm : id})`);
      rc.style.setProperty("--d", `${Math.round(i * beat)}ms`);
    });
  });
  const marks = s2.length > 2 ? [0, Math.floor((s2.length - 1) / 2), s2.length - 1] : s2.map((_, i) => i);
  for (const i of marks) {
    el(svg, "text", { x: i === 0 ? x0 : i === s2.length - 1 ? W - 2 : x0 + (i + 0.5) * step, y: H - 5, "text-anchor": i === 0 ? "start" : i === s2.length - 1 ? "end" : "middle" }, "zl-ch-xl").textContent = shortDate(s2[i].date);
  }
};
var syncFigs = (g, rows) => {
  const fig = (r) => ({ icon: r.k && isForeignBroker(r.k) ? "person" : "flows", k: r.k ?? "", s: r.s, v: r.v, hot: r.hot, dim: r.dim, onTap: r.onTap });
  const box = g.querySelector(".zl-figs");
  if (!box) {
    figures(g, rows.map(fig));
    return;
  }
  const have = Array.from(box.children);
  rows.forEach((r, i) => {
    if (have[i]) {
      setRow(have[i], r);
      have[i].querySelector(".zl-px")?.replaceWith(figures(createDiv(), [fig(r)]).querySelector(".zl-px"));
      return;
    }
    const n = figures(createDiv(), [fig(r)]).firstElementChild;
    n.removeClass("zl-in");
    box.appendChild(n);
  });
  have.slice(rows.length).forEach((e) => e.remove());
};
var BSPAN = 20;
var brokersPage = (ctx, arg, trade) => {
  const [tk, f0] = arg.split(":");
  let foreign = f0 === "foreign";
  const title = t("bTitle", { tk });
  const el = page(title);
  el.addClass("zl-c-list");
  const fab = { icon: "plus", text: t("iTrade").toUpperCase(), label: t("iTrade"), onTap: () => trade(tk) };
  const B = ctx.plugin.brokers, code = Flows.code(ctx.plugin.prices.symbol(tk));
  if (!code) {
    empty(el, { icon: "flows", title: t("fNone"), text: t("fNoneS") });
    return { title, el, fab };
  }
  B.ensure(code, BSPAN);
  const any = () => B.get(code, BSPAN) ?? B.get(code, 20) ?? B.get(code, 5) ?? B.get(code, 1);
  if (!any()) {
    empty(el, { icon: "flows", title: B.failedAt(code, BSPAN) ? t("bFailed") : t("bLoading"), text: t("bSource") });
    B.onChange(() => {
      if (!el.isConnected) return false;
      if (!any()) {
        if (B.failedAt(code, BSPAN)) {
          ctx.redraw();
          return false;
        }
        return true;
      }
      ctx.redraw();
      return false;
    });
    return { title, el, fab };
  }
  let sumEl = null;
  const head = h(el, "div", "zl-c-group zl-fl");
  const seg = (opts) => {
    const box = h(head, "div", "zl-fl-seg" + (opts.length === 3 ? " is-3" : ""));
    const bs = opts.map(([label, on, tap]) => {
      const b = h(box, "button", "zl-fl-segb", label);
      b.addEventListener("click", (e) => {
        e.preventDefault();
        tap();
        bs.forEach((x, i) => x.toggleClass("is-on", opts[i][1]()));
        render();
      });
      return b;
    });
    bs.forEach((x, i) => x.toggleClass("is-on", opts[i][1]()));
  };
  seg([1, 5, 20].map((n) => [n === 1 ? t("bDay1").toUpperCase() : t("fDays", { n }).toUpperCase(), () => BSPAN === n, () => {
    BSPAN = n;
    B.ensure(code, n);
  }]));
  seg([[t("bAll").toUpperCase(), () => !foreign, () => {
    foreign = false;
  }], [t("bForeign").toUpperCase(), () => foreign, () => {
    foreign = true;
  }]]);
  const gb = h(el, "div", "zl-c-group"), secB = h(gb, "div", "zl-sec");
  const gs = h(el, "div", "zl-c-group"), secS = h(gs, "div", "zl-sec");
  const note = h(el, "div", "zl-fl-legend zl-fl-src", t("bSource"));
  const rows = (l, none) => {
    const k = foreign ? l.filter((b) => isForeignBroker(b.name)) : l;
    return k.length ? k.map((b) => ({ k: b.name, s: t("bRowS", { b: num(b.b), s: num(b.s), p: (b.pct / 100).toFixed(1) }), v: signed2(b.net), hot: b.net < 0 })) : [{ k: none, s: t("bNoneS"), v: "-", dim: true }];
  };
  const render = () => {
    const d = B.get(code, BSPAN) ?? any(), wait = !B.get(code, BSPAN);
    const fl = foreign ? [...d.buy, ...d.sell].filter((b) => isForeignBroker(b.name)) : [];
    const net = foreign ? fl.reduce((a, b) => a + b.net, 0) : d.buyTotal - d.sellTotal;
    const span = BSPAN === 1 ? t("bDay1") : t("fDays", { n: BSPAN });
    const items2 = foreign ? [[t("bBuyers"), signed2(fl.filter((b) => b.net > 0).reduce((a, b) => a + b.net, 0))], [t("bSellers"), signed2(fl.filter((b) => b.net < 0).reduce((a, b) => a + b.net, 0)), true], [t("bBranches"), String(fl.length)]] : [[t("bBuyers"), signed2(d.buyTotal)], [t("bSellers"), signed2(-d.sellTotal), true], [t("bCost"), d.buyCost ? price2(d.buyCost) : "-"]];
    const label = wait ? B.failedAt(code, BSPAN) ? t("bFailed") : t("bLoading") : t(foreign ? "bSumF" : "bSum", { span, d: d.asOf ? shortDate(d.asOf) : "-" });
    const g = summary(createDiv(), { key: "brokers", label, value: signed2(net), hot: net < 0, items: items2 });
    if (sumEl) sumEl.replaceWith(g);
    else el.insertBefore(g, head);
    sumEl = g;
    secB.setText(t("bBuying").toUpperCase());
    secS.setText(t("bSelling").toUpperCase());
    syncFigs(gb, rows(d.buy, t("bNoneForeign")));
    syncFigs(gs, rows(d.sell, t("bNoneForeign")));
    for (const x of [gb, gs, g]) x.toggleClass("is-wait", wait);
    el.appendChild(note);
  };
  render();
  B.onChange((k) => {
    if (!el.isConnected) return false;
    if (k === Brokers.key(code, BSPAN)) render();
    return true;
  });
  return { title, el, fab };
};

// src/pages/invest-shared.ts
var PLAN_KEY = "investment";
var MINUS = "\u2212";
var signed3 = (n) => `${n > 0 ? "+" : n < 0 ? MINUS : ""}${num(Math.abs(n))}`;
var pctS = (n) => {
  const r = Math.round(n * 100) / 100;
  return `${r > 0 ? "+" : r < 0 ? MINUS : ""}${Math.abs(r).toFixed(2)}%`;
};
var qty = (n) => n.toLocaleString(void 0, { maximumFractionDigits: 4 });
var WHY = { holiday: "whyHoliday", typhoon: "whyTyphoon", notrade: "whyNoTrade", early: "whyEarly" };
var liveBadge = (x) => {
  const s2 = x.ctx.plugin.prices.liveState();
  if (s2.open.length) return { text: t("liveOn", { m: s2.open.join(" \xB7 ") }).toUpperCase(), live: true };
  if (s2.closed) return { text: t("liveClosed", { m: s2.closed.mkt, w: t(WHY[s2.closed.why]) }).toUpperCase(), live: false };
  if (!s2.next) return void 0;
  const d = new Date(s2.next.at), hm2 = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const when = day === today() ? hm2 : `${d.toLocaleDateString("en-US", { weekday: "short" })} ${hm2}`;
  return { text: t("liveOff", { m: s2.next.mkt, t: when }).toUpperCase(), live: false };
};
var findAct = (x, el) => ({ icon: "search", label: t("iFind"), dock: true, onTap: () => x.search(el) });
var CHG_KEY = "ledgerline-chg";
var CHG = -1;
var CHGS = /* @__PURE__ */ new WeakMap();
var CHG_FLAPS = /* @__PURE__ */ new Map();
var chgMode = (x) => {
  if (CHG < 0) CHG = Number(x.ctx.app.loadLocalStorage(CHG_KEY)) || 0;
  return CHG;
};
var paintChg = (e, m) => {
  const o = CHGS.get(e);
  if (!o) return;
  const i = Math.min(m, o.c.t.length - 1);
  o.f.set(o.c.t[i]);
  e.toggleClass("is-hot", o.c.hot[i]);
  e.toggleClass("is-up", /^\+/.test(o.c.t[i]));
  e.toggleClass("is-ret", o.c.ret[i]);
  const k = e.querySelector(".zl-chg-k");
  if (k) k.textContent = o.c.k[i];
};
var chgKinds = (scope) => Math.min(4, ...Array.from(scope.querySelectorAll(".zl-chg"), (e) => CHGS.get(e)?.c.t.length ?? 4));
var alignChg = (x, scope) => {
  if (!scope) return;
  const m = Math.min(chgMode(x), chgKinds(scope) - 1);
  scope.querySelectorAll(".zl-chg").forEach((n) => paintChg(n, m));
};
var chgEl = (x, parent, c, cls, key) => {
  const e = h(parent, "span", `zl-chg ${cls}`);
  h(e, "span", "zl-chg-k");
  let f = CHG_FLAPS.get(key);
  if (!f) {
    f = new Flap("xs");
    CHG_FLAPS.set(key, f);
  }
  e.appendChild(f.el);
  const o = { c, f };
  CHGS.set(e, o);
  paintChg(e, chgMode(x));
  const re = c.re, pr = x.ctx.plugin.prices;
  if (c.tk && re) {
    const sym = pr.symbol(c.tk);
    pr.onQuote((s2) => {
      if (!e.isConnected) return false;
      if (s2 !== sym) return true;
      o.c = re();
      const pg = e.closest(".zl-page");
      paintChg(e, Math.min(chgMode(x), (pg ? chgKinds(pg) : o.c.t.length) - 1));
      return true;
    });
  }
  return e;
};
var swipeChg = (x, row2) => {
  let x0 = 0, y0 = 0, lock = null, done = false;
  const step = (d) => {
    const pg = row2.closest(".zl-page"), n = pg ? chgKinds(pg) : 3;
    CHG = (Math.min(chgMode(x), n - 1) + d + n) % n;
    x.ctx.app.saveLocalStorage(CHG_KEY, CHG);
    alignChg(x, pg);
  };
  const at = (cx, cy, stop) => {
    const dx = cx - x0, dy = cy - y0;
    if (!lock && Math.abs(dx) + Math.abs(dy) > 8) lock = Math.abs(dx) > Math.abs(dy) * 1.3 ? "x" : "y";
    if (lock !== "x") return;
    stop();
    if (!done && Math.abs(dx) > 36) {
      done = true;
      step(dx < 0 ? 1 : -1);
    }
  };
  row2.addEventListener("touchstart", (e) => {
    const t2 = e.touches[0];
    x0 = t2.clientX;
    y0 = t2.clientY;
    lock = null;
    done = false;
  }, { passive: true });
  row2.addEventListener("touchmove", (e) => {
    const t2 = e.touches[0];
    at(t2.clientX, t2.clientY, () => e.stopPropagation());
  }, { passive: true });
  row2.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") return;
    x0 = e.clientX;
    y0 = e.clientY;
    lock = null;
    done = false;
  });
  row2.addEventListener("pointermove", (e) => {
    if (e.pointerType === "mouse" && e.buttons) at(e.clientX, e.clientY, () => void 0);
  });
  row2.addEventListener("click", (e) => {
    if (done || lock === "x") {
      e.preventDefault();
      e.stopImmediatePropagation();
      done = false;
      lock = null;
    }
  }, true);
};
var todayOf = (pr, tk) => {
  const q = pr.get(tk), B = pr.series(tk, "D")?.bars, lv = liveOf(pr, tk);
  if (lv) return dayChange(B, lv, q?.closes?.map((c) => Math.round(c * 100)), q?.prev ? Math.round(q.prev * 100) : void 0);
  const n = B?.c.length ?? 0;
  return B && n > 1 ? { ch: B.c[n - 1] - B.c[n - 2], pct: (B.c[n - 1] - B.c[n - 2]) / B.c[n - 2] * 100 } : null;
};
var atNow = (pr, tk, p) => {
  const np = pr.price(tk);
  return np === null ? p : revalue(p, np);
};
var chgOf = (x, tk, p) => {
  const pr = x.ctx.plugin.prices;
  pr.refreshSeries(tk, "D");
  const d = todayOf(pr, tk);
  const down = !!d && d.ch < 0, sg = (n) => n > 0 ? "+" : n < 0 ? "\u2212" : "";
  const c = { t: [d ? pctS(d.pct) : "-", d ? `${sg(d.ch)}${price2(Math.abs(d.ch))}` : "-"], hot: [down, down], k: [t("chgToday"), t("chgToday")], ret: [false, false], tk, re: () => chgOf(x, tk, p && atNow(pr, tk, p)) };
  if (!p) return c;
  const priced = p.price !== null, rp = p.cost > 0 ? p.pl / p.cost * 100 : 0;
  return { ...c, t: [priced ? pctS(rp) : "-", ...c.t, priced ? signed3(p.pl) : "-"], hot: [p.pl < 0, ...c.hot, p.pl < 0], k: ["", ...c.k, t("chgProfit")], ret: [true, false, false, true] };
};
var lastOf = (x, tk) => {
  const q = x.ctx.plugin.prices.get(tk);
  return q ? price2(Math.round(q.price * 100)) : "-";
};
var flowTickers = (P) => [...P.positions.filter((p) => p.shares > 0).map((p) => p.ticker), ...P.watch];
var openKey = (x, tk) => x.P.positions.some((p) => p.ticker === tk && p.shares > 0) ? { key: "asset:" + tk, title: tk } : { key: "chart:" + tk, title: tk };
var guessCur = (sym) => isTwSym(sym) ? "TWD" : "USD";
var warnText = (w) => w.rule === "cap" ? t("iWarnCap", { tk: w.key, n: num(w.over) }) : w.rule === "mix" ? t(w.over > 0 ? "iWarnMixOver" : "iWarnMixUnder", { b: w.key, n: Math.abs(w.over) }) : t("iWarnReason", { tk: w.key });

// src/pages/invest-home.ts
var home = (x) => {
  const { ctx, P } = x;
  const title = t("tabInvest");
  const el = page(title);
  el.addClass("zl-c-stack", "zl-mm");
  const held = P.positions.filter((p) => p.shares > 0).sort((a, b) => b.value - a.value);
  const fab = { icon: "plus", text: t("iTrade").toUpperCase(), label: t("iTrade"), onTap: () => x.trade() };
  const day = todayHeld(x, held);
  const rp = P.cost > 0 ? P.pl / P.cost * 100 : 0, r12 = Math.round(rp * 10) / 10;
  const tone = (n) => n > 0 ? "up" : n < 0 ? "down" : void 0;
  homeTop(el, {
    key: "invest",
    value: num(P.value),
    label: t("iHoldings"),
    right: !held.length ? void 0 : !P.priced ? t("iPricing") : day ? t("iTodayChg", { v: signed3(day.ch), p: pctS(day.pct) }) : void 0,
    tone: P.priced && day ? tone(day.ch) : void 0,
    reads: held.length && P.priced ? [[t("iGainLoss"), signed3(P.pl), { sub: [`${r12 > 0 ? "+" : r12 < 0 ? MINUS : ""}${Math.abs(r12).toFixed(1)}%`, t("iSinceBought")], tone: tone(P.pl) }]] : [[t("iCashWait"), num(x.cash)]]
  });
  marketCard(el, { prices: ctx.plugin.prices, app: ctx.app, cal: () => ctx.plugin.prices.calendar?.cal, chg: (tk) => todayOf(ctx.plugin.prices, tk) });
  watchStrip(x, el);
  keepSideways(el);
  const lk = h(el, "div", "zl-c-group zl-mlinks");
  const link = (label, onTap) => {
    const b = h(lk, "button", "zl-mlink", label);
    b.addEventListener("click", (e) => {
      e.preventDefault();
      onTap();
    });
  };
  link(t("iHoldingsT").toUpperCase(), () => ctx.push({ key: "holdings", title: t("iHoldingsT") }));
  link(t("fMapLink").toUpperCase(), () => ctx.push({ key: "map", title: t("fMapT") }));
  link(t("alLink").toUpperCase(), () => ctx.push({ key: "alerts", title: t("alTitle") }));
  link(t("iMixLink").toUpperCase(), () => ctx.push({ key: "mix", title: t("iMixT") }));
  return { title, el, fab, actions: [findAct(x, el)], badge: liveBadge(x) };
};
var todayHeld = (x, held) => {
  const pr = x.ctx.plugin.prices;
  let ch = 0, any = false;
  for (const p of held) {
    pr.refreshSeries(p.ticker, "D");
    const d = todayOf(pr, p.ticker);
    if (!d) continue;
    any = true;
    const last = Math.round((pr.price(p.ticker) ?? p.price ?? 0) * 100);
    ch += toBase(todayMove(p, d.ch, last, today()), p.currency, x.fx(p.currency));
  }
  if (!any) return null;
  ch = Math.round(ch);
  const before = x.P.value - ch;
  return { ch, pct: before > 0 ? ch / before * 100 : 0 };
};
var keepSideways = (el) => {
  let x0 = 0, y0 = 0, side = null;
  el.addEventListener("touchstart", (e) => {
    const t2 = e.touches[0];
    x0 = t2.clientX;
    y0 = t2.clientY;
    side = null;
  }, { passive: true });
  el.addEventListener("touchmove", (e) => {
    const t2 = e.touches[0], dx = t2.clientX - x0, dy = t2.clientY - y0;
    if (side === null && Math.abs(dx) + Math.abs(dy) > 6) side = Math.abs(dx) > Math.abs(dy);
    if (side) e.stopPropagation();
  }, { passive: true });
  el.addEventListener("touchend", (e) => {
    if (side) e.stopPropagation();
  }, { passive: true });
};
var RUN = 27;
var RUN_V = RUN / 1e3;
var WM = { pos: 0, v: RUN_V, el: null, run: null, raf: 0, last: 0, held: false };
var wmPlace = () => {
  const r = WM.run, half = r ? r.scrollWidth / 2 : 0;
  if (!r || half <= 0) return;
  WM.pos = (WM.pos % half + half) % half;
  r.style.transform = `translateX(${-WM.pos}px)`;
};
var DOWN = 0;
var WATCH = null;
var fingers = (on) => {
  if (on && !WATCH) {
    WATCH = (e) => {
      DOWN = Math.max(0, DOWN + (e.type === "pointerdown" ? 1 : -1));
      if (DOWN) return;
      WM.held = false;
      activeDocument.querySelectorAll(".zl-touching").forEach((n) => n.removeClass("zl-touching"));
    };
    for (const ev of ["pointerdown", "pointerup", "pointercancel"]) window.addEventListener(ev, WATCH, true);
  } else if (!on && WATCH) {
    for (const ev of ["pointerdown", "pointerup", "pointercancel"]) window.removeEventListener(ev, WATCH, true);
    WATCH = null;
    DOWN = 0;
  }
};
var investUnload = () => {
  fingers(false);
  if (WM.raf) cancelAnimationFrame(WM.raf);
  WM.raf = 0;
  WM.el = WM.run = null;
};
var runWm = (t2) => {
  const vp = WM.el;
  if (!vp?.isConnected) {
    WM.raf = 0;
    WM.last = 0;
    return;
  }
  const dt = WM.last ? Math.min(64, t2 - WM.last) : 0;
  WM.last = t2;
  if (!WM.held) {
    const to = calm() ? 0 : RUN / 1e3;
    WM.v += (to - WM.v) * (1 - Math.pow(0.94, dt / 16));
    if (Math.abs(WM.v) > 1e-3) {
      WM.pos += WM.v * dt;
      wmPlace();
    }
  }
  WM.raf = requestAnimationFrame(runWm);
};
var watchStrip = (x, el) => {
  const { ctx } = x, tks = x.P.watch;
  const g = h(el, "div", "zl-c-group zl-wstrip");
  sec(g, t("iWatchN", { n: tks.length }).toUpperCase(), () => ctx.push({ key: "watch", title: t("iWatch") }), t("iAll").toUpperCase());
  const vp = h(g, "div", "zl-wm");
  if (!tks.length) {
    const b = h(vp, "button", "zl-wm-none", t("iWatchNone"));
    b.addEventListener("click", (e) => {
      e.preventDefault();
      x.search(el);
    });
    return g;
  }
  const run = h(vp, "div", "zl-wm-run");
  const loop = tks.length > 3;
  let dragged = false;
  const copy = (n) => tks.forEach((tk) => {
    const b = h(run, "button", "zl-wcell");
    b.dataset.k = `${tk}|${n}`;
    if (n) b.setAttribute("aria-hidden", "true");
    const top = h(b, "span", "zl-wcell-t");
    h(top, "span", "zl-wcell-k", tk);
    h(top, "span", "zl-wcell-p", lastOf(x, tk));
    chgEl(x, b, chgOf(x, tk), "zl-wcell-c", `WM|${tk}|${n}`);
    b.addEventListener("click", (e) => {
      e.preventDefault();
      if (dragged) return;
      x.ctx.push(openKey(x, tk));
    });
  });
  copy(0);
  if (loop) copy(1);
  alignChg(x, g);
  if (!loop) {
    vp.addClass("is-still");
    return g;
  }
  vp.addClass("is-loop");
  let x0 = 0, y0 = 0, p02 = 0, side = null, lastX = 0, lastT = 0, id = -1;
  vp.addEventListener("pointerdown", (e) => {
    id = e.pointerId;
    x0 = lastX = e.clientX;
    y0 = e.clientY;
    p02 = WM.pos;
    lastT = e.timeStamp;
    side = null;
    dragged = false;
    WM.held = true;
    WM.v = 0;
    vp.addClass("zl-touching");
  });
  vp.addEventListener("pointermove", (e) => {
    if (e.pointerId !== id || !WM.held) return;
    const dx = e.clientX - x0, dy = e.clientY - y0;
    if (side === null && Math.abs(dx) + Math.abs(dy) > 6) {
      side = Math.abs(dx) > Math.abs(dy);
      if (side) {
        dragged = true;
        try {
          vp.setPointerCapture(id);
        } catch {
        }
      }
    }
    if (!side) return;
    const dt = Math.max(1, e.timeStamp - lastT);
    WM.v = 0.7 * WM.v + 0.3 * (-(e.clientX - lastX) / dt);
    lastX = e.clientX;
    lastT = e.timeStamp;
    WM.pos = p02 - dx;
    wmPlace();
  });
  const up = (e) => {
    if (e.pointerId !== id) return;
    id = -1;
    WM.held = false;
    vp.removeClass("zl-touching");
    if (!side) WM.v = 0;
  };
  vp.addEventListener("pointerup", up);
  vp.addEventListener("pointercancel", up);
  WM.el = vp;
  WM.run = run;
  fingers(true);
  new ResizeObserver(() => {
    if (!vp.isConnected || !vp.clientWidth || WM.el !== vp) return;
    wmPlace();
    if (!WM.raf) WM.raf = requestAnimationFrame(runWm);
  }).observe(vp);
  return g;
};

// src/pages/invest-mix.ts
var mixPage = (x) => {
  const { ctx, P } = x;
  const title = t("iMixT");
  const el = page(title);
  el.addClass("zl-c-stack");
  const fab = { icon: "plus", text: t("iTrade").toUpperCase(), label: t("iTrade"), onTap: () => x.trade() };
  const sel = /* @__PURE__ */ new Date(), mk = `${sel.getFullYear()}-${String(sel.getMonth() + 1).padStart(2, "0")}`;
  const { plan, month } = ctx.plugin.store.monthData(sel.getFullYear(), sel.getMonth());
  const amt = Number(month?.[PLAN_KEY] ?? plan[PLAN_KEY]) || 0;
  const bs = investBuckets(ctx.plugin.store.fm(ctx.plugin.store.path(FILES.invest)), amt, mk);
  const toBuy = bs ? bs.reduce((s2, b) => s2 + Math.max(0, b.target - b.bought), 0) : null;
  summary(el, { key: "mix", label: t("iCashWait"), value: num(x.cash), items: toBuy !== null ? [[t("iToBuy"), num(toBuy)]] : [] });
  const toHoldings = () => ctx.push({ key: "holdings", title: t("iHoldingsT") });
  const toRules = () => ctx.push({ key: "rules", title: t("iRules") });
  if (P.buckets.length && P.value > 0) {
    const g = h(el, "div", "zl-c-group");
    sec(g, t("iMixT").toUpperCase(), x.warns.length ? toRules : void 0, x.warns.length ? (x.warns.length === 1 ? t("iWarn1") : t("iWarnN", { n: x.warns.length })).toUpperCase() : void 0);
    for (const b of P.buckets) bline(g, { name: b.label, spent: b.pct, quota: 100, pace: b.target / 100, value: `${Math.round(b.pct)}%`, of: t("iTargetN", { n: b.target }), hot: Math.abs(b.drift) > P.threshold, mix: true, onTap: toHoldings });
  }
  if (bs?.length) {
    const g = h(el, "div", "zl-c-group");
    sec(g, t("iPlan", { n: num(amt) }).toUpperCase());
    for (const b of bs) bline(g, { name: b.label, spent: b.bought, quota: b.target, pace: 0, value: num(Math.max(0, b.target - b.bought)), of: t("cLeftOf", { n: num(b.target) }), hot: false, onTap: () => x.trade() });
  }
  if (!P.buckets.length && !bs?.length) empty(el, { icon: "trending-up", title: t("iNone"), text: t("iNoneSub") });
  return { title, el, fab, actions: [findAct(x, el)] };
};
var rulesPage = (x) => {
  const { ctx, P } = x;
  const title = t("iRules");
  const el = page(title);
  el.addClass("zl-c-list");
  const g = h(el, "div", "zl-c-group");
  sec(g, t("iRulesNow").toUpperCase());
  figures(g, x.warns.length ? x.warns.map((w) => ({
    icon: w.rule === "reason" ? "list" : "invest",
    k: w.key,
    s: warnText(w),
    v: w.rule === "cap" ? `+${num(w.over)}` : w.rule === "mix" ? `${w.over > 0 ? "+" : ""}${w.over}%` : "",
    hot: true,
    onTap: w.rule === "reason" ? () => ctx.push({ key: "journal:" + w.key, title: t("iJournal") }) : w.rule === "cap" ? () => ctx.push({ key: "asset:" + w.key, title: w.key }) : void 0
  })) : [{ k: t("iRulesOk").toUpperCase(), v: "-", dim: true }]);
  const r = h(el, "div", "zl-c-group");
  sec(r, t("iRulesT").toUpperCase());
  figures(r, [
    { k: t("iRuleCap").toUpperCase(), s: t("iRuleCapS"), v: num(x.cap), dim: true },
    { k: t("iRuleMix").toUpperCase(), s: t("iRuleMixS"), v: `${P.threshold}%`, dim: true },
    { k: t("iRuleReason").toUpperCase(), s: t("iRuleReasonS"), v: "", dim: true }
  ]);
  return { title, el };
};

// src/pages/drawings.ts
var import_obsidian15 = require("obsidian");
var DrawingsSheet = class extends import_obsidian15.Modal {
  constructor(app, store, ticker, addNote) {
    super(app);
    this.store = store;
    this.ticker = ticker;
    this.addNote = addNote;
  }
  get path() {
    return journalPath(this.ticker);
  }
  fm() {
    return this.store.fm(this.path);
  }
  async write(fn) {
    await this.store.update(this.path, (f) => {
      f.ticker = this.ticker;
      fn(f);
    });
  }
  onOpen() {
    this.draw();
  }
  onClose() {
    this.contentEl.empty();
  }
  // redraw from what is written (the cache catches up a moment after a write: the change is applied here too)
  draw(local) {
    this.contentEl.empty();
    const f = JSON.parse(JSON.stringify(this.fm() ?? {}));
    local?.(f);
    const P = readPrefs(f);
    const c = base(this, t("dTitle", { tk: this.ticker }), t("dSavedIn", { path: this.path }));
    c.addClass("zl-dsheet");
    const change = (fn) => {
      this.draw(fn);
      void this.write(fn);
    };
    h(c, "div", "zl-dsec", t("dFibShown").toUpperCase());
    const chips = h(c, "div", "zl-dchips");
    for (const r of FIB_ALL) {
      const on = P.fib.some((x) => Math.abs(x - r) < 1e-9), loud = r === 0.5 || Math.abs(r - 0.618) < 1e-9;
      const b = h(chips, "button", "zl-dchip" + (on ? " is-on" : "") + (on && loud ? " is-loud" : ""), String(+(r * 100).toFixed(1)));
      b.addEventListener("click", () => change((x) => {
        const ch = x.chart ?? {};
        ch.fib = on ? P.fib.filter((y) => Math.abs(y - r) > 1e-9) : [...P.fib, r].sort((a, b2) => a - b2);
        x.chart = ch;
      }));
    }
    h(c, "div", "zl-drow-s", t("dFibNote"));
    h(c, "div", "zl-dsec", t("dDrawing").toUpperCase());
    const sw = (label, sub, on, key) => {
      const r = h(c, "div", "zl-drow");
      const m = h(r, "div", "zl-drow-m");
      h(m, "div", "zl-drow-t", label);
      h(m, "div", "zl-drow-s", sub);
      const b = h(r, "button", "zl-dcheck" + (on ? " is-on" : ""));
      b.setAttribute("aria-label", label);
      b.addEventListener("click", () => change((x) => {
        const ch = x.chart ?? {};
        ch[key] = !on;
        x.chart = ch;
      }));
    };
    sw(t("dSnap"), t("dSnapS"), P.snap, "snap");
    sw(t("dCost"), t("dCostS"), P.cost, "cost");
    const bar = h(c, "div", "zl-sheet-btns zl-dbtns");
    h(bar, "button", "", t("close")).addEventListener("click", () => this.close());
    h(bar, "button", "mod-cta", t("dAddNote")).addEventListener("click", () => {
      this.close();
      this.addNote();
    });
  }
};

// src/ui/flow.ts
var palOf = (el) => {
  const s2 = getComputedStyle(el), v = (k, d) => s2.getPropertyValue(k).trim() || d;
  return { ink: v("--zl-ink", "#1C1B19"), mut: v("--zl-mut", "#6D6A63"), dim: v("--zl-dim", "#D5D1C7"), paper: v("--zl-paper", "#ECE9E1"), up: v("--zl-up", "#126B55"), dn: v("--zl-down", "#C9503B"), mark: v("--zl-mark", "#2E5E73"), loud: v("--zl-loud", "#E8461F"), font: '"ZL IBM Plex Mono", ui-monospace, Menlo, monospace' };
};
var alpha = (c, a) => {
  const m = /^#([0-9a-f]{6})$/i.exec(c.trim());
  if (!m) return c;
  const n = parseInt(m[1], 16);
  return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`;
};
var fit = (cv) => {
  const r = cv.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1);
  const w = Math.round(r.width), h2 = Math.round(r.height);
  if (w < 2 || h2 < 2) return null;
  if (cv.width !== w * d || cv.height !== h2 * d) {
    cv.width = w * d;
    cv.height = h2 * d;
  }
  const x = cv.getContext("2d");
  if (!x) return null;
  x.setTransform(d, 0, 0, d, 0, 0);
  x.clearRect(0, 0, w, h2);
  return { x, w, h: h2 };
};
var p0 = (p) => (p / 100).toLocaleString("en-US", { maximumFractionDigits: 2 });
var lots2 = (n) => n >= 1e4 ? `${(n / 1e3).toFixed(0)}K` : Math.round(n).toLocaleString("en-US");
var sgn = (n, d = 0) => `${n > 0 ? "+" : n < 0 ? "\u2212" : ""}${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })}`;
var rowStep = (lo, hi, rows) => {
  const t2 = twTick((lo + hi) / 2);
  let s2 = t2;
  while ((hi - lo) / s2 + 1 > rows) s2 += t2;
  return s2;
};
var crossAt = (x, P, cx, cy, x0, x1, y0, y1, price, time, bottom) => {
  x.strokeStyle = P.ink;
  x.lineWidth = 1;
  x.setLineDash([3, 3]);
  x.beginPath();
  x.moveTo(x0, cy);
  x.lineTo(x1, cy);
  x.moveTo(cx, y0);
  x.lineTo(cx, y1);
  x.stroke();
  x.setLineDash([]);
  x.font = `700 10px ${P.font}`;
  x.textBaseline = "middle";
  const pw = x.measureText(price).width + 8;
  x.fillStyle = P.ink;
  x.fillRect(0, cy - 8, pw, 16);
  x.fillStyle = P.paper;
  x.textAlign = "left";
  x.fillText(price, 4, cy);
  const tw = x.measureText(time).width + 8, tx = Math.max(x0, Math.min(x1 - tw, cx - tw / 2));
  x.fillStyle = P.ink;
  x.fillRect(tx, bottom - 15, tw, 15);
  x.fillStyle = P.paper;
  x.fillText(time, tx + 4, bottom - 7.5);
};
var drawFoot = (cv, bars2, P, v) => {
  const f = fit(cv);
  if (!f) return null;
  const { x, w, h: h2 } = f;
  if (!bars2.length) return null;
  const axisW = 46, dRow = 32, colMin = w < 520 ? 78 : 100;
  const nB = Math.max(1, Math.min(10, Math.floor((w - axisW) / colMin), bars2.length));
  const maxOff = Math.max(0, bars2.length - nB), off = Math.min(maxOff, Math.max(0, Math.round(v.off)));
  const vb = bars2.slice(bars2.length - nB - off, bars2.length - off), t2 = twTick(vb[vb.length - 1].c);
  let lo = Math.min(...vb.map((b2) => b2.l)) - t2, hi = Math.max(...vb.map((b2) => b2.h)) + t2;
  const maxRows = Math.max(4, Math.floor((h2 - dRow - 8) / 17)), rs = rowStep(lo, hi, maxRows);
  lo = Math.floor(lo / rs) * rs;
  hi = Math.ceil(hi / rs) * rs;
  const rows = (hi - lo) / rs + 1, rh = Math.min(34, (h2 - dRow - 8) / rows), top = Math.max(4, (h2 - dRow - rows * rh) / 2), cw = (w - axisW) / vb.length;
  const Y = (p) => top + (hi - p) / rs * rh;
  x.textBaseline = "middle";
  x.font = `600 10px ${P.font}`;
  x.fillStyle = P.mut;
  x.textAlign = "left";
  const lstep = Math.max(1, Math.ceil(14 / rh));
  for (let k = 0, p = hi; p >= lo; p -= rs, k++) if (k % lstep === 0) x.fillText(p0(p), 2, Y(p) + rh / 2);
  let hint = "", why = "";
  const fs = cw < 90 ? 9.5 : 10.5, groups = vb.map((b2) => group(b2.cells, rs));
  vb.forEach((b2, i) => {
    const x0 = axisW + i * cw, g = groups[i], ks = [...g.keys()].sort((a, c) => c - a);
    if (!ks.length) return;
    const vmax = Math.max(1, ...ks.map((k) => g.get(k).a + g.get(k).b)), poc = pocOf(g), im = imbalances(g, rs);
    const st = stacked(im.buy, rs) ?? stacked(im.sell, rs);
    if (st && i >= vb.length - 3 && !off) {
      const buy = im.buy.has(st[0]), z = `${p0(st[0])}\u2013${p0(st[1])}`;
      hint = `STACKED ${buy ? "BUY" : "SELL"} IMBALANCE ${z} \u203A`;
      why = buy ? `Buyers took 3\xD7 the sellers on 3+ rows in a row (${z}): aggressive buying. On a pullback this zone often holds as support; a close back under ${p0(st[0])} cancels it.` : `Sellers hit 3\xD7 the buyers on 3+ rows in a row (${z}): aggressive selling. On a bounce this zone often caps the price; a close back over ${p0(st[1])} cancels it.`;
    }
    for (const k of ks) {
      const q = g.get(k), y = Y(k), tv = (q.a + q.b) / vmax, mid = x0 + 10 + (cw - 14) / 2;
      x.fillStyle = alpha(P.ink, 0.05 + 0.22 * tv);
      x.fillRect(x0 + 10, y + 1, cw - 14, rh - 2);
      const bi = im.buy.has(k), si = im.sell.has(k);
      x.font = `${si ? 700 : 500} ${fs}px ${P.font}`;
      x.textAlign = "right";
      x.fillStyle = si ? P.dn : P.ink;
      x.fillText(lots2(q.b), mid - 5, y + rh / 2);
      x.font = `500 ${fs}px ${P.font}`;
      x.textAlign = "center";
      x.fillStyle = P.mut;
      x.fillText("\xD7", mid, y + rh / 2);
      x.textAlign = "left";
      x.font = `${bi ? 700 : 500} ${fs}px ${P.font}`;
      if (bi) {
        const tw = x.measureText(lots2(q.a)).width + 6;
        x.fillStyle = P.up;
        x.fillRect(mid + 3, y + 3, tw, rh - 6);
        x.fillStyle = P.paper;
      } else x.fillStyle = P.ink;
      x.fillText(lots2(q.a), mid + 6, y + rh / 2);
    }
    x.strokeStyle = P.mark;
    x.lineWidth = 2;
    x.strokeRect(x0 + 10, Y(poc) + 1, cw - 14, rh - 2);
    const rY = (p) => Y(Math.floor(p / rs) * rs) + rh / 2;
    x.fillStyle = b2.c >= b2.o ? P.up : P.dn;
    x.fillRect(x0 + 5, rY(b2.h), 1, Math.max(1, rY(b2.l) - rY(b2.h)));
    x.fillRect(x0 + 4, Math.min(rY(b2.o), rY(b2.c)) - 1, 3, Math.abs(rY(b2.c) - rY(b2.o)) + 2);
    if (i === vb.length - 1 && !off) {
      x.strokeStyle = P.ink;
      x.lineWidth = 1;
      x.setLineDash([2, 2]);
      x.strokeRect(x0 + 2, top, cw - 4, rows * rh);
      x.setLineDash([]);
    }
    x.textAlign = "center";
    x.font = `700 11px ${P.font}`;
    x.fillStyle = b2.d < 0 ? P.dn : P.up;
    x.fillText(`\u0394 ${sgn(Math.round(b2.d))}`, x0 + cw / 2, h2 - dRow + 10);
    x.font = `500 9.5px ${P.font}`;
    x.fillStyle = P.mut;
    x.fillText(b2.m, x0 + cw / 2, h2 - dRow + 24);
  });
  x.strokeStyle = P.ink;
  x.lineWidth = 2;
  x.beginPath();
  x.moveTo(axisW, h2 - dRow);
  x.lineTo(w, h2 - dRow);
  x.stroke();
  let detail = "";
  if (v.cross) {
    const i = Math.max(0, Math.min(vb.length - 1, Math.floor((v.cross.x - axisW) / cw)));
    const k = Math.max(lo, Math.min(hi, hi - Math.floor((v.cross.y - top) / rh) * rs)), q = groups[i].get(k), b2 = vb[i];
    x.strokeStyle = P.ink;
    x.lineWidth = 1.5;
    x.strokeRect(axisW + i * cw + 8, top, cw - 10, rows * rh);
    crossAt(x, P, axisW + i * cw + cw / 2, Y(k) + rh / 2, axisW, w, top, top + rows * rh, p0(k), b2.m, h2);
    detail = q ? `${b2.m} \xB7 ${p0(k)} \xB7 SOLD ${lots2(q.b)} \xD7 BOUGHT ${lots2(q.a)} \xB7 \u0394 ${sgn(Math.round(q.a - q.b))}` : `${b2.m} \xB7 ${p0(k)} \xB7 no trades`;
  }
  const b = vb[vb.length - 1], bp = pocOf(b.cells);
  return { r1: `${off ? `BAR ${b.m}` : "THIS BAR"} \xB7 \u0394 ${sgn(Math.round(b.d))} \xB7 VOL ${lots2(b.v)} \xB7 POC ${bp !== null ? p0(bp) : "-"}`, r2: "bid \xD7 ask \xB7 lots", hint, why, detail, maxOff, colW: cw };
};
var drawHeat = (cv, all, snap, P, v) => {
  const f = fit(cv);
  if (!f) return null;
  const { x, w, h: h2 } = f;
  if (!all.length) return null;
  const win = v.win && v.win < all.length ? v.win : all.length, maxOff = all.length - win, off = Math.min(maxOff, Math.max(0, Math.round(v.off)));
  const bars2 = all.slice(all.length - win - off, all.length - off);
  const live = !off && !!snap, bottom = 16;
  const axisW = 46, ladW = live ? 58 : 0, profW = 46, cw = (w - axisW - ladW - profW - 6) / bars2.length;
  let lo = Math.min(...bars2.map((b) => b.l)), hi = Math.max(...bars2.map((b) => b.h));
  if (live && snap) {
    lo = Math.min(lo, ...snap.bids);
    hi = Math.max(hi, ...snap.asks);
  }
  const t2 = twTick(bars2[bars2.length - 1].c);
  lo -= t2;
  hi += t2;
  const rs = rowStep(lo, hi, Math.max(6, Math.floor((h2 - 12 - bottom) / 7)));
  lo = Math.floor(lo / rs) * rs;
  hi = Math.ceil(hi / rs) * rs;
  const rows = (hi - lo) / rs + 1, rh = (h2 - 12 - bottom) / rows, Y = (p) => 6 + (hi - p) / rs * rh;
  const grid2 = bars2.map((b) => group(b.cells, rs));
  let vmax = 1;
  grid2.forEach((g) => g.forEach((q) => {
    vmax = Math.max(vmax, q.a + q.b);
  }));
  grid2.forEach((g, i) => {
    const x0 = axisW + i * cw;
    g.forEach((q, k) => {
      const vv = q.a + q.b, imb = vv ? (q.a - q.b) / vv : 0, a = Math.pow(vv / vmax, 0.7);
      x.fillStyle = alpha(Math.abs(imb) < 0.15 ? P.ink : imb > 0 ? P.up : P.dn, 0.06 + 0.8 * a);
      x.fillRect(x0, Y(k), cw + 0.5, rh - 1);
    });
  });
  x.strokeStyle = P.ink;
  x.lineWidth = 1.6;
  x.beginPath();
  bars2.forEach((b, i) => {
    const px = axisW + i * cw + cw / 2, py = Y(Math.floor(b.c / rs) * rs) + rh / 2;
    if (i) x.lineTo(px, py);
    else x.moveTo(px, py);
  });
  x.stroke();
  x.font = `500 9.5px ${P.font}`;
  x.fillStyle = P.mut;
  x.textBaseline = "bottom";
  x.textAlign = "center";
  const every = Math.max(1, Math.ceil(70 / cw));
  bars2.forEach((b, i) => {
    if (i % every === 0 && i) x.fillText(b.m, axisW + i * cw, h2);
  });
  const day = group(dayCells(bars2), rs), va = valueArea(day), whole = win === all.length;
  const px0 = w - ladW - profW - 2;
  if (va) {
    const pmax = Math.max(1, ...[...day.values()].map((q) => q.a + q.b));
    day.forEach((q, k) => {
      const inV = k >= va.val && k <= va.vah;
      x.fillStyle = alpha(inV ? P.ink : P.mut, inV ? 0.45 : 0.25);
      x.fillRect(px0, Y(k) + 1, (q.a + q.b) / pmax * (profW - 4), rh - 2);
    });
    x.strokeStyle = P.mark;
    x.lineWidth = 1.5;
    x.setLineDash([6, 4]);
    x.beginPath();
    x.moveTo(axisW, Y(va.poc) + rh / 2);
    x.lineTo(px0 + profW - 4, Y(va.poc) + rh / 2);
    x.stroke();
    x.setLineDash([2, 3]);
    x.lineWidth = 1;
    for (const yy of [Y(va.vah), Y(va.val) + rh]) {
      x.beginPath();
      x.moveTo(axisW, yy);
      x.lineTo(px0 + profW - 4, yy);
      x.stroke();
    }
    x.setLineDash([]);
    x.fillStyle = P.mark;
    x.font = `700 9.5px ${P.font}`;
    x.textBaseline = "bottom";
    x.textAlign = "left";
    x.fillText(`${whole ? "DAY " : ""}POC ${p0(va.poc)}`, axisW + 4, Y(va.poc) - 1);
    x.font = `600 9px ${P.font}`;
    x.textAlign = "right";
    x.fillText(`VA ${p0(va.vah + rs - twTick(va.vah))}`, px0 - 4, Y(va.vah) - 2);
    x.textBaseline = "top";
    x.fillText(`VA ${p0(va.val)}`, px0 - 4, Y(va.val) + rh + 2);
  }
  x.textBaseline = "middle";
  x.font = `600 10px ${P.font}`;
  if (live && snap) {
    const lx = w - ladW + 4, mx = Math.max(1, ...snap.bq, ...snap.aq);
    x.strokeStyle = P.ink;
    x.lineWidth = 2;
    x.beginPath();
    x.moveTo(lx - 4, 0);
    x.lineTo(lx - 4, h2);
    x.stroke();
    const lvl = (p, q, ask) => {
      const yy = Y(Math.floor(p / rs) * rs) + rh / 2;
      x.fillStyle = alpha(ask ? P.dn : P.up, 0.2);
      x.fillRect(lx, yy - 6, Math.min(ladW - 8, q / mx * (ladW - 8)), 12);
      x.fillStyle = ask ? P.dn : P.up;
      x.textAlign = "left";
      x.fillText(lots2(q), lx + 3, yy);
    };
    snap.bids.forEach((p, i) => lvl(p, snap.bq[i] ?? 0, false));
    snap.asks.forEach((p, i) => lvl(p, snap.aq[i] ?? 0, true));
    x.font = `700 9px ${P.font}`;
    x.textAlign = "left";
    x.fillStyle = P.dn;
    x.textBaseline = "top";
    x.fillText("ASK", lx, 1);
    x.fillStyle = P.up;
    x.textBaseline = "bottom";
    x.fillText("BID", lx, h2 - 2);
    x.textBaseline = "middle";
    x.font = `600 10px ${P.font}`;
  }
  x.fillStyle = P.mut;
  x.textAlign = "left";
  const lstep = Math.max(1, Math.ceil(16 / rh));
  for (let k = 0, p = hi; p >= lo; p -= rs, k++) if (k % lstep === 0) x.fillText(p0(p), 2, Y(p) + rh / 2);
  let detail = "";
  if (v.cross) {
    const i = Math.max(0, Math.min(bars2.length - 1, Math.floor((v.cross.x - axisW) / cw)));
    const k = Math.max(lo, Math.min(hi, hi - Math.floor((v.cross.y - 6) / rh) * rs)), q = grid2[i].get(k), b = bars2[i];
    crossAt(x, P, axisW + i * cw + cw / 2, Y(k) + rh / 2, axisW, px0 + profW, 0, h2 - bottom, p0(k), b.m, h2);
    const vv = q ? q.a + q.b : 0;
    detail = q && vv ? `${b.m} \xB7 ${p0(k)} \xB7 ${lots2(vv)} lots \xB7 ${Math.round(q.a / vv * 100)}% bought at the ask` : `${b.m} \xB7 ${p0(k)} \xB7 no trades`;
  }
  if (!va) return null;
  const lp = bars2[bars2.length - 1].c, where = lp > va.vah + rs - 1 ? "above" : lp < va.val ? "below" : "inside";
  const vah = p0(va.vah + rs - twTick(va.vah)), val = p0(va.val), poc = p0(va.poc);
  const why = where === "above" ? `Price is above the value area (${val}\u2013${vah}, where 70 % of the volume traded): buyers are paying up. Holding above ${vah} = the higher price is accepted; falling back inside = a failed break that often drifts to the POC ${poc}.` : where === "below" ? `Price is below the value area (${val}\u2013${vah}, where 70 % of the volume traded): sellers are pushing down. Staying under ${val} = the lower price is accepted; coming back inside = a failed break that often drifts to the POC ${poc}.` : "";
  return { r1: `${whole ? "TODAY" : `${bars2[0].m}\u2013${bars2[bars2.length - 1].m}`} \xB7 POC ${p0(va.poc)} \xB7 value area ${p0(va.val)}\u2013${p0(va.vah + rs - twTick(va.vah))} \xB7 price ${where}`, r2: "cell = lots per price per minute \xB7 tint = aggressor", hint: off || where === "inside" ? "" : `PRICE ${where.toUpperCase()} VALUE AREA ${where === "above" ? "\u2191" : "\u2193"} \u203A`, why, detail, maxOff, colW: cw };
};
var drawPress = (cv, press, P) => {
  const f = fit(cv);
  if (!f || !press.length) return null;
  const n = Math.min(press.length, Math.floor(f.w / 3)), cw = f.w / n, sl = press.slice(-n);
  sl.forEach((p, i) => {
    f.x.fillStyle = alpha(p.v >= 0 ? P.up : P.dn, Math.min(1, 0.08 + Math.abs(p.v) * 1.6));
    f.x.fillRect(i * cw, 0, cw + 0.4, f.h);
  });
  return sl[sl.length - 1].v;
};
var fitText = (x, s2, max) => {
  if (x.measureText(s2).width <= max) return s2;
  let t2 = s2;
  while (t2.length > 1 && x.measureText(t2 + "\u2026").width > max) t2 = t2.slice(0, -1);
  return t2.length > 1 ? t2 + "\u2026" : "";
};
var drawMap = (cv, items2, P, chosen = "") => {
  const f = fit(cv);
  if (!f) return null;
  const { x, w, h: h2 } = f;
  const { keep: keep2, small } = foldSmall(items2.filter((i) => i.w > 0), w * h2, 56 * 34);
  const list5 = [...keep2];
  if (small.length) {
    const sw = small.reduce((s2, i) => s2 + i.w, 0), known = small.filter((i) => i.pct !== null), kw = known.reduce((s2, i) => s2 + i.w, 0);
    list5.push({ k: `+${small.length}`, w: sw, pct: kw ? known.reduce((s2, i) => s2 + i.w * (i.pct ?? 0), 0) / kw : null, fold: small });
  }
  const out = treemap(list5, 0, 0, w, h2);
  for (const r of out) {
    const pc = r.it.pct ?? 0, a = Math.min(1, Math.abs(pc) / 3), fold = !!r.it.fold;
    x.fillStyle = r.it.pct === null || Math.abs(pc) < 0.1 ? alpha(P.ink, 0.08) : alpha(pc > 0 ? P.up : P.dn, 0.12 + 0.83 * a);
    x.fillRect(r.x + 1, r.y + 1, r.w - 2, r.h - 2);
    if (fold) {
      x.save();
      x.beginPath();
      x.rect(r.x + 1, r.y + 1, r.w - 2, r.h - 2);
      x.clip();
      x.strokeStyle = alpha(P.ink, 0.18);
      x.lineWidth = 1;
      for (let d = -r.h; d < r.w; d += 6) {
        x.beginPath();
        x.moveTo(r.x + d, r.y + r.h);
        x.lineTo(r.x + d + r.h, r.y);
        x.stroke();
      }
      x.restore();
    }
    if (r.it.k === chosen) {
      x.strokeStyle = P.ink;
      x.lineWidth = 3;
      x.strokeRect(r.x + 2.5, r.y + 2.5, r.w - 5, r.h - 5);
    }
    x.fillStyle = a > 0.45 ? P.paper : P.ink;
    x.textAlign = "left";
    x.textBaseline = "top";
    const pt = r.it.pct === null ? "-" : `${sgn(pc, 2)}%`, room = r.w - 12, big = r.w > 150 && r.h > 90;
    if (big) {
      x.font = `700 18px ${P.font}`;
      x.fillText(fitText(x, r.it.k, room), r.x + 7, r.y + 7);
      x.font = `700 24px ${P.font}`;
      x.fillText(fitText(x, pt, room), r.x + 7, r.y + 31);
    } else if (r.h >= 34 && r.w >= 44) {
      x.font = `700 11px ${P.font}`;
      const nm = fitText(x, r.it.k, room);
      x.font = `600 11px ${P.font}`;
      const pv = fitText(x, pt, room);
      x.font = `700 11px ${P.font}`;
      if (nm) x.fillText(nm, r.x + 6, r.y + 6);
      x.font = `600 11px ${P.font}`;
      if (pv) x.fillText(pv, r.x + 6, r.y + 20);
    } else if (r.h >= 16 && r.w >= 30) {
      x.font = `600 9px ${P.font}`;
      const pv = fitText(x, r.it.pct === null ? "-" : sgn(pc, 1), r.w - 6);
      if (pv) x.fillText(pv, r.x + 3, r.y + 3);
    }
  }
  return { rects: out.map((r) => ({ t: r.it, x: r.x, y: r.y, w: r.w, h: r.h })) };
};
var drawOrders = (cv, t2, all, P) => {
  const f = fit(cv);
  const net = all.filter((_, i) => t2[i] < "13:30");
  if (!f || !net.length) return null;
  const { x, w, h: h2 } = f, n = net.length, cw = w / n, abs = net.map(Math.abs).sort((a, b) => a - b), mx = Math.max(1, abs[Math.floor(abs.length * 0.9)]);
  net.forEach((v, i) => {
    x.fillStyle = alpha(v >= 0 ? P.up : P.dn, 0.12 + 0.83 * Math.min(1, Math.abs(v) / mx));
    x.fillRect(i * cw, 0, Math.max(1, cw - 1), 18);
  });
  let cum = 0;
  const cs = net.map((v) => cum += v), cl = Math.min(0, ...cs), ch = Math.max(0, ...cs), Y = (v) => 24 + (ch - v) / (ch - cl || 1) * (h2 - 36);
  x.strokeStyle = alpha(P.mut, 0.6);
  x.lineWidth = 1;
  x.setLineDash([2, 3]);
  x.beginPath();
  x.moveTo(0, Y(0));
  x.lineTo(w, Y(0));
  x.stroke();
  x.setLineDash([]);
  x.strokeStyle = cs[n - 1] >= 0 ? P.up : P.dn;
  x.lineWidth = 1.8;
  x.beginPath();
  cs.forEach((v, i) => {
    if (i) x.lineTo(i * cw + cw / 2, Y(v));
    else x.moveTo(i * cw + cw / 2, Y(v));
  });
  x.stroke();
  x.fillStyle = P.mut;
  x.font = `600 9px ${P.font}`;
  x.textBaseline = "bottom";
  x.textAlign = "left";
  x.fillText("09:00", 0, h2);
  x.textAlign = "right";
  x.fillText("13:25", w, h2);
  return cs[n - 1];
};

// src/pages/invest-flow.ts
var MODE = "candle";
var FOOT_TF = [1, 5, 15];
var HEAT_WIN = [30, 60, 0];
var footTf = 1;
var heatWin = 0;
var hm = (ms) => new Date(ms + 8 * 36e5).toISOString().slice(11, 16);
var flowModes = (x, top, cg, tk, chart) => {
  const prices = x.ctx.plugin.prices, flow = x.ctx.plugin.flow, sym = prices.symbol(tk);
  if (!fugleCode(sym)) return;
  const thin = () => {
    const D = prices.series(tk, "D")?.bars, vs = D ? D.v.slice(-6, -1).filter((v) => v > 0) : [];
    if (vs.length < 3) return "";
    const avg = vs.reduce((a, b) => a + b, 0) / vs.length / 1e3;
    return avg < 1e3 ? t("fThin", { n: Math.round(avg).toLocaleString("en-US") }) : "";
  };
  const seg = h(top, "div", "zl-fmode");
  const box = h(cg, "div", "zl-flow");
  const bar = h(box, "div", "zl-flow-bar"), rng = h(bar, "div", "zl-fmode is-sm"), latest = h(bar, "button", "zl-flow-latest", t("fLatest"));
  const plot = h(box, "div", "zl-flow-plot is-loading"), cv = h(plot, "canvas");
  const load2 = h(plot, "div", "zl-flow-load", t("fTapeLoad"));
  const hint = h(plot, "button", "zl-flow-hint");
  const whyEl = h(plot, "div", "zl-flow-why");
  let whyUntil = 0;
  hint.addEventListener("pointerdown", (e) => e.stopPropagation());
  whyEl.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    whyUntil = 0;
    later();
  });
  hint.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    whyUntil = whyUntil > Date.now() ? 0 : Date.now() + 1e4;
    draw();
    window.setTimeout(later, 10050);
  });
  const ps = h(box, "div", "zl-flow-ps");
  h(ps, "span", "zl-flow-k", t("fPress"));
  const pcv = h(ps, "canvas"), pv = h(ps, "span", "zl-flow-k");
  const rd = h(box, "div", "zl-flow-read"), r12 = h(rd, "span"), r2 = h(rd, "span", "zl-flow-r2");
  let watching = false, raf = 0, off = 0, cross = null, last = null;
  let memo = null;
  const barsOf = (trades, tf) => {
    if (!memo || memo.n !== trades.length || memo.tf !== tf) memo = { n: trades.length, tf, bars: toBars(trades, hm, tf) };
    return memo.bars;
  };
  const draw = () => {
    raf = 0;
    if (MODE === "candle" || !box.isConnected) return;
    const tp = flow.tape(sym), P = palOf(box), bars2 = tp ? barsOf(tp.trades, MODE === "foot" ? footTf : 1) : [];
    const r = MODE === "foot" ? drawFoot(cv, bars2, P, { off, cross }) : drawHeat(cv, bars2, tp?.snap ?? null, P, { off, cross, win: heatWin });
    last = r;
    if (r) off = Math.min(off, r.maxOff);
    plot.toggleClass("is-loading", !r);
    load2.setText(!tp || tp.src === "fugle" && !tp.trades.length ? t("fTapeLoad") : prices.isOpen(tk) ? t("fWait") : t("fClosed"));
    latest.toggleClass("is-on", off > 0);
    const v = drawPress(pcv, tp?.press ?? [], P);
    pv.setText(v === null ? "-" : `${v >= 0 ? t("fBids") : t("fAsks")} ${Math.round(Math.abs(v) * 100)}%`);
    pv.toggleClass("is-up", v !== null && v > 0);
    pv.toggleClass("is-hot", v !== null && v < 0);
    const th = thin(), src = (!tp ? "" : tp.src === "fugle" ? t("fSrcFugle") : t("fSrcMis", { t: hm(tp.since) })) + (th ? ` \xB7 ${th}` : "");
    const why = r?.why && whyUntil > Date.now() && !cross ? r.why : "";
    if (why) whyEl.setText(why);
    whyEl.toggleClass("is-on", !!why);
    if (r) {
      r12.setText(r.detail || r.r1);
      r12.toggleClass("is-cross", !!r.detail);
      r2.setText(`${r.r2} \xB7 ${src}`);
    } else {
      r12.setText("\xA0");
      r2.setText(src || "\xA0");
    }
    hint.setText(r?.hint ?? "");
    hint.toggleClass("is-on", !!r?.hint && !cross);
  };
  const later = () => {
    if (!raf) raf = requestAnimationFrame(draw);
  };
  const ranges = () => {
    rng.empty();
    const list5 = MODE === "foot" ? FOOT_TF : HEAT_WIN, cur = MODE === "foot" ? footTf : heatWin;
    for (const n of list5) {
      const b = h(rng, "button", "zl-fmode-b" + (n === cur ? " is-on" : ""), MODE === "foot" ? `${n}M` : n ? n < 60 ? `${n}M` : `${n / 60}H` : t("fDay"));
      b.addEventListener("click", (e) => {
        e.preventDefault();
        pick(n);
      });
    }
  };
  const pick = (n) => {
    if (MODE === "foot") footTf = n;
    else heatWin = n;
    off = 0;
    ranges();
    fade();
  };
  const step = (finer) => {
    const list5 = MODE === "foot" ? FOOT_TF : HEAT_WIN, i = list5.indexOf(MODE === "foot" ? footTf : heatWin), j = Math.max(0, Math.min(list5.length - 1, i + (finer ? -1 : 1)));
    if (j !== i) pick(list5[j]);
  };
  let fadeT = 0;
  const fade = () => {
    plot.addClass("is-out");
    window.clearTimeout(fadeT);
    fadeT = window.setTimeout(() => {
      draw();
      plot.removeClass("is-out");
    }, 160);
  };
  latest.addEventListener("click", (e) => {
    e.preventDefault();
    off = 0;
    later();
  });
  const pts = /* @__PURE__ */ new Map();
  let holdT = 0, x0 = 0, y0 = 0, off0 = 0, panning = false, pinch0 = 0;
  const loc = (e) => {
    const r = plot.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const spread = () => {
    const [a, b] = [...pts.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };
  plot.addEventListener("pointerdown", (e) => {
    pts.set(e.pointerId, loc(e));
    try {
      plot.setPointerCapture(e.pointerId);
    } catch {
    }
    window.clearTimeout(holdT);
    if (pts.size === 2) {
      pinch0 = spread();
      cross = null;
      panning = false;
      later();
      return;
    }
    const p = loc(e);
    x0 = p.x;
    y0 = p.y;
    off0 = off;
    panning = false;
    holdT = window.setTimeout(() => {
      if (!panning && pts.size === 1) {
        cross = p;
        plot.addClass("is-cross");
        later();
      }
    }, 300);
  });
  plot.addEventListener("pointermove", (e) => {
    if (!pts.has(e.pointerId)) return;
    const p = loc(e);
    pts.set(e.pointerId, p);
    if (pts.size === 2 && pinch0) {
      const d = spread();
      if (d > pinch0 * 1.25) {
        step(true);
        pinch0 = d;
      } else if (d < pinch0 * 0.8) {
        step(false);
        pinch0 = d;
      }
      return;
    }
    if (cross) {
      cross = p;
      later();
      return;
    }
    if (!panning && Math.abs(p.x - x0) > 8 && Math.abs(p.x - x0) > Math.abs(p.y - y0)) {
      panning = true;
      window.clearTimeout(holdT);
    }
    if (!panning && Math.hypot(p.x - x0, p.y - y0) > 8) window.clearTimeout(holdT);
    if (panning && last) {
      off = Math.max(0, Math.min(last.maxOff, off0 + Math.round((p.x - x0) / Math.max(4, last.colW))));
      later();
    }
  });
  const up = (e) => {
    pts.delete(e.pointerId);
    if (pts.size < 2) pinch0 = 0;
    if (pts.size) return;
    window.clearTimeout(holdT);
    if (cross) {
      cross = null;
      plot.removeClass("is-cross");
      later();
    }
    panning = false;
  };
  plot.addEventListener("pointerup", up);
  plot.addEventListener("pointercancel", up);
  const set = (m) => {
    const was = MODE;
    MODE = m;
    btns.forEach(([k, b]) => b.toggleClass("is-on", k === m));
    const on = m !== "candle";
    chart.toggleClass("zl-hide", on);
    box.toggleClass("zl-hide", !on);
    if (on && !watching) {
      watching = true;
      flow.watch(sym);
    }
    if (!on && watching) {
      watching = false;
      flow.unwatch(sym);
    }
    off = 0;
    cross = null;
    if (on) {
      ranges();
      if (was !== m) fade();
      else later();
    }
    (on ? box : chart).addClass("zl-fade-in");
    window.setTimeout(() => (on ? box : chart).removeClass("zl-fade-in"), 400);
  };
  const btns = [["candle", t("fCandle")], ["foot", t("fFoot")], ["heat", t("fHeat")]].map(([k, label]) => {
    const b = h(seg, "button", "zl-fmode-b", label);
    b.addEventListener("click", (e) => {
      e.preventDefault();
      if (k !== MODE) set(k);
    });
    return [k, b];
  });
  flow.on((s2) => {
    if (!box.isConnected) return false;
    if (s2 === sym && !cross) later();
    return true;
  });
  new ResizeObserver(later).observe(plot);
  const gone = window.setInterval(() => {
    if (box.isConnected) return;
    window.clearInterval(gone);
    if (watching) {
      watching = false;
      flow.unwatch(sym);
    }
  }, 5e3);
  set(MODE);
};
var KIND2 = "sec";
var MON5 = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
var dayTxt = (d) => {
  const m = /^(\d{4})-?(\d{2})-?(\d{2})$/.exec(d);
  return m ? `${MON5[Number(m[2]) - 1]} ${Number(m[3])}` : d;
};
var mapPage = (x) => {
  const { ctx, P } = x, prices = ctx.plugin.prices, flow = ctx.plugin.flow;
  const title = t("fMapT");
  const el = page(title);
  el.addClass("zl-c-stack", "zl-mapg");
  const g = h(el, "div", "zl-c-group zl-c-fill zl-map");
  const top = h(g, "div", "zl-flow-top");
  const back = h(top, "button", "zl-flow-latest", t("fMapAll"));
  const src = h(top, "div", "zl-ch-src", t("fMapSrc"));
  const seg = h(top, "div", "zl-fmode");
  const plot = h(g, "div", "zl-flow-plot is-loading"), cv = h(plot, "canvas");
  h(plot, "div", "zl-flow-load", t("fTapeLoad"));
  const rd = h(g, "div", "zl-flow-read"), r12 = h(rd, "span"), r2 = h(rd, "span", "zl-flow-r2");
  const og = h(el, "div", "zl-c-group zl-orders");
  const oh = h(og, "div", "zl-flow-read"), o1 = h(oh, "span", "", t("fOrders")), o2 = h(oh, "span", "zl-flow-r2", "\xA0");
  const ocv = h(h(og, "div", "zl-orders-plot"), "canvas");
  let rects = [], raf = 0, chosen = "", chosenAt = 0, inside = null;
  const tiles = () => {
    if (inside) return inside;
    if (KIND2 === "sec") return flow.sectors.map((s2) => ({ k: s2.name, w: s2.w, pct: s2.pct }));
    const held = new Map(P.positions.filter((p) => p.shares > 0).map((p) => [p.ticker, p.value]));
    const vals = [...held.values()].filter((v) => v > 0), floor = vals.length ? Math.min(...vals) : 1;
    return P.watch.map((tk) => ({ k: tk, w: held.get(tk) || floor, pct: todayOf(prices, tk)?.pct ?? null, tap: () => ctx.push(openKey(x, tk)) }));
  };
  const pc = (n) => `${n > 0 ? "+" : n < 0 ? "\u2212" : ""}${Math.abs(n).toFixed(2)}%`;
  const draw = () => {
    raf = 0;
    if (!el.isConnected) return;
    if (chosen && Date.now() - chosenAt > 8e3) chosen = "";
    const Pl = palOf(g), list5 = tiles();
    rects = drawMap(cv, list5, Pl, chosen)?.rects ?? [];
    plot.toggleClass("is-loading", !list5.some((i) => i.pct !== null));
    back.toggleClass("is-on", !!inside);
    src.setText(inside ? t("fMapIn", { n: inside.length }) : KIND2 === "sec" ? t("fMapSrc") : t("fMapWlSrc"));
    const all = KIND2 === "sec" && !inside ? list5 : list5, known = all.filter((i) => i.pct !== null), up = known.filter((i) => (i.pct ?? 0) > 0).length;
    const tw = known.reduce((s2, i) => s2 + i.w, 0), idx = tw ? known.reduce((s2, i) => s2 + i.w * (i.pct ?? 0), 0) / tw : 0;
    const pick = chosen ? rects.find((r) => r.t.k === chosen)?.t : void 0;
    if (pick) {
      const share = tw ? pick.w / tw * 100 : 0, gives = tw && pick.pct !== null ? pick.w * pick.pct / tw : null;
      r12.setText(t("fMapPick", { k: pick.fold ? t("fMapSmall", { n: pick.fold.length }) : pick.k, p: pick.pct === null ? "-" : pc(pick.pct), s: share.toFixed(1), g: gives === null ? "-" : pc(gives) }));
      r2.setText(pick.fold ? t("fMapOpenFold") : pick.tap ? t("fMapOpen") : "\xA0");
    } else if (!known.length) {
      r12.setText(t("fMapWait"));
      r2.setText("\xA0");
    } else if (KIND2 === "sec") {
      const topS = [...known].sort((a, b) => b.w * Math.abs(b.pct ?? 0) - a.w * Math.abs(a.pct ?? 0))[0], share = tw ? topS.w * (topS.pct ?? 0) / tw : 0;
      r12.setText(t("fMapSec", { u: up, n: known.length, p: pc(idx), k: topS.k, s: pc(share) }));
      r2.setText(t("fMapSize", { d: dayTxt(flow.weightsDay()) || "-" }));
    } else {
      r12.setText(t("fMapWl", { u: up, n: known.length, p: pc(idx) }));
      r2.setText(t("fMapWlSize"));
    }
    const m = flow.mi5;
    ocv.parentElement?.toggleClass("zl-hide", !m);
    const end = m ? drawOrders(ocv, m.t, m.net, Pl) : null;
    const today3 = new Date(Date.now() + 8 * 36e5).toISOString().slice(0, 10);
    o2.setText(m ? `${m.date === today3 ? t("fMapToday") : t("fLastSession", { d: dayTxt(m.date) })}${end !== null ? ` \xB7 ${end >= 0 ? t("fBuyHeavy") : t("fSellHeavy")}` : ""}` : t("fMapWait"));
    o1.setText(t("fOrders"));
  };
  const later = () => {
    if (!raf) raf = requestAnimationFrame(draw);
  };
  const swap = () => {
    plot.addClass("is-out");
    window.setTimeout(() => {
      draw();
      plot.removeClass("is-out");
    }, 160);
  };
  const btns = [["sec", t("fSectors")], ["wl", t("fWatch")]].map(([k, label]) => {
    const b = h(seg, "button", "zl-fmode-b" + (KIND2 === k ? " is-on" : ""), label);
    b.addEventListener("click", (e) => {
      e.preventDefault();
      KIND2 = k;
      inside = null;
      chosen = "";
      btns.forEach(([q, bb]) => bb.toggleClass("is-on", q === k));
      swap();
    });
    return [k, b];
  });
  back.addEventListener("click", (e) => {
    e.preventDefault();
    inside = null;
    chosen = "";
    swap();
  });
  cv.addEventListener("click", (e) => {
    const r = cv.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    const hit2 = rects.find((q) => px >= q.x && px < q.x + q.w && py >= q.y && py < q.y + q.h)?.t;
    if (!hit2) return;
    if (chosen === hit2.k && Date.now() - chosenAt < 8e3) {
      if (hit2.fold) {
        inside = hit2.fold;
        chosen = "";
        swap();
        return;
      }
      if (hit2.tap) {
        hit2.tap();
        return;
      }
    }
    chosen = hit2.k;
    chosenAt = Date.now();
    later();
    window.setTimeout(later, 8050);
  });
  flow.map(true, () => {
    if (!el.isConnected) return false;
    later();
    return true;
  });
  const gone = window.setInterval(() => {
    if (el.isConnected) return;
    window.clearInterval(gone);
    flow.map(false);
  }, 5e3);
  prices.refresh(P.watch.map((tk) => prices.symbol(tk)));
  new ResizeObserver(later).observe(plot);
  new ResizeObserver(later).observe(ocv);
  later();
  return { title, el, still: true };
};
var sectorLine = (x, parent, tk) => {
  const prices = x.ctx.plugin.prices, flow = x.ctx.plugin.flow, sym = prices.symbol(tk);
  if (!fugleCode(sym)) return;
  const line = h(parent, "div", "zl-lastp-x"), rel = h(parent, "div", "zl-lastp-x");
  const pc = (n, d = 2) => `${n > 0 ? "+" : n < 0 ? "\u2212" : ""}${Math.abs(n).toFixed(d)}%`;
  const part = (k, v, into = line) => {
    const s2 = h(into, "span");
    h(s2, "span", "zl-lastp-xk", k);
    h(s2, "span", v === null ? "" : v > 0 ? "is-up" : v < 0 ? "is-hot" : "", v === null ? "-" : pc(v));
  };
  const paint = () => {
    if (!line.isConnected) return false;
    line.empty();
    rel.empty();
    const sec2 = flow.sectorOf(sym), sp = sec2 ? flow.idx.get(sec2.code) ?? null : null, ix = flow.idx.get("t00") ?? null, me = todayOf(prices, tk)?.pct ?? null;
    if (sec2) part(sec2.name, sp);
    part("TAIEX", ix);
    if (sec2 && sp !== null && me !== null) part("REL", me - sp, rel);
    return true;
  };
  let stop = null, codes = "";
  const start = () => {
    const sec2 = flow.sectorOf(sym), want = ["t00", ...sec2 ? [sec2.code] : []];
    if (want.join() === codes) return;
    stop?.();
    codes = want.join();
    stop = flow.follow(want, () => {
      if (!line.isConnected) {
        stop?.();
        return false;
      }
      start();
      return paint();
    });
  };
  start();
  paint();
  prices.onQuote((s2) => {
    if (!line.isConnected) return false;
    if (s2 === sym) paint();
    return true;
  });
};

// src/pages/invest-thesis.ts
var import_obsidian16 = require("obsidian");
var BENCH = "0050";
var list = (v) => Array.isArray(v) ? v : v ? [v] : [];
var thesisOf = (x, tk) => readThesis(x.ctx.plugin.store.fm(journalPath(tk)));
var vs0050 = (x, tk, since) => {
  const pr = x.ctx.plugin.prices;
  pr.refreshSeries(tk, "D");
  pr.refreshSeries(BENCH, "D");
  return tk === BENCH ? null : vsBench(pr.series(tk, "D")?.bars, pr.series(BENCH, "D")?.bars, since);
};
var editThesis = (x, tk, then) => {
  const th = thesisOf(x, tk), store = x.ctx.plugin.store;
  new FormSheet(x.ctx.app, {
    title: t("thTitle"),
    subtitle: tk,
    submitText: t("save"),
    fields: [
      { key: "why", label: t("thWhy"), type: "text", value: th?.why ?? "", required: true, placeholder: t("thWhyPh") },
      { key: "check", label: t("thCheck"), type: "date", value: th?.check || "", required: false, note: () => t("thCheckNote") },
      { key: "hold", label: t("thHold"), type: "text", value: th?.hold ?? "", required: false, placeholder: t("thHoldPh") },
      { key: "sell", label: t("thSell"), type: "text", value: th?.sell ?? "", required: false, placeholder: t("thSellPh") }
    ],
    onSubmit: async (v) => {
      await store.update(journalPath(tk), (f) => {
        f.ticker = tk;
        const old = f.thesis ?? {};
        f.thesis = { why: v.why.trim(), check: v.check || "", hold: (v.hold ?? "").trim(), sell: (v.sell ?? "").trim(), since: old.since || today() };
      });
      then?.();
    }
  }).open();
};
var answer = async (x, tk, th, held) => {
  await x.ctx.plugin.store.update(journalPath(tk), (f) => {
    f.ticker = tk;
    f.journal = [...list(f.journal), { date: today(), why: t(held ? "thHeldJ" : "thNotHeldJ", { d: shortDate(th.check), what: th.hold || th.why }) }];
  });
  editThesis(x, tk);
};
var thesisCard = (x, parent, tk) => {
  const th = thesisOf(x, tk);
  const g = h(parent, "div", "zl-c-group zl-thesis");
  if (!th) {
    const b = h(g, "button", "zl-th-write");
    sprite(b, "receipt", "zl-px");
    h(b, "span", "", t("thWrite").toUpperCase());
    sprite(b, "back", "zl-px zl-th-go");
    b.addEventListener("click", (e) => {
      e.preventDefault();
      editThesis(x, tk);
    });
    return;
  }
  const head = h(g, "button", "zl-sec");
  h(head, "span", "", t("thHead").toUpperCase());
  const go = h(head, "span", "zl-sec-go", t("thEdit").toUpperCase());
  sprite(go, "back");
  head.addEventListener("click", (e) => {
    e.preventDefault();
    editThesis(x, tk);
  });
  const row2 = (k, cls = "") => {
    const r = h(g, "div", "zl-th-row " + cls);
    h(r, "span", "zl-th-k", k);
    return h(r, "span", "zl-th-v");
  };
  row2(t("thWhy")).setText(th.why);
  const st = checkState(th.check, today());
  if (st === "due") {
    const r = h(g, "div", "zl-th-row is-due");
    h(r, "span", "zl-th-k", t("thCheck"));
    const v = h(r, "span", "zl-th-v");
    h(v, "span", "zl-th-q", t("thDidHold", { d: shortDate(th.check).toUpperCase() }));
    if (th.hold) h(v, "span", "zl-th-s", th.hold);
    const bs = h(r, "span", "zl-th-yn");
    h(bs, "button", "zl-chip", t("thYes").toUpperCase()).addEventListener("click", (e) => {
      e.preventDefault();
      void answer(x, tk, th, true);
    });
    h(bs, "button", "zl-chip", t("thNo").toUpperCase()).addEventListener("click", (e) => {
      e.preventDefault();
      void answer(x, tk, th, false);
    });
  } else if (st !== "none") {
    const v = row2(t("thCheck"), st === "soon" ? "is-soon" : "");
    const top = h(v, "span", "zl-th-line");
    h(top, "span", "zl-th-t", th.hold || "-");
    h(top, "span", "zl-th-d", shortDate(th.check).toUpperCase());
    h(v, "span", "zl-th-s", t("thDays", { n: daysBetween(today(), th.check) }));
  }
  if (th.sell) row2(t("thSell")).setText(th.sell);
  if (tk !== BENCH) {
    const r = h(g, "div", "zl-th-row zl-th-vs");
    const k = h(r, "span", "zl-th-k");
    const v = h(r, "span", "zl-th-n");
    const paint = () => {
      const d = th.since ? vs0050(x, tk, th.since) : null;
      k.setText(d ? t("thVs", { b: BENCH, d: shortDate(d.from) }) : t("thVsNone", { b: BENCH }));
      v.setText(d ? pctS(d.diff) : "\xA0");
      v.toggleClass("is-up", !!d && d.diff > 0);
      v.toggleClass("is-hot", !!d && d.diff < 0);
    };
    paint();
    x.ctx.plugin.prices.onSeries(() => {
      if (!r.isConnected) return false;
      paint();
      return true;
    });
  }
};
var thesisLine = (x, tk) => (parent) => {
  const th = thesisOf(x, tk);
  const b = h(parent, "button", "zl-th-strip");
  if (!th) {
    b.addClass("is-loud");
    h(b, "span", "", t("thWrite").toUpperCase() + " \u203A");
    b.addEventListener("click", (e) => {
      e.preventDefault();
      editThesis(x, tk);
    });
    return;
  }
  const st = checkState(th.check, today());
  h(b, "span", "zl-th-strip-k", t("thHead").toUpperCase());
  if (st !== "none") h(b, "span", "zl-th-strip-c" + (st === "later" ? "" : " is-loud"), `${st === "due" ? t("thDidHold", { d: shortDate(th.check).toUpperCase() }) : `${t("thCheck").toUpperCase()} ${shortDate(th.check).toUpperCase()}`}${th.hold ? ` \xB7 ${th.hold}` : ""}`);
  else h(b, "span", "zl-th-strip-c", th.why);
  const d = th.since ? vs0050(x, tk, th.since) : null;
  if (d) h(b, "span", "zl-th-strip-n" + (d.diff > 0 ? " is-up" : d.diff < 0 ? " is-hot" : ""), `${t("thVsShort", { b: BENCH })} ${pctS(d.diff)}`);
  b.addEventListener("click", (e) => {
    e.preventDefault();
    const layer = b.closest(".zl-fchart") ?? document.body;
    const pane = h(layer, "div", "zl-th-float");
    thesisCard(x, pane, tk);
    const off = (ev) => {
      if (!pane.contains(ev.target) || ev.target.closest("button")) {
        pane.remove();
        document.removeEventListener("pointerdown", off, true);
      }
    };
    window.setTimeout(() => document.addEventListener("pointerdown", off, true), 0);
  });
};
var RULE_K = { thesis: "rkThesis", sell: "rkSell", cap: "rkCap", batch: "rkBatch", emergency: "rkEmergency", limit: "rkLimit", sat: "rkSat" };
var buyCheck = (x, tk, go) => {
  const { store, prices } = x.ctx.plugin;
  const p = x.P.positions.find((q) => q.ticker === tk);
  const single = p ? p.category === "stock" : !/^00\d/.test(tk) && /^\d{4}$/.test(tk);
  const A = buildAccounts(store.fm(store.path(ACCOUNTS_FILE)));
  const em = A.list.find((a) => a.key === "emergency" || /emergency/i.test(a.label));
  const minE = Math.max(emergencyMinOf(store.fm(store.path(FILES.invest))), em?.target ?? 0);
  const sat = satVsBench(x.P.positions.filter((q) => q.shares > 0 && q.category === "stock").map((q) => {
    const first2 = q.trades.find((tr) => tr.type === "BUY")?.date ?? "";
    const d = first2 ? vs0050(x, q.ticker, first2) : null;
    return { cost: q.cost, diff: d ? d.diff : null };
  }));
  let limit = null;
  const live = prices.price(tk);
  const m = new import_obsidian16.Modal(x.ctx.app);
  const c = base(m, t("bcTitle", { tk }));
  m.containerEl.addClass("zl-sheet-host");
  const meta = h(c, "div", "zl-bc-met");
  const box = h(c, "div", "zl-figs is-compact zl-bc-rows");
  const note = h(c, "div", "zl-field-note");
  const paint = () => {
    const th = thesisOf(x, tk);
    const R = buyRules({ thesis: th, single, cost: p?.cost ?? 0, cap: x.cap, buys: p?.trades.filter((tr) => tr.type === "BUY").length ?? 0, emergency: em ? em.balance : null, emergencyMin: minE, limit, sat });
    meta.setText(t("bcMet", { n: R.met, of: R.rows.length }));
    box.empty();
    for (const r of R.rows) {
      const row2 = h(box, "button", "zl-fig" + (r.met === false ? " is-not" : ""));
      sprite(row2, r.met === true ? "check" : r.met === false ? "close" : "list", "zl-px zl-fig-ic");
      const mm = h(row2, "span", "zl-fig-main");
      h(mm, "span", "zl-fig-k", t(RULE_K[r.key], { n: num(x.cap), e: num(minE), b: BENCH }));
      const sub = r.key === "cap" ? single ? t("rsCap", { n: num(Math.max(0, r.left ?? 0)) }) : t("rsCapFree") : r.key === "batch" ? single ? t("rsBatch", { n: r.n ?? 1, of: r.of ?? 3, per: num(r.per ?? 0) }) : t("rsBatchFree") : r.key === "emergency" ? em ? t("rsEmergency", { n: num(em.balance) }) : t("rsNone") : r.key === "limit" ? t("rsLimit") : r.key === "sat" ? t("rsSat") : r.key === "thesis" ? t("rsThesis") : t("rsSell");
      h(mm, "span", "zl-fig-s", sub);
      const val = r.key === "limit" ? limit ? price2(limit) : t("rvSet") : r.key === "sat" ? sat === null ? "-" : pctS(sat) : r.met === null ? "-" : r.met ? t("rvMet") : r.key === "thesis" || r.key === "sell" ? t("rvWrite") : t("rvNot");
      h(row2, "span", "zl-fig-v" + (r.met === false ? " is-hot" : r.key === "sat" && sat !== null && sat > 0 ? " is-up" : ""), val.toUpperCase());
      const tap = r.key === "thesis" || r.key === "sell" ? () => editThesis(x, tk, paint) : r.key === "limit" ? () => new FormSheet(x.ctx.app, {
        title: t("rkLimit"),
        subtitle: tk,
        submitText: t("save"),
        fields: [{ key: "price", label: t("iPrice"), type: "number", required: true, dec: 2, step: 0.05, value: limit ? limit / 100 : live ?? "", note: () => t("rsLimitNote") }],
        onSubmit: async (v) => {
          limit = Math.round(parseNum(v.price) * 100) || null;
          paint();
        }
      }).open() : null;
      if (tap) {
        sprite(row2, "back", "zl-px zl-fig-go");
        row2.addEventListener("click", (e) => {
          e.preventDefault();
          tap();
        });
      }
    }
    const open2 = R.rows.filter((r) => (r.key === "thesis" || r.key === "sell") && r.met === false).length;
    note.setText(open2 ? t("bcNoteOpen", { n: open2 }) : t("bcNote"));
  };
  paint();
  const bar = h(c, "div", "zl-sheet-btns");
  if (p && p.shares > 0) h(bar, "button", "", t("iSell").toUpperCase()).addEventListener("click", () => {
    m.close();
    go({ type: "SELL" });
  });
  else h(bar, "button", "", t("bcWrite").toUpperCase()).addEventListener("click", () => editThesis(x, tk, paint));
  h(bar, "button", "mod-cta", t("bcGo").toUpperCase() + " \u203A").addEventListener("click", () => {
    m.close();
    go({ type: "BUY", price: limit ? limit / 100 : void 0 });
  });
  m.open();
};

// src/pages/invest-revenue.ts
var MON6 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var monthName = (ym, year = false) => `${MON6[Number(ym.slice(5, 7)) - 1]}${year ? ` ${ym.slice(0, 4)}` : ""}`;
var SEEN = "ledgerline-revenue-seen";
var seen = (x) => {
  try {
    return x.ctx.app.loadLocalStorage(SEEN) ?? {};
  } catch {
    return {};
  }
};
var revCode = (x, tk) => Flows.code(x.ctx.plugin.prices.symbol(tk));
var statsOf = (x, code) => revStats(x.ctx.plugin.revenue.get(code));
var revenueTile = (x, tk) => {
  const code = revCode(x, tk);
  if (!code || /^00\d/.test(code)) return null;
  const rv = x.ctx.plugin.revenue;
  rv.ensure(code);
  const val = () => {
    const s2 = statsOf(x, code);
    return s2 ? { v: s2.yoy === null ? revShort(s2.latest.v) : pctS(s2.yoy), s: `${monthName(s2.latest.ym).toUpperCase()} \xB7 ${t("rvYoy")}`, n: s2.yoy ?? 0, fresh: seen(x)[code] !== s2.latest.ym } : { v: "-", s: "", n: 0, fresh: false };
  };
  const v0 = val();
  const paint = (b) => {
    const v = val();
    b.querySelector(".zl-tg-v")?.setText(v.v);
    (b.querySelector(".zl-tg-s") ?? b.createSpan({ cls: "zl-tg-s" })).setText(v.s);
    b.toggleClass("is-up", v.n > 0);
    b.toggleClass("is-hot", v.n < 0);
    b.toggleClass("is-dim", v.v === "-");
    b.toggleClass("is-new", v.fresh);
  };
  return {
    k: t("rvTile"),
    icon: "receipt",
    v: v0.v,
    s: v0.s,
    dim: v0.v === "-",
    onTap: () => x.ctx.push({ key: "revenue:" + tk, title: t("rvTitle", { tk }) }),
    ref: (b) => {
      b.addClass("is-mkt");
      paint(b);
      rv.onChange((c) => {
        if (!b.isConnected) return false;
        if (c === code) paint(b);
        return true;
      });
    }
  };
};
var revenuePage = (x, tk) => {
  const title = t("rvTitle", { tk });
  const el = page(title);
  el.addClass("zl-c-stack");
  const code = revCode(x, tk), rv = x.ctx.plugin.revenue;
  if (code) rv.ensure(code);
  const s2 = code ? statsOf(x, code) : null;
  if (!code || !s2) {
    summary(el, { key: "rev-" + tk, label: t("rvNone"), value: "-", dim: true });
    h(el, "div", "zl-field-note", t("rvNoneS"));
    if (code) rv.onChange((c) => {
      if (!el.isConnected) return false;
      if (c === code) x.ctx.redraw();
      return true;
    });
    return { title, el };
  }
  try {
    x.ctx.app.saveLocalStorage(SEEN, { ...seen(x), [code]: s2.latest.ym });
  } catch {
  }
  const tone = (n) => n === null ? "-" : pctS(n);
  const top = summary(el, {
    key: "rev-" + tk,
    label: t("rvMonth", { m: monthName(s2.latest.ym) }),
    value: revShort(s2.latest.v),
    items: [[t("rvVs", { m: monthName(ymAdd(s2.latest.ym, -12), true) }), tone(s2.yoy), (s2.yoy ?? 0) < 0], [t("rvVs", { m: monthName(ymAdd(s2.latest.ym, -1)) }), tone(s2.mom), (s2.mom ?? 0) < 0]]
  });
  top.querySelectorAll(".zl-sum-v").forEach((v) => v.toggleClass("is-up", /^\+/.test(v.textContent ?? "")));
  const g = h(el, "div", "zl-c-group zl-c-fill zl-rev");
  sec(g, t("rvBars", { n: s2.months.length }));
  const line = h(g, "div", "zl-rev-pick");
  const show = (i) => {
    const m = s2.months[i];
    line.setText(`${monthName(m.ym, true).toUpperCase()} \xB7 ${revShort(m.v)} \xB7 ${t("rvYoy")} ${tone(m.yoy)}`);
  };
  show(s2.months.length - 1);
  pickBars(g, { vals: s2.months.map((m) => m.v), strip: s2.months.map((m) => m.yoy), labels: s2.months.map((m, i) => i % 3 === 2 ? monthName(m.ym)[0] : ""), pick: s2.months.length - 1, onPick: show });
  const f = h(el, "div", "zl-c-group");
  sec(f, t("rvCompared"));
  const last3 = s2.months.slice(-3);
  figures(f, [
    { icon: "clock", k: t("rvLast3"), s: last3.length === 3 ? `${monthName(last3[0].ym)}\u2013${monthName(last3[2].ym)} ${t("rvYearAgo")}` : "", v: tone(s2.last3), hot: (s2.last3 ?? 0) < 0 },
    { icon: "list", k: t("rvYtd"), s: t("rvYtdS", { m: monthName(s2.latest.ym), y: String(Number(s2.latest.ym.slice(0, 4)) - 1) }), v: tone(s2.ytd), hot: (s2.ytd ?? 0) < 0 },
    { icon: "up", k: t("rvBest", { n: s2.months.length }), s: monthName(s2.best.ym, true), v: revShort(s2.best.v) },
    { icon: "clock", k: t("rvNext"), s: t("rvNextS", { m: monthName(ymAdd(s2.latest.ym, 1)) }), v: shortDate(s2.nextOut).toUpperCase(), onTap: () => x.ctx.push({ key: "alerts", title: t("alTitle") }) }
  ]);
  f.querySelectorAll(".zl-fig-v").forEach((v, i) => {
    if (i < 2) v.toggleClass("is-up", /^\+/.test(v.textContent ?? ""));
  });
  h(el, "div", "zl-field-note zl-rev-src", t("rvSrc"));
  return { title, el, still: true };
};

// src/pages/invest-ticker.ts
var tradeFab = (x, tk) => ({ icon: "plus", text: t("iTrade").toUpperCase(), label: t("iTrade"), onTap: () => buyCheck(x, tk, (o) => x.trade(tk, o)) });
var LAST = /* @__PURE__ */ new Map();
var asOfText = (ms) => {
  if (!ms) return "";
  const d = new Date(ms), hm2 = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return t("iAsOf", { t: day === today() ? hm2 : `${shortDate(day)} ${hm2}` });
};
var assetPage = (x, p) => {
  const { ctx } = x;
  const el = page(p.ticker);
  el.addClass("zl-c-stack");
  const costP = p.q > 0 ? Math.round(p.avg / x.fx(p.currency) * 100) : null;
  chartBlock(x, el, p.ticker, p.currency, costP);
  thesisCard(x, el, p.ticker);
  const hold = h(el, "div", "zl-c-group zl-hold");
  const items2 = [
    [t("iYouHold"), qty(p.shares), false],
    [t("iAvgCost"), costP !== null ? price2(costP) : "-", false],
    [p.price !== null ? `${t("iValueNow")} ${pctS(p.cost > 0 ? p.pl / p.cost * 100 : 0)}` : t("iValueNow"), num(p.value), p.pl < 0]
  ];
  const r = h(hold, "div", "zl-sum-items");
  const vals = items2.map(([k, v, hot]) => {
    const it = h(r, "div");
    return [h(it, "span", "zl-sum-k", k.toUpperCase()), h(it, "span", "zl-sum-v" + (hot ? " is-hot" : ""), v)];
  });
  const pr = ctx.plugin.prices, sym = pr.symbol(p.ticker);
  pr.onQuote((s2) => {
    if (!el.isConnected) return false;
    if (s2 !== sym) return true;
    const q = atNow(pr, p.ticker, p);
    if (q.price === null) return true;
    vals[2][0].setText(`${t("iValueNow")} ${pctS(q.cost > 0 ? q.pl / q.cost * 100 : 0)}`.toUpperCase());
    vals[2][1].setText(num(q.value));
    vals[2][1].toggleClass("is-hot", q.pl < 0);
    vals[2][1].toggleClass("is-up", q.pl > 0);
    return true;
  });
  const next = nextDca(p.dca, today()), thoughts = x.journal(p.ticker);
  const off = p.trades.some((tr) => {
    const l = x.links.get(tr.id);
    return !!l && !!l.diff;
  }) || p.trades.some((tr) => !x.links.get(tr.id));
  const tiles = [
    flowsTile(ctx, p.ticker, flowCodes(ctx, flowTickers(x.P))),
    revenueTile(x, p.ticker),
    { k: t("iTrades"), icon: "list", v: String(p.trades.length), hot: off, onTap: () => ctx.push({ key: "trades:" + p.ticker, title: t("iTrades") }) },
    { k: t("iPlanT"), icon: "calendar", v: next ? shortDate(next) : "-", dim: !p.dca, onTap: () => x.editPlan(p) },
    { k: t("iJournal"), icon: "receipt", v: String(thoughts.length), dim: !thoughts.length, onTap: () => ctx.push({ key: "journal:" + p.ticker, title: t("iJournal") }) }
  ].filter((v) => !!v);
  tileGrid(h(el, "div", "zl-c-group"), tiles);
  return { title: p.ticker, el, still: true, actions: [drawAct(x, p.ticker)], fab: tradeFab(x, p.ticker) };
};
var tradesPage = (x, p) => {
  const title = t("iTrades");
  const el = page(title);
  el.addClass("zl-c-list");
  summary(el, { key: "trades-" + p.ticker, label: `${p.ticker} \xB7 ${t("iRealized")}`, value: signed3(p.realized), hot: p.realized < 0, items: [[t("iFees"), num(p.fees)], [t("iTrades"), String(p.trades.length)]] });
  const g = h(el, "div", "zl-c-group");
  const gap = (tr) => {
    const l = x.links.get(tr.id);
    return !l || !l.diff ? "" : ` \xB7 ${l.booked ? t("iBooksOff", { n: num(l.diff) }) : t("iNotBooked")}`;
  };
  figures(g, [...p.trades].sort((a, b) => b.date.localeCompare(a.date) || b.index - a.index).map((tr) => ({
    icon: tr.type === "SELL" ? "up" : "down",
    k: `${tr.type === "SELL" ? t("iSell") : t("iBuy")} ${qty(tr.shares)}`.toUpperCase(),
    s: `${tr.date ? shortDate(tr.date) : t("noDate")} \xB7 @ ${tr.price.toLocaleString()} ${p.currency}${tr.fee + tr.tax ? ` \xB7 ${t("iFeeN", { n: ((tr.fee + tr.tax) / minorOf(p.currency)).toLocaleString() })}` : ""}${tr.pending ? ` \xB7 ${t("iPending")}` : ""}${gap(tr)}`,
    v: num(Math.abs(tr.cash)),
    hot: !!gap(tr),
    onTap: () => x.editTrade(p, tr)
  })));
  return { title, el, fab: { icon: "plus", text: t("iTrade").toUpperCase(), label: t("iTrade"), onTap: () => x.trade(p.ticker) } };
};
var DRAWN = /* @__PURE__ */ new WeakMap();
var chartBlock = (x, el, tk, currency, cost) => {
  const { ctx } = x;
  const prices = ctx.plugin.prices, q = prices.get(tk), bars2 = prices.series(tk, "D")?.bars, live = liveOf(prices, tk);
  prices.refreshSeries(tk, "D");
  const lastP = live?.price ?? bars2?.c[bars2.c.length - 1] ?? null;
  const td = todayOf(prices, tk), ch = td?.ch ?? null;
  const top = h(el, "div", "zl-c-group zl-c-top zl-lastp");
  const lt = h(top, "div", "zl-lastp-l");
  const isOpen = () => prices.isOpen(tk);
  const kText = () => t(isOpen() ? "iNowPrice" : "iLastPrice");
  const srcText = () => {
    const q2 = prices.get(tk), a = q2?.asOf;
    const tm = a ? shownTime(prices.symbol(tk), a) : "";
    return q2?.source ? `${q2.source.toUpperCase()}${tm ? ` \xB7 ${tm}` : ""}` : "\xA0";
  };
  const kEl = h(lt, "div", "zl-lastp-k", kText());
  h(lt, "div", "zl-lastp-s" + (ch !== null && ch < 0 ? " is-hot" : ch !== null && ch > 0 ? " is-up" : ""), !td ? asOfText(q?.asOf ?? null) : t("iToday", { n: `${td.ch > 0 ? "+" : td.ch < 0 ? "\u2212" : ""}${price2(Math.abs(td.ch))}`, p: pctS(td.pct) }));
  let f = LAST.get(tk);
  if (!f) {
    f = new Flap("md");
    LAST.set(tk, f);
  }
  top.appendChild(f.el);
  let loading = lastP === null;
  f.set(lastP !== null ? price2(lastP) : "\xA0".repeat(6));
  const flap2 = f, todayEl = lt.lastElementChild;
  sectorLine(x, lt, tk);
  const loaded = (text2) => {
    if (!loading) return;
    loading = false;
    top.removeClass("is-loading");
    flap2.set(text2);
  };
  if (loading) {
    top.addClass("is-loading");
    window.setTimeout(() => loaded("-"), 15e3);
  }
  prices.onQuote((sym) => {
    if (!el.isConnected) return false;
    if (sym !== prices.symbol(tk)) return true;
    const lv = liveOf(prices, tk);
    if (!lv) return true;
    if (loading) loaded(price2(lv.price));
    else flap2.set(price2(lv.price));
    kEl.setText(kText());
    srcEl.setText(srcText());
    const d = todayOf(prices, tk);
    if (d) {
      todayEl.setText(t("iToday", { n: `${d.ch > 0 ? "+" : d.ch < 0 ? "\u2212" : ""}${price2(Math.abs(d.ch))}`, p: pctS(d.pct) }));
      todayEl.toggleClass("is-hot", d.ch < 0);
      todayEl.toggleClass("is-up", d.ch > 0);
    }
    return true;
  });
  prices.watch(tk);
  let tick2 = 0;
  const poll = window.setInterval(() => {
    if (!el.isConnected) {
      window.clearInterval(poll);
      prices.unwatch(tk);
      return;
    }
    if (document.hidden || !prices.isOpen(tk) && tick2++ % 12) return;
    void prices.live(tk);
  }, 5e3);
  const cg = h(el, "div", "zl-c-group zl-c-fill zl-chartg");
  const srcRow = h(cg, "div", "zl-flow-top");
  const srcEl = h(srcRow, "div", "zl-ch-src", srcText());
  const memo = DRAWN.get(ctx.frame) ?? [];
  DRAWN.set(ctx.frame, memo);
  const cv = holdingChart(cg, { ticker: tk, currency, prices, prefs: readPrefs(ctx.plugin.store.fm(journalPath(tk))), cost, memo, height: 0, onLeave: () => ctx.pop(), fullLine: thesisLine(x, tk) });
  flowModes(x, srcRow, cg, tk, cv.el);
};
var drawAct = (x, tk) => ({ text: t("iChartSet"), label: t("dTitle", { tk }), onTap: () => new DrawingsSheet(x.ctx.app, x.ctx.plugin.store, tk, () => x.addThought(tk)).open() });
var tickerPage = (x, tk) => {
  const { ctx, P } = x;
  const prices = ctx.plugin.prices;
  prices.refresh([prices.symbol(tk)]);
  const el = page(tk);
  el.addClass("zl-c-stack");
  const watched = P.watch.includes(tk);
  chartBlock(x, el, tk, guessCur(prices.symbol(tk)), null);
  thesisCard(x, el, tk);
  const tiles = [
    watched ? { k: "", icon: "eye", v: t("iWatching").toUpperCase(), onTap: () => {
      void x.dropWatch(tk);
    } } : { k: t("iWatch"), icon: "plus", v: t("iWatchAdd"), onTap: () => {
      void x.watchOn(tk);
    } },
    flowsTile(ctx, tk, flowCodes(ctx, flowTickers(P))),
    revenueTile(x, tk)
  ].filter((v) => !!v);
  tileGrid(h(el, "div", "zl-c-group"), tiles);
  return { title: tk, el, still: true, actions: [drawAct(x, tk)], fab: tradeFab(x, tk) };
};
var journalPage = (x, tk) => {
  const { ctx } = x;
  const title = t("iJournal");
  const el = page(title);
  el.addClass("zl-c-list");
  const g = h(el, "div", "zl-c-group");
  sec(g, tk);
  const js = x.journal(tk);
  figures(g, [
    ...js.length ? js.map((j) => ({ icon: j.trade ? "invest" : "list", k: j.date ? shortDate(j.date).toUpperCase() : t("noDate").toUpperCase(), s: j.why, v: "" })) : [{ k: t("iJournalNone").toUpperCase(), v: "-", dim: true }],
    ...ctx.plugin.store.file(journalPath(tk)) ? [{ icon: "receipt", k: t("iOpenNote").toUpperCase(), v: "", onTap: () => {
      void ctx.plugin.openPath(journalPath(tk));
    } }] : []
  ]);
  return { title, el, fab: { icon: "plus", text: t("iThought").toUpperCase(), label: t("iThought"), onTap: () => x.addThought(tk) } };
};

// src/pages/invest-holdings.ts
var holdingsPage = (x) => {
  const { ctx, P } = x;
  const title = t("iHoldingsT");
  const el = page(title);
  el.addClass("zl-c-list");
  summary(el, { label: t("iWorth"), value: num(P.value), items: [[t("iCost"), num(P.cost)], [t("iPL"), signed3(P.pl), P.pl < 0], [t("iRealized"), signed3(P.realized), P.realized < 0]] });
  const g = h(el, "div", "zl-c-group");
  hrows(x, g, P.positions);
  return { title, el, actions: [findAct(x, el)], fab: { icon: "plus", text: t("iTrade").toUpperCase(), label: t("iTrade"), onTap: () => x.trade() } };
};
var retOf = (x, tk, p) => {
  const pr = x.ctx.plugin.prices, ok = p.price !== null;
  return { t: [ok ? pctS(p.cost > 0 ? p.pl / p.cost * 100 : 0) : "-"], hot: [p.pl < 0], k: [""], ret: [true], tk, re: () => retOf(x, tk, atNow(pr, tk, p)) };
};
var hrows = (x, parent, ps) => {
  const pr = x.ctx.plugin.prices;
  const box = h(parent, "div", "zl-figs zl-hrows");
  ps.forEach((p, i) => {
    const on = p.shares > 0;
    const b = h(box, "button", "zl-fig zl-hrow zl-in" + (on ? "" : " is-dim"));
    b.style.setProperty("--i", String(i));
    b.dataset.k = p.ticker;
    h(b, "span", "zl-hrow-k", p.ticker);
    const price = h(b, "span", "zl-hrow-p", on ? lastOf(x, p.ticker) : "");
    const value = h(b, "span", "zl-hrow-v", num(p.value));
    h(b, "span", "zl-hrow-s", on ? t("iSharesN", { n: qty(p.shares) }) : t("iClosed"));
    const today3 = h(b, "span", "zl-hrow-d");
    const paint = () => {
      const d = on ? todayOf(pr, p.ticker) : null;
      today3.setText(d ? pctS(d.pct) : on ? "-" : "");
      today3.toggleClass("is-hot", !!d && d.ch < 0);
      today3.toggleClass("is-up", !!d && d.ch > 0);
    };
    paint();
    if (on) chgEl(x, b, retOf(x, p.ticker, p), "zl-hrow-r", `holdings|${p.ticker}`);
    else h(b, "span", "zl-hrow-r");
    b.addEventListener("click", (e) => {
      e.preventDefault();
      x.ctx.push({ key: "asset:" + p.ticker, title: p.ticker });
    });
    if (!on) return;
    const sym = pr.symbol(p.ticker);
    pr.onQuote((s2) => {
      if (!b.isConnected) return false;
      if (s2 !== sym) return true;
      price.setText(lastOf(x, p.ticker));
      value.setText(num(atNow(pr, p.ticker, p).value));
      paint();
      return true;
    });
  });
};

// src/pages/invest-alerts.ts
var FILTER = "all";
var list2 = (v) => Array.isArray(v) ? v : v ? [v] : [];
var p22 = (n) => (n / 100).toLocaleString(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
var alertSheet = (x, a, preset) => {
  const { store, alerts, prices } = x.ctx.plugin;
  const path = alerts.path();
  new FormSheet(x.ctx.app, {
    title: a ? t("alEdit") : t("alNew"),
    subtitle: a?.ticker ?? preset,
    submitText: t("save"),
    fields: [
      ...a || preset ? [] : [{ key: "tk", label: t("iTicker"), type: "text", required: true }],
      { key: "kind", label: t("alKind"), type: "select", value: a?.kind ?? "below", options: [["below", t("alBelow")], ["above", t("alAbove")]] },
      {
        key: "price",
        label: t("iPrice"),
        type: "number",
        required: true,
        dec: 2,
        step: 0.05,
        value: a ? a.price / 100 : "",
        auto: (v) => {
          const q = prices.price(a?.ticker ?? preset ?? (v.tk ?? "").trim().toUpperCase());
          return q ? String(Math.round(q * 100) / 100) : "";
        },
        note: () => t("alPriceNote")
      }
    ],
    validate: (v) => parseNum(v.price) > 0 ? null : t("invalidNumber"),
    onSubmit: async (v) => {
      const tk = a?.ticker ?? preset ?? v.tk.trim().toUpperCase();
      await store.update(path, (f) => {
        const xs2 = list2(f.alerts);
        const row2 = { id: a?.id ?? `a${Date.now().toString(36)}`, ticker: tk, kind: v.kind === "above" ? "above" : "below", price: parseNum(v.price) };
        if (a && xs2[a.index]) xs2[a.index] = row2;
        else xs2.push(row2);
        f.alerts = xs2;
      });
    },
    danger: a ? { text: t("alRemove"), onTap: async () => {
      if (!await confirmSheet(x.ctx.app, t("alRemove"), t("alRemoveQ", { tk: a.ticker, p: p22(a.price) }), t("remove"))) return false;
      await store.update(path, (f) => {
        const xs2 = list2(f.alerts);
        xs2.splice(a.index, 1);
        f.alerts = xs2;
      });
      return true;
    } } : void 0
  }).open();
};
var alertsPage = (x) => {
  const { alerts, prices } = x.ctx.plugin;
  const title = t("alTitle");
  const el = page(title);
  el.addClass("zl-c-list");
  const A = alerts.read(), day = today();
  const top = h(el, "div", "zl-c-group zl-al-top");
  const words = h(top, "div", "zl-words");
  for (const [k, label] of [["all", t("alAll")], ["price", t("alPrices")], ["date", t("alDates")]]) {
    const b = h(words, "button", "zl-chip" + (FILTER === k ? " is-on" : ""), label.toUpperCase());
    b.addEventListener("click", (e) => {
      e.preventDefault();
      FILTER = k;
      x.ctx.redraw();
    });
  }
  const push = h(top, "button", "zl-al-push", (A.topic ? t("alPushOn") : t("alPushOff")).toUpperCase());
  push.addEventListener("click", (e) => {
    e.preventDefault();
    void x.ctx.plugin.openPath(alerts.path());
  });
  const rows = [];
  if (FILTER !== "date") for (const a of A.alerts) {
    const q = prices.price(a.ticker), now = q === null ? null : Math.round(q * 100);
    rows.push({
      at: "",
      icon: a.kind === "below" ? "down" : "up",
      k: t("alPriceK", { tk: a.ticker, k: a.kind === "below" ? "\u2264" : "\u2265", p: p22(a.price) }),
      s: now === null ? t("alNoPrice") : t("alAway", { now: p22(now), n: Math.max(0, away(a, now)).toFixed(1) }),
      v: p22(a.price),
      onTap: () => alertSheet(x, a)
    });
  }
  if (FILTER !== "price") for (const d of alerts.coming(day)) {
    const n = daysBetween(day, d.date), when = n <= 0 ? t("alToday") : shortDate(d.date);
    const k = d.kind === "revenue" ? t("alRevK", { tk: d.ticker }) : d.kind === "report" ? t("alReportK", { q: d.what }) : d.kind === "exdiv" ? t("alExdivK", { tk: d.ticker }) : t("alThesisK", { tk: d.ticker });
    const s2 = d.kind === "revenue" ? t("alRevS") : d.kind === "report" ? t("alReportS") : d.kind === "exdiv" ? t("alExdivS", { n: ((d.cash ?? 0) / 100).toLocaleString() }) : d.what || t("alThesisS");
    rows.push({ at: d.date, icon: d.kind === "thesis" ? "receipt" : "clock", k, s: s2, v: when.toUpperCase(), hot: n <= 0, onTap: d.ticker ? () => x.ctx.push({ key: d.kind === "revenue" ? "revenue:" + d.ticker : "chart:" + d.ticker, title: d.ticker }) : void 0 });
  }
  const g = h(el, "div", "zl-c-group");
  sec(g, `${t("alComing").toUpperCase()} \xB7 ${rows.length}`);
  figures(g, rows.length ? rows.sort((a, b) => (a.at || "0").localeCompare(b.at || "0")) : [{ k: t("alNone"), v: "-", dim: true }]);
  const sent = [...A.sent].reverse();
  if (sent.length) {
    const s2 = h(el, "div", "zl-c-group");
    sec(s2, t("alSent").toUpperCase());
    figures(s2, sent.map((x2) => ({ icon: "check", k: x2.text.split(" \xB7 ").slice(1).join(" \xB7 ") || x2.text, s: x2.text.split(" \xB7 ")[0], v: t("alSentV").toUpperCase(), dim: true })));
  }
  h(el, "div", "zl-field-note", t("alFoot"));
  return { title, el, fab: { icon: "plus", text: t("alNew").toUpperCase(), label: t("alNew"), onTap: () => alertSheet(x) } };
};

// src/pages/invest-watch.ts
var qrows = (x, parent, list5, rows, move) => {
  const box = h(parent, "div", "zl-figs zl-qrows");
  const els = [];
  rows.forEach((r, i) => {
    const b = h(box, "button", "zl-fig zl-qrow zl-in" + (r.dim ? " is-dim" : ""));
    b.style.setProperty("--i", String(i));
    b.dataset.k = r.k;
    const ic = sprite(b, move ? "grip" : r.icon, "zl-px zl-fig-ic");
    if (move) {
      els.push(b);
      dragRow(box, b, ic, els, () => move(els.map((e) => e.dataset.k ?? "")));
    }
    h(b, "span", "zl-qrow-k", r.k);
    h(b, "span", "zl-qrow-v", r.v);
    h(b, "span", "zl-qrow-s", r.s || "\xA0");
    if (r.chg) chgEl(x, b, r.chg, "zl-qrow-c", `${list5}|${r.k}`);
    else h(b, "span", "zl-qrow-c is-none");
    sprite(b, "back", "zl-px zl-fig-go");
    b.addEventListener("click", (e) => {
      e.preventDefault();
      r.onTap();
    });
    if (r.chg) swipeChg(x, b);
  });
  alignChg(x, box);
};
var dragRow = (box, row2, grip, els, done) => {
  grip.addClass("zl-qrow-grip");
  let pressed = false;
  grip.addEventListener("touchstart", (e) => e.stopPropagation(), { passive: true });
  grip.addEventListener("touchmove", (e) => e.stopPropagation(), { passive: true });
  row2.addEventListener("click", (e) => {
    if (pressed) {
      e.preventDefault();
      e.stopImmediatePropagation();
      pressed = false;
    }
  }, true);
  grip.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    pressed = true;
    grip.setPointerCapture(e.pointerId);
    const from = els.indexOf(row2), y0 = e.clientY, ht = row2.offsetHeight || 1;
    let to = from;
    box.addClass("is-reorder");
    row2.addClass("is-dragging");
    const mv = (m) => {
      const dy = m.clientY - y0;
      row2.style.transform = `translateY(${dy}px)`;
      to = Math.max(0, Math.min(els.length - 1, from + Math.round(dy / ht)));
      els.forEach((r, j) => {
        if (j === from) return;
        const shift = from < to && j > from && j <= to ? -ht : from > to && j < from && j >= to ? ht : 0;
        r.style.transform = shift ? `translateY(${shift}px)` : "";
      });
    };
    const up = () => {
      grip.removeEventListener("pointermove", mv);
      grip.removeEventListener("pointerup", up);
      grip.removeEventListener("pointercancel", up);
      box.addClass("is-settling");
      els.forEach((r2) => {
        r2.style.transform = "";
        r2.removeClass("is-dragging");
      });
      box.removeClass("is-reorder");
      window.requestAnimationFrame(() => box.removeClass("is-settling"));
      window.setTimeout(() => {
        pressed = false;
      }, 400);
      if (to === from || !row2.isConnected) return;
      const [r] = els.splice(from, 1);
      els.splice(to, 0, r);
      const next = els[to + 1];
      if (next) next.before(r);
      else els[to - 1].after(r);
      done();
    };
    grip.addEventListener("pointermove", mv);
    grip.addEventListener("pointerup", up);
    grip.addEventListener("pointercancel", up);
  });
};
var WSORT_KEY = "ledgerline-watch-sort";
var WMKT_KEY = "ledgerline-watch-market";
var WSORT = null;
var WMKT = null;
var SHOWN_MKT = null;
var watchSort = (x) => {
  if (!WSORT) {
    const [k, d] = (x.ctx.app.loadLocalStorage(WSORT_KEY) ?? "").split(":");
    const by = k === "pct" ? "pct" : k === "name" || k === "az" ? "name" : "manual";
    WSORT = { by, desc: d ? d === "desc" : by === "pct" };
  }
  return WSORT;
};
var setWatchSort = (x, by) => {
  const cur = watchSort(x);
  WSORT = cur.by === by ? { by, desc: !cur.desc } : { by, desc: by === "pct" };
  x.ctx.app.saveLocalStorage(WSORT_KEY, `${WSORT.by}:${WSORT.desc ? "desc" : "asc"}`);
};
var watchMarkets = (x) => {
  const pr = x.ctx.plugin.prices, sort = watchSort(x), W = x.P.watch, dir = sort.desc ? -1 : 1;
  const pct2 = (tk) => todayOf(pr, tk)?.pct;
  const sorted = (l) => {
    if (sort.by === "manual") return sort.desc ? [...l].reverse() : l;
    if (sort.by === "name") return [...l].sort((a, b) => dir * a.localeCompare(b));
    const has = l.filter((tk) => pct2(tk) !== void 0), none = l.filter((tk) => pct2(tk) === void 0);
    return [...has.sort((a, b) => dir * (pct2(a) - pct2(b))), ...none];
  };
  const tw = W.filter((tk) => isTwSym(pr.symbol(tk)));
  return { tw: sorted(tw), us: sorted(W.filter((tk) => !tw.includes(tk))) };
};
var watchPage = (x) => {
  const { ctx, P } = x;
  const title = t("iWatch");
  const el = page(title);
  el.addClass("zl-c-list");
  const g = h(el, "div", "zl-c-group");
  if (!P.watch.length) figures(g, [{ k: t("iWatchNone").toUpperCase(), v: "-", dim: true }]);
  else {
    const m = watchMarkets(x);
    if (!WMKT) {
      const v = ctx.app.loadLocalStorage(WMKT_KEY);
      WMKT = v === "us" || v === "tw" ? v : m.tw.length || !m.us.length ? "tw" : "us";
    }
    const mkt = WMKT;
    const top = h(el, "div", "zl-c-group zl-c-top zl-wtop");
    el.insertBefore(top, g);
    const tabs = h(top, "div", "zl-fl-seg zl-wmkt");
    [["tw", t("iMktTw")], ["us", t("iMktUs")]].forEach(([k, label]) => {
      const b = h(tabs, "button", "zl-fl-segb" + (mkt === k ? " is-on" : ""), label.toUpperCase());
      b.addEventListener("click", (e) => {
        e.preventDefault();
        if (WMKT === k) return;
        WMKT = k;
        ctx.app.saveLocalStorage(WMKT_KEY, k);
        ctx.redraw();
      });
    });
    const sort = watchSort(x);
    const seg = h(top, "div", "zl-wsort");
    h(seg, "span", "zl-wsort-l", t("iSort").toUpperCase());
    [["manual", t("iSortManual")], ["pct", t("iSortPct")], ["name", t("iSortName")]].forEach(([k, label]) => {
      const on = sort.by === k, b = h(seg, "button", "zl-wsort-b" + (on ? " is-on" : ""), label.toUpperCase());
      if (on) sprite(b, sort.desc ? "down" : "up", "zl-px zl-wsort-dir");
      b.setAttribute("aria-label", on ? `${label}, ${sort.desc ? t("iSortDesc") : t("iSortAsc")}` : label);
      b.addEventListener("click", (e) => {
        e.preventDefault();
        setWatchSort(x, k);
        ctx.redraw();
      });
    });
    const l = mkt === "tw" ? m.tw : m.us;
    const swapped = SHOWN_MKT !== null && SHOWN_MKT !== mkt;
    SHOWN_MKT = mkt;
    if (!l.length) figures(g, [{ k: t("iWatchNone").toUpperCase(), v: "-", dim: true }]);
    else qrows(
      x,
      g,
      "watch",
      l.map((tk) => ({ icon: "eye", k: tk, s: ctx.plugin.search.nameOf(tk), chg: chgOf(x, tk), v: lastOf(x, tk), onTap: () => ctx.push(openKey(x, tk)) })),
      sort.by === "manual" && l.length > 1 ? (order) => {
        void x.moveWatch(sort.desc ? [...order].reverse() : order);
      } : void 0
    );
    if (swapped) g.querySelectorAll(".zl-in").forEach((r) => {
      r.removeClass("zl-in");
      r.addClass("zl-kept");
    });
  }
  return { title, el, actions: [findAct(x, el)], fab: { icon: "plus", text: t("iWatchAdd").toUpperCase(), label: t("iWatchAdd"), onTap: x.addWatch } };
};

// src/pages/invest.ts
var NEW = "__new__";
var xs;
var list3 = (v) => Array.isArray(v) ? v : v ? [v] : [];
var investPage = {
  id: "invest",
  label: "tabInvest",
  icon: "trending-up",
  render(ctx) {
    const { store, settings, prices } = ctx.plugin;
    const cur = settings.baseCurrency;
    const CFG = store.path(FILES.invest);
    const fm = store.fm(CFG);
    const fb = fm?.fx_fallback ?? {};
    const P = buildPortfolio(fm, (tk) => prices.price(tk), (c) => prices.fx(c, cur, fb), today());
    const curs = [...new Set(P.positions.map((p) => p.currency).filter((c) => c !== cur))];
    const held = [...P.positions.filter((p) => p.shares > 0).map((p) => prices.symbol(p.ticker)), ...P.watch.map((w) => prices.symbol(w))];
    prices.refresh([...held, ...curs.map((c) => prices.fxSymbol(c, cur))]);
    prices.track(held);
    const plan = store.fm(store.path(FILES.savings)) ?? {};
    const contributed = store.monthNotes().reduce((s2, m) => s2 + (Number(m.fm[PLAN_KEY] !== void 0 ? m.fm[PLAN_KEY] : plan[PLAN_KEY]) || 0), 0);
    const ACC = store.path(ACCOUNTS_FILE);
    const A = buildAccounts(store.fm(ACC));
    const cash = investCash(A.list, P.buckets.map((b) => b.key)) ?? contributed - P.bought;
    const links = new Map(tradeLinks(P, [...A.list.flatMap((a) => a.entries), ...A.unknown]).map((l) => [l.id, l]));
    const snap = (f) => JSON.parse(JSON.stringify(f));
    const book = async (fresh, ids) => {
      if (!store.file(ACC)) return;
      const Q = buildPortfolio(fresh, (tk) => prices.price(tk), (c) => prices.fx(c, cur, fb), today());
      let n = 0;
      await store.update(ACC, (a) => {
        const B = buildAccounts(a);
        const out2 = syncEntries(Q, B.list, [...B.list.flatMap((x2) => x2.entries), ...B.unknown], ids, today());
        n = out2.length;
        if (n) a.entries = [...list3(a.entries), ...out2];
      });
      if (n) new import_obsidian17.Notice(t("iBooked"));
    };
    const updateAsset = async (ticker, fn) => {
      let fresh = {};
      await store.update(CFG, (f) => {
        const a = list3(f.assets).find((x2) => tickerOf(x2) === ticker);
        if (a) fn(a);
        fresh = snap(f);
      });
      return fresh;
    };
    const recalc = (a) => {
      let held2 = 0, cost = 0;
      for (const tr of list3(a.transactions)) {
        const n = Number(tr.shares) || 0, pr = Number(tr.price) || 0;
        if (String(tr.type).toUpperCase() === "BUY") {
          held2 += n;
          cost += n * pr;
        } else if (held2 > 0) {
          const s2 = Math.min(n, held2);
          cost -= s2 * (cost / held2);
          held2 -= s2;
        }
      }
      a.shares = +held2.toFixed(6);
      a.avg_cost = held2 > 0 ? +(cost / held2).toFixed(4) : 0;
    };
    const trade = (preset, pre = {}) => {
      const tickers = P.positions.map((p) => p.ticker);
      const buckets = list3(fm?.allocation).map((b) => [String(b.key), String(b.label ?? b.key)]);
      const presetCur = preset && !P.positions.some((p) => p.ticker === preset) ? guessCur(prices.symbol(preset)) : null;
      const tkOf = (v) => preset ?? (v.asset === NEW ? (v.ticker ?? "").trim().toUpperCase() : v.asset ?? tickers[0] ?? "");
      const posOf = (v) => P.positions.find((p) => p.ticker === tkOf(v));
      const curOf = (v) => !preset && v.asset === NEW ? v.currency || cur : posOf(v)?.currency ?? presetCur ?? cur;
      const grossV = (v) => {
        const n = parseNum(v.shares), pr = parseNum(v.price);
        return n > 0 && pr >= 0 ? grossOf(toQ(n), toP2(pr), curOf(v)) : 0;
      };
      const major = (minor2, c) => String(minor2 / minorOf(c));
      const minor = (s2, c) => Math.round((parseNum(s2 ?? "") || 0) * minorOf(c));
      const live = (v) => {
        const q = prices.price(tkOf(v));
        return q && q > 0 ? Math.round(q * 100) / 100 : null;
      };
      const closed = (c) => (d) => !!(c === "TWD" ? prices.calendar?.cal.tw : prices.calendar?.cal.us)?.[d];
      const money = (v) => {
        const c = curOf(v), g = grossV(v), fee = minor(v.fee, c), tax = v.type === "SELL" ? minor(v.tax, c) : 0;
        return { c, g, n: v.type === "SELL" ? g - fee - tax : g + fee };
      };
      new FormSheet(ctx.app, {
        title: t("iTrade"),
        subtitle: preset,
        submitText: (v) => {
          const m = money(v);
          return `${t("save").toUpperCase()} ${(v.type === "SELL" ? t("iSell") : t("iBuy")).toUpperCase()}${m.g ? ` \xB7 ${numText(major(m.n, m.c), minorOf(m.c) > 1 ? 2 : 0)}` : ""}`;
        },
        total: (v) => {
          const m = money(v);
          if (!m.g) return null;
          const held2 = posOf(v)?.shares ?? 0;
          return { text: `${v.type === "SELL" ? t("iYouGet") : t("iYouPay")} ${numText(major(m.n, m.c), minorOf(m.c) > 1 ? 2 : 0)} ${m.c}${v.type === "SELL" ? ` \xB7 ${t("iHoldN", { n: qty(held2) })}` : ""}`, bad: v.type === "SELL" && parseNum(v.shares) > held2 + 1e-9 };
        },
        fields: [
          { key: "type", label: t("iType"), type: "select", value: pre.type ?? "BUY", options: [["BUY", t("iBuy")], ["SELL", t("iSell")]] },
          ...preset ? [] : [
            { key: "asset", label: t("iAsset"), type: "select", value: tickers[0] ?? NEW, options: [...tickers.map((x2) => [x2, x2]), [NEW, t("iNewAsset")]] },
            { key: "ticker", label: t("iTicker"), type: "text", required: true, showIf: (v) => v.asset === NEW },
            { key: "currency", label: t("iCurrency"), type: "select", value: cur, options: [[cur, cur], ...["USD", "TWD", "EUR", "JPY"].filter((c) => c !== cur).map((c) => [c, c])], showIf: (v) => v.asset === NEW },
            { key: "bucket", label: t("iBucket"), type: "select", value: buckets[0]?.[0] ?? "other", options: buckets.length ? buckets : [["other", "Other"]], showIf: (v) => v.asset === NEW }
          ],
          {
            key: "shares",
            label: t("iShares"),
            type: "number",
            required: true,
            dec: 4,
            step: (v) => curOf(v) === "TWD" && parseNum(v.shares) >= 1e3 ? 1e3 : 1,
            auto: (v) => {
              const last = posOf(v)?.trades.filter((x2) => x2.type === (v.type === "SELL" ? "SELL" : "BUY")).at(-1);
              return last ? String(last.shares) : "";
            }
          },
          {
            key: "price",
            label: t("iPrice"),
            type: "number",
            required: true,
            dec: 2,
            ...pre.price ? { value: pre.price } : {},
            step: (v) => tickOf(toP2(v.price), curOf(v), tkOf(v)) / 100,
            auto: (v) => {
              const q = live(v);
              return q === null ? "" : String(q);
            },
            tag: (v) => live(v) !== null && parseNum(v.price) === live(v) ? t("iLive") : ""
          },
          { key: "date", label: t("date"), type: "date", value: today(), required: true },
          {
            key: "fee",
            label: t("iFee"),
            type: "number",
            required: false,
            fold: true,
            dec: (v) => minorOf(curOf(v)) > 1 ? 2 : 0,
            step: (v) => minorOf(curOf(v)) > 1 ? 0.01 : 1,
            auto: (v) => {
              const c = curOf(v);
              return major(autoFee(grossV(v), c), c);
            },
            brief: (v) => curOf(v) === "TWD" ? "0.1425 %" : "",
            note: (v) => curOf(v) === "TWD" ? t("iFeeNote", { gross: num(grossV(v)) }) : t("iFeeNoteX")
          },
          {
            key: "tax",
            label: t("iTax"),
            type: "number",
            required: false,
            fold: true,
            showIf: (v) => v.type === "SELL",
            dec: (v) => minorOf(curOf(v)) > 1 ? 2 : 0,
            step: (v) => minorOf(curOf(v)) > 1 ? 0.01 : 1,
            auto: (v) => {
              const c = curOf(v);
              return major(autoTax(grossV(v), c, tkOf(v)), c);
            },
            brief: (v) => curOf(v) === "TWD" ? isTwEtf(tkOf(v)) ? "0.1 %" : "0.3 %" : "",
            note: (v) => curOf(v) === "TWD" ? t("iTaxNote", { pct: isTwEtf(tkOf(v)) ? "0.1 %" : "0.3 %", what: isTwEtf(tkOf(v)) ? "ETF" : t("iStock") }) : t("iFeeNoteX")
          },
          {
            key: "settled",
            label: t("iSettled"),
            type: "date",
            required: false,
            fold: true,
            auto: (v) => v.date ? addTradingDays(v.date, curOf(v) === "TWD" ? 2 : 1, closed(curOf(v))) : "",
            brief: (v) => curOf(v) === "TWD" ? "T+2" : "T+1",
            note: (v) => t("iSettleNote", { when: curOf(v) === "TWD" ? "2 trading days after the trade" : "the next trading day" })
          },
          {
            key: "fx",
            label: t("iFx", { cur }),
            type: "number",
            required: false,
            fold: true,
            dec: 4,
            step: 0.01,
            showIf: (v) => curOf(v) !== cur,
            auto: (v) => curOf(v) !== cur ? String(prices.fx(curOf(v), cur, fb)) : "",
            brief: () => t("iLive").toLowerCase()
          },
          { key: "why", label: t("iWhy"), type: "text", required: false }
        ],
        validate: (v) => {
          if (!preset && v.asset === NEW && tickers.includes(v.ticker.trim().toUpperCase())) return t("iExists");
          if (!(parseNum(v.shares) > 0) || !(parseNum(v.price) >= 0)) return t("invalidNumber");
          const held2 = P.positions.find((p) => p.ticker === (preset ?? v.asset))?.shares ?? 0;
          if (v.type === "SELL" && parseNum(v.shares) > held2 + 1e-9) return t("iTooMany", { n: qty(held2) });
          return null;
        },
        onSubmit: async (v) => {
          const tk = preset ?? (v.asset === NEW ? v.ticker.trim().toUpperCase() : v.asset);
          const tr = { type: v.type, shares: parseNum(v.shares), price: parseNum(v.price), date: v.date || today() };
          if (v.fx && parseNum(v.fx) > 0) tr.fx = parseNum(v.fx);
          if (parseNum(v.fee) > 0) tr.fee = parseNum(v.fee);
          if (v.type === "SELL" && parseNum(v.tax) > 0) tr.tax = parseNum(v.tax);
          if (v.settled) tr.settled = v.settled;
          let fresh = {}, id = "";
          await store.update(CFG, (f) => {
            const assets = list3(f.assets);
            let a = assets.find((x2) => tickerOf(x2) === tk);
            const nc = preset ? presetCur : v.currency;
            if (!a) {
              a = { name: tk, ticker: tk, category: v.bucket || "other", ...nc && nc !== "TWD" ? { currency: nc } : {}, shares: 0, avg_cost: 0, transactions: [] };
              assets.push(a);
            }
            const P2 = buildPortfolio({ assets: [a] }, () => null, () => 1);
            id = tr.id = newTradeId(tk, String(tr.date), P2.positions[0]?.trades.map((x2) => x2.id) ?? []);
            a.transactions = [...list3(a.transactions), tr];
            recalc(a);
            f.assets = assets;
            fresh = snap(f);
          });
          await book(fresh, [id]);
          const broke2 = newWarnings(checkRules(P, cap3, () => true), checkRules(buildPortfolio(fresh, (q) => prices.price(q), (c) => prices.fx(c, cur, fb), today()), cap3, () => true));
          if (broke2.length) new import_obsidian17.Notice(broke2.map(warnText).join("\n"), 8e3);
          if (v.why?.trim()) await think(tk, { date: tr.date, trade: id, why: v.why.trim() });
          new import_obsidian17.Notice(t("iSaved", { what: v.type === "SELL" ? t("iSell") : t("iBuy"), n: qty(parseNum(v.shares)), tk }));
        }
      }).open();
    };
    const editTrade = (p, tr) => new FormSheet(ctx.app, {
      title: `${tr.type === "SELL" ? t("iSell") : t("iBuy")} \xB7 ${p.ticker}`,
      subtitle: tr.date ? shortDate(tr.date) : void 0,
      submitText: t("save"),
      fields: [
        { key: "shares", label: t("iShares"), type: "number", value: tr.shares, required: true, dec: 4, step: (v) => p.currency === "TWD" && parseNum(v.shares) >= 1e3 ? 1e3 : 1 },
        { key: "price", label: t("iPrice"), type: "number", value: tr.price, required: true, dec: 2, step: (v) => tickOf(toP2(v.price), p.currency, p.ticker) / 100 },
        { key: "date", label: t("date"), type: "date", value: tr.date, required: true },
        { key: "fee", label: t("iFee"), type: "number", value: tr.fee ? tr.fee / minorOf(p.currency) : "", required: false, fold: true, dec: minorOf(p.currency) > 1 ? 2 : 0 },
        ...tr.type === "SELL" ? [{ key: "tax", label: t("iTax"), type: "number", value: tr.tax ? tr.tax / minorOf(p.currency) : "", required: false, fold: true, dec: minorOf(p.currency) > 1 ? 2 : 0 }] : [],
        { key: "settled", label: t("iSettled"), type: "date", value: tr.settled, required: false, fold: true },
        ...p.currency !== cur ? [{ key: "fx", label: t("iFx", { cur }), type: "number", value: tr.fx || "", required: false, fold: true, dec: 4, step: 0.01 }] : []
      ],
      onSubmit: async (v) => {
        const fresh = await updateAsset(p.ticker, (a) => {
          const x2 = list3(a.transactions)[tr.index];
          if (!x2) return;
          x2.id = tr.id;
          x2.shares = parseNum(v.shares);
          x2.price = parseNum(v.price);
          x2.date = v.date;
          if (v.fx !== void 0) {
            if (parseNum(v.fx) > 0) x2.fx = parseNum(v.fx);
            else delete x2.fx;
          }
          for (const k of ["fee", "tax"]) if (v[k] !== void 0) {
            if (parseNum(v[k]) > 0) x2[k] = parseNum(v[k]);
            else delete x2[k];
          }
          if (v.settled) x2.settled = v.settled;
          else delete x2.settled;
          recalc(a);
        });
        await book(fresh, [tr.id]);
        new import_obsidian17.Notice(t("iUpdated", { tk: p.ticker }));
      },
      danger: { text: t("iDeleteTrade"), onTap: async () => {
        if (!await confirmSheet(ctx.app, t("iDeleteTrade"), t("iDeleteTradeQ", { n: qty(tr.shares), tk: p.ticker, date: tr.date || "-" }), t("delete"))) return false;
        const fresh = await updateAsset(p.ticker, (a) => {
          const xs2 = list3(a.transactions);
          p.trades.forEach((q) => {
            if (xs2[q.index]) xs2[q.index].id = q.id;
          });
          if (xs2[tr.index]) {
            xs2.splice(tr.index, 1);
            a.transactions = xs2;
            recalc(a);
          }
        });
        await book(fresh, [tr.id]);
        return true;
      } }
    }).open();
    const cap3 = capOf(fm);
    const warns = checkRules(P, cap3, (tk) => readJournal(store.fm(journalPath(tk))).length > 0);
    const think = (tk, j) => store.update(journalPath(tk), (f) => {
      f.ticker = tk;
      f.journal = [...list3(f.journal), j];
    });
    const addThought = (tk) => new FormSheet(ctx.app, {
      title: t("iThought"),
      subtitle: tk,
      submitText: t("save"),
      fields: [{ key: "why", label: t("iWhyNote"), type: "text", required: true }, { key: "date", label: t("date"), type: "date", value: today(), required: true }],
      onSubmit: async (v) => {
        await think(tk, { date: v.date || today(), why: v.why.trim() });
      }
    }).open();
    const journal = (tk) => readJournal(store.fm(journalPath(tk)));
    const editPlan = (p) => new FormSheet(ctx.app, {
      title: t("iPlanT"),
      subtitle: p.ticker,
      submitText: t("save"),
      fields: [
        { key: "broker", label: t("iBroker"), type: "text", value: p.broker, required: false },
        { key: "amount", label: t("iDcaAmount", { cur }), type: "number", value: p.dca?.amount ?? "", required: false, step: 100 },
        {
          key: "day",
          label: t("iDcaDay"),
          type: "number",
          value: p.dca?.day ?? "",
          required: false,
          step: 1,
          tag: (v) => {
            const d = Math.round(parseNum(v.day));
            const n = d >= 1 && d <= 31 ? nextDca({ amount: 1, day: d }, today()) : null;
            return n ? shortDate(n).toUpperCase() : "";
          }
        }
      ],
      validate: (v) => v.day && !(parseNum(v.day) >= 1 && parseNum(v.day) <= 31) ? t("invalidNumber") : null,
      onSubmit: async (v) => {
        await updateAsset(p.ticker, (a) => {
          if (v.broker.trim()) a.broker = v.broker.trim();
          else delete a.broker;
          if (parseNum(v.amount) > 0) a.dca = { amount: Math.round(parseNum(v.amount)), day: Math.round(parseNum(v.day)) || 1 };
          else delete a.dca;
        });
        new import_obsidian17.Notice(t("iUpdated", { tk: p.ticker }));
      }
    }).open();
    const addWatch = () => new FormSheet(ctx.app, {
      title: t("iWatchAdd"),
      submitText: t("add"),
      fields: [{ key: "tk", label: t("iTicker"), type: "text", required: true }],
      validate: (v) => P.watch.includes(v.tk.trim().toUpperCase()) ? t("iExists") : null,
      onSubmit: async (v) => {
        await store.update(CFG, (f) => {
          f.watchlist = [...list3(f.watchlist), { ticker: v.tk.trim().toUpperCase() }];
        });
      }
    }).open();
    const dropWatch = async (tk) => {
      if (!await confirmSheet(ctx.app, t("iWatchRemove"), t("iWatchRemoveQ", { tk }), t("remove"))) return;
      await store.update(CFG, (f) => {
        f.watchlist = list3(f.watchlist).filter((w) => String(w.ticker ?? "").toUpperCase() !== tk);
      });
    };
    const search = (from) => {
      const src = ctx.plugin.search, held2 = () => xs.P.positions.filter((p) => p.shares > 0).map((p) => p.ticker);
      openSearch(from, src, {
        mine: (q) => {
          const s2 = q.toUpperCase(), hit2 = (tk) => tk.startsWith(s2) || src.nameOf(tk).toUpperCase().includes(s2);
          return [...held2().filter(hit2).map((tk) => ({ tk, name: src.nameOf(tk), ex: "", mine: "held" })), ...xs.P.watch.filter(hit2).map((tk) => ({ tk, name: src.nameOf(tk), ex: "", mine: "watch" }))];
        },
        pick: (tk) => xs.ctx.push(held2().includes(tk) ? { key: "asset:" + tk, title: tk } : { key: "chart:" + tk, title: tk }),
        texts: { placeholder: t("sPlaceholder"), cancel: t("sCancel"), recent: t("sRecent"), clear: t("sClear"), none: t("sNone"), held: t("sHeld"), watch: t("sWatch") }
      });
    };
    const moveWatch = async (order) => {
      const set = new Set(order), tkOf = (w) => String(w.ticker ?? "").toUpperCase();
      await store.update(CFG, (f) => {
        const ws = list3(f.watchlist), by = new Map(ws.map((w) => [tkOf(w), w]));
        let i = 0;
        f.watchlist = ws.map((w) => set.has(tkOf(w)) ? by.get(order[i++]) ?? w : w);
      });
    };
    const watchOn = async (tk) => {
      await store.update(CFG, (f) => {
        f.watchlist = [...list3(f.watchlist), { ticker: tk }];
      });
    };
    const x = { ctx, P, cur, cash, links, warns, cap: cap3, fx: (c) => prices.fx(c, cur, fb), trade, editThesis: (tk) => editThesis(x, tk), editTrade, editPlan, addThought, journal, addWatch, dropWatch, moveWatch, search, watchOn };
    xs = x;
    const pageFor = (key) => {
      if (key === "holdings") return holdingsPage(x);
      if (key === "watch") return watchPage(x);
      if (key.startsWith("chart:")) return tickerPage(x, key.slice(6));
      if (key === "rules") return rulesPage(x);
      if (key === "mix") return mixPage(x);
      if (key === "map") return mapPage(x);
      if (key.startsWith("revenue:")) return revenuePage(x, key.slice(8));
      if (key === "alerts") return alertsPage(x);
      if (key.startsWith("brokers:")) return brokersPage(ctx, key.slice(8), (tk) => trade(tk));
      if (key.startsWith("flows:")) return flowsPage(ctx, key.slice(6), flowCodes(ctx, flowTickers(P)), (tk) => trade(tk));
      if (key.startsWith("trades:")) {
        const p = P.positions.find((q) => q.ticker === key.slice(7));
        if (p) return tradesPage(x, p);
      }
      if (key.startsWith("journal:")) return journalPage(x, key.slice(8));
      if (key.startsWith("asset:")) {
        const p = P.positions.find((q) => q.ticker === key.slice(6));
        if (p) return assetPage(x, p);
      }
      return home(x);
    };
    const out = pageFor(ctx.frame.key);
    out.badge ?? (out.badge = liveBadge(x));
    return out;
  }
};

// src/pages/day.ts
var import_obsidian18 = require("obsidian");
var cap = (s2) => {
  const x = String(s2).replace(/_/g, " ");
  return x.charAt(0).toUpperCase() + x.slice(1);
};
var dayTitle = (date) => localDate(date).toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" });
var dayFrame = (date) => ({ key: "day:" + date, title: date === today() ? t("today") : dayTitle(date) });
var dayAmountPage = (ctx, key) => {
  window.setTimeout(() => ctx.pop(), 0);
  return { title: ctx.frame.title, el: page(key) };
};
var editDayAmount = (ctx, date, prop, isCustom) => {
  const { store, settings } = ctx.plugin;
  const name = cap(prop), cur = settings.baseCurrency, note = store.day(date);
  if (!note) return;
  const val = Number(note.fm[prop]) || 0;
  const write = (fn) => store.update(note.path, fn);
  openPad(ctx, {
    title: name,
    sub: date === today() ? t("today") : shortDate(date),
    current: val,
    cur,
    save: async (n) => {
      await write((f) => {
        f[prop] = n;
      });
      new import_obsidian18.Notice(t("savedX", { name, amount: num(n), cur }));
    },
    remove: isCustom && val ? { text: t("remove"), run: async () => {
      await write((f) => {
        delete f[prop];
      });
      new import_obsidian18.Notice(t("removedX", { name }));
    } } : void 0
  });
};
var OTHER = "\0other";
var expenseSheet = (ctx, date0 = today()) => {
  const { store, settings } = ctx.plugin;
  const cur = settings.baseCurrency;
  const [y, m] = date0.split("-").map(Number);
  const itemsOf = store.monthData(y, m - 1).daily.flatMap((b) => b.spending);
  const fmOf = (d) => store.day(d)?.fm ?? {};
  const when = (d) => d === today() ? t("today") : shortDate(d);
  const write = async (d, k, n) => {
    if (!store.day(d)) await store.createDay(d);
    const note = store.day(d);
    if (!note) return;
    await store.update(note.path, (f) => {
      f[k] = n;
    });
    new import_obsidian18.Notice(t("savedX", { name: cap(k), amount: num(n), cur }));
  };
  const pad2 = (d, k, close, host) => openPad(ctx, {
    title: cap(k),
    sub: when(d),
    current: Number(fmOf(d)[k]) || 0,
    cur,
    host,
    save: async (n) => {
      await write(d, k, n);
      close();
    }
  });
  new FormSheet(ctx.app, {
    title: t("cAddExpense"),
    fields: [
      { key: "date", label: t("date"), type: "date", value: date0, required: true },
      {
        key: "item",
        label: t("cItem"),
        type: "grid",
        cells: (v) => {
          const fm = fmOf(v.date || date0);
          const extra = Object.keys(fm).filter((k) => !IGNORE.includes(k) && typeof fm[k] === "number" && !itemsOf.includes(k) && Number(fm[k]) !== 0);
          return [...itemsOf, ...extra].map((k) => {
            const o = Number(fm[k]) || 0;
            return { value: k, k: cap(k).toUpperCase(), v: num(o), dim: !o };
          }).concat([{ value: OTHER, k: t("cOther").toUpperCase(), v: "+", dim: true }]);
        },
        tap: (k, v, sh) => {
          const d = v.date || date0;
          if (k !== OTHER) {
            pad2(d, k, sh.close, sh.host);
            return;
          }
          openText(sh.host, { title: t("addOneTime"), sub: when(d), value: "", placeholder: t("whatHint"), save: (name) => {
            const key = itemKey(name);
            if (!slug(name) || !key) {
              new import_obsidian18.Notice(t("needName"));
              return;
            }
            pad2(d, key, sh.close, sh.host);
          } });
        },
        hold: (k, v) => {
          if (k === OTHER) return null;
          const d = v.date || date0;
          return { value: Number(fmOf(d)[k]) || 0, step: notchFor(cur), label: cap(k), fmt: num, done: (n) => {
            void write(d, k, n);
          } };
        }
      }
    ],
    onSubmit: async () => false
  }).open();
};
var dayPage = (ctx, date, notePath) => {
  const { store, settings } = ctx.plugin;
  const cur = settings.baseCurrency;
  const title = dayTitle(date);
  const el = page(dayFrame(date).title);
  const shift = (n) => {
    const d = localDate(date);
    d.setDate(d.getDate() + n);
    return ymd(d);
  };
  const pick = () => new FormSheet(ctx.app, {
    title: t("chooseDay"),
    submitText: t("go"),
    fields: [{ key: "d", label: t("date"), type: "date", value: date }],
    onSubmit: async (v) => {
      if (v.d) ctx.replace(dayFrame(v.d));
    }
  }).open();
  el.addClass("zl-has-bar");
  monthBar(el, shortDate(shift(-1)), title, shortDate(shift(1)), (s2) => s2 ? ctx.replace(dayFrame(shift(s2))) : pick());
  const own = notePath ? store.fm(notePath) : null;
  const note = own && notePath ? { name: date, path: notePath, fm: own } : store.day(date);
  if (!note) {
    empty(el, { icon: "calendar-plus", title: t("noDay"), text: t("noDaySub"), button: t("startDay"), onTap: () => {
      void store.createDay(date).then(() => new import_obsidian18.Notice(t("dayStarted", { date: title })), (e) => new import_obsidian18.Notice(String(e instanceof Error ? e.message : e)));
    } });
    return { title: dayFrame(date).title, el };
  }
  const [y, m] = date.split("-").map(Number);
  const { daily, M } = store.monthData(y, m - 1);
  const fm = note.fm;
  const defined = new Set(daily.flatMap((b) => b.spending));
  const custom = Object.keys(fm).filter((k) => !IGNORE.includes(k) && typeof fm[k] === "number" && !defined.has(k) && Number(fm[k]) !== 0);
  const total = [...defined, ...custom].reduce((s2, k) => s2 + (Number(fm[k]) || 0), 0);
  el.addClass("zl-c-stack");
  const top0 = h(el, "div", "zl-c-group");
  const big = h(top0, "div", "zl-c-big" + (total > 0 ? "" : " is-dim"), num(total));
  big.setAttribute("aria-label", t("spentOnDay"));
  const tq = M.budget.reduce((s2, x) => s2 + x.quota, 0), ts = M.budget.reduce((s2, x) => s2 + x.spent, 0);
  const now = /* @__PURE__ */ new Date(), isToday = date === today();
  const dim = new Date(y, m, 0).getDate(), daysLeft = dim - now.getDate() + 1;
  const leftToday = Math.round(Math.max(0, tq - ts + total) / Math.max(1, daysLeft) - total);
  bigLabel(top0, `${t("spentOnDay")} \xB7 ${cur}`, isToday ? `${t("cLeftToday")} ${num(leftToday)}` : void 0);
  const write = (fn) => store.update(note.path, fn);
  const edit = (prop, isCustom) => editDayAmount(ctx, date, prop, isCustom);
  const step = notchFor(cur);
  const drag = (prop) => () => ({
    value: Number(fm[prop]) || 0,
    step,
    label: cap(prop),
    fmt: num,
    live: (n) => {
      const d = n - (Number(fm[prop]) || 0);
      big.textContent = num(total + d);
      big.toggleClass("is-dim", total + d <= 0);
    },
    done: (n) => {
      void write((f) => {
        f[prop] = n;
      }).then(() => new import_obsidian18.Notice(t("savedX", { name: cap(prop), amount: num(n), cur })));
    }
  });
  daily.forEach((bg, i) => {
    const left = M.budget[i];
    const g = h(el, "div", "zl-c-group");
    const head = sec(g, (bg.name || t("groupN", { n: i + 1 })).toUpperCase());
    if (left) {
      const r = h(head, "span", "zl-sec-go" + (left.remain < 0 ? " is-hot" : ""), `${num(left.remain)} ${t("cLeft").toUpperCase()}`);
      r.setAttribute("aria-label", t("leftMonthN", { left: num(left.remain) }));
    }
    if (!bg.spending.length) {
      h(g, "div", "zl-gf", t("noItems"));
      return;
    }
    tileGrid(g, bg.spending.map((p) => {
      const v = Number(fm[p]) || 0;
      return { k: cap(p).toUpperCase(), v: num(v), dim: !v, onTap: () => edit(p, false), scrub: drag(p) };
    }));
  });
  if (custom.length) {
    const g = h(el, "div", "zl-c-group");
    sec(g, t("oneTime").toUpperCase());
    tileGrid(g, custom.map((p) => ({ k: cap(p).toUpperCase(), v: num(fm[p]), hot: true, onTap: () => edit(p, true), scrub: drag(p) })));
  }
  if (daily.length || custom.length) h(el, "div", "zl-c-note zl-scrub-hint", t("cScrubHint"));
  if (!daily.length && !custom.length) empty(el, { icon: "list", title: t("noItems"), button: t("dailyItems"), onTap: () => ctx.push({ key: "items", title: t("dailyItems") }) });
  const add = () => expenseSheet(ctx, date);
  return {
    title: dayFrame(date).title,
    el,
    actions: [{ icon: "list", label: t("dailyItems"), onTap: () => ctx.push({ key: "items", title: t("dailyItems") }) }],
    fab: { icon: "plus", text: t("cAddExpense").toUpperCase(), label: t("cAddExpense"), onTap: add }
  };
};
var rawGroups = (ctx) => {
  const b = ctx.plugin.store.fm(ctx.plugin.store.path(FILES.daily))?.budget;
  return (Array.isArray(b) ? b : []).map((g) => ({ ...g, spending: (Array.isArray(g.spending) ? g.spending : g.spending ? [g.spending] : []).map(String) }));
};
var items = (g) => g.spending;
var saveGroups = (ctx, fn) => ctx.plugin.store.update(ctx.plugin.store.path(FILES.daily), (f) => {
  const gs = rawGroups(ctx);
  fn(gs);
  f.budget = gs;
});
var pctTotal = (gs, skip = -1) => gs.reduce((s2, g, i) => s2 + (i === skip ? 0 : Number(g.quota) || 0), 0);
var itemKey = (s2) => s2.trim().toLowerCase().replace(/\s+/g, "_");
var groupSheet = (ctx, gs, i) => {
  const g = gs[i];
  new FormSheet(ctx.app, {
    title: g ? g.name || t("groupN", { n: i + 1 }) : t("newGroup"),
    subtitle: t("groupSub"),
    submitText: g ? t("save") : t("add"),
    fields: [
      { key: "name", label: t("name"), type: "text", value: g?.name ?? "", required: true },
      { key: "pct", label: t("share"), type: "number", suffix: "%", value: g ? Number(g.quota) || 0 : "", required: false }
    ],
    validate: (v) => {
      const p = v.pct === "" ? 0 : parseNum(v.pct);
      if (!v.name.trim()) return t("needName");
      if (isNaN(p) || p < 0) return t("invalidNumber");
      return pctTotal(gs, i) + p > 100 ? t("over100", { n: pctTotal(gs, i) + p }) : null;
    },
    onSubmit: async (v) => {
      const quota = v.pct === "" ? 0 : parseNum(v.pct), name = v.name.trim();
      await saveGroups(ctx, (all) => {
        if (all[i]) Object.assign(all[i], { name, quota });
        else all.push({ name, quota, daily: true, spending: [] });
      });
      new import_obsidian18.Notice(t("itemsSaved"));
    }
  }).open();
};
var itemsPage = (ctx) => {
  const gs = rawGroups(ctx);
  const el = page(t("dailyItems"));
  const total = pctTotal(gs);
  if (!gs.length) empty(el, { icon: "list", title: t("noGroups") });
  else {
    const g = group2(el, void 0, t("pctTotal", { n: total }) + (total > 100 ? " \xB7 " + t("over100", { n: total }) : ""));
    gs.forEach((x, i) => row(g, {
      icon: "circle",
      tint: colorFor(i),
      title: x.name || t("groupN", { n: i + 1 }),
      sub: items(x).map(cap).join(", ") || t("noItems"),
      value: `${Number(x.quota) || 0}%`,
      chevron: true,
      onTap: () => ctx.push({ key: "items:" + i, title: x.name || t("groupN", { n: i + 1 }) })
    }));
  }
  return { title: t("dailyItems"), el, fab: { icon: "plus", text: t("newGroup").toUpperCase(), label: t("newGroup"), onTap: () => groupSheet(ctx, gs, gs.length) } };
};
var itemGroupPage = (ctx, i) => {
  const gs = rawGroups(ctx);
  const g = gs[i];
  if (!g) return itemsPage(ctx);
  const name = g.name || t("groupN", { n: i + 1 });
  const el = page(name);
  const head = group2(el);
  row(head, { icon: "pencil", tint: C.accent, title: t("nameAndShare"), sub: t("shareHint"), value: `${Number(g.quota) || 0}%`, chevron: true, onTap: () => groupSheet(ctx, gs, i) });
  const list5 = group2(el, t("items"), t("itemsHint"));
  for (const it of items(g)) row(list5, { icon: "circle-small,dot", tint: colorFor(i), title: cap(it), onTap: async () => {
    if (!await confirmSheet(ctx.app, t("removeItem", { name: cap(it) }), t("removeItemSub"), t("remove"))) return;
    await saveGroups(ctx, (all) => {
      all[i].spending = items(all[i]).filter((x) => x !== it);
    });
    new import_obsidian18.Notice(t("removedX", { name: cap(it) }));
  } });
  row(list5, { icon: "plus", tint: C.accent, title: t("addItem"), titleColor: C.accent, onTap: () => new FormSheet(ctx.app, {
    title: t("addItem"),
    subtitle: name,
    submitText: t("add"),
    fields: [{ key: "name", label: t("name"), type: "text", required: true }],
    validate: (v) => {
      const k = itemKey(v.name);
      return !k ? t("needName") : gs.some((x) => items(x).includes(k)) ? t("itemExists", { name: cap(k) }) : null;
    },
    onSubmit: async (v) => {
      const k = itemKey(v.name);
      await saveGroups(ctx, (all) => {
        all[i].spending = [...items(all[i]), k];
      });
      new import_obsidian18.Notice(t("itemsSaved"));
    }
  }).open() });
  row(group2(el), { icon: "trash-2", tint: C.neg, title: t("deleteGroup"), titleColor: C.neg, onTap: async () => {
    if (!await confirmSheet(ctx.app, t("deleteGroup"), t("deleteGroupSub", { name }), t("delete"))) return;
    await saveGroups(ctx, (all) => {
      all.splice(i, 1);
    });
    new import_obsidian18.Notice(t("removedX", { name }));
    ctx.pop();
  } });
  return { title: name, el };
};

// src/settings.ts
var import_obsidian19 = require("obsidian");
var TAB_ORDER = ["debt", "invest", "log", "ledger", "goals"];
var PAGE_MOVES = ["slide", "push", "wipe", "fade", "cascade"];
var DEFAULTS = {
  dataFolder: "Config",
  logFolder: "Log",
  baseCurrency: "USD",
  taiwan: false,
  openOnStartup: true,
  fullScreen: true,
  tabs: { debt: true, invest: true, log: true, ledger: true, goals: true },
  debugLog: false,
  debugPath: ".ledgerline/debug.log",
  bigNumber: "dots",
  pageMove: "slide",
  calm: false,
  tabOrder: [...TAB_ORDER],
  theme: "auto",
  skin: true,
  redUp: true,
  usNy: false
};
var tabOrderOf = (o) => {
  const seen2 = (Array.isArray(o) ? o : []).filter((x) => TAB_ORDER.includes(x));
  return [.../* @__PURE__ */ new Set([...seen2, ...TAB_ORDER])];
};
var applyTheme = (app, mode) => {
  const v = mode === "dark" ? "obsidian" : mode === "light" ? "moonstone" : "system";
  const a = app;
  if (a.vault.getConfig?.("theme") !== v) a.changeTheme?.(v);
};
var LedgerSettingTab = class extends import_obsidian19.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl: c } = this;
    const s2 = this.plugin.settings;
    const save = () => this.plugin.saveSettings();
    c.empty();
    new import_obsidian19.Setting(c).setName(t("sDataFolder")).setDesc(t("sDataFolderDesc")).addText((x) => x.setValue(s2.dataFolder).onChange(async (v) => {
      s2.dataFolder = v.trim() || DEFAULTS.dataFolder;
      await save();
    }));
    new import_obsidian19.Setting(c).setName(t("sLogFolder")).setDesc(t("sLogFolderDesc")).addText((x) => x.setValue(s2.logFolder).onChange(async (v) => {
      s2.logFolder = v.trim() || DEFAULTS.logFolder;
      await save();
    }));
    new import_obsidian19.Setting(c).setName(t("sCurrency")).setDesc(t("sCurrencyDesc")).addText((x) => x.setValue(s2.baseCurrency).onChange(async (v) => {
      s2.baseCurrency = v.trim().toUpperCase() || DEFAULTS.baseCurrency;
      await save();
    }));
    new import_obsidian19.Setting(c).setName(t("sTaiwan")).setDesc(t("sTaiwanDesc")).addToggle((x) => x.setValue(s2.taiwan).onChange(async (v) => {
      s2.taiwan = v;
      await save();
    }));
    new import_obsidian19.Setting(c).setName(t("sFugle")).setDesc(t("sFugleDesc")).addText((x) => {
      x.inputEl.type = "password";
      x.setValue(this.plugin.fugleKey()).onChange(async (v) => {
        this.plugin.setFugleKey(v);
        await save();
      });
    });
    new import_obsidian19.Setting(c).setName(t("sStartup")).setDesc(t("sStartupDesc")).addToggle((x) => x.setValue(s2.openOnStartup).onChange(async (v) => {
      s2.openOnStartup = v;
      await save();
    }));
    new import_obsidian19.Setting(c).setName(t("sFullScreen")).setDesc(t("sFullScreenDesc")).addToggle((x) => x.setValue(s2.fullScreen).onChange(async (v) => {
      s2.fullScreen = v;
      await save();
    }));
    new import_obsidian19.Setting(c).setName(t("sLook")).setHeading();
    new import_obsidian19.Setting(c).setName(t("sBigNumber")).setDesc(t("sBigNumberDesc")).addDropdown((x) => x.addOption("dots", t("sDots")).addOption("flap", t("sFlap")).setValue(s2.bigNumber).onChange(async (v) => {
      s2.bigNumber = v === "flap" ? "flap" : "dots";
      await save();
    }));
    new import_obsidian19.Setting(c).setName(t("sMove")).setDesc(t("sMoveDesc")).addDropdown((x) => {
      const names2 = { slide: "sMoveSlide", push: "sMovePush", wipe: "sMoveWipe", fade: "sMoveFade", cascade: "sMoveCascade" };
      PAGE_MOVES.forEach((k) => x.addOption(k, t(names2[k])));
      x.setValue(s2.pageMove).onChange(async (v) => {
        s2.pageMove = PAGE_MOVES.includes(v) ? v : "slide";
        await save();
      });
    });
    new import_obsidian19.Setting(c).setName(t("sCalm")).setDesc(t("sCalmDesc")).addToggle((x) => x.setValue(s2.calm).onChange(async (v) => {
      s2.calm = v;
      await save();
    }));
    new import_obsidian19.Setting(c).setName(t("sTheme")).setDesc(t("sThemeDesc")).addDropdown((x) => x.addOption("auto", t("sThemeAuto")).addOption("light", t("sThemeLight")).addOption("dark", t("sThemeDark")).setValue(s2.theme).onChange(async (v) => {
      s2.theme = v === "light" || v === "dark" ? v : "auto";
      applyTheme(this.app, s2.theme);
      await save();
    }));
    new import_obsidian19.Setting(c).setName(t("sRedUp")).setDesc(t("sRedUpDesc")).addToggle((x) => x.setValue(s2.redUp).onChange(async (v) => {
      s2.redUp = v;
      await save();
    }));
    new import_obsidian19.Setting(c).setName(t("sUsNy")).setDesc(t("sUsNyDesc")).addToggle((x) => x.setValue(s2.usNy).onChange(async (v) => {
      s2.usNy = v;
      await save();
    }));
    new import_obsidian19.Setting(c).setName(t("sSkin")).setDesc(t("sSkinDesc")).addToggle((x) => x.setValue(s2.skin).onChange(async (v) => {
      s2.skin = v;
      document.body.toggleClass("zl-skin", v);
      await save();
    }));
    new import_obsidian19.Setting(c).setName(t("sModules")).setDesc(t("sModulesDesc")).setHeading();
    const names = { debt: "tabDebt", invest: "tabInvest", log: "tabLog", ledger: "tabLedger", goals: "tabGoals" };
    const order = tabOrderOf(s2.tabOrder);
    const rows = [];
    order.forEach((id) => {
      const set = new import_obsidian19.Setting(c).setName(t(names[id])).addToggle((x) => x.setValue(s2.tabs[id]).onChange(async (v) => {
        s2.tabs[id] = v;
        await save();
      }));
      set.settingEl.addClass("zl-set-drag");
      const grip = set.settingEl.createDiv({ cls: "zl-set-grip", attr: { "aria-label": t("sDrag") } });
      (0, import_obsidian19.setIcon)(grip, "grip-vertical");
      set.settingEl.prepend(grip);
      rows.push(set.settingEl);
      grip.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        grip.setPointerCapture(e.pointerId);
        const el = set.settingEl, from = rows.indexOf(el), y0 = e.clientY, ht = el.offsetHeight || 1;
        let to = from;
        el.addClass("is-dragging");
        const move = (m) => {
          const dy = m.clientY - y0;
          el.style.transform = `translateY(${dy}px)`;
          to = Math.max(0, Math.min(rows.length - 1, from + Math.round(dy / ht)));
          rows.forEach((r, j) => {
            if (j === from) return;
            const shift = from < to && j > from && j <= to ? -ht : from > to && j < from && j >= to ? ht : 0;
            r.style.transform = shift ? `translateY(${shift}px)` : "";
          });
        };
        const up = async () => {
          grip.removeEventListener("pointermove", move);
          grip.removeEventListener("pointerup", onUp);
          grip.removeEventListener("pointercancel", onUp);
          rows.forEach((r2) => {
            r2.addClass("is-settling");
            r2.style.transform = "";
            r2.removeClass("is-dragging");
          });
          window.requestAnimationFrame(() => rows.forEach((r2) => r2.removeClass("is-settling")));
          if (to === from) return;
          const [r] = rows.splice(from, 1);
          rows.splice(to, 0, r);
          const [o] = order.splice(from, 1);
          order.splice(to, 0, o);
          const next = rows[to + 1];
          if (next) next.before(r);
          else rows[to - 1].after(r);
          s2.tabOrder = [...order];
          await save();
        };
        const onUp = () => {
          void up();
        };
        grip.addEventListener("pointermove", move);
        grip.addEventListener("pointerup", onUp);
        grip.addEventListener("pointercancel", onUp);
      });
    });
    const hap = new import_obsidian19.Setting(c).setName("Test haptic").setDesc("Tap: the phone should tick once.");
    hap.addButton((b) => b.setButtonText("Tick").onClick(() => {
      const how = tick();
      hap.setDesc({ capacitor: "Used: Obsidian's haptics.", vibrate: "Used: web vibration.", switch: "Used: the iOS 18 switch tick. Felt nothing? Then Obsidian has no haptics here.", "": "No haptics found on this device." }[how] ?? how);
    }));
    new import_obsidian19.Setting(c).setName(t("sDebug")).setDesc(t("sDebugDesc")).setHeading().addToggle((x) => x.setValue(s2.debugLog).onChange(async (v) => {
      s2.debugLog = v;
      await save();
    }));
    new import_obsidian19.Setting(c).setName(t("sDebugPath")).addText((x) => x.setValue(s2.debugPath).onChange(async (v) => {
      s2.debugPath = v.trim() || DEFAULTS.debugPath;
      await save();
    }));
  }
};

// src/router.ts
var KEY3 = "ledgerline-nav";
var STACK_TTL = 30 * 60 * 1e3;
var Router = class {
  constructor(app, enabled) {
    this.app = app;
    this.enabled = enabled;
    this.tab = "log";
    this.stacks = {};
    try {
      const s2 = this.app.loadLocalStorage(KEY3);
      if (s2 && TAB_ORDER.includes(s2.tab)) {
        this.tab = s2.tab;
        if (Date.now() - s2.t < STACK_TTL) this.stacks = s2.stacks || {};
      }
    } catch {
    }
    this.fix();
  }
  // the open tab must be an enabled one
  fix() {
    const on = this.enabled();
    if (!on.includes(this.tab)) this.tab = on.includes("log") ? "log" : on[0] ?? "log";
  }
  stack(tab = this.tab) {
    var _a;
    return (_a = this.stacks)[tab] ?? (_a[tab] = []);
  }
  top(tab = this.tab) {
    const s2 = this.stack(tab);
    return s2[s2.length - 1] ?? { key: "root", title: "" };
  }
  depth(tab = this.tab) {
    return this.stack(tab).length;
  }
  setTab(tab) {
    this.tab = tab;
    this.save();
  }
  push(f) {
    if (this.top().key === f.key) return false;
    this.stack().push(f);
    this.save();
    return true;
  }
  // swap the page on top (e.g. the previous / next day) without going back first
  replace(f) {
    if (!this.depth()) return this.push(f);
    this.stack()[this.depth() - 1] = f;
    this.save();
    return true;
  }
  pop() {
    if (!this.depth()) return false;
    this.stack().pop();
    this.save();
    return true;
  }
  popToRoot() {
    if (!this.depth()) return false;
    this.stacks[this.tab] = [];
    this.save();
    return true;
  }
  save() {
    try {
      this.app.saveLocalStorage(KEY3, { tab: this.tab, stacks: this.stacks, t: Date.now() });
    } catch {
    }
  }
};

// src/view.ts
var import_obsidian25 = require("obsidian");

// src/pages/debt.ts
var import_obsidian21 = require("obsidian");

// src/calc/debt.ts
var DEFAULT_RATE = 775e-5;
var computeDebt = (fm, planAmount, months, now) => {
  const f = fm ?? {};
  const principal = Number(f.initial_principal) || 0;
  const rate = f.interest_rate === void 0 || f.interest_rate === null || f.interest_rate === "" ? DEFAULT_RATE : Number(f.interest_rate) || 0;
  const start = dateStr(f.start_date, "");
  const raw = Array.isArray(f.payments) ? f.payments : f.payments ? [f.payments] : [];
  const payments = raw.map((p, index) => {
    const o = p ?? {};
    return { date: dateStr(o.date, ""), amount: Number(o.amount) || 0, note: String(o.note ?? ""), index };
  });
  const paid = payments.reduce((s2, p) => s2 + p.amount, 0);
  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daysUntilStart = start ? Math.ceil((localDate(start).getTime() - day.getTime()) / 864e5) : 0;
  const grace = daysUntilStart > 0;
  let toInvestment = 0, loanPrep = 0;
  if (grace) for (const m of months) {
    const keep2 = m.legacy ? Math.floor(m.amount / 2) : m.amount;
    loanPrep += keep2;
    toInvestment += m.amount - keep2;
  }
  return {
    exists: !!fm,
    principal,
    rate,
    start,
    monthlyMin: Number(f.monthly_min_payment) || 0,
    payments,
    paid,
    balance: Math.max(0, principal - paid),
    progress: principal > 0 ? paid / principal * 100 : 0,
    daysUntilStart,
    grace,
    planAmount,
    repayment: Number(f.repayment) || planAmount,
    toInvestment,
    loanPrep
  };
};
var projectDebt = (d, pay, now) => {
  const from = d.start && d.grace ? /* @__PURE__ */ new Date(d.start + "T00:00:00") : new Date(now.getFullYear(), now.getMonth(), 1);
  let bal = d.balance, y = from.getFullYear(), m = from.getMonth();
  const years = [bal];
  const r = d.rate / 12;
  if (pay <= bal * r || bal <= 0) return { years: bal > 0 ? [bal] : [0], firstYear: y, payoff: bal > 0 ? "" : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}` };
  for (let i = 0; i < 480 && bal > 0; i++) {
    bal = Math.max(0, bal * (1 + r) - pay);
    if (bal <= 0) return { years: [...years, 0], firstYear: from.getFullYear(), payoff: `${y}-${String(m + 1).padStart(2, "0")}` };
    if (m === 11) years.push(bal);
    m++;
    if (m === 12) {
      m = 0;
      y++;
    }
  }
  return { years, firstYear: from.getFullYear(), payoff: "" };
};

// src/pages/shared.ts
var import_obsidian20 = require("obsidian");
var editAllocation = (ctx, key, what) => {
  const { store, settings } = ctx.plugin;
  const cur = settings.baseCurrency;
  const info = store.allocation(key);
  const month = monthLong(/* @__PURE__ */ new Date());
  new FormSheet(ctx.app, {
    title: what,
    subtitle: t("fromSavingsPlan"),
    submitText: t("save"),
    fields: [{ key: "v", label: t("amount"), type: "number", value: info.amount, suffix: cur }],
    validate: (v) => parseNum(v.v) === info.amount ? t("sameValue") : null,
    onSubmit: async (v) => {
      const next = parseNum(v.v);
      const choices = [];
      if (info.hasNote) choices.push({ value: "once", label: t("onlyMonth", { month }), hint: t("onlyMonthHint", { amount: num(info.def), cur }) });
      choices.push({ value: "onward", label: t("fromMonth", { month }), hint: t("fromMonthHint") });
      new ChoiceSheet(ctx.app, `${num(info.amount)} \u2192 ${num(next)} ${cur}`, choices, async (mode) => {
        const frozen = await store.setAllocation(key, next, mode);
        new import_obsidian20.Notice(mode === "once" ? t("allocOnce", { what, amount: num(next), cur, month }) : t("allocOnward", { what, amount: num(next), cur, month }) + (frozen ? t("allocFrozen", { n: frozen }) : ""));
      }).open();
    }
  }).open();
};

// src/calc/goals.ts
var list4 = (v) => (Array.isArray(v) ? v : v ? [v] : []).filter((x) => x && typeof x === "object");
var buildGoals = (fm, savedOf) => {
  const funds = list4(fm?.funds).map((f) => ({ key: String(f.key ?? ""), label: String(f.label ?? f.key ?? ""), emoji: String(f.emoji ?? ""), goals: [], saved: 0, target: 0, surplus: 0 }));
  const goals = list4(fm?.goals).map((g) => {
    const expenses = list4(g.expenses).map((e, index) => ({ item: String(e.item ?? ""), amount: Number(e.amount) || 0, date: dateStr(e.date, ""), index }));
    return { name: String(g.name ?? ""), fundKey: String(g.fund ?? ""), emoji: String(g.emoji ?? ""), amount: Number(g.goal) || 0, target: dateStr(g.target_date, ""), expenses, alloc: 0, spent: expenses.reduce((s2, e) => s2 + e.amount, 0), cash: 0, pct: 0 };
  }).sort((a, b) => (a.target || "9999").localeCompare(b.target || "9999"));
  for (const g of goals) (funds.find((f) => f.key === g.fundKey) ?? funds[0])?.goals.push(g);
  for (const f of funds) {
    f.saved = Number(savedOf(f.key)) || 0;
    let pool = f.saved;
    for (const g of f.goals) {
      const amount = g.amount || 1;
      g.alloc = Math.min(pool, amount);
      pool -= g.alloc;
      g.pct = g.alloc / amount * 100;
    }
    f.surplus = pool;
    f.target = f.goals.reduce((s2, g) => s2 + g.amount, 0);
  }
  for (const g of goals) g.cash = g.alloc - g.spent;
  return {
    funds,
    goals,
    totalSaved: funds.reduce((s2, f) => s2 + f.saved, 0),
    spent: goals.reduce((s2, g) => s2 + g.spent, 0),
    remaining: funds.reduce((s2, f) => s2 + Math.max(0, f.target - f.saved), 0)
  };
};
var findExpense = (arr5, x) => {
  const a = Array.isArray(arr5) ? arr5 : [];
  const same = (e) => !!e && String(e.item ?? "") === x.item && Number(e.amount) === x.amount && dateStr(e.date, "") === x.date;
  return same(a[x.index]) ? x.index : a.findIndex((e) => same(e));
};
var mIdx = (d) => Number(d.slice(0, 4)) * 12 + Number(d.slice(5, 7)) - 1;
var monthsTo = (from, to) => Math.max(0, mIdx(to) - mIdx(from));
var trackFund = (f, monthly, today3) => {
  const out = /* @__PURE__ */ new Map();
  let need = 0;
  for (const g of f.goals) {
    need += g.amount;
    if (!g.target) continue;
    const months = monthsTo(today3, g.target);
    const short2 = Math.max(0, need - (f.saved + monthly * months));
    const gap = Math.max(0, need - f.saved);
    out.set(g, { short: short2, months, perMonth: !gap ? 0 : months ? Math.ceil(gap / months) : gap });
  }
  return out;
};
var doneBy = (f, monthly, today3) => {
  const gap = f.target - f.saved;
  if (!f.goals.length) return "";
  const n = gap <= 0 ? 0 : monthly > 0 ? Math.ceil(gap / monthly) : -1;
  if (n < 0) return "";
  const i = mIdx(today3) + n;
  return `${Math.floor(i / 12)}-${String(i % 12 + 1).padStart(2, "0")}`;
};

// src/calc/ledger.ts
var ACTIONS = ["paid_for", "paid_by", "paid_to_me", "paid_to_them"];
var buildLedger = (list5) => {
  const raw = Array.isArray(list5) ? list5 : [];
  const people = /* @__PURE__ */ new Map();
  raw.forEach((x, index) => {
    const r = x ?? {};
    if (!r.friend) return;
    const rec = { friend: String(r.friend), action: String(r.action ?? ""), amount: Number(r.amount) || 0, date: dateStr(r.date, ""), note: String(r.note ?? ""), index };
    if (!people.has(rec.friend)) people.set(rec.friend, []);
    people.get(rec.friend).push(rec);
  });
  const friends = [];
  let oweMe = 0, oweThem = 0;
  for (const [name, recs0] of people) {
    const recs = recs0.slice().sort((a, b) => a.date.localeCompare(b.date));
    const queue = [];
    const consume = (t2, amt) => {
      let rem = amt;
      while (rem > 0 && queue.length && queue[0].t === t2) {
        if (queue[0].a <= rem) {
          rem -= queue[0].a;
          queue.shift();
        } else {
          queue[0].a -= rem;
          rem = 0;
        }
      }
    };
    let me = 0, them = 0;
    for (const r of recs) {
      if (r.action === "paid_for") {
        me += r.amount;
        queue.push({ d: r.date, a: r.amount, t: "me" });
      } else if (r.action === "paid_by") {
        them += r.amount;
        queue.push({ d: r.date, a: r.amount, t: "them" });
      } else if (r.action === "paid_to_me") {
        me -= r.amount;
        consume("me", r.amount);
      } else if (r.action === "paid_to_them") {
        them -= r.amount;
        consume("them", r.amount);
      }
    }
    const net = me - them;
    if (net > 0) oweMe += net;
    else if (net < 0) oweThem -= net;
    friends.push({ name, net, activeSince: queue[0]?.d || null, records: recs.reverse() });
  }
  friends.sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
  return { friends, oweMe, oweThem, net: oweMe - oweThem, count: raw.length };
};
var SIGN = { paid_for: 1, paid_by: -1, paid_to_me: -1, paid_to_them: 1 };
var balanceAfter2 = (recs) => {
  const out = /* @__PURE__ */ new Map();
  let b = 0;
  for (const r of [...recs].sort((x, y) => x.date.localeCompare(y.date) || x.index - y.index)) {
    b += (SIGN[r.action] ?? -1) * r.amount;
    out.set(r, b);
  }
  return out;
};
var settleOf = (f) => f.net > 0 ? { action: "paid_to_me", amount: f.net } : f.net < 0 ? { action: "paid_to_them", amount: -f.net } : null;
var findRecord = (list5, r) => {
  const arr5 = Array.isArray(list5) ? list5 : [];
  const same = (e) => !!e && String(e.friend) === r.friend && String(e.action) === r.action && Number(e.amount) === r.amount && dateStr(e.date, "") === r.date && String(e.note ?? "") === r.note;
  return same(arr5[r.index]) ? r.index : arr5.findIndex((e) => same(e));
};
var daysSince = (d, now = /* @__PURE__ */ new Date()) => {
  const [y, m, dd] = d.split("-").map(Number);
  return Math.max(0, Math.floor((new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() - new Date(y, (m || 1) - 1, dd || 1).getTime()) / 864e5));
};

// src/pages/networth.ts
var netWorth = (plugin) => {
  const { store, settings, prices } = plugin;
  const cur = settings.baseCurrency;
  const plan = store.fm(store.path(FILES.savings)) ?? {};
  const months = store.monthNotes();
  const savedOf = (key) => months.reduce((s2, m) => s2 + (Number(m.fm[key] !== void 0 ? m.fm[key] : plan[key]) || 0), 0);
  const G = buildGoals(store.fm(store.path(FILES.goals)), savedOf);
  const inv = store.fm(store.path(FILES.invest));
  const fb = inv?.fx_fallback ?? {};
  const P = buildPortfolio(inv, (tk) => prices.price(tk), (c) => prices.fx(c, cur, fb));
  const d = computeDebt(store.fm(store.path(FILES.debt)), Number(plan.student_loan) || 0, store.monthLines("student_loan"), /* @__PURE__ */ new Date());
  const L2 = buildLedger(store.fm(store.path(FILES.ledger))?.ledger);
  const parts = [
    { key: "goals", label: t("nwFunds"), value: G.totalSaved - G.spent },
    { key: "invest", label: t("nwInvest"), value: P.value + (investCash(buildAccounts(store.fm(store.path(ACCOUNTS_FILE))).list, P.buckets.map((b) => b.key)) ?? savedOf("investment") - P.bought) },
    ...d.exists && d.grace ? [{ key: "debt", label: t("nwLoanSavings"), value: d.toInvestment + d.loanPrep }] : [],
    { key: "ledger", label: t("nwFriends"), value: L2.net },
    ...d.exists ? [{ key: "debt", label: t("nwDebt"), value: -d.balance }] : []
  ];
  const assets = parts.filter((p) => p.value > 0).reduce((s2, p) => s2 + p.value, 0), debts = parts.filter((p) => p.value < 0).reduce((s2, p) => s2 - p.value, 0);
  return { parts, total: assets - debts, assets, debts };
};
var signed4 = (n) => `${n < 0 ? "-" : ""}${num(Math.abs(n))}`;
var netWorthPage = (ctx) => {
  const N = netWorth(ctx.plugin);
  const title = t("nwTitle");
  const el = page(title);
  el.addClass("zl-c-stack");
  summary(el, { label: t("nwLabel", { cur: ctx.plugin.settings.baseCurrency }), value: signed4(N.total), hot: N.total < 0, items: [[t("nwHave"), num(N.assets)], [t("nwOwe"), num(N.debts), N.debts > 0]] });
  const g = h(el, "div", "zl-c-group");
  sec(g, t("nwParts").toUpperCase());
  figures(g, N.parts.map((p) => ({ k: p.label.toUpperCase(), v: signed4(p.value), hot: p.value < 0, onTap: () => ctx.goTab(p.key) })));
  figures(h(el, "div", "zl-c-group"), [{ icon: "wallet", k: t("acTitle").toUpperCase(), s: t("acSeeWhere"), v: "", onTap: () => ctx.push({ key: "accounts", title: t("acTitle") }) }]);
  h(el, "div", "zl-c-note", t("nwNote"));
  return { title, el };
};

// src/pages/debt.ts
var PLAN_KEY2 = "student_loan";
var debtPage = {
  id: "debt",
  label: "tabDebt",
  icon: "landmark",
  render(ctx) {
    const { store, settings } = ctx.plugin;
    const cur = settings.baseCurrency;
    const CFG = store.path(FILES.debt);
    const fm = store.fm(CFG);
    const planDefault = Number(store.fm(store.path(FILES.savings))?.[PLAN_KEY2]) || 0;
    const d = computeDebt(fm, planDefault, store.monthLines(PLAN_KEY2), /* @__PURE__ */ new Date());
    const money = (n) => num(n);
    const recordPayment = () => new FormSheet(ctx.app, {
      title: t("recordPayment"),
      subtitle: `${t("remaining")} ${money(d.balance)}`,
      submitText: t("savePayment"),
      fields: [
        { key: "amount", label: t("amount"), type: "number", suffix: cur, placeholder: "0", required: true, value: !d.grace && d.monthlyMin > 0 ? d.monthlyMin : "" },
        { key: "date", label: t("date"), type: "date", value: today(), required: true },
        { key: "note", label: t("note"), type: "text", value: t("defaultPaymentNote") }
      ],
      onSubmit: async (v) => {
        const amount = parseNum(v.amount);
        await store.update(CFG, (f) => {
          const list5 = Array.isArray(f.payments) ? f.payments : f.payments ? [f.payments] : [];
          list5.push({ date: v.date || today(), amount, note: v.note || t("defaultPaymentNote") });
          f.payments = list5;
        });
        new import_obsidian21.Notice(t("loggedPayment", { amount: num(amount), left: num(Math.max(0, d.balance - amount)), cur }));
      }
    }).open();
    const editPayment = (p) => new FormSheet(ctx.app, {
      title: t("editPayment"),
      subtitle: p.note || t("defaultPaymentNote"),
      submitText: t("save"),
      fields: [
        { key: "amount", label: t("amount"), type: "number", suffix: cur, value: p.amount, required: true },
        { key: "date", label: t("date"), type: "date", value: p.date, required: true },
        { key: "note", label: t("note"), type: "text", value: p.note, placeholder: t("optional") }
      ],
      onSubmit: async (v) => {
        await store.update(CFG, (f) => {
          const x = Array.isArray(f.payments) ? f.payments[p.index] : void 0;
          if (!x) return;
          x.amount = parseNum(v.amount);
          x.date = v.date;
          x.note = v.note;
        });
        new import_obsidian21.Notice(t("updatedPayment", { amount: num(parseNum(v.amount)), cur }));
      },
      danger: {
        text: t("deletePayment"),
        onTap: async () => {
          if (!await confirmSheet(ctx.app, t("deletePayment"), t("deletePaymentQ", { amount: num(p.amount), cur, date: p.date || "-" }), t("delete"))) return false;
          await store.update(CFG, (f) => {
            if (Array.isArray(f.payments) && f.payments[p.index] !== void 0) f.payments.splice(p.index, 1);
          });
          new import_obsidian21.Notice(t("deletedPayment", { amount: num(p.amount), cur }));
          return true;
        }
      }
    }).open();
    const editNumber = (what, key, value, percent = false) => new FormSheet(ctx.app, {
      title: what,
      submitText: t("save"),
      fields: [{ key: "v", label: what, type: "number", value: percent ? +(value * 100).toFixed(4) : value, suffix: percent ? "%" : cur, required: !percent }],
      onSubmit: async (v) => {
        const n = parseNum(v.v);
        await store.update(CFG, (f) => {
          f[key] = percent ? +(n / 100).toFixed(8) : n;
        });
        new import_obsidian21.Notice(t("updated", { what, value: percent ? `${n}%` : money(n) }));
      }
    }).open();
    const editStart = () => new FormSheet(ctx.app, {
      title: d.grace || !d.start ? t("repaymentStarts") : t("repayingSince"),
      submitText: t("save"),
      fields: [{ key: "v", label: t("date"), type: "date", value: d.start || today(), required: true }],
      onSubmit: async (v) => {
        await store.update(CFG, (f) => {
          f.start_date = v.v;
        });
        new import_obsidian21.Notice(t("updated", { what: t("repaymentStarts"), value: v.v }));
      }
    }).open();
    const editAllocation2 = () => editAllocation(ctx, PLAN_KEY2, t("monthlyAllocation"));
    const setUp = () => new FormSheet(ctx.app, {
      title: t("setUpLoan"),
      submitText: t("save"),
      fields: [
        { key: "principal", label: t("initialPrincipal"), type: "number", suffix: cur, required: true },
        { key: "rate", label: t("interestRate"), type: "number", suffix: "%", placeholder: t("rateHint") },
        { key: "start", label: t("repaymentStarts"), type: "date", value: today(), required: true },
        { key: "min", label: t("monthlyMin"), type: "number", suffix: cur }
      ],
      onSubmit: async (v) => {
        await store.update(CFG, (f) => {
          f.initial_principal = parseNum(v.principal);
          f.interest_rate = v.rate ? +(parseNum(v.rate) / 100).toFixed(8) : 0;
          f.start_date = v.start;
          f.monthly_min_payment = v.min ? parseNum(v.min) : 0;
          f.payments = [];
        });
      }
    }).open();
    const acts = { recordPayment, editNumber, editStart, editAllocation: editAllocation2, setUp, allocation: store.allocation(PLAN_KEY2).amount };
    if (ctx.frame.key === "history") return history(ctx, d, money, recordPayment, editPayment);
    if (ctx.frame.key === "accounts" || ctx.frame.key.startsWith("accounts:")) return accountsPage(ctx);
    if (ctx.frame.key.startsWith("account:")) {
      const o = accountPage(ctx, ctx.frame.key.slice(8));
      if (o) return o;
    }
    if (ctx.frame.key === "networth") return netWorthPage(ctx);
    if (ctx.frame.key === "loan") return loan(ctx, d, money, acts);
    return first(ctx, d, money, cur, acts);
  }
};
var first = (ctx, d, money, cur, a) => {
  const title = t("tabDebt");
  const el = page(title);
  if (!d.exists) {
    el.addClass("zl-c-stack");
    empty(el, { icon: "landmark", title: t("noDebt"), text: t("noDebtSub"), button: t("setUpLoan"), onTap: a.setUp });
    return { title, el };
  }
  el.addClass("zl-c-stack");
  const pay = Math.max(d.repayment, d.monthlyMin);
  const mon = (s2) => {
    const [y, m] = s2.split("-").map(Number);
    return `${MONTHS[(m || 1) - 1]} ${String(y).slice(2)}`.toUpperCase();
  };
  homeTop(el, {
    key: "debt",
    value: num(d.balance),
    label: t("cRemaining"),
    right: t("cPaidPct", { n: d.progress.toFixed(d.progress ? 1 : 0) }),
    reads: d.grace && d.start ? [[t("dFirstPay"), mon(d.start)], [t("dEachMonth"), num(pay)]] : [[t("dPaidSoFar"), num(d.paid)], [t("dEachMonthNow"), num(pay)]]
  });
  const P = projectDebt(d, pay, /* @__PURE__ */ new Date());
  const g = h(el, "div", "zl-c-group zl-c-fill");
  sec(g, t("dYears").toUpperCase());
  const cols = P.years.slice(1).length ? P.years.slice(1) : P.years;
  const labels = cols.map((_, i) => {
    const y = P.firstYear + i;
    return cols.length > 6 ? `'${String(y).slice(2)}` : String(y);
  });
  const at = (/* @__PURE__ */ new Date()).getFullYear() - P.firstYear;
  const loud = at >= 0 && at < cols.length ? at : -1;
  yearBricks(g, cols, labels, loud);
  h(g, "p", "zl-c-note", t(loud >= 0 ? "dYearsNoteNow" : "dYearsNote", { n: num(pay) }));
  const n = d.payments.length;
  const acc = buildAccounts(ctx.plugin.store.fm(ctx.plugin.store.path(ACCOUNTS_FILE)));
  const own = acc.list.filter((x) => x.line === "student_loan");
  const saved = own.length ? own.reduce((s2, x) => s2 + x.balance, 0) : d.loanPrep;
  const nw = netWorth(ctx.plugin).total;
  figures(h(el, "div", "zl-c-group"), [
    { icon: "wallet", k: t("dSaved"), s: t("dSavedSub"), v: money(saved), onTap: () => ctx.push({ key: "loan", title: t("loanDetails") }) },
    ...n ? [{ icon: "receipt", k: t("dPayments"), s: n === 1 ? t("cPayment1") : t("cPayments", { n }), v: money(d.paid), onTap: () => ctx.push({ key: "history", title: t("repaymentHistory") }) }] : [],
    { icon: "wallet", k: t("nwTitle"), s: t("nwSub"), v: `${nw < 0 ? "-" : ""}${money(Math.abs(nw))}`, hot: nw < 0, onTap: () => ctx.push({ key: "networth", title: t("nwTitle") }) }
  ]);
  return { title, el, fab: { icon: "plus", text: t("recordPayment").toUpperCase(), label: t("recordPayment"), onTap: a.recordPayment } };
};
var loan = (ctx, d, money, a) => {
  const title = t("loanDetails");
  const el = page(title);
  el.addClass("zl-c-stack");
  summary(el, { label: t("remaining"), value: num(d.balance), hot: d.balance > 0, items: [[t("cPaid"), num(d.paid)], [t("progress"), `${d.progress.toFixed(1)}%`], [t("cMonthly"), num(Math.max(d.repayment, d.monthlyMin))]] });
  const list5 = [
    { icon: "debt", k: t("initialPrincipal").toUpperCase(), v: money(d.principal), onTap: () => a.editNumber(t("initialPrincipal"), "initial_principal", d.principal) },
    { icon: "percent", k: t("interestRate").toUpperCase(), v: `${(d.rate * 100).toFixed(3)}%`, onTap: () => a.editNumber(t("interestRate"), "interest_rate", d.rate, true) },
    { icon: "wallet", k: t("monthlyAllocation").toUpperCase(), s: t("fromSavingsPlan"), v: money(a.allocation), onTap: a.editAllocation },
    { icon: "receipt", k: t("monthlyMin").toUpperCase(), v: money(d.monthlyMin), onTap: () => a.editNumber(t("monthlyMin"), "monthly_min_payment", d.monthlyMin) },
    { icon: "log", k: (d.grace || !d.start ? t("repaymentStarts") : t("repayingSince")).toUpperCase(), s: d.grace ? t("inDaysShort", { d: d.daysUntilStart }) : void 0, v: d.start ? shortDate(d.start) : t("notSet"), onTap: a.editStart }
  ];
  if (d.grace) list5.push({ icon: "swap", k: t("graceSplit").toUpperCase(), v: `${num(d.toInvestment)} \xB7 ${num(d.loanPrep)}` });
  figures(h(el, "div", "zl-c-group"), list5);
  return { title, el, fab: { icon: "plus", text: t("recordPayment").toUpperCase(), label: t("recordPayment"), onTap: a.recordPayment } };
};
var history = (ctx, d, money, recordPayment, editPayment) => {
  const title = t("repaymentHistory");
  const el = page(title);
  el.addClass("zl-c-list");
  summary(el, { label: t("cPaidTotal"), value: num(d.paid), items: [[t("cCount"), String(d.payments.length)], [t("progress"), `${d.progress.toFixed(1)}%`]] });
  if (!d.payments.length) empty(el, { icon: "receipt", title: t("noPayments"), text: t("noPaymentsSub") });
  else figures(h(el, "div", "zl-c-group"), [...d.payments].sort((x, y) => (y.date || "").localeCompare(x.date || "") || y.index - x.index).map((p) => ({
    icon: "receipt",
    k: (p.note || t("defaultPaymentNote")).toUpperCase(),
    s: shortDate(dateStr(p.date, "-")),
    v: money(p.amount),
    onTap: () => editPayment(p)
  })));
  return { title, el, fab: { icon: "plus", text: t("recordPayment").toUpperCase(), label: t("recordPayment"), onTap: recordPayment } };
};

// src/pages/ledger.ts
var import_obsidian22 = require("obsidian");
var ACT = {
  paid_for: { label: "aPaidFor", tile: "tPaidFor", tileSub: "tPaidForSub", icon: "down", color: C.pos },
  paid_by: { label: "aPaidBy", tile: "tPaidBy", tileSub: "tPaidBySub", icon: "debt", color: C.warn },
  paid_to_me: { label: "aPaidToMe", tile: "tPaidToMe", tileSub: "tPaidToMeSub", icon: "up", color: C.warn },
  paid_to_them: { label: "aPaidToThem", tile: "tPaidToThem", tileSub: "tPaidToThemSub", icon: "square-check,check-square", color: C.pos }
};
var act = (a) => ACT[a] ?? { label: "aPaidToMe", tile: "tPaidToMe", tileSub: "tPaidToMeSub", icon: "square-check,check-square", color: C.warn };
var NEW2 = "__new__";
var ledgerPage = {
  id: "ledger",
  label: "tabLedger",
  icon: "handshake",
  render(ctx) {
    const { store, settings } = ctx.plugin;
    const cur = settings.baseCurrency;
    const CFG = store.path(FILES.ledger);
    const L2 = buildLedger(store.fm(CFG)?.ledger);
    const order = L2.friends.map((f) => f.name);
    const tint = (name) => colorFor(Math.max(0, order.indexOf(name)));
    const newTx = (preset, pre) => {
      const names = L2.friends.map((f) => f.name);
      new FormSheet(ctx.app, {
        title: t("newTx"),
        subtitle: preset,
        submitText: t("save"),
        fields: [
          ...preset ? [] : [
            { key: "friend", label: t("friend"), type: "select", options: [...names.map((n) => [n, n]), [NEW2, t("newFriend")]], value: names[0] ?? NEW2 },
            { key: "name", label: t("name"), type: "text", placeholder: t("newFriendName"), required: true, showIf: (v) => v.friend === NEW2 }
          ],
          { key: "action", label: t("whoPaid"), type: "tiles", value: pre?.action ?? "paid_for", tiles: ACTIONS.map((a) => ({ value: a, title: t(ACT[a].tile), sub: t(ACT[a].tileSub), icon: ACT[a].icon, color: ACT[a].color })) },
          { key: "amount", label: t("amount"), type: "number", suffix: cur, placeholder: "0", required: true, value: pre ? pre.amount : "" },
          { key: "note", label: t("note"), type: "text", placeholder: t("optional") },
          { key: "date", label: t("date"), type: "date", value: today(), required: true }
        ],
        validate: (v) => !preset && v.friend === NEW2 && names.includes(v.name.trim()) ? t("nameTaken", { name: v.name.trim() }) : null,
        onSubmit: async (v) => {
          const friend2 = preset ?? (v.friend === NEW2 ? v.name.trim() : v.friend);
          const amount = parseNum(v.amount);
          await store.update(CFG, (f) => {
            const list5 = Array.isArray(f.ledger) ? f.ledger : [];
            list5.push({ friend: friend2, action: v.action, amount, date: v.date || today(), note: v.note });
            f.ledger = list5;
          });
          new import_obsidian22.Notice(t("savedTx", { friend: friend2, what: t(act(v.action).label).toLowerCase(), amount: num(amount), cur }));
        }
      }).open();
    };
    const editTx = (r) => new FormSheet(ctx.app, {
      title: t("editTx"),
      subtitle: `${r.friend} \xB7 ${t(act(r.action).label)}`,
      submitText: t("save"),
      fields: [
        { key: "amount", label: t("amount"), type: "number", suffix: cur, value: r.amount, required: true },
        { key: "date", label: t("date"), type: "date", value: r.date, required: true },
        { key: "note", label: t("note"), type: "text", value: r.note, placeholder: t("optional") }
      ],
      onSubmit: async (v) => {
        let ok = false;
        await store.update(CFG, (f) => {
          const i = findRecord(f.ledger, r);
          if (i < 0) return;
          const e = f.ledger[i];
          e.amount = parseNum(v.amount);
          e.date = v.date;
          e.note = v.note;
          ok = true;
        });
        new import_obsidian22.Notice(ok ? t("updatedTx", { friend: r.friend, amount: num(parseNum(v.amount)), cur }) : t("txGone"));
      },
      danger: {
        text: t("deleteTx"),
        onTap: async () => {
          if (!await confirmSheet(ctx.app, t("deleteTx"), t("deleteTxQ", { amount: num(r.amount), cur, date: r.date || "-" }), t("delete"))) return false;
          let ok = false;
          await store.update(CFG, (f) => {
            const i = findRecord(f.ledger, r);
            if (i >= 0) {
              f.ledger.splice(i, 1);
              ok = true;
            }
          });
          new import_obsidian22.Notice(ok ? t("deletedTx", { friend: r.friend, amount: num(r.amount), cur }) : t("txGone"));
          return true;
        }
      }
    }).open();
    const key = ctx.frame.key;
    const friend = key.startsWith("friend:") ? L2.friends.find((f) => f.name === key.slice(7)) : void 0;
    if (friend) return friendPage(ctx, friend, () => newTx(friend.name), (p) => newTx(friend.name, p), editTx);
    const all = key.startsWith("history:") ? L2.friends.find((f) => f.name === key.slice(8)) : void 0;
    if (all) return historyPage(all, () => newTx(all.name), editTx);
    if (key === "activity") return activityPage(ctx, L2, () => newTx(), editTx);
    return firstPage(ctx, L2, cur, tint, newTx, editTx);
  }
};
var status = (f) => {
  const d = f.activeSince ? daysSince(f.activeSince) : 0;
  if (f.net === 0) return t("settled");
  const w = f.net > 0 ? t("cOwesYou") : t("cYouOweThem");
  return d ? `${w} \xB7 ${t("daysN", { n: d })}` : w;
};
var SAY = { paid_for: "sPaidFor", paid_by: "sPaidBy", paid_to_me: "sPaidToMe", paid_to_them: "sPaidToThem" };
var say = (r, pronoun = false) => t(SAY[r.action] ?? "sPaidToMe", { name: !pronoun ? r.friend : r.action === "paid_by" || r.action === "paid_to_me" ? t("cThey") : t("cThem") });
var MAX_HOME = 3;
var recLine = (r) => [r.date ? shortDate(r.date) : t("noDate"), r.note.trim()].filter(Boolean).join(" \xB7 ");
var owes = (a) => a === "paid_by";
var txIcon = (a) => a === "paid_by" ? "debt" : a === "paid_to_me" ? "up" : "down";
var person = (ctx, f, most) => ({ icon: "person", name: true, k: f.name.toUpperCase(), s: status(f), v: num(Math.abs(f.net)), hot: f.net < 0, dim: f.net === 0, beam: f.net / most, onTap: () => ctx.push({ key: "friend:" + f.name, title: f.name }) });
var txRow = (r, editTx, pronoun = false) => ({ icon: txIcon(r.action), name: true, k: say(r, pronoun).toUpperCase(), s: recLine(r), v: num(r.amount), hot: owes(r.action), onTap: () => editTx(r) });
var firstPage = (ctx, L2, cur, _tint, newTx, editTx) => {
  const title = t("tabLedger");
  const el = page(title);
  el.addClass("zl-c-stack");
  const open2 = L2.friends.filter((f) => f.net !== 0);
  const settled = L2.friends.length - open2.length;
  const all = () => ctx.push({ key: "activity", title: t("cAllActivity") });
  homeTop(el, {
    key: "ledger",
    value: num(Math.abs(L2.net)),
    label: L2.net >= 0 ? t("cOwedAll", { cur }) : t("cOweAll", { cur }),
    right: open2.length ? t("cOpenN", { n: open2.length }) : t("allSettled"),
    reads: [[t("theyOweMe"), num(L2.oweMe)], [t("iOweThem"), num(L2.oweThem)]]
  });
  const most = Math.max(1, ...open2.map((f) => Math.abs(f.net)));
  const g = h(el, "div", "zl-c-group");
  sec(g, t("openBalances").toUpperCase(), L2.count ? all : void 0, t("cAllActivity").toUpperCase());
  if (open2.length) figures(g, open2.slice(0, MAX_HOME).map((f) => person(ctx, f, most)));
  if (!open2.length) figures(g, [{ k: (L2.count ? t("allSettled") : t("noTx")).toUpperCase(), s: L2.count ? t("nothingOwed") : t("noTxSub"), v: "0", dim: true }]);
  const more = Math.max(0, open2.length - MAX_HOME);
  const tail = more || settled ? sec(h(el, "div", "zl-c-group zl-c-link"), [more ? t("cMoreN", { n: more }) : "", settled ? t("lSettledN", { n: settled }) : ""].filter(Boolean).join(" \xB7 ").toUpperCase(), all, t("cMore").toUpperCase()) : null;
  const recent = L2.friends.flatMap((f) => f.records).sort((a, b) => b.date.localeCompare(a.date) || b.index - a.index).slice(0, 3);
  let rbox = null;
  if (recent.length) {
    const r = h(el, "div", "zl-c-group");
    sec(r, t("recentActivity").toUpperCase());
    rbox = figures(r, recent.map((x) => txRow(x, editTx)));
  }
  if (tail) el.appendChild(tail.parentElement);
  const trim = rbox ? dropRow(rbox, 0) : void 0;
  return { title, el, trim, fab: { icon: "plus", text: t("newTx").toUpperCase(), label: t("newTx"), onTap: () => newTx() } };
};
var activityPage = (ctx, L2, newTx, editTx) => {
  const title = t("cAllActivity");
  const el = page(title);
  el.addClass("zl-c-list");
  const g = h(el, "div", "zl-c-group");
  sec(g, t("cPeople").toUpperCase());
  const most = Math.max(1, ...L2.friends.map((f) => Math.abs(f.net)));
  figures(g, L2.friends.map((f) => person(ctx, f, most)));
  const all = L2.friends.flatMap((f) => f.records).sort((a, b) => b.date.localeCompare(a.date) || b.index - a.index);
  const r = h(el, "div", "zl-c-group");
  sec(r, t("recentActivity").toUpperCase());
  figures(r, all.map((x) => txRow(x, editTx)));
  return { title, el, fab: { icon: "plus", text: t("newTx").toUpperCase(), label: t("newTx"), onTap: newTx } };
};
var monthHead2 = (d) => {
  const m = /^(\d{4})-(\d{2})/.exec(d);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, 1).toLocaleDateString("en", { month: "long", year: "numeric" }) : t("noDate");
};
var newestFirst = (f) => [...f.records].sort((a, b) => b.date.localeCompare(a.date) || b.index - a.index);
var histRows = (f, recs, editTx) => {
  const after = balanceAfter2(f.records);
  return recs.map((r) => {
    const b = after.get(r) ?? 0;
    return { ...txRow(r, editTx, true), s: [r.date ? shortDate(r.date) : "", r.note.trim(), b < 0 ? t("lBalAfterNeg", { n: num(-b) }) : b > 0 ? t("lBalAfter", { n: num(b) }) : t("lBalAfterZero")].filter(Boolean).join(" \xB7 ") };
  });
};
var friendPage = (ctx, f, newTx, settle, editTx) => {
  const el = page(f.name);
  el.addClass("zl-c-stack");
  const dates = f.records.map((r) => r.date).filter(Boolean).sort();
  summary(el, {
    key: "friend-" + f.name,
    label: f.net > 0 ? t("lOwesYouN", { name: f.name }) : f.net < 0 ? t("lYouOweN", { name: f.name }) : t("settled"),
    value: num(Math.abs(f.net)),
    hot: f.net < 0,
    dim: f.net === 0,
    items: [[t("lOpenSince"), f.activeSince ? shortDate(f.activeSince) : "-"], [t("last"), dates.length ? shortDate(dates[dates.length - 1]) : "-"], [t("txCount"), String(f.records.length)]]
  });
  const st = settleOf(f);
  if (st) figures(h(el, "div", "zl-c-group"), [{ icon: txIcon(st.action), k: t("lSettleUp").toUpperCase(), s: say({ friend: f.name, action: st.action, amount: st.amount, date: "", note: "", index: -1 }, true), v: num(st.amount), hot: f.net < 0, onTap: () => settle(st) }]);
  const g = h(el, "div", "zl-c-group");
  sec(g, t("recentActivity").toUpperCase(), f.records.length > 1 ? () => ctx.push({ key: "history:" + f.name, title: f.name }) : void 0, t("cAll").toUpperCase());
  const box = figures(g, histRows(f, newestFirst(f), editTx));
  return { title: f.name, el, trim: dropRow(box, 1), fab: { icon: "plus", text: t("newTx").toUpperCase(), label: t("newTx"), onTap: newTx } };
};
var historyPage = (f, newTx, editTx) => {
  const el = page(f.name);
  el.addClass("zl-c-list");
  const byMonth = /* @__PURE__ */ new Map();
  for (const r of newestFirst(f)) {
    const k = r.date.slice(0, 7);
    if (!byMonth.has(k)) byMonth.set(k, []);
    byMonth.get(k).push(r);
  }
  for (const [m, recs] of byMonth) {
    const g = h(el, "div", "zl-c-group");
    sec(g, monthHead2(m).toUpperCase());
    figures(g, histRows(f, recs, editTx));
  }
  return { title: f.name, el, fab: { icon: "plus", text: t("newTx").toUpperCase(), label: t("newTx"), onTap: newTx } };
};

// src/pages/goals.ts
var import_obsidian23 = require("obsidian");
var NEW3 = "__new__";
var goalsPage = {
  id: "goals",
  label: "tabGoals",
  icon: "target",
  render(ctx) {
    const { store, settings } = ctx.plugin;
    const cur = settings.baseCurrency;
    const CFG = store.path(FILES.goals);
    const plan = store.fm(store.path(FILES.savings)) ?? {};
    const months = store.monthNotes();
    const savedOf = (key2) => months.reduce((s2, m) => s2 + (Number(m.fm[key2] !== void 0 ? m.fm[key2] : plan[key2]) || 0), 0);
    const G = buildGoals(store.fm(CFG), savedOf);
    const updateGoal = (name, fn) => store.update(CFG, (f) => {
      const g = (Array.isArray(f.goals) ? f.goals : []).find((x) => x.name === name);
      if (g) fn(g);
    });
    const splitFund = (s0) => {
      const m0 = /^\s*(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*)\s*(.*)$/u.exec(s0 ?? "");
      return m0 ? { emoji: m0[1], label: m0[2].trim() } : { emoji: "\u{1F3AF}", label: (s0 ?? "").trim() };
    };
    const newGoal = (fundKey) => new FormSheet(ctx.app, {
      title: t("newGoal"),
      submitText: t("save"),
      fields: [
        // + New fund asks its name in the writing window (a leading emoji becomes the fund's); the sheet keeps its rows (owner)
        {
          key: "fund",
          label: t("fund"),
          type: "select",
          value: fundKey ?? G.funds[0]?.key ?? NEW3,
          options: [...G.funds.map((f) => [f.key, `${f.emoji} ${f.label}`.trim()]), [NEW3, t("newFund")]],
          ask: { value: NEW3, into: "fundIn", title: t("fundName"), placeholder: t("fundNameHint") }
        },
        { key: "fundIn", label: t("fundName"), type: "text", off: true },
        { key: "name", label: t("goalName"), type: "text", required: true },
        { key: "goal", label: t("goalAmount"), type: "number", suffix: cur, placeholder: "0", required: true },
        { key: "date", label: t("targetDate"), type: "date" }
      ],
      validate: (v) => {
        if (G.goals.some((g) => g.name === v.name.trim())) return t("goalExists", { name: v.name.trim() });
        if (v.fund === NEW3 && !splitFund(v.fundIn).label) return t("required", { field: t("fundName").toLowerCase() });
        if (v.fund === NEW3 && G.funds.some((f) => f.key === keyOf(splitFund(v.fundIn).label))) return t("fundExists");
        return null;
      },
      onSubmit: async (v) => {
        const nf = splitFund(v.fundIn);
        v.fundName = nf.label;
        v.emoji = nf.emoji;
        const isNew = v.fund === NEW3;
        const key2 = isNew ? keyOf(v.fundName) : v.fund;
        const emoji = isNew ? v.emoji || "\u{1F3AF}" : G.funds.find((f) => f.key === key2)?.emoji || "\u{1F3AF}";
        const amount = parseNum(v.goal);
        await store.update(CFG, (f) => {
          if (isNew) f.funds = [...Array.isArray(f.funds) ? f.funds : f.funds ? [f.funds] : [], { key: key2, label: v.fundName.trim(), emoji }];
          const entry = { name: v.name.trim(), fund: key2, emoji, goal: amount };
          if (v.date) entry.target_date = v.date;
          entry.expenses = [];
          f.goals = [...Array.isArray(f.goals) ? f.goals : f.goals ? [f.goals] : [], entry];
        });
        if (isNew) {
          await store.update(store.path(FILES.savings), (f) => {
            if (f[key2] === void 0) f[key2] = 0;
          });
          new import_obsidian23.Notice(t("addedFund", { name: v.fundName.trim() }));
        } else new import_obsidian23.Notice(t("addedGoal", { name: v.name.trim(), amount: num(amount), cur }));
      }
    }).open();
    const addExpense = (g) => new FormSheet(ctx.app, {
      title: t("addExpense"),
      subtitle: `${g.emoji} ${g.name}`.trim(),
      submitText: t("save"),
      fields: [
        { key: "amount", label: t("amount"), type: "number", suffix: cur, placeholder: "0", required: true },
        { key: "item", label: t("note"), type: "text", placeholder: t("optional") },
        { key: "date", label: t("date"), type: "date", value: today(), required: true }
      ],
      onSubmit: async (v) => {
        const amount = parseNum(v.amount);
        await updateGoal(g.name, (x) => {
          x.expenses = [...Array.isArray(x.expenses) ? x.expenses : [], { item: v.item || t("expenseDefault"), amount, date: v.date }];
        });
        new import_obsidian23.Notice(t("addedExpense", { amount: num(amount), cur, name: g.name }));
      }
    }).open();
    const editExpense = (g, x) => new FormSheet(ctx.app, {
      title: t("editExpense"),
      subtitle: x.item,
      submitText: t("save"),
      fields: [
        { key: "amount", label: t("amount"), type: "number", suffix: cur, value: x.amount, required: true },
        { key: "item", label: t("note"), type: "text", value: x.item },
        { key: "date", label: t("date"), type: "date", value: x.date, required: true }
      ],
      onSubmit: async (v) => {
        let ok = false;
        await updateGoal(g.name, (y) => {
          const i = findExpense(y.expenses, x);
          if (i < 0) return;
          const e = y.expenses[i];
          e.item = v.item || t("expenseDefault");
          e.amount = parseNum(v.amount);
          e.date = v.date;
          ok = true;
        });
        new import_obsidian23.Notice(ok ? t("updatedExpense", { item: v.item || x.item, amount: num(parseNum(v.amount)), cur }) : t("expenseGone"));
      },
      danger: {
        text: t("deleteExpense"),
        onTap: async () => {
          if (!await confirmSheet(ctx.app, t("deleteExpense"), t("deleteExpenseQ", { item: x.item, amount: num(x.amount), cur }), t("delete"))) return false;
          let ok = false;
          await updateGoal(g.name, (y) => {
            const i = findExpense(y.expenses, x);
            if (i >= 0) {
              y.expenses.splice(i, 1);
              ok = true;
            }
          });
          new import_obsidian23.Notice(ok ? t("deletedExpense", { item: x.item }) : t("expenseGone"));
          return true;
        }
      }
    }).open();
    const editGoalAmount = (g) => new FormSheet(ctx.app, {
      title: t("goalAmount"),
      subtitle: g.name,
      submitText: t("save"),
      fields: [{ key: "v", label: t("goalAmount"), type: "number", suffix: cur, value: g.amount, required: true }],
      onSubmit: async (v) => {
        await updateGoal(g.name, (x) => {
          x.goal = parseNum(v.v);
        });
        new import_obsidian23.Notice(t("updatedGoal", { what: t("goalAmount"), value: num(parseNum(v.v)) }));
      }
    }).open();
    const editTarget = (g) => new FormSheet(ctx.app, {
      title: t("targetDate"),
      subtitle: g.name,
      submitText: t("save"),
      fields: [{ key: "v", label: t("date"), type: "date", value: g.target || today(), required: true }],
      onSubmit: async (v) => {
        await updateGoal(g.name, (x) => {
          x.target_date = v.v;
        });
        new import_obsidian23.Notice(t("updatedGoal", { what: t("targetDate"), value: shortDate(v.v) }));
      }
    }).open();
    const deleteGoal = async (g) => {
      if (!await confirmSheet(ctx.app, t("deleteGoal"), t("deleteGoalQ", { name: g.name }), t("delete"))) return;
      await store.update(CFG, (f) => {
        if (Array.isArray(f.goals)) f.goals = f.goals.filter((x) => x.name !== g.name);
      });
      new import_obsidian23.Notice(t("deletedGoal", { name: g.name }));
      ctx.pop();
    };
    if (ctx.frame.key === "accounts" || ctx.frame.key.startsWith("accounts:")) return accountsPage(ctx);
    if (ctx.frame.key.startsWith("account:")) {
      const o = accountPage(ctx, ctx.frame.key.slice(8));
      if (o) return o;
    }
    const now = today();
    const S = { G, cur, now, monthly: /* @__PURE__ */ new Map(), track: /* @__PURE__ */ new Map(), A: buildAccounts(store.fm(store.path(ACCOUNTS_FILE))) };
    for (const f of G.funds) {
      const m = store.allocation(f.key).amount;
      S.monthly.set(f.key, m);
      for (const [g, tr] of trackFund(f, m, now)) S.track.set(g, tr);
    }
    const key = ctx.frame.key;
    if (key === "funds") return fundsPage(ctx, S);
    if (key.startsWith("goals:")) {
      const f = G.funds.find((x) => x.key === key.slice(6));
      if (f) return goalsList(ctx, f, S, () => newGoal(f.key));
    }
    if (key.startsWith("paid:")) {
      const g = G.goals.find((x) => x.name === key.slice(5));
      if (g) return paidList(g, { addExpense, editExpense });
    }
    if (key.startsWith("goal:")) {
      const g = G.goals.find((x) => x.name === key.slice(5));
      if (g) return goalPage(ctx, g, S, { addExpense, editExpense, editGoalAmount, editTarget, deleteGoal });
    }
    if (key.startsWith("fund:")) {
      const f = G.funds.find((x) => x.key === key.slice(5));
      if (f) return fundPage(ctx, f, S, () => newGoal(f.key));
    }
    return firstPage2(ctx, S, () => newGoal());
  }
};
var keyOf = (name) => `${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "new"}_fund`;
var monthName2 = (ym) => {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en", { month: "short", year: "numeric" });
};
var verdict = (S, g) => {
  const tr = S.track.get(g);
  if (!tr) return { v: `${Math.floor(g.pct)}%`, hot: false };
  return tr.short > 0 ? { v: t("gShort", { n: num(tr.short) }).toUpperCase(), hot: true } : { v: t("gOnTrack").toUpperCase(), hot: false };
};
var goalRow = (ctx, S, g, sub) => ({ icon: "goals", k: g.name.toUpperCase(), s: sub, ...verdict(S, g), onTap: () => ctx.push({ key: "goal:" + g.name, title: g.name }) });
var fundTarget = (S, f) => S.A.list.find((a) => a.line === f.key && a.target > 0)?.target ?? 0;
var fundIcon = (f) => nameSprite(f.label, "goals");
var isShort = (S, f) => f.goals.some((g) => (S.track.get(g)?.short ?? 0) > 0);
var fundTile = (ctx, S, f) => ({ icon: fundIcon(f), k: f.label.toUpperCase(), v: num(f.saved), dim: !f.saved, hot: isShort(S, f), onTap: () => ctx.push({ key: "fund:" + f.key, title: f.label }) });
var fundLine = (S, f) => {
  const m = t("gAMonth", { n: num(S.monthly.get(f.key) ?? 0) });
  const next = f.goals.find((g) => g.pct < 100), ft = fundTarget(S, f);
  return next ? `${m} \xB7 ${t("gNext", { name: next.name, date: next.target ? shortDate(next.target) : "" }).trim()}` : f.goals.length ? `${m} \xB7 ${t("gAllDone").toLowerCase()}` : ft ? `${m} \xB7 ${t("gTargetPct", { target: num(ft), pct: Math.floor(f.saved / ft * 100) })}` : `${m} \xB7 ${t("gNoGoalYet")}`;
};
var firstPage2 = (ctx, S, newGoal) => {
  const { G, cur } = S;
  const title = t("tabGoals");
  const el = page(title);
  el.addClass("zl-c-stack");
  const target = G.funds.reduce((s2, f) => s2 + (f.goals.length ? f.target : fundTarget(S, f)), 0);
  const monthly = G.funds.reduce((s2, f) => s2 + (S.monthly.get(f.key) ?? 0), 0);
  homeTop(el, {
    key: "goals",
    value: num(G.totalSaved),
    label: t("cSaved", { cur }),
    right: target > 0 ? t("cOfTarget", { n: Math.floor(G.totalSaved / target * 100) }) : void 0,
    reads: [[t("gEachMonth"), num(monthly)], [t("remainingGoal"), num(G.remaining)]]
  });
  const fab = { icon: "plus", text: t("newGoal").toUpperCase(), label: t("newGoal"), onTap: newGoal };
  if (!G.funds.length) {
    empty(el, { icon: "target", title: t("noGoals"), text: t("noGoalsSub") });
    return { title, el, fab };
  }
  const funds = () => ctx.push({ key: "funds", title: t("funds") });
  const fg = h(el, "div", "zl-c-group");
  sec(fg, t("funds").toUpperCase(), funds, t("cAll").toUpperCase());
  tileGrid(fg, gridOf(G.funds.map((f) => fundTile(ctx, S, f)), 4, (n) => ({ icon: "list", k: t("cMore").toUpperCase(), v: `+${n}`, onTap: funds })));
  const next = G.goals.filter((g) => g.target && g.pct < 100).slice(0, 3);
  let trim;
  if (next.length) {
    const ng = h(el, "div", "zl-c-group");
    sec(ng, t("gComingUp").toUpperCase());
    trim = dropRow(figures(ng, next.map((g) => goalRow(ctx, S, g, `${shortDate(g.target)} \xB7 ${num(g.amount)}`))), 1);
  }
  const banks = new Set(S.A.list.map((a) => a.bank)).size;
  sec(h(el, "div", "zl-c-group zl-c-link"), (S.A.list.length ? t("gAccounts", { n: S.A.list.length, b: banks }) : t("acTitle")).toUpperCase(), () => ctx.push({ key: "accounts", title: t("acTitle") }), t("cMore").toUpperCase());
  return { title, el, fab, trim };
};
var fundsPage = (ctx, S) => {
  const title = t("funds");
  const el = page(title);
  el.addClass("zl-c-list");
  const g = h(el, "div", "zl-c-group");
  figures(g, S.G.funds.map((f) => ({ icon: fundIcon(f), name: true, k: f.label.toUpperCase(), s: fundLine(S, f), v: num(f.saved), hot: isShort(S, f), onTap: () => ctx.push({ key: "fund:" + f.key, title: f.label }) })));
  return { title, el };
};
var fundPage = (ctx, f, S, newGoal) => {
  const title = f.label;
  const el = page(title);
  el.addClass("zl-c-stack");
  const monthly = S.monthly.get(f.key) ?? 0;
  const ft = f.goals.length ? f.target : fundTarget(S, f);
  const done = doneBy(f, monthly, S.now);
  summary(el, { key: "fund-" + f.key, label: t("savedSoFar"), value: num(f.saved), items: [[f.goals.length ? t("gGoalTotal") : t("cTarget"), ft > 0 ? num(ft) : "-"], [t("remainingGoal"), ft > 0 ? num(Math.max(0, ft - f.saved)) : "-"], [t("gDoneBy"), !f.goals.length ? "-" : f.saved >= f.target ? t("gAllDone") : done ? monthName2(done) : t("gNever")]] });
  const g = h(el, "div", "zl-c-group");
  figures(g, [{ icon: fundIcon(f), k: t("monthlyAmount").toUpperCase(), s: t("fromSavingsPlan"), v: num(monthly), onTap: () => editAllocation(ctx, f.key, `${f.label}: ${t("monthlyAmount").toLowerCase()}`) }]);
  const gg = h(el, "div", "zl-c-group");
  sec(gg, t("gInOrder").toUpperCase(), f.goals.length > 1 ? () => ctx.push({ key: "goals:" + f.key, title: f.label }) : void 0, t("cAll").toUpperCase());
  let trim;
  if (f.goals.length) trim = dropRow(figures(gg, f.goals.map((goal) => goalRow(ctx, S, goal, goalSub(goal)))), 1);
  else figures(gg, [{ k: t("gNoGoalYet").toUpperCase(), v: "-", dim: true }]);
  return { title, el, trim, fab: { icon: "plus", text: t("newGoal").toUpperCase(), label: t("newGoal"), onTap: newGoal } };
};
var goalSub = (goal) => goal.target ? `${shortDate(goal.target)} \xB7 ${num(goal.amount)} \xB7 ${Math.floor(goal.pct)}%` : t("gNoDate", { pct: Math.floor(goal.pct) });
var goalsList = (ctx, f, S, newGoal) => {
  const title = f.label;
  const el = page(title);
  el.addClass("zl-c-list");
  const g = h(el, "div", "zl-c-group");
  sec(g, t("gInOrder").toUpperCase());
  figures(g, f.goals.map((goal) => goalRow(ctx, S, goal, goalSub(goal))));
  return { title, el, fab: { icon: "plus", text: t("newGoal").toUpperCase(), label: t("newGoal"), onTap: newGoal } };
};
var goalPage = (ctx, g, S, a) => {
  const title = g.name;
  const el = page(title);
  el.addClass("zl-c-stack");
  summary(el, { key: "goal-" + g.name, label: t("setAside"), value: num(g.alloc), items: [[t("goal"), num(g.amount)], [t("progress"), `${Math.floor(g.pct)}%`], [t("alreadyPaid"), num(g.spent)]] });
  const f = S.G.funds.find((x) => x.goals.includes(g));
  const tr = S.track.get(g), m = num(S.monthly.get(f?.key ?? "") ?? 0), fund = f?.label ?? "";
  const say2 = !tr ? t("gSayNoDate", { pct: Math.floor(g.pct) }) : tr.short > 0 ? t("gSayShort", { n: num(tr.short), date: shortDate(g.target), fund, per: num(tr.perMonth), m }) : g.pct >= 100 ? t("gSayCovered", { fund }) : t("gSayOnTrack", { fund, m, date: shortDate(g.target) });
  const d = h(el, "div", "zl-c-group");
  h(d, "p", "zl-c-note" + (tr && tr.short > 0 ? " is-hot" : ""), say2);
  tileGrid(d, [
    { icon: "goals", k: t("goal").toUpperCase(), v: num(g.amount), onTap: () => a.editGoalAmount(g) },
    { icon: "log", k: t("targetDate").toUpperCase(), v: g.target ? shortDate(g.target) : t("noTarget"), dim: !g.target, onTap: () => a.editTarget(g) }
  ]);
  const ex = h(el, "div", "zl-c-group");
  sec(ex, t("expenses").toUpperCase(), g.expenses.length > 1 ? () => ctx.push({ key: "paid:" + g.name, title: g.name }) : void 0, t("cAll").toUpperCase());
  let trim;
  if (!g.expenses.length) figures(ex, [{ k: t("nothingPaid").toUpperCase(), v: "0", dim: true }]);
  else trim = dropRow(figures(ex, paidRows(g, a)), 1);
  sec(h(el, "div", "zl-c-group zl-c-danger"), t("deleteGoal").toUpperCase(), () => {
    void a.deleteGoal(g);
  }, "");
  return { title, el, trim, fab: { icon: "plus", text: t("addExpense").toUpperCase(), label: t("addExpense"), onTap: () => a.addExpense(g) } };
};
var paidRows = (g, a) => [...g.expenses].sort((p, q) => q.date.localeCompare(p.date) || q.index - p.index).map((x) => ({ icon: "receipt", k: (x.item || t("expenseDefault")).toUpperCase(), s: x.date ? shortDate(x.date) : void 0, v: num(x.amount), hot: true, onTap: () => a.editExpense(g, x) }));
var paidList = (g, a) => {
  const el = page(g.name);
  el.addClass("zl-c-list");
  const ex = h(el, "div", "zl-c-group");
  sec(ex, t("expenses").toUpperCase());
  figures(ex, paidRows(g, a));
  return { title: g.name, el, fab: { icon: "plus", text: t("addExpense").toUpperCase(), label: t("addExpense"), onTap: () => a.addExpense(g) } };
};

// src/pages/log.ts
var import_obsidian24 = require("obsidian");
var FULL2 = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var cap2 = (s2) => {
  const x = String(s2).replace(/_/g, " ");
  return x.charAt(0).toUpperCase() + x.slice(1);
};
var LEVEL = { ok: C.pos, warn: C.warn, over: C.neg };
var logPage = {
  id: "log",
  label: "tabLog",
  icon: "calendar-days",
  render(ctx) {
    const { store, settings } = ctx.plugin;
    const cur = settings.baseCurrency;
    const sel = ctx.plugin.logMonth;
    const label = `${FULL2[sel.month]} ${sel.year}`;
    const key = ctx.frame.key;
    if (key.startsWith("day:")) return dayPage(ctx, key.slice(4));
    if (key.startsWith("amt:") || key.startsWith("amt1:")) return dayAmountPage(ctx, key);
    if (key === "items") return itemsPage(ctx);
    if (key.startsWith("items:")) return itemGroupPage(ctx, Number(key.slice(6)));
    const { monthPath, month, days, plan, inc, daily, fixed, M } = store.monthData(sel.year, sel.month);
    const gotoMonth = (y, m) => {
      ctx.plugin.logMonth = { year: y, month: m };
      ctx.goTab("log");
      ctx.redraw();
    };
    const step = (d) => {
      if (d === 0) return pickMonth();
      const m = sel.month + d;
      gotoMonth(sel.year + Math.floor(m / 12), (m + 12) % 12);
    };
    const pickMonth = () => new MonthSheet(ctx.app, t("chooseMonth"), sel, gotoMonth).open();
    const blank = !month && !days.length;
    if (blank && key !== "root") return { title: label, el: page(label) };
    const writeMonth = async (fn) => {
      if (!month) {
        new import_obsidian24.Notice(t("needMonth", { month: label }));
        return false;
      }
      await store.update(monthPath, fn);
      return true;
    };
    const editAmount = (title, value, save, _neg = false, note) => openPad(ctx, { title, sub: label, current: value, cur, setOnly: true, note, save: async (n) => {
      await save(n);
    } });
    const x = { ctx, cur, label, month, M, inc, plan, writeMonth, editAmount };
    if (key === "income") return incomePage(x);
    if (key === "savings") return savingsPage(x);
    if (key === "fixed") return fixedPage(x);
    if (key.startsWith("fixed:")) {
      const r = M.fixedRows.find((f) => f.prop === key.slice(6));
      if (r) return fixedItemPage(x, r);
    }
    if (key === "extra") return extraPage(x);
    if (key.startsWith("extra:")) {
      const r = M.extras.find((e) => e.prop === key.slice(6));
      if (r) return extraItemPage(x, r);
    }
    if (key === "month") return thisMonthPage(x, fixed.length);
    if (key.startsWith("budget:")) {
      const b2 = M.budget[Number(key.slice(7))];
      if (b2) return budgetPage(x, b2, days);
    }
    const el = page(label);
    el.addClass("zl-c-stack");
    const now = /* @__PURE__ */ new Date();
    const isNow = sel.year === now.getFullYear() && sel.month === now.getMonth();
    const dim = new Date(sel.year, sel.month + 1, 0).getDate(), daysLeft = dim - now.getDate() + 1;
    const fab = { icon: "plus", text: t("cAddExpense").toUpperCase(), hint: t("today").toUpperCase(), label: t("cAddExpense"), onTap: () => expenseSheet(ctx) };
    const top0 = h(el, "div", "zl-c-group zl-c-top");
    const b = board(top0, "log", blank ? "-" : num(M.remaining));
    dragBoard(top0, b, (d) => step(d), () => true);
    const fmtM = (d) => {
      const m = sel.month + d;
      return MONTHS[(m + 12) % 12];
    };
    const fact = !blank && isNow ? t("cADay", { n: num(Math.max(0, M.remaining) / Math.max(1, daysLeft)) }) : `\u2039 ${fmtM(-1)} \xB7 ${fmtM(1)} \u203A`;
    bigLabel(top0, blank ? t("cNoNotes") : t("cLeftMonth"), fact);
    if (blank) {
      reads(top0, [[t("cMonth"), "log-r1", "-"], [t("saved"), "log-r2", "-"]]);
      return { title: label, el, fab };
    }
    const tq = M.budget.reduce((s2, x2) => s2 + x2.quota, 0), ts = M.budget.reduce((s2, x2) => s2 + x2.spent, 0);
    if (isNow) {
      const todayLog = days.find((d) => d.name === today());
      const spentToday = todayLog ? spentOnDay(todayLog.fm) : 0;
      const perDay = Math.max(0, tq - ts + spentToday) / Math.max(1, daysLeft);
      reads(top0, [[t("cSpentToday"), "log-r1", num(spentToday)], [t("cLeftToday"), "log-r2", num(Math.round(perDay - spentToday))]]);
    } else reads(top0, [[t("cMonth"), "log-r1", t("cClosed")], [t("saved"), "log-r2", num(M.saved)]]);
    if (M.budget.length) {
      const g2 = h(el, "div", "zl-c-group");
      sec(g2, t("cDailyBudget").toUpperCase());
      for (const x2 of M.budget) {
        const over = x2.remain < 0;
        bline(g2, {
          name: x2.item.name,
          spent: x2.spent,
          quota: x2.quota,
          pace: 0,
          hot: over,
          // no pace tick: the words already say what is left
          value: over ? t("cOverBy", { n: num(-x2.remain) }) : num(x2.remain),
          of: over ? t("cOfN", { n: num(x2.quota) }) : t("cLeftOf", { n: num(x2.quota) }),
          onTap: () => ctx.push({ key: "budget:" + x2.index, title: x2.item.name })
        });
      }
    }
    const g = h(el, "div", "zl-c-group");
    sec(g, t("cThisMonth").toUpperCase());
    const gap = M.alloc.gap, open2 = () => ctx.push({ key: "month", title: t("cThisMonth") });
    const ne = M.extras.length;
    figures(g, [
      { icon: "wallet", k: t("cSalaryPlan"), s: gap ? t("cPlanGap", { gap: num(Math.abs(gap)), dir: gap < 0 ? t("cPlanOver") : t("cPlanUnder") }) : t("cPlanAddsUp"), v: gap ? num(Math.abs(gap)) : "", hot: gap !== 0, onTap: open2 },
      { icon: "receipt", k: t("cBillsOneOffs"), s: t(ne === 1 ? "cBillsSub" : "cBillsSubN", { p: M.paidCount, n: fixed.length, e: ne }), v: num(M.fixedTotal + M.extraTotal), onTap: open2 }
    ]);
    return { title: label, el, fab };
  }
};
var del = (o, k, key) => {
  const m = o[k];
  if (m) {
    delete m[key];
    if (!Object.keys(m).length) delete o[k];
  }
};
var thisMonthPage = (x, nFixed) => {
  const { ctx, cur, label, M, inc } = x;
  const { store } = ctx.plugin;
  const el = page(t("cThisMonth"));
  el.addClass("zl-c-list");
  const top = h(el, "div", "zl-c-group");
  const sal = h(top, "button", "zl-read zl-tm-sal");
  h(sal, "span", "zl-read-k", t("cSalaryMonth"));
  const f = new Flap("md", 6);
  sal.appendChild(f.el);
  f.set(num(inc.total));
  sal.addEventListener("click", (e) => {
    e.preventDefault();
    ctx.push({ key: "income", title: t("income") });
  });
  const goalFunds = (Array.isArray(store.fm(store.path(FILES.goals))?.funds) ? store.fm(store.path(FILES.goals)).funds : []).map((g) => String(g.key));
  const lines = [[t("living"), M.alloc.living, null], ...M.savings.map(([k, v]) => [cap2(k), Number(v) || 0, k === "investment" ? "invest" : k === "student_loan" ? "debt" : goalFunds.includes(k) ? "goals" : null])];
  const n = lines.length, shade = (i) => `color-mix(in srgb, var(--zl-text) ${n > 1 ? Math.round(100 - i * 100 / (n - 1)) : 100}%, var(--zl-dim))`;
  const bar = h(top, "div", "zl-tm-bar");
  lines.forEach(([, v], i) => {
    const s2 = h(bar, "span");
    s2.style.flex = String(Math.max(0, v));
    s2.style.background = shade(i);
  });
  const gap = M.alloc.gap;
  const list5 = h(top, "div", "zl-tm-lines");
  lines.forEach(([k, v, owner], i) => {
    const r = h(list5, owner ? "button" : "div", "zl-tm-line");
    const kk = h(r, "span", "zl-tm-k");
    h(kk, "i").style.background = shade(i);
    kk.appendChild(document.createTextNode(k));
    h(r, "strong", gap ? "is-hot" : "", num(v));
    if (owner) r.addEventListener("click", (e) => {
      e.preventDefault();
      ctx.goTab(owner);
    });
  });
  h(top, "p", "zl-c-note" + (gap ? " is-hot" : ""), gap ? t("cPlanCheckOff", { gap: num(Math.abs(gap)), dir: gap < 0 ? t("cPlanOver") : t("cPlanUnder") }) : t("cPlanCheck"));
  if (nFixed) {
    const g = h(el, "div", "zl-c-group");
    sec(g, t("cFixedBills", { p: M.paidCount, n: nFixed }).toUpperCase());
    for (const r of M.fixedRows) {
      const on = r.paid !== 0;
      const row2 = h(g, "div", "zl-tm-bill" + (on ? "" : " is-off"));
      const box = h(row2, "button", "zl-tick" + (on ? " is-on" : ""));
      box.setAttribute("aria-label", r.item.name);
      box.addEventListener("click", (e) => {
        e.preventDefault();
        void setPaid(x, r, !on);
      });
      const nm = h(row2, "button", "zl-tm-bn", r.item.name);
      nm.addEventListener("click", (e) => {
        e.preventDefault();
        ctx.push({ key: "fixed:" + r.prop, title: r.item.name });
      });
      h(row2, "strong", "", num(r.paid || r.def));
    }
  }
  const og = h(el, "div", "zl-c-group");
  sec(og, t("cOneOffs").toUpperCase());
  if (!M.extras.length) h(og, "p", "zl-c-note", t("cNoOneOffs"));
  for (const e of M.extras) {
    const r = h(og, "button", "zl-tm-line");
    const kk = h(r, "span", "zl-tm-k", cap2(e.prop));
    if (e.days.length) h(kk, "span", "zl-tm-d", " " + shortDate(e.days[e.days.length - 1].name));
    h(r, "strong", "", num(e.total));
    r.addEventListener("click", (ev) => {
      ev.preventDefault();
      ctx.push({ key: "extra:" + e.prop, title: cap2(e.prop) });
    });
  }
  const add = () => new FormSheet(ctx.app, {
    title: t("cAddOneOff"),
    subtitle: label,
    submitText: t("save"),
    fields: [{ key: "name", label: t("name"), type: "text", required: true }, { key: "amount", label: t("amount"), type: "number", suffix: cur, required: true }],
    validate: (v) => v.amount === "" || isNaN(parseNum(v.amount)) ? t("invalidNumber") : null,
    onSubmit: async (v) => {
      const k = slug(v.name), amount = parseNum(v.amount);
      if (!await x.writeMonth((f2) => {
        const e = { ...f2.extra_expenses ?? {} };
        e[k] = amount + (Number(e[k]) || 0);
        f2.extra_expenses = e;
      })) return false;
      new import_obsidian24.Notice(t("savedX", { name: v.name.trim(), amount: num(amount), cur }));
    }
  }).open();
  return { title: t("cThisMonth"), el, fab: { icon: "plus", text: t("cAddOneOff").toUpperCase(), label: t("cAddOneOff"), onTap: add } };
};
var incomePage = (x) => {
  const { ctx, cur, label, inc } = x;
  const { store } = ctx.plugin;
  const el = page(t("income"));
  hero(el, { label: t("totalIncome"), value: num(inc.total), unit: cur, color: C.pos });
  if (!inc.rows.length) empty(el, { icon: "arrow-down-to-line", title: t("noIncome") });
  const g = group2(el);
  for (const r of inc.rows) {
    const name = cap2(r.label);
    const write = (val) => x.writeMonth((f) => {
      if (r.kind === "extra") {
        f.extra_income = { ...f.extra_income ?? {}, [r.key]: val };
        return;
      }
      const ov = { ...f.income_override ?? {} };
      if (val === r.base) delete ov[r.key];
      else ov[r.key] = val;
      if (Object.keys(ov).length) f.income_override = ov;
      else delete f.income_override;
    });
    const edit = () => new FormSheet(ctx.app, {
      title: name,
      subtitle: r.kind === "extra" ? label : `${label} \xB7 ${t("thisMonthOnly").toLowerCase()}`,
      submitText: t("save"),
      fields: [{ key: "v", label: t("amount"), type: "number", suffix: cur, value: r.amount }],
      validate: (v) => v.v === "" || isNaN(parseNum(v.v)) ? t("invalidNumber") : null,
      onSubmit: async (v) => {
        if (!await write(parseNum(v.v))) return false;
        new import_obsidian24.Notice(t("savedX", { name, amount: num(parseNum(v.v)), cur }));
      },
      danger: {
        text: r.kind === "extra" ? t("removeIncome") : t("skipMonth"),
        onTap: async () => {
          if (r.kind === "extra") {
            if (!await x.writeMonth((f) => del(f, "extra_income", r.key))) return false;
            new import_obsidian24.Notice(t("removedX", { name }));
          } else {
            if (!await write(0)) return false;
            new import_obsidian24.Notice(t("skippedX", { name, month: label }));
          }
          return true;
        }
      }
    }).open();
    const tag = r.kind === "extra" ? t("oneOff") : r.kind === "bonus" ? t("recurringBonus") : r.overridden ? r.amount === 0 ? t("skipped") : t("thisMonthOnly") : void 0;
    row(g, { title: name, sub: tag, value: num(r.amount), valueColor: r.amount ? C.pos : C.faint, chevron: true, onTap: edit });
  }
  const add = () => new FormSheet(ctx.app, {
    title: t("addIncome"),
    subtitle: label,
    submitText: t("save"),
    fields: [
      { key: "kind", label: t("incomeKind"), type: "tiles", value: "extra", tiles: [
        { value: "extra", title: t("kOneOff"), sub: t("kOneOffSub"), icon: "plus", color: C.pos },
        { value: "bonus", title: t("kBonus"), sub: t("kBonusSub"), icon: "calendar", color: C.pos },
        { value: "base", title: t("kBase"), sub: t("kBaseSub"), icon: "pencil", color: C.accent }
      ] },
      { key: "name", label: t("name"), type: "text", required: true, showIf: (v) => v.kind !== "base" },
      { key: "which", label: t("name"), type: "select", options: inc.rows.filter((r) => r.kind === "base").map((r) => [r.key, cap2(r.label)]), showIf: (v) => v.kind === "base" },
      { key: "bmonth", label: t("whichMonth"), type: "select", value: String(ctx.plugin.logMonth.month + 1), options: MONTHS.map((m, i) => [String(i + 1), m]), showIf: (v) => v.kind === "bonus" },
      { key: "amount", label: t("amount"), type: "number", suffix: cur, required: true }
    ],
    onSubmit: async (v) => {
      const amount = parseNum(v.amount);
      if (v.kind === "extra") {
        const k = slug(v.name);
        if (!await x.writeMonth((f) => {
          const e = { ...f.extra_income ?? {} };
          e[k] = amount + (Number(e[k]) || 0);
          f.extra_income = e;
        })) return false;
        new import_obsidian24.Notice(t("savedX", { name: v.name, amount: num(amount), cur }));
      } else if (v.kind === "bonus") {
        const m = Number(v.bmonth);
        await store.update(store.path(FILES.income), (f) => {
          const list5 = (Array.isArray(f.bonuses) ? f.bonuses : f.bonuses ? [f.bonuses] : []).filter((b) => b && slug(String(b.name)) !== slug(v.name));
          list5.push({ name: v.name.trim(), month: m, amount });
          f.bonuses = list5;
        });
        new import_obsidian24.Notice(t("bonusSaved", { name: v.name.trim(), month: MONTHS[m - 1], amount: num(amount), cur }));
      } else {
        const r = inc.rows.find((y) => y.key === v.which);
        if (!r) return false;
        const cutoff = ctx.plugin.logMonth.year * 12 + ctx.plugin.logMonth.month;
        for (const n of store.monthNotes()) {
          if (n.year * 12 + n.month - 1 >= cutoff || n.fm.income_override?.[r.key] !== void 0) continue;
          await store.update(n.path, (f) => {
            f.income_override = { ...f.income_override ?? {}, [r.key]: r.base };
          });
        }
        await store.update(store.path(FILES.income), (f) => {
          f[r.key] = amount;
        });
        new import_obsidian24.Notice(t("baseChanged", { name: cap2(r.label), from: num(r.base), to: num(amount), cur, month: label }));
      }
    }
  }).open();
  return { title: t("income"), el, fab: { icon: "plus", text: t("addIncome").toUpperCase(), label: t("addIncome"), onTap: add } };
};
var savingsPage = (x) => {
  const { ctx, cur, M } = x;
  const { store } = ctx.plugin;
  const el = page(t("savings"));
  hero(el, { label: t("setAsideMonth"), value: num(M.saved), unit: cur, color: C.info });
  const goalFunds = (Array.isArray(store.fm(store.path(FILES.goals))?.funds) ? store.fm(store.path(FILES.goals)).funds : []).map((f) => String(f.key));
  const g = group2(el);
  row(g, { title: t("living"), sub: t("livingSub"), value: num(M.alloc.living), chevron: false });
  for (const [k, v] of M.savings) {
    const owner = k === "investment" ? "invest" : k === "student_loan" ? "debt" : goalFunds.includes(k) ? "goals" : null;
    row(g, { title: cap2(k), value: num(v), valueColor: C.info, chevron: !!owner, onTap: owner ? () => ctx.goTab(owner) : void 0 });
  }
  const plan = Number(M.savings.find(([k]) => k === "investment")?.[1]) || 0;
  const sel = ctx.plugin.logMonth;
  const buckets = investBuckets(store.fm(store.path(FILES.invest)), plan, `${sel.year}-${String(sel.month + 1).padStart(2, "0")}`);
  if (buckets) {
    const bg = group2(el, t("investThisMonth"));
    for (const b of buckets) {
      const hit2 = b.target > 0 && b.bought >= b.target;
      row(bg, { title: b.label, value: `${num(Math.max(0, b.bought))} / ${num(b.target)}`, valueColor: hit2 ? C.pos : void 0, progress: [b.target > 0 ? Math.max(0, b.bought) / b.target * 100 : 0, C.pos], chevron: true, onTap: () => ctx.goTab("invest") });
    }
  }
  return { title: t("savings"), el };
};
var setPaid = async (x, r, on, amount) => {
  if (!await x.writeMonth((f) => {
    f[r.prop] = on ? amount ?? r.def : 0;
  })) return;
  new import_obsidian24.Notice(on ? t("markedPaid", { name: r.item.name }) : t("markedUnpaid", { name: r.item.name }));
};
var fixedPage = (x) => {
  const { ctx, cur, M } = x;
  const el = page(t("fixedExpenses"));
  hero(el, { label: t("fixedThisMonth"), value: num(M.fixedTotal), unit: cur, color: C.neg, sub: t("paidN", { n: M.paidCount, m: M.fixedRows.length }) });
  const g = group2(el);
  for (const r of M.fixedRows) {
    row(g, {
      check: { on: r.paid !== 0, color: C.pos, onToggle: (on) => {
        void setPaid(x, r, on);
      } },
      title: r.item.name,
      value: num(r.paid || r.def),
      valueColor: r.paid ? C.neg : C.faint,
      chevron: true,
      onTap: () => ctx.push({ key: "fixed:" + r.prop, title: r.item.name })
    });
  }
  return { title: t("fixedExpenses"), el };
};
var fixedItemPage = (x, r) => {
  const { cur } = x;
  const el = page(r.item.name);
  const on = r.paid !== 0;
  hero(el, { label: on ? t("paidThisMonth") : t("notPaid"), value: num(r.paid), unit: cur, color: on ? C.neg : C.faint });
  const g = group2(el);
  row(g, { check: { on, color: C.pos, onToggle: (v) => {
    void setPaid(x, r, v);
  } }, title: t("paidThisMonth"), onTap: () => {
    void setPaid(x, r, !on);
  } });
  row(g, { icon: "pencil", tint: C.accent, title: t("paidAmount"), value: num(r.paid), chevron: true, onTap: () => x.editAmount(t("paidAmount"), r.paid, async (n) => {
    if (!await x.writeMonth((f) => {
      f[r.prop] = n;
    })) return false;
    new import_obsidian24.Notice(t("savedX", { name: r.item.name, amount: num(n), cur }));
  }) });
  row(g, { icon: "pin", tint: C.faint, title: t("defaultAmount"), value: num(r.def) });
  return { title: r.item.name, el };
};
var extraPage = (x) => {
  const { ctx, cur, M } = x;
  const el = page(t("extraExpenses"));
  hero(el, { label: t("extraTotal"), value: num(M.extraTotal), unit: cur, color: C.warn });
  if (!M.extras.length) empty(el, { icon: "sparkles", title: t("noExtra") });
  else {
    const g = group2(el);
    for (const e of M.extras) row(g, { title: cap2(e.prop), sub: e.days.length ? t("daysN", { n: e.days.length }) : void 0, value: num(e.total), valueColor: C.warn, chevron: true, onTap: () => ctx.push({ key: "extra:" + e.prop, title: cap2(e.prop) }) });
  }
  return { title: t("extraExpenses"), el };
};
var extraItemPage = (x, e) => {
  const { ctx, cur } = x;
  const name = cap2(e.prop);
  const el = page(name);
  hero(el, { label: t("extraTotal"), value: num(e.total), unit: cur, color: C.warn });
  if (e.fromMonth > 0) {
    const g = group2(el, t("monthlyEntry"));
    row(g, { icon: "pencil", tint: C.warn, title: t("monthlyEntry"), value: num(e.fromMonth), chevron: true, onTap: () => x.editAmount(t("monthlyEntry"), e.fromMonth, async (n) => {
      if (!await x.writeMonth((f) => {
        f.extra_expenses = { ...f.extra_expenses ?? {}, [e.prop]: n };
      })) return false;
      new import_obsidian24.Notice(t("savedX", { name, amount: num(n), cur }));
    }) });
    row(g, { icon: "trash-2", tint: C.neg, title: t("removeEntry"), titleColor: C.neg, onTap: async () => {
      if (!await confirmSheet(ctx.app, t("removeEntry"), `${name} \xB7 ${num(e.fromMonth)} ${cur}`, t("delete"))) return;
      if (await x.writeMonth((f) => del(f, "extra_expenses", e.prop))) new import_obsidian24.Notice(t("removedX", { name }));
    } });
  }
  if (e.days.length) {
    const g = group2(el, t("days"));
    for (const d of e.days) row(g, { icon: "calendar", tint: C.faint, title: shortDate(d.name), value: num(d.amount), valueColor: C.warn, chevron: true, onTap: () => void ctx.plugin.openDay(d.name) });
  }
  return { title: name, el };
};
var budgetPage = (x, b, days) => {
  const { ctx, cur, label } = x;
  const el = page(b.item.name);
  el.addClass("zl-c-list");
  const sel = ctx.plugin.logMonth, now = /* @__PURE__ */ new Date();
  const isNow = sel.year === now.getFullYear() && sel.month === now.getMonth();
  const dim = new Date(sel.year, sel.month + 1, 0).getDate(), daysLeft = isNow ? dim - now.getDate() + 1 : 0;
  summary(el, {
    key: "budget-" + b.index,
    label: `${b.item.name} \xB7 ${b.remain >= 0 ? t("leftInBudget") : t("overBudget")}`,
    value: num(Math.abs(b.remain)),
    hot: b.level !== "ok",
    items: [[t("cLimit"), num(b.quota)], [t("spent"), num(b.spent)], isNow ? [t("cPerDayLeft"), num(Math.max(0, b.remain) / Math.max(1, daysLeft)), b.remain < 0] : [t("used"), `${b.quota > 0 ? Math.round(b.spent / b.quota * 100) : 0}%`]]
  });
  const bar = h(el, "div", "zl-c-group");
  sec(bar, (isNow ? t("cVsPace") : t("spent")).toUpperCase());
  budgetBar(bar, b.spent, b.quota, isNow ? now.getDate() / dim : 0, 30, 10, 18);
  const lim = h(el, "div", "zl-c-group");
  const pct2 = b.item.quota;
  const setLimit = () => x.editAmount(
    t("cLimitOf", { name: b.item.name }),
    b.quota,
    async (n) => {
      if (!await x.writeMonth((f) => {
        f[b.quotaKey] = n;
      })) return false;
      new import_obsidian24.Notice(t("savedX", { name: b.item.name, amount: num(n), cur }));
    },
    false,
    t("cLimitNote", { name: b.item.name, month: label, pct: pct2 })
  );
  figures(lim, [
    {
      icon: "wallet",
      k: t("cLimit").toUpperCase(),
      s: b.isPercent ? t("cLimitPct", { pct: pct2 }) : t("cLimitFixed", { pct: pct2 }),
      v: num(b.quota),
      onTap: setLimit,
      scrub: () => ({ value: b.quota, step: notchFor(cur) * 10, label: t("cLimit"), fmt: num, done: (n) => {
        void x.writeMonth((f) => {
          f[b.quotaKey] = n;
        }).then((ok) => {
          if (ok) new import_obsidian24.Notice(t("savedX", { name: b.item.name, amount: num(n), cur }));
        });
      } })
    },
    ...!b.isPercent ? [{ icon: "back", k: t("backToPct", { pct: pct2 }).toUpperCase(), s: t("cLimitBack"), v: `${pct2}%`, onTap: async () => {
      if (await x.writeMonth((f) => {
        delete f[b.quotaKey];
      })) new import_obsidian24.Notice(t("savedX", { name: b.item.name, amount: `${pct2}%`, cur: "" }));
    } }] : []
  ]);
  const rows = days.map((d) => ({ d, items: b.item.spending.map((p) => [p, Number(d.fm[p]) || 0]).filter(([, v]) => v > 0) })).filter((r) => r.items.length).sort((p, q) => q.d.name.localeCompare(p.d.name));
  const dg = h(el, "div", "zl-c-group");
  sec(dg, t("days").toUpperCase());
  if (rows.length) figures(dg, rows.map(({ d, items: items2 }) => ({ icon: "log", k: shortDate(d.name).toUpperCase(), s: items2.map(([k, v]) => `${cap2(k)} ${num(v)}`).join(" \xB7 "), v: num(items2.reduce((s2, [, v]) => s2 + v, 0)), onTap: () => void ctx.plugin.openDay(d.name) })));
  else figures(dg, [{ icon: "log", k: t("nothingSpent").toUpperCase(), v: "0", dim: true }]);
  return { title: b.item.name, el };
};

// src/pages/index.ts
var PAGES = {
  debt: debtPage,
  invest: investPage,
  log: logPage,
  ledger: ledgerPage,
  goals: goalsPage
};

// src/view.ts
var VIEW_TYPE = "ledgerline";
var LedgerView = class extends import_obsidian25.ItemView {
  // key of the page on screen
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.cache = /* @__PURE__ */ new Map();
    this.tokens = /* @__PURE__ */ new Map();
    this.shown = "";
    // Design Rules, moving between pages (round 3): no cover over the page. The old page goes at once; the new page's groups
    // come in one after another with a short move (deeper: from the right, Back: from the left, tab: up) and a fade, about 0.3 s
    // in all. Applied when the page mounts (also when the fresh page replaces the skeleton a moment later).
    this.scrollSaved = false;
    // the page being left already gave its scroll position
    this.enter = null;
    this.enterT = 0;
    this.slideT = 0;
    this.firstShown = false;
  }
  getViewType() {
    return VIEW_TYPE;
  }
  getDisplayText() {
    return t("appName");
  }
  getIcon() {
    return "wallet";
  }
  get router() {
    return this.plugin.router;
  }
  key(tab = this.router.tab, f = this.router.top(tab)) {
    return `${tab}/${f.key}`;
  }
  async onOpen() {
    const c = this.contentEl;
    c.empty();
    c.addClass("zl-host");
    this.appEl = h(c, "div", "zl-app");
    this.setFull();
    this.topEl = h(this.appEl, "div", "zl-top");
    this.backEl = h(this.topEl, "button", "zl-btn zl-back");
    sprite(this.backEl, "back");
    this.backEl.setAttribute("aria-label", t("back"));
    this.backEl.addEventListener("click", (e) => {
      e.preventDefault();
      this.back();
    });
    this.topTitleEl = h(this.topEl, "div", "zl-top-title");
    this.actsEl = h(this.topEl, "div", "zl-acts");
    this.scrollEl = h(this.appEl, "div", "zl-scroll");
    this.registerDomEvent(this.scrollEl, "scroll", () => this.topEl.toggleClass("is-scrolled", this.scrollEl.scrollTop > 36), { passive: true });
    this.fabEl = h(this.appEl, "div", "zl-fab");
    this.tabsEl = h(this.appEl, "div", "zl-tabs");
    const ro = new ResizeObserver(() => this.placeDock());
    ro.observe(this.scrollEl);
    this.register(() => ro.disconnect());
    this.registerDomEvent(this.appEl, "dblclick", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    for (const t2 of ["touchstart", "touchmove", "touchend"]) this.registerDomEvent(this.appEl, t2, (e) => {
      if (this.appEl.hasClass("is-still")) e.stopPropagation();
    }, { passive: true });
    this.buildTabs();
    this.plugin.debug.note(`view open, tab ${this.router.tab}`);
    this.draw();
    window.setTimeout(() => this.logLayout(), 1e3);
    let turnT = 0;
    if (import_obsidian25.Platform.isMobile) this.registerDomEvent(window, "resize", () => {
      window.clearTimeout(turnT);
      turnT = window.setTimeout(() => {
        this.placeDock();
        this.logLayout();
      }, 1200);
    });
  }
  // Debug: where the screen and each wrapper around it start, and the spacing they add (for layout gaps on phones)
  logLayout() {
    const lines = [`layout: window ${window.innerWidth}x${window.innerHeight}, body ${document.body.className.split(" ").filter((c) => /mobile|phone|ios|floating|zl-|ze-/.test(c)).join(" ")}`];
    for (let el = this.topEl; el && el !== document.documentElement; el = el.parentElement) {
      const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
      lines.push(`  ${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 4).join(".")} top ${Math.round(r.top)} h ${Math.round(r.height)} pad-top ${cs.paddingTop} margin-top ${cs.marginTop} pos ${cs.position}${cs.transform !== "none" ? " transform " + cs.transform : ""}`);
    }
    const tr = this.topEl.getBoundingClientRect(), tt = this.scrollEl.querySelector(".zl-title")?.getBoundingClientRect();
    lines.push(`  top bar ${Math.round(tr.top)}-${Math.round(tr.bottom)}, large title at ${tt ? Math.round(tt.top) : "-"}, tabs at ${Math.round(this.tabsEl.getBoundingClientRect().top)}`);
    const probe = h(document.body, "div");
    probe.style.cssText = "position:fixed;visibility:hidden;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)";
    const ps = getComputedStyle(probe), ins = `safe l ${ps.paddingLeft} r ${ps.paddingRight} b ${ps.paddingBottom}`;
    probe.remove();
    const box = (el) => {
      if (!el) return "-";
      const b = el.getBoundingClientRect();
      return `${Math.round(b.left)}..${Math.round(b.right)} y ${Math.round(b.top)}..${Math.round(b.bottom)}`;
    };
    const as = getComputedStyle(this.appEl);
    lines.push(`  across: ${ins}; app ${box(this.appEl)} pad-l ${as.paddingLeft} app-x ${as.getPropertyValue("--zl-app-x")}; left col ${box(this.scrollEl.querySelector(".zl-page > .zl-c-top"))}; dock ${box(this.fabEl)}; tabs ${box(this.tabsEl)}`);
    for (let el = this.appEl.parentElement; el && el !== document.documentElement; el = el.parentElement) {
      const cs = getComputedStyle(el);
      if (cs.paddingLeft !== "0px" || cs.marginLeft !== "0px") lines.push(`  ${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 3).join(".")} pad-l ${cs.paddingLeft} margin-l ${cs.marginLeft}`);
    }
    this.plugin.debug.note(lines.join("\n"));
    void this.plugin.debug.flush();
  }
  async onClose() {
    this.cache.clear();
    this.plugin.debug.note("view closed");
  }
  // Phone full screen is a property of the screen itself (set when it is built), not of which tab Obsidian says is active:
  // that news arrives a moment after the screen shows, and the layout jumped in between.
  setFull() {
    this.appEl.toggleClass("is-full", import_obsidian25.Platform.isMobile && this.plugin.settings.fullScreen);
  }
  // ---- capture for Vellum (capture.ts): the page on screen as named parts, and where it sits in the screen map
  shot() {
    const tab = this.router.tab, stack = this.router.stack(tab), f = this.router.top(tab);
    const idOf = (fr) => fr && fr.key !== "root" ? `${tab}-${fr.key.split(":")[0].replace(/[^a-z0-9-]+/gi, "-")}` : tab;
    let pageEl = this.scrollEl.firstElementChild;
    while (pageEl && pageEl.children.length === 1) pageEl = pageEl.firstElementChild;
    const nameOf = (el) => (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 24) || ([...el.classList].find((c) => c.startsWith("zl-")) ?? "section").replace(/^zl-/, "");
    const kindOf = (el) => el.querySelector("canvas, svg.zl-chart, .zl-fchart") ? "card" : el.querySelector(".zl-flap, .zl-board") ? "hero" : el.querySelector("button, input") && !el.querySelector(".zl-row") ? "action" : "list";
    const parts = [["Top bar", "nav", this.topEl]];
    for (const c of Array.from(pageEl?.children ?? [])) parts.push([nameOf(c), kindOf(c), c]);
    parts.push(["Dock", "action", this.fabEl], ["Tab bar", "nav", this.tabsEl]);
    const below = stack.length > 1 ? stack[stack.length - 2] : void 0;
    return { appEl: this.appEl, parts, id: idOf(f), name: f.key === "root" ? t(PAGES[tab].label) : f.title || f.key, parent: f.key === "root" ? void 0 : idOf(below) };
  }
  // every enabled tab's first page in turn (for capture): calls back once each page has drawn and settled
  async eachTab(cb) {
    for (const id of this.plugin.enabledTabs()) {
      this.go(id);
      await new Promise((r) => window.setTimeout(r, 2500));
      await cb();
    }
  }
  // ---- tab bar
  buildTabs() {
    this.router.fix();
    this.tabsEl.empty();
    const on = this.plugin.enabledTabs();
    this.tabsEl.style.setProperty("--n", String(on.length));
    for (const id of on) {
      const def = PAGES[id];
      const b = h(this.tabsEl, "button", "zl-tab" + (id === this.router.tab ? " is-on" : ""));
      b.dataset.tab = id;
      sprite(b, id);
      h(b, "span", "zl-tab-l", t(def.label));
      b.addEventListener("click", (e) => {
        e.preventDefault();
        this.tapTab(id);
      });
    }
  }
  markTab() {
    this.tabsEl.querySelectorAll(".zl-tab").forEach((b) => b.toggleClass("is-on", b.dataset.tab === this.router.tab));
  }
  // Open a tab (on its first page, or with one page on top), e.g. from a daily note
  go(tab, f) {
    const kind = tab !== this.router.tab ? "tab" : f ? "push" : "pop";
    this.router.setTab(tab);
    this.router.popToRoot();
    if (f) this.router.push(f);
    this.markTab();
    this.move(kind, () => this.draw());
  }
  tapTab(id) {
    this.plugin.debug.note(`tab tap ${id} (on ${this.router.tab}, depth ${this.router.depth()})`);
    if (id === this.router.tab) {
      if (this.router.popToRoot()) this.move("pop", () => this.draw());
      else this.scrollEl.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    this.router.setTab(id);
    this.markTab();
    this.move("tab", () => this.draw());
  }
  move(kind, swap) {
    const prev = this.cache.get(this.shown);
    if (prev) prev.scroll = this.scrollEl.scrollTop;
    this.scrollSaved = true;
    this.enter = calm() ? null : kind;
    window.clearTimeout(this.enterT);
    this.enterT = window.setTimeout(() => {
      this.enter = null;
    }, 300);
    const ghost = kind !== "tab" && !calm() && document.body.dataset.zlMove !== "cascade" ? this.ghostOf() : null;
    swap();
    if (!ghost) return;
    const s2 = this.scrollEl;
    this.appEl.appendChild(ghost);
    s2.removeClass("is-push", "is-pop");
    void s2.offsetWidth;
    ghost.addClass(kind === "push" ? "is-under" : "is-over");
    s2.addClass(kind === "push" ? "is-push" : "is-pop");
    window.clearTimeout(this.slideT);
    this.slideT = window.setTimeout(() => {
      s2.removeClass("is-push", "is-pop");
      this.appEl.querySelectorAll(".zl-ghost").forEach((g) => g.remove());
    }, 340);
  }
  ghostOf() {
    const s2 = this.scrollEl, pg = s2.firstElementChild;
    if (!pg) return null;
    this.appEl.querySelectorAll(".zl-ghost").forEach((g2) => g2.remove());
    const g = document.createElement("div");
    g.className = "zl-ghost";
    const cs = getComputedStyle(s2);
    Object.assign(g.style, { top: `${s2.offsetTop}px`, left: `${s2.offsetLeft}px`, width: `${s2.offsetWidth}px`, height: `${s2.offsetHeight}px`, right: "auto", padding: cs.padding, boxSizing: cs.boxSizing });
    const c = pg.cloneNode(true);
    c.removeClass("zl-enter");
    c.style.transform = `translateY(${-s2.scrollTop}px)`;
    g.appendChild(c);
    return g;
  }
  animateIn(el) {
    if (!this.enter) return;
    el.dataset.enter = this.enter;
    let i = 0;
    for (const c of Array.from(el.children)) {
      if (c.hasClass("zl-title-row")) continue;
      c.style.setProperty("--e", String(Math.min(i++, 6)));
    }
    el.removeClass("zl-enter");
    void el.offsetWidth;
    el.addClass("zl-enter");
    if (this.enter === "tab") el.querySelectorAll(".zl-board").forEach((b) => b.dispatchEvent(new Event("zl-replay")));
    el.querySelectorAll(".zl-flap").forEach((f) => {
      if (!(this.enter === "tab" && f.closest(".zl-board"))) f.dispatchEvent(new Event("zl-flap-replay"));
    });
  }
  openSettings() {
    const s2 = this.app.setting;
    if (!s2) return;
    s2.open();
    s2.openTabById(this.plugin.manifest.id);
  }
  // ---- page stack
  push(f) {
    this.plugin.debug.note(`push ${this.router.tab}/${f.key}`);
    if (this.router.push(f)) this.move("push", () => this.draw());
  }
  replace(f) {
    this.plugin.debug.note(`replace ${this.router.tab}/${f.key}`);
    if (this.router.replace(f)) this.draw();
  }
  back() {
    this.plugin.debug.note(`back on ${this.key()}`);
    if (this.router.pop()) this.move("pop", () => this.draw());
  }
  // ---- drawing
  // Synchronous: what is on screen changes in this task (cached page or skeleton); a fresh page follows when needed.
  draw() {
    const key = this.key();
    const hit2 = this.cache.get(key);
    if (hit2) this.mount(key, hit2, true);
    else this.mountSkeleton(key);
    if (!hit2 || hit2.stale) void this.render(key);
  }
  // Data changed (a config or log note): every cached page is out of date; the one on screen is redrawn in place.
  dataChanged() {
    this.cache.forEach((e) => {
      e.stale = true;
    });
    this.plugin.debug.note(`data changed, redraw ${this.key()}`);
    void this.render(this.key());
  }
  // A background quote moved while its market trades: Invest pages redraw so every total and percent follows (rows stay
  // still, only changed numbers flip); chart and holding pages change in place (their quote listeners)
  // opening: the market just opened (or closed: false) — a normal redraw; true at the open also sweeps the board once
  // (the opening bell); undefined = a price update: the live tick (Design Rules › Motion › Live tick)
  pricesMoved(opening) {
    const k = this.key();
    if (this.scrollEl.querySelector(".zl-qrows.is-reorder, .zl-touching")) {
      this.cache.forEach((e) => {
        e.stale = true;
      });
      return;
    }
    if (!/^invest\/(root|holdings|watch)$/.test(k)) {
      if (k.startsWith("invest")) this.cache.forEach((e) => {
        e.stale = true;
      });
      return;
    }
    this.cache.forEach((e) => {
      e.stale = true;
    });
    liveTick(opening === void 0);
    void this.render(k).finally(() => {
      liveTick(false);
      if (opening && this.key() === k) this.scrollEl.querySelectorAll(".zl-board").forEach((b) => b.dispatchEvent(new Event("zl-replay")));
    });
  }
  // Settings changed: tabs may differ and every page may look different.
  settingsChanged() {
    this.setFull();
    this.cache.clear();
    this.buildTabs();
    this.draw();
  }
  async render(key) {
    const [tab, ...rest] = key.split("/");
    const frame = this.router.stack(tab).find((f) => f.key === rest.join("/")) ?? { key: "root", title: "" };
    const mine = (this.tokens.get(key) ?? 0) + 1;
    this.tokens.set(key, mine);
    let out;
    try {
      const ctx = {
        app: this.app,
        plugin: this.plugin,
        frame,
        push: (f) => this.push(f),
        replace: (f) => this.replace(f),
        pop: () => this.back(),
        redraw: () => {
          void this.render(this.key());
        },
        goTab: (id) => {
          this.router.popToRoot();
          if (id !== this.router.tab) this.tapTab(id);
          else this.draw();
        },
        openNote: (path) => {
          void this.plugin.openPath(path);
        }
      };
      out = frame.key.startsWith("pad:") ? padPage(ctx) : await PAGES[tab].render(ctx);
    } catch (e) {
      this.plugin.debug.error(`render ${key}`, e);
      out = this.errorPage(e, key);
    }
    if (this.tokens.get(key) !== mine) return;
    const old = this.cache.get(key);
    const entry = { out, scroll: old?.scroll ?? 0, stale: false };
    this.cache.set(key, entry);
    if (this.key() === key) this.mount(key, entry, false);
  }
  mount(key, e, restoreScroll) {
    const prev = this.cache.get(this.shown);
    if (prev && this.shown !== key && !this.scrollSaved) prev.scroll = this.scrollEl.scrollTop;
    this.scrollSaved = false;
    const same = this.shown === key;
    const keep2 = this.scrollEl.scrollTop;
    if (same) {
      const sig = (r) => `${Array.from(r.classList).filter((c) => c !== "zl-in" && c !== "zl-kept").join(" ")}|${r.dataset.k ?? r.querySelector(".zl-fig-k")?.textContent ?? r.textContent}`;
      const had = new Set(Array.from(this.scrollEl.querySelectorAll(".zl-in, .zl-kept"), sig));
      if (had.size) e.out.el.querySelectorAll(".zl-in").forEach((r) => {
        if (had.has(sig(r))) {
          r.removeClass("zl-in");
          r.addClass("zl-kept");
        }
      });
    }
    e.out.el.dataset.page = key;
    e.out.el.toggleClass("zl-invest", this.router.tab === "invest");
    this.scrollEl.replaceChildren(e.out.el);
    this.animateIn(e.out.el);
    this.scrollEl.toggleClass("is-fit", e.out.el.hasClass("zl-c-stack"));
    this.appEl.toggleClass("is-still", !!e.out.still);
    this.shown = key;
    this.scrollEl.scrollTop = same && !restoreScroll ? keep2 : e.scroll;
    this.topEl.toggleClass("is-scrolled", this.scrollEl.scrollTop > 36);
    const acts = e.out.actions ?? [];
    this.setBar(e.out.title, acts.filter((a) => !a.dock), e.out.badge);
    this.setFab(e.out.fab, acts.filter((a) => a.dock));
    if (e.out.el.hasClass("zl-c-stack")) window.requestAnimationFrame(() => this.fit(e.out.el, key, e.out.trim));
    else {
      const el = e.out.el;
      el.removeClass("is-short");
      window.requestAnimationFrame(() => {
        if (el.isConnected && el.scrollHeight < this.scrollEl.clientHeight * 0.7) el.addClass("is-short");
      });
    }
    if (!this.firstShown) {
      this.firstShown = true;
      this.plugin.debug.note(`first page shown ${key}`);
    }
  }
  // A one-screen page must never scroll (Design Rules, Room). Phones differ by a few px, so after it is drawn: if it is taller
  // than the room, tighten its spacing one step at a time (gaps, then row padding) until it fits; only past the last step does
  // it scroll. The step is kept on the page, so a redraw starts from it.
  fit(el, key, trim) {
    const s2 = this.scrollEl;
    if (!el.isConnected) return;
    const over = () => el.scrollHeight - s2.clientHeight;
    for (const step of ["", "is-tight", "is-tighter"]) {
      if (step) el.addClass(step);
      if (over() <= 0) break;
    }
    for (let i = 0; i < 20 && over() > 0 && trim?.(); i++) {
    }
    s2.toggleClass("is-fit", over() <= 0);
    s2.scrollTop = 0;
    this.plugin.debug.note(`fit ${key}: content ${el.scrollHeight} / room ${s2.clientHeight}${el.hasClass("is-tighter") ? " (tighter)" : el.hasClass("is-tight") ? " (tight)" : ""}`);
  }
  mountSkeleton(key) {
    const prev = this.cache.get(this.shown);
    if (prev && this.shown !== key && !this.scrollSaved) prev.scroll = this.scrollEl.scrollTop;
    this.scrollSaved = false;
    const f = this.router.top();
    const def = PAGES[this.router.tab];
    const title = f.key === "root" ? t(def.label) : f.title;
    this.scrollEl.replaceChildren(skeleton(title));
    this.shown = key;
    this.scrollEl.scrollTop = 0;
    this.topEl.removeClass("is-scrolled");
    this.setBar(title, []);
  }
  // the bottom bar: Back on deeper pages (to the page below), the page's action beside it
  setFab(a, side = []) {
    const depth = this.router.depth(), st = this.router.stack();
    const below = depth > 1 ? st[st.length - 2] : depth === 1 ? { key: "root", title: "" } : void 0;
    const to = below ? below.key === "root" ? t(PAGES[this.router.tab].label) : below.title : "";
    dock(this.fabEl, {
      back: depth > 0 ? { to: `${t("back")} \xB7 ${to}`, onTap: () => this.back() } : void 0,
      act: a ? { text: a.text ?? a.label, label: a.label, hint: a.hint, loud: a.loud, onTap: () => {
        this.plugin.debug.note(`dock ${a.label}`);
        a.onTap();
      } } : void 0,
      side: side.map((s2) => ({ icon: s2.icon ?? "coin", label: s2.label, onTap: () => {
        this.plugin.debug.note(`dock ${s2.label}`);
        s2.onTap();
      } }))
    });
    this.appEl.toggleClass("has-fab", this.fabEl.hasClass("is-on"));
    window.requestAnimationFrame(() => this.placeDock());
  }
  // the left column's edges, measured (its width depends on the page, the notch side and the rail)
  placeDock() {
    const a = this.appEl.getBoundingClientRect();
    this.appEl.style.setProperty("--zl-app-x", `${Math.max(0, Math.round(a.left))}px`);
    const col = this.scrollEl.querySelector(".zl-page > .zl-c-top") ?? this.scrollEl.querySelector(".zl-page.zl-c-list > .zl-title-row + .zl-c-group");
    if (!col) return;
    const r = col.getBoundingClientRect();
    if (!r.width) return;
    this.appEl.style.setProperty("--zl-dock-x", `${Math.round(r.left - a.left)}px`);
    this.appEl.style.setProperty("--zl-dock-w", `${Math.round(r.width)}px`);
  }
  setBar(title, actions, badge) {
    titleText(this.topTitleEl, title);
    if (badge) h(this.topTitleEl, "span", "zl-live" + (badge.live ? " is-on" : ""), badge.text);
    this.topEl.toggleClass("has-back", this.router.depth() > 0);
    const first2 = this.router.depth() === 0;
    this.appEl.addClass("has-bar");
    this.topEl.toggleClass("is-first", first2);
    const fill2 = (host) => {
      host.empty();
      for (const a of actions) {
        const b = h(host, "button", a.text && !a.icon ? "zl-btn is-text" : "zl-btn");
        b.setAttribute("aria-label", a.label);
        if (a.icon) {
          if (hasSprite(a.icon)) sprite(b, a.icon);
          else icon(b, a.icon);
        }
        if (a.text) h(b, "span", "", a.text);
        b.addEventListener("click", (ev) => {
          ev.preventDefault();
          this.plugin.debug.note(`action ${a.label}`);
          a.onTap();
        });
      }
      if (first2 && this.router.tab === "log") {
        const g = h(host, "button", "zl-btn zl-gear");
        g.setAttribute("aria-label", t("settings"));
        sprite(g, "settings");
        g.addEventListener("click", (ev) => {
          ev.preventDefault();
          this.openSettings();
        });
      }
    };
    fill2(this.actsEl);
  }
  errorPage(e, key) {
    const el = h(null, "div", "zl-page");
    const box = h(el, "div", "zl-empty");
    icon(box, "alert-triangle", "zl-empty-ic");
    h(box, "div", "zl-empty-t", t("pageFailed"));
    h(box, "div", "zl-empty-s", String(e instanceof Error ? e.message : e).slice(0, 200));
    const retry = h(box, "button", "zl-btn", t("retry"));
    retry.addEventListener("click", () => {
      void this.render(key);
    });
    return { title: t("pageFailed"), el };
  }
};

// src/capture.ts
var import_obsidian26 = require("obsidian");
var SCREENS = "Docs/Design/Screens";
var DEVICES = [["iphone-12-pro-max", 428, 926], ["iphone-16-pro-max", 440, 956], ["iphone-16-pro", 402, 874], ["iphone-16", 393, 852], ["iphone-14", 390, 844], ["iphone-12-mini", 375, 812], ["iphone-se", 375, 667]];
var TOP3 = 47;
var mask = (s2) => {
  let i = 0;
  return s2.replace(/\b20\d\d\b|\d/g, (d) => d.length > 1 ? d : String((Number(d) * 7 + 3 + i++) % 10));
};
var r1 = (v) => Math.round(v * 10) / 10;
var rgb = (c) => {
  const m = /rgba?\(([^)]+)\)/.exec(c);
  if (!m) return null;
  const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
  return p.length >= 3 && (p[3] ?? 1) > 0.02 ? p : null;
};
var hex = (p) => "#" + p.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, "0")).join("") + (p[3] !== void 0 && p[3] < 1 ? Math.round(p[3] * 255).toString(16).padStart(2, "0") : "");
function palette(app, host) {
  const out = [];
  let colors = {};
  try {
    colors = app.plugins.plugins.vellum?.settings?.colors ?? {};
  } catch {
  }
  const probe = host.createDiv();
  probe.style.display = "none";
  for (const [name, css] of Object.entries(colors)) {
    probe.style.color = "";
    probe.style.color = css;
    const p = rgb(getComputedStyle(probe).color);
    if (p) out.push([name, p]);
  }
  probe.remove();
  return out;
}
var named = (pal, p) => {
  let best = "", d = 1e9;
  for (const [n, q] of pal) {
    const e = Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) + Math.abs(p[2] - q[2]);
    if (e < d) {
      d = e;
      best = n;
    }
  }
  return d <= 12 && (p[3] ?? 1) >= 0.98 ? best : hex(p);
};
function block(el, name, kind, origin, k, pal, view) {
  const br = el.getBoundingClientRect();
  if (br.width < 2 || br.height < 2 || br.bottom < view.top || br.top > view.bottom) return null;
  const bx = br.left, by = Math.max(br.top, view.top), items2 = [], shapes = [];
  const at = (r) => ({ g: "tl", dx: Math.round((r.left - bx) * k), dy: Math.round((r.top - by) * k) });
  const walk = (n) => {
    const cs = getComputedStyle(n);
    if (cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) < 0.05) return;
    const r = n.getBoundingClientRect();
    if (r.width < 1 || r.height < 1 || r.bottom < view.top || r.top > view.bottom) return;
    if (n.classList.contains("zl-tab")) return;
    const side = (s2) => {
      const w = parseFloat(cs.getPropertyValue(`border-${s2.toLowerCase()}-width`)) || 0;
      const c = w ? rgb(cs.getPropertyValue(`border-${s2.toLowerCase()}-color`)) : null;
      return c ? { w, c } : null;
    };
    const sides = { Top: side("Top"), Right: side("Right"), Bottom: side("Bottom"), Left: side("Left") };
    const all4 = sides.Top && sides.Right && sides.Bottom && sides.Left && [sides.Right, sides.Bottom, sides.Left].every((x) => x.w === sides.Top.w && x.c.join() === sides.Top.c.join());
    if (!all4) for (const [nm, b] of Object.entries(sides)) {
      if (!b) continue;
      const hz = nm === "Top" || nm === "Bottom";
      const lr = new DOMRect(nm === "Right" ? r.right - b.w : r.left, nm === "Bottom" ? r.bottom - b.w : r.top, hz ? r.width : b.w, hz ? b.w : r.height);
      shapes.push({ type: "rect", ...at(lr), w: Math.max(1, Math.round(lr.width * k)), h: Math.max(1, Math.round(lr.height * k)), fill: named(pal, b.c) });
    }
    const fill2 = rgb(cs.backgroundColor), sw = all4 ? sides.Top.w : 0, stroke = all4 ? sides.Top.c : null;
    const drawn = n instanceof SVGElement || n.tagName === "CANVAS" || n.tagName === "IMG";
    const px = n instanceof SVGElement ? n.dataset.px : void 0;
    if (px && n !== el) {
      const flip = /^matrix\(-/.test(cs.transform), col = rgb(cs.color);
      items2.push({ type: "icon", ...at(r), name: `zlpx-${px === "back" && flip ? "go" : px}`, size: Math.round(Math.max(r.width, r.height) * k), color: col ? named(pal, col) : "text" });
      return;
    }
    if (n !== el && (fill2 || stroke || drawn) && r.width * k >= 2 && r.height * k >= 1) {
      const s2 = { type: "rect", ...at(r), w: Math.round(r.width * k), h: Math.round(r.height * k) };
      if (fill2) s2.fill = named(pal, fill2);
      if (stroke) {
        s2.stroke = named(pal, stroke);
        s2.sw = r1(sw * k);
      }
      const big = r.width * k >= 60 && r.height * k >= 40;
      const what = !big ? "icon" : n.closest("[class*='board'], [class*='flip'], [class*='dot']") ? "board" : "chart";
      if (drawn && !fill2 && !stroke) {
        if (big) {
          s2.stroke = "dim";
          s2.sw = 1;
          s2.op = 60;
        } else {
          s2.fill = "dim";
          s2.op = 30;
          s2.r = 2;
        }
        s2.note = what;
      }
      const rad = parseFloat(cs.borderTopLeftRadius) || 0;
      if (rad) s2.r = Math.round(Math.min(rad, r.height / 2, r.width / 2) * k);
      shapes.push(s2);
      if (drawn && big) items2.push({ type: "text", v: what.toUpperCase(), g: "tl", dx: Math.round((r.left - bx + r.width / 2) * k) - 24, dy: Math.round((r.top - by + r.height / 2) * k) - 8, size: 12, wt: 600, ls: 0.1, color: "dim" });
    }
    if (drawn) return;
    const own = Array.from(n.childNodes).filter((c) => c.nodeType === 3).map((c) => c.textContent ?? "").join("").replace(/\s+/g, " ").trim();
    if (own) {
      const size = parseFloat(cs.fontSize) * k, col = rgb(cs.color);
      const t2 = { type: "text", v: mask(cs.textTransform === "uppercase" ? own.toUpperCase() : own), ...at(r), size: r1(size) };
      const wt = Number(cs.fontWeight);
      if (wt && wt !== 400) t2.wt = wt;
      if (/anton/i.test(cs.fontFamily)) t2.font = "display";
      if (col) {
        const c = named(pal, col);
        if (c !== "text") t2.color = c;
      }
      const ls = parseFloat(cs.letterSpacing);
      if (ls) t2.ls = r1(ls / parseFloat(cs.fontSize) * 100) / 100;
      const lh = parseFloat(cs.lineHeight);
      if (lh) t2.lh = r1(lh / parseFloat(cs.fontSize));
      items2.push(t2);
    }
    for (const c of Array.from(n.children)) walk(c);
  };
  walk(el);
  const tabs = Array.from(el.querySelectorAll(":scope > .zl-tab"));
  let row2 = null;
  if (tabs.length) {
    const tr = tabs[0].getBoundingClientRect(), down = tabs.length > 1 && tabs[1].getBoundingClientRect().top > tr.bottom - 1;
    const last = tabs[tabs.length - 1].getBoundingClientRect();
    row2 = { id: "tabs", type: down ? "col" : "row", ...at(tr), w: Math.round((down ? tr.width : br.width) * k), h: Math.round((down ? last.bottom - tr.top : tr.height) * k), items: tabs.map((b) => {
      const tab = b.dataset.tab ?? "tab", ic = b.querySelector("svg"), lb = b.querySelector(".zl-tab-l");
      const ir = ic?.getBoundingClientRect(), icol = ic ? rgb(getComputedStyle(ic).color) : null, lcol = lb ? rgb(getComputedStyle(lb).color) : null;
      const col = [];
      if (ic && ir) col.push({ id: `tab-${tab}-ic`, type: "icon", name: `zlpx-${ic.dataset.px ?? tab}`, size: Math.round(ir.width * k), color: icol ? named(pal, icol) : "dim" });
      if (lb) col.push({ id: `tab-${tab}-l`, type: "text", v: (lb.textContent ?? "").toUpperCase(), size: r1(parseFloat(getComputedStyle(lb).fontSize) * k), color: lcol ? named(pal, lcol) : "dim" });
      const bb = b.getBoundingClientRect();
      return { id: `tab-${tab}`, type: "col", w: r1(bb.width * k), h: r1(bb.height * k), main: "center", cross: "center", gap: r1((parseFloat(getComputedStyle(b).rowGap) || 0) * k), items: col };
    }) };
  }
  const all = [...shapes, ...items2].slice(0, 160);
  all.forEach((it, i) => {
    it.id = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 6) || "b"}${i}`;
  });
  if (row2) all.push(row2);
  const ef = rgb(getComputedStyle(el).backgroundColor);
  if (ef) all.unshift({ id: "bg" + Math.round(by), type: "rect", g: "tl", dx: 0, dy: 0, w: "fill", h: "fill", fill: named(pal, ef) });
  return { id: (name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "b") + "-" + Math.round(by), name, kind, x: Math.round((bx - origin.x) * k), y: Math.round((by - origin.y) * k), w: Math.round(br.width * k), h: Math.round((Math.min(br.bottom, view.bottom) - by) * k), items: all };
}
var pageText = (p) => {
  const { blocks: blocks2, land, ...meta } = p;
  const list5 = (l) => l.length ? "[\n" + l.map((b) => "  " + JSON.stringify(b)).join(",\n") + "\n]" : "[]";
  return `${JSON.stringify(meta).slice(0, -1)}, "blocks": ${list5(blocks2)}` + (land ? `, "land": ${list5(land)}` : "") + "}\n";
};
var fileName = (name) => name.replace(/[\\/:*?"<>|#^[\]]/g, "-").replace(/\s+/g, " ").trim().slice(0, 80) || "Screen";
async function capture(app, shot) {
  for (const a of shot.appEl.getAnimations({ subtree: true })) {
    try {
      a.finish();
    } catch {
    }
  }
  const ar = shot.appEl.getBoundingClientRect();
  if (ar.width < 1) {
    new import_obsidian26.Notice("Capture: the Ledgerline pane is not on screen.");
    return null;
  }
  if (!import_obsidian26.Platform.isMobile && (ar.width < 340 || ar.width > 480)) {
    new import_obsidian26.Notice(`Capture: make the Ledgerline pane about a phone's width (it is ${Math.round(ar.width)} px; 360\u2013470), or capture on the phone.`);
    return null;
  }
  const W = import_obsidian26.Platform.isMobile ? window.innerWidth : 428, H = import_obsidian26.Platform.isMobile ? window.innerHeight : 926;
  const land = import_obsidian26.Platform.isMobile && W > H;
  const emuLand = land && W === 832 && H === 407;
  const [PW, PH] = emuLand ? [428, 926] : land ? [H, W] : [W, H];
  const dev = DEVICES.find(([, w, h2]) => w === PW && h2 === PH)?.[0] ?? (import_obsidian26.Platform.isMobile ? DEVICES.find(([, w]) => w === PW)?.[0] : null) ?? "iphone-12-pro-max";
  const [, DW] = DEVICES.find(([d]) => d === dev);
  const k = import_obsidian26.Platform.isMobile ? 1 : DW / ar.width;
  const probe = shot.appEl.createDiv();
  probe.style.cssText = "position:absolute;visibility:hidden;padding-top:env(safe-area-inset-top)";
  const safe = parseFloat(getComputedStyle(probe).paddingTop) || 0;
  probe.remove();
  const emu = import_obsidian26.Platform.isMobile && !safe;
  const origin = !import_obsidian26.Platform.isMobile ? { x: ar.left, y: ar.top - TOP3 / k } : emu ? land ? { x: ar.left - TOP3, y: ar.top } : { x: 0, y: ar.top - TOP3 } : { x: 0, y: Math.max(0, ar.top - safe) };
  const view = new DOMRect(ar.left, ar.top, ar.width, import_obsidian26.Platform.isMobile ? Math.min(ar.height, H) : Math.min(ar.height, (H - TOP3) / k));
  const pal = palette(app, shot.appEl);
  const blocks2 = shot.parts.map(([name, kind, el]) => block(el, name, kind, origin, k, pal, view)).filter((b) => !!b);
  const page3 = { id: shot.id, name: mask(shot.name), ...shot.parent ? { parent: shot.parent } : {}, ...shot.link ? { link: mask(shot.link) } : {}, note: `Captured from the app ${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}${import_obsidian26.Platform.isMobile ? " on the phone" : ""}.`, blocks: blocks2 };
  const v = app.vault;
  if (!(v.getAbstractFileByPath(SCREENS) instanceof import_obsidian26.TFolder)) await v.createFolder(SCREENS);
  const folder = v.getAbstractFileByPath(SCREENS);
  let file = null;
  for (const f of folder.children) if (f instanceof import_obsidian26.TFile && f.extension === "json" && f.name !== "_doc.json" && (await v.read(f)).startsWith(`{"id":${JSON.stringify(shot.id)},`)) file = f;
  let path = file?.path ?? (0, import_obsidian26.normalizePath)(`${SCREENS}/${fileName(String(page3.name))}.json`), n = 2;
  while (!file && v.getAbstractFileByPath(path)) path = (0, import_obsidian26.normalizePath)(`${SCREENS}/${fileName(String(page3.name))} ${n++}.json`);
  let had = {};
  if (file) {
    try {
      had = JSON.parse(await v.read(file));
    } catch {
    }
  }
  if (land) {
    page3.land = page3.blocks;
    page3.blocks = had.blocks ?? [];
  } else if (had.land) page3.land = had.land;
  if (file) await v.modify(file, pageText(page3));
  else await v.create(path, pageText(page3));
  const dp = `${SCREENS}/_doc.json`, df = v.getAbstractFileByPath(dp);
  let meta = { id: "ledgerline", device: dev, order: [] };
  if (df instanceof import_obsidian26.TFile) {
    try {
      meta = { ...meta, ...JSON.parse(await v.read(df)) };
    } catch {
    }
  }
  if (!meta.order.includes(shot.id)) meta.order.push(shot.id);
  if (import_obsidian26.Platform.isMobile) meta.device = dev;
  const text2 = JSON.stringify(meta, null, 2) + "\n";
  if (df instanceof import_obsidian26.TFile) await v.modify(df, text2);
  else await v.create(dp, text2);
  return path;
}

// src/diagramicons.ts
var import_obsidian27 = require("obsidian");
var fill = (root) => {
  root.querySelectorAll("svg[data-icon]").forEach((s2) => {
    if (s2.childElementCount) return;
    const ic = (0, import_obsidian27.getIcon)((s2.getAttribute("data-icon") ?? "").replace(/^lucide[:-]/, ""));
    if (ic) s2.append(...Array.from(ic.childNodes).map((n) => n.cloneNode(true)));
  });
  align(root);
  split(root);
};
var SNAP = 8;
var xy = (g) => {
  const m = /translate\(\s*([-\d.]+)[ ,]\s*([-\d.]+)/.exec(g.getAttribute("transform") ?? "");
  return m ? [Number(m[1]), Number(m[2])] : null;
};
var shiftEnd = (d, first2, dx) => {
  const all = Array.from(d.matchAll(/([-\d.]+)([ ,])([-\d.]+)/g));
  const m = first2 ? all[0] : all[all.length - 1];
  if (!m || m.index === void 0) return d;
  return d.slice(0, m.index) + `${Number(m[1]) + dx}${m[2]}${m[3]}` + d.slice(m.index + m[0].length);
};
var align = (root) => {
  root.querySelectorAll("svg.pele-flowchart:not([data-aligned])").forEach((svg) => {
    if (!svg.querySelector(".pele-node[class*='pele-shape-icon']")) return;
    svg.setAttribute("data-aligned", "1");
    const nodes = Array.from(svg.querySelectorAll(".pele-node")).map((g) => ({ g, id: g.getAttribute("data-id") ?? "", p: xy(g) })).filter((n) => !!n.p).sort((a, b) => a.p[1] - b.p[1]);
    for (const n of nodes) {
      const above = nodes.find((o) => o.p[1] < n.p[1] - 1 && Math.abs(o.p[0] - n.p[0]) > 0.5 && Math.abs(o.p[0] - n.p[0]) <= SNAP);
      if (!above) continue;
      const dx = above.p[0] - n.p[0];
      n.p[0] += dx;
      n.g.setAttribute("transform", `translate(${n.p[0]},${n.p[1]})`);
      svg.querySelectorAll(".pele-edge[data-id]").forEach((e) => {
        const m = /^L_(.+)_(.+)_\d+$/.exec(e.getAttribute("data-id") ?? "");
        if (!m || m[1] !== n.id && m[2] !== n.id) return;
        const p = e.querySelector("path:not(.pele-marker)");
        if (!p) return;
        let d = p.getAttribute("d") ?? "";
        if (m[1] === n.id) d = shiftEnd(d, true, dx);
        if (m[2] === n.id) {
          d = shiftEnd(d, false, dx);
          e.setAttribute("data-mx", String(Number(e.getAttribute("data-mx") ?? 0) + dx));
        }
        p.setAttribute("d", d);
        e.querySelectorAll(".pele-marker").forEach((mk) => mk.setAttribute("transform", `translate(${e.getAttribute("data-mx") ?? 0},0)`));
      });
    }
  });
};
var GAP2 = 10;
var split = (root) => {
  root.querySelectorAll(".pele-node[class*='pele-shape-icon']:not([data-split])").forEach((g) => {
    const box = g.querySelector(":scope > rect"), lines = Array.from(g.querySelectorAll(":scope > text.pele-label > tspan"));
    g.setAttribute("data-split", "1");
    if (!box || lines.length < 2) return;
    const top = Number(box.getAttribute("y")), y0 = Number(lines[0].getAttribute("y")), lh = Number(lines[1].getAttribute("y")) - y0;
    lines[0].setAttribute("y", String(top - GAP2));
    lines[0].classList.add("pele-title");
    lines.slice(1).forEach((t2, i) => t2.setAttribute("y", String(y0 + GAP2 / 2 + i * lh)));
    const tr = /translate\(\s*([-\d.]+)[ ,]\s*([-\d.]+)/.exec(g.getAttribute("transform") ?? ""), id = g.getAttribute("data-id");
    const svgEl3 = g.closest("svg.pele");
    if (svgEl3 && id && tr) {
      const tx = Number(tr[1]), ty = Number(tr[2]), at = ty + top, mid = at + Number(box.getAttribute("height")) / 2, lift = GAP2 + lh * 0.85 + 4;
      svgEl3.querySelectorAll(`.pele-edge[data-id$="_${id}_0"], .pele-edge[data-id*="_${id}_"]`).forEach((e) => {
        if (!new RegExp(`^L_.+_${id}_\\d+$`).test(e.getAttribute("data-id") ?? "") || e.hasAttribute("data-lifted")) return;
        const p = e.querySelector("path:not(.pele-marker)"), d = p?.getAttribute("d") ?? "";
        const pts = Array.from(d.matchAll(/([-\d.]+)[ ,]([-\d.]+)/g)).map((m) => [Number(m[1]), Number(m[2])]);
        if (!p || pts.length < 2) return;
        const [sx, sy] = pts[0], [ex, ey] = pts[pts.length - 1];
        let dy = 0;
        if (ey >= at - 16 && ey <= at + 3) {
          const ny = ey - lift, my = (sy + ny) / 2, dir = Math.sign(ex - sx), r = Math.min(8, Math.abs(ex - sx) / 2, (ny - sy) / 2);
          p.setAttribute("d", Math.abs(sx - ex) < 1 ? `M${sx},${sy}L${ex},${ny}` : `M${sx},${sy}V${my - r}Q${sx},${my} ${sx + dir * r},${my}H${ex - dir * r}Q${ex},${my} ${ex},${my + r}V${ny}`);
          dy = ny - ey;
        } else if (ex < tx && pts.every(([, y]) => Math.abs(y - ey) < 1) && ey > at) {
          p.setAttribute("d", `M${sx},${mid}L${ex},${mid}`);
          dy = mid - ey;
        } else return;
        e.setAttribute("data-lifted", "1");
        e.querySelectorAll(".pele-marker").forEach((mk) => mk.setAttribute("transform", `translate(${e.getAttribute("data-mx") ?? 0},${dy})`));
      });
    }
    const svg = g.closest("svg.pele");
    const vb = svg?.viewBox.baseVal;
    if (svg && vb && vb.height && !svg.hasAttribute("data-grown")) {
      const extra = lh + GAP2, k = (vb.height + extra) / vb.height;
      svg.setAttribute("data-grown", "1");
      svg.setAttribute("viewBox", `${vb.x} ${vb.y - extra} ${vb.width} ${vb.height + extra}`);
      const h2 = parseFloat(svg.getAttribute("height") ?? "");
      if (h2) svg.setAttribute("height", String(h2 * k));
      if (svg.style.height) svg.style.height = `${parseFloat(svg.style.height) * k}px`;
    }
  });
};
function registerDiagramIcons(plugin) {
  fill(document);
  const obs = new MutationObserver((list5) => {
    for (const m of list5) for (const n of Array.from(m.addedNodes)) if (n instanceof Element && (n.matches("svg[data-icon]") || n.querySelector("svg[data-icon]"))) {
      fill(n.parentElement ?? n);
    }
  });
  obs.observe(document.body, { childList: true, subtree: true });
  plugin.register(() => obs.disconnect());
  plugin.registerMarkdownPostProcessor((el) => {
    if (!el.querySelector("pre > code.language-mermaid, .mermaid") && !el.matches(".mermaid")) return;
    const o = new MutationObserver(() => fill(el));
    o.observe(el, { childList: true, subtree: true });
    window.setTimeout(() => o.disconnect(), 2e4);
  });
}

// src/main.ts
var FUGLE_KEY = "ledgerline-fugle-key";
var LedgerlinePlugin = class extends import_obsidian28.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULTS;
    this.logMonth = { year: (/* @__PURE__ */ new Date()).getFullYear(), month: (/* @__PURE__ */ new Date()).getMonth() };
    // the month the Log tab shows
    this.dataTimer = 0;
  }
  async onload() {
    await this.loadSettings();
    this.debug = new DebugLog(this);
    spriteIcons().forEach(([name, svg]) => (0, import_obsidian28.addIcon)(name, svg));
    this.router = new Router(this.app, () => this.enabledTabs());
    this.store = new Store(this);
    this.prices = new Prices(() => this.app.loadLocalStorage(Prices.KEY), (v) => this.app.saveLocalStorage(Prices.KEY, v), () => this.dataChanged(), pickSource(() => this.fugleKey()), () => this.settings.taiwan);
    this.prices.useFugle(() => this.fugleKey());
    this.flow = new Flow(this.prices, () => this.fugleKey(), { load: (k) => this.app.loadLocalStorage(k), save: (k, v) => this.app.saveLocalStorage(k, v) });
    this.prices.calendar = new MarketCalendar(() => this.app.loadLocalStorage(MarketCalendar.KEY), (v) => this.app.saveLocalStorage(MarketCalendar.KEY, v), () => this.prices.onLive?.(false));
    this.registerInterval(window.setInterval(() => this.prices.background(), 5 * 1e3));
    this.prices.onLive = (opening) => this.views().forEach((v) => v.pricesMoved(opening));
    this.prices.loadSeries = () => this.app.loadLocalStorage(Prices.SERIES_KEY);
    this.prices.saveSeries = (v) => this.app.saveLocalStorage(Prices.SERIES_KEY, v);
    this.search = new TickerSearch(() => this.app.loadLocalStorage(TickerSearch.KEY), (v) => this.app.saveLocalStorage(TickerSearch.KEY, v), () => this.settings.taiwan);
    this.brokers = new Brokers(() => this.app.loadLocalStorage(Brokers.KEY), (v) => this.app.saveLocalStorage(Brokers.KEY, v));
    this.flows = new Flows(() => this.app.loadLocalStorage(Flows.KEY), (v) => this.app.saveLocalStorage(Flows.KEY, v));
    this.revenue = new Revenue(() => this.app.loadLocalStorage(Revenue.key), (v) => this.app.saveLocalStorage(Revenue.key, v));
    this.alerts = new AlertWatch(this);
    this.app.workspace.onLayoutReady(() => {
      void this.alerts.tick();
    });
    this.registerInterval(window.setInterval(() => {
      void this.alerts.tick();
    }, 60 * 1e3));
    this.debug.note(`plugin load ${this.manifest.version} (${import_obsidian28.Platform.isMobile ? "mobile" : "desktop"})`);
    this.registerView(VIEW_TYPE, (leaf) => new LedgerView(leaf, this));
    this.addRibbonIcon("wallet", t("open"), () => {
      void this.activate(false);
    });
    this.addCommand({ id: "open", name: t("open"), callback: () => {
      void this.activate(false);
    } });
    this.addCommand({ id: "write-debug-log", name: t("writeDebug"), callback: () => {
      void this.debug.flush(true);
    } });
    const shoot = async (all) => {
      const v = this.views().find((x) => x.contentEl.offsetWidth > 0);
      if (!v) {
        new import_obsidian28.Notice(t("capNoApp"));
        return;
      }
      const done = [];
      const one = async () => {
        const p = await capture(this.app, v.shot());
        if (p) done.push(p);
      };
      if (all) await v.eachTab(one);
      else await one();
      if (done.length) new import_obsidian28.Notice(t("capDone", { n: done.length, dir: SCREENS }));
    };
    this.addCommand({ id: "capture-page", name: t("capPage"), callback: () => {
      void shoot(false);
    } });
    this.addCommand({ id: "capture-tabs", name: t("capTabs"), callback: () => {
      void shoot(true);
    } });
    this.addSettingTab(new LedgerSettingTab(this.app, this));
    registerDiagramIcons(this);
    const onFile = (file, oldPath) => {
      if (this.isData(file.path) || oldPath && this.isData(oldPath)) this.dataChanged();
    };
    this.registerEvent(this.app.metadataCache.on("changed", (f) => onFile(f)));
    this.registerEvent(this.app.vault.on("delete", (f) => onFile(f)));
    this.registerEvent(this.app.vault.on("rename", (f, old) => onFile(f, old)));
    this.registerEvent(this.app.workspace.on("active-leaf-change", () => this.updateBody()));
    this.registerEvent(this.app.workspace.on("file-open", () => this.updateBody()));
    this.registerEvent(this.app.workspace.on("layout-change", () => this.placeHome()));
    this.home = createEl("button", { cls: "zl-home", attr: { "aria-label": t("open") } });
    (0, import_obsidian28.setIcon)(this.home, "wallet");
    this.home.addEventListener("click", (e) => {
      e.preventDefault();
      this.debug.note("home button");
      void this.activate(false);
    });
    this.register(() => this.home.remove());
    if (import_obsidian28.Platform.isMobile) {
      let touchAt = 0;
      const onDay = (e) => e.target?.closest?.(".calendar .day, #calendar-container .day") != null;
      this.registerDomEvent(document, "touchstart", () => {
        touchAt = Date.now();
      }, { capture: true, passive: true });
      for (const ev of ["pointerover", "pointerenter", "mouseover", "mouseenter"]) {
        this.registerDomEvent(document, ev, (e) => {
          const touch = e.pointerType === "touch" || Date.now() - touchAt < 1e3;
          if (touch && onDay(e)) e.stopImmediatePropagation();
        }, { capture: true });
      }
    }
    this.app.workspace.onLayoutReady(() => {
      this.debug.note("layout ready");
      if (this.settings.openOnStartup) void this.activate(true);
      this.updateBody();
    });
  }
  onunload() {
    document.body.removeClass("zl-calm", "zl-bigflap", "zl-skin", "zl-red-up", "zl-us-ny");
    delete document.body.dataset.zlMove;
    window.clearTimeout(this.dataTimer);
    document.body.removeClass("zl-on", "zl-full");
    chartUnload();
    marketUnload();
    investUnload();
    this.flow?.stop();
    this.prices?.stop();
  }
  // the Fugle key lives in this device's local storage only (data.json is in git: the vault backup commits it)
  fugleKey() {
    return String(this.app.loadLocalStorage(FUGLE_KEY) ?? "");
  }
  setFugleKey(v) {
    this.app.saveLocalStorage(FUGLE_KEY, v.trim() || null);
  }
  enabledTabs() {
    const on = tabOrderOf(this.settings.tabOrder).filter((id) => this.settings.tabs[id]);
    return on.length ? on : ["log"];
  }
  isData(path) {
    const s2 = this.settings;
    return path.startsWith(s2.dataFolder + "/") || path.startsWith(s2.logFolder + "/") || path.startsWith("Invest/");
  }
  dataChanged() {
    window.clearTimeout(this.dataTimer);
    this.dataTimer = window.setTimeout(() => {
      this.views().forEach((v) => v.dataChanged());
    }, 300);
  }
  views() {
    return this.app.workspace.getLeavesOfType(VIEW_TYPE).map((l) => l.view).filter((v) => v instanceof LedgerView);
  }
  // Show the app: the existing screen if there is one, else in the current tab (phone, start-up) or a new tab (desktop).
  async activate(startup) {
    const ws = this.app.workspace;
    let leaf = ws.getLeavesOfType(VIEW_TYPE)[0] ?? null;
    if (!leaf) {
      leaf = ws.getLeaf(startup || import_obsidian28.Platform.isMobile ? false : "tab");
      await leaf.setViewState({ type: VIEW_TYPE, active: true });
    }
    await ws.revealLeaf(leaf);
    ws.setActiveLeaf(leaf, { focus: true });
    this.debug.note(`activate (${startup ? "start-up" : "user"})`);
    this.updateBody();
  }
  // The app on screen, on a tab (and a page on top of it)
  async showInApp(tab, f) {
    await this.activate(false);
    this.views()[0]?.go(tab, f);
  }
  // A note in a tab of its own; a tab that already shows it is brought forward instead of opening a second one
  async openPath(path, leafPath) {
    const f = this.app.vault.getAbstractFileByPath(path);
    if (!(f instanceof import_obsidian28.TFile)) return;
    const ws = this.app.workspace;
    const has = (p) => ws.getLeavesOfType("markdown").find((l) => l.view.file?.path === p);
    const open2 = has(path);
    if (open2) {
      await ws.revealLeaf(open2);
      ws.setActiveLeaf(open2, { focus: false });
      return;
    }
    const leaf = leafPath && has(leafPath) || ws.getLeaf("tab");
    await leaf.openFile(f, { state: { mode: "preview" } });
  }
  // A day's page in the app (its daily note is started first if it does not exist yet; the note only holds the day's data)
  async openDay(date) {
    try {
      if (!this.store.day(date)) await this.store.createDay(date);
      await this.showInApp("log", dayFrame(date));
    } catch (e) {
      new import_obsidian28.Notice(String(e instanceof Error ? e.message : e));
    }
  }
  // body classes: zl-on while the app is the active screen; zl-full additionally hides Obsidian's phone toolbars
  updateBody() {
    this.placeHome();
    const on = !!this.app.workspace.getActiveViewOfType(LedgerView);
    document.body.toggleClass("zl-on", on);
    document.body.toggleClass("zl-full", on && import_obsidian28.Platform.isMobile && this.settings.fullScreen);
  }
  // Put the return button into the page on screen (a note in the main area), or take it away while the app is on screen
  placeHome() {
    if (!import_obsidian28.Platform.isMobile) return;
    const ws = this.app.workspace, v = ws.getActiveViewOfType(import_obsidian28.View);
    if (!v || v instanceof LedgerView || v.leaf.getRoot() !== ws.rootSplit) {
      if (!v || v instanceof LedgerView) this.home.remove();
      return;
    }
    if (this.home.parentElement !== v.containerEl) {
      v.containerEl.addClass("zl-home-host");
      v.containerEl.appendChild(this.home);
    }
  }
  async loadSettings() {
    const d = await this.loadData();
    const old = d;
    if (old?.fugleKey) this.setFugleKey(old.fugleKey);
    const stale = !!old && ("fugleKey" in old || "priceSource" in old);
    if (old) {
      delete old.fugleKey;
      delete old.priceSource;
    }
    this.settings = { ...DEFAULTS, ...d, tabs: { ...DEFAULTS.tabs, ...d?.tabs ?? {} } };
    if (stale) await this.saveData(this.settings);
    if (!d?.theme) {
      const v = this.app.vault.getConfig?.("theme");
      this.settings.theme = v === "obsidian" ? "dark" : v === "moonstone" ? "light" : "auto";
    }
    this.applyLook();
  }
  // Settings › Look: body classes read by the shared parts (ui/c.ts board, ui/pixel.ts calm) and the CSS
  applyLook() {
    document.body.toggleClass("zl-calm", this.settings.calm);
    document.body.toggleClass("zl-bigflap", this.settings.bigNumber === "flap");
    document.body.dataset.zlMove = this.settings.pageMove;
    document.body.toggleClass("zl-skin", this.settings.skin);
    document.body.toggleClass("zl-red-up", this.settings.redUp);
    document.body.toggleClass("zl-us-ny", this.settings.usNy);
  }
  async saveSettings() {
    await this.saveData(this.settings);
    this.applyLook();
    this.views().forEach((v) => v.settingsChanged());
    this.updateBody();
  }
};
