#!/bin/bash
# Import a local backup file into Railway PostgreSQL
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=db-lib.sh
source "$SCRIPT_DIR/db-lib.sh"

BACKUP_FILE="${1:-}"
RAILWAY_URL="$(_db_load_railway_url)"

if [ -z "$RAILWAY_URL" ]; then
  echo "❌ Railway DATABASE_URL not found."
  echo ""
  echo "Set one of:"
  echo "  export RAILWAY_DATABASE_URL='postgresql://...'"
  echo "  # or put Railway URL in apps/api/.env as DATABASE_URL"
  exit 1
fi

if [ -z "$BACKUP_FILE" ] || [ ! -f "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup.sql|backup.dump>"
  echo ""
  echo "Railway target: $(_db_mask_url "$RAILWAY_URL")"
  echo ""
  echo "Available backups:"
  ls -lt "$BACKUP_DIR"/*.{sql,dump} 2>/dev/null || echo "  (none in $BACKUP_DIR)"
  exit 1
fi

echo "☁️  Import to Railway: $(_db_mask_url "$RAILWAY_URL")"
echo "📁 Source file: $BACKUP_FILE"
echo ""
echo "⚠️  This will merge/overwrite objects in the Railway database."
read -r -p "Continue? [y/N] " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
  echo "Cancelled."
  exit 0
fi

NORMALIZED="$(_db_normalize_url "$RAILWAY_URL")"

if [[ "$BACKUP_FILE" == *.dump ]]; then
  echo "🔄 Restoring custom dump via pg_restore..."
  docker run --rm -i "$PG_IMAGE" \
    pg_restore -d "$NORMALIZED" --clean --if-exists --no-owner --no-acl \
    < "$BACKUP_FILE"
else
  echo "🔄 Restoring SQL dump via psql..."
  docker run --rm -i "$PG_IMAGE" \
    psql "$NORMALIZED" -v ON_ERROR_STOP=1 \
    < "$BACKUP_FILE"
fi

echo "✅ Railway import complete"
