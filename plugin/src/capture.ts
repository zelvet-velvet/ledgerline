import { Notice, normalizePath, Platform, TFile, TFolder, type App } from "obsidian";

// Capture the app's pages as Vellum screens (Docs/Design/Screens, one JSON file per screen, see github.com/zelvet-velvet/vellum):
// what is on screen, measured from the page itself: the top bar, each section of the page, the dock and the tab bar become
// blocks; inside them every text (its size, weight, colour, font) and every box with a fill or an outline. Run it on the
// phone for the real device; on a computer the app pane must be about a phone's width. Digits are swapped for others (the
// layout, not your numbers); names stay (the vault is private).
export const SCREENS = "Docs/Design/Screens";
const DEVICES: [string, number, number][] = [["iphone-12-pro-max", 428, 926], ["iphone-16-pro-max", 440, 956], ["iphone-16-pro", 402, 874], ["iphone-16", 393, 852], ["iphone-14", 390, 844], ["iphone-12-mini", 375, 812], ["iphone-se", 375, 667]];
const TOP = 47;   // the iPhone 12 Pro Max status bar: on a computer the app starts under it

export interface Shot { appEl: HTMLElement; parts: [string, string, HTMLElement][]; id: string; name: string; parent?: string; link?: string }
type Item = Record<string, unknown>;

const mask = (s: string) => { let i = 0; return s.replace(/\b20\d\d\b|\d/g, (d) => d.length > 1 ? d : String((Number(d) * 7 + 3 + i++) % 10)); };   // years stay
const r1 = (v: number) => Math.round(v * 10) / 10;
const rgb = (c: string): number[] | null => { const m = /rgba?\(([^)]+)\)/.exec(c); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return p.length >= 3 && (p[3] ?? 1) > 0.02 ? p : null; };
const hex = (p: number[]) => "#" + p.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, "0")).join("") + (p[3] !== undefined && p[3] < 1 ? Math.round(p[3] * 255).toString(16).padStart(2, "0") : "");

// the theme's colour names as the app shows them now (Vellum's settings hold the same names): nearest within a small distance
function palette(app: App, host: HTMLElement): [string, number[]][] {
    const out: [string, number[]][] = [];
    let colors: Record<string, string> = {};
    try { colors = (app as unknown as { plugins: { plugins: Record<string, { settings?: { colors?: Record<string, string> } }> } }).plugins.plugins.vellum?.settings?.colors ?? {}; } catch { /* */ }
    const probe = host.createDiv(); probe.style.display = "none";
    for (const [name, css] of Object.entries(colors)) { probe.style.color = ""; probe.style.color = css; const p = rgb(getComputedStyle(probe).color); if (p) out.push([name, p]); }
    probe.remove();
    return out;
}
const named = (pal: [string, number[]][], p: number[]) => {
    let best = "", d = 1e9;
    for (const [n, q] of pal) { const e = Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) + Math.abs(p[2] - q[2]); if (e < d) { d = e; best = n; } }
    return d <= 12 && (p[3] ?? 1) >= 0.98 ? best : hex(p);
};

