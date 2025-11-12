'use client'

import { useEffect } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { DollarSign, Calendar, FileText } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingState } from '@/components/shared/loading-state'

import { createPayment } from '@/app/actions/payment.actions'
import { CreatePaymentSchema, type CreatePaymentInput } from '@/lib/validations/payment.schema'
import { toast } from 'sonner'
import { useCurrencyInput } from '@/lib/hooks/use-currency-input'
import { useFormSubmission } from '@/lib/hooks/use-form-submission'
import {
  createAmountValidation,
  paymentDateValidation,
  commonValidationRules,
} from '@/lib/utils/form-validation'

// Form data type for React Hook Form (with string dates for HTML inputs)
type FormData = Omit<CreatePaymentInput, 'date' | 'loanId'> & {
  date: string
}

// Form field wrapper component for consistent styling
function FormField({
  label,
  error,
  required = false,
  description,
  children,
}: {
  label: string
  error?: string
  required?: boolean
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

interface AddPaymentDialogProps {
  loanId: string
  borrowerName: string
  currentBalance: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddPaymentDialog({
  loanId,
  borrowerName,
  currentBalance,
  open,
  onOpenChange,
  onSuccess,
}: AddPaymentDialogProps) {
  // Use shared form submission hook
  const { isSubmitting, formError, setIsSubmitting, setFormError, handleSubmissionError } =
    useFormSubmission()

  // Use shared currency input hook
  const currencyInput = useCurrencyInput()
  const {
    isFocused,
    setDisplayValue,
    formatNumberDisplay,
    handleFocus,
    handleBlur,
    handleChange,
    displayValue,
    setIsFocused,
    parseFormattedNumber,
  } = currencyInput

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    mode: 'onBlur',
    defaultValues: {
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      notes: '',
    },
  })

  // Watch amount value for currency input hook integration
  const amountValue = watch('amount')

  // Update display value when amount changes (external to hook)
  useEffect(() => {
    if (!isFocused && amountValue && amountValue !== 0) {
      setDisplayValue(formatNumberDisplay(amountValue))
    } else if (!isFocused && (!amountValue || amountValue === 0)) {
      setDisplayValue('')
    }
  }, [amountValue, isFocused, setDisplayValue, formatNumberDisplay])

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  // Create validation rules using shared utilities
  const validationRules = {
    amount: createAmountValidation(currentBalance),
    date: paymentDateValidation,
    notes: commonValidationRules.notes,
  }

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true)
    setFormError(null)

    try {
      // Convert form data to CreatePaymentInput format
      const paymentData: CreatePaymentInput = {
        loanId,
        amount: data.amount,
        date: new Date(data.date),
        notes: data.notes || '',
      }

      // Validate the data
      const validatedData = CreatePaymentSchema.parse(paymentData)
      const result = await createPayment(validatedData)

      if (result.success) {
        toast.success('Payment recorded successfully')
        reset()
        onOpenChange(false)
        onSuccess?.()
      } else {
        setFormError(result.error || 'Failed to record payment')
        toast.error(result.error || 'Failed to record payment')
      }
    } catch (error) {
      handleSubmissionError(error, 'Failed to record payment')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      reset()
      setFormError(null)
      setDisplayValue('')
      setIsFocused(false)
    }
  }, [open, reset, setFormError, setDisplayValue, setIsFocused])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Payment</DialogTitle>
          <DialogDescription>
            Record a new payment for <span className="font-medium">{borrowerName}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Form Error */}
          {formError && (
            <Alert variant="destructive">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          {/* Current Balance Info */}
          <div className="rounded-lg bg-muted/50 p-3 space-y-1">
            <div className="text-sm font-medium">Current Balance</div>
            <div className="text-lg font-bold">{formatCurrency(currentBalance)}</div>
          </div>

          <div className="space-y-4">
            {/* Payment Amount */}
            <FormField
              label="Payment Amount"
              required
              error={errors.amount?.message}
              description="Amount being paid toward this loan"
            >
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  inputMode="decimal"
                  {...register('amount', {
                    setValueAs: parseFormattedNumber,
                    ...validationRules.amount,
                  })}
                  value={displayValue || ''}
                  placeholder="0.00"
                  className="pl-9"
                  disabled={isSubmitting}
                  onFocus={handleFocus}
                  onBlur={(e) => handleBlur(e, setValue, 'amount')}
                  onChange={handleChange}
                />
              </div>
            </FormField>

            {/* Payment Date */}
            <FormField
              label="Payment Date"
              required
              error={errors.date?.message}
              description="Date when the payment was received"
            >
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="date"
                  {...register('date', validationRules.date)}
                  className="pl-9"
                  disabled={isSubmitting}
                />
              </div>
            </FormField>

            {/* Notes */}
            <FormField
              label="Notes"
              error={errors.notes?.message}
              description="Optional notes about this payment"
            >
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <textarea
                  {...register('notes', validationRules.notes)}
                  rows={3}
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  placeholder="Enter any notes about this payment..."
                  disabled={isSubmitting}
                />
              </div>
            </FormField>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <LoadingState text="Recording..." size="sm" /> : 'Record Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
