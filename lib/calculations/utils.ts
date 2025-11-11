/**
 * Common utilities for loan interest calculations
 * Includes validation, date math, and helper functions
 */

import Decimal from 'decimal.js'
import { addMonths, addWeeks, differenceInDays, differenceInMonths, format } from 'date-fns'
import type { PaymentFrequency } from '@prisma/client'
import type {
  ValidationResult,
  CalculationError,
  TimePeriod,
  CalculationConfig,
  RoundingMode,
  LoanCalculationInput,
  PaymentCalculationInput,
} from './types'

// =============================================================================
// Configuration Constants
// =============================================================================

/** Default calculation configuration */
export const DEFAULT_CONFIG: Required<CalculationConfig> = {
  precision: 2,
  roundingMode: 'ROUND_NEAREST' as RoundingMode,
  includePartialPeriods: true,
  businessDaysOnly: false,
}

/** Maximum reasonable interest rate (100%) */
export const MAX_INTEREST_RATE = 100

/** Minimum loan term in months */
export const MIN_LOAN_TERM = 1

/** Maximum loan term in months (50 years) */
export const MAX_LOAN_TERM = 600

// =============================================================================
// Validation Functions
// =============================================================================

/**
 * Validate loan input data for calculations
 */
export function validateLoanInput(loan: LoanCalculationInput): ValidationResult {
  const errors: CalculationError[] = []

  // Validate principal
  if (!loan.principal || loan.principal.lte(0)) {
    errors.push({
      code: 'INVALID_PRINCIPAL',
      message: 'Principal must be greater than 0',
      field: 'principal',
      value: loan.principal,
    })
  }

  // Validate interest rate
  if (typeof loan.interestRate !== 'number' || loan.interestRate < 0) {
    errors.push({
      code: 'INVALID_INTEREST_RATE',
      message: 'Interest rate must be a non-negative number',
      field: 'interestRate',
      value: loan.interestRate,
    })
  }

  if (loan.interestRate > MAX_INTEREST_RATE) {
    errors.push({
      code: 'EXCESSIVE_INTEREST_RATE',
      message: `Interest rate cannot exceed ${MAX_INTEREST_RATE}%`,
      field: 'interestRate',
      value: loan.interestRate,
    })
  }

  // Validate term
  if (!loan.termMonths || loan.termMonths < MIN_LOAN_TERM) {
    errors.push({
      code: 'INVALID_TERM',
      message: `Loan term must be at least ${MIN_LOAN_TERM} month`,
      field: 'termMonths',
      value: loan.termMonths,
    })
  }

  if (loan.termMonths > MAX_LOAN_TERM) {
    errors.push({
      code: 'EXCESSIVE_TERM',
      message: `Loan term cannot exceed ${MAX_LOAN_TERM} months`,
      field: 'termMonths',
      value: loan.termMonths,
    })
  }

  // Validate dates
  if (!loan.startDate || isNaN(loan.startDate.getTime())) {
    errors.push({
      code: 'INVALID_START_DATE',
      message: 'Start date must be a valid date',
      field: 'startDate',
      value: loan.startDate,
    })
  }

  if (!loan.endDate || isNaN(loan.endDate.getTime())) {
    errors.push({
      code: 'INVALID_END_DATE',
      message: 'End date must be a valid date',
      field: 'endDate',
      value: loan.endDate,
    })
  }

  if (loan.startDate && loan.endDate && loan.startDate >= loan.endDate) {
    errors.push({
      code: 'INVALID_DATE_RANGE',
      message: 'End date must be after start date',
      field: 'endDate',
      value: { startDate: loan.startDate, endDate: loan.endDate },
    })
  }

  // Validate balance
  if (!loan.balance || loan.balance.lt(0)) {
    errors.push({
      code: 'INVALID_BALANCE',
      message: 'Balance must be greater than or equal to 0',
      field: 'balance',
      value: loan.balance,
    })
  }

  if (loan.balance.gt(loan.principal)) {
    errors.push({
      code: 'BALANCE_EXCEEDS_PRINCIPAL',
      message: 'Balance cannot exceed original principal',
      field: 'balance',
      value: { balance: loan.balance, principal: loan.principal },
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validate payment input data
 */
export function validatePaymentInput(payment: PaymentCalculationInput): ValidationResult {
  const errors: CalculationError[] = []

  // Validate amount
  if (!payment.amount || payment.amount.lte(0)) {
    errors.push({
      code: 'INVALID_PAYMENT_AMOUNT',
      message: 'Payment amount must be greater than 0',
      field: 'amount',
      value: payment.amount,
    })
  }

  // Validate date
  if (!payment.date || isNaN(payment.date.getTime())) {
    errors.push({
      code: 'INVALID_PAYMENT_DATE',
      message: 'Payment date must be a valid date',
      field: 'date',
      value: payment.date,
    })
  }

  // Validate loan ID
  if (!payment.loanId || typeof payment.loanId !== 'string') {
    errors.push({
      code: 'INVALID_LOAN_ID',
      message: 'Loan ID must be a non-empty string',
      field: 'loanId',
      value: payment.loanId,
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validate calculation parameters
 */
export function validateCalculationParams(
  principal: Decimal.Value,
  rate: number,
  term: number
): ValidationResult {
  const errors: CalculationError[] = []
  const principalDecimal = new Decimal(principal)

  if (principalDecimal.lte(0)) {
    errors.push({
      code: 'INVALID_PRINCIPAL',
      message: 'Principal must be greater than 0',
      value: principal,
    })
  }

  if (rate < 0) {
    errors.push({
      code: 'INVALID_INTEREST_RATE',
      message: 'Interest rate must be a non-negative number',
      value: rate,
    })
  }

  if (rate > MAX_INTEREST_RATE) {
    errors.push({
      code: 'EXCESSIVE_INTEREST_RATE',
      message: `Interest rate cannot exceed ${MAX_INTEREST_RATE}%`,
      value: rate,
    })
  }

  if (term < MIN_LOAN_TERM || term > MAX_LOAN_TERM) {
    errors.push({
      code: 'INVALID_TERM',
      message: `Term must be between ${MIN_LOAN_TERM} and ${MAX_LOAN_TERM} months`,
      value: term,
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// =============================================================================
// Date Calculation Functions
// =============================================================================

/**
 * Calculate the number of payment periods per year for a given frequency
 */
export function getPaymentFrequencyPerYear(frequency: PaymentFrequency): number {
  switch (frequency) {
    case 'MONTHLY':
      return 12
    case 'BI_WEEKLY':
      return 26
    default:
      throw new Error(`Unsupported payment frequency: ${frequency}`)
  }
}

/**
 * Calculate time period between two dates
 */
export function calculateTimePeriod(startDate: Date, endDate: Date): TimePeriod {
  const days = differenceInDays(endDate, startDate)
  const months = differenceInMonths(endDate, startDate)
  const years = months / 12

  return {
    startDate,
    endDate,
    days,
    months,
    years,
  }
}

/**
 * Calculate next payment date based on frequency
 */
export function calculateNextPaymentDate(
  startDate: Date,
  frequency: PaymentFrequency,
  paymentNumber: number
): Date {
  switch (frequency) {
    case 'MONTHLY':
      return addMonths(startDate, paymentNumber)
    case 'BI_WEEKLY':
      return addWeeks(startDate, paymentNumber * 2)
    default:
      throw new Error(`Unsupported payment frequency: ${frequency}`)
  }
}

/**
 * Generate payment dates for a loan term
 */
export function generatePaymentDates(
  startDate: Date,
  frequency: PaymentFrequency,
  termMonths: number
): Date[] {
  const paymentsPerYear = getPaymentFrequencyPerYear(frequency)
  const totalPayments = Math.ceil((termMonths / 12) * paymentsPerYear)
  const dates: Date[] = []

  for (let i = 1; i <= totalPayments; i++) {
    dates.push(calculateNextPaymentDate(startDate, frequency, i))
  }

  return dates
}

/**
 * Convert annual interest rate to period rate
 */
export function getPeriodicRate(annualRate: number, frequency: PaymentFrequency): number {
  const paymentsPerYear = getPaymentFrequencyPerYear(frequency)
  return annualRate / 100 / paymentsPerYear
}

/**
 * Calculate total number of payments for a loan
 */
export function calculateTotalPayments(termMonths: number, frequency: PaymentFrequency): number {
  const paymentsPerYear = getPaymentFrequencyPerYear(frequency)
  return Math.ceil((termMonths / 12) * paymentsPerYear)
}

// =============================================================================
// Decimal/Monetary Utilities
// =============================================================================

/**
 * Round a decimal value according to the specified mode
 */
export function roundMoney(amount: Decimal, mode: RoundingMode = 'ROUND_NEAREST'): Decimal {
  switch (mode) {
    case 'ROUND_UP':
      return amount.ceil()
    case 'ROUND_DOWN':
      return amount.floor()
    case 'ROUND_NEAREST':
    default:
      return amount.toDP(2, Decimal.ROUND_HALF_UP)
  }
}

/**
 * Format a decimal amount as currency string
 */
export function formatCurrency(amount: Decimal | number): string {
  const value = typeof amount === 'number' ? amount : amount.toNumber()
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

/**
 * Convert number or string to Decimal with validation
 */
export function toDecimal(value: Decimal.Value): Decimal {
  try {
    return new Decimal(value)
  } catch (error) {
    throw new Error(`Invalid decimal value: ${value}`)
  }
}

/**
 * Safely add two decimal values
 */
export function addDecimals(a: Decimal, b: Decimal): Decimal {
  return a.add(b)
}

/**
 * Safely subtract two decimal values
 */
export function subtractDecimals(a: Decimal, b: Decimal): Decimal {
  return a.sub(b)
}

/**
 * Safely multiply two decimal values
 */
export function multiplyDecimals(a: Decimal, b: Decimal.Value): Decimal {
  return a.mul(b)
}

/**
 * Safely divide two decimal values with protection against division by zero
 */
export function divideDecimals(a: Decimal, b: Decimal.Value): Decimal {
  const divisor = new Decimal(b)
  if (divisor.isZero()) {
    throw new Error('Division by zero')
  }
  return a.div(divisor)
}

// =============================================================================
// Array and Collection Utilities
// =============================================================================

/**
 * Sum an array of decimal values
 */
export function sumDecimals(values: Decimal[]): Decimal {
  return values.reduce((sum, value) => addDecimals(sum, value), new Decimal(0))
}

/**
 * Find minimum value in array of decimals
 */
export function minDecimal(values: Decimal[]): Decimal {
  if (values.length === 0) throw new Error('Cannot find minimum of empty array')
  return values.reduce((min, value) => (value.lt(min) ? value : min))
}

/**
 * Find maximum value in array of decimals
 */
export function maxDecimal(values: Decimal[]): Decimal {
  if (values.length === 0) throw new Error('Cannot find maximum of empty array')
  return values.reduce((max, value) => (value.gt(max) ? value : max))
}

/**
 * Calculate average of decimal values
 */
export function averageDecimals(values: Decimal[]): Decimal {
  if (values.length === 0) throw new Error('Cannot calculate average of empty array')
  const sum = sumDecimals(values)
  return divideDecimals(sum, values.length)
}

// =============================================================================
// Error Handling Utilities
// =============================================================================

/**
 * Create a standardized calculation error
 */
export function createCalculationError(
  code: string,
  message: string,
  field?: string,
  value?: any
): CalculationError {
  return { code, message, field, value }
}

/**
 * Assert that a condition is true, throw calculation error if false
 */
export function assertCalculation(
  condition: boolean,
  code: string,
  message: string,
  field?: string,
  value?: any
): void {
  if (!condition) {
    throw new Error(`${code}: ${message}`)
  }
}

// =============================================================================
// Debug and Logging Utilities
// =============================================================================

/**
 * Format date for consistent logging
 */
export function formatDateForLog(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/**
 * Create calculation metadata for debugging
 */
export function createCalculationMetadata(
  calculationType: string,
  inputs: Record<string, any>
): Record<string, any> {
  return {
    calculationType,
    timestamp: new Date().toISOString(),
    inputs: { ...inputs },
    version: '1.0.0', // Could be pulled from package.json
  }
}