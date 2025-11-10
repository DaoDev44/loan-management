import Link from 'next/link'
import { Plus, DollarSign, TrendingUp, AlertCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { MetricCard } from '@/components/dashboard/metric-card'
import { getLoans } from '@/app/actions/loan.actions'

export default async function Home() {
  // Fetch real loan data
  const loansResult = await getLoans()
  const loans = loansResult.success ? loansResult.data : []

  // Calculate metrics
  const totalLoans = loans.length
  const activeLoans = loans.filter(l => l.status === 'ACTIVE')
  const completedLoans = loans.filter(l => l.status === 'COMPLETED')
  const overdueLoans = loans.filter(l => l.status === 'OVERDUE')

  const totalPrincipal = loans.reduce((sum, l) => sum + l.principal, 0)
  const totalBalance = activeLoans.reduce((sum, l) => sum + l.balance, 0)
  const totalPaid = loans.reduce((sum, l) => sum + (l.principal - l.balance), 0)

  // Find upcoming loans (due in next 30 days)
  const today = new Date()
  const thirtyDaysFromNow = new Date(today)
  thirtyDaysFromNow.setDate(today.getDate() + 30)

  const upcomingLoans = activeLoans.filter(l => {
    const endDate = new Date(l.endDate)
    return endDate > today && endDate <= thirtyDaysFromNow
  })

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your loan management platform
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Loans"
          value={totalLoans}
          description={`${activeLoans.length} active`}
          icon={DollarSign}
        />
        <MetricCard
          title="Total Principal"
          value={formatCurrency(totalPrincipal)}
          description="Loan portfolio value"
          icon={TrendingUp}
        />
        <MetricCard
          title="Outstanding Balance"
          value={formatCurrency(totalBalance)}
          description={`${activeLoans.length} active loans`}
          icon={AlertCircle}
        />
        <MetricCard
          title="Total Paid"
          value={formatCurrency(totalPaid)}
          description={`${completedLoans.length} completed`}
          icon={TrendingUp}
        />
      </div>

      {/* Alerts */}
      {(overdueLoans.length > 0 || upcomingLoans.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
            <CardDescription>Important notifications and reminders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {overdueLoans.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Overdue Loans</AlertTitle>
                <AlertDescription>
                  {overdueLoans.length} loan{overdueLoans.length > 1 ? 's are' : ' is'} overdue.
                  <Link href="/loans" className="ml-1 underline font-medium">
                    View details
                  </Link>
                </AlertDescription>
              </Alert>
            )}
            {upcomingLoans.length > 0 && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertTitle>Upcoming Due Dates</AlertTitle>
                <AlertDescription>
                  {upcomingLoans.length} loan{upcomingLoans.length > 1 ? 's are' : ' is'} due in the next 30 days.
                  <Link href="/loans" className="ml-1 underline font-medium">
                    View details
                  </Link>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and operations</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/loans/new" className="gap-2">
              <Plus className="h-4 w-4" />
              Create New Loan
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/loans">View All Loans</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/loans?status=ACTIVE">Active Loans</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
