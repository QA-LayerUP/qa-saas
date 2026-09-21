'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Link2, Loader2 } from 'lucide-react'
import { Team } from '@/lib/types'
import { cn } from '@/lib/utils'

interface LinkTeamModalProps {
    projectId: string
    existingTeamIds: string[]
}

export function LinkTeamModal({ projectId, existingTeamIds }: LinkTeamModalProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(false)
    const [allTeams, setAllTeams] = useState<Team[]>([])
    const [selectedIds, setSelectedIds] = useState<string[]>(existingTeamIds)

    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        if (!open) return

        setSelectedIds(existingTeamIds)
        setFetching(true)

        const fetchTeams = async () => {
            const { data, error } = await supabase.from('teams').select('*').order('name')
            if (error) {
                toast.error('Não foi possível carregar os times.')
            } else if (data) {
                setAllTeams(data)
            }
            setFetching(false)
        }

        fetchTeams()
    }, [open, existingTeamIds, supabase])

    const existingSet = useMemo(() => new Set(existingTeamIds), [existingTeamIds])
    const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])

    const toAdd = selectedIds.filter((id) => !existingSet.has(id))
    const toRemove = existingTeamIds.filter((id) => !selectedSet.has(id))
    const hasChanges = toAdd.length > 0 || toRemove.length > 0

    function toggleTeam(teamId: string) {
        setSelectedIds((current) =>
            current.includes(teamId)
                ? current.filter((id) => id !== teamId)
                : [...current, teamId],
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!hasChanges) {
            setOpen(false)
            return
        }

        setLoading(true)

        try {
            if (toAdd.length > 0) {
                const { error } = await supabase.from('project_teams').insert(
                    toAdd.map((teamId) => ({
                        project_id: projectId,
                        team_id: teamId,
                    })),
                )
                if (error) throw error
            }

            if (toRemove.length > 0) {
                const { error } = await supabase
                    .from('project_teams')
                    .delete()
                    .eq('project_id', projectId)
                    .in('team_id', toRemove)
                if (error) throw error
            }

            toast.success('Times do projeto atualizados.')
            setOpen(false)
            router.refresh()
        } catch (error) {
            console.error('Erro ao vincular times:', error)
            toast.error('Não foi possível atualizar os times do projeto.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-transparent border border-roxo font-montserrat text-[10px] font-semibold uppercase tracking-[0.14em] text-roxo hover:bg-roxo hover:text-white">
                    <Link2 className="h-4 w-4" />
                    Vincular Time
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Vincular times ao projeto</DialogTitle>
                        <DialogDescription>
                            Marque ou desmarque os squads que vão atuar neste projeto.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        {fetching ? (
                            <div className="flex items-center justify-center py-10 text-muted-foreground">
                                <Loader2 className="h-5 w-5 animate-spin" />
                            </div>
                        ) : allTeams.length === 0 ? (
                            <p className="py-6 text-center text-sm text-muted-foreground">
                                Nenhum time cadastrado. Crie um em Times no menu lateral.
                            </p>
                        ) : (
                            <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
                                {allTeams.map((team) => {
                                    const checked = selectedSet.has(team.id)
                                    return (
                                        <label
                                            key={team.id}
                                            className={cn(
                                                'flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors',
                                                checked
                                                    ? 'border-roxo/40 bg-roxo/10'
                                                    : 'border-transparent hover:bg-foreground/5',
                                            )}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => toggleTeam(team.id)}
                                                className="mt-0.5 size-4 shrink-0 accent-roxo"
                                            />
                                            <span className="min-w-0">
                                                <span className="block text-sm font-medium text-foreground">
                                                    {team.name}
                                                </span>
                                                {team.description && (
                                                    <span className="mt-0.5 block text-xs text-muted-foreground">
                                                        {team.description}
                                                    </span>
                                                )}
                                            </span>
                                        </label>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading || fetching || allTeams.length === 0 || !hasChanges}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
