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

    it('should reject negative principal', () => {
      const invalidLoan = {
        ...validLoan,
        principal: -1000,
      }
      const result = CreateLoanSchema.safeParse(invalidLoan)
      expect(result.success).toBe(false)
    })

    it('should reject invalid email', () => {
      const invalidLoan = {
        ...validLoan,
        borrowerEmail: 'not-an-email',
      }
      const result = CreateLoanSchema.safeParse(invalidLoan)
      expect(result.success).toBe(false)
    })
  })
})
