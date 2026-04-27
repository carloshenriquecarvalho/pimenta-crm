'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPipeline(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const description = formData.get('description') as string

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase.from('pipelines').insert({
    name,
    description,
    created_by: user.id
  }).select().single()

  if (error) return { error: error.message }
  revalidatePath('/settings')
  return { data }
}

export async function deletePipeline(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('pipelines').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/settings')
  return { success: true }
}

export async function updatePipeline(id: string, name: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('pipelines').update({ name }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/settings')
  return { success: true }
}

export async function createStage(pipelineId: string, name: string, color: string, position: number) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('stages').insert({
    pipeline_id: pipelineId,
    name,
    color,
    position
  }).select().single()

  if (error) return { error: error.message }
  revalidatePath('/settings')
  return { data }
}

export async function updateStage(id: string, updates: { name?: string, color?: string }) {
  const supabase = await createClient()
  const { error } = await supabase.from('stages').update(updates).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/settings')
  return { success: true }
}

export async function deleteStage(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('stages').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/settings')
  return { success: true }
}

export async function reorderStages(stages: { id: string, position: number }[]) {
  const supabase = await createClient()
  // Supabase doesn't have a bulk update for different rows with different values easily via RPC unless we create one.
  // We'll just loop and update since settings aren't updated super frequently concurrently.
  for (const stage of stages) {
    const { error } = await supabase.from('stages').update({ position: stage.position }).eq('id', stage.id)
    if (error) return { error: error.message }
  }
  revalidatePath('/settings')
  return { success: true }
}

export async function updateUserRole(userId: string, role: 'admin' | 'member') {
  const supabase = await createClient()
  const { error } = await supabase.from('profiles').update({ role }).eq('id', userId)
  if (error) return { error: error.message }
  revalidatePath('/settings')
  return { success: true }
}

export async function updateUserName(userId: string, fullName: string) {
  const supabase = await createClient()
  
  // Verifica permissões
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Atualiza e retorna os dados atualizados
  const { data, error } = await supabase
    .from('profiles')
    .update({ full_name: fullName })
    .eq('id', userId)
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/settings')
  return { data, success: true }
}
