# [TASK-017] Implement Dark Theme and Enhanced Dashboard

**Status:** COMPLETED
**Phase:** Styling & Theming
**Priority:** P1 (High)
**Estimated Effort:** M (6-8 hours)
**Branch:** `task/017-dark-theme`

## Dependencies

- TASK-016 (Loading and error boundaries completed)
- All UI components built

## Description

Transform the application to a modern dark theme inspired by the reference design. Update all components, pages, and layouts to use a deep navy/black background with elevated white cards, vibrant blue accents, and improved typography hierarchy. Maintain existing layout structure (sidebar, breadcrumbs, header) while updating colors and visual design.

## Acceptance Criteria

- [x] Dark theme color palette configured in Tailwind
- [x] Root layout updated to enforce dark mode
- [x] Sidebar navigation styled with dark theme
- [x] All shadcn/ui components updated for dark theme
- [x] LoanTable component styled with dark theme
- [x] Form components styled with dark theme
- [x] Error and loading states updated with dark theme
- [x] Dashboard updated with real metrics data
- [x] Quick Actions section added to dashboard
- [x] Alerts section added to dashboard
- [x] Typography hierarchy improved (larger numbers, better contrast)
- [x] Build passes without errors
- [x] All pages tested in dark theme

## Design Reference

Based on the provided screenshot, the design features:

