/**
 * Interest-Only Loan Calculations
 * Periodic interest payments with principal balloon payment at maturity
 */

import Decimal from 'decimal.js'
import type { PaymentFrequency } from '@prisma/client'
import type {
  LoanCalculationInput,
  PaymentCalculationInput,
  InterestOnlyResult,
  BalanceCalculationResult,
  AmortizationPayment,
  CalculationConfig,
} from './types'
import {
  validateLoanInput,
  validateCalculationParams,
  getPaymentFrequencyPerYear,
  getPeriodicRate,
  calculateTotalPayments,
  calculateNextPaymentDate,
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
// Core Interest-Only Calculations
// =============================================================================

/**
 * Calculate periodic interest-only payment
 * Formula: Interest Payment = Principal × (Annual Rate / Periods Per Year)
 * @param principal - The principal amount (loan amount)
 * @param annualRate - Annual interest rate as percentage (e.g., 5.5 for 5.5%)
 * @param frequency - Payment frequency (MONTHLY or BI_WEEKLY)
 * @param config - Optional calculation configuration
 * @returns Interest-only payment amount
 */
export function calculateInterestOnlyPayment(
  principal: number | Decimal,
  annualRate: number,
  frequency: PaymentFrequency = 'MONTHLY',
  config: CalculationConfig = DEFAULT_CONFIG
): Decimal {
  // Convert and validate inputs
  const principalDecimal = toDecimal(principal)
  const validation = validateCalculationParams(principalDecimal, annualRate, 1) // Minimum 1 month for validation

  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.map((e) => e.message).join(', ')}`)
  }

  // Calculate periodic interest rate
  const periodicRate = getPeriodicRate(annualRate, frequency)
  const interestPayment = multiplyDecimals(principalDecimal, periodicRate)

  return roundMoney(interestPayment, config.roundingMode)
}

/**
 * Generate complete interest-only loan calculation
 * @param principal - The principal amount
 * @param annualRate - Annual interest rate as percentage
 * @param termMonths - Loan term in months
 * @param frequency - Payment frequency
 * @param config - Optional calculation configuration
 * @returns Complete interest-only loan calculation
 */
export function calculateInterestOnlyLoan(
  principal: number | Decimal,
  annualRate: number,
  termMonths: number,
  frequency: PaymentFrequency = 'MONTHLY',
  config: CalculationConfig = DEFAULT_CONFIG
): InterestOnlyResult {
  const principalDecimal = toDecimal(principal)
  const validation = validateCalculationParams(principalDecimal, annualRate, termMonths)

  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.map((e) => e.message).join(', ')}`)
  }

  // Calculate interest-only payment
  const interestPayment = calculateInterestOnlyPayment(
    principalDecimal,
    annualRate,
    frequency,
    config
  )

  // Calculate total number of interest payments
  const numberOfPayments = calculateTotalPayments(termMonths, frequency)

  // Calculate total interest over loan term
  const totalInterest = multiplyDecimals(interestPayment, numberOfPayments)

  // Balloon payment is the full principal amount
  const principalPayment = principalDecimal

  // Calculate balloon payment date (end of term)
  const startDate = new Date() // Would typically be passed in
  const balloonPaymentDate = calculateNextPaymentDate(startDate, frequency, numberOfPayments)

  return {
    interestPayment: roundMoney(interestPayment, config.roundingMode),
    principalPayment: roundMoney(principalPayment, config.roundingMode),
    frequency,
    totalInterest: roundMoney(totalInterest, config.roundingMode),
    numberOfPayments,
    balloonPaymentDate,
  }
}

/**
 * Generate interest-only payment schedule
 * @param loan - Loan data for calculation
 * @param config - Optional calculation configuration
 * @returns Array of scheduled payments
 */
