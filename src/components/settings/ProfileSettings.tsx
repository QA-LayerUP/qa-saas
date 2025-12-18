/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User, Lock, Users, Loader2, Save, ShieldCheck, Mail } from 'lucide-react'

interface ProfileSettingsProps {
    user: any
    teams: any[]
}

export function ProfileSettings({ user, teams }: ProfileSettingsProps) {
    const supabase = createClient()
    
    // Estados do Perfil
    const [name, setName] = useState(user?.name || '')
    const [loadingProfile, setLoadingProfile] = useState(false)
    const [msgProfile, setMsgProfile] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    // Estados da Senha
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loadingPass, setLoadingPass] = useState(false)
    const [msgPass, setMsgPass] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    // --- ATUALIZAR PERFIL ---
    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoadingProfile(true)
        setMsgProfile(null)

        try {
            const { error } = await supabase
                .from('users')
                .update({ name })
                .eq('id', user.id)

            if (error) throw error

            setMsgProfile({ type: 'success', text: 'Perfil atualizado com sucesso!' })
            // Atualiza o user metadata do Auth também para manter consistência
            await supabase.auth.updateUser({ data: { name } })
            
        } catch (error) {
            console.error(error)
            setMsgProfile({ type: 'error', text: 'Erro ao atualizar perfil.' })
        } finally {
            setLoadingProfile(false)
        }
    }

    // --- ATUALIZAR SENHA ---
    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            setMsgPass({ type: 'error', text: 'As senhas não coincidem.' })
            return
        }
        if (newPassword.length < 6) {
            setMsgPass({ type: 'error', text: 'A senha deve ter no mínimo 6 caracteres.' })
            return
        }

        setLoadingPass(true)
        setMsgPass(null)

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            })

            if (error) throw error

            setMsgPass({ type: 'success', text: 'Senha alterada com sucesso!' })
            setNewPassword('')
            setConfirmPassword('')
        } catch (error: any) {
            console.error(error)
            setMsgPass({ type: 'error', text: error.message || 'Erro ao alterar senha.' })
        } finally {
            setLoadingPass(false)
        }
    }

    return (
        <div className="space-y-8">
            
            {/* SEÇÃO 1: DADOS DO PERFIL */}
            <Card className="rounded-xl border-border">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-[#7900E5]/10 p-2">
                            <User className="h-5 w-5 text-[#7900E5]" />
                        </div>
                        <div>
                            <CardTitle className="font-montserrat text-lg font-bold">Informações Pessoais</CardTitle>
                            <CardDescription className="text-xs">Atualize seus dados de identificação.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <form onSubmit={handleUpdateProfile}>
                    <CardContent className="space-y-4 mb-5">
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Avatar (Visual apenas) */}
                            <div className="flex flex-col items-center gap-2">
                                <Avatar className="h-20 w-20 border-2 border-[#7900E5]/30">
                                    <AvatarFallback className="bg-linear-to-br from-[#7900E5] to-[#7900E5] text-2xl font-bold text-white">
                                        {name?.[0]?.toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground">Avatar gerado</span>
                            </div>

                            {/* Inputs */}
                            <div className="flex-1 space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">E-mail</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input 
                                            id="email" 
                                            value={user.email} 
                                            disabled 
                                            className="pl-9 bg-muted/50" 
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">O e-mail não pode ser alterado.</p>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nome Completo</Label>
                                    <Input 
                                        id="name" 
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)} 
                                        placeholder="Seu nome"
                                    />
                                </div>
                            </div>
                        </div>

                        {msgProfile && (
                            <div className={`rounded-lg border p-3 text-sm ${msgProfile.type === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                                {msgProfile.text}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="border-t bg-muted/30 px-6 py-3">
                        <Button 
                            type="submit" 
                            disabled={loadingProfile} 
                            size="sm"
                            className="bg-[#7900E5] font-montserrat text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#ff28c6]"
                        >
                            {loadingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Salvar Perfil
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            {/* SEÇÃO 2: MEUS TIMES */}
            <Card className="rounded-xl border-border">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-[#ffcc00]/10 p-2">
                            <Users className="h-5 w-5 text-[#ffcc00]" />
                        </div>
                        <div>
                            <CardTitle className="font-montserrat text-lg font-bold">Meus Times</CardTitle>
                            <CardDescription className="text-xs">Squads globais que você faz parte.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {teams.length === 0 ? (
                        <div className="rounded-xl border-2 border-dashed border-border bg-muted/10 py-8 text-center text-sm text-muted-foreground">
                            Você ainda não faz parte de nenhum time.
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {teams.map((tm: any) => (
                                <div key={tm.id} className="flex items-start justify-between rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:border-[#ffcc00]/30 hover:shadow-md">
                                    <div className="space-y-1">
                                        <h4 className="font-montserrat text-sm font-semibold">{tm.team?.name}</h4>
                                        <p className="line-clamp-1 text-xs text-muted-foreground">
                                            {tm.team?.description || 'Squad Operacional'}
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="border-[#ffcc00]/30 bg-[#ffcc00]/10 text-[10px] uppercase text-[#ffcc00]">
                                        {tm.role || 'Membro'}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* SEÇÃO 3: SEGURANÇA */}
            <Card className="rounded-xl border-border">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-[#ff0000]/10 p-2">
                            <Lock className="h-5 w-5 text-[#ff0000]" />
                        </div>
                        <div>
                            <CardTitle className="font-montserrat text-lg font-bold">Segurança</CardTitle>
                            <CardDescription className="text-xs">Alterar sua senha de acesso.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <form onSubmit={handleUpdatePassword}>
                    <CardContent className="space-y-4 mb-5 max-w-md">
                        <div className="grid gap-2">
                            <Label htmlFor="newPass">Nova Senha</Label>
                            <Input 
                                id="newPass" 
                                type="password" 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirmPass">Confirmar Nova Senha</Label>
                            <Input 
                                id="confirmPass" 
                                type="password" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>

                        {msgPass && (
                            <div className={`rounded-lg border p-3 text-sm ${msgPass.type === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                                {msgPass.text}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="border-t bg-muted/30 px-6 py-3">
                        <Button 
                            type="submit" 
                            variant="outline" 
                            disabled={loadingPass || !newPassword} 
                            size="sm"
                            className="hover:border-[#ff0000]/30 hover:bg-[#ff0000]/5 hover:text-[#ff0000]"
                        >
                            {loadingPass ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                            Atualizar Senha
                        </Button>
                    </CardFooter>
                </form>
            </Card>

        </div>
    )
}