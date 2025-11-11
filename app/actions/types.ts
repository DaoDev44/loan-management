import { type ZodIssue } from 'zod'

/**
 * Standard response format for all Server Actions
 * Provides consistent type-safe error handling across the application
 */
export type ActionResponse<T = void> =
  | { success: true; data: T }
  | {
      success: false
      error: string
      issues?: ZodIssue[] // Zod validation issues (flexible type for compatibility)
    }

/**
 * Helper to create a successful response
 * @param data - The data to return
 * @returns ActionResponse with success = true
 */
export function successResponse<T>(data: T): ActionResponse<T> {
  return { success: true, data }
}

/**
 * Helper to create an error response
 * @param error - Error message
 * @param issues - Optional validation issues from Zod
 * @returns ActionResponse with success = false
 */
export function errorResponse(error: string, issues?: ZodIssue[]): ActionResponse<never> {
  return { success: false, error, issues }
}
