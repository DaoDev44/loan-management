import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  'postgresql://loanly:loanly_dev_password@localhost:5432/loanly_test_db?schema=public'

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
  process.env.POSTGRES_URL = TEST_DATABASE_URL
  process.env.PRISMA_DATABASE_URL = TEST_DATABASE_URL

  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' })
  } catch (error) {
    console.error('Failed to run migrations on test database:', error)
    throw error
  }
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
