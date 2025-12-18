import { createClient } from '@/lib/supabase/server'
import { FullPageCapture } from '@/components/qa/FullPageCapture'
import { redirect } from 'next/navigation'

export default async function DetailedQAPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id: projectId } = await params

    // Fetch project details
    const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

    if (!project) {
        redirect('/projects')
    }

    // Check if project has a site URL
    if (!project.site_url) {
        redirect(`/projects/${projectId}/qa`)
    }

    // Fetch first category (or we could let user select)
    const { data: categories } = await supabase
        .from('qa_categories')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at')
        .limit(1)

    if (!categories || categories.length === 0) {
        redirect(`/projects/${projectId}/qa`)
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden">
            <FullPageCapture
                projectId={projectId}
                siteUrl={project.site_url}
                categoryId={categories[0].id}
            />
        </div>
    )
}
