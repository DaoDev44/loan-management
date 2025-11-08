import type { CreateLoanInput } from '@/lib/validations'

/**
 * Test loan fixtures for consistent test data
 */

export const validLoan: CreateLoanInput = {
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
}

export const validLoan2: CreateLoanInput = {
  borrowerName: 'Jane Smith',
  borrowerEmail: 'jane@example.com',
  borrowerPhone: '+1-555-5678',
  principal: 15000,
  interestRate: 6.0,
  startDate: new Date('2024-01-01'),
  endDate: new Date('2026-01-01'),
  termMonths: 24,
  interestCalculationType: 'AMORTIZED',
  paymentFrequency: 'BI_WEEKLY',
}
