'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './LandingNavbar.module.css'

export default function LandingNavbar() {
    const pathname = usePathname()

    return (
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
                    <Link href="/dashboard" className={styles.navButton}>
                        Vào Dashboard
                    </Link>
                </div>
            </div>
        </nav>
    )
}
