/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_request: Request, context: { params: any }) {
  try {
    const params = await context.params
    const projectId = params.id

    if (!projectId) {
      return NextResponse.json({ error: 'project id is required' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching teams:', error)
      return NextResponse.json({ error: error.message || error }, { status: 500 })
    }

    return NextResponse.json({ teams: data || [] })
  } catch (err: any) {
    console.error('Teams list error:', err)
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
