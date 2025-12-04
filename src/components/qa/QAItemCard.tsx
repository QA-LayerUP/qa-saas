/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import Link from 'next/link'
import { QAItem } from '@/lib/types'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AlertCircle, Clock, CheckCircle2, User } from 'lucide-react'
import { DeleteQAItemButton } from './DeleteQAItemButton'

interface QAItemCardProps {
    item: QAItem
    projectId: string
}

export function QAItemCard({ item, projectId }: QAItemCardProps) {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'aberto':
                return <AlertCircle className="h-4 w-4 text-red-500" />
            case 'em_correcao':
                return <Clock className="h-4 w-4 text-yellow-500" />
            case 'em_homologacao':
                return <Clock className="h-4 w-4 text-blue-500" />
            case 'finalizado':
                return <CheckCircle2 className="h-4 w-4 text-green-500" />
            default:
                return <AlertCircle className="h-4 w-4" />
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'alta':
                return 'bg-red-100 text-red-800 hover:bg-red-100'
            case 'media':
                return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
            case 'baixa':
                return 'bg-green-100 text-green-800 hover:bg-green-100'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <Link href={`/projects/${projectId}/qa/item/${item.id}`}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full flex flex-col group relative">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <div onClick={(e) => e.preventDefault()}>
                        <DeleteQAItemButton itemId={item.id} />
                    </div>
                </div>
                <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                    <div className="flex items-center gap-2">
                        {getStatusIcon(item.status)}
                        <span className="text-xs font-medium text-muted-foreground uppercase">
                            {item.status.replace('_', ' ')}
                        </span>
                    </div>
                    <Badge variant="secondary" className={getPriorityColor(item.priority)}>
                        {item.priority}
                    </Badge>
                </CardHeader>
                <CardContent className="p-4 pt-2 flex-1">
                    <h3 className="font-semibold leading-tight mb-2 line-clamp-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                        {item.description || 'Sem descrição'}
                    </p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[10px] uppercase">
                                {item.assigned_to ? 'U' : (item.assigned_role ? item.assigned_role.substring(0, 2) : '?')}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                            {item.assigned_to ? 'Atribuído' : (item.assigned_role ? `Time: ${item.assigned_role.toUpperCase()}` : 'Não atribuído')}
                        </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ptBR })}
                    </span>
                </CardFooter>
            </Card>
        </Link>
    )
}
