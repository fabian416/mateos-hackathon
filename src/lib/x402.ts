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
    "MateOS AI Agent Task Execution — supply chain coordination, scheduling, content generation for LatAm businesses",
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
 * In production, this forwards the proof to the x402 facilitator for
 * on-chain verification and settlement. For hackathon demo, we accept
 * any non-empty proof header as valid while logging it for inspection.
 */
export async function verifyPayment(paymentHeader: string): Promise<{
  valid: boolean;
  txHash?: string;
  error?: string;
}> {
  if (!paymentHeader || paymentHeader.trim() === "") {
    return { valid: false, error: "Empty payment proof" };
  }

  // Production path: verify with facilitator
  if (process.env.X402_VERIFY_PAYMENTS === "true") {
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
      const data = await res.json();
      return {
        valid: data.valid === true,
        txHash: data.txHash,
        error: data.valid ? undefined : data.error || "Facilitator rejected payment",
      };
    } catch (err) {
      return { valid: false, error: `Facilitator error: ${err}` };
    }
  }

  // Hackathon demo: accept any non-empty header
  console.log("[x402] Demo mode — accepting payment proof:", paymentHeader.slice(0, 40) + "...");
  return {
    valid: true,
    txHash: "0xdemo_" + Date.now().toString(16),
  };
}

/**
 * Standard CORS headers for x402 endpoints.
 * Must expose X-PAYMENT so clients can send payment proofs.
 */
export const X402_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-PAYMENT, Authorization",
  "Access-Control-Expose-Headers": "X-PAYMENT-REQUIRED, X-PAYMENT-RECEIPT",
};
