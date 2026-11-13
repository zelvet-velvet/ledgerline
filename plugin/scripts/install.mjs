// Copy the built plugin into a vault and enable it.  Usage: npm run install-vault [-- <vault path>]   (default: the repo root, ..)
import fs from "fs";
import path from "path";

const vault = path.resolve(process.argv[2] || process.env.VAULT || "..");
const dir = path.join(vault, ".obsidian", "plugins", "ledgerline");
fs.mkdirSync(dir, { recursive: true });
for (const f of ["main.js", "manifest.json", "styles.css"]) fs.copyFileSync(f, path.join(dir, f));
const list = path.join(vault, ".obsidian", "community-plugins.json");
const ids = fs.existsSync(list) ? JSON.parse(fs.readFileSync(list, "utf8")) : [];
if (!ids.includes("ledgerline")) { ids.push("ledgerline"); fs.writeFileSync(list, JSON.stringify(ids, null, 2)); }
console.log("installed into", dir);
