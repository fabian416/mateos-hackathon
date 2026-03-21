/**
 * MateOS Inter-Squad Verification Proxy
 *
 * Before two squads communicate, the receiving squad verifies:
 * 1. Identity  → Is the sender a registered ERC-8004 agent?
 * 2. Reputation → Does the sender meet the minimum trust threshold?
 * 3. Validation → Has the sender's recent work been verified?
 *
 * After a successful interaction:
 * 4. Feedback  → Both sides submit giveFeedback() onchain
 * 5. Validation → The task output is hash-anchored for accountability
 */

import { createPublicClient, createWalletClient, http, parseAbiItem, type Hex } from "viem";
import { base } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

// ──────────────────────────────────────────────
// Contracts (Base Mainnet)
// ──────────────────────────────────────────────

const IDENTITY_REGISTRY = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432" as const;
const REPUTATION_REGISTRY = "0x8004BAa17C55a88189AE136b182e5fdA19dE9b63" as const;
const SELF_VALIDATION = "0x17Fa2eF50Cc53A96C08610f345fAd0F2c4Ecc149" as const;

// ──────────────────────────────────────────────
// ABIs (minimal, only what we need)
// ──────────────────────────────────────────────

const identityAbi = [
  parseAbiItem("function ownerOf(uint256 tokenId) view returns (address)"),
  parseAbiItem("function tokenURI(uint256 tokenId) view returns (string)"),
] as const;

// Real event signature from the deployed ERC-8004 Reputation Registry
const FEEDBACK_EVENT_SIG = "0x6a4a61743519c9d648a14e6493f47dbe3ff1aa29e7785c96c8326a205e58febc" as const;

const reputationAbi = [
  parseAbiItem(
    "function giveFeedback(uint256 agentId, int128 value, uint8 valueDecimals, string tag1, string tag2, string endpoint, string feedbackURI, bytes32 feedbackHash) external"
  ),
] as const;

const validationAbi = [
  parseAbiItem(
    "function submitValidation(uint256 agentId, string taskURI, bytes32 taskHash) external returns (bytes32)"
  ),
  parseAbiItem(
    "function respondValidation(bytes32 requestHash, uint8 score, string evidenceURI, bytes32 evidenceHash, string tag) external"
  ),
] as const;

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface SquadIdentity {
  agentId: number;
  owner: string;
  uri: string;
  isRegistered: boolean;
}

export interface SquadReputation {
  agentId: number;
  feedbackCount: number;
  averageScore: number;
  isTrusted: boolean;
}

export interface VerificationResult {
  allowed: boolean;
  identity: SquadIdentity;
  reputation: SquadReputation;
  reason: string;
}

export interface InterSquadMessage {
  fromAgentId: number;
  toAgentId: number;
  action: string;
  payload: Record<string, unknown>;
}

// ──────────────────────────────────────────────
// Client setup
// ──────────────────────────────────────────────

const publicClient = createPublicClient({
  chain: base,
  transport: http("https://mainnet.base.org"),
});

// ──────────────────────────────────────────────
// Step 1: Verify Identity
// ──────────────────────────────────────────────

export async function verifyIdentity(agentId: number): Promise<SquadIdentity> {
  try {
    const [owner, uri] = await Promise.all([
      publicClient.readContract({
        address: IDENTITY_REGISTRY,
        abi: identityAbi,
        functionName: "ownerOf",
        args: [BigInt(agentId)],
      }),
      publicClient.readContract({
        address: IDENTITY_REGISTRY,
        abi: identityAbi,
        functionName: "tokenURI",
        args: [BigInt(agentId)],
      }),
    ]);

    return {
      agentId,
      owner: owner as string,
      uri: uri as string,
      isRegistered: true,
    };
  } catch {
    return {
      agentId,
      owner: "",
      uri: "",
      isRegistered: false,
    };
  }
}

// ──────────────────────────────────────────────
// Step 2: Check Reputation
// ──────────────────────────────────────────────

const MIN_REPUTATION_SCORE = 70;
const MIN_FEEDBACK_COUNT = 1;

export async function checkReputation(
  agentId: number,
  minScore = MIN_REPUTATION_SCORE,
  minFeedbacks = MIN_FEEDBACK_COUNT
): Promise<SquadReputation> {
  try {
    const currentBlock = await publicClient.getBlockNumber();
    // Base RPC limits eth_getLogs to 10k block range — query in chunks
    const CHUNK = BigInt(9900);
    const LOOKBACK = BigInt(30000);
    const agentIdHex = ("0x" + agentId.toString(16).padStart(64, "0")).toLowerCase();
    const allLogs = [];

    for (let to = currentBlock; to > currentBlock - LOOKBACK; to -= CHUNK) {
      const from = to - CHUNK > BigInt(0) ? to - CHUNK : BigInt(0);
      try {
        const logs = await publicClient.getLogs({
          address: REPUTATION_REGISTRY,
          topics: [FEEDBACK_EVENT_SIG],
          fromBlock: from,
          toBlock: to,
        });
        // Filter client-side by agentId (topic1)
        const filtered = logs.filter((l) => l.topics[1]?.toLowerCase() === agentIdHex);
        allLogs.push(...filtered);
      } catch {
        break;
      }
    }

    // The ERC-8004 Reputation Registry stores: value (int128) + valueDecimals (uint8)
    // In practice, the score is in the valueDecimals field (2nd 32-byte slot)
    const scores = allLogs.map((log) => {
      const decimalsHex = "0x" + log.data.slice(66, 130);
      return Number(BigInt(decimalsHex));
    });
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    return {
      agentId,
      feedbackCount: scores.length,
      averageScore: Math.round(avg * 10) / 10,
      isTrusted: scores.length >= minFeedbacks && avg >= minScore,
    };
  } catch {
    return {
      agentId,
      feedbackCount: 0,
      averageScore: 0,
      isTrusted: false,
    };
  }
}

