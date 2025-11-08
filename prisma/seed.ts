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

  console.log(`✅ Created ${8} loans\n`)

  // Create payments
  console.log('💰 Creating payments...')

  const payments = await prisma.payment.createMany({
    data: [
      // Loan 1 payments (3 monthly payments)
      { loanId: loan1.id, amount: 900, date: new Date('2024-02-01'), notes: 'Payment 1/12' },
      { loanId: loan1.id, amount: 925, date: new Date('2024-03-01'), notes: 'Payment 2/12' },
      { loanId: loan1.id, amount: 925, date: new Date('2024-04-01'), notes: 'Payment 3/12' },

      // Loan 2 payments (10 bi-weekly payments)
      { loanId: loan2.id, amount: 800, date: new Date('2023-06-15') },
      { loanId: loan2.id, amount: 800, date: new Date('2023-07-01') },
      { loanId: loan2.id, amount: 800, date: new Date('2023-07-15') },
      { loanId: loan2.id, amount: 800, date: new Date('2023-08-01') },
      { loanId: loan2.id, amount: 800, date: new Date('2023-08-15') },
      { loanId: loan2.id, amount: 800, date: new Date('2023-09-01') },
      { loanId: loan2.id, amount: 800, date: new Date('2023-09-15') },
      { loanId: loan2.id, amount: 800, date: new Date('2023-10-01') },
      { loanId: loan2.id, amount: 800, date: new Date('2023-10-15') },
      { loanId: loan2.id, amount: 800, date: new Date('2023-11-01') },

      // Loan 3 payments (5 interest-only payments)
      { loanId: loan3.id, amount: 500, date: new Date('2024-04-01'), notes: 'Interest payment' },
      { loanId: loan3.id, amount: 500, date: new Date('2024-05-01'), notes: 'Interest payment' },
      { loanId: loan3.id, amount: 500, date: new Date('2024-06-01'), notes: 'Interest payment' },
      { loanId: loan3.id, amount: 500, date: new Date('2024-07-01'), notes: 'Interest payment' },
      { loanId: loan3.id, amount: 500, date: new Date('2024-08-01'), notes: 'Interest payment' },

      // Loan 4 payments (6 payments + final payment = completed)
      { loanId: loan4.id, amount: 850, date: new Date('2024-06-01') },
      { loanId: loan4.id, amount: 850, date: new Date('2024-07-01') },
      { loanId: loan4.id, amount: 850, date: new Date('2024-08-01') },
      { loanId: loan4.id, amount: 850, date: new Date('2024-09-01') },
      { loanId: loan4.id, amount: 850, date: new Date('2024-10-01') },
      { loanId: loan4.id, amount: 850, date: new Date('2024-11-01'), notes: 'Final payment' },

      // Loan 5 payments (only 2 - hence overdue)
      { loanId: loan5.id, amount: 750, date: new Date('2023-09-01') },
      { loanId: loan5.id, amount: 750, date: new Date('2023-10-01') },

      // Loan 6: No payments (new loan)

      // Loan 7 payments (24 monthly payments)
      ...Array.from({ length: 24 }, (_, i) => ({
        loanId: loan7.id,
        amount: 2100,
        date: new Date(2022, i, 15), // Monthly from Jan 2022
        notes: `Payment ${i + 1}/120`,
      })),

      // Loan 8: No payments (defaulted)
    ],
  })

  console.log(`✅ Created ${payments.count} payments\n`)

  // Summary
  console.log('📊 Seed Summary:')
  console.log(`   - ${8} loans created`)
  console.log(`   - ${payments.count} payments created`)
  console.log(`   - Loan statuses: 5 ACTIVE, 1 COMPLETED, 1 OVERDUE, 1 DEFAULTED`)
  console.log(`   - Interest types: SIMPLE, AMORTIZED, INTEREST_ONLY`)
  console.log(`   - Frequencies: MONTHLY, BI_WEEKLY`)
  console.log('\n✨ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
