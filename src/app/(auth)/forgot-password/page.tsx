'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { translateAuthError, type AuthError } from '@/lib/auth-errors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { AuthShell } from '@/components/layout/AuthShell'
import { AlertCircle, Loader2, Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(false)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${location.origin}/auth/callback?next=/reset-password`,
            })

            if (error) throw error

            setSuccess(true)
        } catch (err: unknown) {
            setError(translateAuthError(err as AuthError))
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthShell subtitle="Digite seu e-mail para receber o link de redefinição.">
                    <Card className="border-border">
                        <CardHeader className="space-y-2 pb-2 text-center">
                            <p className="text-[11px] font-semibold tracking-[0.2em] text-rosa uppercase dark:text-amarelo">
                                Recuperação
                            </p>
                            <h2 className="font-mona text-4xl">Esqueceu a senha?</h2>
                            <CardDescription className="text-xs leading-relaxed text-foreground/65">
                                Enviaremos um link para redefinir o acesso.
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
                                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                                    <div className="space-y-2">
                                        <p className="font-medium text-green-500">Link enviado com sucesso!</p>
                                        <p className="text-xs text-muted-foreground">
                                            Verifique a caixa de entrada do e-mail <span className="font-medium text-foreground">{email}</span>. O link pode demorar alguns minutos para chegar. Não se esqueça de checar a caixa de spam.
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full text-xs font-medium"
                                        onClick={() => router.push('/login')}
                                    >
                                        Voltar para o login
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <form onSubmit={handleResetPassword} className="space-y-4">
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

                                        <Button
                                            type="submit"
                                            className="font-montserrat group mt-2 flex w-full items-center justify-center gap-2 bg-[#7900E5] text-xs font-semibold uppercase tracking-[0.18em] text-white hover:bg-[#ff28c6]"
                                            disabled={loading || !email}
                                        >
                                            {loading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    Enviar link de recuperação
                                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                                </>
                                            )}
                                        </Button>
                                    </form>

                                    <div className="pt-2 text-center">
                                        <Link
                                            href="/login"
                                            className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <ArrowLeft className="mr-1 h-3 w-3" />
                                            Voltar para o login
                                        </Link>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
        </AuthShell>
    )
}
