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
import { Loader2, Mail, Send, UserPlus, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'
import { inviteUserAction } from '@/app/actions/invite'

export function InviteUserModal() {
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState<'form' | 'success'>('form') // Controla a visualização
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    
    // Dados do formulário
    const [email, setEmail] = useState('')
    const [role, setRole] = useState('colaborador')
    
    const router = useRouter()

    // Reseta o estado quando o modal fecha ou reinicia
    const resetModal = () => {
        setEmail('')
        setRole('colaborador')
        setErrorMessage(null)
        setStep('form')
    }

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen)
        if (!isOpen) {
            // Pequeno delay para resetar apenas depois que a animação de fechar acabar
            setTimeout(() => resetModal(), 300) 
        }
    }

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setErrorMessage(null)

        try {
            const result = await inviteUserAction(email, role)

            if (result.error) {
                setErrorMessage(result.error)
                return
            }

            // Sucesso: Muda para a tela de confirmação e atualiza dados no fundo
            setStep('success')
            router.refresh()

        } catch (error) {
            console.error('Erro inesperado:', error)
            setErrorMessage('Ocorreu um erro inesperado ao processar o convite.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="bg-[#7900E5] font-montserrat text-xs font-semibold uppercase tracking-wide text-white hover:bg-[#6a00c9]">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Convidar Usuário
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                
                {/* ESTADO 1: FORMULÁRIO */}
                {step === 'form' && (
                    <form onSubmit={handleInvite}>
                        <DialogHeader>
                            <DialogTitle className="font-montserrat font-bold text-[#7900E5]">Convidar Novo Membro</DialogTitle>
                            <DialogDescription>
                                Envie um convite para um novo usuário acessar a plataforma.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="grid gap-4 py-4">
                            {/* Exibição de Erro Inline */}
                            {errorMessage && (
                                <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-100">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    <span>{errorMessage}</span>
                                </div>
                            )}

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
                )}

                {/* ESTADO 2: SUCESSO (ANIMADO) */}
                {step === 'success' && (
                    <div className="flex flex-col items-center justify-center py-6 text-center animate-in fade-in-50 zoom-in-95 duration-300">
                        {/* Ícone Animado */}
                        <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                            <div className="absolute inset-0 rounded-full bg-green-200 animate-ping opacity-75"></div>
                            <div className="relative rounded-full bg-green-100 p-4">
                                <CheckCircle2 className="h-10 w-10 text-green-600" />
                            </div>
                        </div>

                        <h3 className="mb-2 font-montserrat text-xl font-bold text-foreground">Convite Enviado!</h3>
                        <p className="mb-6 text-sm text-muted-foreground max-w-[280px]">
                            Enviamos um e-mail para <strong>{email}</strong> com as instruções de acesso.
                        </p>

                        <div className="flex w-full flex-col gap-2">
                            <Button 
                                onClick={() => setOpen(false)} 
                                variant="outline" 
                                className="w-full"
                            >
                                Fechar
                            </Button>
                            <Button 
                                onClick={resetModal} 
                                variant="ghost" 
                                className="w-full text-[#7900E5] hover:text-[#6a00c9] hover:bg-[#7900E5]/10"
                            >
                                Convidar outro usuário
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

            </DialogContent>
        </Dialog>
    )
}