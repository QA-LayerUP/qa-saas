'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'

interface DashboardChartsProps {
    items: { status: string; priority: string }[]
}

const COLORS = {
    aberto: '#ef4444',       // Red - mantido para urgência
    em_correcao: '#ffcc00',  // Amarelo Layer Up
    em_homologacao: '#e700b9', // Ciano Layer Up
    finalizado: '#7900E5',   // Ciano Layer Up (sucesso)
    cancelado: '#94a3b8'     // Slate
}

const PRIORITY_COLORS = {
    alta: '#7900E5',   // Magenta Layer Up
    media: '#ffcc00',  // Amarelo Layer Up
    baixa: '#e700b9'   // Ciano Layer Up
}

export function DashboardCharts({ items }: DashboardChartsProps) {
    const [isDark, setIsDark] = useState(false)

    // Detectar tema atual
    useEffect(() => {
        const checkTheme = () => {
            setIsDark(document.documentElement.classList.contains('dark'))
        }
        
        checkTheme()
        
        // Observar mudanças no tema
        const observer = new MutationObserver(checkTheme)
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        })
        
        return () => observer.disconnect()
    }, [])
    
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

    // Estilos do tooltip baseados no tema
    const tooltipStyle = isDark
        ? {
              backgroundColor: 'hsl(var(--card))',
              borderRadius: '8px',
              border: '1px solid hsl(var(--border))',
              color: 'hsl(var(--card-foreground))',
          }
        : {
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              color: '#1e293b',
          }

    const tooltipItemStyle = isDark
        ? { color: 'hsl(var(--card-foreground))' }
        : { color: '#1e293b' }

    const cursorStyle = isDark
        ? { fill: 'hsl(var(--muted))' }
        : { fill: '#f1f5f9' }

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
                                        wrapperStyle={{ color: isDark ? 'hsl(var(--foreground))' : '#1e293b' }}
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
                                    tick={{ fill: isDark ? 'hsl(var(--muted-foreground))' : '#64748b' }}
                                />
                                <YAxis 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    allowDecimals={false}
                                    tick={{ fill: isDark ? 'hsl(var(--muted-foreground))' : '#64748b' }}
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