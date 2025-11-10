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
        title="Failed to load loans"
        description="There was an error loading the loan list. Please try again."
      />
    </div>
  )
}
