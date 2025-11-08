import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Verifying seed data...\n')

  // Count loans by status
  const loansByStatus = await prisma.loan.groupBy({
    by: ['status'],
    _count: true,
  })

  console.log('📊 Loans by status:')
  loansByStatus.forEach((group) => {
    console.log(`   - ${group.status}: ${group._count}`)
  })

  // Count loans by interest type
  const loansByInterestType = await prisma.loan.groupBy({
    by: ['interestCalculationType'],
    _count: true,
  })

  console.log('\n💰 Loans by interest calculation type:')
  loansByInterestType.forEach((group) => {
    console.log(`   - ${group.interestCalculationType}: ${group._count}`)
  })

  // Count loans by payment frequency
  const loansByFrequency = await prisma.loan.groupBy({
    by: ['paymentFrequency'],
    _count: true,
  })

  console.log('\n📅 Loans by payment frequency:')
  loansByFrequency.forEach((group) => {
    console.log(`   - ${group.paymentFrequency}: ${group._count}`)
  })

  // Count total payments
  const totalPayments = await prisma.payment.count()
  console.log(`\n💳 Total payments: ${totalPayments}`)

  // Sample loan with payments
  const sampleLoan = await prisma.loan.findFirst({
    where: { borrowerName: 'Alice Johnson' },
    include: {
      payments: true,
    },
  })

  if (sampleLoan) {
    console.log(`\n🔎 Sample loan (${sampleLoan.borrowerName}):`)
    console.log(`   - Principal: $${sampleLoan.principal}`)
    console.log(`   - Balance: $${sampleLoan.balance}`)
    console.log(`   - Interest Rate: ${sampleLoan.interestRate}%`)
    console.log(`   - Payments made: ${sampleLoan.payments.length}`)
    console.log(`   - Status: ${sampleLoan.status}`)
  }

  console.log('\n✅ Seed data verified successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
