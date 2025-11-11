# [TASK-003] Set Up Prisma ORM with Initial Configuration

**Status:** COMPLETED
**Phase:** Setup
**Priority:** P0 (Critical)
**Estimated Effort:** M (4-6 hours)
**Branch:** `task/003-prisma-setup`

## Dependencies

- TASK-001 (Next.js project initialized)
- TASK-002 (PostgreSQL running in Docker)

## Description

Install and configure Prisma ORM as the database access layer. Set up basic infrastructure for migrations, schema management, and database client instantiation. This task focuses on **tooling setup only** - the actual schema design happens in TASK-006.

## Acceptance Criteria

- [ ] Prisma CLI installed as dev dependency
- [ ] Prisma Client installed as dependency
- [ ] Prisma initialized with PostgreSQL provider
- [ ] Database connection working
- [ ] Prisma Client singleton instance created
- [ ] Prisma Studio accessible
- [ ] Scripts added for common Prisma operations
- [ ] TypeScript types generated successfully
- [ ] Initial migration infrastructure ready
- [ ] Documentation created for Prisma workflows

## Implementation Approach

### Installation Steps

1. **Install Prisma dependencies**

   ```bash
   npm install @prisma/client
   npm install -D prisma
   ```

2. **Initialize Prisma**

   ```bash
   npx prisma init
   ```

   This creates:
   - `prisma/schema.prisma` - Schema definition file
   - `.env` update - Adds DATABASE_URL

3. **Configure Prisma Client singleton**
   - Create `lib/db.ts` for client instance
   - Prevents multiple instances in development (hot reload issue)

4. **Set up Prisma scripts**
   - Add npm scripts for migrations, studio, etc.

5. **Test connection**
   ```bash
   npx prisma db push
   ```

## Tradeoffs & Alternatives

### ORM Choice: Prisma vs Alternatives

- **Chosen:** Prisma
- **Why:**
  - Type-safe queries
  - Excellent TypeScript support
  - Great DX with Prisma Studio
  - Migration system built-in
  - Auto-generated types
- **Alternatives:**
  - **Drizzle ORM:** Lighter, more SQL-like, newer
  - **TypeORM:** More traditional, Java-like decorators
  - **Kysely:** Query builder, not full ORM
- **Tradeoff:** Prisma is heavier but provides best type safety and DX

### Prisma Client Instantiation

- **Chosen:** Singleton pattern with global augmentation
- **Why:** Prevents multiple instances during Next.js hot reload
- **Alternative:** Direct instantiation (causes connection pool issues in dev)
- **Tradeoff:** Slightly more boilerplate, but required for Next.js

### Migration Strategy

- **Chosen:** Prisma Migrate (not db push for production)
- **Why:** Version-controlled migrations, safe for production
- **Alternative:** `prisma db push` (good for prototyping, not production)
- **Tradeoff:** Migrations require more discipline but provide safety

## Project Structure Updates

```
loanly-love-nextjs/
├── prisma/
│   ├── schema.prisma            # NEW: Database schema
│   └── migrations/              # NEW: Migration files (created by Prisma)
├── lib/
│   ├── db.ts                    # NEW: Prisma Client singleton
│   └── utils.ts                 # (existing)
└── docs/
    └── PRISMA_GUIDE.md          # NEW: Prisma usage guide
```

## Configuration Files

### prisma/schema.prisma (initial setup)

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Models will be added in TASK-006
// For now, this is just the basic setup
```

### lib/db.ts (Prisma Client Singleton)

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
```

**Why this pattern?**

- In development, Next.js hot reload would create new PrismaClient instances
- This causes connection pool exhaustion
- Global singleton prevents this issue
- In production, this pattern is harmless (only one instance anyway)

### package.json scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",

    // Database scripts
    "db:up": "docker-compose up -d postgres",
    "db:down": "docker-compose down",
    "db:reset": "docker-compose down -v && docker-compose up -d postgres && npm run db:push",

    // Prisma scripts
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:migrate:prod": "prisma migrate deploy",
    "db:studio": "prisma studio",
    "db:generate": "prisma generate",
    "db:seed": "tsx prisma/seed.ts",
    "postinstall": "prisma generate"
  }
}
```

### .env.local updates

```env
# Database URL (already set in TASK-002)
DATABASE_URL="postgresql://loanly:loanly_dev_password_change_in_production@localhost:5432/loanly_db?schema=public"

