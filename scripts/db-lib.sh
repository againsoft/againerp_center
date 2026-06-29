#!/bin/bash
# AgainERP Center — shared database script settings (sourced by db-*.sh)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

PG_CONTAINER="${PG_CONTAINER:-againerp-center-db}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-againerp_center}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-password}"
COMPOSE_FILE="${COMPOSE_FILE:-$ROOT/deploy/docker/docker-compose.yml}"
BACKUP_DIR="${BACKUP_DIR:-$ROOT/backups/db}"
PG_IMAGE="${PG_IMAGE:-postgres:16-alpine}"

mkdir -p "$BACKUP_DIR"

_db_timestamp() {
  date +%Y%m%d_%H%M%S
}

_db_ensure_container() {
  if docker ps --format '{{.Names}}' | grep -qx "$PG_CONTAINER"; then
    return 0
  fi
  echo "PostgreSQL container '$PG_CONTAINER' is not running."
  if [ -f "$COMPOSE_FILE" ]; then
    echo "Starting database via Docker Compose..."
    docker compose -f "$COMPOSE_FILE" up -d postgres
    for _ in $(seq 1 30); do
      if docker exec "$PG_CONTAINER" pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1; then
        echo "  ✓ Database ready"
        return 0
      fi
      sleep 1
    done
  fi
  echo "❌ Could not reach PostgreSQL. Run: docker compose -f deploy/docker/docker-compose.yml up -d"
  exit 1
}

_db_load_railway_url() {
  if [ -n "${RAILWAY_DATABASE_URL:-}" ]; then
    echo "$RAILWAY_DATABASE_URL"
    return 0
  fi
  local env_file="$ROOT/apps/api/.env"
  if [ -f "$env_file" ]; then
    local url
    url="$(grep -E '^DATABASE_URL=' "$env_file" | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'")"
    if [[ "$url" == *"rlwy.net"* ]] || [[ "$url" == *"railway"* ]]; then
      echo "$url"
      return 0
    fi
  fi
  echo ""
}

_db_normalize_url() {
  local url="$1"
  if [[ "$url" == postgres://* ]]; then
    url="postgresql://${url#postgres://}"
  fi
  echo "$url"
}

_db_run_psql_url() {
  local url="$1"
  shift
  docker run --rm -i "$PG_IMAGE" psql "$(_db_normalize_url "$url")" "$@"
}

_db_run_pg_restore_url() {
  local url="$1"
  shift
  docker run --rm -i "$PG_IMAGE" pg_restore "$(_db_normalize_url "$url")" "$@"
}

_db_mask_url() {
  echo "$1" | sed -E 's#(postgresql://[^:]+:)[^@]+(@)#\1****\2#'
}
