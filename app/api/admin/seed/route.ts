import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Security check - require admin token
    const adminToken = request.headers.get('x-admin-token')
    if (adminToken !== process.env.ADMIN_SEED_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🌱 Starting production database seed...')

    // Check if database already has data
    const existingLoans = await prisma.loan.count()
    const existingPayments = await prisma.payment.count()

    console.log(`Found existing data: ${existingLoans} loans, ${existingPayments} payments`)

    // Check force parameter
    const body = await request.json()
    const force = body.force === true

    if ((existingLoans > 0 || existingPayments > 0) && !force) {
      return NextResponse.json(
        {
          error: 'Database contains existing data. Send { "force": true } to clear and seed.',
          existingData: { loans: existingLoans, payments: existingPayments },
        },
        { status: 400 }
      )
    }

    if (existingLoans > 0 || existingPayments > 0) {
      console.log('🧹 Clearing existing data...')
      await prisma.payment.deleteMany()
      await prisma.loan.deleteMany()
      console.log('✅ Existing data cleared')
    }

    console.log('📝 Creating loans...')

    // Create the same sample loans as in seed-production.ts
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
        balance: 7250,
        interestCalculationType: 'SIMPLE',
        paymentFrequency: 'MONTHLY',
        status: 'ACTIVE',
        notes: 'Small business loan for inventory purchase',
      },
    })

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
        balance: 42000,
        interestCalculationType: 'AMORTIZED',
        paymentFrequency: 'BI_WEEKLY',
        status: 'ACTIVE',
        notes: 'Auto loan for delivery vehicle',
        collateral: '2023 Ford Transit Van, VIN: 1FTBW2CM9PKA12345',
      },
    })

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
        balance: 100000,
        interestCalculationType: 'INTEREST_ONLY',
        paymentFrequency: 'MONTHLY',
        status: 'ACTIVE',
        notes: 'Real estate investment bridge loan',
        collateral: 'Commercial property at 123 Main St',
      },
    })

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
        balance: 0,
        interestCalculationType: 'SIMPLE',
        paymentFrequency: 'MONTHLY',
        status: 'COMPLETED',
        notes: 'Personal loan - paid off early',
      },
    })

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
        balance: 13500,
        interestCalculationType: 'SIMPLE',
        paymentFrequency: 'MONTHLY',
        status: 'OVERDUE',
        notes: 'Equipment loan - payment issues',
      },
    })

    console.log('💰 Creating payments...')

    const getRecentDate = (daysAgo: number): Date => {
      const date = new Date()
      date.setDate(date.getDate() - daysAgo)
      return date
    }

    const payments = await prisma.payment.createMany({
      data: [
        { loanId: loan1.id, amount: 925, date: getRecentDate(1), notes: 'Monthly payment' },
        { loanId: loan2.id, amount: 800, date: getRecentDate(3), notes: 'Bi-weekly payment' },
        { loanId: loan3.id, amount: 500, date: getRecentDate(5), notes: 'Interest-only payment' },
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

    const result = {
      success: true,
      message: 'Production database seeded successfully!',
      data: {
        loansCreated: 5,
        paymentsCreated: payments.count,
        portfolioValue: 180000,
        summary: {
          active: 3,
          completed: 1,
          overdue: 1,
          recentPayments: 3,
        },
      },
    }

    console.log('✅ Seed completed:', result)
    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ Seed error:', error)
    return NextResponse.json(
      {
        error: 'Seeding failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
