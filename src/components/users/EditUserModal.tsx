/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Save, Settings2 } from 'lucide-react'

interface User {
    id: string
    name: string
    email: string
    role?: string
    status?: string
}

interface EditUserModalProps {
    user: User
}

export function EditUserModal({ user }: EditUserModalProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    
    // Define role padrão como colaborador caso venha vazio
    const [role, setRole] = useState(user.role || 'colaborador')
    const [status, setStatus] = useState(user.status || 'active')

    const router = useRouter()
    const supabase = createClient()

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase
                .from('users')
                .update({ role, status })
                .eq('id', user.id)

            if (error) throw error

            setOpen(false)
            router.refresh()
        } catch (error: any) {
            // Melhora a visualização do erro
            console.error('Erro detalhado:', JSON.stringify(error, null, 2))
            console.error('Mensagem:', error.message || 'Sem mensagem de erro')
            
            alert(`Erro ao atualizar: ${error.message || 'Permissão negada ou erro de conexão'}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-[#7900E5]">
                    <Settings2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleUpdate}>
                    <DialogHeader>
                        <DialogTitle className="font-montserrat font-bold">Editar Usuário</DialogTitle>
                        <DialogDescription>
                            Alterar permissões e status de {user.name}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        
                        <div className="grid gap-2">
                            <Label htmlFor="status">Status da Conta</Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className={status === 'active' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Ativo</SelectItem>
                                    <SelectItem value="inactive">Inativo (Bloqueado)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="role">Permissão (Role)</Label>
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="qa">QA</SelectItem>
                                    <SelectItem value="colaborador">Colaborador</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="bg-[#7900E5] hover:bg-[#6a00c9]">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Salvar Alterações
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}