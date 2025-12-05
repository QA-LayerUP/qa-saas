/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Link2, Loader2, PlusCircle } from 'lucide-react'
import { Team } from '@/lib/types'

interface LinkTeamModalProps {
    projectId: string
    existingTeamIds: string[] // IDs dos times já vinculados para não mostrar na lista
}

export function LinkTeamModal({ projectId, existingTeamIds }: LinkTeamModalProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [allTeams, setAllTeams] = useState<Team[]>([])
    const [selectedTeamId, setSelectedTeamId] = useState('')
    
    const router = useRouter()
    const supabase = createClient()

    // Buscar todos os times disponíveis na organização
    useEffect(() => {
        if (open) {
            const fetchTeams = async () => {
                const { data } = await supabase.from('teams').select('*').order('name')
                if (data) setAllTeams(data)
            }
            fetchTeams()
        }
    }, [open, supabase])

    // Filtrar apenas times que NÃO estão no projeto ainda
    const availableTeams = allTeams.filter(t => !existingTeamIds.includes(t.id))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedTeamId) return
        setLoading(true)

        try {
            const { error } = await supabase
                .from('project_teams')
                .insert([{ 
                    project_id: projectId,
                    team_id: selectedTeamId
                }])

            if (error) throw error

            setOpen(false)
            setSelectedTeamId('')
            router.refresh()
        } catch (error) {
            console.error('Erro ao vincular time:', error)
            alert('Erro ao vincular time.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Link2 className="h-4 w-4" />
                    Vincular Time
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Vincular Time ao Projeto</DialogTitle>
                        <DialogDescription>
                            Escolha um Squad existente para atuar neste projeto.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="team" className="text-right">
                                Time
                            </Label>
                            <Select value={selectedTeamId} onValueChange={setSelectedTeamId} required>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableTeams.length === 0 ? (
                                        <SelectItem value="none" disabled>Todos os times já vinculados</SelectItem>
                                    ) : (
                                        availableTeams.map(t => (
                                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        {availableTeams.length === 0 && (
                            <div className="text-xs text-muted-foreground text-center">
                                Precisa criar um novo time? Vá em &rdquo;Times&rdquo; no menu lateral.
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading || !selectedTeamId}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Vincular
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}