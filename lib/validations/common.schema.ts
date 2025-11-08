import { z } from 'zod'

// Reusable field validators

/**
 * Currency validator for monetary values
 * - Must be positive
 * - Maximum 2 decimal places
 */
export const currency = z
  .number({
    required_error: 'Amount is required',
    invalid_type_error: 'Amount must be a number',
  })
  .positive('Amount must be positive')
  .multipleOf(0.01, 'Amount must have at most 2 decimal places')

/**
 * Percentage validator for interest rates
 * - Must be between 0 and 100
 */
export const percentage = z
  .number({
    required_error: 'Interest rate is required',
    invalid_type_error: 'Interest rate must be a number',
  })
  .min(0, 'Interest rate cannot be negative')
  .max(100, 'Interest rate cannot exceed 100%')

/**
 * Email validator
 */
export const email = z
  .string({
    required_error: 'Email is required',
  })
  .email('Invalid email address')
  .min(1, 'Email is required')
  .toLowerCase()

/**
 * Phone number validator (optional)
 * Supports various international formats
 */
export const phone = z
  .string()
  .regex(
    /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
    'Invalid phone number format'
  )
  .optional()
  .or(z.literal(''))

/**
 * Future date validator
 */
export const futureDate = z
  .date({
    required_error: 'Date is required',
    invalid_type_error: 'Invalid date',
  })
  .min(new Date(), 'Date must be in the future')

/**
 * Positive integer validator
 */
export const positiveInteger = z
  .number({
    required_error: 'This field is required',
    invalid_type_error: 'Must be a number',
  })
  .int('Must be a whole number')
  .positive('Must be greater than zero')

/**
 * CUID validator for database IDs
 */
export const cuid = z.string().cuid('Invalid ID format')
