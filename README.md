# Loan Management Platform

A modern, professional loan management platform built with Next.js 14, TypeScript, and PostgreSQL.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (Strict mode)
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** PostgreSQL + Prisma ORM
- **Validation:** Zod
- **Forms:** React Hook Form
- **Animation:** Framer Motion
- **Toast Notifications:** Sonner

## Getting Started

### Prerequisites

- Node.js 18+
- Docker Desktop (for local database)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd loan-management-platform
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   The default values in `.env.local` are configured for local development. You can use them as-is or customize if needed.

4. **Start Docker Desktop**

   Make sure Docker Desktop is running. The development server will automatically start the PostgreSQL database.

5. **Start development server**

   ```bash
   npm run dev
   ```

   This command will:
   - Check if Docker is running
   - Start the PostgreSQL database automatically
   - Launch the Next.js development server

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Management

The project includes convenient scripts for managing the local PostgreSQL database:

```bash
# Start database (automatically done by npm run dev)
npm run db:up

# Stop database
npm run db:down

# View database logs
npm run db:logs

# Check database status
npm run db:status

# Reset database (⚠️ WARNING: Deletes all data)
npm run db:reset
```

### Prisma ORM

The project uses Prisma as the database ORM. Here are the key commands:

```bash
# Generate Prisma Client (after schema changes)
npm run db:generate

# Push schema changes to database (dev only, no migrations)
npm run db:push

# Create and apply migrations (recommended for production)
npm run db:migrate

# Seed the database with sample data
npm run db:seed

# Open Prisma Studio (visual database browser)
npm run db:studio
```

**Seed Data:** The database includes sample loans and payments for testing. Run `npm run db:seed` to populate the database with 8 loans (various statuses and types) and 50 payments.

