/**
 * TypeScript types and interfaces for loan interest calculations
 */

import Decimal from 'decimal.js'
import type { InterestCalculationType, PaymentFrequency, LoanStatus } from '@prisma/client'

// =============================================================================
// Core Loan Types
// =============================================================================

/**
 * Simplified loan data structure for calculations
 * Contains only the fields needed for financial calculations
 */
export interface LoanCalculationInput {
  /** Loan unique identifier */
  id: string
  /** Original loan amount */
  principal: Decimal
  /** Annual interest rate as percentage (e.g., 5.5 for 5.5%) */
  interestRate: number
  /** Loan start date */
  startDate: Date
  /** Loan end date */
  endDate: Date
  /** Loan term in months */
  termMonths: number
  /** Type of interest calculation to use */
  interestCalculationType: InterestCalculationType
  /** How often payments are due */
  paymentFrequency: PaymentFrequency
  /** Current loan status */
  status: LoanStatus
  /** Current outstanding balance */
  balance: Decimal
}

/**
 * Payment record for calculations
 */
export interface PaymentCalculationInput {
  /** Payment unique identifier */
  id: string
  /** Payment amount */
  amount: Decimal
  /** Date payment was made */
  date: Date
  /** Associated loan ID */
  loanId: string
}

// =============================================================================
// Calculation Result Types
// =============================================================================

/**
 * Result of interest calculation
 */
export interface InterestCalculationResult {
  /** Total interest amount */
  totalInterest: Decimal
  /** Interest calculation method used */
  calculationType: InterestCalculationType
  /** Calculation date for reference */
  calculatedAt: Date
  /** Additional metadata */
  metadata?: Record<string, any>
}

/**
 * Result of simple interest calculation
 */
export interface SimpleInterestResult extends InterestCalculationResult {
  /** Principal amount used */
  principal: Decimal
  /** Annual interest rate used */
  rate: number
  /** Time period in years */
  timeInYears: number
  /** Simple interest amount (P × r × t) */
  simpleInterest: Decimal
  /** Total amount (principal + interest) */
  totalAmount: Decimal
}

/**
 * Individual payment in an amortization schedule
 */
export interface AmortizationPayment {
  /** Payment sequence number */
  paymentNumber: number
  /** Date payment is due */
  dueDate: Date
  /** Total payment amount */
  paymentAmount: Decimal
  /** Portion of payment applied to principal */
  principalPortion: Decimal
  /** Portion of payment applied to interest */
  interestPortion: Decimal
  /** Remaining loan balance after this payment */
  remainingBalance: Decimal
  /** Cumulative interest paid through this payment */
  cumulativeInterest: Decimal
  /** Cumulative principal paid through this payment */
  cumulativePrincipal: Decimal
}

/**
 * Complete amortization schedule result
 */
export interface AmortizationSchedule {
  /** Loan information */
  loanId: string
  /** Fixed payment amount for the loan */
  monthlyPayment: Decimal
  /** Total number of payments */
  totalPayments: number
  /** Payment frequency */
  frequency: PaymentFrequency
  /** Array of all payments in the schedule */
  payments: AmortizationPayment[]
  /** Summary totals */
  summary: {
    /** Total interest to be paid over loan life */
    totalInterest: Decimal
    /** Total of all payments */
    totalPayments: Decimal
    /** Loan term in months */
    termMonths: number
  }
  /** When this schedule was calculated */
  calculatedAt: Date
}

/**
 * Interest-only payment calculation result
 */
export interface InterestOnlyResult {
  /** Periodic interest-only payment amount */
  interestPayment: Decimal
  /** Principal amount (balloon payment) */
  principalPayment: Decimal
  /** Payment frequency */
  frequency: PaymentFrequency
  /** Total interest over loan term */
  totalInterest: Decimal
  /** Number of interest-only payments */
  numberOfPayments: number
  /** Final balloon payment date */
  balloonPaymentDate: Date
}

