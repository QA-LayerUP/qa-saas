import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function RootPage() {
  const supabase = await createClient()

  // Verifica a sessão do usuário no servidor
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Se estiver logado, vai direto para o dashboard
    redirect('/dashboard')
  } else {
    // Se não estiver, manda para o login
    redirect('/login')
  }
}