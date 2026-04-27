import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { KanbanBoard } from './components/KanbanBoard'
import { KanbanFilters } from './components/KanbanFilters'
import { Suspense } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface Props {
  params: { id: string }
  searchParams: { owner?: string; statuses?: string; search?: string }
}

export default async function PipelinePage({ params: paramsPromise, searchParams: searchParamsPromise }: Props) {
  const params = await paramsPromise
  const searchParams = await searchParamsPromise
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return notFound()

  const [pipelineRes, stagesRes, contactsRes, usersRes, activitiesRes] = await Promise.all([
    supabase.from('pipelines').select('*').eq('id', params.id).single(),
    supabase.from('stages').select('*').eq('pipeline_id', params.id).order('position'),
    supabase.from('contacts').select('*').order('name'),
    supabase.from('profiles').select('*').order('full_name'),
    supabase.from('activities').select('*, user:profiles!activities_user_id_fkey(full_name)').order('created_at', { ascending: false }),
  ])

  if (!pipelineRes.data) return notFound()

  const pipeline = pipelineRes.data
  const stages = stagesRes.data || []
  const contacts = contactsRes.data || []
  const users = usersRes.data || []

  // Fetch all deals for this pipeline with details
  const { data: deals } = await supabase
    .from('deals')
    .select(`
      *,
      contact:contacts!deals_contact_id_fkey(name),
      owner:profiles!deals_owner_id_fkey(full_name, avatar_url)
    `)
    .eq('pipeline_id', params.id)
    .order('created_at', { ascending: true }) // oldest first = highest priority

  // Parse filters from URL — defaults: owner = logged-in user, statuses = ['open']
  const filterOwner = searchParams.owner ?? user.id
  const filterStatuses = searchParams.statuses
    ? searchParams.statuses.split(',').filter(Boolean)
    : ['open']
  const filterSearch = searchParams.search ?? ''

  return (
    <div className="flex flex-col h-full -m-6">
      {/* Header */}
      <div className="px-6 pt-5 pb-3 bg-background border-b">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <Link href="/pipelines" className="hover:text-foreground flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" /> Pipelines
          </Link>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">
          {pipeline.name?.length > 30 ? 'Pipeline sem nome' : pipeline.name || 'Pipeline sem nome'}
        </h2>
        {pipeline.description && (
          <p className="text-sm text-muted-foreground mt-0.5">{pipeline.description}</p>
        )}
      </div>

      {/* Filter Bar */}
      <Suspense>
        <KanbanFilters
          users={users}
          currentOwner={filterOwner}
          currentStatuses={filterStatuses}
          currentSearch={filterSearch}
        />
      </Suspense>

      {/* Kanban Board */}
      <div className="flex-1 overflow-auto p-4">
        <KanbanBoard
          pipeline={pipeline}
          stages={stages}
          initialDeals={deals || []}
          contacts={contacts}
          users={users}
          allActivities={activitiesRes.data || []}
          filterOwner={filterOwner}
          filterStatuses={filterStatuses}
          filterSearch={filterSearch}
        />
      </div>
    </div>
  )
}
