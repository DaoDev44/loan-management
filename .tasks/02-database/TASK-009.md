# [TASK-009] Implement Loan CRUD Server Actions

**Status:** COMPLETED
**Phase:** Database & API Layer
**Priority:** P0 (Critical)
**Estimated Effort:** L (6-8 hours)
**Branch:** `task/009-loan-crud`

## Dependencies
- TASK-008 (Zod validation schemas created)
- TASK-006 (Prisma schema designed)

## Description
Implement Server Actions for all Loan CRUD operations. These actions will handle data validation, database operations, and error handling. Server Actions in Next.js 14 run on the server and can be called directly from Client Components, providing a seamless API layer without separate endpoints.

## Acceptance Criteria
- [ ] `createLoan()` - Create new loan with validation
- [ ] `getLoan()` - Retrieve single loan by ID
- [ ] `getLoans()` - Retrieve all loans with filtering/sorting
- [ ] `updateLoan()` - Update existing loan with partial data
- [ ] `deleteLoan()` - Soft delete loan (set deletedAt)
- [ ] All actions validate inputs using Zod schemas
- [ ] All actions handle errors gracefully with typed responses
- [ ] All actions use Prisma for database operations
- [ ] Balance calculation handled correctly on create
- [ ] Soft delete preserves data integrity

## Implementation Approach

### Why Server Actions?

**Chosen:** Next.js Server Actions over API Routes

**Pros:**
- ✅ Type-safe client-server communication
- ✅ No separate API layer needed
- ✅ Built-in form integration
- ✅ Automatic serialization
- ✅ Progressive enhancement support
- ✅ Simpler error handling

**Alternatives:**
- API Routes: More familiar, but requires separate typing
- tRPC: Excellent DX, but additional dependency
- GraphQL: Overkill for this use case

### File Structure

```
app/
└── actions/
    ├── loan.actions.ts      # Loan CRUD operations
    └── types.ts             # Shared action response types
```

## Implementation

### 1. Shared Action Types

**app/actions/types.ts**

```typescript
// Standard response format for all Server Actions
export type ActionResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; issues?: Array<{ path: string[]; message: string }> }

// Helper to create successful response
export function successResponse<T>(data: T): ActionResponse<T> {
  return { success: true, data }
}

// Helper to create error response
export function errorResponse(error: string, issues?: any[]): ActionResponse<never> {
  return { success: false, error, issues }
}
```

### 2. Loan CRUD Server Actions

**app/actions/loan.actions.ts**

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import {
  CreateLoanSchema,
  UpdateLoanSchema,
  LoanFilterSchema,
  type CreateLoanInput,
  type UpdateLoanInput,
  type LoanFilter,
  type Loan,
} from '@/lib/validations'
import { type ActionResponse, successResponse, errorResponse } from './types'
import { Prisma } from '@prisma/client'

/**
 * Create a new loan
 * @param input - Loan creation data (validated against CreateLoanSchema)
 * @returns Created loan or error
 */
export async function createLoan(
  input: CreateLoanInput
): Promise<ActionResponse<Loan>> {
  try {
    // Validate input
    const validated = CreateLoanSchema.parse(input)

    // Create loan with initial balance = principal
    const loan = await prisma.loan.create({
      data: {
        ...validated,
        balance: validated.principal, // Initial balance equals principal
        status: 'ACTIVE',
        principal: new Prisma.Decimal(validated.principal),
        interestRate: new Prisma.Decimal(validated.interestRate),
        balance: new Prisma.Decimal(validated.principal),
      },
    })

    // Revalidate pages that display loans
    revalidatePath('/dashboard')
    revalidatePath('/loans')

    return successResponse(loan as unknown as Loan)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse('Validation failed', error.issues)
    }
    console.error('Error creating loan:', error)
    return errorResponse('Failed to create loan')
  }
}

/**
 * Get a single loan by ID
 * @param id - Loan ID (CUID)
 * @returns Loan or error
 */
export async function getLoan(id: string): Promise<ActionResponse<Loan>> {
  try {
    const loan = await prisma.loan.findUnique({
      where: { id, deletedAt: null },
      include: {
        payments: {
          where: { deletedAt: null },
          orderBy: { date: 'desc' },
        },
      },
    })

    if (!loan) {
      return errorResponse('Loan not found')
    }

    return successResponse(loan as unknown as Loan)
  } catch (error) {
    console.error('Error fetching loan:', error)
    return errorResponse('Failed to fetch loan')
  }
}

/**
 * Get all loans with optional filtering and sorting
 * @param filter - Optional filter criteria
 * @returns Array of loans or error
 */
export async function getLoans(
  filter?: LoanFilter
): Promise<ActionResponse<Loan[]>> {
  try {
    const where: Prisma.LoanWhereInput = {
      deletedAt: null,
    }

    // Apply filters if provided
    if (filter) {
      const validated = LoanFilterSchema.parse(filter)

      if (validated.status) where.status = validated.status
      if (validated.interestCalculationType)
        where.interestCalculationType = validated.interestCalculationType
      if (validated.paymentFrequency)
        where.paymentFrequency = validated.paymentFrequency
      if (validated.borrowerEmail)
        where.borrowerEmail = { contains: validated.borrowerEmail, mode: 'insensitive' }
      if (validated.borrowerName)
        where.borrowerName = { contains: validated.borrowerName, mode: 'insensitive' }
      if (validated.minPrincipal)
        where.principal = { gte: new Prisma.Decimal(validated.minPrincipal) }
      if (validated.maxPrincipal)
        where.principal = { ...where.principal, lte: new Prisma.Decimal(validated.maxPrincipal) }
      if (validated.minBalance)
        where.balance = { gte: new Prisma.Decimal(validated.minBalance) }
      if (validated.maxBalance)
        where.balance = { ...where.balance, lte: new Prisma.Decimal(validated.maxBalance) }
      if (validated.startDateFrom)
        where.startDate = { gte: validated.startDateFrom }
      if (validated.startDateTo)
        where.startDate = { ...where.startDate, lte: validated.startDateTo }
    }

    const loans = await prisma.loan.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        payments: {
          where: { deletedAt: null },
          orderBy: { date: 'desc' },
          take: 5, // Only include latest 5 payments
        },
      },
    })

    return successResponse(loans as unknown as Loan[])
  } catch (error) {
    console.error('Error fetching loans:', error)
    return errorResponse('Failed to fetch loans')
  }
}

