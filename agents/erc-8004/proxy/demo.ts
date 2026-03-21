/**
 * Demo: Inter-Squad Verification Flow
 *
 * Simulates Buenos Table receiving a message from Andes Vineyard,
 * verifying identity + reputation onchain, processing the task,
 * and recording the result.
 *
 * Usage: npx tsx agents/erc-8004/proxy/demo.ts
 */

import { verifySquad, handleInterSquadMessage, type InterSquadMessage } from "./verify";

const SQUADS = {
  "buenos-table": { agentId: 35270, name: "Buenos Table" },
  "andes-vineyard": { agentId: 35303, name: "Andes Vineyard" },
  "central-logistics": { agentId: 35304, name: "Central Logistics" },
  "altura-wines": { agentId: 35305, name: "Altura Wines" },
  "norte-citrus": { agentId: 35306, name: "Norte Citrus Co." },
  "estancia-meats": { agentId: 35307, name: "Estancia Meats" },
};

async function demo() {
  console.log("═══════════════════════════════════════════════");
  console.log("  MateOS Inter-Squad Verification Demo");
  console.log("  Base Mainnet — ERC-8004");
  console.log("═══════════════════════════════════════════════\n");

  // ── Demo 1: Verify all squads ──
  console.log("── Step 1: Verify all registered squads ──\n");

  for (const [id, squad] of Object.entries(SQUADS)) {
    const result = await verifySquad(squad.agentId);
    const status = result.allowed ? "✓ TRUSTED" : "✗ UNTRUSTED";
    console.log(
      `  ${status} | ${squad.name.padEnd(20)} | agentId: ${squad.agentId} | score: ${result.reputation.averageScore}/100 | ${result.reputation.feedbackCount} reviews`
    );
  }

  // ── Demo 2: Verify an unregistered agent ──
  console.log("\n── Step 2: Reject unregistered agent ──\n");

  const fakeResult = await verifySquad(99999);
  console.log(`  ✗ Agent 99999: ${fakeResult.reason}\n`);

  // ── Demo 3: Full message flow (read-only, no onchain writes) ──
  console.log("── Step 3: Simulated inter-squad message flow ──\n");

  const message: InterSquadMessage = {
    fromAgentId: SQUADS["andes-vineyard"].agentId,
    toAgentId: SQUADS["buenos-table"].agentId,
    action: "Malbec Reserva batch #48 ready — 15 cases, ETA Thursday",
    payload: {
      product: "Malbec Reserva 2026",
      quantity: 15,
      unit: "cases",
      eta: "Thursday 6AM",
      quality: "premium",
    },
  };

  console.log(`  From: ${SQUADS["andes-vineyard"].name} (agentId: ${message.fromAgentId})`);
  console.log(`  To:   ${SQUADS["buenos-table"].name} (agentId: ${message.toAgentId})`);
  console.log(`  Action: "${message.action}"\n`);

  // Verify sender before accepting
  const senderVerification = await verifySquad(message.fromAgentId);

  if (senderVerification.allowed) {
    console.log(`  [proxy] ✓ Sender verified onchain`);
    console.log(`          Identity: registered, owner ${senderVerification.identity.owner.slice(0, 10)}...`);
    console.log(`          Reputation: ${senderVerification.reputation.averageScore}/100 (${senderVerification.reputation.feedbackCount} reviews)`);
    console.log(`          Decision: ACCEPT message\n`);

    console.log(`  [agent] Processing: "${message.action}"`);
    console.log(`  [agent] Response: "Confirmed. Updated Thursday menu: Malbec pairing with aged cheese board."\n`);

    console.log(`  [proxy] Post-task actions (would execute onchain):`);
    console.log(`          → submitValidation(${message.toAgentId}, taskHash) — audit trail`);
    console.log(`          → giveFeedback(${message.fromAgentId}, 95, "inter-squad", "completed") — reputation\n`);
  } else {
    console.log(`  [proxy] ✗ Sender rejected: ${senderVerification.reason}\n`);
  }

  console.log("═══════════════════════════════════════════════");
  console.log("  All verifications read from Base Mainnet");
  console.log("  Identity Registry: 0x8004A169...");
  console.log("  Reputation Registry: 0x8004BAa1...");
  console.log("  SelfValidation: 0x17Fa2eF5...");
  console.log("═══════════════════════════════════════════════");
}

demo().catch(console.error);
