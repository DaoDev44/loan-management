import { z } from 'zod'
import { Prisma } from '@prisma/client'
import Decimal from 'decimal.js'

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////

// DECIMAL
//------------------------------------------------------

export const DecimalJsLikeSchema: z.ZodType<Prisma.DecimalJsLike> = z.object({
  d: z.array(z.number()),
  e: z.number(),
  s: z.number(),
  toFixed: z.any(),
})

export const DECIMAL_STRING_REGEX =
  /^(?:-?Infinity|NaN|-?(?:0[bB][01]+(?:\.[01]+)?(?:[pP][-+]?\d+)?|0[oO][0-7]+(?:\.[0-7]+)?(?:[pP][-+]?\d+)?|0[xX][\da-fA-F]+(?:\.[\da-fA-F]+)?(?:[pP][-+]?\d+)?|(?:\d+|\d*\.\d+)(?:[eE][-+]?\d+)?))$/

export const isValidDecimalInput = (
  v?: null | string | number | Prisma.DecimalJsLike
): v is string | number | Prisma.DecimalJsLike => {
  if (v === undefined || v === null) return false
  return (
    (typeof v === 'object' && 'd' in v && 'e' in v && 's' in v && 'toFixed' in v) ||
    (typeof v === 'string' && DECIMAL_STRING_REGEX.test(v)) ||
    typeof v === 'number'
  )
}

/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum([
  'ReadUncommitted',
  'ReadCommitted',
  'RepeatableRead',
  'Serializable',
])

export const LoanScalarFieldEnumSchema = z.enum([
  'id',
  'borrowerName',
  'borrowerEmail',
  'borrowerPhone',
  'principal',
  'interestRate',
  'startDate',
  'endDate',
  'termMonths',
  'interestCalculationType',
  'paymentFrequency',
  'status',
  'balance',
  'notes',
  'collateral',
  'deletedAt',
  'createdAt',
  'updatedAt',
])

export const PaymentScalarFieldEnumSchema = z.enum([
  'id',
  'amount',
  'date',
  'notes',
  'deletedAt',
  'loanId',
  'createdAt',
])

export const SortOrderSchema = z.enum(['asc', 'desc'])

export const QueryModeSchema = z.enum(['default', 'insensitive'])

export const NullsOrderSchema = z.enum(['first', 'last'])

export const LoanStatusSchema = z.enum(['ACTIVE', 'COMPLETED', 'OVERDUE', 'DEFAULTED'])

export type LoanStatusType = `${z.infer<typeof LoanStatusSchema>}`

export const InterestCalculationTypeSchema = z.enum(['SIMPLE', 'AMORTIZED', 'INTEREST_ONLY'])

export type InterestCalculationTypeType = `${z.infer<typeof InterestCalculationTypeSchema>}`

export const PaymentFrequencySchema = z.enum(['MONTHLY', 'BI_WEEKLY'])

export type PaymentFrequencyType = `${z.infer<typeof PaymentFrequencySchema>}`

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// LOAN SCHEMA
/////////////////////////////////////////

export const LoanSchema = z.object({
  interestCalculationType: InterestCalculationTypeSchema,
  paymentFrequency: PaymentFrequencySchema,
  status: LoanStatusSchema,
  id: z.cuid(),
  borrowerName: z.string(),
  borrowerEmail: z.string(),
  borrowerPhone: z.string().nullable(),
  principal: z.instanceof(Prisma.Decimal, {
    message: "Field 'principal' must be a Decimal. Location: ['Models', 'Loan']",
  }),
  interestRate: z.number(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  termMonths: z.number().int(),
  balance: z.instanceof(Prisma.Decimal, {
    message: "Field 'balance' must be a Decimal. Location: ['Models', 'Loan']",
  }),
  notes: z.string().nullable(),
  collateral: z.string().nullable(),
  deletedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Loan = z.infer<typeof LoanSchema>

/////////////////////////////////////////
// PAYMENT SCHEMA
/////////////////////////////////////////

export const PaymentSchema = z.object({
  id: z.cuid(),
  amount: z.instanceof(Prisma.Decimal, {
    message: "Field 'amount' must be a Decimal. Location: ['Models', 'Payment']",
  }),
  date: z.coerce.date(),
  notes: z.string().nullable(),
  deletedAt: z.coerce.date().nullable(),
  loanId: z.string(),
  createdAt: z.coerce.date(),
})

export type Payment = z.infer<typeof PaymentSchema>

/////////////////////////////////////////
// SELECT & INCLUDE
/////////////////////////////////////////

// LOAN
//------------------------------------------------------

export const LoanIncludeSchema: z.ZodType<Prisma.LoanInclude> = z
  .object({
    payments: z.union([z.boolean(), z.lazy(() => PaymentFindManyArgsSchema)]).optional(),
    _count: z.union([z.boolean(), z.lazy(() => LoanCountOutputTypeArgsSchema)]).optional(),
  })
  .strict()

export const LoanArgsSchema: z.ZodType<Prisma.LoanDefaultArgs> = z
  .object({
    select: z.lazy(() => LoanSelectSchema).optional(),
    include: z.lazy(() => LoanIncludeSchema).optional(),
  })
  .strict()

export const LoanCountOutputTypeArgsSchema: z.ZodType<Prisma.LoanCountOutputTypeDefaultArgs> = z
  .object({
    select: z.lazy(() => LoanCountOutputTypeSelectSchema).nullish(),
  })
  .strict()

export const LoanCountOutputTypeSelectSchema: z.ZodType<Prisma.LoanCountOutputTypeSelect> = z
  .object({
    payments: z.boolean().optional(),
  })
  .strict()

export const LoanSelectSchema: z.ZodType<Prisma.LoanSelect> = z
  .object({
    id: z.boolean().optional(),
    borrowerName: z.boolean().optional(),
    borrowerEmail: z.boolean().optional(),
    borrowerPhone: z.boolean().optional(),
    principal: z.boolean().optional(),
    interestRate: z.boolean().optional(),
    startDate: z.boolean().optional(),
    endDate: z.boolean().optional(),
    termMonths: z.boolean().optional(),
    interestCalculationType: z.boolean().optional(),
    paymentFrequency: z.boolean().optional(),
    status: z.boolean().optional(),
    balance: z.boolean().optional(),
    notes: z.boolean().optional(),
    collateral: z.boolean().optional(),
    deletedAt: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    payments: z.union([z.boolean(), z.lazy(() => PaymentFindManyArgsSchema)]).optional(),
    _count: z.union([z.boolean(), z.lazy(() => LoanCountOutputTypeArgsSchema)]).optional(),
  })
  .strict()

// PAYMENT
//------------------------------------------------------

export const PaymentIncludeSchema: z.ZodType<Prisma.PaymentInclude> = z
  .object({
    loan: z.union([z.boolean(), z.lazy(() => LoanArgsSchema)]).optional(),
  })
  .strict()

export const PaymentArgsSchema: z.ZodType<Prisma.PaymentDefaultArgs> = z
  .object({
    select: z.lazy(() => PaymentSelectSchema).optional(),
    include: z.lazy(() => PaymentIncludeSchema).optional(),
  })
  .strict()

export const PaymentSelectSchema: z.ZodType<Prisma.PaymentSelect> = z
  .object({
    id: z.boolean().optional(),
    amount: z.boolean().optional(),
    date: z.boolean().optional(),
    notes: z.boolean().optional(),
    deletedAt: z.boolean().optional(),
    loanId: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    loan: z.union([z.boolean(), z.lazy(() => LoanArgsSchema)]).optional(),
  })
  .strict()

/////////////////////////////////////////
// INPUT TYPES
/////////////////////////////////////////

export const LoanWhereInputSchema: z.ZodType<Prisma.LoanWhereInput> = z.strictObject({
  AND: z
    .union([z.lazy(() => LoanWhereInputSchema), z.lazy(() => LoanWhereInputSchema).array()])
    .optional(),
  OR: z
    .lazy(() => LoanWhereInputSchema)
    .array()
    .optional(),
  NOT: z
    .union([z.lazy(() => LoanWhereInputSchema), z.lazy(() => LoanWhereInputSchema).array()])
    .optional(),
  id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
  borrowerName: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
  borrowerEmail: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
  borrowerPhone: z
    .union([z.lazy(() => StringNullableFilterSchema), z.string()])
    .optional()
    .nullable(),
  principal: z
    .union([
      z.lazy(() => DecimalFilterSchema),
      z
        .union([
          z.number(),
          z.string(),
          z.instanceof(Decimal),
          z.instanceof(Prisma.Decimal),
          DecimalJsLikeSchema,
        ])
        .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
    ])
    .optional(),
  interestRate: z.union([z.lazy(() => FloatFilterSchema), z.number()]).optional(),
  startDate: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
  endDate: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
  termMonths: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
  interestCalculationType: z
    .union([
      z.lazy(() => EnumInterestCalculationTypeFilterSchema),
      z.lazy(() => InterestCalculationTypeSchema),
    ])
    .optional(),
  paymentFrequency: z
    .union([z.lazy(() => EnumPaymentFrequencyFilterSchema), z.lazy(() => PaymentFrequencySchema)])
    .optional(),
  status: z
    .union([z.lazy(() => EnumLoanStatusFilterSchema), z.lazy(() => LoanStatusSchema)])
    .optional(),
  balance: z
    .union([
      z.lazy(() => DecimalFilterSchema),
      z
        .union([
          z.number(),
          z.string(),
          z.instanceof(Decimal),
          z.instanceof(Prisma.Decimal),
          DecimalJsLikeSchema,
        ])
        .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
    ])
    .optional(),
  notes: z
    .union([z.lazy(() => StringNullableFilterSchema), z.string()])
    .optional()
    .nullable(),
  collateral: z
    .union([z.lazy(() => StringNullableFilterSchema), z.string()])
    .optional()
    .nullable(),
  deletedAt: z
    .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
    .optional()
    .nullable(),
  createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
  updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
  payments: z.lazy(() => PaymentListRelationFilterSchema).optional(),
})

export const LoanOrderByWithRelationInputSchema: z.ZodType<Prisma.LoanOrderByWithRelationInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    borrowerName: z.lazy(() => SortOrderSchema).optional(),
    borrowerEmail: z.lazy(() => SortOrderSchema).optional(),
    borrowerPhone: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    principal: z.lazy(() => SortOrderSchema).optional(),
    interestRate: z.lazy(() => SortOrderSchema).optional(),
    startDate: z.lazy(() => SortOrderSchema).optional(),
    endDate: z.lazy(() => SortOrderSchema).optional(),
    termMonths: z.lazy(() => SortOrderSchema).optional(),
    interestCalculationType: z.lazy(() => SortOrderSchema).optional(),
    paymentFrequency: z.lazy(() => SortOrderSchema).optional(),
    status: z.lazy(() => SortOrderSchema).optional(),
    balance: z.lazy(() => SortOrderSchema).optional(),
    notes: z.union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)]).optional(),
    collateral: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    deletedAt: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
    payments: z.lazy(() => PaymentOrderByRelationAggregateInputSchema).optional(),
  })

export const LoanWhereUniqueInputSchema: z.ZodType<Prisma.LoanWhereUniqueInput> = z
  .object({
    id: z.cuid(),
  })
  .and(
    z.strictObject({
      id: z.cuid().optional(),
      AND: z
        .union([z.lazy(() => LoanWhereInputSchema), z.lazy(() => LoanWhereInputSchema).array()])
        .optional(),
      OR: z
        .lazy(() => LoanWhereInputSchema)
        .array()
        .optional(),
      NOT: z
        .union([z.lazy(() => LoanWhereInputSchema), z.lazy(() => LoanWhereInputSchema).array()])
        .optional(),
      borrowerName: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
      borrowerEmail: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
      borrowerPhone: z
        .union([z.lazy(() => StringNullableFilterSchema), z.string()])
        .optional()
        .nullable(),
      principal: z
        .union([
          z.lazy(() => DecimalFilterSchema),
          z
            .union([
              z.number(),
              z.string(),
              z.instanceof(Decimal),
              z.instanceof(Prisma.Decimal),
              DecimalJsLikeSchema,
            ])
            .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
        ])
        .optional(),
      interestRate: z.union([z.lazy(() => FloatFilterSchema), z.number()]).optional(),
      startDate: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
      endDate: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
      termMonths: z.union([z.lazy(() => IntFilterSchema), z.number().int()]).optional(),
      interestCalculationType: z
        .union([
          z.lazy(() => EnumInterestCalculationTypeFilterSchema),
          z.lazy(() => InterestCalculationTypeSchema),
        ])
        .optional(),
      paymentFrequency: z
        .union([
          z.lazy(() => EnumPaymentFrequencyFilterSchema),
          z.lazy(() => PaymentFrequencySchema),
        ])
        .optional(),
      status: z
        .union([z.lazy(() => EnumLoanStatusFilterSchema), z.lazy(() => LoanStatusSchema)])
        .optional(),
      balance: z
        .union([
          z.lazy(() => DecimalFilterSchema),
          z
            .union([
              z.number(),
              z.string(),
              z.instanceof(Decimal),
              z.instanceof(Prisma.Decimal),
              DecimalJsLikeSchema,
            ])
            .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
        ])
        .optional(),
      notes: z
        .union([z.lazy(() => StringNullableFilterSchema), z.string()])
        .optional()
        .nullable(),
      collateral: z
        .union([z.lazy(() => StringNullableFilterSchema), z.string()])
        .optional()
        .nullable(),
      deletedAt: z
        .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
        .optional()
        .nullable(),
      createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
      updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
      payments: z.lazy(() => PaymentListRelationFilterSchema).optional(),
    })
  )

