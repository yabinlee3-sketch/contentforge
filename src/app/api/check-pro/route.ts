// touchendpoint-2026-05-15-13-50

function getKey(): string {
  return process.env.LEMON_SQUEEZY_SECRET || process.env.LLM_API_KEY || "";
}

function b64url(s: string): string {
  let b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  return decodeURIComponent(escape(atob(b64)));
}


export async function POST(request: Request) {
  try {
    const key = getKey();
    const body = await request.json();
    const { token } = body;
    if (!token) return Response.json({ active: false, reason: "no-token" });

    const dotIdx = token.lastIndexOf(".");
    if (dotIdx === -1) return Response.json({ active: false, reason: "bad-format" });

    const payloadB64 = token.slice(0, dotIdx);
    const signature = token.slice(dotIdx + 1);

    if (key) {
      const payloadStr = b64url(payloadB64);

      // Web Crypto API — works on Edge Runtime
      const encoder = new TextEncoder();
      const cryptoKey = await crypto.subtle.importKey(
        "raw", encoder.encode(key),
        { name: "HMAC", hash: "SHA-256" },
        false, ["sign"]
      );
      const sigBuf = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(payloadStr));
      const expectedSig = Array.from(new Uint8Array(sigBuf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      if (signature !== expectedSig) {
        return Response.json({ active: false, reason: "bad-signature" });
      }
    }

    // Parse payload
    const payloadStr = b64url(payloadB64);
    let payload: any;
    try {
      payload = JSON.parse(payloadStr);
    } catch {
      return Response.json({ active: false, reason: "bad-payload" });
    }

    const { expiresAt } = payload;
    if (expiresAt && Date.now() > expiresAt) {
      return Response.json({ active: false, reason: "expired" });
    }

    return Response.json({ active: true, expiresAt: expiresAt || null });
  } catch (e: any) {
    return Response.json({ active: false, reason: "error", msg: String(e?.message || e).slice(0, 200) });
  }
}
