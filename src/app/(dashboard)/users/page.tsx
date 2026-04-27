// src/app/(dashboard)/users/page.tsx
import { createClient } from '@/lib/supabase/server'
import { UserListClient } from './components/UserListClient'

type User = {
  id: string
  full_name: string | null
  email: string | null
  avatar_url: string | null
}

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return null

  const { data: users } = await supabase.from('profiles').select('*').order('full_name')

  return <UserListClient initialUsers={users || []} />
}
            </Button>
          </li>
        ))}
      </ul>
      <Dialog open={!!editingUser} onOpenChange={open => !open && closeEdit()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nome completo" />
          </div>
          <DialogFooter>
            <Button onClick={closeEdit} variant="ghost">Cancelar</Button>
            <Button onClick={handleSave} disabled={isPending}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
