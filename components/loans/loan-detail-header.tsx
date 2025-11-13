'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/status-badge'
import { useToast } from '@/hooks/use-toast'
import { deleteLoan } from '@/app/actions/loan.actions'
import { AddPaymentDialog } from '@/components/loans/add-payment-dialog'
import { EditLoanDialog } from '@/components/loans/edit-loan-dialog'
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog'
import { type SerializedLoan } from '@/lib/utils/serialize'

interface LoanDetailHeaderProps {
  loan: SerializedLoan
}

export function LoanDetailHeader({ loan }: LoanDetailHeaderProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [addPaymentOpen, setAddPaymentOpen] = useState(false)
  const [editLoanOpen, setEditLoanOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleEdit = () => {
    setEditLoanOpen(true)
  }

  const handleAddPayment = () => {
    setAddPaymentOpen(true)
  }

  const handleDelete = () => {
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteLoan(loan.id)
      if (result.success) {
        toast({
          title: 'Loan deleted',
          description: 'The loan has been successfully deleted.',
        })
        setDeleteConfirmOpen(false)
        router.push('/loans')
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete the loan. Please try again.',
          variant: 'destructive',
        })
        setIsDeleting(false)
      }
    } catch {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while deleting the loan.',
        variant: 'destructive',
      })
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="space-y-4">
        <Button variant="ghost" asChild className="-ml-4">
          <Link href="/loans">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Loans
          </Link>
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Loan Details</h1>
            <p className="text-muted-foreground">Loan for {loan.borrowerName}</p>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={loan.status} size="lg" />

            <div className="flex gap-2">
              <Button onClick={handleEdit} size="sm" className="gap-1">
                <Edit className="h-3 w-3" />
                Edit
              </Button>

              <Button
                onClick={handleAddPayment}
                variant="outline"
                size="sm"
                className="gap-1"
                disabled={loan.status !== 'ACTIVE'}
              >
                <Plus className="h-3 w-3" />
                Add Payment
              </Button>

              <Button onClick={handleDelete} variant="destructive" size="sm" className="gap-1">
                <Trash2 className="h-3 w-3" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Payment Dialog */}
      <AddPaymentDialog
        loanId={loan.id}
        borrowerName={loan.borrowerName}
        currentBalance={loan.balance}
        loanData={{
          principal: loan.principal,
          interestRate: loan.interestRate,
          termMonths: loan.termMonths,
          interestCalculationType: loan.interestCalculationType,
          paymentFrequency: loan.paymentFrequency,
        }}
        open={addPaymentOpen}
        onOpenChange={setAddPaymentOpen}
        onSuccess={() => {
          // Refresh the page to show updated data
          // In a real app, you might want to use more sophisticated state management
          window.location.reload()
        }}
      />

      {/* Edit Loan Dialog */}
      <EditLoanDialog
        loan={loan}
        open={editLoanOpen}
        onOpenChange={setEditLoanOpen}
        onSuccess={() => {
          // Refresh the page to show updated data
          window.location.reload()
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Loan"
        description={`Are you sure you want to delete the loan for ${loan.borrowerName}? This action cannot be undone and will permanently remove all loan data and payment history.`}
        confirmText="Delete Loan"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}
