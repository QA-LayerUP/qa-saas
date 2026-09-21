import { createClient } from '@/lib/supabase/server'
import { ProfileSettings } from '@/components/settings/ProfileSettings'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'

export default async function SettingsPage() {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        redirect('/auth/login')
    }

    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

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
        <div className="mx-auto flex max-w-5xl flex-col">
            <PageHeader
                eyebrow="Conta"
                title="Configurações"
                description="Gerencie seu perfil, times e preferências de segurança."
            />
            <ProfileSettings
                user={profile || { id: user.id, email: user.email }}
                teams={myTeams || []}
            />
        </div>
    )
}
