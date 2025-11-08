import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Set test database environment variables BEFORE any imports that use Prisma
const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  'postgresql://loanly:loanly_dev_password@localhost:5432/loanly_test_db?schema=public'

process.env.DATABASE_URL = TEST_DATABASE_URL
process.env.POSTGRES_URL = TEST_DATABASE_URL
process.env.PRISMA_DATABASE_URL = TEST_DATABASE_URL

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Cleanup after each test
afterEach(() => {
  cleanup()
})
