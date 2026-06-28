#!/bin/bash
# AgainERP Control Center — Start Script

echo "🚀 Starting AgainERP Control Center..."

# Start API (port 8001)
cd "$(dirname "$0")/apps/api"
.venv/bin/uvicorn main:app --host 0.0.0.0 --port 8001 --reload &
API_PID=$!
echo "  API started (PID: $API_PID) → http://localhost:8001"
echo "  API docs → http://localhost:8001/docs"

sleep 2

# Start Web (port 3001)
cd "$(dirname "$0")/apps/web"
npm run dev -- --port 3001 &
WEB_PID=$!
echo "  Web started (PID: $WEB_PID) → http://localhost:3001"

echo ""
echo "✅ Control Center running!"
echo "   Login: http://localhost:3001/login"
echo "   Dashboard: http://localhost:3001/center"
echo "   Email: admin@againerp.com"
echo "   Password: Admin@1234"
echo ""
echo "Press Ctrl+C to stop all."

wait $API_PID $WEB_PID
