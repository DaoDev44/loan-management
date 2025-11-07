# [TASK-002] Configure Docker + PostgreSQL for Local Development

**Status:** NOT_STARTED
**Phase:** Setup
**Priority:** P0 (Critical)
**Estimated Effort:** M (4-6 hours)
**Branch:** `task/002-docker-postgres`

## Dependencies
- TASK-001 (Next.js project must be initialized)

## Description
Set up Docker Compose with PostgreSQL for local development, ensuring easy onboarding for new developers and consistent development environments. This setup is for **local development only** - production will use managed PostgreSQL services.

## Acceptance Criteria
- [ ] Docker Compose configuration created
- [ ] PostgreSQL 16 container configured
- [ ] Database credentials managed via environment variables
- [ ] Volume persistence configured for data
- [ ] Health checks implemented
- [ ] `docker-compose up` starts database successfully
- [ ] Database accessible from Next.js app
- [ ] README documentation for Docker setup
- [ ] `.dockerignore` file created
- [ ] Scripts added for common operations

## Implementation Approach

### Docker Compose Setup

**Core Services:**
1. **PostgreSQL Database**
   - Version: PostgreSQL 16 (latest stable)
   - Port: 5432 (mapped to host)
   - Volume: `postgres_data` for persistence
   - Health check: `pg_isready`

**Optional Services (discuss):**
2. **pgAdmin** (PostgreSQL GUI)
   - Useful for debugging
   - Port: 5050
   - Trade-off: More containers, but better DX

3. **Redis** (future caching)
   - Not needed for MVP
   - Can add later if needed

**Recommendation:** Start with PostgreSQL only, add pgAdmin if needed for debugging.

## Tradeoffs & Alternatives

### PostgreSQL Version
- **Chosen:** PostgreSQL 16
- **Why:** Latest stable, best performance, modern features
- **Alternative:** PostgreSQL 15 (more mature, equally good choice)
- **Tradeoff:** Minimal - both versions work great for this use case

### Volume Strategy
- **Chosen:** Named volume (`postgres_data`)
- **Why:** Persists data across container restarts, managed by Docker
- **Alternative:** Bind mount to local directory
- **Tradeoff:** Named volumes are cleaner but less visible in file system

### Environment Variable Management
- **Chosen:** `.env.local` file (git-ignored) + `.env.example` (committed)
- **Why:** Standard Next.js pattern, secure, easy for new devs
- **Alternative:** Separate `docker.env` file
- **Tradeoff:** Using `.env.local` means one file for both Next.js and Docker

### Database Initialization
- **Chosen:** Let Prisma handle schema creation (via migrations)
- **Why:** Single source of truth, version controlled, repeatable
- **Alternative:** SQL init scripts in Docker
- **Tradeoff:** More reliance on Prisma, but better long-term

## Docker Compose Configuration

### docker-compose.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: loanly-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-loanly}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-loanly_dev_password}
      POSTGRES_DB: ${POSTGRES_DB:-loanly_db}
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-loanly}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - loanly-network

  # Optional: Uncomment if you want a database GUI
  # pgadmin:
  #   image: dpage/pgadmin4:latest
  #   container_name: loanly-pgadmin
  #   restart: unless-stopped
  #   environment:
  #     PGADMIN_DEFAULT_EMAIL: ${PGADMIN_EMAIL:-admin@loanly.local}
  #     PGADMIN_DEFAULT_PASSWORD: ${PGADMIN_PASSWORD:-admin}
  #   ports:
  #     - "${PGADMIN_PORT:-5050}:80"
  #   depends_on:
  #     - postgres
  #   networks:
  #     - loanly-network

volumes:
  postgres_data:
    driver: local

networks:
  loanly-network:
    driver: bridge
```

### .env.local (git-ignored)
```env
# Database Configuration
POSTGRES_USER=loanly
POSTGRES_PASSWORD=loanly_dev_password_change_in_production
POSTGRES_DB=loanly_db
POSTGRES_PORT=5432

# Database URL for Prisma
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public"

# Or use direct connection string:
# DATABASE_URL="postgresql://loanly:loanly_dev_password_change_in_production@localhost:5432/loanly_db?schema=public"

# pgAdmin (optional)
# PGADMIN_EMAIL=admin@loanly.local
# PGADMIN_PASSWORD=admin
# PGADMIN_PORT=5050
```

### .env.example (committed to git)
```env
# Database Configuration
POSTGRES_USER=loanly
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=loanly_db
POSTGRES_PORT=5432

# Database URL for Prisma (copy to .env.local and update credentials)
DATABASE_URL="postgresql://loanly:your_secure_password_here@localhost:5432/loanly_db?schema=public"

