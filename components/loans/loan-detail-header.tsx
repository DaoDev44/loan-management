'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/status-badge'
import { useToast } from '@/hooks/use-toast'
import { deleteLoan } from '@/app/actions/loan.actions'
import { type SerializedLoan } from '@/lib/utils/serialize'

interface LoanDetailHeaderProps {
  loan: SerializedLoan
}

export function LoanDetailHeader({ loan }: LoanDetailHeaderProps) {
  const router = useRouter()
  const { toast } = useToast()

  const handleEdit = () => {
    // For now, just show a toast since we haven't built the edit form yet
    toast({
      title: 'Edit Loan',
      description: 'Edit loan feature coming soon!',
    })
  }

  const handleAddPayment = () => {
    // For now, just show a toast since we haven't built the add payment dialog yet
    toast({
      title: 'Add Payment',
      description: 'Add payment feature coming soon!',
    })
  }

  const handleDelete = async () => {
    if (
      confirm(
        `Are you sure you want to delete the loan for ${loan.borrowerName}? This action cannot be undone.`
      )
    ) {
      try {
        const result = await deleteLoan(loan.id)
        if (result.success) {
          toast({
            title: 'Loan deleted',
            description: 'The loan has been successfully deleted.',
          })
          router.push('/loans')
        } else {
          toast({
            title: 'Error',
            description: 'Failed to delete the loan. Please try again.',
            variant: 'destructive',
          })
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'An unexpected error occurred while deleting the loan.',
          variant: 'destructive',
        })
      }
    }
  }

  return (
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
  )
}
