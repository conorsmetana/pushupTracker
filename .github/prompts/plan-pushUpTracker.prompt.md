## Plan: Push-Up Tracker NestJS + React App

**TL;DR**: Build a single-repo NestJS app that serves a React frontend, using PostgreSQL via Prisma (SQLite locally for simplicity). JWT authentication with Passport.js. Phase 1 delivers user accounts and daily push-up logging. Phase 2 adds groups. Phase 3 adds charts. REST API throughout.

**Decisions made**:
- PostgreSQL everywhere (SQLite for rapid local dev, PostgreSQL in prod—both are SQL, same Prisma schema works)
- NestJS serves React as static files from `/client` build output
- JWT auth (stateless, less overhead than sessions)
- Single repo structure with npm workspaces

---

### Project Structure

```
pushupTracker/
├── src/                    # NestJS backend
│   ├── auth/               # Auth module (JWT, guards)
│   ├── users/              # User CRUD
│   ├── pushups/            # Push-up logging
│   ├── groups/             # Phase 2: Groups
│   ├── prisma/             # PrismaService
│   └── main.ts
├── client/                 # React frontend (Vite)
│   ├── src/
│   └── dist/               # Built output served by NestJS
├── prisma/
│   └── schema.prisma
├── package.json            # Root with workspaces
├── .env
└── .env.example
```

---

### Steps

**Phase 0: Project Scaffolding** ✅ COMPLETE

1. ✅ Initialize NestJS app: `npx @nestjs/cli new . --package-manager npm`
2. ✅ Create React app in `client/` using Vite: `npm create vite@latest client -- --template react-ts`
3. ✅ Configure npm workspaces in root `package.json`
4. ✅ Add Prisma and auth dependencies to root `package.json`
5. ✅ Add react-router-dom and axios to client `package.json`
6. ✅ Create Prisma schema with User, PushupEntry, Group, GroupMember models
7. ✅ Create `.env` and `.env.example` files for SQLite local dev configuration

**Phase 1A: Database Schema** ✅ COMPLETE

8. ✅ Run Prisma migration: `npx prisma migrate dev --name init`
9. ✅ Verify SQLite database created at `./dev.db`

**Phase 1B: PrismaService** ✅ COMPLETE

10. ✅ Create `src/prisma/prisma.service.ts`:
    - Extend `PrismaClient`
    - Implement `OnModuleInit` for connection
    - Implement `OnModuleDestroy` for disconnection

11. ✅ Create `src/prisma/prisma.module.ts`:
    - Mark as `@Global()`
    - Export `PrismaService`

**Phase 1C: Authentication** ✅ COMPLETE

12. ✅ Create `src/auth/` directory with:
    - `auth.module.ts`
    - `auth.service.ts` — handle registration, login, JWT generation
    - `local.strategy.ts` — username/password validation
    - `jwt.strategy.ts` — JWT token validation
    - `jwt-auth.guard.ts` — protect routes

13. ✅ Create `src/users/` directory with:
    - `users.module.ts`
    - `users.service.ts` — CRUD operations, password hashing
    - API endpoints in auth.controller.ts:
      - `POST /api/auth/register` — create new user
      - `POST /api/auth/login` — authenticate and return JWT
      - `GET /api/auth/me` — get current user (protected)
      - `PUT /api/auth/profile` — update profile (protected)

**Phase 1D: Push-Up Tracking** ✅ COMPLETE

14. ✅ Create `src/pushups/` directory with:
    - `pushups.module.ts`
    - `pushups.service.ts` — CRUD operations
    - `pushups.controller.ts` (all protected by `JwtAuthGuard`):
      - `POST /api/pushups` — log push-ups for today
      - `GET /api/pushups` — get user's push-up history (paginated)
      - `GET /api/pushups/today` — get today's count
      - `PUT /api/pushups/:id` — update entry
      - `DELETE /api/pushups/:id` — remove entry

**Phase 1E: NestJS Configuration** ✅ COMPLETE

15. ✅ Update `src/app.module.ts`:
    - Import `PrismaModule`, `AuthModule`, `UsersModule`, `PushupsModule`
    - Configure `ServeStaticModule` to serve React from `client/dist`

