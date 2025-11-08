/**
 * Quick validation test script
 * Tests the Zod schemas to ensure they're working correctly
 */

import {
  CreateLoanSchema,
  CreatePaymentSchema,
  currency,
  email,
  percentage,
  phone,
} from '../lib/validations'

console.log('🧪 Testing Zod Validation Schemas\n')

// Test 1: Valid loan
console.log('Test 1: Valid loan creation')
try {
  const validLoan = CreateLoanSchema.parse({
    borrowerName: 'John Doe',
    borrowerEmail: 'john@example.com',
    borrowerPhone: '+1-555-1234',
    principal: 10000,
    interestRate: 5.5,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2025-01-01'),
    termMonths: 12,
    interestCalculationType: 'SIMPLE',
    paymentFrequency: 'MONTHLY',
  })
  console.log('✅ Valid loan passed\n')
} catch (error) {
  console.error('❌ Valid loan failed:', error)
  process.exit(1)
}

// Test 2: Invalid loan (negative principal)
console.log('Test 2: Invalid loan (negative principal)')
try {
  CreateLoanSchema.parse({
    borrowerName: 'John Doe',
    borrowerEmail: 'john@example.com',
    principal: -1000,
    interestRate: 5.5,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2025-01-01'),
    termMonths: 12,
  })
  console.error('❌ Should have rejected negative principal')
  process.exit(1)
} catch (error) {
  console.log('✅ Correctly rejected negative principal\n')
}

// Test 3: Invalid loan (end date before start date)
console.log('Test 3: Invalid loan (end date before start date)')
try {
  CreateLoanSchema.parse({
    borrowerName: 'John Doe',
    borrowerEmail: 'john@example.com',
    borrowerPhone: '+1-555-1234',
    principal: 10000,
    interestRate: 5.5,
    startDate: new Date('2025-01-01'),
    endDate: new Date('2024-01-01'),
    termMonths: 12,
  })
  console.error('❌ Should have rejected end date before start date')
  process.exit(1)
} catch (error) {
  console.log('✅ Correctly rejected end date before start date\n')
}

// Test 4: Valid payment
console.log('Test 4: Valid payment creation')
try {
  const validPayment = CreatePaymentSchema.parse({
    loanId: 'clxyz1234567890abcdefgh',
    amount: 500,
    date: new Date(),
    notes: 'Monthly payment',
  })
  console.log('✅ Valid payment passed\n')
} catch (error) {
  console.error('❌ Valid payment failed:', error)
  process.exit(1)
}

// Test 5: Invalid payment (negative amount)
console.log('Test 5: Invalid payment (negative amount)')
try {
  CreatePaymentSchema.parse({
    loanId: 'clxyz1234567890abcdefgh',
    amount: -500,
    date: new Date(),
  })
  console.error('❌ Should have rejected negative amount')
  process.exit(1)
} catch (error) {
  console.log('✅ Correctly rejected negative amount\n')
}

// Test 6: Common validators
console.log('Test 6: Common validators')
try {
  currency.parse(100.99)
  percentage.parse(5.5)
  email.parse('test@example.com')
  phone.parse('+1-555-1234')
  console.log('✅ Common validators passed\n')
} catch (error) {
  console.error('❌ Common validators failed:', error)
  process.exit(1)
}

// Test 7: Invalid email
console.log('Test 7: Invalid email')
try {
  email.parse('not-an-email')
  console.error('❌ Should have rejected invalid email')
  process.exit(1)
} catch (error) {
  console.log('✅ Correctly rejected invalid email\n')
}

console.log('🎉 All validation tests passed!')
