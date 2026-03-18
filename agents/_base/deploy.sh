#!/bin/bash
set -euo pipefail

# =============================================================================
# deploy.sh — Genera una instancia de agente MateOS para un cliente
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
AGENTS_DIR="$(dirname "$SCRIPT_DIR")"
DEPLOYMENTS_DIR="${AGENTS_DIR}/deployments"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

usage() {
    echo "Uso: ./deploy.sh --client-name <nombre> --agent-type <tipo> [--channels <canales>]"
    echo ""
    echo "Opciones:"
    echo "  --client-name    Nombre del cliente (ej: mi-empresa)"
    echo "  --agent-type     Tipo de agente: el-baqueano, el-relator, el-tropero, el-domador, el-paisano"
    echo "  --channels       Canales separados por coma (default: telegram,whatsapp)"
    echo "                   Opciones: telegram, email, whatsapp"
    echo ""
    echo "Ejemplo:"
    echo "  ./deploy.sh --client-name panaderia-carlos --agent-type el-baqueano --channels telegram,whatsapp,email"
    exit 1
}

# Parse args
CLIENT_NAME=""
AGENT_TYPE=""
CHANNELS="telegram,whatsapp"

while [[ $# -gt 0 ]]; do
    case $1 in
        --client-name) CLIENT_NAME="$2"; shift 2 ;;
        --agent-type) AGENT_TYPE="$2"; shift 2 ;;
        --channels) CHANNELS="$2"; shift 2 ;;
        -h|--help) usage ;;
        *) echo "Opción desconocida: $1"; usage ;;
    esac
done

if [ -z "$CLIENT_NAME" ] || [ -z "$AGENT_TYPE" ]; then
    echo -e "${RED}Error: --client-name y --agent-type son obligatorios${NC}"
    usage
fi

# Validate agent type
AGENT_TYPE_DIR="${AGENTS_DIR}/${AGENT_TYPE}"
if [ ! -d "$AGENT_TYPE_DIR" ]; then
    echo -e "${RED}Error: tipo de agente '${AGENT_TYPE}' no encontrado en ${AGENTS_DIR}/${NC}"
    echo "Tipos disponibles:"
    ls -d "${AGENTS_DIR}"/el-* 2>/dev/null | xargs -n1 basename || echo "  (ninguno)"
    exit 1
fi

# Create deployment directory
DEPLOY_DIR="${DEPLOYMENTS_DIR}/${CLIENT_NAME}"
if [ -d "$DEPLOY_DIR" ]; then
    echo -e "${YELLOW}Advertencia: ${DEPLOY_DIR} ya existe.${NC}"
    read -p "¿Sobreescribir? (s/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo "Cancelado."
        exit 0
    fi
    rm -rf "$DEPLOY_DIR"
fi

echo -e "${GREEN}=== Creando agente ${AGENT_TYPE} para ${CLIENT_NAME} ===${NC}"
mkdir -p "$DEPLOY_DIR"

# 1. Copy base files
echo "  Copiando base..."
mkdir -p "${DEPLOY_DIR}/workspace" "${DEPLOY_DIR}/config" "${DEPLOY_DIR}/scripts" "${DEPLOY_DIR}/memory" "${DEPLOY_DIR}/logs"

cp "${SCRIPT_DIR}/workspace/SOUL-BASE.md" "${DEPLOY_DIR}/workspace/"
cp "${SCRIPT_DIR}/workspace/AGENTS-BASE.md" "${DEPLOY_DIR}/workspace/"
cp "${SCRIPT_DIR}/workspace/HEARTBEAT-BASE.md" "${DEPLOY_DIR}/workspace/"
cp "${SCRIPT_DIR}/workspace/TOOLS-BASE.md" "${DEPLOY_DIR}/workspace/"
cp "${SCRIPT_DIR}/workspace/IDENTITY-BASE.md" "${DEPLOY_DIR}/workspace/" 2>/dev/null || true
cp "${SCRIPT_DIR}/workspace/MEMORY-BASE.md" "${DEPLOY_DIR}/workspace/" 2>/dev/null || true
cp "${SCRIPT_DIR}/workspace/USER.md" "${DEPLOY_DIR}/workspace/" 2>/dev/null || true
cp "${SCRIPT_DIR}/workspace/TRUST-LADDER.md" "${DEPLOY_DIR}/workspace/" 2>/dev/null || true
cp "${SCRIPT_DIR}/workspace/COST-STRATEGY.md" "${DEPLOY_DIR}/workspace/" 2>/dev/null || true
cp "${SCRIPT_DIR}/workspace/INTEGRATIONS.md" "${DEPLOY_DIR}/workspace/" 2>/dev/null || true
cp -r "${SCRIPT_DIR}/workspace/skills" "${DEPLOY_DIR}/workspace/" 2>/dev/null || true
cp "${SCRIPT_DIR}/config/openclaw.json.template" "${DEPLOY_DIR}/config/"
cp "${SCRIPT_DIR}/config/himalaya.config.toml.template" "${DEPLOY_DIR}/config/"
cp "${SCRIPT_DIR}/scripts/channel-checker.py" "${DEPLOY_DIR}/scripts/"
cp "${SCRIPT_DIR}/scripts/tweet-scheduler.py" "${DEPLOY_DIR}/scripts/" 2>/dev/null || true
cp "${SCRIPT_DIR}/.env.example" "${DEPLOY_DIR}/.env.example"

# 2. Copy agent-type specific files (overwrite base where applicable)
echo "  Aplicando overlay ${AGENT_TYPE}..."
if [ -d "${AGENT_TYPE_DIR}/workspace" ]; then
    cp "${AGENT_TYPE_DIR}/workspace/"* "${DEPLOY_DIR}/workspace/" 2>/dev/null || true
