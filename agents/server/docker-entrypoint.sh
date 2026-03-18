#!/bin/bash
set -euo pipefail
echo "=== MateOS — 7 Agents, 1 Gateway ==="

export GATEWAY_PORT="${GATEWAY_PORT:-18789}"
export PRIMARY_MODEL="${PRIMARY_MODEL:-google/gemini-2.5-flash}"
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=2048}"

# Generate config
envsubst < /tmp/config/openclaw.json.template > ~/.openclaw/openclaw.json
chmod 600 ~/.openclaw/openclaw.json

# Copy workspaces and init state files
for agent in mateo-ceo tropero domador rastreador relator paisano baqueano; do
  mkdir -p ~/.openclaw/workspaces/$agent
  cp /mnt/workspaces/$agent/*.md ~/.openclaw/workspaces/$agent/ 2>/dev/null || true
  [ -f ~/.openclaw/workspaces/$agent/channel-state.json ] || echo "{}" > ~/.openclaw/workspaces/$agent/channel-state.json
  sed -i "s/{{GOG_ACCOUNT}}/${GOG_ACCOUNT:-not-configured}/g" ~/.openclaw/workspaces/$agent/*.md 2>/dev/null || true
  sed -i "s/{{CALENDAR_ID}}/${CALENDAR_ID:-primary}/g" ~/.openclaw/workspaces/$agent/*.md 2>/dev/null || true
  sed -i "s/{{CLIENT_NAME}}/${CLIENT_NAME:-MateOS}/g" ~/.openclaw/workspaces/$agent/*.md 2>/dev/null || true
  sed -i "s/{{GMAIL_EMAIL}}/${GMAIL_EMAIL:-}/g" ~/.openclaw/workspaces/$agent/*.md 2>/dev/null || true
done

# Auth profiles — copy to main and each agent
mkdir -p ~/.openclaw/agents/main/agent
cp /mnt/auth-profiles.json ~/.openclaw/agents/main/agent/auth-profiles.json
chmod 600 ~/.openclaw/agents/main/agent/auth-profiles.json
for agent in mateo-ceo tropero domador rastreador relator paisano baqueano; do
  mkdir -p ~/.openclaw/agents/$agent/agent
  cp /mnt/auth-profiles.json ~/.openclaw/agents/$agent/agent/auth-profiles.json
  chmod 600 ~/.openclaw/agents/$agent/agent/auth-profiles.json
done

# Bind each Telegram bot account to its agent
for agent in mateo-ceo tropero domador rastreador relator paisano baqueano; do
  openclaw agents bind --agent "$agent" --bind "telegram:$agent" 2>/dev/null || true
done
echo "Agent bindings configured"

# Tweet scheduler (background, for Mateo CEO)
if [ "${TWITTER_ENABLED:-false}" = "true" ] && [ -f /mnt/tweet-scheduler.py ]; then
  (
    while true; do
      python3 /mnt/tweet-scheduler.py 2>&1 || true
      sleep 120
    done
  ) &
  echo "Tweet scheduler started"
fi

# Channel checker (background)
(
  while true; do
    ~/channel-checker.py >> ~/.openclaw/logs/channel-checker.log 2>&1 || true
    sleep 60
  done
) &
echo "Channel checker started"

echo "Starting openclaw gateway with 7 agents..."
exec openclaw gateway
