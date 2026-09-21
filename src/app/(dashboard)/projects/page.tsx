import { createClient } from '@/lib/supabase/server'
import { ProjectsTable } from '@/components/projects/ProjectsTable'
import { CreateProjectModal } from '@/components/projects/CreateProjectModal'
import { PageHeader } from '@/components/layout/PageHeader'

export default async function ProjectsPage() {
    const supabase = await createClient()
    const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div>
            <PageHeader
                eyebrow="Gerenciamento"
                title="Projetos"
                description="Busque, filtre e defina o andamento de cada projeto."
                action={<CreateProjectModal />}
            />
            <ProjectsTable projects={projects || []} />
        </div>
    )
}
