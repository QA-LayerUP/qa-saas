import { QAItem, QACategory } from '@/lib/types'
import { KanbanColumn } from './KanbanColumn'
import { AlertCircle, Clock, CheckCircle2, CircleDashed } from 'lucide-react'
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent
} from '@dnd-kit/core'
import { useState } from 'react'
import { KanbanCard } from './KanbanCard'
import { createPortal } from 'react-dom'

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

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    )

    // Definir as colunas fixas
    const columns = [
        {
            id: 'aberto',
            title: 'Aberto',
            icon: <AlertCircle className="h-4 w-4 text-red-500" />,
            colorClass: 'text-red-500',
            items: items.filter(i => i.status === 'aberto')
        },
        {
            id: 'em_correcao',
            title: 'Em Correção',
            icon: <Clock className="h-4 w-4 text-yellow-500" />,
            colorClass: 'text-yellow-500',
            items: items.filter(i => i.status === 'em_correcao')
        },
        {
            id: 'em_homologacao',
            title: 'Homologação',
            icon: <CircleDashed className="h-4 w-4 text-blue-500" />,
            colorClass: 'text-blue-500',
            items: items.filter(i => i.status === 'em_homologacao')
        },
        {
            id: 'finalizado',
            title: 'Finalizado',
            icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
            colorClass: 'text-green-500',
            items: items.filter(i => i.status === 'finalizado')
        }
    ]

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
        }

        setActiveId(null)
        setActiveItem(null)
    }

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-[calc(100vh-280px)] w-full gap-4 overflow-x-auto pb-4">
                {columns.map((col) => (
                    <KanbanColumn
                        key={col.id}
                        id={col.id}
                        title={col.title}
                        icon={col.icon}
                        items={col.items}
                        categories={categories}
                        onItemClick={onItemClick}
                        colorClass={col.colorClass}
                    />
                ))}
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
    )
}
