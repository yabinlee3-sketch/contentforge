import OpenAI from "openai";
import * as cheerio from "cheerio";

// Support multiple LLM providers
type Provider = "deepseek" | "openai" | "zhipu";

const PROVIDER_CONFIG: Record<Provider, { baseURL: string; model: string }> = {
  deepseek: {
    baseURL: "https://api.deepseek.com",
    model: "deepseek-chat",
  },
  openai: {
    baseURL: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
  },
  zhipu: {
    baseURL: "https://open.bigmodel.cn/api/paas/v4",
    model: "glm-4-flash",
  },
};

function getClient() {
  const provider = (process.env.LLM_PROVIDER || "deepseek") as Provider;
  const config = PROVIDER_CONFIG[provider];

  return {
    client: new OpenAI({
      apiKey: process.env.LLM_API_KEY,
      baseURL: config.baseURL,
    }),
    model: process.env.LLM_MODEL || config.model,
  };
}

export interface PlatformContent {
  platform: string;
  icon: string;
  content: string;
  tips: string;
}

export interface GenerateResult {
  originalTitle: string;
  platforms: PlatformContent[];
}

const SYSTEM_PROMPT = `You are ContentForge, an expert content repurposing assistant. 
Your job: take ONE piece of content and repurpose it into platform-native versions for Twitter/X, LinkedIn, and Email Newsletter.

Rules:
1. Maintain the core message and key points from the original
2. Adapt tone and format for each platform's native style
3. Twitter/X: Use a strong hook, numbered thread format (5-8 tweets), emojis sparingly, end with a CTA to like/retweet
4. LinkedIn: Professional but conversational, storytelling format, 3-5 paragraphs, include a question at the end to drive engagement, use line breaks generously
5. Newsletter: Longer form, friendly tone, subject line included, 3-4 sections with headers, end with a P.S.
6. Each piece should feel ORIGINAL, not like a rewording of the same text
7. Include relevant hashtags where appropriate

Output format (JSON):
{
  "platforms": [
    {
      "platform": "twitter",
      "content": "...",
      "tips": "Best posted at 9am EST. Pin the first tweet."
    },
    {
      "platform": "linkedin",
      "content": "...",
      "tips": "Tag 2-3 relevant people for reach."
    },
    {
      "platform": "newsletter",
      "content": "...",
      "tips": "Send Tuesday or Thursday morning for best open rates."
    }
  ]
}`;

export async function generateContent(
  sourceContent: string,
  sourceTitle: string
): Promise<GenerateResult> {
  const { client, model } = getClient();

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Title: ${sourceTitle}\n\nContent:\n${sourceContent.slice(0, 4000)}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const result = JSON.parse(response.choices[0].message.content || "{}");

  return {
    originalTitle: sourceTitle,
    platforms: result.platforms || [],
  };
}

export async function fetchUrlContent(
  url: string
): Promise<{ title: string; content: string }> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; ContentForge/1.0; +https://contentforge.ai)",
    },
  });
  const html = await response.text();
  const $ = cheerio.load(html);

  // Extract title
  const title =
    $('meta[property="og:title"]').attr("content") ||
    $("title").text() ||
    $("h1").first().text() ||
    "Untitled";

  // Remove non-content elements
  $(
    "script, style, nav, footer, header, aside, .sidebar, .comments, .ad, .advertisement, noscript, iframe"
  ).remove();

  // Try to find main content area
  const mainSelectors = [
    "article",
    '[role="main"]',
    "main",
    ".post-content",
    ".article-content",
    ".entry-content",
    ".content",
    "#content",
  ];

  let contentEl: any = $("body");
  for (const sel of mainSelectors) {
    const el: any = $(sel);
    if (el.length && el.text().trim().length > 200) {
      contentEl = el;
      break;
    }
  }

  // Extract paragraphs
  const paragraphs: string[] = [];
  contentEl.find("p, h1, h2, h3, h4, li").each((_: number, el: any) => {
    const text = $(el).text().trim();
    if (text.length > 20 && !text.includes("cookie") && !text.includes("GDPR")) {
      paragraphs.push(text);
    }
  });

  const content = paragraphs.join("\n\n").slice(0, 6000);

  return {
    title: title.trim(),
    content: content || $("body").text().replace(/\s+/g, " ").trim().slice(0, 4000),
  };
}
