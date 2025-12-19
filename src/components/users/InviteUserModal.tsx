'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Mail, Send, UserPlus } from 'lucide-react'
import { inviteUserAction } from '@/app/actions/invite' // <--- Importe a action

export function InviteUserModal() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [role, setRole] = useState('colaborador')
    
    const router = useRouter()

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Chamada ao Server Action
            const result = await inviteUserAction(email, role)

            if (result.error) {
                alert(result.error)
                return
            }

            alert(`Convite enviado para ${email} com sucesso!`)
            setOpen(false)
            setEmail('')
            setRole('colaborador')
            router.refresh()

        } catch (error) {
            console.error('Erro inesperado:', error)
            alert('Erro ao processar convite.')
        } finally {
            setLoading(false)
        }
    }
    
    // ... O restante do JSX (render) continua igual ao anterior ...
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-[#7900E5] font-montserrat text-xs font-semibold uppercase tracking-wide text-white hover:bg-[#6a00c9]">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Convidar Usuário
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleInvite}>
                    <DialogHeader>
                        <DialogTitle className="font-montserrat font-bold text-[#7900E5]">Convidar Novo Membro</DialogTitle>
                        <DialogDescription>
                            Envie um convite para um novo usuário acessar a plataforma.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">E-mail Corporativo</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="colaborador@empresa.com"
                                    className="pl-9"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="role">Nível de Acesso</Label>
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin (Acesso Total)</SelectItem>
                                    <SelectItem value="qa">QA (Analista de Qualidade)</SelectItem>
                                    <SelectItem value="colaborador">Colaborador (Padrão)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="w-full bg-[#7900E5] hover:bg-[#6a00c9]">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            Enviar Convite
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}