# Optional: pgAdmin GUI for database management
# PGADMIN_EMAIL=admin@loanly.local
# PGADMIN_PASSWORD=admin
# PGADMIN_PORT=5050
```

### .dockerignore
```
node_modules
.next
.git
.env.local
.env*.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
.vscode
.idea
coverage
dist
build
```

## Project Structure Updates
```
loanly-love-nextjs/
├── docker-compose.yml           # NEW
├── .dockerignore                # NEW
├── .env.local                   # NEW (git-ignored)
├── .env.example                 # NEW (committed)
├── scripts/
│   ├── db-up.sh                 # NEW: Start database
│   ├── db-down.sh               # NEW: Stop database
│   └── db-reset.sh              # NEW: Reset database
└── docs/
    └── DOCKER_SETUP.md          # NEW: Docker documentation
```

## Helper Scripts

### package.json scripts
```json
{
  "scripts": {
    "db:up": "docker-compose up -d postgres",
    "db:down": "docker-compose down",
    "db:logs": "docker-compose logs -f postgres",
    "db:reset": "docker-compose down -v && docker-compose up -d postgres"
  }
}
```

### scripts/db-up.sh (convenience script)
```bash
#!/bin/bash
echo "🚀 Starting PostgreSQL database..."
docker-compose up -d postgres
echo "⏳ Waiting for database to be ready..."
sleep 3
docker-compose logs postgres
echo "✅ Database is running!"
echo "   Connection: postgresql://localhost:5432/loanly_db"
```

## Testing Requirements
- [ ] `docker-compose up -d` starts PostgreSQL successfully
- [ ] Database is accessible at `localhost:5432`
- [ ] Can connect using `psql`:
  ```bash
  psql -h localhost -U loanly -d loanly_db
  ```
- [ ] Health check passes: `docker-compose ps` shows "healthy"
- [ ] Data persists after container restart
- [ ] `docker-compose down` stops cleanly
- [ ] `npm run db:up` and `npm run db:down` work correctly

## Deployment Considerations

### Local Development (Docker)
- Database runs in container
- Data persists locally
- Easy to reset/rebuild

### Production (Vercel Deployment)
Docker is **NOT used**. Instead, use managed PostgreSQL:

**Recommended Options:**
1. **Vercel Postgres** (easiest)
   - Integrated with Vercel
   - Automatic connection string injection
   - Based on Neon

2. **Neon** (recommended for MVP)
   - Generous free tier
   - Serverless PostgreSQL
   - Great performance
   - Branch databases for preview deployments

3. **Supabase**
   - PostgreSQL + additional features
   - Good free tier
   - REST API included

4. **Railway**
   - Simple setup
   - Good developer experience

**Environment Variables in Production:**
```env
# Set these in Vercel dashboard:
DATABASE_URL="postgresql://user:pass@provider.com:5432/db?sslmode=require"
```

## Documentation

### docs/DOCKER_SETUP.md
```markdown
# Docker Development Setup

## Prerequisites
- Docker Desktop installed
- Docker Compose installed (included with Docker Desktop)

## Quick Start

1. Copy environment template:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

2. Update `.env.local` with your local database credentials (or use defaults)

3. Start database:
   \`\`\`bash
   npm run db:up
   # or
   docker-compose up -d
   \`\`\`

4. Verify database is running:
   \`\`\`bash
   docker-compose ps
   \`\`\`

5. View logs:
   \`\`\`bash
   npm run db:logs
   \`\`\`

## Common Operations

### Stop database
\`\`\`bash
npm run db:down
\`\`\`

### Reset database (WARNING: deletes all data)
\`\`\`bash
npm run db:reset
\`\`\`

### Connect with psql
\`\`\`bash
psql -h localhost -U loanly -d loanly_db
\`\`\`

## Troubleshooting

### Port 5432 already in use
Another PostgreSQL instance is running. Stop it or change port in `.env.local`.

### Permission denied
Docker daemon not running. Start Docker Desktop.

### Database not ready
Wait a few seconds after `docker-compose up` for initialization.
```

## Pre-Implementation Discussion Points

1. **Should we include pgAdmin in the initial setup?**
   - **Pro:** Visual database management, easier debugging
   - **Con:** Extra container, more resources
   - **Recommendation:** Include but commented out, easy to enable

2. **Database credentials for development**
   - Current approach: Simple/insecure (acceptable for local dev)
   - Should we use stronger defaults? (probably overkill for local)

3. **PostgreSQL version**
   - PostgreSQL 16 (latest) vs 15 (more mature)
   - Both work perfectly, minimal difference

4. **Should we add Redis now for future caching?**
   - **Recommendation:** No, add when needed (YAGNI principle)

5. **Alpine vs standard PostgreSQL image?**
   - **Chosen:** Alpine (smaller, faster)
   - **Tradeoff:** Very minimal, Alpine is battle-tested

## References
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Prisma + Docker Guide](https://www.prisma.io/docs/guides/development-environment/environment-variables)
- PRD Section 6.1: Tech Stack