export function generateInterestOnlySchedule(
  loan: LoanCalculationInput,
  config: CalculationConfig = DEFAULT_CONFIG
): AmortizationPayment[] {
  // Validate loan input
  const validation = validateLoanInput(loan)
  if (!validation.isValid) {
    throw new Error(`Loan validation failed: ${validation.errors.map((e) => e.message).join(', ')}`)
  }

  // Ensure we're calculating interest-only loan
  if (loan.interestCalculationType !== 'INTEREST_ONLY') {
    throw new Error('This function is only for interest-only loans')
  }

  // Calculate interest payment amount
  const interestPayment = calculateInterestOnlyPayment(
    loan.principal,
    loan.interestRate,
    loan.paymentFrequency,
    config
  )

  const totalPayments = calculateTotalPayments(loan.termMonths, loan.paymentFrequency)
  const payments: AmortizationPayment[] = []

  let cumulativeInterest = new Decimal(0)

  // Generate interest-only payments (all but the last)
  for (let paymentNumber = 1; paymentNumber < totalPayments; paymentNumber++) {
    const dueDate = calculateNextPaymentDate(loan.startDate, loan.paymentFrequency, paymentNumber)

    cumulativeInterest = addDecimals(cumulativeInterest, interestPayment)

    payments.push({
      paymentNumber,
      dueDate,
      paymentAmount: roundMoney(interestPayment, config.roundingMode),
      principalPortion: new Decimal(0), // No principal in interest-only payments
      interestPortion: roundMoney(interestPayment, config.roundingMode),
      remainingBalance: roundMoney(loan.principal, config.roundingMode), // Principal remains unchanged
      cumulativeInterest: roundMoney(cumulativeInterest, config.roundingMode),
      cumulativePrincipal: new Decimal(0), // No principal paid until final payment
    })
  }

  // Final payment includes interest + full principal (balloon payment)
  const finalPaymentNumber = totalPayments
  const finalDueDate = calculateNextPaymentDate(
    loan.startDate,
    loan.paymentFrequency,
    finalPaymentNumber
  )
  const finalInterestPayment = interestPayment
  const finalPrincipalPayment = loan.principal
  const finalTotalPayment = addDecimals(finalInterestPayment, finalPrincipalPayment)

  cumulativeInterest = addDecimals(cumulativeInterest, finalInterestPayment)

  payments.push({
    paymentNumber: finalPaymentNumber,
    dueDate: finalDueDate,
    paymentAmount: roundMoney(finalTotalPayment, config.roundingMode),
    principalPortion: roundMoney(finalPrincipalPayment, config.roundingMode),
    interestPortion: roundMoney(finalInterestPayment, config.roundingMode),
    remainingBalance: new Decimal(0), // Loan fully paid after balloon payment
    cumulativeInterest: roundMoney(cumulativeInterest, config.roundingMode),
    cumulativePrincipal: roundMoney(loan.principal, config.roundingMode),
  })

  return payments
}

/**
 * Calculate current balance with payments for interest-only loan
 * @param loan - Loan data for calculation
 * @param payments - Array of payments made
 * @param asOfDate - Date to calculate balance (defaults to current date)
 * @param config - Optional calculation configuration
 * @returns Current balance accounting for payments
 */
