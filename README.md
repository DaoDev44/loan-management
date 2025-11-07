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

   Edit `.env.local` with your database credentials (will be set up in TASK-002)

4. **Start development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Status

**Current Phase:** Setup & Infrastructure

See `.tasks/MASTER_TASK_LIST.md` for complete task breakdown and progress.

### Completed Tasks
- ✅ TASK-001: Next.js 14 project initialization

### In Progress
- 🚧 TASK-002: Docker + PostgreSQL setup (Next)

## Project Structure

```
loan-management-platform/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   └── ui/               # shadcn/ui components (will be added)
├── lib/                   # Utility functions
│   └── utils.ts          # Class merging utilities
├── .tasks/                # Task management system
│   ├── MASTER_TASK_LIST.md
│   ├── WORKFLOW.md
│   └── [phase directories]
├── .env.local            # Local environment variables (git-ignored)
├── .env.example          # Environment template
└── package.json          # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Development Workflow

This project uses a task-based development workflow with feature branches. See `.tasks/WORKFLOW.md` for detailed instructions.

### Branch Naming
- Format: `task/{task-id}-{brief-description}`
- Example: `task/002-docker-postgres`

### Commit Messages
- Format: `[TASK-XXX] Brief description`
- Example: `[TASK-002] Add Docker Compose configuration`

## Documentation

- [Task System README](.tasks/README.md)
- [Master Task List](.tasks/MASTER_TASK_LIST.md)
- [Development Workflow](.tasks/WORKFLOW.md)
- [Product Requirements Document](../loanly-love/.tasks/PRD.md) _(reference)_

## Deployment

This project is configured for deployment on Vercel.

### Database Options (Production)
- Vercel Postgres (recommended for Vercel deployments)
- Neon (serverless PostgreSQL, generous free tier)
- Supabase
- Railway

See TASK-002 and TASK-005 documentation for deployment setup details.

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
