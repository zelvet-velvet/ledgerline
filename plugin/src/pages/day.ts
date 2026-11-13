import { Notice } from "obsidian";
import { IGNORE, slug } from "../calc/log";
import { FILES, FM } from "../data/store";
import { localDate, num, parseNum, shortDate, today, ymd } from "../format";
import { t } from "../i18n";
import { C, colorFor, empty, group, h, monthBar, page, row } from "../ui";
import { bigLabel, sec, tileGrid } from "../ui/c";
import { confirmSheet, FormSheet, openText } from "../ui/sheet";
import type { PageCtx, PageOut } from "./index";
import { openPad } from "./amount";
import { notchFor, ScrubOpts } from "../ui/scrub";

const cap = (s: string) => { const x = String(s).replace(/_/g, " "); return x.charAt(0).toUpperCase() + x.slice(1); };
export const dayTitle = (date: string): string => localDate(date).toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" });
export const dayFrame = (date: string) => ({ key: "day:" + date, title: date === today() ? t("today") : dayTitle(date) });

// ---- an old "amt:<date>:<prop>" frame (before the amount drawer): it goes back at once
export const dayAmountPage = (ctx: PageCtx, key: string): PageOut => {
    window.setTimeout(() => ctx.pop(), 0);
    return { title: ctx.frame.title, el: page(key) };
};

// one item on one day, typed in the amount drawer over the day page; a one-time item can be removed there
const editDayAmount = (ctx: PageCtx, date: string, prop: string, isCustom: boolean): void => {
    const { store, settings } = ctx.plugin;
    const name = cap(prop), cur = settings.baseCurrency, note = store.day(date);
    if (!note) return;
    const val = Number(note.fm[prop]) || 0;
    const write = (fn: (f: FM) => void) => store.update(note.path, fn);
    openPad(ctx, {
        title: name, sub: date === today() ? t("today") : shortDate(date), current: val, cur,
        save: async (n) => { await write((f) => { f[prop] = n; }); new Notice(t("savedX", { name, amount: num(n), cur })); },
        remove: isCustom && val ? { text: t("remove"), run: async () => { await write((f) => { delete f[prop]; }); new Notice(t("removedX", { name })); } } : undefined,
    });
};

// ---- + Add expense as a sheet (kit K, owner picked "tile → pad" 2026-11-05): the day on top, the day page's tiles under it
// (each item with what it has that day). Tap a tile = the number pad for it (ADD TO IT / REPLACE); its SAVE closes both.
// Hold and drag a tile to nudge it (saved on let go, the sheet stays). + OTHER asks the name in the writing window, then the pad.
const OTHER = "\u0000other";
export const expenseSheet = (ctx: PageCtx, date0 = today()): void => {
    const { store, settings } = ctx.plugin;
    const cur = settings.baseCurrency;
    const [y, m] = date0.split("-").map(Number);
    const itemsOf = store.monthData(y, m - 1).daily.flatMap((b) => b.spending);
    const fmOf = (d: string) => store.day(d)?.fm ?? {};
    const when = (d: string) => (d === today() ? t("today") : shortDate(d));
    const write = async (d: string, k: string, n: number) => {
        if (!store.day(d)) await store.createDay(d);
        const note = store.day(d);
        if (!note) return;
        await store.update(note.path, (f) => { f[k] = n; });
        new Notice(t("savedX", { name: cap(k), amount: num(n), cur }));
    };
    const pad = (d: string, k: string, close: () => void, host: HTMLElement) => openPad(ctx, {
        title: cap(k), sub: when(d), current: Number(fmOf(d)[k]) || 0, cur, host,
        save: async (n) => { await write(d, k, n); close(); },
    });
    new FormSheet(ctx.app, {
        title: t("cAddExpense"),
        fields: [
            { key: "date", label: t("date"), type: "date", value: date0, required: true },
            { key: "item", label: t("cItem"), type: "grid",
                cells: (v) => {
                    const fm = fmOf(v.date || date0);
                    const extra = Object.keys(fm).filter((k) => !IGNORE.includes(k) && typeof fm[k] === "number" && !itemsOf.includes(k) && Number(fm[k]) !== 0);
                    return [...itemsOf, ...extra].map((k) => { const o = Number(fm[k]) || 0; return { value: k, k: cap(k).toUpperCase(), v: num(o), dim: !o }; })
                        .concat([{ value: OTHER, k: t("cOther").toUpperCase(), v: "+", dim: true }]);
                },
                tap: (k, v, sh) => {
                    const d = v.date || date0;
                    if (k !== OTHER) { pad(d, k, sh.close, sh.host); return; }
                    openText(sh.host, { title: t("addOneTime"), sub: when(d), value: "", placeholder: t("whatHint"), save: (name) => {
                        const key = itemKey(name);
                        if (!slug(name) || !key) { new Notice(t("needName")); return; }
                        pad(d, key, sh.close, sh.host);
                    } });
                },
                hold: (k, v) => {
                    if (k === OTHER) return null;
                    const d = v.date || date0;
                    return { value: Number(fmOf(d)[k]) || 0, step: notchFor(cur), label: cap(k), fmt: num, done: (n) => { void write(d, k, n); } };
                } },
        ],
        onSubmit: async () => false,
    }).open();
};

