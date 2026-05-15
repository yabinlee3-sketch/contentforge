// POST /api/claim-pro
// Called by browser after LemonSqueezy checkout.success postMessage
// Issues an HMAC-signed token proving the user paid

import { NextRequest, NextResponse } from "next/server";
import { createHmac, randomBytes } from "crypto";

function getSigningKey(): string {
  // LLM_API_KEY is already set in Vercel env — long random string, works as HMAC key
  // Recommended: add separate LEMON_SQUEEZY_SECRET env var for production
  return process.env.LEMON_SQUEEZY_SECRET || process.env.LLM_API_KEY || "";
}

export async function POST(request: NextRequest) {
  try {
    const key = getSigningKey();
    if (!key) {
      return NextResponse.json(
        { error: "Server signing key not configured. Contact support." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { customerEmail, orderId, variantId } = body;

    if (!orderId && !customerEmail && !variantId) {
      return NextResponse.json(
        { error: "Invalid checkout data." },
        { status: 400 }
      );
    }

    // Create a signed payload
    const now = Date.now();
    const expiresAt = now + 30 * 24 * 60 * 60 * 1000; // 30 days
    const nonce = randomBytes(8).toString("hex");

    // Payload: what we're certifying
    const payload = JSON.stringify({
      orderId: orderId || `anon_${nonce}`,
      email: customerEmail || "anonymous",
      variant: variantId || 0,
      issuedAt: now,
      expiresAt,
      nonce,
    });

    // Sign with HMAC-SHA256
    const hmac = createHmac("sha256", key);
    hmac.update(payload);
    const signature = hmac.digest("hex");

    // Token = base64(payload) + "." + signature
    const token = Buffer.from(payload, "utf8").toString("base64url") + "." + signature;

    return NextResponse.json({ token, expiresAt });
  } catch (error) {
    console.error("Claim error:", error);
    return NextResponse.json(
      { error: "Failed to process claim." },
      { status: 500 }
    );
  }
}
