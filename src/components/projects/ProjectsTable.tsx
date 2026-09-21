'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { Calendar, ExternalLink, Figma, Search, User } from 'lucide-react'
import { Project } from '@/lib/types'
import {
    PROJECT_STATUSES,
    PROJECT_STATUS_BADGE,
    PROJECT_STATUS_LABELS,
    normalizeProjectStatus,
    type ProjectStatus,
} from '@/lib/project-status'
import { createClient } from '@/lib/supabase/client'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { DeleteProjectButton } from './DeleteProjectButton'
import { EditProjectModal } from './ProjectFormModal'
import { cn } from '@/lib/utils'

interface ProjectsTableProps {
    projects: Project[]
}

type StatusFilter = 'all' | ProjectStatus

export function ProjectsTable({ projects }: ProjectsTableProps) {
    const router = useRouter()
    const supabase = createClient()
    const [items, setItems] = useState(projects)
    const [query, setQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('em_andamento')
    const [updatingId, setUpdatingId] = useState<string | null>(null)

    useEffect(() => {
        setItems(projects)
    }, [projects])

    const filtered = useMemo(() => {
        const term = query.trim().toLowerCase()
        return items.filter((project) => {
            const status = normalizeProjectStatus(project.status)
            const matchesStatus = statusFilter === 'all' || status === statusFilter
            const haystack = `${project.name} ${project.client ?? ''}`.toLowerCase()
            const matchesQuery = !term || haystack.includes(term)
            return matchesStatus && matchesQuery
        })
    }, [items, query, statusFilter])

    async function updateStatus(projectId: string, status: ProjectStatus) {
        const previous = items.find((item) => item.id === projectId)?.status
        setUpdatingId(projectId)
        setItems((current) =>
            current.map((item) => (item.id === projectId ? { ...item, status } : item)),
        )

        const { error } = await supabase.from('projects').update({ status }).eq('id', projectId)

        setUpdatingId(null)

        if (error) {
            setItems((current) =>
                current.map((item) =>
                    item.id === projectId ? { ...item, status: previous ?? item.status } : item,
                ),
            )
            toast.error('Não foi possível atualizar o status.', {
                description: 'Rode o SQL de migration_project_status.sql no Supabase e tente de novo.',
            })
            return
        }

        toast.success('Status atualizado.')
        router.refresh()
    }

    return (
        <div>
            <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
                <label className="lu-card flex flex-1 items-center gap-3 px-4 py-3">
                    <Search size={16} className="text-foreground/65" />
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Buscar por projeto ou cliente"
                        className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/65"
                    />
                </label>
                <div
                    className="flex flex-wrap gap-1 rounded-xl border border-border p-1"
                    role="group"
                    aria-label="Filtrar por status"
                >
                    {PROJECT_STATUSES.map((status) => (
                        <button
                            key={status}
                            type="button"
                            onClick={() => setStatusFilter(status)}
                            className={`rounded-lg px-3 py-2 text-[11px] font-semibold tracking-[0.12em] uppercase ${
                                statusFilter === status ? 'bg-roxo text-white' : 'text-foreground/65 hover:text-foreground'
                            }`}
                        >
                            {PROJECT_STATUS_LABELS[status]}
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => setStatusFilter('all')}
                        className={`rounded-lg px-3 py-2 text-[11px] font-semibold tracking-[0.12em] uppercase ${
                            statusFilter === 'all' ? 'bg-roxo text-white' : 'text-foreground/65 hover:text-foreground'
                        }`}
                    >
                        Todos
                    </button>
                </div>
            </div>

            <p className="mb-4 text-xs tracking-widest text-foreground/65 uppercase">
                {filtered.length} {filtered.length === 1 ? 'projeto' : 'projetos'}
            </p>

            <div className="space-y-3">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-foreground/5 py-16 text-center">
                        <div className="mb-4 rounded-full bg-muted/50 p-4">
                            <ExternalLink className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-montserrat text-lg font-semibold">Nenhum projeto encontrado</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {items.length === 0
                                ? 'Crie seu primeiro projeto para começar.'
                                : 'Ajuste a busca ou o filtro de status.'}
                        </p>
                    </div>
                ) : (
                    filtered.map((project, index) => {
                        const status = normalizeProjectStatus(project.status)
                        const accentBar = ["bg-roxo", "bg-rosa", "bg-amarelo"][index % 3]
                        return (
                            <Link
                                key={project.id}
                                href={`/projects/${project.id}/qa`}
                                className="lu-card group flex items-center gap-4 p-4"
                            >
                                <div className={`h-10 w-1 shrink-0 ${accentBar}`} />

                                <div className="min-w-0 flex-1">
                                    <h3 className="font-montserrat text-1xl uppercase font-semibold group-hover:text-roxo dark:group-hover:text-amarelo">
                                        {project.name}
                                    </h3>
                                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                        {project.client && (
                                            <span className="flex items-center gap-1.5">
                                                <User className="h-3 w-3" />
                                                {project.client}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(project.created_at), "d 'de' MMM, yyyy", { locale: ptBR })}
                                        </span>
                                        {project.site_url && (
                                            <span
                                                role="link"
                                                tabIndex={0}
                                                onClick={(event) => {
                                                    event.preventDefault()
                                                    event.stopPropagation()
                                                    window.open(project.site_url!, '_blank', 'noopener,noreferrer')
                                                }}
                                                onKeyDown={(event) => {
                                                    if (event.key !== 'Enter' && event.key !== ' ') return
                                                    event.preventDefault()
                                                    event.stopPropagation()
                                                    window.open(project.site_url!, '_blank', 'noopener,noreferrer')
                                                }}
                                                className="flex items-center gap-1 text-roxo hover:underline dark:text-amarelo"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                                Ver site
                                            </span>
                                        )}
                                        {project.figma_url && (
                                            <span
                                                role="link"
                                                tabIndex={0}
                                                onClick={(event) => {
                                                    event.preventDefault()
                                                    event.stopPropagation()
                                                    window.open(project.figma_url!, '_blank', 'noopener,noreferrer')
                                                }}
                                                onKeyDown={(event) => {
                                                    if (event.key !== 'Enter' && event.key !== ' ') return
                                                    event.preventDefault()
                                                    event.stopPropagation()
                                                    window.open(project.figma_url!, '_blank', 'noopener,noreferrer')
                                                }}
                                                className="flex items-center gap-1 text-roxo hover:underline dark:text-amarelo"
                                            >
                                                <Figma className="h-3 w-3" />
                                                Ver Figma
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div
                                    className="flex shrink-0 items-center gap-2"
                                    onClick={(event) => {
                                        event.preventDefault()
                                        event.stopPropagation()
                                    }}
                                >
                                    <Select
                                        value={status}
                                        disabled={updatingId === project.id}
                                        onValueChange={(value) => updateStatus(project.id, value as ProjectStatus)}
                                    >
                                        <SelectTrigger
                                            className={cn(
                                                'h-9 min-w-[160px] text-[10px] font-semibold tracking-widest uppercase',
                                                PROJECT_STATUS_BADGE[status],
                                            )}
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PROJECT_STATUSES.map((option) => (
                                                <SelectItem key={option} value={option}>
                                                    {PROJECT_STATUS_LABELS[option]}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <EditProjectModal project={project} />
                                    <DeleteProjectButton projectId={project.id} />
                                </div>
                            </Link>
                        )
                    })
                )}
            </div>
        </div>
    )
}
