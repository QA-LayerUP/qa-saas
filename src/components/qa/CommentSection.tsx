/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Send, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Comment {
    id: string
    content: string
    created_at: string
    user_id: string
    user: {
        name: string
        email: string
    }
}

interface CommentSectionProps {
    itemId: string
    comments: Comment[]
    currentUserId: string
}

export function CommentSection({ itemId, comments, currentUserId }: CommentSectionProps) {
    const [newComment, setNewComment] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim()) return

        setSubmitting(true)
        try {
            const { error } = await supabase
                .from('qa_comments')
                .insert([
                    {
                        qa_item_id: itemId,
                        user_id: currentUserId,
                        content: newComment,
                    }
                ])

            if (error) throw error

            setNewComment('')
            router.refresh()
        } catch (error: any) {
            console.error('Error posting comment:', error)
            alert(`Error posting comment: ${error.message || 'Unknown error'}`)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <h3 className="font-montserrat text-lg font-semibold">Comentários</h3>

            <div className="space-y-4">
                {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-[#7900E5]/10 text-xs text-[#7900E5]">
                                {comment.user.name?.[0] || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{comment.user.name || 'Usuário'}</span>
                                <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ptBR })}
                                </span>
                            </div>
                            <p className="rounded-lg border bg-muted/30 p-3 text-sm text-foreground">{comment.content}</p>
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-3">
                <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escreva um comentário..."
                    className="min-h-20"
                />
                <Button 
                    type="submit" 
                    size="icon" 
                    disabled={submitting || !newComment.trim()}
                    className="bg-[#7900E5] text-white hover:bg-[#ff28c6]"
                >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
            </form>
        </div>
    )
}
