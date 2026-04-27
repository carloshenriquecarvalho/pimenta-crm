'use client'

import { useState, useEffect, useTransition } from 'react'
import { updateUser } from '../actions'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type User = {
  id: string
  full_name: string | null
  email: string | null
  avatar_url: string | null
}

export function UserListClient({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [newName, setNewName] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  useEffect(() => {
    setUsers(initialUsers)
  }, [initialUsers])

  function openEdit(user: User) {
    setEditingUser(user)
    setNewName(user.full_name ?? '')
  }

  function closeEdit() {
    setEditingUser(null)
    setNewName('')
  }

  async function handleSave() {
    if (!editingUser) return
    startTransition(async () => {
      const result = await updateUser(editingUser.id, { full_name: newName })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Nome atualizado')
        // Optimistic UI update
        setUsers(prev =>
          prev.map(u => (u.id === editingUser.id ? { ...u, full_name: newName } : u))
        )
        closeEdit()
        router.refresh()
      }
    })
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Usuários</h1>
      <ul className="space-y-2">
        {users.map(user => (
          <li key={user.id} className="flex items-center gap-4 p-2 border rounded">
            <Avatar>
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.full_name ?? ''} className="rounded-full" />
              ) : (
                <AvatarFallback>{user.full_name?.[0] ?? '?'}</AvatarFallback>
              )}
            </Avatar>
            <span className="flex-1">{user.full_name || 'Sem nome'}</span>
            <Button variant="outline" size="sm" onClick={() => openEdit(user)}>
              Editar
            </Button>
          </li>
        ))}
      </ul>

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && closeEdit()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Nome</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Novo nome"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={closeEdit}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
