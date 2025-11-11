# [TASK-007] Create Database Migrations and Seed Data

**Status:** COMPLETED
**Phase:** Database
**Priority:** P0 (Critical)
**Estimated Effort:** S (2-3 hours)
**Branch:** `task/007-db-seeds`

## Dependencies

- TASK-006 (Prisma schema designed and migrated)

## Description

Create seed data script to populate the database with realistic sample loans and payments for development and testing. This enables developers to test features with realistic data without manually creating records.

## Acceptance Criteria

- [ ] Seed script created using Prisma Client
- [ ] Sample data includes diverse loan scenarios:
  - [ ] Multiple interest calculation types (SIMPLE, AMORTIZED, INTEREST_ONLY)
  - [ ] Different payment frequencies (MONTHLY, BI_WEEKLY)
  - [ ] Various loan statuses (ACTIVE, COMPLETED, OVERDUE)
  - [ ] Loans with and without payments
  - [ ] Different loan amounts and terms
- [ ] Seed script is idempotent (can run multiple times safely)
- [ ] npm script added for easy execution
- [ ] Seed data documented
- [ ] Script tested successfully

## Implementation Approach

### Seed Data Strategy

**Goals:**

1. Provide realistic test data for development
2. Cover all enum variations (status, calculation type, frequency)
3. Include edge cases (completed loans, overdue loans, loans with many payments)
4. Be repeatable and safe to run multiple times

**Data to Create:**

- 8-10 loans covering different scenarios
- 15-20 payments across various loans
- Mix of borrowers to test search/filter functionality

### Sample Scenarios

1. **Active Simple Interest Loan (Monthly)**
   - $10,000 principal, 5.5% interest, 12 months
   - 3 payments made so far
   - Status: ACTIVE

2. **Active Amortized Loan (Bi-weekly)**
   - $50,000 principal, 4.2% interest, 60 months
   - 10 payments made
   - Status: ACTIVE

3. **Active Interest-Only Loan (Monthly)**
   - $100,000 principal, 6.0% interest, 24 months
   - 5 payments made (interest only)
   - Status: ACTIVE

4. **Completed Loan**
   - $5,000 principal, 3.5% interest, 6 months
   - All payments made, balance = 0
   - Status: COMPLETED

5. **Overdue Loan**
   - $15,000 principal, 7.5% interest, 18 months
   - Only 2 payments in last 8 months
   - Status: OVERDUE

6. **New Loan (No Payments)**
   - $25,000 principal, 5.0% interest, 24 months
   - Just created, no payments yet
   - Status: ACTIVE

7. **Large Loan with Many Payments**
   - $200,000 principal, 4.5% interest, 120 months
   - 24 payments made
   - Status: ACTIVE

8. **Defaulted Loan**
   - $8,000 principal, 8.0% interest, 12 months
   - No payments in 6 months
   - Status: DEFAULTED

### Idempotency Strategy

**Option A: Delete and Recreate (RECOMMENDED for dev)**

```typescript
async function seed() {
  // Clear existing data
  await prisma.payment.deleteMany()
  await prisma.loan.deleteMany()

  // Create fresh seed data
  // ...
}
```

**Pros:**

- Simple and predictable
- Always starts from known state
- Good for development/testing

**Cons:**

- Deletes all data (not suitable for production)

**Option B: Upsert (Production-safe)**

```typescript
await prisma.loan.upsert({
  where: { id: 'seed-loan-1' },
  update: {},
  create: {
    /* loan data */
  },
})
```

**Pros:**

- Safe for production
- Preserves existing data

**Cons:**

- More complex
- Requires stable IDs

**Recommendation:** Use Option A (delete + recreate) for MVP. Add environment check to prevent running in production.

## Implementation

