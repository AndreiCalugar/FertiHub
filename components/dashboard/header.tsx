'use client'

import { Menu } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { NotificationDropdown } from '@/components/notifications/notification-dropdown'

interface HeaderProps {
  user: {
    id: string
    email?: string
    name?: string
  }
  organizationName?: string
  notifications?: any[]
  unreadCount?: number
  onMenuClick?: () => void
}

export function Header({ user, organizationName, notifications = [], unreadCount = 0, onMenuClick }: HeaderProps) {
  const initials = user.name 
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : user.email?.[0].toUpperCase() || 'U'

  return (
    <header className="flex h-14 lg:h-16 items-center justify-between border-b bg-white px-4 lg:px-6 sticky top-0 z-30">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden mr-2"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Open menu</span>
      </Button>

      {/* Welcome message */}
      <div className="hidden sm:block">
        <h2 className="text-xs lg:text-sm font-medium text-gray-500">Welcome back</h2>
        <p className="text-sm lg:text-lg font-semibold text-gray-900 truncate max-w-[200px] lg:max-w-none">
          {organizationName || 'FertiHub'}
        </p>
      </div>

      {/* Logo for mobile (when welcome message is hidden) */}
      <div className="sm:hidden flex-1">
        <p className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          FertiHub
        </p>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        {/* Notifications */}
        <NotificationDropdown
          userId={user.id}
          initialNotifications={notifications}
          initialUnreadCount={unreadCount}
        />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 lg:h-10 lg:w-10 rounded-full">
              <Avatar className="h-9 w-9 lg:h-10 lg:w-10">
                <AvatarFallback className="bg-indigo-600 text-white text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{organizationName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/dashboard/settings">Settings</a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <form action="/auth/signout" method="post" className="w-full">
                <button type="submit" className="w-full text-left">
                  Sign out
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

