# [TASK-006] Design Complete Prisma Schema with Flexible Interest Calculations

**Status:** NOT_STARTED
**Phase:** Database
**Priority:** P0 (Critical)
**Estimated Effort:** M (5-8 hours)
**Branch:** `task/006-prisma-schema`

## Dependencies
- TASK-003 (Prisma ORM set up)

## Description
Design and implement the complete database schema supporting loans, payments, and flexible interest calculation methods. This is the foundation of the entire application's data model and must support current requirements plus future extensibility (especially for auth).

## Acceptance Criteria
- [ ] Complete Prisma schema defined
- [ ] Loan model with all required fields
- [ ] Payment model with loan relationship
- [ ] Interest calculation type enum defined
- [ ] Payment frequency enum defined
- [ ] Loan status enum defined
- [ ] Proper indexes for performance
- [ ] Nullable fields for future auth support
- [ ] Schema validated and compiles
- [ ] Initial migration created and applied
- [ ] TypeScript types generated correctly
- [ ] Sample queries work as expected

## Implementation Approach

### Data Model Design

Based on PRD requirements plus flexible interest calculation support:

**Core Entities:**
1. **Loan** - Primary entity tracking loan details
2. **Payment** - Individual payment records linked to loans
3. **Borrower** - Separate entity or embedded? (Discussion point)

**Key Design Decisions:**

### Decision 1: Borrower as Separate Entity vs Embedded Fields
**Option A: Embedded Fields (RECOMMENDED for MVP)**
```prisma
model Loan {
  borrowerName  String
  borrowerEmail String
  borrowerPhone String?
  // ... other loan fields
}
```

**Pros:**
- Simpler queries
- Fewer joins
- Easier to understand
- Faster for MVP

**Cons:**
- Duplicate borrower data if same person has multiple loans
- Harder to update borrower info across loans

**Option B: Separate Borrower Entity**
```prisma
model Borrower {
  id     String @id @default(cuid())
  name   String
  email  String @unique
  phone  String?
  loans  Loan[]
}

model Loan {
  borrowerId String
  borrower   Borrower @relation(fields: [borrowerId], references: [id])
  // ... other fields
}
```

**Pros:**
- No data duplication
- Better for multiple loans per borrower
- Easier to add borrower-level features later

**Cons:**
- More complex queries (always need joins)
- Slightly slower queries
- Overkill for MVP?

**Recommendation:** **Option A for MVP** - Keep it simple, refactor later if needed.

### Decision 2: Interest Calculation Flexibility

Three calculation methods to support:
1. **Simple Interest:** `Interest = Principal × Rate × Time`
2. **Amortized (Compound):** Fixed monthly payments with compound interest
3. **Interest-Only:** Pay interest periodically, principal due at end

**Schema Approach:**
```prisma
enum InterestCalculationType {
  SIMPLE
  AMORTIZED
  INTEREST_ONLY
}

model Loan {
  interestCalculationType InterestCalculationType @default(SIMPLE)
  // ... calculation method determines how we compute amounts
}
```

**Tradeoff:** Enum is rigid but type-safe. Alternative: String field (more flexible but less safe).

### Decision 3: Payment Frequency

**Chosen:** Enum with Monthly and Bi-weekly
```prisma
enum PaymentFrequency {
  MONTHLY
  BI_WEEKLY
}
```

**Future Extension:** Can add WEEKLY, QUARTERLY later without breaking changes.

## Complete Prisma Schema

