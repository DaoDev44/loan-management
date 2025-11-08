# Testing Infrastructure

## Setup Complete ✅

- **Vitest** for unit/integration tests
- **Testing Library** for React component tests
- **Playwright** for E2E tests

## Running Tests

```bash
# Run all tests in watch mode
npm test

# Run all tests once
npm run test:run

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

## Test Organization

```
tests/
├── unit/                    # Unit tests (✅ Working)
│   └── validations.test.ts  # Zod schema validation tests
├── integration/             # Integration tests (⚠️ Needs DB setup)
│   └── loan.actions.test.ts # Server Action tests
├── components/              # Component tests (future)
├── e2e/                     # E2E tests (future)
├── setup/                   # Test configuration
│   ├── vitest.setup.ts      # Vitest global setup
│   └── test-db.ts           # Test database utilities
└── fixtures/                # Test data
    └── loans.ts             # Loan test fixtures
```

## Integration Tests Setup

Integration tests require a test database. To set up:

1. **Ensure Docker PostgreSQL is running:**
   ```bash
   npm run db:up
   ```

2. **Create test database:**
   ```bash
   docker exec loanly-postgres psql -U loanly -d loanly_db -c "CREATE DATABASE loanly_test_db;"
   ```

3. **Run migrations on test database:**
   ```bash
   DATABASE_URL="postgresql://loanly:loanly_dev_password_change_in_production@localhost:5432/loanly_test_db?schema=public" \
   POSTGRES_URL="postgresql://loanly:loanly_dev_password_change_in_production@localhost:5432/loanly_test_db?schema=public" \
   PRISMA_DATABASE_URL="postgresql://loanly:loanly_dev_password_change_in_production@localhost:5432/loanly_test_db?schema=public" \
   npx prisma migrate deploy
   ```

4. **Run integration tests:**
   ```bash
   npm run test:run tests/integration/
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

## Next Steps

- Fix test database authentication for integration tests
- Add E2E tests with Playwright
- Add component tests for React components
- Set up CI/CD to run tests automatically