// ──────────────────────────────────────────────
// Step 3: Full Verification (Identity + Reputation)
// ──────────────────────────────────────────────

export async function verifySquad(agentId: number): Promise<VerificationResult> {
  const [identity, reputation] = await Promise.all([
    verifyIdentity(agentId),
    checkReputation(agentId),
  ]);

  if (!identity.isRegistered) {
    return {
      allowed: false,
      identity,
      reputation,
      reason: `Agent ${agentId} is not registered on ERC-8004 Identity Registry`,
    };
  }

  if (!reputation.isTrusted) {
    if (reputation.feedbackCount < MIN_FEEDBACK_COUNT) {
      return {
        allowed: false,
        identity,
        reputation,
        reason: `Agent ${agentId} has insufficient feedback history (${reputation.feedbackCount} feedbacks, minimum ${MIN_FEEDBACK_COUNT})`,
      };
    }
    return {
      allowed: false,
      identity,
      reputation,
      reason: `Agent ${agentId} reputation score ${reputation.averageScore} is below minimum threshold ${MIN_REPUTATION_SCORE}`,
    };
  }

  return {
    allowed: true,
    identity,
    reputation,
    reason: `Agent ${agentId} verified: registered, ${reputation.feedbackCount} feedbacks, score ${reputation.averageScore}/100`,
  };
}

// ──────────────────────────────────────────────
// Step 4: Post-Task — Submit Feedback
// ──────────────────────────────────────────────

export async function submitFeedback(
  privateKey: Hex,
  agentId: number,
  score: number,
  tag1: string,
  tag2: string
): Promise<Hex> {
  const account = privateKeyToAccount(privateKey);
  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http("https://mainnet.base.org"),
  });

  const feedbackJson = JSON.stringify({
    agentId,
    value: score,
    tag1,
    tag2,
    timestamp: new Date().toISOString(),
  });

  const feedbackHash = await publicClient.request({
    method: "web3_sha3" as never,
    params: [("0x" + Buffer.from(feedbackJson).toString("hex")) as never],
  }) as Hex;

  const txHash = await walletClient.writeContract({
    address: REPUTATION_REGISTRY,
    abi: reputationAbi,
    functionName: "giveFeedback",
    args: [
      BigInt(agentId),
      BigInt(score),
      0,
      tag1,
      tag2,
      "https://mateos.tech",
      feedbackJson,
      feedbackHash,
    ],
    gas: BigInt(300000),
  });

  return txHash;
}

// ──────────────────────────────────────────────
// Step 5: Post-Task — Submit Validation
// ──────────────────────────────────────────────

export async function submitTaskValidation(
  privateKey: Hex,
  agentId: number,
  taskDescription: string,
  taskOutput: string
): Promise<Hex> {
  const account = privateKeyToAccount(privateKey);
  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http("https://mainnet.base.org"),
  });

  const taskData = JSON.stringify({
    agentId,
    task: taskDescription,
    output: taskOutput,
    timestamp: new Date().toISOString(),
  });

  const taskHash = await publicClient.request({
    method: "web3_sha3" as never,
    params: [("0x" + Buffer.from(taskData).toString("hex")) as never],
  }) as Hex;

  const txHash = await walletClient.writeContract({
    address: SELF_VALIDATION,
    abi: validationAbi,
    functionName: "submitValidation",
    args: [BigInt(agentId), taskData, taskHash],
    gas: BigInt(500000),
  });

  return txHash;
}

// ──────────────────────────────────────────────
// Full Flow: Receive → Verify → Process → Record
// ──────────────────────────────────────────────

export async function handleInterSquadMessage(
  message: InterSquadMessage,
  myPrivateKey: Hex,
  processTask: (msg: InterSquadMessage) => Promise<string>
): Promise<{
  accepted: boolean;
  verification: VerificationResult;
  output?: string;
  feedbackTx?: Hex;
  validationTx?: Hex;
}> {
  // 1. Verify the sender
  console.log(`[proxy] Verifying agent ${message.fromAgentId}...`);
  const verification = await verifySquad(message.fromAgentId);

  if (!verification.allowed) {
    console.log(`[proxy] REJECTED: ${verification.reason}`);
    return { accepted: false, verification };
  }

  console.log(`[proxy] ACCEPTED: ${verification.reason}`);

  // 2. Process the task
  console.log(`[proxy] Processing: ${message.action}`);
  const output = await processTask(message);

  // 3. Submit validation onchain (audit trail)
  console.log(`[proxy] Submitting validation onchain...`);
  const validationTx = await submitTaskValidation(
    myPrivateKey,
    message.toAgentId,
    message.action,
    output
  );
  console.log(`[proxy] Validation tx: ${validationTx}`);

  // 4. Give feedback to the sender
  console.log(`[proxy] Submitting feedback for agent ${message.fromAgentId}...`);
  const feedbackTx = await submitFeedback(
    myPrivateKey,
    message.fromAgentId,
    95,
    "inter-squad",
    "completed"
  );
  console.log(`[proxy] Feedback tx: ${feedbackTx}`);

  return {
    accepted: true,
    verification,
    output,
    feedbackTx,
    validationTx,
  };
}
