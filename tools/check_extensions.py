#!/usr/bin/env python3
"""Validate every MV3 extension in the repo and optionally zip them.

  python3 tools/check_extensions.py                 # validate only
  python3 tools/check_extensions.py --pack dist     # validate + dist/<dir>-<version>.zip
  python3 tools/check_extensions.py --pack dist --only bookmark-extension
"""
import argparse
import json
import pathlib
import sys
import zipfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
SKIP_IN_ZIP = {".md", ".py", ".sh"}
SKIP_NAMES = {"generate_icons.html"}


def referenced_files(manifest: dict) -> set[str]:
    refs: set[str] = set()
    refs.update((manifest.get("icons") or {}).values())
    action = manifest.get("action") or {}
    if "default_popup" in action:
        refs.add(action["default_popup"])
    icon = action.get("default_icon")
    refs.update(icon.values() if isinstance(icon, dict) else [icon] if icon else [])
    bg = manifest.get("background") or {}
    if "service_worker" in bg:
        refs.add(bg["service_worker"])
    for cs in manifest.get("content_scripts") or []:
        refs.update(cs.get("js", []))
        refs.update(cs.get("css", []))
    if "options_page" in manifest:
        refs.add(manifest["options_page"])
    if "options_ui" in manifest:
        refs.add(manifest["options_ui"].get("page", ""))
    return {r for r in refs if r}


def check(ext: pathlib.Path) -> list[str]:
    errors = []
    try:
        manifest = json.loads((ext / "manifest.json").read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        return [f"{ext.name}/manifest.json: invalid JSON ({e})"]
    if manifest.get("manifest_version") != 3:
        errors.append(f"{ext.name}: manifest_version must be 3")
    for key in ("name", "version"):
        if not manifest.get(key):
            errors.append(f"{ext.name}: missing '{key}'")
    for ref in sorted(referenced_files(manifest)):
        if not (ext / ref).is_file():
            errors.append(f"{ext.name}: manifest references missing file '{ref}'")
    return errors


CODE_SUFFIXES = {".html", ".css", ".js", ".json"}
ASSET_SUFFIXES = {".png", ".jpg", ".jpeg", ".svg", ".gif", ".webp", ".ico"}


def packable_files(ext: pathlib.Path) -> list[pathlib.Path]:
    """Files to ship: all code/data, plus only the images that something
    in the extension actually references (several folders carry copies of
    sibling-product artwork that they never use)."""
    files = [
        f for f in sorted(ext.rglob("*"))
        if f.is_file() and f.suffix not in SKIP_IN_ZIP and f.name not in SKIP_NAMES
    ]
    sources = "\n".join(
        f.read_text(encoding="utf-8", errors="ignore")
        for f in files if f.suffix in CODE_SUFFIXES
    )
    return [
        f for f in files
        if f.suffix not in ASSET_SUFFIXES or f.name in sources
    ]


def pack(ext: pathlib.Path, out: pathlib.Path) -> pathlib.Path:
    version = json.loads((ext / "manifest.json").read_text(encoding="utf-8"))["version"]
    out.mkdir(parents=True, exist_ok=True)
    target = out / f"{ext.name}-{version}.zip"
    with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED) as zf:
        for f in packable_files(ext):
            zf.write(f, f.relative_to(ext))
    return target


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--pack", metavar="DIR")
    ap.add_argument("--only", metavar="EXT_DIR")
    args = ap.parse_args()

    exts = sorted(p.parent for p in ROOT.glob("*/manifest.json"))
    if args.only:
        exts = [e for e in exts if e.name == args.only]
    if not exts:
        print("no extensions found", file=sys.stderr)
        return 1

    errors = [e for ext in exts for e in check(ext)]
    for e in errors:
        print(f"::error::{e}")
    if errors:
        return 1
    print(f"OK: {', '.join(e.name for e in exts)}")

    if args.pack:
        for ext in exts:
            print("packed", pack(ext, ROOT / args.pack))
    return 0


if __name__ == "__main__":
    sys.exit(main())
