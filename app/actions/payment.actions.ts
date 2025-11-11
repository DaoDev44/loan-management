'use server'

import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import {
  CreatePaymentSchema,
  UpdatePaymentSchema,
  PaymentFilterSchema,
  type CreatePaymentInput,
  type UpdatePaymentInput,
  type PaymentFilter,
} from '@/lib/validations/payment.schema'

// Action Result Types
type ActionResult<T> = { success: true; data: T } | { success: false; error: string }

/**
 * Create a new payment
 */
export async function createPayment(input: CreatePaymentInput): Promise<
  ActionResult<{
    id: string
    amount: Prisma.Decimal
    date: Date
    notes: string | null
    loanId: string
    createdAt: Date
  }>
> {
  try {
    // Validate input
    const validatedInput = CreatePaymentSchema.parse(input)

    // Check if loan exists
    const loan = await prisma.loan.findUnique({
      where: { id: validatedInput.loanId },
      select: { id: true, status: true, balance: true },
    })

    if (!loan) {
      return { success: false, error: 'Referenced loan not found' }
    }

    if (loan.status !== 'ACTIVE') {
      return { success: false, error: 'Cannot add payments to inactive loans' }
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        amount: new Prisma.Decimal(validatedInput.amount),
        date: validatedInput.date,
        notes: validatedInput.notes || null,
        loanId: validatedInput.loanId,
      },
    })

    // Update loan balance
    const newBalance = loan.balance.sub(payment.amount)
    await prisma.loan.update({
      where: { id: validatedInput.loanId },
      data: {
        balance: newBalance,
        status: newBalance.lte(0) ? 'COMPLETED' : 'ACTIVE',
      },
    })

    // Revalidate paths (skip in test environment)
    try {
      revalidatePath('/loans')
      revalidatePath(`/loans/${validatedInput.loanId}`)
      revalidatePath('/payments')
    } catch (error) {
      // Silently ignore revalidation errors in test environment
    }

    return {
      success: true,
      data: {
        id: payment.id,
        amount: payment.amount,
        date: payment.date,
        notes: payment.notes,
        loanId: payment.loanId,
        createdAt: payment.createdAt,
      },
    }
  } catch (error) {
    console.error('Error creating payment:', error)

    if (error instanceof z.ZodError) {
      const errors = error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ')
      return { success: false, error: `Validation error: ${errors}` }
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          return { success: false, error: 'Payment with this information already exists' }
        case 'P2003':
          return { success: false, error: 'Referenced loan not found' }
        case 'P2025':
          return { success: false, error: 'Referenced loan not found' }
        default:
          return { success: false, error: 'Database operation failed' }
      }
    }

    return { success: false, error: 'Failed to create payment. Please try again.' }
  }
}

/**
 * Get a payment by ID
 */
export async function getPayment(id: string): Promise<
  ActionResult<{
    id: string
    amount: Prisma.Decimal
    date: Date
    notes: string | null
    loanId: string
    createdAt: Date
    loan: {
      borrowerName: string
      principal: Prisma.Decimal
    }
  }>
> {
  try {
    const payment = await prisma.payment.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        loan: {
          select: {
            borrowerName: true,
            principal: true,
          },
        },
      },
    })

    if (!payment) {
      return { success: false, error: 'Payment not found' }
    }

    return {
      success: true,
      data: {
        id: payment.id,
        amount: payment.amount,
        date: payment.date,
        notes: payment.notes,
        loanId: payment.loanId,
        createdAt: payment.createdAt,
        loan: {
          borrowerName: payment.loan.borrowerName,
          principal: payment.loan.principal,
        },
      },
    }
  } catch (error) {
    console.error('Error fetching payment:', error)
    return { success: false, error: 'Failed to fetch payment' }
  }
}

/**
 * Get all payments with optional filters
 */
export async function getPayments(filter?: PaymentFilter): Promise<
  ActionResult<
    Array<{
      id: string
      amount: Prisma.Decimal
      date: Date
      notes: string | null
      loanId: string
      createdAt: Date
      loan: {
        borrowerName: string
        borrowerEmail: string
        principal: Prisma.Decimal
      }
    }>
  >
