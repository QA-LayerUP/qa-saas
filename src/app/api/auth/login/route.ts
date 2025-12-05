/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    // data contains session and user; cookies should be set by createServerClient implementation
    return NextResponse.json({ session: data.session, user: data.user })
  } catch (err: any) {
    console.error('Login error:', err)
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
