'use server'

import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import {
  CreateLoanSchema,
  UpdateLoanSchema,
  LoanFilterSchema,
  type CreateLoanInput,
  type UpdateLoanInput,
  type LoanFilter,
} from '@/lib/validations'
import { type ActionResponse, successResponse, errorResponse } from './types'
import { serializeLoan, serializeLoans, type SerializedLoan } from '@/lib/utils/serialize'

/**
 * Create a new loan
 * @param input - Loan creation data (validated against CreateLoanSchema)
 * @returns Serialized created loan or error
 */
export async function createLoan(input: CreateLoanInput): Promise<ActionResponse<SerializedLoan>> {
  try {
    // Validate input
    const validated = CreateLoanSchema.parse(input)

    // Create loan with initial balance = principal
    const loan = await prisma.loan.create({
      data: {
        borrowerName: validated.borrowerName,
        borrowerEmail: validated.borrowerEmail,
        borrowerPhone: validated.borrowerPhone,
        principal: new Prisma.Decimal(validated.principal),
        interestRate: validated.interestRate, // Float in Prisma schema
        startDate: validated.startDate,
        endDate: validated.endDate,
        termMonths: validated.termMonths,
        interestCalculationType: validated.interestCalculationType,
        paymentFrequency: validated.paymentFrequency,
        balance: new Prisma.Decimal(validated.principal), // Initial balance = principal
        status: 'ACTIVE',
        notes: validated.notes || '',
        collateral: validated.collateral || '',
      },
    })

    // Revalidate pages that display loans (skip in test/non-request context)
    try {
      revalidatePath('/dashboard')
      revalidatePath('/loans')
    } catch {
      // Ignore revalidation errors in test context
    }

    // Serialize Decimal types for client components
    return successResponse(serializeLoan(loan))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse('Validation failed', error.issues)
    }
    console.error('Error creating loan:', error)
    return errorResponse('Failed to create loan')
  }
}

/**
 * Get a single loan by ID
 * @param id - Loan ID (CUID)
 * @returns Serialized loan with payments or error
 */
export async function getLoan(id: string): Promise<ActionResponse<SerializedLoan>> {
  try {
    const loan = await prisma.loan.findUnique({
      where: { id, deletedAt: null },
      include: {
        payments: {
          where: { deletedAt: null },
          orderBy: { date: 'desc' },
        },
      },
    })

    if (!loan) {
      return errorResponse('Loan not found')
    }

    // Serialize Decimal types for client components (includes payments)
    return successResponse(serializeLoan(loan))
  } catch (error) {
    console.error('Error fetching loan:', error)
    return errorResponse('Failed to fetch loan')
  }
}

/**
 * Get all loans with optional filtering and sorting
 * @param filter - Optional filter criteria
 * @returns Array of serialized loans or error
 */
export async function getLoans(filter?: LoanFilter): Promise<ActionResponse<SerializedLoan[]>> {
  try {
    const where: Prisma.LoanWhereInput = {
      deletedAt: null,
    }

    // Apply filters if provided
    if (filter) {
      const validated = LoanFilterSchema.parse(filter)

      if (validated.status) {
        where.status = validated.status
      }
      if (validated.interestCalculationType) {
        where.interestCalculationType = validated.interestCalculationType
      }
      if (validated.paymentFrequency) {
        where.paymentFrequency = validated.paymentFrequency
      }
      if (validated.borrowerEmail) {
        where.borrowerEmail = {
          contains: validated.borrowerEmail,
          mode: 'insensitive',
        }
      }
      if (validated.borrowerName) {
        where.borrowerName = {
          contains: validated.borrowerName,
          mode: 'insensitive',
        }
      }
      if (validated.minPrincipal !== undefined) {
        where.principal = { gte: new Prisma.Decimal(validated.minPrincipal) }
      }
      if (validated.maxPrincipal !== undefined) {
        where.principal = {
          ...(where.principal as object),
          lte: new Prisma.Decimal(validated.maxPrincipal),
        }
      }
      if (validated.minBalance !== undefined) {
        where.balance = { gte: new Prisma.Decimal(validated.minBalance) }
      }
      if (validated.maxBalance !== undefined) {
        where.balance = {
          ...(where.balance as object),
          lte: new Prisma.Decimal(validated.maxBalance),
        }
      }
      if (validated.startDateFrom) {
        where.startDate = { gte: validated.startDateFrom }
      }
      if (validated.startDateTo) {
        where.startDate = {
          ...(where.startDate as object),
          lte: validated.startDateTo,
        }
      }
    }

    const loans = await prisma.loan.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return successResponse(serializeLoans(loans))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse('Invalid filter criteria', error.issues)
    }
    console.error('Error fetching loans:', error)
    return errorResponse('Failed to fetch loans')
  }
}

