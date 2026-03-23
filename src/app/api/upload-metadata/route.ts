import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { squadName, businessType, agents, ownerAddress } = await req.json();

    if (!squadName || !agents || !ownerAddress) {
      return NextResponse.json(
        { error: "Missing required fields: squadName, agents, ownerAddress" },
        { status: 400 },
      );
    }

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