/**
 * Update an existing loan
 * @param input - Partial loan data with ID
 * @returns Updated loan or error
 */
export async function updateLoan(
  input: UpdateLoanInput
): Promise<ActionResponse<Loan>> {
  try {
    // Validate input
    const validated = UpdateLoanSchema.parse(input)
    const { id, ...updateData } = validated

    // Convert numbers to Decimals for Prisma
    const prismaData: any = { ...updateData }
    if (updateData.principal !== undefined) {
      prismaData.principal = new Prisma.Decimal(updateData.principal)
    }
    if (updateData.interestRate !== undefined) {
      prismaData.interestRate = new Prisma.Decimal(updateData.interestRate)
    }
    if (updateData.balance !== undefined) {
      prismaData.balance = new Prisma.Decimal(updateData.balance)
    }

    // Update loan
    const loan = await prisma.loan.update({
      where: { id, deletedAt: null },
      data: prismaData,
    })

    // Revalidate pages
    revalidatePath('/dashboard')
    revalidatePath('/loans')
    revalidatePath(`/loans/${id}`)

    return successResponse(loan as unknown as Loan)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse('Validation failed', error.issues)
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return errorResponse('Loan not found')
      }
    }
    console.error('Error updating loan:', error)
    return errorResponse('Failed to update loan')
  }
}

/**
 * Soft delete a loan (sets deletedAt timestamp)
 * @param id - Loan ID to delete
 * @returns Success status or error
 */
export async function deleteLoan(id: string): Promise<ActionResponse<void>> {
  try {
    await prisma.loan.update({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    })

    // Revalidate pages
    revalidatePath('/dashboard')
    revalidatePath('/loans')

    return successResponse(undefined)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return errorResponse('Loan not found')
      }
    }
    console.error('Error deleting loan:', error)
    return errorResponse('Failed to delete loan')
  }
}
```

### 3. Prisma Client Singleton

**lib/prisma.ts**

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## Design Decisions

### 1. Soft Delete vs Hard Delete

**Decision:** Use soft delete (set `deletedAt` timestamp)

**Why:**
- Data preservation for audit trails
- Allows "undo" functionality
- Maintains referential integrity with payments
- Compliance requirements (loan history)

**Alternative:** Hard delete
- Simpler, but loses data permanently
- Breaks payment history

### 2. Initial Balance Calculation

**Decision:** Set `balance = principal` on loan creation

**Why:**
- Simplifies loan creation
- Balance decreases as payments are recorded
- Easy to track remaining amount

### 3. Decimal Handling

**Decision:** Convert numbers to Prisma Decimals in Server Actions

**Why:**
- Forms work with JavaScript numbers
- Database requires Decimal for precision
- Conversion happens at API boundary

### 4. Error Response Format

**Decision:** Standardized `ActionResponse<T>` type

**Why:**
- Consistent error handling across all actions
- Type-safe error checking in UI
- Zod validation errors passed to forms

### 5. Path Revalidation

**Decision:** Revalidate specific paths after mutations

**Why:**
- Updates UI without full page reload
- Better UX with Next.js App Router
- Automatic cache invalidation

## Testing Requirements

Tests will be implemented in **TASK-009A** after testing infrastructure (TASK-030):

```typescript
// Example test structure
describe('Loan Server Actions', () => {
  describe('createLoan', () => {
    it('should create a loan with valid data', async () => {
      const result = await createLoan({
        borrowerName: 'John Doe',
        borrowerEmail: 'john@example.com',
        principal: 10000,
        interestRate: 5.5,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-01-01'),
        termMonths: 12,
      })

      expect(result.success).toBe(true)
      expect(result.data.balance).toBe(10000)
    })

    it('should reject invalid data', async () => {
      const result = await createLoan({ principal: -1000 })
      expect(result.success).toBe(false)
    })
  })

  // ... more tests
})
```

## Usage Example

```typescript
// In a Client Component
'use client'

import { createLoan } from '@/app/actions/loan.actions'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateLoanSchema } from '@/lib/validations'

export function CreateLoanForm() {
  const form = useForm({
    resolver: zodResolver(CreateLoanSchema),
  })

  const onSubmit = async (data) => {
    const result = await createLoan(data)

    if (result.success) {
      toast.success('Loan created!')
    } else {
      toast.error(result.error)
    }
  }

  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>
}
```

## Next Steps

After completion:
- TASK-030: Set up testing infrastructure (Vitest)
- TASK-009A: Write integration tests for Loan Server Actions
- TASK-010: Implement Payment Server Actions
- TASK-023: Build Create Loan form using these actions

## References
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Prisma Client](https://www.prisma.io/docs/concepts/components/prisma-client)
- [Zod Validation](https://zod.dev/)
