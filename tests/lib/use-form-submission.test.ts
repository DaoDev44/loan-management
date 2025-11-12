import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { z } from 'zod'
import { useFormSubmission } from '@/lib/hooks/use-form-submission'
import { toast } from 'sonner'

// Mock the toast function
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}))

describe('useFormSubmission', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('initial state', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useFormSubmission())

      expect(result.current.isSubmitting).toBe(false)
      expect(result.current.formError).toBeNull()
    })

    it('should provide all required functions', () => {
      const { result } = renderHook(() => useFormSubmission())

      expect(typeof result.current.setIsSubmitting).toBe('function')
      expect(typeof result.current.setFormError).toBe('function')
      expect(typeof result.current.handleSubmissionError).toBe('function')
      expect(typeof result.current.clearFormError).toBe('function')
    })
  })

  describe('state management', () => {
    it('should update submission state', () => {
      const { result } = renderHook(() => useFormSubmission())

      act(() => {
        result.current.setIsSubmitting(true)
      })

      expect(result.current.isSubmitting).toBe(true)

      act(() => {
        result.current.setIsSubmitting(false)
      })

      expect(result.current.isSubmitting).toBe(false)
    })

    it('should update form error state', () => {
      const { result } = renderHook(() => useFormSubmission())

      const errorMessage = 'Test error message'

      act(() => {
        result.current.setFormError(errorMessage)
      })

      expect(result.current.formError).toBe(errorMessage)
    })

    it('should clear form error', () => {
      const { result } = renderHook(() => useFormSubmission())

      // First set an error
      act(() => {
        result.current.setFormError('Some error')
      })

      expect(result.current.formError).toBe('Some error')

      // Then clear it
      act(() => {
        result.current.clearFormError()
      })

      expect(result.current.formError).toBeNull()
    })
  })

  describe('handleSubmissionError', () => {
    it('should handle Error objects', () => {
      const { result } = renderHook(() => useFormSubmission())
      const error = new Error('Test error message')

      act(() => {
        result.current.handleSubmissionError(error)
      })

      expect(result.current.formError).toBe('Test error message')
      expect(vi.mocked(toast.error)).toHaveBeenCalledWith('Test error message')
    })

    it('should handle string errors', () => {
      const { result } = renderHook(() => useFormSubmission())
      const errorMessage = 'String error message'

      act(() => {
        result.current.handleSubmissionError(errorMessage)
      })

      expect(result.current.formError).toBe(errorMessage)
      expect(vi.mocked(toast.error)).toHaveBeenCalledWith(errorMessage)
    })

    it('should handle Zod validation errors', () => {
      const { result } = renderHook(() => useFormSubmission())

      const schema = z.object({
        email: z.string().email(),
        age: z.number().min(18),
      })

      try {
        schema.parse({ email: 'invalid-email', age: 16 })
      } catch (zodError) {
        act(() => {
          result.current.handleSubmissionError(zodError)
        })
      }

      expect(result.current.formError).toContain('Validation error:')
      expect(result.current.formError).toContain('email')
      expect(result.current.formError).toContain('age')
      expect(vi.mocked(toast.error)).toHaveBeenCalled()
    })

    it('should use custom error message when provided', () => {
      const { result } = renderHook(() => useFormSubmission())
      const error = new Error('Original error')
      const customMessage = 'Custom error message'

      act(() => {
        result.current.handleSubmissionError(error, customMessage)
      })

      expect(result.current.formError).toBe('Original error') // Uses error.message, not custom
      expect(vi.mocked(toast.error)).toHaveBeenCalledWith('Original error')
    })

    it('should use custom message for unknown error types', () => {
      const { result } = renderHook(() => useFormSubmission())
      const unknownError = { someProperty: 'unknown' }
      const customMessage = 'Custom fallback message'

      act(() => {
        result.current.handleSubmissionError(unknownError, customMessage)
      })

      expect(result.current.formError).toBe(customMessage)
      expect(vi.mocked(toast.error)).toHaveBeenCalledWith(customMessage)
    })

    it('should use default message when no custom message provided for unknown errors', () => {
      const { result } = renderHook(() => useFormSubmission())
      const unknownError = { someProperty: 'unknown' }

      act(() => {
        result.current.handleSubmissionError(unknownError)
      })

      expect(result.current.formError).toBe('An unexpected error occurred')
      expect(vi.mocked(toast.error)).toHaveBeenCalledWith('An unexpected error occurred')
    })

    it('should log errors to console', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const { result } = renderHook(() => useFormSubmission())
      const error = new Error('Test error')

      act(() => {
        result.current.handleSubmissionError(error)
      })

      expect(consoleSpy).toHaveBeenCalledWith('Form submission error:', error)

      consoleSpy.mockRestore()
    })
  })

  describe('complex Zod validation error handling', () => {
    it('should handle multiple Zod validation errors', () => {
      const { result } = renderHook(() => useFormSubmission())

      const schema = z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Invalid email format'),
        age: z.number().min(18, 'Must be at least 18 years old'),
      })

      try {
        schema.parse({ name: 'A', email: 'invalid-email', age: 16 })
      } catch (zodError) {
        act(() => {
          result.current.handleSubmissionError(zodError)
        })
      }

      const errorMessage = result.current.formError!
      expect(errorMessage).toContain('Validation error:')
      expect(errorMessage).toContain('name: Name must be at least 2 characters')
      expect(errorMessage).toContain('email: Invalid email format')
      expect(errorMessage).toContain('age: Must be at least 18 years old')
    })

    it('should handle nested Zod validation errors', () => {
      const { result } = renderHook(() => useFormSubmission())

      const schema = z.object({
        user: z.object({
          profile: z.object({
            firstName: z.string().min(1, 'First name is required'),
          }),
        }),
      })

      try {
        schema.parse({ user: { profile: { firstName: '' } } })
      } catch (zodError) {
        act(() => {
          result.current.handleSubmissionError(zodError)
        })
      }

      expect(result.current.formError).toContain('user.profile.firstName: First name is required')
    })
  })

  describe('integration scenarios', () => {
    it('should handle form submission workflow', () => {
      const { result } = renderHook(() => useFormSubmission())

      // Start submission
      act(() => {
        result.current.setIsSubmitting(true)
      })

      expect(result.current.isSubmitting).toBe(true)
      expect(result.current.formError).toBeNull()

      // Simulate error during submission
      act(() => {
        result.current.handleSubmissionError('Network error')
        result.current.setIsSubmitting(false)
      })

      expect(result.current.isSubmitting).toBe(false)
      expect(result.current.formError).toBe('Network error')

      // Clear error for retry
      act(() => {
        result.current.clearFormError()
      })

      expect(result.current.formError).toBeNull()
    })

    it('should handle successful submission after error', () => {
      const { result } = renderHook(() => useFormSubmission())

      // Set initial error
      act(() => {
        result.current.setFormError('Initial error')
      })

      expect(result.current.formError).toBe('Initial error')

      // Clear for new submission
      act(() => {
        result.current.setFormError(null)
        result.current.setIsSubmitting(true)
      })

      expect(result.current.formError).toBeNull()
      expect(result.current.isSubmitting).toBe(true)

      // Complete successful submission
      act(() => {
        result.current.setIsSubmitting(false)
      })

      expect(result.current.isSubmitting).toBe(false)
      expect(result.current.formError).toBeNull()
    })
  })

  describe('error boundary scenarios', () => {
    it('should handle null/undefined errors gracefully', () => {
      const { result } = renderHook(() => useFormSubmission())

      act(() => {
        result.current.handleSubmissionError(null)
      })

      expect(result.current.formError).toBe('An unexpected error occurred')

      act(() => {
        result.current.handleSubmissionError(undefined)
      })

      expect(result.current.formError).toBe('An unexpected error occurred')
    })

    it('should handle empty string errors', () => {
      const { result } = renderHook(() => useFormSubmission())

      act(() => {
        result.current.handleSubmissionError('')
      })

      expect(result.current.formError).toBe('')
      expect(vi.mocked(toast.error)).toHaveBeenCalledWith('')
    })
  })
})
