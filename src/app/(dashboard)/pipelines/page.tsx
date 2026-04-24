import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function PipelinesPage() {
  const supabase = await createClient()

  const { data: pipelines } = await supabase
    .from('pipelines')
    .select('*, stages(count)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pipelines</h2>
          <p className="text-muted-foreground">Escolha um funil de vendas para gerenciar seus deals.</p>
        </div>
        <Link href="/settings">
          <Button variant="outline"><Plus className="w-4 h-4 mr-2" /> Novo Pipeline</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pipelines?.map(pipeline => (
          <Link key={pipeline.id} href={`/pipelines/${pipeline.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-indigo-200">
              <CardHeader>
                <CardTitle className="text-lg">{pipeline.name}</CardTitle>
                {pipeline.description && (
                  <CardDescription>{pipeline.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Criado em {new Date(pipeline.created_at).toLocaleDateString('pt-BR')}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}

        {pipelines?.length === 0 && (
          <div className="col-span-3 text-center py-16 text-muted-foreground">
            <p>Nenhum pipeline encontrado.</p>
            <Link href="/settings">
              <Button variant="link" className="mt-2">Criar primeiro pipeline →</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
