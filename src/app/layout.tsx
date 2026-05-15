import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ContentForge — AI Content Repurposing",
  description: "Turn one piece of content into platform-native posts for Twitter/X, LinkedIn, and Newsletter. Built for creators and indie hackers.",
  metadataBase: new URL("https://contentforge-three-chi.vercel.app"),
  openGraph: {
    title: "ContentForge — AI Content Repurposing",
    description: "One source. Every platform. AI-powered content repurposing.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Plausible Analytics */}
        <script defer data-domain="contentforge-three-chi.vercel.app" src="https://plausible.io/js/script.js"></script>
      </head>
      <body className="bg-black text-white antialiased min-h-screen flex flex-col">
        {/* Nav */}
        <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800/50">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 font-bold text-lg">
              <span className="w-7 h-7 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-black text-xs font-bold">CF</span>
              ContentForge
            </a>
            <div className="flex items-center gap-6 text-sm">
              <a href="/#features" className="text-zinc-400 hover:text-white transition-colors">Features</a>
              <a href="/#pricing" className="text-zinc-400 hover:text-white transition-colors">Pricing</a>
              <a href="/#faq" className="text-zinc-400 hover:text-white transition-colors">FAQ</a>
              <a href="/#contact" className="text-zinc-400 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </nav>

        {children}

        {/* Footer */}
        <footer className="mt-auto border-t border-zinc-800/50 py-8">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 bg-gradient-to-br from-amber-400 to-orange-500 rounded flex items-center justify-center text-black text-xs font-bold">CF</span>
              ContentForge — AI Content Repurposing
            </div>
            <div className="flex items-center gap-4">
              <a href="/terms" className="hover:text-zinc-300 transition-colors">Terms</a>
              <a href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy</a>
              <a href="mailto:contentforge@proton.me" className="hover:text-zinc-300 transition-colors">Email</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
