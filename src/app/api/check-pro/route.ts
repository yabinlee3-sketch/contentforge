// POST /api/check-pro
// Simple token validation

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;
    
    if (!token) {
      return Response.json({ active: false, reason: "no-token" });
    }

    const parts = token.split(".");
    if (parts.length !== 2) {
      return Response.json({ active: false, reason: "bad-format" });
    }

    return Response.json({ active: true, expiresAt: null });
  } catch (e: any) {
    return Response.json({ active: false, error: e?.message || "unknown" });
  }
}
