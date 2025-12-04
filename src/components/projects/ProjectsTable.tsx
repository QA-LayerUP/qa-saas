'use client'

import Link from 'next/link'
import { Project } from '@/lib/types'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowRight } from 'lucide-react'
import { DeleteProjectButton } from './DeleteProjectButton'

interface ProjectsTableProps {
    projects: Project[]
}

export function ProjectsTable({ projects }: ProjectsTableProps) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'em_qa':
                return <Badge variant="default">Em QA</Badge>
            case 'corrigindo':
                return <Badge variant="destructive">Corrigindo</Badge>
            case 'homologando':
                return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Homologando</Badge>
            case 'finalizado':
                return <Badge variant="secondary">Finalizado</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Criado em</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {projects.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                Nenhum projeto encontrado.
                            </TableCell>
                        </TableRow>
                    ) : (
                        projects.map((project) => (
                            <TableRow key={project.id}>
                                <TableCell className="font-medium">{project.name}</TableCell>
                                <TableCell>{project.client || '-'}</TableCell>
                                <TableCell>{getStatusBadge(project.status)}</TableCell>
                                <TableCell>
                                    {format(new Date(project.created_at), "d 'de' MMM, yyyy", { locale: ptBR })}
                                </TableCell>
                                <TableCell className="text-right flex items-center justify-end gap-2">
                                    <DeleteProjectButton projectId={project.id} />
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href={`/projects/${project.id}/qa`}>
                                            Abrir QA <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
