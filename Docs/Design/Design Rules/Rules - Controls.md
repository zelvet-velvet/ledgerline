---
title: Ledgerline - Rules - Controls
tags:
  - ledgerlineos
  - design
sticker: lucide//sliders-horizontal
---
> [!abstract]+ Buttons, rows, switches, tabs, swipes, hold and drag, search
> Part of [[Design Rules]] (read the core first). Press motion: [[Rules - Motion]] › Presses.

## 🔘 Buttons and rows
- **A press inverts** (C), never a grey disc or box (it stays after the tap on a phone). Obsidian's button look (rounded corners, shadow, hover fill) is cleared for every button in the app; buttons are square.
- **Main action:** the bottom bar's button, filled loud with an ink drop shadow; secondary = outlined; Back outlined beside it ([[Rules - Pages]] › Gravity).
- **Rows** are at least 52 px (figure rows 56 px): sprite, label left (Plex, sentence case), number right, a › when the row opens or edits. Each has 12 px above and below its text; rows never touch.
- **Links** are text with a › (All payments ›, N MORE ›); loud only when they carry a warning count (MIX 2 WARNINGS ›).
- **Touch targets** are at least 44 × 44 px (a small chip gets an invisible 44 px target, `::after`).

## 🔀 Switches
- **A choice of two or three is words side by side**, never a dropdown. In C it is a **boxed segment**: words in a 1.5–2 px ink box split by rules, the chosen one inverted (ink fill, paper text): CANDLE | FOOTPRINT | HEAT, BUY | SELL, 5 | 20 days, TW | US (`zl-fmode`; `is-sm` for a small one over a plot). Interval strips are the same, longest to shortest.
- **Small toggles** (a line on a chart): pixel words in a thin box, on = ink border and colour, off = muted with a hollow swatch (`zl-ch-chip`).
- **On / off** (picked 2026-11-10 in the Long-Term Holder Tools artifact, first use: Alerts): a square switch, never a round iOS pill: a box with a square knob, on = ink filled, knob paper.
- A switch on a page changes it in place ([[Rules - Motion]] › No blink); a switch inside a chart fades the plot ([[Rules - Motion]] › Charts).

## 🧭 Tabs and pages
- **Tab bar.** Five tabs (Debt · Invest · Log · Ledger · Goals; order set in Settings), pixel icons with 11 px pixel labels; the chosen one's label turns ink and its icon turns loud and lifts 3 px (sideways: moves 3 px left); nothing else.
- **Tabs inside a card** (the market card): a boxed segment of pixel words (1 px rules, 30 px tall), the chosen one inverted; a dot on the ones whose market trades.
- **Same tab again.** Tapping the tab you are on scrolls to the top; tapping it again goes back to its first page.
- **Masthead.** A tab's first page has the large title; a deeper page has ‹ and its title; the top right holds rare things only (pixel icons). A TRADING / OPENS / CLOSED badge sits beside an Invest title ([[Rules - Invest]]).
- Moving between pages: [[Rules - Motion]] › Pages coming in.

## ✋ Hold and drag, swipes
- **Changing an amount by hand: hold and drag first.** A tile or row whose amount is often nudged (a day's item, a budget limit, a price in a sheet) takes *hold ~0.3 s, drag up / down, let go to save* (`scrub` in `ui/scrub.ts`; `tileGrid` / `figures` take `scrub`): the held block turns loud, a bubble above the finger shows what, the amount and the change; steps are one notch (10 in TWD, the exchange's tick for a price) and grow the further the finger goes; the page never scrolls while dragging. A tap still opens the pad for an exact number. Prefer it over pushing a page.
- **Parallel things are cards** (a card pager, `ui/pager.ts`, from Morellonomicon's `championCard`): the cards follow the finger sideways and land on one (not the browser's scroll snapping). One swipe feel: `SWIPE` (slop 6 px, horizontal bias 0.7, lands at 25 % of the width or a flick of 0.5 px/ms over 24 px). A dot per card under the pager (at most 7, else "3 / 12"). Tapping a card opens its detail; a card never holds controls. Cards are square with the C rules, no shadow except while lifted.
- **A strip that runs by itself** (the watchlist marquee): moved by a transform from script (a phone smooths and stops the browser's own scroll); a finger drags it either way and it loops; let go, it keeps the flick's speed and eases back into its run; it never redraws under a finger; three or fewer cells stand still; Calm motion: no run.
- **Sideways swipes stay in the page** on Invest home and chart pages (no Obsidian sidebar).
- **Haptics** (`ui/haptic.ts`, Morellonomicon's method): a tick on a date step, a scrub step and a calendar pick where the phone has native haptics; the iOS switch tick only works inside a tap (Settings › Test haptic says which way this phone ticks).

## 🔎 Search = a browser bar (owner, 2026-11-04)
The magnifier turns the masthead into a search field across the top line (title and buttons give way, CANCEL on the right, hint "Ticker or name") and the keyboard opens at once; the bar sits just above the keyboard. With nothing typed: RECENT searches (CLEAR), one list scrolling on its own (no watchlist here: the marquee on Invest home shows it, owner 2026-11-13); while typing: yours first (HELD / WATCHING), then TWSE listings by code or Chinese name, then Yahoo. Enter opens what was typed. `ui/search.ts`, no sheet.
