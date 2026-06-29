#!/bin/bash
# Restore a .sql or .dump backup into local PostgreSQL (Docker)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=db-lib.sh
source "$SCRIPT_DIR/db-lib.sh"

BACKUP_FILE="${1:-}"
if [ -z "$BACKUP_FILE" ] || [ ! -f "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup.sql|backup.dump>"
  echo ""
  echo "Available backups:"
  ls -lt "$BACKUP_DIR"/*.{sql,dump} 2>/dev/null || echo "  (none in $BACKUP_DIR)"
  exit 1
fi

_db_ensure_container

echo "⚠️  This will overwrite data in local database: $POSTGRES_DB"
read -r -p "Continue? [y/N] " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
  echo "Cancelled."
  exit 0
fi

echo "🔄 Restoring from: $BACKUP_FILE"

if [[ "$BACKUP_FILE" == *.dump ]]; then
  docker exec -i "$PG_CONTAINER" pg_restore \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    --clean \
    --if-exists \
    --no-owner \
    --no-acl \
    < "$BACKUP_FILE"
else
  docker exec -i "$PG_CONTAINER" psql \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    -v ON_ERROR_STOP=1 \
    < "$BACKUP_FILE"
fi

echo "✅ Restore complete"
echo "   Database: $POSTGRES_DB @ $PG_CONTAINER"
