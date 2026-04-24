import { createClient } from '@/lib/supabase/server'
import { ContactsTable } from './components/ContactsTable'

export default async function ContactsPage() {
  const supabase = await createClient()

  // Fetch contacts with owner profile
  const { data: contacts } = await supabase
    .from('contacts')
    .select(`
      *,
      owner:profiles!contacts_owner_id_fkey(full_name)
    `)
    .order('created_at', { ascending: false })

  // Fetch all users for the assignment dropdown
  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name')

  // Fetch all deals to show in the contact details sheet
  const { data: deals } = await supabase
    .from('deals')
    .select('*')

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Contatos</h2>
        <p className="text-muted-foreground">
          Gerencie sua base de clientes, leads e parceiros.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <ContactsTable 
          contacts={contacts || []} 
          users={users || []} 
          deals={deals || []} 
        />
      </div>
    </div>
  )
}
