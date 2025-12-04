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
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
                    <FolderKanban className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalProjects}</div>
                    <p className="text-xs text-muted-foreground">Projetos ativos</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Itens Abertos</CardTitle>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{openItems}</div>
                    <p className="text-xs text-muted-foreground">Aguardando correção</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Em Correção</CardTitle>
                    <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{inCorrectionItems}</div>
                    <p className="text-xs text-muted-foreground">Sendo trabalhados</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Finalizados</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{finishedItems}</div>
                    <p className="text-xs text-muted-foreground">Itens concluídos</p>
                </CardContent>
            </Card>
        </div>
    )
}
