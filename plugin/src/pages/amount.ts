import { Notice } from "obsidian";
import { num } from "../format";
import { t } from "../i18n";
import { h, page } from "../ui";
import { Flap } from "../ui/flap";
import { keepTaps } from "../ui/sheet";
import { calm } from "../ui/pixel";
import type { PageCtx, PageOut } from "./index";

// Readability redesign (2026-11-04): entering an amount is a bottom drawer over the page, not a page of its own. The page
// stays in view, dimmed, above it. The drawer: what and where, what is there already, ADD TO IT / REPLACE, the amount as a
// split-flap with a fixed count of tiles (a sign tile, then room for the widest amount; 0 until a digit is typed; owner,
// 2026-11-09), the new total, +50 / +100 / +200 chips, the 3 × 4 ruled pad,
// CANCEL and a loud SAVE with the amount. Tapping the dimmed page cancels.
const MAX = 7;                 // whole digits
const BLANK = "\u00a0";       // a blank tile (ui/flap.ts)

export interface AmountSpec {
    title: string;               // what (item name)
    sub: string;                 // where (the day, the month)
    current: number;             // stored now
    cur: string;
    save(n: number): Promise<void>;
    remove?: { text: string; run(): Promise<void> };   // e.g. a one-time item
    note?: string;               // one plain line on what this number is (e.g. what a budget limit means)
    setOnly?: boolean;           // the number replaces the old one (a limit, a price), so no ADD TO IT / REPLACE words
    dec?: number;                // decimals it takes (sheet kit: prices, shares): the CLEAR key becomes "."
    chips?: number[];            // the + chips (default +50 / +100 / +200; [] for none)
    host?: HTMLElement;          // where it opens (a sheet's pop-up), else over the app
}
// the typed digits as shown: thousands separators on the whole part, the decimals as typed
const shown = (s: string): string => { const [a, b] = s.split("."); return num(Number(a || "0")) + (b !== undefined ? `.${b}` : ""); };

let flap: Flap | null = null;
let openNow: (() => void) | null = null;   // closes the drawer that is open (one at a time)

