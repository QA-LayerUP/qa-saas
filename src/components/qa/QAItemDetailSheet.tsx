/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
    Sheet, 
    SheetContent, 
    SheetTitle, 
    SheetHeader, 
    SheetDescription,
    SheetFooter 
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, Clock, CheckCircle2, Loader2, Maximize2, Hash, Users, Tag, Save, History, Ban } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

// Imports locais
import { EvidenceUpload } from '@/components/qa/EvidenceUpload'
import { EvidencesDisplay } from '@/components/qa/EvidencesDisplay'
import { CommentSection } from '@/components/qa/CommentSection'
import { createLog, getItemLogs } from '@/lib/services/logs'
import { QALog } from '@/lib/types'

interface QAItemDetailSheetProps {
    itemId: string | null
    open: boolean
    onOpenChange: (open: boolean) => void
    projectId: string
}

export function QAItemDetailSheet({ itemId, open, onOpenChange, projectId }: QAItemDetailSheetProps) {
    const supabase = createClient()
    const router = useRouter()
    
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    
    const [item, setItem] = useState<any>(null)
    
    const [formData, setFormData] = useState({
        status: '',
        priority: '',
        team_id: '',
        category_id: ''
    })

    const [evidences, setEvidences] = useState<any[]>([])
    const [comments, setComments] = useState<any[]>([])
    const [logs, setLogs] = useState<QALog[]>([])
    const [projectTeams, setProjectTeams] = useState<any[]>([])
    const [projectCategories, setProjectCategories] = useState<any[]>([])
    
    const [currentUserId, setCurrentUserId] = useState<string>('')

    useEffect(() => {
        if (open && itemId) {
            fetchData()
        } else {
            setItem(null)
            setFormData({ status: '', priority: '', team_id: '', category_id: '' })
            setLogs([])
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, itemId])

    async function fetchData() {
        if (!itemId) return
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            setCurrentUserId(user?.id || '')

            // 1. Detalhes do Item
            const { data: itemData, error: itemError } = await supabase
                .from('qa_items')
                .select(`*, created_user:users!created_by(name, email), category:qa_categories(id, title), team:teams(id, name)`)
                .eq('id', itemId)
                .single()

            if (itemError) throw itemError
            
            setItem(itemData)
            
            setFormData({
                status: itemData.status,
                priority: itemData.priority,
                team_id: itemData.team_id || '',
                category_id: itemData.category_id || ''
            })

            // 2. Buscas Paralelas
            const [teamsRes, catsRes, evidencesRes, commentsRes, logsRes] = await Promise.all([
                supabase.from('project_teams').select('team:teams(id, name)').eq('project_id', projectId),
                supabase.from('qa_categories').select('id, title, team_id').eq('project_id', projectId),
                supabase.from('qa_evidences').select('*').eq('qa_item_id', itemId).order('created_at', { ascending: false }),
                supabase.from('qa_comments').select(`*, user:users(name, email)`).eq('qa_item_id', itemId).order('created_at'),
                getItemLogs(supabase, itemId)
            ])

            setProjectTeams(teamsRes.data?.map((pt: any) => pt.team) || [])
            setProjectCategories(catsRes.data || [])
            setEvidences(evidencesRes.data || [])
            setComments(commentsRes.data || [])
            setLogs(logsRes || [])

        } catch (error) {
            console.error("Erro ao carregar:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (field: string, value: string) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value }
            if (field === 'team_id' && value !== prev.team_id) {
                newData.category_id = ''
            }
            return newData
        })
    }

    const handleSaveChanges = async () => {
        if (!item || !currentUserId) return
        setSaving(true)

        try {
            const payload = {
                status: formData.status,
                priority: formData.priority,
                team_id: formData.team_id || null,
                category_id: formData.category_id || null
            }

            const { error } = await supabase
                .from('qa_items')
                .update(payload)
                .eq('id', itemId)

            if (error) throw error

            const logsToCreate = []

            if (formData.status !== item.status) {
                logsToCreate.push(createLog(supabase, {
                    itemId: item.id, userId: currentUserId, action: 'alterou o status', 
                    details: { from: item.status, to: formData.status }
                }))
            }
            if (formData.priority !== item.priority) {
                logsToCreate.push(createLog(supabase, {
                    itemId: item.id, userId: currentUserId, action: 'alterou a prioridade', 
                    details: { from: item.priority, to: formData.priority }
                }))
            }
            if (formData.team_id !== (item.team_id || '')) {
                const oldTeamName = projectTeams.find(t => t.id === item.team_id)?.name || 'Sem time'
                const newTeamName = projectTeams.find(t => t.id === formData.team_id)?.name || 'Sem time'
                logsToCreate.push(createLog(supabase, {
                    itemId: item.id, userId: currentUserId, action: 'alterou o time', 
                    details: { from: oldTeamName, to: newTeamName }
                }))
            }

            await Promise.all(logsToCreate)

            onOpenChange(false)
            router.refresh()

        } catch (error) {
            console.error('Erro ao salvar:', error)
            alert('Erro ao salvar alterações.')
        } finally {
            setSaving(false)
        }
    }

    const availableCategories = useMemo(() => {
        if (!formData.team_id) return []
        return projectCategories.filter(c => c.team_id === formData.team_id)
    }, [projectCategories, formData.team_id])

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'aberto': return <AlertCircle className="h-4 w-4 text-red-500" />
            case 'em_correcao': return <Clock className="h-4 w-4 text-yellow-500" />
            case 'em_homologacao': return <Clock className="h-4 w-4 text-blue-500" />
            case 'finalizado': return <CheckCircle2 className="h-4 w-4 text-green-500" />
            case 'cancelado': return <Ban className="h-4 w-4 text-gray-400" />
            default: return <AlertCircle className="h-4 w-4" />
        }
    }

    const formatLogDetails = (log: QALog) => {
        if (!log.details) return null
        if (log.action.includes('status')) {
            return <span className="text-xs text-muted-foreground block mt-0.5">de <b className="uppercase">{log.details.from?.replace('_',' ')}</b> para <b className="uppercase">{log.details.to?.replace('_',' ')}</b></span>
        }
        if (log.action.includes('time') || log.action.includes('prioridade')) {
            return <span className="text-xs text-muted-foreground block mt-0.5">de <b>{log.details.from}</b> para <b>{log.details.to}</b></span>
        }
        return null
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            {/* CORREÇÃO 1: h-screen e overflow-hidden no Content */}
            <SheetContent className="w-full sm:max-w-xl md:max-w-4xl p-0 gap-0 bg-slate-50 border-l shadow-2xl flex flex-col h-screen max-h-screen overflow-hidden">
                
                <SheetHeader className="sr-only">
                    <SheetTitle>Detalhes da Tarefa</SheetTitle>
                    <SheetDescription>Edição e visualização do item</SheetDescription>
                </SheetHeader>

                {/* CORREÇÃO 2: ScrollArea com flex-1 para ocupar o espaço disponível */}
                <ScrollArea className="flex-1">
                    <div className="p-6">
                        {loading || !item ? (
                            <div className="flex flex-col items-center justify-center h-[50vh] gap-2">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-muted-foreground">Carregando detalhes...</p>
                            </div>
                        ) : (
                            // pb-6 ao invés de pb-20, pois o footer agora está separado
                            <div className="flex flex-col gap-6 pb-6">
                                {/* HEADER */}
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono mb-2">
                                            <Hash className="h-3 w-3" />
                                            <span>{item.id.slice(0, 8)}</span>
                                        </div>
                                        
                                        <h2 className="text-2xl font-bold leading-tight text-foreground">
                                            {item.title}
                                        </h2>

                                        <div className="flex flex-wrap items-center gap-2 mt-3">
                                            <Select 
                                                value={formData.status} 
                                                onValueChange={(val) => handleChange('status', val)}
                                            >
                                                <SelectTrigger className="h-7 w-40 text-xs uppercase font-semibold bg-white border-dashed shadow-sm">
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(formData.status)}
                                                        <SelectValue />
                                                    </div>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="aberto">Aberto</SelectItem>
                                                    <SelectItem value="em_correcao">Em Correção</SelectItem>
                                                    <SelectItem value="em_homologacao">Homologação</SelectItem>
                                                    <SelectItem value="finalizado">Finalizado</SelectItem>
                                                    <SelectItem value="cancelado">Cancelado</SelectItem>
                                                </SelectContent>
                                            </Select>

                                            <Select 
                                                value={formData.priority} 
                                                onValueChange={(val) => handleChange('priority', val)}
                                            >
                                                <SelectTrigger className={`h-7 w-[100px] text-xs uppercase font-bold border-none shadow-sm text-white
                                                    ${formData.priority === 'alta' ? 'bg-red-500 hover:bg-red-600' : 
                                                      formData.priority === 'media' ? 'bg-yellow-500 hover:bg-yellow-600' : 
                                                      'bg-green-500 hover:bg-green-600'}`
                                                }>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="baixa">Baixa</SelectItem>
                                                    <SelectItem value="media">Média</SelectItem>
                                                    <SelectItem value="alta">Alta</SelectItem>
                                                </SelectContent>
                                            </Select>
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
                                    {/* COLUNA ESQUERDA */}
                                    <div className="md:col-span-2 space-y-6">
                                        
                                        <Tabs defaultValue="details" className="w-full">
                                            <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-auto p-0 gap-6 mb-4">
                                                <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2">
                                                    Detalhes
                                                </TabsTrigger>
                                                <TabsTrigger value="history" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2 flex items-center gap-2">
                                                    Histórico <Badge variant="secondary" className="px-1 h-4 text-[9px]">{logs.length}</Badge>
                                                </TabsTrigger>
                                            </TabsList>

                                            <TabsContent value="details" className="space-y-6">
                                                <Card className="shadow-sm border-none md:border">
                                                    <CardHeader className="pb-3"><CardTitle className="text-base">Descrição</CardTitle></CardHeader>
                                                    <CardContent>
                                                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                                                            {item.description || 'Sem descrição fornecida.'}
                                                        </p>
                                                    </CardContent>
                                                </Card>

                                                <Card className="shadow-sm border-none md:border">
                                                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                                                        <CardTitle className="text-base">Evidências</CardTitle>
                                                        <EvidenceUpload itemId={item.id} />
                                                    </CardHeader>
                                                    <CardContent>
                                                        <EvidencesDisplay evidences={evidences} />
                                                    </CardContent>
                                                </Card>

                                                <div className="pt-2">
                                                    <h3 className="text-lg font-semibold mb-4 text-slate-800">Comentários</h3>
                                                    <CommentSection itemId={item.id} comments={comments} currentUserId={currentUserId} />
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="history">
                                                <Card className="shadow-sm border-none md:border bg-white">
                                                    <CardHeader className="pb-3 border-b bg-slate-50/50">
                                                        <CardTitle className="text-base flex items-center gap-2">
                                                            <History className="h-4 w-4" /> 
                                                            Linha do Tempo
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="p-0">
                                                        <div className="divide-y">
                                                            {logs.length === 0 ? (
                                                                <p className="p-8 text-center text-sm text-muted-foreground">Nenhuma atividade registrada.</p>
                                                            ) : (
                                                                logs.map((log) => (
                                                                    <div key={log.id} className="p-4 flex gap-3 text-sm hover:bg-slate-50/50 transition-colors">
                                                                        <div className="mt-1">
                                                                            <div className="h-2 w-2 rounded-full bg-slate-300 ring-4 ring-slate-100" />
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <p className="text-slate-700">
                                                                                <span className="font-semibold text-slate-900">{(item.created_user as any)?.name || 'Sistema'}</span>{' '}
                                                                                {log.action}
                                                                            </p>
                                                                            {formatLogDetails(log)}
                                                                            <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                                                                                <Clock className="h-3 w-3" />
                                                                                {format(new Date(log.created_at), "dd MMM 'às' HH:mm", { locale: ptBR })}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </TabsContent>
                                        </Tabs>
                                    </div>

                                    {/* COLUNA DIREITA */}
                                    <div className="space-y-6">
                                        <Card className="shadow-sm bg-white border-none md:border sticky top-6">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                                                    Configurações
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-5 text-sm">
                                                <div className="grid gap-1.5">
                                                    <span className="text-muted-foreground text-xs flex items-center gap-1">
                                                        <Users className="h-3 w-3" /> Time Responsável
                                                    </span>
                                                    <Select 
                                                        value={formData.team_id} 
                                                        onValueChange={(val) => handleChange('team_id', val)}
                                                    >
                                                        <SelectTrigger className="w-full bg-slate-50 border-slate-200">
                                                            <SelectValue placeholder="Selecione..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {projectTeams.map(t => (
                                                                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <Separator />

                                                <div className="grid gap-1.5">
                                                    <span className="text-muted-foreground text-xs flex items-center gap-1">
                                                        <Tag className="h-3 w-3" /> Categoria
                                                    </span>
                                                    <Select 
                                                        value={formData.category_id} 
                                                        onValueChange={(val) => handleChange('category_id', val)}
                                                        disabled={!formData.team_id || availableCategories.length === 0}
                                                    >
                                                        <SelectTrigger className="w-full bg-slate-50 border-slate-200">
                                                            <SelectValue placeholder={
                                                                !formData.team_id ? "Selecione um time" : 
                                                                availableCategories.length === 0 ? "Sem categorias" : 
                                                                "Selecionar..."
                                                            } />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {availableCategories.map(c => (
                                                                <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <Separator />

                                                <div className="grid gap-1.5">
                                                    <span className="text-muted-foreground text-xs">Reportado por</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                                                            {(item.created_user as any)?.name?.[0]?.toUpperCase() || 'S'}
                                                        </div>
                                                        <span className="font-medium text-slate-900">{(item.created_user as any)?.name || 'Sistema'}</span>
                                                    </div>
                                                </div>

                                                {item.page_url && (
                                                    <>
                                                        <Separator />
                                                        <div className="grid gap-1.5">
                                                            <span className="text-muted-foreground text-xs">URL Afetada</span>
                                                            <a href={item.page_url} target="_blank" className="text-blue-600 hover:underline break-all text-xs font-mono bg-blue-50 p-2 rounded border border-blue-100 block truncate">
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

                {/* CORREÇÃO 3: Footer com flex-none para não ser esmagado */}
                {!loading && item && (
                    <SheetFooter className="flex-none p-4 bg-white border-t mt-auto flex flex-row items-center justify-between sm:justify-between w-full z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <div className="text-xs text-muted-foreground hidden sm:block">
                            Alterações não salvas serão perdidas.
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto justify-end">
                            <Button 
                                variant="ghost" 
                                onClick={() => onOpenChange(false)}
                                disabled={saving}
                            >
                                Cancelar
                            </Button>
                            <Button 
                                onClick={handleSaveChanges} 
                                disabled={saving}
                                className="min-w-[140px]"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Salvar Alterações
                                    </>
                                )}
                            </Button>
                        </div>
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    )
}