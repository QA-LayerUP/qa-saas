/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/static-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import Link from 'next/link'
import { QAItem, QACategory } from '@/lib/types'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AlertCircle, Clock, CheckCircle2, Globe, ExternalLink, Image as ImageIcon } from 'lucide-react'
import { DeleteQAItemButton } from './DeleteQAItemButton'
import { Button } from '@/components/ui/button'

interface QAItemCardProps {
    item: QAItem
    projectId: string
    category?: QACategory
    evidenceUrl?: string | null
    onPreview?: (url: string) => void
    disableNavigation?: boolean // Nova prop para controlar se usa Link ou não
}

export function QAItemCard({ 
    item, 
    projectId, 
    category, 
    evidenceUrl, 
    onPreview,
    disableNavigation = true // Padrão true para favorecer a abertura da Sheet
}: QAItemCardProps) {
    
    const categoryTitle = category?.title || (item as any).category_title || null

    const formatUrl = (url: string) => {
        try {
            const urlObj = new URL(url)
            return urlObj.hostname.replace('www.', '') + (urlObj.pathname !== '/' ? urlObj.pathname : '')
        } catch {
            return url
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'aberto': return <AlertCircle className="h-4 w-4 text-red-500" />
            case 'em_correcao': return <Clock className="h-4 w-4 text-yellow-500" />
            case 'em_homologacao': return <Clock className="h-4 w-4 text-blue-500" />
            case 'finalizado': return <CheckCircle2 className="h-4 w-4 text-green-500" />
            default: return <AlertCircle className="h-4 w-4" />
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'alta': return 'bg-red-100 text-red-800 hover:bg-red-100 border-red-200'
            case 'media': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200'
            case 'baixa': return 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    // Define o conteúdo do Título (Link ou Texto simples)
    const TitleContent = () => {
        if (disableNavigation) {
            return (
                <span className="after:absolute after:inset-0 cursor-pointer">
                    {item.title}
                </span>
            )
        }
        return (
            <Link 
                href={`/projects/${projectId}/qa/item/${item.id}`}
                className="after:absolute after:inset-0"
            >
                {item.title}
            </Link>
        )
    }

    return (
        <Card className="relative hover:bg-muted/50 hover:shadow-md transition-all cursor-pointer h-full flex flex-col group overflow-hidden border-muted-foreground/20">
            
            {/* Botão de deletar - Topo Direito */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <div onClick={(e) => {
                    e.stopPropagation() // Impede abrir a sheet ao clicar em deletar
                    // O botão interno já previne default, mas garantimos aqui
                }}>
                    <DeleteQAItemButton itemId={item.id} />
                </div>
            </div>

            <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                <div className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {item.status.replace('_', ' ')}
                    </span>
                </div>
                <Badge variant="outline" className={`text-[10px] uppercase ${getPriorityColor(item.priority)}`}>
                    {item.priority}
                </Badge>
            </CardHeader>

            <CardContent className="p-4 pt-2 flex-1">
                <div className="flex flex-col gap-2 mb-2">
                    <h3 className="font-semibold leading-tight line-clamp-2 text-base">
                        <TitleContent />
                    </h3>

                    {categoryTitle && (
                        <div className="flex">
                            {/* relative z-10 para ficar acima do "stretched link" se precisar selecionar */}
                            <Badge variant="secondary" className="relative z-10 text-[10px] font-normal px-2 h-5 bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200">
                                {categoryTitle}
                            </Badge>
                        </div>
                    )}
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                    {item.description || 'Sem descrição'}
                </p>

                {item.page_url && (
                    <div 
                        className="inline-flex max-w-full relative z-10" // z-10 Importante para o link funcionar
                        onClick={(e) => e.stopPropagation()} 
                    >
                        <a 
                            href={item.page_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="group/link flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 hover:bg-blue-100 transition-colors max-w-full"
                        >
                            <Globe className="h-3 w-3 shrink-0" />
                            <span className="truncate font-mono">{formatUrl(item.page_url)}</span>
                            <ExternalLink className="h-3 w-3 shrink-0 opacity-50 group-hover/link:opacity-100" />
                        </a>
                    </div>
                )}
            </CardContent>

            <CardFooter className="p-4 pt-0 flex items-center justify-between mt-auto border-t bg-muted/5 py-3 relative z-10">
                <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-[9px] uppercase bg-slate-200">
                            {item.assigned_user?.name 
                                ? item.assigned_user.name.substring(0, 2)
                                : (item.assigned_to ? 'U' : '?')
                            }
                        </AvatarFallback>
                    </Avatar>
                    
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ptBR })}
                    </span>
                </div>
                
                {evidenceUrl && onPreview && (
                     <div onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation() // Impede abrir a sheet ao clicar no preview
                        onPreview(evidenceUrl)
                    }}>
                        <button 
                            className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white border shadow-sm hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all group/btn cursor-pointer"
                            title="Ver evidência"
                        >
                            <ImageIcon className="h-3.5 w-3.5 text-slate-500 group-hover/btn:text-blue-600" />
                            <span className="text-[10px] font-medium text-slate-600 group-hover/btn:text-blue-600">Ver Print</span>
                        </button>
                    </div>
                )}
            </CardFooter>
        </Card>
    )
}