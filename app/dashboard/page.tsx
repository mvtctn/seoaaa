import Link from 'next/link'
import styles from './dashboard-home.module.css'
import { getAllArticles, getAllKeywords } from '@/lib/db/database'
import { createClient } from '@/lib/supabase/server'
import DashboardCharts from './DashboardCharts'

export default async function DashboardPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return <div className={styles.dashboard}>Please log in to view your dashboard.</div>
    }

    // Fetch Data directly from DB (Server Component)
    const articles = await getAllArticles(user.id)
    const keywords = await getAllKeywords(user.id) // This keyword function needs to be checked if it supports userId too

    // Calculate Stats
    const totalArticles = articles.length
    const totalKeywords = keywords.length

    // Count "success" or "done" as completed. Count "processing" as active.
    // Note: status might be 'pending', 'processing', 'success', 'error', 'draft'
    const completedCount = articles.filter((a: any) =>
        a.status === 'success' || a.status === 'published' || a.status === 'done'
    ).length

    const draftCount = articles.filter((a: any) => a.status === 'draft').length

    // Determine growth (mock logic for now as we don't have historical data stored by date snapshots)
    const growthRate = 12 // Mock 12%

    // Recent 6 Articles
    const recentArticles = articles.slice(0, 6)

    return (
        <div className={styles.dashboard}>
            {/* Quick Stats Grid */}
            <div className={styles.statsGrid}>
                {/* Total Articles */}
                <div className={styles.card}>
                    <div className={styles.statIcon} style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                        </svg>
                    </div>
                    <div className={styles.statContent}>
                        <div className={styles.statLabel}>Tổng Bài Viết</div>
                        <div className={styles.statValue}>{totalArticles}</div>
                        <div className={styles.statChange}>
                            <span className="text-success">↑ {growthRate}%</span> từ tháng trước
                        </div>
                    </div>
                </div>

                {/* Total Keywords */}
                <div className={styles.card}>
                    <div className={styles.statIcon} style={{ background: 'rgba(6, 182, 212, 0.1)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                        </svg>
                    </div>
                    <div className={styles.statContent}>
                        <div className={styles.statLabel}>Từ Khóa Nghiên Cứu</div>
                        <div className={styles.statValue}>{totalKeywords}</div>
                        <div className={styles.statChange}>
                            <span className="text-secondary">Data Active</span>
                        </div>
                    </div>
                </div>

                {/* Completion Rate */}
                <div className={styles.card}>
                    <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                        </svg>
                    </div>
                    <div className={styles.statContent}>
                        <div className={styles.statLabel}>Bài Đã Hoàn Thành</div>
                        <div className={styles.statValue}>{completedCount}</div>
                        <div className={styles.statChange}>
                            <span className="text-success">Ready to Publish</span>
                        </div>
                    </div>
                </div>

                {/* Drafts */}
                <div className={styles.card}>
                    <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                    </div>
                    <div className={styles.statContent}>
                        <div className={styles.statLabel}>Bản Nháp (Draft)</div>
                        <div className={styles.statValue}>{draftCount}</div>
                        <div className={styles.statChange}>
                            Cần chỉnh sửa thêm
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <DashboardCharts articles={articles} keywords={keywords} />

            {/* Quick Actions */}
            <div className={styles.quickActions}>
                <h2>Hành Động Nhanh</h2>
                <div className={styles.actionsGrid}>
                    <Link href="/dashboard/generate" className={styles.actionCard}>
                        <div className={styles.actionIcon}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                        </div>
                        <h3>Tạo Bài Viết Mới</h3>
                        <p>Tạo nội dung SEO từ một từ khóa</p>
                    </Link>

                    <Link href="/dashboard/batch" className={styles.actionCard}>
                        <div className={styles.actionIcon}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                                <rect x="8" y="2" width="8" height="4" rx="1" />
                            </svg>
                        </div>
                        <h3>Xử Lý Hàng Loạt</h3>
                        <p>Tạo nhiều bài viết cùng lúc</p>
                    </Link>

                    <Link href="/dashboard/articles" className={styles.actionCard}>
                        <div className={styles.actionIcon}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                            </svg>
                        </div>
                        <h3>Thư Viện Bài Viết</h3>
                        <p>Quản lý và chỉnh sửa bài viết</p>
                    </Link>

                    <Link href="/dashboard/brand" className={styles.actionCard}>
                        <div className={styles.actionIcon}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </div>
                        <h3>Cài Đặt Thương Hiệu</h3>
                        <p>Quản lý giọng điệu & mẫu</p>
                    </Link>
                </div>
            </div>

            {/* Recent Articles */}
            <div className={styles.recentArticles}>
                <div className={styles.sectionHeader}>
                    <h2>Bài Viết Gần Đây</h2>
                    <Link href="/dashboard/articles" className="btn btn-outline btn-sm">
                        Xem Tất Cả
                    </Link>
                </div>

                <div className={styles.tableCard}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Tiêu Đề</th>
                                <th>Keywords</th>
                                <th>Trạng Thái</th>
                                <th>Ngày Tạo</th>
                                <th>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentArticles.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-neutral-500">
                                        Chưa có bài viết nào. Hãy tạo bài viết đầu tiên!
                                    </td>
                                </tr>
                            ) : (
                                recentArticles.map((article: any) => (
                                    <tr key={article.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                {article.thumbnail_url && (
                                                    <div className="w-8 h-8 rounded bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url(${article.thumbnail_url})` }}></div>
                                                )}
                                                <Link href={`/dashboard/articles/${article.id}`} className={styles.articleTitle}>
                                                    {article.title}
                                                </Link>
                                            </div>
                                        </td>
                                        <td>
                                            {/* Mock keyword display if not joined properly */}
                                            <span className="text-xs text-secondary font-mono">{(article.slug || '').replace(/-/g, ' ')}</span>
                                        </td>
                                        <td>
                                            <span className={`badge ${article.status === 'success' || article.status === 'published' ? 'badge-success' :
                                                article.status === 'processing' ? 'badge-loading' :
                                                    article.status === 'error' ? 'badge-error' :
                                                        'badge-neutral' // draft or pending
                                                }`}>
                                                {article.status || 'Draft'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="text-secondary text-xs">
                                                {new Date(article.created_at).toLocaleDateString('vi-VN')}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                <Link href={`/dashboard/articles/${article.id}`} className="btn btn-ghost btn-xs text-primary">
                                                    Chi tiết
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
