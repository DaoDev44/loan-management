import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PaymentHistoryCard } from '@/components/loans/payment-history-card'
import type { SerializedPayment } from '@/lib/utils/serialize'

describe('PaymentHistoryCard', () => {
  const mockPayments: SerializedPayment[] = [
    {
      id: '1',
      loanId: 'loan-1',
      amount: 500,
      date: '2024-03-15',
      notes: 'Regular monthly payment',
    },
    {
      id: '2',
      loanId: 'loan-1',
      amount: 750,
      date: '2024-02-15',
      notes: null,
    },
    {
      id: '3',
      loanId: 'loan-1',
      amount: 500,
      date: '2024-01-15',
      notes: 'First payment',
    },
    // Add more payments to test pagination
    ...Array.from({ length: 12 }, (_, i) => ({
      id: `payment-${i + 4}`,
      loanId: 'loan-1',
      amount: 500,
      date: `2023-${String(12 - i).padStart(2, '0')}-15`,
      notes: null,
    })),
  ]

  const singlePayment: SerializedPayment[] = [
    {
      id: '1',
      loanId: 'loan-1',
      amount: 1000,
      date: '2024-01-01',
      notes: 'Single payment',
    },
  ]

  it('renders payment history card title', () => {
    render(<PaymentHistoryCard payments={mockPayments} />)

    expect(screen.getByText('Payment History')).toBeInTheDocument()
  })

  it('displays payment count in description', () => {
    render(<PaymentHistoryCard payments={mockPayments} />)

    expect(screen.getByText(`${mockPayments.length} payments recorded`)).toBeInTheDocument()
  })

  it('displays singular payment count correctly', () => {
    render(<PaymentHistoryCard payments={singlePayment} />)

    expect(screen.getByText('1 payment recorded')).toBeInTheDocument()
  })

  describe('Empty State', () => {
    it('shows empty state when no payments', () => {
      render(<PaymentHistoryCard payments={[]} />)

      expect(screen.getByText('No payments recorded')).toBeInTheDocument()
      expect(screen.getByText('Payments will appear here once they are added to this loan.')).toBeInTheDocument()
    })

    it('does not show table when no payments', () => {
      render(<PaymentHistoryCard payments={[]} />)

      expect(screen.queryByRole('table')).not.toBeInTheDocument()
    })
  })

  describe('Payment Display', () => {
    it('displays payments in table format', () => {
      render(<PaymentHistoryCard payments={singlePayment} />)

      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getByText('Date')).toBeInTheDocument()
      expect(screen.getByText('Amount')).toBeInTheDocument()
      expect(screen.getByText('Notes')).toBeInTheDocument()
    })

    it('formats payment amounts as currency', () => {
      render(<PaymentHistoryCard payments={singlePayment} />)

      expect(screen.getByText('$1,000.00')).toBeInTheDocument()
    })

    it('formats payment dates correctly', () => {
      render(<PaymentHistoryCard payments={singlePayment} />)

      // Check that a date in MM/DD/YYYY format is present
      expect(screen.getByText(/\d{2}\/\d{2}\/\d{4}/)).toBeInTheDocument()
    })

    it('displays payment notes when present', () => {
      render(<PaymentHistoryCard payments={singlePayment} />)

      expect(screen.getByText('Single payment')).toBeInTheDocument()
    })

    it('shows dash for missing notes', () => {
      const paymentWithoutNotes: SerializedPayment[] = [
        {
          id: '1',
          loanId: 'loan-1',
          amount: 500,
          date: '2024-01-01',
          notes: null,
        },
      ]

      render(<PaymentHistoryCard payments={paymentWithoutNotes} />)

      expect(screen.getByText('—')).toBeInTheDocument()
    })

    it('hides notes column on mobile (hidden md:table-cell)', () => {
      render(<PaymentHistoryCard payments={singlePayment} />)

      const notesHeader = screen.getByText('Notes').closest('th')
      expect(notesHeader).toHaveClass('hidden', 'md:table-cell')
    })
  })

  describe('Payment Sorting', () => {
    it('sorts payments by date with most recent first', () => {
      render(<PaymentHistoryCard payments={mockPayments.slice(0, 3)} />)

      const dateRows = screen.getAllByText(/\d{2}\/\d{2}\/\d{4}/)

      // Should have 3 dates rendered
      expect(dateRows).toHaveLength(3)

      // Verify that we have dates in the expected chronological order by checking amounts
      // (since March payment is $500, February is $750, January is $500)
      const amountCells = screen.getAllByText(/\$\d+\.00/)
      expect(amountCells).toHaveLength(3)

      // The order should be most recent first, so amounts should be $500, $750, $500
      expect(amountCells[0]).toHaveTextContent('$500.00') // March 2024 (most recent)
      expect(amountCells[1]).toHaveTextContent('$750.00') // February 2024
      expect(amountCells[2]).toHaveTextContent('$500.00') // January 2024
    })
  })

  describe('Pagination', () => {
    it('displays pagination when there are more than 10 payments', () => {
      render(<PaymentHistoryCard payments={mockPayments} />)

      expect(screen.getByText('Previous')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
      expect(screen.getByText(/Page \d+ of \d+/)).toBeInTheDocument()
    })

    it('does not display pagination when 10 or fewer payments', () => {
      const fewPayments = mockPayments.slice(0, 10)
      render(<PaymentHistoryCard payments={fewPayments} />)

      expect(screen.queryByText('Previous')).not.toBeInTheDocument()
      expect(screen.queryByText('Next')).not.toBeInTheDocument()
    })

    it('displays correct pagination info', () => {
      render(<PaymentHistoryCard payments={mockPayments} />)

      expect(screen.getByText(`Showing 1 to 10 of ${mockPayments.length} payments`)).toBeInTheDocument()
    })

    it('shows correct page numbers', () => {
      render(<PaymentHistoryCard payments={mockPayments} />)

      const totalPages = Math.ceil(mockPayments.length / 10)
      expect(screen.getByText(`Page 1 of ${totalPages}`)).toBeInTheDocument()
    })

    it('disables Previous button on first page', () => {
      render(<PaymentHistoryCard payments={mockPayments} />)

      const previousButton = screen.getByText('Previous').closest('button')
      expect(previousButton).toBeDisabled()
    })

    it('enables Next button when there are more pages', () => {
      render(<PaymentHistoryCard payments={mockPayments} />)

      const nextButton = screen.getByText('Next').closest('button')
      expect(nextButton).not.toBeDisabled()
    })

    it('navigates to next page when Next button is clicked', () => {
      render(<PaymentHistoryCard payments={mockPayments} />)

      const nextButton = screen.getByText('Next').closest('button')
      fireEvent.click(nextButton!)

      expect(screen.getByText('Page 2 of 2')).toBeInTheDocument()
      expect(screen.getByText('Showing 11 to 15 of 15 payments')).toBeInTheDocument()
    })

    it('navigates to previous page when Previous button is clicked', () => {
      render(<PaymentHistoryCard payments={mockPayments} />)

      // Go to next page first
      const nextButton = screen.getByText('Next').closest('button')
      fireEvent.click(nextButton!)

      // Then go back
      const previousButton = screen.getByText('Previous').closest('button')
      fireEvent.click(previousButton!)

      expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
      expect(screen.getByText('Showing 1 to 10 of 15 payments')).toBeInTheDocument()
    })

    it('disables Next button on last page', () => {
      render(<PaymentHistoryCard payments={mockPayments} />)

      // Navigate to last page
      const nextButton = screen.getByText('Next').closest('button')
      fireEvent.click(nextButton!)

      // Next button should be disabled now
      expect(nextButton).toBeDisabled()
    })

    it('limits displayed payments to 10 per page', () => {
      render(<PaymentHistoryCard payments={mockPayments} />)

      // Should only show 10 payments on first page
      const paymentRows = screen.getAllByText(/\$\d+\.00/)
      expect(paymentRows).toHaveLength(10)
    })
  })

  describe('Edge Cases', () => {
    it('handles exactly 10 payments (no pagination)', () => {
      const exactlyTenPayments = mockPayments.slice(0, 10)
      render(<PaymentHistoryCard payments={exactlyTenPayments} />)

      expect(screen.queryByText('Previous')).not.toBeInTheDocument()
      expect(screen.queryByText('Next')).not.toBeInTheDocument()
    })

    it('handles 11 payments (shows pagination)', () => {
      const elevenPayments = mockPayments.slice(0, 11)
      render(<PaymentHistoryCard payments={elevenPayments} />)

      expect(screen.getByText('Previous')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
      expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
    })

    it('handles very large payment amounts', () => {
      const largePayment: SerializedPayment[] = [
        {
          id: '1',
          loanId: 'loan-1',
          amount: 1000000,
          date: '2024-01-01',
          notes: 'Large payment',
        },
      ]

      render(<PaymentHistoryCard payments={largePayment} />)

      expect(screen.getByText('$1,000,000.00')).toBeInTheDocument()
    })

    it('handles very long notes text', () => {
      const longNotesPayment: SerializedPayment[] = [
        {
          id: '1',
          loanId: 'loan-1',
          amount: 500,
          date: '2024-01-01',
          notes: 'This is a very long note that might wrap to multiple lines and needs to be handled properly in the UI',
        },
      ]

      render(<PaymentHistoryCard payments={longNotesPayment} />)

      expect(screen.getByText('This is a very long note that might wrap to multiple lines and needs to be handled properly in the UI')).toBeInTheDocument()
    })
  })
})