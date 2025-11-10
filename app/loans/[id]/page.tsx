import { notFound } from 'next/navigation'
import { getLoan } from '@/app/actions/loan.actions'
import { LoanDetailHeader } from '@/components/loans/loan-detail-header'
import { LoanOverviewCard } from '@/components/loans/loan-overview-card'
import { LoanActions } from '@/components/loans/loan-actions'
import { PaymentHistoryCard } from '@/components/loans/payment-history-card'

interface LoanDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function LoanDetailPage({ params }: LoanDetailPageProps) {
  const { id } = await params
  const result = await getLoan(id)

  if (!result.success) {
    notFound()
  }

  const loan = result.data

  return (
    <div className="space-y-6">
      <LoanDetailHeader loan={loan} />
      <LoanOverviewCard loan={loan} />
      <LoanActions loan={loan} />
      <PaymentHistoryCard payments={loan.payments || []} />
    </div>
  )
}

export async function generateMetadata({ params }: LoanDetailPageProps) {
  const { id } = await params
  return {
    title: `Loan Details - ${id}`,
    description: 'View detailed information about a specific loan including payment history and actions.',
  }
}