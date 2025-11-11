/**
 * Dashboard calculation utilities
 *
 * This module contains all the calculation logic used by the dashboard
 * to compute loan portfolio metrics, payment trends, and other analytics.
 */

import { type SerializedLoan } from '@/lib/utils/serialize'

export interface DashboardMetrics {
  // Basic loan counts
  totalLoans: number
  activeLoans: SerializedLoan[]
  completedLoans: SerializedLoan[]
  overdueLoans: SerializedLoan[]
  defaultedLoans: SerializedLoan[]

  // Financial metrics
  totalPrincipal: number
  totalBalance: number
  totalPaid: number

  // Calculated percentages
  portfolioHealth: number
  averageLoanAmount: number
  collectionRate: number

  // Monthly data
  monthlyPayments: number

  // Upcoming due dates
  upcomingLoans: SerializedLoan[]
}

/**
 * Calculate comprehensive dashboard metrics from loan data
 */
export function calculateDashboardMetrics(loans: SerializedLoan[]): DashboardMetrics {
  // Basic loan categorization
  const activeLoans = loans.filter(l => l.status === 'ACTIVE')
  const completedLoans = loans.filter(l => l.status === 'COMPLETED')
  const overdueLoans = loans.filter(l => l.status === 'OVERDUE')
  const defaultedLoans = loans.filter(l => l.status === 'DEFAULTED')

  // Financial calculations
  const totalPrincipal = loans.reduce((sum, l) => sum + l.principal, 0)
  const totalBalance = activeLoans.reduce((sum, l) => sum + l.balance, 0)
  const totalPaid = loans.reduce((sum, l) => sum + (l.principal - l.balance), 0)

  // Percentage calculations
  const portfolioHealth = totalPrincipal > 0 ? (totalPaid / totalPrincipal) * 100 : 0
  const averageLoanAmount = loans.length > 0 ? totalPrincipal / loans.length : 0
  const collectionRate = totalPrincipal > 0 ? (totalPaid / totalPrincipal) * 100 : 0

  // Monthly payment calculation (current month)
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthlyPayments = loans.reduce((sum, loan) => {
    if (loan.payments) {
      return sum + loan.payments
        .filter(payment => {
          const paymentDate = new Date(payment.date)
          return paymentDate.getMonth() === currentMonth &&
                 paymentDate.getFullYear() === currentYear
        })
        .reduce((paymentSum, payment) => paymentSum + payment.amount, 0)
    }
    return sum
  }, 0)

  // Find upcoming loans (due in next 30 days)
  const today = new Date()
  const thirtyDaysFromNow = new Date(today)
  thirtyDaysFromNow.setDate(today.getDate() + 30)

  const upcomingLoans = activeLoans.filter(l => {
    const endDate = new Date(l.endDate)
    return endDate > today && endDate <= thirtyDaysFromNow
  })

  return {
    totalLoans: loans.length,
    activeLoans,
    completedLoans,
    overdueLoans,
    defaultedLoans,
    totalPrincipal,
    totalBalance,
    totalPaid,
    portfolioHealth,
    averageLoanAmount,
    collectionRate,
    monthlyPayments,
    upcomingLoans,
  }
}

/**
 * Calculate payment data for performance charts (last 6 months)
 */
export interface PaymentData {
  month: string
  amount: number
  count: number
}

export function calculatePaymentTrends(loans: SerializedLoan[]): PaymentData[] {
  const monthsData: PaymentData[] = []
  const now = new Date()

  // Generate last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' })

    monthsData.push({
      month: monthKey,
      amount: 0,
      count: 0,
    })
  }

  // Aggregate payments by month
  loans.forEach(loan => {
    if (loan.payments && loan.payments.length > 0) {
      loan.payments.forEach(payment => {
        const paymentDate = new Date(payment.date)
        const monthKey = paymentDate.toLocaleString('default', { month: 'short', year: 'numeric' })

        const monthData = monthsData.find(m => m.month === monthKey)
        if (monthData) {
          monthData.amount += payment.amount
          monthData.count += 1
        }
      })
    }
  })

  return monthsData
}

/**
 * Calculate loan status breakdown data
 */
export interface StatusData {
  name: string
  value: number
  count: number
  percentage: number
}

export function calculateStatusBreakdown(loans: SerializedLoan[]): StatusData[] {
  const statusCounts = loans.reduce((acc, loan) => {
    acc[loan.status] = (acc[loan.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const totalLoans = loans.length

  return [
    {
      name: 'Active',
      value: statusCounts.ACTIVE || 0,
      count: statusCounts.ACTIVE || 0,
      percentage: totalLoans > 0 ? Math.round(((statusCounts.ACTIVE || 0) / totalLoans) * 100) : 0,
    },
    {
      name: 'Completed',
      value: statusCounts.COMPLETED || 0,
      count: statusCounts.COMPLETED || 0,
      percentage: totalLoans > 0 ? Math.round(((statusCounts.COMPLETED || 0) / totalLoans) * 100) : 0,
    },
    {
      name: 'Overdue',
      value: statusCounts.OVERDUE || 0,
      count: statusCounts.OVERDUE || 0,
      percentage: totalLoans > 0 ? Math.round(((statusCounts.OVERDUE || 0) / totalLoans) * 100) : 0,
    },
    {
      name: 'Defaulted',
      value: statusCounts.DEFAULTED || 0,
      count: statusCounts.DEFAULTED || 0,
      percentage: totalLoans > 0 ? Math.round(((statusCounts.DEFAULTED || 0) / totalLoans) * 100) : 0,
    },
  ].filter(item => item.value > 0)
}

/**
 * Generate activity items from loan data (last 7 days)
 */
export interface ActivityItem {
  id: string
  type: 'payment' | 'loan_created' | 'loan_completed'
  title: string
  subtitle?: string
  amount?: number
  date: Date
  loanId: string
}

export function generateRecentActivity(loans: SerializedLoan[]): ActivityItem[] {
  const activities: ActivityItem[] = []
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  loans.forEach(loan => {
    // Check for recent payments
    if (loan.payments) {
      loan.payments
        .filter(payment => new Date(payment.date) >= oneWeekAgo)
        .forEach(payment => {
          activities.push({
            id: payment.id,
            type: 'payment',
            title: `Payment received from ${loan.borrowerName}`,
            subtitle: payment.notes || undefined,
            amount: payment.amount,
            date: new Date(payment.date),
            loanId: loan.id,
          })
        })
    }

    // Check for recently completed loans
    if (loan.status === 'COMPLETED' && new Date(loan.updatedAt) >= oneWeekAgo) {
      activities.push({
        id: `loan-completed-${loan.id}`,
        type: 'loan_completed',
        title: `Loan completed by ${loan.borrowerName}`,
        amount: loan.principal,
        date: new Date(loan.updatedAt),
        loanId: loan.id,
      })
    }

    // Check for recently created loans
    if (new Date(loan.createdAt) >= oneWeekAgo) {
      activities.push({
        id: `loan-created-${loan.id}`,
        type: 'loan_created',
        title: `New loan created for ${loan.borrowerName}`,
        amount: loan.principal,
        date: new Date(loan.createdAt),
        loanId: loan.id,
      })
    }
  })

  // Sort by date (most recent first) and limit to 10
  return activities
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10)
}