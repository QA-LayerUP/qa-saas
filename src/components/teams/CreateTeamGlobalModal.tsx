'use client'

import { useState } from 'react'
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
import { Loader2, Plus } from 'lucide-react'

export function CreateTeamGlobalModal() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Criação simples, sem project_id
            const { error } = await supabase
                .from('teams')
                .insert([{ 
                    name,
                    description 
                }])

            if (error) throw error

            setOpen(false)
            setName('')
            setDescription('')
            router.refresh()
        } catch (error) {
            console.error('Erro ao criar time:', error)
            alert('Erro ao criar time.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-[#7900E5] font-montserrat text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#ff28c6]">
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Time
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="font-montserrat text-xl font-bold">Criar Novo Time</DialogTitle>
                        <DialogDescription className="text-sm">
                            Crie um Squad Global (ex: QA, Dev, Design) para usar nos projetos.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Nome
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="col-span-3"
                                placeholder="Ex: Desenvolvimento"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="desc" className="text-right">
                                Descrição
                            </Label>
                            <Input
                                id="desc"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="col-span-3"
                                placeholder="Opcional"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="bg-[#7900E5] font-montserrat text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#ff28c6]"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Criar Time
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}