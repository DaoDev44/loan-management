# Payment Type Selection Feature - Implementation Workflow

## 📋 Feature Overview

**Goal:** Add radio button selection in the payment modal to choose between:

1. **Calculated Payment** - The expected monthly/bi-weekly payment based on loan terms
2. **Custom Amount** - User-entered payment amount (current behavior)

## 🎯 User Story

```
As a loan manager
I want to quickly add the expected monthly payment or enter a custom amount
So that I can efficiently process regular payments or handle partial/extra payments
```

## 🔍 Current State Analysis

### Payment Modal Structure

- **File:** `components/loans/add-payment-dialog.tsx`
- **Form Library:** React Hook Form + Zod validation
- **Current Fields:** Amount (number), Date (date), Notes (optional)
- **Validation:** Amount must be positive and ≤ current balance

### Available Loan Data in Modal

```typescript
interface AddPaymentDialogProps {
  loanId: string
  borrowerName: string
  currentBalance: number
  // Missing: Need loan terms for payment calculation
}
```

### Calculation Library Available

- **Location:** `lib/calculations/`
- **Function:** `calculateLoanPayment()` - Can calculate expected payments
- **Supports:** Simple Interest, Amortized, Interest-Only calculations
- **Input Required:** principal, interestRate, termMonths, calculationType, paymentFrequency

## 🛠 Implementation Plan

### Phase 1: Data Requirements

**Objective:** Ensure payment modal has access to loan terms for calculation

#### 1.1 Update Modal Props

- [ ] Modify `AddPaymentDialogProps` to include full loan terms
- [ ] Update parent component (`LoanDetailHeader`) to pass loan data
- [ ] Ensure loan data includes: principal, interestRate, termMonths, calculationType, paymentFrequency

#### 1.2 Verify Calculation Integration

- [ ] Test `calculateLoanPayment()` with sample loan data
- [ ] Ensure calculation result provides expected payment amount
- [ ] Handle calculation errors gracefully (fallback to custom amount only)

### Phase 2: UI Components

**Objective:** Add radio button selection and conditional form fields

#### 2.1 Create Payment Type Selection

- [ ] Add `paymentType` field to form schema (`'calculated' | 'custom'`)
- [ ] Create radio button group component with options:
  - **"Expected Payment"** - Shows calculated amount
  - **"Custom Amount"** - Shows input field
- [ ] Default to 'calculated' if calculation succeeds, 'custom' if calculation fails

#### 2.2 Conditional Form Fields

- [ ] Show calculated payment amount (read-only) when 'calculated' selected
- [ ] Show amount input field when 'custom' selected
- [ ] Add visual indicators for payment type (icons, styling)
- [ ] Display payment schedule info (e.g., "Monthly payment based on loan terms")

### Phase 3: Form Logic Updates

**Objective:** Handle payment type selection and validation

#### 3.1 Form State Management

- [ ] Add `paymentType` to form defaultValues
- [ ] Watch `paymentType` changes to toggle UI
- [ ] Calculate and display expected payment amount
- [ ] Handle switching between payment types

#### 3.2 Validation Updates

- [ ] Update validation schema to handle payment types
- [ ] For 'calculated': Use calculated amount, validate ≤ balance
- [ ] For 'custom': Use existing amount validation
- [ ] Ensure smooth transitions between validation rules

### Phase 4: Enhanced UX Features

**Objective:** Improve user experience with additional features

#### 4.1 Payment Information Display

- [ ] Show payment breakdown for calculated payments:
  - Principal portion
  - Interest portion (if applicable)
  - Remaining balance after payment
- [ ] Add tooltip explaining calculation method
- [ ] Display next payment due date (if applicable)

#### 4.2 Quick Actions

- [ ] Add "Pay Extra" option to add amount on top of calculated payment
- [ ] Show different payment scenarios (e.g., "Pay $X extra to save Y interest")
- [ ] Add common payment multipliers (1x, 1.5x, 2x calculated payment)

