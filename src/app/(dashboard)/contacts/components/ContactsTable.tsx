'use client'

import { useState } from 'react'
import { Database } from '@/types/database'
import { ContactForm } from './ContactForm'
import { deleteContact } from '../actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Plus, Trash2, Edit2, Phone, Mail, Building, User as UserIcon } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

type Contact = Database['public']['Tables']['contacts']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type Deal = Database['public']['Tables']['deals']['Row']

// Extended contact with owner profile
type ContactWithDetails = Contact & { owner?: { full_name: string | null } | null }

interface Props {
  contacts: ContactWithDetails[]
  users: Profile[]
  deals: Deal[] // to show deals inside the contact details
}

export function ContactsTable({ contacts, users, deals }: Props) {
  const [search, setSearch] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  
  const [selectedContact, setSelectedContact] = useState<ContactWithDetails | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  const filteredContacts = contacts.filter(c => {
    const term = search.toLowerCase()
    return (
      c.name.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term) ||
      c.company?.toLowerCase().includes(term)
    )
  })

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja deletar este contato?')) return
    const result = await deleteContact(id)
    if (result.error) toast.error(result.error)
    else {
      toast.success('Contato deletado.')
      setSelectedContact(null)
    }
  }

  const contactDeals = selectedContact ? deals.filter(d => d.contact_id === selectedContact.id) : []

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nome, e-mail ou empresa..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="w-4 h-4 mr-2" /> Novo Contato
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Contato</DialogTitle>
            </DialogHeader>
            <ContactForm users={users} onSuccess={() => setIsCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.map((contact) => (
              <TableRow 
                key={contact.id} 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => {
                  setSelectedContact(contact)
                  setIsEditMode(false)
                }}
              >
                <TableCell className="font-medium">{contact.name}</TableCell>
                <TableCell>{contact.email || '-'}</TableCell>
                <TableCell>{contact.phone || '-'}</TableCell>
                <TableCell>{contact.company || '-'}</TableCell>
                <TableCell>
                  {contact.owner?.full_name || <span className="text-muted-foreground">Sem responsável</span>}
                </TableCell>
                <TableCell>{new Date(contact.created_at).toLocaleDateString('pt-BR')}</TableCell>
              </TableRow>
            ))}
            {filteredContacts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  Nenhum contato encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Sheet para Detalhes do Contato */}
      <Sheet open={!!selectedContact} onOpenChange={(open) => !open && setSelectedContact(null)}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          {selectedContact && (
            <>
              <SheetHeader className="mb-6">
                <SheetTitle className="flex justify-between items-center">
                  <span>{isEditMode ? 'Editar Contato' : 'Detalhes do Contato'}</span>
                  <div className="flex items-center gap-2">
                    {!isEditMode && (
                      <Button variant="ghost" size="icon" onClick={() => setIsEditMode(true)}>
                        <Edit2 className="w-4 h-4 text-gray-500" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(selectedContact.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </SheetTitle>
              </SheetHeader>

              {isEditMode ? (
                <ContactForm 
                  initialData={selectedContact} 
                  users={users} 
                  onSuccess={() => {
                    setIsEditMode(false)
                    // Optimistic update via Next.js revalidatePath handles the real data, 
                    // but we might need to close the sheet or let the new data flow in
                    setSelectedContact(null) 
                  }} 
                />
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="text-lg bg-indigo-100 text-indigo-700">
                        {selectedContact.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-xl font-bold">{selectedContact.name}</h2>
                      <p className="text-muted-foreground">{selectedContact.company || 'Sem empresa'}</p>
                    </div>
                  </div>

                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span>{selectedContact.email || '-'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>{selectedContact.phone || '-'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Building className="w-4 h-4 text-gray-500" />
                      <span>{selectedContact.company || '-'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <UserIcon className="w-4 h-4 text-gray-500" />
                      <span>Responsável: {selectedContact.owner?.full_name || '-'}</span>
                    </div>
                  </div>

                  {selectedContact.notes && (
                    <div>
                      <h3 className="font-semibold mb-2">Anotações</h3>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedContact.notes}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold mb-3">Deals Relacionados ({contactDeals.length})</h3>
                    {contactDeals.length > 0 ? (
                      <div className="space-y-2">
                        {contactDeals.map(deal => (
                          <div key={deal.id} className="p-3 border rounded bg-white flex justify-between items-center shadow-sm">
                            <span className="font-medium text-sm">{deal.title}</span>
                            <span className="text-sm font-semibold text-green-600">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: deal.currency || 'BRL' }).format(deal.value || 0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhum negócio associado a este contato.</p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
