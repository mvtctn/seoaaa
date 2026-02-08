
import { NextRequest, NextResponse } from 'next/server'
import { getSetting } from '@/lib/db/database'
import { sendEmail } from '@/lib/mail'

export async function POST(req: NextRequest) {
    try {
        const { name, email, subject, message } = await req.json()

        if (!name || !email || !message) {
            return NextResponse.json({ error: 'Vui lòng cung cấp đầy đủ thông tin.' }, { status: 400 })
        }

        // 1. Get Admin Email
        const adminEmail = await getSetting('admin_notification_email')

        if (!adminEmail) {
            console.error('[Contact API] Admin email not configured.')
            // We still proceed but might fail sending mail
        }

        const targetEmail = adminEmail || 'lethanhvinh.p88@gmail.com' // Fallback if not set

        // 2. Send Email to Admin
        try {
            await sendEmail({
                to: targetEmail,
                subject: `[SEOAAA Contact] ${subject || 'Tin nhắn mới từ khách hàng'}`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px;">
                        <h2 style="color: #0ea5e9; border-bottom: 2px solid #0ea5e9; padding-bottom: 10px;">Tin nhắn liên hệ mới</h2>
                        <p><strong>Khách hàng:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Chủ đề:</strong> ${subject || 'Không có'}</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p><strong>Nội dung tin nhắn:</strong></p>
                        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${message}</div>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 12px; color: #666;">Gửi từ form liên hệ SEOAAA vào lúc ${new Date().toLocaleString('vi-VN')}</p>
                    </div>
                `
            })
        } catch (mailError) {
            console.error('[Contact API] Failed to send email:', mailError)
            // Still return success to user but log the error
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('[Contact API Error]:', error)
        return NextResponse.json({
            error: error.message || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.',
            details: error.toString()
        }, { status: 500 })
    }
}
