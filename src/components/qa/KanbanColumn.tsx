'use client'

import { QAItem, QACategory } from '@/lib/types'
import { KanbanCard } from './KanbanCard'
import { ReactNode } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'

interface KanbanColumnProps {
    id: string
    title: string
    icon: ReactNode
    items: QAItem[]
    categories: QACategory[]
    onItemClick: (id: string) => void
    colorClass: string
    collapsed?: boolean
    onToggleCollapse?: () => void
}

export function KanbanColumn({
    id,
    title,
    icon,
    items,
    categories,
    onItemClick,
    colorClass,
    collapsed = false,
    onToggleCollapse,
}: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: id
    })
    const isEmpty = items.length === 0

    if (collapsed) {
        return (
            <div
                ref={setNodeRef}
                className={`flex h-full w-12 min-w-12 shrink-0 flex-col rounded-xl border border-border bg-card transition-colors ${
                    isOver ? 'border-roxo/30 bg-roxo/10' : ''
                }`}
            >
                <button
                    type="button"
                    onClick={onToggleCollapse}
                    title={`Expandir ${title}`}
                    className="flex h-full flex-col items-center gap-3 px-1 py-3 text-muted-foreground hover:text-foreground"
                >
                    <div className={`${colorClass} rounded-md border bg-background p-1.5 shadow-xs`}>
                        {icon}
                    </div>
                    <span className="flex-1 [writing-mode:vertical-rl] rotate-180 text-[11px] font-semibold tracking-[0.16em] uppercase">
                        {title}
                    </span>
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full border bg-background px-1.5 text-xs font-medium text-muted-foreground shadow-xs">
                        {items.length}
                    </span>
                    <PanelLeftOpen className="h-3.5 w-3.5" />
                </button>
            </div>
        )
    }

    return (
        <div
            ref={setNodeRef}
            className={`flex h-full min-h-0 min-w-[240px] flex-1 flex-col rounded-xl border border-border bg-card transition-colors ${
                isOver ? 'border-roxo/30 bg-roxo/10' : ''
            }`}
        >
            <div className={`flex items-center justify-between border-b px-4 py-3 ${colorClass}/5`}>
                <div className="flex items-center gap-2">
                    <div className={`${colorClass} rounded-md border bg-background p-1.5 shadow-xs`}>
                        {icon}
                    </div>
                    <span className="text-sm font-semibold tracking-tight">{title}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full border bg-background px-1.5 text-xs font-medium text-muted-foreground shadow-xs">
                        {items.length}
                    </span>
                    {isEmpty && onToggleCollapse && (
                        <button
                            type="button"
                            onClick={onToggleCollapse}
                            title="Encolher coluna vazia"
                            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
                        >
                            <PanelLeftClose className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            </div>

            <div className="lu-scroll min-h-0 flex-1 overflow-y-auto p-3">
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
            </div>
        </div>
    )
}
