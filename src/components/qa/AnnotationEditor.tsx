'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { useAnnotationCanvas } from '@/hooks/useAnnotationCanvas'
import {
    Pencil,
    Circle,
    Square,
    ArrowRight,
    Type,
    Eraser,
    Undo2,
    Redo2,
    Trash2,
    MousePointer,
    Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnnotationEditorProps {
    imageUrl: string
    open: boolean
    onClose: () => void
    onSave: (imageBlob: Blob) => Promise<void>
}

export function AnnotationEditor({ imageUrl, open, onClose, onSave }: AnnotationEditorProps) {

    console.log("IMAGE URL RECEBIDA:", imageUrl)

    const [saving, setSaving] = useState(false)

    const {
        canvasRef,
        currentTool,
        setCurrentTool,
        color,
        setColor,
        strokeWidth,
        setStrokeWidth,
        undo,
        redo,
        clear,
        addText,
        exportImage,
        canUndo,
        canRedo
    } = useAnnotationCanvas({ imageUrl })

    const handleSave = async () => {
        setSaving(true)
        try {
            const blob = await exportImage()
            await onSave(blob)
            onClose()
        } catch (error) {
            console.error('Error saving annotation:', error)
            alert('Erro ao salvar anotação.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl w-full h-[90vh] p-0 overflow-hidden flex flex-col">
                <div className="flex flex-col h-full">

                    <DialogHeader className="px-6 py-4 border-b">
                        <div className="flex items-center justify-between">
                            <DialogTitle>Editor de Anotações</DialogTitle>

                            <div className="flex gap-2">
                                <Button variant="outline" onClick={onClose}>Cancelar</Button>
                                <Button onClick={handleSave} disabled={saving}>
                                    {saving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Salvando...
                                        </>
                                    ) :
                                        'Salvar'
                                    }
                                </Button>
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Toolbar */}
                    <div className="flex items-center gap-4 px-6 py-3 border-b bg-muted/30">

                        {/* Tools */}
                        <div className="flex gap-1 border-r pr-4">
                            {[
                                { id: 'select' as const, icon: MousePointer },
                                { id: 'brush' as const, icon: Pencil },
                                { id: 'circle' as const, icon: Circle },
                                { id: 'rectangle' as const, icon: Square },
                                { id: 'arrow' as const, icon: ArrowRight },
                                { id: 'eraser' as const, icon: Eraser }
                            ].map(tool => (
                                <Button
                                    key={tool.id}
                                    variant={currentTool === tool.id ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setCurrentTool(tool.id)}
                                >
                                    <tool.icon className="h-4 w-4" />
                                </Button>
                            ))}

                            <Button variant="ghost" size="sm" onClick={addText}>
                                <Type className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Colors */}
                        <div className="flex gap-1 border-r pr-4">
                            {[
                                '#ef4444', '#f97316', '#eab308', '#22c55e',
                                '#3b82f6', '#8b5cf6', '#ec4899', '#000000', '#ffffff'
                            ].map((c) => (
                                <button
                                    key={c}
                                    className={cn(
                                        'w-6 h-6 rounded border-2 transition-all',
                                        color === c ? 'border-foreground scale-110' : 'border-muted'
                                    )}
                                    style={{ backgroundColor: c }}
                                    onClick={() => setColor(c)}
                                />
                            ))}
                        </div>

                        {/* Stroke */}
                        <div className="flex items-center gap-2 border-r pr-4">
                            <input
                                type="range"
                                min="1"
                                max="20"
                                value={strokeWidth}
                                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                            />
                        </div>

                        {/* Undo / Redo */}
                        <div className="flex gap-1 border-r pr-4">
                            <Button variant="ghost" size="sm" onClick={undo} disabled={!canUndo}>
                                <Undo2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={redo} disabled={!canRedo}>
                                <Redo2 className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Clear */}
                        <Button variant="ghost" size="sm" onClick={clear}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Canvas */}
                    <div className="flex-1 overflow-auto bg-neutral-900 p-8 flex items-center justify-center">
                        <div className="shadow-2xl border border-neutral-700">
                            <canvas ref={canvasRef} className="block" />
                        </div>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    )
}
