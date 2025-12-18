/* eslint-disable @typescript-eslint/no-unused-vars */
import { createClient } from '@/lib/supabase/server'
import { EvidenceUpload } from '@/components/qa/EvidenceUpload'
import { EvidencesDisplay } from '@/components/qa/EvidencesDisplay'
import { CommentSection } from '@/components/qa/CommentSection'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AlertCircle, Clock, CheckCircle2, FileText, Image as ImageIcon, Film } from 'lucide-react'
import Link from 'next/link'

export default async function QAItemPage({ params }: { params: Promise<{ id: string, itemId: string }> }) {
    const supabase = await createClient()
    const { id: projectId, itemId } = await params

    // Fetch item details
    const { data: item } = await supabase
        .from('qa_items')
        .select(`
      *,
      assigned_user:users!assigned_to(name, email),
      created_user:users!created_by(name, email),
      category:qa_categories(title)
    `)
        .eq('id', itemId)
        .single()

    // Fetch evidences
    const { data: evidences } = await supabase
        .from('qa_evidences')
        .select('*')
        .eq('qa_item_id', itemId)
        .order('created_at', { ascending: false })

    // Fetch comments (mocked for now as table might not exist yet, but code assumes it does)
    // In a real scenario we'd fetch from qa_comments
    const { data: comments } = await supabase
        .from('qa_comments')
        .select(`
      *,
      user:users(name, email)
    `)
        .eq('qa_item_id', itemId)
        .order('created_at')

    const { data: { user } } = await supabase.auth.getUser()

    if (!item) return <div>Item não encontrado</div>

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
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <Link 
                        href={`/projects/${projectId}/qa`} 
                        className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-[#7900E5]"
                    >
                        &larr; Voltar para QA
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-6 rounded-full bg-linear-to-r from-[#7900E5] to-[#7900E5]" />
                        <span className="font-mono text-xs text-muted-foreground">#{item.id.slice(0, 8)}</span>
                    </div>
                    <h1 className="font-montserrat mt-2 text-2xl font-bold tracking-tight">
                        {item.title}
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    <Badge variant="outline" className="border-border uppercase">{item.status.replace('_', ' ')}</Badge>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-6 md:col-span-2">
                    <Card className="rounded-xl border-border">
                        <CardHeader>
                            <CardTitle className="font-montserrat text-base font-semibold">Descrição</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">{item.description || 'Sem descrição.'}</p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border-border">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="font-montserrat text-base font-semibold">Evidências</CardTitle>
                            <EvidenceUpload itemId={itemId} />
                        </CardHeader>
                        <CardContent>
                            <EvidencesDisplay evidences={evidences} />
                        </CardContent>
                    </Card>

                    <CommentSection
                        itemId={itemId}
                        comments={comments || []}
                        currentUserId={user?.id || ''}
                    />
                </div>

                <div className="space-y-6">
                    <Card className="rounded-xl border-border">
                        <CardHeader>
                            <CardTitle className="font-montserrat text-sm font-semibold uppercase tracking-wider text-muted-foreground">Detalhes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Categoria</span>
                                <span className="font-medium">{item.category?.title}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Prioridade</span>
                                <Badge 
                                    variant="outline"
                                    className={`uppercase ${
                                        item.priority === 'alta' ? 'border-[#7900E5]/30 bg-[#7900E5]/10 text-[#7900E5]' : 
                                        item.priority === 'media' ? 'border-[#ffcc00]/30 bg-[#ffcc00]/10 text-[#ffcc00]' :
                                        'border-[#7900E5]/30 bg-[#7900E5]/10 text-[#7900E5]'
                                    }`}
                                >
                                    {item.priority}
                                </Badge>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Atribuído a</span>
                                <span className="font-medium">{item.assigned_user?.name || 'Não atribuído'}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Criado por</span>
                                <span className="font-medium">{item.created_user?.name || 'Sistema'}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Criado em</span>
                                <span>{format(new Date(item.created_at), "d MMM, HH:mm", { locale: ptBR })}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
