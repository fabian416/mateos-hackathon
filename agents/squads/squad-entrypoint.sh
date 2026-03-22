#!/bin/bash
set -euo pipefail
echo "=== MateOS Squad: ${SQUAD_NAME} ==="

export GATEWAY_PORT="${GATEWAY_PORT:-18790}"
export PRIMARY_MODEL="${PRIMARY_MODEL:-google/gemini-2.5-flash}"

# Generate config from template
envsubst < /tmp/config/squad-openclaw.json.template > ~/.openclaw/openclaw.json
chmod 600 ~/.openclaw/openclaw.json

# Apply doctor fixes
openclaw doctor --fix 2>&1 || true

# Setup workspace
mkdir -p ~/.openclaw/workspaces/${SQUAD_AGENT_ID}/memory
cp /mnt/workspace/*.md ~/.openclaw/workspaces/${SQUAD_AGENT_ID}/ 2>/dev/null || true
echo "{}" > ~/.openclaw/workspaces/${SQUAD_AGENT_ID}/channel-state.json

# Generate auth profile
AUTH_JSON="{\"version\":1,\"profiles\":{\"google:default\":{\"type\":\"api_key\",\"provider\":\"google\",\"key\":\"${GOOGLE_API_KEY:-}\"}}}"
mkdir -p ~/.openclaw/agents/${SQUAD_AGENT_ID}/agent
echo "$AUTH_JSON" > ~/.openclaw/agents/${SQUAD_AGENT_ID}/agent/auth-profiles.json
chmod 600 ~/.openclaw/agents/${SQUAD_AGENT_ID}/agent/auth-profiles.json

# Clear stale sessions
rm -f ~/.openclaw/agents/${SQUAD_AGENT_ID}/sessions/sessions.json
rm -f ~/.openclaw/agents/${SQUAD_AGENT_ID}/sessions/*.jsonl

# Bind Telegram
openclaw agents bind --agent "${SQUAD_AGENT_ID}" --bind "telegram:${SQUAD_AGENT_ID}" 2>/dev/null || true

echo "Starting openclaw gateway for ${SQUAD_NAME}..."
exec openclaw gateway
