/* eslint-disable @typescript-eslint/no-unused-vars */
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
    const [simpleTaskOpen, setSimpleTaskOpen] = useState(false)

    if (!hasCategories) {
        return null
    }

    return (
        <>
            {/* Botão que abre direto o modal de Tarefa Simples */}
            <Button onClick={() => setSimpleTaskOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Item
            </Button>

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
