import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      version: "1.0.0",
      network: "base-mainnet",
      squads: 6,
      agents: 29,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
