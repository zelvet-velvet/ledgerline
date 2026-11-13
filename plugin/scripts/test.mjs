// Tests for the money maths in src/calc only (AGENTS.md): bundle each test/*.test.ts with esbuild, run them with node --test.
import { build } from "esbuild";
import { readdirSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";

const out = ".test-out";
rmSync(out, { recursive: true, force: true });
const entryPoints = readdirSync("test").filter((f) => f.endsWith(".test.ts")).map((f) => `test/${f}`);
await build({ entryPoints, bundle: true, platform: "node", format: "esm", outdir: out, outExtension: { ".js": ".mjs" }, logLevel: "warning" });
const files = readdirSync(out).filter((f) => f.endsWith(".mjs")).map((f) => `${out}/${f}`);
const r = spawnSync(process.execPath, ["--test", ...files], { stdio: "inherit" });
rmSync(out, { recursive: true, force: true });
process.exit(r.status ?? 1);
