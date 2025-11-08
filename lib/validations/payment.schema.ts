import { z } from 'zod'
import { currency, cuid } from './common.schema'

// Base payment schema
export const PaymentSchema = z.object({
  id: cuid,
  amount: currency,
  date: z.date(),
  notes: z.string().max(1000).optional().or(z.literal('')),
  deletedAt: z.date().nullable().optional(),
  loanId: cuid,
  createdAt: z.date(),
})

// Create payment schema (for forms)
export const CreatePaymentSchema = z.object({
  loanId: cuid,
  amount: currency,
  date: z.date({ required_error: 'Payment date is required' }).default(() => new Date()),
  notes: z.string().max(1000, 'Notes are too long').optional().or(z.literal('')),
})

// Update payment schema
export const UpdatePaymentSchema = z.object({
  id: cuid,
  amount: currency.optional(),
  date: z.date().optional(),
  notes: z.string().max(1000, 'Notes are too long').optional().or(z.literal('')),
})

// Payment filter schema
export const PaymentFilterSchema = z.object({
  loanId: cuid.optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  minAmount: currency.optional(),
  maxAmount: currency.optional(),
})

// TypeScript types
export type Payment = z.infer<typeof PaymentSchema>
export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>
export type UpdatePaymentInput = z.infer<typeof UpdatePaymentSchema>
export type PaymentFilter = z.infer<typeof PaymentFilterSchema>
