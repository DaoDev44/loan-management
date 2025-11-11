/**
 * Simple Interest Calculations
 * Formula: Interest = Principal × Rate × Time (I = P × r × t)
 */

import Decimal from 'decimal.js'
import type {
  LoanCalculationInput,
  PaymentCalculationInput,
  SimpleInterestResult,
  BalanceCalculationResult,
  TimePeriod,
  CalculationConfig,
} from './types'
import {
  validateLoanInput,
  validateCalculationParams,
  calculateTimePeriod,
  toDecimal,
  addDecimals,
  subtractDecimals,
  multiplyDecimals,
  divideDecimals,
  sumDecimals,
  roundMoney,
  createCalculationMetadata,
  DEFAULT_CONFIG,
} from './utils'

// =============================================================================
// Core Simple Interest Calculations
// =============================================================================

/**
 * Calculate simple interest using the formula I = P × r × t
 * @param principal - The principal amount (original loan amount)
 * @param annualRate - Annual interest rate as percentage (e.g., 5.5 for 5.5%)
 * @param timeInYears - Time period in years
 * @param config - Optional calculation configuration
 * @returns Simple interest calculation result
 */
export function calculateSimpleInterest(
  principal: number | Decimal,
  annualRate: number,
  timeInYears: number,
  config: CalculationConfig = DEFAULT_CONFIG
): SimpleInterestResult {
  // Convert and validate inputs
  const principalDecimal = toDecimal(principal)
  const validation = validateCalculationParams(principalDecimal, annualRate, timeInYears * 12)

  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.map((e) => e.message).join(', ')}`)
  }

  // Calculate simple interest: I = P × r × t
  const rateDecimal = toDecimal(annualRate / 100) // Convert percentage to decimal
  const timeDecimal = toDecimal(timeInYears)

  const simpleInterest = multiplyDecimals(
    multiplyDecimals(principalDecimal, rateDecimal),
    timeDecimal
  )

  const totalAmount = addDecimals(principalDecimal, simpleInterest)

  return {
    totalInterest: roundMoney(simpleInterest, config.roundingMode),
    calculationType: 'SIMPLE',
    calculatedAt: new Date(),
    principal: principalDecimal,
    rate: annualRate,
    timeInYears,
    simpleInterest: roundMoney(simpleInterest, config.roundingMode),
    totalAmount: roundMoney(totalAmount, config.roundingMode),
    metadata: createCalculationMetadata('simple-interest', {
      principal: principalDecimal.toString(),
      annualRate,
      timeInYears,
    }),
  }
}

/**
 * Calculate simple interest for a specific date range
 * @param principal - The principal amount
 * @param annualRate - Annual interest rate as percentage
 * @param startDate - Start date for interest calculation
 * @param endDate - End date for interest calculation
 * @param config - Optional calculation configuration
 * @returns Simple interest calculation result
 */
export function calculateSimpleInterestByDate(
  principal: number | Decimal,
  annualRate: number,
  startDate: Date,
  endDate: Date,
  config: CalculationConfig = DEFAULT_CONFIG
): SimpleInterestResult {
  const timePeriod = calculateTimePeriod(startDate, endDate)
  return calculateSimpleInterest(principal, annualRate, timePeriod.years, config)
}

/**
 * Calculate simple interest balance at a specific point in time
 * @param loan - Loan data for calculation
 * @param asOfDate - Date to calculate balance (defaults to current date)
 * @param config - Optional calculation configuration
 * @returns Current balance with accrued simple interest
 */
export function calculateSimpleInterestBalance(
  loan: LoanCalculationInput,
  asOfDate: Date = new Date(),
  config: CalculationConfig = DEFAULT_CONFIG
): BalanceCalculationResult {
  // Validate loan input
  const validation = validateLoanInput(loan)
  if (!validation.isValid) {
    throw new Error(`Loan validation failed: ${validation.errors.map((e) => e.message).join(', ')}`)
  }

  // Ensure we're calculating simple interest
  if (loan.interestCalculationType !== 'SIMPLE') {
    throw new Error('This function is only for simple interest loans')
  }

  // Calculate time from loan start to calculation date
  const timePeriod = calculateTimePeriod(loan.startDate, asOfDate)

  // Calculate accrued interest
  const interestResult = calculateSimpleInterest(
    loan.principal,
    loan.interestRate,
    timePeriod.years,
    config
  )

  // Current balance is original principal + accrued interest
  const currentBalance = addDecimals(loan.principal, interestResult.simpleInterest)

  return {
    currentBalance: roundMoney(currentBalance, config.roundingMode),
    principalPaid: new Decimal(0), // No payments considered in this calculation
    interestPaid: new Decimal(0),
    totalPaymentsMade: new Decimal(0),
    paymentsCount: 0,
    remainingPrincipal: loan.principal,
    nextPaymentDue: loan.endDate, // Simple interest typically has single payment at end
    isPaidOff: false,
    calculatedAt: new Date(),
  }
}

/**
 * Calculate current balance with payments for simple interest loan
 * @param loan - Loan data for calculation
 * @param payments - Array of payments made
 * @param asOfDate - Date to calculate balance (defaults to current date)
 * @param config - Optional calculation configuration
 * @returns Current balance accounting for payments
 */
export function calculateSimpleInterestBalanceWithPayments(
  loan: LoanCalculationInput,
  payments: PaymentCalculationInput[],
  asOfDate: Date = new Date(),
  config: CalculationConfig = DEFAULT_CONFIG
): BalanceCalculationResult {
  // Validate loan input
  const validation = validateLoanInput(loan)
  if (!validation.isValid) {
    throw new Error(`Loan validation failed: ${validation.errors.map((e) => e.message).join(', ')}`)
  }

  // Ensure we're calculating simple interest
  if (loan.interestCalculationType !== 'SIMPLE') {
    throw new Error('This function is only for simple interest loans')
  }

  // Filter payments up to the calculation date
  const relevantPayments = payments.filter((payment) => payment.date <= asOfDate)

  // Calculate accrued interest as of the calculation date
  const timePeriod = calculateTimePeriod(loan.startDate, asOfDate)
  const interestResult = calculateSimpleInterest(
    loan.principal,
    loan.interestRate,
    timePeriod.years,
    config
  )

  // Calculate total payments made
  const totalPaymentsMade = sumDecimals(relevantPayments.map((p) => p.amount))

  // For simple interest, payments typically reduce the total amount owed
  const totalAmountOwed = addDecimals(loan.principal, interestResult.simpleInterest)
  const currentBalance = subtractDecimals(totalAmountOwed, totalPaymentsMade)

  // Ensure balance doesn't go negative
  const finalBalance = currentBalance.lt(0) ? new Decimal(0) : currentBalance

  // For simple interest, we treat all payments as reducing the total debt
  // rather than allocating between principal and interest
  const principalPaid = totalPaymentsMade.gt(interestResult.simpleInterest)
    ? subtractDecimals(totalPaymentsMade, interestResult.simpleInterest)
    : new Decimal(0)

  const interestPaid = totalPaymentsMade.lt(interestResult.simpleInterest)
    ? totalPaymentsMade
    : interestResult.simpleInterest

  const remainingPrincipal = subtractDecimals(loan.principal, principalPaid)

  return {
    currentBalance: roundMoney(finalBalance, config.roundingMode),
    principalPaid: roundMoney(principalPaid, config.roundingMode),
    interestPaid: roundMoney(interestPaid, config.roundingMode),
    totalPaymentsMade: roundMoney(totalPaymentsMade, config.roundingMode),
    paymentsCount: relevantPayments.length,
    remainingPrincipal: roundMoney(remainingPrincipal, config.roundingMode),
    nextPaymentDue: finalBalance.gt(0) ? loan.endDate : undefined,
    isPaidOff: finalBalance.eq(0),
    calculatedAt: new Date(),
  }
}

// =============================================================================
// Simple Interest Utility Functions
// =============================================================================

/**
 * Calculate the principal amount given simple interest, rate, and time
 * Rearranged formula: P = I / (r × t)
 * @param interest - The interest amount
 * @param annualRate - Annual interest rate as percentage
 * @param timeInYears - Time period in years
 * @param config - Optional calculation configuration
 * @returns Principal amount
 */
export function calculatePrincipalFromInterest(
  interest: number | Decimal,
  annualRate: number,
  timeInYears: number,
  config: CalculationConfig = DEFAULT_CONFIG
): Decimal {
  const interestDecimal = toDecimal(interest)
  const rateDecimal = toDecimal(annualRate / 100)
  const timeDecimal = toDecimal(timeInYears)

  if (rateDecimal.eq(0) || timeDecimal.eq(0)) {
    throw new Error('Rate and time must be greater than zero')
  }

  const principal = divideDecimals(interestDecimal, multiplyDecimals(rateDecimal, timeDecimal))
  return roundMoney(principal, config.roundingMode)
}

/**
 * Calculate the interest rate given principal, interest, and time
 * Rearranged formula: r = I / (P × t)
 * @param principal - The principal amount
 * @param interest - The interest amount
 * @param timeInYears - Time period in years
 * @returns Annual interest rate as percentage
 */
export function calculateRateFromInterest(
  principal: number | Decimal,
  interest: number | Decimal,
  timeInYears: number
): number {
  const principalDecimal = toDecimal(principal)
  const interestDecimal = toDecimal(interest)
  const timeDecimal = toDecimal(timeInYears)

  if (principalDecimal.eq(0) || timeDecimal.eq(0)) {
    throw new Error('Principal and time must be greater than zero')
  }

  const rate = divideDecimals(interestDecimal, multiplyDecimals(principalDecimal, timeDecimal))
  return rate.mul(100).toNumber() // Convert to percentage
}

/**
 * Calculate the time period given principal, interest, and rate
 * Rearranged formula: t = I / (P × r)
 * @param principal - The principal amount
 * @param interest - The interest amount
 * @param annualRate - Annual interest rate as percentage
 * @returns Time period in years
 */
export function calculateTimeFromInterest(
  principal: number | Decimal,
  interest: number | Decimal,
  annualRate: number
): number {
  const principalDecimal = toDecimal(principal)
  const interestDecimal = toDecimal(interest)
  const rateDecimal = toDecimal(annualRate / 100)

  if (principalDecimal.eq(0) || rateDecimal.eq(0)) {
    throw new Error('Principal and rate must be greater than zero')
  }

  const time = divideDecimals(interestDecimal, multiplyDecimals(principalDecimal, rateDecimal))
  return time.toNumber()
}

/**
 * Calculate total amount for simple interest loan
 * @param principal - The principal amount
 * @param annualRate - Annual interest rate as percentage
 * @param timeInYears - Time period in years
 * @param config - Optional calculation configuration
 * @returns Total amount (principal + interest)
 */
export function calculateSimpleInterestTotal(
  principal: number | Decimal,
  annualRate: number,
  timeInYears: number,
  config: CalculationConfig = DEFAULT_CONFIG
): Decimal {
  const result = calculateSimpleInterest(principal, annualRate, timeInYears, config)
  return result.totalAmount
}

/**
 * Calculate effective annual rate for simple interest
 * For simple interest, this is just the nominal rate
 * @param annualRate - Annual interest rate as percentage
 * @returns Effective annual rate
 */
export function calculateSimpleInterestEAR(annualRate: number): number {
  return annualRate // Simple interest EAR = nominal rate
}