### prisma/schema.prisma
```prisma
// Prisma schema for Loan Management Platform

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================================
// ENUMS
// ============================================================================

enum LoanStatus {
  ACTIVE      // Loan is currently active with outstanding balance
  COMPLETED   // Loan fully paid off
  OVERDUE     // Loan has missed payments (future: can calculate from payment due dates)
  DEFAULTED   // Loan in default (future feature)
}

enum InterestCalculationType {
  SIMPLE          // Simple interest: I = P × r × t
  AMORTIZED       // Fixed payment with compound interest (like mortgages)
  INTEREST_ONLY   // Pay interest periodically, principal at end
}

enum PaymentFrequency {
  MONTHLY    // Payment due monthly
  BI_WEEKLY  // Payment due every 2 weeks
}

// ============================================================================
// MODELS
// ============================================================================

model Loan {
  // Primary Key
  id        String   @id @default(cuid())

  // Borrower Information (embedded for MVP)
  borrowerName  String
  borrowerEmail String
  borrowerPhone String?

  // Loan Terms
  principal            Float                      // Original loan amount
  interestRate         Float                      // Annual interest rate (e.g., 5.5 for 5.5%)
  startDate            DateTime
  endDate              DateTime
  termMonths           Int                        // Loan duration in months

  // Interest Calculation
  interestCalculationType InterestCalculationType @default(SIMPLE)
  paymentFrequency        PaymentFrequency        @default(MONTHLY)

  // Current State
  status               LoanStatus @default(ACTIVE)
  balance              Float                      // Current outstanding balance

  // Optional Fields
  notes                String?   @db.Text        // Use @db.Text for longer notes
  collateral           String?   @db.Text        // Description of collateral (if any)

  // Relationships
  payments             Payment[]

  // Future: User relationship (null for MVP, add when auth is implemented)
  // userId               String?
  // user                 User?    @relation(fields: [userId], references: [id])

  // Timestamps
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt

  // Indexes for performance
  @@index([status])                              // Filter by status frequently
  @@index([borrowerEmail])                       // Search by borrower email
  @@index([createdAt])                           // Sort by creation date
  // @@index([userId])                           // Future: filter by user
}

model Payment {
  // Primary Key
  id          String   @id @default(cuid())

  // Payment Details
  amount      Float                               // Payment amount
  date        DateTime @default(now())            // Payment date
  notes       String?                             // Optional payment notes

  // Relationship to Loan
  loanId      String
  loan        Loan     @relation(fields: [loanId], references: [id], onDelete: Cascade)

  // Timestamps
  createdAt   DateTime @default(now())

  // Indexes
  @@index([loanId])                               // Foreign key index
  @@index([date])                                 // Sort by payment date
}

// ============================================================================
// FUTURE: User model for authentication
// ============================================================================
// Uncomment when implementing auth (post-MVP)
//
// model User {
//   id            String    @id @default(cuid())
//   email         String    @unique
//   name          String?
//   emailVerified DateTime?
//   image         String?
//   createdAt     DateTime  @default(now())
//   updatedAt     DateTime  @updatedAt
//
//   loans         Loan[]
//
//   // Add your auth provider fields here (e.g., NextAuth, Clerk, etc.)
// }
```

## Schema Design Rationale

### Field Choices

| Field | Type | Rationale |
|-------|------|-----------|
| `id` | `cuid()` | Collision-resistant IDs, better than auto-increment, URL-safe |
| `principal`, `balance`, `amount` | `Float` | PostgreSQL `DOUBLE PRECISION`, suitable for monetary values* |
| `interestRate` | `Float` | Store as percentage (e.g., 5.5 = 5.5%) |
| `termMonths` | `Int` | Duration in months, easier than date math |
| `notes`, `collateral` | `@db.Text` | Unlimited length text fields |
| `createdAt`, `updatedAt` | `DateTime` | Audit trail, auto-managed by Prisma |

**Note on Monetary Values:**
- Using `Float` (PostgreSQL DOUBLE PRECISION) is acceptable for this use case
- For high-precision financial systems, consider `Decimal` type
- **Tradeoff:** `Decimal` requires additional library (`decimal.js`), more complex
- **Decision:** `Float` is sufficient for loan management, revisit if precision issues arise

### Relationships

**Loan ↔ Payment (One-to-Many)**
- One loan has many payments
- `onDelete: Cascade` means deleting a loan deletes its payments
- **Tradeoff:** Cascade delete vs soft delete (keep payment history)
- **Decision:** Cascade delete for MVP, add soft delete later if needed

### Indexes

Indexes added for common query patterns:
- `@@index([status])` - Dashboard filters loans by status
- `@@index([borrowerEmail])` - Search functionality
- `@@index([createdAt])` - Sorting by date
- `@@index([loanId])` - Payment foreign key lookups
- `@@index([date])` - Payment history sorting

