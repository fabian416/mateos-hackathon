#!/bin/bash
# Register MateOS agents on ERC-8004 Identity Registry (Base Mainnet)
# Usage: PRIVATE_KEY="0x..." ./register-agents.sh
#
# Prerequisites:
#   1. Run upload-to-ipfs.sh first to get CIDs
#   2. Install foundry: curl -L https://foundry.paradigm.xyz | bash && foundryup
#   3. Have ETH on Base Mainnet for gas (~$0.01 per registration)

set -euo pipefail

IDENTITY_REGISTRY="0x8004A169FB4a3325136EB29fA0ceB6D2e539a432"
RPC_URL="https://mainnet.base.org"
CIDS_FILE="$(dirname "$0")/ipfs-cids.json"
OUTPUT_FILE="$(dirname "$0")/agent-ids.json"

if [ -z "${PRIVATE_KEY:-}" ]; then
  echo "ERROR: Set PRIVATE_KEY environment variable"
  exit 1
fi

if [ ! -f "$CIDS_FILE" ]; then
  echo "ERROR: Run upload-to-ipfs.sh first to generate $CIDS_FILE"
  exit 1
fi

# Check if cast is installed
if ! command -v cast &> /dev/null; then
  echo "ERROR: Install foundry first: curl -L https://foundry.paradigm.xyz | bash && foundryup"
  exit 1
fi

echo '{}' > "$OUTPUT_FILE"

agents=$(python3 -c "import json; data=json.load(open('$CIDS_FILE')); [print(k) for k in data.keys()]")

for agent in $agents; do
  uri=$(python3 -c "import json; print(json.load(open('$CIDS_FILE'))['$agent']['uri'])")
  echo "Registering $agent with URI: $uri"

  tx_hash=$(cast send "$IDENTITY_REGISTRY" \
    "register(string)" "$uri" \
    --rpc-url "$RPC_URL" \
    --private-key "$PRIVATE_KEY" \
    --json | python3 -c "import sys,json; print(json.load(sys.stdin)['transactionHash'])")

  echo "  tx: $tx_hash"

  # Get the agentId from the Transfer event (ERC-721 mint)
  agent_id=$(cast receipt "$tx_hash" --rpc-url "$RPC_URL" --json | \
    python3 -c "
import sys, json
receipt = json.load(sys.stdin)
for log in receipt['logs']:
    # Transfer event topic (ERC-721)
    if log['topics'][0] == '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef':
        print(int(log['topics'][3], 16))
        break
")

  echo "  ✓ $agent → agentId: $agent_id"

  python3 -c "
import json
with open('$OUTPUT_FILE') as f: data = json.load(f)
data['$agent'] = {'agentId': $agent_id, 'txHash': '$tx_hash', 'uri': '$uri'}
with open('$OUTPUT_FILE', 'w') as f: json.dump(data, f, indent=2)
"
done

echo ""
echo "All agents registered. IDs saved to: $OUTPUT_FILE"
echo "Verify at: https://8004scan.io"