export const LoanOrderByWithAggregationInputSchema: z.ZodType<Prisma.LoanOrderByWithAggregationInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    borrowerName: z.lazy(() => SortOrderSchema).optional(),
    borrowerEmail: z.lazy(() => SortOrderSchema).optional(),
    borrowerPhone: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    principal: z.lazy(() => SortOrderSchema).optional(),
    interestRate: z.lazy(() => SortOrderSchema).optional(),
    startDate: z.lazy(() => SortOrderSchema).optional(),
    endDate: z.lazy(() => SortOrderSchema).optional(),
    termMonths: z.lazy(() => SortOrderSchema).optional(),
    interestCalculationType: z.lazy(() => SortOrderSchema).optional(),
    paymentFrequency: z.lazy(() => SortOrderSchema).optional(),
    status: z.lazy(() => SortOrderSchema).optional(),
    balance: z.lazy(() => SortOrderSchema).optional(),
    notes: z.union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)]).optional(),
    collateral: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    deletedAt: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
    _count: z.lazy(() => LoanCountOrderByAggregateInputSchema).optional(),
    _avg: z.lazy(() => LoanAvgOrderByAggregateInputSchema).optional(),
    _max: z.lazy(() => LoanMaxOrderByAggregateInputSchema).optional(),
    _min: z.lazy(() => LoanMinOrderByAggregateInputSchema).optional(),
    _sum: z.lazy(() => LoanSumOrderByAggregateInputSchema).optional(),
  })

export const LoanScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.LoanScalarWhereWithAggregatesInput> =
  z.strictObject({
    AND: z
      .union([
        z.lazy(() => LoanScalarWhereWithAggregatesInputSchema),
        z.lazy(() => LoanScalarWhereWithAggregatesInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => LoanScalarWhereWithAggregatesInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => LoanScalarWhereWithAggregatesInputSchema),
        z.lazy(() => LoanScalarWhereWithAggregatesInputSchema).array(),
      ])
      .optional(),
    id: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    borrowerName: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    borrowerEmail: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    borrowerPhone: z
      .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
      .optional()
      .nullable(),
    principal: z
      .union([
        z.lazy(() => DecimalWithAggregatesFilterSchema),
        z
          .union([
            z.number(),
            z.string(),
            z.instanceof(Decimal),
            z.instanceof(Prisma.Decimal),
            DecimalJsLikeSchema,
          ])
          .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
      ])
      .optional(),
    interestRate: z.union([z.lazy(() => FloatWithAggregatesFilterSchema), z.number()]).optional(),
    startDate: z
      .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
      .optional(),
    endDate: z
      .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
      .optional(),
    termMonths: z.union([z.lazy(() => IntWithAggregatesFilterSchema), z.number()]).optional(),
    interestCalculationType: z
      .union([
        z.lazy(() => EnumInterestCalculationTypeWithAggregatesFilterSchema),
        z.lazy(() => InterestCalculationTypeSchema),
      ])
      .optional(),
    paymentFrequency: z
      .union([
        z.lazy(() => EnumPaymentFrequencyWithAggregatesFilterSchema),
        z.lazy(() => PaymentFrequencySchema),
      ])
      .optional(),
    status: z
      .union([
        z.lazy(() => EnumLoanStatusWithAggregatesFilterSchema),
        z.lazy(() => LoanStatusSchema),
      ])
      .optional(),
    balance: z
      .union([
        z.lazy(() => DecimalWithAggregatesFilterSchema),
        z
          .union([
            z.number(),
            z.string(),
            z.instanceof(Decimal),
            z.instanceof(Prisma.Decimal),
            DecimalJsLikeSchema,
          ])
          .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
      ])
      .optional(),
    notes: z
      .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
      .optional()
      .nullable(),
    collateral: z
      .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
      .optional()
      .nullable(),
    deletedAt: z
      .union([z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date()])
      .optional()
      .nullable(),
    createdAt: z
      .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
      .optional(),
    updatedAt: z
      .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
      .optional(),
  })

export const PaymentWhereInputSchema: z.ZodType<Prisma.PaymentWhereInput> = z.strictObject({
  AND: z
    .union([z.lazy(() => PaymentWhereInputSchema), z.lazy(() => PaymentWhereInputSchema).array()])
    .optional(),
  OR: z
    .lazy(() => PaymentWhereInputSchema)
    .array()
    .optional(),
  NOT: z
    .union([z.lazy(() => PaymentWhereInputSchema), z.lazy(() => PaymentWhereInputSchema).array()])
    .optional(),
  id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
  amount: z
    .union([
      z.lazy(() => DecimalFilterSchema),
      z
        .union([
          z.number(),
          z.string(),
          z.instanceof(Decimal),
          z.instanceof(Prisma.Decimal),
          DecimalJsLikeSchema,
        ])
        .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
    ])
    .optional(),
  date: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
  notes: z
    .union([z.lazy(() => StringNullableFilterSchema), z.string()])
    .optional()
    .nullable(),
  deletedAt: z
    .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
    .optional()
    .nullable(),
  loanId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
  createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
  loan: z
    .union([z.lazy(() => LoanScalarRelationFilterSchema), z.lazy(() => LoanWhereInputSchema)])
    .optional(),
})

export const PaymentOrderByWithRelationInputSchema: z.ZodType<Prisma.PaymentOrderByWithRelationInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    amount: z.lazy(() => SortOrderSchema).optional(),
    date: z.lazy(() => SortOrderSchema).optional(),
    notes: z.union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)]).optional(),
    deletedAt: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    loanId: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    loan: z.lazy(() => LoanOrderByWithRelationInputSchema).optional(),
  })

export const PaymentWhereUniqueInputSchema: z.ZodType<Prisma.PaymentWhereUniqueInput> = z
  .object({
    id: z.cuid(),
  })
  .and(
    z.strictObject({
      id: z.cuid().optional(),
      AND: z
        .union([
          z.lazy(() => PaymentWhereInputSchema),
          z.lazy(() => PaymentWhereInputSchema).array(),
        ])
        .optional(),
      OR: z
        .lazy(() => PaymentWhereInputSchema)
        .array()
        .optional(),
      NOT: z
        .union([
          z.lazy(() => PaymentWhereInputSchema),
          z.lazy(() => PaymentWhereInputSchema).array(),
        ])
        .optional(),
      amount: z
        .union([
          z.lazy(() => DecimalFilterSchema),
          z
            .union([
              z.number(),
              z.string(),
              z.instanceof(Decimal),
              z.instanceof(Prisma.Decimal),
              DecimalJsLikeSchema,
            ])
            .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
        ])
        .optional(),
      date: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
      notes: z
        .union([z.lazy(() => StringNullableFilterSchema), z.string()])
        .optional()
        .nullable(),
      deletedAt: z
        .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
        .optional()
        .nullable(),
      loanId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
      createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
      loan: z
        .union([z.lazy(() => LoanScalarRelationFilterSchema), z.lazy(() => LoanWhereInputSchema)])
        .optional(),
    })
  )

export const PaymentOrderByWithAggregationInputSchema: z.ZodType<Prisma.PaymentOrderByWithAggregationInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    amount: z.lazy(() => SortOrderSchema).optional(),
    date: z.lazy(() => SortOrderSchema).optional(),
    notes: z.union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)]).optional(),
    deletedAt: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    loanId: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    _count: z.lazy(() => PaymentCountOrderByAggregateInputSchema).optional(),
    _avg: z.lazy(() => PaymentAvgOrderByAggregateInputSchema).optional(),
    _max: z.lazy(() => PaymentMaxOrderByAggregateInputSchema).optional(),
    _min: z.lazy(() => PaymentMinOrderByAggregateInputSchema).optional(),
    _sum: z.lazy(() => PaymentSumOrderByAggregateInputSchema).optional(),
  })

export const PaymentScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.PaymentScalarWhereWithAggregatesInput> =
  z.strictObject({
    AND: z
      .union([
        z.lazy(() => PaymentScalarWhereWithAggregatesInputSchema),
        z.lazy(() => PaymentScalarWhereWithAggregatesInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => PaymentScalarWhereWithAggregatesInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => PaymentScalarWhereWithAggregatesInputSchema),
        z.lazy(() => PaymentScalarWhereWithAggregatesInputSchema).array(),
      ])
      .optional(),
    id: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    amount: z
      .union([
        z.lazy(() => DecimalWithAggregatesFilterSchema),
        z
          .union([
            z.number(),
            z.string(),
            z.instanceof(Decimal),
            z.instanceof(Prisma.Decimal),
            DecimalJsLikeSchema,
          ])
          .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
      ])
      .optional(),
    date: z.union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()]).optional(),
    notes: z
      .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
      .optional()
      .nullable(),
    deletedAt: z
      .union([z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date()])
      .optional()
      .nullable(),
    loanId: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    createdAt: z
      .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
      .optional(),
  })

