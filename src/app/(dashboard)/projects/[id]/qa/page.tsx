/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server'
import { CreateCategoryModal } from '@/components/qa/CreateCategoryModal'
import { LinkTeamModal } from '@/components/projects/LinkTeamModal' // <--- NOVO COMPONENTE
import { ManageTeamMembersModal } from '@/components/teams/ManageTeamMembersModal'
import { TaskModeSelector } from '@/components/qa/TaskModeSelector'
import { NewQAItemButton } from '@/components/qa/NewQAItemButton'
import TeamTabContent from '@/components/qa/TeamTabContent'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Users, Settings2 } from 'lucide-react'

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

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{project?.name} - QA</h1>
                    <p className="text-muted-foreground">Gerencie o QA deste projeto.</p>
                </div>
                
                <div className="flex flex-wrap gap-2 items-center">
                    <CreateCategoryModal projectId={projectId} />
                    
                    {/* Botão de Vincular Time ao invés de Criar */}
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
                <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-muted/10 border-dashed">
                    <p className="text-muted-foreground mb-4">Nenhum time vinculado a este projeto.</p>
                    <LinkTeamModal projectId={projectId} existingTeamIds={[]} />
                </div>
            ) : (
                <Tabs defaultValue={teams[0]?.id} className="w-full">
                    <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-muted/20">
                        {teams.map((team) => (
                            <TabsTrigger key={team.id} value={team.id} className="px-4 py-2">
                                {team.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {teams.map((team) => (
                        <TabsContent key={team.id} value={team.id} className="mt-6 space-y-4">
                             <div className="flex items-center justify-between border-b pb-4">
                                <div>
                                    <h2 className="text-xl font-semibold tracking-tight">{team.name}</h2>
                                    <p className="text-sm text-muted-foreground">
                                        Time Global • Vinculado a este projeto
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    {/* Botão para gerenciar membros (Isso afeta o time globalmente, cuidado!) */}
                                    <ManageTeamMembersModal 
                                        team={team} 
                                        triggerButton={
                                            <Button variant="ghost" size="sm" className="gap-2 h-8">
                                                <Users className="h-4 w-4" />
                                                Ver Membros
                                            </Button>
                                        }
                                    />
                                    {/* Opcional: Botão para desvincular time do projeto */}
                                </div>
                            </div>

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