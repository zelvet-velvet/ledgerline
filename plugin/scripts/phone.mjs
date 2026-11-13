// Drive desktop Obsidian as a phone (agent checks before the real phone test).
// Start Obsidian with:  Obsidian.exe --remote-debugging-port=9222 "obsidian://open?vault=ledgerline"  (VAULT=<name> for another vault)
// Usage:
//   node scripts/phone.mjs eval "<js expression>"      run in the app, print the result (await-able)
//   node scripts/phone.mjs shot <out.png> [js]         phone-size screenshot (428 wide, the phone's page room), optional js first
//   node scripts/phone.mjs mobile on|off               app.emulateMobile + phone viewport
//   node scripts/phone.mjs reload                      reload the ledgerline plugin, print console errors
// Screenshots show real vault data: keep them in a scratch folder, never in the repo.
import { writeFileSync } from "node:fs";

const PORT = process.env.CDP_PORT || 9222, VAULT = process.env.VAULT || "ledgerline";
// 428 × 926 is the phone; desktop emulation has no safe areas (status bar 47 + home indicator 34 on the iPhone), so the
// window is 83 px shorter to give pages the same room as the phone (the debug log there: "room 659").
const W = Number(process.env.W || 428), H = Number(process.env.H || 843);

async function target() {
    // only this vault's window (another vault may be open in the same Obsidian: never drive that one); while the window
    // reloads (mobile on / off) its title is not set yet, so this waits up to 20 s for it
    for (let i = 0; i < 20; i++) {
        const list = await (await fetch(`http://localhost:${PORT}/json`)).json();
        const t = list.find((x) => x.url.startsWith("app://obsidian.md/index.html") && (x.title ?? "").includes(`${VAULT} - Obsidian`));
        if (t) return t.webSocketDebuggerUrl;
        await new Promise((r) => setTimeout(r, 1000));
    }
    throw new Error(`${VAULT} window not found: is Obsidian started with --remote-debugging-port and this vault open?`);
}

async function connect() {
    const ws = new WebSocket(await target());
    await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
    let id = 0; const wait = new Map(); const logs = [];
    ws.onmessage = (m) => {
        const d = JSON.parse(m.data);
        if (d.id && wait.has(d.id)) { wait.get(d.id)(d); wait.delete(d.id); }
        if (d.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(d.params.type))
            logs.push(`${d.params.type}: ` + d.params.args.map((a) => a.value ?? a.description ?? "").join(" "));
        if (d.method === "Runtime.exceptionThrown") logs.push("exception: " + (d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text));
    };
    const send = (method, params = {}) => new Promise((r) => { const i = ++id; wait.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
    const own = () => logs.filter((l) => /ledgerline/i.test(l) && !/make-md|obsidian-git/.test(l));
    const ev = async (expr) => {
        const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
        if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text);
        return r.result?.result?.value;
    };
    return { ws, send, ev, logs, own };
}

const phone = (c) => c.send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: Number(process.env.SCALE || 1), mobile: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const [cmd, a1, a2] = process.argv.slice(2);
const c = await connect();
try {
    if (cmd === "eval") {
        const v = await c.ev(a1);
        console.log(typeof v === "string" ? v : JSON.stringify(v, null, 1));
    } else if (cmd === "mobile") {
        const on = a1 !== "off";
        await c.ev(`app.emulateMobile(${on}); true`);
        await sleep(1500);
        if (on) await phone(await connect()); else await (await connect()).send("Emulation.clearDeviceMetricsOverride");
        console.log("mobile", on);
    } else if (cmd === "shot") {
        await phone(c);
        await c.send("Runtime.enable");
        if (a2) { await c.ev(a2); await sleep(900); }
        const r = await c.send("Page.captureScreenshot", { format: "png" });
        writeFileSync(a1, Buffer.from(r.result.data, "base64"));
        console.log("saved", a1, c.own().join("\n"));
    } else if (cmd === "reload") {
        await c.send("Runtime.enable");
        await c.ev(`(async()=>{await app.plugins.disablePlugin("ledgerline");await app.plugins.enablePlugin("ledgerline");return true})()`);
        await sleep(2500);
        console.log("reloaded", c.own().length ? "\n" + c.own().join("\n") : "(no errors)");
    } else console.log("commands: eval, shot, mobile, reload");
} finally { c.ws.close(); setTimeout(() => process.exit(0), 50); }
