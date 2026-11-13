---
title: Ledgerline - Design Rules
date: 2026-11-03
tags:
  - ledgerlineos
  - design
sticker: lucide//ruler
---
> [!abstract]+ How the whole app looks and behaves (core)
> Every page follows these rules, so the app reads as one thing. This note is the **core**: the rules that apply to every page, and an index of the topic notes. Read the core before any UI change, then only the topic notes the index lists for what you build, then the page's Vellum screen (`Docs/Design/Screens/`) and its source file. A shared behaviour is built once (`plugin/src/ui/`, `view.ts`) and reused; a page never makes its own version. A new shared rule is written in the topic note it belongs to first; a rule that applies to every page goes here. Colour tokens: `plugin/css/c.css` (the CSS snippets). Split into a folder 2026-11-10 (was one note); adapted from Morellonomicon's Design Rules (2026-11-03).

## 🗂️ Index: what to read for what you build

| Building or changing | Read |
| :--- | :--- |
| Any page (new or changed layout) | core + [[Rules - Pages]] + [[Rules - Motion]] |
| A chart of any kind (candles, index card, footprint / heat, flows bars, map, block charts) | core + [[Rules - Charts]] + [[Rules - Motion]] |
| Buttons, rows, switches, tabs, swipes, hold-and-drag, search | core + [[Rules - Controls]] |
| A sheet, the number pad, a form, text entry, dates | core + [[Rules - Sheets]] + [[Rules - Motion]] |
| Anything on the Invest tab (home, chart page, holdings, watchlist, tools) | core + [[Rules - Invest]] + [[Rules - Charts]] |
| Sideways or wide panes | core + [[Rules - Pages]] |
| Numbers that animate (flip-dot board, split-flaps) | core + [[Rules - Motion]] |

Mocks: a new page is proposed as a **Vellum screen marked mock** in `Docs/Design/Screens/` (one JSON file per screen), picked by the owner, then built. the old layout editor (retired) is the old editor: read-only history, not for new mocks.

## 🎨 The C look (every page)
- **Kinds of page.** Every page is a **C home**, a **C detail** or a **C list** ([[Rules - Pages]]), built from the shared parts in `plugin/src/ui/c.ts`. A new page picks its kind first; it never invents its own number block, row, chart, sheet or motion.
- **Surface.** Paper (light) / charcoal (dark), ink text, thick ink rules (2 px between parts, 4 px under the masthead and over the bottom bar), **square corners everywhere** (Obsidian's rounded buttons, shadows and hover fills are cleared). Light and dark are designed together; every colour is a token, never a hex.
- **Type.** Display: **Anton** (titles, big numbers, names that should read at a glance). Body: **IBM Plex Mono** (labels 14 px in sentence case, "Left today"; a line under a label 13 px muted; numbers in rows Plex 15, bold for the amount). Pixel: **Silkscreen**, only for section heads (12 px, capitals), the tab bar (11 px) and short tags. Tabular digits wherever digits line up.
- **Colour means something.** Ink for normal numbers; `--zl-loud` only for what costs you or needs you (debt left, you owe, over budget, money out, a rule not met, a warning, the main action) and for a target reached in a chart; muted for set-aside, empty or settled. Labels and titles stay neutral; never a colour for decoration. Muted text keeps at least 4.5 : 1 against its surface in both themes.
- **Up / down colours** (Invest and every chart): `--zl-up` / `--zl-down` (`--zl-tile-up` / `--zl-tile-down` on split-flap tiles, `--zl-mark` chart-only). **台股 red up, green down is the default** (owner, 2026-11-10; Settings › Red up, green down; off = Malachite up / Coral down, body class `zl-red-up`). Up / down never replace loud: loud stays for warnings, drift and actions. MB 20 (`--zl-mb`, amber) and MA60 (`--zl-ma60`, blue) are chart-only line colours, never loud.
- **US times** (owner, 2026-11-10): US chart labels, the crosshair time and the source line show the phone's time by default; Settings › "US times in New York time" (body class `zl-us-ny`) shows New York's. Bars stay keyed by New York's clock; day bars keep the exchange's date.
- **No emoji, pixel icons only.** Every row starts with a 20 px **9 × 9 pixel sprite** in ink (`ui/pixel.ts`: pages pass one, else `rowSprite` picks it from the label; an older Lucide name maps to its twin with `pixelFor`). A new concept gets a new sprite, never a Lucide icon or emoji (emoji stored in data are not shown).
- **Titles are English.** The masthead never shows Chinese; a CJK run that reaches a title anyway gets its own span (`titleText`, CSS `zl-cjk`: heavy CJK face at 0.8 em, lifted a little). 外資 / 投信 / 自營商 stay in rows and summaries.
- **Say what a number is.** A number someone can change carries a line under its label that says what it means in plain words ("60% of the money left to spend"); its pad has one sentence on what typing there does. No bare jargon ("Quota"). Short dates ("Oct 5", the year only if not this year), thousands separators, no currency except on a summary.
- **One screen.** Every page fits its room and never scrolls; only a C list scrolls, and only its growing list ([[Rules - Pages]] › Room).
- **Space is kept, passing things float** (owner, 2026-11-10). Anything that arrives later (a quote, a sector line, a read-out, a LATEST link, a REL line) has its room from the first frame (a dim bar, a blank line, `visibility: hidden`, a `min-height`), so nothing below it moves; anything temporary (a hint, its explanation, a crosshair read-out, a toast) floats over the page and never pushes it.
- **Motion budget.** One thing is the show at a time; every move is over within about 0.35 s (loading lights may loop). Reuse the moves in [[Rules - Motion]]; never add a new kind. **Calm motion** (Settings › Calm motion or the system's reduce motion) turns every move off: pages swap, numbers just change.

## 🧩 Shared parts (reuse, never rebuild)
`sec` (section head in pixel type, optional "MORE ›"), `figures` (56 px rows: sprite, label, number right, optional line under, › when it opens), `summary` (its `key` makes each page's number its own), `homeTop` (board + readouts), `tileGrid` / `gridOf` ("+N" tile past the room), block charts (`waffle`, `stairs`, `towers`, `budgetBar`, `grid()` + `blocks()`), `dropRow` / `trimSteps` (one-screen trims), the bottom bar (`dock`), `Flap` (`ui/flap.ts`, split-flaps), `FlipDot` (`ui/flipdot.ts`), `scrub` (`ui/scrub.ts`, hold and drag), `FormSheet` / `MonthSheet` (`ui/sheet.ts`), `openPad` (`pages/amount.ts`), the ticker chart (`ui/chart.ts`), the market card (`ui/market.ts`), K effects (`ui/keffects.ts`, rules in `calc/keffects.ts`), the search bar (`ui/search.ts`), haptics (`ui/haptic.ts`), the pager (`ui/pager.ts`).

## ✅ Check after every page change
- Before the phone test the agent screenshots the page at 428 × 926 (`plugin/scripts/phone.mjs shot`) in both themes if colours changed, and fixes overflow, holes and misaligned edges first.
- The report of a UI change names: the page kind used, where the top number and the main action sit ([[Rules - Pages]] › Gravity), whether the screen is balanced, which colours carry which meaning, which shared parts and moves were reused, and what can only be seen on the phone. Checks that must wait go into the test checklist (folio).
