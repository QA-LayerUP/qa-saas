'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CreateQAItemModal } from './CreateQAItemModal'
import { QACategory, Team } from '@/lib/types'

interface NewQAItemButtonProps {
    categories: QACategory[]
    teams: Team[]
    projectId: string
}

export function NewQAItemButton({ categories, teams, projectId }: NewQAItemButtonProps) {
    const [open, setOpen] = useState(false)

    return (
        <>
            <Button 
                onClick={() => setOpen(true)}
                className="bg-[#7900E5] font-montserrat text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#ff28c6]"
            >
                <Plus className="mr-2 h-4 w-4" />
                Novo Item
            </Button>
            <CreateQAItemModal
                categories={categories}
                teams={teams}
                projectId={projectId}
                open={open}
                onOpenChange={setOpen}
                hideTrigger={true}
            />
        </>
    )
}
