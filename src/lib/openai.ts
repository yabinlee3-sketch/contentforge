// Support multiple LLM providers
type Provider = "deepseek" | "openai" | "zhipu";

const PROVIDER_CONFIG: Record<Provider, { baseURL: string; model: string }> = {
  deepseek: {
    baseURL: "https://api.deepseek.com/v1",
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

function getConfig() {
  const provider = (process.env.LLM_PROVIDER || "deepseek") as Provider;
  const config = PROVIDER_CONFIG[provider];
  return {
    baseURL: config.baseURL,
    model: process.env.DEEPSEEK_MODEL || process.env.LLM_MODEL || config.model,
    apiKey: process.env.LLM_API_KEY || "",
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
  const { baseURL, model, apiKey } = getConfig();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Title: ${sourceTitle}\n\nContent:\n${sourceContent.slice(0, 4000)}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 2048, // was 384 — needed room for 3 platform outputs
      }),
      signal: controller.signal,
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.error?.message || `API error ${response.status}`);
    }
    let raw = json.choices?.[0]?.message?.content || "{}";
    raw = raw.replace(/```json\s*/gi, "").replace(/```\s*$/g, "").trim();
    const result = JSON.parse(raw);

    return {
      originalTitle: sourceTitle,
      platforms: result.platforms || [],
    };
  } finally {
    clearTimeout(timeout);
  }
}

function extractText(html: string): { title: string; paragraphs: string[] } {
  // Extract title
  const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
  const htmlTitle = html.match(/<title>([^<]*)<\/title>/i);
  const h1 = html.match(/<h1[^>]*>([^<]*)<\/h1>/i);
  const title = ogTitle?.[1] || htmlTitle?.[1] || h1?.[1] || "Untitled";

  // Remove unwanted elements
  let cleaned = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  cleaned = cleaned.replace(/<style[\s\S]*?<\/style>/gi, "");
  cleaned = cleaned.replace(/<nav[\s\S]*?<\/nav>/gi, "");
  cleaned = cleaned.replace(/<footer[\s\S]*?<\/footer>/gi, "");
  cleaned = cleaned.replace(/<header[\s\S]*?<\/header>/gi, "");
  cleaned = cleaned.replace(/<aside[\s\S]*?<\/aside>/gi, "");

  // Try to find main content
  const mainMatch = cleaned.match(/<(article|main)[\s\S]*?<\/(article|main)>/i);
  const contentArea = mainMatch?.[0] || cleaned;

  // Extract paragraphs
  const paragraphs: string[] = [];
  const pRegex = /<(?:p|h[1-4]|li)[^>]*>([\s\S]*?)<\/(?:p|h[1-4]|li)>/gi;
  let match;
  while ((match = pRegex.exec(contentArea)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, "").trim();
    if (text.length > 20 && !/cookie|gdpr|subscribe|sign\s*up/i.test(text)) {
      paragraphs.push(text);
    }
  }

  return { title, paragraphs };
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
  const { title, paragraphs } = extractText(html);
  const content = paragraphs.join("\n\n").slice(0, 6000);

  // Reject trivial pages
  if (content.length < 100) {
    throw new Error(
      `Could not extract enough content from this URL (only ${content.length} characters). ` +
      `This page may require login, be a search engine homepage, or have very little text. Try pasting the article text directly.`
    );
  }

  return { title, content };
}
