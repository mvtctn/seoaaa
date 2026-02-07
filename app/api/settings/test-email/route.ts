
import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
    try {
        const { smtp, testEmail } = await req.json()

        if (!smtp || !smtp.host || !smtp.user || !smtp.pass) {
            return NextResponse.json({ error: 'Cấu hình SMTP không đầy đủ' }, { status: 400 })
        }

        if (!testEmail) {
            return NextResponse.json({ error: 'Email nhận test không được để trống' }, { status: 400 })
        }

        console.log(`[Test Email] Sending test to ${testEmail} via ${smtp.host}...`)

        const transporter = nodemailer.createTransport({
            host: smtp.host,
            port: parseInt(smtp.port),
            secure: smtp.port === '465', // true for 465, false for other ports
            auth: {
                user: smtp.user,
                pass: smtp.pass,
            },
        })

        await transporter.sendMail({
            from: `"${smtp.from || 'SeoAAA Test'}" <${smtp.user}>`,
            to: testEmail,
            subject: '🔔 Thử nghiệm cấu hình Email - SeoAAA',
            text: 'Chúc mừng! Cấu hình SMTP của bạn đã hoạt động chính xác.',
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 600px;">
                    <h2 style="color: #0ea5e9;">Cấu hình SMTP thành công!</h2>
                    <p>Chào bạn,</p>
                    <p>Đây là email thử nghiệm được gửi từ hệ thống <strong>SeoAAA</strong>.</p>
                    <p>Nếu bạn nhận được email này, điều đó có nghĩa là các thông số SMTP bạn vừa thiết lập đã hoạt động hoàn hảo.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #666;">
                        Thời gian thử nghiệm: ${new Date().toLocaleString('vi-VN')}
                    </p>
                </div>
            `,
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('[Test Email Error]:', error)
        return NextResponse.json({
            error: error.message || 'Gửi mail thử nghiệm thất bại',
            code: error.code
        }, { status: 500 })
    }
}
