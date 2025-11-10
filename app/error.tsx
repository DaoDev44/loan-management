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
    <div className="flex min-h-screen items-center justify-center p-6">
      <ErrorDisplay
        error={error}
        reset={reset}
        title="Something went wrong"
        description="An unexpected error occurred. Please try again."
      />
    </div>
  )
}
