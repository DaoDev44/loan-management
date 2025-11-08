# [TASK-008] Build Zod Validation Schemas

**Status:** NOT_STARTED
**Phase:** Database & API Layer
**Priority:** P0 (Critical)
**Estimated Effort:** S (2-3 hours)
**Branch:** `task/008-zod-schemas`

## Dependencies
- TASK-006 (Prisma schema designed)

## Description
Create type-safe validation schemas using Zod for all data inputs (forms, API requests). These schemas ensure data validity before it reaches the database and provide excellent TypeScript integration with React Hook Form.

## Acceptance Criteria
- [ ] Zod schemas created for all data models (Loan, Payment)
- [ ] Validation rules match business requirements
- [ ] Schemas export TypeScript types
- [ ] Integration with React Hook Form demonstrated
- [ ] Reusable validation utilities created
- [ ] All enum validations included
- [ ] Error messages are user-friendly
- [ ] Schemas tested with valid and invalid data

## Implementation Approach

### Why Zod?

**Chosen:** Zod over other validation libraries

**Pros:**
- ✅ TypeScript-first with excellent type inference
- ✅ Zero dependencies
- ✅ Perfect integration with React Hook Form
- ✅ Runtime validation + compile-time types
- ✅ Composable and reusable schemas
- ✅ Great error messages out of the box

**Alternatives:**
- Yup: More established, but weaker TypeScript support
- Joi: More features, but heavier and not TypeScript-first
- Class Validator: Requires decorators, less flexible

### Schema Structure

```
lib/
└── validations/
    ├── index.ts           # Export all schemas
    ├── loan.schema.ts     # Loan validation schemas
    ├── payment.schema.ts  # Payment validation schemas
    └── common.schema.ts   # Shared validation utilities
```

## Implementation

### 1. Common Validation Utilities

**lib/validations/common.schema.ts**

```typescript
import { z } from 'zod'

// Reusable field validators
export const currency = z
  .number()
  .positive('Amount must be positive')
  .multipleOf(0.01, 'Amount must have at most 2 decimal places')

export const percentage = z
  .number()
  .min(0, 'Interest rate cannot be negative')
  .max(100, 'Interest rate cannot exceed 100%')

export const email = z
  .string()
  .email('Invalid email address')
  .min(1, 'Email is required')

export const phone = z
  .string()
  .regex(
    /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
    'Invalid phone number format'
  )
  .optional()
  .or(z.literal(''))

export const futureDate = z.date().min(new Date(), 'Date must be in the future')

export const positiveInteger = z
  .number()
  .int('Must be a whole number')
  .positive('Must be greater than zero')

// ID validation (cuid format)
export const cuid = z.string().cuid('Invalid ID format')
```

### 2. Loan Validation Schemas

**lib/validations/loan.schema.ts**

