import { Decimal } from 'decimal.js'

// =============================================================================
// Type Exports
// =============================================================================

export type {
  InterestCalculationType,
  PaymentFrequency,
  LoanParameters,
  PaymentCalculation,
  PaymentEntry,
  AmortizationSchedule,
  BalanceCalculation,
  PaymentRecord,
  ValidationError,
  CalculationResult,
  InterestCalculationStrategy,
  CalculationStrategyFactory,
} from './types'

// =============================================================================
// Strategy and Factory Exports
// =============================================================================

export { calculationStrategyFactory } from './factory'
export { validateLoanParameters, validatePaymentRecords, ensureDecimal } from './validation'

// =============================================================================
// Strategy Registration and Initialization
// =============================================================================

import { calculationStrategyFactory } from './factory'
import { SimpleInterestStrategy } from './simple-interest'
import { AmortizedStrategy } from './amortized'
import { InterestOnlyStrategy } from './interest-only'
import { ensureDecimal } from './validation'
import type {
  InterestCalculationType,
  PaymentFrequency,
  LoanParameters,
  PaymentRecord,
  ValidationError,
  CalculationResult,
} from './types'

// Register all strategies with the factory
calculationStrategyFactory.register(new SimpleInterestStrategy())
calculationStrategyFactory.register(new AmortizedStrategy())
calculationStrategyFactory.register(new InterestOnlyStrategy())

// =============================================================================
// Convenience Functions (Primary API)
// =============================================================================

/**
 * Calculate loan payment using the appropriate strategy
 */
export function calculateLoanPayment(
  principal: number | Decimal,
  annualRate: number | Decimal,
  termMonths: number,
  calculationType: InterestCalculationType = 'AMORTIZED',
  paymentFrequency: PaymentFrequency = 'MONTHLY'
) {
  const strategy = calculationStrategyFactory.create(calculationType)

  const params: LoanParameters = {
    principal: ensureDecimal(principal),
    interestRate: ensureDecimal(annualRate),
    termMonths,
    paymentFrequency,
    calculationType,
  }

  return strategy.calculatePayment(params)
}

/**
 * Generate loan amortization schedule using the appropriate strategy
 */
export function generateLoanSchedule(
  principal: number | Decimal,
  annualRate: number | Decimal,
  termMonths: number,
  calculationType: InterestCalculationType = 'AMORTIZED',
  paymentFrequency: PaymentFrequency = 'MONTHLY'
) {
  const strategy = calculationStrategyFactory.create(calculationType)

  const params: LoanParameters = {
    principal: ensureDecimal(principal),
    interestRate: ensureDecimal(annualRate),
    termMonths,
    paymentFrequency,
    calculationType,
  }

  return strategy.generateSchedule(params)
}

/**
 * Calculate current loan balance with payment history using the appropriate strategy
 */
export function calculateLoanBalance(
  principal: number | Decimal,
  annualRate: number | Decimal,
  termMonths: number,
  calculationType: InterestCalculationType = 'AMORTIZED',
  paymentFrequency: PaymentFrequency = 'MONTHLY',
  paymentHistory: PaymentRecord[] = []
) {
  const strategy = calculationStrategyFactory.create(calculationType)

  const params: LoanParameters = {
    principal: ensureDecimal(principal),
    interestRate: ensureDecimal(annualRate),
    termMonths,
    paymentFrequency,
    calculationType,
  }

  return strategy.calculateBalance(params, paymentHistory)
}

/**
 * Calculate loan payment with Prisma enum types (for form integration)
 */
export function calculateLoanPaymentForForm(
  principal: number,
  interestRate: number,
  termMonths: number,
  calculationType: string,
  paymentFrequency: string
) {
  // Validate and convert enum types
  if (!['SIMPLE', 'AMORTIZED', 'INTEREST_ONLY'].includes(calculationType)) {
    return {
      success: false,
      errors: [
        { field: 'calculationType', message: 'Invalid calculation type', code: 'INVALID_TYPE' },
      ],
    }
  }

  if (!['MONTHLY', 'BI_WEEKLY'].includes(paymentFrequency)) {
    return {
      success: false,
      errors: [
        {
          field: 'paymentFrequency',
          message: 'Invalid payment frequency',
          code: 'INVALID_FREQUENCY',
        },
      ],
    }
  }

  return calculateLoanPayment(
    principal,
    interestRate,
    termMonths,
    calculationType as InterestCalculationType,
    paymentFrequency as PaymentFrequency
  )
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Get all supported calculation types
 */
export function getSupportedCalculationTypes(): InterestCalculationType[] {
  return calculationStrategyFactory.getAvailableTypes()
}

/**
 * Check if a calculation type is supported
 */
export function isCalculationTypeSupported(type: string): boolean {
  return calculationStrategyFactory.isSupported(type as InterestCalculationType)
}

/**
 * Get library information
 */
export function getCalculationLibraryInfo() {
  return {
    name: 'Loan Calculation Library',
    version: '2.0.0',
    architecture: 'Hybrid Strategy + Factory Pattern',
    supportedTypes: calculationStrategyFactory.getAvailableTypes(),
    strategyCount: calculationStrategyFactory.getStrategyCount(),
    features: [
      'Strategy Pattern for extensible calculations',
      'Factory Pattern for strategy registration',
      'Comprehensive input validation',
      'Decimal.js for financial precision',
      'TypeScript support with strict typing',
      'Multiple payment frequencies',
      'Payment history tracking',
      'Amortization schedule generation',
    ],
  }
}

// =============================================================================
// Helper function for validation (re-exported above)
// =============================================================================

// =============================================================================
// Constants
// =============================================================================

export const SUPPORTED_CALCULATION_TYPES: InterestCalculationType[] = [
  'SIMPLE',
  'AMORTIZED',
  'INTEREST_ONLY',
]
export const SUPPORTED_PAYMENT_FREQUENCIES: PaymentFrequency[] = ['MONTHLY', 'BI_WEEKLY']

// =============================================================================
// Error Helpers
// =============================================================================

/**
 * Create a standardized calculation error
 */
export function createCalculationError(
  field: string,
  message: string,
  code: string = 'CALCULATION_ERROR'
): ValidationError {
  return { field, message, code }
}

/**
 * Create a failed calculation result
 */
export function createFailedResult<T>(errors: ValidationError[]): CalculationResult<T> {
  return { success: false, errors }
}

/**
 * Create a successful calculation result
 */
export function createSuccessResult<T>(data: T): CalculationResult<T> {
  return { success: true, data }
}