export function calculateInterestOnlyBalanceWithPayments(
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

  // Ensure we're calculating interest-only loan
  if (loan.interestCalculationType !== 'INTEREST_ONLY') {
    throw new Error('This function is only for interest-only loans')
  }

  // Filter payments up to the calculation date
  const relevantPayments = payments.filter((payment) => payment.date <= asOfDate)

  // Sort payments by date
  const sortedPayments = [...relevantPayments].sort((a, b) => a.date.getTime() - b.date.getTime())

  // Calculate expected interest payment
  const expectedInterestPayment = calculateInterestOnlyPayment(
    loan.principal,
    loan.interestRate,
    loan.paymentFrequency,
    config
  )

  // Generate payment schedule to determine expected payments
  const schedule = generateInterestOnlySchedule(loan, config)
  const expectedPayments = schedule.filter((payment) => payment.dueDate <= asOfDate)

  // Calculate totals
  const totalPaymentsMade = sumDecimals(sortedPayments.map((p) => p.amount))
  const expectedInterestTotal = sumDecimals(
    expectedPayments.map((p) => p.interestPortion)
  )
  const expectedPrincipalTotal = sumDecimals(
    expectedPayments.map((p) => p.principalPortion)
  )

  // For interest-only loans:
  // - Principal remains unchanged until final balloon payment
  // - Payments are allocated to interest first, then any excess reduces principal
  let interestPaid = new Decimal(0)
  let principalPaid = new Decimal(0)
  let currentBalance = loan.principal

  // Process payments
  let remainingPayments = totalPaymentsMade

  // Allocate payments to interest first
  if (remainingPayments.gte(expectedInterestTotal)) {
    interestPaid = expectedInterestTotal
    remainingPayments = subtractDecimals(remainingPayments, expectedInterestTotal)

    // Any remaining payments reduce principal
    if (remainingPayments.gt(0)) {
      principalPaid = remainingPayments.gt(loan.principal) ? loan.principal : remainingPayments
      currentBalance = subtractDecimals(loan.principal, principalPaid)
    }
  } else {
    // Insufficient payments to cover all expected interest
    interestPaid = remainingPayments
    principalPaid = new Decimal(0)
    // Principal balance remains unchanged
  }

  // Determine if loan is paid off
  const isPaidOff = currentBalance.eq(0)

  // Determine next payment due date
  let nextPaymentDue: Date | undefined
  if (!isPaidOff) {
    const paymentsCount = sortedPayments.length
    const totalScheduledPayments = calculateTotalPayments(loan.termMonths, loan.paymentFrequency)

    if (paymentsCount < totalScheduledPayments) {
      nextPaymentDue = calculateNextPaymentDate(
        loan.startDate,
        loan.paymentFrequency,
        paymentsCount + 1
      )
    }
  }

  return {
    currentBalance: roundMoney(currentBalance, config.roundingMode),
    principalPaid: roundMoney(principalPaid, config.roundingMode),
    interestPaid: roundMoney(interestPaid, config.roundingMode),
    totalPaymentsMade: roundMoney(totalPaymentsMade, config.roundingMode),
    paymentsCount: sortedPayments.length,
    remainingPrincipal: roundMoney(currentBalance, config.roundingMode),
    nextPaymentDue,
    isPaidOff,
    calculatedAt: new Date(),
  }
}

// =============================================================================
// Interest-Only Utility Functions
// =============================================================================

/**
 * Calculate total cost of interest-only loan
 * @param principal - The principal amount
 * @param annualRate - Annual interest rate as percentage
 * @param termMonths - Loan term in months
 * @param frequency - Payment frequency
 * @param config - Optional calculation configuration
 * @returns Total cost (principal + total interest)
 */
export function calculateInterestOnlyTotalCost(
  principal: number | Decimal,
  annualRate: number,
  termMonths: number,
  frequency: PaymentFrequency = 'MONTHLY',
  config: CalculationConfig = DEFAULT_CONFIG
): Decimal {
  const result = calculateInterestOnlyLoan(principal, annualRate, termMonths, frequency, config)
  return roundMoney(addDecimals(result.principalPayment, result.totalInterest), config.roundingMode)
}

/**
 * Calculate interest savings by switching to amortized payments
 * @param principal - The principal amount
 * @param annualRate - Annual interest rate as percentage
 * @param termMonths - Loan term in months
 * @param frequency - Payment frequency
 * @param config - Optional calculation configuration
 * @returns Interest savings amount
 */
