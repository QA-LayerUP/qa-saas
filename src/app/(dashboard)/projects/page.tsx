import { createClient } from '@/lib/supabase/server'
import { ProjectsTable } from '@/components/projects/ProjectsTable'
import { CreateProjectModal } from '@/components/projects/CreateProjectModal'

export default async function ProjectsPage() {
    const supabase = await createClient()
    const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projetos</h1>
                    <p className="text-muted-foreground">Gerencie seus projetos e acompanhe o status de QA.</p>
                </div>
                <CreateProjectModal />
            </div>

            <ProjectsTable projects={projects || []} />
        </div>
    )
}
