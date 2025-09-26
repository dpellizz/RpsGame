#!/usr/bin/env bash
set -euo pipefail

API_BASE=${API_BASE:-http://localhost:8080}

URL="${API_BASE%/}/api/game/history"

echo "DELETE ${URL}" >&2

curl --silent --show-error --fail --request DELETE \
  "$URL"

echo ""  # newline for cleanliness
