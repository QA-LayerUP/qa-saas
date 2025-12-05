/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
    Sheet, 
    SheetContent, 
    SheetTitle, 
    SheetHeader, 
    SheetDescription 
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { AlertCircle, Clock, CheckCircle2, Loader2, Maximize2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

// Componentes internos
import { EvidenceUpload } from '@/components/qa/EvidenceUpload'
import { EvidencesDisplay } from '@/components/qa/EvidencesDisplay'
import { CommentSection } from '@/components/qa/CommentSection'

interface QAItemDetailSheetProps {
    itemId: string | null
    open: boolean
    onOpenChange: (open: boolean) => void
    projectId: string
}

export function QAItemDetailSheet({ itemId, open, onOpenChange, projectId }: QAItemDetailSheetProps) {
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [item, setItem] = useState<any>(null)
    const [evidences, setEvidences] = useState<any[]>([])
    const [comments, setComments] = useState<any[]>([])
    const [currentUserId, setCurrentUserId] = useState<string>('')

    useEffect(() => {
        if (open && itemId) {
            fetchData()
        } else {
            setItem(null)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, itemId])

    async function fetchData() {
        if (!itemId) return
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            setCurrentUserId(user?.id || '')

            const { data: itemData, error: itemError } = await supabase
                .from('qa_items')
                .select(`*, assigned_user:users!assigned_to(name, email), created_user:users!created_by(name, email), category:qa_categories(title)`)
                .eq('id', itemId)
                .single()

            if (itemError) throw itemError
            setItem(itemData)

            const { data: evidenceData } = await supabase
                .from('qa_evidences')
                .select('*')
                .eq('qa_item_id', itemId)
                .order('created_at', { ascending: false })
            setEvidences(evidenceData || [])

            const { data: commentsData } = await supabase
                .from('qa_comments')
                .select(`*, user:users(name, email)`)
                .eq('qa_item_id', itemId)
                .order('created_at')
            setComments(commentsData || [])

        } catch (error) {
            console.error("Erro ao carregar detalhes:", error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'aberto': return <AlertCircle className="h-5 w-5 text-red-500" />
            case 'em_correcao': return <Clock className="h-5 w-5 text-yellow-500" />
            case 'em_homologacao': return <Clock className="h-5 w-5 text-blue-500" />
            case 'finalizado': return <CheckCircle2 className="h-5 w-5 text-green-500" />
            default: return <AlertCircle className="h-5 w-5" />
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-xl md:max-w-4xl p-0 gap-0 bg-slate-50 border-l shadow-2xl">
                
                {/* CORREÇÃO DO ERRO DE CONSOLE:
                    O Radix UI exige um Title presente na montagem.
                    Adicionamos um Header invisível (sr-only) para cumprir a regra de acessibilidade
                    mesmo enquanto o conteúdo carrega.
                */}
                <SheetHeader className="sr-only">
                    <SheetTitle>Detalhes da Tarefa</SheetTitle>
                    <SheetDescription>Visualização detalhada do item de QA</SheetDescription>
                </SheetHeader>

                <ScrollArea className="h-full w-full">
                    <div className="p-6 pb-20">
                        {loading || !item ? (
                            <div className="flex flex-col items-center justify-center h-[50vh] gap-2">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-muted-foreground">Carregando detalhes...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-6">
                                {/* HEADER VISUAL */}
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                                            <span>#{item.id.slice(0, 8)}</span>
                                            {item.category?.title && (
                                                <>
                                                    <span>•</span>
                                                    <span>{item.category?.title}</span>
                                                </>
                                            )}
                                        </div>
                                        {/* Trocamos SheetTitle por h2 aqui para evitar duplicidade de ID com o header oculto */}
                                        <h2 className="text-2xl font-bold leading-tight text-foreground">
                                            {item.title}
                                        </h2>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Badge variant="outline" className="uppercase flex gap-1.5 px-3 py-1 bg-white">
                                                {getStatusIcon(item.status)}
                                                {item.status.replace('_', ' ')}
                                            </Badge>
                                            <Badge variant={item.priority === 'alta' ? 'destructive' : 'secondary'} className="uppercase">
                                                {item.priority}
                                            </Badge>
                                        </div>
                                    </div>
                                    
                                    <Link href={`/projects/${projectId}/qa/item/${item.id}`} target="_blank">
                                        <Button variant="ghost" size="icon" title="Abrir em nova aba">
                                            <Maximize2 className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>

                                <Separator />

                                <div className="grid gap-6 md:grid-cols-3">
                                    {/* COLUNA ESQUERDA (Principal) */}
                                    <div className="md:col-span-2 space-y-6">
                                        {/* Descrição */}
                                        <Card className="shadow-sm border-none md:border">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-base">Descrição</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                                                    {item.description || 'Sem descrição fornecida.'}
                                                </p>
                                            </CardContent>
                                        </Card>

                                        {/* Evidências */}
                                        <Card className="shadow-sm border-none md:border">
                                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                                <CardTitle className="text-base">Evidências</CardTitle>
                                                <EvidenceUpload itemId={item.id} />
                                            </CardHeader>
                                            <CardContent>
                                                <EvidencesDisplay evidences={evidences} />
                                            </CardContent>
                                        </Card>

                                        {/* Comentários */}
                                        <div className="pt-2">
                                            <h3 className="text-lg font-semibold mb-4 text-slate-800">Comentários</h3>
                                            <CommentSection
                                                itemId={item.id}
                                                comments={comments}
                                                currentUserId={currentUserId}
                                            />
                                        </div>
                                    </div>

                                    {/* COLUNA DIREITA (Metadados) */}
                                    <div className="space-y-6">
                                        <Card className="shadow-sm bg-white border-none md:border">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                                                    Detalhes Técnicos
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-5 text-sm">
                                                <div className="grid gap-1.5">
                                                    <span className="text-muted-foreground text-xs">Atribuído a</span>
                                                    <div className="flex items-center gap-2 font-medium text-slate-900">
                                                        <div className="h-6 w-6 rounded-full bg-slate-100 border flex items-center justify-center text-xs font-bold text-slate-500">
                                                            {item.assigned_user?.name?.[0]?.toUpperCase() || 'U'}
                                                        </div>
                                                        {item.assigned_user?.name || 'Não atribuído'}
                                                    </div>
                                                </div>

                                                <Separator />

                                                <div className="grid gap-1.5">
                                                    <span className="text-muted-foreground text-xs">Reportado por</span>
                                                    <span className="font-medium text-slate-900">{item.created_user?.name || 'Sistema'}</span>
                                                </div>

                                                <Separator />

                                                <div className="grid gap-1.5">
                                                    <span className="text-muted-foreground text-xs">Data de Criação</span>
                                                    <span className="text-slate-900">{format(new Date(item.created_at), "d 'de' MMMM, HH:mm", { locale: ptBR })}</span>
                                                </div>

                                                {item.page_url && (
                                                    <>
                                                        <Separator />
                                                        <div className="grid gap-1.5">
                                                            <span className="text-muted-foreground text-xs">URL Afetada</span>
                                                            <a href={item.page_url} target="_blank" className="text-blue-600 hover:underline break-all text-xs font-mono bg-blue-50 p-1 rounded border border-blue-100">
                                                                {item.page_url}
                                                            </a>
                                                        </div>
                                                    </>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}