export const LoanCreateInputSchema: z.ZodType<Prisma.LoanCreateInput> = z.strictObject({
  id: z.cuid().optional(),
  borrowerName: z.string(),
  borrowerEmail: z.string(),
  borrowerPhone: z.string().optional().nullable(),
  principal: z
    .union([
      z.number(),
      z.string(),
      z.instanceof(Decimal),
      z.instanceof(Prisma.Decimal),
      DecimalJsLikeSchema,
    ])
    .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  interestRate: z.number(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  termMonths: z.number().int(),
  interestCalculationType: z.lazy(() => InterestCalculationTypeSchema).optional(),
  paymentFrequency: z.lazy(() => PaymentFrequencySchema).optional(),
  status: z.lazy(() => LoanStatusSchema).optional(),
  balance: z
    .union([
      z.number(),
      z.string(),
      z.instanceof(Decimal),
      z.instanceof(Prisma.Decimal),
      DecimalJsLikeSchema,
    ])
    .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  notes: z.string().optional().nullable(),
  collateral: z.string().optional().nullable(),
  deletedAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  payments: z.lazy(() => PaymentCreateNestedManyWithoutLoanInputSchema).optional(),
})

export const LoanUncheckedCreateInputSchema: z.ZodType<Prisma.LoanUncheckedCreateInput> =
  z.strictObject({
    id: z.cuid().optional(),
    borrowerName: z.string(),
    borrowerEmail: z.string(),
    borrowerPhone: z.string().optional().nullable(),
    principal: z
      .union([
        z.number(),
        z.string(),
        z.instanceof(Decimal),
        z.instanceof(Prisma.Decimal),
        DecimalJsLikeSchema,
      ])
      .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
    interestRate: z.number(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    termMonths: z.number().int(),
    interestCalculationType: z.lazy(() => InterestCalculationTypeSchema).optional(),
    paymentFrequency: z.lazy(() => PaymentFrequencySchema).optional(),
    status: z.lazy(() => LoanStatusSchema).optional(),
    balance: z
      .union([
        z.number(),
        z.string(),
        z.instanceof(Decimal),
        z.instanceof(Prisma.Decimal),
        DecimalJsLikeSchema,
      ])
      .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
    notes: z.string().optional().nullable(),
    collateral: z.string().optional().nullable(),
    deletedAt: z.coerce.date().optional().nullable(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    payments: z.lazy(() => PaymentUncheckedCreateNestedManyWithoutLoanInputSchema).optional(),
  })

export const LoanUpdateInputSchema: z.ZodType<Prisma.LoanUpdateInput> = z.strictObject({
  id: z.union([z.cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  borrowerName: z
    .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
    .optional(),
  borrowerEmail: z
    .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
    .optional(),
  borrowerPhone: z
    .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
    .optional()
    .nullable(),
  principal: z
    .union([
      z
        .union([
          z.number(),
          z.string(),
          z.instanceof(Decimal),
          z.instanceof(Prisma.Decimal),
          DecimalJsLikeSchema,
        ])
        .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
      z.lazy(() => DecimalFieldUpdateOperationsInputSchema),
    ])
    .optional(),
  interestRate: z
    .union([z.number(), z.lazy(() => FloatFieldUpdateOperationsInputSchema)])
    .optional(),
  startDate: z
    .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
    .optional(),
  endDate: z
    .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
    .optional(),
  termMonths: z
    .union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)])
    .optional(),
  interestCalculationType: z
    .union([
      z.lazy(() => InterestCalculationTypeSchema),
      z.lazy(() => EnumInterestCalculationTypeFieldUpdateOperationsInputSchema),
    ])
    .optional(),
  paymentFrequency: z
    .union([
      z.lazy(() => PaymentFrequencySchema),
      z.lazy(() => EnumPaymentFrequencyFieldUpdateOperationsInputSchema),
    ])
    .optional(),
  status: z
    .union([
      z.lazy(() => LoanStatusSchema),
      z.lazy(() => EnumLoanStatusFieldUpdateOperationsInputSchema),
    ])
    .optional(),
  balance: z
    .union([
      z
        .union([
          z.number(),
          z.string(),
          z.instanceof(Decimal),
          z.instanceof(Prisma.Decimal),
          DecimalJsLikeSchema,
        ])
        .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
      z.lazy(() => DecimalFieldUpdateOperationsInputSchema),
    ])
    .optional(),
  notes: z
    .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
    .optional()
    .nullable(),
  collateral: z
    .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
    .optional()
    .nullable(),
  deletedAt: z
    .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
    .optional()
    .nullable(),
  createdAt: z
    .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
    .optional(),
  updatedAt: z
    .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
    .optional(),
  payments: z.lazy(() => PaymentUpdateManyWithoutLoanNestedInputSchema).optional(),
})

export const LoanUncheckedUpdateInputSchema: z.ZodType<Prisma.LoanUncheckedUpdateInput> =
  z.strictObject({
    id: z.union([z.cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    borrowerName: z
      .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    borrowerEmail: z
      .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    borrowerPhone: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    principal: z
      .union([
        z
          .union([
            z.number(),
            z.string(),
            z.instanceof(Decimal),
            z.instanceof(Prisma.Decimal),
            DecimalJsLikeSchema,
          ])
          .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
        z.lazy(() => DecimalFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    interestRate: z
      .union([z.number(), z.lazy(() => FloatFieldUpdateOperationsInputSchema)])
      .optional(),
    startDate: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    endDate: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    termMonths: z
      .union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)])
      .optional(),
    interestCalculationType: z
      .union([
        z.lazy(() => InterestCalculationTypeSchema),
        z.lazy(() => EnumInterestCalculationTypeFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    paymentFrequency: z
      .union([
        z.lazy(() => PaymentFrequencySchema),
        z.lazy(() => EnumPaymentFrequencyFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    status: z
      .union([
        z.lazy(() => LoanStatusSchema),
        z.lazy(() => EnumLoanStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    balance: z
      .union([
        z
          .union([
            z.number(),
            z.string(),
            z.instanceof(Decimal),
            z.instanceof(Prisma.Decimal),
            DecimalJsLikeSchema,
          ])
          .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
        z.lazy(() => DecimalFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    notes: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    collateral: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    payments: z.lazy(() => PaymentUncheckedUpdateManyWithoutLoanNestedInputSchema).optional(),
  })

export const LoanCreateManyInputSchema: z.ZodType<Prisma.LoanCreateManyInput> = z.strictObject({
  id: z.cuid().optional(),
  borrowerName: z.string(),
  borrowerEmail: z.string(),
  borrowerPhone: z.string().optional().nullable(),
  principal: z
    .union([
      z.number(),
      z.string(),
      z.instanceof(Decimal),
      z.instanceof(Prisma.Decimal),
      DecimalJsLikeSchema,
    ])
    .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  interestRate: z.number(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  termMonths: z.number().int(),
  interestCalculationType: z.lazy(() => InterestCalculationTypeSchema).optional(),
  paymentFrequency: z.lazy(() => PaymentFrequencySchema).optional(),
  status: z.lazy(() => LoanStatusSchema).optional(),
  balance: z
    .union([
      z.number(),
      z.string(),
      z.instanceof(Decimal),
      z.instanceof(Prisma.Decimal),
      DecimalJsLikeSchema,
    ])
    .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  notes: z.string().optional().nullable(),
  collateral: z.string().optional().nullable(),
  deletedAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
})

export const LoanUpdateManyMutationInputSchema: z.ZodType<Prisma.LoanUpdateManyMutationInput> =
  z.strictObject({
    id: z.union([z.cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    borrowerName: z
      .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    borrowerEmail: z
      .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    borrowerPhone: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    principal: z
      .union([
        z
          .union([
            z.number(),
            z.string(),
            z.instanceof(Decimal),
            z.instanceof(Prisma.Decimal),
            DecimalJsLikeSchema,
          ])
          .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
        z.lazy(() => DecimalFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    interestRate: z
      .union([z.number(), z.lazy(() => FloatFieldUpdateOperationsInputSchema)])
      .optional(),
    startDate: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    endDate: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    termMonths: z
      .union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)])
      .optional(),
    interestCalculationType: z
      .union([
        z.lazy(() => InterestCalculationTypeSchema),
        z.lazy(() => EnumInterestCalculationTypeFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    paymentFrequency: z
      .union([
        z.lazy(() => PaymentFrequencySchema),
        z.lazy(() => EnumPaymentFrequencyFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    status: z
      .union([
        z.lazy(() => LoanStatusSchema),
        z.lazy(() => EnumLoanStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    balance: z
      .union([
        z
          .union([
            z.number(),
            z.string(),
            z.instanceof(Decimal),
            z.instanceof(Prisma.Decimal),
            DecimalJsLikeSchema,
          ])
          .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
        z.lazy(() => DecimalFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    notes: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    collateral: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
  })

export const LoanUncheckedUpdateManyInputSchema: z.ZodType<Prisma.LoanUncheckedUpdateManyInput> =
  z.strictObject({
    id: z.union([z.cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    borrowerName: z
      .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    borrowerEmail: z
      .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    borrowerPhone: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    principal: z
      .union([
        z
          .union([
            z.number(),
            z.string(),
            z.instanceof(Decimal),
            z.instanceof(Prisma.Decimal),
            DecimalJsLikeSchema,
          ])
          .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
        z.lazy(() => DecimalFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    interestRate: z
      .union([z.number(), z.lazy(() => FloatFieldUpdateOperationsInputSchema)])
      .optional(),
    startDate: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    endDate: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    termMonths: z
      .union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)])
      .optional(),
    interestCalculationType: z
      .union([
        z.lazy(() => InterestCalculationTypeSchema),
        z.lazy(() => EnumInterestCalculationTypeFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    paymentFrequency: z
      .union([
        z.lazy(() => PaymentFrequencySchema),
        z.lazy(() => EnumPaymentFrequencyFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    status: z
      .union([
        z.lazy(() => LoanStatusSchema),
        z.lazy(() => EnumLoanStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    balance: z
      .union([
        z
          .union([
            z.number(),
            z.string(),
            z.instanceof(Decimal),
            z.instanceof(Prisma.Decimal),
            DecimalJsLikeSchema,
          ])
          .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
        z.lazy(() => DecimalFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    notes: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    collateral: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
  })

export const PaymentCreateInputSchema: z.ZodType<Prisma.PaymentCreateInput> = z.strictObject({
  id: z.cuid().optional(),
  amount: z
    .union([
      z.number(),
      z.string(),
      z.instanceof(Decimal),
      z.instanceof(Prisma.Decimal),
      DecimalJsLikeSchema,
    ])
    .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  date: z.coerce.date().optional(),
  notes: z.string().optional().nullable(),
  deletedAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  loan: z.lazy(() => LoanCreateNestedOneWithoutPaymentsInputSchema),
})

export const PaymentUncheckedCreateInputSchema: z.ZodType<Prisma.PaymentUncheckedCreateInput> =
  z.strictObject({
    id: z.cuid().optional(),
    amount: z
      .union([
        z.number(),
        z.string(),
        z.instanceof(Decimal),
        z.instanceof(Prisma.Decimal),
        DecimalJsLikeSchema,
      ])
      .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
    date: z.coerce.date().optional(),
    notes: z.string().optional().nullable(),
    deletedAt: z.coerce.date().optional().nullable(),
    loanId: z.string(),
    createdAt: z.coerce.date().optional(),
  })

export const PaymentUpdateInputSchema: z.ZodType<Prisma.PaymentUpdateInput> = z.strictObject({
  id: z.union([z.cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  amount: z
    .union([
      z
        .union([
          z.number(),
          z.string(),
          z.instanceof(Decimal),
          z.instanceof(Prisma.Decimal),
          DecimalJsLikeSchema,
        ])
        .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
      z.lazy(() => DecimalFieldUpdateOperationsInputSchema),
    ])
    .optional(),
  date: z
    .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
    .optional(),
  notes: z
    .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
    .optional()
    .nullable(),
  deletedAt: z
    .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
    .optional()
    .nullable(),
  createdAt: z
    .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
    .optional(),
  loan: z.lazy(() => LoanUpdateOneRequiredWithoutPaymentsNestedInputSchema).optional(),
})

export const PaymentUncheckedUpdateInputSchema: z.ZodType<Prisma.PaymentUncheckedUpdateInput> =
  z.strictObject({
    id: z.union([z.cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    amount: z
      .union([
        z
          .union([
            z.number(),
            z.string(),
            z.instanceof(Decimal),
            z.instanceof(Prisma.Decimal),
            DecimalJsLikeSchema,
          ])
          .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
        z.lazy(() => DecimalFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    date: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    notes: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    loanId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
  })

export const PaymentCreateManyInputSchema: z.ZodType<Prisma.PaymentCreateManyInput> =
  z.strictObject({
    id: z.cuid().optional(),
    amount: z
      .union([
        z.number(),
        z.string(),
        z.instanceof(Decimal),
        z.instanceof(Prisma.Decimal),
        DecimalJsLikeSchema,
      ])
      .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
    date: z.coerce.date().optional(),
    notes: z.string().optional().nullable(),
    deletedAt: z.coerce.date().optional().nullable(),
    loanId: z.string(),
    createdAt: z.coerce.date().optional(),
  })

export const PaymentUpdateManyMutationInputSchema: z.ZodType<Prisma.PaymentUpdateManyMutationInput> =
  z.strictObject({
    id: z.union([z.cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    amount: z
      .union([
        z
          .union([
            z.number(),
            z.string(),
            z.instanceof(Decimal),
            z.instanceof(Prisma.Decimal),
            DecimalJsLikeSchema,
          ])
          .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
        z.lazy(() => DecimalFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    date: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    notes: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
  })

export const PaymentUncheckedUpdateManyInputSchema: z.ZodType<Prisma.PaymentUncheckedUpdateManyInput> =
  z.strictObject({
    id: z.union([z.cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    amount: z
      .union([
        z
          .union([
            z.number(),
            z.string(),
            z.instanceof(Decimal),
            z.instanceof(Prisma.Decimal),
            DecimalJsLikeSchema,
          ])
          .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
        z.lazy(() => DecimalFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    date: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    notes: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    loanId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
  })

export const StringFilterSchema: z.ZodType<Prisma.StringFilter> = z.strictObject({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([z.string(), z.lazy(() => NestedStringFilterSchema)]).optional(),
})

export const StringNullableFilterSchema: z.ZodType<Prisma.StringNullableFilter> = z.strictObject({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z
    .union([z.string(), z.lazy(() => NestedStringNullableFilterSchema)])
    .optional()
    .nullable(),
})

export const DecimalFilterSchema: z.ZodType<Prisma.DecimalFilter> = z.strictObject({
  equals: z
    .union([
      z.number(),
      z.string(),
      z.instanceof(Decimal),
      z.instanceof(Prisma.Decimal),
      DecimalJsLikeSchema,
    ])
    .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' })
    .optional(),
  in: z
    .union([
      z.number().array(),
      z.string().array(),
      z.instanceof(Decimal).array(),
      z.instanceof(Prisma.Decimal).array(),
      DecimalJsLikeSchema.array(),
    ])
    .refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), {
      message: 'Must be a Decimal',
    })
    .optional(),
  notIn: z
    .union([
      z.number().array(),
      z.string().array(),
      z.instanceof(Decimal).array(),
      z.instanceof(Prisma.Decimal).array(),
      DecimalJsLikeSchema.array(),
    ])
    .refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), {
      message: 'Must be a Decimal',
    })
    .optional(),
  lt: z
    .union([
      z.number(),
      z.string(),
      z.instanceof(Decimal),
      z.instanceof(Prisma.Decimal),
      DecimalJsLikeSchema,
    ])
    .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' })
    .optional(),
  lte: z
    .union([
      z.number(),
      z.string(),
      z.instanceof(Decimal),
      z.instanceof(Prisma.Decimal),
      DecimalJsLikeSchema,
    ])
    .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' })
    .optional(),
  gt: z
    .union([
      z.number(),
      z.string(),
      z.instanceof(Decimal),
      z.instanceof(Prisma.Decimal),
      DecimalJsLikeSchema,
    ])
    .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' })
    .optional(),
  gte: z
    .union([
      z.number(),
      z.string(),
      z.instanceof(Decimal),
      z.instanceof(Prisma.Decimal),
      DecimalJsLikeSchema,
    ])
    .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' })
    .optional(),
  not: z
    .union([
      z
        .union([
          z.number(),
          z.string(),
          z.instanceof(Decimal),
          z.instanceof(Prisma.Decimal),
          DecimalJsLikeSchema,
        ])
        .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
      z.lazy(() => NestedDecimalFilterSchema),
    ])
    .optional(),
})

export const FloatFilterSchema: z.ZodType<Prisma.FloatFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([z.number(), z.lazy(() => NestedFloatFilterSchema)]).optional(),
})

export const DateTimeFilterSchema: z.ZodType<Prisma.DateTimeFilter> = z.strictObject({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([z.coerce.date(), z.lazy(() => NestedDateTimeFilterSchema)]).optional(),
})

export const IntFilterSchema: z.ZodType<Prisma.IntFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([z.number(), z.lazy(() => NestedIntFilterSchema)]).optional(),
})

export const EnumInterestCalculationTypeFilterSchema: z.ZodType<Prisma.EnumInterestCalculationTypeFilter> =
  z.strictObject({
    equals: z.lazy(() => InterestCalculationTypeSchema).optional(),
    in: z
      .lazy(() => InterestCalculationTypeSchema)
      .array()
      .optional(),
    notIn: z
      .lazy(() => InterestCalculationTypeSchema)
      .array()
      .optional(),
    not: z
      .union([
        z.lazy(() => InterestCalculationTypeSchema),
        z.lazy(() => NestedEnumInterestCalculationTypeFilterSchema),
      ])
      .optional(),
  })

export const EnumPaymentFrequencyFilterSchema: z.ZodType<Prisma.EnumPaymentFrequencyFilter> =
  z.strictObject({
    equals: z.lazy(() => PaymentFrequencySchema).optional(),
    in: z
      .lazy(() => PaymentFrequencySchema)
      .array()
      .optional(),
    notIn: z
      .lazy(() => PaymentFrequencySchema)
      .array()
      .optional(),
    not: z
      .union([
        z.lazy(() => PaymentFrequencySchema),
        z.lazy(() => NestedEnumPaymentFrequencyFilterSchema),
      ])
      .optional(),
  })

export const EnumLoanStatusFilterSchema: z.ZodType<Prisma.EnumLoanStatusFilter> = z.strictObject({
  equals: z.lazy(() => LoanStatusSchema).optional(),
  in: z
    .lazy(() => LoanStatusSchema)
    .array()
    .optional(),
  notIn: z
    .lazy(() => LoanStatusSchema)
    .array()
    .optional(),
  not: z
    .union([z.lazy(() => LoanStatusSchema), z.lazy(() => NestedEnumLoanStatusFilterSchema)])
    .optional(),
})

export const DateTimeNullableFilterSchema: z.ZodType<Prisma.DateTimeNullableFilter> =
  z.strictObject({
    equals: z.coerce.date().optional().nullable(),
    in: z.coerce.date().array().optional().nullable(),
    notIn: z.coerce.date().array().optional().nullable(),
    lt: z.coerce.date().optional(),
    lte: z.coerce.date().optional(),
    gt: z.coerce.date().optional(),
    gte: z.coerce.date().optional(),
    not: z
      .union([z.coerce.date(), z.lazy(() => NestedDateTimeNullableFilterSchema)])
      .optional()
      .nullable(),
  })

export const PaymentListRelationFilterSchema: z.ZodType<Prisma.PaymentListRelationFilter> =
  z.strictObject({
    every: z.lazy(() => PaymentWhereInputSchema).optional(),
    some: z.lazy(() => PaymentWhereInputSchema).optional(),
    none: z.lazy(() => PaymentWhereInputSchema).optional(),
  })

export const SortOrderInputSchema: z.ZodType<Prisma.SortOrderInput> = z.strictObject({
  sort: z.lazy(() => SortOrderSchema),
  nulls: z.lazy(() => NullsOrderSchema).optional(),
})

export const PaymentOrderByRelationAggregateInputSchema: z.ZodType<Prisma.PaymentOrderByRelationAggregateInput> =
  z.strictObject({
    _count: z.lazy(() => SortOrderSchema).optional(),
  })

export const LoanCountOrderByAggregateInputSchema: z.ZodType<Prisma.LoanCountOrderByAggregateInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    borrowerName: z.lazy(() => SortOrderSchema).optional(),
    borrowerEmail: z.lazy(() => SortOrderSchema).optional(),
    borrowerPhone: z.lazy(() => SortOrderSchema).optional(),
    principal: z.lazy(() => SortOrderSchema).optional(),
    interestRate: z.lazy(() => SortOrderSchema).optional(),
    startDate: z.lazy(() => SortOrderSchema).optional(),
    endDate: z.lazy(() => SortOrderSchema).optional(),
    termMonths: z.lazy(() => SortOrderSchema).optional(),
    interestCalculationType: z.lazy(() => SortOrderSchema).optional(),
    paymentFrequency: z.lazy(() => SortOrderSchema).optional(),
    status: z.lazy(() => SortOrderSchema).optional(),
    balance: z.lazy(() => SortOrderSchema).optional(),
    notes: z.lazy(() => SortOrderSchema).optional(),
    collateral: z.lazy(() => SortOrderSchema).optional(),
    deletedAt: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
  })

export const LoanAvgOrderByAggregateInputSchema: z.ZodType<Prisma.LoanAvgOrderByAggregateInput> =
  z.strictObject({
    principal: z.lazy(() => SortOrderSchema).optional(),
    interestRate: z.lazy(() => SortOrderSchema).optional(),
    termMonths: z.lazy(() => SortOrderSchema).optional(),
    balance: z.lazy(() => SortOrderSchema).optional(),
  })

export const LoanMaxOrderByAggregateInputSchema: z.ZodType<Prisma.LoanMaxOrderByAggregateInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    borrowerName: z.lazy(() => SortOrderSchema).optional(),
    borrowerEmail: z.lazy(() => SortOrderSchema).optional(),
    borrowerPhone: z.lazy(() => SortOrderSchema).optional(),
    principal: z.lazy(() => SortOrderSchema).optional(),
    interestRate: z.lazy(() => SortOrderSchema).optional(),
    startDate: z.lazy(() => SortOrderSchema).optional(),
    endDate: z.lazy(() => SortOrderSchema).optional(),
    termMonths: z.lazy(() => SortOrderSchema).optional(),
    interestCalculationType: z.lazy(() => SortOrderSchema).optional(),
    paymentFrequency: z.lazy(() => SortOrderSchema).optional(),
    status: z.lazy(() => SortOrderSchema).optional(),
    balance: z.lazy(() => SortOrderSchema).optional(),
    notes: z.lazy(() => SortOrderSchema).optional(),
    collateral: z.lazy(() => SortOrderSchema).optional(),
    deletedAt: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
  })

export const LoanMinOrderByAggregateInputSchema: z.ZodType<Prisma.LoanMinOrderByAggregateInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    borrowerName: z.lazy(() => SortOrderSchema).optional(),
    borrowerEmail: z.lazy(() => SortOrderSchema).optional(),
    borrowerPhone: z.lazy(() => SortOrderSchema).optional(),
    principal: z.lazy(() => SortOrderSchema).optional(),
    interestRate: z.lazy(() => SortOrderSchema).optional(),
    startDate: z.lazy(() => SortOrderSchema).optional(),
    endDate: z.lazy(() => SortOrderSchema).optional(),
    termMonths: z.lazy(() => SortOrderSchema).optional(),
    interestCalculationType: z.lazy(() => SortOrderSchema).optional(),
    paymentFrequency: z.lazy(() => SortOrderSchema).optional(),
    status: z.lazy(() => SortOrderSchema).optional(),
    balance: z.lazy(() => SortOrderSchema).optional(),
    notes: z.lazy(() => SortOrderSchema).optional(),
    collateral: z.lazy(() => SortOrderSchema).optional(),
    deletedAt: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
  })

export const LoanSumOrderByAggregateInputSchema: z.ZodType<Prisma.LoanSumOrderByAggregateInput> =
  z.strictObject({
    principal: z.lazy(() => SortOrderSchema).optional(),
    interestRate: z.lazy(() => SortOrderSchema).optional(),
    termMonths: z.lazy(() => SortOrderSchema).optional(),
    balance: z.lazy(() => SortOrderSchema).optional(),
  })

export const StringWithAggregatesFilterSchema: z.ZodType<Prisma.StringWithAggregatesFilter> =
  z.strictObject({
    equals: z.string().optional(),
    in: z.string().array().optional(),
    notIn: z.string().array().optional(),
    lt: z.string().optional(),
    lte: z.string().optional(),
    gt: z.string().optional(),
    gte: z.string().optional(),
    contains: z.string().optional(),
    startsWith: z.string().optional(),
    endsWith: z.string().optional(),
    mode: z.lazy(() => QueryModeSchema).optional(),
    not: z.union([z.string(), z.lazy(() => NestedStringWithAggregatesFilterSchema)]).optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedStringFilterSchema).optional(),
    _max: z.lazy(() => NestedStringFilterSchema).optional(),
  })

export const StringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.StringNullableWithAggregatesFilter> =
  z.strictObject({
    equals: z.string().optional().nullable(),
    in: z.string().array().optional().nullable(),
    notIn: z.string().array().optional().nullable(),
    lt: z.string().optional(),
    lte: z.string().optional(),
    gt: z.string().optional(),
    gte: z.string().optional(),
    contains: z.string().optional(),
    startsWith: z.string().optional(),
    endsWith: z.string().optional(),
    mode: z.lazy(() => QueryModeSchema).optional(),
    not: z
      .union([z.string(), z.lazy(() => NestedStringNullableWithAggregatesFilterSchema)])
      .optional()
      .nullable(),
    _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
    _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
    _max: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  })

export const DecimalWithAggregatesFilterSchema: z.ZodType<Prisma.DecimalWithAggregatesFilter> =
  z.strictObject({
    equals: z
      .union([
        z.number(),
        z.string(),
        z.instanceof(Decimal),
        z.instanceof(Prisma.Decimal),
        DecimalJsLikeSchema,
      ])
      .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' })
      .optional(),
    in: z
      .union([
        z.number().array(),
        z.string().array(),
        z.instanceof(Decimal).array(),
        z.instanceof(Prisma.Decimal).array(),
        DecimalJsLikeSchema.array(),
      ])
      .refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), {
        message: 'Must be a Decimal',
      })
      .optional(),
    notIn: z
      .union([
        z.number().array(),
        z.string().array(),
        z.instanceof(Decimal).array(),
        z.instanceof(Prisma.Decimal).array(),
        DecimalJsLikeSchema.array(),
      ])
      .refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), {
        message: 'Must be a Decimal',
      })
      .optional(),
    lt: z
      .union([
        z.number(),
        z.string(),
        z.instanceof(Decimal),
        z.instanceof(Prisma.Decimal),
        DecimalJsLikeSchema,
      ])
      .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' })
      .optional(),
    lte: z
      .union([
        z.number(),
        z.string(),
        z.instanceof(Decimal),
        z.instanceof(Prisma.Decimal),
        DecimalJsLikeSchema,
      ])
      .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' })
      .optional(),
    gt: z
      .union([
        z.number(),
        z.string(),
        z.instanceof(Decimal),
        z.instanceof(Prisma.Decimal),
        DecimalJsLikeSchema,
      ])
      .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' })
      .optional(),
    gte: z
      .union([
        z.number(),
        z.string(),
        z.instanceof(Decimal),
        z.instanceof(Prisma.Decimal),
        DecimalJsLikeSchema,
      ])
      .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' })
      .optional(),
    not: z
      .union([
        z
          .union([
            z.number(),
            z.string(),
            z.instanceof(Decimal),
            z.instanceof(Prisma.Decimal),
            DecimalJsLikeSchema,
          ])
          .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
        z.lazy(() => NestedDecimalWithAggregatesFilterSchema),
      ])
      .optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _avg: z.lazy(() => NestedDecimalFilterSchema).optional(),
    _sum: z.lazy(() => NestedDecimalFilterSchema).optional(),
    _min: z.lazy(() => NestedDecimalFilterSchema).optional(),
    _max: z.lazy(() => NestedDecimalFilterSchema).optional(),
  })

export const FloatWithAggregatesFilterSchema: z.ZodType<Prisma.FloatWithAggregatesFilter> =
  z.strictObject({
    equals: z.number().optional(),
    in: z.number().array().optional(),
    notIn: z.number().array().optional(),
    lt: z.number().optional(),
    lte: z.number().optional(),
    gt: z.number().optional(),
    gte: z.number().optional(),
    not: z.union([z.number(), z.lazy(() => NestedFloatWithAggregatesFilterSchema)]).optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
    _sum: z.lazy(() => NestedFloatFilterSchema).optional(),
    _min: z.lazy(() => NestedFloatFilterSchema).optional(),
    _max: z.lazy(() => NestedFloatFilterSchema).optional(),
  })

export const DateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeWithAggregatesFilter> =
  z.strictObject({
    equals: z.coerce.date().optional(),
    in: z.coerce.date().array().optional(),
    notIn: z.coerce.date().array().optional(),
    lt: z.coerce.date().optional(),
    lte: z.coerce.date().optional(),
    gt: z.coerce.date().optional(),
    gte: z.coerce.date().optional(),
    not: z
      .union([z.coerce.date(), z.lazy(() => NestedDateTimeWithAggregatesFilterSchema)])
      .optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
    _max: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  })

export const IntWithAggregatesFilterSchema: z.ZodType<Prisma.IntWithAggregatesFilter> =
  z.strictObject({
    equals: z.number().optional(),
    in: z.number().array().optional(),
    notIn: z.number().array().optional(),
    lt: z.number().optional(),
    lte: z.number().optional(),
    gt: z.number().optional(),
    gte: z.number().optional(),
    not: z.union([z.number(), z.lazy(() => NestedIntWithAggregatesFilterSchema)]).optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
    _sum: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedIntFilterSchema).optional(),
    _max: z.lazy(() => NestedIntFilterSchema).optional(),
  })

export const EnumInterestCalculationTypeWithAggregatesFilterSchema: z.ZodType<Prisma.EnumInterestCalculationTypeWithAggregatesFilter> =
  z.strictObject({
    equals: z.lazy(() => InterestCalculationTypeSchema).optional(),
    in: z
      .lazy(() => InterestCalculationTypeSchema)
      .array()
      .optional(),
    notIn: z
      .lazy(() => InterestCalculationTypeSchema)
      .array()
      .optional(),
    not: z
      .union([
        z.lazy(() => InterestCalculationTypeSchema),
        z.lazy(() => NestedEnumInterestCalculationTypeWithAggregatesFilterSchema),
      ])
      .optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedEnumInterestCalculationTypeFilterSchema).optional(),
    _max: z.lazy(() => NestedEnumInterestCalculationTypeFilterSchema).optional(),
  })

export const EnumPaymentFrequencyWithAggregatesFilterSchema: z.ZodType<Prisma.EnumPaymentFrequencyWithAggregatesFilter> =
  z.strictObject({
    equals: z.lazy(() => PaymentFrequencySchema).optional(),
    in: z
      .lazy(() => PaymentFrequencySchema)
      .array()
      .optional(),
    notIn: z
      .lazy(() => PaymentFrequencySchema)
      .array()
      .optional(),
    not: z
      .union([
        z.lazy(() => PaymentFrequencySchema),
        z.lazy(() => NestedEnumPaymentFrequencyWithAggregatesFilterSchema),
      ])
      .optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedEnumPaymentFrequencyFilterSchema).optional(),
    _max: z.lazy(() => NestedEnumPaymentFrequencyFilterSchema).optional(),
  })

export const EnumLoanStatusWithAggregatesFilterSchema: z.ZodType<Prisma.EnumLoanStatusWithAggregatesFilter> =
  z.strictObject({
    equals: z.lazy(() => LoanStatusSchema).optional(),
    in: z
      .lazy(() => LoanStatusSchema)
      .array()
      .optional(),
    notIn: z
      .lazy(() => LoanStatusSchema)
      .array()
      .optional(),
    not: z
      .union([
        z.lazy(() => LoanStatusSchema),
        z.lazy(() => NestedEnumLoanStatusWithAggregatesFilterSchema),
      ])
      .optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedEnumLoanStatusFilterSchema).optional(),
    _max: z.lazy(() => NestedEnumLoanStatusFilterSchema).optional(),
  })

export const DateTimeNullableWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeNullableWithAggregatesFilter> =
  z.strictObject({
    equals: z.coerce.date().optional().nullable(),
    in: z.coerce.date().array().optional().nullable(),
    notIn: z.coerce.date().array().optional().nullable(),
    lt: z.coerce.date().optional(),
    lte: z.coerce.date().optional(),
    gt: z.coerce.date().optional(),
    gte: z.coerce.date().optional(),
    not: z
      .union([z.coerce.date(), z.lazy(() => NestedDateTimeNullableWithAggregatesFilterSchema)])
      .optional()
      .nullable(),
    _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
    _min: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
    _max: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
  })

export const LoanScalarRelationFilterSchema: z.ZodType<Prisma.LoanScalarRelationFilter> =
  z.strictObject({
    is: z.lazy(() => LoanWhereInputSchema).optional(),
    isNot: z.lazy(() => LoanWhereInputSchema).optional(),
  })

export const PaymentCountOrderByAggregateInputSchema: z.ZodType<Prisma.PaymentCountOrderByAggregateInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    amount: z.lazy(() => SortOrderSchema).optional(),
    date: z.lazy(() => SortOrderSchema).optional(),
    notes: z.lazy(() => SortOrderSchema).optional(),
    deletedAt: z.lazy(() => SortOrderSchema).optional(),
    loanId: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
  })

export const PaymentAvgOrderByAggregateInputSchema: z.ZodType<Prisma.PaymentAvgOrderByAggregateInput> =
  z.strictObject({
    amount: z.lazy(() => SortOrderSchema).optional(),
  })

export const PaymentMaxOrderByAggregateInputSchema: z.ZodType<Prisma.PaymentMaxOrderByAggregateInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    amount: z.lazy(() => SortOrderSchema).optional(),
    date: z.lazy(() => SortOrderSchema).optional(),
    notes: z.lazy(() => SortOrderSchema).optional(),
    deletedAt: z.lazy(() => SortOrderSchema).optional(),
    loanId: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
  })

export const PaymentMinOrderByAggregateInputSchema: z.ZodType<Prisma.PaymentMinOrderByAggregateInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    amount: z.lazy(() => SortOrderSchema).optional(),
    date: z.lazy(() => SortOrderSchema).optional(),
    notes: z.lazy(() => SortOrderSchema).optional(),
    deletedAt: z.lazy(() => SortOrderSchema).optional(),
    loanId: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
  })

export const PaymentSumOrderByAggregateInputSchema: z.ZodType<Prisma.PaymentSumOrderByAggregateInput> =
  z.strictObject({
    amount: z.lazy(() => SortOrderSchema).optional(),
  })

export const PaymentCreateNestedManyWithoutLoanInputSchema: z.ZodType<Prisma.PaymentCreateNestedManyWithoutLoanInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => PaymentCreateWithoutLoanInputSchema),
        z.lazy(() => PaymentCreateWithoutLoanInputSchema).array(),
        z.lazy(() => PaymentUncheckedCreateWithoutLoanInputSchema),
        z.lazy(() => PaymentUncheckedCreateWithoutLoanInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => PaymentCreateOrConnectWithoutLoanInputSchema),
        z.lazy(() => PaymentCreateOrConnectWithoutLoanInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => PaymentCreateManyLoanInputEnvelopeSchema).optional(),
    connect: z
      .union([
        z.lazy(() => PaymentWhereUniqueInputSchema),
        z.lazy(() => PaymentWhereUniqueInputSchema).array(),
      ])
      .optional(),
  })

export const PaymentUncheckedCreateNestedManyWithoutLoanInputSchema: z.ZodType<Prisma.PaymentUncheckedCreateNestedManyWithoutLoanInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => PaymentCreateWithoutLoanInputSchema),
        z.lazy(() => PaymentCreateWithoutLoanInputSchema).array(),
        z.lazy(() => PaymentUncheckedCreateWithoutLoanInputSchema),
        z.lazy(() => PaymentUncheckedCreateWithoutLoanInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => PaymentCreateOrConnectWithoutLoanInputSchema),
        z.lazy(() => PaymentCreateOrConnectWithoutLoanInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => PaymentCreateManyLoanInputEnvelopeSchema).optional(),
    connect: z
      .union([
        z.lazy(() => PaymentWhereUniqueInputSchema),
        z.lazy(() => PaymentWhereUniqueInputSchema).array(),
      ])
      .optional(),
  })

export const StringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.StringFieldUpdateOperationsInput> =
  z.strictObject({
    set: z.string().optional(),
  })

export const NullableStringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableStringFieldUpdateOperationsInput> =
  z.strictObject({
    set: z.string().optional().nullable(),
  })

export const DecimalFieldUpdateOperationsInputSchema: z.ZodType<Prisma.DecimalFieldUpdateOperationsInput> =
  z.strictObject({
    set: z
      .union([
        z.number(),
        z.string(),
        z.instanceof(Decimal),
        z.instanceof(Prisma.Decimal),
        DecimalJsLikeSchema,
      ])
      .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' })
      .optional(),
    increment: z
      .union([
        z.number(),
        z.string(),
        z.instanceof(Decimal),
        z.instanceof(Prisma.Decimal),
        DecimalJsLikeSchema,
      ])
      .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' })
      .optional(),
    decrement: z
      .union([
        z.number(),
        z.string(),
        z.instanceof(Decimal),
        z.instanceof(Prisma.Decimal),
        DecimalJsLikeSchema,
      ])
      .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' })
      .optional(),
    multiply: z
      .union([
        z.number(),
        z.string(),
        z.instanceof(Decimal),
        z.instanceof(Prisma.Decimal),
        DecimalJsLikeSchema,
      ])
      .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' })
      .optional(),
    divide: z
      .union([
        z.number(),
        z.string(),
        z.instanceof(Decimal),
        z.instanceof(Prisma.Decimal),
        DecimalJsLikeSchema,
      ])
      .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' })
      .optional(),
  })

export const FloatFieldUpdateOperationsInputSchema: z.ZodType<Prisma.FloatFieldUpdateOperationsInput> =
  z.strictObject({
    set: z.number().optional(),
    increment: z.number().optional(),
    decrement: z.number().optional(),
    multiply: z.number().optional(),
    divide: z.number().optional(),
  })

export const DateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.DateTimeFieldUpdateOperationsInput> =
  z.strictObject({
    set: z.coerce.date().optional(),
  })

export const IntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.IntFieldUpdateOperationsInput> =
  z.strictObject({
    set: z.number().optional(),
    increment: z.number().optional(),
    decrement: z.number().optional(),
    multiply: z.number().optional(),
    divide: z.number().optional(),
  })

export const EnumInterestCalculationTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumInterestCalculationTypeFieldUpdateOperationsInput> =
  z.strictObject({
    set: z.lazy(() => InterestCalculationTypeSchema).optional(),
  })

export const EnumPaymentFrequencyFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumPaymentFrequencyFieldUpdateOperationsInput> =
  z.strictObject({
    set: z.lazy(() => PaymentFrequencySchema).optional(),
  })

export const EnumLoanStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumLoanStatusFieldUpdateOperationsInput> =
  z.strictObject({
    set: z.lazy(() => LoanStatusSchema).optional(),
  })

export const NullableDateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableDateTimeFieldUpdateOperationsInput> =
  z.strictObject({
    set: z.coerce.date().optional().nullable(),
  })

export const PaymentUpdateManyWithoutLoanNestedInputSchema: z.ZodType<Prisma.PaymentUpdateManyWithoutLoanNestedInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => PaymentCreateWithoutLoanInputSchema),
        z.lazy(() => PaymentCreateWithoutLoanInputSchema).array(),
        z.lazy(() => PaymentUncheckedCreateWithoutLoanInputSchema),
        z.lazy(() => PaymentUncheckedCreateWithoutLoanInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => PaymentCreateOrConnectWithoutLoanInputSchema),
        z.lazy(() => PaymentCreateOrConnectWithoutLoanInputSchema).array(),
      ])
      .optional(),
    upsert: z
      .union([
        z.lazy(() => PaymentUpsertWithWhereUniqueWithoutLoanInputSchema),
        z.lazy(() => PaymentUpsertWithWhereUniqueWithoutLoanInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => PaymentCreateManyLoanInputEnvelopeSchema).optional(),
    set: z
      .union([
        z.lazy(() => PaymentWhereUniqueInputSchema),
        z.lazy(() => PaymentWhereUniqueInputSchema).array(),
      ])
      .optional(),
    disconnect: z
      .union([
        z.lazy(() => PaymentWhereUniqueInputSchema),
        z.lazy(() => PaymentWhereUniqueInputSchema).array(),
      ])
      .optional(),
    delete: z
      .union([
        z.lazy(() => PaymentWhereUniqueInputSchema),
        z.lazy(() => PaymentWhereUniqueInputSchema).array(),
      ])
      .optional(),
    connect: z
      .union([
        z.lazy(() => PaymentWhereUniqueInputSchema),
        z.lazy(() => PaymentWhereUniqueInputSchema).array(),
      ])
      .optional(),
    update: z
      .union([
        z.lazy(() => PaymentUpdateWithWhereUniqueWithoutLoanInputSchema),
        z.lazy(() => PaymentUpdateWithWhereUniqueWithoutLoanInputSchema).array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(() => PaymentUpdateManyWithWhereWithoutLoanInputSchema),
        z.lazy(() => PaymentUpdateManyWithWhereWithoutLoanInputSchema).array(),
      ])
      .optional(),
    deleteMany: z
      .union([
        z.lazy(() => PaymentScalarWhereInputSchema),
        z.lazy(() => PaymentScalarWhereInputSchema).array(),
      ])
      .optional(),
  })

export const PaymentUncheckedUpdateManyWithoutLoanNestedInputSchema: z.ZodType<Prisma.PaymentUncheckedUpdateManyWithoutLoanNestedInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => PaymentCreateWithoutLoanInputSchema),
        z.lazy(() => PaymentCreateWithoutLoanInputSchema).array(),
        z.lazy(() => PaymentUncheckedCreateWithoutLoanInputSchema),
        z.lazy(() => PaymentUncheckedCreateWithoutLoanInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => PaymentCreateOrConnectWithoutLoanInputSchema),
        z.lazy(() => PaymentCreateOrConnectWithoutLoanInputSchema).array(),
      ])
      .optional(),
    upsert: z
      .union([
        z.lazy(() => PaymentUpsertWithWhereUniqueWithoutLoanInputSchema),
        z.lazy(() => PaymentUpsertWithWhereUniqueWithoutLoanInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => PaymentCreateManyLoanInputEnvelopeSchema).optional(),
    set: z
      .union([
        z.lazy(() => PaymentWhereUniqueInputSchema),
        z.lazy(() => PaymentWhereUniqueInputSchema).array(),
      ])
      .optional(),
    disconnect: z
      .union([
        z.lazy(() => PaymentWhereUniqueInputSchema),
        z.lazy(() => PaymentWhereUniqueInputSchema).array(),
      ])
      .optional(),
    delete: z
      .union([
        z.lazy(() => PaymentWhereUniqueInputSchema),
        z.lazy(() => PaymentWhereUniqueInputSchema).array(),
      ])
      .optional(),
    connect: z
      .union([
        z.lazy(() => PaymentWhereUniqueInputSchema),
        z.lazy(() => PaymentWhereUniqueInputSchema).array(),
      ])
      .optional(),
    update: z
      .union([
        z.lazy(() => PaymentUpdateWithWhereUniqueWithoutLoanInputSchema),
        z.lazy(() => PaymentUpdateWithWhereUniqueWithoutLoanInputSchema).array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(() => PaymentUpdateManyWithWhereWithoutLoanInputSchema),
        z.lazy(() => PaymentUpdateManyWithWhereWithoutLoanInputSchema).array(),
      ])
      .optional(),
    deleteMany: z
      .union([
        z.lazy(() => PaymentScalarWhereInputSchema),
        z.lazy(() => PaymentScalarWhereInputSchema).array(),
      ])
      .optional(),
  })

export const LoanCreateNestedOneWithoutPaymentsInputSchema: z.ZodType<Prisma.LoanCreateNestedOneWithoutPaymentsInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => LoanCreateWithoutPaymentsInputSchema),
        z.lazy(() => LoanUncheckedCreateWithoutPaymentsInputSchema),
      ])
      .optional(),
    connectOrCreate: z.lazy(() => LoanCreateOrConnectWithoutPaymentsInputSchema).optional(),
    connect: z.lazy(() => LoanWhereUniqueInputSchema).optional(),
  })

export const LoanUpdateOneRequiredWithoutPaymentsNestedInputSchema: z.ZodType<Prisma.LoanUpdateOneRequiredWithoutPaymentsNestedInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => LoanCreateWithoutPaymentsInputSchema),
        z.lazy(() => LoanUncheckedCreateWithoutPaymentsInputSchema),
      ])
      .optional(),
    connectOrCreate: z.lazy(() => LoanCreateOrConnectWithoutPaymentsInputSchema).optional(),
    upsert: z.lazy(() => LoanUpsertWithoutPaymentsInputSchema).optional(),
    connect: z.lazy(() => LoanWhereUniqueInputSchema).optional(),
    update: z
      .union([
        z.lazy(() => LoanUpdateToOneWithWhereWithoutPaymentsInputSchema),
        z.lazy(() => LoanUpdateWithoutPaymentsInputSchema),
        z.lazy(() => LoanUncheckedUpdateWithoutPaymentsInputSchema),
      ])
      .optional(),
  })

export const NestedStringFilterSchema: z.ZodType<Prisma.NestedStringFilter> = z.strictObject({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([z.string(), z.lazy(() => NestedStringFilterSchema)]).optional(),
})

export const NestedStringNullableFilterSchema: z.ZodType<Prisma.NestedStringNullableFilter> =
  z.strictObject({
    equals: z.string().optional().nullable(),
    in: z.string().array().optional().nullable(),
    notIn: z.string().array().optional().nullable(),
    lt: z.string().optional(),
    lte: z.string().optional(),
    gt: z.string().optional(),
    gte: z.string().optional(),
    contains: z.string().optional(),
    startsWith: z.string().optional(),
    endsWith: z.string().optional(),
    not: z
      .union([z.string(), z.lazy(() => NestedStringNullableFilterSchema)])
      .optional()
      .nullable(),
  })

export const NestedDecimalFilterSchema: z.ZodType<Prisma.NestedDecimalFilter> = z.strictObject({
  equals: z
    .union([
      z.number(),
      z.string(),
      z.instanceof(Decimal),
      z.instanceof(Prisma.Decimal),
      DecimalJsLikeSchema,
    ])
    .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' })
    .optional(),
  in: z
    .union([
      z.number().array(),
      z.string().array(),
      z.instanceof(Decimal).array(),
      z.instanceof(Prisma.Decimal).array(),
      DecimalJsLikeSchema.array(),
    ])
    .refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), {
      message: 'Must be a Decimal',
    })
    .optional(),
  notIn: z
    .union([
      z.number().array(),
      z.string().array(),
      z.instanceof(Decimal).array(),
      z.instanceof(Prisma.Decimal).array(),
      DecimalJsLikeSchema.array(),
    ])
    .refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), {
      message: 'Must be a Decimal',
    })
    .optional(),
  lt: z
    .union([
      z.number(),
      z.string(),
      z.instanceof(Decimal),
      z.instanceof(Prisma.Decimal),
      DecimalJsLikeSchema,
    ])
    .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' })
    .optional(),
  lte: z
    .union([
      z.number(),
      z.string(),
      z.instanceof(Decimal),
      z.instanceof(Prisma.Decimal),
      DecimalJsLikeSchema,
    ])
    .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' })
    .optional(),
  gt: z
    .union([
      z.number(),
      z.string(),
      z.instanceof(Decimal),
      z.instanceof(Prisma.Decimal),
      DecimalJsLikeSchema,
    ])
    .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' })
    .optional(),
  gte: z
    .union([
      z.number(),
      z.string(),
      z.instanceof(Decimal),
      z.instanceof(Prisma.Decimal),
      DecimalJsLikeSchema,
    ])
    .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' })
    .optional(),
  not: z
    .union([
      z
        .union([
          z.number(),
          z.string(),
          z.instanceof(Decimal),
          z.instanceof(Prisma.Decimal),
          DecimalJsLikeSchema,
        ])
        .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
      z.lazy(() => NestedDecimalFilterSchema),
    ])
    .optional(),
})

export const NestedFloatFilterSchema: z.ZodType<Prisma.NestedFloatFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([z.number(), z.lazy(() => NestedFloatFilterSchema)]).optional(),
})

export const NestedDateTimeFilterSchema: z.ZodType<Prisma.NestedDateTimeFilter> = z.strictObject({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([z.coerce.date(), z.lazy(() => NestedDateTimeFilterSchema)]).optional(),
})

export const NestedIntFilterSchema: z.ZodType<Prisma.NestedIntFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([z.number(), z.lazy(() => NestedIntFilterSchema)]).optional(),
})

export const NestedEnumInterestCalculationTypeFilterSchema: z.ZodType<Prisma.NestedEnumInterestCalculationTypeFilter> =
  z.strictObject({
    equals: z.lazy(() => InterestCalculationTypeSchema).optional(),
    in: z
      .lazy(() => InterestCalculationTypeSchema)
      .array()
      .optional(),
    notIn: z
      .lazy(() => InterestCalculationTypeSchema)
      .array()
      .optional(),
    not: z
      .union([
        z.lazy(() => InterestCalculationTypeSchema),
        z.lazy(() => NestedEnumInterestCalculationTypeFilterSchema),
      ])
      .optional(),
  })

export const NestedEnumPaymentFrequencyFilterSchema: z.ZodType<Prisma.NestedEnumPaymentFrequencyFilter> =
  z.strictObject({
    equals: z.lazy(() => PaymentFrequencySchema).optional(),
    in: z
      .lazy(() => PaymentFrequencySchema)
      .array()
      .optional(),
    notIn: z
      .lazy(() => PaymentFrequencySchema)
      .array()
      .optional(),
    not: z
      .union([
        z.lazy(() => PaymentFrequencySchema),
        z.lazy(() => NestedEnumPaymentFrequencyFilterSchema),
      ])
      .optional(),
  })

export const NestedEnumLoanStatusFilterSchema: z.ZodType<Prisma.NestedEnumLoanStatusFilter> =
  z.strictObject({
    equals: z.lazy(() => LoanStatusSchema).optional(),
    in: z
      .lazy(() => LoanStatusSchema)
      .array()
      .optional(),
    notIn: z
      .lazy(() => LoanStatusSchema)
      .array()
      .optional(),
    not: z
      .union([z.lazy(() => LoanStatusSchema), z.lazy(() => NestedEnumLoanStatusFilterSchema)])
      .optional(),
  })

export const NestedDateTimeNullableFilterSchema: z.ZodType<Prisma.NestedDateTimeNullableFilter> =
  z.strictObject({
    equals: z.coerce.date().optional().nullable(),
    in: z.coerce.date().array().optional().nullable(),
    notIn: z.coerce.date().array().optional().nullable(),
    lt: z.coerce.date().optional(),
    lte: z.coerce.date().optional(),
    gt: z.coerce.date().optional(),
    gte: z.coerce.date().optional(),
    not: z
      .union([z.coerce.date(), z.lazy(() => NestedDateTimeNullableFilterSchema)])
      .optional()
      .nullable(),
  })

export const NestedStringWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringWithAggregatesFilter> =
  z.strictObject({
    equals: z.string().optional(),
    in: z.string().array().optional(),
    notIn: z.string().array().optional(),
    lt: z.string().optional(),
    lte: z.string().optional(),
    gt: z.string().optional(),
    gte: z.string().optional(),
    contains: z.string().optional(),
    startsWith: z.string().optional(),
    endsWith: z.string().optional(),
    not: z.union([z.string(), z.lazy(() => NestedStringWithAggregatesFilterSchema)]).optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedStringFilterSchema).optional(),
    _max: z.lazy(() => NestedStringFilterSchema).optional(),
  })

export const NestedStringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringNullableWithAggregatesFilter> =
  z.strictObject({
    equals: z.string().optional().nullable(),
    in: z.string().array().optional().nullable(),
    notIn: z.string().array().optional().nullable(),
    lt: z.string().optional(),
    lte: z.string().optional(),
    gt: z.string().optional(),
    gte: z.string().optional(),
    contains: z.string().optional(),
    startsWith: z.string().optional(),
    endsWith: z.string().optional(),
    not: z
      .union([z.string(), z.lazy(() => NestedStringNullableWithAggregatesFilterSchema)])
      .optional()
      .nullable(),
    _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
    _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
    _max: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  })

export const NestedIntNullableFilterSchema: z.ZodType<Prisma.NestedIntNullableFilter> =
  z.strictObject({
    equals: z.number().optional().nullable(),
    in: z.number().array().optional().nullable(),
    notIn: z.number().array().optional().nullable(),
    lt: z.number().optional(),
    lte: z.number().optional(),
    gt: z.number().optional(),
    gte: z.number().optional(),
    not: z
      .union([z.number(), z.lazy(() => NestedIntNullableFilterSchema)])
      .optional()
      .nullable(),
  })

export const NestedDecimalWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDecimalWithAggregatesFilter> =
  z.strictObject({
    equals: z
      .union([
        z.number(),
        z.string(),
        z.instanceof(Decimal),
        z.instanceof(Prisma.Decimal),
        DecimalJsLikeSchema,
      ])
      .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' })
      .optional(),
    in: z
      .union([
        z.number().array(),
        z.string().array(),
        z.instanceof(Decimal).array(),
        z.instanceof(Prisma.Decimal).array(),
        DecimalJsLikeSchema.array(),
      ])
      .refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), {
        message: 'Must be a Decimal',
      })
      .optional(),
    notIn: z
      .union([
        z.number().array(),
        z.string().array(),
        z.instanceof(Decimal).array(),
        z.instanceof(Prisma.Decimal).array(),
        DecimalJsLikeSchema.array(),
      ])
      .refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), {
        message: 'Must be a Decimal',
      })
      .optional(),
    lt: z
      .union([
        z.number(),
        z.string(),
        z.instanceof(Decimal),
        z.instanceof(Prisma.Decimal),
        DecimalJsLikeSchema,
      ])
      .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' })
      .optional(),
    lte: z
      .union([
        z.number(),
        z.string(),
        z.instanceof(Decimal),
        z.instanceof(Prisma.Decimal),
        DecimalJsLikeSchema,
      ])
      .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' })
      .optional(),
    gt: z
      .union([
        z.number(),
        z.string(),
        z.instanceof(Decimal),
        z.instanceof(Prisma.Decimal),
        DecimalJsLikeSchema,
      ])
      .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' })
      .optional(),
    gte: z
      .union([
        z.number(),
        z.string(),
        z.instanceof(Decimal),
        z.instanceof(Prisma.Decimal),
        DecimalJsLikeSchema,
      ])
      .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' })
      .optional(),
    not: z
      .union([
        z
          .union([
            z.number(),
            z.string(),
            z.instanceof(Decimal),
            z.instanceof(Prisma.Decimal),
            DecimalJsLikeSchema,
          ])
          .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
        z.lazy(() => NestedDecimalWithAggregatesFilterSchema),
      ])
      .optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _avg: z.lazy(() => NestedDecimalFilterSchema).optional(),
    _sum: z.lazy(() => NestedDecimalFilterSchema).optional(),
    _min: z.lazy(() => NestedDecimalFilterSchema).optional(),
    _max: z.lazy(() => NestedDecimalFilterSchema).optional(),
  })

