import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const uploadMetadataSchema = z.object({
  squadName: z.string().min(2, "Squad name must be at least 2 characters").max(50).trim(),
  businessType: z.string().max(50).optional(),
  agents: z.array(z.string()).min(1, "At least one agent required").max(10),
  ownerAddress: z.string().min(1, "Owner address required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = uploadMetadataSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => i.message).join(", ") },
        { status: 400 },
      );
    }

    const { squadName, businessType, agents, ownerAddress } = parsed.data;

    const pinataJwt = process.env.PINATA_JWT;
    if (!pinataJwt) {
      return NextResponse.json(
        { error: "Server misconfigured: missing PINATA_JWT" },
        { status: 500 },
      );
    }

    const metadata = {
      name: `Squad: ${squadName}`,
      description: `MateOS AI Agent Squad - ${businessType || "general"}`,
      agents: agents as string[],
      owner: ownerAddress,
      platform: "MateOS",
      chain: "base",
      created: new Date().toISOString(),
    };

    const pinataRes = await fetch(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${pinataJwt}`,
        },
        body: JSON.stringify({
          pinataContent: metadata,
          pinataMetadata: { name: `mateos-squad-${squadName}` },
        }),
      },
    );

    if (!pinataRes.ok) {
      const errText = await pinataRes.text();
      console.error("Pinata upload failed:", errText);
      return NextResponse.json(
        { error: "Failed to upload metadata to IPFS" },
        { status: 502 },
      );
    }

    const pinataData = await pinataRes.json();
    const cid = pinataData.IpfsHash;

    return NextResponse.json({
      cid,
      uri: `ipfs://${cid}`,
    });
  } catch (err) {
    console.error("upload-metadata error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