// ---- one day: what was spent per daily item (the daily note's frontmatter), one-time expenses, the month's budget left per group
export const dayPage = (ctx: PageCtx, date: string, notePath?: string): PageOut => {
    const { store, settings } = ctx.plugin;
    const cur = settings.baseCurrency;
    const title = dayTitle(date);
    const el = page(dayFrame(date).title);
    const shift = (n: number) => { const d = localDate(date); d.setDate(d.getDate() + n); return ymd(d); };
    const pick = () => new FormSheet(ctx.app, {
        title: t("chooseDay"), submitText: t("go"),
        fields: [{ key: "d", label: t("date"), type: "date", value: date }],
        onSubmit: async (v) => { if (v.d) ctx.replace(dayFrame(v.d)); },
    }).open();
    el.addClass("zl-has-bar");
    monthBar(el, shortDate(shift(-1)), title, shortDate(shift(1)), (s) => (s ? ctx.replace(dayFrame(shift(s))) : pick()));

    const own = notePath ? store.fm(notePath) : null;   // in a note: that note, wherever it is
    const note = own && notePath ? { name: date, path: notePath, fm: own } : store.day(date);
    if (!note) {
        empty(el, { icon: "calendar-plus", title: t("noDay"), text: t("noDaySub"), button: t("startDay"), onTap: () => {
            void store.createDay(date).then(() => new Notice(t("dayStarted", { date: title })), (e) => new Notice(String(e instanceof Error ? e.message : e)));
        } });
        return { title: dayFrame(date).title, el };
    }

    const [y, m] = date.split("-").map(Number);
    const { daily, M } = store.monthData(y, m - 1);
    const fm = note.fm;
    const defined = new Set(daily.flatMap((b) => b.spending));
    const custom = Object.keys(fm).filter((k) => !IGNORE.includes(k) && typeof fm[k] === "number" && !defined.has(k) && Number(fm[k]) !== 0);
    const total = [...defined, ...custom].reduce((s, k) => s + (Number(fm[k]) || 0), 0);
    el.addClass("zl-c-stack");
    const top0 = h(el, "div", "zl-c-group");
    const big = h(top0, "div", "zl-c-big" + (total > 0 ? "" : " is-dim"), num(total));
    big.setAttribute("aria-label", t("spentOnDay"));
    const tq = M.budget.reduce((s, x) => s + x.quota, 0), ts = M.budget.reduce((s, x) => s + x.spent, 0);
    const now = new Date(), isToday = date === today();
    const dim = new Date(y, m, 0).getDate(), daysLeft = dim - now.getDate() + 1;
    const leftToday = Math.round(Math.max(0, tq - ts + total) / Math.max(1, daysLeft) - total);
    bigLabel(top0, `${t("spentOnDay")} · ${cur}`, isToday ? `${t("cLeftToday")} ${num(leftToday)}` : undefined);
    const write = (fn: (f: FM) => void) => store.update(note.path, fn);
    const edit = (prop: string, isCustom: boolean) => editDayAmount(ctx, date, prop, isCustom);
    // hold and drag a tile up / down to set it here; a tap still opens the pad to type an exact amount
    const step = notchFor(cur);
    const drag = (prop: string) => (): ScrubOpts => ({
        value: Number(fm[prop]) || 0, step, label: cap(prop), fmt: num,
        live: (n) => { const d = n - (Number(fm[prop]) || 0); big.textContent = num(total + d); big.toggleClass("is-dim", total + d <= 0); },
        done: (n) => { void write((f) => { f[prop] = n; }).then(() => new Notice(t("savedX", { name: cap(prop), amount: num(n), cur }))); },
    });
    // every daily item is a tile, grouped under its budget group (what is left this month on the right)
    daily.forEach((bg, i) => {
        const left = M.budget[i];
        const g = h(el, "div", "zl-c-group");
        const head = sec(g, (bg.name || t("groupN", { n: i + 1 })).toUpperCase());
        if (left) { const r = h(head, "span", "zl-sec-go" + (left.remain < 0 ? " is-hot" : ""), `${num(left.remain)} ${t("cLeft").toUpperCase()}`); r.setAttribute("aria-label", t("leftMonthN", { left: num(left.remain) })); }
        if (!bg.spending.length) { h(g, "div", "zl-gf", t("noItems")); return; }
        tileGrid(g, bg.spending.map((p) => { const v = Number(fm[p]) || 0; return { k: cap(p).toUpperCase(), v: num(v), dim: !v, onTap: () => edit(p, false), scrub: drag(p) }; }));
    });
    if (custom.length) {
        const g = h(el, "div", "zl-c-group");
        sec(g, t("oneTime").toUpperCase());
        tileGrid(g, custom.map((p) => ({ k: cap(p).toUpperCase(), v: num(fm[p]), hot: true, onTap: () => edit(p, true), scrub: drag(p) })));
    }
    if (daily.length || custom.length) h(el, "div", "zl-c-note zl-scrub-hint", t("cScrubHint"));
    if (!daily.length && !custom.length) empty(el, { icon: "list", title: t("noItems"), button: t("dailyItems"), onTap: () => ctx.push({ key: "items", title: t("dailyItems") }) });

    const add = () => expenseSheet(ctx, date);
    return { title: dayFrame(date).title, el,
        actions: [{ icon: "list", label: t("dailyItems"), onTap: () => ctx.push({ key: "items", title: t("dailyItems") }) }],
        fab: { icon: "plus", text: t("cAddExpense").toUpperCase(), label: t("cAddExpense"), onTap: add } };
};

