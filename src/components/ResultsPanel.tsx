"use client";

import { useState } from "react";
import { Copy, Check, Hash, BriefcaseBusiness, Mail } from "lucide-react";

interface PlatformResult {
  platform: string;
  content: string;
  tips: string;
}

const PLATFORM_CONFIG: Record<string, { name: string; icon: React.ReactNode; color: string }> = {
  twitter: { name: "Twitter / X", icon: <Hash className="w-4 h-4" />, color: "bg-sky-500" },
  linkedin: { name: "LinkedIn", icon: <BriefcaseBusiness className="w-4 h-4" />, color: "bg-blue-600" },
  newsletter: { name: "Newsletter", icon: <Mail className="w-4 h-4" />, color: "bg-amber-500" },
};

export default function ResultsPanel({ results }: { results: PlatformResult[] }) {
  const [activeTab, setActiveTab] = useState(results[0]?.platform || "twitter");
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, platform: string) => {
    navigator.clipboard.writeText(text);
    setCopied(platform);
    setTimeout(() => setCopied(null), 2000);
  };

  const current = results.find((r) => r.platform === activeTab);
  if (!current) return null;

  return (
    <div className="w-full max-w-3xl mx-auto mt-8">
      <div className="flex gap-1 mb-0">
        {results.map((r) => (
          <button
            key={r.platform}
            onClick={() => setActiveTab(r.platform)}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-sm font-medium transition-all ${
              activeTab === r.platform
                ? "bg-zinc-800 text-white border-t border-x border-zinc-700"
                : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            <span className={PLATFORM_CONFIG[r.platform]?.color + " w-2 h-2 rounded-full"} />
            {PLATFORM_CONFIG[r.platform]?.name || r.platform}
          </button>
        ))}
      </div>

      <div className="bg-zinc-800 border border-zinc-700 rounded-b-xl rounded-tr-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-zinc-500 font-mono">
            {current.content.length} characters
          </span>
          <button
            onClick={() => copyToClipboard(current.content, current.platform)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm text-zinc-200 transition-colors"
          >
            {copied === current.platform ? (
              <>
                <Check className="w-4 h-4 text-green-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
        </div>

        <div className="bg-zinc-900 rounded-lg p-5 border border-zinc-700">
          <pre className="whitespace-pre-wrap text-sm text-zinc-200 leading-relaxed font-sans">
            {current.content}
          </pre>
        </div>

        {current.tips && (
          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-xs text-amber-400 flex items-center gap-1">
              💡 {current.tips}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