export const NestedFloatWithAggregatesFilterSchema: z.ZodType<Prisma.NestedFloatWithAggregatesFilter> =
  z.strictObject({
    equals: z.number().optional(),
    in: z.number().array().optional(),
    notIn: z.number().array().optional(),
    lt: z.number().optional(),
    lte: z.number().optional(),
    gt: z.number().optional(),
    gte: z.number().optional(),
    not: z.union([z.number(), z.lazy(() => NestedFloatWithAggregatesFilterSchema)]).optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
    _sum: z.lazy(() => NestedFloatFilterSchema).optional(),
    _min: z.lazy(() => NestedFloatFilterSchema).optional(),
    _max: z.lazy(() => NestedFloatFilterSchema).optional(),
  })

export const NestedDateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeWithAggregatesFilter> =
  z.strictObject({
    equals: z.coerce.date().optional(),
    in: z.coerce.date().array().optional(),
    notIn: z.coerce.date().array().optional(),
    lt: z.coerce.date().optional(),
    lte: z.coerce.date().optional(),
    gt: z.coerce.date().optional(),
    gte: z.coerce.date().optional(),
    not: z
      .union([z.coerce.date(), z.lazy(() => NestedDateTimeWithAggregatesFilterSchema)])
      .optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
    _max: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  })

