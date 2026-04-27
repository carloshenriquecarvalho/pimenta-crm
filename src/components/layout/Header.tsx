'use client'

import { useAuth } from '@/store/useAuth'
import { logout } from '@/app/(auth)/actions'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogOut, User as UserIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'

import { ThemeToggle } from '@/components/ThemeToggle'

const routeNames: Record<string, string> = {
  '/': 'Dashboard',
  '/pipelines': 'Pipelines',
  '/contacts': 'Contatos',
  '/deals': 'Deals',
  '/settings': 'Configurações',
}

export function Header() {
  const { profile, user } = useAuth()
  const pathname = usePathname()
  
  // Get base path for titles like /pipelines/[id]
  const basePath = `/${pathname.split('/')[1] || ''}`
  const pageTitle = routeNames[pathname] || routeNames[basePath] || 'Pimenta CRM'

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background/80 backdrop-blur-md px-6 shadow-sm z-10 sticky top-0">
      <h1 className="text-xl font-semibold text-foreground">{pageTitle}</h1>
      
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center outline-none">
            <Avatar className="h-9 w-9 border border-gray-200">
              <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'User'} />
              <AvatarFallback className="bg-indigo-100 text-indigo-700">
                {profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || <UserIcon className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{profile?.full_name || 'Usuário'}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-700"
              onClick={() => logout()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
