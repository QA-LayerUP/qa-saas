import { createClient } from '@/lib/supabase/server'
import { ProjectsTable } from '@/components/projects/ProjectsTable'
import { CreateProjectModal } from '@/components/projects/CreateProjectModal'
import { FolderKanban } from 'lucide-react'

export default async function ProjectsPage() {
    const supabase = await createClient()
    const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-[#7900E5]/10 p-2.5">
                        <FolderKanban className="h-6 w-6 text-[#7900E5]" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="h-1 w-6 rounded-full bg-linear-to-r from-[#7900E5] to-[#ffcc00]" />
                            <p className="font-montserrat text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7900E5] dark:text-white">
                                {'// Gerenciamento'}
                            </p>
                        </div>
                        <h1 className="font-montserrat text-2xl font-bold tracking-tight">Projetos</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Gerencie seus projetos e acompanhe o status de QA.
                        </p>
                    </div>
                </div>
                <CreateProjectModal />
            </div>

            {/* Stats Badge */}
            <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#7900E5]/10 px-3 py-1 text-xs font-medium text-[#7900E5]">
                    {projects?.length || 0} {projects?.length === 1 ? 'projeto' : 'projetos'}
                </span>
            </div>

            <ProjectsTable projects={projects || []} />
        </div>
    )
}
