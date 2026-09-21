import { createClient } from '@/lib/supabase/server'
import { FullPageCapture } from '@/components/qa/FullPageCapture'
import { ensureQaCategory } from '@/lib/qa-categories'
import { redirect } from 'next/navigation'

export default async function DetailedQAPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id: projectId } = await params

    const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

    if (!project) {
        redirect('/projects')
    }

    if (!project.site_url) {
        redirect(`/projects/${projectId}/qa`)
    }

    const categoryId = await ensureQaCategory(supabase, {
        projectId,
        teamId: null,
        title: 'Desktop',
    })

    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden">
            <FullPageCapture
                projectId={projectId}
                siteUrl={project.site_url}
                categoryId={categoryId}
            />
        </div>
    )
}
