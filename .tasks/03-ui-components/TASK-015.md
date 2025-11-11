# [TASK-015] Build LoanTable Component with Sort/Filter

**Status:** COMPLETED
**Phase:** UI Components & Layout
**Priority:** P0 (Critical Path)
**Estimated Effort:** L (8-12 hours)
**Branch:** `task/015-loan-table`

## Dependencies

- TASK-012 (shadcn/ui setup completed)
- TASK-014 (StatusBadge component completed)
- TASK-009 (Loan CRUD Server Actions completed)

## Description

Build a comprehensive data table component for displaying loans with sorting, filtering, and pagination capabilities. This is the primary UI for the Loans page and will be reused throughout the application.

## Acceptance Criteria

- [ ] Display all loan fields (borrower, amount, balance, status, dates)
- [ ] Column sorting (ascending/descending)
- [ ] Filter by status (ACTIVE, COMPLETED, DEFAULTED, PENDING)
- [ ] Search by borrower name
- [ ] Pagination (10, 25, 50, 100 per page)
- [ ] Responsive design (mobile-friendly)
- [ ] Loading state integration
- [ ] Empty state integration
- [ ] Click row to navigate to loan detail
- [ ] TypeScript typed with Prisma types
- [ ] Build passes without errors

## Features

### 1. Table Columns

| Column        | Type    | Sortable | Format                  |
| ------------- | ------- | -------- | ----------------------- |
| Borrower Name | string  | Yes      | Text                    |
| Email         | string  | No       | Text (hidden on mobile) |
| Principal     | Decimal | Yes      | Currency ($10,000.00)   |
| Balance       | Decimal | Yes      | Currency ($8,500.00)    |
| Interest Rate | Decimal | Yes      | Percentage (5.25%)      |
| Status        | Enum    | Yes      | StatusBadge             |
| Start Date    | Date    | Yes      | MM/DD/YYYY              |
| Actions       | -       | No       | Menu (Edit, Delete)     |

### 2. Sorting

- Click column header to sort
- First click: ascending
- Second click: descending
- Third click: reset to default
- Visual indicator (arrow up/down)
- Default sort: Start Date descending (newest first)

### 3. Filtering

**Status Filter (Multi-select):**

- Checkboxes for ACTIVE, COMPLETED, DEFAULTED, PENDING
- "All" option to clear filters
- Filter badge showing active filters

**Search:**

- Search by borrower name or email
- Debounced input (300ms)
- Clear button when search is active

### 4. Pagination

- Items per page selector (10, 25, 50, 100)
- Page navigation (First, Previous, Next, Last)
- Page number display (e.g., "1 of 5")
- Total count display (e.g., "Showing 1-10 of 42")

### 5. Responsive Design

**Desktop (>1024px):**

- All columns visible
- Hover states on rows
- Sticky header

**Tablet (768-1024px):**

- Hide email column
- Compact action menu

**Mobile (<768px):**

- Card-based layout instead of table
- Stack loan information vertically
- Simplified sorting (dropdown)

## Component Structure

```
components/
└── loans/
    ├── loan-table.tsx           # Main table component
    ├── loan-table-header.tsx    # Sortable column headers
    ├── loan-table-row.tsx       # Individual loan row
    ├── loan-table-filters.tsx   # Status filter + search
    ├── loan-table-pagination.tsx # Pagination controls
    └── loan-card.tsx            # Mobile card view
```

## Props Interface

```typescript
interface LoanTableProps {
  initialLoans?: LoanWithRelations[]
  isLoading?: boolean
  searchParams?: {
    page?: number
    perPage?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    status?: LoanStatus[]
    search?: string
  }
}

// Use Prisma type with payment relations
type LoanWithRelations = Prisma.LoanGetPayload<{
  include: { payments: true }
}>
```

## State Management

Use React state for client-side features:

- Current page
- Items per page
- Sort column and direction
- Active filters
- Search query

Consider using URL search params for shareable state (future enhancement).

## Data Fetching

Two approaches:

**Option 1: Server Component (Recommended)**

- Fetch loans in page component
- Pass as props to LoanTable
- Re-fetch on filter/sort changes

**Option 2: Client Component with SWR**

- Use SWR or React Query for client-side fetching
- Automatic revalidation
- Optimistic updates

We'll start with Option 1 for simplicity.

## Implementation Plan

### Step 1: Basic Table Structure

1. Create loan-table.tsx with shadcn/ui Table
2. Display all columns
3. Map loan data to rows
4. Add loading and empty states

### Step 2: Sorting

1. Create loan-table-header.tsx with sort indicators
2. Implement sort logic
3. Update table on sort change

### Step 3: Filtering

1. Create loan-table-filters.tsx
2. Status filter with checkboxes
3. Search input with debounce
4. Apply filters to table data

### Step 4: Pagination

1. Create loan-table-pagination.tsx
2. Calculate total pages
3. Slice data based on current page
4. Navigation controls

### Step 5: Mobile Responsiveness

1. Create loan-card.tsx for mobile
2. Toggle between table and card view
3. Responsive filter UI

### Step 6: Polish

1. Row click navigation to detail page
2. Action menu (Edit, Delete)
3. Accessibility improvements
4. Performance optimizations

## Example Usage

```tsx
// app/loans/page.tsx
import { getAllLoans } from '@/lib/actions/loan.actions'
import { LoanTable } from '@/components/loans/loan-table'

export default async function LoansPage() {
  const loans = await getAllLoans()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Loans</h1>
        <Button asChild>
          <Link href="/loans/new">Create Loan</Link>
        </Button>
      </div>
      <LoanTable initialLoans={loans} />
    </div>
  )
}
```

## Design Considerations

### Performance

- Virtualization for large datasets (future)
- Memoize filter/sort functions
- Debounce search input

### Accessibility

- Keyboard navigation
- ARIA labels for sort indicators
- Screen reader announcements for filters
- Focus management

### UX

- Clear visual feedback for active filters
- Smooth transitions
- Helpful empty states
- Error handling

## Testing Requirements

- [ ] Table renders with loan data
- [ ] Sorting works for all sortable columns
- [ ] Filters update table correctly
- [ ] Pagination navigates pages
- [ ] Search filters by borrower name
- [ ] Mobile card view displays
- [ ] Row click navigates to detail
- [ ] Build passes
- [ ] No TypeScript errors

## Future Enhancements (Out of Scope)

- **Bulk actions** - Select multiple loans for batch operations
- **Column customization** - Show/hide columns
- **Export to CSV** - Download loan data
- **Advanced filters** - Date ranges, amount ranges
- **Saved filter presets** - Quick access to common filters
- **Virtual scrolling** - For thousands of loans
- **Column resizing** - Adjustable column widths

## References

- shadcn/ui Table: https://ui.shadcn.com/docs/components/table
- TanStack Table: https://tanstack.com/table/latest (for advanced features)
- React Server Components: https://nextjs.org/docs/app/building-your-application/rendering/server-components
