import { getLoansWithPayments } from '@/app/actions/loan.actions'
import { DashboardClient } from '@/components/dashboard/dashboard-client'

export default async function Home() {
  // Fetch real loan data with payments for dashboard analytics
  const loansResult = await getLoansWithPayments()
  const loans = loansResult.success ? loansResult.data : []

  // Pass data to client component that uses the hook
  return <DashboardClient loans={loans} />
}