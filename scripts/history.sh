#!/usr/bin/env bash
set -euo pipefail

API_BASE=${API_BASE:-http://localhost:8080}
PAGE=${PAGE:-1}
PAGE_SIZE=${PAGE_SIZE:-25}

URL="${API_BASE%/}/api/game/history?page=${PAGE}&pageSize=${PAGE_SIZE}"

echo "GET ${URL}" >&2

curl --silent --show-error --fail --request GET \
  --header "Accept: application/json" \
  "$URL"
