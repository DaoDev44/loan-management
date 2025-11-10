'use client'

import { useRouter } from 'next/navigation'
import { Edit, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { deleteLoan } from '@/app/actions/loan.actions'
import { type SerializedLoan } from '@/lib/utils/serialize'

interface LoanActionsProps {
  loan: SerializedLoan
}

export function LoanActions({ loan }: LoanActionsProps) {
  const router = useRouter()
  const { toast } = useToast()

  const handleEdit = () => {
    // For now, just show a toast since we haven't built the edit form yet
    toast({
      title: "Edit Loan",
      description: "Edit loan feature coming soon!",
    })
  }

  const handleAddPayment = () => {
    // For now, just show a toast since we haven't built the add payment dialog yet
    toast({
      title: "Add Payment",
      description: "Add payment feature coming soon!",
    })
  }

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete the loan for ${loan.borrowerName}? This action cannot be undone.`)) {
      try {
        const result = await deleteLoan(loan.id)
        if (result.success) {
          toast({
            title: "Loan deleted",
            description: "The loan has been successfully deleted.",
          })
          router.push('/loans')
        } else {
          toast({
            title: "Error",
            description: "Failed to delete the loan. Please try again.",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "An unexpected error occurred while deleting the loan.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleEdit} className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Loan
          </Button>

          <Button
            onClick={handleAddPayment}
            variant="outline"
            className="gap-2"
            disabled={loan.status !== 'ACTIVE'}
          >
            <Plus className="h-4 w-4" />
            Add Payment
          </Button>

          <Button
            onClick={handleDelete}
            variant="destructive"
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Loan
          </Button>
        </div>
        {loan.status !== 'ACTIVE' && (
          <p className="text-xs text-muted-foreground mt-2">
            Payments can only be added to active loans.
          </p>
        )}
      </CardContent>
    </Card>
  )
}