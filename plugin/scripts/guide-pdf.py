#!/usr/bin/env python3
"""Build the contributor guide's PDF in the app's dark look: Docs/Guide/<name>.md -> Docs/Guide/<name>.pdf.

Needs pandoc and Microsoft Edge (Windows, called from WSL) or Chrome. Run from the repo root:
    python3 plugin/scripts/guide-pdf.py "Start developing ZH"
"""
import os, re, shutil, subprocess, sys, tempfile

root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
name = sys.argv[1] if len(sys.argv) > 1 else "Start developing ZH"
src = os.path.join(root, "Docs", "Guide", name + ".md")
out = os.path.join(root, "Docs", "Guide", name + ".pdf")
shots = os.path.join(root, "Docs", "Guide", "attachments")

md = open(src, encoding="utf-8").read()
md = re.sub(r"^---\n.*?\n---\n", "", md, flags=re.S)
def callout(m):
    kind, title, body = m.group(1), m.group(2).strip(), m.group(3)
    body = "\n".join(l[2:] if l.startswith("> ") else l[1:] for l in body.strip("\n").split("\n"))
    return f'<div class="call {kind}"><b>{title}</b>\n\n{body}\n\n</div>\n'
md = re.sub(r"^> \[!(\w+)\] ?(.*)\n((?:>.*\n?)*)", callout, md, flags=re.M)
# the app as it looks, after the introduction
imgs = "".join(f'<img src="{shots}/readme-{t}.png">' for t in ("log", "invest", "goals"))
md = re.sub(r"\n---\n", f'\n<div class="shots">{imgs}</div>\n', md, count=1)
md = md.replace("\n---\n", "\n")

css = open(os.path.join(root, "plugin", "css", "fonts.css"), encoding="utf-8").read() + """
@page { background: #1F1F22; }
:root { --bg: #1F1F22; --ink: #E6E3DC; --mut: #96969B; --dim: #36363B; --loud: #FF5C38; --tile: #121214; }
@page { size: A4; margin: 14mm 15mm; background: var(--bg); }
html, body { background: var(--bg); -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin: 0; padding: 0; font: 400 10.5pt/1.65 'ZL IBM Plex Mono', 'Noto Sans TC', 'Microsoft JhengHei', sans-serif; color: var(--ink); }
.page { box-decoration-break: clone; -webkit-box-decoration-break: clone; }
h1 { font: 400 32pt/1.05 'ZL Anton', 'Noto Sans TC', 'Microsoft JhengHei', sans-serif; font-weight: 400; border-bottom: 4px solid var(--ink); padding-bottom: 6px; margin: 0 0 14px; }
h2 { font: 700 19pt/1.2 'ZL Anton', 'Noto Sans TC', 'Microsoft JhengHei', sans-serif; border-bottom: 2px solid var(--ink); padding: 0 0 4px; margin: 0 0 10px; break-before: page; break-after: avoid; }
h3 { font: 700 11pt 'ZL IBM Plex Mono', 'Noto Sans TC', 'Microsoft JhengHei', sans-serif; color: var(--ink); margin: 18px 0 6px; break-after: avoid; }
h3::before { content: "■ "; color: var(--loud); }
code { font-family: 'ZL IBM Plex Mono', monospace; background: var(--tile); color: var(--ink); padding: 0 4px; }
strong, b { font-weight: 700; }
em { color: var(--mut); font-style: normal; }
table { width: 100%; border-collapse: collapse; margin: 8px 0 12px; font-size: 9.5pt; }
th { font: 400 8pt 'ZL Silkscreen', 'Noto Sans TC', 'Microsoft JhengHei', monospace; text-align: left; color: var(--mut); border-bottom: 2px solid var(--ink); padding: 5px 6px; }
td { border-bottom: 1px solid var(--dim); padding: 5px 6px; vertical-align: top; }
tr { break-inside: avoid; }
td em { color: var(--ink); background: var(--tile); padding: 1px 4px; }
td strong { background: var(--loud); color: var(--bg); padding: 0 4px; }
table { table-layout: fixed; }
td:first-child, th:first-child { width: 6%; font-weight: 700; }
td:nth-child(2), th:nth-child(2), td:nth-child(3), th:nth-child(3) { width: 47%; }
table:has(th:nth-child(2):last-child) td:first-child, table:has(th:nth-child(2):last-child) th:first-child { width: 38%; }
blockquote { margin: 10px 0; padding: 10px 12px; background: var(--tile); border-left: 4px solid var(--loud); font-size: 9.5pt; break-inside: avoid; }
.call { border-left: 6px solid var(--ink); background: var(--tile); padding: 8px 12px; margin: 12px 0; break-inside: avoid; }
.call.warning { border-color: var(--loud); }
.call b:first-child { display: block; margin-bottom: 4px; color: var(--loud); }
.shots { display: flex; gap: 10px; justify-content: center; margin: 16px 0 0; }
.shots img { width: 31%; border: 2px solid var(--dim); }
a { color: var(--loud); }
li { margin: 3px 0; }
"""
tmp = tempfile.mkdtemp()
open(os.path.join(tmp, "g.md"), "w", encoding="utf-8").write(md)
subprocess.run(["pandoc", os.path.join(tmp, "g.md"), "-f", "markdown+pipe_tables", "-t", "html5", "-s",
                "--metadata", "title=" + name, "-o", os.path.join(tmp, "g.html")], check=True)
html = open(os.path.join(tmp, "g.html"), encoding="utf-8").read()
html = re.sub(r'<header id="title-block-header">.*?</header>', "", html, flags=re.S)
html = re.sub(r"<style>.*?</style>", "", html, flags=re.S).replace("</head>", "<style>" + css + "</style></head>")
wsl = shutil.which("wslpath") is not None
if wsl:
    html = re.sub(r'src="/mnt/([a-z])/', lambda m: f'src="file:///{m.group(1).upper()}:/', html)
page = os.path.join(tmp, "g.html")
open(page, "w", encoding="utf-8").write(html)
win = lambda p: subprocess.run(["wslpath", "-w", p], capture_output=True, text=True).stdout.strip() if wsl else p
browser = next((b for b in ["/mnt/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
                            "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe",
                            shutil.which("google-chrome") or "", shutil.which("chromium") or ""] if b and os.path.exists(b)), None)
if not browser: sys.exit("no Edge or Chrome found")
subprocess.run([browser, "--headless", "--disable-gpu", "--no-pdf-header-footer", f"--print-to-pdf={win(out)}", win(page)],
               check=True, capture_output=True)
print("wrote", out)
