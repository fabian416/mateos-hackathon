import { NextRequest, NextResponse } from "next/server";
import {
  createWalletClient,
  createPublicClient,
  http,
  parseAbi,
  isAddress,
  getAddress,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { z } from "zod";

const IDENTITY_REGISTRY = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432" as const;

/** ERC-721 Transfer event signature: Transfer(address,address,uint256) */
const ERC721_TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef" as const;

const abi = parseAbi([
  "function register(string uri) external",
  "function transferFrom(address from, address to, uint256 tokenId) external",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
]);

const registerSquadSchema = z.object({
  ownerAddress: z.string().refine((v) => isAddress(v), { message: "Invalid Ethereum address" }),
  metadataUri: z.string().regex(/^(ipfs:\/\/[a-zA-Z0-9]+|https?:\/\/.+)$/, "Invalid metadata URI format"),
  squadName: z.string().min(2).max(50).optional(),
  agents: z.array(z.string()).max(10).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSquadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => i.message).join(", ") },
        { status: 400 },
      );
    }

    const { ownerAddress, metadataUri, squadName, agents } = parsed.data;
    const checksumOwner = getAddress(ownerAddress) as Hex;

    const privateKey = process.env.WALLET_BUENOS_TABLE;
    if (!privateKey) {
      return NextResponse.json(
        { error: "Server misconfigured: missing relayer wallet" },
        { status: 500 },
      );
    }

    const account = privateKeyToAccount(`0x${privateKey}` as Hex);

    const publicClient = createPublicClient({
      chain: base,
      transport: http("https://mainnet.base.org"),
    });

    const walletClient = createWalletClient({
      account,
      chain: base,
      transport: http("https://mainnet.base.org"),
    });

    // Step 1: Register — relayer pays gas, NFT mints to relayer
    const registerHash = await walletClient.writeContract({
      address: IDENTITY_REGISTRY,
      abi,
      functionName: "register",
      args: [metadataUri],
      gas: BigInt(300000),
    });

    const registerReceipt = await publicClient.waitForTransactionReceipt({
      hash: registerHash,
      confirmations: 1,
      timeout: 60_000,
    });

    if (registerReceipt.status === "reverted") {
      return NextResponse.json(
        { error: "Registration transaction reverted on-chain" },
        { status: 500 },
      );
    }

    // Extract agentId from ERC-721 Transfer event — verify event signature
    const transferLog = registerReceipt.logs.find(
      (log) =>
        log.address.toLowerCase() === IDENTITY_REGISTRY.toLowerCase() &&
        log.topics[0] === ERC721_TRANSFER_TOPIC &&
        log.topics.length >= 4,
    );

    if (!transferLog || !transferLog.topics[3]) {
      return NextResponse.json(
        { error: "Could not extract agentId from register transaction" },
        { status: 500 },
      );
    }

    const agentId = BigInt(transferLog.topics[3]);

    if (agentId <= BigInt(0)) {
      return NextResponse.json(
        { error: "Invalid agent ID extracted from transfer event" },
        { status: 500 },
      );
    }

    // Step 2: Transfer NFT from relayer to user's wallet
    const transferHash = await walletClient.writeContract({
      address: IDENTITY_REGISTRY,
      abi,
      functionName: "transferFrom",
      args: [account.address, checksumOwner, agentId],
      gas: BigInt(100000),
    });

    await publicClient.waitForTransactionReceipt({
      hash: transferHash,
      confirmations: 1,
      timeout: 60_000,
    });

    return NextResponse.json({
      agentId: Number(agentId),
      txHash: registerHash,
      transferTxHash: transferHash,
      owner: checksumOwner,
    });
  } catch (err) {
    console.error("register-squad error:", err);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 },
    );
  }
}
