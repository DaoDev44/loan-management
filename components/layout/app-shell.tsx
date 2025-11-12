'use client'

import { useState } from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { MobileNav } from './mobile-nav'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 lg:block fixed left-0 top-0 h-screen overflow-y-auto">
        <Sidebar />
      </aside>

      {/* Mobile Navigation */}
      <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:ml-64">
        <Header onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 bg-background px-6 pt-6 pb-8">{children}</main>
      </div>
    </div>
  )
}
