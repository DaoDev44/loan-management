import { useMemo } from 'react'
import {
  calculateDashboardMetrics,
  calculatePaymentTrends,
  calculateStatusBreakdown,
  generateRecentActivity,
  type DashboardMetrics,
  type PaymentData,
  type StatusData,
  type ActivityItem,
} from '@/lib/dashboard-calculations'
import { type SerializedLoan } from '@/lib/utils/serialize'

/**
 * Custom hook that provides all dashboard calculations with memoization
 *
 * This hook consolidates all dashboard calculation logic to:
 * - Avoid repeated calculations across components
 * - Provide better performance through memoization
 * - Make components cleaner and easier to test
 * - Centralize calculation logic
 */
export function useDashboardData(loans: SerializedLoan[]) {
  // Memoize basic dashboard metrics
  const metrics = useMemo<DashboardMetrics>(() => {
    return calculateDashboardMetrics(loans)
  }, [loans])

  // Memoize payment trend data for charts
  const paymentTrends = useMemo<PaymentData[]>(() => {
    return calculatePaymentTrends(loans)
  }, [loans])

  // Memoize loan status breakdown for pie chart
  const statusBreakdown = useMemo<StatusData[]>(() => {
    return calculateStatusBreakdown(loans)
  }, [loans])

  // Memoize recent activity feed
  const recentActivity = useMemo<ActivityItem[]>(() => {
    return generateRecentActivity(loans)
  }, [loans])

  // Additional computed values for convenience
  const hasPaymentData = useMemo(() => {
    return paymentTrends.some((data) => data.amount > 0)
  }, [paymentTrends])

  const hasLoans = useMemo(() => {
    return loans.length > 0
  }, [loans.length])

  const monthlyTrend = useMemo(() => {
    if (paymentTrends.length < 2) return null

    const currentMonth = paymentTrends[paymentTrends.length - 1]?.amount || 0
    const previousMonth = paymentTrends[paymentTrends.length - 2]?.amount || 0

    if (previousMonth === 0) return null

    const change = Math.round(((currentMonth - previousMonth) / previousMonth) * 100)
    return {
      value: change,
      isPositive: change >= 0,
      currentMonth,
      previousMonth,
    }
  }, [paymentTrends])

  const portfolioSummary = useMemo(() => {
    return {
      totalValue: metrics.totalPrincipal,
      totalCollected: metrics.totalPaid,
      outstandingBalance: metrics.totalBalance,
      healthScore: metrics.portfolioHealth,
    }
  }, [metrics])

  const alertCounts = useMemo(() => {
    return {
      overdue: metrics.overdueLoans.length,
      upcoming: metrics.upcomingLoans.length,
      defaulted: metrics.defaultedLoans.length,
    }
  }, [metrics])

  return {
    // Core metrics
    metrics,
    paymentTrends,
    statusBreakdown,
    recentActivity,

    // Convenience flags
    hasPaymentData,
    hasLoans,

    // Computed trends
    monthlyTrend,

    // Summary data
    portfolioSummary,
    alertCounts,

    // Direct access to specific data for components
    loans: {
      active: metrics.activeLoans,
      completed: metrics.completedLoans,
      overdue: metrics.overdueLoans,
      defaulted: metrics.defaultedLoans,
      upcoming: metrics.upcomingLoans,
    },
  }
}

/**
 * Hook for testing individual calculation functions
 * Useful for isolating specific calculations in tests
 */
export function useDashboardCalculations() {
  return {
    calculateDashboardMetrics,
    calculatePaymentTrends,
    calculateStatusBreakdown,
    generateRecentActivity,
  }
}
