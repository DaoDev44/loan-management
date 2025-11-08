import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧪 Testing Prisma Schema...\n')

  // Test 1: Create a loan
  console.log('1️⃣ Creating a test loan...')
  const loan = await prisma.loan.create({
    data: {
      borrowerName: 'John Doe',
      borrowerEmail: 'john@example.com',
      borrowerPhone: '+1-555-1234',
      principal: 10000,
      interestRate: 5.5,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      termMonths: 12,
      balance: 10000,
      interestCalculationType: 'SIMPLE',
      paymentFrequency: 'MONTHLY',
    },
  })
  console.log('✅ Loan created:', loan.id)

  // Test 2: Create a payment
  console.log('\n2️⃣ Creating a test payment...')
  const payment = await prisma.payment.create({
    data: {
      amount: 1000,
      loanId: loan.id,
      notes: 'First payment',
    },
  })
  console.log('✅ Payment created:', payment.id)

  // Test 3: Query loan with payments
  console.log('\n3️⃣ Querying loan with payments...')
  const loanWithPayments = await prisma.loan.findUnique({
    where: { id: loan.id },
    include: { payments: true },
  })
  console.log('✅ Loan with payments:', {
    borrower: loanWithPayments?.borrowerName,
    balance: loanWithPayments?.balance.toString(),
    paymentsCount: loanWithPayments?.payments.length,
  })

  // Test 4: Query loans by status
  console.log('\n4️⃣ Querying active loans...')
  const activeLoans = await prisma.loan.findMany({
    where: { status: 'ACTIVE' },
  })
  console.log('✅ Active loans count:', activeLoans.length)

  // Test 5: Test enums
  console.log('\n5️⃣ Testing enum values...')
  console.log('✅ Interest calculation type:', loan.interestCalculationType)
  console.log('✅ Payment frequency:', loan.paymentFrequency)
  console.log('✅ Loan status:', loan.status)

  // Cleanup
  console.log('\n🧹 Cleaning up test data...')
  await prisma.payment.delete({ where: { id: payment.id } })
  await prisma.loan.delete({ where: { id: loan.id } })
  console.log('✅ Test data cleaned up')

  console.log('\n✨ All tests passed!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
