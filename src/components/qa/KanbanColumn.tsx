import { QAItem, QACategory } from '@/lib/types'
import { KanbanCard } from './KanbanCard'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ReactNode } from 'react'
import { useDroppable } from '@dnd-kit/core'

interface KanbanColumnProps {
    id: string
    title: string
    icon: ReactNode
    items: QAItem[]
    categories: QACategory[]
    onItemClick: (id: string) => void
    colorClass: string
}

export function KanbanColumn({ id, title, icon, items, categories, onItemClick, colorClass }: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: id
    })

    return (
        <div
            ref={setNodeRef}
            className={`flex h-full min-w-[280px] w-80 flex-col rounded-xl border border-border/50 bg-muted/30 transition-colors ${isOver ? 'bg-[#7900E5]/10 border-[#7900E5]/30' : ''
                }`}
        >
            {/* Header */}
            <div className={`flex items-center justify-between border-b px-4 py-3 ${colorClass}/5`}>
                <div className="flex items-center gap-2">
                    <div className={`${colorClass} rounded-md p-1.5 bg-background border shadow-xs`}>
                        {icon}
                    </div>
                    <span className="text-sm font-semibold tracking-tight">{title}</span>
                </div>
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-background border px-1.5 text-xs font-medium text-muted-foreground shadow-xs">
                    {items.length}
                </span>
            </div>

            {/* Cards Container */}
            <ScrollArea className="flex-1 p-3">
                <div className="flex flex-col gap-3">
                    {items.map((item) => {
                        const category = categories.find(c => c.id === item.category_id)
                        return (
                            <KanbanCard
                                key={item.id}
                                item={item}
                                category={category}
                                onClick={() => onItemClick(item.id)}
                            />
                        )
                    })}

                    {items.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8 text-center opacity-50">
                            <span className="text-xs text-muted-foreground">Vazio</span>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
