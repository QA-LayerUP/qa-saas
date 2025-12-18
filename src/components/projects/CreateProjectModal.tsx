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
import { Plus, Loader2, Sparkles, Building2, Link as LinkIcon } from 'lucide-react'

export function CreateProjectModal() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState('')
    const [client, setClient] = useState('')
    const [siteUrl, setSiteUrl] = useState('')
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase
                .from('projects')
                .insert([
                    { name, client, site_url: siteUrl || null, status: 'em_qa' }
                ])

            if (error) throw error

            setOpen(false)
            setName('')
            setClient('')
            setSiteUrl('')
            router.refresh()
        } catch (error) {
            console.error('Error creating project:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-[#7900E5] font-montserrat text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#ff28c6]">
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Projeto
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-[#7900E5]/10 p-2">
                                <Sparkles className="h-5 w-5 text-[#7900E5]" />
                            </div>
                            <div>
                                <DialogTitle className="font-montserrat text-lg font-bold">
                                    Criar Novo Projeto
                                </DialogTitle>
                                <DialogDescription className="text-xs">
                                    Adicione um novo projeto para começar o QA.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-xs font-medium">
                                Nome do Projeto
                            </Label>
                            <div className="relative">
                                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-muted-foreground">
                                    <Sparkles className="h-4 w-4" />
                                </span>
                                <Input
                                    id="name"
                                    placeholder="Ex: Sistema de Gestão"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="pl-9 text-sm"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="client" className="text-xs font-medium">
                                Cliente
                            </Label>
                            <div className="relative">
                                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-muted-foreground">
                                    <Building2 className="h-4 w-4" />
                                </span>
                                <Input
                                    id="client"
                                    placeholder="Ex: Empresa XYZ"
                                    value={client}
                                    onChange={(e) => setClient(e.target.value)}
                                    className="pl-9 text-sm"
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="site_url" className="text-xs font-medium">
                                URL do Site (opcional)
                            </Label>
                            <div className="relative">
                                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-muted-foreground">
                                    <LinkIcon className="h-4 w-4" />
                                </span>
                                <Input
                                    id="site_url"
                                    type="url"
                                    placeholder="https://exemplo.com"
                                    value={siteUrl}
                                    onChange={(e) => setSiteUrl(e.target.value)}
                                    className="pl-9 text-sm"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <DialogFooter>
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="bg-[#7900E5] font-montserrat text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#ff28c6]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Criando...
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Criar Projeto
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
