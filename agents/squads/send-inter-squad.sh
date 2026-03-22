#!/bin/bash
# Send an inter-squad message through the ERC-8004 verification hook
#
# Usage:
#   ./send-inter-squad.sh <target-squad-port> <from-agent-id> <from-squad-name> "<action>" "<details>"
#
# Examples:
#   ./send-inter-squad.sh 18789 35303 "Andes Vineyard" "15 cases Malbec Reserva ready" '{"batch":"#48","eta":"Thursday"}'
#   ./send-inter-squad.sh 18791 35270 "Buenos Table" "Need 10 cases Malbec for Saturday event" '{}'
#
# The target squad's hook verifies ERC-8004 identity + reputation before accepting.

set -euo pipefail

TARGET_PORT="${1:?Usage: $0 <port> <agentId> <squadName> <action> [details]}"
FROM_AGENT_ID="${2:?Missing fromAgentId}"
FROM_SQUAD_NAME="${3:?Missing squadName}"
ACTION="${4:?Missing action}"
DETAILS="${5:-{}}"
HOOKS_TOKEN="${HOOKS_TOKEN:-7de1889cdf99f993be21ee7352275351889d6e8a4e49537a}"

echo "Sending inter-squad message..."
echo "  From: ${FROM_SQUAD_NAME} (agentId: ${FROM_AGENT_ID})"
echo "  To: localhost:${TARGET_PORT}/hooks/erc8004"
echo "  Action: ${ACTION}"

RESPONSE=$(curl -s -X POST "http://localhost:${TARGET_PORT}/hooks/erc8004" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${HOOKS_TOKEN}" \
  -d "{
    \"agentId\": ${FROM_AGENT_ID},
    \"squadName\": \"${FROM_SQUAD_NAME}\",
    \"action\": \"${ACTION}\",
    \"details\": ${DETAILS}
  }")

echo "  Response: ${RESPONSE}"
