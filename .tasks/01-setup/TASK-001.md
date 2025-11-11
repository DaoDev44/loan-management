# [TASK-001] Initialize Next.js 14 Project with TypeScript

**Status:** COMPLETED
**Phase:** Setup
**Priority:** P0 (Critical)
**Estimated Effort:** M (4-6 hours)
**Branch:** `task/001-nextjs-setup`

## Dependencies

None - this is the first task

## Description

Set up a new Next.js 14 project with App Router, TypeScript, and migrate essential configuration from the existing Vite project. This establishes the foundation for the entire application.

## Acceptance Criteria

- [ ] Next.js 14 project initialized with App Router
- [ ] TypeScript configured with strict mode
- [ ] Tailwind CSS configured and working
- [ ] Project structure follows Next.js 13+ conventions
- [ ] Environment variables system set up
- [ ] Development server runs successfully
- [ ] All shadcn/ui dependencies installed
- [ ] Path aliases configured (`@/` for src directory)
- [ ] Essential scripts added to package.json (dev, build, lint)

## Implementation Approach

### Option 1: Fresh Install (RECOMMENDED)

Create a completely new Next.js project and migrate code selectively.

**Steps:**

1. Create new Next.js app in a temporary directory:
   ```bash
   npx create-next-app@latest loanly-love-nextjs --typescript --tailwind --app --no-src-dir
   ```
2. Configure project:
   - Enable strict TypeScript
   - Set up path aliases
   - Copy relevant config from Vite project (tailwind.config, etc.)
3. Install dependencies:
   - shadcn/ui CLI and components
   - Zod, react-hook-form, date-fns
   - Framer Motion
4. Set up environment files:
   - `.env.local` for local development
   - `.env.example` as template
5. Test that dev server runs

**Pros:**

- Clean slate, no legacy cruft
- Guaranteed Next.js best practices
- Latest versions of everything

**Cons:**

- Need to manually migrate useful configs
- More initial setup work

### Option 2: In-Place Migration

Modify the existing Vite project to use Next.js.

**Pros:**

- Preserve existing work
- Faster initial setup

**Cons:**

- Risk of config conflicts
- May carry over Vite-specific patterns that don't translate
- More complex cleanup

**Recommendation:** **Option 1** - Fresh install ensures clean architecture and no technical debt from the start.

## Tradeoffs & Alternatives

### Next.js App Router vs Pages Router

- **Chosen:** App Router
- **Why:** Latest paradigm, Server Components by default, better performance, aligns with PRD
- **Tradeoff:** Slightly newer/less Stack Overflow coverage, but much better long-term

### TypeScript Strict Mode

- **Chosen:** Strict mode enabled
- **Why:** Catch more bugs at compile time, better code quality, easier maintenance
- **Tradeoff:** More initial type work, but prevents runtime errors

### Path Aliases

- **Chosen:** `@/*` maps to root directory
- **Why:** Cleaner imports, easier refactoring
- **Example:** `import { Button } from '@/components/ui/button'`

## Project Structure

```
loanly-love-nextjs/
├── .env.local
├── .env.example
├── .gitignore
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Dashboard (home page)
│   ├── globals.css             # Global styles
│   └── loans/                  # Loan routes (added in later tasks)
├── components/
│   ├── ui/                     # shadcn/ui components
│   └── ...                     # Custom components (added later)
├── lib/
│   ├── utils.ts                # Utility functions
│   └── db.ts                   # Prisma client (added later)
└── public/
    └── ...
```

## Testing Requirements

- [ ] `npm run dev` starts development server
- [ ] Page loads at `http://localhost:3000`
- [ ] TypeScript compilation works without errors
- [ ] Tailwind CSS styles apply correctly
- [ ] Hot reload works for file changes

## Deployment Considerations

- Next.js 14 is fully compatible with Vercel (zero-config deployment)
- Environment variables will need to be set in Vercel dashboard
- Build command: `next build`
- Output: `.next` directory (automatically handled by Vercel)

## Configuration Files

### tsconfig.json (key settings)

```json
{
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### next.config.js

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable if using Docker
  output: 'standalone', // Optional: for Docker deployments
}

module.exports = nextConfig
```

### .env.example

```
# Database (will be configured in TASK-002)
DATABASE_URL="postgresql://user:password@localhost:5432/loanly"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Migration Notes

### Files to Copy from Vite Project

- `tailwind.config.ts` (adapt for Next.js)
- `components.json` (shadcn/ui config)
- Color scheme and design tokens

### Files to Ignore

- `vite.config.ts` (not needed)
- `src/main.tsx` (replaced by Next.js app router)
- Vite-specific configurations

## Pre-Implementation Discussion Points

1. **Should we create the new project in a separate directory first, then replace?**
   - Safer to test before committing
   - Can reference old code during migration

2. **Should we use `src/` directory or root-level `app/` directory?**
   - Next.js convention is root-level for App Router
   - But `src/` is also supported and keeps root cleaner

3. **Any specific Next.js configuration needs?**
   - Image optimization settings?
   - Internationalization?
   - Custom webpack config?

## References

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Next.js App Router Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)
- [shadcn/ui Next.js Setup](https://ui.shadcn.com/docs/installation/next)
- PRD Section 6: Technical Requirements
