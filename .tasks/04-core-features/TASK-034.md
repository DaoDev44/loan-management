# [TASK-034] Add Payment Type Selection to Payment Dialog

**Status:** IN_PROGRESS
**Phase:** Core Features
**Priority:** P1 (High)
**Estimated Effort:** M (4-6 hours)
**Actual Effort:** TBD
**Completion Date:** TBD

## Dependencies

- TASK-025 (Build Add Payment dialog and logic - COMPLETED)
- TASK-011 (Create interest calculation utilities - COMPLETED)
- Existing loan calculation library integration

## Description

Enhance the existing Add Payment dialog to include radio button selection between:

1. **Calculated Payment** - The expected monthly/bi-weekly payment based on loan terms
2. **Custom Amount** - User-entered payment amount (current behavior)

This feature will allow loan managers to quickly add the expected payment or enter custom amounts for partial/extra payments, improving workflow efficiency for regular payment processing.

## User Story

```
As a loan manager
I want to quickly add the expected monthly payment or enter a custom amount
So that I can efficiently process regular payments or handle partial/extra payments
```

## Acceptance Criteria

### Core Implementation

- [ ] Add radio button group to payment dialog for payment type selection
- [ ] Integrate with existing calculation library (`lib/calculations/`) to compute expected payments
- [ ] Show calculated payment amount (read-only) when "Expected Payment" is selected
- [ ] Show existing amount input field when "Custom Amount" is selected
- [ ] Update form validation to handle both payment types appropriately
- [ ] Default to "Expected Payment" if calculation succeeds, "Custom Amount" if it fails
- [ ] Maintain all existing functionality from TASK-025 (currency formatting, validation, etc.)

### Data Requirements

- [ ] Update `AddPaymentDialogProps` to include full loan terms for calculation
- [ ] Modify parent component to pass complete loan data
- [ ] Ensure loan data includes: principal, interestRate, termMonths, calculationType, paymentFrequency
- [ ] Handle calculation errors gracefully (fallback to custom amount only)

### UI/UX Requirements

- [ ] Radio button group with clear labels ("Expected Payment", "Custom Amount")
- [ ] Display calculated amount with loan term context when applicable
- [ ] Smooth transitions between payment type selections
- [ ] Visual indicators for selected payment type
- [ ] Maintain responsive design across all screen sizes
- [ ] Follow existing design patterns from the application

### Form Logic

- [ ] Add `paymentType` field to form schema (`'calculated' | 'custom'`)
- [ ] Watch payment type changes to toggle UI appropriately
- [ ] Update validation schema to handle both payment types
- [ ] Ensure form state management works correctly with type switching

### Error Handling

- [ ] Handle calculation failures gracefully
- [ ] Provide clear error messages if loan terms are missing
- [ ] Fallback to custom amount input if calculations are not possible
- [ ] Maintain existing error handling patterns from TASK-025

### TypeScript & Code Quality

- [ ] Full TypeScript type safety for new payment type functionality
- [ ] Update existing interfaces and types as needed
- [ ] Follow existing code patterns and conventions
- [ ] No build errors or TypeScript compilation issues

## Implementation Approach

### Phase 1: Update Data Flow

1. **Modify AddPaymentDialogProps** to include loan terms
2. **Update parent components** to pass complete loan data
3. **Test calculation integration** with existing utilities

### Phase 2: Add Payment Type Selection

1. **Create radio button component** with payment type options
2. **Add paymentType to form schema** with Zod validation
3. **Implement conditional rendering** based on selected type

### Phase 3: Integrate Calculation Logic

1. **Create usePaymentCalculation hook** or similar
2. **Calculate expected payment** using existing utilities
3. **Handle calculation errors** and edge cases

### Phase 4: Form Logic Updates

1. **Update form validation** for both payment types
2. **Implement type switching logic** with proper state management
3. **Ensure smooth UX transitions** between payment types

## Technical Considerations

### Integration with Existing Calculation Library

The project has a robust calculation library at `lib/calculations/` with:

- `calculateLoanPayment()` function for payment calculations
- Support for Simple Interest, Amortized, and Interest-Only calculations
- Strategy pattern implementation with proper error handling

### Form Enhancement Strategy

Enhance the existing `add-payment-dialog.tsx` without breaking existing functionality:

- Extend the current React Hook Form implementation
- Add new fields while maintaining existing validation patterns
- Reuse existing `useCurrencyInput` and `useFormSubmission` hooks from TASK-025

### Data Requirements Analysis

Current `AddPaymentDialogProps`:

```typescript
interface AddPaymentDialogProps {
  loanId: string
  borrowerName: string
  currentBalance: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}
```

Needs enhancement to:

```typescript
interface AddPaymentDialogProps {
  loanId: string
  borrowerName: string
  currentBalance: number
  loanData: {
    principal: number
    interestRate: number
    termMonths: number
    interestCalculationType: 'SIMPLE' | 'AMORTIZED' | 'INTEREST_ONLY'
    paymentFrequency: 'MONTHLY' | 'BI_WEEKLY'
    startDate: Date
  }
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}
```

## Component Design

### Updated Dialog Structure

```
┌─────────────────────────────────────┐
│ Add Payment                    [×]  │
├─────────────────────────────────────┤
│ Record payment for [Borrower Name]  │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Current Balance: $10,000.00     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Payment Type *                      │
│ ○ Expected Payment: $500.00         │
│ ○ Custom Amount                     │
│                                     │
│ [Amount Input or Calculated Display]│
│ Payment Date *      [Date Picker]   │
│ Notes               [        ]      │
│                                     │
│              [Cancel] [Record]      │
└─────────────────────────────────────┘
```

## Testing Requirements

### Manual Testing Checklist

- [ ] Test payment type selection radio buttons
- [ ] Verify calculated payment displays correctly for all loan types
- [ ] Test switching between payment types
- [ ] Verify custom amount input still works as before
- [ ] Test form validation with both payment types
- [ ] Test error handling when calculations fail
- [ ] Test responsive design with new elements
- [ ] Verify existing functionality remains intact

### Edge Cases to Test

1. **Missing loan terms** - Should fallback to custom amount only
2. **Calculation errors** - Should gracefully handle and disable calculated option
3. **Zero payment calculations** - Should handle edge cases appropriately
4. **Large loan amounts** - Should display calculated payments correctly
5. **Different loan types** - Should work with Simple, Amortized, and Interest-Only

## Future Enhancement Opportunities

- Payment breakdown display (principal vs interest portions)
- Payment schedule information
- "Pay extra" option to add amount on top of calculated payment
- Payment scenario comparisons
- Next payment due date display

## Files to Modify

```
components/loans/
├── add-payment-dialog.tsx           # Main enhancement
└── loan-detail-header.tsx           # Update to pass loan data

app/loans/[id]/
└── page.tsx                         # Ensure loan data is available

lib/hooks/
└── use-payment-calculation.ts       # New hook (optional)

lib/validations/
└── payment.schema.ts               # Update schema if needed
```

## References

- Existing Add Payment Dialog: `components/loans/add-payment-dialog.tsx` (TASK-025)
- Calculation Library: `lib/calculations/`
- Form Patterns: Following patterns established in TASK-025
- Related Analysis: Information from the workflow document analysis

---

**Next Step:** Conduct pre-implementation discussion following established workflow process.
