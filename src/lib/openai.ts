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
    model: process.env.DEEPSEEK_MODEL || process.env.LLM_MODEL || config.model,
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

const SYSTEM_PROMPT = `You are ContentForge. Take an article and write 3 platform versions: Twitter/X thread, LinkedIn post, newsletter.

Twitter: hook + 5-7 tweet thread, emojis, CTA
LinkedIn: storytelling, 3-5 paragraphs, end with question
Newsletter: subject line, 3 sections, friendly tone, P.S.

Output JSON: {"platforms":[{"platform":"twitter|linkedin|newsletter","content":"...","tips":"tip"}]}`;

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
    temperature: 0.7,
    max_tokens: 384,
  }, { timeout: 10000 });

  let raw = response.choices[0].message.content || "{}";
  // Strip markdown code fences if present
  raw = raw.replace(/```json\s*/gi, "").replace(/```\s*$/g, "").trim();
  const result = JSON.parse(raw);

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
  const fallbackContent = $("body").text().replace(/\s+/g, " ").trim().slice(0, 4000);
  const finalContent = content || fallbackContent;

  // Reject trivial pages (search engines, login pages, etc.)
  if (finalContent.length < 100) {
    throw new Error(
      `Could not extract enough content from this URL (only ${finalContent.length} characters). ` +
      `This page may require login, be a search engine homepage, or have very little text. Try pasting the article text directly.`
    );
  }

  return {
    title: title.trim(),
    content: finalContent,
  };
}
