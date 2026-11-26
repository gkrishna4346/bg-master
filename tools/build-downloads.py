"""
BG Master: build the download copies
------------------------------------
Run this after adding or changing a background:

    python tools/build-downloads.py

It reads the list in assets/backgrounds.js and writes one small
script per background to assets/downloads/<id>.js. Those copies let
the Download buttons work even when index.html is opened straight
from a folder (where browsers block normal downloads).
"""
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
LIST = ROOT / "assets" / "backgrounds.js"
OUT = ROOT / "assets" / "downloads"

entries = re.findall(r"id:\s*'([^']+)'.*?file:\s*'([^']+)'", LIST.read_text(encoding="utf-8"), re.S)
OUT.mkdir(parents=True, exist_ok=True)
for old in OUT.glob("*.js"):
    old.unlink()

for bg_id, file in entries:
    src = ROOT / file
    if not src.exists():
        print(f"  missing: {file}  (skipped)")
        continue
    text = src.read_text(encoding="utf-8")
    js = (
        f"/* Download copy of {file}. Made by tools/build-downloads.py, do not edit. */\n"
        f"(window.BG_SOURCES = window.BG_SOURCES || {{}})[{json.dumps(bg_id)}] = {json.dumps(text)};\n"
    )
    (OUT / f"{bg_id}.js").write_text(js, encoding="utf-8")
    print(f"  ok: {bg_id}")

print(f"Done: {len(entries)} backgrounds in {OUT.relative_to(ROOT)}")
