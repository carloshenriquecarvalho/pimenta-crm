import { createClient } from '@/lib/supabase/server'
import { PipelineManager } from './components/PipelineManager'
import { UserManager } from './components/UserManager'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default async function SettingsPage() {
  const supabase = await createClient()

  const [pipelinesRes, stagesRes, usersRes] = await Promise.all([
    supabase.from('pipelines').select('*').order('created_at', { ascending: false }),
    supabase.from('stages').select('*').order('position', { ascending: true }),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
  ])

  const pipelines = pipelinesRes.data || []
  const stages = stagesRes.data || []
  const users = usersRes.data || []

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">
          Gerencie seus funis de vendas, etapas e acessos da equipe.
        </p>
      </div>

      <Tabs defaultValue="pipelines" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="pipelines">Pipelines e Etapas</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
        </TabsList>
        <TabsContent value="pipelines" className="glass-panel p-6 rounded-lg border shadow-sm">
          <PipelineManager pipelines={pipelines} stages={stages} />
        </TabsContent>
        <TabsContent value="users" className="glass-panel p-6 rounded-lg border shadow-sm">
          <UserManager users={users} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
