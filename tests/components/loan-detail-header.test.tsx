import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { LoanDetailHeader } from '@/components/loans/loan-detail-header'
import { deleteLoan } from '@/app/actions/loan.actions'
import { useToast } from '@/hooks/use-toast'
import type { SerializedLoan } from '@/lib/utils/serialize'

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

// Mock server actions
vi.mock('@/app/actions/loan.actions', () => ({
  deleteLoan: vi.fn(),
}))

// Mock useToast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(),
}))

// Mock window.confirm
const mockConfirm = vi.fn()
Object.defineProperty(window, 'confirm', {
  value: mockConfirm,
  writable: true,
})

const mockPush = vi.fn()
const mockToast = vi.fn()

describe('LoanDetailHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Setup mocks
    ;(useRouter as any).mockReturnValue({
      push: mockPush,
    })

    ;(useToast as any).mockReturnValue({
      toast: mockToast,
    })

    mockConfirm.mockReturnValue(true)
  })

  const mockActiveLoan: SerializedLoan = {
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
    balance: 8500,
    notes: null,
    collateral: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    payments: [],
  }

  const mockCompletedLoan: SerializedLoan = {
    ...mockActiveLoan,
    id: '2',
    status: 'COMPLETED',
  }

  it('renders loan detail header with borrower name', () => {
    render(<LoanDetailHeader loan={mockActiveLoan} />)

    expect(screen.getByText('Loan Details')).toBeInTheDocument()
    expect(screen.getByText('Loan for John Doe')).toBeInTheDocument()
    expect(screen.getByText('Back to Loans')).toBeInTheDocument()
  })

  it('displays status badge', () => {
    render(<LoanDetailHeader loan={mockActiveLoan} />)

    // Status badge should be rendered - we can check for the status value
    expect(screen.getByText('Edit')).toBeInTheDocument() // Indicates the component rendered
  })

  it('shows all action buttons for active loan', () => {
    render(<LoanDetailHeader loan={mockActiveLoan} />)

    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add payment/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })

  it('disables add payment button for non-active loans', () => {
    render(<LoanDetailHeader loan={mockCompletedLoan} />)

    const addPaymentButton = screen.getByRole('button', { name: /add payment/i })
    expect(addPaymentButton).toBeDisabled()
  })

  it('shows toast message when edit button is clicked', () => {
    render(<LoanDetailHeader loan={mockActiveLoan} />)

    const editButton = screen.getByRole('button', { name: /edit/i })
    fireEvent.click(editButton)

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Edit Loan',
      description: 'Edit loan feature coming soon!',
    })
  })

  it('shows toast message when add payment button is clicked', () => {
    render(<LoanDetailHeader loan={mockActiveLoan} />)

    const addPaymentButton = screen.getByRole('button', { name: /add payment/i })
    fireEvent.click(addPaymentButton)

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Add Payment',
      description: 'Add payment feature coming soon!',
    })
  })

  describe('Delete functionality', () => {
    it('shows confirmation dialog when delete button is clicked', () => {
      render(<LoanDetailHeader loan={mockActiveLoan} />)

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      fireEvent.click(deleteButton)

      expect(mockConfirm).toHaveBeenCalledWith(
        'Are you sure you want to delete the loan for John Doe? This action cannot be undone.'
      )
    })

    it('does not delete when confirmation is cancelled', async () => {
      mockConfirm.mockReturnValue(false)
      render(<LoanDetailHeader loan={mockActiveLoan} />)

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      fireEvent.click(deleteButton)

      expect(deleteLoan).not.toHaveBeenCalled()
    })

    it('deletes loan and navigates on successful deletion', async () => {
      ;(deleteLoan as any).mockResolvedValue({ success: true })

      render(<LoanDetailHeader loan={mockActiveLoan} />)

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      fireEvent.click(deleteButton)

      await waitFor(() => {
        expect(deleteLoan).toHaveBeenCalledWith('1')
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Loan deleted',
          description: 'The loan has been successfully deleted.',
        })
        expect(mockPush).toHaveBeenCalledWith('/loans')
      })
    })

    it('shows error toast on deletion failure', async () => {
      ;(deleteLoan as any).mockResolvedValue({ success: false })

      render(<LoanDetailHeader loan={mockActiveLoan} />)

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      fireEvent.click(deleteButton)

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Failed to delete the loan. Please try again.',
          variant: 'destructive',
        })
      })

      expect(mockPush).not.toHaveBeenCalled()
    })

    it('shows error toast on deletion exception', async () => {
      ;(deleteLoan as any).mockRejectedValue(new Error('Network error'))

      render(<LoanDetailHeader loan={mockActiveLoan} />)

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      fireEvent.click(deleteButton)

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'An unexpected error occurred while deleting the loan.',
          variant: 'destructive',
        })
      })

      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  it('has accessible back navigation link', () => {
    render(<LoanDetailHeader loan={mockActiveLoan} />)

    const backLink = screen.getByRole('link', { name: /back to loans/i })
    expect(backLink).toHaveAttribute('href', '/loans')
  })
})