fi
if [ -d "${AGENT_TYPE_DIR}/config" ]; then
    cp "${AGENT_TYPE_DIR}/config/"* "${DEPLOY_DIR}/config/" 2>/dev/null || true
fi

# 3. Copy Docker files
echo "  Copiando Docker files..."
cp "${SCRIPT_DIR}/docker/Dockerfile.template" "${DEPLOY_DIR}/Dockerfile"
cp "${SCRIPT_DIR}/docker/docker-compose.yml.template" "${DEPLOY_DIR}/docker-compose.yml"
cp "${SCRIPT_DIR}/docker/docker-entrypoint.sh.template" "${DEPLOY_DIR}/docker-entrypoint.sh"
chmod +x "${DEPLOY_DIR}/docker-entrypoint.sh"

# 4. Determine channel config
HAS_EMAIL=false
HAS_WHATSAPP=false
IFS=',' read -ra CHANNEL_ARRAY <<< "$CHANNELS"
for ch in "${CHANNEL_ARRAY[@]}"; do
    case $(echo "$ch" | xargs) in
        email) HAS_EMAIL=true ;;
        whatsapp) HAS_WHATSAPP=true ;;
        telegram) ;; # always included
        *) echo -e "${YELLOW}  Canal desconocido: ${ch}${NC}" ;;
    esac
done

# 5. Generate .env from example with channel defaults
echo "  Generando .env..."
SANITIZED_NAME=$(echo "$CLIENT_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
SERVICE_NAME="${AGENT_TYPE}-${SANITIZED_NAME}"

cat > "${DEPLOY_DIR}/.env" << ENVEOF
# === Generado por deploy.sh — $(date -Iseconds) ===
AGENT_NAME=${SERVICE_NAME}
PRIMARY_MODEL=anthropic/claude-haiku-4-5

# Telegram (REQUERIDO)
TELEGRAM_BOT_TOKEN=COMPLETAR
TELEGRAM_DM_POLICY=allowlist
TELEGRAM_GROUP_POLICY=disabled
TELEGRAM_OWNER_ID=COMPLETAR

# Email
EMAIL_ENABLED=${HAS_EMAIL}
GMAIL_EMAIL=COMPLETAR
GMAIL_DISPLAY_NAME=${CLIENT_NAME} Bot
GMAIL_APP_PASSWORD=COMPLETAR

# WhatsApp
WHATSAPP_ENABLED=${HAS_WHATSAPP}
WHATSAPP_DM_POLICY=open
WHATSAPP_ALLOW_FROM=

# Twitter/X
TWITTER_ENABLED=false
TWITTER_API_KEY=COMPLETAR
TWITTER_API_SECRET=COMPLETAR
TWITTER_ACCESS_TOKEN=COMPLETAR
TWITTER_ACCESS_TOKEN_SECRET=COMPLETAR
TWEET_SLOTS=09:00,11:00,13:00,16:00,19:00,21:00

# Gateway
GATEWAY_PORT=18789
GATEWAY_AUTH_TOKEN=COMPLETAR

# Cliente
CLIENT_NAME=${CLIENT_NAME}
BRAND_EMOJI=
SUPPORT_SIGNATURE=Equipo ${CLIENT_NAME}
ENVEOF

# 6. Replace placeholders in docker-compose
sed -i "s/\${SERVICE_NAME}/${SERVICE_NAME}/g" "${DEPLOY_DIR}/docker-compose.yml"
sed -i "s/\${CONTAINER_NAME}/${SERVICE_NAME}/g" "${DEPLOY_DIR}/docker-compose.yml"

# 7. Replace {{AGENT_DISPLAY_NAME}} in entrypoint
sed -i "s/{{AGENT_DISPLAY_NAME}}/${AGENT_TYPE} - ${CLIENT_NAME}/g" "${DEPLOY_DIR}/docker-entrypoint.sh"

# 8. Create .gitignore
cat > "${DEPLOY_DIR}/.gitignore" << 'GIEOF'
.env
logs/
*.log
GIEOF

echo ""
echo -e "${GREEN}=== Agente creado exitosamente ===${NC}"
echo ""
echo "  Directorio: ${DEPLOY_DIR}"
echo "  Tipo:       ${AGENT_TYPE}"
echo "  Canales:    ${CHANNELS}"
echo ""
echo -e "${YELLOW}Próximos pasos:${NC}"
echo ""
echo "  1. Editá ${DEPLOY_DIR}/.env con las credenciales reales"
echo "     - TELEGRAM_BOT_TOKEN (crear bot con @BotFather)"
echo "     - TELEGRAM_OWNER_ID (tu chat ID)"
echo "     - GATEWAY_AUTH_TOKEN (generar uno seguro)"
if [ "$HAS_EMAIL" = true ]; then
    echo "     - GMAIL_EMAIL + GMAIL_APP_PASSWORD"
fi
echo ""
echo "  2. Personalizá los archivos del workspace:"
echo "     - workspace/SOUL.md → reemplazá {{CLIENT_NAME}}, {{BRAND_MANTRA}}, etc."
echo "     - workspace/TOOLS.md → completá {{CLIENT_CONTEXT}}, {{CLIENT_FAQ}}, etc."
echo ""
echo "  3. Construí y levantá:"
echo "     cd ${DEPLOY_DIR}"
echo "     docker compose build"
echo "     docker compose up -d"
echo ""
if [ "$HAS_WHATSAPP" = true ]; then
    echo "  4. Conectá WhatsApp (escanear QR):"
    echo "     docker exec -it ${SERVICE_NAME} openclaw channels login --channel whatsapp"
    echo ""
fi
echo "  Logs: docker compose logs -f"
echo ""
