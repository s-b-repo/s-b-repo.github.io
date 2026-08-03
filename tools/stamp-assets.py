#!/usr/bin/env python3
"""Stamp a content hash onto every local asset reference in the HTML.

Why this exists
---------------
The domain is behind Cloudflare. HTML is served `cf-cache-status: DYNAMIC` (never
cached) but assets come back `HIT` with `max-age=14400`. So for up to four hours after
a deploy, visitors get the *new* HTML paired with the *old* CSS and JS.

That is not a cosmetic delay. When the @font-face rules moved into styles.css, the new
HTML stopped linking Google Fonts while the stale CSS still had no @font-face — so the
site rendered in system fallback fonts for everyone until the cache expired.

Appending ?v=<hash> means any change to an asset produces a URL Cloudflare has never
seen, which misses cache and fetches from origin immediately. HTML and assets can no
longer disagree, and the assets stay aggressively cacheable.

Idempotent: run it after any change to assets/, before committing.
"""
import glob
import hashlib
import pathlib
import re
import sys

ASSETS = ["assets/styles.css", "assets/main.js", "assets/rates.js"]


def short_hash(path: str) -> str:
    return hashlib.sha256(pathlib.Path(path).read_bytes()).hexdigest()[:8]


def main() -> int:
    root = pathlib.Path(__file__).resolve().parent.parent
    stamps = {}
    for a in ASSETS:
        p = root / a
        if not p.exists():
            print(f"  skip (absent): {a}")
            continue
        stamps[a] = short_hash(p)

    changed = 0
    for f in sorted(root.glob("*.html")):
        src = f.read_text(encoding="utf-8")
        out = src
        for asset, h in stamps.items():
            # match the asset with or without a leading slash and with or without an
            # existing ?v=, so re-running replaces the old stamp instead of stacking
            pattern = re.compile(r'(["\'])(/?)' + re.escape(asset) + r'(?:\?v=[0-9a-f]+)?\1')
            out = pattern.sub(lambda m: f"{m.group(1)}{m.group(2)}{asset}?v={h}{m.group(1)}", out)
        if out != src:
            f.write_text(out, encoding="utf-8")
            changed += 1

    for a, h in stamps.items():
        print(f"  {a:<20} v={h}")
    print(f"  stamped {changed} html files")
    return 0


if __name__ == "__main__":
    sys.exit(main())
