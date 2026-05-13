import { writeFileSync } from "fs";

const CONTENT = {
  type: "text",
  text: `I'm building an AI content repurposing tool called ContentForge in public.

Here's the problem: Creating content for multiple platforms wastes 3-5 hours every time you publish. Write a blog → reformat for Twitter → rewrite for LinkedIn → draft a newsletter.

Existing tools either just do video-to-shorts (Opus Clip), just do distribution (Repurpose.io), or cost way too much for indie creators.

ContentForge solves this: paste a URL or text → get platform-native versions for Twitter/X, LinkedIn, and Newsletter in 30 seconds. Built with Next.js + DeepSeek AI. Launching this week at $9/month.

I'm building in public and sharing real MRR numbers (starting at $0), build decisions, and launch strategy. The content repurposing market has a massive gap — nobody does text-to-all-platforms at indie-creator pricing. Sometimes the best opportunities are hiding in plain sight.`
};

const res = await fetch("http://localhost:3000/api/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(CONTENT)
});

const data = await res.json();
console.log("Status:", res.status);
if (data.platforms) {
  for (const p of data.platforms) {
    console.log(`\n=== ${p.platform.toUpperCase()} ===`);
    console.log(p.content);
    console.log(`\n💡 ${p.tips}`);
  }
} else {
  console.log(JSON.stringify(data, null, 2));
}