/**
 * Update an existing loan
 * @param input - Partial loan data with ID
 * @returns Serialized updated loan or error
 */
export async function updateLoan(input: UpdateLoanInput): Promise<ActionResponse<SerializedLoan>> {
  try {
    // Validate input
    const validated = UpdateLoanSchema.parse(input)
    const { id, ...updateData } = validated

    // Convert numbers to Decimals for Prisma
    const prismaData: Prisma.LoanUpdateInput = {}

    if (updateData.borrowerName !== undefined) prismaData.borrowerName = updateData.borrowerName
    if (updateData.borrowerEmail !== undefined) prismaData.borrowerEmail = updateData.borrowerEmail
    if (updateData.borrowerPhone !== undefined) prismaData.borrowerPhone = updateData.borrowerPhone
    if (updateData.principal !== undefined) {
      prismaData.principal = new Prisma.Decimal(updateData.principal)
    }
    if (updateData.interestRate !== undefined) {
      prismaData.interestRate = updateData.interestRate // Float in Prisma schema
    }
    if (updateData.balance !== undefined) {
      prismaData.balance = new Prisma.Decimal(updateData.balance)
    }
    if (updateData.startDate !== undefined) prismaData.startDate = updateData.startDate
    if (updateData.endDate !== undefined) prismaData.endDate = updateData.endDate
    if (updateData.termMonths !== undefined) prismaData.termMonths = updateData.termMonths
    if (updateData.interestCalculationType !== undefined) {
      prismaData.interestCalculationType = updateData.interestCalculationType
    }
    if (updateData.paymentFrequency !== undefined) {
      prismaData.paymentFrequency = updateData.paymentFrequency
    }
    if (updateData.status !== undefined) prismaData.status = updateData.status
    if (updateData.notes !== undefined) prismaData.notes = updateData.notes
    if (updateData.collateral !== undefined) prismaData.collateral = updateData.collateral

    // Update loan
    const loan = await prisma.loan.update({
      where: { id, deletedAt: null },
      data: prismaData,
    })

    // Revalidate pages (skip in test/non-request context)
    try {
      revalidatePath('/dashboard')
      revalidatePath('/loans')
      revalidatePath(`/loans/${id}`)
    } catch {
      // Ignore revalidation errors in test context
    }

    // Serialize Decimal types for client components
    return successResponse(serializeLoan(loan))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse('Validation failed', error.issues)
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return errorResponse('Loan not found')
      }
    }
    console.error('Error updating loan:', error)
    return errorResponse('Failed to update loan')
  }
}

/**
 * Get all loans with payments for dashboard analytics
 * @returns Array of serialized loans with payments or error
 */
export async function getLoansWithPayments(): Promise<ActionResponse<SerializedLoan[]>> {
  try {
    const loans = await prisma.loan.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        payments: {
          where: { deletedAt: null },
          orderBy: { date: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return successResponse(serializeLoans(loans))
  } catch (error) {
    console.error('Error fetching loans with payments:', error)
    return errorResponse('Failed to fetch loans with payments')
  }
}

/**
 * Soft delete a loan (sets deletedAt timestamp)
 * @param id - Loan ID to delete
 * @returns Success status or error
 */
export async function deleteLoan(id: string): Promise<ActionResponse<void>> {
  try {
    await prisma.loan.update({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    })

    // Revalidate pages (skip in test/non-request context)
    try {
      revalidatePath('/dashboard')
      revalidatePath('/loans')
    } catch {
      // Ignore revalidation errors in test context
    }

    return successResponse(undefined)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return errorResponse('Loan not found')
      }
    }
    console.error('Error deleting loan:', error)
    return errorResponse('Failed to delete loan')
  }
}
