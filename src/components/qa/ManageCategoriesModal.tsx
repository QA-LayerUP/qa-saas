'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Tags, Loader2, Trash2 } from 'lucide-react'
import { QACategory, QAItem, Team } from '@/lib/types'

interface ManageCategoriesModalProps {
    projectId: string
    categories: QACategory[]
    teams: Team[]
    items: QAItem[]
}

function teamName(teams: Team[], teamId: string | null | undefined) {
    if (!teamId) return 'Sem time'
    return teams.find((t) => t.id === teamId)?.name ?? 'Time'
}

export function ManageCategoriesModal({
    projectId,
    categories,
    teams,
    items,
}: ManageCategoriesModalProps) {
    const [open, setOpen] = useState(false)
    const [pendingDelete, setPendingDelete] = useState<QACategory | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const countsByCategory = useMemo(() => {
        const m = new Map<string, number>()
        for (const item of items) {
            m.set(item.category_id, (m.get(item.category_id) ?? 0) + 1)
        }
        return m
    }, [items])

    const sorted = useMemo(() => {
        return [...categories].sort((a, b) => {
            const ta = teamName(teams, a.team_id)
            const tb = teamName(teams, b.team_id)
            if (ta !== tb) return ta.localeCompare(tb)
            return a.title.localeCompare(b.title)
        })
    }, [categories, teams])

    const confirmDelete = async () => {
        if (!pendingDelete) return
        setDeletingId(pendingDelete.id)
        try {
            const { error } = await supabase
                .from('qa_categories')
                .delete()
                .eq('id', pendingDelete.id)
                .eq('project_id', projectId)

            if (error) throw error

            setPendingDelete(null)
            router.refresh()
        } catch (e) {
            console.error(e)
            alert('Não foi possível remover a categoria. Verifique permissões ou itens vinculados.')
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="hover:border-[#7900E5]/30 hover:bg-[#7900E5]/5 hover:text-[#7900E5]"
                    >
                        <Tags className="mr-2 h-4 w-4" />
                        Gerenciar categorias
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-montserrat text-xl font-bold">
                            Categorias do projeto
                        </DialogTitle>
                        <DialogDescription>
                            Remover uma categoria apaga também todos os itens de QA associados a ela.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[min(360px,50vh)] space-y-2 overflow-y-auto py-2">
                        {sorted.length === 0 ? (
                            <p className="py-6 text-center text-sm text-muted-foreground">
                                Nenhuma categoria criada ainda.
                            </p>
                        ) : (
                            sorted.map((cat) => {
                                const n = countsByCategory.get(cat.id) ?? 0
                                return (
                                    <div
                                        key={cat.id}
                                        className="flex items-center gap-2 rounded-lg border border-border bg-card/50 px-3 py-2"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium text-sm">{cat.title}</p>
                                            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                                                <Badge variant="secondary" className="text-[10px] font-normal">
                                                    {teamName(teams, cat.team_id)}
                                                </Badge>
                                                {n > 0 && (
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {n} {n === 1 ? 'item' : 'itens'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                                            disabled={deletingId === cat.id}
                                            onClick={() => setPendingDelete(cat)}
                                            aria-label={`Remover categoria ${cat.title}`}
                                        >
                                            {deletingId === cat.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog
                open={!!pendingDelete}
                onOpenChange={(o) => {
                    if (!o) setPendingDelete(null)
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remover categoria?</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-2 text-muted-foreground text-sm">
                                <p>
                                    A categoria{' '}
                                    <strong className="text-foreground">{pendingDelete?.title}</strong> será
                                    excluída permanentemente.
                                </p>
                                {pendingDelete && (countsByCategory.get(pendingDelete.id) ?? 0) > 0 ? (
                                    <p>
                                        Isso exclui também{' '}
                                        <strong className="text-foreground">
                                            {countsByCategory.get(pendingDelete.id)}{' '}
                                            {countsByCategory.get(pendingDelete.id)! === 1
                                                ? 'item de QA'
                                                : 'itens de QA'}
                                        </strong>{' '}
                                        vinculados a ela.
                                    </p>
                                ) : (
                                    <p>Não há itens de QA nesta categoria.</p>
                                )}
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={!!deletingId}>Cancelar</AlertDialogCancel>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={!!deletingId}
                            onClick={() => void confirmDelete()}
                        >
                            {deletingId ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Removendo…
                                </>
                            ) : (
                                'Remover'
                            )}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
