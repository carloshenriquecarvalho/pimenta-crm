'use client'

import { useState } from 'react'
import { login, signup } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    try {
      if (isLogin) {
        const result = await login(formData)
        if (result?.error) {
          toast.error(result.error)
        } else {
          toast.success('Login realizado com sucesso!')
        }
      } else {
        const result = await signup(formData)
        if (result?.error) {
          toast.error(result.error)
        } else {
          toast.success('Conta criada com sucesso!')
        }
      }
    } catch (err) {
      toast.error('Ocorreu um erro inesperado.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isLogin ? 'Entrar' : 'Criar Conta'}</CardTitle>
        <CardDescription>
          {isLogin 
            ? 'Insira suas credenciais para acessar sua conta' 
            : 'Preencha os dados abaixo para criar sua conta'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome Completo</Label>
              <Input id="full_name" name="full_name" required placeholder="João Silva" disabled={isLoading} />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" required placeholder="seu@email.com" disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" name="password" type="password" required disabled={isLoading} />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLogin ? 'Entrar' : 'Registrar'}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          variant="link" 
          className="w-full text-sm text-muted-foreground"
          onClick={() => setIsLogin(!isLogin)}
          disabled={isLoading}
        >
          {isLogin ? 'Não tem uma conta? Registre-se' : 'Já tem uma conta? Entre aqui'}
        </Button>
      </CardFooter>
    </Card>
  )
}
