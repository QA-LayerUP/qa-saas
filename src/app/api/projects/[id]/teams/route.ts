/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    // Em Next.js 15+, params é uma Promise
    const params = await context.params
    const projectId = params.id

    if (!projectId) {
      return NextResponse.json({ error: 'project id is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // --- MUDANÇA PRINCIPAL AQUI ---
    // Antes: Buscava em 'teams' filtrando por project_id
    // Agora: Busca em 'project_teams' e faz JOIN com 'teams'
    const { data, error } = await supabase
      .from('project_teams')
      .select(`
        team:teams (
          id,
          name,
          description,
          created_at
        )
      `)
      .eq('project_id', projectId)
    // ------------------------------

    if (error) {
      console.error('Error fetching teams:', error)
      return NextResponse.json({ error: error.message || error }, { status: 500 })
    }

    // O Supabase retorna algo como: [ { team: { id: 1, name: 'Dev' } }, { team: { ... } } ]
    // Precisamos "achatar" (flatten) isso para retornar apenas a lista de times limpa
    const formattedTeams = data?.map((item: any) => item.team) || []

    return NextResponse.json({ teams: formattedTeams })
    
  } catch (err: any) {
    console.error('Teams list error:', err)
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}