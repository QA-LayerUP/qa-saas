'use server'

import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function inviteUserAction(email: string, role: string) {
    const supabase = await createClient()

    // 1. Verificar permissão
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Não autorizado' }

    // 2. Criar registro no banco
    const { error: dbError } = await supabase
        .from('user_invites')
        .insert({
            email,
            role,
            status: 'pending',
            created_by: user.id
        })

    if (dbError) {
        if (dbError.code === '23505') {
            return { error: 'Este e-mail já possui um convite pendente.' }
        }
        return { error: 'Erro ao salvar convite no banco.' }
    }

    // Link para o cadastro já com o email preenchido
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/signup?email=${encodeURIComponent(email)}`
    
    // Formatação da Role para ficar bonito no texto (ex: "admin" -> "Admin")
    const formattedRole = role.charAt(0).toUpperCase() + role.slice(1);

    try {
        await resend.emails.send({
            from: 'QA Hub · Layer Up <onboarding@qa.projetoslayerup.com.br>', // Lembre de validar seu domínio no Resend para produção
            to: email,
            subject: 'Você foi convidado para o QA Hub · Layer Up',
            html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Você recebeu um convite</title>
  <style>
    body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    a { text-decoration: none; }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 20px !important; }
      .content { padding: 20px !important; }
    }
  </style>
</head>
<body style="background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155;">

  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        
        <table border="0" cellpadding="0" cellspacing="0" width="600" class="container" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
          
          <tr>
            <td align="center" style="padding: 40px 40px 20px 40px;">
              <img src="https://projetoslayerup.com.br/LOGO-LAYER.png" alt="Logo Layer Up" width="180" style="display: block; width: 180px; height: auto;">
            </td>
          </tr>

          <tr>
            <td class="content" style="padding: 20px 40px 40px 40px; text-align: center;">
              <h1 style="margin: 0 0 20px 0; color: #0f172a; font-size: 24px; font-weight: 700;">Você recebeu um convite!</h1>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 24px; color: #475569;">
                Olá! Você foi convidado para colaborar na plataforma <strong>QAHub</strong> da Layer Up.
              </p>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 24px; color: #475569;">
                Seu nível de acesso será: <strong style="color: #7900E5; text-transform: uppercase;">${formattedRole}</strong>.
              </p>

              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${inviteLink}" target="_blank" style="display: inline-block; padding: 14px 32px; background-color: #0f172a; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 6px; text-align: center;">
                      Aceitar Convite
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0 0; font-size: 13px; color: #94a3b8;">
                Ou copie e cole o link abaixo no seu navegador:
              </p>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #3b82f6; word-break: break-all;">
                <a href="${inviteLink}" style="color: #3b82f6;">${inviteLink}</a>
              </p>

            </td>
          </tr>
        </table>

        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td align="center" style="padding-top: 24px; color: #94a3b8; font-size: 12px;">
              <p style="margin: 0;">&copy; 2025 Layer Up / QAHub. Todos os direitos reservados. By Ale Dev</p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>
            `
        })
        return { success: true }
    } catch (emailError) {
        console.error('Erro Resend:', emailError)
        return { error: 'Convite salvo, mas erro ao enviar e-mail.' }
    }
}