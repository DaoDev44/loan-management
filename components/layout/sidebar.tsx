import Link from 'next/link'
import { DollarSign } from 'lucide-react'
import { NavItem } from './nav-item'
import { navItems } from '@/lib/navigation'
import { Separator } from '@/components/ui/separator'

export function Sidebar() {
  return (
    <div className="flex h-full flex-col border-r bg-card">
      {/* Logo and branding */}
      <div className="flex h-16 items-center border-b px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-card-foreground transition-colors hover:text-primary"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <DollarSign className="h-5 w-5" />
          </div>
          <span className="text-lg">Loanly</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Main navigation">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            title={item.title}
            href={item.href}
            icon={item.icon}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground">
          © 2024 Loanly
        </p>
      </div>
    </div>
  )
}
