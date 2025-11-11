/**
 * Unit tests for loan calculation utilities
 */

import { describe, it, expect } from 'vitest'
import Decimal from 'decimal.js'
import {
  calculateSimpleInterest,
  calculateMonthlyPayment,
  calculateInterestOnlyPayment,
  validateCalculationParams,
  toDecimal,
  formatCurrency,
} from '@/lib/calculations'

describe('Calculation Utilities', () => {
  describe('toDecimal', () => {
    it('should convert number to Decimal', () => {
      const result = toDecimal(100)
      expect(result).toBeInstanceOf(Decimal)
      expect(result.toNumber()).toBe(100)
    })

    it('should convert string to Decimal', () => {
      const result = toDecimal('100.50')
      expect(result).toBeInstanceOf(Decimal)
      expect(result.toNumber()).toBe(100.5)
    })

    it('should handle existing Decimal', () => {
      const decimal = new Decimal(100)
      const result = toDecimal(decimal)
      expect(result).toBeInstanceOf(Decimal)
      expect(result.toNumber()).toBe(100)
    })
  })

  describe('validateCalculationParams', () => {
    it('should validate correct parameters', () => {
      const result = validateCalculationParams(10000, 5.5, 36)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject negative principal', () => {
      const result = validateCalculationParams(-1000, 5.5, 36)
      expect(result.isValid).toBe(false)
      expect(result.errors[0].code).toBe('INVALID_PRINCIPAL')
    })

    it('should reject excessive interest rate', () => {
      const result = validateCalculationParams(10000, 150, 36)
      expect(result.isValid).toBe(false)
      expect(result.errors[0].code).toBe('EXCESSIVE_INTEREST_RATE')
    })

    it('should reject invalid term', () => {
      const result = validateCalculationParams(10000, 5.5, 0)
      expect(result.isValid).toBe(false)
      expect(result.errors[0].code).toBe('INVALID_TERM')
    })
  })

  describe('formatCurrency', () => {
    it('should format number as currency', () => {
      const result = formatCurrency(1234.56)
      expect(result).toBe('$1,234.56')
    })

    it('should format Decimal as currency', () => {
      const decimal = new Decimal(1234.56)
      const result = formatCurrency(decimal)
      expect(result).toBe('$1,234.56')
    })
  })
})

describe('Simple Interest Calculations', () => {
  describe('calculateSimpleInterest', () => {
    it('should calculate simple interest correctly', () => {
      const result = calculateSimpleInterest(10000, 5, 2) // $10k at 5% for 2 years
      expect(result.principal.toNumber()).toBe(10000)
      expect(result.rate).toBe(5)
      expect(result.timeInYears).toBe(2)
      expect(result.simpleInterest.toNumber()).toBe(1000) // 10000 * 0.05 * 2
      expect(result.totalAmount.toNumber()).toBe(11000) // principal + interest
    })

    it('should handle zero interest rate', () => {
      const result = calculateSimpleInterest(10000, 0, 2)
      expect(result.simpleInterest.toNumber()).toBe(0)
      expect(result.totalAmount.toNumber()).toBe(10000)
    })

    it('should handle decimal principal', () => {
      const result = calculateSimpleInterest(new Decimal(10000), 5, 1)
      expect(result.simpleInterest.toNumber()).toBe(500)
    })
  })
})

describe('Amortized Loan Calculations', () => {
  describe('calculateMonthlyPayment', () => {
    it('should calculate monthly payment for standard mortgage', () => {
      // $300k loan at 6% for 30 years (360 months)
      const result = calculateMonthlyPayment(300000, 6, 360)

      // Expected payment is approximately $1,798.65
      expect(result.toNumber()).toBeCloseTo(1798.65, 2)
    })

    it('should handle zero interest rate', () => {
      const result = calculateMonthlyPayment(120000, 0, 60) // $120k over 5 years, no interest
      expect(result.toNumber()).toBeCloseTo(2000, 2) // 120000 / 60 = 2000
    })

    it('should calculate bi-weekly payments', () => {
      const monthlyPayment = calculateMonthlyPayment(100000, 5, 360, 'MONTHLY')
      const biweeklyPayment = calculateMonthlyPayment(100000, 5, 360, 'BI_WEEKLY')

      // Bi-weekly should be roughly half of monthly (slightly less due to frequency)
      expect(biweeklyPayment.toNumber()).toBeLessThan(monthlyPayment.toNumber() / 2)
      expect(biweeklyPayment.toNumber()).toBeGreaterThan(monthlyPayment.toNumber() / 2.5)
    })
  })
})

describe('Interest-Only Calculations', () => {
  describe('calculateInterestOnlyPayment', () => {
    it('should calculate monthly interest-only payment', () => {
      const result = calculateInterestOnlyPayment(100000, 6, 'MONTHLY')

      // Monthly interest = 100000 * (6/100) / 12 = $500
      expect(result.toNumber()).toBeCloseTo(500, 2)
    })

    it('should calculate bi-weekly interest-only payment', () => {
      const result = calculateInterestOnlyPayment(100000, 6, 'BI_WEEKLY')

      // Bi-weekly interest = 100000 * (6/100) / 26 ≈ $230.77
      expect(result.toNumber()).toBeCloseTo(230.77, 2)
    })

    it('should handle zero interest rate', () => {
      const result = calculateInterestOnlyPayment(100000, 0, 'MONTHLY')
      expect(result.toNumber()).toBe(0)
    })
  })
})

describe('Error Handling', () => {
  it('should throw error for invalid simple interest parameters', () => {
    expect(() => calculateSimpleInterest(-1000, 5, 1)).toThrow('Validation failed')
  })

  it('should throw error for invalid monthly payment parameters', () => {
    expect(() => calculateMonthlyPayment(1000, -5, 60)).toThrow('Validation failed')
  })

  it('should throw error for invalid toDecimal input', () => {
    expect(() => toDecimal('invalid' as any)).toThrow('Invalid decimal value')
  })
})