/**
 * Current loan balance calculation result
 */
export interface BalanceCalculationResult {
  /** Current outstanding balance */
  currentBalance: Decimal
  /** Total principal paid to date */
  principalPaid: Decimal
  /** Total interest paid to date */
  interestPaid: Decimal
  /** Total payments made to date */
  totalPaymentsMade: Decimal
  /** Number of payments made */
  paymentsCount: number
  /** Remaining principal */
  remainingPrincipal: Decimal
  /** Next payment due date (if applicable) */
  nextPaymentDue?: Date
  /** Whether loan is paid off */
  isPaidOff: boolean
  /** Calculation timestamp */
  calculatedAt: Date
}

/**
 * Payment schedule generation options
 */
export interface PaymentScheduleOptions {
  /** Include past payments in schedule */
  includePastPayments?: boolean
  /** Only show remaining payments */
  remainingOnly?: boolean
  /** Maximum number of payments to include */
  maxPayments?: number
  /** Start date for schedule (defaults to loan start date) */
  startDate?: Date
}

/**
 * Payment impact analysis (for what-if scenarios)
 */
export interface PaymentImpactAnalysis {
  /** Original loan balance before payment */
  originalBalance: Decimal
  /** New balance after payment */
  newBalance: Decimal
  /** Amount applied to principal */
  principalReduction: Decimal
  /** Amount applied to interest */
  interestPayment: Decimal
  /** Interest saved vs minimum payment */
  interestSaved?: Decimal
  /** Months saved off loan term */
  termReduction?: number
  /** New loan payoff date */
  newPayoffDate?: Date
}

/**
 * Portfolio-level calculation results
 */
export interface PortfolioMetrics {
  /** Total principal across all loans */
  totalPrincipal: Decimal
  /** Total current balances */
  totalBalance: Decimal
  /** Total interest earned to date */
  totalInterestEarned: Decimal
  /** Projected future interest income */
  projectedInterestIncome: Decimal
  /** Average interest rate across portfolio */
  averageInterestRate: number
  /** Number of active loans */
  activeLoansCount: number
  /** Number of completed loans */
  completedLoansCount: number
  /** Portfolio performance metrics */
  performance: {
    /** On-time payment rate */
    onTimePaymentRate: number
    /** Default rate */
    defaultRate: number
    /** Average loan term */
    averageLoanTerm: number
  }
}

// =============================================================================
// Validation and Error Types
// =============================================================================

/**
 * Calculation validation error
 */
export interface CalculationError {
  /** Error code for programmatic handling */
  code: string
  /** Human-readable error message */
  message: string
  /** Field that caused the error (if applicable) */
  field?: string
  /** Invalid value that caused the error */
  value?: any
}

/**
 * Calculation validation result
 */
export interface ValidationResult {
  /** Whether validation passed */
  isValid: boolean
  /** Array of errors (empty if valid) */
  errors: CalculationError[]
}

// =============================================================================
// Utility Types
// =============================================================================

/**
 * Supported rounding modes for monetary calculations
 */
export type RoundingMode = 'ROUND_UP' | 'ROUND_DOWN' | 'ROUND_NEAREST'

/**
 * Date frequency for calculations
 */
export type CalculationFrequency = 'DAILY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY'

/**
 * Time period specification
 */
export interface TimePeriod {
  /** Start date */
  startDate: Date
  /** End date */
  endDate: Date
  /** Period in years (calculated) */
  years: number
  /** Period in months (calculated) */
  months: number
  /** Period in days (calculated) */
  days: number
}

/**
 * Configuration options for calculations
 */
export interface CalculationConfig {
  /** Decimal precision for monetary values (default: 2) */
  precision?: number
  /** Rounding mode (default: ROUND_NEAREST) */
  roundingMode?: RoundingMode
  /** Whether to include partial periods in calculations */
  includePartialPeriods?: boolean
  /** Business days only for payment dates */
  businessDaysOnly?: boolean
}