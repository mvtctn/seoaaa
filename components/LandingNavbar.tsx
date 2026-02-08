'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './LandingNavbar.module.css'
import { createClient } from '@/lib/supabase/client'
import AuthModal from './AuthModal'
import ThemeToggle from './ThemeToggle'

const supabase = createClient()

export default function LandingNavbar() {
    const pathname = usePathname()
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setIsLoggedIn(!!user)
        }
        checkUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
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
                        <img src="/logo.svg" alt="SEOAAA Logo" width="32" height="32" />
                        <span>SEOAAA</span>
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
                                <ThemeToggle />
                            </div>
                        ) : (
                            <div className={styles.loggedInActions}>
                                <button onClick={() => openAuth('login')} className={styles.navButton}>
                                    Đăng ký / Đăng nhập
                                </button>
                                <ThemeToggle />
                            </div>
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
                    <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-white">Menu</span>
                        <ThemeToggle />
                    </div>
                    <button className={styles.closeBtn} onClick={() => setIsMenuOpen(false)}>&times;</button>
                </div>

                <div className={styles.mobileLinks}>
                    {isLoggedIn ? (
                        <>
                            <Link href="/features" onClick={() => setIsMenuOpen(false)}>Tính Năng</Link>
                            <Link href="/how-it-works" onClick={() => setIsMenuOpen(false)}>Cách Hoạt Động</Link>
                            <Link href="/pricing" onClick={() => setIsMenuOpen(false)}>Bảng Giá</Link>
                            <Link href="/blog" onClick={() => setIsMenuOpen(false)}>Blog</Link>
                            <Link href="/contact" onClick={() => setIsMenuOpen(false)}>Liên Hệ</Link>

                            <div className={styles.mobileSeparator}></div>

                            <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className={styles.mobileDashboardBtn}>
                                Vào Dashboard
                            </Link>
                            <button onClick={handleLogout} className={styles.mobileLogoutBtn}>
                                Đăng Xuất
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/features" onClick={() => setIsMenuOpen(false)}>Tính Năng</Link>
                            <Link href="/how-it-works" onClick={() => setIsMenuOpen(false)}>Cách Hoạt Động</Link>
                            <Link href="/pricing" onClick={() => setIsMenuOpen(false)}>Bảng Giá</Link>
                            <Link href="/blog" onClick={() => setIsMenuOpen(false)}>Blog</Link>
                            <Link href="/contact" onClick={() => setIsMenuOpen(false)}>Liên Hệ</Link>

                            <div className={styles.mobileSeparator}></div>

                            <button onClick={() => openAuth('login')} className={styles.mobileLoginBtn}>
                                Đăng Ký / Đăng Nhập
                            </button>
                        </>
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
