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
    const [isMenuOpen, setIsMenuOpen] = useState(false)
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
        setIsMenuOpen(false)
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        setIsLoggedIn(false)
        setIsMenuOpen(false)
        window.location.reload()
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
                        <Link href="/pricing" className={pathname === '/pricing' ? styles.active : ''}>Bảng Giá</Link>
                        <Link href="/blog" className={pathname?.startsWith('/blog') ? styles.active : ''}>Blog</Link>
                        <Link href="/contact" className={pathname === '/contact' ? styles.active : ''}>Liên Hệ</Link>

                        {isLoggedIn ? (
                            <div className={styles.loggedInActions}>
                                <Link href="/dashboard" className={styles.navButton}>
                                    Dashboard
                                </Link>
                                <button onClick={handleLogout} className={styles.logoutButton}>
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => openAuth('login')} className={styles.navButton}>
                                Đăng ký / Đăng nhập
                            </button>
                        )}
                    </div>

                    <button className={styles.burgerBtn} onClick={() => setIsMenuOpen(true)}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </nav>

            <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ''}`}>
                <div className={styles.mobileHeader}>
                    <span className="text-xl font-bold text-white">Menu</span>
                    <button className={styles.closeBtn} onClick={() => setIsMenuOpen(false)}>&times;</button>
                </div>
                <div className={styles.mobileLinks}>
                    <Link href="/features" onClick={() => setIsMenuOpen(false)}>Tính Năng</Link>
                    <Link href="/how-it-works" onClick={() => setIsMenuOpen(false)}>Cách Hoạt Động</Link>
                    <Link href="/pricing" onClick={() => setIsMenuOpen(false)}>Bảng Giá</Link>
                    <Link href="/blog" onClick={() => setIsMenuOpen(false)}>Blog</Link>
                    <Link href="/contact" onClick={() => setIsMenuOpen(false)}>Liên Hệ</Link>

                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '1rem 0' }}></div>

                    {isLoggedIn ? (
                        <>
                            <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} style={{ color: '#60a5fa' }}>
                                Vào Dashboard
                            </Link>
                            <button onClick={handleLogout} style={{ textAlign: 'left', color: '#f87171', background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>
                                Đăng Xuất
                            </button>
                        </>
                    ) : (
                        <button onClick={() => openAuth('login')} style={{ textAlign: 'left', color: '#60a5fa', background: 'none', border: 'none', fontSize: '1.25rem', fontWeight: 600, cursor: 'pointer' }}>
                            Đăng Ký / Đăng Nhập
                        </button>
                    )}
                </div>
            </div>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                initialMode={authMode}
            />
        </>
    )
}
