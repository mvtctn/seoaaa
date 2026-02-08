
'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import styles from './settings.module.css'

// Initial state for form
const INITIAL_STATE = {
    smtp: { host: '', port: '587', user: '', pass: '', from: '' },
    adminEmail: '',
    seo: { google_analytics_id: '', search_console_id: '' }
}

// Fetch function
const fetchSettings = async () => {
    const [smtpRes, adminRes, seoRes] = await Promise.all([
        fetch('/api/settings?key=smtp_config'),
        fetch('/api/settings?key=admin_notification_email'),
        fetch('/api/settings?key=seo_config')
    ])

    const smtpData = await smtpRes.json()
    const adminData = await adminRes.json()
    const seoData = await seoRes.json()

    return {
        smtp: smtpData.value || INITIAL_STATE.smtp,
        adminEmail: adminData.value || '',
        seo: seoData.value || INITIAL_STATE.seo
    }
}

// Save function
const saveSettingsApi = async (data: typeof INITIAL_STATE) => {
    const results = await Promise.all([
        fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'smtp_config', value: data.smtp })
        }),
        fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'admin_notification_email', value: data.adminEmail })
        }),
        fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'seo_config', value: data.seo })
        })
    ])

    if (!results.every(r => r.ok)) {
        throw new Error('Một số cài đặt không lưu được.')
    }
    return true
}

// Test Email function
const testEmailApi = async ({ smtp, testEmail }: { smtp: any, testEmail: string }) => {
    const res = await fetch('/api/settings/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ smtp, testEmail })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Gửi mail test thất bại')
    return data
}

export default function SettingsPage() {
    const queryClient = useQueryClient()
    const [formData, setFormData] = useState(INITIAL_STATE)
    const [successMessage, setSuccessMessage] = useState('')

    // Fetch Data
    const { data: settings, isLoading } = useQuery({
        queryKey: ['settings'],
        queryFn: fetchSettings,
        staleTime: 5 * 60 * 1000, // cache for 5 mins
    })

    // Sync data to form
    useEffect(() => {
        if (settings) {
            setFormData(settings)
        }
    }, [settings])

    // Save Mutation
    const saveMutation = useMutation({
        mutationFn: saveSettingsApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] })
            setSuccessMessage('✨ Đã lưu cấu hình hệ thống')
            setTimeout(() => setSuccessMessage(''), 3000)
        },
        onError: (err) => {
            console.error(err)
        }
    })

    // Test Email Mutation
    const testEmailMutation = useMutation({
        mutationFn: testEmailApi,
        onSuccess: () => {
            setSuccessMessage('✅ Kết nối thành công! Kiểm tra hộp thư của bạn.')
            setTimeout(() => setSuccessMessage(''), 5000)
        }
    })

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault()
        saveMutation.mutate(formData)
    }

    const handleTestEmail = () => {
        if (!formData.smtp.host || !formData.smtp.user || !formData.smtp.pass) {
            alert('Vui lòng điền đầy đủ cấu hình SMTP trước khi test')
            return
        }
        if (!formData.adminEmail) {
            alert('Vui lòng nhập Email Nhận Thông Báo để test')
            return
        }
        testEmailMutation.mutate({ smtp: formData.smtp, testEmail: formData.adminEmail })
    }

    if (isLoading) {
        return <div className="text-center py-20 text-secondary">Đang tải cài đặt...</div>
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Cài Đặt Hệ Thống</h1>
                <p className={styles.subtitle}>Cấu hình Email, Thông báo và các thiết lập SEO của ứng dụng.</p>
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
                                    value={formData.smtp.host}
                                    onChange={e => setFormData({ ...formData, smtp: { ...formData.smtp, host: e.target.value } })}
                                />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>SMTP Port</label>
                            <input
                                className={styles.input}
                                placeholder="587"
                                value={formData.smtp.port}
                                onChange={e => setFormData({ ...formData, smtp: { ...formData.smtp, port: e.target.value } })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Tên Người Gửi (From Header)</label>
                            <input
                                className={styles.input}
                                placeholder="SeoAAA Bot"
                                value={formData.smtp.from}
                                onChange={e => setFormData({ ...formData, smtp: { ...formData.smtp, from: e.target.value } })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>SMTP User (Email)</label>
                            <input
                                className={styles.input}
                                placeholder="your-email@gmail.com"
                                value={formData.smtp.user}
                                onChange={e => setFormData({ ...formData, smtp: { ...formData.smtp, user: e.target.value } })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>SMTP Password (Mật khẩu ứng dụng)</label>
                            <input
                                type="password"
                                className={styles.input}
                                placeholder="••••••••••••"
                                value={formData.smtp.pass}
                                onChange={e => setFormData({ ...formData, smtp: { ...formData.smtp, pass: e.target.value } })}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>📈 Google Analytics & Console</h2>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Google Analytics ID (G-XXXXXXX)</label>
                            <input
                                className={styles.input}
                                placeholder="G-XXXXXXXXXX"
                                value={formData.seo.google_analytics_id}
                                onChange={e => setFormData({ ...formData, seo: { ...formData.seo, google_analytics_id: e.target.value } })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Google Search Console ID</label>
                            <input
                                className={styles.input}
                                placeholder="Mã xác thực meta tag"
                                value={formData.seo.search_console_id}
                                onChange={e => setFormData({ ...formData, seo: { ...formData.seo, search_console_id: e.target.value } })}
                            />
                        </div>
                    </div>
                    <p className="text-xs text-secondary mt-3">Các mã này sẽ được tự động chèn vào thẻ &lt;head&gt; của toàn bộ trang web.</p>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>🔔 Thông Báo Người Dùng Mới</h2>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Email Nhận Thông Báo (Admin)</label>
                        <input
                            className={styles.input}
                            placeholder="admin@example.com"
                            value={formData.adminEmail}
                            onChange={e => setFormData({ ...formData, adminEmail: e.target.value })}
                        />
                        <p className="text-xs text-secondary mt-2">Địa chỉ email này sẽ nhận thông báo khi có người dùng mới đăng ký hoặc liên hệ.</p>
                    </div>
                </div>

                <div className={styles.footer}>
                    <div className="flex-1">
                        {saveMutation.isError && <div className={styles.errorMessage}>❌ {saveMutation.error?.message}</div>}
                        {testEmailMutation.isError && <div className={styles.errorMessage}>❌ {testEmailMutation.error?.message}</div>}

                        {successMessage && <div className={styles.successMessage}>{successMessage}</div>}
                    </div>

                    <button
                        type="button"
                        className={styles.testBtn}
                        onClick={handleTestEmail}
                        disabled={saveMutation.isPending || testEmailMutation.isPending}
                    >
                        {testEmailMutation.isPending ? 'Đang kiểm tra...' : 'Test Connection'}
                    </button>

                    <button type="submit" className={styles.saveBtn} disabled={saveMutation.isPending || testEmailMutation.isPending}>
                        {saveMutation.isPending ? 'Đang lưu...' : 'Lưu Cài Đặt'}
                    </button>
                </div>
            </form>
        </div>
    )
}
