'use client'

import { useState } from 'react'
import { Database } from '@/types/database'
import { updateDeal, deleteDeal, addActivity } from '../actions'
import { toast } from 'sonner'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Trash2, CheckCircle2, XCircle, Circle, MessageSquare, Phone, Mail, Users, Calendar
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

type Deal = Database['public']['Tables']['deals']['Row']
type Stage = Database['public']['Tables']['stages']['Row']
type Contact = Database['public']['Tables']['contacts']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type Activity = Database['public']['Tables']['activities']['Row'] & {
  user?: { full_name: string | null } | null
}

interface Props {
  deal: Deal | null
  stages: Stage[]
  contacts: Contact[]
  users: Profile[]
  activities: Activity[]
  onClose: () => void
  onDealChange?: () => void
}

const activityTypeIcons: Record<string, React.ReactNode> = {
  note: <MessageSquare className="h-4 w-4" />,
  call: <Phone className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  meeting: <Users className="h-4 w-4" />,
  status_change: <Calendar className="h-4 w-4" />,
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

export function DealSheet({ deal, stages, contacts, users, activities, onClose, onDealChange }: Props) {
  const [title, setTitle] = useState(deal?.title || '')
  const [value, setValue] = useState(String(deal?.value || 0))
  const [stageId, setStageId] = useState(deal?.stage_id || '')
  const [contactId, setContactId] = useState(deal?.contact_id || '')
  const [ownerId, setOwnerId] = useState(deal?.owner_id || '')
  const [expectedClose, setExpectedClose] = useState(deal?.expected_close_date || '')
  const [status, setStatus] = useState<'open' | 'won' | 'lost'>(deal?.status as any || 'open')
  const [lostReason, setLostReason] = useState(deal?.lost_reason || '')
  const [notes, setNotes] = useState(deal?.notes || '')
  const [newNote, setNewNote] = useState('')
  const [noteType, setNoteType] = useState<'note' | 'call' | 'email' | 'meeting'>('note')
  const [isSaving, setIsSaving] = useState(false)
  const [isAddingNote, setIsAddingNote] = useState(false)

  if (!deal) return null

  async function handleSave() {
    if (!deal) return
    setIsSaving(true)
    const result = await updateDeal(deal.id, {
      title,
      value: parseFloat(value) || 0,
      stage_id: stageId || null,
      contact_id: contactId || null,
      owner_id: ownerId || null,
      expected_close_date: expectedClose || null,
      status,
      lost_reason: status === 'lost' ? lostReason : null,
      notes,
    })
    setIsSaving(false)
    if (result.error) toast.error(result.error)
    else {
      toast.success('Deal atualizado!')
      onDealChange?.()
    }
  }

  async function handleStatusChange(newStatus: 'open' | 'won' | 'lost') {
    if (!deal) return
    setStatus(newStatus)
    const result = await updateDeal(deal.id, { status: newStatus })
    if (result.error) toast.error(result.error)
    else {
      toast.success(`Deal marcado como ${statusLabels[newStatus]}!`)
      // Log activity
      await addActivity({
        deal_id: deal.id,
        type: 'status_change',
        content: `Status alterado para ${statusLabels[newStatus]}`,
      })
      onDealChange?.()
    }
  }

  async function handleDelete() {
    if (!deal) return
    if (!confirm('Tem certeza que deseja deletar este deal?')) return
    const result = await deleteDeal(deal.id)
    if (result.error) toast.error(result.error)
    else {
      toast.success('Deal deletado.')
      onClose()
    }
  }

  async function handleAddNote() {
    if (!deal || !newNote.trim()) return
    setIsAddingNote(true)
    const result = await addActivity({
      deal_id: deal.id,
      type: noteType,
      content: newNote,
    })
    setIsAddingNote(false)
    if (result.error) toast.error(result.error)
    else {
      toast.success('Atividade adicionada!')
      setNewNote('')
      onDealChange?.()
    }
  }

  const contact = contacts.find(c => c.id === contactId)

  return (
    <Sheet open={!!deal} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-xl w-full overflow-y-auto p-0">
        {/* Header */}
        <div className="p-6 border-b sticky top-0 bg-white z-10">
          <SheetHeader>
            <div className="flex justify-between items-start">
              <SheetTitle className="text-lg">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg font-bold border-0 p-0 h-auto focus-visible:ring-0 shadow-none"
                  onBlur={handleSave}
                />
              </SheetTitle>
              <Button variant="ghost" size="icon" onClick={handleDelete} className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[status]}`}>
                {statusLabels[status]}
              </span>
              <span className="text-xs text-muted-foreground">
                Criado em {format(new Date(deal.created_at), "dd/MM/yyyy", { locale: ptBR })}
              </span>
            </div>
          </SheetHeader>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Buttons */}
          <div className="flex gap-2">
            <Button
              variant={status === 'open' ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
              onClick={() => handleStatusChange('open')}
            >
              <Circle className="h-3.5 w-3.5 mr-1.5" /> Aberto
            </Button>
            <Button
              variant={status === 'won' ? 'default' : 'outline'}
              size="sm"
              className={`flex-1 ${status === 'won' ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-green-50 text-green-700 border-green-200'}`}
              onClick={() => handleStatusChange('won')}
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Ganho
            </Button>
            <Button
              variant={status === 'lost' ? 'default' : 'outline'}
              size="sm"
              className={`flex-1 ${status === 'lost' ? 'bg-red-600 hover:bg-red-700' : 'hover:bg-red-50 text-red-700 border-red-200'}`}
              onClick={() => handleStatusChange('lost')}
            >
              <XCircle className="h-3.5 w-3.5 mr-1.5" /> Perdido
            </Button>
          </div>

          {status === 'lost' && (
            <div className="space-y-2">
              <Label>Motivo da Perda *</Label>
              <Input
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
                placeholder="Descreva o motivo..."
                onBlur={handleSave}
              />
            </div>
          )}

          {/* Core Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={handleSave}
              />
            </div>
            <div className="space-y-2">
              <Label>Previsão de Fechamento</Label>
              <Input
                type="date"
                value={expectedClose}
                onChange={(e) => setExpectedClose(e.target.value)}
                onBlur={handleSave}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Etapa</Label>
            <Select value={stageId} onValueChange={(v) => { setStageId(v); setTimeout(handleSave, 100) }}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a etapa" />
              </SelectTrigger>
              <SelectContent>
                {stages.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Contato</Label>
            <Select value={contactId} onValueChange={(v) => { setContactId(v); setTimeout(handleSave, 100) }}>
              <SelectTrigger>
                <SelectValue placeholder="Vincular contato" />
              </SelectTrigger>
              <SelectContent>
                {contacts.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Responsável</Label>
            <Select value={ownerId} onValueChange={(v) => { setOwnerId(v); setTimeout(handleSave, 100) }}>
              <SelectTrigger>
                <SelectValue>
                  {users.find(u => u.id === ownerId)?.full_name || 
                   users.find(u => u.id === ownerId)?.email || 
                   "Atribuir a..."}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {users.map(u => (
                  <SelectItem key={u.id} value={u.id}>{u.full_name || u.email}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Notas Internas</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleSave}
              placeholder="Anotações sobre este deal..."
              rows={3}
            />
          </div>

          {/* Activity Feed */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Histórico de Atividades</h3>

            {/* Add Activity */}
            <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
              <div className="flex gap-2">
                <Select value={noteType} onValueChange={(v: any) => setNoteType(v)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="note">Nota</SelectItem>
                    <SelectItem value="call">Ligação</SelectItem>
                    <SelectItem value="email">E-mail</SelectItem>
                    <SelectItem value="meeting">Reunião</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Registrar atividade..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                />
                <Button onClick={handleAddNote} disabled={isAddingNote || !newNote.trim()} size="sm">
                  OK
                </Button>
              </div>
            </div>

            {/* Activity List */}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {activities.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">Nenhuma atividade registrada.</p>
              )}
              {activities.map(act => (
                <div key={act.id} className="flex gap-3 text-sm">
                  <div className="flex-shrink-0 mt-0.5 p-1.5 rounded-full bg-indigo-50 text-indigo-600">
                    {activityTypeIcons[act.type] || <MessageSquare className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800">{act.content}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {act.user?.full_name || 'Usuário'} · {format(new Date(act.created_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t">
          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
