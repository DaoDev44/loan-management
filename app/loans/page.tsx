import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getLoans } from '@/app/actions/loan.actions'
import { LoanTable } from '@/components/loans/loan-table'

export default async function LoansPage() {
  const result = await getLoans()
  const loans = result.success ? result.data : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loans</h1>
          <p className="text-muted-foreground">
            Manage your loan portfolio
          </p>
        </div>
        <Button asChild>
          <Link href="/loans/new" className="gap-2">
            <Plus className="h-4 w-4" />
            Create Loan
          </Link>
        </Button>
      </div>

      <LoanTable loans={loans} />
    </div>
  )
}
