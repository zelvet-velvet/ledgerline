import esbuild from "esbuild";
import fs from "fs";

// styles.css is built: the bundled fonts, the base app styles, then redesign C on top
const CSS = ["css/fonts.css", "css/app.css", "css/c.css", "css/skin.css"];
const css = () => fs.writeFileSync("styles.css", CSS.map((f) => fs.readFileSync(f, "utf8")).join("\n"));

const prod = process.argv[2] === "production";
const ctx = await esbuild.context({
    entryPoints: ["src/main.ts"],
    bundle: true,
    external: ["obsidian", "electron", "@codemirror/*", "@lezer/*"],
    format: "cjs",
    target: "es2020",
    logLevel: "info",
    sourcemap: prod ? false : "inline",
    treeShaking: true,
    outfile: "main.js",
});
css();
if (prod) { await ctx.rebuild(); process.exit(0); } else { await ctx.watch(); }