> {
  try {
    const validatedFilter = filter ? PaymentFilterSchema.parse(filter) : {}

    const whereClause: Prisma.PaymentWhereInput = {
      deletedAt: null,
      ...(validatedFilter.loanId && { loanId: validatedFilter.loanId }),
      ...(validatedFilter.minAmount && {
        amount: { gte: new Prisma.Decimal(validatedFilter.minAmount) },
      }),
      ...(validatedFilter.maxAmount && {
        amount: { lte: new Prisma.Decimal(validatedFilter.maxAmount) },
      }),
      ...((validatedFilter.dateFrom || validatedFilter.dateTo) && {
        date: {
          ...(validatedFilter.dateFrom && { gte: validatedFilter.dateFrom }),
          ...(validatedFilter.dateTo && { lte: validatedFilter.dateTo }),
        },
      }),
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        loan: {
          select: {
            borrowerName: true,
            borrowerEmail: true,
            principal: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    })

    return {
      success: true,
      data: payments.map((payment) => ({
        id: payment.id,
        amount: payment.amount,
        date: payment.date,
        notes: payment.notes,
        loanId: payment.loanId,
        createdAt: payment.createdAt,
        loan: {
          borrowerName: payment.loan.borrowerName,
          borrowerEmail: payment.loan.borrowerEmail,
          principal: payment.loan.principal,
        },
      })),
    }
  } catch (error) {
    console.error('Error fetching payments:', error)

    if (error instanceof z.ZodError) {
      const errors = error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ')
      return { success: false, error: `Invalid filter: ${errors}` }
    }

    return { success: false, error: 'Failed to fetch payments' }
  }
}

/**
 * Get payments by loan ID
 */
export async function getPaymentsByLoan(loanId: string): Promise<
  ActionResult<
    Array<{
      id: string
      amount: Prisma.Decimal
      date: Date
      notes: string | null
      createdAt: Date
    }>
  >
> {
  try {
    const payments = await prisma.payment.findMany({
      where: {
        loanId,
        deletedAt: null,
      },
      orderBy: {
        date: 'desc',
      },
    })

    return {
      success: true,
      data: payments.map((payment) => ({
        id: payment.id,
        amount: payment.amount,
        date: payment.date,
        notes: payment.notes,
        createdAt: payment.createdAt,
      })),
    }
  } catch (error) {
    console.error('Error fetching payments by loan:', error)
    return { success: false, error: 'Failed to fetch loan payments' }
  }
}

/**
 * Update a payment
 */
export async function updatePayment(input: UpdatePaymentInput): Promise<
  ActionResult<{
    id: string
    amount: Prisma.Decimal
    date: Date
    notes: string | null
    loanId: string
  }>
> {
  try {
    const validatedInput = UpdatePaymentSchema.parse(input)

    // Check if payment exists and get current data for balance calculation
    const existingPayment = await prisma.payment.findFirst({
      where: {
        id: validatedInput.id,
        deletedAt: null,
      },
      include: {
        loan: {
          select: {
            balance: true,
            status: true,
          },
        },
      },
    })

    if (!existingPayment) {
      return { success: false, error: 'Payment not found' }
    }

    // Calculate balance adjustment if amount is changing
    const oldAmount = existingPayment.amount
    const newAmount = validatedInput.amount ? new Prisma.Decimal(validatedInput.amount) : oldAmount
    const amountDifference = newAmount.sub(oldAmount)

    // Update payment
    const updatedPayment = await prisma.payment.update({
      where: { id: validatedInput.id },
      data: {
        ...(validatedInput.amount !== undefined && {
          amount: new Prisma.Decimal(validatedInput.amount),
        }),
        ...(validatedInput.date !== undefined && { date: validatedInput.date }),
        ...(validatedInput.notes !== undefined && { notes: validatedInput.notes || null }),
      },
    })

    // Update loan balance if amount changed
    if (!amountDifference.eq(0)) {
      const newBalance = existingPayment.loan.balance.sub(amountDifference)
      await prisma.loan.update({
        where: { id: existingPayment.loanId },
        data: {
          balance: newBalance,
          status: newBalance.lte(0) ? 'COMPLETED' : 'ACTIVE',
        },
      })
    }

    try {
      revalidatePath('/payments')
      revalidatePath(`/loans/${existingPayment.loanId}`)
      revalidatePath('/loans')
    } catch (error) {
      // Silently ignore revalidation errors in test environment
    }

    return {
      success: true,
      data: {
        id: updatedPayment.id,
        amount: updatedPayment.amount,
        date: updatedPayment.date,
        notes: updatedPayment.notes,
        loanId: updatedPayment.loanId,
      },
    }
  } catch (error) {
    console.error('Error updating payment:', error)

    if (error instanceof z.ZodError) {
      const errors = error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ')
      return { success: false, error: `Validation error: ${errors}` }
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2025':
          return { success: false, error: 'Payment not found' }
        default:
          return { success: false, error: 'Database operation failed' }
      }
    }

    return { success: false, error: 'Failed to update payment' }
  }
}

/**
 * Delete a payment (soft delete)
 */
export async function deletePayment(id: string): Promise<ActionResult<{ message: string }>> {
  try {
    // Get payment to calculate balance adjustment
    const payment = await prisma.payment.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        loan: {
          select: {
            id: true,
            balance: true,
          },
        },
      },
    })

    if (!payment) {
      return { success: false, error: 'Payment not found' }
    }

    // Soft delete payment
    await prisma.payment.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    })

    // Adjust loan balance (add payment amount back)
    const newBalance = payment.loan.balance.add(payment.amount)
    await prisma.loan.update({
      where: { id: payment.loan.id },
      data: {
        balance: newBalance,
        status: 'ACTIVE', // Reactivate if was completed
      },
    })

    try {
      revalidatePath('/payments')
      revalidatePath(`/loans/${payment.loanId}`)
      revalidatePath('/loans')
    } catch (error) {
      // Silently ignore revalidation errors in test environment
    }

    return {
      success: true,
      data: { message: 'Payment deleted successfully' },
    }
  } catch (error) {
    console.error('Error deleting payment:', error)

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2025':
          return { success: false, error: 'Payment not found' }
        default:
          return { success: false, error: 'Database operation failed' }
      }
    }

    return { success: false, error: 'Failed to delete payment' }
  }
}
