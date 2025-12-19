/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Mail, Calendar, RefreshCw, Clock, Loader2, CheckCircle2 } from 'lucide-react'
import { EditUserModal } from '@/components/users/EditUserModal'
import { resendInviteAction } from '@/app/actions/resend-invite'
import { toast } from 'sonner' // <--- Importante: Importando o Toast da Sonner

export interface UnifiedUser {
    id: string
    name: string | null
    email: string
    role: string
    status: 'active' | 'inactive' | 'pending'
    created_at: string
    avatar_url?: string | null
    type: 'user' | 'invite'
}

interface UsersListProps {
    data: UnifiedUser[]
}

export function UsersList({ data }: UsersListProps) {
    const [filter, setFilter] = useState<'active' | 'pending'>('active')
    const [resendingEmail, setResendingEmail] = useState<string | null>(null)
    
    const activeCount = data.filter(i => i.status === 'active' || i.status === 'inactive').length
    const pendingCount = data.filter(i => i.status === 'pending').length

    const filteredData = data.filter(item => {
        if (filter === 'active') return item.status === 'active' || item.status === 'inactive'
        if (filter === 'pending') return item.status === 'pending'
        return false
    })

    const getRoleBadge = (role: string) => {
        switch(role) {
            case 'admin': return 'border-purple-200 bg-purple-50 text-purple-700'
            case 'qa': return 'border-orange-200 bg-orange-50 text-orange-700'
            case 'colaborador': return 'border-blue-200 bg-blue-50 text-blue-700'
            default: return 'border-slate-200 bg-slate-50 text-slate-600'
        }
    }

    const formatRole = (role: string) => {
        if (!role) return 'Colaborador'
        if (role === 'qa') return 'QA'
        return role.charAt(0).toUpperCase() + role.slice(1)
    }

    // --- FUNÇÃO DE REENVIO ATUALIZADA COM TOAST ---
    const handleResend = async (email: string) => {
        setResendingEmail(email)
        try {
            const result = await resendInviteAction(email)
            
            if (result.error) {
                toast.error("Erro ao reenviar", {
                    description: result.error
                })
            } else {
                toast.success("Convite reenviado!", {
                    description: `Um lembrete foi enviado para ${email}.`,
                    icon: <CheckCircle2 className="h-4 w-4 text-green-600" />,
                    duration: 4000,
                })
            }
        } catch (error) {
            console.error(error)
            toast.error("Erro inesperado", {
                description: "Não foi possível conectar ao servidor."
            })
        } finally {
            setResendingEmail(null)
        }
    }
    // ----------------------------------------------

    return (
        <Card className="rounded-xl border-border shadow-sm">
            <CardHeader className="border-b px-6 py-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="font-montserrat text-lg font-bold">Membros da Organização</CardTitle>
                        <CardDescription>
                            Gerencie acessos ativos e convites pendentes.
                        </CardDescription>
                    </div>
                    
                    <Tabs value={filter} onValueChange={(v) => setFilter(v as 'active' | 'pending')} className="w-full sm:w-auto">
                        <TabsList className="grid w-full grid-cols-2 sm:w-[300px]">
                            <TabsTrigger value="active">
                                Ativos <span className="ml-2 text-[10px] opacity-60">({activeCount})</span>
                            </TabsTrigger>
                            <TabsTrigger value="pending">
                                Convites <span className="ml-2 text-[10px] opacity-60">({pendingCount})</span>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="pl-6">Usuário / Convidado</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Permissão</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-right pr-6">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center">
                                    <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                                        {filter === 'pending' ? (
                                            <>
                                                <Mail className="h-8 w-8 opacity-20" />
                                                <p>Nenhum convite pendente no momento.</p>
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCw className="h-8 w-8 opacity-20" />
                                                <p>Nenhum usuário ativo encontrado.</p>
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((item) => (
                                <TableRow key={item.id} className="group hover:bg-muted/30">
                                    
                                    <TableCell className="pl-6 py-3">
                                        <div className="flex items-center gap-3">
                                            {item.type === 'user' ? (
                                                <Avatar className="h-9 w-9 border group-hover:border-[#7900E5]/30 transition-colors">
                                                    <AvatarImage src={item.avatar_url || ''} />
                                                    <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
                                                        {item.name?.[0]?.toUpperCase() || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                            ) : (
                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-100 border border-yellow-200">
                                                    <Clock className="h-4 w-4 text-yellow-700" />
                                                </div>
                                            )}
                                            
                                            <div className="flex flex-col">
                                                <span className={`font-medium text-sm ${item.type === 'invite' ? 'text-muted-foreground italic' : 'text-foreground'}`}>
                                                    {item.name || (item.type === 'invite' ? 'Aguardando cadastro...' : 'Sem nome')}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                            <Mail className="h-3.5 w-3.5" />
                                            {item.email}
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <Badge variant="outline" className={`uppercase text-[10px] ${getRoleBadge(item.role)}`}>
                                            {formatRole(item.role)}
                                        </Badge>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {item.created_at 
                                                ? format(new Date(item.created_at), "dd/MM/yyyy", { locale: ptBR })
                                                : '-'
                                            }
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-center">
                                        {item.status === 'pending' ? (
                                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">
                                                Pendente
                                            </Badge>
                                        ) : item.status === 'inactive' ? (
                                            <Badge variant="outline" className="border-red-200 text-red-600 bg-red-50">
                                                Inativo
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="border-green-200 text-green-600 bg-green-50">
                                                Ativo
                                            </Badge>
                                        )}
                                    </TableCell>

                                    <TableCell className="text-right pr-6">
                                        {item.type === 'invite' ? (
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-8 text-xs text-muted-foreground hover:text-[#7900E5]"
                                                onClick={() => handleResend(item.email)}
                                                disabled={resendingEmail === item.email}
                                            >
                                                {resendingEmail === item.email ? (
                                                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <RefreshCw className="mr-2 h-3.5 w-3.5" />
                                                )}
                                                Reenviar
                                            </Button>
                                        ) : (
                                            <EditUserModal user={item as any} />
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}