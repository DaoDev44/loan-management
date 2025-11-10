import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { type SerializedLoan } from '@/lib/utils/serialize'

interface LoanOverviewCardProps {
  loan: SerializedLoan
}

export function LoanOverviewCard({ loan }: LoanOverviewCardProps) {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    }).format(new Date(date))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Borrower Information */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-semibold mb-3">Borrower Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{loan.borrowerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{loan.borrowerEmail}</span>
              </div>
              {loan.borrowerPhone && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">{loan.borrowerPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Loan Terms */}
          <div>
            <h3 className="font-semibold mb-3">Loan Terms</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Principal:</span>
                <span className="font-medium">{formatCurrency(loan.principal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Interest Rate:</span>
                <span className="font-medium">{loan.interestRate.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Term:</span>
                <span className="font-medium">{loan.termMonths} months</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Frequency:</span>
                <span className="font-medium">{loan.paymentFrequency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Interest Type:</span>
                <span className="font-medium">{loan.interestCalculationType}</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Current Status */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="text-center">
            <div className="text-2xl font-bold">{formatCurrency(loan.balance)}</div>
            <div className="text-sm text-muted-foreground">Current Balance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {formatCurrency(loan.principal - loan.balance)}
            </div>
            <div className="text-sm text-muted-foreground">Amount Paid</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {Math.round(((loan.principal - loan.balance) / loan.principal) * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Paid Off</div>
          </div>
        </div>

        <Separator />

        {/* Dates */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Start Date:</span>
            <span className="font-medium">{formatDate(loan.startDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">End Date:</span>
            <span className="font-medium">{formatDate(loan.endDate)}</span>
          </div>
        </div>

        {/* Notes and Collateral */}
        {(loan.notes || loan.collateral) && (
          <>
            <Separator />
            {loan.notes && (
              <div>
                <h3 className="font-semibold mb-2">Notes</h3>
                <p className="text-sm text-muted-foreground">{loan.notes}</p>
              </div>
            )}
            {loan.collateral && (
              <div>
                <h3 className="font-semibold mb-2">Collateral</h3>
                <p className="text-sm text-muted-foreground">{loan.collateral}</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}