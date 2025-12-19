/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { translateAuthError } from '@/lib/auth-errors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { AlertCircle, Loader2, Mail, ArrowRight, Chrome, Lock } from 'lucide-react'

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
    } catch (err: any) {
      setError(translateAuthError(err))
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
    } catch (err: any) {
      setError(translateAuthError(err))
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar simples com logo e faixa de cores da Layer Up */}
      <header className="border-b border-border bg-background/95 dark:bg-[#050509]">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/LOGO-LAYER.png"
              alt="Layer Up"
              width={140}
              height={40}
              className="h-8 w-auto object-contain dark:hidden"
              priority
            />
            <Image
              src="/LOGO-LAYER-DARK.png"
              alt="Layer Up"
              width={140}
              height={40}
              className="hidden h-8 w-auto object-contain dark:block"
              priority
            />
          </Link>
          <ThemeToggle />
        </div>
        <div className="h-1 w-full bg-linear-to-r from-[#7900E5] via-[#7900E5] to-[#ffcc00]" />
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-4rem-4px)] max-w-lg items-center justify-center px-4 py-10 md:py-16">
        <section className="w-full">
          <Card className="border border-border bg-card shadow-[0_18px_40px_rgba(15,23,42,0.3)] dark:bg-black/70 backdrop-blur-xl">
            <CardHeader className="space-y-2 pb-2 text-center">
              <p className="font-montserrat text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7900E5] dark:text-white">
                {'// Login interno'}
              </p>
              <h2 className="font-montserrat text-lg font-semibold">QA Hub · Layer Up</h2>
              <CardDescription className="text-xs leading-relaxed text-muted-foreground">
                Acesse com seu e-mail corporativo para gerenciar as QA dos projetos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {error && (
                <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertCircle className="mt-[2px] h-4 w-4" />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-medium">
                    E-mail
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
                      className="pl-9 text-sm"
                    />
                  </div>
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
                      Entrar
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </Button>
              </form>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  ou
                </span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <Link href="/signup" className="block">
                <Button
                  type="button"
                  variant="outline"
                  className="flex w-full items-center justify-center gap-2 text-xs font-medium"
                  disabled={loading}
                >
                  Criar conta
                </Button>
              </Link>

              <div className="pt-2 text-center text-xs text-muted-foreground">
                Precisa de acesso ou teve problemas? Fale com o time de Devs (Ale Dev).
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}