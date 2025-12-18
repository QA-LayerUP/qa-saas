/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState } from 'react'
import { QACategory, Team } from '@/lib/types' // Importe o tipo Team
import { CreateQAItemModal } from './CreateQAItemModal'
import { Button } from '@/components/ui/button'
import { LayoutGrid, List, Plus } from 'lucide-react'

interface TaskModeSelectorProps {
    categories: QACategory[]
    teams: Team[] // <--- ADICIONE ISSO
    projectId: string
    hasCategories: boolean
}

export function TaskModeSelector({ categories, teams, projectId, hasCategories }: TaskModeSelectorProps) {
    const [open, setOpen] = useState(false)

    return (
        <div className="flex items-center gap-2">
            {/* O Modal agora recebe os teams */}
            <CreateQAItemModal 
                categories={categories}
                teams={teams} // <--- REPASSE AQUI
                projectId={projectId}
                open={open}
                onOpenChange={setOpen}
                hideTrigger={true}
            />

            <Button 
                onClick={() => setOpen(true)} 
                size="sm"
                className="bg-[#7900E5] font-montserrat text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#ff28c6]"
            >
                <Plus className="mr-2 h-4 w-4" />
                Novo Item
            </Button>
        </div>
    )
}