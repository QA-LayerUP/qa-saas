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
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-[#7900E5]/10 p-2.5">
                        <Users className="h-6 w-6 text-[#7900E5]" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="h-1 w-6 rounded-full bg-linear-to-r from-[#7900E5] to-[#7900E5]" />
                            <p className="font-montserrat text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7900E5] dark:text-white">
                                {'// Gerenciamento de Times'}
                            </p>
                        </div>
                        <h1 className="font-montserrat text-3xl font-bold tracking-tight">Times Globais</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Squads globais disponíveis para sua organização.</p>
                    </div>
                </div>
                {/* Modal atualizado (sem props) */}
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
                                {/* Informação de Projetos Ativos */}
                                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2.5 text-xs text-muted-foreground">
                                    <Link2 className="h-3.5 w-3.5" />
                                    <span>
                                        Atuando em <strong className="text-foreground">{team.active_projects?.[0]?.count || 0}</strong> projetos
                                    </span>
                                </div>

                                {/* Botão de Gerenciar */}
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
        </div>
    )
}