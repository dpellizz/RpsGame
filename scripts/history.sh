#!/usr/bin/env bash
set -euo pipefail

API_BASE=${API_BASE:-http://localhost:8080}

URL="${API_BASE%/}/api/game/history"

echo "GET ${URL}" >&2

curl --silent --show-error --fail --request GET \
  --header "Accept: application/json" \
  "$URL"
