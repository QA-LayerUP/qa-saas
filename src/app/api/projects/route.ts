/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user (will respect RLS)
    const { data: userData } = await supabase.auth.getUser()

    // Fetch projects — RLS will apply per-supabase configuration
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ user: userData.user, projects: data })
  } catch (err: any) {
    console.error('Projects list error:', err)
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
