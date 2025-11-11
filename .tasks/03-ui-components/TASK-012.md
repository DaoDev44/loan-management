# [TASK-012] Set up shadcn/ui in Next.js

**Status:** COMPLETED
**Phase:** UI Components & Layout
**Priority:** P0 (Critical Path)
**Estimated Effort:** S (2-3 hours)
**Branch:** `task/012-shadcn-setup`

## Dependencies

- TASK-001 (Next.js 14 initialized)
- TASK-003 (Tailwind CSS configured)

## Description

Set up shadcn/ui component library in the Next.js project with custom theme configuration. This provides a foundation of accessible, customizable components that follow our design system.

## Acceptance Criteria

- [x] shadcn/ui CLI installed and configured
- [x] `components.json` created with proper configuration
- [x] Tailwind config updated with shadcn theme variables
- [x] CSS variables defined for light/dark themes
- [x] Install initial set of core components (Button, Card, Input, Label, Badge)
- [x] Verify components work with example page
- [x] Dark mode toggle functionality working
- [x] All components properly typed with TypeScript
- [x] Build passes without errors

## Implementation Approach

### What is shadcn/ui?

shadcn/ui is NOT a traditional component library. Instead:

- Components are copied directly into your codebase
- Full control and customization
- Built on Radix UI primitives (accessible)
- Styled with Tailwind CSS
- TypeScript by default

### Installation Steps

1. **Initialize shadcn/ui**

   ```bash
   npx shadcn@latest init
   ```

2. **Configuration Options**
   - Style: Default
   - Base color: Slate
   - CSS variables: Yes (for theming)
   - Tailwind config: Yes
   - Components location: `@/components/ui`
   - Utils location: `@/lib/utils`
   - React Server Components: Yes
   - Write config: components.json

3. **Install Core Components**
   ```bash
   npx shadcn@latest add button
   npx shadcn@latest add card
   npx shadcn@latest add input
   npx shadcn@latest add label
   npx shadcn@latest add badge
   npx shadcn@latest add separator
   npx shadcn@latest add dialog
   npx shadcn@latest add dropdown-menu
   npx shadcn@latest add table
   npx shadcn@latest add tabs
   ```

### Theme Configuration

We'll use a professional color scheme with subtle accents:

- Primary: Indigo/Purple (professional, trustworthy)
- Secondary: Slate (neutral)
- Accent: Emerald (success, growth)
- Destructive: Red (errors, warnings)

### File Structure After Setup

```
components/
└── ui/                  # shadcn components (auto-generated)
    ├── button.tsx
    ├── card.tsx
    ├── input.tsx
    └── ...

lib/
└── utils.ts            # cn() utility for class merging

app/
└── globals.css         # Updated with CSS variables
```

## Testing the Setup

Create a simple test page to verify:

```tsx
// app/test-components/page.tsx
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

export default function TestPage() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-4xl font-bold">shadcn/ui Components Test</h1>

      <Card>
        <CardHeader>
          <CardTitle>Button Variants</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Form Components</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="test-input">Test Input</Label>
            <Input id="test-input" placeholder="Enter something..." />
          </div>
          <div className="flex gap-2">
            <Badge>Active</Badge>
            <Badge variant="secondary">Pending</Badge>
            <Badge variant="destructive">Overdue</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

## Design System Colors

Based on the PRD's "blend approach" (professional + subtle colors):

```css
/* app/globals.css - Theme variables */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --primary: 262.1 83.3% 57.8%; /* Indigo */
  --primary-foreground: 210 40% 98%;
  --secondary: 215 16.3% 46.9%; /* Slate */
  --secondary-foreground: 210 40% 98%;
  --accent: 160 60% 45%; /* Emerald accent */
  --accent-foreground: 0 0% 100%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 262.1 83.3% 57.8%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --primary: 262.1 83.3% 57.8%;
  --primary-foreground: 210 40% 98%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --accent: 160 60% 45%;
  --accent-foreground: 0 0% 100%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 262.1 83.3% 57.8%;
}
```

## Common Issues and Solutions

### Issue: TypeScript errors on component imports

**Solution:** Ensure `@/` path alias is configured in `tsconfig.json`

### Issue: Tailwind classes not applying

**Solution:** Check that `tailwind.config.ts` includes component paths

### Issue: Dark mode not working

**Solution:** Add `next-themes` package and ThemeProvider

## Next Steps After This Task

After shadcn/ui is set up:

1. TASK-013: Build root layout with navigation
2. TASK-014: Create shared components (MetricsCard, StatusBadge)
3. TASK-015: Build LoanTable with sort/filter

## References

- shadcn/ui docs: https://ui.shadcn.com/docs
- Radix UI: https://www.radix-ui.com/
- Tailwind CSS: https://tailwindcss.com/docs
- Next.js theming: https://nextjs.org/docs/app/building-your-application/styling/css-variables
