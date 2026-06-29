#!/bin/bash
# Sync local database → Railway (backup locally, then import to Railway)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=db-lib.sh
source "$SCRIPT_DIR/db-lib.sh"

FORMAT="${DB_SYNC_FORMAT:-sql}"  # sql | dump

echo "🔄 Sync local → Railway"
echo ""

RAILWAY_URL="$(_db_load_railway_url)"
if [ -z "$RAILWAY_URL" ]; then
  echo "❌ Railway DATABASE_URL not found."
  echo "   export RAILWAY_DATABASE_URL='postgresql://...'"
  exit 1
fi

echo "Target: $(_db_mask_url "$RAILWAY_URL")"
echo "Format: $FORMAT"
echo ""

if [ "$FORMAT" = "dump" ]; then
  "$SCRIPT_DIR/db-export.sh"
  LATEST="$(ls -t "$BACKUP_DIR"/*.dump 2>/dev/null | head -1)"
else
  "$SCRIPT_DIR/db-backup.sh"
  LATEST="$(ls -t "$BACKUP_DIR"/*.sql 2>/dev/null | head -1)"
fi

if [ -z "$LATEST" ] || [ ! -f "$LATEST" ]; then
  echo "❌ No backup file created"
  exit 1
fi

echo ""
echo "Using: $LATEST"
echo ""

"$SCRIPT_DIR/db-import-railway.sh" "$LATEST"

echo ""
echo "✅ Sync complete — local data pushed to Railway"
