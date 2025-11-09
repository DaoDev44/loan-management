import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Status = 'ACTIVE' | 'COMPLETED' | 'OVERDUE' | 'DEFAULTED'
type Size = 'sm' | 'md' | 'lg'

interface StatusBadgeProps {
  status: Status
  size?: Size
  className?: string
}

const statusConfig: Record<
  Status,
  {
    label: string
    className: string
  }
> = {
  ACTIVE: {
    label: 'Active',
    className: 'bg-primary text-primary-foreground hover:bg-primary/80',
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-accent text-accent-foreground hover:bg-accent/80',
  },
  OVERDUE: {
    label: 'Overdue',
    className: 'bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700',
  },
  DEFAULTED: {
    label: 'Defaulted',
    className: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
  },
}

const sizeClasses: Record<Size, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-0.5',
  lg: 'text-sm px-3 py-1',
}

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge
      className={cn(
        config.className,
        sizeClasses[size],
        'font-medium',
        className
      )}
    >
      {config.label}
    </Badge>
  )
}