**Prisma Studio** provides a web interface to view and edit database data at [http://localhost:5555](http://localhost:5555).

### Optional: Enable pgAdmin

To use pgAdmin (a web-based database GUI):

1. Open `docker-compose.yml`
2. Uncomment the `pgadmin` service
3. Run `npm run db:up`
4. Access pgAdmin at [http://localhost:5050](http://localhost:5050)
   - Email: `admin@loanly.local`
   - Password: `admin`

Alternatively, you can use [Postico](https://eggerapps.at/postico/) or [TablePlus](https://tableplus.com/) to connect to:

- Host: `localhost`
- Port: `5432`
- Database: `loanly_db`
- User: `loanly`
- Password: See `.env.local` or `docker-compose.yml`

## Project Status

**Current Phase:** Core Features Development

See `.tasks/MASTER_TASK_LIST.md` for complete task breakdown and progress.

### Completed Tasks

**Phase 1: Setup & Infrastructure (4/5 - 80%)**

- ✅ TASK-001: Next.js 14 project initialization
- ✅ TASK-002: Docker + PostgreSQL setup
- ✅ TASK-003: Prisma ORM setup
- ✅ TASK-005: Vercel deployment configuration

**Phase 2: Database & API Layer (5/6 - 83%)**

- ✅ TASK-006: Prisma schema design
- ✅ TASK-007: Database seed data
- ✅ TASK-008: Zod validation schemas
- ✅ TASK-009: Loan CRUD Server Actions
- ✅ TASK-010: Payment Server Actions

**Phase 3: UI Components (4/4 - 100%)**

- ✅ TASK-014: Shared components (StatusBadge, EmptyState, DataTable)
- ✅ TASK-015: Loan table with search and pagination
- ✅ TASK-016: Loading and error boundaries
- ✅ TASK-017: Dark theme implementation

**Phase 4: Core Features (1/X - In Progress)**

- ✅ TASK-021: Loan detail page with comprehensive information display, payment history, and action buttons

### Current Features

#### 📊 Loan Management

- **Loan List View**: Searchable and sortable table with pagination
- **Loan Detail Page**: Comprehensive loan information with:
  - Borrower details and loan terms
  - Current balance and payment progress
  - Payment history with pagination
  - Action buttons (Edit, Add Payment, Delete) prominently placed in header
  - Responsive design for all device sizes

#### 🎨 User Experience

- **Professional UI**: Clean design with subtle color accents
- **Dark Theme**: Complete dark mode support
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Loading States**: Proper loading and error boundaries throughout

#### 🔧 Technical Foundation

- **Type Safety**: Full TypeScript implementation with strict mode
- **Database**: PostgreSQL with Prisma ORM and comprehensive seed data
- **Server Actions**: Modern Next.js 15 server-side data handling
- **Validation**: Zod schemas for all data operations

### Next Up

- 🎯 Interest calculation utilities
- 🎯 Enhanced forms and dialogs for editing
- 🎯 Payment management features

## Project Structure

```
loan-management-platform/
├── app/                    # Next.js App Router pages
│   ├── actions/           # Server Actions
│   ├── loans/             # Loan-related pages
│   │   └── [id]/          # Dynamic loan detail page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── loans/             # Loan-specific components
│   │   ├── loan-detail-header.tsx
│   │   ├── loan-overview-card.tsx
│   │   ├── payment-history-card.tsx
│   │   └── loan-table.tsx
│   ├── shared/            # Shared components
│   │   ├── status-badge.tsx
│   │   ├── empty-state.tsx
│   │   └── data-table.tsx
│   └── ui/               # shadcn/ui components
├── lib/                   # Utility functions
│   ├── db.ts             # Prisma Client singleton
│   └── utils.ts          # Class merging utilities
├── prisma/                # Prisma ORM
│   └── schema.prisma     # Database schema
├── scripts/               # Helper scripts
│   └── ensure-docker.js  # Docker health check
├── .tasks/                # Task management system
│   ├── MASTER_TASK_LIST.md
│   ├── WORKFLOW.md
│   └── [phase directories]
├── docker-compose.yml     # Docker services configuration
├── .dockerignore          # Docker ignore patterns
├── .env.local            # Local environment variables (git-ignored)
├── .env.example          # Environment template
└── package.json          # Dependencies and scripts
```

## Available Scripts

### Development

- `npm run dev` - Start development server (automatically starts database)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Database

- `npm run db:up` - Start PostgreSQL database
- `npm run db:down` - Stop PostgreSQL database
- `npm run db:logs` - View database logs
- `npm run db:status` - Check database status
- `npm run db:reset` - Reset database (⚠️ deletes all data)

### Prisma

- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema to database (no migrations)
- `npm run db:migrate` - Create and apply migrations
- `npm run db:migrate:deploy` - Deploy migrations (production)
- `npm run db:studio` - Open Prisma Studio

## Development Workflow

This project uses a task-based development workflow with feature branches. See `.tasks/WORKFLOW.md` for detailed instructions.

### Branch Naming

- Format: `task/{task-id}-{brief-description}`
- Example: `task/002-docker-postgres`

### Commit Messages

- Format: `[TASK-XXX] Brief description`
- Example: `[TASK-002] Add Docker Compose configuration`

## Troubleshooting

### Port 5432 Already in Use

If you see an error like "Bind for 0.0.0.0:5432 failed: port is already allocated":

1. **Check what's using the port:**

   ```bash
   lsof -i :5432
   ```

2. **If it's another PostgreSQL instance:**

   ```bash
   docker ps  # Check if it's a Docker container
   docker stop <container_name>  # Stop the container
   ```

3. **Alternative:** Change the port in `.env.local`:
   ```env
   POSTGRES_PORT=5433  # Use a different port
   DATABASE_URL="postgresql://loanly:YOUR_PASSWORD@localhost:5433/loanly_db?schema=public"
   ```

### Docker Not Running

If you see "Docker is not running!":

1. Start Docker Desktop
2. Wait for Docker to fully start
3. Run `npm run dev` again

### Database Connection Refused

If Next.js can't connect to the database:

1. Check database is running: `npm run db:status`
2. View logs: `npm run db:logs`
3. Restart database: `npm run db:down && npm run db:up`

## Documentation

- [Task System README](.tasks/README.md)
- [Master Task List](.tasks/MASTER_TASK_LIST.md)
- [Development Workflow](.tasks/WORKFLOW.md)
- [Product Requirements Document](../loanly-love/.tasks/PRD.md) _(reference)_

## Deployment

This project is configured for deployment on **Vercel** with automatic deployments from Git.

### Quick Start

1. **Push to GitHub**

   ```bash
   git push origin main
   ```

2. **Import Project to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel auto-detects Next.js configuration

3. **Set Up Database**

   Choose one of these options:

   **Option A: Vercel Postgres (Recommended)**
   - In Vercel dashboard → Storage → Create Database → Postgres
   - Vercel automatically adds these environment variables:
     - `POSTGRES_URL` → Set as `DATABASE_URL`
     - `POSTGRES_URL_NON_POOLING` → Set as `DIRECT_URL`

   **Option B: Neon (More Free Tier)**
   - Create account at [neon.tech](https://neon.tech)
   - Create database and copy connection strings
   - Add to Vercel environment variables:
     - `DATABASE_URL` = Pooled connection string
     - `DIRECT_URL` = Direct connection string

4. **Configure Environment Variables**

   In Vercel Project Settings → Environment Variables, add:

   ```
   DATABASE_URL = [from database provider]
   DIRECT_URL = [direct connection for migrations]
   NEXT_PUBLIC_APP_URL = https://your-app.vercel.app
   ```

5. **Deploy**
   - Vercel automatically deploys on push to main
   - Migrations run automatically via `vercel-build` script
   - View deployment at your Vercel URL

### Deployment Workflow

**For Production:**

```bash
git push origin main  # Auto-deploys to production
```

**For Preview:**

```bash
git push origin feature-branch  # Creates preview deployment
```

### Build Configuration

The project uses a custom `vercel-build` script that:

1. Generates Prisma Client
2. Runs database migrations
3. Builds Next.js application

See `package.json` → `scripts.vercel-build` for details.

### Database Connection Pooling

The schema is configured to support connection pooling (required for serverless):

- `DATABASE_URL`: Pooled connection for queries
- `DIRECT_URL`: Direct connection for migrations

See `.tasks/01-setup/TASK-005.md` for detailed deployment instructions.

## Features (Planned)

### MVP

- 📊 Dashboard with loan portfolio metrics
- 📝 Create and edit loans
- 💰 Payment tracking and history
- 🔍 Search and filter loans
- 📈 Interest calculation (Simple, Amortized, Interest-Only)
- 🎨 Professional UI with subtle color accents

### Post-MVP

- 👤 User authentication
- 📊 Advanced analytics and reporting
- 🤖 AI-driven insights
- 👥 Multi-user collaboration

## Contributing

1. Select a task from `.tasks/MASTER_TASK_LIST.md`
2. Create a feature branch
3. Review task details in `.tasks/[phase]/TASK-XXX.md`
4. Implement following acceptance criteria
5. Create PR for review

## License

Private project - All rights reserved

## Contact

**Project Owner:** Ryan Johnson
