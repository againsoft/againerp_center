#!/bin/sh
set -e
PORT="${PORT:-3000}"
HOSTNAME="${HOSTNAME:-0.0.0.0}"
exec node server.js
