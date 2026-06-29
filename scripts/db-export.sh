#!/bin/bash
# Export local PostgreSQL to compressed custom format (.dump)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=db-lib.sh
source "$SCRIPT_DIR/db-lib.sh"

_db_ensure_container

STAMP="$(_db_timestamp)"
OUT_FILE="${1:-$BACKUP_DIR/againerp_center_${STAMP}.dump}"

echo "📤 Exporting local database → $OUT_FILE"
docker exec "$PG_CONTAINER" pg_dump \
  -U "$POSTGRES_USER" \
  -d "$POSTGRES_DB" \
  -Fc \
  --no-owner \
  --no-acl \
  > "$OUT_FILE"

SIZE="$(du -h "$OUT_FILE" | cut -f1)"
echo "✅ Export complete ($SIZE)"
echo "   $OUT_FILE"
