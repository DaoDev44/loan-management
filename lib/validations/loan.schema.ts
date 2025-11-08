import { z } from 'zod'
import { currency, email, percentage, phone, positiveInteger } from './common.schema'

// Enums matching Prisma schema
export const LoanStatusSchema = z.enum(['ACTIVE', 'COMPLETED', 'OVERDUE', 'DEFAULTED'])

export const InterestCalculationTypeSchema = z.enum([
  'SIMPLE',
  'AMORTIZED',
  'INTEREST_ONLY',
])

export const PaymentFrequencySchema = z.enum(['MONTHLY', 'BI_WEEKLY'])

// Base loan schema with all fields
export const LoanSchema = z.object({
  id: z.string().cuid(),
  borrowerName: z.string().min(1, 'Borrower name is required').max(255),
  borrowerEmail: email,
  borrowerPhone: phone,
  principal: currency,
  interestRate: percentage,
  startDate: z.date(),
  endDate: z.date(),
  termMonths: positiveInteger,
  interestCalculationType: InterestCalculationTypeSchema,
  paymentFrequency: PaymentFrequencySchema,
  status: LoanStatusSchema,
  balance: currency,
  notes: z.string().max(10000).optional().or(z.literal('')),
  collateral: z.string().max(10000).optional().or(z.literal('')),
  deletedAt: z.date().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Create loan schema (for forms)
export const CreateLoanSchema = z
  .object({
    borrowerName: z
      .string({ required_error: 'Borrower name is required' })
      .min(1, 'Borrower name is required')
      .max(255, 'Borrower name is too long'),
    borrowerEmail: email,
    borrowerPhone: phone,
    principal: z
      .number({
        required_error: 'Loan amount is required',
        invalid_type_error: 'Loan amount must be a number',
      })
      .positive('Loan amount must be greater than zero')
      .multipleOf(0.01, 'Loan amount can have at most 2 decimal places')
      .max(100000000, 'Loan amount cannot exceed $100,000,000'),
    interestRate: percentage,
    startDate: z.date({ required_error: 'Start date is required' }),
    endDate: z.date({ required_error: 'End date is required' }),
    termMonths: z
      .number({
        required_error: 'Loan term is required',
        invalid_type_error: 'Loan term must be a number',
      })
      .int('Loan term must be a whole number')
      .positive('Loan term must be greater than zero')
      .max(360, 'Loan term cannot exceed 360 months (30 years)'),
    interestCalculationType: InterestCalculationTypeSchema.default('SIMPLE'),
    paymentFrequency: PaymentFrequencySchema.default('MONTHLY'),
    notes: z.string().max(10000, 'Notes are too long').optional().or(z.literal('')),
    collateral: z
      .string()
      .max(10000, 'Collateral description is too long')
      .optional()
      .or(z.literal('')),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
  })
  .refine(
    (data) => {
      // Calculate expected months between dates
      const monthsDiff =
        (data.endDate.getFullYear() - data.startDate.getFullYear()) * 12 +
        (data.endDate.getMonth() - data.startDate.getMonth())

      // Allow some flexibility (within 1 month)
      return Math.abs(monthsDiff - data.termMonths) <= 1
    },
    {
      message: 'Term months should match the date range (within 1 month)',
      path: ['termMonths'],
    }
  )

// Update loan schema (partial, allows updating specific fields)
export const UpdateLoanSchema = z
  .object({
    id: z.string().cuid(),
    borrowerName: z.string().min(1).max(255).optional(),
    borrowerEmail: email.optional(),
    borrowerPhone: phone,
    principal: currency.optional(),
    interestRate: percentage.optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    termMonths: positiveInteger.max(360).optional(),
    interestCalculationType: InterestCalculationTypeSchema.optional(),
    paymentFrequency: PaymentFrequencySchema.optional(),
    status: LoanStatusSchema.optional(),
    balance: currency.optional(),
    notes: z.string().max(10000).optional().or(z.literal('')),
    collateral: z.string().max(10000).optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      // If both dates provided, end date must be after start date
      if (data.startDate && data.endDate) {
        return data.endDate > data.startDate
      }
      return true
    },
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    }
  )

// Loan filter/search schema
export const LoanFilterSchema = z.object({
  status: LoanStatusSchema.optional(),
  interestCalculationType: InterestCalculationTypeSchema.optional(),
  paymentFrequency: PaymentFrequencySchema.optional(),
  borrowerEmail: z.string().optional(),
  borrowerName: z.string().optional(),
  minPrincipal: currency.optional(),
  maxPrincipal: currency.optional(),
  minBalance: currency.optional(),
  maxBalance: currency.optional(),
  startDateFrom: z.date().optional(),
  startDateTo: z.date().optional(),
})

// TypeScript types derived from schemas
export type Loan = z.infer<typeof LoanSchema>
export type CreateLoanInput = z.infer<typeof CreateLoanSchema>
export type UpdateLoanInput = z.infer<typeof UpdateLoanSchema>
export type LoanFilter = z.infer<typeof LoanFilterSchema>
export type LoanStatus = z.infer<typeof LoanStatusSchema>
export type InterestCalculationType = z.infer<typeof InterestCalculationTypeSchema>
export type PaymentFrequency = z.infer<typeof PaymentFrequencySchema>
