/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server'
import { CreateCategoryModal } from '@/components/qa/CreateCategoryModal'
import { LinkTeamModal } from '@/components/projects/LinkTeamModal'
import { ManageTeamMembersModal } from '@/components/teams/ManageTeamMembersModal'
import { TaskModeSelector } from '@/components/qa/TaskModeSelector'
import { NewQAItemButton } from '@/components/qa/NewQAItemButton'
import TeamTabContent from '@/components/qa/TeamTabContent'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Settings2, Sparkles } from 'lucide-react'

interface ProjectQAPageProps {
    params: Promise<{ id: string }>
}

export default async function ProjectQAPage({ params }: ProjectQAPageProps) {
    const supabase = await createClient()
    const { id: projectId } = await params

    // 1. Fetch project
    const { data: project } = await supabase.from('projects').select('*').eq('id', projectId).single()

    // 2. FETCH TIMES VINCULADOS (MUDANÇA AQUI)
    // Buscamos na tabela de ligação e trazemos os dados do time
    const { data: projectTeams } = await supabase
        .from('project_teams')
        .select(`
            team_id,
            team:teams (*)
        `)
        .eq('project_id', projectId)

    // Transformar para o formato array de Team que o resto da app espera
    const teams = projectTeams?.map((pt: any) => pt.team) || []
    const existingTeamIds = teams.map(t => t.id)

    // 3. Fetch categories
    // Nota: Categorias agora devem ser filtradas pelos times que estão no projeto
    const { data: categories } = await supabase
        .from('qa_categories')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at')

    // 4. Fetch items
    let items: any[] = []
    const categoryIds = (categories || []).map(c => c.id)
    if (categoryIds.length > 0) {
        const res = await supabase
            .from('qa_items')
            .select('*, qa_evidences(file_url)')
            .in('category_id', categoryIds)
            .order('created_at', { ascending: false })
        items = res.data || []
    }

    // 5. Calcular contagem de itens por time
    const getItemsCountForTeam = (teamId: string) => {
        const teamCategories = (categories || []).filter(c => (c.team_id || 'unassigned') === teamId)
        const teamCategoryIds = new Set(teamCategories.map(c => c.id))
        return items.filter(item => {
            if (item.team_id) return item.team_id === teamId
            return teamCategoryIds.has(item.category_id)
        }).length
    }

    const getOpenItemsCountForTeam = (teamId: string) => {
        const teamCategories = (categories || []).filter(c => (c.team_id || 'unassigned') === teamId)
        const teamCategoryIds = new Set(teamCategories.map(c => c.id))
        return items.filter(item => {
            const matchesTeam = item.team_id ? item.team_id === teamId : teamCategoryIds.has(item.category_id)
            return matchesTeam && item.status === 'aberto'
        }).length
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-[#7900E5]/10 p-2.5">
                        <Settings2 className="h-6 w-6 text-[#7900E5]" />
                    </div>
                <div>
                        <div className="flex items-center gap-2">
                            <div className="h-1 w-6 rounded-full bg-linear-to-r from-[#7900E5] to-[#7900E5]" />
                            <p className="font-montserrat text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7900E5] dark:text-white">
                                {'// Gerenciamento de QA'}
                            </p>
                        </div>
                        <h1 className="font-montserrat text-2xl font-bold tracking-tight">{project?.name}</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Gerencie o QA deste projeto.</p>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-2 items-center">
                    <CreateCategoryModal projectId={projectId} />
                    
                    <LinkTeamModal 
                        projectId={projectId} 
                        existingTeamIds={existingTeamIds} 
                    />
                    
                    {project?.site_url ? (
                        <TaskModeSelector
                            categories={categories || []}
                            teams={teams}
                            projectId={projectId}
                            hasCategories={(categories || []).length > 0}
                        />
                    ) : (
                        (categories || []).length > 0 && <NewQAItemButton categories={categories || []} projectId={projectId} />
                    )}
                </div>
            </div>

            {teams.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/10 py-16">
                    <div className="mb-4 rounded-full bg-muted/50 p-4">
                        <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="mb-4 text-sm text-muted-foreground">Nenhum time vinculado a este projeto.</p>
                    <LinkTeamModal projectId={projectId} existingTeamIds={[]} />
                </div>
            ) : (
                <Tabs defaultValue={teams[0]?.id} className="w-full">
                    <div className="relative">
                        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl border border-border bg-linear-to-br from-card/80 to-card/50 p-1.5 shadow-sm backdrop-blur-sm">
                            {teams.map((team) => {
                                const itemsCount = getItemsCountForTeam(team.id)
                                const openItemsCount = getOpenItemsCountForTeam(team.id)

                                return (
                                    <TabsTrigger 
                                        key={team.id} 
                                        value={team.id} 
                                        className={`
                                            group relative font-montserrat text-xs font-semibold uppercase tracking-wide
                                            h-auto min-w-[120px] px-4 py-2.5 rounded-lg
                                            border border-transparent
                                            bg-transparent
                                            text-foreground
                                            transition-all duration-200
                                            hover:bg-[#7900E5]/10 hover:text-[#7900E5] hover:border-[#7900E5]/20
                                            data-[state=active]:bg-linear-to-r from-[#7900E5] to-[#7900E5]
                                            data-[state=active]:text-white
                                            data-[state=active]:border-transparent
                                            data-[state=active]:shadow-md
                                            data-[state=active]:shadow-[#7900E5]/20
                                            focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none
                                        `}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="relative z-10 font-semibold">{team.name}</span>
                                            {itemsCount > 0 && (
                                                <Badge 
                                                    variant="secondary"
                                                    className={`
                                                        relative z-10 h-5 min-w-[20px] px-1.5
                                                        text-[10px] font-bold
                                                        bg-[#7900E5]/10 text-[#7900E5] border-[#7900E5]/30
                                                        data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:border-white/30
                                                        group-hover:bg-[#7900E5]/20
                                                        dark:bg-[#7900E5]/20 dark:text-[#7900E5] dark:border-[#7900E5]/40
                                                        dark:data-[state=active]:bg-white/20 dark:data-[state=active]:text-white dark:data-[state=active]:border-white/30
                                                    `}
                                                >
                                                    {itemsCount}
                                                </Badge>
                                            )}
                                        </div>
                                        {openItemsCount > 0 && (
                                            <span 
                                                className={`
                                                    absolute -top-1 -right-1 z-20
                                                    h-4 w-4 rounded-full
                                                    bg-red-500 border-2 border-card
                                                    animate-pulse
                                                    ${openItemsCount > 0 ? 'block' : 'hidden'}
                                                `}
                                                title={`${openItemsCount} itens abertos`}
                                            />
                                        )}
                            </TabsTrigger>
                                )
                            })}
                    </TabsList>
                    </div>

                    {teams.map((team, index) => {
                        const itemsCount = getItemsCountForTeam(team.id)
                        const openItemsCount = getOpenItemsCountForTeam(team.id)
                        const colors = [
                            { gradient: 'from-[#7900E5]/10 via-[#7900E5]/5 to-transparent', border: 'border-[#7900E5]/20' },
                            { gradient: 'from-[#7900E5]/10 via-[#7900E5]/5 to-transparent', border: 'border-[#7900E5]/20' },
                            { gradient: 'from-[#ffcc00]/10 via-[#ffcc00]/5 to-transparent', border: 'border-[#ffcc00]/20' },
                            { gradient: 'from-[#ff6b6b]/10 via-[#ff6b6b]/5 to-transparent', border: 'border-[#ff6b6b]/20' },
                        ]
                        const colorTheme = colors[index % colors.length]

                        return (
                            <TabsContent 
                                key={team.id} 
                                value={team.id} 
                                className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300"
                            >
                                <div className={`
                                    group relative overflow-hidden
                                    flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between
                                    rounded-xl border ${colorTheme.border}
                                    bg-linear-to-br ${colorTheme.gradient}
                                    p-5 shadow-sm
                                    transition-all duration-200
                                    hover:shadow-md hover:border-opacity-40
                                `}>
                                    {/* Barra lateral decorativa */}
                                    <div className={`
                                        absolute left-0 top-0 h-full w-1
                                        bg-linear-to-b from-[#7900E5] via-[#7900E5] to-[#ffcc00]
                                        opacity-0 group-hover:opacity-100
                                        transition-opacity duration-300
                                    `} />

                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-3">
                                            <div className={`
                                                rounded-lg p-2
                                                bg-linear-to-br ${colorTheme.gradient}
                                                border ${colorTheme.border}
                                            `}>
                                                <Sparkles className="h-4 w-4 text-foreground" />
                                            </div>
                                <div>
                                                <h2 className="font-montserrat text-lg font-bold tracking-tight text-foreground">
                                                    {team.name}
                                                </h2>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                        Time Global • Vinculado a este projeto
                                    </p>
                                </div>
                                        </div>
                                        
                                        {/* Estatísticas rápidas */}
                                        <div className="flex items-center gap-4 pt-2">
                                            <div className="flex items-center gap-1.5">
                                                <Badge variant="outline" className="text-xs font-medium">
                                                    {itemsCount} {itemsCount === 1 ? 'item' : 'itens'}
                                                </Badge>
                                                {openItemsCount > 0 && (
                                                    <Badge 
                                                        variant="destructive" 
                                                        className="text-xs font-semibold animate-pulse"
                                                    >
                                                        {openItemsCount} aberto{openItemsCount > 1 ? 's' : ''}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                    <ManageTeamMembersModal 
                                        team={team} 
                                        triggerButton={
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="gap-2 text-xs font-semibold hover:border-[#7900E5]/30 hover:bg-[#7900E5]/5 hover:text-[#7900E5] transition-all"
                                                >
                                                <Users className="h-4 w-4" />
                                                Ver Membros
                                            </Button>
                                        }
                                    />
                                </div>
                            </div>

                            <TeamTabContent
                                teamId={team.id}
                                categories={categories || []}
                                items={items || []}
                                projectId={projectId}
                            />
                        </TabsContent>
                        )
                    })}
                </Tabs>
            )}
        </div>
    )
}