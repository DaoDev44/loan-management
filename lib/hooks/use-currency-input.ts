import { useState, FocusEvent, ChangeEvent, useCallback } from 'react'
import { UseFormSetValue, FieldValues, Path, PathValue } from 'react-hook-form'

interface UseCurrencyInputOptions {
  initialValue?: number
}

interface UseCurrencyInputReturn {
  displayValue: string
  isFocused: boolean
  formatNumberDisplay: (value: number | string) => string
  parseFormattedNumber: (value: string | number | undefined | null) => number
  handleFocus: (e: FocusEvent<HTMLInputElement>) => void
  handleBlur: <T extends FieldValues>(
    e: FocusEvent<HTMLInputElement>,
    setValue: UseFormSetValue<T>,
    fieldName: Path<T>
  ) => void
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void
  setDisplayValue: (value: string) => void
  setIsFocused: (focused: boolean) => void
}

/**
 * Custom hook for handling currency input formatting and validation
 *
 * Provides consistent currency formatting behavior across forms:
 * - Displays formatted numbers with commas when not focused
 * - Shows raw numbers for editing when focused
 * - Handles focus/blur state transitions
 * - Provides parsing utilities for form integration
 */
export function useCurrencyInput(_options: UseCurrencyInputOptions = {}): UseCurrencyInputReturn {
  const [displayValue, setDisplayValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  // Format number with commas for display
  const formatNumberDisplay = useCallback((value: number | string) => {
    if (!value || value === 0) return ''
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(num)) return ''
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
  }, [])

  // Parse formatted number back to raw number
  const parseFormattedNumber = useCallback((value: string | number | undefined | null): number => {
    if (typeof value === 'number') return value
    if (!value || value === '') return 0

    const stringValue = String(value)
    const cleaned = stringValue.replace(/[,\s]/g, '')
    const num = parseFloat(cleaned)
    return isNaN(num) ? 0 : num
  }, [])

  // Handle input focus - switch to raw editing mode
  const handleFocus = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      // Convert display value to raw number for editing
      const rawValue = parseFormattedNumber(displayValue)
      const editValue = rawValue > 0 ? String(rawValue) : ''
      setDisplayValue(editValue)
      e.target.select() // Select all text for easy editing
    },
    [displayValue, parseFormattedNumber]
  )

  // Handle input blur - format the number and update form value
  const handleBlur = useCallback(
    <T extends FieldValues>(
      e: FocusEvent<HTMLInputElement>,
      setValue: UseFormSetValue<T>,
      fieldName: Path<T>
    ) => {
      const rawValue = parseFormattedNumber(e.target.value)
      setValue(fieldName, rawValue as PathValue<T, Path<T>>)
      setIsFocused(false)

      if (rawValue && rawValue !== 0) {
        setDisplayValue(formatNumberDisplay(rawValue))
      } else {
        setDisplayValue('')
      }
    },
    [parseFormattedNumber, formatNumberDisplay]
  )

  // Handle input change - only allow valid number input when focused
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (isFocused) {
        // Allow typing raw numbers only when focused
        const value = e.target.value.replace(/[^0-9.]/g, '')
        e.target.value = value
        setDisplayValue(value) // Update display value in real time while typing
      }
    },
    [isFocused]
  )

  return {
    displayValue,
    isFocused,
    formatNumberDisplay,
    parseFormattedNumber,
    handleFocus,
    handleBlur,
    handleChange,
    setDisplayValue,
    setIsFocused,
  }
}
