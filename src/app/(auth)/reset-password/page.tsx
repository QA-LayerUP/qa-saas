'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { translateAuthError, type AuthError } from '@/lib/auth-errors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { AuthShell } from '@/components/layout/AuthShell'
import { AlertCircle, Loader2, Lock, ArrowRight } from 'lucide-react'

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.')
            return
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) throw error

            setSuccess(true)

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                router.push('/dashboard')
                router.refresh()
            }, 2000)
        } catch (err: unknown) {
            setError(translateAuthError(err as AuthError))
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthShell subtitle="Defina uma nova senha para continuar.">
                    <Card className="border-border">
                        <CardHeader className="space-y-2 pb-2 text-center">
                            <p className="text-[11px] font-semibold tracking-[0.2em] text-rosa uppercase dark:text-amarelo">
                                Nova senha
                            </p>
                            <h2 className="font-mona text-4xl">Atualizar acesso</h2>
                            <CardDescription className="text-xs leading-relaxed text-foreground/65">
                                Digite a nova senha para entrar no QA Hub.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {error && (
                                <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                                    <AlertCircle className="mt-[2px] h-4 w-4 shrink-0" />
                                    <p>{error}</p>
                                </div>
                            )}

                            {success ? (
                                <div className="flex flex-col items-center justify-center space-y-4 rounded-md border border-green-500/40 bg-green-500/10 p-6 text-center">
                                    <div className="space-y-2">
                                        <p className="font-medium text-green-500">Senha atualizada com sucesso!</p>
                                        <p className="text-xs text-muted-foreground">
                                            Redirecionando para o dashboard...
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleUpdatePassword} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="password" className="text-xs font-medium">
                                            Nova Senha
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
                                                minLength={6}
                                                className="pl-9 text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="confirmPassword" className="text-xs font-medium">
                                            Confirmar Nova Senha
                                        </Label>
                                        <div className="relative">
                                            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-muted-foreground">
                                                <Lock className="h-4 w-4" />
                                            </span>
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                                minLength={6}
                                                className="pl-9 text-sm"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="font-montserrat group mt-2 flex w-full items-center justify-center gap-2 bg-[#7900E5] text-xs font-semibold uppercase tracking-[0.18em] text-white hover:bg-[#ff28c6]"
                                        disabled={loading || !password || !confirmPassword}
                                    >
                                        {loading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                Atualizar senha
                                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>
        </AuthShell>
    )
}
