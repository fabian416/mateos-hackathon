#!/bin/bash
set -euo pipefail

echo "=== Mateo CEO — Gaucho Solutions ==="

# Validate required env vars
for var in TELEGRAM_BOT_TOKEN TELEGRAM_OWNER_ID; do
  if [ -z "${!var:-}" ]; then
    echo "Error: $var is not set"
    exit 1
  fi
done

echo "Tweet scheduler running (every 120s)"
echo "Slots: ${TWEET_SLOTS:-09:00,11:00,13:00,16:00,19:00,21:00}"

# Loop tweet-scheduler every 2 minutes (foreground)
while true; do
  python3 scripts/tweet-scheduler.py >> logs/marcos.log 2>&1 || true
  sleep 120
done
