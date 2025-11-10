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
    className: 'bg-green-500 text-white hover:bg-green-600',
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-blue-500 text-white hover:bg-blue-600',
  },
  OVERDUE: {
    label: 'Overdue',
    className: 'bg-orange-500 text-white hover:bg-orange-600',
  },
  DEFAULTED: {
    label: 'Defaulted',
    className: 'bg-red-500 text-white hover:bg-red-600',
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
