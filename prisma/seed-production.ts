import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding production database...\n')

  // Safety check: Only proceed if explicitly confirmed
  if (!process.env.SEED_PRODUCTION_CONFIRMED) {
    console.error('❌ Production seeding requires explicit confirmation!')
    console.error('Set SEED_PRODUCTION_CONFIRMED=true to proceed')
    console.error('⚠️  WARNING: This will clear all existing data!')
    process.exit(1)
  }

  // Check if database already has data
  const existingLoans = await prisma.loan.count()
  const existingPayments = await prisma.payment.count()

  if (existingLoans > 0 || existingPayments > 0) {
    console.log(`Found existing data: ${existingLoans} loans, ${existingPayments} payments`)

    if (!process.env.FORCE_CLEAR_DATA) {
      console.error('❌ Database contains existing data!')
      console.error('Set FORCE_CLEAR_DATA=true to clear existing data')
      console.error('⚠️  THIS WILL DELETE ALL CURRENT DATA!')
      process.exit(1)
    }

    // Clear existing data
    console.log('🧹 Clearing existing data...')
    await prisma.payment.deleteMany()
    await prisma.loan.deleteMany()
    console.log('✅ Existing data cleared\n')
  }

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

  console.log(`✅ Created 5 sample loans\n`)

  // Create some sample payments
  console.log('💰 Creating payments...')

  // Helper function to generate recent dates
  const getRecentDate = (daysAgo: number): Date => {
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    return date
  }

  const payments = await prisma.payment.createMany({
    data: [
      // Recent payments for dashboard activity
      { loanId: loan1.id, amount: 925, date: getRecentDate(1), notes: 'Monthly payment' },
      { loanId: loan2.id, amount: 800, date: getRecentDate(3), notes: 'Bi-weekly payment' },
      { loanId: loan3.id, amount: 500, date: getRecentDate(5), notes: 'Interest-only payment' },

      // Historical payments
      { loanId: loan1.id, amount: 925, date: new Date('2024-02-01'), notes: 'Payment 1/12' },
      { loanId: loan1.id, amount: 925, date: new Date('2024-03-01'), notes: 'Payment 2/12' },
      { loanId: loan2.id, amount: 800, date: new Date('2023-07-01'), notes: 'First payment' },
      { loanId: loan2.id, amount: 800, date: new Date('2023-07-15'), notes: 'Second payment' },
      { loanId: loan4.id, amount: 850, date: new Date('2024-06-01'), notes: 'Payment 1/6' },
      { loanId: loan4.id, amount: 850, date: new Date('2024-07-01'), notes: 'Payment 2/6' },
      { loanId: loan4.id, amount: 850, date: new Date('2024-08-01'), notes: 'Final payment' },
      { loanId: loan5.id, amount: 750, date: new Date('2023-09-01'), notes: 'First payment' },
      { loanId: loan5.id, amount: 750, date: new Date('2023-10-01'), notes: 'Last payment made' },
    ],
  })

  console.log(`✅ Created ${payments.count} payments\n`)

  // Summary
  console.log('📊 Production Seed Summary:')
  console.log(`   - 5 loans created`)
  console.log(`   - ${payments.count} payments created`)
  console.log(`   - Loan statuses: 3 ACTIVE, 1 COMPLETED, 1 OVERDUE`)
  console.log(`   - Recent activity: 3 payments in last 7 days`)
  console.log(`   - Portfolio value: $180,000 total principal`)
  console.log('\n✨ Production database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
