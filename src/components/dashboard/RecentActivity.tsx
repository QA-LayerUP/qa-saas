/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { History } from 'lucide-react'

interface RecentActivityProps {
    logs: any[]
}

export function RecentActivity({ logs }: RecentActivityProps) {
    return (
        <Card className="col-span-1 h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <History className="h-4 w-4" />
                    Atividade Recente
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {logs.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">Nenhuma atividade recente.</p>
                    ) : (
                        logs.map((log) => (
                            <div key={log.id} className="flex items-start gap-3">
                                <Avatar className="h-8 w-8 mt-0.5 border">
                                    <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                                        {log.user?.name?.[0]?.toUpperCase() || 'S'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col gap-0.5">
                                    <p className="text-sm text-slate-700 leading-tight">
                                        <span className="font-semibold text-slate-900">{log.user?.name || 'Sistema'}</span>
                                        {' '}{log.action}{' '}
                                        {log.qa_item && (
                                            <span className="text-muted-foreground">
                                                na tarefa <span className="font-medium text-slate-700">#{log.qa_item.title}</span>
                                            </span>
                                        )}
                                    </p>
                                    <span className="text-[10px] text-muted-foreground">
                                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: ptBR })}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}