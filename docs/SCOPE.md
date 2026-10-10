# Project Scope & Milestone Roadmap

## Objective
Build a production-ready, free-tier-compliant personalized news aggregation and media hub using React, Node.js, PostgreSQL, and Google Gemini API.

---

## Milestone 1: Monorepo Setup & Data Schema
- [ ] Initialize monorepo structure with `/client` (Vite + React + TS + Tailwind) and `/server` (Express + TS).
- [ ] Configure ESLint, Prettier, and path aliases for both workspaces.
- [ ] Set up Prisma schema in `/server/prisma/schema.prisma`:
  - `User` (id, email, passwordHash, preferences, createdAt)
  - `Article` (id, title, description, content, sourceUrl, sourceName, imageUrl, category, publishedAt, summary)
  - `Bookmark` (userId, articleId, createdAt)
  - `Comment` (id, userId, articleId, content, parentId, createdAt)
- [ ] Add `.env.example` templates for both frontend and backend.

## Milestone 2: News Ingestion & Fact-Check Pipeline
- [ ] Implement `NormalizedArticle` TypeScript interface.
- [ ] Build `RSSProvider` using `rss-parser` for Tech, Science, Sports, and Entertainment feeds.
- [ ] Build `GNewsProvider` with API key support.
- [ ] Implement `NewsService` deduplication and bulk upsert into PostgreSQL.
- [ ] Implement scheduled background sync using `node-cron` (every 60 minutes).
- [ ] Add Google Fact Check Tools API integration endpoint (`GET /api/fact-check?query=...`).

## Milestone 3: AI Summarization & Core APIs
- [ ] Implement Gemini 1.5 Flash client (`/server/src/services/aiService.ts`).
- [ ] Create `POST /api/articles/:id/summarize` endpoint:
  - Cache check: return existing summary if present in DB.
  - LLM call: prompt Gemini for 3-bullet summary + ELI5 breakdown.
  - Persist summary to DB.
- [ ] Create paginated feed endpoint: `GET /api/articles?category=...&page=1&limit=20`.
- [ ] Create bookmarking and reading-history endpoints with JWT auth.

## Milestone 4: Frontend Feed & Reader Mode
- [ ] Configure ShadCN UI components (Button, Card, Badge, Sheet, Tabs, Skeleton).
- [ ] Build responsive news card component (headline, image, source badge, timestamp, bookmark button).
- [ ] Implement category tab filtering with TanStack Query infinite scroll.
- [ ] Build distraction-free "Reader Mode" drawer with font size adjustments and native browser Text-to-Speech (`window.speechSynthesis`).
- [ ] Add Google Fact-Check card displaying verified claims next to matching articles.

## Milestone 5: Daily Digest & Production Hardening
- [ ] Setup scheduled morning email briefing using Resend / Nodemailer.
- [ ] Implement CORS protection and rate limiting (`express-rate-limit`).
- [ ] Add `/api/health` heartbeat route for Render uptime monitoring.