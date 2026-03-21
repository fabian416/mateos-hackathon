#!/bin/bash
# Upload ERC-8004 agent cards to IPFS via Pinata
# Usage: PINATA_JWT="your_jwt_token" ./upload-to-ipfs.sh
#
# Get a free Pinata JWT at: https://app.pinata.cloud/developers/api-keys
# Free tier: 500 uploads, 1GB storage

set -euo pipefail

CARDS_DIR="$(dirname "$0")/cards"
OUTPUT_FILE="$(dirname "$0")/ipfs-cids.json"

if [ -z "${PINATA_JWT:-}" ]; then
  echo "ERROR: Set PINATA_JWT environment variable"
  echo "Get one free at: https://app.pinata.cloud/developers/api-keys"
  exit 1
fi

echo '{}' > "$OUTPUT_FILE"

for card in "$CARDS_DIR"/*.json; do
  agent_name=$(basename "$card" .json)
  echo "Uploading $agent_name..."

  response=$(curl -s -X POST "https://api.pinata.cloud/pinning/pinFileToIPFS" \
    -H "Authorization: Bearer $PINATA_JWT" \
    -F "file=@$card" \
    -F "pinataMetadata={\"name\": \"mateos-$agent_name-erc8004\"}")

  cid=$(echo "$response" | python3 -c "import sys,json; print(json.load(sys.stdin)['IpfsHash'])" 2>/dev/null)

  if [ -n "$cid" ]; then
    echo "  ✓ $agent_name → ipfs://$cid"
    # Append to output file
    python3 -c "
import json
with open('$OUTPUT_FILE') as f: data = json.load(f)
data['$agent_name'] = {'cid': '$cid', 'uri': 'ipfs://$cid'}
with open('$OUTPUT_FILE', 'w') as f: json.dump(data, f, indent=2)
"
  else
    echo "  ✗ $agent_name FAILED: $response"
  fi
done

echo ""
echo "All CIDs saved to: $OUTPUT_FILE"
echo ""
echo "Next step — register agents on Base Mainnet:"
echo "  cat $OUTPUT_FILE"
echo ""
echo "For each agent, run:"
echo '  cast send 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432 \'
echo '    "register(string)" "ipfs://<CID>" \'
echo '    --rpc-url https://mainnet.base.org \'
echo '    --private-key $PRIVATE_KEY'
