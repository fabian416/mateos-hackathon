#!/bin/bash
set -euo pipefail
echo "=== MateOS — 7 Agents, 1 Gateway ==="

export GATEWAY_PORT="${GATEWAY_PORT:-18789}"
export PRIMARY_MODEL="${PRIMARY_MODEL:-google/gemini-2.5-flash}"
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=2048}"

# Generate config from template
envsubst < /tmp/config/openclaw.json.template > ~/.openclaw/openclaw.json
chmod 600 ~/.openclaw/openclaw.json

# Apply doctor fixes (config migrations)
openclaw doctor --fix 2>&1 || true
echo "Doctor fixes applied"

# Copy workspaces and init state files
for agent in mateo-ceo tropero domador rastreador relator paisano baqueano; do
  mkdir -p ~/.openclaw/workspaces/$agent/memory
  cp /mnt/workspaces/$agent/*.md ~/.openclaw/workspaces/$agent/ 2>/dev/null || true
  [ -f ~/.openclaw/workspaces/$agent/channel-state.json ] || echo "{}" > ~/.openclaw/workspaces/$agent/channel-state.json
  sed -i "s/{{GOG_ACCOUNT}}/${GOG_ACCOUNT:-not-configured}/g" ~/.openclaw/workspaces/$agent/*.md 2>/dev/null || true
  sed -i "s/{{CALENDAR_ID}}/${CALENDAR_ID:-primary}/g" ~/.openclaw/workspaces/$agent/*.md 2>/dev/null || true
  sed -i "s/{{CLIENT_NAME}}/${CLIENT_NAME:-MateOS}/g" ~/.openclaw/workspaces/$agent/*.md 2>/dev/null || true
  sed -i "s/{{GMAIL_EMAIL}}/${GMAIL_EMAIL:-}/g" ~/.openclaw/workspaces/$agent/*.md 2>/dev/null || true
done

# Initialize knowledge graph if not exists
mkdir -p ~/.openclaw/knowledge-graph/{projects,areas/people,areas/companies,resources,archives}
if [ -d /mnt/knowledge-graph ]; then
  cp -a /mnt/knowledge-graph/. ~/.openclaw/knowledge-graph/ 2>/dev/null || true
fi

# Generate auth profiles from GOOGLE_API_KEY (single source of truth)
AUTH_JSON="{\"version\":1,\"profiles\":{\"google:default\":{\"type\":\"api_key\",\"provider\":\"google\",\"key\":\"${GOOGLE_API_KEY:-}\"}}}"
mkdir -p ~/.openclaw/agents/main/agent
echo "$AUTH_JSON" > ~/.openclaw/agents/main/agent/auth-profiles.json
chmod 600 ~/.openclaw/agents/main/agent/auth-profiles.json
for agent in mateo-ceo tropero domador rastreador relator paisano baqueano; do
  mkdir -p ~/.openclaw/agents/$agent/agent
  echo "$AUTH_JSON" > ~/.openclaw/agents/$agent/agent/auth-profiles.json
  chmod 600 ~/.openclaw/agents/$agent/agent/auth-profiles.json
done
echo "Auth profiles generated from GOOGLE_API_KEY"

# Clear stale sessions so agents pick up fresh config/tools on every restart
for agent in mateo-ceo tropero domador rastreador relator paisano baqueano; do
  rm -f ~/.openclaw/agents/$agent/sessions/sessions.json
  rm -f ~/.openclaw/agents/$agent/sessions/*.jsonl
done
echo "Stale sessions cleared"

# Bind each Telegram bot account to its agent
for agent in mateo-ceo tropero domador rastreador relator paisano baqueano; do
  openclaw agents bind --agent "$agent" --bind "telegram:$agent" 2>/dev/null || true
done
echo "Agent bindings configured"

# Register cron jobs in background (needs gateway running first)
(
  sleep 30  # wait for gateway to start
  openclaw cron add --name "nightly-extraction" --agent domador --session isolated \
    --cron "0 23 * * *" --tz "America/Argentina/Buenos_Aires" --timeout-seconds 120 \
    --channel telegram --account domador --to "${TELEGRAM_OWNER_ID}" \
    --message "Revisá las conversaciones de hoy de todos los agentes. Extraé hechos durables (decisiones tomadas, preferencias descubiertas, contactos nuevos, cambios de estado de proyectos). Ignorá small talk y pedidos transitorios. Guardá los hechos en ~/knowledge-graph/ según corresponda (projects/, areas/people/, areas/companies/). Actualizá memory/YYYY-MM-DD.md con un timeline." \
    2>/dev/null || true
  openclaw cron add --name "morning-brief" --agent domador --session isolated \
    --cron "0 8 * * 1-5" --tz "America/Argentina/Buenos_Aires" --timeout-seconds 60 --announce \
    --channel telegram --account domador --to "${TELEGRAM_OWNER_ID}" \
    --message "Preparame el brief matutino. Incluí: tareas pendientes de ayer, reuniones de hoy (consultá el calendario con gog), deadlines próximos (<48h), y cualquier mensaje sin responder en los canales. Formato conciso." \
    2>/dev/null || true
  openclaw cron add --name "weekly-memory-review" --agent domador --session isolated \
    --cron "0 22 * * 0" --tz "America/Argentina/Buenos_Aires" --timeout-seconds 180 \
    --channel telegram --account domador --to "${TELEGRAM_OWNER_ID}" \
    --message "Revisión semanal de memoria. Revisá los hechos en ~/knowledge-graph/ y MEMORY.md. Marcá como cold cualquier hecho no accedido en 30+ días. Reescribí los summary.md de entidades que tuvieron cambios esta semana. Proponé actualizaciones a MEMORY.md si detectás patrones nuevos." \
    2>/dev/null || true
  echo "Cron jobs registered"
) &

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
