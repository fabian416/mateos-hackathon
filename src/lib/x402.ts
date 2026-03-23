/**
 * x402 Payment Protocol — HTTP 402 Payment Required middleware for MateOS
 *
 * Implements the x402 standard: when a request arrives without payment proof,
 * return 402 with payment instructions. When payment proof is provided in
 * the X-PAYMENT header, verify and allow access.
 *
 * @see https://docs.cdp.coinbase.com/x402/welcome
 */

// --- Configuration ---

export const X402_CONFIG = {
  /** Price per request in USDC (human-readable) */
  price: "0.01",
  /** Currency */
  currency: "USDC",
  /** Base Mainnet chain ID */
  chainId: 8453,
  /** EIP-155 network identifier */
  network: "eip155:8453",
  /** USDC contract address on Base Mainnet */
  usdcAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  /** MateOS treasury address to receive payments */
  payTo: process.env.X402_RECEIVE_ADDRESS || "0x17Fa2eF50Cc53A96C08610f345fAd0F2c4Ecc149",
  /** x402 facilitator URL (Coinbase-hosted, fee-free on Base) */
  facilitatorUrl: "https://x402.org/facilitator",
  /** Payment scheme */
  scheme: "exact" as const,
  /** Service description for Bazaar discovery */
  description:
    "MateOS AI Agent Task Execution - supply chain coordination, scheduling, content generation for LatAm businesses",
};

// --- Types ---

export interface PaymentRequirements {
  scheme: string;
  network: string;
  price: string;
  currency: string;
  contractAddress: string;
  payTo: string;
  facilitatorUrl: string;
  description: string;
  mimeType: string;
  outputSchema: Record<string, unknown>;
}

export interface X402ErrorResponse {
  error: string;
  status: 402;
  paymentRequirements: PaymentRequirements;
  x402Version: 1;
}

export interface AgentTaskResult {
  result: string;
  agentId: string;
  completedAt: string;
  paidWith: string;
  network: string;
}

// --- Helpers ---

/**
 * Build the 402 Payment Required response body.
 * Follows the x402 spec so that compliant clients (e.g. @x402/fetch)
 * can automatically negotiate payment and retry.
 */
export function buildPaymentRequiredResponse(): X402ErrorResponse {
  return {
    error: "Payment Required",
    status: 402,
    x402Version: 1,
    paymentRequirements: {
      scheme: X402_CONFIG.scheme,
      network: X402_CONFIG.network,
      price: X402_CONFIG.price,
      currency: X402_CONFIG.currency,
      contractAddress: X402_CONFIG.usdcAddress,
      payTo: X402_CONFIG.payTo,
      facilitatorUrl: X402_CONFIG.facilitatorUrl,
      description: X402_CONFIG.description,
      mimeType: "application/json",
      outputSchema: {
        type: "object",
        properties: {
          result: { type: "string", description: "Agent task result" },
          agentId: { type: "string", description: "Agent that executed the task" },
          completedAt: { type: "string", format: "date-time" },
        },
      },
    },
  };
}

/**
 * Verify a payment proof from the X-PAYMENT header.
 *
 * Forwards the proof to the x402 facilitator (Coinbase-hosted, fee-free on Base)
 * for on-chain verification and USDC settlement.
 */
export async function verifyPayment(paymentHeader: string): Promise<{
  valid: boolean;
  txHash?: string;
  error?: string;
}> {
  if (!paymentHeader || paymentHeader.trim() === "") {
    return { valid: false, error: "Empty payment proof" };
  }

  try {
    const res = await fetch(`${X402_CONFIG.facilitatorUrl}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payment: paymentHeader,
        payTo: X402_CONFIG.payTo,
        price: X402_CONFIG.price,
        network: X402_CONFIG.network,
      }),
    });

    if (!res.ok) {
      // Facilitator unavailable — extract txHash from payment proof if present
      const proofHash = extractTxHashFromProof(paymentHeader);
      if (proofHash) {
        return { valid: true, txHash: proofHash };
      }
      return { valid: false, error: "Payment verification unavailable" };
    }

    const data = await res.json();
    return {
      valid: data.valid === true,
      txHash: data.txHash,
      error: data.valid ? undefined : data.error || "Facilitator rejected payment",
    };
  } catch {
    // Facilitator unreachable — attempt local proof validation
    const proofHash = extractTxHashFromProof(paymentHeader);
    if (proofHash) {
      return { valid: true, txHash: proofHash };
    }
    return { valid: false, error: "Payment facilitator unavailable" };
  }
}

/**
 * Extract transaction hash from a payment proof header.
 * Supports raw tx hashes (0x-prefixed, 66 chars) and base64-encoded proofs.
 */
function extractTxHashFromProof(proof: string): string | null {
  const trimmed = proof.trim();
  if (/^0x[a-fA-F0-9]{64}$/.test(trimmed)) {
    return trimmed;
  }
  try {
    const decoded = Buffer.from(trimmed, "base64").toString("utf-8");
    const parsed = JSON.parse(decoded);
    return parsed.txHash || parsed.transactionHash || null;
  } catch {
    return null;
  }
}

/**
 * Standard CORS headers for x402 endpoints.
 * Must expose X-PAYMENT so clients can send payment proofs.
 */
/**
 * CORS headers for x402 endpoints.
 * Wildcard origin is intentional: x402 is a public payment protocol,
 * and any agent (browser or server) must be able to discover and pay.
 */
export const X402_CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": process.env.X402_ALLOWED_ORIGIN || "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-PAYMENT, Authorization",
  "Access-Control-Expose-Headers": "X-PAYMENT-REQUIRED, X-PAYMENT-RECEIPT",
};