// ---- daily items (Config "Daily Expenses Config"): budget groups, each a share of the spendable money, with its items
type Raw = FM & { name?: string; quota?: number; spending?: unknown };
const rawGroups = (ctx: PageCtx): Raw[] => {
    const b = ctx.plugin.store.fm(ctx.plugin.store.path(FILES.daily))?.budget;
    return ((Array.isArray(b) ? b : []) as Raw[]).map((g) => ({ ...g, spending: (Array.isArray(g.spending) ? g.spending : g.spending ? [g.spending] : []).map(String) }));
};
const items = (g: Raw) => g.spending as string[];
const saveGroups = (ctx: PageCtx, fn: (gs: Raw[]) => void) => ctx.plugin.store.update(ctx.plugin.store.path(FILES.daily), (f) => { const gs = rawGroups(ctx); fn(gs); f.budget = gs; });
const pctTotal = (gs: Raw[], skip = -1) => gs.reduce((s, g, i) => s + (i === skip ? 0 : Number(g.quota) || 0), 0);
const itemKey = (s: string) => s.trim().toLowerCase().replace(/\s+/g, "_");

const groupSheet = (ctx: PageCtx, gs: Raw[], i: number) => {
    const g = gs[i];
    new FormSheet(ctx.app, {
        title: g ? g.name || t("groupN", { n: i + 1 }) : t("newGroup"), subtitle: t("groupSub"), submitText: g ? t("save") : t("add"),
        fields: [
            { key: "name", label: t("name"), type: "text", value: g?.name ?? "", required: true },
            { key: "pct", label: t("share"), type: "number", suffix: "%", value: g ? Number(g.quota) || 0 : "", required: false },
        ],
        validate: (v) => {
            const p = v.pct === "" ? 0 : parseNum(v.pct);
            if (!v.name.trim()) return t("needName");
            if (isNaN(p) || p < 0) return t("invalidNumber");
            return pctTotal(gs, i) + p > 100 ? t("over100", { n: pctTotal(gs, i) + p }) : null;
        },
        onSubmit: async (v) => {
            const quota = v.pct === "" ? 0 : parseNum(v.pct), name = v.name.trim();
            await saveGroups(ctx, (all) => { if (all[i]) Object.assign(all[i], { name, quota }); else all.push({ name, quota, daily: true, spending: [] }); });
            new Notice(t("itemsSaved"));
        },
    }).open();
};

