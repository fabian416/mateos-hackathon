#!/bin/bash
set -euo pipefail

echo "=== El Baqueano — MateOS ==="

# Validate required env vars
REQUIRED=(TELEGRAM_BOT_TOKEN TELEGRAM_OWNER_ID GATEWAY_AUTH_TOKEN)
for var in "${REQUIRED[@]}"; do
  if [ -z "${!var:-}" ]; then
    echo "Error: $var is not set"
    exit 1
  fi
done

# Validate email vars only if email is enabled
if [ "${EMAIL_ENABLED:-false}" = "true" ]; then
  EMAIL_REQUIRED=(GMAIL_EMAIL GMAIL_APP_PASSWORD)
  for var in "${EMAIL_REQUIRED[@]}"; do
    if [ -z "${!var:-}" ]; then
      echo "Error: $var is not set (EMAIL_ENABLED=true)"
      exit 1
    fi
  done
fi

# Set defaults
export TELEGRAM_DM_POLICY="${TELEGRAM_DM_POLICY:-allowlist}"
export TELEGRAM_GROUP_POLICY="${TELEGRAM_GROUP_POLICY:-disabled}"
export GATEWAY_PORT="${GATEWAY_PORT:-18789}"
export PRIMARY_MODEL="${PRIMARY_MODEL:-anthropic/claude-haiku-4-5}"
export GMAIL_DISPLAY_NAME="${GMAIL_DISPLAY_NAME:-${CLIENT_NAME:-MateOS} Bot}"
export WHATSAPP_ENABLED="${WHATSAPP_ENABLED:-false}"
export WHATSAPP_DM_POLICY="${WHATSAPP_DM_POLICY:-open}"
# WHATSAPP_ALLOW_FROM needs to be valid JSON array content for envsubst
# e.g. * becomes "*", 549111234 becomes "549111234"
_WA_RAW="${WHATSAPP_ALLOW_FROM:-}"
if [ -n "$_WA_RAW" ]; then
  # Quote each comma-separated value for JSON
  export WHATSAPP_ALLOW_FROM=$(echo "$_WA_RAW" | sed 's/[^,]*/"&"/g')
else
  export WHATSAPP_ALLOW_FROM=""
fi
export AGENT_NAME="${AGENT_NAME:-agent}"
export ROUTER_URL="${ROUTER_URL:-http://agent-router:8080}"
export SQUAD_AUTH_TOKEN="${SQUAD_AUTH_TOKEN:-}"

# Generate configs from templates
envsubst < /tmp/config/openclaw.json.template > ~/.openclaw/openclaw.json
chmod 600 ~/.openclaw/openclaw.json

if [ "${EMAIL_ENABLED:-false}" = "true" ]; then
  envsubst < /tmp/config/himalaya.config.toml.template > ~/.config/himalaya/config.toml
  chmod 600 ~/.config/himalaya/config.toml
fi

# Start channel-checker cron loop
(
  while true; do
    ~/channel-checker.py >> ~/.openclaw/logs/channel-checker.log 2>&1 || true
    sleep 60
  done
) &
echo "Channel checker loop started (every 60s)"

# Start openclaw gateway (foreground)
echo "Starting openclaw gateway..."
exec openclaw gateway
