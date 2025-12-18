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
            case 'alta': return 'bg-[#7900E5]/10 text-[#7900E5] hover:bg-[#7900E5]/10 border-[#7900E5]/30 font-semibold'
            case 'media': return 'bg-[#ffcc00]/10 text-[#ffcc00] hover:bg-[#ffcc00]/10 border-[#ffcc00]/30 font-semibold'
            case 'baixa': return 'bg-[#7900E5]/10 text-[#7900E5] hover:bg-[#7900E5]/10 border-[#7900E5]/30 font-semibold'
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
        <Card className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-[#7900E5]/30 hover:bg-card/80 hover:shadow-lg hover:shadow-[#7900E5]/5">
            
            {/* Botão de deletar - Topo Direito */}
            <div className="absolute right-2 top-2 z-20 opacity-0 transition-opacity group-hover:opacity-100">
                <div onClick={(e) => {
                    e.stopPropagation() // Impede abrir a sheet ao clicar em deletar
                    // O botão interno já previne default, mas garantimos aqui
                }}>
                    <DeleteQAItemButton itemId={item.id} />
                </div>
            </div>

            <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4 pb-2">
                <div className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {item.status.replace('_', ' ')}
                    </span>
                </div>
                <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${getPriorityColor(item.priority)}`}>
                    {item.priority}
                </Badge>
            </CardHeader>

            <CardContent className="flex-1 p-4 pt-2">
                <div className="mb-2 flex flex-col gap-2">
                    <h3 className="font-montserrat line-clamp-2 text-base font-semibold leading-tight">
                        <TitleContent />
                    </h3>

                    {categoryTitle && (
                        <div className="flex">
                            <Badge variant="secondary" className="relative z-10 h-5 border border-border bg-muted px-2 text-[10px] font-normal text-foreground hover:bg-muted/80">
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
                            className="group/link flex items-center gap-1.5 text-xs px-2 py-1 rounded-md border transition-all max-w-full
                                text-accent bg-accent/10 border-accent/30
                                hover:bg-accent/20 hover:border-accent/40 hover:text-accent
                                dark:bg-accent/20 dark:border-accent/40 dark:text-accent
                                dark:hover:bg-accent/30 dark:hover:border-accent/50"
                        >
                            <Globe className="h-3 w-3 shrink-0" />
                            <span className="truncate font-mono">{formatUrl(item.page_url)}</span>
                            <ExternalLink className="h-3 w-3 shrink-0 opacity-60 group-hover/link:opacity-100 transition-opacity" />
                        </a>
                    </div>
                )}
            </CardContent>

            <CardFooter className="relative z-10 mt-auto flex items-center justify-between border-t bg-muted/5 p-4 py-3 pt-0">
                <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                        <AvatarFallback className="bg-[#7900E5]/10 text-[9px] uppercase text-[#7900E5]">
                            {item.assigned_user?.name 
                                ? item.assigned_user.name.substring(0, 2)
                                : (item.assigned_to ? 'U' : '?')
                            }
                        </AvatarFallback>
                    </Avatar>
                    
                    <span className="whitespace-nowrap text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ptBR })}
                    </span>
                </div>
                
                {evidenceUrl && onPreview && (
                     <div onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        onPreview(evidenceUrl)
                    }}>
                        <button 
                            className="group/btn flex cursor-pointer items-center gap-1.5 rounded-md border bg-card px-2 py-1 shadow-sm transition-all hover:border-[#7900E5]/30 hover:bg-[#7900E5]/5 hover:text-[#7900E5]"
                            title="Ver evidência"
                        >
                            <ImageIcon className="h-3.5 w-3.5 text-muted-foreground group-hover/btn:text-[#7900E5]" />
                            <span className="text-[10px] font-medium text-muted-foreground group-hover/btn:text-[#7900E5]">Ver Print</span>
                        </button>
                    </div>
                )}
            </CardFooter>
        </Card>
    )
}