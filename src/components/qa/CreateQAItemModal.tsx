'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Loader2, Upload, X } from 'lucide-react'
import { QACategory } from '@/lib/types'
import { uploadScreenshot } from '@/lib/services/visual-qa'

interface CreateQAItemModalProps {
    categories: QACategory[]
    projectId: string
    open?: boolean
    onOpenChange?: (open: boolean) => void
    hideTrigger?: boolean
}

export function CreateQAItemModal({
    categories,
    projectId,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
    hideTrigger = false
}: CreateQAItemModalProps) {
    const [internalOpen, setInternalOpen] = useState(false)

    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : internalOpen
    const setOpen = isControlled ? controlledOnOpenChange : setInternalOpen

    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [priority, setPriority] = useState('media')
    const [assignedRole, setAssignedRole] = useState('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const router = useRouter()
    const supabase = createClient()

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0])
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!categoryId) return
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()

            // 1. Create Item
            const { data: itemData, error: itemError } = await supabase
                .from('qa_items')
                .insert([
                    {
                        category_id: categoryId,
                        title,
                        description,
                        priority,
                        status: 'aberto',
                        assigned_role: assignedRole || null,
                        created_by: user?.id
                    }
                ])
                .select()
                .single()

            if (itemError) throw itemError

            // 2. Upload Image if exists
            if (selectedFile && itemData) {
                const imageUrl = await uploadScreenshot(selectedFile, projectId)

                await supabase.from('qa_evidences').insert({
                    qa_item_id: itemData.id,
                    file_url: imageUrl,
                    file_type: 'image'
                })
            }

            setOpen?.(false)
            setTitle('')
            setDescription('')
            setPriority('media')
            setAssignedRole('')
            setSelectedFile(null)
            router.refresh()
        } catch (error) {
            console.error('Error creating item:', error)
            alert('Erro ao criar item. Verifique o console.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!hideTrigger && (
                <DialogTrigger asChild>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Item
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Novo Item de QA</DialogTitle>
                        <DialogDescription>
                            Crie uma tarefa simples, anexe evidências e atribua a um time.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">

                        {/* Categoria */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">
                                Categoria
                            </Label>
                            <Select value={categoryId} onValueChange={setCategoryId} required>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Selecione uma categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Título */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                                Título
                            </Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="col-span-3"
                                required
                                placeholder="Resumo do problema"
                            />
                        </div>

                        {/* Prioridade */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="priority" className="text-right">
                                Urgência
                            </Label>
                            <Select value={priority} onValueChange={setPriority}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="baixa">Baixa</SelectItem>
                                    <SelectItem value="media">Média</SelectItem>
                                    <SelectItem value="alta">Alta</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Time Responsável */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="role" className="text-right">
                                Time Resp.
                            </Label>
                            <Select value={assignedRole} onValueChange={setAssignedRole}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Selecione o time (opcional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ux">UX / Design</SelectItem>
                                    <SelectItem value="dev">Desenvolvimento</SelectItem>
                                    <SelectItem value="content">Conteúdo</SelectItem>
                                    <SelectItem value="qa">QA</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Descrição */}
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="description" className="text-right pt-2">
                                Comentário
                            </Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="col-span-3"
                                rows={3}
                                placeholder="Detalhes adicionais..."
                            />
                        </div>

                        {/* Upload de Imagem */}
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label className="text-right pt-2">Evidência</Label>
                            <div className="col-span-3">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                />
                                {!selectedFile ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full border-dashed"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload Imagem
                                    </Button>
                                ) : (
                                    <div className="flex items-center justify-between p-2 border rounded bg-muted/20">
                                        <span className="text-sm truncate max-w-[200px]">{selectedFile.name}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedFile(null)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading || !categoryId}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Criar Tarefa
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
