#!/bin/bash
# Test Bankr LLM Gateway connection
#
# Usage:
#   export BANKR_LLM_KEY=bk_your_key_here
#   ./agents/bankr/test-llm.sh

set -euo pipefail

if [ -z "${BANKR_LLM_KEY:-}" ]; then
  echo "ERROR: BANKR_LLM_KEY is not set."
  echo "  export BANKR_LLM_KEY=bk_your_key_here"
  exit 1
fi

echo "Testing Bankr LLM Gateway..."
echo "Endpoint: https://llm.bankr.bot/v1/chat/completions"
echo ""

curl -s -X POST https://llm.bankr.bot/v1/chat/completions \
  -H "Authorization: Bearer $BANKR_LLM_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-4-20250514",
    "messages": [{"role": "user", "content": "Hello from MateOS agent squad!"}]
  }' | python3 -m json.tool 2>/dev/null || cat

echo ""
echo "If you see a response with choices[], the gateway is working."