```typescript
import { z } from 'zod'
import { currency, email, percentage, phone, positiveInteger } from './common.schema'

// Enums matching Prisma schema
export const LoanStatusSchema = z.enum(['ACTIVE', 'COMPLETED', 'OVERDUE', 'DEFAULTED'])

export const InterestCalculationTypeSchema = z.enum([
  'SIMPLE',
  'AMORTIZED',
  'INTEREST_ONLY',
])

export const PaymentFrequencySchema = z.enum(['MONTHLY', 'BI_WEEKLY'])

// Base loan schema with all fields
export const LoanSchema = z.object({
  id: z.string().cuid(),
  borrowerName: z.string().min(1, 'Borrower name is required').max(255),
  borrowerEmail: email,
  borrowerPhone: phone,
  principal: currency,
  interestRate: percentage,
  startDate: z.date(),
  endDate: z.date(),
  termMonths: positiveInteger,
  interestCalculationType: InterestCalculationTypeSchema,
  paymentFrequency: PaymentFrequencySchema,
  status: LoanStatusSchema,
  balance: currency,
  notes: z.string().max(10000).optional().or(z.literal('')),
  collateral: z.string().max(10000).optional().or(z.literal('')),
  deletedAt: z.date().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Create loan schema (for forms)
export const CreateLoanSchema = z
  .object({
    borrowerName: z.string().min(1, 'Borrower name is required').max(255),
    borrowerEmail: email,
    borrowerPhone: phone,
    principal: currency,
    interestRate: percentage,
    startDate: z.date(),
    endDate: z.date(),
    termMonths: positiveInteger,
    interestCalculationType: InterestCalculationTypeSchema.default('SIMPLE'),
    paymentFrequency: PaymentFrequencySchema.default('MONTHLY'),
    notes: z.string().max(10000).optional().or(z.literal('')),
    collateral: z.string().max(10000).optional().or(z.literal('')),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
  })
  .refine(
    (data) => {
      // Calculate expected months between dates
      const monthsDiff =
        (data.endDate.getFullYear() - data.startDate.getFullYear()) * 12 +
        (data.endDate.getMonth() - data.startDate.getMonth())

      // Allow some flexibility (within 1 month)
      return Math.abs(monthsDiff - data.termMonths) <= 1
    },
    {
      message: 'Term months should match the date range',
      path: ['termMonths'],
    }
  )

// Update loan schema (partial, allows updating specific fields)
export const UpdateLoanSchema = CreateLoanSchema.partial().extend({
  id: z.string().cuid(),
  status: LoanStatusSchema.optional(),
  balance: currency.optional(),
})

// Loan filter/search schema
export const LoanFilterSchema = z.object({
  status: LoanStatusSchema.optional(),
  interestCalculationType: InterestCalculationTypeSchema.optional(),
  paymentFrequency: PaymentFrequencySchema.optional(),
  borrowerEmail: z.string().optional(),
  minPrincipal: currency.optional(),
  maxPrincipal: currency.optional(),
  minBalance: currency.optional(),
  maxBalance: currency.optional(),
  startDateFrom: z.date().optional(),
  startDateTo: z.date().optional(),
})

// TypeScript types derived from schemas
export type Loan = z.infer<typeof LoanSchema>
export type CreateLoanInput = z.infer<typeof CreateLoanSchema>
export type UpdateLoanInput = z.infer<typeof UpdateLoanSchema>
export type LoanFilter = z.infer<typeof LoanFilterSchema>
export type LoanStatus = z.infer<typeof LoanStatusSchema>
export type InterestCalculationType = z.infer<typeof InterestCalculationTypeSchema>
export type PaymentFrequency = z.infer<typeof PaymentFrequencySchema>
```

### 3. Payment Validation Schemas

**lib/validations/payment.schema.ts**

```typescript
import { z } from 'zod'
import { currency, cuid } from './common.schema'

// Base payment schema
export const PaymentSchema = z.object({
  id: cuid,
  amount: currency,
  date: z.date(),
  notes: z.string().max(1000).optional().or(z.literal('')),
  deletedAt: z.date().nullable().optional(),
  loanId: cuid,
  createdAt: z.date(),
})

// Create payment schema (for forms)
export const CreatePaymentSchema = z.object({
  loanId: cuid,
  amount: currency,
  date: z.date().default(() => new Date()),
  notes: z.string().max(1000).optional().or(z.literal('')),
})

// Update payment schema
export const UpdatePaymentSchema = z.object({
  id: cuid,
  amount: currency.optional(),
  date: z.date().optional(),
  notes: z.string().max(1000).optional().or(z.literal('')),
})

// Payment filter schema
export const PaymentFilterSchema = z.object({
  loanId: cuid.optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  minAmount: currency.optional(),
  maxAmount: currency.optional(),
})

// TypeScript types
export type Payment = z.infer<typeof PaymentSchema>
export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>
export type UpdatePaymentInput = z.infer<typeof UpdatePaymentSchema>
export type PaymentFilter = z.infer<typeof PaymentFilterSchema>
```

### 4. Main Export File

**lib/validations/index.ts**

```typescript
// Export all schemas and types
export * from './common.schema'
export * from './loan.schema'
export * from './payment.schema'

// Re-export zod for convenience
export { z } from 'zod'
```

## Integration with React Hook Form

### Example Usage in Forms

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateLoanSchema, type CreateLoanInput } from '@/lib/validations'

function CreateLoanForm() {
  const form = useForm<CreateLoanInput>({
    resolver: zodResolver(CreateLoanSchema),
    defaultValues: {
      borrowerName: '',
      borrowerEmail: '',
      borrowerPhone: '',
      principal: 0,
      interestRate: 5.0,
      startDate: new Date(),
      endDate: new Date(),
      termMonths: 12,
      interestCalculationType: 'SIMPLE',
      paymentFrequency: 'MONTHLY',
      notes: '',
      collateral: '',
    },
  })

  const onSubmit = async (data: CreateLoanInput) => {
    // Data is fully validated and type-safe!
    console.log(data)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  )
}
```

### Example Usage in Server Actions

```typescript
import { CreateLoanSchema } from '@/lib/validations'

