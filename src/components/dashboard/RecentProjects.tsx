import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { Project } from '@/lib/types'
import { PROJECT_STATUS_BADGE, PROJECT_STATUS_LABELS, normalizeProjectStatus } from '@/lib/project-status'
import { cn } from '@/lib/utils'

interface RecentProjectsProps {
    projects: Project[]
}

export function RecentProjects({ projects }: RecentProjectsProps) {
    return (
        <div className="space-y-3">
            {projects.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Nenhum projeto encontrado.</p>
            ) : (
                <>
                    {projects.map((project) => (
                        <Link
                            key={project.id}
                            href={`/projects/${project.id}/qa`}
                            className="group lu-card flex items-center justify-between p-4 hover:border-roxo/40"
                        >
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-montserrat text-sm font-semibold leading-none text-foreground">
                                        {project.name}
                                    </p>
                                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                                </div>
                                <p className="text-xs text-muted-foreground">{project.client || 'Sem cliente'}</p>
                            </div>
                            <Badge
                                className={cn(
                                    PROJECT_STATUS_BADGE[normalizeProjectStatus(project.status)],
                                    'hover:opacity-90',
                                )}
                            >
                                {PROJECT_STATUS_LABELS[normalizeProjectStatus(project.status)]}
                            </Badge>
                        </Link>
                    ))}
                    <Button variant="ghost" size="sm" asChild className="mt-2 w-full text-xs">
                        <Link href="/projects" className="gap-1 text-roxo hover:text-rosa dark:text-amarelo">
                            Ver todos os projetos <ArrowRight className="h-3 w-3" />
                        </Link>
                    </Button>
                </>
            )}
        </div>
    )
}