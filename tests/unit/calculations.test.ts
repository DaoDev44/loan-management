/**
 * Unit tests for loan calculation utilities (Strategy+Factory Pattern)
 */

import { describe, it, expect } from 'vitest'
import Decimal from 'decimal.js'
import {
  calculateLoanPayment,
  generateLoanSchedule,
  calculateLoanBalance,
  ensureDecimal,
  validateLoanParameters,
  getSupportedCalculationTypes,
  calculationStrategyFactory,
  type LoanParameters,
  type PaymentRecord,
} from '@/lib/calculations'

describe('Strategy+Factory Pattern Calculation Library', () => {
  describe('Library Configuration', () => {
    it('should support all expected calculation types', () => {
      const supportedTypes = getSupportedCalculationTypes()
      expect(supportedTypes).toContain('SIMPLE')
      expect(supportedTypes).toContain('AMORTIZED')
      expect(supportedTypes).toContain('INTEREST_ONLY')
      expect(supportedTypes).toHaveLength(3)
    })

    it('should have all strategies registered in factory', () => {
      expect(calculationStrategyFactory.getStrategyCount()).toBe(3)
      expect(calculationStrategyFactory.isSupported('SIMPLE')).toBe(true)
      expect(calculationStrategyFactory.isSupported('AMORTIZED')).toBe(true)
      expect(calculationStrategyFactory.isSupported('INTEREST_ONLY')).toBe(true)
    })
  })

  describe('Utility Functions', () => {
    describe('ensureDecimal', () => {
      it('should convert number to Decimal', () => {
        const result = ensureDecimal(100)
        expect(result).toBeInstanceOf(Decimal)
        expect(result.toNumber()).toBe(100)
      })

      it('should convert string to Decimal', () => {
        const result = ensureDecimal('100.50')
        expect(result).toBeInstanceOf(Decimal)
        expect(result.toNumber()).toBe(100.5)
      })

      it('should handle existing Decimal', () => {
        const decimal = new Decimal(100)
        const result = ensureDecimal(decimal)
        expect(result).toBeInstanceOf(Decimal)
        expect(result.toNumber()).toBe(100)
      })
    })

    describe('validateLoanParameters', () => {
      const validParams: LoanParameters = {
        principal: new Decimal(100000),
        interestRate: new Decimal(5.5),
        termMonths: 360,
        paymentFrequency: 'MONTHLY',
        calculationType: 'AMORTIZED',
      }

      it('should validate correct parameters', () => {
        const errors = validateLoanParameters(validParams)
        expect(errors).toHaveLength(0)
      })

      it('should reject negative principal', () => {
        const invalidParams = { ...validParams, principal: new Decimal(-1000) }
        const errors = validateLoanParameters(invalidParams)
        expect(errors.length).toBeGreaterThan(0)
        expect(errors.some((e) => e.field === 'principal')).toBe(true)
      })

      it('should reject excessive interest rate', () => {
        const invalidParams = { ...validParams, interestRate: new Decimal(150) }
        const errors = validateLoanParameters(invalidParams)
        expect(errors.length).toBeGreaterThan(0)
        expect(errors.some((e) => e.field === 'interestRate')).toBe(true)
      })

      it('should reject invalid term', () => {
        const invalidParams = { ...validParams, termMonths: 0 }
        const errors = validateLoanParameters(invalidParams)
        expect(errors.length).toBeGreaterThan(0)
        expect(errors.some((e) => e.field === 'termMonths')).toBe(true)
      })
    })
  })

  describe('Amortized Loan Calculations', () => {
    it('should calculate monthly payment for standard mortgage', () => {
      const result = calculateLoanPayment(100000, 5.5, 360, 'AMORTIZED', 'MONTHLY')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.paymentAmount.toNumber()).toBeCloseTo(567.79, 2)
        expect(result.data.totalPayments).toBe(360)
        expect(result.data.paymentFrequency).toBe('MONTHLY')
        expect(result.data.totalInterest.toNumber()).toBeGreaterThan(0)
      }
    })

    it('should handle zero interest rate', () => {
      const result = calculateLoanPayment(12000, 0, 12, 'AMORTIZED', 'MONTHLY')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.paymentAmount.toNumber()).toBeCloseTo(1000, 2)
        expect(result.data.totalInterest.toNumber()).toBe(0)
      }
    })

    it('should calculate bi-weekly payments', () => {
      const result = calculateLoanPayment(100000, 5.5, 360, 'AMORTIZED', 'BI_WEEKLY')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.totalPayments).toBe(780) // 30 years * 26 payments
        expect(result.data.paymentFrequency).toBe('BI_WEEKLY')
      }
    })

    it('should generate amortization schedule', () => {
      const result = generateLoanSchedule(10000, 6, 12, 'AMORTIZED', 'MONTHLY')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.payments).toHaveLength(12)
        expect(result.data.payments[0].paymentNumber).toBe(1)
        expect(result.data.payments[11].paymentNumber).toBe(12)
        expect(result.data.payments[11].remainingBalance.toNumber()).toBeCloseTo(0, 2)
      }
    })
  })

  describe('Simple Interest Calculations', () => {
    it('should calculate simple interest correctly', () => {
      const result = calculateLoanPayment(10000, 8, 12, 'SIMPLE', 'MONTHLY')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.totalInterest.toNumber()).toBeCloseTo(800, 2) // 10000 * 0.08 * 1 year
        expect(result.data.totalAmount.toNumber()).toBeCloseTo(10800, 2)
      }
    })

    it('should handle decimal principal', () => {
      const result = calculateLoanPayment(10500.75, 5, 24, 'SIMPLE', 'MONTHLY')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.totalInterest.toNumber()).toBeCloseTo(1050.08, 2)
      }
    })
  })

  describe('Interest-Only Loan Calculations', () => {
    it('should calculate monthly interest-only payment', () => {
      const result = calculateLoanPayment(100000, 6, 60, 'INTEREST_ONLY', 'MONTHLY')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.paymentAmount.toNumber()).toBeCloseTo(500, 2) // 100000 * 0.06 / 12
        expect(result.data.totalInterest.toNumber()).toBeCloseTo(30000, 2) // 500 * 60
      }
    })

    it('should calculate bi-weekly interest-only payment', () => {
      const result = calculateLoanPayment(100000, 6, 60, 'INTEREST_ONLY', 'BI_WEEKLY')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.paymentAmount.toNumber()).toBeCloseTo(230.77, 2) // 100000 * 0.06 / 26
        expect(result.data.totalPayments).toBe(130) // 5 years * 26 payments
      }
    })

    it('should generate interest-only schedule with balloon payment', () => {
      const result = generateLoanSchedule(50000, 5, 24, 'INTEREST_ONLY', 'MONTHLY')
      expect(result.success).toBe(true)
      if (result.success) {
        const payments = result.data.payments
        // All payments except last should have no principal
        for (let i = 0; i < payments.length - 1; i++) {
          expect(payments[i].principalAmount.toNumber()).toBe(0)
        }
        // Last payment should include full principal (balloon)
        const lastPayment = payments[payments.length - 1]
        expect(lastPayment.principalAmount.toNumber()).toBe(50000)
        expect(lastPayment.remainingBalance.toNumber()).toBe(0)
      }
    })
  })

  describe('Balance Calculations with Payment History', () => {
    it('should calculate remaining balance after payments', () => {
      const payments: PaymentRecord[] = [
        { amount: new Decimal(567.79), date: new Date('2024-01-01') },
        { amount: new Decimal(567.79), date: new Date('2024-02-01') },
      ]

      const result = calculateLoanBalance(100000, 5.5, 360, 'AMORTIZED', 'MONTHLY', payments)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.paymentsMade).toBe(2)
        expect(result.data.totalPrincipalPaid.toNumber()).toBeGreaterThan(0)
        expect(result.data.totalInterestPaid.toNumber()).toBeGreaterThan(0)
        expect(result.data.currentBalance.toNumber()).toBeLessThan(100000)
      }
    })
  })

  describe('Error Handling', () => {
    it('should return validation errors for invalid parameters', () => {
      const result = calculateLoanPayment(-1000, 5.5, 360, 'AMORTIZED', 'MONTHLY')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors.length).toBeGreaterThan(0)
        expect(result.errors.some((e) => e.field === 'principal')).toBe(true)
      }
    })

    it('should handle unsupported calculation types gracefully', () => {
      expect(() => {
        calculationStrategyFactory.create('INVALID' as any)
      }).toThrow()
    })
  })
})