**Tradeoff:** More indexes = faster reads, slower writes
**Decision:** These indexes are worth it, write volume is low

### Future-Proofing for Authentication

```prisma
// userId field commented out for MVP
// userId    String?
// user      User?    @relation(...)

// Nullable so existing loans work when auth is added
```

**Migration Path:**
1. MVP: No auth, userId is null
2. Post-MVP: Uncomment User model, run migration
3. Existing loans remain (userId = null), assign to user later
4. New loans automatically linked to authenticated user

## Testing Requirements

### Schema Validation
- [ ] `npx prisma validate` passes
- [ ] `npx prisma format` formats correctly
- [ ] TypeScript types generated: `npx prisma generate`

### Migration
- [ ] `npx prisma migrate dev --name init` creates migration
- [ ] Migration applies successfully
- [ ] Database schema matches Prisma schema

### Sample Queries (in Prisma Studio or code)
```typescript
// Create a loan
const loan = await prisma.loan.create({
  data: {
    borrowerName: "Test Borrower",
    borrowerEmail: "test@example.com",
    borrowerPhone: "+1-555-1234",
    principal: 10000,
    interestRate: 5.5,
    startDate: new Date(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    termMonths: 12,
    balance: 10000,
    interestCalculationType: "SIMPLE",
    paymentFrequency: "MONTHLY",
  },
})

// Create a payment
const payment = await prisma.payment.create({
  data: {
    amount: 1000,
    loanId: loan.id,
    notes: "First payment",
  },
})

// Query loans with payments
const loans = await prisma.loan.findMany({
  where: { status: "ACTIVE" },
  include: { payments: true },
})
```

- [ ] All queries execute without errors
- [ ] Relationships work correctly
- [ ] Enums enforce valid values

## Deployment Considerations

### Local Development
```bash
# Apply migration
npm run db:migrate

# Migration name: "init" or "create_initial_schema"
```

### Production (Vercel)
```bash
# In CI/CD or manual before deploy
npx prisma migrate deploy

# Or in package.json build script
"build": "prisma generate && prisma migrate deploy && next build"
```

**Important:** Migrations should be run **before** deploying new code that depends on schema changes.

## Pre-Implementation Discussion Points

1. **Borrower: Embedded vs Separate Entity**
   - Embedded is simpler for MVP
   - Separate entity better for future features
   - **Your preference?**

2. **Monetary values: Float vs Decimal**
   - Float is simpler, sufficient for most use cases
   - Decimal is more precise, requires extra library
   - **Any concerns about precision?**

3. **Soft delete vs Hard delete**
   - Current: Hard delete with cascade
   - Alternative: Add `deletedAt` field for soft delete
   - **Should we preserve deleted loan history?**

4. **Payment status field**
   - Current: Payment has no status (simple)
   - Alternative: Add enum (PENDING, COMPLETED, FAILED)
   - **Is payment status needed for MVP?**

5. **Loan calculated fields**
   - Should we store `totalInterest`, `monthlyPayment` in DB?
   - Or calculate on-the-fly?
   - **Tradeoff:** Storage vs computation

6. **Future extensions**
   - Late fees?
   - Loan guarantors?
   - Partial payments tracking?
   - **Any must-haves for MVP?**

## Alternatives Considered

### Alternative 1: JSON field for flexible loan terms
```prisma
model Loan {
  // ... standard fields
  loanTerms  Json  // Store calculation type, frequency, etc.
}
```

**Rejected because:**
- Loses type safety
- Harder to query
- Migration nightmare

### Alternative 2: Polymorphic loans (table per type)
```prisma
model SimpleLoan { ... }
model AmortizedLoan { ... }
model InterestOnlyLoan { ... }
```

**Rejected because:**
- Over-engineered
- Query complexity
- Difficult to manage

### Chosen Approach: Single Loan model with enum
- Type-safe
- Simple to query
- Easy to extend
- Business logic in application layer, not database

## References
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Relations Guide](https://www.prisma.io/docs/concepts/components/prisma-schema/relations)
- [PostgreSQL Data Types](https://www.postgresql.org/docs/current/datatype.html)
- PRD Section 8: Data Model (Initial Draft)
- PRD Section 4: Core Features