- **Background**: Deep navy (#0f172a to #1e293b)
- **Cards**: White/light (#ffffff) with subtle shadows, elevated appearance
- **Accent**: Vibrant blue (#60a5fa - slightly lighter than reference)
- **Text on dark**: White/light gray (#f8fafc, #cbd5e1)
- **Text on light**: Dark gray (#1e293b, #64748b)
- **Numbers**: Large, bold, high contrast
- **Interactive elements**: Blue buttons and highlights

## Color Palette

### Tailwind Dark Theme Colors

```typescript
// tailwind.config.ts
colors: {
  // Background colors
  background: "hsl(222.2 84% 4.9%)",      // Deep navy (#0f172a)
  foreground: "hsl(210 40% 98%)",         // Light text (#f8fafc)

  // Card colors
  card: "hsl(0 0% 100%)",                 // White cards (#ffffff)
  "card-foreground": "hsl(222.2 47.4% 11.2%)", // Dark text on cards

  // Primary (blue accent)
  primary: "hsl(217.2 91.2% 69.8%)",      // Lighter blue (#60a5fa)
  "primary-foreground": "hsl(222.2 47.4% 11.2%)",

  // Muted (for subtle text)
  muted: "hsl(217.2 32.6% 17.5%)",        // Dark muted background
  "muted-foreground": "hsl(215 20.2% 65.1%)", // Muted text

  // Border
  border: "hsl(217.2 32.6% 17.5%)",       // Subtle borders

  // Destructive (errors)
  destructive: "hsl(0 62.8% 30.6%)",
  "destructive-foreground": "hsl(210 40% 98%)",
}
```

## Implementation Plan

### 1. Configure Tailwind Dark Theme (30 mins)

**File**: `tailwind.config.ts`

Update the theme configuration:

```typescript
import type { Config } from 'tailwindcss'

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(217.2 32.6% 17.5%)',
        input: 'hsl(217.2 32.6% 17.5%)',
        ring: 'hsl(217.2 91.2% 69.8%)',
        background: 'hsl(222.2 84% 4.9%)',
        foreground: 'hsl(210 40% 98%)',
        primary: {
          DEFAULT: 'hsl(217.2 91.2% 69.8%)',
          foreground: 'hsl(222.2 47.4% 11.2%)',
        },
        secondary: {
          DEFAULT: 'hsl(217.2 32.6% 17.5%)',
          foreground: 'hsl(210 40% 98%)',
        },
        destructive: {
          DEFAULT: 'hsl(0 62.8% 30.6%)',
          foreground: 'hsl(210 40% 98%)',
        },
        muted: {
          DEFAULT: 'hsl(217.2 32.6% 17.5%)',
          foreground: 'hsl(215 20.2% 65.1%)',
        },
        accent: {
          DEFAULT: 'hsl(217.2 32.6% 17.5%)',
          foreground: 'hsl(210 40% 98%)',
        },
        popover: {
          DEFAULT: 'hsl(222.2 84% 4.9%)',
          foreground: 'hsl(210 40% 98%)',
        },
        card: {
          DEFAULT: 'hsl(0 0% 100%)',
          foreground: 'hsl(222.2 47.4% 11.2%)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config

export default config
```

### 2. Enable Dark Mode in Root Layout (15 mins)

**File**: `app/layout.tsx`

Add dark class to HTML element:

```tsx
<html lang="en" className="dark">
  <body className={cn('min-h-screen bg-background font-sans antialiased', inter.variable)}>
    {children}
  </body>
</html>
```

### 3. Update Sidebar Navigation (30 mins)

**File**: `components/layout/sidebar.tsx`

Update to dark theme:

- Background: Use `bg-card` for white sidebar on dark background
- Text: Dark text on light background
- Active states: Blue accent
- Hover states: Subtle gray

```tsx
<aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card">
  {/* Logo area */}
  <div className="flex h-16 items-center border-b border-border px-6">
    <span className="text-xl font-bold text-card-foreground">Loan Platform</span>
  </div>

  {/* Navigation links */}
  <nav className="space-y-1 p-4">
    <Link className="flex items-center gap-3 rounded-lg px-3 py-2 text-card-foreground hover:bg-muted/10 transition-colors">
      {/* ... */}
    </Link>
  </nav>
</aside>
```

### 4. Update Dashboard with Real Data (2 hours)

**File**: `app/page.tsx`

Transform dashboard to show:

1. **Real Metrics** - Fetch actual loan data
2. **Quick Actions** - Buttons for common tasks
3. **Alerts** - Upcoming and overdue loans

```tsx
import { getLoans } from '@/app/actions/loan.actions'
import { getPayments } from '@/app/actions/payment.actions'

export default async function Dashboard() {
  // Fetch real data
  const loansResult = await getLoans()
  const loans = loansResult.success ? loansResult.data : []

  // Calculate metrics
  const totalLoans = loans.length
  const activeLoans = loans.filter((l) => l.status === 'ACTIVE')
  const totalPrincipal = loans.reduce((sum, l) => sum + l.principal, 0)
  const totalBalance = loans.reduce((sum, l) => sum + l.balance, 0)

  // Find upcoming/overdue
  const today = new Date()
  const upcoming = loans.filter((l) => {
    const daysUntilDue = Math.floor((l.endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return l.status === 'ACTIVE' && daysUntilDue > 0 && daysUntilDue <= 30
  })
  const overdue = loans.filter((l) => l.status === 'OVERDUE')

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Loans"
          value={totalLoans}
          description={`${activeLoans.length} active`}
        />
        <MetricCard
          title="Total Principal"
          value={formatCurrency(totalPrincipal)}
          description="Loan portfolio value"
        />
        {/* ... more metrics */}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button asChild>
            <Link href="/loans/new">Create New Loan</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/loans">View All Loans</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Alerts */}
      {(upcoming.length > 0 || overdue.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {overdue.length > 0 && (
              <Alert variant="destructive">{overdue.length} overdue loan(s)</Alert>
            )}
            {upcoming.length > 0 && (
              <Alert>{upcoming.length} loan(s) due in the next 30 days</Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

### 5. Create MetricCard Component (30 mins)

**File**: `components/dashboard/metric-card.tsx`

Reusable metric card with large, bold numbers:

```tsx
interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
}

export function MetricCard({ title, value, description, icon }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  )
}
```

### 6. Update LoanTable for Dark Theme (1 hour)

**File**: `components/loans/loan-table.tsx`

Update table styling:

- Keep functionality the same
- Update colors for dark theme compatibility
- Maintain Card wrapper with white background
- Ensure text contrast

```tsx
// Table wrapper remains on white card
<Card>
  <CardHeader>
    <CardTitle>Loans</CardTitle>
  </CardHeader>
  <CardContent>
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-muted/5">
          <TableHead className="text-card-foreground">Borrower</TableHead>
          {/* ... */}
        </TableRow>
      </TableHeader>
      <TableBody>
        {loans.map((loan) => (
          <TableRow key={loan.id} className="hover:bg-muted/5 cursor-pointer">
            {/* ... */}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </CardContent>
</Card>
```

### 7. Update Form Components (1 hour)

**Files**: All form components in `components/loans/`, `components/payments/`

Update form styling:

- Input fields: Light background on white cards
- Labels: Dark text
- Buttons: Blue primary accent
- Validation errors: Maintain destructive color

Example for input:

```tsx
<Input className="bg-background/50 border-border text-card-foreground" {...props} />
```

### 8. Update Error and Loading States (30 mins)

**Files**:

- `components/errors/error-display.tsx`
- `components/errors/not-found-display.tsx`
- `components/shared/loading-state.tsx`

Update to maintain white card appearance on dark background:

```tsx
// Error display - keep card white with dark text
<Card className="w-full max-w-md border-destructive">
  <CardContent>
    <p className="text-sm text-card-foreground">{description}</p>
  </CardContent>
</Card>
```

### 9. Update Badges and Status Indicators (30 mins)

**File**: `components/loans/loan-table.tsx` (status badges)

Ensure badge colors work on both light and dark backgrounds:

```tsx
const statusColors = {
  ACTIVE: 'bg-green-500/10 text-green-600 dark:text-green-400',
  COMPLETED: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  OVERDUE: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  DEFAULTED: 'bg-red-500/10 text-red-600 dark:text-red-400',
}
```

## Typography Improvements

### Large Bold Numbers

Use these classes for metric values:

- `text-3xl font-bold` for metric cards
- `text-4xl font-bold` for hero numbers
- `text-5xl font-bold` for primary dashboard metrics

### Descriptive Labels

- `text-sm text-muted-foreground` for labels above numbers
- `text-xs text-muted-foreground` for secondary descriptions

### Hierarchy

- H1: `text-3xl font-bold tracking-tight text-foreground`
- H2: `text-2xl font-semibold text-foreground`
- Body: `text-sm text-card-foreground`
- Muted: `text-sm text-muted-foreground`

## Testing Checklist

Manual testing across all pages:

- [ ] Dashboard displays with dark background and white cards
- [ ] Sidebar navigation is readable and functional
- [ ] Breadcrumbs visible and styled correctly
- [ ] Loans table displays properly on white card
- [ ] Loan creation form is readable and usable
- [ ] Loan detail page displays correctly
- [ ] Payment form is readable and usable
- [ ] Error states display properly
- [ ] Loading states are visible
- [ ] 404 page is styled correctly
- [ ] All text has sufficient contrast (WCAG AA)
- [ ] Hover states work on interactive elements
- [ ] Focus states are visible on inputs/buttons
- [ ] Build passes without errors
- [ ] No console errors or warnings

## Files to Update

```
tailwind.config.ts                      # Dark theme colors
app/layout.tsx                          # Enable dark mode
components/layout/sidebar.tsx           # Sidebar styling
app/page.tsx                            # Dashboard with real data
components/dashboard/
  └── metric-card.tsx                   # NEW: Metric display component
  └── quick-actions.tsx                 # NEW: Quick actions section
  └── alerts.tsx                        # NEW: Alerts section
components/loans/loan-table.tsx         # Table dark theme
components/loans/loan-form.tsx          # Form dark theme
components/payments/payment-form.tsx    # Form dark theme
components/errors/error-display.tsx     # Error dark theme
components/errors/not-found-display.tsx # 404 dark theme
components/shared/loading-state.tsx     # Loading dark theme
app/globals.css                         # Update base styles if needed
```

## Design Considerations

### Accessibility

- Maintain WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text)
- White text on dark backgrounds: Use #f8fafc or lighter
- Dark text on white cards: Use #1e293b or darker
- Ensure focus indicators are visible

### Performance

- No additional dependencies required
- Pure Tailwind CSS implementation
- No runtime performance impact

### Responsive Design

- Ensure dark theme works on all screen sizes
- Cards should stack properly on mobile
- Touch targets remain 44px minimum

## Future Enhancements (Out of Scope)

- **Theme Toggle**: Add light/dark mode switcher (currently dark only)
- **Charts**: Add data visualization with recharts
- **Custom Brand Colors**: Make color scheme configurable
- **Advanced Animations**: Add transitions and micro-interactions
- **Gradient Backgrounds**: Add subtle gradients to cards

## References

- Tailwind Dark Mode: https://tailwindcss.com/docs/dark-mode
- shadcn/ui Theming: https://ui.shadcn.com/docs/theming
- Design Reference: Provided screenshot
