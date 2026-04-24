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
    <div className="flex h-full w-64 flex-col bg-gray-900 text-white">
      <div className="flex h-16 items-center px-6 border-b border-gray-800">
        <span className="text-xl font-bold text-indigo-400">Pimenta CRM</span>
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
                    ? 'bg-gray-800 text-white shadow-sm'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white',
                  'group relative flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200'
                )}
              >
                {isActive && (
                  <div className="absolute left-0 h-6 w-1 rounded-r-full bg-indigo-500" />
                )}
                <item.icon
                  className={cn(
                    isActive ? 'text-indigo-400' : 'text-gray-400 group-hover:text-indigo-400',
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
