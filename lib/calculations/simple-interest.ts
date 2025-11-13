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
 * Simple Interest Calculation Strategy
 * Uses the formula: Interest = Principal × Rate × Time (I = P × r × t)
 */
export class SimpleInterestStrategy extends InterestCalculationStrategy {
  readonly type = 'SIMPLE' as const

  /**
   * Calculate payment amount for simple interest loan
   * For simple interest, the payment includes all interest upfront
   */
  calculatePayment(params: LoanParameters): CalculationResult<PaymentCalculation> {
    const validationErrors = this.validateParameters(params)
    if (validationErrors.length > 0) {
      return { success: false, errors: validationErrors }
    }

    try {
      const { principal, interestRate, termMonths } = params

      // Calculate total interest using I = P × r × t
      const timeInYears = new Decimal(termMonths).dividedBy(12)
      const annualRateDecimal = interestRate.dividedBy(100)
      const totalInterest = principal.times(annualRateDecimal).times(timeInYears)

      const totalAmount = principal.plus(totalInterest)

      // For simple interest, typically one payment at the end
      // But we can also calculate equal payments that include interest
      const totalPayments = this.getTotalPayments(termMonths, params.paymentFrequency)
      const paymentAmount = totalAmount.dividedBy(totalPayments)

      const result: PaymentCalculation = {
        paymentAmount: paymentAmount.toDecimalPlaces(2),
        totalPayments,
        paymentFrequency: params.paymentFrequency,
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
            message: `Simple interest calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            code: 'CALCULATION_ERROR',
          },
        ],
      }
    }
  }

  /**
   * Generate amortization schedule for simple interest loan
   * Simple interest typically doesn't have a traditional amortization schedule
   * but we can create one showing equal payments
   */
  generateSchedule(params: LoanParameters): CalculationResult<AmortizationSchedule> {
    const paymentResult = this.calculatePayment(params)
    if (!paymentResult.success) {
      return paymentResult
    }

    try {
      const payment = paymentResult.data
      const totalPayments = payment.totalPayments
      const paymentAmount = payment.paymentAmount

      // Calculate interest per payment (total interest divided by number of payments)
      const interestPerPayment = payment.totalInterest.dividedBy(totalPayments)
      const principalPerPayment = params.principal.dividedBy(totalPayments)

      const payments = []
      let remainingBalance = params.principal
      let cumulativeInterest = new Decimal(0)

      for (let i = 1; i <= totalPayments; i++) {
        const principalAmount =
          i === totalPayments
            ? remainingBalance // Last payment gets any remaining balance due to rounding
            : principalPerPayment

        const interestAmount = interestPerPayment
        remainingBalance = remainingBalance.minus(principalAmount)
        cumulativeInterest = cumulativeInterest.plus(interestAmount)

        payments.push({
          paymentNumber: i,
          paymentAmount: paymentAmount.toDecimalPlaces(2),
          principalAmount: principalAmount.toDecimalPlaces(2),
          interestAmount: interestAmount.toDecimalPlaces(2),
          remainingBalance: remainingBalance.toDecimalPlaces(2),
          cumulativeInterest: cumulativeInterest.toDecimalPlaces(2),
        })
      }

      const result: AmortizationSchedule = {
        payments,
        summary: {
          totalPayments,
          totalInterest: payment.totalInterest,
          totalAmount: payment.totalAmount,
          averagePayment: paymentAmount,
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
   * Calculate current balance for simple interest loan with payment history
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
      // Get the original payment calculation to understand expected payments
      const paymentResult = this.calculatePayment(params)
      if (!paymentResult.success) {
        return paymentResult
      }

      const expectedPayment = paymentResult.data

      // Calculate totals from payment history
      const totalPaymentsMade = payments.reduce(
        (sum, payment) => sum.plus(payment.amount),
        new Decimal(0)
      )

      // For simple interest, interest is calculated upfront
      const totalExpectedPayments = expectedPayment.totalAmount

      // Simple interest: principal reduction is proportional to payments made
      const paymentProgress = totalPaymentsMade.dividedBy(totalExpectedPayments)
      const principalPaid = params.principal.times(paymentProgress)
      const interestPaid = totalPaymentsMade.minus(principalPaid)

      const currentBalance = params.principal.minus(principalPaid)

      const result: BalanceCalculation = {
        currentBalance: Decimal.max(0, currentBalance).toDecimalPlaces(2),
        totalPrincipalPaid: principalPaid.toDecimalPlaces(2),
        totalInterestPaid: Decimal.max(0, interestPaid).toDecimalPlaces(2),
        paymentsMade: payments.length,
        paymentsRemaining: Math.max(0, expectedPayment.totalPayments - payments.length),
        percentagePaid: paymentProgress.times(100).toDecimalPlaces(2),
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
   * Validate parameters specific to simple interest calculations
   */
  protected validateParameters(params: LoanParameters): ValidationError[] {
    const baseErrors = validateLoanParameters(params)

    // Simple interest specific validations
    const errors = [...baseErrors]

    // Simple interest works best with reasonable terms
    if (params.termMonths && params.termMonths > 120) {
      errors.push({
        field: 'termMonths',
        message: 'Simple interest is typically used for shorter-term loans (10 years or less)',
        code: 'SIMPLE_INTEREST_TERM_WARNING',
      })
    }

    return errors
  }
}
