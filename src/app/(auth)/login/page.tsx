/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { translateAuthError, type AuthError } from '@/lib/auth-errors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthShell } from '@/components/layout/AuthShell'
import { AlertCircle, Loader2, Mail, ArrowRight, Lock } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push('/dashboard')
      router.refresh()
    } catch (err: unknown) {
      setError(translateAuthError(err as AuthError))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (err: unknown) {
      setError(translateAuthError(err as AuthError))
      setLoading(false)
    }
  }

  return (
    <AuthShell subtitle="Acesse com seu e-mail corporativo para gerenciar as QA dos projetos.">
      <form onSubmit={handleLogin} className="lu-card p-6">
        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-rosa/40 bg-rosa/10 p-3 text-xs text-rosa">
            <AlertCircle className="mt-[2px] h-4 w-4" />
            <p>{error}</p>
          </div>
        )}

        <label className="mb-4 block text-[11px] font-semibold tracking-[0.16em] text-foreground/65 uppercase">
          E-mail
          <div className="relative mt-2">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-foreground/65">
              <Mail className="h-4 w-4" />
            </span>
            <Input
              id="email"
              type="email"
              placeholder="seuemail@layerup.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-9 font-medium tracking-normal normal-case"
            />
          </div>
        </label>

        <label className="mb-4 block text-[11px] font-semibold tracking-[0.16em] text-foreground/65 uppercase">
          <span className="flex items-center justify-between">
            Senha
            <Link
              href="/forgot-password"
              className="text-[10px] font-medium tracking-normal text-roxo normal-case hover:underline dark:text-amarelo"
              tabIndex={-1}
            >
              Esqueceu a senha?
            </Link>
          </span>
          <div className="relative mt-2">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-foreground/65">
              <Lock className="h-4 w-4" />
            </span>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-9 font-medium tracking-normal normal-case"
            />
          </div>
        </label>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Entrar
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>

        <p className="mt-4 text-center text-sm text-foreground/65">
          Ainda não tem conta?{" "}
          <Link href="/signup" className="text-roxo hover:underline dark:text-amarelo">
            Criar acesso
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}