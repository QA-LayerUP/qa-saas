'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'

interface DashboardChartsProps {
    items: { status: string; priority: string }[]
}

const COLORS = {
    aberto: '#ef4444',
    em_correcao: '#ffcc00',
    pendencia: '#f97316',
    em_homologacao: '#e700b9',
    finalizado: '#7900E5',
    cancelado: '#94a3b8'
}

const PRIORITY_COLORS = {
    alta: '#7900E5',
    media: '#ffcc00',
    baixa: '#e700b9',
}

export function DashboardCharts({ items }: DashboardChartsProps) {
    // Processar dados para o Gráfico de Status
    const statusData = [
        { name: 'Aberto', value: items.filter(i => i.status === 'aberto').length, color: COLORS.aberto },
        { name: 'Correção', value: items.filter(i => i.status === 'em_correcao').length, color: COLORS.em_correcao },
        { name: 'Pendência', value: items.filter(i => i.status === 'pendencia').length, color: COLORS.pendencia },
        { name: 'Homolog.', value: items.filter(i => i.status === 'em_homologacao').length, color: COLORS.em_homologacao },
        { name: 'Finalizado', value: items.filter(i => i.status === 'finalizado').length, color: COLORS.finalizado },
    ].filter(i => i.value > 0)

    // Processar dados para o Gráfico de Prioridade
    const priorityData = [
        { name: 'Alta', total: items.filter(i => i.priority === 'alta').length },
        { name: 'Média', total: items.filter(i => i.priority === 'media').length },
        { name: 'Baixa', total: items.filter(i => i.priority === 'baixa').length },
    ]

    const tooltipStyle = {
        backgroundColor: 'var(--card)',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        color: 'var(--card-foreground)',
    }
    const tooltipItemStyle = { color: 'var(--card-foreground)' }
    const cursorStyle = { fill: 'var(--muted)' }
    const tickStyle = { fill: 'var(--muted-foreground)' }

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {/* Gráfico de Pizza - Status */}
            <Card className="border-border bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="font-montserrat text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Status das Tarefas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] w-full">
                        {statusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={tooltipStyle}
                                        itemStyle={tooltipItemStyle}
                                    />
                                    <Legend 
                                        verticalAlign="bottom" 
                                        height={36} 
                                        iconType="circle"
                                        wrapperStyle={{ color: 'var(--foreground)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                Sem dados suficientes
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Gráfico de Barras - Prioridade */}
            <Card className="border-border bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="font-montserrat text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Tarefas por Prioridade
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={priorityData}>
                                <XAxis 
                                    dataKey="name" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false}
                                    tick={tickStyle}
                                />
                                <YAxis 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    allowDecimals={false}
                                    tick={tickStyle}
                                />
                                <Tooltip 
                                    cursor={cursorStyle}
                                    contentStyle={tooltipStyle}
                                    itemStyle={tooltipItemStyle}
                                />
                                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                                    {priorityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={Object.values(PRIORITY_COLORS)[index]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}