'use client'

import { useState, useCallback, useTransition } from 'react'
import { Database } from '@/types/database'
import { DealSheet } from '../../../deals/components/DealSheet'
import { createDeal, moveDeal, addActivity } from '../../../deals/actions'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, Calendar, DollarSign, User as UserIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type Deal = Database['public']['Tables']['deals']['Row']
type Stage = Database['public']['Tables']['stages']['Row']
type Contact = Database['public']['Tables']['contacts']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type Activity = Database['public']['Tables']['activities']['Row'] & {
  user?: { full_name: string | null } | null
}

type DealWithDetails = Deal & {
  contact?: { name: string } | null
  owner?: { full_name: string | null; avatar_url: string | null } | null
}

const statusColors: Record<string, string> = {
  open: 'bg-blue-100 text-blue-700',
  won: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
}

const statusLabels: Record<string, string> = {
  open: 'Aberto',
  won: 'Ganho',
  lost: 'Perdido',
}

// --------------- KanbanCard Component ---------------
function KanbanCard({
  deal,
  onClick,
  isDragging = false,
}: {
  deal: DealWithDetails
  onClick: () => void
  isDragging?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortDragging } = useSortable({
    id: deal.id,
    data: { type: 'deal', deal },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortDragging ? 0.3 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        bg-white rounded-lg border shadow-sm p-3 cursor-pointer
        hover:shadow-md hover:-translate-y-0.5 transition-all group
        border-l-4
      `}
      style={{ ...style, borderLeftColor: deal.status === 'won' ? '#16a34a' : deal.status === 'lost' ? '#dc2626' : '#6366f1' }}
    >
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-900 leading-tight">{deal.title}</p>

        {deal.contact?.name && (
          <p className="text-xs text-gray-500 truncate">{deal.contact.name}</p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-green-700">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: deal.currency || 'BRL' }).format(deal.value || 0)}
          </span>
          <Badge className={`text-xs ${statusColors[deal.status || 'open']}`}>
            {statusLabels[deal.status || 'open']}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(deal.created_at), 'dd/MM', { locale: ptBR })}
          </span>
          {deal.owner && (
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-[9px] bg-indigo-100 text-indigo-700">
                {deal.owner.full_name?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </div>
  )
}

// --------------- Drag Overlay Card ---------------
function OverlayCard({ deal }: { deal: DealWithDetails }) {
  return (
    <div
      className="bg-white rounded-lg border-2 border-indigo-400 shadow-xl p-3 rotate-2 opacity-90 w-64"
      style={{ borderLeftColor: '#6366f1', borderLeftWidth: 4 }}
    >
      <p className="text-sm font-semibold">{deal.title}</p>
      {deal.contact?.name && <p className="text-xs text-gray-500">{deal.contact.name}</p>}
      <p className="text-sm font-bold text-green-700 mt-1">
        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: deal.currency || 'BRL' }).format(deal.value || 0)}
      </p>
    </div>
  )
}

// --------------- KanbanColumn Component ---------------
function KanbanColumn({
  stage,
  deals,
  onCardClick,
  onAddDeal,
}: {
  stage: Stage
  deals: DealWithDetails[]
  onCardClick: (deal: DealWithDetails) => void
  onAddDeal: (stageId: string) => void
}) {
  const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0)

  return (
    <div className="flex-shrink-0 w-72 flex flex-col h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between p-3 bg-white rounded-t-lg border border-b-0">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
          <span className="text-sm font-semibold text-gray-800">{stage.name}</span>
          <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-1.5 py-0.5">{deals.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-green-700 font-medium">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(totalValue)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-400 hover:text-indigo-600"
            onClick={() => onAddDeal(stage.id)}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Cards Area */}
      <div className="flex-1 overflow-y-auto border border-t-0 rounded-b-lg bg-gray-50 p-2 space-y-2 min-h-[200px]">
        <SortableContext items={deals.map(d => d.id)} strategy={verticalListSortingStrategy}>
          {deals.map(deal => (
            <KanbanCard
              key={deal.id}
              deal={deal}
              onClick={() => onCardClick(deal)}
            />
          ))}
          {deals.length === 0 && (
            <div className="flex items-center justify-center h-16 text-xs text-gray-400">
              Solte um deal aqui
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  )
}

// --------------- Main KanbanBoard Component ---------------
interface KanbanBoardProps {
  pipeline: { id: string; name: string }
  stages: Stage[]
  initialDeals: DealWithDetails[]
  contacts: Contact[]
  users: Profile[]
  allActivities: Activity[]
  // Filter props (from parent server component via URL)
  filterOwner: string
  filterStatuses: string[]
  filterSearch: string
}

export function KanbanBoard({
  pipeline,
  stages,
  initialDeals,
  contacts,
  users,
  allActivities,
  filterOwner,
  filterStatuses,
  filterSearch,
}: KanbanBoardProps) {
  console.log('DEBUG: KanbanBoard Data', { 
    pipelineName: pipeline.name, 
    userCount: users.length, 
    firstUser: users[0],
    dealsCount: initialDeals.length 
  })
  const [deals, setDeals] = useState<DealWithDetails[]>(initialDeals)
  const [selectedDeal, setSelectedDeal] = useState<DealWithDetails | null>(null)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [addStageId, setAddStageId] = useState<string | null>(null)
  const [newDealTitle, setNewDealTitle] = useState('')
  const [newDealContact, setNewDealContact] = useState('')
  const [newDealOwner, setNewDealOwner] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isPending, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  // Apply filters
  const filteredDeals = deals.filter(deal => {
    if (filterOwner && filterOwner !== 'all' && deal.owner_id !== filterOwner) return false
    if (filterStatuses.length > 0 && !filterStatuses.includes(deal.status || 'open')) return false
    if (filterSearch) {
      const term = filterSearch.toLowerCase()
      if (
        !deal.title.toLowerCase().includes(term) &&
        !deal.contact?.name?.toLowerCase().includes(term)
      ) return false
    }
    return true
  })

  const activeDeal = activeDragId ? deals.find(d => d.id === activeDragId) || null : null

  function getDealsForStage(stageId: string) {
    return filteredDeals
      .filter(d => d.stage_id === stageId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveDragId(event.active.id as string)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    // Find the stage of the dragged deal
    const activeDeal = deals.find(d => d.id === activeId)
    if (!activeDeal) return

    // Determine target stage
    const overDeal = deals.find(d => d.id === overId)
    const targetStageId = overDeal ? overDeal.stage_id : overId

    if (!targetStageId || activeDeal.stage_id === targetStageId) return

    // Optimistic update: move deal to new stage
    setDeals(prev =>
      prev.map(d =>
        d.id === activeId ? { ...d, stage_id: targetStageId } : d
      )
    )
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveDragId(null)

    if (!over) return

    const activeId = active.id as string
    const deal = deals.find(d => d.id === activeId)
    if (!deal || !deal.stage_id) return

    const stageDeals = deals
      .filter(d => d.stage_id === deal.stage_id)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    const newPosition = stageDeals.findIndex(d => d.id === activeId)

    // Persist to DB
    startTransition(async () => {
      const result = await moveDeal(activeId, deal.stage_id!, newPosition)
      if (result.error) {
        toast.error(result.error)
      }
    })
  }

  async function handleCreateDeal() {
    if (!newDealTitle.trim() || !addStageId) return
    setIsCreating(true)
    const stage = stages.find(s => s.id === addStageId)
    if (!stage?.pipeline_id) { setIsCreating(false); return }

    const result = await createDeal({
      title: newDealTitle,
      stage_id: addStageId,
      pipeline_id: stage.pipeline_id,
      contact_id: newDealContact || null,
      owner_id: newDealOwner || null,
    })
    setIsCreating(false)
    if (result.error) toast.error(result.error)
    else if (result.data) {
      toast.success('Deal criado!')
      setDeals(prev => [...prev, result.data as DealWithDetails])
      setAddStageId(null)
      setNewDealTitle('')
      setNewDealContact('')
    }
  }

  const dealActivities = selectedDeal
    ? allActivities.filter(a => a.deal_id === selectedDeal.id)
    : []

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 h-full">
          {stages.map(stage => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              deals={getDealsForStage(stage.id)}
              onCardClick={(deal) => setSelectedDeal(deal)}
              onAddDeal={(stageId) => setAddStageId(stageId)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeDeal && <OverlayCard deal={activeDeal} />}
        </DragOverlay>
      </DndContext>

      {/* Create Deal Dialog (Quick Add via + button in column header) */}
      <Dialog open={!!addStageId} onOpenChange={(open) => !open && setAddStageId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Deal — {stages.find(s => s.id === addStageId)?.name}</DialogTitle>
          </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input
                  placeholder="Ex: Proposta Empresa XYZ"
                  value={newDealTitle}
                  onChange={(e) => setNewDealTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateDeal()}
                />
              </div>
              <div className="space-y-2">
                <Label>Contato</Label>
                <Select value={newDealContact} onValueChange={(v) => setNewDealContact(v || '')}>
                  <SelectTrigger><SelectValue placeholder="Vincular contato (opcional)" /></SelectTrigger>
                  <SelectContent>
                    {contacts.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Responsável</Label>
                <Select value={newDealOwner} onValueChange={(v) => setNewDealOwner(v || '')}>
                  <SelectTrigger>
                    <SelectValue>
                      {users.find(u => u.id === newDealOwner)?.full_name || 
                       users.find(u => u.id === newDealOwner)?.email || 
                       "Atribuir a..."}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(u => <SelectItem key={u.id} value={u.id}>{u.full_name || u.email}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          <DialogFooter>
            <Button onClick={handleCreateDeal} disabled={isCreating || !newDealTitle.trim()}>
              {isCreating ? 'Criando...' : 'Criar Deal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deal Sheet */}
      <DealSheet
        deal={selectedDeal}
        stages={stages}
        contacts={contacts}
        users={users}
        activities={dealActivities}
        onClose={() => setSelectedDeal(null)}
        onDealChange={() => setSelectedDeal(null)}
      />
    </>
  )
}
