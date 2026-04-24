'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createDeal(data: {
  title: string
  value?: number
  stage_id: string
  pipeline_id: string
  contact_id?: string | null
  owner_id?: string | null
  expected_close_date?: string | null
  notes?: string | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Get max position in the stage
  const { data: maxPos } = await supabase
    .from('deals')
    .select('position')
    .eq('stage_id', data.stage_id)
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const position = (maxPos?.position ?? -1) + 1

  const { data: deal, error } = await supabase
    .from('deals')
    .insert({ ...data, owner_id: data.owner_id || user.id, position })
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/deals')
  revalidatePath('/pipelines')
  return { data: deal }
}

export async function updateDeal(id: string, updates: {
  title?: string
  value?: number
  status?: 'open' | 'won' | 'lost'
  stage_id?: string | null
  contact_id?: string | null
  owner_id?: string | null
  lost_reason?: string | null
  expected_close_date?: string | null
  notes?: string | null
  position?: number
}) {
  const supabase = await createClient()
  const payload = { ...updates, updated_at: new Date().toISOString() }
  const { error } = await supabase.from('deals').update(payload).eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/deals')
  revalidatePath('/pipelines')
  return { success: true }
}

export async function moveDeal(dealId: string, newStageId: string, newPosition: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('deals')
    .update({ stage_id: newStageId, position: newPosition, updated_at: new Date().toISOString() })
    .eq('id', dealId)

  if (error) return { error: error.message }
  revalidatePath('/pipelines')
  return { success: true }
}

export async function deleteDeal(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('deals').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/deals')
  revalidatePath('/pipelines')
  return { success: true }
}

export async function addActivity(data: {
  deal_id: string
  type: 'note' | 'call' | 'email' | 'meeting' | 'status_change'
  content: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: activity, error } = await supabase
    .from('activities')
    .insert({ ...data, user_id: user.id })
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/deals')
  revalidatePath('/pipelines')
  return { data: activity }
}
