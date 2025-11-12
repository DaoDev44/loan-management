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
 * Amortized Loan Calculation Strategy
 * Uses compound interest with fixed periodic payments
 * Formula: PMT = P × [r(1 + r)^n] / [(1 + r)^n - 1]
 */
export class AmortizedStrategy extends InterestCalculationStrategy {
  readonly type = 'AMORTIZED' as const

  /**
   * Calculate payment amount for amortized loan
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

      let paymentAmount: Decimal
      let totalInterest: Decimal

      if (periodicRate.isZero()) {
        // Zero interest rate - just divide principal by number of payments
        paymentAmount = principal.dividedBy(totalPayments)
        totalInterest = new Decimal(0)
      } else {
        // Standard amortized payment calculation: PMT = P × [r(1 + r)^n] / [(1 + r)^n - 1]
        const onePlusR = periodicRate.plus(1)
        const onePlusRPowerN = this.power(onePlusR, totalPayments)

        const numerator = periodicRate.times(onePlusRPowerN)
        const denominator = onePlusRPowerN.minus(1)

        paymentAmount = principal.times(numerator.dividedBy(denominator))
        totalInterest = paymentAmount.times(totalPayments).minus(principal)
      }

      const totalAmount = principal.plus(totalInterest)

      const result: PaymentCalculation = {
        paymentAmount: paymentAmount.toDecimalPlaces(2),
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
            message: `Amortized calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            code: 'CALCULATION_ERROR',
          },
        ],
      }
    }
  }

  /**
   * Generate amortization schedule for amortized loan
   */
  generateSchedule(params: LoanParameters): CalculationResult<AmortizationSchedule> {
    const paymentResult = this.calculatePayment(params)
    if (!paymentResult.success) {
      return paymentResult
    }

    try {
      const payment = paymentResult.data
      const periodicRate = this.getPeriodicRate(params.interestRate, params.paymentFrequency)

      const payments = []
      let remainingBalance = params.principal
      let cumulativeInterest = new Decimal(0)

      for (let i = 1; i <= payment.totalPayments; i++) {
        // Interest payment = remaining balance × periodic rate
        const interestAmount = remainingBalance.times(periodicRate)

        // Principal payment = total payment - interest payment
        const principalAmount = payment.paymentAmount.minus(interestAmount)

        // Update remaining balance
        remainingBalance = remainingBalance.minus(principalAmount)
        cumulativeInterest = cumulativeInterest.plus(interestAmount)

        // Handle final payment rounding
        let actualPaymentAmount = payment.paymentAmount
        let actualPrincipalAmount = principalAmount
        let actualRemainingBalance = remainingBalance

        if (i === payment.totalPayments) {
          // Adjust final payment for any rounding differences
          actualRemainingBalance = new Decimal(0)
          actualPrincipalAmount = principalAmount.plus(remainingBalance)
          actualPaymentAmount = interestAmount.plus(actualPrincipalAmount)
        }

        payments.push({
          paymentNumber: i,
          paymentAmount: actualPaymentAmount.toDecimalPlaces(2),
          principalAmount: actualPrincipalAmount.toDecimalPlaces(2),
          interestAmount: interestAmount.toDecimalPlaces(2),
          remainingBalance: actualRemainingBalance.toDecimalPlaces(2),
          cumulativeInterest: cumulativeInterest.toDecimalPlaces(2),
        })

        remainingBalance = actualRemainingBalance
      }

      const result: AmortizationSchedule = {
        payments,
        summary: {
          totalPayments: payment.totalPayments,
          totalInterest: payment.totalInterest,
          totalAmount: payment.totalAmount,
          averagePayment: payment.paymentAmount,
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
   * Calculate current balance for amortized loan with payment history
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

      let currentBalance = params.principal
      let totalPrincipalPaid = new Decimal(0)
      let totalInterestPaid = new Decimal(0)

      // Process each payment chronologically
      for (const payment of sortedPayments) {
        if (currentBalance.lte(0)) break

        const interestDue = currentBalance.times(periodicRate)
        const principalPayment = Decimal.max(0, payment.amount.minus(interestDue))
        const interestPayment = Decimal.min(payment.amount, interestDue)

        totalPrincipalPaid = totalPrincipalPaid.plus(principalPayment)
        totalInterestPaid = totalInterestPaid.plus(interestPayment)
        currentBalance = Decimal.max(0, currentBalance.minus(principalPayment))
      }

      // Calculate expected payment info for remaining payments
      const paymentResult = this.calculatePayment(params)
      if (!paymentResult.success) {
        return paymentResult
      }

      const expectedPayment = paymentResult.data
      const paymentProgress = totalPrincipalPaid.dividedBy(params.principal)

      const result: BalanceCalculation = {
        currentBalance: currentBalance.toDecimalPlaces(2),
        totalPrincipalPaid: totalPrincipalPaid.toDecimalPlaces(2),
        totalInterestPaid: totalInterestPaid.toDecimalPlaces(2),
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
   * Validate parameters specific to amortized calculations
   */
  protected validateParameters(params: LoanParameters): ValidationError[] {
    const baseErrors = validateLoanParameters(params)
    const errors = [...baseErrors]

    // Amortized loans should have reasonable terms
    if (params.termMonths && params.termMonths < 12) {
      errors.push({
        field: 'termMonths',
        message: 'Amortized loans typically have terms of at least 12 months',
        code: 'AMORTIZED_MIN_TERM_WARNING',
      })
    }

    return errors
  }

  /**
   * Helper function to calculate power using Decimal
   * Uses iterative multiplication for integer exponents
   */
  private power(base: Decimal, exponent: number): Decimal {
    if (exponent === 0) return new Decimal(1)
    if (exponent === 1) return base

    let result = new Decimal(1)
    let currentBase = base
    let exp = Math.abs(exponent)

    while (exp > 0) {
      if (exp % 2 === 1) {
        result = result.times(currentBase)
      }
      currentBase = currentBase.times(currentBase)
      exp = Math.floor(exp / 2)
    }

    return exponent < 0 ? new Decimal(1).dividedBy(result) : result
  }
}
