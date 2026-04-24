import { AuthForm } from './components/AuthForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-primary">Pimenta CRM</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Acesse ou crie sua conta para continuar
          </p>
        </div>
        <AuthForm />
      </div>
    </div>
  )
}
