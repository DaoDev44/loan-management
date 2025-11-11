import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { type SerializedLoan } from '@/lib/utils/serialize'
import { type ActivityItem } from '@/lib/dashboard-calculations'
import { formatCurrency, formatDate } from '@/lib/utils'
import { DollarSign, Plus, CheckCircle2, AlertCircle } from 'lucide-react'

interface RecentActivityProps {
  loans: SerializedLoan[]
  recentActivity: ActivityItem[]
}

export function RecentActivity({ loans, recentActivity }: RecentActivityProps) {
  // Use pre-calculated activity data from hook instead of generating it here
  const activities = recentActivity

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'payment':
        return <DollarSign className="h-4 w-4 text-green-600" />
      case 'loan_created':
        return <Plus className="h-4 w-4 text-blue-600" />
      case 'loan_completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />
    }
  }

  const getActivityBadgeVariant = (type: ActivityItem['type']) => {
    switch (type) {
      case 'payment':
        return 'default'
      case 'loan_created':
        return 'secondary'
      case 'loan_completed':
        return 'default'
      default:
        return 'outline'
    }
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Activity from the past week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No recent activity</p>
            <p className="text-sm">Activity from the past week will appear here</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Activity from the past week</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start space-x-3 p-3 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors"
            >
              <div className="flex-shrink-0 mt-0.5">{getActivityIcon(activity.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-card-foreground">{activity.title}</p>
                    {activity.subtitle && (
                      <p className="text-sm text-muted-foreground mt-0.5">{activity.subtitle}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(activity.date)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {activity.amount && (
                      <span className="text-sm font-medium text-card-foreground">
                        {formatCurrency(activity.amount)}
                      </span>
                    )}
                    <Badge variant={getActivityBadgeVariant(activity.type)} className="text-xs">
                      {activity.type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
