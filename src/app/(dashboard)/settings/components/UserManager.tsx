'use client'

import { useState } from 'react'
import { Database } from '@/types/database'
import { updateUserRole, updateUserName } from '../actions'
import { toast } from 'sonner'
import { useAuth } from '@/store/useAuth'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, X } from 'lucide-react'

type Profile = Database['public']['Tables']['profiles']['Row']

export function UserManager({ users: initialUsers }: { users: Profile[] }) {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'
  const [users, setUsers] = useState<Profile[]>(initialUsers)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function handleRoleChange(userId: string, newRole: 'admin' | 'member') {
    if (!isAdmin) return
    const result = await updateUserRole(userId, newRole)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Permissão atualizada!')
    }
  }

  async function handleEditName(user: Profile) {
    setEditingUserId(user.id)
    setEditingName(user.full_name || '')
  }

  async function handleSaveName(userId: string) {
    if (!editingName.trim()) {
      toast.error('Nome não pode ser vazio')
      return
    }
    setIsSaving(true)
    const result = await updateUserName(userId, editingName)
    setIsSaving(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Nome atualizado!')
      // Atualizar o estado local com o novo nome
      setUsers(users.map(u => u.id === userId ? { ...u, full_name: editingName } : u))
      setEditingUserId(null)
    }
  }

  function handleCancel() {
    setEditingUserId(null)
    setEditingName('')
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Equipe</h3>
        {!isAdmin && (
          <p className="text-sm text-muted-foreground">Apenas administradores podem alterar nomes e permissões.</p>
        )}
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Data de Entrada</TableHead>
              <TableHead className="w-[150px]">Permissão</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {editingUserId === user.id ? (
                    <div className="flex gap-2 items-center">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="h-8"
                        autoFocus
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-green-600 hover:bg-green-100"
                        onClick={() => handleSaveName(user.id)}
                        disabled={isSaving}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-600 hover:bg-red-100"
                        onClick={handleCancel}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className={isAdmin ? "cursor-pointer hover:underline" : ""}
                      onClick={() => isAdmin && handleEditName(user)}
                    >
                      {user.full_name || user.email || 'Usuário sem nome'}
                    </div>
                  )}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{new Date(user.created_at).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>
                  {isAdmin && user.id !== profile?.id ? (
                    <Select 
                      defaultValue={user.role} 
                      onValueChange={(val) => handleRoleChange(user.id, val as 'admin' | 'member')}
                    >
                      <SelectTrigger className="w-[130px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Membro</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? 'Admin' : 'Membro'}
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
