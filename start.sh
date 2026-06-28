#!/bin/bash
# AgainERP Control Center — Start API + Web
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

cleanup() {
  echo ""
  echo "Stopping Control Center..."
  [ -n "$API_PID" ] && kill "$API_PID" 2>/dev/null || true
  [ -n "$WEB_PID" ] && kill "$WEB_PID" 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM

# ── Preflight ──
if [ ! -f apps/api/.venv/bin/uvicorn ]; then
  echo "❌ API not set up. Run ./setup.sh first."
  exit 1
fi
if [ ! -d apps/web/node_modules ]; then
  echo "❌ Web not set up. Run ./setup.sh first."
  exit 1
fi
if [ ! -f apps/api/.env ]; then
  echo "❌ Missing apps/api/.env — run ./setup.sh"
  exit 1
fi

echo "🚀 Starting AgainERP Control Center..."
echo ""

# ── API (port 8001) ──
cd "$ROOT/apps/api"
.venv/bin/uvicorn main:app --host 0.0.0.0 --port 8001 --reload &
API_PID=$!
echo "  API  → http://localhost:8001  (docs: /docs)"
echo "         PID $API_PID"

sleep 2

# ── Web (port 3001) ──
cd "$ROOT/apps/web"
npm run dev -- --port 3001 &
WEB_PID=$!
echo "  Web  → http://localhost:3001"
echo "         PID $WEB_PID"

echo ""
echo "✅ Control Center running!"
echo ""
echo "   Login      http://localhost:3001/login"
echo "   Dashboard  http://localhost:3001/center"
echo "   Email      admin@againerp.com"
echo "   Password   Admin@1234"
echo ""
echo "   Edge Agent: cd agent/edge-agent && source .venv/bin/activate && python main.py"
echo ""
echo "   Press Ctrl+C to stop."
echo ""

wait $API_PID $WEB_PID