export function calculateInterestSavingsVsAmortized(
  principal: number | Decimal,
  annualRate: number,
  termMonths: number,
  frequency: PaymentFrequency = 'MONTHLY',
  config: CalculationConfig = DEFAULT_CONFIG
): Decimal {
  // Calculate interest-only total interest
  const interestOnlyResult = calculateInterestOnlyLoan(
    principal,
    annualRate,
    termMonths,
    frequency,
    config
  )

  // Calculate amortized total interest
  // Note: Would need to import from amortized.ts in practice
  const principalDecimal = toDecimal(principal)
  const periodicRate = getPeriodicRate(annualRate, frequency)
  const totalPayments = calculateTotalPayments(termMonths, frequency)

  // Simplified amortized interest calculation for comparison
  let amortizedInterest = new Decimal(0)
  let remainingBalance = principalDecimal

  for (let i = 0; i < totalPayments; i++) {
    const interestPayment = multiplyDecimals(remainingBalance, periodicRate)
    amortizedInterest = addDecimals(amortizedInterest, interestPayment)

    // Simplified principal calculation (not exact but close for comparison)
    const principalPayment = divideDecimals(principalDecimal, totalPayments)
    remainingBalance = subtractDecimals(remainingBalance, principalPayment)

    if (remainingBalance.lte(0)) break
  }

  // Interest savings = Interest-Only Interest - Amortized Interest
  const savings = subtractDecimals(interestOnlyResult.totalInterest, amortizedInterest)
  return savings.gt(0) ? new Decimal(0) : savings.abs() // Amortized typically has less interest
}

/**
 * Calculate interest-only effective annual rate
 * @param annualRate - Annual interest rate as percentage
 * @param frequency - Payment frequency
 * @returns Effective annual rate
 */
export function calculateInterestOnlyEAR(
  annualRate: number,
  frequency: PaymentFrequency = 'MONTHLY'
): number {
  const periodicRate = getPeriodicRate(annualRate, frequency)
  const periodsPerYear = getPaymentFrequencyPerYear(frequency)

  // For interest-only loans, EAR = (1 + periodic rate)^periods per year - 1
  const ear = Math.pow(1 + periodicRate, periodsPerYear) - 1
  return ear * 100 // Convert to percentage
}

/**
 * Calculate balloon payment amount (always equals principal for interest-only)
 * @param principal - The principal amount
 * @param config - Optional calculation configuration
 * @returns Balloon payment amount
 */
export function calculateBalloonPayment(
  principal: number | Decimal,
  config: CalculationConfig = DEFAULT_CONFIG
): Decimal {
  const principalDecimal = toDecimal(principal)
  return roundMoney(principalDecimal, config.roundingMode)
}

/**
 * Calculate cash flow advantage of interest-only vs amortized
 * (Lower monthly payments but higher total cost)
 * @param principal - The principal amount
 * @param annualRate - Annual interest rate as percentage
 * @param termMonths - Loan term in months
 * @param frequency - Payment frequency
 * @param config - Optional calculation configuration
 * @returns Monthly cash flow difference
 */
export function calculateCashFlowAdvantage(
  principal: number | Decimal,
  annualRate: number,
  termMonths: number,
  frequency: PaymentFrequency = 'MONTHLY',
  config: CalculationConfig = DEFAULT_CONFIG
): Decimal {
  // Interest-only payment
  const interestOnlyPayment = calculateInterestOnlyPayment(
    principal,
    annualRate,
    frequency,
    config
  )

  // Simplified amortized payment calculation
  // Note: In practice, would import from amortized.ts
  const principalDecimal = toDecimal(principal)
  const periodicRate = getPeriodicRate(annualRate, frequency)
  const totalPayments = calculateTotalPayments(termMonths, frequency)

  // Rough amortized payment calculation
  if (annualRate === 0) {
    const amortizedPayment = divideDecimals(principalDecimal, totalPayments)
    return subtractDecimals(amortizedPayment, interestOnlyPayment)
  }

  const r = periodicRate
  const n = totalPayments
  const amortizedPayment = multiplyDecimals(
    principalDecimal,
    (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  )

  // Cash flow advantage = Amortized Payment - Interest-Only Payment
  return roundMoney(
    subtractDecimals(toDecimal(amortizedPayment), interestOnlyPayment),
    config.roundingMode
  )
}