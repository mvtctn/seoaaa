
'use client'

import { useState, useEffect } from 'react'
import styles from './settings.module.css'

export default function SettingsPage() {
    const [smtp, setSmtp] = useState({
        host: '',
        port: '587',
        user: '',
        pass: '',
        from: ''
    })
    const [adminEmail, setAdminEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [testLoading, setTestLoading] = useState(false)
    const [testStatus, setTestStatus] = useState<'success' | 'error' | null>(null)

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const [smtpRes, adminRes] = await Promise.all([
                fetch('/api/settings?key=smtp_config'),
                fetch('/api/settings?key=admin_notification_email')
            ])
            const smtpData = await smtpRes.json()
            const adminData = await adminRes.json()

            if (smtpData.value) setSmtp(smtpData.value)
            if (adminData.value) setAdminEmail(adminData.value)
        } catch (err) {
            console.error('Failed to load settings', err)
        }
    }

    const handleTestEmail = async () => {
        if (!smtp.host || !smtp.user || !smtp.pass) {
            setError('Vui lòng điền đầy đủ cấu hình SMTP trước khi test')
            return
        }
        if (!adminEmail) {
            setError('Vui lòng nhập Email Nhận Thông Báo để test')
            return
        }

        setTestLoading(true)
        setTestStatus(null)
        setError(null)

        try {
            const res = await fetch('/api/settings/test-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ smtp, testEmail: adminEmail })
            })
            const data = await res.json()
            if (res.ok) {
                setTestStatus('success')
            } else {
                throw new Error(data.error || 'Gửi mail test thất bại')
            }
        } catch (err: any) {
            setError(err.message)
            setTestStatus('error')
        } finally {
            setTestLoading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setSaved(false)
        setError(null)
        setTestStatus(null)

        try {
            const results = await Promise.all([
                fetch('/api/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: 'smtp_config', value: smtp })
                }),
                fetch('/api/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: 'admin_notification_email', value: adminEmail })
                })
            ])

            if (results.every(r => r.ok)) {
                setSaved(true)
                setTimeout(() => setSaved(false), 3000)
            } else {
                // Try to get error message from first failing response
                const failingRes = results.find(r => !r.ok)
                const errorData = await failingRes?.json()
                throw new Error(errorData?.error || 'Some settings failed to save')
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Cài Đặt Hệ Thống</h1>
                <p className={styles.subtitle}>Cấu hình Email, Thông báo và các thiết lập chung của ứng dụng.</p>
            </header>

            <form onSubmit={handleSave}>
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>📧 Cấu Hình SMTP (Gửi Mail)</h2>
                    <div className={styles.formGrid}>
                        <div className={styles.fullWidth}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>SMTP Host</label>
                                <input
                                    className={styles.input}
                                    placeholder="smtp.gmail.com"
                                    value={smtp.host}
                                    onChange={e => setSmtp({ ...smtp, host: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>SMTP Port</label>
                            <input
                                className={styles.input}
                                placeholder="587"
                                value={smtp.port}
                                onChange={e => setSmtp({ ...smtp, port: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Tên Người Gửi (From Header)</label>
                            <input
                                className={styles.input}
                                placeholder="SeoAAA Bot"
                                value={smtp.from}
                                onChange={e => setSmtp({ ...smtp, from: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>SMTP User (Email)</label>
                            <input
                                className={styles.input}
                                placeholder="your-email@gmail.com"
                                value={smtp.user}
                                onChange={e => setSmtp({ ...smtp, user: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>SMTP Password (Mật khẩu ứng dụng)</label>
                            <input
                                type="password"
                                className={styles.input}
                                placeholder="••••••••••••"
                                value={smtp.pass}
                                onChange={e => setSmtp({ ...smtp, pass: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>🔔 Thông Báo Người Dùng Mới</h2>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Email Nhận Thông Báo (Admin)</label>
                        <input
                            className={styles.input}
                            placeholder="admin@example.com"
                            value={adminEmail}
                            onChange={e => setAdminEmail(e.target.value)}
                        />
                        <p className="text-xs text-secondary mt-2">Địa chỉ email này sẽ nhận thông báo khi có người dùng mới đăng ký hoặc liên hệ.</p>
                    </div>
                </div>

                <div className={styles.footer}>
                    <div className="flex-1">
                        {error && <div className={styles.errorMessage}>❌ {error}</div>}
                        {testStatus === 'success' && <div className={styles.successMessage}>✅ Kết nối thành công! Kiểm tra hộp thư của bạn.</div>}
                        {saved && <div className={styles.successMessage}>✨ Đã lưu cấu hình hệ thống</div>}
                    </div>

                    <button
                        type="button"
                        className={styles.testBtn}
                        onClick={handleTestEmail}
                        disabled={testLoading || loading}
                    >
                        {testLoading ? 'Đang kiểm tra...' : 'Test Connection'}
                    </button>

                    <button type="submit" className={styles.saveBtn} disabled={loading || testLoading}>
                        {loading ? 'Đang lưu...' : 'Lưu Cài Đặt'}
                    </button>
                </div>
            </form>
        </div>
    )
}
