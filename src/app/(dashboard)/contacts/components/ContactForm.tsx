'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useState } from 'react'
import { createContact, updateContact } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Database } from '@/types/database'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Contact = Database['public']['Tables']['contacts']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

const contactSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
  owner_id: z.string().optional(),
})

type ContactFormData = z.infer<typeof contactSchema>

interface Props {
  initialData?: Contact
  users: Profile[]
  onSuccess: () => void
}

export function ContactForm({ initialData, users, onSuccess }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      company: initialData?.company || '',
      notes: initialData?.notes || '',
      owner_id: initialData?.owner_id || '',
    }
  })

  async function onSubmit(data: ContactFormData) {
    setIsLoading(true)
    try {
      if (initialData?.id) {
        const result = await updateContact(initialData.id, data)
        if (result.error) toast.error(result.error)
        else {
          toast.success('Contato atualizado!')
          onSuccess()
        }
      } else {
        const result = await createContact(data)
        if (result.error) toast.error(result.error)
        else {
          toast.success('Contato criado!')
          onSuccess()
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome *</Label>
        <Input id="name" {...register('name')} placeholder="Ex: Maria Silva" />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" {...register('email')} placeholder="maria@empresa.com" />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input id="phone" {...register('phone')} placeholder="(11) 99999-9999" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Empresa</Label>
        <Input id="company" {...register('company')} placeholder="Nome da empresa" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="owner_id">Responsável</Label>
        <Select 
          value={watch('owner_id')} 
          onValueChange={(val) => setValue('owner_id', val)}
        >
          <SelectTrigger>
            <span className="flex-1 text-left truncate">
              {users.find(u => u.id === watch('owner_id'))?.full_name || 
               users.find(u => u.id === watch('owner_id'))?.email || 
               "Selecione um usuário"}
            </span>
          </SelectTrigger>
          <SelectContent>
            {users.map(u => (
              <SelectItem key={u.id} value={u.id}>{u.full_name || u.email}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Anotações</Label>
        <textarea 
          id="notes" 
          {...register('notes')} 
          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Anotações adicionais..."
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Salvando...' : 'Salvar Contato'}
      </Button>
    </form>
  )
}
