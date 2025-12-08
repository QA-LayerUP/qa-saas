import { createClient } from '@/lib/supabase/server'
import { ProfileSettings } from '@/components/settings/ProfileSettings'
import { redirect } from 'next/navigation'

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
        <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
                <p className="text-muted-foreground">Gerencie seu perfil, times e preferências de segurança.</p>
            </div>

            {/* Componente Cliente com a Lógica */}
            <ProfileSettings 
                user={profile || { id: user.id, email: user.email }} 
                teams={myTeams || []} 
            />
        </div>
    )
}