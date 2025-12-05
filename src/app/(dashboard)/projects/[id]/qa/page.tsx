/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createClient } from '@/lib/supabase/server'
import { CreateCategoryModal } from '@/components/qa/CreateCategoryModal'
import { CreateTeamModal } from '@/components/teams/CreateTeamModal'
import { TaskModeSelector } from '@/components/qa/TaskModeSelector'
import { NewQAItemButton } from '@/components/qa/NewQAItemButton'
import { QAItemCard } from '@/components/qa/QAItemCard'
import TeamTabContent from '@/components/qa/TeamTabContent'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QAItem, QACategory } from '@/lib/types'

interface ProjectQAPageProps {
    params: Promise<{ id: string }>
}

export default async function ProjectQAPage({ params }: ProjectQAPageProps) {
    const supabase = await createClient()
    const { id: projectId } = await params

    // Fetch project details
    const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

    // Fetch teams
    const { data: teams } = await supabase
        .from('teams')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })

    // Fetch categories (all for project)
    const { data: categories } = await supabase
        .from('qa_categories')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at')

    // Fetch items for project
    let items: any[] | undefined = []
    const categoryIds = (categories || []).map(c => c.id)
    if (categoryIds.length > 0) {
        const res = await supabase
            .from('qa_items')
            .select('*, qa_evidences(file_url)')
            .in('category_id', categoryIds)
            .order('created_at', { ascending: false })

        // CORREÇÃO AQUI:
        // Se res.data for null, usamos [] para evitar o erro de tipo
        items = res.data || [] 
    }

    const itemsByCategory: Record<string, QAItem[]> = {}
    if (items) {
        items.forEach(item => {
            if (!itemsByCategory[item.category_id]) {
                itemsByCategory[item.category_id] = []
            }
            itemsByCategory[item.category_id].push(item)
        })
    }

    // Group categories by team for quick lookup
    const categoriesByTeam: Record<string, QACategory[]> = {}
    ;(categories || []).forEach((c) => {
        const t = c.team_id || 'unassigned'
        if (!categoriesByTeam[t]) categoriesByTeam[t] = []
        categoriesByTeam[t].push(c)
    })

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{project?.name} - QA</h1>
                    <p className="text-muted-foreground">Gerencie os itens de QA deste projeto.</p>
                </div>
                <div className="flex gap-2 items-center">
                    <CreateCategoryModal projectId={projectId} />
                    <CreateTeamModal projectId={projectId} />
                    {project?.site_url ? (
                        <TaskModeSelector
                            categories={categories || []}
                            projectId={projectId}
                            hasCategories={(categories || []).length > 0}
                        />
                    ) : (
                        <>
                            {(categories || []).length > 0 && (
                                <NewQAItemButton
                                    categories={categories || []}
                                    projectId={projectId}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>

            {(teams || []).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-muted/10 border-dashed">
                    <p className="text-muted-foreground mb-4">Nenhum time criado ainda.</p>
                    <CreateTeamModal projectId={projectId} />
                </div>
            ) : (
                <Tabs defaultValue={teams?.[0]?.id} className="w-full">
                    <TabsList className="w-full justify-start overflow-x-auto">
                        {teams?.map((team) => (
                            <TabsTrigger key={team.id} value={team.id}>
                                {team.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {teams?.map((team) => (
                        <TabsContent key={team.id} value={team.id} className="mt-6">
                            {/* Client component handles filters + items rendering */}
                            <TeamTabContent
                                teamId={team.id}
                                categories={categories || []}
                                items={items || []}
                                projectId={projectId}
                            />
                        </TabsContent>
                    ))}
                </Tabs>
            )}
        </div>
    )
}
