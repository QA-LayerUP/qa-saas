/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation' // Importante para atualizar a lista atrás
import { createClient } from '@/lib/supabase/client'
import { 
    Sheet, 
    SheetContent, 
    SheetTitle, 
    SheetHeader, 
    SheetDescription,
    SheetFooter // Importado para o botão fixo
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, Clock, CheckCircle2, Loader2, Maximize2, Hash, Users, Tag, Save } from 'lucide-react'
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
    const router = useRouter()
    
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    
    // Dados Originais (para resetar ou comparar)
    const [item, setItem] = useState<any>(null)
    
    // Estado do Formulário (Edição Local)
    const [formData, setFormData] = useState({
        status: '',
        priority: '',
        team_id: '',
        category_id: ''
    })

    // Dados Relacionados (Listas)
    const [evidences, setEvidences] = useState<any[]>([])
    const [comments, setComments] = useState<any[]>([])
    const [currentUserId, setCurrentUserId] = useState<string>('')
    const [projectTeams, setProjectTeams] = useState<any[]>([])
    const [projectCategories, setProjectCategories] = useState<any[]>([])

    useEffect(() => {
        if (open && itemId) {
            fetchData()
        } else {
            setItem(null)
            setFormData({ status: '', priority: '', team_id: '', category_id: '' })
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, itemId])

    async function fetchData() {
        if (!itemId) return
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            setCurrentUserId(user?.id || '')

            // 1. Fetch Item Details
            const { data: itemData, error: itemError } = await supabase
                .from('qa_items')
                .select(`*, created_user:users!created_by(name, email), category:qa_categories(id, title), team:teams(id, name)`)
                .eq('id', itemId)
                .single()

            if (itemError) throw itemError
            
            setItem(itemData)
            
            // Inicializa o formulário com os dados atuais do banco
            setFormData({
                status: itemData.status,
                priority: itemData.priority,
                team_id: itemData.team_id || '',
                category_id: itemData.category_id || ''
            })

            // 2. Fetch Listas
            const [teamsRes, catsRes, evidencesRes, commentsRes] = await Promise.all([
                supabase.from('project_teams').select('team:teams(id, name)').eq('project_id', projectId),
                supabase.from('qa_categories').select('id, title, team_id').eq('project_id', projectId),
                supabase.from('qa_evidences').select('*').eq('qa_item_id', itemId).order('created_at', { ascending: false }),
                supabase.from('qa_comments').select(`*, user:users(name, email)`).eq('qa_item_id', itemId).order('created_at')
            ])

            setProjectTeams(teamsRes.data?.map((pt: any) => pt.team) || [])
            setProjectCategories(catsRes.data || [])
            setEvidences(evidencesRes.data || [])
            setComments(commentsRes.data || [])

        } catch (error) {
            console.error("Erro ao carregar:", error)
        } finally {
            setLoading(false)
        }
    }

    // --- MANIPULAÇÃO DO FORMULÁRIO LOCAL ---

    const handleChange = (field: string, value: string) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value }
            
            // Regra de Negócio: Se mudar o time, reseta a categoria
            if (field === 'team_id') {
                newData.category_id = ''
            }
            return newData
        })
    }

    // --- SALVAR E FECHAR ---

    const handleSaveChanges = async () => {
        setSaving(true)
        try {
            // Prepara o payload (converte strings vazias para null se necessário)
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

            // Sucesso!
            onOpenChange(false) // Fecha o modal
            router.refresh() // Atualiza a página de listagem atrás

        } catch (error) {
            console.error('Erro ao salvar:', error)
            alert('Erro ao salvar alterações.')
        } finally {
            setSaving(false)
        }
    }

    // Filtra categorias baseadas no time selecionado (NO FORMULÁRIO, não no item salvo)
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
            default: return <AlertCircle className="h-4 w-4" />
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-xl md:max-w-4xl p-0 gap-0 bg-slate-50 border-l shadow-2xl flex flex-col h-full">
                
                <SheetHeader className="sr-only">
                    <SheetTitle>Detalhes da Tarefa</SheetTitle>
                    <SheetDescription>Edição e visualização do item</SheetDescription>
                </SheetHeader>

                {/* SCROLL AREA (CONTEÚDO) */}
                <ScrollArea className="flex-1">
                    <div className="p-6">
                        {loading || !item ? (
                            <div className="flex flex-col items-center justify-center h-[50vh] gap-2">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-muted-foreground">Carregando detalhes...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-6 pb-20"> {/* pb-20 para não esconder conteúdo atrás do footer */}
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
                                            {/* SELETOR DE STATUS (Edita Local) */}
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
                                                </SelectContent>
                                            </Select>

                                            {/* SELETOR DE PRIORIDADE (Edita Local) */}
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
                                    {/* COLUNA ESQUERDA (Principal) */}
                                    <div className="md:col-span-2 space-y-6">
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
                                            <CommentSection
                                                itemId={item.id}
                                                comments={comments}
                                                currentUserId={currentUserId}
                                            />
                                        </div>
                                    </div>

                                    {/* COLUNA DIREITA (Controles de Edição) */}
                                    <div className="space-y-6">
                                        <Card className="shadow-sm bg-white border-none md:border">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                                                    Classificação
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-5 text-sm">
                                                
                                                {/* SELETOR DE TIME (Edita Local) */}
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

                                                {/* SELETOR DE CATEGORIA (Edita Local) */}
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

                                                {/* CAMPO ATRIBUÍDO REMOVIDO CONFORME SOLICITADO */}

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
                                                            <a href={item.page_url} target="_blank" className="text-blue-600 hover:underline break-all text-xs font-mono bg-blue-50 p-1 rounded border border-blue-100 block truncate">
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

                {/* FOOTER FIXO COM BOTÃO DE SALVAR */}
                {!loading && item && (
                    <SheetFooter className="p-4 bg-white border-t mt-auto sm:justify-between items-center">
                        <div className="text-xs text-muted-foreground hidden sm:block">
                            Alterações pendentes serão perdidas se fechar.
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
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