16. ✅ Update `src/main.ts`:
    - Enable CORS for local dev
    - Set proper middleware order

**Phase 1F: React Frontend** ✅ COMPLETE

17. ✅ Create `client/src/` structure:
    - `pages/LoginPage.tsx`
    - `pages/RegisterPage.tsx`
    - `pages/DashboardPage.tsx`
    - `contexts/AuthContext.tsx` — manage JWT token, user state
    - `services/api.ts` — axios instance with auth interceptors
    - `App.tsx` — main routing with React Router

18. ✅ Build pages:
    - **Login/Register**: Simple form, store JWT in localStorage
    - **Dashboard**: Display today's push-ups, form to log new entry, history list

19. ✅ `npm run build:client` builds React to `client/dist`

**Phase 1G: Testing** ✅ VERIFIED

20. ✅ API endpoints tested and working:
    - Register returns JWT and user
    - Login returns JWT
    - Push-up creation works with auth
    - Full build passes

---

---

**Phase 2: Groups** *(future)*

21. Create `src/groups/` directory with:
    - `groups.module.ts`
    - `groups.service.ts` — CRUD, invite code generation
    - `groups.controller.ts`:
      - `POST /groups` — create group
      - `GET /groups/:id` — get group details
      - `POST /groups/:id/join` — join group by invite code
      - `GET /groups/:id/members` — list members
      - `GET /groups/:id/leaderboard` — aggregate push-ups by user for period (today/week/month)
      - `DELETE /groups/:id/members/:memberId` — leave group

22. Update database schema:
    - Already added `Group` and `GroupMember` models
    - Run migration: `npx prisma migrate dev --name add_groups`

23. Build React pages:
    - `pages/GroupsPage.tsx` — list user's groups, create new
    - `pages/GroupDetailPage.tsx` — view group leaderboard
    - Add group UI to Dashboard

**Phase 3: Charts** *(future)*

24. Add chart library: `npm install recharts` (or chart.js)

25. Create `src/stats/` directory:
    - `stats.controller.ts`:
      - `GET /stats/personal` — aggregate personal push-ups (daily/weekly/monthly totals)
      - `GET /stats/group/:id` — aggregate group member stats

26. Build React pages:
    - `pages/StatsPage.tsx` — personal charts (line: over time, bar: by week)
    - Add stats to group detail page

---

**Verification Checklist**

- **Phase 0 complete?**
  - [ ] `npm install` succeeds with workspaces
  - [ ] `client/` has Vite config and React boilerplate
  - [ ] `prisma/schema.prisma` has all models
  - [ ] `.env` file with `DATABASE_URL` set to SQLite

- **Phase 1 local dev test**:
  - [ ] `npx prisma migrate dev --name init` creates `dev.db`
  - [ ] `npm run start:dev` starts NestJS on port 3000
  - [ ] `npm -w client run dev` starts React on port 5173 (dev server)
  - [ ] Register endpoint works: `POST /api/auth/register` → returns JWT
  - [ ] Login endpoint works: `POST /api/auth/login` → returns JWT
  - [ ] Protected endpoint works: `GET /api/auth/me` with Authorization header → returns user
  - [ ] Log push-ups: `POST /api/pushups` → saved to database
  - [ ] Retrieve history: `GET /api/pushups` → returns user's entries
  - [ ] React Dashboard displays and updates data

- **Production readiness test**:
  - [ ] Set `DATABASE_URL` to PostgreSQL conn string
  - [ ] Run `npx prisma migrate deploy`
  - [ ] Same auth/pushup flows work with PostgreSQL
  - [ ] `npm run build` builds both client and NestJS
  - [ ] `npm run start:prod` runs single server on port 3000
  - [ ] React UI accessible at `http://localhost:3000`
  - [ ] API accessible at `http://localhost:3000/api/*`

---

**Decisions**
- PostgreSQL/SQLite over MongoDB: same Prisma schema works for both, simpler local setup
- JWT over sessions: no server-side session storage needed
- NestJS serves React: one deployment target, simpler devops
- npm workspaces: unified dependency management, easier to share types later
- Vite for React: fast builds, modern tooling
- SQLite file-based (`dev.db`) for local: simpler than Docker, no setup overhead
