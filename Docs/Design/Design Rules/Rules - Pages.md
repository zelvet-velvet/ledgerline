---
title: Ledgerline - Rules - Pages
tags:
  - ledgerlineos
  - design
sticker: lucide//layout-dashboard
---
> [!abstract]+ Page kinds, grid, room, gravity, sideways, wide panes
> Part of [[Design Rules]] (read the core first). Where each page's blocks sit: its Vellum screen in `Docs/Design/Screens/`.

## 📐 Grid
- **Phone frame.** Pages are designed in phone px, **428 × 926** (the owner's iPhone, debug log 2026-11-03; masthead about 90, tab bar about 86, bottom bar 68). Agents check a page at this size in desktop Obsidian with `plugin/scripts/phone.mjs` before the phone test.
- **Margins and steps.** Sides keep **16 px**; sizes and gaps go in **4 px steps**; blocks are **12 px** apart; neighbours share edges and widths. Two tiles side by side are **171 px** each with a 16 px gap (on the 390 px frame; they stretch evenly on wider phones).

## 🧱 Page kinds
- **C home** (a tab's first page, one screen, never scrolls; `zl-c-stack`; every tab has one chart: Log waffle + budget bars, Debt staircase, Goals funds grid (each fund its own pixel picture, loud when a goal of it is short), Ledger balance beam, Invest market card): `homeTop` (the flip-dot **board** with the one number, one line under it: what the number is on the left in plain words, "Left to spend this month", and one plain fact on the right, "≈ 162 a day", "−1.7%", "0% paid"; at most two split-flap **readouts**, each a row with its label left and the tiles right) → one **chart** group → one **figures** group of at most 4 rows (more: a "N MORE ›" head or a sub page) → the action in the bottom bar. Log, Debt, Ledger, Goals, Invest (Invest home: [[Rules - Invest]]).
- **C detail** (one thing, one tap deeper): `summary` (pixel label, the number in display type, up to three small figures under a hairline) → `figures` rows of its numbers (a tap changes one) → the action in the bottom bar. Loan details, a fund, a goal, a friend (balance, SETTLE UP, latest lines), Accounts. A chart page is a C detail whose chart takes the room left ([[Rules - Invest]] › Chart page).
- **C list** (many things; scrolls; `zl-c-list`, always starts at the top): `summary` → a `sec` head → `figures`, newest first. Payment history, all activity, a friend's whole history by month, a fund's goals, a goal's expenses, one purpose's accounts, every fund (the ALL › pages behind one-screen pages).
- **Older pages** (Log's sub pages, daily items, sheets' lists) still use `group` / `row` / `hero` from `ui/index.ts`; the C stylesheet gives them the same look (pixel name, display number, pixel arrow, no row icons). New pages use the C parts.
- **Each tab keeps to its subject.** Log is this month's money in and out; the student loan and net worth (mostly the loan) live on Debt.
- **Settings** (owner, 2026-11-04): descriptions are a few words or none; the tab bar's order is set there by dragging a row by its grip; Light or dark sets Obsidian's own mode (Auto / Light / Dark); "Obsidian in Ledgerline's look" (on by default) gives Obsidian itself the plugin's paper / charcoal, loud accent, square corners, flat setting rows, Plex Mono and Anton headings (`css/skin.css`, variables only).

## 📏 Room
- **One screen, every page** (owner, 2026-11-04). Every page fits the room and never scrolls (`zl-c-stack`, `view.ts` `fit`), C homes and C details alike. Only a C list scrolls, and only its growing list. When there is more than fits: a home shows what fits and its head says "N MORE ›" (`PageOut.trim` drops the last rows after the tightening steps); a detail moves the rest one tap deeper behind **tiles** (`tileGrid`, up to 4 across) instead of stacking groups below.
- **The room.** On the phone a page has **659 px** between the masthead and the bottom bar (debug log: "fit … room 659"); a C home must fit it. `phone.mjs` emulates 428 × 843 so desktop emulation gives the same room. Phones differ by a few px, so after drawing, `view.ts` `fit` tightens a one-screen page that is too tall (gaps 20 → 12 → 8 px, then row padding); only a page still too tall after that may scroll. Log is the fullest first page: its net worth is a one-line link, not a row.
- **No bottom gap** (2026-11-04): a page's groups are spread from the masthead to the bottom bar (`justify-content: space-between`), so the last group sits on the bottom bar; a chart that can stretch (`zl-c-fill`: Debt's year bricks, towers, a ticker chart) takes the extra room first.
- **Room to grow** (owner, 2026-11-05): a page plans for more items than today. Tile grids take up to 4 across, a 5th item turns the last tile into "+N" (its list page); rows past the room are trimmed (`dropRow` steps) and the head carries ALL ›. Long tile names and values wrap at their spaces, never cut or out of the tile; a tile's value and its small line sit together at its foot (owner, 2026-11-11). No page scrolls sideways (`.zl-page` clips x).

## 🧲 Gravity
- **Weight at the top.** The one number that answers "how am I doing" sits in the top third, in the biggest type on the page, in one colour. Only one such number per screen. A card shows one big figure and at most three small ones under it; detail goes one tap deeper.
- **Hands at the bottom.** What you do every day (+ an expense, record a payment, + TRADE) is the page's button in the **bottom bar** (docked full width above the tab bar, never floating over content). It is **filled loud** with an ink drop shadow and presses down 4 px; Back beside it stays outlined; on a deeper page ‹ BACK · <page below> sits beside it. No "+" in the top right. The top right only holds rare things in pixel icons (settings on Log's first page, a page's own set-up, CHART on a chart page).
- **Heavy to light.** Size, colour and contrast go down the page: summary → tiles → lists → footnotes. A lower block never shouts louder than the one above it.
- **Balance.** Every page starts right under the masthead; on a one-screen page spare room goes between groups (a stretchable chart takes it first). A scrolling list page keeps 20 px gaps.
- **Few things sit in the middle.** A block with one or two items (an empty state, a single goal) centres them across and down, never leaves them in a corner.
- **Less text.** Sentence case, short labels, no paragraphs on cards; a hint goes in a footnote, a floating hint or a held bubble.
- **Row labels.** A category ("Interest rate") is a muted Plex label; a thing with a line under it (a person, a goal, a payment) has its name in ink; where a row is about a person or says what happened, its label is a name or a plain sentence in display type (`figures` `name: true`): "MIA PAID FOR YOU", not "MIA · THEY PAID". A row may end with a short rule note under its name ("under your 15,000 cap").

## 📱 Sideways (owner, 2026-11-04)
- The same pages, no second layout; the tab bar becomes a column on the right edge (icons stacked, a 4 px rule on its left) and the masthead and page take the width left of it.
- On a two-column page the columns are equal, the bottom bar is pinned to the foot of the left column (its exact width, under the board), the left column stays in view and the rows on the right run to the bottom and scroll. In the left column's bottom bar Back is its arrow only, so the main button keeps its words.
- A list page without a board (Watchlist, This month, All activity) puts its first group (the Watchlist: its TW | US tabs and sort) in the left column instead, so it never stands empty (2026-11-05).
- A chart page turned opens the full chart; sideways the chart page is always the full chart, and its ‹ goes back to the page it was opened from (2026-11-05).
- The page starts at the notch's safe edge (no extra 16 px past it); a chart that fills its room (法人 flows) keeps 250 px; sheets are a centred card at most 560 px wide. Sideways pages are Vellum screens too (landscape).

## 🖥️ Wide panes (Phase 6: desktop, an iPad, any pane wider than 820 px)
A C page becomes two columns, its top (board or summary) on the left and staying in view, charts and rows on the right; masthead and bottom bar line up with the page (max 1120 px). Narrower panes use the phone column. CSS only (`@container zlpage` in `css/c.css`); a page needs nothing extra if its top group comes from `homeTop` / `summary` (class `zl-c-top`).
