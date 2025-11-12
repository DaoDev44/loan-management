import { Decimal } from 'decimal.js'
import {
  InterestCalculationStrategy,
  type LoanParameters,
  type PaymentCalculation,
  type AmortizationSchedule,
  type BalanceCalculation,
  type PaymentRecord,
  type ValidationError,
  type CalculationResult,
} from './types'
import { validateLoanParameters, validatePaymentRecords } from './validation'

/**
 * Interest-Only Loan Calculation Strategy
 * Only interest is paid periodically, principal is paid as balloon payment at the end
 */
export class InterestOnlyStrategy extends InterestCalculationStrategy {
  readonly type = 'INTEREST_ONLY' as const

  /**
   * Calculate payment amount for interest-only loan
   */
  calculatePayment(params: LoanParameters): CalculationResult<PaymentCalculation> {
    const validationErrors = this.validateParameters(params)
    if (validationErrors.length > 0) {
      return { success: false, errors: validationErrors }
    }

    try {
      const { principal, interestRate, termMonths, paymentFrequency } = params

      const totalPayments = this.getTotalPayments(termMonths, paymentFrequency)
      const periodicRate = this.getPeriodicRate(interestRate, paymentFrequency)

      // Interest-only payment = Principal × Periodic Rate
      const interestOnlyPayment = principal.times(periodicRate)

      // Total interest = Interest payment × Number of payments
      const totalInterest = interestOnlyPayment.times(totalPayments)

      // Total amount = Principal + Total Interest (principal paid at end)
      const totalAmount = principal.plus(totalInterest)

      const result: PaymentCalculation = {
        paymentAmount: interestOnlyPayment.toDecimalPlaces(2),
        totalPayments,
        paymentFrequency,
        totalInterest: totalInterest.toDecimalPlaces(2),
        totalAmount: totalAmount.toDecimalPlaces(2),
      }

      return { success: true, data: result }
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            field: 'calculation',
            message: `Interest-only calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            code: 'CALCULATION_ERROR',
          },
        ],
      }
    }
  }

  /**
   * Generate amortization schedule for interest-only loan
   */
  generateSchedule(params: LoanParameters): CalculationResult<AmortizationSchedule> {
    const paymentResult = this.calculatePayment(params)
    if (!paymentResult.success) {
      return paymentResult
    }

    try {
      const payment = paymentResult.data
      const interestOnlyPayment = payment.paymentAmount

      const payments = []
      let cumulativeInterest = new Decimal(0)

      // Generate interest-only payments (principal stays the same)
      for (let i = 1; i <= payment.totalPayments; i++) {
        const isLastPayment = i === payment.totalPayments

        const interestAmount = interestOnlyPayment
        const principalAmount = isLastPayment ? params.principal : new Decimal(0)
        const totalPaymentAmount = isLastPayment
          ? interestAmount.plus(principalAmount) // Balloon payment
          : interestAmount

        const remainingBalance = isLastPayment ? new Decimal(0) : params.principal

        cumulativeInterest = cumulativeInterest.plus(interestAmount)

        payments.push({
          paymentNumber: i,
          paymentAmount: totalPaymentAmount.toDecimalPlaces(2),
          principalAmount: principalAmount.toDecimalPlaces(2),
          interestAmount: interestAmount.toDecimalPlaces(2),
          remainingBalance: remainingBalance.toDecimalPlaces(2),
          cumulativeInterest: cumulativeInterest.toDecimalPlaces(2),
        })
      }

      const result: AmortizationSchedule = {
        payments,
        summary: {
          totalPayments: payment.totalPayments,
          totalInterest: payment.totalInterest,
          totalAmount: payment.totalAmount,
          averagePayment: payment.totalAmount.dividedBy(payment.totalPayments), // Average includes balloon
        },
      }

      return { success: true, data: result }
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            field: 'schedule',
            message: `Schedule generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            code: 'SCHEDULE_GENERATION_ERROR',
          },
        ],
      }
    }
  }

  /**
   * Calculate current balance for interest-only loan with payment history
   */
  calculateBalance(
    params: LoanParameters,
    payments: PaymentRecord[]
  ): CalculationResult<BalanceCalculation> {
    const paramValidationErrors = this.validateParameters(params)
    const paymentValidationErrors = validatePaymentRecords(payments)

    if (paramValidationErrors.length > 0 || paymentValidationErrors.length > 0) {
      return {
        success: false,
        errors: [...paramValidationErrors, ...paymentValidationErrors],
      }
    }

    try {
      // Sort payments by date
      const sortedPayments = [...payments].sort((a, b) => a.date.getTime() - b.date.getTime())

      const periodicRate = this.getPeriodicRate(params.interestRate, params.paymentFrequency)
      const expectedInterestPayment = params.principal.times(periodicRate)

      let totalInterestPaid = new Decimal(0)
      let totalPrincipalPaid = new Decimal(0)

      // For interest-only loans, principal stays the same until the end
      // Extra payments go toward principal reduction
      for (const payment of sortedPayments) {
        if (payment.amount.gte(expectedInterestPayment)) {
          // Payment covers interest, any excess goes to principal
          const interestPayment = expectedInterestPayment
          const principalPayment = payment.amount.minus(expectedInterestPayment)

          totalInterestPaid = totalInterestPaid.plus(interestPayment)
          totalPrincipalPaid = totalPrincipalPaid.plus(principalPayment)
        } else {
          // Payment doesn't cover full interest (partial payment)
          totalInterestPaid = totalInterestPaid.plus(payment.amount)
        }
      }

      const currentBalance = Decimal.max(0, params.principal.minus(totalPrincipalPaid))

      // Calculate expected payment info
      const paymentResult = this.calculatePayment(params)
      if (!paymentResult.success) {
        return paymentResult
      }

      const expectedPayment = paymentResult.data
      const principalProgress = totalPrincipalPaid.dividedBy(params.principal)

      const result: BalanceCalculation = {
        currentBalance: currentBalance.toDecimalPlaces(2),
        totalPrincipalPaid: totalPrincipalPaid.toDecimalPlaces(2),
        totalInterestPaid: totalInterestPaid.toDecimalPlaces(2),
        paymentsMade: payments.length,
        paymentsRemaining: Math.max(0, expectedPayment.totalPayments - payments.length),
        percentagePaid: principalProgress.times(100).toDecimalPlaces(2),
      }

      return { success: true, data: result }
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            field: 'balance',
            message: `Balance calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            code: 'BALANCE_CALCULATION_ERROR',
          },
        ],
      }
    }
  }

  /**
   * Validate parameters specific to interest-only calculations
   */
  protected validateParameters(params: LoanParameters): ValidationError[] {
    const baseErrors = validateLoanParameters(params)
    const errors = [...baseErrors]

    // Interest-only loans require interest rate > 0
    if (params.interestRate && params.interestRate.lte(0)) {
      errors.push({
        field: 'interestRate',
        message: 'Interest-only loans require an interest rate greater than 0',
        code: 'INTEREST_ONLY_REQUIRES_RATE',
      })
    }

    // Interest-only loans are typically shorter term
    if (params.termMonths && params.termMonths > 360) {
      // 30 years
      errors.push({
        field: 'termMonths',
        message: 'Interest-only loans are typically limited to 30 years or less',
        code: 'INTEREST_ONLY_TERM_WARNING',
      })
    }

    // Warn about balloon payment risk
    if (params.principal && params.principal.gt(1000000)) {
      // $1M+
      errors.push({
        field: 'principal',
        message: 'Large interest-only loans carry significant balloon payment risk',
        code: 'INTEREST_ONLY_BALLOON_RISK',
      })
    }

    return errors
  }
}
