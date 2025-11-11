# [TASK-016] Create Loading and Error Boundary Components

**Status:** COMPLETED
**Phase:** UI Components & Layout
**Priority:** P1 (High)
**Estimated Effort:** S (2-3 hours)
**Branch:** `task/016-loading-error-boundaries`

## Dependencies

- TASK-012 (shadcn/ui setup completed)
- TASK-013 (Root layout completed)
- TASK-014 (LoadingState component completed)

## Description

Implement Next.js 14 App Router loading and error boundary patterns for graceful loading states and error handling throughout the application. This provides better UX during data fetching and recovery from errors.

## Acceptance Criteria

- [x] Global error boundary (app/error.tsx)
- [x] Global not-found page (app/not-found.tsx)
- [x] Loading state for loans page (app/loans/loading.tsx)
- [x] Error boundary for loans page (app/loans/error.tsx)
- [x] Loading state for loan detail (app/loans/[id]/loading.tsx)
- [x] Error boundary for loan detail (app/loans/[id]/error.tsx)
- [x] All components properly typed with TypeScript
- [x] Build passes without errors

## Next.js 14 Loading & Error Patterns

### Loading States (loading.tsx)

Next.js automatically shows `loading.tsx` while a route segment is loading:

```tsx
// app/loans/loading.tsx
export default function Loading() {
  return <LoadingState /> // Use our shared component
}
```

### Error Boundaries (error.tsx)

Must be **Client Components** with error and reset props:

```tsx
// app/loans/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorDisplay error={error} reset={reset} />
}
```

### Not Found (not-found.tsx)

Shown when `notFound()` is called or route doesn't exist:

```tsx
// app/not-found.tsx
export default function NotFound() {
  return <NotFoundDisplay />
}
```

## File Structure

```
app/
├── error.tsx                 # Global error boundary
├── not-found.tsx            # Global 404 page
├── loans/
│   ├── loading.tsx          # Loading state for loans list
│   ├── error.tsx            # Error boundary for loans list
│   └── [id]/
│       ├── loading.tsx      # Loading state for loan detail
│       └── error.tsx        # Error boundary for loan detail
components/
└── errors/
    ├── error-display.tsx    # Reusable error UI
    └── not-found-display.tsx # Reusable 404 UI
```

## Components to Build

### 1. ErrorDisplay Component

Reusable error display with retry functionality.

**Props:**

```typescript
interface ErrorDisplayProps {
  error: Error & { digest?: string }
  reset?: () => void
  title?: string
  description?: string
}
```

**Features:**

- Display error message
- Error digest (for debugging)
- "Try Again" button (if reset provided)
- "Go Home" button
- Icon (AlertTriangle from lucide-react)
- Professional, non-technical error messages for users

### 2. NotFoundDisplay Component

User-friendly 404 page.

**Props:**

```typescript
interface NotFoundDisplayProps {
  title?: string
  description?: string
  homeLabel?: string
  homeHref?: string
}
```

**Features:**

- Clear "Not Found" message
- Icon (FileQuestion from lucide-react)
- Navigation back to home/loans
- Consistent with EmptyState styling

## Implementation Details

### Global Error Boundary (app/error.tsx)

```tsx
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
```

### Global Not Found (app/not-found.tsx)

```tsx
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
```

### Loans Loading (app/loans/loading.tsx)

```tsx
import { LoadingState } from '@/components/shared/loading-state'

export default function Loading() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <LoadingState text="Loading loans..." size="lg" />
    </div>
  )
}
```

### Loans Error (app/loans/error.tsx)

```tsx
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
```

### Loan Detail Loading (app/loans/[id]/loading.tsx)

```tsx
import { LoadingState } from '@/components/shared/loading-state'

export default function Loading() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <LoadingState text="Loading loan details..." size="lg" />
    </div>
  )
}
```

### Loan Detail Error (app/loans/[id]/error.tsx)

```tsx
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
```

## Design Considerations

### Error Display

- Use Card component for consistent styling
- Show user-friendly messages (not raw stack traces)
- Include error digest for debugging (but subtle)
- Red/destructive color scheme
- Clear call-to-action buttons

### Loading States

- Use our existing LoadingState component
- Center vertically and horizontally
- Minimum height to prevent layout shift
- Appropriate loading message for context

### Not Found

- Clear, friendly messaging
- Helpful navigation options
- Consistent with overall app design
- Slate/neutral color scheme

## Error Logging (Future Enhancement)

In production, you'd want to log errors:

```tsx
// app/error.tsx
'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log to error reporting service (Sentry, LogRocket, etc.)
    console.error('Global error:', error)
  }, [error])

  return <ErrorDisplay error={error} reset={reset} />
}
```

## Testing

### Manual Testing

- [ ] Navigate to non-existent route (should show 404)
- [ ] Trigger error in loans page (temporarily break Server Action)
- [ ] Verify loading states show during navigation
- [ ] Click "Try Again" button and verify reset works
- [ ] Verify error digest is shown in dev mode
- [ ] Test on mobile (responsive)

### Error Scenarios to Test

1. Network error (disconnect internet)
2. Database error (stop Docker container)
3. Invalid loan ID (navigate to `/loans/invalid-id`)
4. Server Action throws error

## Accessibility

- Proper semantic HTML
- ARIA labels for icons
- Keyboard navigable buttons
- Focus management on error recovery
- Screen reader friendly error messages

## Future Enhancements (Out of Scope)

- **Toast notifications** - Show errors as toasts instead of full page
- **Error retry with exponential backoff**
- **Offline detection** - Show specific message when offline
- **Error reporting service integration** - Sentry, LogRocket, etc.
- **Custom 500 error page** - Server-side error handling
- **Suspense streaming** - Stream parts of page while loading

## References

- Next.js Error Handling: https://nextjs.org/docs/app/building-your-application/routing/error-handling
- Next.js Loading UI: https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming
- Not Found: https://nextjs.org/docs/app/api-reference/file-conventions/not-found