export const NestedIntWithAggregatesFilterSchema: z.ZodType<Prisma.NestedIntWithAggregatesFilter> =
  z.strictObject({
    equals: z.number().optional(),
    in: z.number().array().optional(),
    notIn: z.number().array().optional(),
    lt: z.number().optional(),
    lte: z.number().optional(),
    gt: z.number().optional(),
    gte: z.number().optional(),
    not: z.union([z.number(), z.lazy(() => NestedIntWithAggregatesFilterSchema)]).optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
    _sum: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedIntFilterSchema).optional(),
    _max: z.lazy(() => NestedIntFilterSchema).optional(),
  })

export const NestedEnumInterestCalculationTypeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumInterestCalculationTypeWithAggregatesFilter> =
  z.strictObject({
    equals: z.lazy(() => InterestCalculationTypeSchema).optional(),
    in: z
      .lazy(() => InterestCalculationTypeSchema)
      .array()
      .optional(),
    notIn: z
      .lazy(() => InterestCalculationTypeSchema)
      .array()
      .optional(),
    not: z
      .union([
        z.lazy(() => InterestCalculationTypeSchema),
        z.lazy(() => NestedEnumInterestCalculationTypeWithAggregatesFilterSchema),
      ])
      .optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedEnumInterestCalculationTypeFilterSchema).optional(),
    _max: z.lazy(() => NestedEnumInterestCalculationTypeFilterSchema).optional(),
  })

export const NestedEnumPaymentFrequencyWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumPaymentFrequencyWithAggregatesFilter> =
  z.strictObject({
    equals: z.lazy(() => PaymentFrequencySchema).optional(),
    in: z
      .lazy(() => PaymentFrequencySchema)
      .array()
      .optional(),
    notIn: z
      .lazy(() => PaymentFrequencySchema)
      .array()
      .optional(),
    not: z
      .union([
        z.lazy(() => PaymentFrequencySchema),
        z.lazy(() => NestedEnumPaymentFrequencyWithAggregatesFilterSchema),
      ])
      .optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedEnumPaymentFrequencyFilterSchema).optional(),
    _max: z.lazy(() => NestedEnumPaymentFrequencyFilterSchema).optional(),
  })

export const NestedEnumLoanStatusWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumLoanStatusWithAggregatesFilter> =
  z.strictObject({
    equals: z.lazy(() => LoanStatusSchema).optional(),
    in: z
      .lazy(() => LoanStatusSchema)
      .array()
      .optional(),
    notIn: z
      .lazy(() => LoanStatusSchema)
      .array()
      .optional(),
    not: z
      .union([
        z.lazy(() => LoanStatusSchema),
        z.lazy(() => NestedEnumLoanStatusWithAggregatesFilterSchema),
      ])
      .optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedEnumLoanStatusFilterSchema).optional(),
    _max: z.lazy(() => NestedEnumLoanStatusFilterSchema).optional(),
  })

