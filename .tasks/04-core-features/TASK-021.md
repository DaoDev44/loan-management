# [TASK-021] Build Loan Detail Page

**Status:** COMPLETED
**Phase:** Core Features
**Priority:** P0 (High)
**Estimated Effort:** L (8-10 hours)
**Branch:** `task/021-loan-detail`

## Dependencies
- TASK-009 (Loan CRUD Server Actions completed)
- TASK-010 (Payment Server Actions completed)
- TASK-015 (LoanTable completed)
- TASK-016 (Loading/error boundaries completed)
- TASK-017 (Dark theme completed)

## Description
Build a comprehensive loan detail page that displays all loan information, payment history, and provides actions for editing and managing the loan. This page serves as the central hub for loan management and is accessed when clicking on a loan from the table.

## Acceptance Criteria
- [x] Individual loan page at `/loans/[id]`
- [x] Loan information display (borrower, terms, amounts)
- [x] Payment history table with pagination
- [x] Action buttons (Edit, Add Payment, Delete)
- [x] Back navigation to loans list
- [x] Loading and error states
- [x] Responsive design
- [x] Build passes without errors
- [x] Proper TypeScript typing

## Page Structure

### Route
- **URL:** `/loans/[id]`
- **File:** `app/loans/[id]/page.tsx`
- **Type:** Server Component (for initial data loading)

### Layout
```
┌─────────────────────────────────────────┐
│ Header: "Loan Details" + Breadcrumbs    │
├─────────────────────────────────────────┤
│ Loan Overview Card                      │
│ - Borrower Info                         │
│ - Loan Terms                            │
│ - Current Status                        │
├─────────────────────────────────────────┤
│ Action Buttons                          │
│ [Edit] [Add Payment] [Delete]           │
├─────────────────────────────────────────┤
│ Payment History Card                    │
│ - Payments table                        │
│ - Pagination                            │
└─────────────────────────────────────────┘
```

## Components to Build

### 1. Loan Detail Page (`app/loans/[id]/page.tsx`)

Server Component that fetches loan data and renders the detail view.

```tsx
interface LoanDetailPageProps {
  params: {
    id: string
  }
}

export default async function LoanDetailPage({ params }: LoanDetailPageProps) {
  const result = await getLoan(params.id)

  if (!result.success) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <LoanDetailHeader loan={result.data} />
      <LoanOverviewCard loan={result.data} />
      <LoanActions loan={result.data} />
      <PaymentHistoryCard payments={result.data.payments || []} />
    </div>
  )
}
```

### 2. Loan Detail Header (`components/loans/loan-detail-header.tsx`)

Displays page title and back navigation.

```tsx
interface LoanDetailHeaderProps {
  loan: SerializedLoan
}

export function LoanDetailHeader({ loan }: LoanDetailHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/loans">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Loans
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          Loan Details
        </h1>
        <p className="text-muted-foreground">
          Loan for {loan.borrowerName}
        </p>
      </div>
      <StatusBadge status={loan.status} size="lg" />
    </div>
  )
}
```

### 3. Loan Overview Card (`components/loans/loan-overview-card.tsx`)

Displays all loan information in a structured card layout.

```tsx
interface LoanOverviewCardProps {
  loan: SerializedLoan
}

export function LoanOverviewCard({ loan }: LoanOverviewCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Borrower Information */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-semibold mb-3">Borrower Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{loan.borrowerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{loan.borrowerEmail}</span>
              </div>
              {loan.borrowerPhone && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">{loan.borrowerPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Loan Terms */}
          <div>
            <h3 className="font-semibold mb-3">Loan Terms</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Principal:</span>
                <span className="font-medium">{formatCurrency(loan.principal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Interest Rate:</span>
                <span className="font-medium">{loan.interestRate.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Term:</span>
                <span className="font-medium">{loan.termMonths} months</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Frequency:</span>
                <span className="font-medium">{loan.paymentFrequency}</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Current Status */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="text-center">
            <div className="text-2xl font-bold">{formatCurrency(loan.balance)}</div>
            <div className="text-sm text-muted-foreground">Current Balance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {formatCurrency(loan.principal - loan.balance)}
            </div>
            <div className="text-sm text-muted-foreground">Amount Paid</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {Math.round(((loan.principal - loan.balance) / loan.principal) * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Paid Off</div>
          </div>
        </div>

        {/* Dates */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Start Date:</span>
            <span className="font-medium">{formatDate(loan.startDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">End Date:</span>
            <span className="font-medium">{formatDate(loan.endDate)}</span>
          </div>
        </div>

        {/* Notes and Collateral */}
        {(loan.notes || loan.collateral) && (
          <>
            <Separator />
            {loan.notes && (
              <div>
                <h3 className="font-semibold mb-2">Notes</h3>
                <p className="text-sm text-muted-foreground">{loan.notes}</p>
              </div>
            )}
            {loan.collateral && (
              <div>
                <h3 className="font-semibold mb-2">Collateral</h3>
                <p className="text-sm text-muted-foreground">{loan.collateral}</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
```

