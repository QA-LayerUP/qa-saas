import { FolderKanban, AlertCircle, CheckCircle2, Clock } from 'lucide-react'

interface StatsProps {
    totalProjects: number
    openItems: number
    inCorrectionItems: number
    finishedItems: number
}

export function StatsCards({ totalProjects, openItems, inCorrectionItems, finishedItems }: StatsProps) {
    const stats = [
        { label: 'Projetos', value: totalProjects, hint: 'Projetos ativos', icon: FolderKanban, color: 'text-amarelo' },
        { label: 'Abertos', value: openItems, hint: 'Aguardando correção', icon: AlertCircle, color: 'text-rosa' },
        { label: 'Em correção', value: inCorrectionItems, hint: 'Sendo trabalhados', icon: Clock, color: 'text-amarelo' },
        { label: 'Finalizados', value: finishedItems, hint: 'Itens concluídos', icon: CheckCircle2, color: 'text-roxo' },
    ]

    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
                const Icon = stat.icon
                return (
                    <div key={stat.label} className="lu-card p-5">
                        <div className="mb-6 flex items-center justify-between">
                            <Icon size={16} className={stat.color} />
                            <span className="text-[11px] tracking-[0.16em] text-foreground/65 uppercase">{stat.label}</span>
                        </div>
                        <p className="font-mona uppercase font-bold text-5xl">{stat.value}</p>
                        <p className="mt-2 text-xs text-foreground/65">{stat.hint}</p>
                    </div>
                )
            })}
        </div>
    )
}
