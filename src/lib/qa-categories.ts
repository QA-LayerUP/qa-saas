import type { SupabaseClient } from '@supabase/supabase-js'

export const QA_CATEGORY_LABELS = [
  'Desktop',
  'Mobile',
  'SEO',
  'Imagens',
  'Conteúdo',
  'Formulários',
  'Navegação',
  'Checkout',
  'Performance',
  'Acessibilidade',
  'Integrações',
] as const

export type QaCategoryLabel = (typeof QA_CATEGORY_LABELS)[number]

export async function ensureQaCategory(
  supabase: SupabaseClient,
  {
    projectId,
    teamId,
    title,
  }: {
    projectId: string
    teamId?: string | null
    title: string
  },
): Promise<string> {
  const { data: existing, error: lookupError } = await supabase
    .from('qa_categories')
    .select('id, team_id')
    .eq('project_id', projectId)
    .eq('title', title)

  if (lookupError) throw lookupError

  const match =
    existing?.find((category) => category.team_id === teamId) ??
    existing?.[0]

  if (match) return match.id

  const { data: created, error: insertError } = await supabase
    .from('qa_categories')
    .insert({
      project_id: projectId,
      title,
      team_id: teamId || null,
    })
    .select('id')
    .single()

  if (insertError || !created) {
    throw insertError || new Error('Não foi possível definir a categoria.')
  }

  return created.id
}
