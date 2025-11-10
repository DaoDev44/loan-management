import Link from 'next/link'
import { Suspense } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getLoans } from '@/app/actions/loan.actions'
import { LoanTable } from '@/components/loans/loan-table'
import { LoadingState } from '@/components/shared/loading-state'

async function LoanTableWrapper() {
  const result = await getLoans()
  const loans = result.success ? result.data : []
  return <LoanTable loans={loans} />
}

export default function LoansPage() {
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

      <Suspense
        fallback={
          <div className="flex min-h-[400px] items-center justify-center">
            <LoadingState text="Loading loans..." size="lg" />
          </div>
        }
      >
        <LoanTableWrapper />
      </Suspense>
    </div>
  )
}
