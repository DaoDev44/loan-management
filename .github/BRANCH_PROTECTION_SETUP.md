# Branch Protection Setup for Vercel Deployment

This document outlines the configuration needed to ensure Vercel deployments wait for all GitHub Actions to pass before deploying.

## Problem

Currently, Vercel deploys automatically from the `main` branch without waiting for GitHub Actions (linting, type checking, building, and testing) to complete. This can result in broken deployments if the code doesn't pass quality checks.

## Solution Overview

1. **Vercel Configuration** - ✅ Completed via `vercel.json`
2. **GitHub Branch Protection Rules** - ⚠️ Requires manual setup (below)
3. **Status Check Requirements** - ⚠️ Configure required checks

## Required GitHub Branch Protection Rules

To ensure deployments only happen after all checks pass, configure these settings in your GitHub repository:

### 1. Navigate to Branch Protection Settings

1. Go to your GitHub repository
2. Click **Settings** tab
3. Click **Branches** in the left sidebar
4. Click **Add rule** or edit existing rule for `main` branch

### 2. Configure Protection Rules

Enable these settings for the `main` branch:

#### Basic Protection

- ✅ **Require a pull request before merging**
  - ✅ Require approvals: 1
  - ✅ Dismiss stale reviews when new commits are pushed
  - ✅ Require review from code owners (if you have CODEOWNERS file)

#### Status Checks

- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - ✅ **Required status checks** (select these):
    - `lint-and-type-check` (ESLint and TypeScript)
    - `build` (Production build)
    - `test` (Test suite with PostgreSQL)

#### Additional Restrictions

- ✅ **Restrict pushes that create files larger than 100 MB**
- ✅ **Require linear history** (optional but recommended)
- ✅ **Include administrators** (apply rules to admins too)

### 3. Vercel Integration Settings

In your Vercel project settings:

1. Go to your Vercel project dashboard
2. Click **Settings** tab
3. Go to **Git Integration**
4. Under **Deploy Hooks** section:
   - ✅ Ensure "Only deploy if checks pass" is enabled
   - ✅ Set deployment to wait for status checks

### 4. Required Status Check Names

Based on our `.github/workflows/ci.yml`, these are the status check names that must pass:

```yaml
Required Checks:
  - lint-and-type-check # Runs ESLint, TypeScript, and Prettier checks
  - build # Builds the Next.js application
  - test # Runs the test suite with database
```

## Verification

After setting up branch protection:

1. Create a test branch with a failing lint error
2. Open a pull request
3. Verify that merge is blocked until checks pass
4. Verify that Vercel deployment waits for checks to complete

## Current CI/CD Workflow Status

Our GitHub Actions workflow (`.github/workflows/ci.yml`) includes:

✅ **lint-and-type-check job:**

- ESLint validation
- TypeScript compilation
- Prettier formatting check

✅ **build job:**

- Dependencies installation
- Prisma client generation
- Next.js production build

✅ **test job:**

- PostgreSQL database setup
- Prisma migrations
- Vitest test execution
- Coverage reporting

## Files Created/Modified

- ✅ `vercel.json` - Vercel deployment configuration
- ✅ `.github/BRANCH_PROTECTION_SETUP.md` - This setup guide

## Next Steps

1. **Manual Setup Required:** Configure GitHub branch protection rules (steps above)
2. **Verify Configuration:** Test that deployments wait for all checks
3. **Team Communication:** Inform team about new protection rules

## Troubleshooting

### Issue: Status checks not appearing in GitHub

**Solution:** Push a commit to trigger the GitHub Actions workflow first

### Issue: Vercel still deploying before checks

**Solution:** Verify "Only deploy if checks pass" is enabled in Vercel settings

### Issue: Protection rules not applying

**Solution:** Ensure you're not bypassing rules as a repository admin

---

**Note:** These changes ensure production deployments only happen when code quality standards are met, preventing broken deployments and maintaining system reliability.
