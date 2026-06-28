#!/usr/bin/env python3
"""Export the FastAPI OpenAPI 3.1 spec to docs/api/openapi/."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
API_DIR = ROOT / "apps" / "api"
OUT_DIR = ROOT / "docs" / "api" / "openapi"
OUT_FILE = OUT_DIR / "control-center.openapi.json"

sys.path.insert(0, str(API_DIR))

from main import app  # noqa: E402


def main() -> None:
    spec = app.openapi()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    OUT_FILE.write_text(json.dumps(spec, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    paths = len(spec.get("paths", {}))
    print(f"Wrote {OUT_FILE.relative_to(ROOT)} ({paths} paths, OpenAPI {spec.get('openapi')})")


if __name__ == "__main__":
    main()
