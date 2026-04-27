'use client'

import { useState } from 'react'
import { Database } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Trash2, Edit2, Plus, GripVertical } from 'lucide-react'
import { deletePipeline, updatePipeline, createPipeline } from '../actions'
import { StageManager } from './StageManager'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'

type Pipeline = Database['public']['Tables']['pipelines']['Row']
type Stage = Database['public']['Tables']['stages']['Row']

interface Props {
  pipelines: Pipeline[]
  stages: Stage[]
}

export function PipelineManager({ pipelines, stages }: Props) {
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(pipelines[0]?.id || null)
  const [isCreating, setIsCreating] = useState(false)

  async function handleCreate(formData: FormData) {
    const result = await createPipeline(formData)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Pipeline criado com sucesso!')
      setIsCreating(false)
      if (result.data) {
        setSelectedPipelineId(result.data.id)
      }
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza? Isso apagará o pipeline e todos os negócios associados a ele.')) return
    const result = await deletePipeline(id)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Pipeline deletado.')
      if (selectedPipelineId === id) setSelectedPipelineId(pipelines[0]?.id || null)
    }
  }

  const selectedPipeline = pipelines.find(p => p.id === selectedPipelineId)
  const pipelineStages = stages.filter(s => s.pipeline_id === selectedPipelineId).sort((a, b) => a.position - b.position)

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Pipeline List */}
      <div className="w-full md:w-1/3 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Seus Pipelines</h3>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger render={<Button size="sm" variant="outline" />}>
              <Plus className="w-4 h-4 mr-1" /> Novo
            </DialogTrigger>
            <DialogContent>
              <form action={handleCreate}>
                <DialogHeader>
                  <DialogTitle>Novo Pipeline</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" name="name" required placeholder="Ex: Vendas B2B" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Input id="description" name="description" placeholder="Opcional" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Criar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-2">
          {pipelines.map(pipeline => (
            <div 
              key={pipeline.id}
              className={`flex items-center justify-between p-3 rounded-md border cursor-pointer transition-colors ${
                selectedPipelineId === pipeline.id ? 'bg-primary/10 border-primary/20' : 'bg-card hover:bg-muted/50'
              }`}
              onClick={() => setSelectedPipelineId(pipeline.id)}
            >
              <span className="font-medium text-sm">{pipeline.name}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={(e) => { e.stopPropagation(); handleDelete(pipeline.id) }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {pipelines.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum pipeline encontrado.</p>
          )}
        </div>
      </div>

      {/* Stage Manager for Selected Pipeline */}
      <div className="w-full md:w-2/3 border rounded-lg p-4 bg-card shadow-sm">
        {selectedPipeline ? (
          <StageManager pipelineId={selectedPipeline.id} stages={pipelineStages} />
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Selecione ou crie um pipeline para gerenciar suas etapas.
          </div>
        )}
      </div>
    </div>
  )
}
