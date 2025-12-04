import { createClient } from '@/lib/supabase/server'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { RecentProjects } from '@/components/dashboard/RecentProjects'

export default async function DashboardPage() {
    const supabase = await createClient()

    // Fetch stats
    const { count: totalProjects } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })

    const { count: openItems } = await supabase
        .from('qa_items')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'aberto')

    const { count: inCorrectionItems } = await supabase
        .from('qa_items')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'em_correcao')

    const { count: finishedItems } = await supabase
        .from('qa_items')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'finalizado')

    // Fetch recent projects
    const { data: recentProjects } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Visão geral dos seus projetos de QA.</p>
            </div>

            <StatsCards
                totalProjects={totalProjects || 0}
                openItems={openItems || 0}
                inCorrectionItems={inCorrectionItems || 0}
                finishedItems={finishedItems || 0}
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="col-span-2">
                    <RecentProjects projects={recentProjects || []} />
                </div>
                {/* Placeholder for another widget, maybe activity feed */}
                <div className="rounded-xl border bg-card text-card-foreground shadow col-span-1 p-6">
                    <h3 className="font-semibold leading-none tracking-tight mb-4">Atividade Recente</h3>
                    <p className="text-sm text-muted-foreground">Em breve...</p>
                </div>
            </div>
        </div>
    )
}
