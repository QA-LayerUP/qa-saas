/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request, 
  context: { params: Promise<{ id: string, teamId: string }> } // Atualização para Next.js 15+
) {
  try {
    const params = await context.params
    const projectId = params.id
    const teamId = params.teamId

    if (!projectId || !teamId) {
      return NextResponse.json({ error: 'project id and team id are required' }, { status: 400 })
    }

    const supabase = await createClient()

    // A lógica continua válida pois qa_categories tem as duas chaves estrangeiras
    const { data, error } = await supabase
      .from('qa_categories')
      .select('*')
      .eq('project_id', projectId)
      .eq('team_id', teamId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching categories for team:', error)
      return NextResponse.json({ error: error.message || error }, { status: 500 })
    }

    return NextResponse.json({ categories: data || [] })
  } catch (err: any) {
    console.error('Categories by team error:', err)
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}