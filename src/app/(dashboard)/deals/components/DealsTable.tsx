'use client'

import { useState } from 'react'
import { Database } from '@/types/database'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search, Plus } from 'lucide-react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { DealSheet } from './DealSheet'
import { createDeal } from '../actions'
import { toast } from 'sonner'

type Deal = Database['public']['Tables']['deals']['Row']
type Stage = Database['public']['Tables']['stages']['Row']
type Contact = Database['public']['Tables']['contacts']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type Activity = Database['public']['Tables']['activities']['Row'] & {
  user?: { full_name: string | null } | null
}

type DealWithDetails = Deal & {
  contact?: { name: string } | null
  owner?: { full_name: string | null } | null
  stage?: { name: string; color: string } | null
}

interface Props {
  deals: DealWithDetails[]
  stages: Stage[]
  contacts: Contact[]
  users: Profile[]
  allActivities: Activity[]
}

const statusColors: Record<string, string> = {
  open: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  won: 'bg-green-100 text-green-700 hover:bg-green-100',
  lost: 'bg-red-100 text-red-700 hover:bg-red-100',
}

const statusLabels: Record<string, string> = {
  open: 'Aberto',
  won: 'Ganho',
  lost: 'Perdido',
}

export function DealsTable({ deals, stages, contacts, users, allActivities }: Props) {
  const [search, setSearch] = useState('')
  const [selectedDeal, setSelectedDeal] = useState<DealWithDetails | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newStageId, setNewStageId] = useState('')
  const [newPipelineId, setNewPipelineId] = useState('')
  const [newContactId, setNewContactId] = useState('')
  const [newOwnerId, setNewOwnerId] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const filtered = deals.filter(d => {
    const term = search.toLowerCase()
    return (
      d.title.toLowerCase().includes(term) ||
      d.contact?.name?.toLowerCase().includes(term) ||
      d.owner?.full_name?.toLowerCase().includes(term)
    )
  })

  const dealActivities = selectedDeal
    ? allActivities.filter(a => a.deal_id === selectedDeal.id)
    : []

  async function handleCreate() {
    if (!newTitle.trim() || !newStageId) return
    setIsCreating(true)
    // Get pipeline_id from stage
    const stage = stages.find(s => s.id === newStageId)
    if (!stage?.pipeline_id) { setIsCreating(false); return }

    const result = await createDeal({
      title: newTitle,
      stage_id: newStageId,
      pipeline_id: stage.pipeline_id,
      contact_id: newContactId || null,
      owner_id: newOwnerId || null,
    })
    setIsCreating(false)
    if (result.error) toast.error(result.error)
    else {
      toast.success('Deal criado!')
      setIsCreateOpen(false)
      setNewTitle('')
      setNewStageId('')
      setNewContactId('')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, contato ou responsável..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="w-4 h-4 mr-2" /> Novo Deal
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Deal</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input placeholder="Ex: Proposta ABC" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Etapa *</Label>
                <Select value={newStageId} onValueChange={(v) => setNewStageId(v || '')}>
                  <SelectTrigger><SelectValue placeholder="Selecione a etapa" /></SelectTrigger>
                  <SelectContent>
                    {stages.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Contato</Label>
                <Select value={newContactId} onValueChange={(v) => setNewContactId(v || '')}>
                  <SelectTrigger><SelectValue placeholder="Vincular contato (opcional)" /></SelectTrigger>
                  <SelectContent>
                    {contacts.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Responsável</Label>
                <Select value={newOwnerId} onValueChange={(v) => setNewOwnerId(v || '')}>
                  <SelectTrigger>
                    <SelectValue>
                      {users.find(u => u.id === newOwnerId)?.full_name || 
                       users.find(u => u.id === newOwnerId)?.email || 
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
              <Button onClick={handleCreate} disabled={isCreating || !newTitle.trim() || !newStageId}>
                {isCreating ? 'Criando...' : 'Criar Deal'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Etapa</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(deal => (
              <TableRow
                key={deal.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedDeal(deal)}
              >
                <TableCell className="font-medium">{deal.title}</TableCell>
                <TableCell>{deal.contact?.name || '-'}</TableCell>
                <TableCell>
                  {deal.stage ? (
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: deal.stage.color }} />
                      {deal.stage.name}
                    </span>
                  ) : '-'}
                </TableCell>
                <TableCell className="font-semibold text-green-700">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: deal.currency || 'BRL' }).format(deal.value || 0)}
                </TableCell>
                <TableCell>{deal.owner?.full_name || '-'}</TableCell>
                <TableCell>
                  <Badge className={statusColors[deal.status || 'open']}>
                    {statusLabels[deal.status || 'open']}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(deal.created_at).toLocaleDateString('pt-BR')}</TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  Nenhum deal encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DealSheet
        deal={selectedDeal}
        stages={stages}
        contacts={contacts}
        users={users}
        activities={dealActivities}
        onClose={() => setSelectedDeal(null)}
        onDealChange={() => setSelectedDeal(null)}
      />
    </div>
  )
}
