# [TASK-005] Configure Vercel Deployment Setup

**Status:** COMPLETED
**Phase:** Setup & Infrastructure
**Priority:** P1 (Important)
**Estimated Effort:** S (2-4 hours)
**Branch:** `task/005-vercel-config`

## Dependencies
- TASK-001 (Next.js project initialized)
- TASK-003 (Prisma ORM set up)
- TASK-006 (Prisma schema designed)

## Description
Configure the project for deployment on Vercel with a production PostgreSQL database. Set up environment variables, build scripts, and migration strategy to ensure smooth deployments. This enables continuous deployment and validates that the stack works in production.

## Acceptance Criteria
- [ ] Vercel project created and configured
- [ ] Production database selected and provisioned (Vercel Postgres or Neon)
- [ ] Environment variables configured in Vercel
- [ ] Build script includes Prisma Client generation
- [ ] Migration strategy defined and tested
- [ ] Successful test deployment to Vercel
- [ ] Database migrations run successfully in production
- [ ] Application accessible via Vercel URL
- [ ] Documentation updated with deployment instructions

## Implementation Approach

### Production Database Options

**Option A: Vercel Postgres (RECOMMENDED)**
- **Pros:**
  - Seamless integration with Vercel
  - Automatic connection pooling
  - Built-in backups
  - Same dashboard as app deployment
  - Free tier available (256 MB storage, 60 compute hours/month)
- **Cons:**
  - Vendor lock-in to Vercel
  - Limited free tier
  - Not available in all regions

**Option B: Neon (Alternative)**
- **Pros:**
  - Generous free tier (3 GB storage, unlimited projects)
  - Serverless PostgreSQL (pay for compute only)
  - Branch databases (great for preview deployments)
  - Good for development and production
  - Independent from deployment platform
- **Cons:**
  - Separate dashboard to manage
  - Cold starts on free tier
  - Need to configure connection pooling separately

**Option C: Supabase**
- **Pros:**
  - Very generous free tier (500 MB database, 2 GB bandwidth)
  - Additional features (auth, storage, real-time)
  - Good documentation
- **Cons:**
  - Overkill if only using PostgreSQL
  - More complex setup

**Recommendation:** **Vercel Postgres** for simplicity and Vercel integration. If you need more free tier resources or want platform independence, use **Neon**.

### Vercel Configuration Files

#### vercel.json (Optional - if needed)

```json
{
  "buildCommand": "prisma generate && prisma migrate deploy && next build",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "DATABASE_URL": "@database-url"
  }
}
```

**Note:** Vercel auto-detects Next.js projects, so this file is often not needed unless you need custom configuration.

#### .vercelignore

```
# Vercel ignore file
.env
.env.local
.env*.local
.git
node_modules
.next
.vscode
*.log
```

### Environment Variables Strategy

**Local Development (.env.local):**
```env
DATABASE_URL="postgresql://loanly:loanly_dev_password@localhost:5432/loanly_db?schema=public"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Production (Vercel Environment Variables):**
```env
DATABASE_URL="[Vercel Postgres or Neon connection string]"
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
DIRECT_URL="[Direct connection string if using connection pooling]"
```

**Important:** Vercel Postgres provides two connection strings:
- `POSTGRES_URL`: Pooled connection (use for Prisma in serverless)
- `POSTGRES_URL_NON_POOLING`: Direct connection (use for migrations)

### Build Configuration

Update `package.json` build script:

```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

**Why two build scripts?**
- `build`: For local builds (no migrations)
- `vercel-build`: Vercel uses this automatically, includes migrations

### Migration Strategy

**Approach 1: Run migrations in build step (RECOMMENDED for MVP)**
```json
"vercel-build": "prisma generate && prisma migrate deploy && next build"
```

**Pros:**
- Automatic migrations on every deploy
- Simple setup
- No manual intervention

**Cons:**
- Builds fail if migrations fail
- No rollback strategy
- Can't test migrations before traffic hits them

**Approach 2: Manual migrations before deploy**
```bash
# Run migrations manually before deploying
npx prisma migrate deploy

# Then deploy without migrations
npm run build
```

**Pros:**
- More control
- Can verify migrations before deploy
- Safer for complex migrations

