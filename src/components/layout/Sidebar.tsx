'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  KanbanSquare, 
  Users, 
  DollarSign, 
  Settings 
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Pipelines', href: '/pipelines', icon: KanbanSquare },
  { name: 'Contatos', href: '/contacts', icon: Users },
  { name: 'Deals', href: '/deals', icon: DollarSign },
  { name: 'Configurações', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-sm">
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
        <span className="text-xl font-bold text-primary">Pimenta CRM</span>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                  'group relative flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200'
                )}
              >
                {isActive && (
                  <div className="absolute left-0 h-6 w-1 rounded-r-full bg-primary" />
                )}
                <item.icon
                  className={cn(
                    isActive ? 'text-primary' : 'text-sidebar-foreground/50 group-hover:text-primary',
                    'mr-3 h-5 w-5 flex-shrink-0 transition-colors'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
