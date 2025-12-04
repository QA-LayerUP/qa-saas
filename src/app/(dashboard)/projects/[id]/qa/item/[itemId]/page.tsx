import { createClient } from '@/lib/supabase/server'
import { EvidenceUpload } from '@/components/qa/EvidenceUpload'
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
        <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/projects/${projectId}/qa`} className="text-muted-foreground hover:text-foreground">
                        &larr; Voltar
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <span className="text-muted-foreground">#{item.id.slice(0, 8)}</span>
                        {item.title}
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    <Badge variant="outline" className="uppercase">{item.status.replace('_', ' ')}</Badge>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Descrição</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap">{item.description || 'Sem descrição.'}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Evidências</CardTitle>
                            <EvidenceUpload itemId={itemId} />
                        </CardHeader>
                        <CardContent>
                            {evidences && evidences.length > 0 ? (
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                    {evidences.map((evidence) => (
                                        <a
                                            key={evidence.id}
                                            href={evidence.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group relative aspect-video overflow-hidden rounded-md border bg-muted"
                                        >
                                            {evidence.file_type.startsWith('image/') ? (
                                                <img
                                                    src={evidence.file_url}
                                                    alt="Evidence"
                                                    className="object-cover w-full h-full transition-transform group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full">
                                                    <FileText className="h-8 w-8 text-muted-foreground" />
                                                </div>
                                            )}
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Nenhuma evidência anexada.</p>
                            )}
                        </CardContent>
                    </Card>

                    <CommentSection
                        itemId={itemId}
                        comments={comments || []}
                        currentUserId={user?.id || ''}
                    />
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Detalhes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Categoria</span>
                                <span className="font-medium">{item.category?.title}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Prioridade</span>
                                <Badge variant={item.priority === 'alta' ? 'destructive' : 'secondary'}>
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