export const NestedDateTimeNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeNullableWithAggregatesFilter> =
  z.strictObject({
    equals: z.coerce.date().optional().nullable(),
    in: z.coerce.date().array().optional().nullable(),
    notIn: z.coerce.date().array().optional().nullable(),
    lt: z.coerce.date().optional(),
    lte: z.coerce.date().optional(),
    gt: z.coerce.date().optional(),
    gte: z.coerce.date().optional(),
    not: z
      .union([z.coerce.date(), z.lazy(() => NestedDateTimeNullableWithAggregatesFilterSchema)])
      .optional()
      .nullable(),
    _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
    _min: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
    _max: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
  })

export const PaymentCreateWithoutLoanInputSchema: z.ZodType<Prisma.PaymentCreateWithoutLoanInput> =
  z.strictObject({
    id: z.cuid().optional(),
    amount: z
      .union([
        z.number(),
        z.string(),
        z.instanceof(Decimal),
        z.instanceof(Prisma.Decimal),
        DecimalJsLikeSchema,
      ])
      .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
    date: z.coerce.date().optional(),
    notes: z.string().optional().nullable(),
    deletedAt: z.coerce.date().optional().nullable(),
    createdAt: z.coerce.date().optional(),
  })

export const PaymentUncheckedCreateWithoutLoanInputSchema: z.ZodType<Prisma.PaymentUncheckedCreateWithoutLoanInput> =
  z.strictObject({
    id: z.cuid().optional(),
    amount: z
      .union([
        z.number(),
        z.string(),
        z.instanceof(Decimal),
        z.instanceof(Prisma.Decimal),
        DecimalJsLikeSchema,
      ])
      .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
    date: z.coerce.date().optional(),
    notes: z.string().optional().nullable(),
    deletedAt: z.coerce.date().optional().nullable(),
    createdAt: z.coerce.date().optional(),
  })

export const PaymentCreateOrConnectWithoutLoanInputSchema: z.ZodType<Prisma.PaymentCreateOrConnectWithoutLoanInput> =
  z.strictObject({
    where: z.lazy(() => PaymentWhereUniqueInputSchema),
    create: z.union([
      z.lazy(() => PaymentCreateWithoutLoanInputSchema),
      z.lazy(() => PaymentUncheckedCreateWithoutLoanInputSchema),
    ]),
  })

export const PaymentCreateManyLoanInputEnvelopeSchema: z.ZodType<Prisma.PaymentCreateManyLoanInputEnvelope> =
  z.strictObject({
    data: z.union([
      z.lazy(() => PaymentCreateManyLoanInputSchema),
      z.lazy(() => PaymentCreateManyLoanInputSchema).array(),
    ]),
    skipDuplicates: z.boolean().optional(),
  })

export const PaymentUpsertWithWhereUniqueWithoutLoanInputSchema: z.ZodType<Prisma.PaymentUpsertWithWhereUniqueWithoutLoanInput> =
  z.strictObject({
    where: z.lazy(() => PaymentWhereUniqueInputSchema),
    update: z.union([
      z.lazy(() => PaymentUpdateWithoutLoanInputSchema),
      z.lazy(() => PaymentUncheckedUpdateWithoutLoanInputSchema),
    ]),
    create: z.union([
      z.lazy(() => PaymentCreateWithoutLoanInputSchema),
      z.lazy(() => PaymentUncheckedCreateWithoutLoanInputSchema),
    ]),
  })

export const PaymentUpdateWithWhereUniqueWithoutLoanInputSchema: z.ZodType<Prisma.PaymentUpdateWithWhereUniqueWithoutLoanInput> =
  z.strictObject({
    where: z.lazy(() => PaymentWhereUniqueInputSchema),
    data: z.union([
      z.lazy(() => PaymentUpdateWithoutLoanInputSchema),
      z.lazy(() => PaymentUncheckedUpdateWithoutLoanInputSchema),
    ]),
  })

export const PaymentUpdateManyWithWhereWithoutLoanInputSchema: z.ZodType<Prisma.PaymentUpdateManyWithWhereWithoutLoanInput> =
  z.strictObject({
    where: z.lazy(() => PaymentScalarWhereInputSchema),
    data: z.union([
      z.lazy(() => PaymentUpdateManyMutationInputSchema),
      z.lazy(() => PaymentUncheckedUpdateManyWithoutLoanInputSchema),
    ]),
  })

export const PaymentScalarWhereInputSchema: z.ZodType<Prisma.PaymentScalarWhereInput> =
  z.strictObject({
    AND: z
      .union([
        z.lazy(() => PaymentScalarWhereInputSchema),
        z.lazy(() => PaymentScalarWhereInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => PaymentScalarWhereInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => PaymentScalarWhereInputSchema),
        z.lazy(() => PaymentScalarWhereInputSchema).array(),
      ])
      .optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    amount: z
      .union([
        z.lazy(() => DecimalFilterSchema),
        z
          .union([
            z.number(),
            z.string(),
            z.instanceof(Decimal),
            z.instanceof(Prisma.Decimal),
            DecimalJsLikeSchema,
          ])
          .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
      ])
      .optional(),
    date: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    notes: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    deletedAt: z
      .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
      .optional()
      .nullable(),
    loanId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
  })

