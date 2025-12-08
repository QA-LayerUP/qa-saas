import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { Project } from '@/lib/types'

interface RecentProjectsProps {
    projects: Project[]
}

export function RecentProjects({ projects }: RecentProjectsProps) {
    return (
        <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Projetos Recentes</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/projects" className="gap-1">
                        Ver todos <ArrowRight className="h-4 w-4" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {projects.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhum projeto encontrado.</p>
                    ) : (
                        projects.map((project) => (
                            <Link
                                key={project.id}
                                href={`/projects/${project.id}/qa`}
                                className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                            >
                                <div className="space-y-1">
                                    <p className="font-medium leading-none">{project.name}</p>
                                    <p className="text-sm text-muted-foreground">{project.client || 'Sem cliente'}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Badge variant={
                                        project.status === 'finalizado' ? 'secondary' :
                                            project.status === 'homologando' ? 'outline' : 'default'
                                    }>
                                        {project.status.replace('_', ' ')}
                                    </Badge>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}