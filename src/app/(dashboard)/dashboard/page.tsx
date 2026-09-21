import { createClient } from '@/lib/supabase/server'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { RecentProjects } from '@/components/dashboard/RecentProjects'
import { DashboardCharts } from '@/components/dashboard/DashboardCharts'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { PageHeader } from '@/components/layout/PageHeader'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: projects, count: totalProjects } = await supabase
    .from('projects')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: allItems } = await supabase
    .from('qa_items')
    .select('status, priority')

  const items = (allItems || []) as { status: string; priority: string | null }[]

  const openItems = items.filter((i) => i.status === 'aberto').length
  const inCorrectionItems = items.filter((i) => i.status === 'em_correcao').length
  const finishedItems = items.filter((i) => i.status === 'finalizado').length

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
    <div>
      <div className="flex flex-col gap-6 pb-10">
        <section>
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="font-mona uppercase text-2xl font-bold">Visão geral</h2>
            <span className="rounded-md border border-roxo/40 bg-roxo/15 px-3 py-1 text-[11px] font-semibold tracking-widest text-roxo uppercase dark:text-[#c9a0ff]">
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

        <section className="lu-card p-5">
          <h2 className="mb-4 font-mona uppercase text-1xl font-bold">Evolução das demandas</h2>
          <DashboardCharts items={items} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="lu-card p-5">
            <h2 className="mb-4 font-mona uppercase text-1xl font-bold">Projetos recentes</h2>
            <RecentProjects projects={projects || []} />
          </div>

          <div className="lu-card p-5">
            <h2 className="mb-4 font-mona uppercase text-1xl font-bold">Atividade recente</h2>
            <RecentActivity logs={logs || []} />
          </div>
        </section>
      </div>
    </div>
  )
}
