import { createPublicClient, http, type Hex } from "viem";
import { base } from "viem/chains";

const REPUTATION_REGISTRY = "0x8004BAa17C55a88189AE136b182e5fdA19dE9b63" as const;
const FEEDBACK_EVENT_SIG = "0x6a4a61743519c9d648a14e6493f47dbe3ff1aa29e7785c96c8326a205e58febc" as const;

const client = createPublicClient({
  chain: base,
  transport: http("https://mainnet.base.org"),
});

// Map wallet addresses (lowercase) → squad IDs
const WALLET_TO_SQUAD: Record<string, string> = {
  "0x07b86226443a2b8c0adda352d360ddd4e0a90093": "bsas",       // Buenos Table
  "0x67747ce2b51e9bdfa236739c60880149f5f6c55c": "mendoza",    // Andes Vineyard
  "0x1978c4fea0463300db4626f851d63ba97153f2bc": "rosario",    // Central Logistics
  "0x31d186c31435c1004ea24f8ab5f77a88f4998106": "salta",      // Altura Wines
  "0xa68a0efa82bedc6ac403c83326cca743ed4de409": "tucuman",    // Norte Citrus
  "0x739bad5dfab6fec59e5071cf34b5df1fef6fa52d": "cordoba",   // Estancia Meats
};

// Map agentIds → squad IDs
const AGENT_TO_SQUAD: Record<number, string> = {
  35270: "bsas",
  35303: "mendoza",
  35304: "rosario",
  35305: "salta",
  35306: "tucuman",
  35307: "cordoba",
};

// Descriptive labels based on squad pairs
const INTERACTION_LABELS: Record<string, string[]> = {
  "bsas→mendoza": ["Wine order confirmed by Andes Vineyard", "Malbec batch quality approved"],
  "bsas→rosario": ["Delivery scheduled via Central Logistics", "Consolidated shipment confirmed"],
  "bsas→salta": ["Torrontés pairing approved", "Altura Wines batch reserved"],
  "bsas→tucuman": ["Lemon order placed with Norte Citrus", "Citrus quality grade confirmed"],
  "bsas→cordoba": ["Cured meats order sent to Estancia", "Salame curing status verified"],
  "mendoza→rosario": ["Wine shipment dispatched to hub", "Pickup confirmed by logistics"],
  "mendoza→salta": ["Partner pairing coordinated", "Wine blend discussed"],
  "rosario→bsas": ["Friday delivery ETA confirmed", "Consolidated route optimized"],
  "rosario→mendoza": ["Pickup scheduled from Mendoza", "Stock alert sent to winery"],
  "rosario→tucuman": ["Lemon pickup Tuesday PM confirmed", "Cold chain requirements sent"],
  "rosario→cordoba": ["Meat pickup Wednesday confirmed", "Dry transport arranged"],
  "salta→rosario": ["Torrontés cases ready for pickup", "Tasting notes delivered"],
  "tucuman→rosario": ["200kg lemons Grade A dispatched", "Cold chain temp log attached"],
  "cordoba→rosario": ["Salame + cheese shipment ready", "45-day cure certification sent"],
};

export interface OnchainSquadEvent {
  from: string;  // squad ID
  to: string;    // squad ID
  score: number;
  label: string;
  txHash: string;
  blockNumber: number;
  timestamp: number;
}

let lastSeenBlock = BigInt(0);

export async function pollOnchainEvents(): Promise<OnchainSquadEvent[]> {
  try {
    const currentBlock = await client.getBlockNumber();

    // First call: look back 500 blocks (~4 min on Base)
    if (lastSeenBlock === BigInt(0)) {
      lastSeenBlock = currentBlock - BigInt(500);
    }

    // Don't query if no new blocks
    if (currentBlock <= lastSeenBlock) return [];

    // Respect 10k block limit
    const fromBlock = lastSeenBlock + BigInt(1);
    const toBlock = currentBlock;
    if (toBlock - fromBlock > BigInt(9900)) {
      lastSeenBlock = toBlock - BigInt(9900);
    }

    const logs = await client.request({
      method: "eth_getLogs",
      params: [{
        address: REPUTATION_REGISTRY,
        topics: [FEEDBACK_EVENT_SIG],
        fromBlock: ("0x" + fromBlock.toString(16)) as Hex,
        toBlock: ("0x" + toBlock.toString(16)) as Hex,
      }],
    }) as Array<{ topics: string[]; data: string; transactionHash: string; blockNumber: string }>;

    lastSeenBlock = currentBlock;

    // Our agentIds as a Set for fast lookup
    const OUR_AGENTS = new Set([35270, 35303, 35304, 35305, 35306, 35307]);

    // Filter and map to squad events
    const events: OnchainSquadEvent[] = [];

    for (const log of logs) {
      if (!log.topics[1] || !log.topics[2]) continue;

      const agentId = parseInt(log.topics[1], 16);

      // Skip events not targeting our agents
      if (!OUR_AGENTS.has(agentId)) continue;

      const senderAddr = ("0x" + log.topics[2].slice(26)).toLowerCase();
      const toSquad = AGENT_TO_SQUAD[agentId];
      const fromSquad = WALLET_TO_SQUAD[senderAddr];

      // Only include events between our 6 squads
      if (!toSquad || !fromSquad || toSquad === fromSquad) continue;

      const score = parseInt("0x" + log.data.slice(66, 130), 16);
      const blockNum = parseInt(log.blockNumber, 16);
      const key = `${fromSquad}→${toSquad}`;
      const labels = INTERACTION_LABELS[key] || [`Verified interaction (score: ${score})`];
      const label = labels[Math.floor(Math.random() * labels.length)];

      events.push({
        from: fromSquad,
        to: toSquad,
        score,
        label,
        txHash: log.transactionHash,
        blockNumber: blockNum,
        timestamp: Date.now(),
      });
    }

    return events;
  } catch {
    return [];
  }
}
