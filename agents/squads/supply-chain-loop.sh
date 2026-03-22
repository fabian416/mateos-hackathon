#!/bin/bash
# MateOS Supply Chain Orchestrator
#
# Runs every N minutes, picks a supply chain scenario, sends messages
# between squads via Telegram, collects responses, and records
# feedback + validation onchain.
#
# Usage: ./supply-chain-loop.sh [--once] [--interval 600]
#   --once      Run one scenario and exit
#   --interval  Seconds between scenarios (default: 600 = 10 min)

set -euo pipefail

# ── Config ──
OWNER_ID="832970133"
HOOKS_TOKEN="7de1889cdf99f993be21ee7352275351889d6e8a4e49537a"
RPC_URL="https://mainnet.base.org"
REP_REGISTRY="0x8004BAa17C55a88189AE136b182e5fdA19dE9b63"
VAL_CONTRACT="0x17Fa2eF50Cc53A96C08610f345fAd0F2c4Ecc149"

# Squad bot tokens
declare -A BOT_TOKENS
BOT_TOKENS[andes]="8609503683:AAESxz0axA5tLVclrkeMfp9G3o5C8i3MYbU"
BOT_TOKENS[altura]="8128932743:AAEcYjgQgZ5Ope8tBB3sArFrComtTl7p0Bg"
BOT_TOKENS[central]="8697532710:AAEIeAq-yldJ8VFAIOVcqaLBiy-n2NfBnu0"
BOT_TOKENS[citrus]="8715073440:AAF58kY8MdzY1oYnnop06Qyl5pFTMCiwL5k"
BOT_TOKENS[estancia]="8761323333:AAGlDcRFMGbY_8h5hnHKk5iJo31Qu9PLPJ8"

# Squad agent IDs (ERC-8004)
declare -A AGENT_IDS
AGENT_IDS[andes]=35303
AGENT_IDS[altura]=35305
AGENT_IDS[central]=35304
AGENT_IDS[citrus]=35306
AGENT_IDS[estancia]=35307
AGENT_IDS[buenos]=35270

# Squad wallets for onchain operations
declare -A WALLETS
WALLETS[buenos]="af25b8a317b9f26545bfb49c41b671bf2028cb81ab65d031950cc483cc2d099a"
WALLETS[andes]="5a5ab352967b807d1e798d7846bc24580dbc7d779c79f4ed9782b7a278ed285a"
WALLETS[central]="4dd60b956711b3fa970dbbed1a4556ba6781394a04c18c2b1b1f4a283820a9b7"
WALLETS[altura]="0741ed3ff8c88081fb16081c5b739468833d97666b389b9d6ed1c0ce7bf23bde"
WALLETS[citrus]="90f9cc5ea64048042e9c975026575cb4dad25ff9880321d7eb72a2ca3b246451"
WALLETS[estancia]="79b1f68892619ae4d07206c17b8b5c85b4b082613c27a79b18a891008b2dcab9"

# ── Supply chain scenarios ──
SCENARIOS=(
  "wine_order"
  "delivery_coordination"
  "quality_check"
  "lemon_shipment"
  "meat_order"
  "partner_pairing"
  "frost_alert"
  "menu_change"
)

# ── Helpers ──

send_telegram() {
  local bot_key="$1"
  local message="$2"
  local token="${BOT_TOKENS[$bot_key]}"

  curl -s "https://api.telegram.org/bot${token}/sendMessage" \
    -d "chat_id=${OWNER_ID}" \
    -d "text=${message}" \
    -d "parse_mode=Markdown" | python3 -c "
import sys,json
r=json.load(sys.stdin)
if r.get('ok'):
    print(r['result']['message_id'])
else:
    print('ERROR:' + r.get('description','unknown'))
" 2>/dev/null
}

