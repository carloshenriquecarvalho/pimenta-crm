import { createClient } from '@/lib/supabase/server'
import { DealsTable } from './components/DealsTable'

export default async function DealsPage() {
  const supabase = await createClient()

  const [dealsRes, stagesRes, contactsRes, usersRes, activitiesRes] = await Promise.all([
    supabase.from('deals').select(`
      *,
      contact:contacts!deals_contact_id_fkey(name),
      owner:profiles!deals_owner_id_fkey(full_name),
      stage:stages!deals_stage_id_fkey(name, color)
    `).order('created_at', { ascending: false }),
    supabase.from('stages').select('*').order('position'),
    supabase.from('contacts').select('*').order('name'),
    supabase.from('profiles').select('*').order('full_name'),
    supabase.from('activities').select('*, user:profiles!activities_user_id_fkey(full_name)').order('created_at', { ascending: false }),
  ])

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Deals</h2>
        <p className="text-muted-foreground">Acompanhe todos os negócios em andamento.</p>
      </div>
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <DealsTable
          deals={dealsRes.data || []}
          stages={stagesRes.data || []}
          contacts={contactsRes.data || []}
          users={usersRes.data || []}
          allActivities={activitiesRes.data || []}
        />
      </div>
    </div>
  )
}
