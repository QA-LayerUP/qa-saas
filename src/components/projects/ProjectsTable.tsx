'use client'

import Link from 'next/link'
import { Project } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowRight, ExternalLink, Calendar, User } from 'lucide-react'
import { DeleteProjectButton } from './DeleteProjectButton'

interface ProjectsTableProps {
    projects: Project[]
}

export function ProjectsTable({ projects }: ProjectsTableProps) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'em_qa':
                return <Badge className="bg-[#7900E5]/10 text-[#7900E5] hover:bg-[#7900E5]/20">Em QA</Badge>
            case 'corrigindo':
                return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">Corrigindo</Badge>
            case 'homologando':
                return <Badge className="bg-[#ffcc00]/10 text-[#ffcc00] hover:bg-[#ffcc00]/20">Homologando</Badge>
            case 'finalizado':
                return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Finalizado</Badge>
            case 'em_desenvolvimento':
                return <Badge className="bg-[#7900E5]/10 text-[#7900E5] hover:bg-[#7900E5]/20">Em Desenvolvimento</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <div className="space-y-3">
            {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
                    <div className="mb-4 rounded-full bg-muted/50 p-4">
                        <ExternalLink className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-montserrat text-lg font-semibold">Nenhum projeto encontrado</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Crie seu primeiro projeto para começar.
                    </p>
                </div>
            ) : (
                projects.map((project) => (
                    <div
                        key={project.id}
                        className="group relative overflow-hidden rounded-xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur-sm transition-all hover:border-[#7900E5]/30 hover:bg-card hover:shadow-md"
                    >
                        {/* Barra colorida lateral */}
                        <div className="absolute left-0 top-0 h-full w-1 bg-[#7900E5] opacity-0 transition-opacity group-hover:opacity-100" />
                        
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            {/* Info Principal */}
                            <div className="flex-1 space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h3 className="font-montserrat text-lg font-semibold text-foreground">
                                            {project.name}
                                        </h3>
                                        {project.client && (
                                            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <User className="h-3 w-3" />
                                                {project.client}
                                            </div>
                                        )}
                                    </div>
                                    {getStatusBadge(project.status)}
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-3 w-3" />
                                        Criado em {format(new Date(project.created_at), "d 'de' MMM, yyyy", { locale: ptBR })}
                                    </div>
                                    {project.site_url && (
                                        <a
                                            href={project.site_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-[#7900E5] hover:underline dark:text-white"
                                        >
                                            <ExternalLink className="h-3 w-3" />
                                            Ver site
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Ações */}
                            <div className="flex items-center gap-2">
                                <DeleteProjectButton projectId={project.id} />
                                <Button 
                                    asChild 
                                    className="bg-[#7900E5] text-xs font-semibold uppercase tracking-wide text-white hover:bg-[#ff28c6]"
                                >
                                    <Link href={`/projects/${project.id}/qa`} className="flex items-center gap-1.5">
                                        Abrir QA
                                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}
