import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/status-badge'
import { type SerializedLoan } from '@/lib/utils/serialize'

interface LoanDetailHeaderProps {
  loan: SerializedLoan
}

export function LoanDetailHeader({ loan }: LoanDetailHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Button variant="ghost" asChild className="mb-4 -ml-4">
          <Link href="/loans">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Loans
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          Loan Details
        </h1>
        <p className="text-muted-foreground">
          Loan for {loan.borrowerName}
        </p>
      </div>
      <StatusBadge status={loan.status} size="lg" />
    </div>
  )
}