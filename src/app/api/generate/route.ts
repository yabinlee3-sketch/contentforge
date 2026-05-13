import { NextRequest, NextResponse } from "next/server";
import { generateContent, fetchUrlContent } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, url, text } = body;

    if (!type) {
      return NextResponse.json({ error: "Missing type" }, { status: 400 });
    }

    let content: string;
    let title: string;

    if (type === "url" && url) {
      try {
        const fetched = await fetchUrlContent(url);
        content = fetched.content;
        title = fetched.title;
      } catch {
        return NextResponse.json(
          { error: "Failed to fetch URL. Try pasting text instead." },
          { status: 400 }
        );
      }
    } else if (type === "text" && text) {
      content = text;
      title = text.slice(0, 60) + (text.length > 60 ? "..." : "");
    } else {
      return NextResponse.json({ error: "Missing content" }, { status: 400 });
    }

    const trimmedContent = content.trim();
    if (trimmedContent.length < 50) {
      return NextResponse.json(
        { error: "Content too short. Please provide at least 50 non-whitespace characters." },
        { status: 400 }
      );
    }

    // Use trimmed content for generation
    content = trimmedContent;

    const result = await generateContent(content, title);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Generation failed. Please try again." },
      { status: 500 }
    );
  }
}
