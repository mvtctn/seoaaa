'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './LandingNavbar.module.css'
import { createClient } from '@/lib/supabase/client'
import AuthModal from './AuthModal'

export default function LandingNavbar() {
    const pathname = usePathname()
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
    const supabase = createClient()

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setIsLoggedIn(!!user)
        }
        checkUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setIsLoggedIn(!!session?.user)
            if (session?.user) setIsAuthModalOpen(false)
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [supabase])

    const openAuth = (mode: 'login' | 'register') => {
        setAuthMode(mode)
        setIsAuthModalOpen(true)
    }

    return (
        <>
            <nav className={styles.nav}>
                <div className={styles.navContent}>
                    <Link href="/" className={styles.logo}>
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                            <rect width="32" height="32" rx="8" fill="url(#gradient)" />
                            <path d="M16 8L24 12V20L16 24L8 20V12L16 8Z" fill="white" opacity="0.9" />
                            <defs>
                                <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32">
                                    <stop offset="0%" stopColor="#0ea5e9" />
                                    <stop offset="100%" stopColor="#2563eb" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <span>SEO Engine</span>
                    </Link>

                    <div className={styles.navLinks}>
                        <Link href="/features" className={pathname === '/features' ? styles.active : ''}>Tính Năng</Link>
                        <Link href="/how-it-works" className={pathname === '/how-it-works' ? styles.active : ''}>Cách Hoạt Động</Link>
                        <Link href="/pricing" className={pathname === '/pricing' ? styles.active : ''}>Giá</Link>
                        <Link href="/blog" className={pathname?.startsWith('/blog') ? styles.active : ''}>Blog</Link>
                        <Link href="/contact" className={pathname === '/contact' ? styles.active : ''}>Liên Hệ</Link>

                        {isLoggedIn ? (
                            <Link href="/dashboard" className={styles.navButton}>
                                Vào Dashboard
                            </Link>
                        ) : (
                            <button onClick={() => openAuth('login')} className={styles.navButton}>
                                Đăng ký / Đăng nhập
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                initialMode={authMode}
            />
        </>
    )
}
