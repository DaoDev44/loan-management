/**
 * Test environment configuration
 * Centralizes test database configuration and setup
 */

// Load environment variables from .env.local if available
import { config } from 'dotenv'
import { resolve } from 'path'

// Try to load .env.local from project root
const envPath = resolve(process.cwd(), '.env.local')
config({ path: envPath })

// Get the actual development password from environment or use fallback
const DEV_PASSWORD = process.env.POSTGRES_PASSWORD || 'loanly_dev_password_change_in_production'

/**
 * Test database configuration
 */
export const TEST_CONFIG = {
  DATABASE_URL:
    process.env.TEST_DATABASE_URL ||
    `postgresql://loanly:${DEV_PASSWORD}@localhost:5432/loanly_test_db?schema=public`,

  // For consistency with main app
  POSTGRES_URL:
    process.env.TEST_DATABASE_URL ||
    `postgresql://loanly:${DEV_PASSWORD}@localhost:5432/loanly_test_db?schema=public`,

  PRISMA_DATABASE_URL:
    process.env.TEST_DATABASE_URL ||
    `postgresql://loanly:${DEV_PASSWORD}@localhost:5432/loanly_test_db?schema=public`,
}

/**
 * Set test environment variables
 */
export function setupTestEnv() {
  process.env.DATABASE_URL = TEST_CONFIG.DATABASE_URL
  process.env.POSTGRES_URL = TEST_CONFIG.POSTGRES_URL
  process.env.PRISMA_DATABASE_URL = TEST_CONFIG.PRISMA_DATABASE_URL
  // NODE_ENV is typically set by test runner
}

/**
 * Get database connection info for manual setup commands
 */
export function getTestConnectionInfo() {
  return {
    host: 'localhost',
    port: 5432,
    user: 'loanly',
    password: DEV_PASSWORD,
    database: 'loanly_test_db',
  }
}
