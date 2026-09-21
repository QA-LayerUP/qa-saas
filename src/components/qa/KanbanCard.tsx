import { QAItem, QACategory } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Users } from 'lucide-react'
import { useDraggable } from '@dnd-kit/core'
import { qaStatusBadge, qaStatusLabel } from '@/lib/qa-status'

interface KanbanCardProps {
    item: QAItem
    category?: QACategory
    onClick: () => void
}

export function KanbanCard({ item, category, onClick }: KanbanCardProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: item.id,
        data: { item }
    })

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 100 : 1,
        opacity: isDragging ? 0.8 : 1
    } : undefined

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'alta': return 'bg-roxo/10 text-roxo border-roxo/30'
            case 'media': return 'bg-amarelo/10 text-amarelo border-amarelo/30'
            case 'baixa': return 'bg-foreground/5 text-foreground/70 border-border'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onClick={onClick}
            className={`group lu-card cursor-pointer p-3 transition-colors hover:border-roxo/40 ${isDragging ? 'ring-2 ring-roxo/50' : ''}`}
        >
            {/* Category & Status & Priority Row */}
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
                {category && (
                    <Badge variant="secondary" className="max-w-[100px] truncate text-[10px] font-normal bg-muted/50 text-muted-foreground border border-border">
                        {category.title}
                    </Badge>
                )}

                <Badge variant="outline" className={`text-[9px] h-4 px-1 uppercase ${qaStatusBadge(item.status)}`}>
                    {qaStatusLabel(item.status)}
                </Badge>

                <Badge variant="outline" className={`text-[9px] h-4 px-1 uppercase ${getPriorityColor(item.priority)} ml-auto`}>
                    {item.priority}
                </Badge>
            </div>

            {/* Title */}
            <h4 className="mb-1 text-xs font-semibold text-foreground line-clamp-2 group-hover:text-roxo transition-colors dark:group-hover:text-amarelo">
                {item.title}
            </h4>

            {/* Footer Row */}
            <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground font-mono">
                    #{item.id.slice(0, 4)}
                </span>

                <div className="flex items-center gap-2">
                    {/* Assigned To */}
                    <div className="flex items-center gap-1">
                        <Avatar className="h-5 w-5 border border-border">
                            <AvatarFallback className="bg-muted text-[8px] text-muted-foreground">
                                {item.assigned_to ? 'U' : <Users className="h-2.5 w-2.5" />}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </div>
        </div>
    )
}
