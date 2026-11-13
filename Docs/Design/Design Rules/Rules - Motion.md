---
title: Ledgerline - Rules - Motion
tags:
  - ledgerlineos
  - design
sticker: lucide//move
---
> [!abstract]+ One set of moves, reused everywhere
> Part of [[Design Rules]] (read the core first: one show at a time, ≤ 0.35 s, Calm motion turns all of it off). A new page or tool picks its moves from this note and never adds its own kind. Each move names its code so it is reused, not copied.

## 🚪 Pages coming in
- **Deeper / Back** (owner, 2026-11-05): the new page slides in from the right over the old one (2 px rule on its left edge) while the old one eases a quarter to the left and dims (to 40 %); Back: the page slides off to the right and uncovers the page below easing back in; about 0.3 s, `cubic-bezier(.2, .8, .2, 1)`. The old page is a still copy (`view.ts` `ghostOf`), so nothing redraws under it. Masthead, bottom bar and tabs never move; the bottom bar swaps its buttons in one frame. Back returns to where the page was scrolled. `view.ts` `move`, CSS `zl-ghost`, `zl-scroll.is-push / is-pop`. No wipe.
- **Tab change:** the page only fades in (no move, no stagger, `zl-enter[data-enter="tab"]`), and the board is the one show: every dot goes dark, then the number turns over column by column from the upper left (split-flap boards flip from blank), about 0.5 s in all (3 ms a column, a disc turns over in 220 ms; owner picked in the flip-dot lab, 2026-11-06). A tap on the board sends a ring in the loud colour from the finger, a true circle that grows until it has left every corner.
- **Other entries** (a page opened from a sheet, a refresh that rebuilds): the page's groups fade in and rise 10 px, 0.16 s, 20 ms apart (`zl-enter`). Deeper / Back pages skip it (the slide is the show).
- **Rows** while the page enters ride the entry; a row new to the data reveals left to right in 4 pixel steps, 0.2 s, 35 ms apart (`zl-in`).

