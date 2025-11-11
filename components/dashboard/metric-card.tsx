import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { type LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn, formatPercentage } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
    label?: string
  }
  variant?: 'default' | 'success' | 'warning' | 'destructive'
  className?: string
}

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: MetricCardProps) {
  const variantStyles = {
    default: 'border-border',
    success: 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20',
    warning: 'border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20',
    destructive: 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20',
  }

  const getTrendIcon = () => {
    if (!trend) return null
    if (trend.value > 0) return <TrendingUp className="h-3 w-3" />
    if (trend.value < 0) return <TrendingDown className="h-3 w-3" />
    return <Minus className="h-3 w-3" />
  }

  const getTrendColor = () => {
    if (!trend) return ''
    if (trend.value > 0) return trend.isPositive ? 'text-green-600' : 'text-red-600'
    if (trend.value < 0) return trend.isPositive ? 'text-red-600' : 'text-green-600'
    return 'text-muted-foreground'
  }

  return (
    <Card className={cn(variantStyles[variant], className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && (
          <Icon
            className={cn(
              'h-4 w-4',
              variant === 'default' ? 'text-muted-foreground' : 'text-current'
            )}
          />
        )}
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="text-2xl font-bold tracking-tight text-card-foreground">{value}</div>

        <div className="flex items-center justify-between">
          {description && <p className="text-xs text-muted-foreground">{description}</p>}

          {trend && (
            <div className={cn('flex items-center gap-1 text-xs font-medium', getTrendColor())}>
              {getTrendIcon()}
              <span>{formatPercentage(Math.abs(trend.value))}</span>
              {trend.label && <span className="text-muted-foreground ml-1">{trend.label}</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