**Cons:**
- Manual step required
- Easy to forget

**Recommendation:** Use Approach 1 for MVP. Switch to Approach 2 when you have more complex migrations or need zero-downtime deployments.

### Connection Pooling Configuration

For Vercel Postgres with connection pooling, update `prisma/schema.prisma`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")      // Pooled connection for queries
  directUrl = env("DIRECT_URL")        // Direct connection for migrations
}
```

**When to use connection pooling:**
- Serverless environments (like Vercel)
- High number of concurrent requests
- Limited database connections

**Vercel Postgres automatically provides both URLs:**
- `POSTGRES_URL` → `DATABASE_URL`
- `POSTGRES_URL_NON_POOLING` → `DIRECT_URL`

## Step-by-Step Implementation

### 1. Create Vercel Project

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Link project to Vercel (run from project root)
vercel link
```

Alternatively, connect via Vercel dashboard:
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Select the repository
5. Vercel auto-detects Next.js and configures build settings

### 2. Set Up Production Database

**If using Vercel Postgres:**

1. In Vercel dashboard, go to your project
2. Click "Storage" tab
3. Click "Create Database"
4. Select "Postgres"
5. Choose database name (e.g., `loanly-db`)
6. Select region (choose closest to your users)
7. Vercel automatically adds these environment variables:
   - `POSTGRES_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `POSTGRES_USER`
   - `POSTGRES_HOST`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DATABASE`

**If using Neon:**

1. Go to https://neon.tech
2. Create account and project
3. Create database (e.g., `loanly-db`)
4. Copy connection string
5. Add to Vercel environment variables manually:
   - `DATABASE_URL` = [Neon pooled connection string]
   - `DIRECT_URL` = [Neon direct connection string]

### 3. Configure Environment Variables

In Vercel dashboard:

1. Go to Project Settings → Environment Variables
2. Add variables for all environments (Production, Preview, Development)

**Required Variables:**

```
DATABASE_URL = [From Vercel Postgres or Neon]
DIRECT_URL = [Direct connection URL for migrations]
NEXT_PUBLIC_APP_URL = https://[your-project].vercel.app
```

**Optional Variables:**

```
NODE_ENV = production (usually auto-set by Vercel)
```

### 4. Update Prisma Schema

If using connection pooling:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

If NOT using connection pooling (single connection string):

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 5. Update package.json

```json
{
  "scripts": {
    "dev": "node scripts/ensure-docker.js && npm run db:ensure && next dev",
    "build": "prisma generate && next build",
    "vercel-build": "prisma generate && prisma migrate deploy && next build",
    "start": "next start",
    "lint": "next lint",
    // ... rest of scripts
  }
}
```

### 6. Create .vercelignore

```
# Local environment files
.env
.env.local
.env*.local

# Git
.git
.gitignore

# Dependencies
node_modules

# Next.js
.next
out

# IDE
.vscode
.idea

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS
.DS_Store

# Docker (not needed in production)
docker-compose.yml
.dockerignore

# Task management (optional - depends if you want to deploy docs)
# .tasks

# Scripts (dev only)
scripts/ensure-docker.js
```

### 7. Test Local Build

Before deploying, test the production build locally:

```bash
# Generate Prisma Client
npm run db:generate

# Build the app
npm run build

# Start production server
npm run start
```

### 8. Deploy to Vercel

**Option A: Git-based deployment (RECOMMENDED)**

```bash
# Commit all changes
git add .
git commit -m "[TASK-005] Configure Vercel deployment"

# Push to GitHub (triggers automatic Vercel deployment)
git push origin main
```

**Option B: CLI deployment**

```bash
# Deploy to production
vercel --prod

# Or deploy to preview
vercel
```

### 9. Run Migrations in Production

If not using `vercel-build` script with migrations:

```bash
# Set DATABASE_URL to production database
export DATABASE_URL="[production database URL]"

# Run migrations
npx prisma migrate deploy

# Or use Vercel CLI
vercel env pull .env.production
npx prisma migrate deploy
```

### 10. Verify Deployment

1. Visit your Vercel URL
2. Check that the application loads
3. Verify database connection:
   - Try accessing any page that queries the database
   - Check Vercel logs for any database errors

