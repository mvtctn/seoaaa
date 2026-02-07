
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from './AuthModal.module.css'

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
    initialMode?: 'login' | 'register'
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
    const [mode, setMode] = useState<'login' | 'register'>(initialMode)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        if (isOpen) {
            setMode(initialMode)
            setError(null)
            setSuccess(false)
            // Prevent scrolling on body when modal is open
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, initialMode])

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (mode === 'login') {
            const { error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) {
                setError(error.message)
                setLoading(false)
            } else {
                router.push('/dashboard')
                onClose()
            }
        } else {
            if (password !== confirmPassword) {
                setError('Mật khẩu xác nhận không khớp')
                setLoading(false)
                return
            }

            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                }
            })

            if (error) {
                setError(error.message)
                setLoading(false)
            } else {
                setSuccess(true)
                setLoading(false)
            }
        }
    }

    const toggleMode = () => {
        setMode(mode === 'login' ? 'register' : 'login')
        setError(null)
    }

    if (!isOpen && !success) return null

    return (
        <div className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ''}`} onClick={onClose}>
            <div className={`${styles.modal} ${isOpen ? styles.modalVisible : ''}`} onClick={e => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>&times;</button>

                <div className={`${styles.orb} styles.orbTop`}></div>
                <div className={`${styles.orb} styles.orbBottom`}></div>

                {success ? (
                    <div className={styles.success}>
                        <h2 className={styles.title}>Đăng ký thành công!</h2>
                        <p className={styles.subtitle}>
                            Vui lòng kiểm tra email của bạn để xác thực tài khoản trước khi đăng nhập.
                        </p>
                        <button className={`${styles.button} mt-6`} onClick={() => { setSuccess(false); setMode('login'); }}>
                            Quay lại đăng nhập
                        </button>
                    </div>
                ) : (
                    <>
                        <div className={styles.header}>
                            <h2 className={styles.title}>
                                {mode === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}
                            </h2>
                            <p className={styles.subtitle}>
                                {mode === 'login'
                                    ? 'Đăng nhập để tiếp tục quản lý nội dung SEO của bạn'
                                    : 'Tham gia hệ thống tạo nội dung SEO tự động bằng AI'}
                            </p>
                        </div>

                        <form className={styles.form} onSubmit={handleAuth}>
                            <div className={styles.inputGroup}>
                                <label>Email address</label>
                                <input
                                    type="email"
                                    required
                                    className={styles.input}
                                    placeholder="email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Password</label>
                                <input
                                    type="password"
                                    required
                                    className={styles.input}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            {mode === 'register' && (
                                <div className={styles.inputGroup}>
                                    <label>Xác nhận mật khẩu</label>
                                    <input
                                        type="password"
                                        required
                                        className={styles.input}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            )}

                            {error && <div className={styles.error}>{error}</div>}

                            <button type="submit" className={styles.button} disabled={loading}>
                                {loading ? 'Đang xử lý...' : (mode === 'login' ? 'Đăng nhập' : 'Đăng ký')}
                            </button>
                        </form>

                        <div className={styles.footer}>
                            {mode === 'login' ? (
                                <p>
                                    Chưa có tài khoản?
                                    <button className={styles.linkButton} onClick={toggleMode}>
                                        Đăng ký ngay
                                    </button>
                                </p>
                            ) : (
                                <p>
                                    Đã có tài khoản?
                                    <button className={styles.linkButton} onClick={toggleMode}>
                                        Đăng nhập
                                    </button>
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
