"use client";

import { useState, useCallback, useMemo } from "react";
import { Loader2, Globe, FileText, Sparkles, Zap, Share2, Repeat, Lock } from "lucide-react";
import ResultsPanel from "@/components/ResultsPanel";
import PricingSection from "@/components/PricingSection";
import { canGenerate, incrementUsage, remainingFree, isPro } from "@/lib/paywall";

// DeepSeek client-side call — bypasses Vercel's 10s+ timeout
const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";
const DEEPSEEK_KEY = "sk-d67a1b0a57734dcc81c98cec839aea47";
const SYSTEM_PROMPT = `You are ContentForge. Take an article and write 3 platform versions: Twitter/X thread, LinkedIn post, newsletter.

Output JSON: {"platforms":[{"platform":"twitter|linkedin|newsletter","content":"...","tips":"tip"}]}`;

async function callDeepSeek(text: string, title: string) {
  const res = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${DEEPSEEK_KEY}` },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Title: ${title}\n\nContent:\n${text.slice(0, 4000)}` },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
    signal: AbortSignal.timeout(30000),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || `API error ${res.status}`);
  let raw = json.choices?.[0]?.message?.content || "{}";
  raw = raw.replace(/```json\s*/gi, "").replace(/```\s*$/g, "").trim();
  return JSON.parse(raw);
}

export default function Home() {
  const [inputType, setInputType] = useState<"url" | "text">("text");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [error, setError] = useState("");
  const [showPricing, setShowPricing] = useState(false);

  // Compute once — prevent repeated trim() calls in JSX
  const trimmedLen = text.trim().length;
  const hasMinChars = trimmedLen >= 50;
  const needsMore = 50 - trimmedLen;

  // Button label
  const btnLabel = useMemo(() => {
    if (loading) return "Generating...";
    if (inputType === "url") return "Generate Content";
    if (!text.trim()) return "输入内容开始生成";
    if (!hasMinChars) return `还需 ${needsMore} 字`;
    return "Generate Content";
  }, [loading, inputType, text, hasMinChars, needsMore]);

  // Button disabled?
  const btnDisabled = loading || (inputType === "url" ? !url : !hasMinChars);

  const handleGenerate = useCallback(async () => {
    // Check paywall
    if (!canGenerate()) {
      setShowPricing(true);
      return;
    }

    setError("");
    setResults(null);
    setLoading(true);

    try {
      let sourceText: string;
      let sourceTitle: string;

      if (inputType === "url") {
        // Use backend to fetch URL content (fast, no DeepSeek call on server)
        const fetchRes = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "url", url }),
          signal: AbortSignal.timeout(15000),
        });
        const fetchData = await fetchRes.json();
        if (!fetchRes.ok) throw new Error(fetchData.error || "Failed to fetch URL");
        sourceText = fetchData.content;
        sourceTitle = fetchData.title || "Untitled";
      } else {
        sourceText = text;
        sourceTitle = text.slice(0, 60) + (text.length > 60 ? "..." : "");
      }

      const result = await callDeepSeek(sourceText, sourceTitle);
      setResults(result.platforms || []);
      incrementUsage(); // Track free tier usage
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [inputType, url, text]);

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-zinc-800/50 border border-zinc-700 rounded-full text-xs text-zinc-400 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          AI-Powered Content Repurposing
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
          One piece of content.
          <br />
          <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
            Every platform.
          </span>
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-4">
          Paste a blog post or article, get platform-native versions for
          Twitter/X, LinkedIn, and your newsletter — in seconds.
        </p>

        {/* Input */}
        <div className="max-w-2xl mx-auto mt-10">
          {/* Tabs */}
          <div className="flex gap-1 mb-3">
            <button
              onClick={() => setInputType("url")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                inputType === "url"
                  ? "bg-zinc-800 text-white border border-zinc-700"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Globe className="w-4 h-4" /> Paste URL
            </button>
            <button
              onClick={() => setInputType("text")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                inputType === "text"
                  ? "bg-zinc-800 text-white border border-zinc-700"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <FileText className="w-4 h-4" /> Paste Text
            </button>
          </div>

          {/* Input area */}
          {inputType === "url" ? (
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yourblog.com/post （需包含正文内容的文章页面）"
              className="w-full px-5 py-4 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
            />
          ) : (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="在此粘贴你的博客或文章...（至少 50 字）"
              rows={8}
              className="w-full px-5 py-4 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all resize-y"
            />
          )}

          {/* Character count + validation hint */}
          {inputType === "text" && (
            <div className="flex items-center justify-between mt-2">
              <div>
                {trimmedLen > 0 && !hasMinChars && (
                  <p className="text-sm text-amber-400">
                    还需要 <span className="font-semibold">{needsMore}</span> 字才能生成
                  </p>
                )}
              </div>
              <span className={`text-xs tabular-nums transition-colors ${
                hasMinChars ? "text-green-400" : trimmedLen > 0 ? "text-amber-400" : "text-zinc-600"
              }`}>
                {trimmedLen}<span className="text-zinc-600"> / 50 最少字数</span>
              </span>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={btnDisabled}
            className="mt-3 w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:from-zinc-700 disabled:to-zinc-700 disabled:text-zinc-500 text-black font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-lg"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mr-1" />
            ) : (
              <Sparkles className="w-5 h-5 mr-1" />
            )}
            {btnLabel}
          </button>

          {!isPro() && (
            <p className="mt-2 text-xs text-zinc-500">
              Free: {remainingFree()} / 5 generations
            </p>
          )}

          {error && (
            <p className="mt-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
              {error}
            </p>
          )}
        </div>
      </div>

      {/* Results */}
      {results && <ResultsPanel results={results} />}

      {/* Pricing */}
      {showPricing && <PricingSection />}

      {/* Features (only when no results and no pricing) */}
      {!results && !showPricing && (
        <div className="max-w-4xl mx-auto px-4 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {[
              {
                icon: <Zap className="w-5 h-5" />,
                title: "AI-Native Formatting",
                desc: "Each platform gets content that reads like it was written natively — not just a copy-paste job.",
              },
              {
                icon: <Share2 className="w-5 h-5" />,
                title: "Multi-Platform Output",
                desc: "Twitter/X threads, LinkedIn posts, and newsletter drafts — all from a single input.",
              },
              {
                icon: <Repeat className="w-5 h-5" />,
                title: "Posting Tips Included",
                desc: "Best time to post, hashtag suggestions, and engagement tactics tailored to each platform.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors"
              >
                <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-400 mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
