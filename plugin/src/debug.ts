import { Platform } from "obsidian";
import type LedgerlinePlugin from "./main";

// On-device debug log: the last 200 events in memory; written to a file in the vault (when the setting is on) every 10 s if
// something new happened, and at once after an error. Events carry no amounts: only what happened and where.
export class DebugLog {
    private lines: string[] = [];
    private dirty = false;
    private writing = false;

    constructor(private plugin: LedgerlinePlugin) {
        (window as unknown as { zlDebug?: (m: string) => void }).zlDebug = (m: string) => this.note(m);   // for UI code without the plugin at hand
        plugin.registerInterval(window.setInterval(() => { void this.flush(); }, 10000));
    }

    note(msg: string): void {
        this.lines.push(`${new Date().toISOString()} +${Math.round(performance.now())}ms ${msg}`);   // +ms: since Obsidian itself started
        if (this.lines.length > 200) this.lines.shift();
        this.dirty = true;
    }

    error(where: string, e: unknown): void {
        const err = e instanceof Error ? `${e.message}\n    ${(e.stack || "").split("\n").slice(1, 4).join("\n    ")}` : String(e);
        console.error("Ledgerline:", where, e);
        this.note(`ERROR ${where}: ${err}`);
        void this.flush();
    }

    async flush(force = false): Promise<void> {
        const s = this.plugin.settings;
        // phones only (unless forced by the command): the desktop writing the same file clashed with the phone's copy in git
        if ((!(s.debugLog && Platform.isMobile) && !force) || !this.dirty || this.writing) return;
        this.writing = true;
        try {
            const ad = this.plugin.app.vault.adapter, p = s.debugPath;
            const dir = p.includes("/") ? p.slice(0, p.lastIndexOf("/")) : "";
            if (dir && !(await ad.exists(dir))) await ad.mkdir(dir);
            const old = (await ad.exists(p)) ? await ad.read(p) : "";
            const body = `${old}\n## ${new Date().toISOString()}\n${this.lines.join("\n")}\n`;
            await ad.write(p, body.length > 200000 ? body.slice(-100000) : body);   // keep the file small
            this.lines = [];
            this.dirty = false;
        } catch (e) {
            console.error("Ledgerline: debug log write failed", e);
        } finally {
            this.writing = false;
        }
    }
}
