import { describe, it, expect } from 'vitest'
import {
  validationMessages,
  validationPatterns,
  createAmountValidation,
  paymentDateValidation,
  commonValidationRules,
} from '@/lib/utils/form-validation'

describe('Form Validation Utilities', () => {
  describe('validationMessages', () => {
    it('should contain required field messages', () => {
      expect(validationMessages.required.amount).toBe('Amount is required')
      expect(validationMessages.required.borrowerName).toBe('Full name is required')
      expect(validationMessages.required.borrowerEmail).toBe('Email address is required')
      expect(validationMessages.required.interestRate).toBe('Interest rate is required')
      expect(validationMessages.required.termMonths).toBe('Loan term is required')
      expect(validationMessages.required.date).toBe('Date is required')
    })

    it('should contain format validation messages', () => {
      expect(validationMessages.format.email).toBe('Please enter a valid email address')
      expect(validationMessages.format.phone).toBe('Please enter a valid phone number')
      expect(validationMessages.format.amount).toBe('Amount must be greater than $0')
      expect(validationMessages.format.percentage).toBe('Interest rate must be between 0% and 100%')
    })
  })

  describe('validationPatterns', () => {
    describe('email pattern', () => {
      it('should validate correct email addresses', () => {
        const emailPattern = validationPatterns.email

        expect(emailPattern.test('user@example.com')).toBe(true)
        expect(emailPattern.test('test.email+tag@domain.co.uk')).toBe(true)
        expect(emailPattern.test('user123@test-domain.org')).toBe(true)
      })

      it('should reject invalid email addresses', () => {
        const emailPattern = validationPatterns.email

        expect(emailPattern.test('invalid-email')).toBe(false)
        expect(emailPattern.test('user@')).toBe(false)
        expect(emailPattern.test('@domain.com')).toBe(false)
        expect(emailPattern.test('user space@domain.com')).toBe(false)
      })
    })

    describe('phone pattern', () => {
      it('should validate correct phone format', () => {
        const phonePattern = validationPatterns.phone

        expect(phonePattern.test('(123) 456-7890')).toBe(true)
        expect(phonePattern.test('(999) 999-9999')).toBe(true)
      })

      it('should reject invalid phone formats', () => {
        const phonePattern = validationPatterns.phone

        expect(phonePattern.test('123-456-7890')).toBe(false)
        expect(phonePattern.test('(123)456-7890')).toBe(false)
        expect(phonePattern.test('123 456 7890')).toBe(false)
        expect(phonePattern.test('1234567890')).toBe(false)
        expect(phonePattern.test('(12) 456-7890')).toBe(false) // Wrong digit count
      })
    })
  })

  describe('createAmountValidation', () => {
    it('should return base validation rules when no balance provided', () => {
      const rules = createAmountValidation()

      expect(rules.required).toBe(validationMessages.required.amount)
      expect(rules.min).toEqual({
        value: 0.01,
        message: 'Payment must be greater than $0'
      })
      expect('max' in rules ? rules.max : undefined).toBeUndefined()
      expect('validate' in rules ? rules.validate : undefined).toBeUndefined()
    })

    it('should return validation with max limit when balance provided', () => {
      const currentBalance = 1000
      const rules = createAmountValidation(currentBalance)

      expect(rules.required).toBe(validationMessages.required.amount)
      expect(rules.min).toEqual({
        value: 0.01,
        message: 'Payment must be greater than $0'
      })
      expect('max' in rules && rules.max).toEqual({
        value: currentBalance,
        message: 'Payment cannot exceed current balance ($1,000.00)'
      })
      expect('validate' in rules && typeof rules.validate).toBe('function')
    })

    it('should format balance correctly in max message', () => {
      const rules = createAmountValidation(1234.56)

      expect('max' in rules && rules.max?.message).toBe('Payment cannot exceed current balance ($1,234.56)')
    })

    it('should format balance with proper commas for large amounts', () => {
      const rules = createAmountValidation(1000000.99)

      expect('max' in rules && rules.max?.message).toBe('Payment cannot exceed current balance ($1,000,000.99)')
    })

    describe('validate function', () => {
      it('should return true for valid amounts within balance', () => {
        const rules = createAmountValidation(1000)
        if ('validate' in rules && rules.validate) {
          const validateFn = rules.validate
          expect(validateFn(500)).toBe(true)
          expect(validateFn(1000)).toBe(true)
          expect(validateFn(0.01)).toBe(true)
        }
      })

      it('should return error message for amounts exceeding balance', () => {
        const rules = createAmountValidation(1000)
        if ('validate' in rules && rules.validate) {
          const validateFn = rules.validate
          const result = validateFn(1500)
          expect(typeof result).toBe('string')
          expect(result).toContain('Payment cannot exceed current balance')
          expect(result).toContain('$1,000.00')
        }
      })

      it('should handle edge case where amount equals balance', () => {
        const rules = createAmountValidation(1000)
        if ('validate' in rules && rules.validate) {
          const validateFn = rules.validate
          expect(validateFn(1000)).toBe(true)
        }
      })
    })
  })

  describe('paymentDateValidation', () => {
    it('should require a date', () => {
      expect(paymentDateValidation.required).toBe(validationMessages.required.date)
    })

    describe('validate function', () => {
      it('should allow past dates', () => {
        const pastDate = new Date()
        pastDate.setDate(pastDate.getDate() - 10)

        const result = paymentDateValidation.validate(pastDate.toISOString().split('T')[0])
        expect(result).toBe(true)
      })

      it('should allow today', () => {
        const today = new Date().toISOString().split('T')[0]

        const result = paymentDateValidation.validate(today)
        expect(result).toBe(true)
      })

      it('should allow dates within 30 days in future', () => {
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + 15)

        const result = paymentDateValidation.validate(futureDate.toISOString().split('T')[0])
        expect(result).toBe(true)
      })

      it('should allow exactly 30 days in future', () => {
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + 30)

        const result = paymentDateValidation.validate(futureDate.toISOString().split('T')[0])
        expect(result).toBe(true)
      })

      it('should reject dates more than 30 days in future', () => {
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + 31)

        const result = paymentDateValidation.validate(futureDate.toISOString().split('T')[0])
        expect(result).toBe('Payment date cannot be more than 30 days in the future')
      })

      it('should reject dates far in the future', () => {
        const futureDate = new Date()
        futureDate.setFullYear(futureDate.getFullYear() + 1)

        const result = paymentDateValidation.validate(futureDate.toISOString().split('T')[0])
        expect(result).toBe('Payment date cannot be more than 30 days in the future')
      })
    })
  })

  describe('commonValidationRules', () => {
    describe('notes validation', () => {
      it('should have correct maxLength rule', () => {
        expect(commonValidationRules.notes.maxLength).toEqual({
          value: 1000,
          message: 'Notes cannot exceed 1000 characters'
        })
      })
    })

    describe('borrowerName validation', () => {
      it('should have all required rules', () => {
        const rules = commonValidationRules.borrowerName

        expect(rules.required).toBe(validationMessages.required.borrowerName)
        expect(rules.minLength).toEqual({
          value: 2,
          message: 'Name must be at least 2 characters'
        })
        expect(rules.maxLength).toEqual({
          value: 100,
          message: 'Name must be less than 100 characters'
        })
      })
    })

    describe('borrowerEmail validation', () => {
      it('should have required and pattern rules', () => {
        const rules = commonValidationRules.borrowerEmail

        expect(rules.required).toBe(validationMessages.required.borrowerEmail)
        expect(rules.pattern).toEqual({
          value: validationPatterns.email,
          message: validationMessages.format.email
        })
      })
    })

    describe('borrowerPhone validation', () => {
      it('should have pattern rule only (optional field)', () => {
        const rules = commonValidationRules.borrowerPhone

        expect('required' in rules ? rules.required : undefined).toBeUndefined()
        expect(rules.pattern).toEqual({
          value: validationPatterns.phone,
          message: validationMessages.format.phone
        })
      })
    })

    describe('interestRate validation', () => {
      it('should have all required rules', () => {
        const rules = commonValidationRules.interestRate

        expect(rules.required).toBe(validationMessages.required.interestRate)
        expect(rules.min).toEqual({
          value: 0.01,
          message: 'Interest rate must be greater than 0%'
        })
        expect(rules.max).toEqual({
          value: 100,
          message: 'Interest rate must be less than 100%'
        })
      })
    })

    describe('termMonths validation', () => {
      it('should have all required rules', () => {
        const rules = commonValidationRules.termMonths

        expect(rules.required).toBe(validationMessages.required.termMonths)
        expect(rules.min).toEqual({
          value: 1,
          message: 'Term must be at least 1 month'
        })
        expect(rules.max).toEqual({
          value: 360,
          message: 'Term must be less than 360 months'
        })
      })
    })
  })

  describe('integration scenarios', () => {
    it('should work with React Hook Form pattern validation', () => {
      // This test verifies the structure is compatible with React Hook Form
      const emailRules = commonValidationRules.borrowerEmail

      // Simulate React Hook Form validation
      const testEmail = 'invalid-email'
      const patternTest = emailRules.pattern?.value.test(testEmail)

      expect(patternTest).toBe(false)
      expect(emailRules.pattern?.message).toBe('Please enter a valid email address')
    })

    it('should handle amount validation workflow', () => {
      const balance = 5000
      const rules = createAmountValidation(balance)

      // Test the complete validation workflow
      expect(rules.required).toBeTruthy() // Required check
      expect(rules.min?.value).toBe(0.01) // Minimum check
      expect('max' in rules && rules.max?.value).toBe(balance) // Maximum check

      // Test validate function
      if ('validate' in rules && rules.validate) {
        expect(rules.validate(4999)).toBe(true) // Valid amount
        expect(typeof rules.validate(5001)).toBe('string') // Invalid amount returns error
      }
    })
  })
})