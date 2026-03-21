// ERC-8004 Inter-Squad Verification Hook
//
// Verifies sender identity and reputation onchain before accepting
// inter-squad messages. Runs inside OpenClaw's hook system.
//
// Flow:
//   External squad sends webhook to /hooks/erc8004
//   → This transform verifies the sender's agentId on Base Mainnet
//   → If trusted → returns message for the agent to process
//   → If not trusted → returns rejection message
//
// Config: add to openclaw.json.template hooks.mappings:
//   { "id": "erc8004", "match": { "path": "erc8004" },
//     "transform": { "module": "erc8004-hook/hook-transform.js" } }

const https = require("https");

const IDENTITY_REGISTRY = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432";
const REPUTATION_REGISTRY = "0x8004BAa17C55a88189AE136b182e5fdA19dE9b63";
const FEEDBACK_EVENT_SIG = "0x6a4a61743519c9d648a14e6493f47dbe3ff1aa29e7785c96c8326a205e58febc";
const RPC_URL = "https://mainnet.base.org";
const MIN_SCORE = 70;

// ── RPC helper ──

function rpcCall(method, params) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ jsonrpc: "2.0", id: 1, method, params });
    const url = new URL(RPC_URL);
    const req = https.request(
      { hostname: url.hostname, port: 443, path: url.pathname, method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) } },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try { resolve(JSON.parse(data).result); }
          catch { reject(new Error("RPC parse error")); }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// ── Identity check: is this agentId registered? ──

async function checkIdentity(agentId) {
  try {
    // ownerOf(uint256) → selector 0x6352211e
    const data = "0x6352211e" + agentId.toString(16).padStart(64, "0");
    const result = await rpcCall("eth_call", [{ to: IDENTITY_REGISTRY, data }, "latest"]);
    if (!result || result === "0x") return { registered: false, owner: "" };
    const owner = "0x" + result.slice(26);
    return { registered: true, owner };
  } catch {
    return { registered: false, owner: "" };
  }
}

// ── Reputation check: average score from recent feedbacks ──

async function checkReputation(agentId) {
  try {
    const currentBlock = await rpcCall("eth_blockNumber", []);
    const current = parseInt(currentBlock, 16);
    const agentIdHex = "0x" + agentId.toString(16).padStart(64, "0");
    let allLogs = [];

    // Query in 9900-block chunks (RPC limit: 10k)
    for (let to = current; to > current - 30000; to -= 9900) {
      const from = Math.max(0, to - 9900);
      try {
        const logs = await rpcCall("eth_getLogs", [{
          address: REPUTATION_REGISTRY,
          topics: [FEEDBACK_EVENT_SIG],
          fromBlock: "0x" + from.toString(16),
          toBlock: "0x" + to.toString(16),
        }]);
        if (Array.isArray(logs)) {
          const filtered = logs.filter(
            (l) => l.topics && l.topics[1] && l.topics[1].toLowerCase() === agentIdHex.toLowerCase()
          );
          allLogs = allLogs.concat(filtered);
        }
      } catch (err) {
        console.warn(`[erc8004-hook] RPC query failed at block range ${from}-${to}:`, err.message || err);
        break;
      }
    }

    // Score is in the 2nd 32-byte slot of data (valueDecimals field)
    const scores = allLogs.map((log) => {
      const hex = "0x" + log.data.slice(66, 130);
      return parseInt(hex, 16);
    });

    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    return { feedbackCount: scores.length, averageScore: Math.round(avg * 10) / 10 };
  } catch {
    return { feedbackCount: 0, averageScore: 0 };
  }
}

// ── Main transform ──

module.exports = async function transform(payload) {
  const data = payload.body || payload;
  const senderAgentId = data.agentId || data.fromAgentId || 0;
  const senderName = data.squadName || data.from || "Unknown";
  const action = data.action || data.message || "";

  if (!senderAgentId) {
    return {
      message: `⛓️ Inter-squad message rejected: no agentId provided.\nPayload: ${JSON.stringify(data).slice(0, 200)}`,
      metadata: { source: "erc8004", verified: false, reason: "no-agent-id" },
    };
  }

  // Verify identity
  const identity = await checkIdentity(senderAgentId);
  if (!identity.registered) {
    return {
      message: `⛓️ Inter-squad message REJECTED from ${senderName} (agentId: ${senderAgentId})\n❌ Not registered on ERC-8004 Identity Registry\nAction requested: "${action}"`,
      metadata: { source: "erc8004", verified: false, agentId: senderAgentId, reason: "not-registered" },
    };
  }

  // Verify reputation
  const reputation = await checkReputation(senderAgentId);
  if (reputation.averageScore < MIN_SCORE) {
    return {
      message: `⛓️ Inter-squad message REJECTED from ${senderName} (agentId: ${senderAgentId})\n❌ Reputation ${reputation.averageScore}/100 below threshold ${MIN_SCORE}\nFeedbacks: ${reputation.feedbackCount}\nAction requested: "${action}"`,
      metadata: { source: "erc8004", verified: false, agentId: senderAgentId, reason: "low-reputation", score: reputation.averageScore },
    };
  }

  // Verified — pass to agent
  return {
    message: `⛓️ Inter-squad message VERIFIED from ${senderName} (agentId: ${senderAgentId})\n✅ ERC-8004 Identity: confirmed (owner: ${identity.owner.slice(0, 10)}...)\n✅ Reputation: ${reputation.averageScore}/100 (${reputation.feedbackCount} reviews)\n\n📋 Action requested: "${action}"\n${data.details ? "\nDetails: " + JSON.stringify(data.details) : ""}\n\nProcess this request and respond to the sender squad.`,
    metadata: {
      source: "erc8004",
      verified: true,
      agentId: senderAgentId,
      squadName: senderName,
      score: reputation.averageScore,
      feedbacks: reputation.feedbackCount,
      owner: identity.owner,
    },
  };
};
