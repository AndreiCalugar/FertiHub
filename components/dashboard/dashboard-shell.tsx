'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'

interface DashboardShellProps {
  user: {
    id: string
    email?: string
    name?: string
  }
  organizationName?: string
  notifications?: any[]
  unreadCount?: number
  children: React.ReactNode
}

export function DashboardShell({
  user,
  organizationName,
  notifications = [],
  unreadCount = 0,
  children,
}: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />
      <div className="flex flex-1 flex-col min-w-0">
        <Header 
          user={user}
          organizationName={organizationName}
          notifications={notifications}
          unreadCount={unreadCount}
          onMenuClick={() => setMobileMenuOpen(true)}
        />
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}

