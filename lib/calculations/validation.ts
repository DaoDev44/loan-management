import { Decimal } from 'decimal.js'
import type { LoanParameters, ValidationError, PaymentRecord } from './types'

/**
 * Validate loan parameters for calculations
 */
export function validateLoanParameters(params: LoanParameters): ValidationError[] {
  const errors: ValidationError[] = []

  // Validate principal amount
  if (!params.principal || params.principal.isNaN() || params.principal.lte(0)) {
    errors.push({
      field: 'principal',
      message: 'Principal amount must be a positive number greater than 0',
      code: 'INVALID_PRINCIPAL',
    })
  }

  if (params.principal && params.principal.gt(100000000)) {
    errors.push({
      field: 'principal',
      message: 'Principal amount exceeds maximum allowed value',
      code: 'PRINCIPAL_TOO_LARGE',
    })
  }

  // Validate interest rate
  if (!params.interestRate || params.interestRate.isNaN() || params.interestRate.lt(0)) {
    errors.push({
      field: 'interestRate',
      message: 'Interest rate must be a non-negative number',
      code: 'INVALID_INTEREST_RATE',
    })
  }

  if (params.interestRate && params.interestRate.gt(100)) {
    errors.push({
      field: 'interestRate',
      message: 'Interest rate cannot exceed 100%',
      code: 'INTEREST_RATE_TOO_HIGH',
    })
  }

  // Validate term months
  if (!Number.isInteger(params.termMonths) || params.termMonths <= 0) {
    errors.push({
      field: 'termMonths',
      message: 'Loan term must be a positive integer (number of months)',
      code: 'INVALID_TERM_MONTHS',
    })
  }

  if (params.termMonths > 600) {
    // 50 years max
    errors.push({
      field: 'termMonths',
      message: 'Loan term cannot exceed 50 years (600 months)',
      code: 'TERM_TOO_LONG',
    })
  }

  // Validate payment frequency
  if (!['MONTHLY', 'BI_WEEKLY'].includes(params.paymentFrequency)) {
    errors.push({
      field: 'paymentFrequency',
      message: 'Payment frequency must be MONTHLY or BI_WEEKLY',
      code: 'INVALID_PAYMENT_FREQUENCY',
    })
  }

  // Validate calculation type
  if (!['SIMPLE', 'AMORTIZED', 'INTEREST_ONLY'].includes(params.calculationType)) {
    errors.push({
      field: 'calculationType',
      message: 'Calculation type must be SIMPLE, AMORTIZED, or INTEREST_ONLY',
      code: 'INVALID_CALCULATION_TYPE',
    })
  }

  return errors
}

/**
 * Validate payment records for balance calculations
 */
export function validatePaymentRecords(payments: PaymentRecord[]): ValidationError[] {
  const errors: ValidationError[] = []

  if (!Array.isArray(payments)) {
    errors.push({
      field: 'payments',
      message: 'Payments must be an array',
      code: 'INVALID_PAYMENTS_ARRAY',
    })
    return errors
  }

  payments.forEach((payment, index) => {
    // Validate payment amount
    if (!payment.amount || payment.amount.isNaN() || payment.amount.lte(0)) {
      errors.push({
        field: `payments[${index}].amount`,
        message: `Payment ${index + 1}: Amount must be a positive number`,
        code: 'INVALID_PAYMENT_AMOUNT',
      })
    }

    // Validate payment date
    if (!payment.date || !(payment.date instanceof Date) || isNaN(payment.date.getTime())) {
      errors.push({
        field: `payments[${index}].date`,
        message: `Payment ${index + 1}: Date must be a valid Date object`,
        code: 'INVALID_PAYMENT_DATE',
      })
    }
  })

  return errors
}

/**
 * Validate that a numeric value can be converted to Decimal
 */
export function validateDecimalConversion(value: unknown, fieldName: string): ValidationError[] {
  const errors: ValidationError[] = []

  try {
    const decimal = new Decimal(value as Decimal.Value)
    if (decimal.isNaN()) {
      errors.push({
        field: fieldName,
        message: `${fieldName} must be a valid number`,
        code: 'INVALID_NUMBER',
      })
    }
  } catch {
    errors.push({
      field: fieldName,
      message: `${fieldName} cannot be converted to a decimal number`,
      code: 'DECIMAL_CONVERSION_ERROR',
    })
  }

  return errors
}

/**
 * Helper function to ensure a value is a Decimal
 */
export function ensureDecimal(value: number | string | Decimal): Decimal {
  if (value instanceof Decimal) {
    return value
  }
  return new Decimal(value)
}
