/**
 * Serialization utilities for converting Prisma types to client-safe types
 *
 * Prisma Decimal types cannot be serialized across Server/Client component boundaries.
 * These utilities convert Decimal fields to numbers for safe serialization.
 */

import { Loan, Payment, Prisma } from '@prisma/client'

// ============================================================================
// SERIALIZED TYPES
// ============================================================================

/**
 * Serialized Payment type (Decimal -> number)
 */
export type SerializedPayment = Omit<Payment, 'amount'> & {
  amount: number
}

/**
 * Serialized Loan type (Decimal -> number)
 * Can optionally include serialized payments
 */
export type SerializedLoan = Omit<Loan, 'principal' | 'balance'> & {
  principal: number
  balance: number
  payments?: SerializedPayment[]
}

/**
 * Loan with payments from Prisma
 */
export type LoanWithPayments = Prisma.LoanGetPayload<{
  include: { payments: true }
}>

// ============================================================================
// SERIALIZATION FUNCTIONS
// ============================================================================

/**
 * Serialize a Payment for client components
 * Converts Decimal amount to number
 */
export function serializePayment(payment: Payment): SerializedPayment {
  return {
    ...payment,
    amount: payment.amount.toNumber(),
  }
}

/**
 * Serialize a Loan for client components
 * Converts Decimal fields to numbers
 * Optionally serializes nested payments
 */
export function serializeLoan(loan: Loan): SerializedLoan
export function serializeLoan(loan: LoanWithPayments): SerializedLoan
export function serializeLoan(loan: Loan | LoanWithPayments): SerializedLoan {
  // Destructure payments separately to avoid type conflicts
  const { payments, ...loanWithoutPayments } = loan as LoanWithPayments

  const serialized: SerializedLoan = {
    ...loanWithoutPayments,
    principal: loan.principal.toNumber(),
    balance: loan.balance.toNumber(),
  }

  // Serialize payments if they exist
  if (payments) {
    serialized.payments = payments.map(serializePayment)
  }

  return serialized
}

/**
 * Serialize an array of Loans for client components
 */
export function serializeLoans(loans: Loan[]): SerializedLoan[]
export function serializeLoans(loans: LoanWithPayments[]): SerializedLoan[]
export function serializeLoans(loans: Loan[] | LoanWithPayments[]): SerializedLoan[] {
  return loans.map(serializeLoan)
}

/**
 * Serialize an array of Payments for client components
 */
export function serializePayments(payments: Payment[]): SerializedPayment[] {
  return payments.map(serializePayment)
}
