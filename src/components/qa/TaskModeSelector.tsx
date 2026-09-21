'use client'

import { useState } from 'react'
import { Team } from '@/lib/types'
import { CreateQAItemModal } from './CreateQAItemModal'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface TaskModeSelectorProps {
    teams: Team[]
    projectId: string
}

export function TaskModeSelector({ teams, projectId }: TaskModeSelectorProps) {
    const [open, setOpen] = useState(false)

    return (
        <div className="flex items-center gap-2">
            <CreateQAItemModal
                teams={teams}
                projectId={projectId}
                open={open}
                onOpenChange={setOpen}
                hideTrigger={true}
            />

            <Button
                onClick={() => setOpen(true)}
                className="bg-roxo border border-roxo font-montserrat text-[10px] font-semibold uppercase tracking-[0.14em] text-white hover:bg-rosa"
            >
                <Plus className="h-4 w-4" />
                Novo Item
            </Button>
        </div>
    )
}
