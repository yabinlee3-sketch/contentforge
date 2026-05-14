import { NextRequest, NextResponse } from "next/server";
import { fetchUrlContent } from "@/lib/openai";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, url, text } = body;

    if (type === "url" && url) {
      try {
        const fetched = await fetchUrlContent(url);
        return NextResponse.json({
          content: fetched.content,
          title: fetched.title,
        });
      } catch (e: any) {
        return NextResponse.json(
          { error: e.message || "Failed to fetch URL. Try pasting text instead." },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Invalid request. Use type='url' or type='text'." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to process request." },
      { status: 500 }
    );
  }
}
