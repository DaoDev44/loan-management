'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { type SerializedLoan } from '@/lib/utils/serialize'
import { formatCurrency } from '@/lib/utils'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { type PaymentData } from '@/lib/dashboard-calculations'

interface PerformanceChartProps {
  loans: SerializedLoan[]
  paymentTrends: PaymentData[]
  hasPaymentData: boolean
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: PaymentData }>
  label?: string
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload[0]) {
    const data = payload[0].payload
    return (
      <div className="bg-background border border-border p-3 rounded-md shadow-lg">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-green-600">Amount: {formatCurrency(data.amount)}</p>
        <p className="text-sm text-muted-foreground">
          {data.count} payment{data.count !== 1 ? 's' : ''}
        </p>
      </div>
    )
  }
  return null
}

export function PerformanceChart({
  loans: _loans,
  paymentTrends,
  hasPaymentData,
}: PerformanceChartProps) {
  // Use pre-calculated payment data from hook instead of generating it here

  if (!hasPaymentData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Trends</CardTitle>
          <CardDescription>Monthly payment activity over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-dashed border-muted flex items-center justify-center">
              <div className="text-2xl">📈</div>
            </div>
            <p>No payment data available</p>
            <p className="text-sm">Payment trends will appear once you have payment history</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate trend metrics
  const totalPayments = paymentTrends.reduce((sum, data) => sum + data.amount, 0)
  const avgMonthlyPayments = totalPayments / paymentTrends.length
  const currentMonth = paymentTrends[paymentTrends.length - 1]?.amount || 0
  const previousMonth = paymentTrends[paymentTrends.length - 2]?.amount || 0
  const monthOverMonthChange =
    previousMonth > 0 ? Math.round(((currentMonth - previousMonth) / previousMonth) * 100) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Trends</CardTitle>
        <CardDescription>Monthly payment activity over the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={paymentTrends}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-sm" tick={{ fontSize: 12 }} />
              <YAxis
                className="text-sm"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => formatCurrency(value, { compact: true })}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Performance metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-lg font-bold text-primary">{formatCurrency(currentMonth)}</p>
            <p className="text-sm text-muted-foreground">This Month</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-primary">{formatCurrency(avgMonthlyPayments)}</p>
            <p className="text-sm text-muted-foreground">Monthly Average</p>
          </div>
          <div className="text-center">
            <p
              className={`text-lg font-bold ${monthOverMonthChange >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {monthOverMonthChange > 0 ? '+' : ''}
              {monthOverMonthChange}%
            </p>
            <p className="text-sm text-muted-foreground">vs Last Month</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