function block(el: HTMLElement, name: string, kind: string, origin: { x: number; y: number }, k: number, pal: [string, number[]][], view: DOMRect): Record<string, unknown> | null {
    const br = el.getBoundingClientRect();
    if (br.width < 2 || br.height < 2 || br.bottom < view.top || br.top > view.bottom) return null;
    const bx = br.left, by = Math.max(br.top, view.top), items: Item[] = [], shapes: Item[] = [];
    const at = (r: DOMRect) => ({ g: "tl", dx: Math.round((r.left - bx) * k), dy: Math.round((r.top - by) * k) });
    const walk = (n: HTMLElement) => {
        const cs = getComputedStyle(n);
        if (cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) < 0.05) return;
        const r = n.getBoundingClientRect();
        if (r.width < 1 || r.height < 1 || r.bottom < view.top || r.top > view.bottom) return;
        if (n.classList.contains("zl-tab")) return;   // the tab bar's buttons: one row of centred columns, below
        // a box: a fill, an outline, or an icon / chart drawing
        // borders side by side: four equal sides are the box's outline, single sides are rule lines of their own
        const side = (s: "Top" | "Right" | "Bottom" | "Left") => { const w = parseFloat(cs.getPropertyValue(`border-${s.toLowerCase()}-width`)) || 0; const c = w ? rgb(cs.getPropertyValue(`border-${s.toLowerCase()}-color`)) : null; return c ? { w, c } : null; };
        const sides = { Top: side("Top"), Right: side("Right"), Bottom: side("Bottom"), Left: side("Left") };
        const all4 = sides.Top && sides.Right && sides.Bottom && sides.Left && [sides.Right, sides.Bottom, sides.Left].every((x) => x!.w === sides.Top!.w && x!.c.join() === sides.Top!.c.join());
        if (!all4) for (const [nm, b] of Object.entries(sides)) {   // the block's own rules too (the line under the title, over the tabs)
            if (!b) continue;
            const hz = nm === "Top" || nm === "Bottom";
            const lr = new DOMRect(nm === "Right" ? r.right - b.w : r.left, nm === "Bottom" ? r.bottom - b.w : r.top, hz ? r.width : b.w, hz ? b.w : r.height);
            shapes.push({ type: "rect", ...at(lr), w: Math.max(1, Math.round(lr.width * k)), h: Math.max(1, Math.round(lr.height * k)), fill: named(pal, b.c) });
        }
        const fill = rgb(cs.backgroundColor), sw = all4 ? sides.Top!.w : 0, stroke = all4 ? sides.Top!.c : null;
        const drawn = n instanceof SVGElement || n.tagName === "CANVAS" || n.tagName === "IMG";
        // an app sprite: Vellum draws it by name (Ledgerline registers each as the icon "zlpx-<name>"); the back sprite turned
        // round is the › at the end of a row (zlpx-go)
        const px = n instanceof SVGElement ? n.dataset.px : undefined;
        if (px && n !== el) {
            const flip = /^matrix\(-/.test(cs.transform), col = rgb(cs.color);
            items.push({ type: "icon", ...at(r), name: `zlpx-${px === "back" && flip ? "go" : px}`, size: Math.round(Math.max(r.width, r.height) * k), color: col ? named(pal, col) : "text" });
            return;
        }
        if (n !== el && (fill || stroke || drawn) && r.width * k >= 2 && r.height * k >= 1) {
            const s: Item = { type: "rect", ...at(r), w: Math.round(r.width * k), h: Math.round(r.height * k) };
            if (fill) s.fill = named(pal, fill);
            if (stroke) { s.stroke = named(pal, stroke); s.sw = r1(sw * k); }
            const big = r.width * k >= 60 && r.height * k >= 40;
            const what = !big ? "icon" : n.closest("[class*='board'], [class*='flip'], [class*='dot']") ? "board" : "chart";
            if (drawn && !fill && !stroke) { if (big) { s.stroke = "dim"; s.sw = 1; s.op = 60; } else { s.fill = "dim"; s.op = 30; s.r = 2; } s.note = what; }
            const rad = parseFloat(cs.borderTopLeftRadius) || 0; if (rad) s.r = Math.round(Math.min(rad, r.height / 2, r.width / 2) * k);
            shapes.push(s);
            // a drawing Vellum cannot hold (the flip-dot board, a chart): a box with its name in the middle
            if (drawn && big) items.push({ type: "text", v: what.toUpperCase(), g: "tl", dx: Math.round((r.left - bx + r.width / 2) * k) - 24, dy: Math.round((r.top - by + r.height / 2) * k) - 8, size: 12, wt: 600, ls: 0.1, color: "dim" });
        }
        if (drawn) return;
        // its own words (not its children's): one text item
        const own = Array.from(n.childNodes).filter((c) => c.nodeType === 3).map((c) => c.textContent ?? "").join("").replace(/\s+/g, " ").trim();
        if (own) {
            const size = parseFloat(cs.fontSize) * k, col = rgb(cs.color);
            const t: Item = { type: "text", v: mask(cs.textTransform === "uppercase" ? own.toUpperCase() : own), ...at(r), size: r1(size) };
            const wt = Number(cs.fontWeight); if (wt && wt !== 400) t.wt = wt;
            if (/anton/i.test(cs.fontFamily)) t.font = "display";
            if (col) { const c = named(pal, col); if (c !== "text") t.color = c; }
            const ls = parseFloat(cs.letterSpacing); if (ls) t.ls = r1(ls / parseFloat(cs.fontSize) * 100) / 100;
            const lh = parseFloat(cs.lineHeight); if (lh) t.lh = r1(lh / parseFloat(cs.fontSize));
            items.push(t);
        }
        for (const c of Array.from(n.children)) walk(c as HTMLElement);
    };
    walk(el);
    // the tab bar: its buttons as a row of columns, each the tab's sprite over its label, centred
    const tabs = Array.from(el.querySelectorAll<HTMLElement>(":scope > .zl-tab"));
    let row: Item | null = null;
    if (tabs.length) {
        // a turned phone: the tabs stand in a column down the side
        const tr = tabs[0].getBoundingClientRect(), down = tabs.length > 1 && tabs[1].getBoundingClientRect().top > tr.bottom - 1;
        const last = tabs[tabs.length - 1].getBoundingClientRect();
        row = { id: "tabs", type: down ? "col" : "row", ...at(tr), w: Math.round((down ? tr.width : br.width) * k), h: Math.round((down ? last.bottom - tr.top : tr.height) * k), items: tabs.map((b) => {
            const tab = b.dataset.tab ?? "tab", ic = b.querySelector<SVGElement>("svg"), lb = b.querySelector<HTMLElement>(".zl-tab-l");
            const ir = ic?.getBoundingClientRect(), icol = ic ? rgb(getComputedStyle(ic).color) : null, lcol = lb ? rgb(getComputedStyle(lb).color) : null;
            const col: Item[] = [];
            if (ic && ir) col.push({ id: `tab-${tab}-ic`, type: "icon", name: `zlpx-${ic.dataset.px ?? tab}`, size: Math.round(ir.width * k), color: icol ? named(pal, icol) : "dim" });
            if (lb) col.push({ id: `tab-${tab}-l`, type: "text", v: (lb.textContent ?? "").toUpperCase(), size: r1(parseFloat(getComputedStyle(lb).fontSize) * k), color: lcol ? named(pal, lcol) : "dim" });
            const bb = b.getBoundingClientRect();
            return { id: `tab-${tab}`, type: "col", w: r1(bb.width * k), h: r1(bb.height * k), main: "center", cross: "center", gap: r1((parseFloat(getComputedStyle(b).rowGap) || 0) * k), items: col };
        }) };
    }
    const all = [...shapes, ...items].slice(0, 160);
    all.forEach((it, i) => { it.id = `${(name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 6) || "b")}${i}`; });
    if (row) all.push(row);
    const ef = rgb(getComputedStyle(el).backgroundColor);
    if (ef) all.unshift({ id: "bg" + Math.round(by), type: "rect", g: "tl", dx: 0, dy: 0, w: "fill", h: "fill", fill: named(pal, ef) });
    return { id: (name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "b") + "-" + Math.round(by), name, kind, x: Math.round((bx - origin.x) * k), y: Math.round((by - origin.y) * k), w: Math.round(br.width * k), h: Math.round((Math.min(br.bottom, view.bottom) - by) * k), items: all };
}

