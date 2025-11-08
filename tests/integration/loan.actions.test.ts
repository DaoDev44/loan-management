import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { createLoan, getLoans } from '@/app/actions/loan.actions'
import { setupTestDatabase, cleanTestDatabase, teardownTestDatabase } from '../setup/test-db'
import { validLoan, validLoan2 } from '../fixtures/loans'

describe('Loan Server Actions Integration Tests', () => {
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
      const result = await createLoan(validLoan)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.borrowerName).toBe('John Doe')
        expect(result.data.borrowerEmail).toBe('john@example.com')
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
        expect(result.issues!.length).toBeGreaterThan(0)
      }
    })

    it('should set initial balance equal to principal', async () => {
      const result = await createLoan(validLoan)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.balance).toBeDefined()
        expect(Number(result.data.balance)).toBe(validLoan.principal)
      }
    })
  })

  describe('getLoans', () => {
    it('should return empty array when no loans exist', async () => {
      const result = await getLoans()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(0)
      }
    })

    it('should return all loans', async () => {
      // Create test loans
      await createLoan(validLoan)
      await createLoan(validLoan2)

      const result = await getLoans()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(2)
      }
    })

    it('should filter loans by status', async () => {
      await createLoan(validLoan)

      const result = await getLoans({ status: 'ACTIVE' })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(1)
        expect(result.data[0].status).toBe('ACTIVE')
      }
    })

    it('should filter loans by borrower name', async () => {
      await createLoan(validLoan)
      await createLoan(validLoan2)

      const result = await getLoans({ borrowerName: 'John' })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(1)
        expect(result.data[0].borrowerName).toContain('John')
      }
    })
  })
})
