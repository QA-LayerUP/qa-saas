'use server'

import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function inviteUserAction(email: string, role: string) {
    const supabase = await createClient()

    // 1. Verificar permissão (Segurança Extra)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Não autorizado' }

    // 2. Criar registro no banco (user_invites)
    const { error: dbError } = await supabase
        .from('user_invites')
        .insert({
            email,
            role,
            status: 'pending',
            created_by: user.id
        })

    if (dbError) {
        // Tratamento para duplicidade (se já convidou esse email)
        if (dbError.code === '23505') {
            return { error: 'Este e-mail já possui um convite pendente.' }
        }
        return { error: 'Erro ao salvar convite no banco.' }
    }

    // 3. Enviar E-mail via Resend
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/signup?email=${encodeURIComponent(email)}`

    try {
        await resend.emails.send({
            from: 'QAHub <onboarding@resend.dev>', // Use seu domínio verificado em produção
            to: email,
            subject: 'Você foi convidado para o QAHub',
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h1 style="color: #7900E5;">Você foi convidado!</h1>
                    <p>Olá,</p>
                    <p>Você recebeu um convite para colaborar no <strong>QAHub</strong> como <strong>${role.toUpperCase()}</strong>.</p>
                    <p>Clique no botão abaixo para criar sua conta e acessar os projetos:</p>
                    <a href="${inviteLink}" style="display: inline-block; background-color: #7900E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;">
                        Aceitar Convite e Criar Conta
                    </a>
                    <p style="margin-top: 20px; font-size: 12px; color: #666;">
                        Se você não esperava este convite, pode ignorar este e-mail.
                    </p>
                </div>
            `
        })
        return { success: true }
    } catch (emailError) {
        console.error('Erro Resend:', emailError)
        // Opcional: Se falhar o email, talvez deletar o convite do banco?
        return { error: 'Convite salvo, mas erro ao enviar e-mail.' }
    }
}