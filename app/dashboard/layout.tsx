'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import styles from './dashboard.module.css'
import Logo from '@/components/Logo'
import { createClient } from '@/lib/supabase/client'
import ThemeToggle from '@/components/ThemeToggle'
import Image from 'next/image'
import {
    LayoutDashboard,
    PenTool,
    Layers,
    FileText,
    RefreshCw,
    Briefcase,
    User,
    Users,
    Cpu,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Menu, // Import Menu icon for mobile
    CreditCard,
    Package
} from 'lucide-react'

const PAGE_TITLES: { [key: string]: string } = {
    '/dashboard': 'Dashboard',
    '/dashboard/generate': 'Tạo Nội Dung',
    '/dashboard/batch': 'Xử Lý Hàng Loạt',
    '/dashboard/articles': 'Thư Viện Nội Dung',
    '/dashboard/rewrite': 'Viết Lại Nội Dung',
    '/dashboard/brand': 'Cài Đặt Thương Hiệu',
    '/dashboard/profile': 'Cài Đặt Cá Nhân',
    '/dashboard/admin/users': 'Quản Lý Thành Viên',
    '/dashboard/admin/ai': 'AI Orchestrator',
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
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [pageTitle, setPageTitle] = useState('Dashboard')
    const [user, setUser] = useState<any>(null)
    const [subscription, setSubscription] = useState<any>(null)
    const supabase = createClient()

    useEffect(() => {
        // Restore collapsed state from local storage
        const savedCollapsed = localStorage.getItem('sidebarCollapsed')
        if (savedCollapsed === 'true') {
            setIsCollapsed(true)
        }

        const fetchUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)

            if (user) {
                const { data: sub } = await supabase.from('user_subscriptions').select('*').eq('user_id', user.id).maybeSingle()
                setSubscription(sub)
            }
        }
        fetchUserData()

        const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
            const handleAuth = async () => {
                const newUser = session?.user || null
                setUser(newUser)
                if (newUser) {
                    const { data: sub } = await supabase.from('user_subscriptions').select('*').eq('user_id', newUser.id).maybeSingle()
                    setSubscription(sub)
                } else {
                    setSubscription(null)
                }
            }
            handleAuth()
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

        return () => authSub.unsubscribe()
    }, [pathname, supabase])

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

    const toggleCollapse = () => {
        const newState = !isCollapsed
        setIsCollapsed(newState)
        localStorage.setItem('sidebarCollapsed', String(newState))
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const NavItem = ({ href, icon: Icon, label, disabled = false }: { href: string, icon: any, label: string, disabled?: boolean }) => {
        const isActive = pathname === href || pathname?.startsWith(href + '/')

        if (disabled) {
            return (
                <div className={`${styles.navLink} ${styles.disabled} ${isCollapsed ? styles.collapsedLink : ''}`} title={isCollapsed ? label : ''}>
                    <Icon size={20} />
                    {!isCollapsed && <span>{label}</span>}
                    {!isCollapsed && <span className={styles.comingSoonBadge}>Soon</span>}
                </div>
            )
        }

        return (
            <Link
                href={href}
                className={`${styles.navLink} ${isActive ? styles.active : ''} ${isCollapsed ? styles.collapsedLink : ''}`}
                title={isCollapsed ? label : ''}
            >
                <Icon size={20} />
                {!isCollapsed && <span>{label}</span>}
            </Link>
        )
    }

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
            <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''} ${isCollapsed ? styles.collapsed : ''}`}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.logoContainer}>
                        {isCollapsed ? (
                            <div className="flex justify-center w-full">
                                <Logo width={32} height={32} showText={false} />
                            </div>
                        ) : (
                            <Link href="/" className="no-underline">
                                <Logo width={32} height={32} showText={true} />
                            </Link>
                        )}
                    </div>

                    {/* Desktop Collapse Toggle */}
                    <button
                        className={styles.collapseBtn}
                        onClick={toggleCollapse}
                        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>

                    {/* Mobile Close Button */}
                    <button
                        className={styles.closeSidebar}
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <ChevronLeft size={24} />
                    </button>
                </div>

                <div className={styles.nav}>
                    <div className={styles.navGroup}>
                        {!isCollapsed && <div className={styles.navSeparator}>CONTENT</div>}
                        <NavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                        <NavItem href="/dashboard/generate" icon={PenTool} label="Tạo Bài Viết" />
                        <NavItem href="/dashboard/batch" icon={Layers} label="Tạo Hàng Loạt" />
                        <NavItem href="/dashboard/rewrite" icon={RefreshCw} label="Viết Lại (Rewrite)" />
                        <NavItem href="/dashboard/articles" icon={FileText} label="Thư Viện Bài Viết" />
                    </div>

                    <div className={styles.navGroup}>
                        {!isCollapsed && <div className={styles.navSeparator}>SYSTEM</div>}
                        <NavItem href="/dashboard/brand" icon={Briefcase} label="Thương Hiệu (Brand)" />
                        <NavItem href="/dashboard/profile" icon={User} label="Cài Đặt Cá Nhân" />

                        {/* Admin Links */}
                        {(user?.email === 'admin@seoaaa.com' || user?.user_metadata?.role === 'admin') && (
                            <>
                                {!isCollapsed && <div className={styles.navSeparator}>ADMIN</div>}
                                <NavItem href="/dashboard/admin/users" icon={Users} label="Quản Lý Users" />
                                <NavItem href="/dashboard/admin/ai" icon={Cpu} label="AI Orchestrator" />
                                <NavItem href="/dashboard/settings" icon={Settings} label="Cài Đặt Hệ Thống" />
                                <NavItem href="/dashboard/admin/billing" icon={CreditCard} label="Quản Lý Tài Chính" />
                                <NavItem href="/dashboard/admin/plans" icon={Package} label="Quản Lý Gói Cước" />
                            </>
                        )}
                    </div>
                </div>

                <div className={styles.sidebarFooter}>
                    {/* Items moved to header */}
                </div>
            </aside>

            {/* Main Content */}
            <main className={`${styles.mainContent} ${isCollapsed ? styles.mainContentCollapsed : ''}`}>
                <header className={styles.topHeader}>
                    <div className={styles.headerLeft}>
                        <button
                            className={styles.menuBtn}
                            onClick={toggleSidebar}
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className={styles.pageTitle}>{pageTitle}</h1>
                    </div>

                    <div className={styles.headerRight}>
                        {subscription && (
                            <div className={styles.headerPlanInfo}>
                                <span className={styles.planBadge}>{subscription.plan_tier === 'pro' ? 'PRO' : 'FREE'}</span>
                                <div className={styles.creditBalance} title="Số dư Credits">
                                    <div className={styles.coinIcon}>🪙</div>
                                    <span>{subscription.credits_balance?.toLocaleString()}</span>
                                </div>
                            </div>
                        )}
                        <ThemeToggle />
                        <Link href="/dashboard/profile" className={styles.userInfo}>
                            {user?.user_metadata?.avatar_url ? (
                                <Image
                                    src={user.user_metadata.avatar_url}
                                    alt="User Avatar"
                                    width={32}
                                    height={32}
                                    className={styles.avatar}
                                />
                            ) : (
                                <div className={styles.avatarPlaceholder}>
                                    {user?.email?.[0]?.toUpperCase() || 'U'}
                                </div>
                            )}
                            <span className={styles.userEmail}>{user?.email}</span>
                        </Link>
                        <button
                            onClick={handleSignOut}
                            className={styles.headerSignOutBtn}
                            title="Đăng Xuất"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </header>

                <div className={styles.contentScrollable}>
                    {children}
                </div>
            </main>
        </div>
    )
}
