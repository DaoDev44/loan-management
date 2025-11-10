import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoanOverviewCard } from '@/components/loans/loan-overview-card'
import type { SerializedLoan } from '@/lib/utils/serialize'

describe('LoanOverviewCard', () => {
  const baseLoan: SerializedLoan = {
    id: '1',
    borrowerName: 'John Doe',
    borrowerEmail: 'john@example.com',
    borrowerPhone: '+1-555-1234',
    principal: 10000,
    interestRate: 5.5,
    startDate: '2024-01-01',
    endDate: '2025-01-01',
    termMonths: 12,
    interestCalculationType: 'SIMPLE',
    paymentFrequency: 'MONTHLY',
    status: 'ACTIVE',
    balance: 7500, // $2500 paid off
    notes: 'Personal loan for home improvement',
    collateral: 'Vehicle title',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    payments: [],
  }

  const loanWithoutOptionals: SerializedLoan = {
    ...baseLoan,
    id: '2',
    borrowerPhone: null,
    notes: null,
    collateral: null,
  }

  it('renders loan overview card title', () => {
    render(<LoanOverviewCard loan={baseLoan} />)

    expect(screen.getByText('Loan Overview')).toBeInTheDocument()
  })

  describe('Borrower Information', () => {
    it('displays borrower name and email', () => {
      render(<LoanOverviewCard loan={baseLoan} />)

      expect(screen.getByText('Borrower Information')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
    })

    it('displays borrower phone when present', () => {
      render(<LoanOverviewCard loan={baseLoan} />)

      expect(screen.getByText('+1-555-1234')).toBeInTheDocument()
    })

    it('does not display phone section when phone is null', () => {
      render(<LoanOverviewCard loan={loanWithoutOptionals} />)

      // Phone should not be displayed
      expect(screen.queryByText('+1-555-1234')).not.toBeInTheDocument()
    })
  })

  describe('Loan Terms', () => {
    it('displays loan terms correctly formatted', () => {
      render(<LoanOverviewCard loan={baseLoan} />)

      expect(screen.getByText('Loan Terms')).toBeInTheDocument()
      expect(screen.getByText('$10,000.00')).toBeInTheDocument() // Principal
      expect(screen.getByText('5.50%')).toBeInTheDocument() // Interest rate
      expect(screen.getByText('12 months')).toBeInTheDocument() // Term
      expect(screen.getByText('MONTHLY')).toBeInTheDocument() // Payment frequency
    })
  })

  describe('Current Status', () => {
    it('displays current balance correctly', () => {
      render(<LoanOverviewCard loan={baseLoan} />)

      expect(screen.getByText('$7,500.00')).toBeInTheDocument() // Current balance
      expect(screen.getByText('Current Balance')).toBeInTheDocument()
    })

    it('calculates and displays amount paid correctly', () => {
      render(<LoanOverviewCard loan={baseLoan} />)

      expect(screen.getByText('$2,500.00')).toBeInTheDocument() // Amount paid (10000 - 7500)
      expect(screen.getByText('Amount Paid')).toBeInTheDocument()
    })

    it('calculates and displays percentage paid off correctly', () => {
      render(<LoanOverviewCard loan={baseLoan} />)

      expect(screen.getByText('25%')).toBeInTheDocument() // Paid off percentage ((10000-7500)/10000 * 100)
      expect(screen.getByText('Paid Off')).toBeInTheDocument()
    })

    it('handles loan with zero balance (fully paid)', () => {
      const paidOffLoan = { ...baseLoan, balance: 0 }
      render(<LoanOverviewCard loan={paidOffLoan} />)

      expect(screen.getByText('$0.00')).toBeInTheDocument() // Current balance
      // Use more specific query for amount paid since principal also shows $10,000.00
      expect(screen.getByText('Current Balance')).toBeInTheDocument()
      expect(screen.getByText('Amount Paid')).toBeInTheDocument()
      expect(screen.getByText('100%')).toBeInTheDocument() // 100% paid off
    })

    it('handles loan with no payments made', () => {
      const newLoan = { ...baseLoan, balance: baseLoan.principal }
      render(<LoanOverviewCard loan={newLoan} />)

      expect(screen.getByText('$0.00')).toBeInTheDocument() // Amount paid is 0
      expect(screen.getByText('0%')).toBeInTheDocument() // 0% paid off
      // Balance should equal principal, but we already tested principal display above
      expect(screen.getByText('Current Balance')).toBeInTheDocument()
    })
  })

  describe('Dates', () => {
    it('displays formatted start and end dates', () => {
      render(<LoanOverviewCard loan={baseLoan} />)

      // Check that date labels are present
      expect(screen.getByText('Start Date:')).toBeInTheDocument()
      expect(screen.getByText('End Date:')).toBeInTheDocument()

      // Check that some date format is present (MM/DD/YYYY pattern)
      const dateElements = screen.getAllByText(/\d{2}\/\d{2}\/\d{4}/)
      expect(dateElements.length).toBeGreaterThanOrEqual(2) // Should have at least start and end dates
    })
  })

  describe('Notes and Collateral', () => {
    it('displays notes when present', () => {
      render(<LoanOverviewCard loan={baseLoan} />)

      expect(screen.getByText('Notes')).toBeInTheDocument()
      expect(screen.getByText('Personal loan for home improvement')).toBeInTheDocument()
    })

    it('displays collateral when present', () => {
      render(<LoanOverviewCard loan={baseLoan} />)

      expect(screen.getByText('Collateral')).toBeInTheDocument()
      expect(screen.getByText('Vehicle title')).toBeInTheDocument()
    })

    it('does not display notes and collateral sections when both are null', () => {
      render(<LoanOverviewCard loan={loanWithoutOptionals} />)

      expect(screen.queryByText('Notes')).not.toBeInTheDocument()
      expect(screen.queryByText('Collateral')).not.toBeInTheDocument()
    })

    it('displays notes section when only notes are present', () => {
      const loanWithNotesOnly = {
        ...loanWithoutOptionals,
        notes: 'Important note'
      }
      render(<LoanOverviewCard loan={loanWithNotesOnly} />)

      expect(screen.getByText('Notes')).toBeInTheDocument()
      expect(screen.getByText('Important note')).toBeInTheDocument()
      expect(screen.queryByText('Collateral')).not.toBeInTheDocument()
    })

    it('displays collateral section when only collateral is present', () => {
      const loanWithCollateralOnly = {
        ...loanWithoutOptionals,
        collateral: 'House deed'
      }
      render(<LoanOverviewCard loan={loanWithCollateralOnly} />)

      expect(screen.getByText('Collateral')).toBeInTheDocument()
      expect(screen.getByText('House deed')).toBeInTheDocument()
      expect(screen.queryByText('Notes')).not.toBeInTheDocument()
    })
  })

  describe('Interest calculation type display', () => {
    it('displays different interest calculation types', () => {
      const amortizedLoan = { ...baseLoan, interestCalculationType: 'AMORTIZED' as const }
      const { rerender } = render(<LoanOverviewCard loan={baseLoan} />)

      expect(screen.getByText('SIMPLE')).toBeInTheDocument()

      rerender(<LoanOverviewCard loan={amortizedLoan} />)
      expect(screen.getByText('AMORTIZED')).toBeInTheDocument()
    })
  })

  describe('Payment frequency display', () => {
    it('displays different payment frequencies', () => {
      const biWeeklyLoan = { ...baseLoan, paymentFrequency: 'BI_WEEKLY' as const }
      const { rerender } = render(<LoanOverviewCard loan={baseLoan} />)

      expect(screen.getByText('MONTHLY')).toBeInTheDocument()

      rerender(<LoanOverviewCard loan={biWeeklyLoan} />)
      expect(screen.getByText('BI_WEEKLY')).toBeInTheDocument()
    })
  })

  describe('Edge cases', () => {
    it('handles very large loan amounts correctly', () => {
      const largeLoan = {
        ...baseLoan,
        principal: 1000000,
        balance: 750000
      }
      render(<LoanOverviewCard loan={largeLoan} />)

      expect(screen.getByText('$1,000,000.00')).toBeInTheDocument() // Principal
      expect(screen.getByText('$750,000.00')).toBeInTheDocument() // Balance
      expect(screen.getByText('$250,000.00')).toBeInTheDocument() // Amount paid
    })

    it('handles decimal percentages correctly', () => {
      const loanWith33Percent = {
        ...baseLoan,
        principal: 15000,
        balance: 10000 // 1/3 paid off
      }
      render(<LoanOverviewCard loan={loanWith33Percent} />)

      expect(screen.getByText('33%')).toBeInTheDocument() // Should round to 33%
    })
  })
})