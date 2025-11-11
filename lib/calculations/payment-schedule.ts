/**
 * Payment Schedule Generation
 * Unified interface for generating payment schedules across different interest calculation types
 */

import Decimal from 'decimal.js'
import type {
  LoanCalculationInput,
  PaymentCalculationInput,
  AmortizationSchedule,
  AmortizationPayment,
  BalanceCalculationResult,
  PaymentScheduleOptions,
  PaymentImpactAnalysis,
  CalculationConfig,
} from './types'
import {
  validateLoanInput,
  calculateNextPaymentDate,
  calculateTotalPayments,
  toDecimal,
  addDecimals,
  subtractDecimals,
  roundMoney,
  createCalculationMetadata,
  DEFAULT_CONFIG,
} from './utils'
import { calculateSimpleInterestBalanceWithPayments } from './simple-interest'
import { generateAmortizationSchedule, calculateAmortizedBalanceWithPayments } from './amortized'
import { generateInterestOnlySchedule, calculateInterestOnlyBalanceWithPayments } from './interest-only'

// =============================================================================
// Unified Payment Schedule Generation
// =============================================================================

/**
 * Generate payment schedule for any loan type
 * @param loan - Loan data for calculation
 * @param options - Schedule generation options
 * @param config - Optional calculation configuration
 * @returns Complete payment schedule
 */
export function generatePaymentSchedule(
  loan: LoanCalculationInput,
  options: PaymentScheduleOptions = {},
  config: CalculationConfig = DEFAULT_CONFIG
): AmortizationSchedule {
  // Validate loan input
  const validation = validateLoanInput(loan)
  if (!validation.isValid) {
    throw new Error(`Loan validation failed: ${validation.errors.map((e) => e.message).join(', ')}`)
  }

  const { includePastPayments = true, remainingOnly = false, maxPayments, startDate } = options

  let payments: AmortizationPayment[]
  let monthlyPayment: Decimal
  let totalInterest: Decimal

  // Generate schedule based on interest calculation type
  switch (loan.interestCalculationType) {
    case 'AMORTIZED': {
      const schedule = generateAmortizationSchedule(loan, config)
      payments = schedule.payments
      monthlyPayment = schedule.monthlyPayment
      totalInterest = schedule.summary.totalInterest
      break
    }

    case 'INTEREST_ONLY': {
      payments = generateInterestOnlySchedule(loan, config)
      // For interest-only, "monthly payment" is the interest payment
      monthlyPayment = payments.length > 0 ? payments[0].interestPortion : new Decimal(0)
      totalInterest = payments.reduce(
        (sum, payment) => addDecimals(sum, payment.interestPortion),
        new Decimal(0)
      )
      break
    }

    case 'SIMPLE': {
      // Simple interest typically has one payment at the end
      payments = generateSimpleInterestSchedule(loan, config)
      monthlyPayment = payments.length > 0 ? payments[payments.length - 1].paymentAmount : new Decimal(0)
      totalInterest = payments.reduce(
        (sum, payment) => addDecimals(sum, payment.interestPortion),
        new Decimal(0)
      )
      break
    }

    default:
      throw new Error(`Unsupported interest calculation type: ${loan.interestCalculationType}`)
  }

  // Apply options to filter payments
  let filteredPayments = payments

  if (remainingOnly && startDate) {
    filteredPayments = payments.filter((payment) => payment.dueDate > startDate)
  }

  if (!includePastPayments && startDate) {
    const today = startDate || new Date()
    filteredPayments = filteredPayments.filter((payment) => payment.dueDate >= today)
  }

  if (maxPayments) {
    filteredPayments = filteredPayments.slice(0, maxPayments)
  }

  return {
    loanId: loan.id,
    monthlyPayment: roundMoney(monthlyPayment, config.roundingMode),
    totalPayments: filteredPayments.length,
    frequency: loan.paymentFrequency,
    payments: filteredPayments,
    summary: {
      totalInterest: roundMoney(totalInterest, config.roundingMode),
      totalPayments: roundMoney(
        addDecimals(loan.principal, totalInterest),
        config.roundingMode
      ),
      termMonths: loan.termMonths,
    },
    calculatedAt: new Date(),
  }
}

/**
 * Generate simple interest payment schedule
 * (Helper function for simple interest loans)
 */
