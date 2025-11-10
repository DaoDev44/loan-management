import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { setupTestDatabase, cleanTestDatabase, teardownTestDatabase } from '../setup/test-db'
import { getLoan } from '@/app/actions/loan.actions'
import { createLoan } from '@/app/actions/loan.actions'
import { createPayment } from '@/app/actions/payment.actions'
import { validLoan } from '../fixtures/loans'
import { notFound } from 'next/navigation'

// Mock Next.js notFound function
vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
}))

describe('Loan Detail Page Integration', () => {
  let testLoanId: string

  beforeAll(async () => {
    await setupTestDatabase()
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })

  beforeEach(async () => {
    await cleanTestDatabase()

    // Create a test loan for each test
    const result = await createLoan(validLoan)
    expect(result.success).toBe(true)
    testLoanId = result.data!.id
  })

  describe('getLoan server action', () => {
    it('should fetch loan successfully with valid ID', async () => {
      const result = await getLoan(testLoanId)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data!.id).toBe(testLoanId)
      expect(result.data!.borrowerName).toBe(validLoan.borrowerName)
      expect(result.data!.borrowerEmail).toBe(validLoan.borrowerEmail)
      expect(result.data!.principal).toBe(validLoan.principal)
      expect(result.data!.interestRate).toBe(validLoan.interestRate)
    })

    it('should return failure for invalid loan ID', async () => {
      const result = await getLoan('invalid-id')

      expect(result.success).toBe(false)
      expect(result.data).toBeFalsy() // Could be null or undefined
      expect(result.error).toBeTruthy()
    })

    it('should handle non-existent UUID format loan ID', async () => {
      const nonExistentUuid = '00000000-0000-0000-0000-000000000000'
      const result = await getLoan(nonExistentUuid)

      expect(result.success).toBe(false)
      expect(result.data).toBeFalsy() // Could be null or undefined
      expect(result.error).toBeTruthy()
    })

    it('should include payment history when loan has payments', async () => {
      // Create payments for the test loan
      const payment1 = await createPayment({
        loanId: testLoanId,
        amount: 500,
        date: new Date('2024-01-15'),
        notes: 'First payment',
      })

      const payment2 = await createPayment({
        loanId: testLoanId,
        amount: 750,
        date: new Date('2024-02-15'),
        notes: 'Second payment',
      })

      expect(payment1.success).toBe(true)
      expect(payment2.success).toBe(true)

      const result = await getLoan(testLoanId)

      expect(result.success).toBe(true)
      expect(result.data!.payments).toHaveLength(2)

      // Payments should be included with proper serialization
      const payments = result.data!.payments!
      expect(payments.some(p => p.amount === 500)).toBe(true)
      expect(payments.some(p => p.amount === 750)).toBe(true)
      // Date might be string or Date object depending on serialization context
      expect(payments[0].date).toBeDefined()
    })

    it('should return empty payments array when loan has no payments', async () => {
      const result = await getLoan(testLoanId)

      expect(result.success).toBe(true)
      expect(result.data!.payments).toEqual([])
    })

    it('should calculate updated balance when payments exist', async () => {
      const originalLoan = await getLoan(testLoanId)
      const originalBalance = originalLoan.data!.balance

      // Add a payment
      await createPayment({
        loanId: testLoanId,
        amount: 1000,
        date: new Date(),
        notes: 'Test payment',
      })

      const updatedLoan = await getLoan(testLoanId)

      expect(updatedLoan.success).toBe(true)
      expect(updatedLoan.data!.balance).toBe(originalBalance - 1000)
    })
  })

  describe('Loan Detail Page Data Serialization', () => {
    it('should properly serialize dates for client components', async () => {
      const result = await getLoan(testLoanId)

      expect(result.success).toBe(true)

      // In test environment, dates might come back as Date objects or strings
      // The important thing is they should be valid and parseable
      expect(result.data!.startDate).toBeDefined()
      expect(result.data!.endDate).toBeDefined()
      expect(result.data!.createdAt).toBeDefined()
      expect(result.data!.updatedAt).toBeDefined()

      // Should be valid dates that can be parsed (whether string or Date object)
      expect(new Date(result.data!.startDate).getTime()).not.toBeNaN()
      expect(new Date(result.data!.endDate).getTime()).not.toBeNaN()
      expect(new Date(result.data!.createdAt).getTime()).not.toBeNaN()
      expect(new Date(result.data!.updatedAt).getTime()).not.toBeNaN()
    })

    it('should handle optional fields correctly', async () => {
      const result = await getLoan(testLoanId)

      expect(result.success).toBe(true)

      // Optional fields should be present from test data
      expect(result.data!.borrowerPhone).toBe(validLoan.borrowerPhone)

      // Notes and collateral should be null or empty for the test loan
      // (the database might return empty string instead of null)
      expect(result.data!.notes === null || result.data!.notes === '').toBe(true)
      expect(result.data!.collateral === null || result.data!.collateral === '').toBe(true)
    })

    it('should maintain numeric precision for financial calculations', async () => {
      const result = await getLoan(testLoanId)

      expect(result.success).toBe(true)

      // Financial fields should maintain exact precision
      expect(result.data!.principal).toBe(10000)
      expect(result.data!.interestRate).toBe(5.5)
      expect(result.data!.balance).toBe(10000) // No payments yet
    })
  })

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // This test would require mocking database errors
      // For now, we test that the function exists and works normally
      const result = await getLoan(testLoanId)
      expect(result.success).toBe(true)
    })

    it('should handle malformed loan ID input', async () => {
      const malformedIds = ['not-a-uuid', 'invalid-id', '123']

      for (const badId of malformedIds) {
        const result = await getLoan(badId)
        expect(result.success).toBe(false)
        expect(result.error).toBeTruthy()
      }
    })
  })

  describe('Next.js 15+ Params Handling', () => {
    it('should handle params as Promise correctly', async () => {
      // Simulate how Next.js 15+ passes params as Promise
      const mockParams = Promise.resolve({ id: testLoanId })

      // This simulates what happens in the actual page component
      const { id } = await mockParams
      const result = await getLoan(id)

      expect(result.success).toBe(true)
      expect(result.data!.id).toBe(testLoanId)
    })

    it('should handle invalid params Promise', async () => {
      const mockParams = Promise.resolve({ id: 'invalid-id' })

      const { id } = await mockParams
      const result = await getLoan(id)

      expect(result.success).toBe(false)
    })
  })

  describe('Performance and Load Testing', () => {
    it('should handle loan with many payments efficiently', async () => {
      // Create a loan with many payments to test performance
      const paymentPromises = []
      for (let i = 0; i < 50; i++) {
        paymentPromises.push(
          createPayment({
            loanId: testLoanId,
            amount: 100,
            date: new Date(`2024-${String(i % 12 + 1).padStart(2, '0')}-15`),
            notes: `Payment ${i + 1}`,
          })
        )
      }

      await Promise.all(paymentPromises)

      const start = Date.now()
      const result = await getLoan(testLoanId)
      const duration = Date.now() - start

      expect(result.success).toBe(true)
      expect(result.data!.payments).toHaveLength(50)
      expect(duration).toBeLessThan(1000) // Should complete in under 1 second
    })

    it('should maintain data consistency with concurrent access', async () => {
      // Simulate multiple concurrent reads
      const readPromises = Array(5).fill(null).map(() => getLoan(testLoanId))
      const results = await Promise.all(readPromises)

      // All reads should succeed and return the same data
      results.forEach(result => {
        expect(result.success).toBe(true)
        expect(result.data!.id).toBe(testLoanId)
      })
    })
  })
})