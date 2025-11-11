import { describe, it, expect, beforeEach } from 'vitest'
import {
  calculateDashboardMetrics,
  calculatePaymentTrends,
  calculateStatusBreakdown,
  generateRecentActivity,
  type DashboardMetrics,
} from '@/lib/dashboard-calculations'
import { type SerializedLoan } from '@/lib/utils/serialize'

describe('Dashboard Calculations', () => {
  // Helper function to create mock loan data
  const createMockLoan = (overrides: Partial<SerializedLoan> = {}): SerializedLoan => {
    const now = new Date()
    const oneYearFromNow = new Date()
    oneYearFromNow.setFullYear(now.getFullYear() + 1)

    // Default to old creation date to avoid interference with recent activity tests
    const oldDate = new Date()
    oldDate.setMonth(oldDate.getMonth() - 2)

    return {
      id: `loan-${Math.random()}`,
      borrowerName: 'John Doe',
      borrowerEmail: 'john@example.com',
      borrowerPhone: '+1234567890',
      principal: 10000,
      interestRate: 5.0,
      startDate: now,
      endDate: oneYearFromNow,
      termMonths: 12,
      balance: 8000,
      interestCalculationType: 'SIMPLE',
      paymentFrequency: 'MONTHLY',
      status: 'ACTIVE',
      notes: '',
      collateral: '',
      createdAt: oldDate,
      updatedAt: oldDate,
      deletedAt: null,
      payments: [],
      ...overrides,
    }
  }

  describe('calculateDashboardMetrics', () => {
    it('should handle empty loan array', () => {
      const metrics = calculateDashboardMetrics([])

      expect(metrics.totalLoans).toBe(0)
      expect(metrics.activeLoans).toHaveLength(0)
      expect(metrics.completedLoans).toHaveLength(0)
      expect(metrics.overdueLoans).toHaveLength(0)
      expect(metrics.defaultedLoans).toHaveLength(0)
      expect(metrics.totalPrincipal).toBe(0)
      expect(metrics.totalBalance).toBe(0)
      expect(metrics.totalPaid).toBe(0)
      expect(metrics.portfolioHealth).toBe(0)
      expect(metrics.averageLoanAmount).toBe(0)
      expect(metrics.collectionRate).toBe(0)
      expect(metrics.monthlyPayments).toBe(0)
      expect(metrics.upcomingLoans).toHaveLength(0)
    })

    it('should calculate basic metrics correctly for single loan', () => {
      const loan = createMockLoan({
        principal: 10000,
        balance: 6000,
        status: 'ACTIVE',
      })

      const metrics = calculateDashboardMetrics([loan])

      expect(metrics.totalLoans).toBe(1)
      expect(metrics.activeLoans).toHaveLength(1)
      expect(metrics.completedLoans).toHaveLength(0)
      expect(metrics.overdueLoans).toHaveLength(0)
      expect(metrics.totalPrincipal).toBe(10000)
      expect(metrics.totalBalance).toBe(6000)
      expect(metrics.totalPaid).toBe(4000) // principal - balance
      expect(metrics.portfolioHealth).toBe(40) // 4000 / 10000 * 100
      expect(metrics.averageLoanAmount).toBe(10000)
      expect(metrics.collectionRate).toBe(40)
    })

    it('should categorize loans by status correctly', () => {
      const loans = [
        createMockLoan({ status: 'ACTIVE', principal: 10000, balance: 8000 }),
        createMockLoan({ status: 'ACTIVE', principal: 15000, balance: 12000 }),
        createMockLoan({ status: 'COMPLETED', principal: 5000, balance: 0 }),
        createMockLoan({ status: 'OVERDUE', principal: 8000, balance: 7500 }),
        createMockLoan({ status: 'DEFAULTED', principal: 12000, balance: 12000 }),
      ]

      const metrics = calculateDashboardMetrics(loans)

      expect(metrics.totalLoans).toBe(5)
      expect(metrics.activeLoans).toHaveLength(2)
      expect(metrics.completedLoans).toHaveLength(1)
      expect(metrics.overdueLoans).toHaveLength(1)
      expect(metrics.defaultedLoans).toHaveLength(1)
      expect(metrics.totalPrincipal).toBe(50000)
      expect(metrics.totalBalance).toBe(20000) // Only active loans: 8000 + 12000
      expect(metrics.totalPaid).toBe(10500) // (10000-8000) + (15000-12000) + (5000-0) + (8000-7500) + (12000-12000) = 2000+3000+5000+500+0
    })

    it('should calculate portfolio health correctly', () => {
      const loans = [
        createMockLoan({ principal: 10000, balance: 5000 }), // 50% paid
        createMockLoan({ principal: 20000, balance: 0 }), // 100% paid
      ]

      const metrics = calculateDashboardMetrics(loans)

      expect(metrics.portfolioHealth).toBeCloseTo(83.33, 2) // 25000 paid / 30000 principal * 100 = 83.33%
      expect(metrics.collectionRate).toBeCloseTo(83.33, 2)
    })

    it('should handle completed loans correctly', () => {
      const completedLoan = createMockLoan({
        status: 'COMPLETED',
        principal: 10000,
        balance: 0,
      })

      const metrics = calculateDashboardMetrics([completedLoan])

      expect(metrics.totalBalance).toBe(0) // Completed loans don't contribute to active balance
      expect(metrics.totalPaid).toBe(10000) // But they do contribute to total paid
      expect(metrics.portfolioHealth).toBe(100)
    })

    it('should calculate monthly payments correctly', () => {
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const thisMonth = new Date(currentYear, currentMonth, 15)
      const lastMonth = new Date(currentYear, currentMonth - 1, 15)

      const loan = createMockLoan({
        payments: [
          {
            id: 'payment-1',
            loanId: 'loan-1',
            amount: 1000,
            date: thisMonth,
            notes: 'Current month payment',
            createdAt: new Date(),
            deletedAt: null,
          },
          {
            id: 'payment-2',
            loanId: 'loan-1',
            amount: 900,
            date: thisMonth,
            notes: 'Another current month payment',
            createdAt: new Date(),
            deletedAt: null,
          },
          {
            id: 'payment-3',
            loanId: 'loan-1',
            amount: 800,
            date: lastMonth,
            notes: 'Last month payment',
            createdAt: new Date(),
            deletedAt: null,
          },
        ],
      })

      const metrics = calculateDashboardMetrics([loan])

      expect(metrics.monthlyPayments).toBe(1900) // Only current month payments
    })

    it('should identify upcoming loans correctly', () => {
      const today = new Date()
      const in15Days = new Date(today)
      in15Days.setDate(today.getDate() + 15)
      const in45Days = new Date(today)
      in45Days.setDate(today.getDate() + 45)

      const loans = [
        createMockLoan({
          status: 'ACTIVE',
          endDate: in15Days,
          borrowerName: 'John Upcoming',
        }),
        createMockLoan({
          status: 'ACTIVE',
          endDate: in45Days,
          borrowerName: 'Jane Later',
        }),
        createMockLoan({
          status: 'COMPLETED',
          endDate: in15Days,
          borrowerName: 'Bob Completed',
        }),
      ]

      const metrics = calculateDashboardMetrics(loans)

      expect(metrics.upcomingLoans).toHaveLength(1)
      expect(metrics.upcomingLoans[0].borrowerName).toBe('John Upcoming')
    })
  })

  describe('calculatePaymentTrends', () => {
    it('should generate 6 months of data', () => {
      const trends = calculatePaymentTrends([])
      expect(trends).toHaveLength(6)

      // Verify months are in chronological order (oldest to newest)
      for (let i = 1; i < trends.length; i++) {
        const current = new Date(trends[i].month + ' 1')
        const previous = new Date(trends[i - 1].month + ' 1')
        expect(current.getTime()).toBeGreaterThan(previous.getTime())
      }
    })

    it('should aggregate payments by month correctly', () => {
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const currentMonthDate = new Date(currentYear, currentMonth, 15)
      const lastMonthDate = new Date(currentYear, currentMonth - 1, 15)

      const loan = createMockLoan({
        payments: [
          {
            id: 'payment-1',
            loanId: 'loan-1',
            amount: 1000,
            date: currentMonthDate,
            notes: '',
            createdAt: new Date(),
            deletedAt: null,
          },
          {
            id: 'payment-2',
            loanId: 'loan-1',
            amount: 1500,
            date: currentMonthDate,
            notes: '',
            createdAt: new Date(),
            deletedAt: null,
          },
          {
            id: 'payment-3',
            loanId: 'loan-1',
            amount: 800,
            date: lastMonthDate,
            notes: '',
            createdAt: new Date(),
            deletedAt: null,
          },
        ],
      })

      const trends = calculatePaymentTrends([loan])

      // Find current month data
      const currentMonthKey = currentMonthDate.toLocaleString('default', {
        month: 'short',
        year: 'numeric',
      })
      const currentMonthData = trends.find((t) => t.month === currentMonthKey)

      expect(currentMonthData).toBeDefined()
      expect(currentMonthData!.amount).toBe(2500)
      expect(currentMonthData!.count).toBe(2)
    })

    it('should handle loans without payments', () => {
      const loan = createMockLoan({ payments: undefined })
      const trends = calculatePaymentTrends([loan])

      expect(trends).toHaveLength(6)
      trends.forEach((trend) => {
        expect(trend.amount).toBe(0)
        expect(trend.count).toBe(0)
      })
    })
  })

  describe('calculateStatusBreakdown', () => {
    it('should handle empty array', () => {
      const breakdown = calculateStatusBreakdown([])
      expect(breakdown).toEqual([])
    })

    it('should calculate percentages correctly', () => {
      const loans = [
        createMockLoan({ status: 'ACTIVE' }),
        createMockLoan({ status: 'ACTIVE' }),
        createMockLoan({ status: 'COMPLETED' }),
        createMockLoan({ status: 'OVERDUE' }),
      ]

      const breakdown = calculateStatusBreakdown(loans)

      expect(breakdown).toHaveLength(3) // Only statuses that exist

      const activeStatus = breakdown.find((s) => s.name === 'Active')
      expect(activeStatus).toEqual({
        name: 'Active',
        value: 2,
        count: 2,
        percentage: 50, // 2 out of 4
      })

      const completedStatus = breakdown.find((s) => s.name === 'Completed')
      expect(completedStatus).toEqual({
        name: 'Completed',
        value: 1,
        count: 1,
        percentage: 25, // 1 out of 4
      })

      const overdueStatus = breakdown.find((s) => s.name === 'Overdue')
      expect(overdueStatus).toEqual({
        name: 'Overdue',
        value: 1,
        count: 1,
        percentage: 25, // 1 out of 4
      })
    })

    it('should filter out zero counts', () => {
      const loans = [createMockLoan({ status: 'ACTIVE' }), createMockLoan({ status: 'ACTIVE' })]

      const breakdown = calculateStatusBreakdown(loans)

      expect(breakdown).toHaveLength(1)
      expect(breakdown[0].name).toBe('Active')
      expect(breakdown[0].percentage).toBe(100)
    })
  })

  describe('generateRecentActivity', () => {
    it('should handle empty array', () => {
      const activities = generateRecentActivity([])
      expect(activities).toEqual([])
    })

    it('should include recent payments', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)

      const loan = createMockLoan({
        borrowerName: 'John Doe',
        createdAt: monthAgo, // Old creation date to avoid interference
        updatedAt: monthAgo,
        payments: [
          {
            id: 'payment-1',
            loanId: 'loan-1',
            amount: 1000,
            date: yesterday,
            notes: 'Monthly payment',
            createdAt: new Date(),
            deletedAt: null,
          },
        ],
      })

      const activities = generateRecentActivity([loan])

      expect(activities).toHaveLength(1)
      expect(activities[0]).toMatchObject({
        type: 'payment',
        title: 'Payment received from John Doe',
        subtitle: 'Monthly payment',
        amount: 1000,
      })
    })

    it('should include recently completed loans', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)

      const loan = createMockLoan({
        status: 'COMPLETED',
        borrowerName: 'Jane Smith',
        principal: 5000,
        updatedAt: yesterday,
        createdAt: monthAgo, // Old creation date to avoid interference
      })

      const activities = generateRecentActivity([loan])

      expect(activities).toHaveLength(1)
      expect(activities[0]).toMatchObject({
        type: 'loan_completed',
        title: 'Loan completed by Jane Smith',
        amount: 5000,
      })
    })

    it('should include recently created loans', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const loan = createMockLoan({
        borrowerName: 'Bob Johnson',
        principal: 15000,
        createdAt: yesterday,
      })

      const activities = generateRecentActivity([loan])

      expect(activities).toHaveLength(1)
      expect(activities[0]).toMatchObject({
        type: 'loan_created',
        title: 'New loan created for Bob Johnson',
        amount: 15000,
      })
    })

    it('should filter out old activities', () => {
      const twoWeeksAgo = new Date()
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

      const loan = createMockLoan({
        borrowerName: 'Old Loan',
        createdAt: twoWeeksAgo,
        updatedAt: twoWeeksAgo,
        payments: [
          {
            id: 'old-payment',
            loanId: 'loan-1',
            amount: 1000,
            date: twoWeeksAgo,
            notes: 'Old payment',
            createdAt: twoWeeksAgo,
            deletedAt: null,
          },
        ],
      })

      const activities = generateRecentActivity([loan])
      expect(activities).toHaveLength(0)
    })

    it('should sort activities by date (newest first)', () => {
      const today = new Date()
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const twoDaysAgo = new Date()
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

      const loans = [
        createMockLoan({
          borrowerName: 'Loan 1',
          createdAt: twoDaysAgo,
        }),
        createMockLoan({
          borrowerName: 'Loan 2',
          createdAt: today,
        }),
        createMockLoan({
          borrowerName: 'Loan 3',
          createdAt: yesterday,
        }),
      ]

      const activities = generateRecentActivity(loans)

      expect(activities).toHaveLength(3)
      expect(activities[0].title).toBe('New loan created for Loan 2') // Today (newest)
      expect(activities[1].title).toBe('New loan created for Loan 3') // Yesterday
      expect(activities[2].title).toBe('New loan created for Loan 1') // Two days ago
    })

    it('should limit to 10 activities', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      // Create 15 loans with recent activity
      const loans = Array.from({ length: 15 }, (_, i) =>
        createMockLoan({
          id: `loan-${i}`,
          borrowerName: `Borrower ${i}`,
          createdAt: yesterday,
        })
      )

      const activities = generateRecentActivity(loans)
      expect(activities).toHaveLength(10)
    })
  })
})
