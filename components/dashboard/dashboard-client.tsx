'use client'

import Link from 'next/link'
import { Plus, DollarSign, TrendingUp, AlertCircle, Clock, PieChart } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { MetricCard } from '@/components/dashboard/metric-card'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { LoanStatusBreakdown } from '@/components/dashboard/loan-status-breakdown'
import { PerformanceChart } from '@/components/dashboard/performance-chart'
import { useDashboardData } from '@/hooks/use-dashboard-data'
import { formatCurrency } from '@/lib/utils'
import { type SerializedLoan } from '@/lib/utils/serialize'

interface DashboardClientProps {
  loans: SerializedLoan[]
}

export function DashboardClient({ loans }: DashboardClientProps) {
  // Use consolidated hook for all calculations
  const {
    metrics,
    paymentTrends,
    statusBreakdown,
    recentActivity,
    hasPaymentData,
    hasLoans,
    monthlyTrend,
    portfolioSummary,
    alertCounts,
    loans: loansByStatus,
  } = useDashboardData(loans)

  // Simulate trend for demo purposes (in real app, use actual historical data)
  const simulateTrend = (base: number) => Math.floor(Math.random() * 21) - 10 // -10% to +10%

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your loan management platform
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/loans">View All Loans</Link>
          </Button>
          <Button asChild>
            <Link href="/loans/new" className="gap-2">
              <Plus className="h-4 w-4" />
              Create Loan
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Loans"
          value={metrics.totalLoans}
          description={`${loansByStatus.active.length} active, ${loansByStatus.completed.length} completed`}
          icon={DollarSign}
          trend={{
            value: simulateTrend(metrics.totalLoans),
            isPositive: true,
            label: 'vs last month'
          }}
        />
        <MetricCard
          title="Total Principal"
          value={formatCurrency(portfolioSummary.totalValue)}
          description="Total loan portfolio value"
          icon={TrendingUp}
          variant={portfolioSummary.totalValue > 50000 ? 'success' : 'default'}
          trend={{
            value: simulateTrend(portfolioSummary.totalValue),
            isPositive: true,
            label: 'vs last month'
          }}
        />
        <MetricCard
          title="Outstanding Balance"
          value={formatCurrency(portfolioSummary.outstandingBalance)}
          description={`${loansByStatus.active.length} active loans`}
          icon={AlertCircle}
          variant={alertCounts.overdue > 0 ? 'warning' : 'default'}
        />
        <MetricCard
          title="Monthly Collections"
          value={formatCurrency(metrics.monthlyPayments)}
          description="This month's payments"
          icon={TrendingUp}
          variant={metrics.monthlyPayments > 10000 ? 'success' : 'default'}
          trend={monthlyTrend ? {
            value: monthlyTrend.value,
            isPositive: monthlyTrend.isPositive,
            label: 'vs last month'
          } : undefined}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Portfolio Health"
          value={`${portfolioSummary.healthScore.toFixed(1)}%`}
          description="Total amount collected vs. principal"
          icon={PieChart}
          variant={
            portfolioSummary.healthScore > 50
              ? 'success'
              : portfolioSummary.healthScore > 25
                ? 'warning'
                : 'destructive'
          }
        />
        <MetricCard
          title="Average Loan Size"
          value={formatCurrency(metrics.averageLoanAmount)}
          description="Average principal amount"
          icon={DollarSign}
        />
        <MetricCard
          title="Collection Rate"
          value={`${metrics.collectionRate.toFixed(1)}%`}
          description="Total collected vs. total disbursed"
          icon={TrendingUp}
          variant={metrics.collectionRate > 80 ? 'success' : 'default'}
        />
      </div>

      {/* Charts and Analytics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PerformanceChart
          loans={loans}
          paymentTrends={paymentTrends}
          hasPaymentData={hasPaymentData}
        />
        <LoanStatusBreakdown
          loans={loans}
          statusBreakdown={statusBreakdown}
          totalLoans={metrics.totalLoans}
        />
      </div>

      {/* Alerts */}
      {(alertCounts.overdue > 0 || alertCounts.upcoming > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Alerts & Notifications</CardTitle>
            <CardDescription>Important items requiring attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {alertCounts.overdue > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Overdue Loans Alert</AlertTitle>
                <AlertDescription>
                  {alertCounts.overdue} loan{alertCounts.overdue > 1 ? 's are' : ' is'} currently overdue.
                  <Link href="/loans?status=OVERDUE" className="ml-1 underline font-medium">
                    Review overdue loans
                  </Link>
                </AlertDescription>
              </Alert>
            )}
            {alertCounts.upcoming > 0 && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertTitle>Upcoming Due Dates</AlertTitle>
                <AlertDescription>
                  {alertCounts.upcoming} loan{alertCounts.upcoming > 1 ? 's are' : ' is'} due in the next 30 days.
                  <Link href="/loans?status=ACTIVE" className="ml-1 underline font-medium">
                    View upcoming loans
                  </Link>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <RecentActivity
        loans={loans}
        recentActivity={recentActivity}
      />
    </div>
  )
}