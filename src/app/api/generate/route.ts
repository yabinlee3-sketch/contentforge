// touchendpoint-2026-05-15-13-50
import { NextRequest, NextResponse } from "next/server";
import { fetchUrlContent, generateContent } from "@/lib/openai";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, url, text } = body;

    let sourceText: string;
    let sourceTitle: string;

    if (type === "url" && url) {
      try {
        const fetched = await fetchUrlContent(url);
        sourceText = fetched.content;
        sourceTitle = fetched.title;
      } catch (e: any) {
        return NextResponse.json(
          { error: e.message || "Failed to fetch URL. Try pasting text instead." },
          { status: 400 }
        );
      }
    } else if (type === "text" && text && text.trim().length >= 50) {
      sourceText = text;
      sourceTitle = text.slice(0, 60) + (text.length > 60 ? "..." : "");
    } else {
      return NextResponse.json(
        { error: "Invalid request. Use type='url' with a valid URL or type='text' with at least 50 characters." },
        { status: 400 }
      );
    }

    // Call AI generation on the server — API key stays safe
    const result = await generateContent(sourceText, sourceTitle);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Failed to process request. Please try pasting text directly." },
      { status: 500 }
    );
  }
}
