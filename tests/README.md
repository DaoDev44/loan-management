# Testing Infrastructure

## Setup Complete ✅

- **Vitest** for unit/integration tests
- **Testing Library** for React component tests
- **Playwright** for E2E tests

## Quick Start for New Developers

### 1. **One-Command Setup (RECOMMENDED)**

```bash
# This sets up everything you need for testing
npm run test:setup
```

This command will:

- ✅ Start Docker PostgreSQL container
- ✅ Create test database
- ✅ Run migrations on test database
- ✅ Configure environment variables

### 2. **Run Tests**

```bash
# Run all tests in watch mode (recommended during development)
npm test

# Run all tests once
npm run test:run

# Run with coverage report
npm run test:coverage
```

## Manual Setup (Advanced)

If you need to set up the test environment manually:

### Prerequisites

- Docker and Docker Compose installed
- PostgreSQL container running (`npm run db:up`)

### Step-by-Step Setup

1. **Ensure main development database is running:**

   ```bash
   npm run db:up
   ```

2. **Create test database:**

   ```bash
   docker exec loanly-postgres psql -U loanly -d loanly_db -c "CREATE DATABASE loanly_test_db;"
   ```

3. **Run migrations on test database:**

   ```bash
   # Option 1: Use environment variables (RECOMMENDED)
   TEST_DATABASE_URL="postgresql://loanly:${POSTGRES_PASSWORD}@localhost:5432/loanly_test_db?schema=public" \
   npx prisma migrate deploy

   # Option 2: Use explicit connection (if needed for debugging)
   DATABASE_URL="postgresql://loanly:loanly_dev_password_change_in_production@localhost:5432/loanly_test_db?schema=public" \
   POSTGRES_URL="postgresql://loanly:loanly_dev_password_change_in_production@localhost:5432/loanly_test_db?schema=public" \
   PRISMA_DATABASE_URL="postgresql://loanly:loanly_dev_password_change_in_production@localhost:5432/loanly_test_db?schema=public" \
   npx prisma migrate deploy
   ```

## Running Tests

```bash
# Run all tests in watch mode (recommended during development)
npm test

# Run all tests once
npm run test:run

# Run with UI (great for debugging)
npm run test:ui

# Run with coverage report
npm run test:coverage

# Run only unit tests
npm run test:run tests/unit/

# Run only integration tests (requires database setup)
npm run test:run tests/integration/

# Run E2E tests (future)
npm run test:e2e

# Run E2E tests with UI (future)
npm run test:e2e:ui
```

## Test Organization

```
tests/
├── unit/                    # Unit tests (✅ Working)
│   └── validations.test.ts  # Zod schema validation tests
├── integration/             # Integration tests (✅ Working with setup)
│   └── loan.actions.test.ts # Server Action tests
├── components/              # Component tests (future)
├── e2e/                     # E2E tests (future)
├── setup/                   # Test configuration
│   ├── vitest.setup.ts      # Vitest global setup
│   ├── test-db.ts           # Test database utilities
│   └── test-env.ts          # Centralized test environment config
├── fixtures/                # Test data
│   └── loans.ts             # Loan test fixtures
└── README.md                # This file
```

## Troubleshooting

### Common Issues

**❌ "Can't reach database server" Error**

```bash
# Check if PostgreSQL container is running
npm run db:status

# If not running, start it
npm run db:up

# Check logs for errors
npm run db:logs
```

**❌ "Database 'loanly_test_db' does not exist"**

```bash
# Run the automated setup
npm run test:setup

# Or create manually
docker exec loanly-postgres psql -U loanly -d loanly_db -c "CREATE DATABASE loanly_test_db;"
```

**❌ "Migration failed" Error**

```bash
# Reset and recreate test database
docker exec loanly-postgres psql -U loanly -d loanly_db -c "DROP DATABASE IF EXISTS loanly_test_db; CREATE DATABASE loanly_test_db;"

# Run setup again
npm run test:setup
```

**❌ Password Authentication Failed**

- Make sure your `.env.local` file has the correct `POSTGRES_PASSWORD`
- The test setup automatically reads from your environment
- Default password: `loanly_dev_password_change_in_production`

### Environment Variables

The test environment automatically reads from:

1. `TEST_DATABASE_URL` (if set)
2. Your `.env.local` file for the development password
3. Falls back to default configuration

You can override by setting:

```bash
export TEST_DATABASE_URL="postgresql://loanly:your_password@localhost:5432/loanly_test_db?schema=public"
```

## Test Coverage

Current unit test coverage:

- ✅ Validation schemas (currency, percentage, loan creation)
- ✅ Cross-field validation (dates, term matching)
- ✅ Error handling

Integration test coverage (once DB is set up):

- ✅ createLoan() with valid/invalid data
- ✅ getLoans() with filtering
- ✅ Balance calculations

## Writing New Tests

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest'

describe('MyFunction', () => {
  it('should do something', () => {
    expect(true).toBe(true)
  })
})
```

### Integration Test Example

```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { setupTestDatabase, cleanTestDatabase, teardownTestDatabase } from '../setup/test-db'

describe('MyIntegrationTest', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })

  beforeEach(async () => {
    await cleanTestDatabase()
  })

  it('should work with database', async () => {
    // Your test here
  })
})
```

## Test Coverage

Current unit test coverage:

- ✅ Validation schemas (currency, percentage, loan creation)
- ✅ Cross-field validation (dates, term matching)
- ✅ Error handling

Integration test coverage (once DB is set up):

- ✅ createLoan() with valid/invalid data
- ✅ getLoans() with filtering
- ✅ Balance calculations

## Writing New Tests

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest'

describe('MyFunction', () => {
  it('should do something', () => {
    expect(true).toBe(true)
  })
})
```

### Integration Test Example

```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { setupTestDatabase, cleanTestDatabase, teardownTestDatabase } from '../setup/test-db'

describe('MyIntegrationTest', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })

  beforeEach(async () => {
    await cleanTestDatabase()
  })

  it('should work with database', async () => {
    // Your test here
  })
})
```

## Test Configuration Files

### Key Files Explained

- **`tests/setup/test-env.ts`** - Centralizes test environment configuration, reads from your `.env.local`
- **`tests/setup/vitest.setup.ts`** - Global Vitest configuration, sets up test environment
- **`tests/setup/test-db.ts`** - Database utilities for integration tests
- **`scripts/setup-test-db.js`** - Automated test database setup script

## Security Notes

- ✅ Test database uses the same password as development (from `.env.local`)
- ✅ Test environment is isolated from production
- ✅ Credentials are read from environment, not hardcoded
- ⚠️ Never run tests against production database

## Next Steps

- [ ] Add component tests for React components
- [ ] Set up E2E tests with Playwright
- [ ] Add CI/CD to run tests automatically
- [ ] Add visual regression testing

## Need Help?

1. **For test setup issues:** Run `npm run test:setup` and check the output
2. **For database issues:** Check `npm run db:logs`
3. **For test failures:** Run `npm run test:ui` to debug interactively
4. **For performance:** Use `npm run test:coverage` to see what's tested

---

**Happy Testing! 🧪**
