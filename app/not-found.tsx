import { NotFoundDisplay } from '@/components/errors/not-found-display'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <NotFoundDisplay
        title="Page not found"
        description="The page you're looking for doesn't exist or has been moved."
        homeLabel="Go to Dashboard"
        homeHref="/"
      />
    </div>
  )
}
