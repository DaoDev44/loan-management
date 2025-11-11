# TASK-011: Create Interest Calculation Utilities

**Status:** IN_PROGRESS
**Priority:** P1
**Effort Estimate:** M
**Branch:** `task/011-interest-calcs`
**Started:** 2025-11-10

---

## Overview

Create comprehensive interest calculation utilities to support the flexible interest calculation system defined in the Prisma schema. This will enable accurate calculation of interest, payment schedules, and loan balances for different interest types (Simple, Amortized, Interest-Only) and payment frequencies (Monthly, Bi-Weekly).

## Acceptance Criteria

- [ ] **Simple Interest Calculator**: Implement I = P × r × t calculation
- [ ] **Amortized Interest Calculator**: Fixed payment with compound interest (mortgage-style)
- [ ] **Interest-Only Calculator**: Periodic interest payments, principal at end
- [ ] **Payment Schedule Generator**: Create payment schedules for different frequencies
- [ ] **Balance Calculation**: Calculate remaining balance after payments
- [ ] **Payment Amount Calculator**: Calculate payment amounts for amortized loans
- [ ] **Validation & Error Handling**: Handle edge cases and invalid inputs
- [ ] **TypeScript Types**: Strong typing for all calculation functions
- [ ] **Unit Tests**: Comprehensive test coverage for all calculation logic
- [ ] **Documentation**: Clear JSDoc comments explaining formulas and usage

## Implementation Details

### File Structure
```
lib/
└── calculations/
    ├── index.ts           # Main exports
    ├── simple-interest.ts # Simple interest calculations
    ├── amortized.ts       # Amortized loan calculations
    ├── interest-only.ts   # Interest-only calculations
    ├── payment-schedule.ts # Payment schedule generation
    ├── types.ts           # TypeScript types
    └── utils.ts           # Common utility functions
```

### Key Functions to Implement

#### Simple Interest
- `calculateSimpleInterest(principal, rate, time)`
- `calculateSimpleInterestBalance(principal, rate, startDate, payments)`

#### Amortized Loans
- `calculateMonthlyPayment(principal, rate, months)`
- `generateAmortizationSchedule(principal, rate, months, frequency)`
- `calculateRemainingBalance(principal, rate, months, paymentsMade)`

#### Interest-Only
- `calculateInterestOnlyPayment(principal, rate, frequency)`
- `calculateInterestOnlySchedule(principal, rate, termMonths, frequency)`

#### Payment Schedules
- `generatePaymentSchedule(loan, calculationType)`
- `calculateNextPaymentDate(startDate, frequency, paymentNumber)`

#### Balance Calculations
- `calculateCurrentBalance(loan, payments)`
- `calculateTotalInterestPaid(payments)`
- `calculateTotalInterestRemaining(loan, payments)`

## Technical Considerations

### Precision Handling
- Use `Decimal` type for monetary calculations to avoid floating-point errors
- Implement proper rounding for payment amounts
- Handle cent precision in all calculations

### Date Calculations
- Support different payment frequencies (Monthly, Bi-Weekly)
- Account for leap years and varying month lengths
- Use date-fns for reliable date arithmetic

### Validation
- Validate positive principal amounts
- Validate reasonable interest rates (0-100%)
- Validate loan terms (positive months)
- Handle edge cases like zero interest rates

## Dependencies

**Prerequisites:**
- ✅ TASK-006: Prisma schema with interest calculation types
- ✅ TASK-008: Zod validation schemas

**Enables:**
- TASK-023: Create Loan form (will use payment calculators)
- TASK-025: Add Payment dialog (will use balance calculators)
- Future: Payment reminders and scheduling

## Testing Requirements

### Unit Tests
- [ ] Simple interest calculations with various inputs
- [ ] Amortized payment calculations
- [ ] Payment schedule generation
- [ ] Balance calculations with payment history
- [ ] Edge cases: zero rates, single payment, overpayments
- [ ] Date calculations for different frequencies

### Integration Tests
- [ ] End-to-end calculation flows
- [ ] Integration with existing loan and payment data
- [ ] Performance tests for large loan portfolios

## Files to Create/Modify

### New Files
- `lib/calculations/index.ts`
- `lib/calculations/simple-interest.ts`
- `lib/calculations/amortized.ts`
- `lib/calculations/interest-only.ts`
- `lib/calculations/payment-schedule.ts`
- `lib/calculations/types.ts`
- `lib/calculations/utils.ts`
- `tests/unit/calculations.test.ts`

### Modified Files
- `lib/validations/index.ts` (export calculation types if needed)

## Formulas Reference

### Simple Interest
```
Interest = Principal × Rate × Time
Total Amount = Principal + Interest
```

### Amortized Monthly Payment
```
M = P × [r(1+r)^n] / [(1+r)^n - 1]
Where: M = Monthly Payment, P = Principal, r = Monthly Rate, n = Number of Payments
```

### Interest-Only Payment
```
Monthly Interest = Principal × (Annual Rate / 12)
```

## Notes

- Calculations must match financial industry standards
- Consider regulatory compliance for interest calculation methods
- Implement proper rounding to avoid payment discrepancies
- Support both monthly and bi-weekly payment frequencies
- Ensure calculations are deterministic and reproducible