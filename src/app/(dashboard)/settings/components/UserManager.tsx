'use client'

import { Database } from '@/types/database'
import { updateUserRole } from '../actions'
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

type Profile = Database['public']['Tables']['profiles']['Row']

export function UserManager({ users }: { users: Profile[] }) {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'

  async function handleRoleChange(userId: string, newRole: 'admin' | 'member') {
    if (!isAdmin) return
    const result = await updateUserRole(userId, newRole)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Permissão atualizada!')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Equipe</h3>
        {!isAdmin && (
          <p className="text-sm text-muted-foreground">Apenas administradores podem alterar permissões.</p>
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
                <TableCell className="font-medium">{user.full_name || user.email || 'Usuário sem nome'}</TableCell>
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
