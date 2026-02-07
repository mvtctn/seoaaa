
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import styles from './profile.module.css'

export default function ProfilePage() {
    const supabase = createClient()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [user, setUser] = useState<any>(null)

    // Form state
    const [formData, setFormData] = useState({
        full_name: '',
        display_name: '',
        phone: '',
        website: '',
        bio: '',
        company: ''
    })

    useEffect(() => {
        const getUser = async () => {
            const { data: { user }, error } = await supabase.auth.getUser()

            if (error || !user) {
                router.push('/login')
                return
            }

            setUser(user)
            const metadata = user.user_metadata || {}
            setFormData({
                full_name: metadata.full_name || '',
                display_name: metadata.display_name || '',
                phone: metadata.phone || '',
                website: metadata.website || '',
                bio: metadata.bio || '',
                company: metadata.company || ''
            })
            setLoading(false)
        }

        getUser()
    }, [supabase, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError(null)
        setSuccess(false)

        const { error } = await supabase.auth.updateUser({
            data: formData
        })

        if (error) {
            setError(error.message)
        } else {
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        }
        setSaving(false)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="spinner-lg"></div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <Link href="/dashboard" className={styles.backLink}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Quay lại Dashboard
            </Link>

            <header className={styles.header}>
                <h2>Cài Đặt Tài Khoản</h2>
                <p>Quản lý thông tin cá nhân và thiết lập tài khoản của bạn</p>
            </header>

            <div className={styles.profileGrid}>
                {/* Profile Overview Card */}
                <div className={styles.avatarSection}>
                    <div className={styles.card} style={{ width: '100%' }}>
                        <div className={styles.avatarLarge}>
                            {formData.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                        </div>
                        <h3 className="mt-4 mb-1 font-semibold text-lg">{formData.display_name || 'Người dùng'}</h3>
                        <p className="text-sm text-secondary mb-6">{user?.email}</p>

                        <div style={{ textAlign: 'left', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
                            <div className="mb-4">
                                <label className="text-xs uppercase font-bold text-tertiary block mb-1">Vai trò</label>
                                <span className="text-sm font-medium">{user?.user_metadata?.role || 'Thành viên'}</span>
                            </div>
                            <div>
                                <label className="text-xs uppercase font-bold text-tertiary block mb-1">ID Tài khoản</label>
                                <code className="text-[10px] bg-slate-800 p-1 rounded block truncate">{user?.id}</code>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        Thông Tin Cá Nhân
                    </h3>

                    {success && (
                        <div className={styles.successMsg}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <path d="M22 4L12 14.01l-3-3" />
                            </svg>
                            Cập nhật thông tin thành công!
                        </div>
                    )}

                    {error && <div className={styles.errorMsg}>{error}</div>}

                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-4">
                            <div className={styles.inputGroup}>
                                <label htmlFor="full_name">Họ và tên</label>
                                <input
                                    type="text"
                                    id="full_name"
                                    name="full_name"
                                    className={styles.input}
                                    value={formData.full_name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label htmlFor="display_name">Tên hiển thị</label>
                                <input
                                    type="text"
                                    id="display_name"
                                    name="display_name"
                                    className={styles.input}
                                    value={formData.display_name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className={styles.inputGroup}>
                                <label htmlFor="phone">Số điện thoại</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    className={styles.input}
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label htmlFor="company">Công ty</label>
                                <input
                                    type="text"
                                    id="company"
                                    name="company"
                                    className={styles.input}
                                    value={formData.company}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="website">Website</label>
                            <input
                                type="url"
                                id="website"
                                name="website"
                                className={styles.input}
                                value={formData.website}
                                onChange={handleChange}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="bio">Giới thiệu ngắn</label>
                            <textarea
                                id="bio"
                                name="bio"
                                className={styles.textarea}
                                value={formData.bio}
                                onChange={handleChange}
                            />
                        </div>

                        <div className={styles.actions}>
                            <button
                                type="submit"
                                className="btn btn-primary px-8"
                                disabled={saving}
                            >
                                {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
