"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Loader2, Globe, FileText, Sparkles, Zap, Share2, Repeat, Check, ArrowRight, Mail } from "lucide-react";
import ResultsPanel from "@/components/ResultsPanel";
import PricingSection from "@/components/PricingSection";
import { canGenerate, incrementUsage, remainingFree, isPro, verifyProOnServer } from "@/lib/paywall";

export default function Home() {
  const [inputType, setInputType] = useState<"url" | "text">("text");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [error, setError] = useState("");
  const [showPricing, setShowPricing] = useState(false);

  // Verify Pro status with server on mount
  useEffect(() => {
    if (isPro()) {
      verifyProOnServer().then((valid) => {
        if (!valid) {
          setShowPricing(true);
        }
      });
    }
  }, []);
  }, []);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const trimmedLen = text.trim().length;
  const hasMinChars = trimmedLen >= 50;
  const needsMore = 50 - trimmedLen;

  const isValidUrl = (s: string) => {
    try {
      const u = new URL(s);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  };

  const btnLabel = useMemo(() => {
    if (loading) return "Generating...";
    if (inputType === "url") return url ? "Generate Content" : "Enter a URL to start";
    if (!text.trim()) return "Paste your content to start";
    if (!hasMinChars) return `Need ${needsMore} more characters`;
    return "Generate Content";
  }, [loading, inputType, text, hasMinChars, needsMore]);

  // URL: valid URL required; Text: 50+ chars required
  const btnDisabled = loading || (inputType === "url" ? !isValidUrl(url) : !hasMinChars);

  const handleGenerate = useCallback(async () => {
    // Server-verify before allowing generation (not just localStorage check)
    const serverValid = await verifyProOnServer();
    if (!serverValid && !canGenerate()) {
      setShowPricing(true);
      document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    setError("");
    setResults(null);
    setLoading(true);
    try {
      // All AI processing happens server-side — no API keys in browser!
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: inputType,
          url: inputType === "url" ? url : undefined,
          text: inputType === "text" ? text : undefined,
        }),
        signal: AbortSignal.timeout(45000),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
      setResults(data.platforms || []);
      incrementUsage();
    } catch (e: any) {
      if (e.name === "TimeoutError" || e.name === "AbortError") {
        setError("Request timed out. For long articles, try pasting text directly (it's faster than fetching a URL).");
      } else {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  }, [inputType, url, text]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes("@")) {
      setEmailSent(true);
    }
  };

  return (
    <main className="flex-1">
      {/* ===== Hero ===== */}
      <section className="max-w-4xl mx-auto px-4 pt-20 pb-12 text-center">
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
      </section>

      {/* ===== Features ===== */}
      <section id="features" className="max-w-4xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <Zap className="w-5 h-5" />, title: "AI-Native Formatting", desc: "Each platform gets content that reads like it was written natively — not just a copy-paste job." },
            { icon: <Share2 className="w-5 h-5" />, title: "Multi-Platform Output", desc: "Twitter/X threads, LinkedIn posts, and newsletter drafts — all from a single input." },
            { icon: <Repeat className="w-5 h-5" />, title: "Posting Tips Included", desc: "Best time to post, hashtag suggestions, and engagement tactics tailored to each platform." },
          ].map((f, i) => (
            <div key={i} className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors">
              <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-400 mb-4">{f.icon}</div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Tool Section ===== */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="max-w-2xl mx-auto">
          {/* Tabs */}
          <div className="flex gap-1 mb-3">
            <button onClick={() => setInputType("url")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                inputType === "url" ? "bg-zinc-800 text-white border border-zinc-700" : "text-zinc-500 hover:text-zinc-300"
              }`}>
              <Globe className="w-4 h-4" /> Paste URL
            </button>
            <button onClick={() => setInputType("text")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                inputType === "text" ? "bg-zinc-800 text-white border border-zinc-700" : "text-zinc-500 hover:text-zinc-300"
              }`}>
              <FileText className="w-4 h-4" /> Paste Text
            </button>
          </div>

          {inputType === "url" ? (
            <input type="url" value={url} onChange={e => setUrl(e.target.value)}
              placeholder="https://yourblog.com/post"
              className="w-full px-5 py-4 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all" />
          ) : (
            <textarea value={text} onChange={e => setText(e.target.value)}
              placeholder="Paste your blog post or article here... (min 50 characters)"
              rows={8}
              className="w-full px-5 py-4 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all resize-y" />
          )}

          {inputType === "text" && (
            <div className="flex items-center justify-between mt-2">
              <div>
                {trimmedLen > 0 && !hasMinChars && (
                  <p className="text-sm text-amber-400">Need <span className="font-semibold">{needsMore}</span> more characters</p>
                )}
              </div>
              <span className={`text-xs tabular-nums transition-colors ${
                hasMinChars ? "text-green-400" : trimmedLen > 0 ? "text-amber-400" : "text-zinc-600"
              }`}>
                {trimmedLen}<span className="text-zinc-600"> / 50 min</span>
              </span>
            </div>
          )}

          {inputType === "url" && url && !isValidUrl(url) && (
            <p className="mt-1 text-xs text-amber-400">Please enter a valid URL (https://...)</p>
          )}

          <button onClick={handleGenerate} disabled={btnDisabled}
            className="mt-3 w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:from-zinc-700 disabled:to-zinc-700 disabled:text-zinc-500 text-black font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-lg">
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-1" /> : <Sparkles className="w-5 h-5 mr-1" />}
            {btnLabel}
          </button>

          {!isPro() && (
            <p className="mt-2 text-xs text-zinc-500">Free: {remainingFree()} / 5 generations</p>
          )}

          {error && (
            <p className="mt-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">{error}</p>
          )}
        </div>
      </section>

      {/* Results */}
      {results && <ResultsPanel results={results} />}

      {/* Pricing */}
      <div id="pricing">
        {showPricing && <PricingSection />}
      </div>

      {/* ===== FAQ ===== */}
      <section id="faq" className="max-w-3xl mx-auto px-4 pb-24 pt-16">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: "How does ContentForge work?", a: "Paste a URL or article text, and our AI generates three platform-native versions: Twitter/X thread, LinkedIn post, and newsletter. Each version is tailored to that platform's format and audience." },
            { q: "Is there a free plan?", a: "Yes. You get 5 free generations. No credit card needed. Upgrade to Pro for unlimited access and faster processing." },
            { q: "What content works best?", a: "Blog posts, articles, and long-form content (500+ words) produce the best results. Shorter content works too, but the output quality improves with more input." },
            { q: "Can I use this for client work?", a: "Absolutely. The content you generate is yours to use however you like — including for clients." },
            { q: "What if I encounter a bug?", a: "Email us at contentforge@proton.me. We typically respond within 24 hours on weekdays." },
            { q: "How do you handle privacy?", a: "Your content is sent to DeepSeek AI for processing. We don't store your inputs or generated content on our servers. See our Privacy Policy for details." },
          ].map((faq, i) => (
            <details key={i} className="group bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
              <summary className="px-6 py-4 cursor-pointer font-medium text-white hover:bg-zinc-800/30 transition-colors flex items-center justify-between">
                {faq.q}
                <ArrowRight className="w-4 h-4 text-zinc-500 group-open:rotate-90 transition-transform flex-shrink-0" />
              </summary>
              <div className="px-6 pb-4 text-sm text-zinc-400 leading-relaxed">{faq.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* ===== Contact / Waitlist ===== */}
      <section id="contact" className="max-w-2xl mx-auto px-4 pb-24">
        <div className="p-8 bg-gradient-to-b from-zinc-900 to-transparent border border-zinc-800 rounded-2xl text-center">
          <h2 className="text-2xl font-bold mb-2">Stay in the loop</h2>
          <p className="text-zinc-400 mb-6 text-sm">
            Get updates on new features, tips, and content strategy. No spam, unsubscribe anytime.
          </p>
          {emailSent ? (
            <div className="py-4 text-green-400 flex items-center justify-center gap-2">
              <Check className="w-5 h-5" /> Thanks! You&apos;re on the list.
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="flex gap-2 max-w-md mx-auto">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 text-sm"
                required />
              <button type="submit"
                className="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-semibold rounded-xl text-sm transition-all flex items-center gap-2">
                <Mail className="w-4 h-4" /> Subscribe
              </button>
            </form>
          )}
          <p className="mt-4 text-xs text-zinc-600">
            Have a question? Email <a href="mailto:contentforge@proton.me" className="text-amber-400 hover:underline">contentforge@proton.me</a>
          </p>
        </div>
      </section>
    </main>
  );
}
