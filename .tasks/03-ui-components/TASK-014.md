# [TASK-014] Create Shared Components (MetricsCard, StatusBadge)

**Status:** COMPLETED
**Phase:** UI Components & Layout
**Priority:** P1 (High)
**Estimated Effort:** M (4-6 hours)
**Branch:** `task/014-shared-components`

## Dependencies

- TASK-012 (shadcn/ui setup completed)
- TASK-013 (Root layout completed)

## Description

Build reusable shared components that will be used throughout the application. These components ensure consistency, reduce code duplication, and speed up future development.

## Acceptance Criteria

- [x] MetricsCard component for displaying key metrics
- [x] StatusBadge component for loan/payment statuses
- [x] EmptyState component for empty data scenarios
- [x] LoadingState component for loading states
- [x] All components properly typed with TypeScript
- [x] Components are responsive
- [x] Build passes without errors

## Components to Build

### 1. MetricsCard

Display key metrics with icon, title, value, and optional trend indicator.

**Props:**

```typescript
interface MetricsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  isLoading?: boolean
}
```

**Features:**

- Large, prominent value display
- Icon with primary color background
- Optional trend indicator (up/down arrow with percentage)
- Loading skeleton state
- Responsive design

**Use Cases:**

- Dashboard metrics (Total Loans, Outstanding Balance, etc.)
- Summary cards on detail pages
- Report summaries

### 2. StatusBadge

Display loan and payment statuses with consistent styling.

**Props:**

```typescript
interface StatusBadgeProps {
  status: 'ACTIVE' | 'COMPLETED' | 'DEFAULTED' | 'PENDING'
  size?: 'sm' | 'md' | 'lg'
}
```

**Status Colors:**

- **ACTIVE**: Cerulean Blue (primary)
- **COMPLETED**: Emerald Green (accent)
- **DEFAULTED**: Red (destructive)
- **PENDING**: Slate/Gray (secondary)

**Features:**

- Variant-based styling
- Size options
- Icon support (optional)
- Accessible (proper contrast)

### 3. EmptyState

Show friendly message when there's no data.

**Props:**

```typescript
interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}
```

**Features:**

- Large icon
- Clear messaging
- Optional CTA button
- Centered layout

**Use Cases:**

- Empty loan table
- No payment history
- No search results

### 4. LoadingState

Consistent loading indicators.

**Props:**

```typescript
interface LoadingStateProps {
  text?: string
  size?: 'sm' | 'md' | 'lg'
}
```

**Features:**

- Spinner animation
- Optional loading text
- Size variants
- Centered by default

## File Structure

```
components/
└── shared/
    ├── metrics-card.tsx      # Metrics display card
    ├── status-badge.tsx      # Status indicator
    ├── empty-state.tsx       # Empty data state
    └── loading-state.tsx     # Loading indicator
```

## Example Usage

### MetricsCard

```tsx
<MetricsCard
  title="Total Loans"
  value={totalLoans}
  icon={DollarSign}
  description="Active loan portfolio"
  trend={{ value: 12.5, isPositive: true }}
/>
```

### StatusBadge

```tsx
<StatusBadge status="ACTIVE" />
<StatusBadge status="COMPLETED" size="sm" />
```

### EmptyState

```tsx
<EmptyState
  icon={FileQuestion}
  title="No loans found"
  description="Get started by creating your first loan"
  action={{
    label: 'Create Loan',
    onClick: () => router.push('/loans/new'),
  }}
/>
```

### LoadingState

```tsx
<LoadingState text="Loading loans..." />
```

## Design Considerations

### Consistency

- Use shadcn/ui components as base (Card, Badge)
- Follow existing theme colors
- Maintain consistent spacing

### Accessibility

- Proper semantic HTML
- ARIA labels where needed
- Keyboard navigable CTAs
- Sufficient color contrast

### Performance

- Lightweight components
- No unnecessary re-renders
- Memoization where appropriate

## Testing Strategy

- Unit tests for status badge color mapping
- Visual regression tests (future)
- Accessibility tests (future)
- Integration with actual data

## Future Enhancements (Out of Scope)

- **DataTable Component** - Reusable table with sorting/filtering (TASK-015)
- **FormField Component** - Standardized form inputs (TASK-023)
- **ConfirmDialog Component** - Confirmation dialogs
- **PageHeader Component** - Standardized page headers
- **Stat cards** with charts
- **Skeleton loaders** for each component type

## References

- shadcn/ui Card: https://ui.shadcn.com/docs/components/card
- shadcn/ui Badge: https://ui.shadcn.com/docs/components/badge
- lucide-react icons: https://lucide.dev/
