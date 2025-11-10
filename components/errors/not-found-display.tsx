import Link from 'next/link'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NotFoundDisplayProps {
  title?: string
  description?: string
  homeLabel?: string
  homeHref?: string
}

export function NotFoundDisplay({
  title = 'Page not found',
  description = "The page you're looking for doesn't exist or has been moved.",
  homeLabel = 'Go to Dashboard',
  homeHref = '/',
}: NotFoundDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6 p-6">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
        <FileQuestion className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
      </div>

      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">404</h1>
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="text-muted-foreground max-w-md">{description}</p>
      </div>

      <div className="flex gap-3">
        <Button asChild>
          <Link href={homeHref}>{homeLabel}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/loans">View Loans</Link>
        </Button>
      </div>
    </div>
  )
}
