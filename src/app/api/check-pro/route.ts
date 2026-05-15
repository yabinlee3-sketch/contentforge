// POST /api/check-pro
// Validates an HMAC-signed pro token returned by /api/claim-pro
// Returns { active, expiresAt } — used by frontend to verify Pro status server-side

import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

function getSigningKey(): string {
  return process.env.LEMON_SQUEEZY_SECRET || process.env.LLM_API_KEY || "";
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

    // Verify signature
    if (key) {
      const hmac = createHmac("sha256", key);
      hmac.update(Buffer.from(payloadB64, "base64url").toString("utf8"));
      const expectedSig = hmac.digest("hex");

      if (signature !== expectedSig) {
        return NextResponse.json({ active: false, reason: "bad-signature" });
      }
    }

    // Parse payload
    let payload: any;
    try {
      payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
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
  } catch (error) {
    console.error("Check-pro error:", error);
    return NextResponse.json({ active: false, reason: "server-error" });
  }
}
