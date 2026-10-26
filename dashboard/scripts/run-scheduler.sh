#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_DIR"

set -a
# The application .env is owner-readable and is not committed to source control.
source .env
set +a

: "${SCHEDULER_SECRET:?SCHEDULER_SECRET is required}"

curl --fail --silent --show-error --max-time 55 \
  --request POST \
  --header "Authorization: Bearer ${SCHEDULER_SECRET}" \
  --header "Content-Type: application/json" \
  --data '{}' \
  http://127.0.0.1:3000/api/internal/scheduler
