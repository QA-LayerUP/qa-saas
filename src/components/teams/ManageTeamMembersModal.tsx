/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
// Adicionei AlertTriangle e XCircle para feedback visual
import { Users, Loader2, Search, Mail, X, AlertTriangle, XCircle, CheckCircle2, Trash2 } from 'lucide-react'
import { Team, TeamMember } from '@/lib/types'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ManageTeamMembersModalProps {
    team: Team
    open?: boolean
    onOpenChange?: (open: boolean) => void
    triggerButton?: React.ReactNode
}

interface SearchResult {
    id: string
    name: string | null
    email: string
}

interface Invitation {
    id: string
    email: string
    status: string
    created_at: string
}

export function ManageTeamMembersModal({ 
    team, 
    triggerButton 
}: ManageTeamMembersModalProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    
    // Listas
    const [members, setMembers] = useState<TeamMember[]>([])
    const [invitations, setInvitations] = useState<Invitation[]>([])

    // Estados de Busca e Feedback
    const [searchTerm, setSearchTerm] = useState('')
    const [searchResults, setSearchResults] = useState<SearchResult[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [searchFocused, setSearchFocused] = useState(false)
    
    // --- NOVO: Estados de Feedback Visual ---
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)

    const supabase = createClient()

    // Limpa mensagens ao reabrir ou digitar
    useEffect(() => {
        if (!open) {
            setErrorMsg(null)
            setSuccessMsg(null)
            setSearchTerm('')
        }
    }, [open])

    useEffect(() => {
        if (searchTerm) {
            setErrorMsg(null)
            setSuccessMsg(null)
        }
    }, [searchTerm])

    const fetchMembers = useCallback(async () => {
        setLoading(true)
        const { data: membersData } = await supabase
            .from('team_members')
            .select(`*, user:users (id, name, email)`)
            .eq('team_id', team.id)
        
        if (membersData) setMembers(membersData as any[])

        const { data: invitesData } = await supabase
            .from('team_invitations')
            .select('*')
            .eq('team_id', team.id)
        
        if (invitesData) setInvitations(invitesData as any[])
        
        setLoading(false)
    }, [supabase, team.id])

    useEffect(() => {
        if (open) {
            fetchMembers()
        }
    }, [open, fetchMembers])

    // Busca de Autocomplete
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.length < 2) {
                setSearchResults([])
                return
            }
            
            setIsSearching(true)
            const { data } = await supabase
                .from('users')
                .select('id, name, email')
                .ilike('email', `%${searchTerm}%`)
                .limit(5)
            
            const existingIds = new Set(members.map(m => m.user_id))
            const filtered = (data || []).filter((u: any) => !existingIds.has(u.id))

            setSearchResults(filtered as any[])
            setIsSearching(false)
        }, 300)

        return () => clearTimeout(delayDebounceFn)
    }, [searchTerm, members, supabase])

    const addExistingUser = async (user: SearchResult) => {
        setLoading(true)
        setErrorMsg(null)
        setSuccessMsg(null)

        try {
            const { error } = await supabase
                .from('team_members')
                .insert({
                    team_id: team.id,
                    user_id: user.id,
                    role: 'member'
                })

            if (error) {
                // Tratamento elegante do erro
                if (error.message.includes('Este usuário já faz parte do time')) {
                    // Extrai o nome do time da mensagem de erro se possível, ou usa mensagem genérica
                    // A trigger retorna: 'Este usuário já faz parte do time "NOME" neste projeto.'
                    const match = error.message.match(/time "(.+?)"/)
                    const otherTeamName = match ? match[1] : 'outro time'
                    setErrorMsg(`Este usuário já está no time "${otherTeamName}".`)
                } else if (error.code === '23505') {
                    setErrorMsg('Este usuário já está neste time.')
                } else {
                    setErrorMsg('Não foi possível adicionar o usuário.')
                }
                return 
            }
            
            // Sucesso
            setSuccessMsg(`${user.name || user.email} adicionado com sucesso!`)
            setSearchTerm('')
            setSearchResults([])
            fetchMembers()
            
            // Remove mensagem de sucesso após 3s
            setTimeout(() => setSuccessMsg(null), 3000)

        } catch (err: any) {
            console.error(err)
            setErrorMsg('Erro inesperado ao adicionar usuário.')
        } finally {
            setLoading(false)
        }
    }

    const createInvitation = async () => {
        if (!searchTerm.includes('@')) return
        setLoading(true)
        setErrorMsg(null)

        try {
            const { error } = await supabase
                .from('team_invitations')
                .insert({
                    team_id: team.id,
                    email: searchTerm,
                    status: 'pending'
                })

            if (error) throw error

            setSuccessMsg(`Convite enviado para ${searchTerm}`)
            setSearchTerm('')
            setSearchResults([])
            fetchMembers()
            setTimeout(() => setSuccessMsg(null), 3000)
        } catch (err) {
            console.error(err)
            setErrorMsg('Erro ao criar convite. Verifique se o e-mail já foi convidado.')
        } finally {
            setLoading(false)
        }
    }

    const removeMember = async (id: string) => {
        if (!confirm('Remover este usuário?')) return
        await supabase.from('team_members').delete().eq('id', id)
        fetchMembers()
    }

    const cancelInvite = async (id: string) => {
        await supabase.from('team_invitations').delete().eq('id', id)
        fetchMembers()
    }

    const isValidEmail = searchTerm.includes('@') && searchTerm.includes('.')
    const showInviteOption = isValidEmail && !isSearching && !searchResults.find(u => u.email === searchTerm)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {triggerButton || (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Users className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Membros: {team.name}</DialogTitle>
                    <DialogDescription>Gerencie quem tem acesso a este time.</DialogDescription>
                </DialogHeader>

                {/* ÁREA DE BUSCA */}
                <div className="relative mb-2">
                    <Label className="mb-2 block">Adicionar Membro</Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Buscar por e-mail..." 
                            className={`pl-9 ${errorMsg ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setTimeout(() => setSearchFocused(false), 200)} 
                        />
                        {isSearching && (
                            <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                    </div>

                    {/* --- FEEDBACK VISUAL (ERRO/SUCESSO) --- */}
                    {errorMsg && (
                        <div className="mt-2 p-3 rounded-md border flex items-start gap-2 text-sm animate-in fade-in slide-in-from-top-1
                            bg-destructive/10 border-destructive/30 text-destructive
                            dark:bg-destructive/20 dark:border-destructive/40">
                            <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {successMsg && (
                        <div className="mt-2 p-3 rounded-md border flex items-center gap-2 text-sm animate-in fade-in slide-in-from-top-1
                            bg-green-500/10 border-green-500/30 text-green-700
                            dark:bg-green-500/20 dark:border-green-500/40 dark:text-green-400">
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            <span>{successMsg}</span>
                        </div>
                    )}

                    {/* DROPDOWN DE RESULTADOS */}
                    {searchFocused && (searchTerm.length > 1) && !errorMsg && !successMsg && (
                        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg overflow-hidden max-h-60 overflow-y-auto animate-in zoom-in-95 duration-100">
                            {searchResults.map(user => (
                                <button
                                    key={user.id}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 text-left transition-colors border-b border-border last:border-0 group"
                                    onMouseDown={(e) => {
                                        e.preventDefault()
                                        addExistingUser(user)
                                    }}
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-muted/50 text-muted-foreground">{user.name?.[0] || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{user.name || 'Sem nome'}</p>
                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                    </div>
                                    <div className="ml-auto">
                                        <Badge variant="secondary" className="text-[10px]">Adicionar</Badge>
                                    </div>
                                </button>
                            ))}

                            {showInviteOption && (
                                <button
                                    className="w-full flex items-center gap-3 p-3 hover:bg-accent/10 text-left transition-colors text-accent"
                                    onMouseDown={(e) => {
                                        e.preventDefault()
                                        createInvitation()
                                    }}
                                >
                                    <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30">
                                        <Mail className="h-4 w-4 text-accent" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Convidar via E-mail</p>
                                        <p className="text-xs text-muted-foreground">Enviar convite para {searchTerm}</p>
                                    </div>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="h-px bg-border my-2" />

                {/* LISTAGEM */}
                <Tabs defaultValue="members" className="w-full">
                    <TabsList className="w-full">
                        <TabsTrigger value="members" className="flex-1">Membros ({members.length})</TabsTrigger>
                        <TabsTrigger value="invites" className="flex-1">Convites ({invitations.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="members" className="mt-4 space-y-2 max-h-[250px] overflow-y-auto pr-1">
                        {members.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
                                <Users className="h-8 w-8 mb-2 opacity-20" />
                                <p className="text-sm">Nenhum membro ativo.</p>
                            </div>
                        ) : (
                            members.map(member => (
                                <div key={member.id} className="flex items-center justify-between p-2 border border-border rounded-lg bg-card hover:border-accent/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-muted/50 text-xs font-bold text-muted-foreground border border-border">
                                                {(member as any).user?.name?.[0]?.toUpperCase() || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{(member as any).user?.name || 'Usuário'}</p>
                                            <p className="text-xs text-muted-foreground">{(member as any).user?.email}</p>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => removeMember(member.id)}
                                        title="Remover do time"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="invites" className="mt-4 space-y-2 max-h-[250px] overflow-y-auto pr-1">
                        {invitations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
                                <Mail className="h-8 w-8 mb-2 opacity-20" />
                                <p className="text-sm">Nenhum convite pendente.</p>
                            </div>
                        ) : (
                            invitations.map(invite => (
                                <div key={invite.id} className="flex items-center justify-between p-2 border border-border rounded-lg bg-muted/30">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-[#ffcc00]/20 flex items-center justify-center border border-[#ffcc00]/30 dark:bg-[#ffcc00]/30 dark:border-[#ffcc00]/40">
                                            <Mail className="h-3.5 w-3.5 text-[#ffcc00] dark:text-[#ffd633]" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{invite.email}</p>
                                            <Badge variant="outline" className="text-[10px] h-4 border-[#ffcc00]/30 text-[#ffcc00] bg-[#ffcc00]/10 dark:border-[#ffcc00]/40 dark:text-[#ffd633] dark:bg-[#ffcc00]/20">Pendente</Badge>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => cancelInvite(invite.id)}
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}