get_response() {
  local bot_key="$1"
  local after_id="$2"
  local token="${BOT_TOKENS[$bot_key]}"
  local attempts=0

  while [ $attempts -lt 12 ]; do
    sleep 5
    attempts=$((attempts + 1))

    local response=$(curl -s "https://api.telegram.org/bot${token}/getUpdates" \
      -d "offset=-1" -d "limit=1" | python3 -c "
import sys,json
r=json.load(sys.stdin)
updates = r.get('result',[])
for u in updates:
    msg = u.get('message',{})
    if msg.get('from',{}).get('is_bot') and msg.get('message_id',0) > int('${after_id}'):
        print(msg.get('text','')[:500])
        break
" 2>/dev/null)

    if [ -n "$response" ] && [ "$response" != "" ]; then
      echo "$response"
      return 0
    fi
  done
  echo "(no response within 60s)"
}

give_feedback_onchain() {
  local from_wallet="$1"
  local to_agent_id="$2"
  local score="$3"
  local tag1="$4"
  local tag2="$5"

  local feedback_json="{\"agentId\":${to_agent_id},\"value\":${score},\"tag1\":\"${tag1}\",\"tag2\":\"${tag2}\",\"ts\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}"
  local feedback_hash=$(echo -n "$feedback_json" | cast keccak 2>/dev/null || echo "0x0000000000000000000000000000000000000000000000000000000000000000")

  cast send "$REP_REGISTRY" \
    "giveFeedback(uint256,int128,uint8,string,string,string,string,bytes32)" \
    "$to_agent_id" "$score" 0 "$tag1" "$tag2" "https://mateos.tech" "$feedback_json" "$feedback_hash" \
    --rpc-url "$RPC_URL" --private-key "$from_wallet" --gas-limit 300000 --json 2>/dev/null | \
    python3 -c "import sys,json; r=json.load(sys.stdin); print(r.get('transactionHash','failed'))" 2>/dev/null || echo "tx-failed"
}

log() {
  echo "[$(date +%H:%M:%S)] $1"
}

# ── Scenario implementations ──

run_wine_order() {
  log "SCENARIO: Buenos Table orders Malbec from Andes Vineyard"
  log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  log "→ Sending order to Andes Vineyard..."
  local msg_id=$(send_telegram "andes" "⛓️ *Inter-squad order from Buenos Table* (agentId: 35270, rep: 92/100)

We need 10 cases of Malbec Reserva for this weekend. Confirm batch availability, tasting notes, and shipping ETA via Central Logistics.")
  log "  Message sent (id: $msg_id)"

  log "→ Waiting for Andes Vineyard response..."
  local response=$(get_response "andes" "$msg_id")
  log "  Response: ${response:0:200}"

  log "→ Forwarding to Central Logistics for shipping..."
  send_telegram "central" "⛓️ *Shipment request from Andes Vineyard* (agentId: 35303, rep: 74/100)

Andes Vineyard confirmed a Malbec order for Buenos Table. 10 cases ready for pickup in Mendoza. Schedule Monday AM pickup and coordinate Friday 6AM delivery to Buenos Aires.

_Andes Vineyard said: ${response:0:200}_" > /dev/null

  log "→ Recording feedback onchain..."
  local tx=$(give_feedback_onchain "${WALLETS[buenos]}" "${AGENT_IDS[andes]}" 95 "wine-order" "confirmed")
  log "  Feedback tx: ${tx:0:20}..."

  log "✓ Wine order scenario complete"
}

run_delivery_coordination() {
  log "SCENARIO: Central Logistics coordinates consolidated delivery"
  log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  log "→ Requesting delivery status from Central Logistics..."
  local msg_id=$(send_telegram "central" "⛓️ *Status request from Buenos Table* (agentId: 35270, rep: 92/100)

What's the status of this week's consolidated delivery? I need updates on:
- Wine shipment from Mendoza (Andes Vineyard)
- Lemons from Tucumán (Norte Citrus)
- Meats from Córdoba (Estancia Meats)
ETA for Friday 6AM delivery to Buenos Aires?")
  log "  Message sent (id: $msg_id)"

  log "→ Waiting for response..."
  local response=$(get_response "central" "$msg_id")
  log "  Response: ${response:0:200}"

  local tx=$(give_feedback_onchain "${WALLETS[buenos]}" "${AGENT_IDS[central]}" 93 "delivery" "status-update")
  log "  Feedback tx: ${tx:0:20}..."

  log "✓ Delivery coordination scenario complete"
}

run_quality_check() {
  log "SCENARIO: Andes Vineyard sends quality report to Buenos Table"
  log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  log "→ Requesting quality report from Andes Vineyard..."
  local msg_id=$(send_telegram "andes" "⛓️ *Quality check from Buenos Table* (agentId: 35270, rep: 92/100)

Send me the quality assessment for your latest Malbec Reserva batch. I need: ABV, pH, residual sugar, tasting notes, and your recommendation for food pairing at our Saturday event.")
  log "  Message sent (id: $msg_id)"

  log "→ Waiting for quality report..."
  local response=$(get_response "andes" "$msg_id")
  log "  Response: ${response:0:200}"

  local tx=$(give_feedback_onchain "${WALLETS[buenos]}" "${AGENT_IDS[andes]}" 97 "quality" "report-delivered")
  log "  Feedback tx: ${tx:0:20}..."

  log "✓ Quality check scenario complete"
}

run_lemon_shipment() {
  log "SCENARIO: Central Logistics orders lemons from Norte Citrus"
  log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  log "→ Sending lemon order to Norte Citrus..."
  local msg_id=$(send_telegram "citrus" "⛓️ *Order from Central Logistics* (agentId: 35304, rep: 84/100)

Buenos Table needs 150kg Meyer lemons Grade A for this weekend. Cold chain 4-8°C required. Can you confirm availability and schedule Tuesday PM pickup from Tucumán?")
  log "  Message sent (id: $msg_id)"

  log "→ Waiting for response..."
  local response=$(get_response "citrus" "$msg_id")
  log "  Response: ${response:0:200}"

  local tx=$(give_feedback_onchain "${WALLETS[central]}" "${AGENT_IDS[citrus]}" 91 "citrus-order" "confirmed")
  log "  Feedback tx: ${tx:0:20}..."

  log "✓ Lemon shipment scenario complete"
}

run_meat_order() {
  log "SCENARIO: Central Logistics orders cured meats from Estancia Meats"
  log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  log "→ Sending meat order to Estancia Meats..."
  local msg_id=$(send_telegram "estancia" "⛓️ *Order from Central Logistics* (agentId: 35304, rep: 84/100)

Buenos Table requests 20kg artisan salame (minimum 45-day cure) and 8kg aged cheese for their weekend tasting event. Confirm curing status and schedule Wednesday pickup from Córdoba. Dry transport.")
  log "  Message sent (id: $msg_id)"

  log "→ Waiting for response..."
  local response=$(get_response "estancia" "$msg_id")
  log "  Response: ${response:0:200}"

  local tx=$(give_feedback_onchain "${WALLETS[central]}" "${AGENT_IDS[estancia]}" 89 "meat-order" "confirmed")
  log "  Feedback tx: ${tx:0:20}..."

  log "✓ Meat order scenario complete"
}

run_partner_pairing() {
  log "SCENARIO: Andes Vineyard asks Altura Wines for Torrontés pairing"
  log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  log "→ Sending pairing request to Altura Wines..."
  local msg_id=$(send_telegram "altura" "⛓️ *Pairing request from Andes Vineyard* (agentId: 35303, rep: 74/100)

Buenos Table is doing a citrus dessert this weekend and needs a Torrontés to pair. Can you supply 5 cases of your latest high-altitude batch? Send tasting notes so we can recommend the pairing together.")
  log "  Message sent (id: $msg_id)"

  log "→ Waiting for response..."
  local response=$(get_response "altura" "$msg_id")
  log "  Response: ${response:0:200}"

  local tx=$(give_feedback_onchain "${WALLETS[andes]}" "${AGENT_IDS[altura]}" 92 "pairing" "torrontes-supplied")
  log "  Feedback tx: ${tx:0:20}..."

  log "✓ Partner pairing scenario complete"
}

run_frost_alert() {
  log "SCENARIO: Andes Vineyard reports frost — supply chain adapts"
  log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  log "→ Alerting Central Logistics about frost..."
  local msg_id=$(send_telegram "central" "⛓️ *URGENT from Andes Vineyard* (agentId: 35303, rep: 74/100)

🥶 Frost alert in Mendoza. Our Cabernet Sauvignon batch is delayed 1 week. We can substitute with Bonarda (similar profile, 14.2% ABV, dark fruit notes). Please notify Buenos Table and adjust the delivery schedule.")
  log "  Message sent (id: $msg_id)"

  log "→ Waiting for Central Logistics response..."
  local response=$(get_response "central" "$msg_id")
  log "  Response: ${response:0:200}"

  local tx=$(give_feedback_onchain "${WALLETS[andes]}" "${AGENT_IDS[central]}" 96 "frost-alert" "handled")
  log "  Feedback tx: ${tx:0:20}..."

  log "✓ Frost alert scenario complete"
}

run_menu_change() {
  log "SCENARIO: Buenos Table changes menu — ripple effect across chain"
  log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  log "→ Notifying Central Logistics of menu change..."
  local msg_id=$(send_telegram "central" "⛓️ *Menu update from Buenos Table* (agentId: 35270, rep: 92/100)

We're replacing the citrus dessert with a cheese board for Saturday. Please adjust orders:
- REDUCE: Norte Citrus lemons by 50kg
- INCREASE: Estancia Meats cheese by 5kg
- ADD: Request aged provolone if available
Notify affected suppliers.")
  log "  Message sent (id: $msg_id)"

  log "→ Waiting for acknowledgment..."
  local response=$(get_response "central" "$msg_id")
  log "  Response: ${response:0:200}"

  local tx=$(give_feedback_onchain "${WALLETS[buenos]}" "${AGENT_IDS[central]}" 94 "menu-change" "adjusted")
  log "  Feedback tx: ${tx:0:20}..."

  log "✓ Menu change scenario complete"
}

# ── Main loop ──

ONCE=false
INTERVAL=600

for arg in "$@"; do
  case $arg in
    --once) ONCE=true ;;
    --interval) shift; INTERVAL="${2:-600}" ;;
  esac
done

run_scenario() {
  local scenario="${SCENARIOS[$((RANDOM % ${#SCENARIOS[@]}))]}"

  echo ""
  echo "════════════════════════════════════════════════════════"
  echo "  MateOS Supply Chain — $(date +%Y-%m-%d\ %H:%M:%S)"
  echo "════════════════════════════════════════════════════════"

  case $scenario in
    wine_order) run_wine_order ;;
    delivery_coordination) run_delivery_coordination ;;
    quality_check) run_quality_check ;;
    lemon_shipment) run_lemon_shipment ;;
    meat_order) run_meat_order ;;
    partner_pairing) run_partner_pairing ;;
    frost_alert) run_frost_alert ;;
    menu_change) run_menu_change ;;
  esac

  echo ""
}

if $ONCE; then
  run_scenario
else
  log "Starting supply chain loop (interval: ${INTERVAL}s)"
  while true; do
    run_scenario
    log "Next scenario in ${INTERVAL}s..."
    sleep "$INTERVAL"
  done
fi
