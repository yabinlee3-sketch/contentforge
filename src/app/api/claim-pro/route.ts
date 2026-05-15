// touchendpoint-2026-05-15-13-50

function getKey(): string {
  return process.env.LEMON_SQUEEZY_SECRET || process.env.LLM_API_KEY || "";
}

function b64url(s: string): string {
  return btoa(unescape(encodeURIComponent(s)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}


export async function POST(request: Request) {
  try {
    const key = getKey();
    if (!key) {
      return Response.json({ error: "Server signing key not configured." }, { status: 500 });
    }

    const body = await request.json();
    const { customerEmail, orderId, variantId } = body;
    if (!orderId && !customerEmail && !variantId) {
      return Response.json({ error: "Invalid checkout data." }, { status: 400 });
    }

    // Generate nonce using Web Crypto API (Edge safe)
    const nonceArr = new Uint8Array(8);
    crypto.getRandomValues(nonceArr);
    const nonce = Array.from(nonceArr).map((b) => b.toString(16).padStart(2, "0")).join("");

    const now = Date.now();
    const expiresAt = now + 30 * 24 * 60 * 60 * 1000;
    const payload = JSON.stringify({
      orderId: orderId || `anon_${nonce}`,
      email: customerEmail || "anonymous",
      variant: variantId || 0,
      issuedAt: now,
      expiresAt,
      nonce,
    });

    // HMAC-SHA256 via Web Crypto API (Edge safe)
    const encoder = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(
      "raw", encoder.encode(key),
      { name: "HMAC", hash: "SHA-256" },
      false, ["sign"]
    );
    const sigBuf = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(payload));
    const signature = Array.from(new Uint8Array(sigBuf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const token = b64url(payload) + "." + signature;

    return Response.json({ token, expiresAt });
  } catch (e: any) {
    return Response.json(
      { error: "Failed to process claim.", msg: String(e?.message || e).slice(0, 200) },
      { status: 500 }
    );
  }
}
