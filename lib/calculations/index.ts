/**
 * Loan Interest Calculations Library
 *
 * Comprehensive library for calculating loan interest, payment schedules,
 * and balance tracking across different interest calculation types:
 * - Simple Interest
 * - Amortized Loans
 * - Interest-Only Loans
 *
 * @example Basic Usage
 * ```typescript
 * import { calculateMonthlyPayment, generatePaymentSchedule } from '@/lib/calculations'
 *
 * // Calculate amortized loan payment
 * const monthlyPayment = calculateMonthlyPayment(100000, 5.5, 360) // $567.79
 *
 * // Generate full payment schedule
 * const schedule = generatePaymentSchedule(loanData)
 * ```
 */

// =============================================================================
// Type Exports
// =============================================================================

export type {
  // Core loan and payment types
  LoanCalculationInput,
  PaymentCalculationInput,

  // Calculation result types
  InterestCalculationResult,
  SimpleInterestResult,
  AmortizationSchedule,
  AmortizationPayment,
  InterestOnlyResult,
  BalanceCalculationResult,
  PaymentImpactAnalysis,
  PortfolioMetrics,

  // Configuration and utility types
  CalculationConfig,
  PaymentScheduleOptions,
  ValidationResult,
  CalculationError,
  TimePeriod,
  RoundingMode,
  CalculationFrequency,
} from './types'

// =============================================================================
// Utility Function Exports
// =============================================================================

export {
  // Validation functions
  validateLoanInput,
  validatePaymentInput,
  validateCalculationParams,

  // Date calculation utilities
  getPaymentFrequencyPerYear,
  calculateTimePeriod,
  calculateNextPaymentDate,
  generatePaymentDates,
  getPeriodicRate,
  calculateTotalPayments,

  // Decimal/monetary utilities
  roundMoney,
  formatCurrency,
  toDecimal,
  addDecimals,
  subtractDecimals,
  multiplyDecimals,
  divideDecimals,
  sumDecimals,
  minDecimal,
  maxDecimal,
  averageDecimals,

  // Configuration
  DEFAULT_CONFIG,
  MAX_INTEREST_RATE,
  MIN_LOAN_TERM,
  MAX_LOAN_TERM,
} from './utils'

// =============================================================================
// Simple Interest Calculations
// =============================================================================

export {
  // Core simple interest functions
  calculateSimpleInterest,
  calculateSimpleInterestByDate,
  calculateSimpleInterestBalance,
  calculateSimpleInterestBalanceWithPayments,

  // Simple interest utility functions
  calculatePrincipalFromInterest,
  calculateRateFromInterest,
  calculateTimeFromInterest,
  calculateSimpleInterestTotal,
  calculateSimpleInterestEAR,
} from './simple-interest'

// =============================================================================
// Amortized Loan Calculations
// =============================================================================

export {
  // Core amortized loan functions
  calculateMonthlyPayment,
  generateAmortizationSchedule,
  calculateRemainingBalance,
  calculateAmortizedBalanceWithPayments,

  // Amortized utility functions
  calculateTotalInterest,
  calculateAmortizedAPR,
  calculateLoanAmountFromPayment,
} from './amortized'

// =============================================================================
// Interest-Only Loan Calculations
// =============================================================================

export {
  // Core interest-only functions
  calculateInterestOnlyPayment,
  calculateInterestOnlyLoan,
  generateInterestOnlySchedule,
  calculateInterestOnlyBalanceWithPayments,

  // Interest-only utility functions
  calculateInterestOnlyTotalCost,
  calculateInterestSavingsVsAmortized,
  calculateInterestOnlyEAR,
  calculateBalloonPayment,
  calculateCashFlowAdvantage,
} from './interest-only'

// =============================================================================
// Unified Payment Schedule & Balance Calculations
// =============================================================================

export {
  // Unified calculation functions (works with any loan type)
  generatePaymentSchedule,
  calculateCurrentBalance,
  analyzePaymentImpact,

  // Payment utilities
  calculateNextPaymentDue,
  calculateRemainingPayments,
  calculateRemainingInterest,
  generatePaymentSummary,
} from './payment-schedule'

