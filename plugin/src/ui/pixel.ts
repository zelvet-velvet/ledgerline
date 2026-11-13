// Redesign C: pixel icons (square bitmaps, "#" = on) drawn as crisp SVG rects, and the 5 × 7 digits of the flip-dot board.
// Ported from the approved mock (claude.ai artifact, Direction C round 5).
const SPR: Record<string, string[]> = {
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
    gifts: ["..#...#..", "...#.#...", "#########", "#...#...#", "#########", ".#..#..#.", ".#..#..#.", ".#..#..#.", ".#######."],
};

// A budget / category name → a sprite, by keyword (English or Chinese); anything else is a coin.
const KEYS: [RegExp, string][] = [
    [/food|meal|breakfast|lunch|dinner|brunch|snack|dessert|ice|eat|grocer|飯|餐|食|吃|點心/i, "food"],
    [/medic|doctor|health|pharma|clinic|藥|醫/i, "plus"],
    [/drink|coffee|tea|飲|咖啡|茶/i, "drinks"],
    [/fun|game|movie|play|hobby|entertain|娛樂|遊戲|電影/i, "fun"],
    [/transport|mrt|bus|taxi|car|fuel|gas|train|交通|捷運|油/i, "transport"],
    [/home|rent|house|util|bill|家|房|水電/i, "home"],
    [/gift|present|禮/i, "gifts"],
    [/travel|trip|vacation|holiday|journey|旅/i, "travel"],
    [/emergenc|rainy|safety|backup|buffer|急|備/i, "shield"],
    [/study|school|grad|learn|course|edu|tuition|學|教/i, "study"],
];
// A row label (any case) → a sprite, so every row shows one without each page choosing it; a page may still pass its own.
const ROW_KEYS: [RegExp, string][] = [
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
    [/net worth|total/i, "coin"],
];
// a fund or account name → its own sprite (keywords), else `or` (a new fund still gets a picture: the goal flag)
export const nameSprite = (label: string, or: string): string => KEYS.find(([re]) => re.test(label))?.[1] ?? or;
export const rowSprite = (label: string): string => KEYS.find(([re]) => re.test(label))?.[1] ?? ROW_KEYS.find(([re]) => re.test(label))?.[1] ?? "coin";
// the older rows name Lucide icons: each gets its pixel twin
const LUCIDE: Record<string, string> = {
    "book-open": "receipt", landmark: "debt", percent: "percent", wallet: "wallet", "trending-down": "down", "trending-up": "invest", calendar: "log",
    "calendar-plus": "log", "calendar-days": "log", split: "swap", target: "goals", "piggy-bank": "wallet", receipt: "receipt", "trash-2": "trash",
    "check-circle": "check", "undo-2": "back", list: "list", layers: "list", banknote: "coin", coins: "coin", "circle-dollar-sign": "coin",
    "arrow-down-left": "up", "arrow-up-right": "down", plus: "plus", "shopping-bag": "gifts", gift: "gifts", "hand-coins": "wallet",
};
export const pixelFor = (lucide: string, title = ""): string => {
    const n = lucide.split("|")[0].split(",")[0];
    if (n in SPR) return n;   // already a pixel name
    if (n.includes("hand")) return "ledger";
    if (n.includes("check")) return "check";
    return LUCIDE[n] ?? rowSprite(title);
};
export const hasSprite = (name: string): boolean => name in SPR;
// every sprite as an Obsidian icon "zlpx-<name>" (not zl-: Obsidian puts the id on the svg as a class, and .zl-search, .zl-invest… are app rules) (addIcon's 100 × 100 box), so other plugins can draw it by name: Vellum's icon
// items show the app's own pixel icons in its screens (name "zlpx-eye"), in the item's colour
// zlpx-go: the back sprite turned round, the › at the end of a row that opens
export const spriteIcons = (): [string, string][] => [...Object.entries(SPR), ["go", SPR.back.map((r) => [...r].reverse().join(""))] as [string, string[]]].map(([name, rows]) => {
    const n = rows.length, k = 100 / n, out: string[] = [];
    rows.forEach((row, y) => {
        let x = 0;
        while (x < n) {
            if (row[x] !== "#") { x++; continue; }
            let w = 1;
            while (row[x + w] === "#") w++;
            out.push(`<rect x="${+(x * k).toFixed(3)}" y="${+(y * k).toFixed(3)}" width="${+(w * k).toFixed(3)}" height="${+k.toFixed(3)}" style="fill:currentColor;stroke:none"/>`);
            x += w;
        }
    });
    return [`zlpx-${name}`, `<g shape-rendering="crispEdges">${out.join("")}</g>`];
});
export const spriteFor = (name: string): string => KEYS.find(([re]) => re.test(name))?.[1] ?? "coin";

const NS = "http://www.w3.org/2000/svg";
export const sprite = (parent: HTMLElement | null, name: string, cls = "zl-px"): SVGSVGElement => {
    const rows = SPR[name] ?? SPR.coin, n = rows.length;
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", cls);
    svg.dataset.px = SPR[name] ? name : "coin";   // its name, for the Vellum capture (an icon item "zlpx-<name>")
    svg.setAttribute("viewBox", `0 0 ${n} ${n}`);
    svg.setAttribute("fill", "currentColor");
    svg.setAttribute("aria-hidden", "true");
    rows.forEach((row, y) => {
        let x = 0;
        while (x < n) {
            if (row[x] !== "#") { x++; continue; }
            let w = 1;
            while (row[x + w] === "#") w++;
            const r = document.createElementNS(NS, "rect");
            r.setAttribute("x", String(x)); r.setAttribute("y", String(y)); r.setAttribute("width", String(w)); r.setAttribute("height", "1");
            svg.appendChild(r);
            x += w;
        }
    });
    parent?.appendChild(svg);
    return svg;
};

export const GLYPH: Record<string, string[]> = {
    "0": [".###.", "#...#", "#..##", "#.#.#", "##..#", "#...#", ".###."], "1": ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", ".###."],
    "2": [".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####"], "3": ["#####", "...#.", "..#..", "...#.", "....#", "#...#", ".###."],
    "4": ["...#.", "..##.", ".#.#.", "#..#.", "#####", "...#.", "...#."], "5": ["#####", "#....", "####.", "....#", "....#", "#...#", ".###."],
    "6": ["..##.", ".#...", "#....", "####.", "#...#", "#...#", ".###."], "7": ["#####", "....#", "...#.", "..#..", ".#...", ".#...", ".#..."],
    "8": [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."], "9": [".###.", "#...#", "#...#", ".####", "....#", "...#.", ".##.."],
    ",": ["..", "..", "..", "..", "..", ".#", "#."], ".": [".", ".", ".", ".", ".", ".", "#"], " ": ["..", "..", "..", "..", "..", "..", ".."],
    "-": ["....", "....", "....", "####", "....", "....", "...."], "—": ["....", "....", "....", "####", "....", "....", "...."],
};

// less motion: the system setting, or Ledgerline's own "Calm motion" (body.zl-calm, set by main.ts)
export const calm = (): boolean => document.body.hasClass("zl-calm") || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
