'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CreateTeamGlobalModal } from '@/components/teams/CreateTeamGlobalModal'
import { ManageTeamMembersModal } from '@/components/teams/ManageTeamMembersModal'
import { UsersList, UnifiedUser } from '@/components/teams/UsersList'
import { InviteUserModal } from '@/components/users/InviteUserModal'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, Link2, LayoutGrid, UserCheck, Trash2 } from 'lucide-react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function TeamsPage() {
    const [teams, setTeams] = useState<any[]>([])
    const [userList, setUserList] = useState<UnifiedUser[]>([])
    const [loading, setLoading] = useState(true)
    const [teamToDelete, setTeamToDelete] = useState<any | null>(null)
    const [deleting, setDeleting] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        console.log('TeamsPage mounted')
        fetchData()
    }, [])

    async function fetchData() {
        setLoading(true)
        try {
            const { data: teamsData } = await supabase
                .from('teams')
                .select(`
                    *,
                    members:team_members(count),
                    active_projects:project_teams(count)
                `)
                .order('name', { ascending: true })

            const { data: rawUsers } = await supabase
                .from('users')
                .select('*')
                .order('name', { ascending: true })

            const { data: rawInvites } = await supabase
                .from('user_invites')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: false })

            const unified: UnifiedUser[] = [
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

            setTeams(teamsData || [])
            setUserList(unified)
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleDeleteTeam() {
        console.log('=== DELETE TEAM CALLED ===')
        console.log('Team to delete:', teamToDelete)

        if (!teamToDelete) {
            console.log('No team selected, aborting')
            return
        }

        setDeleting(true)
        try {
            console.log('Calling supabase delete for team ID:', teamToDelete.id)
            const { error } = await supabase
                .from('teams')
                .delete()
                .eq('id', teamToDelete.id)

            if (error) {
                console.error('Supabase delete error:', error)
                throw error
            }

            console.log('Delete successful, updating UI')
            setTeams(prev => prev.filter(t => t.id !== teamToDelete.id))
            setTeamToDelete(null)
        } catch (error) {
            console.error('Error deleting team:', error)
            alert('Erro ao excluir time. Verifique se não há vínculos ativos.')
        } finally {
            setDeleting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <p className="text-muted-foreground">Carregando...</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <p className="mb-2 text-[11px] font-semibold tracking-[0.22em] text-rosa uppercase dark:text-amarelo">
                    Gestão corporativa
                </p>
                <h1 className="font-mona font-semibold text-2xl uppercase text-foreground">Organização</h1>
                <p className="mt-2 max-w-2xl text-sm text-foreground/65">Gerencie squads, permissões e membros da plataforma.</p>
            </div>

            <Tabs defaultValue="teams" className="w-full space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                    <TabsList className="h-10 bg-transparent p-0">
                        <TabsTrigger value="teams" className="gap-2 px-4">
                            <LayoutGrid className="h-3.5 w-3.5" />
                            Times Globais
                        </TabsTrigger>
                        <TabsTrigger value="users" className="gap-2 px-4">
                            <Users className="h-3.5 w-3.5" />
                            Membros ({userList.length})
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="teams" className="space-y-6 outline-none animate-in fade-in-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold font-montserrat flex items-center gap-2">
                                <Users className="h-5 w-5 text-roxo" />
                                Squads Ativos
                            </h2>
                            <p className="text-sm text-muted-foreground">Times que podem ser vinculados a projetos.</p>
                        </div>
                        <CreateTeamGlobalModal />
                    </div>

                    {(!teams || teams.length === 0) ? (
                        <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-foreground/5">
                            <div className="mb-4 rounded-full bg-muted/50 p-4">
                                <Users className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <p className="mb-4 text-sm text-muted-foreground">Nenhum time criado ainda.</p>
                            <CreateTeamGlobalModal />
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {teams.map((team) => (
                                <Card key={team.id} className="flex flex-col transition-all hover:border-roxo/40">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="font-montserrat text-base font-bold">{team.name}</CardTitle>
                                                <CardDescription className="mt-1 line-clamp-1 text-xs">
                                                    {team.description || 'Sem descrição'}
                                                </CardDescription>
                                            </div>
                                            <Badge variant="outline" className="flex gap-1 border-roxo/30 bg-roxo/10 text-roxo dark:text-[#c9a0ff]">
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

                                        <div className="flex gap-2">
                                            <ManageTeamMembersModal
                                                team={team}
                                                triggerButton={
                                                    <Button variant="outline" className="h-9 flex-1 text-xs hover:border-[#7900E5]/30 hover:bg-[#7900E5]/5 hover:text-[#7900E5]">
                                                        <Users className="mr-2 h-3.5 w-3.5" />
                                                        Gerenciar
                                                    </Button>
                                                }
                                            />
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="h-9"
                                                onClick={() => {
                                                    console.log('=== DELETE BUTTON CLICKED ===')
                                                    console.log('Team:', team)
                                                    setTeamToDelete(team)
                                                }}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="users" className="space-y-6 outline-none animate-in fade-in-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold font-montserrat flex items-center gap-2">
                                <UserCheck className="h-5 w-5 text-blue-600" />
                                Base de Usuários
                            </h2>
                            <p className="text-sm text-muted-foreground">Lista unificada de acessos e convites pendentes.</p>
                        </div>
                        <InviteUserModal />
                    </div>

                    <UsersList data={userList} />
                </TabsContent>
            </Tabs>

            <AlertDialog open={!!teamToDelete} onOpenChange={(open) => {
                console.log('=== MODAL OPEN CHANGE ===', open)
                if (!open) setTeamToDelete(null)
            }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente o time
                            <span className="font-bold"> {teamToDelete?.name}</span> e removerá todas as associações.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                console.log('=== CONFIRM BUTTON CLICKED ===')
                                e.preventDefault()
                                handleDeleteTeam()
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deleting}
                        >
                            {deleting ? 'Removendo...' : 'Sim, remover'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}