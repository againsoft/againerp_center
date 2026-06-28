#!/bin/bash
# Quick health check for Control Center services
set -e

API="${API_URL:-http://127.0.0.1:8001}"
WEB="${WEB_URL:-http://127.0.0.1:3001}"

echo "Checking Control Center health..."
echo ""

api_ok=0
web_ok=0

if curl -sf "$API/health" >/dev/null 2>&1; then
  echo "  ✓ API healthy ($API)"
  api_ok=1
else
  echo "  ✗ API unreachable ($API/health)"
fi

if curl -sf "$WEB/login" >/dev/null 2>&1; then
  echo "  ✓ Web UI reachable ($WEB)"
  web_ok=1
else
  echo "  ✗ Web UI unreachable ($WEB)"
fi

echo ""
if [ "$api_ok" -eq 1 ] && [ "$web_ok" -eq 1 ]; then
  echo "All services OK"
  exit 0
fi
echo "Some services down — run ./start.sh"
exit 1
