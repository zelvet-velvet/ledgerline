---
title: Ledgerline - Rules - Sheets
tags:
  - ledgerlineos
  - design
sticker: lucide//panel-bottom
---
> [!abstract]+ Sheet kit K (owner picked 2026-11-05), the pad, the writing window
> Part of [[Design Rules]] (read the core first). Open / close motion: [[Rules - Motion]] › Sheets. Every sheet is `ui/sheet.ts` (`FormSheet`, `MonthSheet`); a number is `openPad` (`pages/amount.ts`).

## 🪟 Where it sits
- Upright: a **bottom sheet** in thumb reach (a 4 px rule on top, a grabber); it follows a finger dragging down (anywhere on it while scrolled to the top); let go past 120 px or with a fast flick and it slides off, else it springs back; a press on the dimmed page slides it off at once. With a keyboard it stays on the screen bottom and grows its padding by the keyboard height, so its own colour fills the keyboard's rounded corners (iOS 26) and the buttons sit just above the keys. Sideways: a centred card at most 560 px wide.
- **What is in it.** A title (display type), at most one line under it, the fields, one main button and an optional quiet second one (CANCEL | SAVE …, the main one filled).
- **A sheet keeps its rows** (owner, 2026-11-05): a choice never adds rows; one that needs more input opens its own window over it. Changing a page or sheet's layout is discussed with the owner first. Still adding rows, to discuss: the trade sheet's + New ticker, Ledger's + New friend, SELL's tax row inside the folded line.
- **A check before an action** (picked 2026-11-10 in the Long-Term Holder Tools artifact, first use: the rules check before a buy): rows of rules with a sprite, the rule, its state on the right (met: a tick in ink; not met: loud, and a › when a tap fixes it); a note line says how many are not met; its main button always goes on: it informs, never blocks.

## ✍️ Fields
- **No dropdowns.** A choice of up to three is a boxed segment ([[Rules - Controls]]); more is a row of chips (tickers, buckets, months), every choice in sight, one tap.
- **Numbers are dial rows.** Label left, the value large right: hold and drag up / down to change it (the bubble shows it and the change), tap for the app's pad (a "." key where the number takes decimals). No system keyboard for numbers. Steps: a currency's notch (10 for TWD), 0.1 for a %, the exchange's tick for prices.
- **A date is one block** (owner): TODAY / YESTERDAY / the weekday and the day; a clear native date field lies over it, so a tap opens iOS's own calendar; swipe left for the next day, right for the day before (a day every 36 px; a haptic tick on release and on a calendar pick).
- **Text** (a name, a reason, a thesis line, a new ticker) is a row with what was written; a tap opens the **writing window**: a card in the middle of the room above the keyboard, over the dimmed sheet; title, three lines of text, CANCEL | DONE at its foot; Return = DONE, tap the dim to cancel. The sheet behind does not move for its keyboard; the keyboard only opens there.
- In a sheet every label sits above its full-width value on a 2 px rule.
- **Fill it in for them.** A field the app can work out starts filled and keeps following the others until set by hand (trade price from the live quote, shares from the last trade, fee, tax, settles T+2 / US T+1, FX). Rarely touched fields fold into one line under the rest ("Fee 29 · Settles Nov 9 ›"), tap to open.
- **Say where a filled-in number comes from:** the folded line names its rule in brackets (Broker fee 27 (0.1425 %) · Settles on Nov 9 (T+2)); opened, each row has one plain line under it.
- **Say what it does.** A live line above the button (You pay 18,240 TWD), and the button names the action and the amount (SAVE BUY · 18,240). A pick (a month) has no Save: the tap is the answer.
- **Hints never move or cover anything** (owner): only when Save is pressed with something missing (Save is dimmed then, still pressable), a message floats at the top of the screen above the sheet, loud with the ink shadow, Plex 16 bold, for 2 s; lines that fill in later (the live total) keep their height from the start.

## 🔢 The number pad (`openPad`, readability redesign 2026-11-04)
A **bottom drawer over the page** (the page stays visible and dimmed above it): the title ("Food · today") and what is there already ("Already 180"), ADD TO IT / REPLACE when there is already an amount, the amount as a split-flap of blank tiles (sign tile first, room for 7 digits, 0 until typed, an 8th digit refused), the new total, +50 / +100 / +200 chips, the 3 × 4 ruled pad in display type, and CANCEL + a loud SAVE with the amount ("SAVE 300 →").

## 🧾 Add expense is tile → pad (owner picked 2026-11-05)
The date block on top, the day page's tiles under it (each item with what it has that day). Tap a tile = the pad for it, its SAVE closes both; hold and drag a tile to nudge it (the sheet stays); + OTHER asks the name in the writing window, then the pad. No pre-picked item, no Save on the sheet.
