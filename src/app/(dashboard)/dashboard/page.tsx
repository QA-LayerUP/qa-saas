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
  const openItems = items.filter((i) => i.status === 'aberto').length
  const inCorrectionItems = items.filter((i) => i.status === 'em_correcao').length
  const finishedItems = items.filter((i) => i.status === 'finalizado').length

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
    <div className="flex flex-col gap-6 pb-10">

      {/* KPI Cards */}
      <section className="rounded-xl border border-border bg-card/70 p-5 shadow-sm backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="h-1 w-8 rounded-full bg-linear-to-r from-[#7900E5] to-[#ffcc00]" />
            <h2 className="font-montserrat text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Visão geral das QA
            </h2>
          </div>
          <span className="rounded-full bg-[#7900E5]/10 px-3 py-1 text-[11px] font-medium text-[#7900E5]">
            {totalProjects || 0} projetos
          </span>
        </div>
        <StatsCards
          totalProjects={totalProjects || 0}
          openItems={openItems}
          inCorrectionItems={inCorrectionItems}
          finishedItems={finishedItems}
        />
      </section>

      {/* Gráficos */}
      <section className="rounded-xl border border-border bg-card/70 p-5 shadow-sm backdrop-blur-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="h-1 w-8 rounded-full bg-linear-to-r from-[#7900E5] to-[#ffcc00]" />
          <h2 className="font-montserrat text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Evolução das demandas
          </h2>
        </div>
        <DashboardCharts items={items} />
      </section>

      {/* Listas: Projetos e Atividade */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-2 rounded-xl border border-border bg-card/70 p-5 shadow-sm backdrop-blur-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-1 w-8 rounded-full bg-linear-to-r from-[#7900E5] to-[#7900E5]" />
            <h2 className="font-montserrat text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Projetos recentes
            </h2>
          </div>
          <RecentProjects projects={projects || []} />
        </div>

        <div className="rounded-xl border border-border bg-card/70 p-5 shadow-sm backdrop-blur-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-1 w-8 rounded-full bg-linear-to-r from-[#ffcc00] to-[#7900E5]" />
            <h2 className="font-montserrat text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Atividade recente
            </h2>
          </div>
          <RecentActivity logs={logs || []} />
        </div>
      </section>
    </div>
  )
}