export const openPad = (_ctx: PageCtx, o: AmountSpec): void => {
    openNow?.();
    const host = o.host ?? (document.querySelector(".workspace-leaf.mod-active .zl-app") ?? document.querySelector(".zl-app")) as HTMLElement | null;
    if (!host) return;
    const st = { s: "", mode: (o.current > 0 && !o.setOnly ? "add" : "set") as "add" | "set" };
    const wrap = h(host, "div", "zl-drw-wrap");
    if (o.host) keepTaps(wrap);   // over a sheet: its taps stay here (the dim closed the sheet too)
    const scrim = h(wrap, "div", "zl-drw-scrim");
    const d = h(wrap, "section", "zl-drw");
    d.setAttribute("role", "dialog");
    d.setAttribute("aria-label", `${o.title} · ${o.sub}`);

    const head = h(d, "div", "zl-drw-head");
    h(head, "span", "zl-drw-t", `${o.title} · ${o.sub.toLowerCase() === t("today").toLowerCase() ? o.sub.toLowerCase() : o.sub}`);
    if (o.current > 0) h(head, "span", "zl-drw-now", t("cAlready", { n: num(o.current) }));
    if (o.note) h(d, "p", "zl-c-note zl-drw-note", o.note);

    const words = h(d, "div", "zl-drw-words");
    const word = (m: "set" | "add", label: string) => {
        const b = h(words, "button", "zl-drw-word" + (st.mode === m ? " is-on" : ""), label.toUpperCase());
        b.addEventListener("click", (e) => { e.preventDefault(); st.mode = m; words.querySelectorAll(".zl-drw-word").forEach((x) => x.toggleClass("is-on", x === b)); paint(); });
    };
    if (o.current > 0 && !o.setOnly) { word("add", t("cAddTo")); word("set", t("cSetTo")); } else words.remove();

    if (!flap) flap = new Flap("amt");
    const fb = h(d, "div", "zl-drw-flap");
    fb.appendChild(flap.el);
    const totalRow = h(d, "div", "zl-drw-total");
    const totalK = h(totalRow, "span", "", t("cNewTotal"));
    const totalV = h(totalRow, "strong");

    const chips = h(d, "div", "zl-drw-chips");
    const dec = o.dec ?? 0;
    const W = MAX + Math.floor((MAX - 1) / 3) + (dec ? dec + 1 : 0);   // tiles for the widest amount, separators included
    if (o.chips && !o.chips.length) chips.remove();
    for (const n of o.chips ?? [50, 100, 200]) {
        const c = h(chips, "button", "zl-drw-chip", `+${n}`);
        c.addEventListener("click", (e) => { e.preventDefault(); st.s = String(Math.min(10 ** MAX - 1, value() + n)); paint(); });
    }

    const pad = h(d, "div", "zl-drw-pad");
    for (const k of ["1", "2", "3", "4", "5", "6", "7", "8", "9", dec ? "." : "C", "0", "<"]) {
        const b = h(pad, "button", "zl-drw-key" + (k === "C" ? " is-fn" : k === "<" ? " is-del" : ""), k === "C" ? t("cClear").toUpperCase() : k === "<" ? "⌫" : k);
        b.setAttribute("aria-label", k === "C" ? t("cClear") : k === "<" ? t("cDelete") : k);
        b.addEventListener("click", (e) => { e.preventDefault(); press(k); });
    }

    const acts = h(d, "div", "zl-drw-acts" + (o.remove ? " has-rm" : ""));
    if (o.remove) {
        const r = o.remove;
        const rm = h(acts, "button", "zl-drw-b is-rm", r.text.toUpperCase());
        rm.addEventListener("click", (e) => { e.preventDefault(); void r.run().then(close); });
    }
    const cancel = h(acts, "button", "zl-drw-b", t("cancel").toUpperCase());
    cancel.addEventListener("click", (e) => { e.preventDefault(); close(); });
    const save = h(acts, "button", "zl-drw-b is-loud");
    save.addEventListener("click", (e) => { e.preventDefault(); void doSave(); });
    scrim.addEventListener("click", (e) => { e.preventDefault(); close(); });

    const value = () => { const n = Number(st.s || "0"); return dec ? Math.round(n * 10 ** dec) / 10 ** dec : n; };
    const total = () => (st.mode === "add" ? o.current + value() : value());
    function paint(dir?: "del"): void {
        // the same count of tiles every time: where ADD TO IT is offered the first is the sign's (blank on REPLACE), the
        // amount sits on the right
        const body = st.s ? (dec ? shown(st.s) : num(value())) : "0";
        const lead = o.current > 0 && !o.setOnly ? (st.mode === "add" ? "+" : BLANK) : "";
        flap!.set(lead + body.padStart(W, BLANK), dir);
        // a long amount scales the row of tiles down to fit, keeping it right-aligned
        flap!.el.style.transform = "";
        const room = fb.clientWidth, w = flap!.el.scrollWidth;
        if (room && w > room) flap!.el.style.transform = `scale(${room / w})`;
        totalRow.toggleClass("is-off", !(o.current > 0));
        totalK.textContent = o.sub.toLowerCase() === t("today").toLowerCase() ? t("cNewTotalToday") : t("cNewTotal");
        totalV.textContent = num(total());
        save.textContent = st.s ? `${t("save").toUpperCase()} ${dec ? shown(st.s) : num(total())} →` : t("save").toUpperCase();
    }
    function press(k: string): void {
        if (k === "C") st.s = "";
        else if (k === "<") st.s = st.s.slice(0, -1);
        else if (k === ".") { if (!st.s.includes(".")) st.s = (st.s || "0") + "."; }
        else {
            const [a, b] = st.s.split(".");
            if (b !== undefined ? b.length >= dec : a.length >= MAX) return;   // at most MAX whole digits, dec decimals
            st.s = (st.s + k).replace(/^0+(?=\d)/, "");
        }
        paint(k === "<" ? "del" : undefined);   // a delete runs from the leftmost tile
    }
    // a hardware keyboard (desktop, an iPad keyboard): digits, Backspace, Escape closes, Enter saves
    const onKey = (e: KeyboardEvent) => {
        if (/^[0-9]$/.test(e.key) || (dec && e.key === ".")) press(e.key);
        else if (e.key === "Backspace") press("<");
        else if (e.key === "Escape") close();
        else if (e.key === "Enter") void doSave();
        else return;
        e.preventDefault();
        e.stopPropagation();
    };
    document.addEventListener("keydown", onKey, true);

    let busy = false;
    async function doSave(): Promise<void> {
        if (busy) return;
        if (!st.s) { new Notice(t("cTypeAmount")); return; }
        busy = true;
        try { await o.save(total()); close(); } finally { busy = false; }
    }
    let closed = false;
    function close(): void {
        if (closed) return;
        closed = true;
        if (openNow === close) openNow = null;
        document.removeEventListener("keydown", onKey, true);
        if (calm()) { if (o.host) { wrap.style.opacity = "0"; window.setTimeout(() => wrap.remove(), 450); } else wrap.remove(); return; }
        wrap.addClass("is-out");
        window.setTimeout(() => wrap.remove(), o.host ? 450 : 200);
    }
    openNow = close;
    paint();
    if (!calm()) requestAnimationFrame(() => wrap.addClass("is-in")); else wrap.addClass("is-in", "is-still");
};

// An old "pad:…" frame (saved in the page stack before the drawer) has no spec any more: it goes back at once.
export const padPage = (ctx: PageCtx): PageOut => {
    window.setTimeout(() => ctx.pop(), 0);
    return { title: ctx.frame.title, el: page(ctx.frame.title) };
};
