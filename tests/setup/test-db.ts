import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import { TEST_CONFIG, setupTestEnv } from './test-env'

// Ensure environment is configured
setupTestEnv()

export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: TEST_CONFIG.DATABASE_URL,
    },
  },
})

/**
 * Set up test database (run migrations, seed if needed)
 */
export async function setupTestDatabase() {
  // Environment is already set up by setupTestEnv()
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
