'use server'

import { createClient } from '@/lib/supabase/server'
import {
  commentNotificationHtml,
  sendEmail,
} from '@/lib/email'

export async function addCommentAction(itemId: string, content: string) {
  const comment = content.trim()
  if (!comment) return { error: 'Escreva um comentário.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autorizado.' }

  const { error: insertError } = await supabase.from('qa_comments').insert({
    qa_item_id: itemId,
    user_id: user.id,
    content: comment,
  })

  if (insertError) {
    return { error: insertError.message || 'Erro ao salvar comentário.' }
  }

  try {
    await notifyCommentRecipients({
      itemId,
      commenterId: user.id,
      comment,
    })
  } catch (error) {
    console.error('Erro ao notificar comentário:', error)
  }

  return { success: true }
}

async function notifyCommentRecipients({
  itemId,
  commenterId,
  comment,
}: {
  itemId: string
  commenterId: string
  comment: string
}) {
  const supabase = await createClient()
  const { data: item } = await supabase
    .from('qa_items')
    .select('id, title, created_by, assigned_to, category_id')
    .eq('id', itemId)
    .single()

  if (!item) return

  const { data: category } = await supabase
    .from('qa_categories')
    .select('project_id')
    .eq('id', item.category_id)
    .single()

  const projectId = category?.project_id
  if (!projectId) return

  const { data: project } = await supabase
    .from('projects')
    .select('name')
    .eq('id', projectId)
    .single()

  const { data: commenter } = await supabase
    .from('users')
    .select('name, email')
    .eq('id', commenterId)
    .single()

  const recipientIds = [...new Set([item.created_by, item.assigned_to].filter(Boolean))]
    .filter((id) => id !== commenterId)

  if (recipientIds.length === 0) return

  const { data: recipients } = await supabase
    .from('users')
    .select('id, name, email')
    .in('id', recipientIds)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qa.projetoslayerup.com.br'
  const itemUrl = `${appUrl}/projects/${projectId}/qa/item/${itemId}`
  const commenterName = commenter?.name || commenter?.email || 'Alguém do time'
  const projectName = project?.name || 'Projeto'

  await Promise.all(
    (recipients || [])
      .filter((recipient) => Boolean(recipient.email))
      .map((recipient) =>
        sendEmail({
          to: recipient.email as string,
          subject: `Novo comentário em “${item.title}”`,
          html: commentNotificationHtml({
            recipientName: recipient.name || '',
            commenterName,
            itemTitle: item.title,
            projectName,
            comment,
            itemUrl,
          }),
        }),
      ),
  )
}
