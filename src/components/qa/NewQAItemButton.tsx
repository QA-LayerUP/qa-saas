'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CreateQAItemModal } from './CreateQAItemModal'
import { Team } from '@/lib/types'

interface NewQAItemButtonProps {
    teams: Team[]
    projectId: string
}

export function NewQAItemButton({ teams, projectId }: NewQAItemButtonProps) {
    const [open, setOpen] = useState(false)

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                className="bg-transparent border border-roxo font-montserrat text-[10px] font-semibold uppercase tracking-[0.14em] text-roxo hover:bg-rosa hover:text-white hover:border-rosa"
            >
                <Plus className="h-4 w-4" />
                Novo Item
            </Button>
            <CreateQAItemModal
                teams={teams}
                projectId={projectId}
                open={open}
                onOpenChange={setOpen}
                hideTrigger={true}
            />
        </>
    )
}
