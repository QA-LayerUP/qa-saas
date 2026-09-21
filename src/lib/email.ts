import nodemailer from 'nodemailer'

export const QA_HUB_FROM =
  process.env.SMTP_FROM || 'QA Hub · Layer Up <nao-responda@qa.projetoslayerup.com.br>'

function getTransporter() {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const port = Number(process.env.SMTP_PORT || 587)

  if (!host || !user || !pass) {
    throw new Error('SMTP não configurado. Defina SMTP_HOST, SMTP_USER e SMTP_PASS.')
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === 'true' || port === 465,
    auth: { user, pass },
  })
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  const transporter = getTransporter()
  await transporter.sendMail({
    from: QA_HUB_FROM,
    to,
    subject,
    html,
  })
}

export function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\n/g, '<br>')
}

export function commentNotificationHtml({
  recipientName,
  commenterName,
  itemTitle,
  projectName,
  comment,
  itemUrl,
}: {
  recipientName: string
  commenterName: string
  itemTitle: string
  projectName: string
  comment: string
  itemUrl: string
}) {
  const greeting = recipientName ? `Olá, ${escapeHtml(recipientName)}` : 'Olá'
  const safeComment = escapeHtml(comment)
  const safeTitle = escapeHtml(itemTitle)
  const safeProject = escapeHtml(projectName)
  const safeCommenter = escapeHtml(commenterName)

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Novo comentário no QA Hub</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#334155;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f8fafc;">
    <tr>
      <td align="center" style="padding:40px 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color:#ffffff;border-radius:12px;border:1px solid #e2e8f0;">
          <tr>
            <td align="center" style="padding:40px 40px 20px 40px;">
              <img src="https://projetoslayerup.com.br/LOGO-LAYER.png" alt="Layer Up" width="180" style="display:block;width:180px;height:auto;">
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px 40px 40px;text-align:center;">
              <h1 style="margin:0 0 20px 0;color:#0f172a;font-size:24px;font-weight:700;">Novo comentário no card</h1>
              <p style="margin:0 0 16px 0;font-size:16px;line-height:24px;color:#475569;">
                ${greeting}! <strong>${safeCommenter}</strong> comentou no card <strong>${safeTitle}</strong> do projeto <strong>${safeProject}</strong>.
              </p>
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 24px 0;">
                <tr>
                  <td style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;text-align:left;font-size:14px;line-height:22px;color:#334155;">
                    ${safeComment}
                  </td>
                </tr>
              </table>
              <a href="${itemUrl}" target="_blank" style="display:inline-block;padding:14px 32px;background-color:#7900e5;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;border-radius:8px;">
                Ver card no QA Hub
              </a>
            </td>
          </tr>
        </table>
        <p style="padding-top:24px;color:#94a3b8;font-size:12px;margin:0;">© Layer Up / QA Hub</p>
      </td>
    </tr>
  </table>
</body>
</html>
`
}
