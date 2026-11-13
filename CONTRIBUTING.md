# Contributing to Ledgerline

Thanks for helping. This repo is the plugin source (`plugin/`) **and** a demo vault (the repo root, made-up data), so a phone can open any branch and run exactly that branch's build.

New here? Start with the guide **[Start developing Ledgerline](Docs/Guide/Start%20developing.md)** (also as a PDF in the same folder): it walks through the phone setup with Obsidian Git step by step, then the PC.

## The flow
1. **Branch** from `main`: `feat/<topic>` for something new, `fix/<topic>` for a bug. Never commit to `main`.
2. **Build and commit together**: every commit has the source change *and* the built plugin in `.obsidian/plugins/ledgerline/` (see below), so the phone runs what the commit says.
3. **Push** the branch. On the phone: *Git: Fetch*, *Git: Switch to remote branch*, then reload the app (the guide shows each tap).
4. **Open a pull request** to `main` when it works on the phone. GitHub checks types, tests and the build. The maintainer reviews and squash-merges.

## Build
```
cd plugin
npm install                 # once
npm run check               # types
npm run test                # money maths
npm run build               # main.js and styles.css
npm run install-vault       # copy the build into this demo vault (../.obsidian/plugins/ledgerline)
```
Edit styles in `plugin/css/*.css`; `styles.css` is generated.

## Rules that keep it working
- **No real financial data, ever.** This repo is public. Demo notes and tests use made-up names and numbers.
- **Money is integer** (whole dollars, prices in hundredths, shares to 4 decimals, USD in cents with the FX rate per trade). A change to `plugin/src/calc/` comes with a test in `plugin/test/`.
- **Design**: the look and behaviour are written down in `Docs/Design/Design Rules/`; each page's layout is a Vellum screen in `Docs/Design/Screens/` (open them with the Vellum plugin, included in the demo vault). A new page starts as a Vellum mock and is picked before it is built.
- **Commit messages**: `type(scope): summary`, e.g. `fix(invest): marquee keeps its speed after a drag`.

## Working with a coding agent
`AGENTS.md` has the rules an agent follows here (Claude Code reads it through `CLAUDE.md`). The project's work log is a separate [Folio](https://github.com/zelvet-velvet/folio) vault, `ledgerline-folio`, cloned next to this repo; its commands (`/cmd-sync` and the rest) are linked in when you run its setup (see the guide).