### Phase 5: Backend Integration

**Objective:** Ensure server-side validation and processing

#### 5.1 Server Action Updates

- [ ] Update `createPayment()` to handle payment types
- [ ] Add server-side calculation validation
- [ ] Ensure payment type is logged for audit trail
- [ ] Update payment history to show payment type

#### 5.2 Database Schema (Optional)

- [ ] Consider adding `paymentType` field to Payment model
- [ ] Add migration if new field needed
- [ ] Update serialization types

## 📋 Detailed Implementation Tasks

### Task 1: Update Modal Props and Data Flow

**Priority:** High | **Effort:** 2 hours

```typescript
// Updated interface
interface AddPaymentDialogProps {
  loanId: string
  borrowerName: string
  currentBalance: number
  // Add loan terms
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

**Files to modify:**

- `components/loans/add-payment-dialog.tsx`
- `components/loans/loan-detail-header.tsx`
- `app/loans/[id]/page.tsx`

### Task 2: Create Payment Type Radio Group

**Priority:** High | **Effort:** 3 hours

```typescript
// Form schema update
const PaymentFormSchema = z.object({
  paymentType: z.enum(['calculated', 'custom']),
  amount: z.number().positive().multipleOf(0.01),
  date: z.coerce.date(),
  notes: z.string().optional(),
})