## 🔢 Numbers
- **Flip-dot board** (`FlipDot`): 80 × 24 dots at 5 px pitch (120 px high), each glyph dot drawn 2 wide × 3 tall; always ink. A new number (an entry, a redraw, a live price) **sweeps like a refresh**: left to right, column by column, each column top to bottom; in a column the old number's dots go dark and the new one's light in the same pass (about 0.25 s). Only a tab change goes dark first. The label line under it turns over **only its changed characters**.
- **Split-flaps** (`Flap`; readouts, summaries, the pad, a chart page's price, change lines). Fields start as a fixed row of dark blank tiles (5–6 for readouts; the pad: a sign tile then room for 7 digits and separators, 0 until a digit is typed); digits flip in from the right, so the width never jumps. A + / − is two bars centred on the tiles' seam, on its own first tile, never a font glyph (owner, 2026-11-09).
- **Split-flap motion** (owner picked the demo, 2026-11-06): each tile is a drum that only turns forward, card by card, through blank and 0–9 (text fields also A–Z), until it shows its target; symbols (, . + − %) are never passed, a change to or from one is a single card. One card turns as one piece (front: old top half, back: new bottom half). A target that moves mid-turn never restarts the tile; it stops on the latest. Every tile takes 500 ms to reach its target (the landing card slowest, no bounce); tiles start 45 ms apart from the side the number leans on (a delete from the leftmost). Every page open (open, Back, tab) replays the appear from blank. Cards look the same in light and dark (near-black, cream digits); `%` at 60 % on big cards, 80 % on small ones.
- **On a key press** (the pad): a tile interrupted mid-flip goes on from where it was heading; to or from blank is one flip; one flip per key (`Flap` direct), about 0.4 s.
- **Waiting for a first value** (a chart page's price before its first quote; owner, 2026-11-05): dark blank tiles with a light stepping across them one tile after another (1.2 s loop, `zl-lastp.is-loading`), dim bars for its label lines; the value then flips in from blank.

## 📊 Charts loading and switching
- **Block charts** (waffle, staircase, budget bars, towers, balance beam, flows bars): the whole grid of **dark squares is there at once**; each block stays dark until its turn, then **lights in one stepped beat** (dark → lit, never growing from its middle). One order for every chart: left to right, column by column, bottom-up inside a column, the whole chart within 0.3 s (`grid()` + `blocks()` in `ui/c.ts`, CSS `zl-light`). A switch (5 / 20 days) lights it again (about 0.6 s).
- **A chart loading** (the ticker chart, the index card; owner, 2026-11-05): the chart keeps its full size from the first frame; in the plot **8 dark squares light one after another** in the loud colour in steps with a pixel line under them, "LOADING 15 MIN" (`zl-ch-wait`); the first bars then **fade in, 0.35 s** (`zl-ch-in`), never appear at once. **Every new chart reuses this**: room kept, the 8 squares and "LOADING <what>", the first draw fades in.
- **A switch inside a chart** (an interval, a range, a mode such as CANDLE · FOOTPRINT · HEAT, a map's sectors / watchlist): the page never redraws; the plot **fades out 160 ms, redraws, fades back in 0.25 s** (`zl-flow-plot.is-out`); switching between two parts (the candle chart and the tape) fades the shown part in, 0.3 s (`zl-fade-in`). Nothing below moves.
- **Tape plots loading** (footprint, heat, the market map, net orders): a light runs across the plot (1.3 s loop) with "LOADING TAPE" (`zl-flow-load`). Not yet aligned with the 8 squares: a new chart uses the 8 squares until the owner picks one for all.
- **Tabs on a card** (the market card's TAIEX · SOX · NASDAQ): the new chart slides 40 px in from the side of the tapped tab and fades in, 0.22 s (`zl-mkt .zl-ch.is-in-r / is-in-l`). The card is one element kept across redraws, so its first fade and slide play once, and a live tick never blanks the chart or loses its pan.
- **Live:** a new tick changes the last candle, the price tag and the split-flap in place; the chart never replays.

## 🚫 No blink on a redraw (owner, 2026-11-05)
Only something new may move; a redraw of the page on screen (a live price, a sort or filter switch, synced data) never replays what was already there.
- Every row that reveals (`zl-in`) carries a **stable key**: `data-k` set to what the row *is* (the ticker, the person, the account), never its numbers or wording. Rows are matched by key, so a reorder moves them without a reveal (`zl-qrows.is-reorder`: rows slide to their new place, 0.12 s). Rows showing live numbers must have `data-k`.
- A matched row trades `zl-in` for `zl-kept` (`view.ts` mount), so the next redraw still finds it. Never remove `zl-in` without leaving a mark.
- Numbers change in place: boards, split-flaps, bars and label lines are kept per key and only animate what changed; a bar's fixed marks (pace or target lines) stay lit. Bars change only at their tip: new blocks light one by one at the end, lost ones go dark from the end (40 ms apiece).
- A switch that swaps the list (Watchlist TAIWAN / US, any filter tab) shows the other rows **at once**, drawn as kept rows: they are not new, only hidden.
- Only pages that show the changed data redraw; a page with nothing to show yet waits as an empty state and is drawn once when its data comes.
- The one blink allowed on a tick: the TRADING badge's dot, once per update (`zl-live`, `zl-tickc`).

## 🪟 Sheets, windows, bubbles, hints
- **Bottom sheet:** slides up 0.22 s (`zl-sheet-up`, ease-out), the dim fades in with it; dragged down it follows the finger ([[Rules - Sheets]]).
- **Writing window:** fades and lifts in at its place, 0.18 s (`zl-txt-in`), its dim fades in (`zl-txt-scrim`).
- **Hold-and-drag bubble:** fades in over the finger, 0.14 s; each step nudges its value 3 px (`zl-tick`, 0.12 s).
- **Floating hint** (a chip on a plot, its explanation; `zl-flow-hint`, `zl-flow-why`): fades in and rises 6 px, 0.2 s, over the plot's foot; it never pushes the page and fades out after its time.
- **Save hint** in a sheet: floats at the top of the screen in loud with the ink shadow for 2 s, then fades.
- **Presses:** a button inverts (ink ↔ paper) while pressed; Back's arrow steps left; the loud main button presses down 4 px. Anything that opens something (rows, cells, ALL ›) gets a dim block under it, 4 px past its edges, the text unchanged (owner, 2026-11-04).
