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
import { Team } from '@/lib/types'
import { QA_CATEGORY_LABELS, ensureQaCategory } from '@/lib/qa-categories'
import { uploadScreenshot } from '@/lib/services/visual-qa'
import { createLog } from '@/lib/services/logs'

interface CreateQAItemModalProps {
    teams: Team[]
    projectId: string
    open?: boolean
    onOpenChange?: (open: boolean) => void
    hideTrigger?: boolean
}

export function CreateQAItemModal({
    teams,
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
    
    // Estados do Formulário
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [selectedTeamId, setSelectedTeamId] = useState<string>('') // Novo controle de Time
    const [categoryTitle, setCategoryTitle] = useState('')
    const [priority, setPriority] = useState('media')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleTeamChange = (value: string) => {
        setSelectedTeamId(value)
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0])
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!categoryTitle || !selectedTeamId) return
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()

            const categoryId = await ensureQaCategory(supabase, {
                projectId,
                teamId: selectedTeamId,
                title: categoryTitle,
            })

            // 1. Create Item
            const { data: itemData, error: itemError } = await supabase
                .from('qa_items')
                .insert([
                    {
                        team_id: selectedTeamId, // Agora salvamos o ID do time real
                        category_id: categoryId,
                        title,
                        description,
                        priority,
                        status: 'aberto',
                        created_by: user?.id
                    }
                ])
                .select()
                .single()

            if (itemError) throw itemError

            if (itemData && user?.id) {
                await createLog(supabase, {
                    itemId: itemData.id,
                    userId: user.id,
                    action: 'criou o card',
                })
            }

            // 2. Upload Image if exists
            if (selectedFile && itemData) {
                const imageUrl = await uploadScreenshot(selectedFile, projectId)

                await supabase.from('qa_evidences').insert({
                    qa_item_id: itemData.id,
                    file_url: imageUrl,
                    file_type: 'image'
                })
            }

            // Reset Form
            setOpen?.(false)
            setTitle('')
            setDescription('')
            setPriority('media')
            setCategoryTitle('')
            // Não resetamos o time aqui propositalmente para facilitar criações seguidas, 
            // mas você pode resetar setSelectedTeamId('') se preferir.
            setSelectedFile(null)
            
            router.refresh()
        } catch (error) {
            console.error('Error creating item:', error)
            alert('Erro ao criar item. Verifique se o banco de dados tem a coluna team_id em qa_items.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!hideTrigger && (
                <DialogTrigger asChild>
                    <Button className="bg-[#7900E5] font-montserrat text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#ff28c6]">
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Item
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="font-montserrat text-xl font-bold">Novo Item de QA</DialogTitle>
                        <DialogDescription>
                            Selecione o time, o tipo de QA e descreva o problema.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">

                        {/* 1. Time Responsável (Filtro Principal) */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="team" className="text-right font-semibold">
                                Time
                            </Label>
                            <Select value={selectedTeamId} onValueChange={handleTeamChange} required>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Selecione o time responsável" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teams.map((team) => (
                                        <SelectItem key={team.id} value={team.id}>
                                            {team.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* 2. Categoria fixa */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">
                                Categoria
                            </Label>
                            <Select
                                value={categoryTitle}
                                onValueChange={setCategoryTitle}
                                required
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Selecione uma categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    {QA_CATEGORY_LABELS.map((label) => (
                                        <SelectItem key={label} value={label}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* 3. Título */}
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
                                placeholder="Ex: Botão desalinhado no mobile"
                            />
                        </div>

                        {/* 4. Prioridade */}
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

                        {/* 5. Descrição */}
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="description" className="text-right pt-2">
                                Detalhes
                            </Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="col-span-3"
                                rows={3}
                                placeholder="Passos para reproduzir o erro..."
                            />
                        </div>

                        {/* 6. Upload */}
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
                                        className="w-full border-dashed text-muted-foreground"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="mr-2 h-4 w-4" />
                                        Anexar Screenshot
                                    </Button>
                                ) : (
                                    <div className="flex items-center justify-between p-2 border rounded bg-muted/20">
                                        <span className="text-sm truncate max-w-[200px] text-foreground">
                                            {selectedFile.name}
                                        </span>
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
                        <Button 
                            type="submit" 
                            disabled={loading || !categoryTitle || !selectedTeamId}
                            className="bg-[#7900E5] font-montserrat text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#ff28c6]"
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Criar Tarefa
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}