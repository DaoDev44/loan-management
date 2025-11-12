import { Decimal } from 'decimal.js'

/**
 * Represents different types of interest calculations
 */
export type InterestCalculationType = 'SIMPLE' | 'AMORTIZED' | 'INTEREST_ONLY'

/**
 * Represents payment frequency options
 */
export type PaymentFrequency = 'MONTHLY' | 'BI_WEEKLY'

/**
 * Core loan parameters for calculations
 */
export interface LoanParameters {
  /** Principal amount in currency units */
  principal: Decimal
  /** Annual interest rate as a percentage (e.g., 5.5 for 5.5%) */
  interestRate: Decimal
  /** Loan term in months */
  termMonths: number
  /** Payment frequency */
  paymentFrequency: PaymentFrequency
  /** Type of interest calculation */
  calculationType: InterestCalculationType
}

/**
 * Payment calculation result
 */
export interface PaymentCalculation {
  /** Regular payment amount */
  paymentAmount: Decimal
  /** Total number of payments */
  totalPayments: number
  /** Payment frequency */
  paymentFrequency: PaymentFrequency
  /** Total interest over life of loan */
  totalInterest: Decimal
  /** Total amount to be paid */
  totalAmount: Decimal
}

/**
 * Individual payment entry in an amortization schedule
 */
export interface PaymentEntry {
  /** Payment number (1-indexed) */
  paymentNumber: number
  /** Payment amount */
  paymentAmount: Decimal
  /** Principal portion of payment */
  principalAmount: Decimal
  /** Interest portion of payment */
  interestAmount: Decimal
  /** Remaining balance after payment */
  remainingBalance: Decimal
  /** Cumulative interest paid to date */
  cumulativeInterest: Decimal
}

/**
 * Amortization schedule for the loan
 */
export interface AmortizationSchedule {
  /** Array of payment entries */
  payments: PaymentEntry[]
  /** Summary totals */
  summary: {
    totalPayments: number
    totalInterest: Decimal
    totalAmount: Decimal
    averagePayment: Decimal
  }
}

/**
 * Current loan balance calculation result
 */
export interface BalanceCalculation {
  /** Current outstanding principal */
  currentBalance: Decimal
  /** Total principal paid to date */
  totalPrincipalPaid: Decimal
  /** Total interest paid to date */
  totalInterestPaid: Decimal
  /** Number of payments made */
  paymentsMade: number
  /** Number of payments remaining */
  paymentsRemaining: number
  /** Percentage of loan paid off */
  percentagePaid: Decimal
}

/**
 * Payment made on a loan
 */
export interface PaymentRecord {
  /** Amount of payment */
  amount: Decimal
  /** Date payment was made */
  date: Date
  /** Optional payment type/category */
  type?: string
}

/**
 * Validation error for loan calculations
 */
export interface ValidationError {
  field: string
  message: string
  code: string
}

/**
 * Result wrapper for operations that can fail
 */
export type CalculationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: ValidationError[] }

/**
 * Abstract base class for interest calculation strategies
 */
export abstract class InterestCalculationStrategy {
  abstract readonly type: InterestCalculationType

  /**
   * Calculate payment amount for given loan parameters
   */
  abstract calculatePayment(params: LoanParameters): CalculationResult<PaymentCalculation>

  /**
   * Generate amortization schedule (if applicable)
   */
  abstract generateSchedule(params: LoanParameters): CalculationResult<AmortizationSchedule>

  /**
   * Calculate current balance given payment history
   */
  abstract calculateBalance(
    params: LoanParameters,
    payments: PaymentRecord[]
  ): CalculationResult<BalanceCalculation>

  /**
   * Validate loan parameters for this calculation type
   */
  protected abstract validateParameters(params: LoanParameters): ValidationError[]

  /**
   * Convert payment frequency to periods per year
   */
  protected getPeriodsPerYear(frequency: PaymentFrequency): number {
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
   * Convert annual interest rate to periodic rate
   */
  protected getPeriodicRate(annualRate: Decimal, frequency: PaymentFrequency): Decimal {
    const periodsPerYear = this.getPeriodsPerYear(frequency)
    return annualRate.dividedBy(100).dividedBy(periodsPerYear)
  }

  /**
   * Calculate total number of payments
   */
  protected getTotalPayments(termMonths: number, frequency: PaymentFrequency): number {
    const periodsPerYear = this.getPeriodsPerYear(frequency)
    return Math.ceil((termMonths / 12) * periodsPerYear)
  }
}

/**
 * Factory for creating calculation strategies
 */
export interface CalculationStrategyFactory {
  /**
   * Register a new calculation strategy
   */
  register(strategy: InterestCalculationStrategy): void

  /**
   * Create strategy instance for given calculation type
   */
  create(type: InterestCalculationType): InterestCalculationStrategy

  /**
   * Get all available calculation types
   */
  getAvailableTypes(): InterestCalculationType[]
}
