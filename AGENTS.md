# Ledgerline: agent instructions

Ledgerline is an Obsidian plugin: a personal finance app (Log, Debt, Goals, Ledger, Invest) whose data is plain notes in the vault. This repo is two things at once: the plugin source in `plugin/`, and a **demo vault** (the repo root, made-up data) that a phone opens with Obsidian Git to try each branch. Any coding agent reads this file; Claude Code reads it through `CLAUDE.md`.

## Start here
- The work log (status, plan, test checklists) is the project's Folio vault, `../ledgerline-folio`, if it sits next to this repo. Its commands (`/cmd-sync`, `/cmd-rollover`, …) are linked in as skills; read `../ledgerline-folio/LLM/DEV_STATUS.md` at the start of a session.
- UI work: read `Docs/Design/Design Rules/Design Rules.md` (the core), then only the topic notes its index lists for what you build, then that page's Vellum screen in `Docs/Design/Screens/` and its source file. Reuse the shared parts named there; a new shared rule goes into its topic note first.
- New pages are proposed as Vellum screens marked mock (`"mock": true`) and picked before they are built.

## Rules
- **Never put real financial data in this repo** (amounts, names, accounts, holdings, keys): it is public. The demo data is made up; tests use made-up numbers.
- **Money is integer**: base-currency whole dollars, prices in hundredths, shares to 4 decimals, USD in cents with the FX rate per trade. Every change to the money maths in `plugin/src/calc/` adds a test in `plugin/test/` and runs `npm run test`.
- **Branches**: never commit to `main` directly. Work on `feat/<topic>` or `fix/<topic>`, open a PR to `main`, merge (squash) only when the maintainer says so.
- **Every commit carries its build**: after a plugin change run the build and install (below) and commit the source and `.obsidian/plugins/ledgerline/` together, so a phone on that branch runs exactly that code.
- After each change, say what to check on the phone. Code, comments, notes and commits are in English; chat in the language the user writes.

## Build
```
cd plugin
npm install                 # once
npm run check               # types
npm run test                # money maths (plugin/test)
npm run build               # main.js + styles.css (styles.css is built from css/*.css: edit those)
npm run install-vault       # copies the build into ../.obsidian/plugins/ledgerline (this demo vault)
```
`scripts/phone.mjs` drives a desktop Obsidian started with `--remote-debugging-port=9222` as a 428 × 843 phone (`mobile on`, `shot`, `eval`, `reload`); `VAULT=<name>` for a vault other than `ledgerline`.

## Commits
`type(scope): summary`, lowercase, imperative. `type`: feat, fix, refactor, chore, docs, test. `scope`: log, debt, goals, ledger, invest, nav, css, docs, demo… Stage files by name, never `git add -A`. Never force-push a shared branch.

## Code map
| Path | What it holds |
| :--- | :--- |
| `plugin/src/main.ts`, `view.ts`, `router.ts` | Plugin entry, the app view (tabs, pages, dock), navigation |
| `plugin/src/pages/` | One file per page (`invest-*.ts` for the Invest tab) |
| `plugin/src/calc/` | Pure maths (money, charts, rules), tested |
| `plugin/src/prices/` | Market data (TWSE, Fugle, Yahoo, FinMind) |
| `plugin/src/ui/` | Shared parts: C pages, flip-dot board, split-flaps, charts, sheets |
| `plugin/src/capture.ts` | "Capture this page for Vellum": writes the page on screen to `Docs/Design/Screens/` |
| `plugin/css/` | Styles, concatenated into `styles.css` by the build |
| `Config/`, `Log/`, `Invest/` | The demo data the plugin reads |
