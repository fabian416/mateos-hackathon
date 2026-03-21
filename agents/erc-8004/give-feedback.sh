#!/bin/bash
# Give feedback to a MateOS squad via ERC-8004 Reputation Registry (Base Mainnet)
#
# Usage:
#   PRIVATE_KEY="0x..." ./give-feedback.sh <score> <tag> "<description>"
#
# Examples:
#   PRIVATE_KEY="0x..." ./give-feedback.sh 95 "delegation" "Lead handled successfully"
#   PRIVATE_KEY="0x..." ./give-feedback.sh 80 "support" "Resolved customer complaint"
#   PRIVATE_KEY="0x..." ./give-feedback.sh 100 "coordination" "Full squad sync completed"
#
# The feedback is always given to the squad's CEO NFT (agentId 35270)
# because the CEO represents the entire squad for inter-squad trust.

set -euo pipefail

REPUTATION_REGISTRY="0x8004BAa17C55a88189AE136b182e5fdA19dE9b63"
SQUAD_AGENT_ID=35270  # OpsChad (CEO) = squad representative
RPC_URL="https://mainnet.base.org"

SCORE="${1:-90}"
TAG1="${2:-task}"
TAG2="${3:-completed}"
DESCRIPTION="${4:-MateOS squad task completed successfully}"

if [ -z "${PRIVATE_KEY:-}" ]; then
  echo "ERROR: Set PRIVATE_KEY environment variable"
  exit 1
fi

if ! command -v cast &> /dev/null; then
  echo "ERROR: Install foundry first: curl -L https://foundry.paradigm.xyz | bash && foundryup"
  exit 1
fi

# Create feedback URI (inline JSON, no IPFS needed for simple feedback)
FEEDBACK_JSON="{\"agentId\":$SQUAD_AGENT_ID,\"value\":$SCORE,\"tag1\":\"$TAG1\",\"tag2\":\"$TAG2\",\"description\":\"$DESCRIPTION\",\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"squad\":\"mateos-hq\"}"
FEEDBACK_HASH=$(echo -n "$FEEDBACK_JSON" | cast keccak)

echo "Giving feedback to MateOS HQ squad (agentId: $SQUAD_AGENT_ID)"
echo "  Score: $SCORE | Tag: $TAG1/$TAG2"
echo "  Description: $DESCRIPTION"
echo "  Hash: $FEEDBACK_HASH"

# giveFeedback(uint256 agentId, int128 value, uint8 valueDecimals, string tag1, string tag2, string endpoint, string feedbackURI, bytes32 feedbackHash)
TX_RESULT=$(cast send "$REPUTATION_REGISTRY" \
  "giveFeedback(uint256,int128,uint8,string,string,string,string,bytes32)" \
  "$SQUAD_AGENT_ID" \
  "$SCORE" \
  0 \
  "$TAG1" \
  "$TAG2" \
  "https://mateos.tech" \
  "$FEEDBACK_JSON" \
  "$FEEDBACK_HASH" \
  --rpc-url "$RPC_URL" \
  --private-key "$PRIVATE_KEY" \
  --gas-limit 300000 \
  --json 2>&1)

TX_HASH=$(echo "$TX_RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin)['transactionHash'])" 2>/dev/null)
TX_STATUS=$(echo "$TX_RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin)['status'])" 2>/dev/null)

if [ "$TX_STATUS" = "0x1" ]; then
  echo "  ✓ Feedback recorded onchain"
  echo "  tx: $TX_HASH"
  echo "  Verify: https://basescan.org/tx/$TX_HASH"
else
  echo "  ✗ Transaction failed"
  echo "  $TX_RESULT"
  exit 1
fi
