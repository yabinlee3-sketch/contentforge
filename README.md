# ContentForge

**One piece of content. Every platform.** AI-powered content repurposing tool.

Turn a blog post or article into platform-native posts for Twitter/X, LinkedIn, and Newsletter — in seconds.

---
<!-- deploy-trigger: 2026-05-15 -->


## Quick Start

```bash
# 1. Install
npm install

# 2. Set up API key (DeepSeek recommended for China users)
# Edit .env.local:
#   LLM_PROVIDER=deepseek
#   LLM_API_KEY=sk-your-key-here

# Get DeepSeek key: https://platform.deepseek.com (¥1/million tokens)
# Or OpenAI: https://platform.openai.com
# Or ZhipuAI: https://open.bigmodel.cn

# 3. Run
npm run dev
# → http://localhost:3000
```

## Features

- **URL Fetch** — Paste any article URL, auto-extract clean content
- **Text Paste** — Paste your own text directly
- **Three Platforms** — Twitter/X threads, LinkedIn posts, Newsletter drafts
- **AI-Native** — Each platform version reads like it was written for that platform
- **Multi-LLM** — Supports DeepSeek, OpenAI, and ZhipuAI (GLM)

## Tech Stack

- Next.js 16 + TypeScript + Tailwind CSS
- Cheerio (content extraction)
- OpenAI-compatible SDK (multi-provider)

## Provider Config

| Provider | Model | Cost | Best For |
|----------|-------|------|----------|
| DeepSeek | deepseek-chat | ~¥1/M tokens | China users, cheapest |
| OpenAI | gpt-4o-mini | ~$0.15/M tokens | Best quality |
| ZhipuAI | glm-4-flash | ~¥0.1/M tokens | China users, free tier available |

Set via `.env.local`:
```
LLM_PROVIDER=deepseek    # deepseek | openai | zhipu
LLM_API_KEY=sk-xxx
```

## Build

```bash
npm run build
npm start
```

## License

MIT
