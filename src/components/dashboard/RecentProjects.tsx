import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { Project } from '@/lib/types'

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
                            className="group flex items-center justify-between rounded-lg border border-border bg-card/50 p-4 transition-all hover:border-[#7900E5]/30 hover:bg-[#7900E5]/5 hover:shadow-md"
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
                                variant={
                                    project.status === 'finalizado' ? 'secondary' :
                                    project.status === 'homologando' ? 'outline' : 'default'
                                }
                                className={
                                    project.status === 'homologando'
                                        ? 'bg-[#ffcc00]/10 text-[#ffcc00] hover:bg-[#ffcc00]/20'
                                        : project.status === 'em_qa'
                                            ? 'bg-[#7900E5]/10 text-[#7900E5] hover:bg-[#7900E5]/20'
                                            : project.status === 'corrigindo'
                                                ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                                                : ''
                                }
                            >
                                {project.status.replace('_', ' ')}
                            </Badge>
                        </Link>
                    ))}
                    <Button variant="ghost" size="sm" asChild className="mt-2 w-full text-xs">
                        <Link href="/projects" className="gap-1 text-[#7900E5] hover:text-[#ff28c6]">
                            Ver todos os projetos <ArrowRight className="h-3 w-3" />
                        </Link>
                    </Button>
                </>
            )}
        </div>
    )
}