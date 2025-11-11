import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Safety check: Only run in development
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️  Seed script should not be run in production!')
    process.exit(1)
  }

  console.log('🌱 Seeding database...\n')

  // Clear existing data
  console.log('🧹 Clearing existing data...')
  await prisma.payment.deleteMany()
  await prisma.loan.deleteMany()
  console.log('✅ Existing data cleared\n')

  // Create loans
  console.log('📝 Creating loans...')

  // 1. Active Simple Interest Loan (Monthly)
  const loan1 = await prisma.loan.create({
    data: {
      borrowerName: 'Alice Johnson',
      borrowerEmail: 'alice.johnson@example.com',
      borrowerPhone: '+1-555-0101',
      principal: 10000,
      interestRate: 5.5,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-01-01'),
      termMonths: 12,
      balance: 7250, // After 3 payments
      interestCalculationType: 'SIMPLE',
      paymentFrequency: 'MONTHLY',
      status: 'ACTIVE',
      notes: 'Small business loan for inventory purchase',
    },
  })

  // 2. Active Amortized Loan (Bi-weekly)
  const loan2 = await prisma.loan.create({
    data: {
      borrowerName: 'Bob Smith',
      borrowerEmail: 'bob.smith@example.com',
      borrowerPhone: '+1-555-0102',
      principal: 50000,
      interestRate: 4.2,
      startDate: new Date('2023-06-01'),
      endDate: new Date('2028-06-01'),
      termMonths: 60,
      balance: 42000, // After 10 payments
      interestCalculationType: 'AMORTIZED',
      paymentFrequency: 'BI_WEEKLY',
      status: 'ACTIVE',
      notes: 'Auto loan for delivery vehicle',
      collateral: '2023 Ford Transit Van, VIN: 1FTBW2CM9PKA12345',
    },
  })

  // 3. Active Interest-Only Loan (Monthly)
  const loan3 = await prisma.loan.create({
    data: {
      borrowerName: 'Carol Davis',
      borrowerEmail: 'carol.davis@example.com',
      borrowerPhone: '+1-555-0103',
      principal: 100000,
      interestRate: 6.0,
      startDate: new Date('2024-03-01'),
      endDate: new Date('2026-03-01'),
      termMonths: 24,
      balance: 100000, // Interest-only, principal unchanged
      interestCalculationType: 'INTEREST_ONLY',
      paymentFrequency: 'MONTHLY',
      status: 'ACTIVE',
      notes: 'Real estate investment bridge loan',
      collateral: 'Commercial property at 123 Main St',
    },
  })

  // 4. Completed Loan
  const loan4 = await prisma.loan.create({
    data: {
      borrowerName: 'David Lee',
      borrowerEmail: 'david.lee@example.com',
      borrowerPhone: '+1-555-0104',
      principal: 5000,
      interestRate: 3.5,
      startDate: new Date('2024-05-01'),
      endDate: new Date('2024-11-01'),
      termMonths: 6,
      balance: 0, // Fully paid
      interestCalculationType: 'SIMPLE',
      paymentFrequency: 'MONTHLY',
      status: 'COMPLETED',
      notes: 'Personal loan - paid off early',
    },
  })

  // 5. Overdue Loan
  const loan5 = await prisma.loan.create({
    data: {
      borrowerName: 'Emily Wilson',
      borrowerEmail: 'emily.wilson@example.com',
      borrowerPhone: '+1-555-0105',
      principal: 15000,
      interestRate: 7.5,
      startDate: new Date('2023-08-01'),
      endDate: new Date('2025-02-01'),
      termMonths: 18,
      balance: 13500, // Only 2 payments made
      interestCalculationType: 'SIMPLE',
      paymentFrequency: 'MONTHLY',
      status: 'OVERDUE',
      notes: 'Equipment loan - payment issues',
    },
  })

  // 6. New Loan (No Payments)
  const loan6 = await prisma.loan.create({
    data: {
      borrowerName: 'Frank Martinez',
      borrowerEmail: 'frank.martinez@example.com',
      borrowerPhone: '+1-555-0106',
      principal: 25000,
      interestRate: 5.0,
      startDate: new Date('2024-11-01'),
      endDate: new Date('2026-11-01'),
      termMonths: 24,
      balance: 25000,
      interestCalculationType: 'AMORTIZED',
      paymentFrequency: 'MONTHLY',
      status: 'ACTIVE',
      notes: 'Home improvement loan',
    },
  })

  // 7. Large Loan with Many Payments
  const loan7 = await prisma.loan.create({
    data: {
      borrowerName: 'Grace Taylor',
      borrowerEmail: 'grace.taylor@example.com',
      borrowerPhone: '+1-555-0107',
      principal: 200000,
      interestRate: 4.5,
      startDate: new Date('2022-01-01'),
      endDate: new Date('2032-01-01'),
      termMonths: 120,
      balance: 168000, // After 24 months of payments
      interestCalculationType: 'AMORTIZED',
      paymentFrequency: 'MONTHLY',
      status: 'ACTIVE',
      notes: 'Commercial real estate mortgage',
      collateral: 'Office building at 456 Business Blvd',
    },
  })

  // 8. Defaulted Loan
  const loan8 = await prisma.loan.create({
    data: {
      borrowerName: 'Henry Brown',
      borrowerEmail: 'henry.brown@example.com',
      borrowerPhone: '+1-555-0108',
      principal: 8000,
      interestRate: 8.0,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-01-01'),
      termMonths: 12,
      balance: 8000, // No payments made
      interestCalculationType: 'SIMPLE',
      paymentFrequency: 'MONTHLY',
      status: 'DEFAULTED',
      notes: 'Business loan - borrower unresponsive',
    },
  })

  // 9. Loan with upcoming due date (next 30 days)
  const now = new Date()
  const upcomingDueDate = new Date()
  upcomingDueDate.setDate(now.getDate() + 15) // Due in 15 days

  const loan9 = await prisma.loan.create({
    data: {
      borrowerName: 'Isabella Garcia',
      borrowerEmail: 'isabella.garcia@example.com',
      borrowerPhone: '+1-555-0109',
      principal: 12000,
      interestRate: 5.8,
      startDate: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
      endDate: upcomingDueDate,
      termMonths: 12,
      balance: 1200, // Almost paid off
      interestCalculationType: 'SIMPLE',
      paymentFrequency: 'MONTHLY',
      status: 'ACTIVE',
      notes: 'Equipment loan - final payment due soon',
      collateral: 'Restaurant equipment and fixtures',
    },
  })

  // 10. Another upcoming due date loan
  const upcomingDueDate2 = new Date()
  upcomingDueDate2.setDate(now.getDate() + 25) // Due in 25 days

  const loan10 = await prisma.loan.create({
    data: {
      borrowerName: 'Jack Thompson',
      borrowerEmail: 'jack.thompson@example.com',
      borrowerPhone: '+1-555-0110',
      principal: 30000,
      interestRate: 6.2,
      startDate: new Date(now.getFullYear() - 2, now.getMonth(), now.getDate()),
      endDate: upcomingDueDate2,
      termMonths: 24,
      balance: 3500, // Almost complete
      interestCalculationType: 'AMORTIZED',
      paymentFrequency: 'MONTHLY',
      status: 'ACTIVE',
      notes: 'Working capital loan - nearing completion',
    },
  })

  // 11. High-value loan with regular payments
  const loan11 = await prisma.loan.create({
    data: {
      borrowerName: 'Katherine Wong',
      borrowerEmail: 'katherine.wong@example.com',
      borrowerPhone: '+1-555-0111',
      principal: 150000,
      interestRate: 4.8,
      startDate: new Date('2023-01-01'),
      endDate: new Date('2028-01-01'),
      termMonths: 60,
      balance: 125000,
      interestCalculationType: 'AMORTIZED',
      paymentFrequency: 'MONTHLY',
      status: 'ACTIVE',
      notes: 'Commercial property acquisition loan',
      collateral: 'Retail space at 789 Commerce St',
    },
  })

  // 12. Recently completed loan
  const loan12 = await prisma.loan.create({
    data: {
      borrowerName: 'Luis Rodriguez',
      borrowerEmail: 'luis.rodriguez@example.com',
      borrowerPhone: '+1-555-0112',
      principal: 7500,
      interestRate: 4.0,
      startDate: new Date('2024-05-01'),
      endDate: new Date('2024-11-01'),
      termMonths: 6,
      balance: 0,
      interestCalculationType: 'SIMPLE',
      paymentFrequency: 'MONTHLY',
      status: 'COMPLETED',
      notes: 'Small business startup loan - paid early',
    },
  })

  // 13. Another overdue loan
  const loan13 = await prisma.loan.create({
    data: {
      borrowerName: 'Maria Santos',
      borrowerEmail: 'maria.santos@example.com',
      borrowerPhone: '+1-555-0113',
      principal: 20000,
      interestRate: 7.0,
      startDate: new Date('2023-12-01'),
      endDate: new Date('2025-06-01'),
      termMonths: 18,
      balance: 18500,
      interestCalculationType: 'SIMPLE',
      paymentFrequency: 'MONTHLY',
      status: 'OVERDUE',
      notes: 'Inventory financing - missed recent payments',
    },
  })

  // 14. Active loan with consistent payments
  const loan14 = await prisma.loan.create({
    data: {
      borrowerName: 'Nathan Cooper',
      borrowerEmail: 'nathan.cooper@example.com',
      borrowerPhone: '+1-555-0114',
      principal: 40000,
      interestRate: 5.3,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2027-01-01'),
      termMonths: 36,
      balance: 32000,
      interestCalculationType: 'AMORTIZED',
      paymentFrequency: 'MONTHLY',
      status: 'ACTIVE',
      notes: 'Vehicle fleet expansion loan',
      collateral: '3 delivery trucks',
    },
  })

  console.log(`✅ Created ${14} loans\n`)

  // Create payments
  console.log('💰 Creating payments...')

  // Helper function to generate dates for payments
  const getRecentDate = (daysAgo: number): Date => {
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    return date
  }

  const getMonthlyDate = (monthsAgo: number, dayOffset: number = 0): Date => {
    const date = new Date()
    date.setMonth(date.getMonth() - monthsAgo)
    date.setDate(dayOffset || date.getDate())
    return date
  }

  const payments = await prisma.payment.createMany({
    data: [
      // RECENT PAYMENTS (last 7 days) for Recent Activity showcase
      { loanId: loan1.id, amount: 925, date: getRecentDate(1), notes: 'Payment 11/12' },
      { loanId: loan2.id, amount: 800, date: getRecentDate(2), notes: 'Bi-weekly payment' },
      { loanId: loan11.id, amount: 2850, date: getRecentDate(3), notes: 'Monthly payment' },
      { loanId: loan14.id, amount: 1200, date: getRecentDate(4), notes: 'Vehicle loan payment' },
      { loanId: loan9.id, amount: 1050, date: getRecentDate(5), notes: 'Equipment loan payment' },
      {
        loanId: loan12.id,
        amount: 1275,
        date: getRecentDate(6),
        notes: 'Final payment - loan completed',
      },
      { loanId: loan3.id, amount: 500, date: getRecentDate(7), notes: 'Interest-only payment' },

      // MONTHLY PAYMENTS across last 6 months for Performance Chart

      // Month 1 (most recent)
      { loanId: loan1.id, amount: 925, date: getMonthlyDate(0, 15), notes: 'Payment 10/12' },
      { loanId: loan2.id, amount: 800, date: getMonthlyDate(0, 1) },
      { loanId: loan2.id, amount: 800, date: getMonthlyDate(0, 16) },
      { loanId: loan3.id, amount: 500, date: getMonthlyDate(0, 1), notes: 'Interest payment' },
      { loanId: loan7.id, amount: 2100, date: getMonthlyDate(0, 15) },
      { loanId: loan9.id, amount: 1050, date: getMonthlyDate(0, 10) },
      { loanId: loan10.id, amount: 1450, date: getMonthlyDate(0, 12) },
      { loanId: loan11.id, amount: 2850, date: getMonthlyDate(0, 5) },
      { loanId: loan14.id, amount: 1200, date: getMonthlyDate(0, 20) },

      // Month 2
      { loanId: loan1.id, amount: 925, date: getMonthlyDate(1, 15), notes: 'Payment 9/12' },
      { loanId: loan2.id, amount: 800, date: getMonthlyDate(1, 1) },
      { loanId: loan2.id, amount: 800, date: getMonthlyDate(1, 16) },
      { loanId: loan3.id, amount: 500, date: getMonthlyDate(1, 1), notes: 'Interest payment' },
      { loanId: loan7.id, amount: 2100, date: getMonthlyDate(1, 15) },
      { loanId: loan9.id, amount: 1050, date: getMonthlyDate(1, 10) },
      { loanId: loan10.id, amount: 1450, date: getMonthlyDate(1, 12) },
      { loanId: loan11.id, amount: 2850, date: getMonthlyDate(1, 5) },
      { loanId: loan12.id, amount: 1275, date: getMonthlyDate(1, 8) },
      { loanId: loan14.id, amount: 1200, date: getMonthlyDate(1, 20) },

      // Month 3
      { loanId: loan1.id, amount: 925, date: getMonthlyDate(2, 15), notes: 'Payment 8/12' },
      { loanId: loan2.id, amount: 800, date: getMonthlyDate(2, 1) },
      { loanId: loan2.id, amount: 800, date: getMonthlyDate(2, 16) },
      { loanId: loan3.id, amount: 500, date: getMonthlyDate(2, 1), notes: 'Interest payment' },
      { loanId: loan4.id, amount: 850, date: getMonthlyDate(2, 1) },
      { loanId: loan7.id, amount: 2100, date: getMonthlyDate(2, 15) },
      { loanId: loan9.id, amount: 1050, date: getMonthlyDate(2, 10) },
      { loanId: loan10.id, amount: 1450, date: getMonthlyDate(2, 12) },
      { loanId: loan11.id, amount: 2850, date: getMonthlyDate(2, 5) },
      { loanId: loan12.id, amount: 1275, date: getMonthlyDate(2, 8) },
      { loanId: loan14.id, amount: 1200, date: getMonthlyDate(2, 20) },

      // Month 4
      { loanId: loan1.id, amount: 925, date: getMonthlyDate(3, 15), notes: 'Payment 7/12' },
      { loanId: loan2.id, amount: 800, date: getMonthlyDate(3, 1) },
      { loanId: loan2.id, amount: 800, date: getMonthlyDate(3, 16) },
      { loanId: loan3.id, amount: 500, date: getMonthlyDate(3, 1), notes: 'Interest payment' },
      { loanId: loan4.id, amount: 850, date: getMonthlyDate(3, 1) },
      { loanId: loan7.id, amount: 2100, date: getMonthlyDate(3, 15) },
      { loanId: loan9.id, amount: 1050, date: getMonthlyDate(3, 10) },
      { loanId: loan10.id, amount: 1450, date: getMonthlyDate(3, 12) },
      { loanId: loan11.id, amount: 2850, date: getMonthlyDate(3, 5) },
      { loanId: loan12.id, amount: 1275, date: getMonthlyDate(3, 8) },
      { loanId: loan14.id, amount: 1200, date: getMonthlyDate(3, 20) },

      // Month 5
      { loanId: loan1.id, amount: 925, date: getMonthlyDate(4, 15), notes: 'Payment 6/12' },
      { loanId: loan2.id, amount: 800, date: getMonthlyDate(4, 1) },
      { loanId: loan2.id, amount: 800, date: getMonthlyDate(4, 16) },
      { loanId: loan3.id, amount: 500, date: getMonthlyDate(4, 1), notes: 'Interest payment' },
      { loanId: loan4.id, amount: 850, date: getMonthlyDate(4, 1) },
      { loanId: loan7.id, amount: 2100, date: getMonthlyDate(4, 15) },
      { loanId: loan9.id, amount: 1050, date: getMonthlyDate(4, 10) },
      { loanId: loan10.id, amount: 1450, date: getMonthlyDate(4, 12) },
      { loanId: loan11.id, amount: 2850, date: getMonthlyDate(4, 5) },
      { loanId: loan12.id, amount: 1275, date: getMonthlyDate(4, 8) },
      { loanId: loan14.id, amount: 1200, date: getMonthlyDate(4, 20) },

      // Month 6 (oldest)
      { loanId: loan1.id, amount: 925, date: getMonthlyDate(5, 15), notes: 'Payment 5/12' },
      { loanId: loan2.id, amount: 800, date: getMonthlyDate(5, 1) },
      { loanId: loan2.id, amount: 800, date: getMonthlyDate(5, 16) },
      { loanId: loan3.id, amount: 500, date: getMonthlyDate(5, 1), notes: 'Interest payment' },
      { loanId: loan4.id, amount: 850, date: getMonthlyDate(5, 1) },
      { loanId: loan7.id, amount: 2100, date: getMonthlyDate(5, 15) },
      { loanId: loan9.id, amount: 1050, date: getMonthlyDate(5, 10) },
      { loanId: loan10.id, amount: 1450, date: getMonthlyDate(5, 12) },
      { loanId: loan11.id, amount: 2850, date: getMonthlyDate(5, 5) },
      { loanId: loan12.id, amount: 1275, date: getMonthlyDate(5, 8) },
      { loanId: loan14.id, amount: 1200, date: getMonthlyDate(5, 20) },

      // EARLIER PAYMENTS to establish loan history

      // Loan 1 - earlier payments
      { loanId: loan1.id, amount: 900, date: new Date('2024-02-01'), notes: 'Payment 1/12' },
      { loanId: loan1.id, amount: 925, date: new Date('2024-03-01'), notes: 'Payment 2/12' },
      { loanId: loan1.id, amount: 925, date: new Date('2024-04-01'), notes: 'Payment 3/12' },
      { loanId: loan1.id, amount: 925, date: new Date('2024-05-01'), notes: 'Payment 4/12' },

      // Loan 4 - completed loan payments
      { loanId: loan4.id, amount: 850, date: new Date('2024-06-01') },
      { loanId: loan4.id, amount: 850, date: new Date('2024-07-01') },
      { loanId: loan4.id, amount: 850, date: new Date('2024-08-01') },

      // Loan 5 - overdue loan (only 2 payments)
      { loanId: loan5.id, amount: 750, date: new Date('2023-09-01') },
      { loanId: loan5.id, amount: 750, date: new Date('2023-10-01') },

      // Loan 7 - large loan with consistent payment history
      ...Array.from({ length: 24 }, (_, i) => ({
        loanId: loan7.id,
        amount: 2100,
        date: new Date(2022, i, 15), // Monthly from Jan 2022
        notes: `Payment ${i + 1}/120`,
      })),

      // Loan 13 - overdue loan with sparse payments
      { loanId: loan13.id, amount: 1500, date: new Date('2024-01-01') },

      // Loan 6: No payments (new loan)
      // Loan 8: No payments (defaulted)
    ],
  })

  console.log(`✅ Created ${payments.count} payments\n`)

  // Summary
  console.log('📊 Seed Summary:')
  console.log(`   - ${14} loans created`)
  console.log(`   - ${payments.count} payments created`)
  console.log(`   - Loan statuses: 10 ACTIVE, 2 COMPLETED, 2 OVERDUE, 1 DEFAULTED`)
  console.log(`   - Interest types: SIMPLE, AMORTIZED, INTEREST_ONLY`)
  console.log(`   - Frequencies: MONTHLY, BI_WEEKLY`)
  console.log(`   - Recent activity: 7 payments in last 7 days`)
  console.log(`   - Payment trends: 6 months of historical data`)
  console.log(`   - Upcoming due dates: 2 loans due within 30 days`)
  console.log(`   - Portfolio value: ~$715,000 total principal`)
  console.log('\n✨ Database seeded successfully with enhanced dashboard data!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
