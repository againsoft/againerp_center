from __future__ import annotations

from datetime import datetime
from typing import Any, Literal, Optional
from urllib.parse import urlparse

import httpx
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.client import Client
from app.services.platform_setting_service import get_platform_setting

PAGESPEED_API_URL = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"
TEST_URL = "https://developers.google.com"
DEFAULT_CATEGORIES = ("performance", "accessibility", "best-practices", "seo")
Strategy = Literal["mobile", "desktop"]


def _extract_score(data: dict[str, Any], category: str) -> Optional[int]:
    categories = data.get("lighthouseResult", {}).get("categories", {})
    score = categories.get(category, {}).get("score")
    return round(score * 100) if isinstance(score, (int, float)) else None


def _extract_metrics(data: dict[str, Any]) -> dict[str, Optional[str]]:
    audits = data.get("lighthouseResult", {}).get("audits", {})
    keys = {
        "first_contentful_paint": "first-contentful-paint",
        "largest_contentful_paint": "largest-contentful-paint",
        "total_blocking_time": "total-blocking-time",
        "cumulative_layout_shift": "cumulative-layout-shift",
        "speed_index": "speed-index",
        "interactive": "interactive",
    }
    return {
        name: audits.get(audit_id, {}).get("displayValue")
        for name, audit_id in keys.items()
    }


def normalize_url(url: str) -> str:
    raw = url.strip()
    if not raw:
        raise HTTPException(status_code=400, detail="URL is required")
    if not raw.startswith(("http://", "https://")):
        raw = f"https://{raw}"
    parsed = urlparse(raw)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        raise HTTPException(status_code=400, detail="Invalid URL — must be http(s)")
    return raw


def resolve_client_audit_url(client: Client, url: Optional[str]) -> str:
    target = url or client.domain
    if not target:
        raise HTTPException(
            status_code=400,
            detail="URL is required — set client.domain or pass url in the request body",
        )
    return normalize_url(target)


def _call_pagespeed(
    api_key: str,
    url: str,
    *,
    strategy: Strategy = "mobile",
    categories: tuple[str, ...] = DEFAULT_CATEGORIES,
    timeout: float = 60.0,
) -> dict[str, Any]:
    params: list[tuple[str, str]] = [
        ("url", url),
        ("key", api_key),
        ("strategy", strategy),
    ]
    for category in categories:
        params.append(("category", category))

    with httpx.Client(timeout=timeout) as client:
        res = client.get(PAGESPEED_API_URL, params=params)

    if res.status_code == 403:
        detail = res.json().get("error", {}).get("message", "Invalid or unauthorized API key")
        raise HTTPException(status_code=502, detail=detail)
    if res.status_code == 429:
        raise HTTPException(status_code=429, detail="PageSpeed API quota exceeded — try again later")
    if not res.is_success:
        detail = res.json().get("error", {}).get("message", f"PageSpeed API error (HTTP {res.status_code})")
        raise HTTPException(status_code=502, detail=detail)

    return res.json()


def format_audit_response(
    data: dict[str, Any],
    *,
    url: str,
    strategy: Strategy,
    client_id: Optional[str] = None,
) -> dict[str, Any]:
    scores = {
        category: _extract_score(data, category)
        for category in DEFAULT_CATEGORIES
    }
    return {
        "ok": True,
        "client_id": client_id,
        "url": url,
        "strategy": strategy,
        "fetched_at": datetime.utcnow().isoformat() + "Z",
        "scores": scores,
        "metrics": _extract_metrics(data),
        "analysis_url": data.get("id"),
        "lighthouse_version": data.get("lighthouseResult", {}).get("lighthouseVersion"),
    }


def run_pagespeed(
    api_key: str,
    url: str,
    *,
    strategy: Strategy = "mobile",
    timeout: float = 30.0,
) -> dict[str, Any]:
    """Call Google PageSpeed Insights API v5 for a URL (test helper)."""
    data = _call_pagespeed(api_key, url, strategy=strategy, categories=("performance",), timeout=timeout)
    return {
        "ok": True,
        "message": "PageSpeed API key is valid",
        "url": url,
        "strategy": strategy,
        "performance_score": _extract_score(data, "performance"),
        "analysis_url": data.get("id"),
    }


def run_pagespeed_audit(
    db: Session,
    url: str,
    *,
    strategy: Strategy = "mobile",
    client_id: Optional[str] = None,
) -> dict[str, Any]:
    """Run a full PageSpeed audit using the platform API key."""
    api_key = get_platform_setting(db, "pagespeed_api_key")
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="PageSpeed API key is not configured — add it in Control Center › Settings › Integrations",
        )

    normalized = normalize_url(url)
    data = _call_pagespeed(api_key, normalized, strategy=strategy)
    return format_audit_response(data, url=normalized, strategy=strategy, client_id=client_id)


def run_client_pagespeed_audit(
    db: Session,
    client: Client,
    *,
    url: Optional[str] = None,
    strategy: Strategy = "mobile",
) -> dict[str, Any]:
    if not client.is_active or client.status.lower() in ("suspended", "inactive"):
        raise HTTPException(status_code=403, detail="Client store is not active")

    target = resolve_client_audit_url(client, url)
    return run_pagespeed_audit(db, target, strategy=strategy, client_id=client.id)


def test_pagespeed_api_key(db: Session, *, api_key: Optional[str] = None) -> dict[str, Any]:
    """Verify the configured PageSpeed API key against Google's API."""
    key = api_key or get_platform_setting(db, "pagespeed_api_key")
    if not key:
        return {"ok": False, "message": "PageSpeed API key is not configured"}
    return run_pagespeed(key, TEST_URL, strategy="mobile", timeout=45.0)
