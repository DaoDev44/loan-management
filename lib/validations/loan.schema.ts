import { z } from 'zod'
import {
  LoanSchema as GeneratedLoanSchema,
  LoanStatusSchema,
  InterestCalculationTypeSchema,
  PaymentFrequencySchema,
} from './generated'

// Re-export generated enums and base schema
export { LoanStatusSchema, InterestCalculationTypeSchema, PaymentFrequencySchema }
export const LoanSchema = GeneratedLoanSchema

// Create loan schema with custom validation rules
// Based on generated schema but with form-specific validation
export const CreateLoanSchema = z
  .object({
    borrowerName: z
      .string({ message: 'Borrower name is required' })
      .min(1, 'Borrower name is required')
      .max(255, 'Borrower name is too long'),
    borrowerEmail: z
      .string({ message: 'Email is required' })
      .email('Invalid email address')
      .min(1, 'Email is required')
      .toLowerCase(),
    borrowerPhone: z
      .string()
      .regex(
        /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
        'Invalid phone number format'
      )
      .optional()
      .or(z.literal('')),
    principal: z
      .number({ message: 'Loan amount must be a number' })
      .positive('Loan amount must be greater than zero')
      .multipleOf(0.01, 'Loan amount can have at most 2 decimal places')
      .max(100000000, 'Loan amount cannot exceed $100,000,000'),
    interestRate: z
      .number({ message: 'Interest rate must be a number' })
      .min(0, 'Interest rate cannot be negative')
      .max(100, 'Interest rate cannot exceed 100%'),
    startDate: z.coerce.date({ message: 'Start date is required' }),
    endDate: z.coerce.date({ message: 'End date is required' }),
    termMonths: z
      .number({ message: 'Loan term must be a number' })
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
  // Cross-field validation
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
    borrowerEmail: z.string().email('Invalid email address').min(1).toLowerCase().optional(),
    borrowerPhone: z
      .string()
      .regex(
        /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
        'Invalid phone number format'
      )
      .optional()
      .or(z.literal('')),
    principal: z.number().positive().multipleOf(0.01).max(100000000).optional(),
    interestRate: z.number().min(0).max(100).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    termMonths: z.number().int().positive().max(360).optional(),
    interestCalculationType: InterestCalculationTypeSchema.optional(),
    paymentFrequency: PaymentFrequencySchema.optional(),
    status: LoanStatusSchema.optional(),
    balance: z.number().positive().multipleOf(0.01).optional(),
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
  minPrincipal: z.number().positive().multipleOf(0.01).optional(),
  maxPrincipal: z.number().positive().multipleOf(0.01).optional(),
  minBalance: z.number().positive().multipleOf(0.01).optional(),
  maxBalance: z.number().positive().multipleOf(0.01).optional(),
  startDateFrom: z.coerce.date().optional(),
  startDateTo: z.coerce.date().optional(),
})

// TypeScript types derived from schemas
export type Loan = z.infer<typeof LoanSchema>
export type CreateLoanInput = z.infer<typeof CreateLoanSchema>
export type UpdateLoanInput = z.infer<typeof UpdateLoanSchema>
export type LoanFilter = z.infer<typeof LoanFilterSchema>
export type LoanStatus = z.infer<typeof LoanStatusSchema>
export type InterestCalculationType = z.infer<typeof InterestCalculationTypeSchema>
export type PaymentFrequency = z.infer<typeof PaymentFrequencySchema>
