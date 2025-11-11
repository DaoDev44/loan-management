'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { type SerializedLoan } from '@/lib/utils/serialize'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { type StatusData } from '@/lib/dashboard-calculations'

interface LoanStatusBreakdownProps {
  loans: SerializedLoan[]
  statusBreakdown: StatusData[]
  totalLoans: number
}

// Colors for status visualization
const statusColors: Record<string, string> = {
  Active: '#3b82f6', // blue-500
  Completed: '#10b981', // emerald-500
  Overdue: '#ef4444', // red-500
  Defaulted: '#dc2626', // red-600
}

interface StatusTooltipProps {
  active?: boolean
  payload?: Array<{ payload: { name: string; count: number; percentage: string } }>
}

const StatusCustomTooltip = ({ active, payload }: StatusTooltipProps) => {
  if (active && payload && payload[0]) {
    const data = payload[0].payload
    return (
      <div className="bg-background border border-border p-2 rounded-md shadow-lg">
        <p className="font-medium">{data.name}</p>
        <p className="text-sm text-muted-foreground">
          {data.count} loans ({data.percentage}%)
        </p>
      </div>
    )
  }
  return null
}

export function LoanStatusBreakdown({
  loans: _loans,
  statusBreakdown,
  totalLoans,
}: LoanStatusBreakdownProps) {
  // Use pre-calculated status data from hook and add colors
  const statusData = statusBreakdown.map((status) => ({
    ...status,
    color: statusColors[status.name] || '#6b7280',
  }))

  if (totalLoans === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loan Status Breakdown</CardTitle>
          <CardDescription>Distribution of loans by status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-dashed border-muted flex items-center justify-center">
              <div className="text-2xl">📊</div>
            </div>
            <p>No loans to display</p>
            <p className="text-sm">Create your first loan to see the breakdown</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan Status Breakdown</CardTitle>
        <CardDescription>Distribution of {totalLoans} loans by status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<StatusCustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry: { color: string }) => (
                  <span style={{ color: entry.color }}>
                    {value} ({entry.payload.count})
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Summary below chart */}
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {statusData.find((s) => s.name === 'Completed')?.count || 0}
            </p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {statusData.find((s) => s.name === 'Active')?.count || 0}
            </p>
            <p className="text-sm text-muted-foreground">Active</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
