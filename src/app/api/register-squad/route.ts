import { NextRequest, NextResponse } from "next/server";
import {
  createWalletClient,
  createPublicClient,
  http,
  parseAbi,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

const IDENTITY_REGISTRY = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432" as const;

const abi = parseAbi([
  "function register(string uri) external",
  "function transferFrom(address from, address to, uint256 tokenId) external",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
]);

export async function POST(req: NextRequest) {
  try {
    const { ownerAddress, metadataUri, squadName, agents } = await req.json();

    if (!ownerAddress || !metadataUri) {
      return NextResponse.json(
        { error: "Missing required fields: ownerAddress, metadataUri" },
        { status: 400 },
      );
    }

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
    });

    const registerReceipt = await publicClient.waitForTransactionReceipt({
      hash: registerHash,
      confirmations: 1,
    });

    // Extract agentId (tokenId) from Transfer event — topics[3] is the indexed tokenId
    const transferLog = registerReceipt.logs.find(
      (log) =>
        log.address.toLowerCase() === IDENTITY_REGISTRY.toLowerCase() &&
        log.topics.length >= 4,
    );

    if (!transferLog || !transferLog.topics[3]) {
      return NextResponse.json(
        { error: "Could not extract agentId from register transaction" },
        { status: 500 },
      );
    }

    const agentId = BigInt(transferLog.topics[3]);

    // Step 2: Transfer NFT from relayer to user's wallet
    const transferHash = await walletClient.writeContract({
      address: IDENTITY_REGISTRY,
      abi,
      functionName: "transferFrom",
      args: [account.address, ownerAddress as Hex, agentId],
    });

    await publicClient.waitForTransactionReceipt({
      hash: transferHash,
      confirmations: 1,
    });

    console.log(
      `[register-squad] Squad "${squadName}" registered — agentId: ${agentId}, agents: ${agents?.join(",")}, owner: ${ownerAddress}`,
    );

    return NextResponse.json({
      agentId: Number(agentId),
      txHash: registerHash,
      transferTxHash: transferHash,
      owner: ownerAddress,
    });
  } catch (err) {
    console.error("register-squad error:", err);
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