// one screen's file: its fields on the first line, then one block per line (as Vellum writes it)
// (portrait blocks, then the landscape ones as "land", each one per line: as Vellum writes it)
const pageText = (p: Record<string, unknown> & { blocks: unknown[]; land?: unknown[] }) => {
    const { blocks, land, ...meta } = p;
    const list = (l: unknown[]) => l.length ? "[\n" + l.map((b) => "  " + JSON.stringify(b)).join(",\n") + "\n]" : "[]";
    return `${JSON.stringify(meta).slice(0, -1)}, "blocks": ${list(blocks)}` + (land ? `, "land": ${list(land)}` : "") + "}\n";
};
const fileName = (name: string) => name.replace(/[\\/:*?"<>|#^[\]]/g, "-").replace(/\s+/g, " ").trim().slice(0, 80) || "Screen";

export async function capture(app: App, shot: Shot): Promise<string | null> {
    // a page still coming in (its groups rise and fade in) is measured as it ends: in a window in the background the
    // moves never run, so the groups would be caught at opacity 0 (a loop, e.g. a loading light, cannot finish: skipped)
    for (const a of shot.appEl.getAnimations({ subtree: true })) { try { a.finish(); } catch { /* endless */ } }
    const ar = shot.appEl.getBoundingClientRect();
    if (ar.width < 1) { new Notice("Capture: the Ledgerline pane is not on screen."); return null; }
    if (!Platform.isMobile && (ar.width < 340 || ar.width > 480)) { new Notice(`Capture: make the Ledgerline pane about a phone's width (it is ${Math.round(ar.width)} px; 360–470), or capture on the phone.`); return null; }
    const W = Platform.isMobile ? window.innerWidth : 428, H = Platform.isMobile ? window.innerHeight : 926;
    // a phone turned sideways: this capture is the screen's landscape layout (its portrait one is kept), and the reverse
    const land = Platform.isMobile && W > H;
    const emuLand = land && W === 832 && H === 407;   // a computer's sideways emulation of the 12 Pro Max (its room only)
    const [PW, PH] = emuLand ? [428, 926] : land ? [H, W] : [W, H];
    const dev = DEVICES.find(([, w, h]) => w === PW && h === PH)?.[0] ?? (Platform.isMobile ? DEVICES.find(([, w]) => w === PW)?.[0] : null) ?? "iphone-12-pro-max";
    const [, DW] = DEVICES.find(([d]) => d === dev)!;
    const k = Platform.isMobile ? 1 : DW / ar.width;
    // on the phone the screen is the window (status bar included); on a computer, and in a computer's phone emulation (no
    // safe areas: make the window the phone's room, 428 × 845), the app starts under a status bar
    const probe = shot.appEl.createDiv(); probe.style.cssText = "position:absolute;visibility:hidden;padding-top:env(safe-area-inset-top)";
    const safe = parseFloat(getComputedStyle(probe).paddingTop) || 0; probe.remove();
    const emu = Platform.isMobile && !safe;
    // the pane's top goes just under the status bar (Obsidian's own header above the pane, if shown, is not the app)
    // (sideways in emulation: the window is the room beside the side insets, 832 × 407 on the 12 Pro Max, and the app sits
    // one inset in from the left edge)
    const origin = !Platform.isMobile ? { x: ar.left, y: ar.top - TOP / k } : emu ? (land ? { x: ar.left - TOP, y: ar.top } : { x: 0, y: ar.top - TOP }) : { x: 0, y: Math.max(0, ar.top - safe) };
    const view = new DOMRect(ar.left, ar.top, ar.width, Platform.isMobile ? Math.min(ar.height, H) : Math.min(ar.height, (H - TOP) / k));
    const pal = palette(app, shot.appEl);
    const blocks = shot.parts.map(([name, kind, el]) => block(el, name, kind, origin, k, pal, view)).filter((b): b is Record<string, unknown> => !!b);
    const page: Record<string, unknown> & { blocks: unknown[]; land?: unknown[] } = { id: shot.id, name: mask(shot.name), ...(shot.parent ? { parent: shot.parent } : {}), ...(shot.link ? { link: mask(shot.link) } : {}), note: `Captured from the app ${new Date().toISOString().slice(0, 10)}${Platform.isMobile ? " on the phone" : ""}.`, blocks };
    // the file: this screen's own (by its id), else a new one by its name; _doc.json keeps the device and the order
    const v = app.vault;
    if (!(v.getAbstractFileByPath(SCREENS) instanceof TFolder)) await v.createFolder(SCREENS);
    const folder = v.getAbstractFileByPath(SCREENS) as TFolder;
    let file: TFile | null = null;
    for (const f of folder.children) if (f instanceof TFile && f.extension === "json" && f.name !== "_doc.json" && (await v.read(f)).startsWith(`{"id":${JSON.stringify(shot.id)},`)) file = f;
    let path = file?.path ?? normalizePath(`${SCREENS}/${fileName(String(page.name))}.json`), n = 2;
    while (!file && v.getAbstractFileByPath(path)) path = normalizePath(`${SCREENS}/${fileName(String(page.name))} ${n++}.json`);
    let had: { blocks?: unknown[]; land?: unknown[] } = {};
    if (file) { try { had = JSON.parse(await v.read(file)); } catch { /* rewritten */ } }
    if (land) { page.land = page.blocks; page.blocks = had.blocks ?? []; } else if (had.land) page.land = had.land;
    if (file) await v.modify(file, pageText(page)); else await v.create(path, pageText(page));
    const dp = `${SCREENS}/_doc.json`, df = v.getAbstractFileByPath(dp);
    let meta: { id: string; device: string; order: string[] } = { id: "ledgerline", device: dev, order: [] };
    if (df instanceof TFile) { try { meta = { ...meta, ...JSON.parse(await v.read(df)) }; } catch { /* rewritten */ } }
    if (!meta.order.includes(shot.id)) meta.order.push(shot.id);
    if (Platform.isMobile) meta.device = dev;
    const text = JSON.stringify(meta, null, 2) + "\n";
    if (df instanceof TFile) await v.modify(df, text); else await v.create(dp, text);
    return path;
}
