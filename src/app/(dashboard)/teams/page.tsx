import { createClient } from '@/lib/supabase/server'
import { CreateTeamGlobalModal } from '@/components/teams/CreateTeamGlobalModal'
import { ManageTeamMembersModal } from '@/components/teams/ManageTeamMembersModal'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Link2 } from 'lucide-react'

export default async function TeamsPage() {
    const supabase = await createClient()

    // Buscamos os times, quantos membros têm e em quantos projetos estão vinculados
    const { data: teams } = await supabase
        .from('teams')
        .select(`
            *,
            members:team_members(count),
            active_projects:project_teams(count)
        `)
        .order('name', { ascending: true })

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Times</h1>
                    <p className="text-muted-foreground">Squads globais disponíveis para sua organização.</p>
                </div>
                {/* Modal atualizado (sem props) */}
                <CreateTeamGlobalModal />
            </div>

            {(!teams || teams.length === 0) ? (
                <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-muted/10 border-dashed">
                    <p className="text-muted-foreground mb-4">Nenhum time criado ainda.</p>
                    <CreateTeamGlobalModal />
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {teams.map((team) => (
                        <Card key={team.id} className="flex flex-col">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-base font-bold">{team.name}</CardTitle>
                                        <CardDescription className="text-xs mt-1 line-clamp-1">
                                            {team.description || 'Sem descrição'}
                                        </CardDescription>
                                    </div>
                                    <Badge variant="outline" className="flex gap-1 bg-slate-50">
                                        <Users className="h-3 w-3 text-muted-foreground" />
                                        {team.members?.[0]?.count || 0}
                                    </Badge>
                                </div>
                            </CardHeader>
                            
                            <CardContent className="mt-auto space-y-3">
                                {/* Informação de Projetos Ativos */}
                                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                                    <Link2 className="h-3.5 w-3.5" />
                                    <span>
                                        Atuando em <strong>{team.active_projects?.[0]?.count || 0}</strong> projetos
                                    </span>
                                </div>

                                {/* Botão de Gerenciar */}
                                <ManageTeamMembersModal 
                                    team={team}
                                    triggerButton={
                                        <Button variant="secondary" className="w-full text-xs h-9">
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
        </div>
    )
}