'use client'

import { useState, useEffect } from 'react'
import { Database } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Trash2, GripVertical, Plus } from 'lucide-react'
import { createStage, deleteStage, reorderStages, updateStage } from '../actions'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type Stage = Database['public']['Tables']['stages']['Row']

interface SortableStageItemProps {
  stage: Stage
  onDelete: (id: string) => void
  onUpdate: (id: string, updates: { name?: string, color?: string }) => void
}

function SortableStageItem({ stage, onDelete, onUpdate }: SortableStageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: stage.id })

  const [name, setName] = useState(stage.name)

  useEffect(() => {
    setName(stage.name)
  }, [stage.name])

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-3 bg-card border rounded-md shadow-sm mb-2 group">
      <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600">
        <GripVertical className="h-5 w-5" />
      </div>
      <div className="flex-1 flex items-center gap-2">
        <input 
          type="color" 
          value={stage.color || '#6366f1'} 
          onChange={(e) => onUpdate(stage.id, { color: e.target.value })}
          className="h-8 w-8 rounded cursor-pointer border-0 p-0"
        />
        <Input 
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => {
            if (name !== stage.name) onUpdate(stage.id, { name })
          }}
          className="h-8 flex-1"
        />
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onDelete(stage.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function StageManager({ pipelineId, stages }: { pipelineId: string, stages: Stage[] }) {
  const [localStages, setLocalStages] = useState(stages)
  const [newStageName, setNewStageName] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  // Update local state when props change
  if (stages !== localStages && !isAdding) {
    setLocalStages(stages)
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setLocalStages((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)

        const newOrder = arrayMove(items, oldIndex, newIndex)
        
        // Compute new positions
        const updates = newOrder.map((stage, index) => ({
          id: stage.id,
          position: index
        }))

        // Call server action in background
        reorderStages(updates).then(res => {
          if (res.error) toast.error(res.error)
        })

        return newOrder
      })
    }
  }

  async function handleAdd() {
    if (!newStageName.trim()) return
    setIsAdding(true)
    const position = localStages.length
    const result = await createStage(pipelineId, newStageName, '#6366f1', position)
    if (result.error) {
      toast.error(result.error)
    } else if (result.data) {
      setLocalStages([...localStages, result.data])
      setNewStageName('')
    }
    setIsAdding(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza?')) return
    const result = await deleteStage(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      setLocalStages(localStages.filter(s => s.id !== id))
    }
  }

  async function handleUpdate(id: string, updates: { name?: string, color?: string }) {
    const result = await updateStage(id, updates)
    if (result.error) {
      toast.error(result.error)
    } else {
      setLocalStages(localStages.map(s => s.id === id ? { ...s, ...updates } : s))
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Etapas do Funil</h3>
      
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={localStages.map(s => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {localStages.map(stage => (
              <SortableStageItem 
                key={stage.id} 
                stage={stage} 
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="flex items-center gap-2 mt-4 pt-4 border-t">
        <Input 
          placeholder="Nome da nova etapa..." 
          value={newStageName}
          onChange={(e) => setNewStageName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <Button onClick={handleAdd} disabled={isAdding || !newStageName.trim()}>
          <Plus className="h-4 w-4 mr-2" /> Adicionar
        </Button>
      </div>
    </div>
  )
}
