"use client";

import { useState, useCallback } from "react";
import { Loader2, Globe, FileText, Sparkles, ArrowRight, Zap, Share2, Repeat } from "lucide-react";
import ResultsPanel from "@/components/ResultsPanel";

export default function Home() {
  const [inputType, setInputType] = useState<"url" | "text">("text");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = useCallback(async () => {
    setError("");
    setResults(null);
    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: inputType,
          url: inputType === "url" ? url : undefined,
          text: inputType === "text" ? text : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setResults(data.platforms);
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
              placeholder="https://yourblog.com/post"
              className="w-full px-5 py-4 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
            />
          ) : (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your blog post or article here..."
              rows={8}
              className="w-full px-5 py-4 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all resize-y"
            />
          )}

          {/* Character count + validation hint */}
          {inputType === "text" && (
            <div className="flex items-center justify-between mt-2">
              <div>
                {text.trim().length > 0 && text.trim().length < 50 && (
                  <p className="text-sm text-amber-400">
                    还需要 <span className="font-semibold">{50 - text.trim().length}</span> 字才能生成
                  </p>
                )}
                {text.length >= 50 && text.trim().length < 50 && (
                  <p className="text-sm text-red-400">请输入有效内容，不要只填空格。</p>
                )}
              </div>
              <span className={`text-xs tabular-nums transition-colors ${
                text.trim().length >= 50 ? "text-green-400" : text.trim().length > 0 ? "text-amber-400" : "text-zinc-600"
              }`}>
                {text.trim().length}<span className="text-zinc-600"> / 50 最少字数</span>
              </span>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || (inputType === "url" ? !url : !text?.trim() || text.trim().length < 50)}
            className="mt-3 w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:from-zinc-700 disabled:to-zinc-700 disabled:text-zinc-500 text-black font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Generating...
              </>
            ) : inputType === "url" ? (
              <>
                <Sparkles className="w-5 h-5" /> Generate Content
              </>
            ) : !text?.trim() ? (
              <>
                <Sparkles className="w-5 h-5" /> 输入内容开始生成
              </>
            ) : text.trim().length < 50 ? (
              <>
                <Sparkles className="w-5 h-5" /> 还需 {50 - text.trim().length} 字
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" /> Generate Content
              </>
            )}
          </button>

          {error && (
            <p className="mt-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
              {error}
            </p>
          )}
        </div>
      </div>

      {/* Results */}
      {results && <ResultsPanel results={results} />}

      {/* Features */}
      {!results && (
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
