'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database'

export async function createContact(data: Database['public']['Tables']['contacts']['Insert']) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Assign logged in user as owner if none provided
  const contactData = {
    ...data,
    owner_id: data.owner_id || user.id
  }

  const { data: contact, error } = await supabase.from('contacts').insert(contactData).select().single()

  if (error) return { error: error.message }
  revalidatePath('/contacts')
  return { data: contact }
}

export async function updateContact(id: string, data: Database['public']['Tables']['contacts']['Update']) {
  const supabase = await createClient()
  const { error } = await supabase.from('contacts').update(data).eq('id', id)
  
  if (error) return { error: error.message }
  revalidatePath('/contacts')
  return { success: true }
}

export async function deleteContact(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('contacts').delete().eq('id', id)
  
  if (error) return { error: error.message }
  revalidatePath('/contacts')
  return { success: true }
}
