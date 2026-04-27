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
