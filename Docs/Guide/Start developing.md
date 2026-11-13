---
title: Start developing Ledgerline
tags:
  - guide
---
# Start developing Ledgerline

This guide gets you from nothing to testing your own change on your phone. **Part 1** sets up the phone (the fiddly part, so every tap is written down). **Part 2** is what you do each time you try a branch. **Part 3** sets up the PC.

How it fits together:

- **`ledgerline`** (public): the plugin's code in `plugin/`, *and* a demo vault with made-up data around it. Each branch carries its own built plugin, so whatever branch the phone is on, that is the app it runs.
- **`ledgerline-folio`** (private): our shared work log: what is done, what is next, what to check on the phone.
- **Branches**: `main` is the version everyone sees. New work goes on `feat/<topic>` or `fix/<topic>`, is tried on the phone, then merged through a pull request.

---

## Part 1 · The phone (once)

You need: the Obsidian app, and about 10 minutes on Wi-Fi.

### 1. Make an empty vault
1. Install **Obsidian** from the App Store (or Google Play) and open it.
2. Tap **Create new vault**. Name it `ledgerline`.
3. iPhone: turn **Store in iCloud off**. Git and iCloud both try to sync the same files and break each other. The vault must stay *On My iPhone*.
4. Tap **Create**. You land in an empty vault.

### 2. Install the Git plugin
1. Open **Settings** (the gear in the left sidebar; swipe right from the left edge to open the sidebar).
2. **Community plugins** → **Turn on community plugins**.
3. **Browse** → search **Git** → pick **Git** by *Vinzent* → **Install** → **Enable**.
4. Close Settings.

### 3. Clone the demo vault into it
Open the **command palette**: swipe down on an open note, or tap the **⋯ / menu** button and choose *Open command palette*. Then:

| Step | You see | You do |
| :--- | :--- | :--- |
| 1 | The command list | Type `clone`, tap **Git: Clone an existing remote repo** |
| 2 | *Enter remote URL* | Paste `https://github.com/zelvet-velvet/ledgerline.git`, press Enter |
| 3 | *Enter directory for clone…* | Tap **Vault Root** |
| 4 | *Does your remote repo contain a .obsidian directory at the root?* | Tap **YES** |
| 5 | *To avoid conflicts, the local .obsidian directory needs to be deleted.* | Tap **DELETE ALL YOUR LOCAL CONFIG AND PLUGINS**. This is safe: the vault is empty, and the repo brings its own settings and plugins, the Git plugin included. |
| 6 | *Specify depth of clone. Leave empty for full clone.* | Leave it **empty**, press Enter. (A shallow clone can't switch branches.) |
| 7 | *Cloning new repo…* then *Cloned new repo* and *Please restart Obsidian* | Wait. The first clone takes a minute or two. |

### 4. Restart
1. Close Obsidian completely: swipe up to the app switcher and swipe Obsidian away.
2. Open it again. If it asks whether to trust the vault's plugins, tap **Trust author and enable plugins**.
3. Ledgerline opens full screen with Alex's made-up money. You're on `main`.

### 5. Set the Git plugin to pull only
The phone only *reads* branches; it never commits. In **Settings → Git**:

- **Auto commit-and-sync interval**: `0` (off).
- **Auto pull interval**: `0` (you pull by hand, so nothing changes under you).
- **Pull on startup**: on (optional: the app opens on the latest version of its branch).

> [!tip] Getting to Settings while Ledgerline is full screen
> Swipe right from the left edge for the sidebar, or open the command palette (swipe down) and run *Open settings*.

---

## Part 2 · Try a branch (every time)

When someone says "`feat/marquee` is ready on the phone":

1. Command palette → **Git: Fetch**. This loads the list of new branches. Nothing changes yet.
2. Command palette → **Git: Switch to remote branch** → pick `origin/feat/marquee`.
3. Command palette → **Reload app without saving**. (Or close and reopen Obsidian.) The plugin now runs that branch's build.
4. Check what the change asked you to check, and report back (in the folio's test checklist, or in chat).

New commits on the same branch later: **Git: Pull**, then **Reload app without saving**.

Back to `main`: **Git: Switch branch** → `main`, then **Git: Pull**, then reload.

### When something goes wrong

| Problem | Fix |
| :--- | :--- |
| *Your local changes would be overwritten* (switching or pulling) | Something on the phone changed a file (a setting, a tap that saved). The phone has nothing worth keeping: run **Git: CAUTION: Discard all changes**, then try again. |
| The branch isn't in the list | Run **Git: Fetch** first, then switch. |
| The app looks unchanged after switching | Reload (step 3). Still the same: Settings → Community plugins → turn **Ledgerline** off and on. |
| *Pull* or *Fetch* fails | Check Wi-Fi; try again. If it keeps failing, see the next row. |
| Anything stuck or strange | Start over: Settings (in the vault switcher) → delete the `ledgerline` vault, and do Part 1 again. Nothing is lost: everything lives on GitHub. |

> [!warning] Never "Commit-and-sync" on the phone
> The phone is a viewer. Commits come from the PC, on a branch.

---

## Part 3 · The PC (once)

### Let Claude set it up
Install **Git**, **Node.js 22** and **Claude Code**, accept the GitHub invitations to `ledgerline` and `ledgerline-folio`, then open a terminal in the folder where you keep projects, start `claude`, and paste:

> Set up Ledgerline development here. Clone https://github.com/zelvet-velvet/ledgerline and https://github.com/zelvet-velvet/ledgerline-folio next to each other. In `ledgerline-folio`, run `python3 Tools/setup/install_plugins.py` and `python3 Tools/setup/folio.py link` (it links the work-log commands into `../ledgerline`). In `ledgerline/plugin`, run `npm install`, then check that `npm run check`, `npm run test` and `npm run build` all pass. Tell me what to open in Obsidian.

Then open **both folders in Obsidian** (*Open folder as vault*): `ledgerline` is the demo app with the Vellum screens, `ledgerline-folio` is the work log. In each, turn the community plugins on.

### A working session
1. Open a terminal in `ledgerline`, start `claude`. It reads `AGENTS.md` and the folio's status.
2. Say what you want, e.g. *"New branch feat/csv-export: export the Log month as CSV."* Claude makes the branch, changes the code, runs the checks, builds, commits the source and the build together, and pushes.
3. On the phone: Part 2.
4. Works? Ask Claude to open a pull request. The maintainer reviews and merges it into `main`.
5. Before you stop: **`/cmd-sync`** writes today's progress into the folio (and commits it), so the next session (yours or someone else's) knows where things stand.

### Where things are
| What | Where |
| :--- | :--- |
| Rules for agents | `ledgerline/AGENTS.md` |
| How pages look and behave | `ledgerline/Docs/Design/Design Rules/` |
| Each page's layout | `ledgerline/Docs/Design/Screens/` (open with the Vellum plugin) |
| Plan, status, phone checklists | `ledgerline-folio` |
