import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { text } = await req.json();
  if (!text || typeof text !== "string" || text.length > 1000) {
    return NextResponse.json({ error: "Invalid text" }, { status: 400 });
  }

  const pinataJwt = process.env.PINATA_JWT?.trim();
  if (!pinataJwt) {
    console.error("Pinata upload is not configured: PINATA_JWT is missing");
    return NextResponse.json({ error: "Pinata upload is not configured" }, { status: 500 });
  }

  const token = pinataJwt.replace(/^Bearer\s+/i, "");
  if (token.split(".").length !== 3) {
    console.error("Pinata upload is not configured: PINATA_JWT is malformed");
    return NextResponse.json({ error: "Pinata upload is not configured" }, { status: 500 });
  }

  const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      pinataContent: { text, timestamp: Date.now() },
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error("Pinata error:", res.status, detail);
    return NextResponse.json({ error: `Pinata ${res.status}: ${detail}` }, { status: 502 });
  }

  const data = await res.json();
  return NextResponse.json({ cid: data.IpfsHash });
}
