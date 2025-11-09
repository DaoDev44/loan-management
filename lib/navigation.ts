import { LayoutDashboard, DollarSign, type LucideIcon } from 'lucide-react'

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  description?: string
}

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    description: 'Overview and metrics',
  },
  {
    title: 'Loans',
    href: '/loans',
    icon: DollarSign,
    description: 'Manage loan portfolio',
  },
  // Future navigation items can be added here:
  // {
  //   title: 'Payments',
  //   href: '/payments',
  //   icon: Receipt,
  //   description: 'Payment history and schedules',
  // },
  // {
  //   title: 'Reports',
  //   href: '/reports',
  //   icon: BarChart3,
  //   description: 'Analytics and insights',
  // },
  // {
  //   title: 'Settings',
  //   href: '/settings',
  //   icon: Settings,
  //   description: 'Application settings',
  // },
]
