import { createClient } from '@/lib/supabase/server'
import { ProfileSettings } from '@/components/settings/ProfileSettings'
import { redirect } from 'next/navigation'
import { Users } from 'lucide-react'

export default async function SettingsPage() {
    const supabase = await createClient()

    // 1. Verificar Sessão
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        redirect('/auth/login')
    }

    // 2. Buscar Perfil (Nome, Email)
    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    // 3. Buscar Times que o usuário faz parte
    const { data: myTeams } = await supabase
        .from('team_members')
        .select(`
            id,
            role,
            team:teams (
                id,
                name,
                description
            )
        `)
        .eq('user_id', user.id)

    return (
        <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
            <div className="flex items-start gap-3">
                <div className="rounded-lg bg-[#7900E5]/10 p-2.5">
                    <Users className="h-6 w-6 text-[#7900E5]" />
                </div>
                <div>
                <div className="flex items-center gap-2">
                    <div className="h-1 w-6 rounded-full bg-linear-to-r from-[#7900E5] to-[#7900E5]" />
                    <p className="font-montserrat text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7900E5] dark:text-white">
                        {'// Configurações do Usuário'}
                    </p>
                </div>
                    <h1 className="font-montserrat text-3xl font-bold tracking-tight">Configurações</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Gerencie seu perfil, times e preferências de segurança.</p>
                </div>
            </div>

            {/* Componente Cliente com a Lógica */}
            <ProfileSettings 
                user={profile || { id: user.id, email: user.email }} 
                teams={myTeams || []} 
            />
        </div>
    )
}