# Optional: Prisma logging
# DATABASE_LOG_LEVEL="info"
```

## Prisma Workflows

### Development Workflow

```bash
# 1. Start database
npm run db:up

# 2. Make schema changes in prisma/schema.prisma

# 3. Create migration
npm run db:migrate
# Prompts for migration name, e.g., "add_loans_table"

# 4. Prisma Client types are auto-generated

# 5. Use in code:
# import { prisma } from '@/lib/db'
```

### Prototyping Workflow (faster, no migrations)

```bash
# Push schema directly (no migration files)
npm run db:push

# Good for rapid iteration, but don't use in production
```

### Viewing Data

```bash
# Open Prisma Studio (visual database browser)
npm run db:studio

# Opens at http://localhost:5555
```

## Testing Requirements

- [ ] Prisma CLI installed: `npx prisma --version`
- [ ] Database connection successful: `npx prisma db pull`
- [ ] Prisma Client generated: `npx prisma generate`
- [ ] Can import Prisma Client: `import { prisma } from '@/lib/db'`
- [ ] Prisma Studio opens: `npm run db:studio`
- [ ] TypeScript recognizes Prisma types
- [ ] All npm scripts run without errors

## Deployment Considerations

### Local Development

- Use `prisma migrate dev` for schema changes
- Prisma Studio for debugging
- Hot reload works without connection issues

### CI/CD (GitHub Actions, etc.)

```yaml
# In CI, generate Prisma Client before build
- name: Generate Prisma Client
  run: npm run db:generate

- name: Run Migrations
  run: npm run db:migrate:prod
```

### Production (Vercel)

1. **DATABASE_URL** set in Vercel environment variables
2. **Build command:** Prisma Client generated automatically via `postinstall` script
3. **Migrations:** Run `prisma migrate deploy` in build step or manually
   - Vercel doesn't run migrations automatically
   - Need to run before deploy or use deployment script

**Recommended Approach for Vercel:**

```json
// package.json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

**Alternative:** Use Vercel's database migration tools or run migrations manually before deploy.

## Documentation

### docs/PRISMA_GUIDE.md

```markdown
# Prisma Development Guide

## Quick Reference

### Common Commands

\`\`\`bash

# Generate Prisma Client (after schema changes)

npm run db:generate

# Create and apply migration

npm run db:migrate

# Push schema without migration (dev only)

npm run db:push

# Open Prisma Studio

npm run db:studio

# Reset database (WARNING: deletes all data)

npm run db:reset
\`\`\`

## Making Schema Changes

1. Edit `prisma/schema.prisma`
2. Run `npm run db:migrate`
3. Name your migration descriptively
4. Prisma Client types update automatically

## Using Prisma Client

\`\`\`typescript
import { prisma } from '@/lib/db'

// Example query
const loans = await prisma.loan.findMany({
where: { status: 'ACTIVE' },
include: { payments: true }
})
\`\`\`

## Troubleshooting

### "Prisma Client is not generated"

Run: `npm run db:generate`

### "Can't reach database"

Ensure Docker container is running: `npm run db:up`

### Too many database connections

Restart Next.js dev server

### Migration conflicts

Reset database: `npm run db:reset` (dev only!)
```

## Pre-Implementation Discussion Points

1. **Prisma Client logging in development**
   - Current: Log queries, errors, and warnings
   - Should we log all queries for debugging?
   - **Tradeoff:** Verbose logs vs easier debugging

2. **Migration strategy**
   - **Option A:** Use `migrate dev` always (recommended)
   - **Option B:** Use `db push` for rapid prototyping, migrate later
   - **Recommendation:** Option A for discipline, but Option B is faster

3. **Prisma Studio in production**
   - Currently disabled
   - Should we enable for production debugging?
   - **Recommendation:** No, use proper admin tools or direct SQL

4. **Seed data**
   - Should we create seed script now or in TASK-007?
   - **Recommendation:** TASK-007 (after schema is designed)

5. **TypeScript strict mode with Prisma**
   - Prisma types are always strict
   - Should we enable `strictNullChecks` in tsconfig?
   - **Recommendation:** Yes, Prisma works best with strict mode

## Next Steps

After this task:

- TASK-006: Design complete Prisma schema
- TASK-007: Create seed data
- TASK-009: Implement Server Actions using Prisma Client

## References

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma with Next.js Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- PRD Section 6.1: Tech Stack
- PRD Section 8: Data Model
