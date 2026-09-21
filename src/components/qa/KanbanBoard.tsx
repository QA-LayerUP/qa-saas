'use client'

import { QAItem, QACategory } from '@/lib/types'
import { QA_ITEM_STATUSES, QA_ITEM_STATUS_ICON, QA_ITEM_STATUS_LABELS, type QAItemStatus } from '@/lib/qa-status'
import { KanbanColumn } from './KanbanColumn'
import { AlertCircle, Clock, CheckCircle2, PauseCircle } from 'lucide-react'
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent
} from '@dnd-kit/core'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { KanbanCard } from './KanbanCard'
import { createPortal } from 'react-dom'
import { PanelLeftClose } from 'lucide-react'

const COLLAPSE_EMPTY_KEY = 'qa-kanban:collapse-empty'

const COLUMN_ICONS: Record<QAItemStatus, ReactNode> = {
    aberto: <AlertCircle className={`h-4 w-4 ${QA_ITEM_STATUS_ICON.aberto}`} />,
    em_correcao: <Clock className={`h-4 w-4 ${QA_ITEM_STATUS_ICON.em_correcao}`} />,
    pendencia: <PauseCircle className={`h-4 w-4 ${QA_ITEM_STATUS_ICON.pendencia}`} />,
    em_homologacao: <Clock className={`h-4 w-4 ${QA_ITEM_STATUS_ICON.em_homologacao}`} />,
    finalizado: <CheckCircle2 className={`h-4 w-4 ${QA_ITEM_STATUS_ICON.finalizado}`} />,
}

interface KanbanBoardProps {
    items: QAItem[]
    categories: QACategory[]
    projectId: string
    onItemClick: (id: string) => void
    onStatusChange: (itemId: string, newStatus: string) => void
}

export function KanbanBoard({ items, categories, onItemClick, onStatusChange }: KanbanBoardProps) {
    const [activeId, setActiveId] = useState<string | null>(null)
    const [activeItem, setActiveItem] = useState<QAItem | null>(null)
    const [collapseEmpty, setCollapseEmpty] = useState(false)
    const [collapsedIds, setCollapsedIds] = useState<string[]>([])
    const [expandedEmptyIds, setExpandedEmptyIds] = useState<string[]>([])

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    )

    useEffect(() => {
        try {
            setCollapseEmpty(window.localStorage.getItem(COLLAPSE_EMPTY_KEY) === '1')
        } catch {
            setCollapseEmpty(false)
        }
    }, [])

    const columns = QA_ITEM_STATUSES.map((status) => ({
        id: status,
        title: QA_ITEM_STATUS_LABELS[status],
        icon: COLUMN_ICONS[status],
        colorClass: QA_ITEM_STATUS_ICON[status],
        items: items.filter((item) => item.status === status),
    }))

    function persistCollapseEmpty(next: boolean) {
        setCollapseEmpty(next)
        try {
            window.localStorage.setItem(COLLAPSE_EMPTY_KEY, next ? '1' : '0')
        } catch {
            // ignore
        }
        setCollapsedIds([])
        setExpandedEmptyIds([])
    }

    function toggleColumn(id: string, isEmpty: boolean) {
        if (!isEmpty) return
        if (collapseEmpty) {
            setExpandedEmptyIds((current) =>
                current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
            )
            return
        }
        setCollapsedIds((current) =>
            current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
        )
    }

    function handleDragStart(event: DragStartEvent) {
        const { active } = event
        setActiveId(active.id as string)
        setActiveItem(active.data.current?.item)
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event

        if (!over) {
            setActiveId(null)
            setActiveItem(null)
            return
        }

        const activeItemId = active.id as string
        const overColumnId = over.id as string

        const currentItem = items.find(i => i.id === activeItemId)

        if (currentItem && currentItem.status !== overColumnId) {
            onStatusChange(activeItemId, overColumnId)
            setCollapsedIds((current) => current.filter((id) => id !== overColumnId))
            setExpandedEmptyIds((current) =>
                current.includes(overColumnId) ? current : [...current, overColumnId],
            )
        }

        setActiveId(null)
        setActiveItem(null)
    }

    return (
        <div className="space-y-3">
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={() => persistCollapseEmpty(!collapseEmpty)}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                        collapseEmpty
                            ? 'border-roxo/30 bg-roxo/10 text-roxo'
                            : 'border-border bg-card text-muted-foreground hover:text-foreground'
                    }`}
                >
                    <PanelLeftClose className="h-3.5 w-3.5" />
                    Encolher vazias
                </button>
            </div>

            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex h-[calc(100vh-280px)] w-full gap-4 overflow-x-auto pb-4">
                    {columns.map((col) => {
                        const collapsed =
                            col.items.length === 0 &&
                            (collapseEmpty
                                ? !expandedEmptyIds.includes(col.id)
                                : collapsedIds.includes(col.id))
                        return (
                            <KanbanColumn
                                key={col.id}
                                id={col.id}
                                title={col.title}
                                icon={col.icon}
                                items={col.items}
                                categories={categories}
                                onItemClick={onItemClick}
                                colorClass={col.colorClass}
                                collapsed={collapsed}
                                onToggleCollapse={() => toggleColumn(col.id, col.items.length === 0)}
                            />
                        )
                    })}
                </div>

                {typeof window !== 'undefined' && createPortal(
                    <DragOverlay>
                        {activeItem ? (
                            <div className="w-80 opacity-80 rotate-2">
                                <KanbanCard
                                    item={activeItem}
                                    category={categories.find(c => c.id === activeItem.category_id)}
                                    onClick={() => { }}
                                />
                            </div>
                        ) : null}
                    </DragOverlay>,
                    document.body
                )}
            </DndContext>
        </div>
    )
}
