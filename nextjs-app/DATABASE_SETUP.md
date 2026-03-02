# Database Setup Guide

This project uses **SQLite for local development** and **PostgreSQL for production**.

## Local Development Setup

### Quick Start
1. The SQLite database is automatically initialized when you run Prisma migrations:
   ```bash
   npm run prisma:migrate
   # or
   npx prisma migrate dev
   ```

2. The database file will be created at `prisma/dev.db` (automatically git-ignored)

3. Start the dev server:
   ```bash
   npm run dev
   ```

### Environment Variables
Local development uses `.env` or `.env.local`:
```env
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="dev-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### Viewing Data
Use Prisma Studio to browse the database:
```bash
npm run prisma:studio
```

---

## Production Deployment (PostgreSQL)

### Prerequisites
- Vercel Postgres database (or any PostgreSQL server)
- Connection strings (DATABASE_URL and DIRECT_URL)

### Setup Process

1. **Update `prisma/schema.prisma`** for PostgreSQL:
   ```prisma
   datasource db {
     provider  = "postgresql"
     url       = env("DATABASE_URL")
     directUrl = env("DIRECT_URL")
   }
   ```

2. **Set environment variables** in Vercel/production:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"
   DIRECT_URL="postgresql://user:password@host:5432/dbname?schema=public"
   NEXTAUTH_SECRET="<generate-with: openssl rand -base64 32>"
   NEXTAUTH_URL="https://yourdomain.com"
   ```

3. **Create a migration** for PostgreSQL:
   ```bash
   npx prisma migrate deploy
   # or if modifying schema
   npx prisma migrate dev --name migration_name
   ```

4. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

---

## Switching Databases Temporarily

### From SQLite → PostgreSQL (for testing)
```bash
# Update schema.prisma to PostgreSQL provider
# Update DATABASE_URL and DIRECT_URL in .env.local
npx prisma migrate deploy  # or migrate dev
npm run dev
```

### From PostgreSQL → SQLite
```bash
# Update schema.prisma back to SQLite provider
# Update DATABASE_URL to file:./prisma/dev.db in .env.local
npx prisma migrate dev --name init  # creates new migration
npm run dev
```

---

## Available Scripts
- `npm run dev` - Start Next.js dev server
- `npm run build` - Build production bundle
- `npm run prisma:generate` - Regenerate Prisma client
- `npm run prisma:migrate` - Run migrations (interactive)
- `npm run prisma:studio` - Open Prisma Studio GUI

---

## Troubleshooting

### "Can't reach database server"
- Check that SQLite file path is correct: `file:./prisma/dev.db`
- Or verify PostgreSQL connection string format
- Run `npx prisma migrate reset` to reinitialize (⚠️ deletes data)

### "Environment variable not found: DATABASE_URL"
- Ensure `.env` or `.env.local` exists in the `nextjs-app` directory
- Prisma uses `.env` or `.env.local` automatically
- Check .gitignore doesn't exclude `.env` (it shouldn't, locals are ignored by `.*`)

### Prisma Client out of sync
```bash
npx prisma generate
```

---

## Notes
- SQLite is simpler for local dev but not recommended for production
- PostgreSQL with Vercel is recommended for production due to scaling and availability
- Migrations are automatically tracked in `prisma/migrations/`
- The dev database (`dev.db`) is git-ignored and won't be committed
