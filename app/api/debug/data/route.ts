import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Security check - require admin token
    const adminToken = request.headers.get('x-admin-token')
    if (adminToken !== process.env.ADMIN_SEED_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔍 Fetching debug data from database...')

    // Get all loans with payments
    const loans = await prisma.loan.findMany({
      include: {
        payments: {
          orderBy: { date: 'desc' },
        },
      },
      orderBy: { id: 'asc' },
    })

    // Get payment count
    const totalPayments = await prisma.payment.count()

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        totalLoans: loans.length,
        totalPayments,
        loans: loans.map((loan) => ({
          id: loan.id,
          borrowerName: loan.borrowerName,
          borrowerEmail: loan.borrowerEmail,
          principal: loan.principal,
          balance: loan.balance,
          status: loan.status,
          paymentsCount: loan.payments.length,
          recentPayment: loan.payments[0]
            ? {
                amount: loan.payments[0].amount,
                date: loan.payments[0].date,
              }
            : null,
        })),
      },
    }

    console.log('✅ Debug data fetched successfully:', result)
    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ Debug error:', error)
    return NextResponse.json(
      {
        error: 'Debug failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
