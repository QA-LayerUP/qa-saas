/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
 'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Loader2 } from 'lucide-react'

interface CreateCategoryModalProps {
    projectId: string
}

interface Team {
    id: string
    name: string
}

export function CreateCategoryModal({ projectId }: CreateCategoryModalProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState('')
    const [teamId, setTeamId] = useState('')
    const [teams, setTeams] = useState<Team[]>([])
    const [loadingTeams, setLoadingTeams] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const { data, error } = await supabase
                    .from('teams')
                    .select('id, name')
                    .eq('project_id', projectId)
                    .order('name')

                if (error) throw error
                setTeams(data || [])
            } catch (err) {
                console.error('Error fetching teams:', err)
            } finally {
                setLoadingTeams(false)
            }
        }

        if (open) fetchTeams()
    }, [open, projectId, supabase])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!teamId) {
            alert('Por favor selecione um time')
            return
        }
        setLoading(true)

        try {
            const { error } = await supabase
                .from('qa_categories')
                .insert([{ project_id: projectId, title, team_id: teamId }])

            if (error) throw error

            setOpen(false)
            setTitle('')
            setTeamId('')
            router.refresh()
        } catch (error: any) {
            // Log detalhado para depuração (mostra objeto completo)
            try {
                console.error('Error creating category:', error, JSON.stringify(error))
            } catch (e) {
                console.error('Error creating category (stringify failed):', error)
            }

            const message = error?.message || (typeof error === 'string' ? error : JSON.stringify(error))
            alert(`Error: ${message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Categoria
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Nova Categoria</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="team" className="text-right">
                                Time
                            </Label>
                            <Select value={teamId} onValueChange={setTeamId}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder={loadingTeams ? 'Carregando times...' : 'Selecione um time'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {teams.map((team) => (
                                        <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                                Título
                            </Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Criar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
