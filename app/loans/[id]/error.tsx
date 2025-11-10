'use client'

import { ErrorDisplay } from '@/components/errors/error-display'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <ErrorDisplay
        error={error}
        reset={reset}
        title="Failed to load loan"
        description="There was an error loading this loan. It may not exist or there was a server error."
      />
    </div>
  )
}
