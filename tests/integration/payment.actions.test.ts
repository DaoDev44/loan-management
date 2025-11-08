import { describe, it, expect, beforeEach } from 'vitest'
import { Decimal } from '@prisma/client/runtime/library'
import {
  createPayment,
  getPayment,
  getPayments,
  getPaymentsByLoan,
  updatePayment,
  deletePayment
} from '@/app/actions/payment.actions'
import { createLoan } from '@/app/actions/loan.actions'
import { prisma } from '@/lib/prisma'

describe('Payment Actions', () => {
  let testLoanId: string

  beforeEach(async () => {
    // Clean up existing test data
    await prisma.payment.deleteMany({
      where: {
        loan: {
          OR: [
            { borrowerName: { startsWith: 'Test Borrower' } },
            { borrowerName: { startsWith: 'Payment Test' } }
          ]
        }
      }
    })
    await prisma.loan.deleteMany({
      where: {
        OR: [
          { borrowerName: { startsWith: 'Test Borrower' } },
          { borrowerName: { startsWith: 'Payment Test' } }
        ]
      }
    })

    // Create a test loan for payment tests
    const loanResult = await createLoan({
      borrowerName: 'Payment Test Borrower',
      borrowerEmail: 'payment.test@example.com',
      borrowerPhone: '555-0123',
      principal: 10000,
      interestRate: 5.5,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2026-01-01'),
      termMonths: 24,
      interestCalculationType: 'SIMPLE',
      paymentFrequency: 'MONTHLY',
      notes: 'Test loan for payment testing'
    })

    if (loanResult.success) {
      testLoanId = loanResult.data.id
    } else {
      throw new Error('Failed to create test loan')
    }
  })

  describe('createPayment', () => {
    it('should create a payment successfully', async () => {
      const paymentData = {
        loanId: testLoanId,
        amount: 500,
        date: new Date('2024-01-15')
      }

      const result = await createPayment(paymentData)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.loanId).toBe(testLoanId)
        expect(result.data.amount.toString()).toBe('500')
        expect(result.data.date).toEqual(paymentData.date)
      }
    })

    it('should handle invalid loan ID', async () => {
      const paymentData = {
        loanId: 'cm3xample123456789', // Valid CUID format but doesn't exist
        amount: 500,
        date: new Date()
      }

      const result = await createPayment(paymentData)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Referenced loan not found')
      }
    })
  })

  describe('getPayment', () => {
    it('should retrieve a payment by ID', async () => {
      // Create a payment first
      const createResult = await createPayment({
        loanId: testLoanId,
        amount: 750,
        date: new Date('2024-02-15'),
        notes: 'Extra payment'
      })

      expect(createResult.success).toBe(true)
      if (!createResult.success) return

      const paymentId = createResult.data.id

      // Retrieve the payment
      const result = await getPayment(paymentId)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.id).toBe(paymentId)
        expect(result.data.amount.toString()).toBe('750')
        expect(result.data.notes).toBe('Extra payment')
      }
    })

    it('should return error for non-existent payment', async () => {
      const result = await getPayment('non-existent-id')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Payment not found')
      }
    })
  })

  describe('getPaymentsByLoan', () => {
    it('should retrieve all payments for a loan', async () => {
      // Create multiple payments
      await createPayment({
        loanId: testLoanId,
        amount: 400,
        date: new Date('2024-01-15')
      })

      await createPayment({
        loanId: testLoanId,
        amount: 200,
        date: new Date('2024-02-15'),
        notes: 'Extra payment'
      })

      const result = await getPaymentsByLoan(testLoanId)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.length).toBe(2)
        // Should be ordered by date desc, so newest first
        expect(result.data[0].amount.toString()).toBe('200')
        expect(result.data[1].amount.toString()).toBe('400')
      }
    })

    it('should return empty array for loan with no payments', async () => {
      const result = await getPaymentsByLoan(testLoanId)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.length).toBe(0)
      }
    })
  })

  describe('updatePayment', () => {
    it('should update a payment successfully', async () => {
      // Create a payment first
      const createResult = await createPayment({
        loanId: testLoanId,
        amount: 600,
        date: new Date('2024-03-15')
      })

      expect(createResult.success).toBe(true)
      if (!createResult.success) return

      const paymentId = createResult.data.id

      // Update the payment
      const result = await updatePayment({
        id: paymentId,
        amount: 800,
        notes: 'Updated payment amount'
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.amount.toString()).toBe('800')
        expect(result.data.notes).toBe('Updated payment amount')
      }
    })
  })

  describe('deletePayment', () => {
    it('should delete a payment successfully', async () => {
      // Create a payment first
      const createResult = await createPayment({
        loanId: testLoanId,
        amount: 300,
        date: new Date('2024-04-15')
      })

      expect(createResult.success).toBe(true)
      if (!createResult.success) return

      const paymentId = createResult.data.id

      // Delete the payment
      const deleteResult = await deletePayment(paymentId)
      expect(deleteResult.success).toBe(true)

      // Verify it's deleted
      const getResult = await getPayment(paymentId)
      expect(getResult.success).toBe(false)
    })
  })

  describe('getPayments with filters', () => {
    it('should filter payments by date range', async () => {
      // Create payments of different dates
      await createPayment({
        loanId: testLoanId,
        amount: 500,
        date: new Date('2024-01-15')
      })

      await createPayment({
        loanId: testLoanId,
        amount: 200,
        date: new Date('2024-02-15')
      })

      await createPayment({
        loanId: testLoanId,
        amount: 300,
        date: new Date('2024-03-15')
      })

      // Filter by date range
      const dateRangeResult = await getPayments({
        dateFrom: new Date('2024-02-01'),
        dateTo: new Date('2024-03-31')
      })

      expect(dateRangeResult.success).toBe(true)
      if (dateRangeResult.success) {
        expect(dateRangeResult.data.length).toBeGreaterThanOrEqual(2)
        // Should include Feb and Mar payments
        const amounts = dateRangeResult.data.map((p: any) => p.amount.toString())
        expect(amounts).toContain('200')
        expect(amounts).toContain('300')
      }
    })

    it('should filter payments by amount range', async () => {
      // Create a payment of $500
      await createPayment({
        loanId: testLoanId,
        amount: 500,
        date: new Date('2024-02-15')
      })

      // Filter by amount range (400-600) and specific loan ID  
      const amountRangeResult = await getPayments({
        loanId: testLoanId,
        minAmount: 400,
        maxAmount: 600
      })

      expect(amountRangeResult.success).toBe(true)
      if (amountRangeResult.success) {
        // Should include the $500 payment
        const has500Payment = amountRangeResult.data.some((payment: any) => 
          payment.amount.toString() === '500'
        )
        expect(has500Payment).toBe(true)
        
        // All returned payments should be in range
        amountRangeResult.data.forEach((payment: any) => {
          const amount = payment.amount.toNumber()
          expect(amount).toBeGreaterThanOrEqual(400)
          expect(amount).toBeLessThanOrEqual(600)
        })
      }
    })
  })
})