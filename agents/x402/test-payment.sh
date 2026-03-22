#!/bin/bash
# ============================================================
# MateOS x402 Payment Endpoint — Test Script
# Tests the /api/agent-task endpoint with and without payment
# ============================================================

BASE_URL="${1:-http://localhost:3000}"

echo "============================================"
echo "  MateOS x402 Payment Protocol — Test Suite"
echo "  Endpoint: $BASE_URL/api/agent-task"
echo "============================================"
echo ""

# --- Test 1: No payment (should return 402) ---
echo "=== Test 1: Request WITHOUT payment (expect 402) ==="
echo ""
RESPONSE_402=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/agent-task" \
  -H "Content-Type: application/json" \
  -d '{"task": "answer_whatsapp", "message": "Mesa para 4?"}')

HTTP_CODE=$(echo "$RESPONSE_402" | tail -1)
BODY_402=$(echo "$RESPONSE_402" | sed '$d')

echo "HTTP Status: $HTTP_CODE"
echo "Response:"
echo "$BODY_402" | python3 -m json.tool 2>/dev/null || echo "$BODY_402"
echo ""

if [ "$HTTP_CODE" = "402" ]; then
  echo "  PASS — Received 402 Payment Required"
else
  echo "  FAIL — Expected 402, got $HTTP_CODE"
fi
echo ""

# --- Test 2: With payment proof (should return 200) ---
echo "=== Test 2: Request WITH payment proof (expect 200) ==="
echo ""
RESPONSE_200=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/agent-task" \
  -H "Content-Type: application/json" \
  -H "X-PAYMENT: demo-payment-proof-0x1234567890abcdef" \
  -d '{"task": "answer_whatsapp", "agentId": "mateo-ceo", "message": "Mesa para 4 personas, jueves 8:30 PM"}')

HTTP_CODE=$(echo "$RESPONSE_200" | tail -1)
BODY_200=$(echo "$RESPONSE_200" | sed '$d')

echo "HTTP Status: $HTTP_CODE"
echo "Response:"
echo "$BODY_200" | python3 -m json.tool 2>/dev/null || echo "$BODY_200"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
  echo "  PASS — Received 200 OK with agent response"
else
  echo "  FAIL — Expected 200, got $HTTP_CODE"
fi
echo ""

# --- Test 3: Different task types ---
echo "=== Test 3: Supply chain analysis task ==="
echo ""
RESPONSE_SC=$(curl -s -X POST "$BASE_URL/api/agent-task" \
  -H "Content-Type: application/json" \
  -H "X-PAYMENT: demo-payment-proof-0xfedcba0987654321" \
  -d '{"task": "analyze_supply", "agentId": "mateo-ceo", "message": "Analyze wine delivery efficiency this week"}')

echo "Response:"
echo "$RESPONSE_SC" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE_SC"
echo ""

# --- Test 4: CORS preflight ---
echo "=== Test 4: CORS preflight (OPTIONS) ==="
echo ""
CORS_HEADERS=$(curl -s -I -X OPTIONS "$BASE_URL/api/agent-task" 2>&1)
echo "$CORS_HEADERS" | grep -i "access-control" || echo "  (No CORS headers in response — may need server running)"
echo ""

# --- Summary ---
echo "============================================"
echo "  Test Summary"
echo "============================================"
echo ""
echo "  Payment price:    \$0.01 USDC per request"
echo "  Network:          Base Mainnet (chain 8453)"
echo "  USDC contract:    0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
echo "  Payment protocol: x402 (HTTP 402 Payment Required)"
echo ""
echo "  To make a real payment, use @x402/fetch:"
echo "    npm install @x402/fetch"
echo "    import { x402Fetch } from '@x402/fetch'"
echo ""
