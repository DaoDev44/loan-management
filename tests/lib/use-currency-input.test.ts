import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCurrencyInput } from '@/lib/hooks/use-currency-input'

// Mock event interfaces for testing
interface MockFocusEvent {
  target: {
    select: ReturnType<typeof vi.fn>
    value?: string
  }
}

interface MockChangeEvent {
  target: {
    value: string
  }
}

describe('useCurrencyInput', () => {
  let mockSetValue: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockSetValue = vi.fn()
  })

  describe('formatNumberDisplay', () => {
    it('should format numbers with commas', () => {
      const { result } = renderHook(() => useCurrencyInput())

      expect(result.current.formatNumberDisplay(1000)).toBe('1,000')
      expect(result.current.formatNumberDisplay(1234.56)).toBe('1,234.56')
      expect(result.current.formatNumberDisplay(1000000)).toBe('1,000,000')
    })

    it('should handle string input numbers', () => {
      const { result } = renderHook(() => useCurrencyInput())

      expect(result.current.formatNumberDisplay('1000')).toBe('1,000')
      expect(result.current.formatNumberDisplay('1234.56')).toBe('1,234.56')
    })

    it('should return empty string for zero values', () => {
      const { result } = renderHook(() => useCurrencyInput())

      expect(result.current.formatNumberDisplay(0)).toBe('')
      expect(result.current.formatNumberDisplay('0')).toBe('0') // String '0' is truthy, gets formatted as '0'
      expect(result.current.formatNumberDisplay('')).toBe('')
    })

    it('should handle invalid input gracefully', () => {
      const { result } = renderHook(() => useCurrencyInput())

      expect(result.current.formatNumberDisplay('invalid')).toBe('')
      expect(result.current.formatNumberDisplay(NaN)).toBe('')
    })

    it('should format numbers with proper decimal places', () => {
      const { result } = renderHook(() => useCurrencyInput())

      expect(result.current.formatNumberDisplay(1000.1)).toBe('1,000.1')
      expect(result.current.formatNumberDisplay(1000.123456)).toBe('1,000.12') // Should round to 2 decimal places
    })
  })

  describe('parseFormattedNumber', () => {
    it('should parse formatted numbers back to raw numbers', () => {
      const { result } = renderHook(() => useCurrencyInput())

      expect(result.current.parseFormattedNumber('1,000')).toBe(1000)
      expect(result.current.parseFormattedNumber('1,234.56')).toBe(1234.56)
      expect(result.current.parseFormattedNumber('10,000,000')).toBe(10000000)
    })

    it('should handle numbers without formatting', () => {
      const { result } = renderHook(() => useCurrencyInput())

      expect(result.current.parseFormattedNumber('1000')).toBe(1000)
      expect(result.current.parseFormattedNumber('1234.56')).toBe(1234.56)
    })

    it('should handle numeric input directly', () => {
      const { result } = renderHook(() => useCurrencyInput())

      expect(result.current.parseFormattedNumber(1000)).toBe(1000)
      expect(result.current.parseFormattedNumber(1234.56)).toBe(1234.56)
    })

    it('should return 0 for empty or invalid values', () => {
      const { result } = renderHook(() => useCurrencyInput())

      expect(result.current.parseFormattedNumber('')).toBe(0)
      expect(result.current.parseFormattedNumber(null)).toBe(0)
      expect(result.current.parseFormattedNumber(undefined)).toBe(0)
      expect(result.current.parseFormattedNumber('invalid')).toBe(0)
    })

    it('should handle numbers with spaces', () => {
      const { result } = renderHook(() => useCurrencyInput())

      expect(result.current.parseFormattedNumber('1 000')).toBe(1000)
      expect(result.current.parseFormattedNumber(' 1,234.56 ')).toBe(1234.56)
    })
  })

  describe('focus handling', () => {
    it('should set focus state and select text on focus', () => {
      const { result } = renderHook(() => useCurrencyInput())

      expect(result.current.isFocused).toBe(false)

      const mockEvent: MockFocusEvent = {
        target: {
          select: vi.fn()
        }
      }

      act(() => {
        result.current.handleFocus(mockEvent)
      })

      expect(result.current.isFocused).toBe(true)
      expect(mockEvent.target.select).toHaveBeenCalled()
    })

    it('should convert display value to raw number on focus', () => {
      const { result } = renderHook(() => useCurrencyInput())

      // Set a formatted display value
      act(() => {
        result.current.setDisplayValue('1,000.50')
      })

      const mockEvent: MockFocusEvent = {
        target: {
          select: vi.fn()
        }
      }

      act(() => {
        result.current.handleFocus(mockEvent)
      })

      expect(result.current.isFocused).toBe(true)
      expect(result.current.displayValue).toBe('1000.5') // Raw number for editing
    })

    it('should parse value and update form on blur', () => {
      const { result } = renderHook(() => useCurrencyInput())

      // First set to focused
      act(() => {
        result.current.setIsFocused(true)
      })

      const mockEvent: MockFocusEvent = {
        target: {
          select: vi.fn(),
          value: '1,234.56'
        }
      }

      act(() => {
        result.current.handleBlur(mockEvent, mockSetValue, 'amount')
      })

      expect(result.current.isFocused).toBe(false)
      expect(mockSetValue).toHaveBeenCalledWith('amount', 1234.56)
      expect(result.current.displayValue).toBe('1,234.56')
    })

    it('should clear display value when blur value is 0', () => {
      const { result } = renderHook(() => useCurrencyInput())

      const mockEvent: MockFocusEvent = {
        target: {
          select: vi.fn(),
          value: '0'
        }
      }

      act(() => {
        result.current.handleBlur(mockEvent, mockSetValue, 'amount')
      })

      expect(result.current.displayValue).toBe('')
      expect(mockSetValue).toHaveBeenCalledWith('amount', 0)
    })

    it('should handle empty value on blur', () => {
      const { result } = renderHook(() => useCurrencyInput())

      const mockEvent: MockFocusEvent = {
        target: {
          select: vi.fn(),
          value: ''
        }
      }

      act(() => {
        result.current.handleBlur(mockEvent, mockSetValue, 'amount')
      })

      expect(result.current.displayValue).toBe('')
      expect(mockSetValue).toHaveBeenCalledWith('amount', 0)
    })
  })

  describe('change handling', () => {
    it('should allow only valid number characters when focused', () => {
      const { result } = renderHook(() => useCurrencyInput())

      act(() => {
        result.current.setIsFocused(true)
      })

      const mockEvent: MockChangeEvent = {
        target: {
          value: 'abc123.45def'
        }
      }

      act(() => {
        result.current.handleChange(mockEvent)
      })

      expect(mockEvent.target.value).toBe('123.45')
    })

    it('should allow decimal points in input', () => {
      const { result } = renderHook(() => useCurrencyInput())

      act(() => {
        result.current.setIsFocused(true)
      })

      const mockEvent: MockChangeEvent = {
        target: {
          value: '123.45'
        }
      }

      act(() => {
        result.current.handleChange(mockEvent)
      })

      expect(mockEvent.target.value).toBe('123.45')
    })

    it('should not modify input when not focused', () => {
      const { result } = renderHook(() => useCurrencyInput())

      expect(result.current.isFocused).toBe(false)

      const originalValue = 'some value'
      const mockEvent: MockChangeEvent = {
        target: {
          value: originalValue
        }
      }

      act(() => {
        result.current.handleChange(mockEvent)
      })

      expect(mockEvent.target.value).toBe(originalValue)
    })
  })

  describe('state management', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useCurrencyInput())

      expect(result.current.displayValue).toBe('')
      expect(result.current.isFocused).toBe(false)
    })

    it('should update display value when set manually', () => {
      const { result } = renderHook(() => useCurrencyInput())

      act(() => {
        result.current.setDisplayValue('1,000')
      })

      expect(result.current.displayValue).toBe('1,000')
    })

    it('should update focus state when set manually', () => {
      const { result } = renderHook(() => useCurrencyInput())

      act(() => {
        result.current.setIsFocused(true)
      })

      expect(result.current.isFocused).toBe(true)

      act(() => {
        result.current.setIsFocused(false)
      })

      expect(result.current.isFocused).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle very large numbers', () => {
      const { result } = renderHook(() => useCurrencyInput())

      const largeNumber = 999999999999.99
      expect(result.current.formatNumberDisplay(largeNumber)).toBe('999,999,999,999.99')
      expect(result.current.parseFormattedNumber('999,999,999,999.99')).toBe(largeNumber)
    })

    it('should handle very small decimal numbers', () => {
      const { result } = renderHook(() => useCurrencyInput())

      expect(result.current.formatNumberDisplay(0.01)).toBe('0.01')
      expect(result.current.parseFormattedNumber('0.01')).toBe(0.01)
    })

    it('should handle negative numbers', () => {
      const { result } = renderHook(() => useCurrencyInput())

      // Note: The current implementation preserves negative numbers
      // This test documents the current behavior
      expect(result.current.parseFormattedNumber('-1000')).toBe(-1000) // Negative sign is preserved
    })
  })
})