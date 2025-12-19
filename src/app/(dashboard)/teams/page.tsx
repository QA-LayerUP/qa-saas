import { createClient } from '@/lib/supabase/server'
import { CreateTeamGlobalModal } from '@/components/teams/CreateTeamGlobalModal'
import { ManageTeamMembersModal } from '@/components/teams/ManageTeamMembersModal'
// Import atualizado para pegar o tipo UnifiedUser
import { UsersList, UnifiedUser } from '@/components/teams/UsersList'
import { InviteUserModal } from '@/components/users/InviteUserModal'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, Link2, LayoutGrid, UserCheck } from 'lucide-react'

export default async function TeamsPage() {
    const supabase = await createClient()

    // 1. Buscamos os times
    const { data: teams } = await supabase
        .from('teams')
        .select(`
            *,
            members:team_members(count),
            active_projects:project_teams(count)
        `)
        .order('name', { ascending: true })

    // 2. Buscamos os usuários REAIS (Ativos/Inativos)
    const { data: rawUsers } = await supabase
        .from('users')
        .select('*')
        .order('name', { ascending: true })

    // 3. Buscamos os convites PENDENTES
    const { data: rawInvites } = await supabase
        .from('user_invites')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

    // 4. Unificamos as duas listas para passar para o componente
    const userList: UnifiedUser[] = [
        // Mapeia usuários já cadastrados
        ...(rawUsers || []).map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            status: u.status as 'active' | 'inactive',
            created_at: u.created_at,
            avatar_url: u.avatar_url,
            type: 'user' as const
        })),
        // Mapeia convites pendentes
        ...(rawInvites || []).map(i => ({
            id: i.id,
            name: null,
            email: i.email,
            role: i.role,
            status: 'pending' as const,
            created_at: i.created_at,
            avatar_url: null,
            type: 'invite' as const
        }))
    ]

    return (
        <div className="flex flex-col gap-6 p-6">
            
            {/* CABEÇALHO GERAL DA PÁGINA */}
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-1 w-6 rounded-full bg-linear-to-r from-[#7900E5] to-[#7900E5]" />
                    <p className="font-montserrat text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7900E5]">
                        {'// Gestão Corporativa'}
                    </p>
                </div>
                <h1 className="font-montserrat text-3xl font-bold tracking-tight">Organização</h1>
                <p className="mt-1 text-sm text-muted-foreground">Gerencie seus squads, permissões e membros da plataforma.</p>
            </div>

            {/* SISTEMA DE ABAS */}
            <Tabs defaultValue="teams" className="w-full space-y-6">
                
                <div className="flex items-center justify-between border-b pb-4">
                    <TabsList className="h-10 bg-muted/50 p-1">
                        <TabsTrigger value="teams" className="gap-2 px-4 text-xs font-semibold uppercase tracking-wide data-[state=active]:bg-white data-[state=active]:text-[#7900E5] data-[state=active]:shadow-sm">
                            <LayoutGrid className="h-3.5 w-3.5" />
                            Times Globais
                        </TabsTrigger>
                        <TabsTrigger value="users" className="gap-2 px-4 text-xs font-semibold uppercase tracking-wide data-[state=active]:bg-white data-[state=active]:text-[#7900E5] data-[state=active]:shadow-sm">
                            <Users className="h-3.5 w-3.5" />
                            Membros ({userList.length})
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* --- ABA 1: TIMES --- */}
                <TabsContent value="teams" className="space-y-6 outline-none animate-in fade-in-50">
                    
                    {/* Header Específico da Aba Times com o Botão de Criar */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold font-montserrat flex items-center gap-2">
                                <Users className="h-5 w-5 text-[#7900E5]" />
                                Squads Ativos
                            </h2>
                            <p className="text-sm text-muted-foreground">Times que podem ser vinculados a projetos.</p>
                        </div>
                        <CreateTeamGlobalModal />
                    </div>

                    {(!teams || teams.length === 0) ? (
                        <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/10">
                            <div className="mb-4 rounded-full bg-muted/50 p-4">
                                <Users className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <p className="mb-4 text-sm text-muted-foreground">Nenhum time criado ainda.</p>
                            <CreateTeamGlobalModal />
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {teams.map((team) => (
                                <Card key={team.id} className="flex flex-col rounded-xl border-border transition-all hover:border-[#7900E5]/30 hover:shadow-lg hover:shadow-[#7900E5]/5">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="font-montserrat text-base font-bold">{team.name}</CardTitle>
                                                <CardDescription className="mt-1 line-clamp-1 text-xs">
                                                    {team.description || 'Sem descrição'}
                                                </CardDescription>
                                            </div>
                                            <Badge variant="outline" className="flex gap-1 border-[#7900E5]/30 bg-[#7900E5]/10 text-[#7900E5]">
                                                <Users className="h-3 w-3" />
                                                {team.members?.[0]?.count || 0}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    
                                    <CardContent className="mt-auto space-y-3">
                                        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2.5 text-xs text-muted-foreground">
                                            <Link2 className="h-3.5 w-3.5" />
                                            <span>
                                                Atuando em <strong className="text-foreground">{team.active_projects?.[0]?.count || 0}</strong> projetos
                                            </span>
                                        </div>

                                        <ManageTeamMembersModal 
                                            team={team}
                                            triggerButton={
                                                <Button variant="outline" className="h-9 w-full text-xs hover:border-[#7900E5]/30 hover:bg-[#7900E5]/5 hover:text-[#7900E5]">
                                                    <Users className="mr-2 h-3.5 w-3.5" />
                                                    Gerenciar Membros
                                                </Button>
                                            }
                                        />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* --- ABA 2: USUÁRIOS --- */}
                <TabsContent value="users" className="space-y-6 outline-none animate-in fade-in-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold font-montserrat flex items-center gap-2">
                                <UserCheck className="h-5 w-5 text-blue-600" />
                                Base de Usuários
                            </h2>
                            <p className="text-sm text-muted-foreground">Lista unificada de acessos e convites pendentes.</p>
                        </div>
                        {/* Botão de convidar usuários */}
                        <InviteUserModal />
                    </div>

                    {/* Passamos a lista UNIFICADA (Users + Invites) */}
                    <UsersList data={userList} />
                </TabsContent>

            </Tabs>
        </div>
    )
}