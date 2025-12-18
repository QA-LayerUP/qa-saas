import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FolderKanban, AlertCircle, CheckCircle2, Clock } from 'lucide-react'

interface StatsProps {
    totalProjects: number
    openItems: number
    inCorrectionItems: number
    finishedItems: number
}

export function StatsCards({ totalProjects, openItems, inCorrectionItems, finishedItems }: StatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-[#7900E5] bg-linear-to-br from-[#7900E5]/5 to-transparent">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="font-montserrat text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Projetos
                    </CardTitle>
                    <div className="rounded-full bg-[#7900E5]/10 p-2">
                        <FolderKanban className="h-4 w-4 text-[#7900E5]" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="font-montserrat text-3xl font-bold text-foreground">{totalProjects}</div>
                    <p className="mt-1 text-xs text-muted-foreground">Projetos ativos</p>
                </CardContent>
            </Card>
            <Card className="border-l-4 border-l-red-500 bg-linear-to-br from-red-500/5 to-transparent">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="font-montserrat text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Abertos
                    </CardTitle>
                    <div className="rounded-full bg-red-500/10 p-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="font-montserrat text-3xl font-bold text-foreground">{openItems}</div>
                    <p className="mt-1 text-xs text-muted-foreground">Aguardando correção</p>
                </CardContent>
            </Card>
            <Card className="border-l-4 border-l-[#ffcc00] bg-linear-to-br from-[#ffcc00]/5 to-transparent">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="font-montserrat text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Em correção
                    </CardTitle>
                    <div className="rounded-full bg-[#ffcc00]/10 p-2">
                        <Clock className="h-4 w-4 text-[#ffcc00]" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="font-montserrat text-3xl font-bold text-foreground">{inCorrectionItems}</div>
                    <p className="mt-1 text-xs text-muted-foreground">Sendo trabalhados</p>
                </CardContent>
            </Card>
            <Card className="border-l-4 border-l-[#7900E5] bg-linear-to-br from-[#7900E5]/5 to-transparent">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="font-montserrat text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Finalizados
                    </CardTitle>
                    <div className="rounded-full bg-[#7900E5]/10 p-2">
                        <CheckCircle2 className="h-4 w-4 text-[#7900E5]" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="font-montserrat text-3xl font-bold text-foreground">{finishedItems}</div>
                    <p className="mt-1 text-xs text-muted-foreground">Itens concluídos</p>
                </CardContent>
            </Card>
        </div>
    )
}
