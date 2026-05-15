// POST /api/check-pro
// Validates an HMAC-signed pro token returned by /api/claim-pro
// Returns { active, expiresAt }

import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "node:crypto";

function getSigningKey(): string {
  return process.env.LEMON_SQUEEZY_SECRET || process.env.LLM_API_KEY || "";
}

function base64UrlDecode(s: string): string {
  // Convert base64url to standard base64
  let b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  // Add padding
  while (b64.length % 4) b64 += "=";
  return Buffer.from(b64, "base64").toString("utf8");
}

export async function POST(request: NextRequest) {
  try {
    const key = getSigningKey();
    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json({ active: false, reason: "no-token" });
    }

    // Token format: base64url(payload).signature_hex
    const dotIdx = token.lastIndexOf(".");
    if (dotIdx === -1) {
      return NextResponse.json({ active: false, reason: "bad-format" });
    }

    const payloadB64 = token.slice(0, dotIdx);
    const signature = token.slice(dotIdx + 1);

    // Verify signature if signing key is configured
    if (key) {
      let payloadStr: string;
      try {
        payloadStr = base64UrlDecode(payloadB64);
      } catch {
        return NextResponse.json({ active: false, reason: "bad-encoding" });
      }

      const hmac = createHmac("sha256", key);
      hmac.update(payloadStr);
      const expectedSig = hmac.digest("hex");

      if (signature !== expectedSig) {
        return NextResponse.json({ active: false, reason: "bad-signature" });
      }
    }

    // Parse payload
    let payloadStr: string;
    try {
      payloadStr = base64UrlDecode(payloadB64);
    } catch {
      return NextResponse.json({ active: false, reason: "bad-encoding" });
    }

    let payload: any;
    try {
      payload = JSON.parse(payloadStr);
    } catch {
      return NextResponse.json({ active: false, reason: "bad-payload" });
    }

    const { expiresAt } = payload;
    if (expiresAt && Date.now() > expiresAt) {
      return NextResponse.json({ active: false, reason: "expired" });
    }

    return NextResponse.json({
      active: true,
      expiresAt: expiresAt || null,
    });
  } catch (error: any) {
    console.error("Check-pro error:", error?.message || error);
    return NextResponse.json({ active: false, reason: "server-error" });
  }
}
