import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface ErrorDisplayProps {
  error: Error & { digest?: string }
  reset?: () => void
  title?: string
  description?: string
}

export function ErrorDisplay({
  error,
  reset,
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
}: ErrorDisplayProps) {
  return (
    <Card className="w-full max-w-md border-destructive">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>

        {/* Show error message in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="rounded-md bg-gray-100 p-3">
            <p className="text-xs font-mono text-gray-600 break-words">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs font-mono text-gray-600 mt-2">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        {reset && (
          <Button onClick={reset} variant="default">
            Try Again
          </Button>
        )}
        <Button onClick={() => window.location.href = '/'} variant="outline">
          Go to Dashboard
        </Button>
      </CardFooter>
    </Card>
  )
}
