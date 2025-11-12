import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

interface UseFormSubmissionReturn {
  isSubmitting: boolean
  formError: string | null
  setIsSubmitting: (submitting: boolean) => void
  setFormError: (error: string | null) => void
  handleSubmissionError: (error: unknown, customMessage?: string) => void
  clearFormError: () => void
}

/**
 * Custom hook for managing form submission state and error handling
 *
 * Provides consistent patterns across forms:
 * - Loading state management during form submission
 * - Form-level error state and display
 * - Standardized error handling for different error types
 * - Toast notifications integration
 */
export function useFormSubmission(): UseFormSubmissionReturn {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Standard error handling for form submissions
  const handleSubmissionError = (error: unknown, customMessage?: string) => {
    console.error('Form submission error:', error)

    let errorMessage = customMessage || 'An unexpected error occurred'

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      const errors = error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ')
      errorMessage = `Validation error: ${errors}`
    }
    // Handle errors with message property (but not ZodError which we already handled)
    else if (error instanceof Error) {
      errorMessage = error.message
    }

    // Handle string errors
    if (typeof error === 'string') {
      errorMessage = error
    }

    // Set form error state
    setFormError(errorMessage)

    // Show toast notification
    toast.error(errorMessage)
  }

  // Clear form error
  const clearFormError = () => {
    setFormError(null)
  }

  return {
    isSubmitting,
    formError,
    setIsSubmitting,
    setFormError,
    handleSubmissionError,
    clearFormError,
  }
}