export async function createLoan(formData: FormData) {
  'use server'

  // Parse and validate
  const result = CreateLoanSchema.safeParse({
    borrowerName: formData.get('borrowerName'),
    borrowerEmail: formData.get('borrowerEmail'),
    // ... other fields
  })

  if (!result.success) {
    return {
      error: 'Validation failed',
      issues: result.error.issues
    }
  }

  // result.data is fully validated and type-safe
  const loan = await prisma.loan.create({
    data: {
      ...result.data,
      balance: result.data.principal, // Initial balance = principal
      status: 'ACTIVE',
    },
  })

  return { success: true, loan }
}
```

## Testing Requirements

Create test cases for:

```typescript
// Example test structure (will implement in TASK-030+)
describe('CreateLoanSchema', () => {
  it('should validate a valid loan', () => {
    const validLoan = {
      borrowerName: 'John Doe',
      borrowerEmail: 'john@example.com',
      borrowerPhone: '+1-555-1234',
      principal: 10000,
      interestRate: 5.5,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-01-01'),
      termMonths: 12,
      interestCalculationType: 'SIMPLE' as const,
      paymentFrequency: 'MONTHLY' as const,
    }

    const result = CreateLoanSchema.safeParse(validLoan)
    expect(result.success).toBe(true)
  })

  it('should reject negative principal', () => {
    const invalidLoan = { /* ... */ principal: -1000 }
    const result = CreateLoanSchema.safeParse(invalidLoan)
    expect(result.success).toBe(false)
    expect(result.error.issues[0].path).toContain('principal')
  })

  // ... more tests
})
```

## Error Handling Strategy

### Custom Error Messages

```typescript
// Example of customizing error messages
export const CreateLoanSchema = z.object({
  principal: z
    .number({
      required_error: 'Loan amount is required',
      invalid_type_error: 'Loan amount must be a number',
    })
    .positive('Loan amount must be greater than zero')
    .multipleOf(0.01, 'Loan amount can have at most 2 decimal places')
    .max(10000000, 'Loan amount cannot exceed $10,000,000'),
})
```

### Form Error Display

```typescript
// In form components
{form.formState.errors.principal && (
  <p className="text-sm text-red-600">
    {form.formState.errors.principal.message}
  </p>
)}
```

## Design Decisions

### 1. Decimal Handling

**Decision:** Use `number` type in Zod, convert to Prisma Decimal in Server Actions

**Why:**
- Forms work with JavaScript numbers
- Prisma handles Decimal conversion
- Simpler type handling in frontend

**Alternative:** Use string for precise decimal handling
- More complex
- Requires custom parsing

### 2. Date Handling

**Decision:** Use `Date` objects in Zod schemas

**Why:**
- React Hook Form works with Date objects
- Simpler than string dates
- Type-safe

**Note:** Forms may need to convert from input strings to Date objects

### 3. Optional vs. Nullable

**Decision:** Use `.optional()` for form fields, `.nullable()` for database fields

**Why:**
- Forms: Fields may be undefined (not filled)
- Database: Fields may be explicitly null (deletedAt)

### 4. Enum Validation

**Decision:** Use Zod enums that match Prisma enums exactly

**Why:**
- Type safety between database and forms
- Single source of truth
- Compile-time errors if mismatch

## File Organization

```
lib/validations/
├── index.ts              # Main export
├── common.schema.ts      # Shared validators (75 lines)
├── loan.schema.ts        # Loan schemas (150 lines)
└── payment.schema.ts     # Payment schemas (75 lines)
```

**Total:** ~300 lines of validation code

## Next Steps

After schemas are created:
- TASK-009: Use these schemas in Loan CRUD Server Actions
- TASK-010: Use these schemas in Payment Server Actions
- TASK-023: Use these schemas in Create Loan form

## References
- [Zod Documentation](https://zod.dev/)
- [React Hook Form + Zod](https://react-hook-form.com/get-started#SchemaValidation)
- [Prisma Schema](../../../prisma/schema.prisma)