function generateSimpleInterestSchedule(
  loan: LoanCalculationInput,
  config: CalculationConfig = DEFAULT_CONFIG
): AmortizationPayment[] {
  // For simple interest, typically one payment at the end with principal + interest
  // But we can also support periodic interest payments if desired

  const totalPayments = calculateTotalPayments(loan.termMonths, loan.paymentFrequency)
  const payments: AmortizationPayment[] = []

  // Calculate simple interest for the full term
  const timeInYears = loan.termMonths / 12
  const rateDecimal = loan.interestRate / 100
  const simpleInterest = loan.principal.mul(rateDecimal).mul(timeInYears)

  // Single payment at end with principal + interest
  const finalPaymentAmount = addDecimals(loan.principal, simpleInterest)
  const finalDueDate = calculateNextPaymentDate(loan.startDate, loan.paymentFrequency, totalPayments)

  payments.push({
    paymentNumber: 1,
    dueDate: finalDueDate,
    paymentAmount: roundMoney(finalPaymentAmount, config.roundingMode),
    principalPortion: roundMoney(loan.principal, config.roundingMode),
    interestPortion: roundMoney(simpleInterest, config.roundingMode),
    remainingBalance: new Decimal(0),
    cumulativeInterest: roundMoney(simpleInterest, config.roundingMode),
    cumulativePrincipal: roundMoney(loan.principal, config.roundingMode),
  })

  return payments
}

// =============================================================================
// Current Balance Calculations (Unified Interface)
// =============================================================================

/**
 * Calculate current balance for any loan type with payments
 * @param loan - Loan data for calculation
 * @param payments - Array of payments made
 * @param asOfDate - Date to calculate balance (defaults to current date)
 * @param config - Optional calculation configuration
 * @returns Current balance accounting for payments
 */
export function calculateCurrentBalance(
  loan: LoanCalculationInput,
  payments: PaymentCalculationInput[] = [],
  asOfDate: Date = new Date(),
  config: CalculationConfig = DEFAULT_CONFIG
): BalanceCalculationResult {
  // Validate loan input
  const validation = validateLoanInput(loan)
  if (!validation.isValid) {
    throw new Error(`Loan validation failed: ${validation.errors.map((e) => e.message).join(', ')}`)
  }

  // Route to appropriate calculation based on interest type
  switch (loan.interestCalculationType) {
    case 'AMORTIZED':
      return calculateAmortizedBalanceWithPayments(loan, payments, asOfDate, config)

    case 'INTEREST_ONLY':
      return calculateInterestOnlyBalanceWithPayments(loan, payments, asOfDate, config)

    case 'SIMPLE':
      return calculateSimpleInterestBalanceWithPayments(loan, payments, asOfDate, config)

    default:
      throw new Error(`Unsupported interest calculation type: ${loan.interestCalculationType}`)
  }
}

// =============================================================================
// Payment Impact Analysis
// =============================================================================

/**
 * Analyze the impact of a payment on a loan
 * @param loan - Loan data
 * @param paymentAmount - Amount of the payment
 * @param paymentDate - Date of the payment
 * @param existingPayments - Existing payments on the loan
 * @param config - Optional calculation configuration
 * @returns Payment impact analysis
 */
export function analyzePaymentImpact(
  loan: LoanCalculationInput,
  paymentAmount: number | Decimal,
  paymentDate: Date = new Date(),
  existingPayments: PaymentCalculationInput[] = [],
  config: CalculationConfig = DEFAULT_CONFIG
): PaymentImpactAnalysis {
  const paymentDecimal = toDecimal(paymentAmount)

  // Calculate current balance before payment
  const currentBalanceResult = calculateCurrentBalance(loan, existingPayments, paymentDate, config)

  // Create simulated payment
  const simulatedPayment: PaymentCalculationInput = {
    id: 'simulated',
    amount: paymentDecimal,
    date: paymentDate,
    loanId: loan.id,
  }

  // Calculate balance after payment
  const newBalanceResult = calculateCurrentBalance(
    loan,
    [...existingPayments, simulatedPayment],
    paymentDate,
    config
  )

  // Calculate impact
  const originalBalance = currentBalanceResult.currentBalance
  const newBalance = newBalanceResult.currentBalance
  const principalReduction = subtractDecimals(
    currentBalanceResult.remainingPrincipal,
    newBalanceResult.remainingPrincipal
  )
  const interestPayment = subtractDecimals(paymentDecimal, principalReduction)

  // For amortized loans, calculate potential time savings
  let termReduction: number | undefined
  let newPayoffDate: Date | undefined
  let interestSaved: Decimal | undefined

  if (loan.interestCalculationType === 'AMORTIZED') {
    // Rough estimation of term reduction
    const schedule = generateAmortizationSchedule(loan, config)
    const remainingPayments = schedule.payments.filter(
      (p) => p.remainingBalance.gt(newBalance)
    )

    if (remainingPayments.length > 0) {
      const originalRemainingPayments = schedule.payments.filter(
        (p) => p.remainingBalance.gt(originalBalance)
      ).length

      termReduction = Math.max(0, originalRemainingPayments - remainingPayments.length)

      if (remainingPayments.length > 0) {
        newPayoffDate = remainingPayments[remainingPayments.length - 1].dueDate
      }

      // Calculate interest saved (simplified estimation)
      const savedPayments = schedule.payments.slice(-termReduction || 0)
      interestSaved = savedPayments.reduce(
        (sum, payment) => addDecimals(sum, payment.interestPortion),
        new Decimal(0)
      )
    }
  }

  return {
    originalBalance: roundMoney(originalBalance, config.roundingMode),
    newBalance: roundMoney(newBalance, config.roundingMode),
    principalReduction: roundMoney(principalReduction, config.roundingMode),
    interestPayment: roundMoney(interestPayment, config.roundingMode),
    interestSaved: interestSaved ? roundMoney(interestSaved, config.roundingMode) : undefined,
    termReduction,
    newPayoffDate,
  }
}

