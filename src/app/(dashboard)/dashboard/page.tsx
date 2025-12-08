import { createClient } from '@/lib/supabase/server'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { RecentProjects } from '@/components/dashboard/RecentProjects'
import { DashboardCharts } from '@/components/dashboard/DashboardCharts'
import { RecentActivity } from '@/components/dashboard/RecentActivity'

export default async function DashboardPage() {
    const supabase = await createClient()

    // 1. Fetch Projects Count & Recent
    const { data: projects, count: totalProjects } = await supabase
        .from('projects')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(5)

    // 2. Fetch All Items (Lightweight) for Stats & Charts
    // Pegamos apenas status e priority para não pesar
    const { data: allItems } = await supabase
        .from('qa_items')
        .select('status, priority')

    const items = allItems || []

    // Calcular contagens no JS (evita múltiplas chamadas ao banco)
    const openItems = items.filter(i => i.status === 'aberto').length
    const inCorrectionItems = items.filter(i => i.status === 'em_correcao').length
    const finishedItems = items.filter(i => i.status === 'finalizado').length

    // 3. Fetch Recent Activity (Logs)
    // Buscamos logs e fazemos join com usuário e item (para pegar o título)
    const { data: logs } = await supabase
        .from('qa_logs')
        .select(`
            id,
            action,
            created_at,
            user:users(name),
            qa_item:qa_items(title)
        `)
        .order('created_at', { ascending: false })
        .limit(8)

    return (
        <div className="flex flex-col gap-6 p-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Visão geral e métricas de qualidade.</p>
            </div>

            {/* KPI Cards */}
            <StatsCards
                totalProjects={totalProjects || 0}
                openItems={openItems}
                inCorrectionItems={inCorrectionItems}
                finishedItems={finishedItems}
            />

            {/* Gráficos */}
            <DashboardCharts items={items} />

            {/* Listas: Projetos e Atividade */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="col-span-2">
                    <RecentProjects projects={projects || []} />
                </div>
                
                <RecentActivity logs={logs || []} />
            </div>
        </div>
    )
}