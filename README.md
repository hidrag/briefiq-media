# News Aggregator & Media Hub

A personalized, real-time news aggregation platform featuring topic filtering, AI summarization via Google Gemini, fact-checking verification, and reader-mode optimization.

## Tech Stack
- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS, ShadCN UI, TanStack Query, Zustand
- **Backend:** Node.js, Express, TypeScript, Prisma ORM, PostgreSQL (Neon / Supabase)
- **External Integrations:** RSS Feeds (`rss-parser`), GNews API, Google Fact Check Tools API, Google Gemini API (1.5 Flash), Resend

---

## Project Structure
```text
├── client/          # React + Vite frontend application
├── server/          # Node.js + Express backend & Prisma schema
├── AGENTS.md        # AI agent instructions for Google Jules
├── SCOPE.md         # Detailed milestone deliverables
└── README.md