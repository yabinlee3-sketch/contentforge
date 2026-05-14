"use client";

import { Sparkles, Check, Zap, Lock } from "lucide-react";
import { openCheckout, remainingFree, isPro, setPro, FREE_LIMIT } from "@/lib/paywall";

export default function PricingSection() {
  const remaining = remainingFree();
  const pro = isPro();

  return (
    <div className="max-w-4xl mx-auto px-4 pb-24 pt-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-3">Simple Pricing</h2>
        <p className="text-zinc-400">Start free, upgrade when you need more.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* Free */}
        <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-2">Free</h3>
          <p className="text-3xl font-bold text-white mb-1">$0</p>
          <p className="text-sm text-zinc-500 mb-6">Forever</p>
          <ul className="space-y-3 mb-8">
            {[
              `${FREE_LIMIT} generations`,
              "URL + text input",
              "Twitter/X, LinkedIn, Newsletter",
              "Basic AI prompt",
            ].map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          {pro ? (
            <div className="w-full py-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl text-center font-medium text-sm">
              ✓ Pro Active
            </div>
          ) : (
            <div className="w-full py-3 bg-zinc-800 text-zinc-400 rounded-xl text-center text-sm font-medium">
              {remaining} / {FREE_LIMIT} remaining
            </div>
          )}
        </div>

        {/* Pro */}
        <div className="p-6 bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/30 rounded-xl relative overflow-hidden">
          <div className="absolute top-3 right-3 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full font-medium">
            Popular
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Pro</h3>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-3xl font-bold text-white">$9</span>
            <span className="text-zinc-500">/month</span>
          </div>
          <p className="text-sm text-zinc-500 mb-6">Cancel anytime</p>
          <ul className="space-y-3 mb-8">
            {[
              "Unlimited generations",
              "Priority AI processing",
              "Advanced prompt (better quality)",
              "Support indie development 🚀",
            ].map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                <Zap className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <button
            onClick={openCheckout}
            disabled={pro}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:from-zinc-700 disabled:to-zinc-700 text-black disabled:text-zinc-500 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
          >
            {pro ? (
              <>✓ Active</>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Upgrade Now
              </>
            )}
          </button>
        </div>
      </div>

      {/* Activation */}
      {!pro && (
        <div className="mt-8 max-w-md mx-auto p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl">
          <h4 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5" /> Already purchased?
          </h4>
          <div className="flex gap-2">
            <input
              id="license-input"
              type="text"
              placeholder="Paste license key..."
              className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
            />
            <button
              id="activate-btn"
              onClick={() => {
                const input = document.getElementById("license-input") as HTMLInputElement;
                const key = input?.value?.trim();
                if (key && key.length > 10) {
                  setPro();
                  window.location.reload();
                }
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-lg text-sm transition-all"
            >
              Activate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

