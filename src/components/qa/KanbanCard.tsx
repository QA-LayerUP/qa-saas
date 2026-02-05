import { QAItem, QACategory } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Users } from 'lucide-react'
import { useDraggable } from '@dnd-kit/core'

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
            case 'alta': return 'bg-[#7900E5]/10 text-[#7900E5] border-[#7900E5]/30'
            case 'media': return 'bg-[#ffcc00]/10 text-[#ffcc00] border-[#ffcc00]/30'
            case 'baixa': return 'bg-blue-500/10 text-blue-500 border-blue-500/30'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'aberto': return 'bg-red-500/10 text-red-500 border-red-500/30'
            case 'em_correcao': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
            case 'em_homologacao': return 'bg-blue-500/10 text-blue-500 border-blue-500/30'
            case 'finalizado': return 'bg-green-500/10 text-green-500 border-green-500/30'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusLabel = (status: string) => {
        return status.replace('_', ' ')
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onClick={onClick}
            className={`group cursor-pointer rounded-lg border border-border bg-card p-3 shadow-sm transition-all hover:border-[#7900E5]/50 hover:shadow-md ${isDragging ? 'shadow-xl ring-2 ring-[#7900E5]/50' : ''}`}
        >
            {/* Category & Status & Priority Row */}
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
                {category && (
                    <Badge variant="secondary" className="max-w-[100px] truncate text-[10px] font-normal bg-muted/50 text-muted-foreground border border-border">
                        {category.title}
                    </Badge>
                )}

                <Badge variant="outline" className={`text-[9px] h-4 px-1 uppercase ${getStatusColor(item.status)}`}>
                    {getStatusLabel(item.status)}
                </Badge>

                <Badge variant="outline" className={`text-[9px] h-4 px-1 uppercase ${getPriorityColor(item.priority)} ml-auto`}>
                    {item.priority}
                </Badge>
            </div>

            {/* Title */}
            <h4 className="mb-1 text-xs font-semibold text-foreground line-clamp-2 group-hover:text-[#7900E5] transition-colors">
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
