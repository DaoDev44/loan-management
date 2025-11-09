'use client'

import { DollarSign } from 'lucide-react'
import Link from 'next/link'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { NavItem } from './nav-item'
import { navItems } from '@/lib/navigation'

interface MobileNavProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <SheetHeader className="border-b p-6">
            <SheetTitle asChild>
              <Link
                href="/"
                className="flex items-center gap-2"
                onClick={() => onOpenChange(false)}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <DollarSign className="h-5 w-5" />
                </div>
                <span className="text-lg font-semibold">Loanly</span>
              </Link>
            </SheetTitle>
          </SheetHeader>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <NavItem
                key={item.href}
                title={item.title}
                href={item.href}
                icon={item.icon}
                onClick={() => onOpenChange(false)}
              />
            ))}
          </nav>

          {/* Footer */}
          <div className="border-t p-4">
            <p className="text-xs text-muted-foreground">© 2024 Loanly</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
