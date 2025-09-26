#!/usr/bin/env bash
set -euo pipefail

API_BASE=${API_BASE:-http://localhost:8080}
PLAYER_MOVE_RAW=${1:-rock}
PLAYER_MOVE=$(printf '%s' "$PLAYER_MOVE_RAW" | tr '[:upper:]' '[:lower:]')

case "$PLAYER_MOVE" in
  rock|paper|scissors)
    ;;
  *)
    echo "Usage: $0 [rock|paper|scissors]" >&2
    echo "(case-insensitive; you passed '$PLAYER_MOVE_RAW')" >&2
    exit 1
    ;;
esac

URL="${API_BASE%/}/api/game/play?playerMove=${PLAYER_MOVE}"

echo "POST ${URL}" >&2

curl --silent --show-error --fail --request POST \
  --header "Content-Type: application/json" \
  --data '' \
  "$URL" || {
    echo "Request failed" >&2
    exit 1
  }