// =============================================================================
// Convenience Functions (Most Common Use Cases)
// =============================================================================

/**
 * Quick loan payment calculator
 * Automatically detects loan type and calculates appropriate payment
 */
import { calculateMonthlyPayment as calculateAmortizedPayment } from './amortized'
import { calculateInterestOnlyPayment } from './interest-only'
import { calculateSimpleInterestTotal } from './simple-interest'
import type { InterestCalculationType, PaymentFrequency } from '@prisma/client'
import type { CalculationConfig } from './types'
import { DEFAULT_CONFIG } from './utils'

export function calculateLoanPayment(
  principal: number,
  annualRate: number,
  termMonths: number,
  calculationType: InterestCalculationType = 'AMORTIZED',
  frequency: PaymentFrequency = 'MONTHLY',
  config: CalculationConfig = DEFAULT_CONFIG
) {
  switch (calculationType) {
    case 'AMORTIZED':
      return calculateAmortizedPayment(principal, annualRate, termMonths, frequency, config)

    case 'INTEREST_ONLY':
      return calculateInterestOnlyPayment(principal, annualRate, frequency, config)

    case 'SIMPLE':
      // Simple interest typically has one payment at the end
      return calculateSimpleInterestTotal(principal, annualRate, termMonths / 12, config)

    default:
      throw new Error(`Unsupported calculation type: ${calculationType}`)
  }
}

/**
 * Quick total interest calculator
 * Calculate total interest for any loan type
 */
import { calculateTotalInterest as calculateAmortizedTotalInterest } from './amortized'
import { calculateInterestOnlyTotalCost } from './interest-only'
import { calculateSimpleInterest } from './simple-interest'

export function calculateLoanTotalInterest(
  principal: number,
  annualRate: number,
  termMonths: number,
  calculationType: InterestCalculationType = 'AMORTIZED',
  frequency: PaymentFrequency = 'MONTHLY',
  config: CalculationConfig = DEFAULT_CONFIG
) {
  switch (calculationType) {
    case 'AMORTIZED':
      return calculateAmortizedTotalInterest(principal, annualRate, termMonths, frequency, config)

    case 'INTEREST_ONLY': {
      const result = calculateInterestOnlyTotalCost(principal, annualRate, termMonths, frequency, config)
      return result.sub(principal) // Total cost minus principal = interest
    }

    case 'SIMPLE': {
      const result = calculateSimpleInterest(principal, annualRate, termMonths / 12, config)
      return result.simpleInterest
    }

    default:
      throw new Error(`Unsupported calculation type: ${calculationType}`)
  }
}

// =============================================================================
// Common Constants and Enums
// =============================================================================

/**
 * Supported interest calculation types
 */
export const INTEREST_CALCULATION_TYPES = ['SIMPLE', 'AMORTIZED', 'INTEREST_ONLY'] as const

/**
 * Supported payment frequencies
 */
export const PAYMENT_FREQUENCIES = ['MONTHLY', 'BI_WEEKLY'] as const

/**
 * Library version
 */
export const CALCULATIONS_VERSION = '1.0.0'

// =============================================================================
// Library Information
// =============================================================================

/**
 * Get library information and configuration
 */
export function getLibraryInfo() {
  return {
    name: 'Loan Calculations Library',
    version: CALCULATIONS_VERSION,
    description: 'Comprehensive loan interest calculations for all loan types',
    supportedCalculationTypes: INTEREST_CALCULATION_TYPES,
    supportedPaymentFrequencies: PAYMENT_FREQUENCIES,
    defaultConfig: DEFAULT_CONFIG,
    features: [
      'Simple Interest Calculations',
      'Amortized Loan Calculations',
      'Interest-Only Loan Calculations',
      'Payment Schedule Generation',
      'Balance Tracking with Payments',
      'Payment Impact Analysis',
      'Multi-currency Support via Decimal.js',
      'Comprehensive Input Validation',
      'TypeScript Support',
    ],
  }
}