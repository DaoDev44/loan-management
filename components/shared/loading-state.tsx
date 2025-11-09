import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Size = 'sm' | 'md' | 'lg'

interface LoadingStateProps {
  text?: string
  size?: Size
  className?: string
}

const sizeClasses: Record<Size, { spinner: string; text: string }> = {
  sm: {
    spinner: 'h-4 w-4',
    text: 'text-xs',
  },
  md: {
    spinner: 'h-8 w-8',
    text: 'text-sm',
  },
  lg: {
    spinner: 'h-12 w-12',
    text: 'text-base',
  },
}

export function LoadingState({ text, size = 'md', className }: LoadingStateProps) {
  const classes = sizeClasses[size]

  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-3', className)}
      role="status"
      aria-live="polite"
    >
      <Loader2 className={cn(classes.spinner, 'animate-spin text-primary')} aria-hidden="true" />
      {text && (
        <p className={cn(classes.text, 'text-muted-foreground')}>{text}</p>
      )}
      <span className="sr-only">{text || 'Loading...'}</span>
    </div>
  )
}
