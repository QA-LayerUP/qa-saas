'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'

interface DashboardChartsProps {
    items: { status: string; priority: string }[]
}

const COLORS = {
    aberto: '#ef4444',       // Red
    em_correcao: '#eab308',  // Yellow
    em_homologacao: '#3b82f6', // Blue
    finalizado: '#22c55e',   // Green
    cancelado: '#94a3b8'     // Slate
}

const PRIORITY_COLORS = {
    alta: '#ef4444',
    media: '#eab308',
    baixa: '#22c55e'
}

export function DashboardCharts({ items }: DashboardChartsProps) {
    
    // Processar dados para o Gráfico de Status
    const statusData = [
        { name: 'Aberto', value: items.filter(i => i.status === 'aberto').length, color: COLORS.aberto },
        { name: 'Correção', value: items.filter(i => i.status === 'em_correcao').length, color: COLORS.em_correcao },
        { name: 'Homolog.', value: items.filter(i => i.status === 'em_homologacao').length, color: COLORS.em_homologacao },
        { name: 'Finalizado', value: items.filter(i => i.status === 'finalizado').length, color: COLORS.finalizado },
    ].filter(i => i.value > 0)

    // Processar dados para o Gráfico de Prioridade
    const priorityData = [
        { name: 'Alta', total: items.filter(i => i.priority === 'alta').length },
        { name: 'Média', total: items.filter(i => i.priority === 'media').length },
        { name: 'Baixa', total: items.filter(i => i.priority === 'baixa').length },
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {/* Gráfico de Pizza - Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Status das Tarefas</CardTitle>
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
                                        contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                        itemStyle={{ color: '#1e293b' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
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
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Tarefas por Prioridade</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={priorityData}>
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip 
                                    cursor={{ fill: '#f1f5f9' }}
                                    contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
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