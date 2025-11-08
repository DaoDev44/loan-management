# [TASK-010] Implement Payment Server Actions

**Status:** COMPLETED
**Phase:** Database & API Layer
**Priority:** P0 (Critical)
**Estimated Effort:** M (4-6 hours)
**Branch:** `task/010-payment-crud`

## Dependencies
- TASK-009 (Loan CRUD Server Actions completed)
- TASK-008 (Zod validation schemas created)
- TASK-006 (Prisma schema designed)

## Description
Implement Server Actions for all Payment CRUD operations. These actions will handle payment data validation, database operations, and error handling. Following the same patterns established in TASK-009, these actions will provide a clean API layer for payment management without complex business logic (balance updates will be handled in future tasks).

## Acceptance Criteria
- [x] `createPayment()` - Create new payment with validation
- [x] `getPayment()` - Retrieve single payment by ID
- [x] `getPayments()` - Retrieve payments with filtering (by loan, date range, etc.)
- [x] `getPaymentsByLoan()` - Retrieve all payments for a specific loan
- [x] `updatePayment()` - Update existing payment with partial data
- [x] `deletePayment()` - Soft delete payment (set deletedAt)
- [x] All actions validate inputs using Zod schemas
- [x] All actions handle errors gracefully with typed responses
- [x] All actions use Prisma for database operations
- [x] Soft delete preserves data integrity
- [x] Proper relationship handling (payments linked to loans)

## Implementation Approach

### File Structure

```
app/
└── actions/
    ├── loan.actions.ts     # Existing
    ├── payment.actions.ts  # New - Payment CRUD operations
    └── types.ts           # Shared action response types
```

### Action Signatures

```typescript
// Create new payment
createPayment(input: CreatePaymentInput): Promise<ActionResponse<Payment>>

// Get single payment
getPayment(id: string): Promise<ActionResponse<Payment>>

// Get payments with optional filtering
getPayments(filter?: PaymentFilter): Promise<ActionResponse<Payment[]>>

// Get all payments for a specific loan
getPaymentsByLoan(loanId: string): Promise<ActionResponse<Payment[]>>

// Update payment
updatePayment(input: UpdatePaymentInput): Promise<ActionResponse<Payment>>

// Soft delete payment
deletePayment(id: string): Promise<ActionResponse<void>>
```

### Data Flow

1. **Input Validation** → Zod schema validation
2. **Database Operation** → Prisma query with error handling
3. **Response Formatting** → Consistent ActionResponse format
4. **Revalidation** → Update relevant Next.js cache paths

### Key Implementation Details

#### 1. CreatePayment
- Validate input with `CreatePaymentSchema`
- Ensure loan exists and is not deleted
- Create payment with proper Decimal conversion
- Revalidate loan detail and dashboard pages

#### 2. GetPayments/GetPaymentsByLoan
- Support filtering by loan ID, date range, amount range
- Order by date descending (newest first)
- Include loan relationship data when needed
- Exclude soft-deleted payments

#### 3. UpdatePayment
- Partial update validation with `UpdatePaymentSchema`
- Preserve existing values for undefined fields
- Handle Decimal conversions properly
- Revalidate affected pages

#### 4. DeletePayment
- Soft delete (set deletedAt timestamp)
- Ensure payment exists before deletion
- Revalidate affected pages

### Error Handling

Following same patterns as loan.actions.ts:
- Zod validation errors → `errorResponse('Validation failed', error.issues)`
- Prisma errors → Specific error codes (P2025 = not found)
- Generic errors → `errorResponse('Failed to [operation]')`

### Testing Strategy

- Unit tests for input validation
- Integration tests with test database
- Error case testing (invalid IDs, deleted loans, etc.)
- Revalidation testing (mock Next.js cache)

## Step-by-Step Implementation

### 1. Set up action file structure
```bash
# Create payment actions file
touch app/actions/payment.actions.ts
```

### 2. Implement basic action framework
- Import required dependencies
- Set up action response types
- Implement error handling patterns

### 3. Implement CRUD operations (order)
1. `getPayment()` - Simplest read operation
2. `getPayments()` - Read with filtering
3. `getPaymentsByLoan()` - Read by relationship
4. `createPayment()` - Write operation
5. `updatePayment()` - Update operation
6. `deletePayment()` - Delete operation

### 4. Add comprehensive error handling
- Input validation errors
- Database constraint errors
- Not found errors
- Generic error fallbacks

### 5. Implement revalidation
- Identify pages that display payment data
- Add appropriate `revalidatePath()` calls
- Handle revalidation errors gracefully

### 6. Testing and validation
- Test all CRUD operations
- Test error scenarios
- Test with existing seed data
- Verify TypeScript types

## Testing Requirements

- [x] All actions work with valid input
- [x] All actions handle invalid input gracefully
- [x] Payment creation links to existing loans correctly
- [x] Payment updates preserve data integrity
- [x] Soft delete doesn't affect related data
- [x] Filtering works correctly (date range, loan ID, amount)
- [x] TypeScript compilation passes
- [x] Integration tests pass with test database

## Database Considerations

### Relationships
- Payments belong to loans (foreign key relationship)
- Cascade delete from loan should delete payments
- Soft delete payments don't affect loan data

### Data Types
- Use Prisma.Decimal for monetary amounts
- Handle Date objects for payment dates
- Preserve CUID format for IDs

### Indexes
- Payment queries will filter by loanId (indexed)
- Payment queries will sort by date (indexed)
- Consider compound index on (loanId, date) for performance

## Security Considerations

### Input Validation
- All inputs validated with Zod schemas
- CUID format validation for IDs
- Date validation (reasonable ranges)
- Amount validation (positive numbers only)

### Data Access
- No user authentication in MVP (future enhancement)
- All payments accessible to all users currently
- Soft delete preserves audit trail

### Business Logic
- Payment amounts must be positive
- Payment dates must be valid dates
- Loan must exist to create payment
- No automatic balance updates (future task)

## Revalidation Strategy

Pages that need revalidation when payments change:
- `/dashboard` - Metrics may include payment data
- `/loans` - Loan list may show recent payment info
- `/loans/[id]` - Loan detail shows payment history
- Future payment-specific pages

## Future Enhancements (Out of Scope)

- Automatic loan balance updates
- Payment validation against loan balance
- Loan status updates based on payments
- Payment processing/payment methods
- Recurring payment schedules
- Payment reminders and notifications

## Documentation

- Update README with payment action usage
- Document action signatures in TypeScript
- Include examples in API documentation
- Update database schema documentation

## References
- TASK-009: Loan CRUD implementation (pattern reference)
- TASK-008: Zod validation schemas
- TASK-006: Database schema design
- Next.js Server Actions: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
- Prisma Relations: https://www.prisma.io/docs/concepts/components/prisma-schema/relations