# [TASK-030] Set up Testing Infrastructure

**Status:** COMPLETED
**Phase:** Polish & Testing
**Priority:** P1 (High)
**Estimated Effort:** M (4-5 hours)
**Branch:** `task/030-test-infrastructure`

## Dependencies

- TASK-009 (Loan CRUD Server Actions - gives us something to test)

## Description

Set up comprehensive testing infrastructure including Vitest for unit/integration tests, Testing Library for React components, and Playwright for E2E tests. This establishes the foundation for test-driven development and regression prevention.

## Acceptance Criteria

- [x] Vitest installed and configured for unit/integration tests
- [x] Testing Library (@testing-library/react) set up for component tests
- [x] Playwright installed and configured for E2E tests
- [x] Test database configuration with automatic setup/teardown
- [x] Example unit tests for validation schemas (11 tests)
- [x] Example integration tests for Server Actions (22 tests including balance logic)
- [ ] Example component test with Testing Library (deferred - no components yet)
- [ ] Example E2E test with Playwright (deferred - infrastructure ready)
- [x] Test scripts in package.json
- [x] All tests passing (33 tests)
- [x] CI-ready configuration (configs in place, workflow file not needed yet)

## Additional Tests Added

- [x] Balance reduction on payment creation
- [x] Balance adjustment on payment update
- [x] Balance restoration on payment deletion
- [x] Loan status change to COMPLETED when balance reaches zero
- [x] Loan reactivation when payment deleted from completed loan

## Implementation Approach

### Why This Stack?

**Vitest**

- ✅ Fast (Vite-powered)
- ✅ Jest-compatible API
- ✅ Great TypeScript support
- ✅ Built-in code coverage
- ✅ Watch mode out of the box

**Testing Library**

- ✅ Industry standard for React testing
- ✅ Encourages accessibility-first testing
- ✅ Tests user behavior, not implementation
- ✅ Works seamlessly with Vitest

**Playwright**

- ✅ Cross-browser testing (Chromium, Firefox, WebKit)
- ✅ Auto-wait and retry
- ✅ Great developer experience
- ✅ Parallel test execution
- ✅ Built-in test runner

**Alternatives Considered:**

- Jest: Slower than Vitest, more configuration
- Cypress: Great but Playwright has better DX and parallel execution
- Puppeteer: Lower-level, more manual than Playwright

### File Structure

```
tests/
├── unit/                    # Unit tests
│   ├── validations.test.ts  # Zod schema tests
│   └── utils.test.ts        # Utility function tests
├── integration/             # Integration tests
│   ├── loan.actions.test.ts # Server Action tests
│   └── payment.actions.test.ts
├── components/              # Component tests
│   └── LoanTable.test.tsx   # (future)
├── e2e/                     # E2E tests
│   ├── loan-lifecycle.spec.ts
│   └── auth.setup.ts        # (future)
├── setup/                   # Test configuration
│   ├── vitest.setup.ts      # Vitest global setup
│   └── test-db.ts           # Test database utilities
└── fixtures/                # Test data
    └── loans.ts

vitest.config.ts             # Vitest configuration
playwright.config.ts         # Playwright configuration
```

## Implementation

### 1. Install Dependencies

```bash
# Vitest and testing utilities
npm install -D vitest @vitest/ui @vitest/coverage-v8

# Testing Library
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Playwright
npm install -D @playwright/test

# Additional utilities
npm install -D dotenv-cli
```

### 2. Vitest Configuration

**vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup/vitest.setup.ts'],
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['tests/e2e/**', 'node_modules'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/**',
        'lib/validations/generated/**', // Exclude generated files
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

**tests/setup/vitest.setup.ts**

```typescript
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Cleanup after each test
afterEach(() => {
  cleanup()
})
```

### 3. Test Database Configuration

**tests/setup/test-db.ts**

```typescript
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  'postgresql://loanly:loanly_dev_password_change_in_production@localhost:5432/loanly_test_db?schema=public'

export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: TEST_DATABASE_URL,
    },
  },
})

/**
 * Set up test database (run migrations, seed if needed)
 */
export async function setupTestDatabase() {
  // Run migrations on test database
  process.env.DATABASE_URL = TEST_DATABASE_URL
  execSync('npx prisma migrate deploy', { stdio: 'inherit' })
}

/**
 * Clean test database between tests
 */
export async function cleanTestDatabase() {
  // Delete in correct order to respect foreign keys
  await testPrisma.payment.deleteMany()
  await testPrisma.loan.deleteMany()
}

/**
 * Tear down test database connection
 */
export async function teardownTestDatabase() {
  await testPrisma.$disconnect()
}
```

**.env.test** (create this file)

```bash
# Test Database Configuration
TEST_DATABASE_URL="postgresql://loanly:loanly_dev_password_change_in_production@localhost:5432/loanly_test_db?schema=public"
DATABASE_URL="postgresql://loanly:loanly_dev_password_change_in_production@localhost:5432/loanly_test_db?schema=public"
POSTGRES_URL="postgresql://loanly:loanly_dev_password_change_in_production@localhost:5432/loanly_test_db?schema=public"
PRISMA_DATABASE_URL="postgresql://loanly:loanly_dev_password_change_in_production@localhost:5432/loanly_test_db?schema=public"
```

### 4. Example Unit Test

**tests/unit/validations.test.ts**

```typescript
import { describe, it, expect } from 'vitest'
import { CreateLoanSchema, currency, percentage } from '@/lib/validations'

describe('Validation Schemas', () => {
  describe('currency validator', () => {
    it('should accept valid currency values', () => {
      expect(currency.parse(100)).toBe(100)
      expect(currency.parse(99.99)).toBe(99.99)
      expect(currency.parse(0.01)).toBe(0.01)
    })

    it('should reject negative values', () => {
      expect(() => currency.parse(-10)).toThrow('Amount must be positive')
    })

    it('should reject more than 2 decimal places', () => {
      expect(() => currency.parse(10.001)).toThrow('at most 2 decimal places')
    })
  })

  describe('percentage validator', () => {
    it('should accept valid percentages', () => {
      expect(percentage.parse(5.5)).toBe(5.5)
      expect(percentage.parse(0)).toBe(0)
      expect(percentage.parse(100)).toBe(100)
    })

    it('should reject values over 100', () => {
      expect(() => percentage.parse(101)).toThrow('cannot exceed 100%')
    })

    it('should reject negative values', () => {
      expect(() => percentage.parse(-1)).toThrow('cannot be negative')
    })
  })

  describe('CreateLoanSchema', () => {
    const validLoan = {
      borrowerName: 'John Doe',
      borrowerEmail: 'john@example.com',
      borrowerPhone: '+1-555-1234',
      principal: 10000,
      interestRate: 5.5,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-01-01'),
      termMonths: 12,
      interestCalculationType: 'SIMPLE' as const,
      paymentFrequency: 'MONTHLY' as const,
    }

    it('should validate a complete valid loan', () => {
      const result = CreateLoanSchema.safeParse(validLoan)
      expect(result.success).toBe(true)
    })

    it('should reject when end date is before start date', () => {
      const invalidLoan = {
        ...validLoan,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2024-01-01'),
      }
      const result = CreateLoanSchema.safeParse(invalidLoan)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('after start date')
      }
    })

    it('should reject when term months do not match date range', () => {
      const invalidLoan = {
        ...validLoan,
        termMonths: 24, // Should be 12
      }
      const result = CreateLoanSchema.safeParse(invalidLoan)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('should match the date range')
      }
    })
  })
})
```

### 5. Example Integration Test

**tests/integration/loan.actions.test.ts**

```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { createLoan, getLoan, getLoans, updateLoan, deleteLoan } from '@/app/actions/loan.actions'
import { setupTestDatabase, cleanTestDatabase, teardownTestDatabase } from '../setup/test-db'

describe('Loan Server Actions', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })

  beforeEach(async () => {
    await cleanTestDatabase()
  })

  describe('createLoan', () => {
    it('should create a loan with valid data', async () => {
      const result = await createLoan({
        borrowerName: 'Test User',
        borrowerEmail: 'test@example.com',
        borrowerPhone: '+1-555-1234',
        principal: 10000,
        interestRate: 5.5,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-01-01'),
        termMonths: 12,
        interestCalculationType: 'SIMPLE',
        paymentFrequency: 'MONTHLY',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.borrowerName).toBe('Test User')
        expect(result.data.principal).toBeDefined()
        expect(result.data.balance).toBeDefined()
        expect(result.data.status).toBe('ACTIVE')
      }
    })

    it('should reject invalid loan data', async () => {
      const result = await createLoan({
        borrowerName: '',
        borrowerEmail: 'invalid-email',
        principal: -1000,
        interestRate: 150,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2024-01-01'),
        termMonths: -5,
      } as any)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('Validation failed')
        expect(result.issues).toBeDefined()
      }
    })
  })

  describe('getLoans', () => {
    it('should return all loans', async () => {
      // Create test loans
      await createLoan({
        borrowerName: 'User 1',
        borrowerEmail: 'user1@example.com',
        principal: 5000,
        interestRate: 4.5,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-01-01'),
        termMonths: 12,
        interestCalculationType: 'SIMPLE',
        paymentFrequency: 'MONTHLY',
      })

      await createLoan({
        borrowerName: 'User 2',
        borrowerEmail: 'user2@example.com',
        principal: 15000,
        interestRate: 6.0,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2026-01-01'),
        termMonths: 24,
        interestCalculationType: 'AMORTIZED',
        paymentFrequency: 'BI_WEEKLY',
      })

      const result = await getLoans()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(2)
      }
    })

    it('should filter loans by status', async () => {
      const createResult = await createLoan({
        borrowerName: 'Active User',
        borrowerEmail: 'active@example.com',
        principal: 10000,
        interestRate: 5.0,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-01-01'),
        termMonths: 12,
        interestCalculationType: 'SIMPLE',
        paymentFrequency: 'MONTHLY',
      })

      expect(createResult.success).toBe(true)

      const result = await getLoans({ status: 'ACTIVE' })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(1)
        expect(result.data[0].status).toBe('ACTIVE')
      }
    })
  })
})
```

### 6. Playwright Configuration

**playwright.config.ts**

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### 7. Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:db:setup": "dotenv -e .env.test -- npx prisma migrate deploy"
  }
}
```

## Testing Strategy

### Unit Tests

- Validation schemas
- Utility functions
- Business logic helpers
- Interest calculation functions (TASK-011)

### Integration Tests

- Server Actions with real database
- API endpoints (if any)
- Database operations

### Component Tests

- Form components
- Table components
- UI interactions

### E2E Tests

- Critical user flows:
  - Create loan → View loan → Add payment → View updated balance
  - Search and filter loans
  - Edit loan details

## Next Steps

After completion:

- TASK-009A: Write comprehensive tests for Loan Server Actions
- TASK-010: Implement Payment Server Actions (with tests)
- TASK-011: Interest calculation utilities (TDD approach)

## References

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
