'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2, AlertTriangle } from 'lucide-react'
import { createLog } from '@/lib/services/logs'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface DeleteQAItemButtonProps {
    itemId: string
}

export function DeleteQAItemButton({ itemId }: DeleteQAItemButtonProps) {
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleDelete = async (e: React.MouseEvent) => {
        // Previne que o modal feche automaticamente antes do processo terminar
        e.preventDefault()
        e.stopPropagation()
        
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()

            // 1. Atualiza para CANCELADO
            const { error } = await supabase
                .from('qa_items')
                .update({ status: 'cancelado' })
                .eq('id', itemId)

            if (error) throw error

            // 2. Cria o Log
            if (user) {
                await createLog(supabase, {
                    itemId,
                    userId: user.id,
                    action: 'cancelou',
                    details: { method: 'soft_delete' }
                })
            }

            setOpen(false) // Fecha o modal
            router.refresh()
        } catch (error) {
            console.error('Erro ao cancelar:', error)
            // Aqui pode usar um Toast no futuro, por enquanto mantemos console
        } finally {
            setLoading(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
                    onClick={(e) => e.stopPropagation()}
                    title="Cancelar Tarefa"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            </AlertDialogTrigger>
            
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-red-100 p-2 dark:bg-red-950">
                            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <AlertDialogTitle className="font-montserrat text-lg font-bold">Cancelar Tarefa?</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="pt-3 text-sm">
                        Esta tarefa será movida para a lista de cancelados e sairá do fluxo de trabalho ativo. O histórico será mantido.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                
                <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel 
                        onClick={(e) => e.stopPropagation()} 
                        disabled={loading}
                        className="hover:bg-muted"
                    >
                        Voltar
                    </AlertDialogCancel>
                    
                    <AlertDialogAction 
                        onClick={handleDelete} 
                        disabled={loading}
                        className="bg-red-600 font-montserrat text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-red-700 focus:ring-red-600"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Cancelando...
                            </>
                        ) : (
                            'Sim, Cancelar'
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}