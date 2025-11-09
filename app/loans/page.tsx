import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getLoans } from '@/app/actions/loan.actions'
import { LoanTable, type SerializedLoan } from '@/components/loans/loan-table'

export default async function LoansPage() {
  const result = await getLoans()
  const rawLoans = result.success ? result.data : []

  // Serialize Prisma Decimal types to numbers for client component
  const loans: SerializedLoan[] = rawLoans.map((loan) => ({
    ...loan,
    principal: loan.principal.toNumber(),
    balance: loan.balance.toNumber(),
  }))

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
