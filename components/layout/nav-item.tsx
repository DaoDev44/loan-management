'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItemProps {
  title: string
  href: string
  icon: LucideIcon
  onClick?: () => void
}

export function NavItem({ title, href, icon: Icon, onClick }: NavItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href))

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-card-foreground/60 hover:bg-primary/5 hover:text-card-foreground'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
      <span>{title}</span>
    </Link>
  )
}
