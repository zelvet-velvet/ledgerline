import { TFile, normalizePath } from "obsidian";
import type LedgerlinePlugin from "../main";
import { MONTHS } from "../format";
import { budgetItems, computeMonth, LIVING, monthIncome } from "../calc/log";

export type FM = Record<string, unknown>;

// Notes in the data folder (settings) the app reads and writes. File names are the vault's existing ones (docs/schema.md).
export const FILES = { debt: "Debt Config", savings: "Saving n Loan", ledger: "Ledger Config", goals: "Goals Config", income: "Income", daily: "Daily Expenses Config", fixed: "Monthly Expenses Config", invest: "Investment Config" } as const;

// Body of a new daily note: none, the note only holds the day's data (the day page is in the app)
const DAY_BODY = "";

export interface MonthNote { path: string; year: number; month: number; fm: FM }

// Reads come from Obsidian's metadata cache (instant, no Dataview); writes go through processFrontMatter, and the
// metadata-cache "changed" event then redraws the app (main.ts), so a page never has to refresh itself after saving.
export class Store {
    constructor(private plugin: LedgerlinePlugin) {}

    private get app() { return this.plugin.app; }
    private get s() { return this.plugin.settings; }

    path(name: string): string { return normalizePath(`${this.s.dataFolder}/${name}.md`); }
    file(path: string): TFile | null { const f = this.app.vault.getAbstractFileByPath(path); return f instanceof TFile ? f : null; }
    fm(path: string): FM | null { const f = this.file(path); return f ? ((this.app.metadataCache.getFileCache(f)?.frontmatter as FM | undefined) ?? {}) : null; }

    // Change a note's frontmatter; the note is created (with that frontmatter) if it does not exist yet
    async update(path: string, fn: (fm: FM) => void): Promise<void> {
        let f = this.file(path);
        if (!f) {
            const dir = path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";
            if (dir && !this.app.vault.getAbstractFileByPath(dir)) await this.app.vault.createFolder(dir);
            f = await this.app.vault.create(path, "");
        }
        await this.app.fileManager.processFrontMatter(f, fn);
    }

    // Month notes: <log folder>/YYYY/MM Mon/Mon Config.md
    monthNotes(): MonthNote[] {
        const re = new RegExp(`^${this.s.logFolder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/(\\d{4})/(\\d{2}) [^/]+/[^/]+ Config\\.md$`, "i");
        const out: MonthNote[] = [];
        for (const f of this.app.vault.getMarkdownFiles()) {
            const m = re.exec(f.path);
            if (m) out.push({ path: f.path, year: Number(m[1]), month: Number(m[2]), fm: (this.app.metadataCache.getFileCache(f)?.frontmatter as FM | undefined) ?? {} });
        }
        return out.sort((a, b) => a.year * 12 + a.month - (b.year * 12 + b.month));
    }

    // The daily notes (YYYY-MM-DD.md) anywhere under a month's folder
    days(year: number, month: number): { name: string; path: string; fm: FM }[] {
        const dir = this.monthDir(year, month) + "/";
        return this.app.vault.getMarkdownFiles().filter((f) => f.path.startsWith(dir) && /^\d{4}-\d{2}-\d{2}$/.test(f.basename))
            .map((f) => ({ name: f.basename, path: f.path, fm: (this.app.metadataCache.getFileCache(f)?.frontmatter as FM | undefined) ?? {} }));
    }

    private monthDir(year: number, month: number): string { return normalizePath(`${this.s.logFolder}/${year}/${String(month + 1).padStart(2, "0")} ${MONTHS[month]}`); }

    // Everything the Log tab needs for one month (month note, daily notes, income, budget groups, the maths)
    monthData(year: number, month: number) {
        const monthPath = this.monthNotePath(new Date(year, month, 1));
        const fm = this.fm(monthPath);
        const days = this.days(year, month);
        const plan = this.fm(this.path(FILES.savings)) ?? {};
        const inc = monthIncome(this.fm(this.path(FILES.income)), fm, month + 1);
        const daily = budgetItems(this.fm(this.path(FILES.daily)));
        const fixed = budgetItems(this.fm(this.path(FILES.fixed)));
        return { monthPath, month: fm, days, plan, inc, daily, fixed, M: computeMonth({ month: fm, days, plan, daily, fixed, income: inc.total }) };
    }

    // A day's note ("YYYY-MM-DD"), wherever it is filed in its month
    day(date: string): { name: string; path: string; fm: FM } | null {
        const [y, m] = date.split("-").map(Number);
        return this.days(y, m - 1).find((d) => d.name === date) ?? null;
    }

