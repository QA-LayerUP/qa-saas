'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
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
} from '@/components/ui/alert-dialog'
import { Trash2, Loader2 } from 'lucide-react'

interface DeleteProjectButtonProps {
    projectId: string
    className?: string
}

export function DeleteProjectButton({ projectId, className }: DeleteProjectButtonProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleDelete = async () => {
        setLoading(true)
        try {
            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', projectId)

            if (error) throw error

            router.refresh()
        } catch (error) {
            console.error('Error deleting project:', error)
            alert('Erro ao excluir projeto.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`text-red-500 hover:bg-red-500/10 hover:text-red-600 ${className}`}
                    disabled={loading}
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-[425px]">
                <AlertDialogHeader>
                    <div className="mb-2 flex items-center gap-2">
                        <div className="rounded-lg bg-red-500/10 p-2">
                            <Trash2 className="h-5 w-5 text-red-500" />
                        </div>
                        <AlertDialogTitle className="font-montserrat text-lg font-bold">
                            Excluir Projeto?
                        </AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="text-sm leading-relaxed">
                        Esta ação não pode ser desfeita. Isso excluirá permanentemente o projeto e todos os seus itens de QA associados.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="text-xs">
                        Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={handleDelete} 
                        className="bg-red-500 font-montserrat text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-red-600"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Excluindo...
                            </>
                        ) : (
                            'Excluir'
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
