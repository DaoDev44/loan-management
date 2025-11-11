/**
 * Amortized Loan Calculations
 * Formula: M = P × [r(1+r)^n] / [(1+r)^n - 1]
 * Where: M = Monthly Payment, P = Principal, r = Monthly Rate, n = Number of Payments
 */

import Decimal from 'decimal.js'
import type { PaymentFrequency } from '@prisma/client'
import type {
  LoanCalculationInput,
  PaymentCalculationInput,
  AmortizationSchedule,
  AmortizationPayment,
  BalanceCalculationResult,
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
  roundMoney,
  createCalculationMetadata,
  DEFAULT_CONFIG,
} from './utils'

// =============================================================================
// Core Amortized Loan Calculations
// =============================================================================

/**
 * Calculate fixed payment amount for an amortized loan
 * Uses the standard amortization formula: M = P × [r(1+r)^n] / [(1+r)^n - 1]
 * @param principal - The principal amount (loan amount)
 * @param annualRate - Annual interest rate as percentage (e.g., 5.5 for 5.5%)
 * @param termMonths - Loan term in months
 * @param frequency - Payment frequency (MONTHLY or BI_WEEKLY)
 * @param config - Optional calculation configuration
 * @returns Fixed payment amount
 */
export function calculateMonthlyPayment(
  principal: Decimal.Value,
  annualRate: number,
  termMonths: number,
  frequency: PaymentFrequency = 'MONTHLY',
  config: CalculationConfig = DEFAULT_CONFIG
): Decimal {
  // Convert and validate inputs
  const principalDecimal = toDecimal(principal)
  const validation = validateCalculationParams(principalDecimal, annualRate, termMonths)

  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.map((e) => e.message).join(', ')}`)
  }

  // Handle zero interest rate (rare but possible)
  if (annualRate === 0) {
    const totalPayments = calculateTotalPayments(termMonths, frequency)
    return roundMoney(divideDecimals(principalDecimal, totalPayments), config.roundingMode)
  }

  // Calculate periodic interest rate and number of payments
  const periodicRate = getPeriodicRate(annualRate, frequency)
  const totalPayments = calculateTotalPayments(termMonths, frequency)

  const r = toDecimal(periodicRate)
  const n = toDecimal(totalPayments)

  // Calculate (1 + r)^n
  const onePlusR = addDecimals(new Decimal(1), r)
  const onePlusRPowerN = onePlusR.pow(n.toNumber())

  // Calculate the numerator: r × (1 + r)^n
  const numerator = multiplyDecimals(r, onePlusRPowerN)

  // Calculate the denominator: (1 + r)^n - 1
  const denominator = subtractDecimals(onePlusRPowerN, new Decimal(1))

  // Calculate payment: P × [numerator / denominator]
  const payment = multiplyDecimals(principalDecimal, divideDecimals(numerator, denominator))

  return roundMoney(payment, config.roundingMode)
}

/**
 * Generate complete amortization schedule for a loan
 * @param loan - Loan data for calculation
 * @param config - Optional calculation configuration
 * @returns Complete amortization schedule
 */
export function generateAmortizationSchedule(
  loan: LoanCalculationInput,
  config: CalculationConfig = DEFAULT_CONFIG
): AmortizationSchedule {
  // Validate loan input
  const validation = validateLoanInput(loan)
  if (!validation.isValid) {
    throw new Error(`Loan validation failed: ${validation.errors.map((e) => e.message).join(', ')}`)
  }

  // Ensure we're calculating amortized loan
  if (loan.interestCalculationType !== 'AMORTIZED') {
    throw new Error('This function is only for amortized loans')
  }

  // Calculate payment amount and total payments
  const monthlyPayment = calculateMonthlyPayment(
    loan.principal,
    loan.interestRate,
    loan.termMonths,
    loan.paymentFrequency,
    config
  )

  const totalPayments = calculateTotalPayments(loan.termMonths, loan.paymentFrequency)
  const periodicRate = getPeriodicRate(loan.interestRate, loan.paymentFrequency)

  // Generate payment schedule
  const payments: AmortizationPayment[] = []
  let remainingBalance = loan.principal
  let cumulativeInterest = new Decimal(0)
  let cumulativePrincipal = new Decimal(0)

  for (let paymentNumber = 1; paymentNumber <= totalPayments; paymentNumber++) {
    // Calculate interest portion for this payment
    const interestPortion = multiplyDecimals(remainingBalance, periodicRate)

    // Calculate principal portion
    let principalPortion = subtractDecimals(monthlyPayment, interestPortion)

    // Handle final payment - ensure we don't overpay
    if (principalPortion.gt(remainingBalance)) {
      principalPortion = remainingBalance
    }

    // Update remaining balance
    remainingBalance = subtractDecimals(remainingBalance, principalPortion)

    // Update cumulative amounts
    cumulativeInterest = addDecimals(cumulativeInterest, interestPortion)
    cumulativePrincipal = addDecimals(cumulativePrincipal, principalPortion)

    // Calculate due date
    const dueDate = calculateNextPaymentDate(loan.startDate, loan.paymentFrequency, paymentNumber)

    // Calculate actual payment amount for this payment (might be different for final payment)
    const actualPaymentAmount = addDecimals(principalPortion, interestPortion)

    payments.push({
      paymentNumber,
      dueDate,
      paymentAmount: roundMoney(actualPaymentAmount, config.roundingMode),
      principalPortion: roundMoney(principalPortion, config.roundingMode),
      interestPortion: roundMoney(interestPortion, config.roundingMode),
      remainingBalance: roundMoney(remainingBalance, config.roundingMode),
      cumulativeInterest: roundMoney(cumulativeInterest, config.roundingMode),
      cumulativePrincipal: roundMoney(cumulativePrincipal, config.roundingMode),
    })

    // Break if loan is paid off
    if (remainingBalance.lte(0)) {
      break
    }
  }

  return {
    loanId: loan.id,
    monthlyPayment: roundMoney(monthlyPayment, config.roundingMode),
    totalPayments: payments.length,
    frequency: loan.paymentFrequency,
    payments,
    summary: {
      totalInterest: roundMoney(cumulativeInterest, config.roundingMode),
      totalPayments: roundMoney(addDecimals(loan.principal, cumulativeInterest), config.roundingMode),
      termMonths: loan.termMonths,
    },
    calculatedAt: new Date(),
  }
}

/**
 * Calculate remaining balance after a number of payments
 * @param principal - Original loan amount
 * @param annualRate - Annual interest rate as percentage
 * @param termMonths - Total loan term in months
 * @param paymentsMade - Number of payments already made
 * @param frequency - Payment frequency
 * @param config - Optional calculation configuration
 * @returns Remaining balance
 */
export function calculateRemainingBalance(
  principal: Decimal.Value,
  annualRate: number,
  termMonths: number,
  paymentsMade: number,
  frequency: PaymentFrequency = 'MONTHLY',
  config: CalculationConfig = DEFAULT_CONFIG
): Decimal {
  const principalDecimal = toDecimal(principal)

  // Calculate monthly payment
  const monthlyPayment = calculateMonthlyPayment(
    principalDecimal,
    annualRate,
    termMonths,
    frequency,
    config
  )

  const periodicRate = getPeriodicRate(annualRate, frequency)
  const totalPayments = calculateTotalPayments(termMonths, frequency)

  // Handle zero interest rate
  if (annualRate === 0) {
    const paymentAmount = divideDecimals(principalDecimal, totalPayments)
    const paidAmount = multiplyDecimals(paymentAmount, paymentsMade)
    return roundMoney(subtractDecimals(principalDecimal, paidAmount), config.roundingMode)
  }

  const r = toDecimal(periodicRate)
  const n = toDecimal(totalPayments)
  const p = toDecimal(paymentsMade)

  // Remaining balance formula: B = P × [(1+r)^n - (1+r)^p] / [(1+r)^n - 1]
  const onePlusR = addDecimals(new Decimal(1), r)
  const onePlusRPowerN = onePlusR.pow(n.toNumber())
  const onePlusRPowerP = onePlusR.pow(p.toNumber())

  const numerator = subtractDecimals(onePlusRPowerN, onePlusRPowerP)
  const denominator = subtractDecimals(onePlusRPowerN, new Decimal(1))

  const remainingBalance = multiplyDecimals(principalDecimal, divideDecimals(numerator, denominator))

  return roundMoney(remainingBalance, config.roundingMode)
}

/**
 * Calculate current balance with payments for amortized loan
 * @param loan - Loan data for calculation
 * @param payments - Array of payments made
 * @param asOfDate - Date to calculate balance (defaults to current date)
 * @param config - Optional calculation configuration
 * @returns Current balance accounting for payments
 */
export function calculateAmortizedBalanceWithPayments(
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

  // Ensure we're calculating amortized loan
  if (loan.interestCalculationType !== 'AMORTIZED') {
    throw new Error('This function is only for amortized loans')
  }

  // Generate the full amortization schedule
  const schedule = generateAmortizationSchedule(loan, config)

  // Filter payments up to the calculation date
  const relevantPayments = payments.filter((payment) => payment.date <= asOfDate)

  // Sort payments by date
  const sortedPayments = [...relevantPayments].sort((a, b) => a.date.getTime() - b.date.getTime())

  // Track balance and payment allocation
  let currentBalance = loan.principal
  let totalInterestPaid = new Decimal(0)
  let totalPrincipalPaid = new Decimal(0)
  let totalPaymentsMade = new Decimal(0)

  const periodicRate = getPeriodicRate(loan.interestRate, loan.paymentFrequency)

  // Process each payment against the scheduled amortization
  for (const payment of sortedPayments) {
    if (currentBalance.lte(0)) break

    // Calculate interest owed on current balance
    const interestOwed = multiplyDecimals(currentBalance, periodicRate)

    // Allocate payment between interest and principal
    let interestPayment = payment.amount.lt(interestOwed) ? payment.amount : interestOwed
    let principalPayment = subtractDecimals(payment.amount, interestPayment)

    // Ensure we don't pay more principal than owed
    if (principalPayment.gt(currentBalance)) {
      principalPayment = currentBalance
    }

    // Update balances
    currentBalance = subtractDecimals(currentBalance, principalPayment)
    totalInterestPaid = addDecimals(totalInterestPaid, interestPayment)
    totalPrincipalPaid = addDecimals(totalPrincipalPaid, principalPayment)
    totalPaymentsMade = addDecimals(totalPaymentsMade, payment.amount)
  }

  // Determine next payment due date
  let nextPaymentDue: Date | undefined
  if (currentBalance.gt(0)) {
    const paymentsCount = sortedPayments.length
    nextPaymentDue = calculateNextPaymentDate(
      loan.startDate,
      loan.paymentFrequency,
      paymentsCount + 1
    )
  }

  return {
    currentBalance: roundMoney(currentBalance, config.roundingMode),
    principalPaid: roundMoney(totalPrincipalPaid, config.roundingMode),
    interestPaid: roundMoney(totalInterestPaid, config.roundingMode),
    totalPaymentsMade: roundMoney(totalPaymentsMade, config.roundingMode),
    paymentsCount: sortedPayments.length,
    remainingPrincipal: roundMoney(currentBalance, config.roundingMode),
    nextPaymentDue,
    isPaidOff: currentBalance.eq(0),
    calculatedAt: new Date(),
  }
}

// =============================================================================
// Amortized Loan Utility Functions
// =============================================================================

/**
 * Calculate total interest for an amortized loan
 * @param principal - The principal amount
 * @param annualRate - Annual interest rate as percentage
 * @param termMonths - Loan term in months
 * @param frequency - Payment frequency
 * @param config - Optional calculation configuration
 * @returns Total interest amount
 */
export function calculateTotalInterest(
  principal: number | Decimal,
  annualRate: number,
  termMonths: number,
  frequency: PaymentFrequency = 'MONTHLY',
  config: CalculationConfig = DEFAULT_CONFIG
): Decimal {
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termMonths, frequency, config)
  const totalPayments = calculateTotalPayments(termMonths, frequency)
  const totalPaymentAmount = multiplyDecimals(monthlyPayment, totalPayments)
  const principalDecimal = toDecimal(principal)

  return roundMoney(subtractDecimals(totalPaymentAmount, principalDecimal), config.roundingMode)
}

/**
 * Calculate effective annual rate (APR) for amortized loan
 * @param annualRate - Annual interest rate as percentage
 * @param frequency - Payment frequency
 * @returns Effective annual rate
 */
export function calculateAmortizedAPR(
  annualRate: number,
  frequency: PaymentFrequency = 'MONTHLY'
): number {
  const periodicRate = getPeriodicRate(annualRate, frequency)
  const periodsPerYear = getPaymentFrequencyPerYear(frequency)

  // APR = (1 + periodic rate)^periods per year - 1
  const apr = Math.pow(1 + periodicRate, periodsPerYear) - 1
  return apr * 100 // Convert to percentage
}

/**
 * Calculate loan amount given payment, rate, and term
 * Reverse of the payment calculation
 * @param payment - Desired payment amount
 * @param annualRate - Annual interest rate as percentage
 * @param termMonths - Loan term in months
 * @param frequency - Payment frequency
 * @param config - Optional calculation configuration
 * @returns Loan amount (principal)
 */
export function calculateLoanAmountFromPayment(
  payment: number | Decimal,
  annualRate: number,
  termMonths: number,
  frequency: PaymentFrequency = 'MONTHLY',
  config: CalculationConfig = DEFAULT_CONFIG
): Decimal {
  const paymentDecimal = toDecimal(payment)

  // Handle zero interest rate
  if (annualRate === 0) {
    const totalPayments = calculateTotalPayments(termMonths, frequency)
    return roundMoney(multiplyDecimals(paymentDecimal, totalPayments), config.roundingMode)
  }

  const periodicRate = getPeriodicRate(annualRate, frequency)
  const totalPayments = calculateTotalPayments(termMonths, frequency)

  const r = toDecimal(periodicRate)
  const n = toDecimal(totalPayments)

  // Calculate (1 + r)^n
  const onePlusR = addDecimals(new Decimal(1), r)
  const onePlusRPowerN = onePlusR.pow(n.toNumber())

  // Calculate the numerator: r × (1 + r)^n
  const numerator = multiplyDecimals(r, onePlusRPowerN)

  // Calculate the denominator: (1 + r)^n - 1
  const denominator = subtractDecimals(onePlusRPowerN, new Decimal(1))

  // Calculate principal: Payment × [denominator / numerator]
  const principal = multiplyDecimals(paymentDecimal, divideDecimals(denominator, numerator))

  return roundMoney(principal, config.roundingMode)
}