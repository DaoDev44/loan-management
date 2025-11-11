# [TASK-013] Build Root Layout with Navigation

**Status:** COMPLETED
**Phase:** UI Components & Layout
**Priority:** P0 (Critical Path)
**Estimated Effort:** M (4-6 hours)
**Branch:** `task/013-root-layout`

## Dependencies

- TASK-012 (shadcn/ui setup completed)
- TASK-001 (Next.js 14 initialized)

## Description

Build the application's root layout including sidebar navigation, header with breadcrumbs, and responsive mobile menu. This provides the foundation for all pages in the application.

## Acceptance Criteria

- [x] Sidebar navigation with all main routes
- [x] Active route highlighting
- [x] Logo and branding in sidebar
- [x] Header with breadcrumbs
- [x] Responsive mobile menu (hamburger)
- [x] Smooth transitions and animations
- [x] Proper TypeScript types
- [x] Accessible navigation (keyboard navigation, ARIA labels)
- [x] Build passes without errors

## Navigation Structure

Based on the PRD, our main navigation will include:

```
Dashboard (/)
  ├─ Overview metrics
  └─ Recent activity

Loans (/loans)
  ├─ All loans table
  ├─ Create new loan (/loans/new)
  └─ Loan details (/loans/[id])

Payments (Future - Phase 2)
  └─ Payment history

Reports (Future - Phase 3)
  └─ Analytics and insights

Settings (Future - Phase 4)
  └─ Application settings
```

## Design Approach

### Layout Structure

```tsx
┌─────────────────────────────────────────┐
│  Sidebar  │      Main Content           │
│           │  ┌──────────────────────┐   │
│  Logo     │  │  Header + Breadcrumb │   │
│           │  └──────────────────────┘   │
│  Nav      │  ┌──────────────────────┐   │
│  Items    │  │                      │   │
│           │  │   Page Content       │   │
│           │  │                      │   │
│           │  └──────────────────────┘   │
└─────────────────────────────────────────┘
```

### Responsive Behavior

- **Desktop** (>1024px): Fixed sidebar, always visible
- **Tablet** (768-1024px): Collapsible sidebar
- **Mobile** (<768px): Hidden sidebar with hamburger menu

## Implementation Plan

### 1. Create Navigation Components

#### Sidebar Component (`components/layout/sidebar.tsx`)

- Logo/branding at top
- Navigation items with icons
- Active state highlighting
- Collapsible on mobile
- Smooth transitions

#### Header Component (`components/layout/header.tsx`)

- Breadcrumb navigation
- Mobile menu toggle button
- Optional user menu (future)

#### Navigation Items

```tsx
const navItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Loans',
    href: '/loans',
    icon: DollarSign,
  },
  // Future items:
  // { title: 'Payments', href: '/payments', icon: Receipt },
  // { title: 'Reports', href: '/reports', icon: BarChart },
  // { title: 'Settings', href: '/settings', icon: Settings },
]
```

### 2. Update Root Layout

Modify `app/layout.tsx` to include the sidebar and header structure.

### 3. Styling Approach

Use Tailwind classes with shadcn/ui components:

- Sidebar: `bg-card border-r`
- Active link: `bg-accent text-accent-foreground`
- Transitions: `transition-colors duration-200`

### 4. Icons from lucide-react

- LayoutDashboard
- DollarSign
- Menu (hamburger)
- X (close)
- ChevronRight (breadcrumbs)

## File Structure

```
components/
└── layout/
    ├── sidebar.tsx           # Main sidebar navigation
    ├── header.tsx            # Header with breadcrumbs
    ├── mobile-nav.tsx        # Mobile navigation sheet
    └── nav-item.tsx          # Individual navigation item

app/
└── layout.tsx               # Updated root layout
```

## Accessibility Considerations

- Proper semantic HTML (`<nav>`, `<header>`)
- ARIA labels for navigation
- Keyboard navigation support (Tab, Enter, Escape)
- Focus visible states
- Screen reader friendly

## Mobile UX

For mobile devices:

1. Hamburger menu button in header
2. Slide-in navigation drawer
3. Overlay/backdrop when open
4. Close on route change
5. Swipe-to-close gesture (future enhancement)

## Testing Requirements

- [ ] Navigation links work correctly
- [ ] Active route is highlighted
- [ ] Mobile menu opens/closes properly
- [ ] Breadcrumbs update based on route
- [ ] Keyboard navigation works
- [ ] Build passes
- [ ] No TypeScript errors

## Example Component Code

### Sidebar Navigation Item

```tsx
interface NavItemProps {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  isActive: boolean
}

function NavItem({ title, href, icon: Icon, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors',
        isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50'
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium">{title}</span>
    </Link>
  )
}
```

## Future Enhancements (Out of Scope)

- User profile dropdown in header
- Notification bell icon
- Search bar in header
- Dark mode toggle
- Collapsible sidebar sections
- Keyboard shortcuts overlay

## References

- Next.js App Router layouts: https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts
- shadcn/ui Sheet component (for mobile nav): https://ui.shadcn.com/docs/components/sheet
- lucide-react icons: https://lucide.dev/