## Testing Requirements

- [ ] Application builds successfully locally
- [ ] Application deploys to Vercel without errors
- [ ] Production database is accessible from Vercel
- [ ] Migrations run successfully in production
- [ ] Environment variables are correctly set
- [ ] Application loads at Vercel URL
- [ ] Database queries work in production
- [ ] No errors in Vercel deployment logs

## Troubleshooting

### Build Fails: "Can't reach database server"

**Cause:** DATABASE_URL not set or incorrect in Vercel environment variables

**Solution:**
1. Check Vercel dashboard → Environment Variables
2. Verify DATABASE_URL is set for Production environment
3. Redeploy

### Error: "P1001: Can't reach database server"

**Cause:** Vercel can't connect to database

**Solution:**
- If using Vercel Postgres: Check database is running in Vercel dashboard
- If using Neon: Verify connection string is correct and IP allowlist is configured (Neon allows all IPs by default)
- Check if you need connection pooling (use `POSTGRES_URL` not `POSTGRES_URL_NON_POOLING` for queries)

### Migration Fails: "Migration engine error"

**Cause:** Using pooled connection for migrations

**Solution:**
1. Add `directUrl = env("DIRECT_URL")` to schema.prisma
2. Set `DIRECT_URL` environment variable to non-pooled connection
3. Redeploy

### Build Takes Too Long / Times Out

**Cause:** Migrations running during build taking too long

**Solution:**
- Run complex migrations manually before deploying
- Use `vercel-build` script without migrations for deploy
- Consider using database backup/restore for large data migrations

## Deployment Workflow

### For Future Deployments

1. **Make changes locally**
   ```bash
   # Work on feature branch
   git checkout -b feature/my-feature
   ```

2. **Test locally**
   ```bash
   npm run dev
   npm run build
   ```

3. **Create migration if database changed**
   ```bash
   npm run db:migrate
   # Name migration descriptively
   ```

4. **Commit and push**
   ```bash
   git add .
   git commit -m "[TASK-XXX] Feature description"
   git push origin feature/my-feature
   ```

5. **Create Pull Request**
   - Vercel automatically creates preview deployment
   - Review preview deployment before merging

6. **Merge to main**
   - Vercel automatically deploys to production
   - Migrations run automatically via `vercel-build` script

## Post-Deployment

### Configure Custom Domain (Optional)

1. Go to Vercel Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` environment variable

### Set Up Monitoring (Optional)

1. Vercel provides built-in analytics
2. Enable Web Analytics in Project Settings
3. Monitor deployment logs for errors

### Database Backups

**Vercel Postgres:**
- Automatic daily backups on paid plans
- Point-in-time recovery available

**Neon:**
- Automatic backups
- Branch databases for testing

## Documentation Updates

### README.md

Add deployment section:

```markdown
## Deployment

This project is deployed on [Vercel](https://vercel.com).

**Live URL:** https://your-app.vercel.app

### Deploying Changes

1. Push to `main` branch for production deployment
2. Push to any feature branch for preview deployment
3. Vercel automatically runs migrations during deployment

### Manual Deployment

\`\`\`bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod
\`\`\`
```

## Pre-Implementation Discussion

1. **Database choice:**
   - Vercel Postgres (seamless integration) vs Neon (more free tier)
   - **Recommendation:** Vercel Postgres for simplicity

2. **Migration strategy:**
   - Automatic in build step vs manual before deploy
   - **Recommendation:** Automatic for MVP

3. **Preview deployments:**
   - Should preview deployments use production database or separate?
   - **Recommendation:** Separate preview database (Vercel creates automatically)

4. **Environment variables:**
   - Which variables need to be set?
   - Should we use different values for preview vs production?

5. **Seed data in production:**
   - Should we seed production database?
   - **Recommendation:** No, only seed local dev database

## Next Steps

After deployment is configured:
- TASK-008: Build Zod validation schemas
- TASK-009: Implement Loan CRUD Server Actions
- Continue with Phase 2: Database & API Layer tasks

## References
- [Vercel Deployment Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [Neon Documentation](https://neon.tech/docs/introduction)