// =============================================================================
// Payment Calculation Utilities
// =============================================================================

/**
 * Calculate next payment due date for a loan
 * @param loan - Loan data
 * @param payments - Existing payments
 * @returns Next payment due date
 */
export function calculateNextPaymentDue(
  loan: LoanCalculationInput,
  payments: PaymentCalculationInput[] = []
): Date | undefined {
  const balanceResult = calculateCurrentBalance(loan, payments)
  return balanceResult.nextPaymentDue
}

/**
 * Calculate remaining payments for a loan
 * @param loan - Loan data
 * @param payments - Existing payments
 * @param config - Optional calculation configuration
 * @returns Number of remaining payments
 */
export function calculateRemainingPayments(
  loan: LoanCalculationInput,
  payments: PaymentCalculationInput[] = [],
  config: CalculationConfig = DEFAULT_CONFIG
): number {
  const schedule = generatePaymentSchedule(loan, {}, config)
  const balanceResult = calculateCurrentBalance(loan, payments)

  if (balanceResult.isPaidOff) {
    return 0
  }

  // Count payments where remaining balance > 0
  return schedule.payments.filter((payment) =>
    payment.remainingBalance.gt(balanceResult.currentBalance)
  ).length
}

/**
 * Calculate total interest remaining on a loan
 * @param loan - Loan data
 * @param payments - Existing payments
 * @param config - Optional calculation configuration
 * @returns Remaining interest amount
 */
export function calculateRemainingInterest(
  loan: LoanCalculationInput,
  payments: PaymentCalculationInput[] = [],
  config: CalculationConfig = DEFAULT_CONFIG
): Decimal {
  const schedule = generatePaymentSchedule(loan, {}, config)
  const balanceResult = calculateCurrentBalance(loan, payments)

  if (balanceResult.isPaidOff) {
    return new Decimal(0)
  }

  // Sum interest from remaining payments
  const remainingPayments = schedule.payments.filter((payment) =>
    payment.remainingBalance.gt(0) && payment.dueDate > new Date()
  )

  const remainingInterest = remainingPayments.reduce(
    (sum, payment) => addDecimals(sum, payment.interestPortion),
    new Decimal(0)
  )

  return roundMoney(remainingInterest, config.roundingMode)
}

/**
 * Generate payment summary for a loan
 * @param loan - Loan data
 * @param payments - Existing payments
 * @param config - Optional calculation configuration
 * @returns Comprehensive payment summary
 */
export function generatePaymentSummary(
  loan: LoanCalculationInput,
  payments: PaymentCalculationInput[] = [],
  config: CalculationConfig = DEFAULT_CONFIG
) {
  const balanceResult = calculateCurrentBalance(loan, payments, new Date(), config)
  const schedule = generatePaymentSchedule(loan, {}, config)
  const remainingInterest = calculateRemainingInterest(loan, payments, config)
  const remainingPayments = calculateRemainingPayments(loan, payments, config)

  return {
    // Current status
    currentBalance: balanceResult.currentBalance,
    totalPaid: balanceResult.totalPaymentsMade,
    principalPaid: balanceResult.principalPaid,
    interestPaid: balanceResult.interestPaid,
    paymentsCount: balanceResult.paymentsCount,
    isPaidOff: balanceResult.isPaidOff,

    // Remaining amounts
    remainingPrincipal: balanceResult.remainingPrincipal,
    remainingInterest,
    remainingPayments,
    nextPaymentDue: balanceResult.nextPaymentDue,

    // Schedule information
    originalSchedule: schedule,
    totalInterestOriginal: schedule.summary.totalInterest,
    totalPaymentsOriginal: schedule.summary.totalPayments,

    // Progress metrics
    percentPaidOff: loan.principal.gt(0)
      ? balanceResult.principalPaid.div(loan.principal).mul(100).toNumber()
      : 100,

    calculatedAt: balanceResult.calculatedAt,
  }
}