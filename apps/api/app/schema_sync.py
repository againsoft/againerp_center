"""Lightweight schema sync for dev databases created before new columns were added."""

from __future__ import annotations

from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine

# (table, column, SQL type fragment for ADD COLUMN)
COLUMN_PATCHES: list[tuple[str, str, str]] = [
    ("operators", "mfa_enabled", "BOOLEAN NOT NULL DEFAULT FALSE"),
    ("operators", "mfa_secret", "VARCHAR(64)"),
    ("operators", "mfa_type", "VARCHAR(20)"),
    ("operators", "mfa_pending_secret", "VARCHAR(64)"),
]


def ensure_schema(engine: Engine) -> int:
    """Add missing columns on existing tables. Returns number of columns added."""
    insp = inspect(engine)
    tables = set(insp.get_table_names())
    added = 0

    with engine.begin() as conn:
        for table, column, ddl in COLUMN_PATCHES:
            if table not in tables:
                continue
            existing = {c["name"] for c in insp.get_columns(table)}
            if column in existing:
                continue
            conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {ddl}"))
            print(f"[Center] Schema sync: added {table}.{column}")
            added += 1

    return added