export const LoanCreateWithoutPaymentsInputSchema: z.ZodType<Prisma.LoanCreateWithoutPaymentsInput> =
  z.strictObject({
    id: z.cuid().optional(),
    borrowerName: z.string(),
    borrowerEmail: z.string(),
    borrowerPhone: z.string().optional().nullable(),
    principal: z
      .union([
        z.number(),
        z.string(),
        z.instanceof(Decimal),
        z.instanceof(Prisma.Decimal),
        DecimalJsLikeSchema,
      ])
      .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
    interestRate: z.number(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    termMonths: z.number().int(),
    interestCalculationType: z.lazy(() => InterestCalculationTypeSchema).optional(),
    paymentFrequency: z.lazy(() => PaymentFrequencySchema).optional(),
    status: z.lazy(() => LoanStatusSchema).optional(),
    balance: z
      .union([
        z.number(),
        z.string(),
        z.instanceof(Decimal),
        z.instanceof(Prisma.Decimal),
        DecimalJsLikeSchema,
      ])
      .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
    notes: z.string().optional().nullable(),
    collateral: z.string().optional().nullable(),
    deletedAt: z.coerce.date().optional().nullable(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
  })

export const LoanUncheckedCreateWithoutPaymentsInputSchema: z.ZodType<Prisma.LoanUncheckedCreateWithoutPaymentsInput> =
  z.strictObject({
    id: z.cuid().optional(),
    borrowerName: z.string(),
    borrowerEmail: z.string(),
    borrowerPhone: z.string().optional().nullable(),
    principal: z
      .union([
        z.number(),
        z.string(),
        z.instanceof(Decimal),
        z.instanceof(Prisma.Decimal),
        DecimalJsLikeSchema,
      ])
      .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
    interestRate: z.number(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    termMonths: z.number().int(),
    interestCalculationType: z.lazy(() => InterestCalculationTypeSchema).optional(),
    paymentFrequency: z.lazy(() => PaymentFrequencySchema).optional(),
    status: z.lazy(() => LoanStatusSchema).optional(),
    balance: z
      .union([
        z.number(),
        z.string(),
        z.instanceof(Decimal),
        z.instanceof(Prisma.Decimal),
        DecimalJsLikeSchema,
      ])
      .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
    notes: z.string().optional().nullable(),
    collateral: z.string().optional().nullable(),
    deletedAt: z.coerce.date().optional().nullable(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
  })

export const LoanCreateOrConnectWithoutPaymentsInputSchema: z.ZodType<Prisma.LoanCreateOrConnectWithoutPaymentsInput> =
  z.strictObject({
    where: z.lazy(() => LoanWhereUniqueInputSchema),
    create: z.union([
      z.lazy(() => LoanCreateWithoutPaymentsInputSchema),
      z.lazy(() => LoanUncheckedCreateWithoutPaymentsInputSchema),
    ]),
  })

export const LoanUpsertWithoutPaymentsInputSchema: z.ZodType<Prisma.LoanUpsertWithoutPaymentsInput> =
  z.strictObject({
    update: z.union([
      z.lazy(() => LoanUpdateWithoutPaymentsInputSchema),
      z.lazy(() => LoanUncheckedUpdateWithoutPaymentsInputSchema),
    ]),
    create: z.union([
      z.lazy(() => LoanCreateWithoutPaymentsInputSchema),
      z.lazy(() => LoanUncheckedCreateWithoutPaymentsInputSchema),
    ]),
    where: z.lazy(() => LoanWhereInputSchema).optional(),
  })

export const LoanUpdateToOneWithWhereWithoutPaymentsInputSchema: z.ZodType<Prisma.LoanUpdateToOneWithWhereWithoutPaymentsInput> =
  z.strictObject({
    where: z.lazy(() => LoanWhereInputSchema).optional(),
    data: z.union([
      z.lazy(() => LoanUpdateWithoutPaymentsInputSchema),
      z.lazy(() => LoanUncheckedUpdateWithoutPaymentsInputSchema),
    ]),
  })

export const LoanUpdateWithoutPaymentsInputSchema: z.ZodType<Prisma.LoanUpdateWithoutPaymentsInput> =
  z.strictObject({
    id: z.union([z.cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    borrowerName: z
      .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    borrowerEmail: z
      .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    borrowerPhone: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    principal: z
      .union([
        z
          .union([
            z.number(),
            z.string(),
            z.instanceof(Decimal),
            z.instanceof(Prisma.Decimal),
            DecimalJsLikeSchema,
          ])
          .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
        z.lazy(() => DecimalFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    interestRate: z
      .union([z.number(), z.lazy(() => FloatFieldUpdateOperationsInputSchema)])
      .optional(),
    startDate: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    endDate: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    termMonths: z
      .union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)])
      .optional(),
    interestCalculationType: z
      .union([
        z.lazy(() => InterestCalculationTypeSchema),
        z.lazy(() => EnumInterestCalculationTypeFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    paymentFrequency: z
      .union([
        z.lazy(() => PaymentFrequencySchema),
        z.lazy(() => EnumPaymentFrequencyFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    status: z
      .union([
        z.lazy(() => LoanStatusSchema),
        z.lazy(() => EnumLoanStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    balance: z
      .union([
        z
          .union([
            z.number(),
            z.string(),
            z.instanceof(Decimal),
            z.instanceof(Prisma.Decimal),
            DecimalJsLikeSchema,
          ])
          .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
        z.lazy(() => DecimalFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    notes: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    collateral: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
  })

export const LoanUncheckedUpdateWithoutPaymentsInputSchema: z.ZodType<Prisma.LoanUncheckedUpdateWithoutPaymentsInput> =
  z.strictObject({
    id: z.union([z.cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    borrowerName: z
      .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    borrowerEmail: z
      .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    borrowerPhone: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    principal: z
      .union([
        z
          .union([
            z.number(),
            z.string(),
            z.instanceof(Decimal),
            z.instanceof(Prisma.Decimal),
            DecimalJsLikeSchema,
          ])
          .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
        z.lazy(() => DecimalFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    interestRate: z
      .union([z.number(), z.lazy(() => FloatFieldUpdateOperationsInputSchema)])
      .optional(),
    startDate: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    endDate: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    termMonths: z
      .union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)])
      .optional(),
    interestCalculationType: z
      .union([
        z.lazy(() => InterestCalculationTypeSchema),
        z.lazy(() => EnumInterestCalculationTypeFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    paymentFrequency: z
      .union([
        z.lazy(() => PaymentFrequencySchema),
        z.lazy(() => EnumPaymentFrequencyFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    status: z
      .union([
        z.lazy(() => LoanStatusSchema),
        z.lazy(() => EnumLoanStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    balance: z
      .union([
        z
          .union([
            z.number(),
            z.string(),
            z.instanceof(Decimal),
            z.instanceof(Prisma.Decimal),
            DecimalJsLikeSchema,
          ])
          .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
        z.lazy(() => DecimalFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    notes: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    collateral: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
  })

export const PaymentCreateManyLoanInputSchema: z.ZodType<Prisma.PaymentCreateManyLoanInput> =
  z.strictObject({
    id: z.cuid().optional(),
    amount: z
      .union([
        z.number(),
        z.string(),
        z.instanceof(Decimal),
        z.instanceof(Prisma.Decimal),
        DecimalJsLikeSchema,
      ])
      .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
    date: z.coerce.date().optional(),
    notes: z.string().optional().nullable(),
    deletedAt: z.coerce.date().optional().nullable(),
    createdAt: z.coerce.date().optional(),
  })

export const PaymentUpdateWithoutLoanInputSchema: z.ZodType<Prisma.PaymentUpdateWithoutLoanInput> =
  z.strictObject({
    id: z.union([z.cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    amount: z
      .union([
        z
          .union([
            z.number(),
            z.string(),
            z.instanceof(Decimal),
            z.instanceof(Prisma.Decimal),
            DecimalJsLikeSchema,
          ])
          .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
        z.lazy(() => DecimalFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    date: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    notes: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
  })

export const PaymentUncheckedUpdateWithoutLoanInputSchema: z.ZodType<Prisma.PaymentUncheckedUpdateWithoutLoanInput> =
  z.strictObject({
    id: z.union([z.cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    amount: z
      .union([
        z
          .union([
            z.number(),
            z.string(),
            z.instanceof(Decimal),
            z.instanceof(Prisma.Decimal),
            DecimalJsLikeSchema,
          ])
          .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
        z.lazy(() => DecimalFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    date: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    notes: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
  })

export const PaymentUncheckedUpdateManyWithoutLoanInputSchema: z.ZodType<Prisma.PaymentUncheckedUpdateManyWithoutLoanInput> =
  z.strictObject({
    id: z.union([z.cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    amount: z
      .union([
        z
          .union([
            z.number(),
            z.string(),
            z.instanceof(Decimal),
            z.instanceof(Prisma.Decimal),
            DecimalJsLikeSchema,
          ])
          .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
        z.lazy(() => DecimalFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    date: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    notes: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
  })

/////////////////////////////////////////
// ARGS
/////////////////////////////////////////

export const LoanFindFirstArgsSchema: z.ZodType<Prisma.LoanFindFirstArgs> = z
  .object({
    select: LoanSelectSchema.optional(),
    include: LoanIncludeSchema.optional(),
    where: LoanWhereInputSchema.optional(),
    orderBy: z
      .union([LoanOrderByWithRelationInputSchema.array(), LoanOrderByWithRelationInputSchema])
      .optional(),
    cursor: LoanWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([LoanScalarFieldEnumSchema, LoanScalarFieldEnumSchema.array()]).optional(),
  })
  .strict()

export const LoanFindFirstOrThrowArgsSchema: z.ZodType<Prisma.LoanFindFirstOrThrowArgs> = z
  .object({
    select: LoanSelectSchema.optional(),
    include: LoanIncludeSchema.optional(),
    where: LoanWhereInputSchema.optional(),
    orderBy: z
      .union([LoanOrderByWithRelationInputSchema.array(), LoanOrderByWithRelationInputSchema])
      .optional(),
    cursor: LoanWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([LoanScalarFieldEnumSchema, LoanScalarFieldEnumSchema.array()]).optional(),
  })
  .strict()

export const LoanFindManyArgsSchema: z.ZodType<Prisma.LoanFindManyArgs> = z
  .object({
    select: LoanSelectSchema.optional(),
    include: LoanIncludeSchema.optional(),
    where: LoanWhereInputSchema.optional(),
    orderBy: z
      .union([LoanOrderByWithRelationInputSchema.array(), LoanOrderByWithRelationInputSchema])
      .optional(),
    cursor: LoanWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([LoanScalarFieldEnumSchema, LoanScalarFieldEnumSchema.array()]).optional(),
  })
  .strict()

export const LoanAggregateArgsSchema: z.ZodType<Prisma.LoanAggregateArgs> = z
  .object({
    where: LoanWhereInputSchema.optional(),
    orderBy: z
      .union([LoanOrderByWithRelationInputSchema.array(), LoanOrderByWithRelationInputSchema])
      .optional(),
    cursor: LoanWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict()

export const LoanGroupByArgsSchema: z.ZodType<Prisma.LoanGroupByArgs> = z
  .object({
    where: LoanWhereInputSchema.optional(),
    orderBy: z
      .union([LoanOrderByWithAggregationInputSchema.array(), LoanOrderByWithAggregationInputSchema])
      .optional(),
    by: LoanScalarFieldEnumSchema.array(),
    having: LoanScalarWhereWithAggregatesInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict()

export const LoanFindUniqueArgsSchema: z.ZodType<Prisma.LoanFindUniqueArgs> = z
  .object({
    select: LoanSelectSchema.optional(),
    include: LoanIncludeSchema.optional(),
    where: LoanWhereUniqueInputSchema,
  })
  .strict()

export const LoanFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.LoanFindUniqueOrThrowArgs> = z
  .object({
    select: LoanSelectSchema.optional(),
    include: LoanIncludeSchema.optional(),
    where: LoanWhereUniqueInputSchema,
  })
  .strict()

export const PaymentFindFirstArgsSchema: z.ZodType<Prisma.PaymentFindFirstArgs> = z
  .object({
    select: PaymentSelectSchema.optional(),
    include: PaymentIncludeSchema.optional(),
    where: PaymentWhereInputSchema.optional(),
    orderBy: z
      .union([PaymentOrderByWithRelationInputSchema.array(), PaymentOrderByWithRelationInputSchema])
      .optional(),
    cursor: PaymentWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z
      .union([PaymentScalarFieldEnumSchema, PaymentScalarFieldEnumSchema.array()])
      .optional(),
  })
  .strict()

export const PaymentFindFirstOrThrowArgsSchema: z.ZodType<Prisma.PaymentFindFirstOrThrowArgs> = z
  .object({
    select: PaymentSelectSchema.optional(),
    include: PaymentIncludeSchema.optional(),
    where: PaymentWhereInputSchema.optional(),
    orderBy: z
      .union([PaymentOrderByWithRelationInputSchema.array(), PaymentOrderByWithRelationInputSchema])
      .optional(),
    cursor: PaymentWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z
      .union([PaymentScalarFieldEnumSchema, PaymentScalarFieldEnumSchema.array()])
      .optional(),
  })
  .strict()

export const PaymentFindManyArgsSchema: z.ZodType<Prisma.PaymentFindManyArgs> = z
  .object({
    select: PaymentSelectSchema.optional(),
    include: PaymentIncludeSchema.optional(),
    where: PaymentWhereInputSchema.optional(),
    orderBy: z
      .union([PaymentOrderByWithRelationInputSchema.array(), PaymentOrderByWithRelationInputSchema])
      .optional(),
    cursor: PaymentWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z
      .union([PaymentScalarFieldEnumSchema, PaymentScalarFieldEnumSchema.array()])
      .optional(),
  })
  .strict()

export const PaymentAggregateArgsSchema: z.ZodType<Prisma.PaymentAggregateArgs> = z
  .object({
    where: PaymentWhereInputSchema.optional(),
    orderBy: z
      .union([PaymentOrderByWithRelationInputSchema.array(), PaymentOrderByWithRelationInputSchema])
      .optional(),
    cursor: PaymentWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict()

export const PaymentGroupByArgsSchema: z.ZodType<Prisma.PaymentGroupByArgs> = z
  .object({
    where: PaymentWhereInputSchema.optional(),
    orderBy: z
      .union([
        PaymentOrderByWithAggregationInputSchema.array(),
        PaymentOrderByWithAggregationInputSchema,
      ])
      .optional(),
    by: PaymentScalarFieldEnumSchema.array(),
    having: PaymentScalarWhereWithAggregatesInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict()

export const PaymentFindUniqueArgsSchema: z.ZodType<Prisma.PaymentFindUniqueArgs> = z
  .object({
    select: PaymentSelectSchema.optional(),
    include: PaymentIncludeSchema.optional(),
    where: PaymentWhereUniqueInputSchema,
  })
  .strict()

export const PaymentFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.PaymentFindUniqueOrThrowArgs> = z
  .object({
    select: PaymentSelectSchema.optional(),
    include: PaymentIncludeSchema.optional(),
    where: PaymentWhereUniqueInputSchema,
  })
  .strict()

export const LoanCreateArgsSchema: z.ZodType<Prisma.LoanCreateArgs> = z
  .object({
    select: LoanSelectSchema.optional(),
    include: LoanIncludeSchema.optional(),
    data: z.union([LoanCreateInputSchema, LoanUncheckedCreateInputSchema]),
  })
  .strict()

export const LoanUpsertArgsSchema: z.ZodType<Prisma.LoanUpsertArgs> = z
  .object({
    select: LoanSelectSchema.optional(),
    include: LoanIncludeSchema.optional(),
    where: LoanWhereUniqueInputSchema,
    create: z.union([LoanCreateInputSchema, LoanUncheckedCreateInputSchema]),
    update: z.union([LoanUpdateInputSchema, LoanUncheckedUpdateInputSchema]),
  })
  .strict()

export const LoanCreateManyArgsSchema: z.ZodType<Prisma.LoanCreateManyArgs> = z
  .object({
    data: z.union([LoanCreateManyInputSchema, LoanCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict()

export const LoanCreateManyAndReturnArgsSchema: z.ZodType<Prisma.LoanCreateManyAndReturnArgs> = z
  .object({
    data: z.union([LoanCreateManyInputSchema, LoanCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict()

export const LoanDeleteArgsSchema: z.ZodType<Prisma.LoanDeleteArgs> = z
  .object({
    select: LoanSelectSchema.optional(),
    include: LoanIncludeSchema.optional(),
    where: LoanWhereUniqueInputSchema,
  })
  .strict()

export const LoanUpdateArgsSchema: z.ZodType<Prisma.LoanUpdateArgs> = z
  .object({
    select: LoanSelectSchema.optional(),
    include: LoanIncludeSchema.optional(),
    data: z.union([LoanUpdateInputSchema, LoanUncheckedUpdateInputSchema]),
    where: LoanWhereUniqueInputSchema,
  })
  .strict()

export const LoanUpdateManyArgsSchema: z.ZodType<Prisma.LoanUpdateManyArgs> = z
  .object({
    data: z.union([LoanUpdateManyMutationInputSchema, LoanUncheckedUpdateManyInputSchema]),
    where: LoanWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict()

export const LoanUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.LoanUpdateManyAndReturnArgs> = z
  .object({
    data: z.union([LoanUpdateManyMutationInputSchema, LoanUncheckedUpdateManyInputSchema]),
    where: LoanWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict()

export const LoanDeleteManyArgsSchema: z.ZodType<Prisma.LoanDeleteManyArgs> = z
  .object({
    where: LoanWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict()

export const PaymentCreateArgsSchema: z.ZodType<Prisma.PaymentCreateArgs> = z
  .object({
    select: PaymentSelectSchema.optional(),
    include: PaymentIncludeSchema.optional(),
    data: z.union([PaymentCreateInputSchema, PaymentUncheckedCreateInputSchema]),
  })
  .strict()

export const PaymentUpsertArgsSchema: z.ZodType<Prisma.PaymentUpsertArgs> = z
  .object({
    select: PaymentSelectSchema.optional(),
    include: PaymentIncludeSchema.optional(),
    where: PaymentWhereUniqueInputSchema,
    create: z.union([PaymentCreateInputSchema, PaymentUncheckedCreateInputSchema]),
    update: z.union([PaymentUpdateInputSchema, PaymentUncheckedUpdateInputSchema]),
  })
  .strict()

export const PaymentCreateManyArgsSchema: z.ZodType<Prisma.PaymentCreateManyArgs> = z
  .object({
    data: z.union([PaymentCreateManyInputSchema, PaymentCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict()

export const PaymentCreateManyAndReturnArgsSchema: z.ZodType<Prisma.PaymentCreateManyAndReturnArgs> =
  z
    .object({
      data: z.union([PaymentCreateManyInputSchema, PaymentCreateManyInputSchema.array()]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict()

export const PaymentDeleteArgsSchema: z.ZodType<Prisma.PaymentDeleteArgs> = z
  .object({
    select: PaymentSelectSchema.optional(),
    include: PaymentIncludeSchema.optional(),
    where: PaymentWhereUniqueInputSchema,
  })
  .strict()

export const PaymentUpdateArgsSchema: z.ZodType<Prisma.PaymentUpdateArgs> = z
  .object({
    select: PaymentSelectSchema.optional(),
    include: PaymentIncludeSchema.optional(),
    data: z.union([PaymentUpdateInputSchema, PaymentUncheckedUpdateInputSchema]),
    where: PaymentWhereUniqueInputSchema,
  })
  .strict()

export const PaymentUpdateManyArgsSchema: z.ZodType<Prisma.PaymentUpdateManyArgs> = z
  .object({
    data: z.union([PaymentUpdateManyMutationInputSchema, PaymentUncheckedUpdateManyInputSchema]),
    where: PaymentWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict()

export const PaymentUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.PaymentUpdateManyAndReturnArgs> =
  z
    .object({
      data: z.union([PaymentUpdateManyMutationInputSchema, PaymentUncheckedUpdateManyInputSchema]),
      where: PaymentWhereInputSchema.optional(),
      limit: z.number().optional(),
    })
    .strict()

export const PaymentDeleteManyArgsSchema: z.ZodType<Prisma.PaymentDeleteManyArgs> = z
  .object({
    where: PaymentWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict()
