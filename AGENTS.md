# AGENTS.md - Development Guide for Google Jules

## 1. Project Overview & Identity
- **Name:** News Aggregator & Media Hub
- **Purpose:** Full-stack personalized news aggregation platform with AI summarization, category filtering, Google Fact Check integration, and daily email digests.
- **Repository Structure:** Monorepo with two root packages:
  - `/client`: React (Vite) + Tailwind CSS + ShadCN UI + TanStack Query + Zustand
  - `/server`: Node.js (Express) + TypeScript + Prisma ORM + PostgreSQL (Neon/Supabase)

---

## 2. Environment & Tooling Commands
Always execute commands within their respective workspace directory.

### Backend (`/server`)
- Install: `npm install`
- Prisma Generate: `npx prisma generate`
- DB Migration: `npx prisma migrate dev --name <migration_name>`
- Dev Server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`

### Frontend (`/client`)
- Install: `npm install`
- Dev Server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`

---

## 3. Architectural Rules & Design Patterns

### Ingestion Service (Provider / Adapter Pattern)
- Do NOT hardcode third-party API calls in route handlers.
- All news providers must implement the `NewsProvider` interface (`fetchByCategory(category: string): Promise<NormalizedArticle[]>`).
- Primary free provider: `rss-parser` reading curated RSS feeds (BBC, The Verge, Wired, ESPN, ScienceDaily, Variety).
- Secondary provider: GNews API.
- NewsAPI is reserved for local dev only (do not rely on it for remote builds).

### AI & Fact-Check Integrations
- **AI Summaries:** Use `@google/genai` (Gemini 1.5 Flash).
  - CRITICAL: Check the database first. If `article.summary` exists, return it immediately. Only call Gemini if `summary` is null, then write the result back to PostgreSQL.
- **Fact Checking:** Use Google Fact Check Tools API (`factchecktools.googleapis.com`). Query verified journalists' claims by keyword; do not attempt ungrounded LLM web-scraping for fact-checking.

### Database & ORM
- Use PostgreSQL via Prisma.
- Store normalized articles with unique constraints on `sourceUrl` to prevent duplicate ingestion.
- Never write raw SQL strings in route handlers.

### Frontend Conventions
- Use TanStack Query (React Query) for all server state (infinite scrolling, feed fetching, bookmark mutations).
- Use Zustand only for client-side preferences (reading mode typography, theme, active category filter).
- Use ShadCN UI components inside `src/components/ui`.
- Distraction-free reader mode must render inside a responsive Sheet / Drawer component.

---

## 4. Boundaries & Constraints (Strict Rules)
1. **Never commit `.env` or sensitive API keys.** Always check `.env.example`.
2. **Never break provider contracts.** If modifying ingestion, ensure `NormalizedArticle` fields remain intact.
3. **Run builds before submitting a PR:** Jules must verify that both `npm run build` in `/server` and `npm run build` in `/client` exit with code `0`.
4. **Targeted Diffs:** Do not reformat unrelated files. Keep pull requests focused on one milestone at a time.