export const itemsPage = (ctx: PageCtx): PageOut => {
    const gs = rawGroups(ctx);
    const el = page(t("dailyItems"));
    const total = pctTotal(gs);
    if (!gs.length) empty(el, { icon: "list", title: t("noGroups") });
    else {
        const g = group(el, undefined, t("pctTotal", { n: total }) + (total > 100 ? " · " + t("over100", { n: total }) : ""));
        gs.forEach((x, i) => row(g, { icon: "circle", tint: colorFor(i), title: x.name || t("groupN", { n: i + 1 }), sub: items(x).map(cap).join(", ") || t("noItems"),
            value: `${Number(x.quota) || 0}%`, chevron: true, onTap: () => ctx.push({ key: "items:" + i, title: x.name || t("groupN", { n: i + 1 }) }) }));
    }
    return { title: t("dailyItems"), el, fab: { icon: "plus", text: t("newGroup").toUpperCase(), label: t("newGroup"), onTap: () => groupSheet(ctx, gs, gs.length) } };
};

export const itemGroupPage = (ctx: PageCtx, i: number): PageOut => {
    const gs = rawGroups(ctx);
    const g = gs[i];
    if (!g) return itemsPage(ctx);
    const name = g.name || t("groupN", { n: i + 1 });
    const el = page(name);
    const head = group(el);
    row(head, { icon: "pencil", tint: C.accent, title: t("nameAndShare"), sub: t("shareHint"), value: `${Number(g.quota) || 0}%`, chevron: true, onTap: () => groupSheet(ctx, gs, i) });

    const list = group(el, t("items"), t("itemsHint"));
    for (const it of items(g)) row(list, { icon: "circle-small,dot", tint: colorFor(i), title: cap(it), onTap: async () => {
        if (!(await confirmSheet(ctx.app, t("removeItem", { name: cap(it) }), t("removeItemSub"), t("remove")))) return;
        await saveGroups(ctx, (all) => { all[i].spending = items(all[i]).filter((x) => x !== it); });
        new Notice(t("removedX", { name: cap(it) }));
    } });
    row(list, { icon: "plus", tint: C.accent, title: t("addItem"), titleColor: C.accent, onTap: () => new FormSheet(ctx.app, {
        title: t("addItem"), subtitle: name, submitText: t("add"),
        fields: [{ key: "name", label: t("name"), type: "text", required: true }],
        validate: (v) => { const k = itemKey(v.name); return !k ? t("needName") : gs.some((x) => items(x).includes(k)) ? t("itemExists", { name: cap(k) }) : null; },
        onSubmit: async (v) => { const k = itemKey(v.name); await saveGroups(ctx, (all) => { all[i].spending = [...items(all[i]), k]; }); new Notice(t("itemsSaved")); },
    }).open() });

    row(group(el), { icon: "trash-2", tint: C.neg, title: t("deleteGroup"), titleColor: C.neg, onTap: async () => {
        if (!(await confirmSheet(ctx.app, t("deleteGroup"), t("deleteGroupSub", { name }), t("delete")))) return;
        await saveGroups(ctx, (all) => { all.splice(i, 1); });
        new Notice(t("removedX", { name }));
        ctx.pop();
    } });
    return { title: name, el };
};
