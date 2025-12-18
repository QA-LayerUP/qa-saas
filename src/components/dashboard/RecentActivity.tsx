/* eslint-disable @typescript-eslint/no-explicit-any */
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface RecentActivityProps {
    logs: any[]
}

export function RecentActivity({ logs }: RecentActivityProps) {
    return (
        <div className="space-y-4">
            {logs.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma atividade recente.</p>
            ) : (
                logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 rounded-lg border border-border bg-card/50 p-3 transition-colors hover:bg-card/80">
                        <Avatar className="mt-0.5 h-8 w-8 border-2 border-[#7900E5]/20">
                            <AvatarFallback className="bg-linear-to-br from-[#7900E5]/10 to-[#7900E5]/10 text-xs font-semibold text-[#7900E5]">
                                {log.user?.name?.[0]?.toUpperCase() || 'S'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-1 flex-col gap-1">
                            <p className="text-xs leading-tight text-foreground">
                                <span className="font-montserrat font-semibold">{log.user?.name || 'Sistema'}</span>
                                {' '}{log.action}{' '}
                                {log.qa_item && (
                                    <span className="text-muted-foreground">
                                        na tarefa <span className="font-medium text-[#7900E5]">#{log.qa_item.title}</span>
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
    )
}