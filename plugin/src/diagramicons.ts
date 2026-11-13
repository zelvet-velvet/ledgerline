import { getIcon, Plugin } from "obsidian";

// Diagrams (Pele, Obsidian's renderer for ```mermaid) draw an icon node `a@{ icon: "lucide:notebook-pen", label: "Log" }` as an
// empty 24 × 24 <svg data-icon> slot: no icon pack is registered in the app. This fills each empty slot with Obsidian's own
// Lucide icon of that name ("lucide:x", "lucide-x" or "x"), so icons show in notes, on the phone and in the PDF export.
// The slot strokes with currentColor: the vault's diagram snippet gives it the node's colour.
const fill = (root: ParentNode) => {
    root.querySelectorAll<SVGSVGElement>("svg[data-icon]").forEach((s) => {
        if (s.childElementCount) return;
        const ic = getIcon((s.getAttribute("data-icon") ?? "").replace(/^lucide[:-]/, ""));
        if (ic) s.append(...Array.from(ic.childNodes).map((n) => n.cloneNode(true)));
    });
    align(root);
    split(root);
};

// Columns: the layout centres a node under the average of its incoming lines, so a node meant to sit under another can land a
// few px off (the vault under five tabs of different widths). Nodes within 8 px of a node above them take its x, once per
// diagram; the ends of their lines (and arrowheads) move with them.
const SNAP = 8;
const xy = (g: Element) => { const m = /translate\(\s*([-\d.]+)[ ,]\s*([-\d.]+)/.exec(g.getAttribute("transform") ?? ""); return m ? [Number(m[1]), Number(m[2])] : null; };
const shiftEnd = (d: string, first: boolean, dx: number) => {
    const all = Array.from(d.matchAll(/([-\d.]+)([ ,])([-\d.]+)/g));
    const m = first ? all[0] : all[all.length - 1];
    if (!m || m.index === undefined) return d;
    return d.slice(0, m.index) + `${Number(m[1]) + dx}${m[2]}${m[3]}` + d.slice(m.index + m[0].length);
};
const align = (root: ParentNode) => {
    root.querySelectorAll<SVGSVGElement>("svg.pele-flowchart:not([data-aligned])").forEach((svg) => {
        if (!svg.querySelector(".pele-node[class*='pele-shape-icon']")) return;
        svg.setAttribute("data-aligned", "1");
        const nodes = Array.from(svg.querySelectorAll<SVGGElement>(".pele-node")).map((g) => ({ g, id: g.getAttribute("data-id") ?? "", p: xy(g) }))
            .filter((n): n is { g: SVGGElement; id: string; p: number[] } => !!n.p).sort((a, b) => a.p[1] - b.p[1]);
        for (const n of nodes) {
            const above = nodes.find((o) => o.p[1] < n.p[1] - 1 && Math.abs(o.p[0] - n.p[0]) > 0.5 && Math.abs(o.p[0] - n.p[0]) <= SNAP);
            if (!above) continue;
            const dx = above.p[0] - n.p[0];
            n.p[0] += dx;
            n.g.setAttribute("transform", `translate(${n.p[0]},${n.p[1]})`);
            svg.querySelectorAll<SVGGElement>(".pele-edge[data-id]").forEach((e) => {
                const m = /^L_(.+)_(.+)_\d+$/.exec(e.getAttribute("data-id") ?? "");
                if (!m || (m[1] !== n.id && m[2] !== n.id)) return;
                const p = e.querySelector<SVGPathElement>("path:not(.pele-marker)");
                if (!p) return;
                let d = p.getAttribute("d") ?? "";
                if (m[1] === n.id) d = shiftEnd(d, true, dx);
                if (m[2] === n.id) { d = shiftEnd(d, false, dx); e.setAttribute("data-mx", String(Number(e.getAttribute("data-mx") ?? 0) + dx)); }
                // a straight line between two moved nodes stays straight
                p.setAttribute("d", d);
                e.querySelectorAll(".pele-marker").forEach((mk) => mk.setAttribute("transform", `translate(${e.getAttribute("data-mx") ?? 0},0)`));
            });
        }
    });
};

// An icon node's label: its first line (the title) goes above the square, the rest (the description) under it, each with
// a gap; done once per node. Pele draws the label as one <text> under the square, one <tspan> per line.
const GAP = 10;
const split = (root: ParentNode) => {
    root.querySelectorAll<SVGGElement>(".pele-node[class*='pele-shape-icon']:not([data-split])").forEach((g) => {
        const box = g.querySelector(":scope > rect"), lines = Array.from(g.querySelectorAll<SVGTSpanElement>(":scope > text.pele-label > tspan"));
        g.setAttribute("data-split", "1");
        if (!box || lines.length < 2) return;
        const top = Number(box.getAttribute("y")), y0 = Number(lines[0].getAttribute("y")), lh = Number(lines[1].getAttribute("y")) - y0;
        lines[0].setAttribute("y", String(top - GAP));
        lines[0].classList.add("pele-title");
        lines.slice(1).forEach((t, i) => t.setAttribute("y", String(y0 + GAP / 2 + i * lh)));
        // lines into this node: from above they stop over the title (an S-bend from their start); from the side they run at
        // the square's middle, where there is no text; the arrowhead moves with them
        const tr = /translate\(\s*([-\d.]+)[ ,]\s*([-\d.]+)/.exec(g.getAttribute("transform") ?? ""), id = g.getAttribute("data-id");
        const svgEl = g.closest("svg.pele");
        if (svgEl && id && tr) {
            const tx = Number(tr[1]), ty = Number(tr[2]), at = ty + top, mid = at + Number(box.getAttribute("height")) / 2, lift = GAP + lh * 0.85 + 4;
            svgEl.querySelectorAll<SVGGElement>(`.pele-edge[data-id$="_${id}_0"], .pele-edge[data-id*="_${id}_"]`).forEach((e) => {
                if (!new RegExp(`^L_.+_${id}_\\d+$`).test(e.getAttribute("data-id") ?? "") || e.hasAttribute("data-lifted")) return;
                const p = e.querySelector<SVGPathElement>("path:not(.pele-marker)"), d = p?.getAttribute("d") ?? "";
                const pts = Array.from(d.matchAll(/([-\d.]+)[ ,]([-\d.]+)/g)).map((m) => [Number(m[1]), Number(m[2])]);
                if (!p || pts.length < 2) return;
                const [sx, sy] = pts[0], [ex, ey] = pts[pts.length - 1];
                let dy = 0;
                if (ey >= at - 16 && ey <= at + 3) {   // from above (an arrow stops short by its head)
                    // an elbow: down, across at the middle, down to just over the title; small rounded corners
                    const ny = ey - lift, my = (sy + ny) / 2, dir = Math.sign(ex - sx), r = Math.min(8, Math.abs(ex - sx) / 2, (ny - sy) / 2);
                    p.setAttribute("d", Math.abs(sx - ex) < 1 ? `M${sx},${sy}L${ex},${ny}`
                        : `M${sx},${sy}V${my - r}Q${sx},${my} ${sx + dir * r},${my}H${ex - dir * r}Q${ex},${my} ${ex},${my + r}V${ny}`);
                    dy = ny - ey;
                } else if (ex < tx && pts.every(([, y]) => Math.abs(y - ey) < 1) && ey > at) {   // from the left, level
                    p.setAttribute("d", `M${sx},${mid}L${ex},${mid}`);
                    dy = mid - ey;
                } else return;
                e.setAttribute("data-lifted", "1");
                e.querySelectorAll(".pele-marker").forEach((mk) => mk.setAttribute("transform", `translate(${e.getAttribute("data-mx") ?? 0},${dy})`));
            });
        }
        // the canvas grows upward once by a title's height, so the top row's titles are not cut
        const svg = g.closest<SVGSVGElement>("svg.pele");
        const vb = svg?.viewBox.baseVal;
        if (svg && vb && vb.height && !svg.hasAttribute("data-grown")) {
            const extra = lh + GAP, k = (vb.height + extra) / vb.height;
            svg.setAttribute("data-grown", "1");
            svg.setAttribute("viewBox", `${vb.x} ${vb.y - extra} ${vb.width} ${vb.height + extra}`);
            const h = parseFloat(svg.getAttribute("height") ?? "");
            if (h) svg.setAttribute("height", String(h * k));
            if (svg.style.height) svg.style.height = `${parseFloat(svg.style.height) * k}px`;
        }
    });
};

export function registerDiagramIcons(plugin: Plugin): void {
    fill(document);
    const obs = new MutationObserver((list) => {
        for (const m of list) for (const n of Array.from(m.addedNodes)) if (n instanceof Element && (n.matches("svg[data-icon]") || n.querySelector("svg[data-icon]"))) { fill(n.parentElement ?? n); }
    });
    obs.observe(document.body, { childList: true, subtree: true });
    plugin.register(() => obs.disconnect());
    // every rendered section, also the detached one PDF export renders and copies into its print window: watch it until its
    // diagram is drawn (Pele draws after the post-processors), then fill and lay it out
    plugin.registerMarkdownPostProcessor((el) => {
        if (!el.querySelector("pre > code.language-mermaid, .mermaid") && !el.matches(".mermaid")) return;
        const o = new MutationObserver(() => fill(el));
        o.observe(el, { childList: true, subtree: true });
        window.setTimeout(() => o.disconnect(), 20000);
    });
}
