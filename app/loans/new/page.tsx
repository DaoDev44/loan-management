import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CreateLoanForm } from '@/components/loans/create-loan-form'

export default function NewLoanPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/loans" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Loans
          </Link>
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Create New Loan</h1>
        <p className="text-muted-foreground">
          Add a new loan to your portfolio. Fill in the borrower details, loan terms, and
          configuration.
        </p>
      </div>

      <CreateLoanForm />
    </div>
  )
}
