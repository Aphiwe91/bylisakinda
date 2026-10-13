#!/usr/bin/env python3
"""Generate worker/src/prices.json from js/products.js.

The Cloudflare Worker must recompute the order total server-side (never trust
the browser's amount), so it needs a price sheet. This keeps that sheet in sync
with the single source of truth: js/products.js.

Run from the site root:  python3 tools/gen_prices.py
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "js" / "products.js"
OUT = ROOT / "worker" / "src" / "prices.json"


def extract_array(text, name):
    """Pull a `const NAME = [ ... ];` array literal out of a JS file."""
    m = re.search(r"const\s+" + name + r"\s*=\s*(\[.*?\]);", text, re.S)
    if not m:
        sys.exit(f"could not find array {name} in {SRC}")
    return json.loads(m.group(1))


def main():
    text = SRC.read_text(encoding="utf-8")
    products = extract_array(text, "PRODUCTS")
    bundles = extract_array(text, "BUNDLES")

    sheet = {"products": {}, "bundles": {}}
    for p in products:
        entry = {}
        if "p80" in p:
            entry["p80"] = round(float(p["p80"]), 2)
        if "p200" in p:
            entry["p200"] = round(float(p["p200"]), 2)
        sheet["products"][p["name"]] = entry
    for b in bundles:
        sheet["bundles"][b["name"]] = round(float(b["price"]), 2)

    sheet["_source"] = "js/products.js"
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(sheet, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)} — {len(sheet['products'])} products, {len(sheet['bundles'])} bundles")


if __name__ == "__main__":
    main()
