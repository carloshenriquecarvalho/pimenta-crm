// src/app/(dashboard)/users/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database'

export async function updateUser(
  id: string,
  data: { full_name?: string | null; avatar_url?: string | null }
) {
  const supabase = await createClient()
  const { error } = await supabase.from('profiles').update(data).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/users')
  return { success: true }
}
