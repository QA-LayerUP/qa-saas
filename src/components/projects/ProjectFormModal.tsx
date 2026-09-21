'use client'

import { useEffect, useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Loader2, Sparkles, Building2, Link as LinkIcon, Figma, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { Project } from '@/lib/types'

type ProjectFormModalProps = {
    project?: Project
    trigger?: React.ReactNode
}

export function ProjectFormModal({ project, trigger }: ProjectFormModalProps) {
    const isEdit = Boolean(project)
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState(project?.name ?? '')
    const [client, setClient] = useState(project?.client ?? '')
    const [siteUrl, setSiteUrl] = useState(project?.site_url ?? '')
    const [figmaUrl, setFigmaUrl] = useState(project?.figma_url ?? '')
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        if (!open) return
        setName(project?.name ?? '')
        setClient(project?.client ?? '')
        setSiteUrl(project?.site_url ?? '')
        setFigmaUrl(project?.figma_url ?? '')
    }, [open, project])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const payload = {
                name: name.trim(),
                client: client.trim() || null,
                site_url: siteUrl.trim() || null,
                figma_url: figmaUrl.trim() || null,
            }

            if (isEdit && project) {
                let { error } = await supabase.from('projects').update(payload).eq('id', project.id)

                if (error && /figma_url/i.test(error.message || '')) {
                    const { figma_url: _figmaUrl, ...withoutFigma } = payload
                    const retry = await supabase.from('projects').update(withoutFigma).eq('id', project.id)
                    error = retry.error
                    if (!error) {
                        toast.warning('Projeto atualizado, mas o link do Figma não foi salvo.', {
                            description: 'Rode o SQL de migration_figma_url.sql no Supabase e tente de novo.',
                        })
                    }
                }

                if (error) throw error
                toast.success('Projeto atualizado.')
            } else {
                const insertPayload = { ...payload, status: 'em_andamento' }
                let { error } = await supabase.from('projects').insert([insertPayload])

                if (error) {
                    const { figma_url: _figmaUrl, ...withoutFigma } = insertPayload
                    const missingFigmaColumn = /figma_url/i.test(error.message || '')
                    const retry = await supabase
                        .from('projects')
                        .insert([missingFigmaColumn ? withoutFigma : { ...insertPayload, status: 'em_qa' }])
                    error = retry.error

                    if (error && missingFigmaColumn) {
                        const fallback = await supabase
                            .from('projects')
                            .insert([{ ...withoutFigma, status: 'em_qa' }])
                        error = fallback.error
                    }

                    if (!error && missingFigmaColumn) {
                        toast.warning('Projeto criado, mas o link do Figma não foi salvo.', {
                            description: 'Rode o SQL de migration_figma_url.sql no Supabase e cadastre o link de novo.',
                        })
                    }
                }

                if (error) throw error
                toast.success('Projeto criado.')
            }

            setOpen(false)
            router.refresh()
        } catch (error) {
            console.error('Error saving project:', error)
            toast.error(isEdit ? 'Não foi possível atualizar o projeto.' : 'Não foi possível criar o projeto.')
        } finally {
            setLoading(false)
        }
    }

    const defaultTrigger = isEdit ? (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-[#7900E5]/10 hover:text-[#7900E5]"
            aria-label="Editar projeto"
        >
            <Pencil className="h-4 w-4" />
        </Button>
    ) : (
        <Button className="bg-roxo border border-roxo font-montserrat text-[10px] font-semibold uppercase tracking-[0.14em] text-white hover:bg-rosa">
            <Plus className="mr-2 h-4 w-4" />
            Novo Projeto
        </Button>
    )

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? defaultTrigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-[#7900E5]/10 p-2">
                                {isEdit ? (
                                    <Pencil className="h-5 w-5 text-[#7900E5]" />
                                ) : (
                                    <Sparkles className="h-5 w-5 text-[#7900E5]" />
                                )}
                            </div>
                            <div>
                                <DialogTitle className="font-montserrat text-lg font-bold">
                                    {isEdit ? 'Editar projeto' : 'Criar novo projeto'}
                                </DialogTitle>
                                <DialogDescription className="text-xs">
                                    {isEdit
                                        ? 'Atualize nome, cliente e os links do projeto.'
                                        : 'Adicione um novo projeto para começar o QA.'}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="project-name" className="text-xs font-medium">
                                Nome do Projeto
                            </Label>
                            <div className="relative">
                                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-muted-foreground">
                                    <Sparkles className="h-4 w-4" />
                                </span>
                                <Input
                                    id="project-name"
                                    placeholder="Ex: Sistema de Gestão"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="pl-9 text-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="project-client" className="text-xs font-medium">
                                Cliente
                            </Label>
                            <div className="relative">
                                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-muted-foreground">
                                    <Building2 className="h-4 w-4" />
                                </span>
                                <Input
                                    id="project-client"
                                    placeholder="Ex: Empresa XYZ"
                                    value={client}
                                    onChange={(e) => setClient(e.target.value)}
                                    className="pl-9 text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="project-site-url" className="text-xs font-medium">
                                URL do Site (opcional)
                            </Label>
                            <div className="relative">
                                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-muted-foreground">
                                    <LinkIcon className="h-4 w-4" />
                                </span>
                                <Input
                                    id="project-site-url"
                                    type="url"
                                    placeholder="https://exemplo.com"
                                    value={siteUrl}
                                    onChange={(e) => setSiteUrl(e.target.value)}
                                    className="pl-9 text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="project-figma-url" className="text-xs font-medium">
                                URL do Figma (opcional)
                            </Label>
                            <div className="relative">
                                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-muted-foreground">
                                    <Figma className="h-4 w-4" />
                                </span>
                                <Input
                                    id="project-figma-url"
                                    type="url"
                                    placeholder="https://www.figma.com/design/..."
                                    value={figmaUrl}
                                    onChange={(e) => setFigmaUrl(e.target.value)}
                                    className="pl-9 text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-[#7900E5] font-montserrat text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#ff28c6]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {isEdit ? 'Salvando...' : 'Criando...'}
                                </>
                            ) : isEdit ? (
                                'Salvar alterações'
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Criar Projeto
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export function CreateProjectModal() {
    return <ProjectFormModal />
}

export function EditProjectModal({
    project,
    trigger,
}: {
    project: Project
    trigger?: React.ReactNode
}) {
    return <ProjectFormModal project={project} trigger={trigger} />
}
