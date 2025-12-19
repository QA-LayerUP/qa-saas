/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Mail, Calendar } from 'lucide-react'
import { EditUserModal } from '@/components/users/EditUserModal'

interface UsersListProps {
    users: any[]
}

export function UsersList({ users }: UsersListProps) {
    
    // Cores atualizadas para as novas roles
    const getRoleBadge = (role: string) => {
        switch(role) {
            case 'admin': return 'border-purple-200 bg-purple-50 text-purple-700'
            case 'qa': return 'border-orange-200 bg-orange-50 text-orange-700' // QA em Laranja
            case 'colaborador': return 'border-blue-200 bg-blue-50 text-blue-700' // Colaborador em Azul
            default: return 'border-slate-200 bg-slate-50 text-slate-600'
        }
    }

    // Formata o texto da role para ficar bonito (Ex: "qa" -> "QA", "admin" -> "Admin")
    const formatRole = (role: string) => {
        if (!role) return 'Colaborador'
        if (role === 'qa') return 'QA'
        return role.charAt(0).toUpperCase() + role.slice(1)
    }

    return (
        <Card className="rounded-xl border-border shadow-sm">
            <CardHeader className="border-b px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="font-montserrat text-lg font-bold">Membros da Organização</CardTitle>
                        <CardDescription>
                            Todos os usuários cadastrados na plataforma.
                        </CardDescription>
                    </div>
                    <Badge variant="secondary" className="font-mono">
                        {users.length} usuários
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="pl-6">Usuário</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Permissão</TableHead>
                            <TableHead>Cadastro</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-right pr-6">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} className="group hover:bg-muted/30">
                                <TableCell className="pl-6 py-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9 border group-hover:border-[#7900E5]/30 transition-colors">
                                            <AvatarImage src={user.avatar_url} />
                                            <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
                                                {user.name?.[0]?.toUpperCase() || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm text-foreground">
                                                {user.name || 'Sem nome'}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                        <Mail className="h-3.5 w-3.5" />
                                        {user.email}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={`uppercase text-[10px] ${getRoleBadge(user.role)}`}>
                                        {formatRole(user.role)}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {user.created_at 
                                            ? format(new Date(user.created_at), "dd/MM/yyyy", { locale: ptBR })
                                            : '-'
                                        }
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge variant="outline" className={user.status === 'inactive' ? 'border-red-200 text-red-600 bg-red-50' : 'border-green-200 text-green-600 bg-green-50'}>
                                        {user.status === 'inactive' ? 'Inativo' : 'Ativo'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    <EditUserModal user={user} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}