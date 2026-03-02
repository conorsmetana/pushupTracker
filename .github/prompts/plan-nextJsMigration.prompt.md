## Plan: Migrate Push-Up Tracker to Next.js + Vercel

**TL;DR**: Replace the NestJS + Vite architecture with a unified Next.js 14 app using App Router. Auth migrates to NextAuth.js with Credentials provider. Database switches from SQLite to Vercel Postgres. All API endpoints become Route Handlers (`app/api/`), and React pages convert with minimal changes. Prisma stays as the ORM. Deploy via Vercel CLI or GitHub integration.

---

### Steps

**Phase 1: Project Setup**

1. Create new Next.js project in repo root (or alongside existing code):
   - Initialize with `npx create-next-app@latest` using TypeScript, App Router, Tailwind (optional)
   - Remove default boilerplate pages

2. Configure Prisma for PostgreSQL:
   - Update `provider = "postgresql"` in prisma/schema.prisma
   - Add `@vercel/postgres` or standard `DATABASE_URL` connection string
   - Remove SQLite-specific settings; add `directUrl` for migrations

3. Install dependencies:
   - Keep: `@prisma/client`, `recharts`, `bcryptjs` (edge-compatible vs `bcrypt`)
   - Add: `next-auth`, `@auth/prisma-adapter` (optional), `jose` (if needed)
   - Remove: All `@nestjs/*`, `passport-*`, `axios`, `react-router-dom`

---

**Phase 2: Authentication (NextAuth.js)**

4. Create NextAuth configuration at `app/api/auth/[...nextauth]/route.ts`:
   - Use Credentials provider with email/password
   - Port password validation logic from src/auth/auth.service.ts
   - Configure JWT session strategy (keeps current UX)
   - Add callbacks for user ID in session/token

5. Create auth utility in `lib/auth.ts`:
   - Helper to get current session server-side (`getServerSession`)
   - Wrapper function for protected API routes

6. Create middleware at `middleware.ts`:
   - Protect `/`, `/groups/*`, `/stats` routes
   - Redirect unauthenticated users to `/login`

---

**Phase 3: API Routes Migration**

7. Create Prisma singleton at `lib/prisma.ts`:
   - Serverless-friendly connection pooling pattern
   - Export shared `prisma` instance

8. Migrate auth endpoints to `app/api/auth/`:
   - `/register/route.ts` — POST: hash password, create user (from src/auth/auth.controller.ts)
   - NextAuth handles `/login` and `/me` automatically

9. Migrate pushups endpoints to `app/api/pushups/`:
   - `route.ts` — GET (list with pagination), POST (create entry)
   - `today/route.ts` — GET today's entries
   - `[id]/route.ts` — PUT, DELETE (from src/pushups/pushups.controller.ts)

10. Migrate groups endpoints to `app/api/groups/`:
    - `route.ts` — GET (list), POST (create)
    - `join/route.ts` — POST (join via invite code)
    - `[id]/route.ts` — GET details
    - `[id]/members/route.ts` — GET list, DELETE member
    - `[id]/leaderboard/route.ts` — GET with period query param
    - `[id]/leave/route.ts` — DELETE
    - Port logic from src/groups/groups.service.ts

11. Migrate stats endpoints to `app/api/stats/`:
    - `personal/route.ts` — GET personal stats
    - `group/[id]/route.ts` — GET group stats
    - Port logic from src/stats/stats.service.ts

---

**Phase 4: Frontend Migration**

12. Create shared layout at `app/layout.tsx`:
    - Add NextAuth `SessionProvider`
    - Global styles from client/src/index.css

13. Create auth pages (public):
    - `app/(auth)/login/page.tsx` — port from client/src/pages/LoginPage.tsx
    - `app/(auth)/register/page.tsx` — port from client/src/pages/RegisterPage.tsx
    - Use NextAuth's `signIn()` instead of custom API call

14. Create protected layout at `app/(protected)/layout.tsx`:
    - Server-side session check or rely on middleware

15. Migrate protected pages:
    - `app/(protected)/page.tsx` — Dashboard from client/src/pages/DashboardPage.tsx
    - `app/(protected)/groups/page.tsx` — from client/src/pages/GroupsPage.tsx
    - `app/(protected)/groups/[id]/page.tsx` — from client/src/pages/GroupDetailPage.tsx
    - `app/(protected)/stats/page.tsx` — from client/src/pages/StatsPage.tsx

16. Handle Recharts (client-only):
    - Wrap chart components with `'use client'` directive
    - Or use dynamic import: `dynamic(() => import('./Chart'), { ssr: false })`

17. Replace API service:
    - Replace axios calls from client/src/services/api.ts with native `fetch`
    - Remove token handling (NextAuth uses cookies automatically)

---

**Phase 5: Database Migration**

18. Set up Vercel Postgres:
    - Create database in Vercel dashboard (Storage → Create → Postgres)
    - Copy connection strings to `.env.local`

19. Migrate schema:
    - Run `npx prisma migrate dev` locally against Vercel Postgres
    - Verify all tables created

20. (Optional) Migrate existing data:
    - Export SQLite data, import to Postgres if needed

---

**Phase 6: Deployment**

21. Configure Vercel project:
    - Connect GitHub repo or use `vercel` CLI
    - Set environment variables: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`

22. Configure `vercel.json` (if needed):
    - Usually not required for standard Next.js

23. Deploy and test:
    - Push to main branch or run `vercel --prod`
    - Verify all routes, auth flow, and database operations

24. Clean up old code:
    - Remove `src/` (NestJS backend)
    - Remove `client/` (Vite frontend)
    - Remove NestJS dependencies from root `package.json`
    - Update root `package.json` scripts

---

### Verification

- **Auth**: Register → Login → Access protected routes → Logout
- **Pushups**: Create → List → Update → Delete → Check today's count
- **Groups**: Create → Get invite code → Join (different user) → Leaderboard → Leave
- **Stats**: View personal charts → View group charts
- **Vercel**: Check function logs, database connectivity, cold start times

---

### Decisions

- **Vercel Postgres over alternatives**: Native integration, free tier sufficient, no extra config
- **NextAuth.js over custom JWT**: Handles session management, cookies, CSRF automatically
- **App Router over Pages**: Better performance, Server Components, Vercel-recommended
- **bcryptjs over bcrypt**: Edge-compatible for potential edge runtime use