### 4. Loan Actions (`components/loans/loan-actions.tsx`)

Action buttons for loan management.

```tsx
'use client'

interface LoanActionsProps {
  loan: SerializedLoan
}

export function LoanActions({ loan }: LoanActionsProps) {
  const router = useRouter()

  const handleEdit = () => {
    router.push(`/loans/${loan.id}/edit`)
  }

  const handleAddPayment = () => {
    // Open add payment dialog (future implementation)
    toast.info("Add Payment feature coming soon!")
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this loan?')) {
      const result = await deleteLoan(loan.id)
      if (result.success) {
        toast.success('Loan deleted successfully')
        router.push('/loans')
      } else {
        toast.error('Failed to delete loan')
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleEdit} className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Loan
          </Button>

          <Button
            onClick={handleAddPayment}
            variant="outline"
            className="gap-2"
            disabled={loan.status !== 'ACTIVE'}
          >
            <Plus className="h-4 w-4" />
            Add Payment
          </Button>

          <Button
            onClick={handleDelete}
            variant="destructive"
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Loan
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

### 5. Payment History Card (`components/loans/payment-history-card.tsx`)

Displays payment history with pagination.

```tsx
interface PaymentHistoryCardProps {
  payments: SerializedPayment[]
}

export function PaymentHistoryCard({ payments }: PaymentHistoryCardProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return payments.slice(startIndex, startIndex + itemsPerPage)
  }, [payments, currentPage, itemsPerPage])

  const totalPages = Math.ceil(payments.length / itemsPerPage)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
        <CardDescription>
          {payments.length} payment{payments.length !== 1 ? 's' : ''} total
        </CardDescription>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <EmptyState
            title="No payments recorded"
            description="Payments will appear here once they are added to this loan."
          />
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {formatDate(payment.date)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {payment.notes || '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, payments.length)} of{' '}
                  {payments.length} payments
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

## Error Handling

### Not Found
If loan ID doesn't exist, use Next.js `notFound()` to show 404 page.

### Loading States
- Use existing `loading.tsx` file in `app/loans/[id]/`
- Suspense boundaries for payment history if needed

### Error Boundaries
- Use existing `error.tsx` file in `app/loans/[id]/`

## Responsive Design

- **Mobile:** Single column layout, stack cards vertically
- **Tablet:** Two-column grid for loan overview sections
- **Desktop:** Full layout with proper spacing

## Accessibility

- Semantic HTML structure
- Proper heading hierarchy (h1 → h2 → h3)
- ARIA labels for action buttons
- Keyboard navigation support
- Screen reader friendly tables

## Testing Requirements

### Manual Testing
- [ ] Navigate to loan detail from loans table
- [ ] Verify all loan information displays correctly
- [ ] Test all action buttons (Edit, Add Payment, Delete)
- [ ] Test back navigation
- [ ] Test with loans that have/don't have payments
- [ ] Test responsive design on mobile/tablet
- [ ] Test error states (invalid ID, network errors)

### Data Scenarios
1. **Active loan with payments** - Full data display
2. **Active loan with no payments** - Empty payment history
3. **Completed loan** - Read-only view
4. **Loan with no optional fields** - Handle missing data gracefully
5. **Invalid loan ID** - 404 page

## Future Enhancements (Out of Scope)

- **Edit loan inline** - Currently redirects to edit page
- **Add payment modal** - Currently shows toast
- **Payment receipt generation** - PDF download
- **Loan amortization schedule** - Payment timeline
- **Activity feed** - Audit trail of changes
- **Document attachments** - File uploads

## Files to Create

```
app/loans/[id]/
  ├── page.tsx                    # Main loan detail page
  ├── loading.tsx                 # Loading state (already exists)
  └── error.tsx                   # Error boundary (already exists)

components/loans/
  ├── loan-detail-header.tsx      # Header with back navigation
  ├── loan-overview-card.tsx      # Main loan information
  ├── loan-actions.tsx            # Action buttons
  └── payment-history-card.tsx    # Payment history table
```

## Implementation Notes

### Data Flow
1. Server Component fetches loan data via `getLoan(id)`
2. Render loan information in overview card
3. Client components handle actions (edit, delete)
4. Payment history uses client-side pagination

### Performance
- Server-side data fetching for initial load
- Client-side pagination for payments (no additional API calls)
- Minimal JavaScript for interactive elements

### Type Safety
- Reuse existing `SerializedLoan` and `SerializedPayment` types
- Proper TypeScript for all component props
- Validate loan ID parameter

## References
- Next.js Dynamic Routes: https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes
- Server Components: https://nextjs.org/docs/app/building-your-application/rendering/server-components
- Not Found: https://nextjs.org/docs/app/api-reference/functions/not-found