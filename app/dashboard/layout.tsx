'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import styles from './dashboard.module.css'
import { createClient } from '@/lib/supabase/client'

const PAGE_TITLES: { [key: string]: string } = {
    '/dashboard': 'Dashboard',
    '/dashboard/generate': 'Tạo Nội Dung',
    '/dashboard/batch': 'Xử Lý Hàng Loạt',
    '/dashboard/articles': 'Thư Viện Nội Dung',
    '/dashboard/rewrite': 'Viết Lại Nội Dung',
    '/dashboard/brand': 'Cài Đặt Thương Hiệu',
    '/dashboard/profile': 'Cài Đặt Cá Nhân',
    '/dashboard/admin/users': 'Quản Lý Thành Viên',
    '/dashboard/settings': 'Cài Đặt Hệ Thống',
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [pageTitle, setPageTitle] = useState('Dashboard')
    const [user, setUser] = useState<any>(null)
    const supabase = createClient()

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        fetchUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null)
        })

        // Find matching title
        let title = 'Dashboard'
        for (const [path, name] of Object.entries(PAGE_TITLES)) {
            if (pathname === path || pathname?.startsWith(path + '/')) {
                title = name
                break
            }
        }
        setPageTitle(title)

        // Close sidebar on route change (mobile)
        setIsSidebarOpen(false)

        return () => subscription.unsubscribe()
    }, [pathname, supabase])

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

    return (
        <div className={styles.dashboardContainer}>
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className={styles.overlay}
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
                <div className={styles.sidebarHeader}>
                    <Link href="/">
                        <h2 className={styles.logo}>SEO Engine</h2>
                    </Link>
                    <button
                        className={styles.closeSidebar}
                        onClick={() => setIsSidebarOpen(false)}
                        aria-label="Close menu"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <nav className={styles.nav}>
                    <Link href="/dashboard" className={styles.navLink}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7" />
                            <rect x="14" y="3" width="7" height="7" />
                            <rect x="14" y="14" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" />
                        </svg>
                        <span>Dashboard</span>
                    </Link>

                    <Link href="/dashboard/generate" className={styles.navLink}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        <span>Tạo Nội Dung</span>
                    </Link>

                    <Link href="/dashboard/batch" className={styles.navLink}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                            <rect x="8" y="2" width="8" height="4" rx="1" />
                        </svg>
                        <span>Xử Lý Hàng Loạt</span>
                    </Link>

                    <Link href="/dashboard/articles" className={styles.navLink}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                        </svg>
                        <span>Thư Viện Nội Dung</span>
                    </Link>

                    <Link href="/dashboard/rewrite" className={styles.navLink}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        <span>Viết Lại Nội Dung</span>
                    </Link>

                    <Link href="/dashboard/brand" className={styles.navLink}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        <span>Cài Đặt Thương Hiệu</span>
                    </Link>

                    {user?.user_metadata?.role === 'admin' && (
                        <div className={styles.adminNav}>
                            <div className={styles.navSeparator}>Quản Trị Hệ Thống</div>
                            <Link href="/dashboard/admin/users" className={styles.navLink}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                                <span>Quản Lý Thành Viên</span>
                            </Link>
                            <Link href="/dashboard/settings" className={styles.navLink}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                </svg>
                                <span>Cài Đặt Hệ Thống</span>
                            </Link>
                        </div>
                    )}
                </nav>

                <div className={styles.sidebarFooter}>
                    <Link href="/dashboard/profile" className={styles.settingsLink}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                        <span>Cài đặt tài khoản</span>
                    </Link>
                    <button
                        onClick={async () => {
                            await supabase.auth.signOut()
                            router.push('/')
                        }}
                        className={styles.logoutBtn}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span>Đăng xuất</span>
                    </button>
                    <div className={styles.userInfo}>
                        <div className={styles.userAvatar}>
                            {user?.user_metadata?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div className={styles.userDetails}>
                            <div className={styles.userName}>
                                {user?.user_metadata?.display_name || user?.user_metadata?.full_name || 'Người dùng'}
                            </div>
                            <div className={styles.userRole}>
                                {user?.user_metadata?.role || 'Thành viên'}
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.mainContent}>
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        <button
                            className={styles.menuBurger}
                            onClick={toggleSidebar}
                            aria-label="Toggle menu"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 12h18M3 6h18M3 18h18" />
                            </svg>
                        </button>
                        <h1 className={styles.pageTitle}>{pageTitle}</h1>
                    </div>

                    <div className={styles.headerRight}>
                        <button className="btn btn-icon btn-ghost">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                        </button>

                        <button className="btn btn-icon btn-ghost">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="3" />
                                <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" />
                            </svg>
                        </button>
                    </div>
                </header>

                <div className={styles.content}>
                    {children}
                </div>
            </main>
        </div>
    )
}
