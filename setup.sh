#!/bin/bash
# AgainERP Control Center — First-time setup
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo "⚙️  AgainERP Control Center — Setup"
echo ""

# ── Environment files ──
if [ ! -f apps/api/.env ]; then
  cp apps/api/.env.example apps/api/.env
  echo "  ✓ Created apps/api/.env"
else
  echo "  · apps/api/.env exists"
fi

if [ ! -f apps/web/.env.local ]; then
  cp apps/web/.env.example apps/web/.env.local
  echo "  ✓ Created apps/web/.env.local"
else
  echo "  · apps/web/.env.local exists"
fi

# ── Database (Docker) ──
if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  echo ""
  echo "  Starting PostgreSQL + Redis (Docker)..."
  docker compose -f deploy/docker/docker-compose.yml up -d
  echo "  ✓ Database containers running"
else
  echo ""
  echo "  ⚠ Docker not available — ensure PostgreSQL is running on localhost:5432"
  echo "    Or start Docker Desktop and re-run: docker compose -f deploy/docker/docker-compose.yml up -d"
fi

# ── Python API ──
echo ""
echo "  Setting up API..."
cd apps/api
if [ ! -d .venv ]; then
  python3 -m venv .venv
  echo "  ✓ Python venv created"
fi
.venv/bin/pip install -q -r requirements.txt
echo "  ✓ Python dependencies installed"
cd "$ROOT"

# ── Node Web ──
echo ""
echo "  Setting up Web UI..."
cd apps/web
if [ ! -d node_modules ]; then
  npm install
  echo "  ✓ npm dependencies installed"
else
  echo "  · node_modules exists"
fi
cd "$ROOT"

# ── Edge Agent (optional) ──
echo ""
echo "  Setting up Edge Agent..."
cd agent/edge-agent
if [ ! -d .venv ]; then
  python3 -m venv .venv
fi
.venv/bin/pip install -q -r requirements.txt
if [ ! -f .env ]; then
  cp .env.example .env
  echo "  ✓ Created agent/edge-agent/.env (set AGENT_TOKEN after client creation)"
fi
cd "$ROOT"

# ── DB init ──
echo ""
echo "  Initializing database..."
apps/api/.venv/bin/python scripts/init_db.py

echo ""
echo "✅ Setup complete!"
echo ""
echo "   Start:  ./start.sh"
echo "   Login:  http://localhost:3001/login"
echo "   Creds:  admin@againerp.com / Admin@1234"
echo ""
