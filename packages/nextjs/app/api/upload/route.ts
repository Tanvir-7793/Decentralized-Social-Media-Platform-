import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";

  // ---------- FILE UPLOAD (images/media) ----------
  if (contentType.includes("multipart/form-data")) {
    const pinataJwt = process.env.PINATA_JWT?.trim();
    if (!pinataJwt) {
      console.error("Pinata upload is not configured: PINATA_JWT is missing");
      return NextResponse.json({ error: "Pinata upload is not configured" }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type (images only)
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Images only." }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Max 5MB." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const token = pinataJwt.replace(/^Bearer\s+/i, "");

    const form = new FormData();
    form.append("file", new Blob([buffer], { type: file.type }), file.name);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("Pinata file error:", res.status, detail);
      return NextResponse.json({ error: `Pinata ${res.status}: ${detail}` }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json({ cid: data.IpfsHash, type: file.type });
  }

  // ---------- TEXT UPLOAD (existing) ----------
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