// Radio group component
const PaymentTypeSelector = ({
  value,
  onChange,
  calculatedAmount,
  calculationError
}) => (
  <RadioGroup value={value} onValueChange={onChange}>
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="calculated" disabled={!!calculationError} />
      <Label>Expected Payment: ${calculatedAmount?.toFixed(2) || 'N/A'}</Label>
    </div>
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="custom" />
      <Label>Custom Amount</Label>
    </div>
  </RadioGroup>
)
```

**Files to modify:**

- `components/loans/add-payment-dialog.tsx`
- `lib/validations/payment.schema.ts`

### Task 3: Integrate Calculation Library

**Priority:** High | **Effort:** 2 hours

```typescript
// Hook for payment calculation
const usePaymentCalculation = (loanData) => {
  const [calculation, setCalculation] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    try {
      const result = calculateLoanPayment(
        loanData.principal,
        loanData.interestRate,
        loanData.termMonths,
        loanData.interestCalculationType,
        loanData.paymentFrequency
      )

      if (result.success) {
        setCalculation(result.data)
        setError(null)
      } else {
        setError(result.errors[0]?.message || 'Calculation failed')
        setCalculation(null)
      }
    } catch (err) {
      setError('Failed to calculate payment')
      setCalculation(null)
    }
  }, [loanData])

  return { calculation, error, isLoading: !calculation && !error }
}
```

**Files to modify:**

- `components/loans/add-payment-dialog.tsx`
- Create new hook: `lib/hooks/use-payment-calculation.ts`

### Task 4: Conditional Form Fields

**Priority:** Medium | **Effort:** 2 hours

```typescript
// Conditional rendering logic
{watchPaymentType === 'calculated' ? (
  <div className="rounded-lg bg-muted/50 p-4 space-y-2">
    <div className="flex justify-between">
      <span className="text-sm font-medium">Expected Payment</span>
      <span className="text-lg font-bold">${calculation.paymentAmount.toFixed(2)}</span>
    </div>
    <div className="text-xs text-muted-foreground">
      Based on {loanData.interestCalculationType.toLowerCase()} interest calculation
    </div>
  </div>
) : (
  <FormField label="Payment Amount" required error={errors.amount?.message}>
    <div className="relative">
      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        inputMode="decimal"
        className="pl-9"
        {...currencyInputProps}
      />
    </div>
  </FormField>
)}
```

**Files to modify:**

- `components/loans/add-payment-dialog.tsx`

### Task 5: Enhanced Payment Information

**Priority:** Low | **Effort:** 3 hours

```typescript
// Payment breakdown component
const PaymentBreakdown = ({ calculation, currentBalance }) => (
  <div className="space-y-2 text-sm">
    <div className="flex justify-between">
      <span>Principal portion:</span>
      <span>${calculation.principalPortion?.toFixed(2)}</span>
    </div>
    <div className="flex justify-between">
      <span>Interest portion:</span>
      <span>${calculation.interestPortion?.toFixed(2)}</span>
    </div>
    <div className="flex justify-between font-medium">
      <span>Remaining balance:</span>
      <span>${(currentBalance - calculation.paymentAmount).toFixed(2)}</span>
    </div>
  </div>
)
```

**Files to modify:**

- `components/loans/add-payment-dialog.tsx`
- `lib/calculations/` (potentially add principal/interest breakdown)

## 🧪 Testing Strategy

### Unit Tests

- [ ] Test payment calculation hook with various loan types
- [ ] Test form validation with both payment types
- [ ] Test radio button state management

### Integration Tests

- [ ] Test modal with calculated payment selection
- [ ] Test modal with custom amount selection
- [ ] Test switching between payment types
- [ ] Test form submission with different payment types

### User Acceptance Tests

- [ ] User can select calculated payment and submit
- [ ] User can select custom amount and enter value
- [ ] User can switch between payment types
- [ ] Validation works correctly for both types
- [ ] Payment is created correctly in database

## 🚀 Deployment Checklist

### Pre-deployment

- [ ] All tests passing
- [ ] Code review completed
- [ ] Database migration tested (if needed)
- [ ] Backward compatibility verified

### Deployment

- [ ] Feature flag (optional)
- [ ] Monitor error rates
- [ ] Verify payment creation works
- [ ] Check calculation accuracy

### Post-deployment

- [ ] Monitor user adoption
- [ ] Gather feedback on UX
- [ ] Performance monitoring
- [ ] Plan future enhancements

## 💡 Future Enhancements

### Quick Wins

- [ ] Payment templates (common amounts)
- [ ] Payment reminders/notifications
- [ ] Bulk payment processing
- [ ] Payment scheduling

### Advanced Features

- [ ] Automatic payment setup
- [ ] Payment optimization suggestions
- [ ] Integration with external payment processors
- [ ] Payment analytics and insights

## 📝 Implementation Notes

### Technical Considerations

1. **Decimal Precision:** Ensure calculated payments use Decimal.js for accuracy
2. **Form State:** Use React Hook Form's watch() for reactive UI updates
3. **Error Handling:** Graceful fallback when calculations fail
4. **Accessibility:** Proper ARIA labels for radio buttons
5. **Performance:** Memoize calculation results

### UX Considerations

1. **Default Selection:** Smart defaults based on loan type and user behavior
2. **Visual Feedback:** Clear indication of selected payment type
3. **Validation Messages:** Context-aware error messages
4. **Loading States:** Show loading when calculating payments
5. **Progressive Enhancement:** Works even if calculations fail

### Business Considerations

1. **Audit Trail:** Log payment type for reporting
2. **Compliance:** Ensure calculated payments meet regulatory requirements
3. **Flexibility:** Support for different payment scenarios
4. **Scalability:** Design for multiple loan types and payment frequencies

## ✅ Success Criteria

### Functional Requirements

- [ ] Users can select between calculated and custom payments
- [ ] Calculated payments are accurate for all loan types
- [ ] Form validation works correctly for both payment types
- [ ] Payments are created successfully in database

### Non-Functional Requirements

- [ ] Modal loads within 200ms
- [ ] Calculations complete within 100ms
- [ ] UI is accessible (WCAG 2.1 AA)
- [ ] Mobile responsive design
- [ ] No regression in existing functionality

### User Experience

- [ ] Intuitive payment type selection
- [ ] Clear visual feedback for selected option
- [ ] Helpful calculation breakdown
- [ ] Smooth transitions between payment types
- [ ] Consistent with overall application design

---

**Next Step:** Review and approve this workflow, then begin implementation starting with Task 1.
