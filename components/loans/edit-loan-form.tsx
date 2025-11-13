'use client'

import { useState, useEffect } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { CalendarDays, DollarSign, User, Settings, FileText } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingState } from '@/components/shared/loading-state'

import { updateLoan } from '@/app/actions/loan.actions'
import { UpdateLoanSchema, type UpdateLoanInput } from '@/lib/validations/loan.schema'
import { InterestCalculationType, PaymentFrequency, LoanStatus } from '@prisma/client'
import { calculateLoanPayment } from '@/lib/calculations'
import { toast } from 'sonner'
import { type SerializedLoan } from '@/lib/utils/serialize'

// Form data type for React Hook Form (with string dates for HTML inputs)
type FormData = Omit<UpdateLoanInput, 'startDate' | 'endDate' | 'id'> & {
  startDate?: string
  endDate?: string
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

interface EditLoanFormProps {
  loan: SerializedLoan
  onSuccess?: () => void
  onCancel?: () => void
}

export function EditLoanForm({ loan, onSuccess, onCancel }: EditLoanFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    mode: 'onBlur',
    defaultValues: {
      borrowerName: loan.borrowerName,
      borrowerEmail: loan.borrowerEmail,
      borrowerPhone: loan.borrowerPhone || '',
      principal: loan.principal,
      interestRate: loan.interestRate,
      termMonths: loan.termMonths,
      interestCalculationType: loan.interestCalculationType,
      paymentFrequency: loan.paymentFrequency,
      status: loan.status,
      startDate: loan.startDate ? new Date(loan.startDate).toISOString().split('T')[0] : '',
      endDate: loan.endDate ? new Date(loan.endDate).toISOString().split('T')[0] : '',
      notes: loan.notes || '',
      collateral: loan.collateral || '',
      balance: loan.balance,
    },
  })

  // Watch form values for dynamic calculations
  const watchedValues = watch(['interestRate', 'paymentFrequency', 'interestCalculationType'])

  // Watch start date and term months for auto end date calculation
  const startDate = watch('startDate')
  const termMonths = watch('termMonths')

  // Watch principal value for formatting
  const principalValue = watch('principal')

  // Auto-calculate end date when start date or term months change
  useEffect(() => {
    if (startDate && termMonths) {
      const start = new Date(startDate)
      const end = new Date(start)
      end.setMonth(end.getMonth() + termMonths)
      setValue('endDate', end.toISOString().split('T')[0])
    }
  }, [startDate, termMonths, setValue])

  // Track display state for principal field
  const [principalDisplayValue, setPrincipalDisplayValue] = useState('')
  const [isPrincipalFocused, setIsPrincipalFocused] = useState(false)

  // Initialize and update display value when principal changes
  useEffect(() => {
    if (!isPrincipalFocused && principalValue && principalValue !== 0) {
      setPrincipalDisplayValue(formatNumberDisplay(principalValue))
    } else if (!isPrincipalFocused && (!principalValue || principalValue === 0)) {
      setPrincipalDisplayValue('')
    }
  }, [principalValue, isPrincipalFocused])

  // Track display state for balance field
  const [balanceDisplayValue, setBalanceDisplayValue] = useState('')
  const [isBalanceFocused, setIsBalanceFocused] = useState(false)
  const balanceValue = watch('balance')

  // Initialize and update display value when balance changes
  useEffect(() => {
    if (!isBalanceFocused && balanceValue && balanceValue !== 0) {
      setBalanceDisplayValue(formatNumberDisplay(balanceValue))
    } else if (!isBalanceFocused && (!balanceValue || balanceValue === 0)) {
      setBalanceDisplayValue('')
    }
  }, [balanceValue, isBalanceFocused])

  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const phoneNumber = value.replace(/\D/g, '')

    // Format as (XXX) XXX-XXXX
    if (phoneNumber.length === 0) return ''
    if (phoneNumber.length <= 3) return phoneNumber
    if (phoneNumber.length <= 6) return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
  }

  // Format number with commas for display
  const formatNumberDisplay = (value: number | string) => {
    if (!value || value === 0) return ''
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(num)) return ''
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
  }

  // Parse formatted number back to raw number
  const parseFormattedNumber = (value: string | number | undefined | null): number => {
    if (typeof value === 'number') return value
    if (!value || value === '') return 0

    const stringValue = String(value)
    const cleaned = stringValue.replace(/[,\s]/g, '')
    const num = parseFloat(cleaned)
    return isNaN(num) ? 0 : num
  }

  // Validation rules for edit form (most fields optional)
  const validationRules = {
    borrowerName: {
      minLength: { value: 2, message: 'Name must be at least 2 characters' },
      maxLength: { value: 100, message: 'Name must be less than 100 characters' },
    },
    borrowerEmail: {
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: 'Please enter a valid email address',
      },
    },
    borrowerPhone: {
      pattern: {
        value: /^\(\d{3}\) \d{3}-\d{4}$/,
        message: 'Please enter a valid phone number',
      },
    },
    principal: {
      min: { value: 1, message: 'Principal must be greater than $0' },
      max: { value: 100000000, message: 'Principal must be less than $100,000,000' },
    },
    balance: {
      min: { value: 0, message: 'Balance cannot be negative' },
      max: { value: 100000000, message: 'Balance must be less than $100,000,000' },
    },
    interestRate: {
      min: { value: 0, message: 'Interest rate cannot be negative' },
      max: { value: 100, message: 'Interest rate must be less than 100%' },
    },
    termMonths: {
      min: { value: 1, message: 'Term must be at least 1 month' },
      max: { value: 360, message: 'Term must be less than 360 months' },
    },
    startDate: {
      validate: (value: string | undefined) => {
        if (!value) return true // Optional in edit mode
        const selectedDate = new Date(value)
        const futureLimit = new Date()
        futureLimit.setFullYear(futureLimit.getFullYear() + 5)

        if (selectedDate > futureLimit) {
          return 'Start date cannot be more than 5 years in the future'
        }
        return true
      },
    },
  }

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true)
    setFormError(null)

    try {
      // Convert form data to UpdateLoanInput format
      const updateData: UpdateLoanInput = {
        id: loan.id,
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      }

      // Remove undefined values to avoid sending unnecessary data
      Object.keys(updateData).forEach((key) => {
        if (updateData[key as keyof UpdateLoanInput] === undefined) {
          delete updateData[key as keyof UpdateLoanInput]
        }
      })

      // Validate the converted data
      const validatedData = UpdateLoanSchema.parse(updateData)
      const result = await updateLoan(validatedData)

      if (result.success) {
        toast.success('Loan updated successfully')
        onSuccess?.()
      } else {
        setFormError(result.error || 'Failed to update loan')
        toast.error(result.error || 'Failed to update loan')
      }
    } catch (error) {
      console.error('Error updating loan:', error)
      setFormError('An unexpected error occurred')
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Real-time calculation preview using Strategy+Factory pattern
  const calculatePreview = () => {
    const [interestRate, frequency, calcType] = watchedValues
    const principal = principalValue

    if (!principal || !interestRate || !termMonths) return null

    // Use our calculation library
    const result = calculateLoanPayment(
      principal,
      interestRate,
      termMonths,
      calcType as InterestCalculationType,
      frequency as PaymentFrequency
    )

    if (!result.success) {
      console.warn('Calculation failed:', result.errors)
      return null
    }

    return {
      monthlyPayment: result.data.paymentAmount.toNumber(),
      totalPayments: result.data.totalPayments,
      frequency: result.data.paymentFrequency,
      totalInterest: result.data.totalInterest.toNumber(),
      totalAmount: result.data.totalAmount.toNumber(),
    }
  }

  const preview = calculatePreview()

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Form Error */}
      {formError && (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Borrower Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Borrower Information
              </CardTitle>
              <CardDescription>
                Update the borrower's contact details and personal information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Full Name" error={errors.borrowerName?.message}>
                  <Input
                    {...register('borrowerName', validationRules.borrowerName)}
                    placeholder="Enter borrower's full name"
                    disabled={isSubmitting}
                  />
                </FormField>

                <FormField label="Email Address" error={errors.borrowerEmail?.message}>
                  <Input
                    type="email"
                    {...register('borrowerEmail', validationRules.borrowerEmail)}
                    placeholder="borrower@example.com"
                    disabled={isSubmitting}
                  />
                </FormField>

                <FormField
                  label="Phone Number"
                  error={errors.borrowerPhone?.message}
                  description="US format (XXX) XXX-XXXX"
                >
                  <Input
                    type="tel"
                    {...register('borrowerPhone', validationRules.borrowerPhone)}
                    placeholder="(555) 123-4567"
                    disabled={isSubmitting}
                    maxLength={14}
                    onChange={(e) => {
                      const formatted = formatPhoneNumber(e.target.value)
                      setValue('borrowerPhone', formatted)
                    }}
                  />
                </FormField>
              </div>
            </CardContent>
          </Card>

          {/* Loan Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Loan Details
              </CardTitle>
              <CardDescription>Update the loan amount, interest rate, and term.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  label="Principal Amount"
                  error={errors.principal?.message}
                  description="The total loan amount"
                >
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      inputMode="decimal"
                      {...register('principal', {
                        setValueAs: parseFormattedNumber,
                        ...validationRules.principal,
                      })}
                      value={isPrincipalFocused ? undefined : principalDisplayValue || ''}
                      placeholder="0"
                      className="pl-9"
                      disabled={isSubmitting}
                      onFocus={(e) => {
                        setIsPrincipalFocused(true)
                        e.target.select()
                      }}
                      onBlur={(e) => {
                        const rawValue = parseFormattedNumber(e.target.value)
                        setValue('principal', rawValue)
                        setIsPrincipalFocused(false)

                        if (rawValue && rawValue !== 0) {
                          setPrincipalDisplayValue(formatNumberDisplay(rawValue))
                        } else {
                          setPrincipalDisplayValue('')
                        }
                      }}
                      onChange={(e) => {
                        if (isPrincipalFocused) {
                          // Allow typing raw numbers only when focused
                          const value = e.target.value.replace(/[^0-9.]/g, '')
                          e.target.value = value
                        }
                      }}
                    />
                  </div>
                </FormField>

                <FormField
                  label="Current Balance"
                  error={errors.balance?.message}
                  description="Current outstanding balance"
                >
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      inputMode="decimal"
                      {...register('balance', {
                        setValueAs: parseFormattedNumber,
                        ...validationRules.balance,
                      })}
                      value={isBalanceFocused ? undefined : balanceDisplayValue || ''}
                      placeholder="0"
                      className="pl-9"
                      disabled={isSubmitting}
                      onFocus={(e) => {
                        setIsBalanceFocused(true)
                        e.target.select()
                      }}
                      onBlur={(e) => {
                        const rawValue = parseFormattedNumber(e.target.value)
                        setValue('balance', rawValue)
                        setIsBalanceFocused(false)

                        if (rawValue && rawValue !== 0) {
                          setBalanceDisplayValue(formatNumberDisplay(rawValue))
                        } else {
                          setBalanceDisplayValue('')
                        }
                      }}
                      onChange={(e) => {
                        if (isBalanceFocused) {
                          // Allow typing raw numbers only when focused
                          const value = e.target.value.replace(/[^0-9.]/g, '')
                          e.target.value = value
                        }
                      }}
                    />
                  </div>
                </FormField>

                <FormField
                  label="Loan Status"
                  error={errors.status?.message}
                  description="Current loan status"
                >
                  <Select
                    value={watch('status') || loan.status}
                    onValueChange={(value: LoanStatus) => setValue('status', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="DEFAULTED">Defaulted</SelectItem>
                      <SelectItem value="OVERDUE">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Annual Interest Rate"
                  error={errors.interestRate?.message}
                  description="Interest rate as a percentage (e.g., 5.5)"
                >
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      {...register('interestRate', {
                        valueAsNumber: true,
                        ...validationRules.interestRate,
                      })}
                      placeholder="5.50"
                      className="pr-8"
                      disabled={isSubmitting}
                      onFocus={(e) => e.target.select()}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      %
                    </span>
                  </div>
                </FormField>

                <FormField
                  label="Loan Term"
                  error={errors.termMonths?.message}
                  description="Duration of the loan in months"
                >
                  <div className="relative">
                    <Input
                      type="number"
                      min="1"
                      max="360"
                      {...register('termMonths', {
                        valueAsNumber: true,
                        ...validationRules.termMonths,
                      })}
                      placeholder="12"
                      className="pr-16"
                      disabled={isSubmitting}
                      onFocus={(e) => e.target.select()}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      months
                    </span>
                  </div>
                </FormField>
              </div>
            </CardContent>
          </Card>

          {/* Loan Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Loan Configuration
              </CardTitle>
              <CardDescription>
                Update how interest is calculated and payment frequency.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Interest Calculation"
                  error={errors.interestCalculationType?.message}
                  description="How interest is calculated over the loan term"
                >
                  <Select
                    value={watch('interestCalculationType') || loan.interestCalculationType}
                    onValueChange={(value: InterestCalculationType) =>
                      setValue('interestCalculationType', value)
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select calculation method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SIMPLE">Simple Interest</SelectItem>
                      <SelectItem value="AMORTIZED">Amortized</SelectItem>
                      <SelectItem value="INTEREST_ONLY">Interest Only</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField
                  label="Payment Frequency"
                  error={errors.paymentFrequency?.message}
                  description="How often payments are made"
                >
                  <Select
                    value={watch('paymentFrequency') || loan.paymentFrequency}
                    onValueChange={(value: PaymentFrequency) => setValue('paymentFrequency', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="BI_WEEKLY">Bi-Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Start Date"
                  error={errors.startDate?.message}
                  description="Loan start date"
                >
                  <Input
                    type="date"
                    {...register('startDate', validationRules.startDate)}
                    disabled={isSubmitting}
                  />
                </FormField>

                <FormField
                  label="End Date"
                  description="Automatically calculated based on start date and term"
                >
                  <Input
                    type="date"
                    {...register('endDate')}
                    disabled={true}
                    className="bg-muted text-muted-foreground"
                  />
                </FormField>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Additional Information
              </CardTitle>
              <CardDescription>Update notes and collateral information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                label="Notes"
                error={errors.notes?.message}
                description="Any additional information about this loan"
              >
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  placeholder="Enter any notes about this loan..."
                  disabled={isSubmitting}
                />
              </FormField>

              <FormField
                label="Collateral"
                error={errors.collateral?.message}
                description="Description of any collateral securing this loan"
              >
                <Input
                  {...register('collateral')}
                  placeholder="e.g., 2020 Honda Civic, Property deed, etc."
                  disabled={isSubmitting}
                />
              </FormField>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Payment Preview */}
        <div className="space-y-4">
          {/* Payment Preview */}
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Payment Preview
              </CardTitle>
              <CardDescription>Updated payment information based on current values</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {preview ? (
                <div className="space-y-4">
                  <div className="rounded-lg bg-muted/50 p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Payment Amount</span>
                      <span className="text-lg font-bold">
                        $
                        {preview.monthlyPayment.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Frequency</span>
                      <span className="capitalize">
                        {preview.frequency.toLowerCase().replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Total Payments</span>
                      <span>{preview.totalPayments}</span>
                    </div>
                    {preview.totalInterest && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Total Interest</span>
                        <span>
                          $
                          {preview.totalInterest.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    )}
                    {preview.totalAmount && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Total Amount</span>
                        <span className="font-medium">
                          $
                          {preview.totalAmount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    *Updated calculations based on current form values.
                  </p>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <p className="text-sm">Enter loan details to see payment preview</p>
                </div>
              )}

              {/* Form Actions */}
              <div className="space-y-3 pt-4 border-t">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <LoadingState text="Updating loan..." size="sm" />
                  ) : (
                    'Update Loan'
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    onCancel?.()
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
