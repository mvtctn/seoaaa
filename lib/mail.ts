
import nodemailer from 'nodemailer'
import { getSetting } from './db/database'

export async function sendEmail({ to, subject, text, html }: { to: string, subject: string, text?: string, html?: string }) {
    const smtpConfig = await getSetting('smtp_config')

    if (!smtpConfig || !smtpConfig.host || !smtpConfig.user || !smtpConfig.pass) {
        throw new Error('Cấu hình SMTP chưa được thiết lập hoặc không đầy đủ.')
    }

    const transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: parseInt(smtpConfig.port),
        secure: smtpConfig.port === '465',
        auth: {
            user: smtpConfig.user,
            pass: smtpConfig.pass,
        },
    })

    const from = smtpConfig.from || 'SEOAAA Notification'
    const fromAddress = smtpConfig.user

    return await transporter.sendMail({
        from: `"${from}" <${fromAddress}>`,
        to,
        subject,
        text,
        html,
    })
}
