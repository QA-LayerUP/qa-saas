'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Camera, FileText } from 'lucide-react'
import { QACategory } from '@/lib/types'

interface TaskModeSelectorProps {
    categories: QACategory[]
    projectId: string
    hasCategories: boolean
}

import { CreateQAItemModal } from './CreateQAItemModal'

// ...

export function TaskModeSelector({ categories, projectId, hasCategories }: TaskModeSelectorProps) {
    const [open, setOpen] = useState(false)
    const [simpleTaskOpen, setSimpleTaskOpen] = useState(false)
    const router = useRouter()

    const handleSimpleTask = () => {
        setOpen(false)
        setSimpleTaskOpen(true)
    }

    const handleVisualTask = () => {
        setOpen(false)
        router.push(`/projects/${projectId}/qa/new/detailed`)
    }

    if (!hasCategories) {
        return null
    }

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Item
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Escolha o tipo de tarefa</DialogTitle>
                        <DialogDescription>
                            Selecione como você deseja criar a tarefa de QA
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 sm:grid-cols-2">
                        <Card
                            className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
                            onClick={handleSimpleTask}
                        >
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-primary" />
                                    <CardTitle className="text-lg">Tarefa Simples</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>
                                    Crie uma tarefa rapidamente com título, descrição e prioridade.
                                </CardDescription>
                            </CardContent>
                        </Card>

                        <Card
                            className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
                            onClick={handleVisualTask}
                        >
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Camera className="h-5 w-5 text-primary" />
                                    <CardTitle className="text-lg">Tarefa Detalhada</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>
                                    Navegue no site, capture prints e adicione anotações visuais.
                                </CardDescription>
                            </CardContent>
                        </Card>
                    </div>
                </DialogContent>
            </Dialog>

            <CreateQAItemModal
                categories={categories}
                projectId={projectId}
                open={simpleTaskOpen}
                onOpenChange={setSimpleTaskOpen}
                hideTrigger
            />
        </>
    )
}