    // Start a day, like the daily-note template: <log>/YYYY/MM Mon/Week N/YYYY-MM-DD.md with every daily item at 0, and the
    // month note (savings plan amounts + fixed expenses) if this is the month's first day.
    async createDay(date: string): Promise<string> {
        const [y, m, d] = date.split("-").map(Number);
        const first = (new Date(y, m - 1, 1).getDay() + 6) % 7;   // weeks start on Monday; the 1st's partial week is Week 1
        const dir = `${this.monthDir(y, m - 1)}/Week ${Math.floor((d + first - 1) / 7) + 1}`;
        let at = "";
        for (const part of dir.split("/")) {
            at = at ? `${at}/${part}` : part;
            if (this.app.vault.getAbstractFileByPath(at)) continue;
            await this.app.vault.createFolder(at);
            // Make.md (if installed) sorts a new folder by rank, newest first; ask it for name order like the template does
            try { await (this.app as unknown as { plugins?: { plugins?: Record<string, { superstate?: { spaceManager?: { saveSpace(p: string, f: (d: object) => object): Promise<void> } } }> } })
                .plugins?.plugins?.["make-md"]?.superstate?.spaceManager?.saveSpace(at, (def) => ({ ...def, sort: { field: "name", asc: true, group: false, recursive: false } })); } catch { /* optional */ }
        }
        const monthPath = this.monthNotePath(new Date(y, m - 1, 1));
        if (!this.file(monthPath)) {
            const lines: string[] = [];
            for (const [k, v] of Object.entries(this.fm(this.path(FILES.savings)) ?? {})) if (!k.startsWith("file") && typeof v === "number") lines.push(`${k}: ${v}`);
            const fixed = this.fm(this.path(FILES.fixed))?.budget;
            for (const it of (Array.isArray(fixed) ? fixed : []) as FM[]) {
                const prop = Array.isArray(it.spending) ? it.spending[0] : it.spending;
                if (it.daily === false && prop) lines.push(`${String(prop)}: ${Number(it.quota) || 0}`);
            }
            await this.app.vault.create(monthPath, `---\n${lines.join("\n")}${lines.length ? "\n" : ""}---\n# ${MONTHS[m - 1]} ${y} Configuration\n`);
        }
        const props = [...new Set(budgetItems(this.fm(this.path(FILES.daily))).flatMap((b) => b.spending))];
        const path = `${dir}/${date}.md`;
        await this.app.vault.create(path, `---\n${props.map((p) => `${p}: 0\n`).join("")}---\n${DAY_BODY}`);
        return path;
    }

    monthNotePath(d: Date): string {
        const M = MONTHS[d.getMonth()];
        return normalizePath(`${this.s.logFolder}/${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")} ${M}/${M} Config.md`);
    }

    // Every month note's amount for a savings-plan key (its own value, else the plan default); legacy = made before the living line
    monthLines(key: string): { amount: number; legacy: boolean }[] {
        const plan = this.fm(this.path(FILES.savings)) ?? {};
        return this.monthNotes().map((m) => ({ amount: Number(m.fm[key] !== undefined ? m.fm[key] : plan[key]) || 0, legacy: m.fm[LIVING] === undefined }));
    }

    // This month's amount for a savings-plan key: the month note's own value, else the plan default
    allocation(key: string, now = new Date()): { path: string; hasNote: boolean; def: number; amount: number } {
        const path = this.monthNotePath(now);
        const def = Number(this.fm(this.path(FILES.savings))?.[key]) || 0;
        const own = this.fm(path);
        return { path, hasNote: !!own, def, amount: own && own[key] !== undefined ? Number(own[key]) || 0 : def };
    }

    // Set a savings-plan amount. "once": this month's note only. "onward": the plan default from this month on; earlier month notes
    // without their own value are frozen at the old default (their history does not change), and this month's own value follows.
    async setAllocation(key: string, next: number, mode: "once" | "onward", now = new Date()): Promise<number> {
        const info = this.allocation(key, now);
        if (mode === "once") { await this.update(info.path, (fm) => { fm[key] = next; }); return 0; }
        const cutoff = now.getFullYear() * 12 + now.getMonth();
        let frozen = 0;
        for (const n of this.monthNotes()) {
            const idx = n.year * 12 + (n.month - 1);
            if (idx < cutoff && n.fm[key] === undefined) { await this.update(n.path, (fm) => { fm[key] = info.def; }); frozen++; }
            else if (idx === cutoff && n.fm[key] !== undefined) await this.update(n.path, (fm) => { fm[key] = next; });
        }
        await this.update(this.path(FILES.savings), (fm) => { fm[key] = next; });
        return frozen;
    }
}