### prisma/seed.ts

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Safety check: Only run in development
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️  Seed script should not be run in production!')
    process.exit(1)
  }

  console.log('🌱 Seeding database...\n')

  // Clear existing data
  console.log('🧹 Clearing existing data...')
  await prisma.payment.deleteMany()
  await prisma.loan.deleteMany()
  console.log('✅ Existing data cleared\n')

  // Create loans
  console.log('📝 Creating loans...')

  // 1. Active Simple Interest Loan (Monthly)
  const loan1 = await prisma.loan.create({
    data: {
      borrowerName: 'Alice Johnson',
      borrowerEmail: 'alice.johnson@example.com',
      borrowerPhone: '+1-555-0101',
      principal: 10000,
      interestRate: 5.5,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-01-01'),
      termMonths: 12,
      balance: 7250, // After 3 payments
      interestCalculationType: 'SIMPLE',
      paymentFrequency: 'MONTHLY',
      status: 'ACTIVE',
      notes: 'Small business loan for inventory purchase',
    },
  })

  // 2. Active Amortized Loan (Bi-weekly)
  const loan2 = await prisma.loan.create({
    data: {
      borrowerName: 'Bob Smith',
      borrowerEmail: 'bob.smith@example.com',
      borrowerPhone: '+1-555-0102',
      principal: 50000,
      interestRate: 4.2,
      startDate: new Date('2023-06-01'),
      endDate: new Date('2028-06-01'),
      termMonths: 60,
      balance: 42000, // After 10 payments
      interestCalculationType: 'AMORTIZED',
      paymentFrequency: 'BI_WEEKLY',
      status: 'ACTIVE',
      notes: 'Auto loan for delivery vehicle',
      collateral: '2023 Ford Transit Van, VIN: 1FTBW2CM9PKA12345',
    },
  })

  // 3. Active Interest-Only Loan (Monthly)
  const loan3 = await prisma.loan.create({
    data: {
      borrowerName: 'Carol Davis',
      borrowerEmail: 'carol.davis@example.com',
      borrowerPhone: '+1-555-0103',
      principal: 100000,
      interestRate: 6.0,
      startDate: new Date('2024-03-01'),
      endDate: new Date('2026-03-01'),
      termMonths: 24,
      balance: 100000, // Interest-only, principal unchanged
      interestCalculationType: 'INTEREST_ONLY',
      paymentFrequency: 'MONTHLY',
      status: 'ACTIVE',
      notes: 'Real estate investment bridge loan',
      collateral: 'Commercial property at 123 Main St',
    },
  })

  // 4. Completed Loan
  const loan4 = await prisma.loan.create({
    data: {
      borrowerName: 'David Lee',
      borrowerEmail: 'david.lee@example.com',
      borrowerPhone: '+1-555-0104',
      principal: 5000,
      interestRate: 3.5,
      startDate: new Date('2024-05-01'),
      endDate: new Date('2024-11-01'),
      termMonths: 6,
      balance: 0, // Fully paid
      interestCalculationType: 'SIMPLE',
      paymentFrequency: 'MONTHLY',
      status: 'COMPLETED',
      notes: 'Personal loan - paid off early',
    },
  })

  // 5. Overdue Loan
  const loan5 = await prisma.loan.create({
    data: {
      borrowerName: 'Emily Wilson',
      borrowerEmail: 'emily.wilson@example.com',
      borrowerPhone: '+1-555-0105',
      principal: 15000,
      interestRate: 7.5,
      startDate: new Date('2023-08-01'),
      endDate: new Date('2025-02-01'),
      termMonths: 18,
      balance: 13500, // Only 2 payments made
      interestCalculationType: 'SIMPLE',
      paymentFrequency: 'MONTHLY',
      status: 'OVERDUE',
      notes: 'Equipment loan - payment issues',
    },
  })

  // 6. New Loan (No Payments)
  const loan6 = await prisma.loan.create({
    data: {
      borrowerName: 'Frank Martinez',
      borrowerEmail: 'frank.martinez@example.com',
      borrowerPhone: '+1-555-0106',
      principal: 25000,
      interestRate: 5.0,
      startDate: new Date('2024-11-01'),
      endDate: new Date('2026-11-01'),
      termMonths: 24,
      balance: 25000,
      interestCalculationType: 'AMORTIZED',
      paymentFrequency: 'MONTHLY',
      status: 'ACTIVE',
      notes: 'Home improvement loan',
    },
  })

  // 7. Large Loan with Many Payments
  const loan7 = await prisma.loan.create({
    data: {
      borrowerName: 'Grace Taylor',
      borrowerEmail: 'grace.taylor@example.com',
      borrowerPhone: '+1-555-0107',
      principal: 200000,
      interestRate: 4.5,
      startDate: new Date('2022-01-01'),
      endDate: new Date('2032-01-01'),
      termMonths: 120,
      balance: 168000, // After 24 months of payments
      interestCalculationType: 'AMORTIZED',
      paymentFrequency: 'MONTHLY',
      status: 'ACTIVE',
      notes: 'Commercial real estate mortgage',
      collateral: 'Office building at 456 Business Blvd',
    },
  })

  // 8. Defaulted Loan
  const loan8 = await prisma.loan.create({
    data: {
      borrowerName: 'Henry Brown',
      borrowerEmail: 'henry.brown@example.com',
      borrowerPhone: '+1-555-0108',
      principal: 8000,
      interestRate: 8.0,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-01-01'),
      termMonths: 12,
      balance: 8000, // No payments made
      interestCalculationType: 'SIMPLE',
      paymentFrequency: 'MONTHLY',
      status: 'DEFAULTED',
      notes: 'Business loan - borrower unresponsive',
    },
  })

  console.log(`✅ Created ${8} loans\n`)

  // Create payments
  console.log('💰 Creating payments...')

  const payments = await prisma.payment.createMany({
    data: [
      // Loan 1 payments (3 monthly payments)
      { loanId: loan1.id, amount: 900, date: new Date('2024-02-01'), notes: 'Payment 1/12' },
      { loanId: loan1.id, amount: 925, date: new Date('2024-03-01'), notes: 'Payment 2/12' },
      { loanId: loan1.id, amount: 925, date: new Date('2024-04-01'), notes: 'Payment 3/12' },

      // Loan 2 payments (10 bi-weekly payments)
      { loanId: loan2.id, amount: 800, date: new Date('2023-06-15') },
      { loanId: loan2.id, amount: 800, date: new Date('2023-07-01') },
      { loanId: loan2.id, amount: 800, date: new Date('2023-07-15') },
      { loanId: loan2.id, amount: 800, date: new Date('2023-08-01') },
      { loanId: loan2.id, amount: 800, date: new Date('2023-08-15') },
      { loanId: loan2.id, amount: 800, date: new Date('2023-09-01') },
      { loanId: loan2.id, amount: 800, date: new Date('2023-09-15') },
      { loanId: loan2.id, amount: 800, date: new Date('2023-10-01') },
      { loanId: loan2.id, amount: 800, date: new Date('2023-10-15') },
      { loanId: loan2.id, amount: 800, date: new Date('2023-11-01') },

      // Loan 3 payments (5 interest-only payments)
      { loanId: loan3.id, amount: 500, date: new Date('2024-04-01'), notes: 'Interest payment' },
      { loanId: loan3.id, amount: 500, date: new Date('2024-05-01'), notes: 'Interest payment' },
      { loanId: loan3.id, amount: 500, date: new Date('2024-06-01'), notes: 'Interest payment' },
      { loanId: loan3.id, amount: 500, date: new Date('2024-07-01'), notes: 'Interest payment' },
      { loanId: loan3.id, amount: 500, date: new Date('2024-08-01'), notes: 'Interest payment' },

      // Loan 4 payments (6 payments + final payment = completed)
      { loanId: loan4.id, amount: 850, date: new Date('2024-06-01') },
      { loanId: loan4.id, amount: 850, date: new Date('2024-07-01') },
      { loanId: loan4.id, amount: 850, date: new Date('2024-08-01') },
      { loanId: loan4.id, amount: 850, date: new Date('2024-09-01') },
      { loanId: loan4.id, amount: 850, date: new Date('2024-10-01') },
      { loanId: loan4.id, amount: 850, date: new Date('2024-11-01'), notes: 'Final payment' },

      // Loan 5 payments (only 2 - hence overdue)
      { loanId: loan5.id, amount: 750, date: new Date('2023-09-01') },
      { loanId: loan5.id, amount: 750, date: new Date('2023-10-01') },

      // Loan 6: No payments (new loan)

      // Loan 7 payments (24 monthly payments)
      ...Array.from({ length: 24 }, (_, i) => ({
        loanId: loan7.id,
        amount: 2100,
        date: new Date(2022, i, 15), // Monthly from Jan 2022
        notes: `Payment ${i + 1}/120`,
      })),

      // Loan 8: No payments (defaulted)
    ],
  })

  console.log(`✅ Created ${payments.count} payments\n`)

  // Summary
  console.log('📊 Seed Summary:')
  console.log(`   - ${8} loans created`)
  console.log(`   - ${payments.count} payments created`)
  console.log(`   - Loan statuses: 5 ACTIVE, 1 COMPLETED, 1 OVERDUE, 1 DEFAULTED`)
  console.log(`   - Interest types: SIMPLE, AMORTIZED, INTEREST_ONLY`)
  console.log(`   - Frequencies: MONTHLY, BI_WEEKLY`)
  console.log('\n✨ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

## package.json Updates

Add seed script:

```json
{
  "scripts": {
    "db:seed": "tsx prisma/seed.ts",
    "db:reset": "docker-compose down -v && docker-compose up -d postgres && npx prisma migrate deploy && npm run db:seed"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

**Note:** The `prisma.seed` configuration allows `prisma db seed` to work automatically.

## Testing Requirements

- [ ] Run `npm run db:seed` successfully
- [ ] Verify data in Prisma Studio: `npm run db:studio`
- [ ] Check all 8 loans created
- [ ] Verify payment counts match expected
- [ ] Run seed script twice (test idempotency)
- [ ] Verify `npx prisma db seed` works

## Documentation

Create `docs/SEED_DATA.md`:

```markdown
# Seed Data Reference

## Running Seed Script

\`\`\`bash

# Seed the database

npm run db:seed

# Or use Prisma CLI

npx prisma db seed

# Reset database and seed

npm run db:reset
\`\`\`

## Sample Data Overview

The seed script creates 8 loans and ~50 payments covering various scenarios:

### Loans

1. **Alice Johnson** - $10k Simple Interest (Monthly) - ACTIVE
2. **Bob Smith** - $50k Amortized (Bi-weekly) - ACTIVE with collateral
3. **Carol Davis** - $100k Interest-Only (Monthly) - ACTIVE with collateral
4. **David Lee** - $5k Simple Interest (Monthly) - COMPLETED
5. **Emily Wilson** - $15k Simple Interest (Monthly) - OVERDUE
6. **Frank Martinez** - $25k Amortized (Monthly) - ACTIVE, new (no payments)
7. **Grace Taylor** - $200k Amortized (Monthly) - ACTIVE, 24 payments
8. **Henry Brown** - $8k Simple Interest (Monthly) - DEFAULTED

### Use Cases

- **Testing filters:** Use status filter (ACTIVE/COMPLETED/OVERDUE/DEFAULTED)
- **Testing search:** Search by borrower name or email
- **Testing calculations:** Each interest type represented
- **Testing payment history:** Loan 7 has 24 payments
- **Testing edge cases:** New loan (no payments), completed loan, defaulted loan
  \`\`\`

## Deployment Considerations

### Development

- Run seed script after initial migration
- Safe to run multiple times (clears and recreates)

### Production

- **DO NOT run seed script in production**
- Script includes environment check to prevent this
- Use migrations only for schema changes

## Pre-Implementation Discussion

1. **Seed data quantity:**
   - Current: 8 loans, ~50 payments
   - Alternative: More loans for pagination testing?
   - **Recommendation:** 8 is sufficient for MVP

2. **Data realism:**
   - Should we use faker.js for more variety?
   - **Recommendation:** Hardcoded is fine for now, easier to understand

3. **Idempotency approach:**
   - Current: Delete all + recreate
   - Alternative: Upsert with stable IDs
   - **Recommendation:** Delete + recreate for dev simplicity

4. **Balance calculations:**
   - Manually set balance field
   - Should we calculate programmatically?
   - **Recommendation:** Manual for now, add calculation utilities in TASK-011

## References

- [Prisma Seeding Guide](https://www.prisma.io/docs/guides/migrate/seed-database)
- PRD Section 4: Core Features
- TASK-006: Prisma Schema
```
