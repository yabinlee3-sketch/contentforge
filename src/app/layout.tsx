import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ContentForge — AI Content Repurposing",
  description: "Turn one piece of content into platform-native posts for Twitter/X, LinkedIn, and Newsletter. Built for creators and indie hackers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
