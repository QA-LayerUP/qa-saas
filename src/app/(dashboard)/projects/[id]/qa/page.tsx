/* eslint-disable @typescript-eslint/no-unused-vars */
import { createClient } from '@/lib/supabase/server'
import { CreateCategoryModal } from '@/components/qa/CreateCategoryModal'
import { CreateTeamModal } from '@/components/teams/CreateTeamModal'
import { TaskModeSelector } from '@/components/qa/TaskModeSelector'
import { NewQAItemButton } from '@/components/qa/NewQAItemButton'
import { QAItemCard } from '@/components/qa/QAItemCard'
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

    // Fetch categories
    const { data: categories } = await supabase
        .from('qa_categories')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at')

    // Fetch items
    const { data: items } = await supabase
        .from('qa_items')
        .select('*')
        .in('category_id', (categories || []).map(c => c.id))
        .order('created_at', { ascending: false })

    const itemsByCategory: Record<string, QAItem[]> = {}
    if (items) {
        items.forEach(item => {
            if (!itemsByCategory[item.category_id]) {
                itemsByCategory[item.category_id] = []
            }
            itemsByCategory[item.category_id].push(item)
        })
    }

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

            {(categories || []).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-muted/10 border-dashed">
                    <p className="text-muted-foreground mb-4">Nenhuma categoria criada ainda.</p>
                    <CreateCategoryModal projectId={projectId} />
                </div>
            ) : (
                <Tabs defaultValue={categories?.[0]?.id} className="w-full">
                    <TabsList className="w-full justify-start overflow-x-auto">
                        {categories?.map((category) => (
                            <TabsTrigger key={category.id} value={category.id}>
                                {category.title}
                                <span className="ml-2 rounded-full bg-muted-foreground/20 px-2 py-0.5 text-xs">
                                    {itemsByCategory[category.id]?.length || 0}
                                </span>
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {categories?.map((category) => (
                        <TabsContent key={category.id} value={category.id} className="mt-6">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {itemsByCategory[category.id]?.length > 0 ? (
                                    itemsByCategory[category.id].map((item) => (
                                        <QAItemCard key={item.id} item={item} projectId={projectId} />
                                    ))
                                ) : (
                                    <div className="col-span-full flex h-32 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                                        Nenhum item nesta categoria.
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            )}
        </div>
    )
}
