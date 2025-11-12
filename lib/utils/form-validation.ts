/**
 * Common validation messages and values
 */
export const validationMessages = {
  required: {
    amount: 'Amount is required',
    borrowerName: 'Full name is required',
    borrowerEmail: 'Email address is required',
    interestRate: 'Interest rate is required',
    termMonths: 'Loan term is required',
    date: 'Date is required'
  },

  format: {
    email: 'Please enter a valid email address',
    phone: 'Please enter a valid phone number',
    amount: 'Amount must be greater than $0',
    percentage: 'Interest rate must be between 0% and 100%'
  }
}

/**
 * Common validation patterns
 */
export const validationPatterns = {
  email: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  phone: /^\(\d{3}\) \d{3}-\d{4}$/
}

/**
 * Helper function to create amount validation with optional max limit
 */
export const createAmountValidation = (currentBalance?: number) => {
  const baseRules = {
    required: validationMessages.required.amount,
    min: { value: 0.01, message: 'Payment must be greater than $0' },
  }

  if (currentBalance !== undefined) {
    return {
      ...baseRules,
      max: {
        value: currentBalance,
        message: `Payment cannot exceed current balance ($${currentBalance.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })})`
      },
      validate: (value: number) => {
        if (value > currentBalance) {
          return `Payment cannot exceed current balance ($${currentBalance.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })})`
        }
        return true
      }
    }
  }

  return baseRules
}

/**
 * Payment date validation (allows past dates, limits future dates)
 */
export const paymentDateValidation = {
  required: validationMessages.required.date,
  validate: (value: string) => {
    const selectedDate = new Date(value)
    const futureLimit = new Date()
    futureLimit.setDate(futureLimit.getDate() + 30) // 30 days in future

    if (selectedDate > futureLimit) {
      return 'Payment date cannot be more than 30 days in the future'
    }
    return true
  }
}

/**
 * Common validation rules (no generics, just plain objects)
 */
export const commonValidationRules = {
  notes: {
    maxLength: { value: 1000, message: 'Notes cannot exceed 1000 characters' }
  },

  borrowerName: {
    required: validationMessages.required.borrowerName,
    minLength: { value: 2, message: 'Name must be at least 2 characters' },
    maxLength: { value: 100, message: 'Name must be less than 100 characters' }
  },

  borrowerEmail: {
    required: validationMessages.required.borrowerEmail,
    pattern: { value: validationPatterns.email, message: validationMessages.format.email }
  },

  borrowerPhone: {
    pattern: { value: validationPatterns.phone, message: validationMessages.format.phone }
  },

  interestRate: {
    required: validationMessages.required.interestRate,
    min: { value: 0.01, message: 'Interest rate must be greater than 0%' },
    max: { value: 100, message: 'Interest rate must be less than 100%' }
  },

  termMonths: {
    required: validationMessages.required.termMonths,
    min: { value: 1, message: 'Term must be at least 1 month' },
    max: { value: 360, message: 'Term must be less than 360 months' }
  }
}