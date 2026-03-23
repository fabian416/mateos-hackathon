#!/bin/bash
# MateOS Feedback Relayer
#
# Polls Telegram messages from all squad CEO bots, detects "FEEDBACK:" pattern,
# and automatically calls giveFeedback() onchain via the squad's wallet.
#
# Usage: ./feedback-relayer.sh [--interval 15]
#   --interval  Seconds between polls (default: 15)

set -euo pipefail

RPC_URL="https://mainnet.base.org"
REP_REGISTRY="0x8004BAa17C55a88189AE136b182e5fdA19dE9b63"

# Bot tokens — loaded from environment variables
# Set these before running: export TG_TOKEN_ANDES=... TG_TOKEN_ALTURA=... etc.
declare -A BOT_TOKENS
BOT_TOKENS[andes]="${TG_TOKEN_ANDES:?Missing TG_TOKEN_ANDES}"
BOT_TOKENS[altura]="${TG_TOKEN_ALTURA:?Missing TG_TOKEN_ALTURA}"
BOT_TOKENS[central]="${TG_TOKEN_CENTRAL:?Missing TG_TOKEN_CENTRAL}"
BOT_TOKENS[citrus]="${TG_TOKEN_CITRUS:?Missing TG_TOKEN_CITRUS}"
BOT_TOKENS[estancia]="${TG_TOKEN_ESTANCIA:?Missing TG_TOKEN_ESTANCIA}"

# Squad wallets — loaded from environment variables
# Set these before running: export WALLET_ANDES=... WALLET_ALTURA=... etc.
declare -A WALLETS
WALLETS[andes]="${WALLET_ANDES:?Missing WALLET_ANDES}"
WALLETS[altura]="${WALLET_ALTURA:?Missing WALLET_ALTURA}"
WALLETS[central]="${WALLET_CENTRAL:?Missing WALLET_CENTRAL}"
WALLETS[citrus]="${WALLET_CITRUS:?Missing WALLET_CITRUS}"
WALLETS[estancia]="${WALLET_ESTANCIA:?Missing WALLET_ESTANCIA}"

# Squad name → agentId mapping
declare -A NAME_TO_AGENT
NAME_TO_AGENT["buenos table"]=35270
NAME_TO_AGENT["andes vineyard"]=35303
NAME_TO_AGENT["central logistics"]=35304
NAME_TO_AGENT["altura wines"]=35305
NAME_TO_AGENT["norte citrus"]=35306
NAME_TO_AGENT["estancia meats"]=35307

# Track last processed update per bot
declare -A LAST_UPDATE
LAST_UPDATE[andes]=0
LAST_UPDATE[altura]=0
LAST_UPDATE[central]=0
LAST_UPDATE[citrus]=0
LAST_UPDATE[estancia]=0

INTERVAL="${1:-15}"

log() {
  echo "[$(date +%H:%M:%S)] $1"
}

process_feedback() {
  local squad_key="$1"
  local message="$2"
  local wallet="${WALLETS[$squad_key]}"

  # Extract: FEEDBACK: [squad name] scored [X]/100 for [reason]
  local target_squad=$(echo "$message" | grep -oiP 'FEEDBACK:\s*\K.+?(?=\s+scored)' | xargs | tr '[:upper:]' '[:lower:]')
  local score=$(echo "$message" | grep -oP 'scored\s+\K\d+')
  local reason=$(echo "$message" | grep -oP 'for\s+\K.*' | head -1)

  if [ -z "$target_squad" ] || [ -z "$score" ]; then
    log "  Could not parse feedback from: $message"
    return 1
  fi

  # Find agentId for target squad
  local agent_id=""
  for name in "${!NAME_TO_AGENT[@]}"; do
    if echo "$target_squad" | grep -qi "$name"; then
      agent_id="${NAME_TO_AGENT[$name]}"
      break
    fi
  done

  if [ -z "$agent_id" ]; then
    log "  Unknown squad: $target_squad"
    return 1
  fi

  local tag1="inter-squad"
  local tag2=$(echo "$reason" | tr ' ' '-' | cut -c1-30)
  [ -z "$tag2" ] && tag2="completed"

  log "  Recording onchain: $squad_key → agentId $agent_id, score $score, reason: $reason"

  local feedback_json="{\"agentId\":$agent_id,\"value\":$score,\"tag1\":\"$tag1\",\"tag2\":\"$tag2\",\"ts\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}"
  local feedback_hash=$(echo -n "$feedback_json" | cast keccak 2>/dev/null || echo "0x0000000000000000000000000000000000000000000000000000000000000000")

  local tx=$(cast send "$REP_REGISTRY" \
    "giveFeedback(uint256,int128,uint8,string,string,string,string,bytes32)" \
    "$agent_id" "$score" 0 "$tag1" "$tag2" "https://mateos.tech" "$feedback_json" "$feedback_hash" \
    --rpc-url "$RPC_URL" --private-key "$wallet" --gas-limit 300000 --json 2>/dev/null | \
    python3 -c "import sys,json; print(json.load(sys.stdin).get('transactionHash','failed'))" 2>/dev/null || echo "tx-failed")

  if [ "$tx" != "tx-failed" ] && [ -n "$tx" ]; then
    log "  ✓ Feedback recorded: $tx"
  else
    log "  ✗ Transaction failed"
  fi
}

poll_bot() {
  local squad_key="$1"
  local token="${BOT_TOKENS[$squad_key]}"
  local last="${LAST_UPDATE[$squad_key]}"
  local offset=$((last + 1))

  local updates=$(curl -s "https://api.telegram.org/bot${token}/getUpdates?offset=${offset}&limit=10" 2>/dev/null)

  echo "$updates" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for update in data.get('result', []):
        uid = update.get('update_id', 0)
        msg = update.get('message', {})
        text = msg.get('text', '')
        is_bot = msg.get('from', {}).get('is_bot', False)
        if is_bot and 'FEEDBACK:' in text.upper():
            print(f'{uid}|{text}')
        elif not is_bot:
            pass  # ignore human messages
        # Always print update_id to track
        print(f'UPDATE_ID:{uid}')
except:
    pass
" 2>/dev/null | while IFS= read -r line; do
    if [[ "$line" == UPDATE_ID:* ]]; then
      local uid="${line#UPDATE_ID:}"
      if [ "$uid" -gt "${LAST_UPDATE[$squad_key]}" ]; then
        LAST_UPDATE[$squad_key]="$uid"
      fi
    elif [[ "$line" == *"|"* ]]; then
      local uid="${line%%|*}"
      local text="${line#*|}"
      log "FEEDBACK detected from $squad_key: $text"
      process_feedback "$squad_key" "$text"
      LAST_UPDATE[$squad_key]="$uid"
    fi
  done
}

log "MateOS Feedback Relayer started (polling every ${INTERVAL}s)"
log "Watching 5 squad CEO bots for FEEDBACK: pattern"

while true; do
  for squad_key in andes altura central citrus estancia; do
    poll_bot "$squad_key"
  done
  sleep "$INTERVAL"
done
