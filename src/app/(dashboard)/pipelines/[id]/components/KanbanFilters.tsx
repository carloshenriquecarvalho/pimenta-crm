'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { Database } from '@/types/database'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Search } from 'lucide-react'

type Profile = Database['public']['Tables']['profiles']['Row']

interface Props {
  users: Profile[]
  currentOwner: string
  currentStatuses: string[]
  currentSearch: string
}

const ALL_STATUSES = ['open', 'won', 'lost']
const STATUS_LABELS: Record<string, string> = { open: 'Aberto', won: 'Ganho', lost: 'Perdido' }

export function KanbanFilters({ users, currentOwner, currentStatuses, currentSearch }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === null || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`)
      })
    },
    [pathname, router, searchParams]
  )

  function toggleStatus(status: string) {
    const next = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status]
    updateParam('statuses', next.join(','))
  }

  const statusBtnClass = (status: string) => {
    const isActive = currentStatuses.includes(status)
    const colors: Record<string, string> = {
      open: isActive ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50',
      won: isActive ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-white text-green-700 border-green-200 hover:bg-green-50',
      lost: isActive ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-white text-red-700 border-red-200 hover:bg-red-50',
    }
    return `border text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${colors[status]}`
  }

  return (
    <div className="flex flex-wrap gap-3 items-center py-3 px-4 bg-white border-b">
      {/* Owner Filter */}
      <Select value={currentOwner || 'all'} onValueChange={(v) => updateParam('owner', v === 'all' ? null : v)}>
        <SelectTrigger className="w-48 h-8 text-xs">
          <SelectValue placeholder="Responsável" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os responsáveis</SelectItem>
          {users.map(u => (
            <SelectItem key={u.id} value={u.id}>{u.full_name || u.email}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Toggles */}
      <div className="flex items-center gap-1.5">
        {ALL_STATUSES.map(status => (
          <button
            key={status}
            onClick={() => toggleStatus(status)}
            className={statusBtnClass(status)}
          >
            {STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative flex-1 min-w-[180px] max-w-xs">
        <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Buscar deals..."
          className="pl-7 h-8 text-xs"
          defaultValue={currentSearch}
          onChange={(e) => {
            const v = e.target.value
            clearTimeout((window as any).__kanbanSearchTimeout)
            ;(window as any).__kanbanSearchTimeout = setTimeout(() => {
              updateParam('search', v)
            }, 400)
          }}
        />
      </div>
    </div>
  )
}
