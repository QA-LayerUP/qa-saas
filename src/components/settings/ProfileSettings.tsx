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
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        <CardTitle>Informações Pessoais</CardTitle>
                    </div>
                    <CardDescription>Atualize seus dados de identificação.</CardDescription>
                </CardHeader>
                <form onSubmit={handleUpdateProfile}>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Avatar (Visual apenas) */}
                            <div className="flex flex-col items-center gap-2">
                                <Avatar className="h-20 w-20 border-2 border-muted">
                                    <AvatarFallback className="text-2xl font-bold bg-slate-100 text-slate-600">
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
                            <div className={`text-sm p-2 rounded ${msgProfile.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {msgProfile.text}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="border-t bg-slate-50/50 px-6 py-3">
                        <Button type="submit" disabled={loadingProfile} size="sm">
                            {loadingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Salvar Perfil
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            {/* SEÇÃO 2: MEUS TIMES */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        <CardTitle>Meus Times</CardTitle>
                    </div>
                    <CardDescription>Squads globais que você faz parte.</CardDescription>
                </CardHeader>
                <CardContent>
                    {teams.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
                            Você ainda não faz parte de nenhum time.
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {teams.map((tm: any) => (
                                <div key={tm.id} className="flex items-start justify-between p-4 border rounded-lg bg-white shadow-sm hover:border-primary/30 transition-colors">
                                    <div className="space-y-1">
                                        <h4 className="font-semibold text-sm">{tm.team?.name}</h4>
                                        <p className="text-xs text-muted-foreground line-clamp-1">
                                            {tm.team?.description || 'Squad Operacional'}
                                        </p>
                                    </div>
                                    <Badge variant="secondary" className="text-[10px] uppercase">
                                        {tm.role || 'Membro'}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* SEÇÃO 3: SEGURANÇA */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-primary" />
                        <CardTitle>Segurança</CardTitle>
                    </div>
                    <CardDescription>Alterar sua senha de acesso.</CardDescription>
                </CardHeader>
                <form onSubmit={handleUpdatePassword}>
                    <CardContent className="space-y-4 max-w-md">
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
                            <div className={`text-sm p-2 rounded ${msgPass.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {msgPass.text}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="border-t bg-slate-50/50 px-6 py-3">
                        <Button type="submit" variant="outline" disabled={loadingPass || !newPassword} size="sm">
                            {loadingPass ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                            Atualizar Senha
                        </Button>
                    </CardFooter>
                </form>
            </Card>

        </div>
    )
}