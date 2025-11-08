import { z } from 'zod'
import { PaymentSchema as GeneratedPaymentSchema } from './generated'

// Re-export generated base schema
export const PaymentSchema = GeneratedPaymentSchema

// Create payment schema (for forms)
// Based on generated schema with custom validation
export const CreatePaymentSchema = z.object({
  loanId: z.string().cuid('Invalid loan ID'),
  amount: z
    .number({ message: 'Payment amount must be a number' })
    .positive('Payment amount must be greater than zero')
    .multipleOf(0.01, 'Payment amount can have at most 2 decimal places'),
  date: z.coerce.date().default(() => new Date()),
  notes: z.string().max(1000, 'Notes are too long').optional().or(z.literal('')),
})

// Update payment schema
export const UpdatePaymentSchema = z.object({
  id: z.string().cuid('Invalid payment ID'),
  amount: z.number().positive().multipleOf(0.01).optional(),
  date: z.coerce.date().optional(),
  notes: z.string().max(1000, 'Notes are too long').optional().or(z.literal('')),
})

// Payment filter schema
export const PaymentFilterSchema = z.object({
  loanId: z.string().cuid().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  minAmount: z.number().positive().multipleOf(0.01).optional(),
  maxAmount: z.number().positive().multipleOf(0.01).optional(),
})

// TypeScript types
export type Payment = z.infer<typeof PaymentSchema>
export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>
export type UpdatePaymentInput = z.infer<typeof UpdatePaymentSchema>
export type PaymentFilter = z.infer<typeof PaymentFilterSchema>
