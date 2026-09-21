/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { translateAuthError } from '@/lib/auth-errors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { AuthShell } from '@/components/layout/AuthShell'
import { AlertCircle, Loader2, Mail, ArrowRight, User, Lock } from 'lucide-react'

// Separamos o formulário em um componente para usar o useSearchParams dentro do Suspense
function SignUpForm() {
  const router = useRouter()
  const supabase = createClient()
  const searchParams = useSearchParams()

  // Verifica se veio email pelo link de convite
  const emailFromInvite = searchParams.get('email')
  const isInvite = !!emailFromInvite

  const [name, setName] = useState('')
  // Se tiver convite, usa o email do convite, senão vazio
  const [email, setEmail] = useState(emailFromInvite || '')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const normalizedEmail = email.trim().toLowerCase()

    // Se NÃO for convite, aplica a validação de domínio.
    // Se FOR convite, assumimos que o Admin permitiu esse email (mesmo externo).
    if (!isInvite && !normalizedEmail.endsWith('@layerup.com.br')) {
      setError('Por enquanto o cadastro livre está liberado apenas para e-mails @layerup.com.br.')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            name, // Importante: Passamos o nome para a trigger salvar no banco
          },
        },
      })

      if (error) throw error

      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(translateAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-border">
      <CardHeader className="space-y-2 pb-2 text-center">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-rosa uppercase dark:text-amarelo">
          {isInvite ? "Convite" : "Cadastro"}
        </p>
        <h2 className="font-mona text-4xl">Criar acesso</h2>
        <CardDescription className="text-xs leading-relaxed text-foreground/65">
          {isInvite 
            ? 'Complete seu cadastro para acessar os projetos.'
            : 'Use seu e-mail corporativo da Layer Up para criar seu usuário.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {error && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="mt-[2px] h-4 w-4" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-medium">
              Nome completo
            </Label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-muted-foreground">
                <User className="h-4 w-4" />
              </span>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="pl-9 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium">
              E-mail corporativo
            </Label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-muted-foreground">
                <Mail className="h-4 w-4" />
              </span>
              <Input
                id="email"
                type="email"
                placeholder="seuemail@layerup.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isInvite} // Bloqueia edição se for convite
                className={`pl-9 text-sm ${isInvite ? 'bg-muted text-muted-foreground opacity-70 cursor-not-allowed' : ''}`}
              />
            </div>
            {isInvite && (
                <p className="text-[10px] text-muted-foreground ml-1">
                  *E-mail vinculado ao seu convite.
                </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-medium">
              Senha
            </Label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-muted-foreground">
                <Lock className="h-4 w-4" />
              </span>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-9 text-sm"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="font-montserrat group mt-2 flex w-full items-center justify-center gap-2 bg-[#7900E5] text-xs font-semibold uppercase tracking-[0.18em] text-white hover:bg-[#ff28c6]"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Criar conta
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-foreground/10" />
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            já possui acesso?
          </span>
          <div className="h-px flex-1 bg-foreground/10" />
        </div>

        <Link href="/login" className="block">
          <Button
            type="button"
            variant="outline"
            className="flex w-full items-center justify-center gap-2 text-xs font-medium"
            disabled={loading}
          >
            Ir para o login
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

// Componente Principal
export default function SignUpPage() {
  return (
    <AuthShell subtitle="Cadastro restrito a e-mails @layerup.com.br.">
      <Suspense fallback={
        <div className="lu-card flex h-[400px] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-roxo" />
        </div>
      }>
        <SignUpForm />
      </Suspense>
    </AuthShell>
  )
}