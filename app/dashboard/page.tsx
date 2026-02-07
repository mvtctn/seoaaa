import Link from 'next/link'
import styles from './dashboard-home.module.css'

export default function DashboardPage() {
    return (
        <div className={styles.dashboard}>
            {/* Quick Stats */}
            <div className={styles.statsGrid}>
                <div className="card">
                    <div className={styles.statIcon} style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                        </svg>
                    </div>
                    <div className={styles.statContent}>
                        <div className={styles.statLabel}>Bài Viết Đã Tạo</div>
                        <div className={styles.statValue}>124</div>
                        <div className={styles.statChange}>
                            <span className="text-success">↑ 12%</span> từ tháng trước
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className={styles.statIcon} style={{ background: 'rgba(6, 182, 212, 0.1)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                        </svg>
                    </div>
                    <div className={styles.statContent}>
                        <div className={styles.statLabel}>Từ Khóa Đang Xếp Hạng</div>
                        <div className={styles.statValue}>87</div>
                        <div className={styles.statChange}>
                            <span className="text-success">↑ 24%</span> từ tháng trước
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                        </svg>
                    </div>
                    <div className={styles.statContent}>
                        <div className={styles.statLabel}>Thời Gian TB/Bài</div>
                        <div className={styles.statValue}>4.2 phút</div>
                        <div className={styles.statChange}>
                            <span className="text-success">↓ 18%</span> cải thiện
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                            <path d="M12 2v20M2 12h20" />
                        </svg>
                    </div>
                    <div className={styles.statContent}>
                        <div className={styles.statLabel}>Batch Đang Xử Lý</div>
                        <div className={styles.statValue}>3</div>
                        <div className={styles.statChange}>
                            12 bài viết đang tạo
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className={styles.quickActions}>
                <h2>Hành Động Nhanh</h2>
                <div className={styles.actionsGrid}>
                    <Link href="/dashboard/generate" className={`card ${styles.actionCard}`}>
                        <div className={styles.actionIcon}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                        </div>
                        <h3>Tạo Bài Viết Mới</h3>
                        <p>Tạo nội dung SEO từ một từ khóa</p>
                    </Link>

                    <Link href="/dashboard/batch" className={`card ${styles.actionCard}`}>
                        <div className={styles.actionIcon}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                                <rect x="8" y="2" width="8" height="4" rx="1" />
                            </svg>
                        </div>
                        <h3>Xử Lý Hàng Loạt</h3>
                        <p>Tạo nhiều bài viết cùng lúc</p>
                    </Link>

                    <Link href="/dashboard/rewrite" className={`card ${styles.actionCard}`}>
                        <div className={styles.actionIcon}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                        </div>
                        <h3>Viết Lại Nội Dung</h3>
                        <p>Cải thiện bài viết hiện có</p>
                    </Link>

                    <Link href="/dashboard/brand" className={`card ${styles.actionCard}`}>
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
                    <Link href="/dashboard/content" className="btn btn-outline btn-sm">
                        Xem Tất Cả
                    </Link>
                </div>

                <div className="card">
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Tiêu Đề</th>
                                <th>Từ Khóa</th>
                                <th>Trạng Thái</th>
                                <th>Ngày Tạo</th>
                                <th>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <div className={styles.articleTitle}>
                                        Hướng dẫn SEO toàn diện cho người mới bắt đầu
                                    </div>
                                </td>
                                <td>
                                    <span className="badge badge-primary">seo tutorial</span>
                                </td>
                                <td>
                                    <span className="badge badge-success">Hoàn thành</span>
                                </td>
                                <td>
                                    <span className="text-secondary">07/02/2026</span>
                                </td>
                                <td>
                                    <div className={styles.actions}>
                                        <button className="btn btn-ghost btn-sm">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        </button>
                                        <button className="btn btn-ghost btn-sm">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    <div className={styles.articleTitle}>
                                        10 chiến lược marketing hiệu quả năm 2026
                                    </div>
                                </td>
                                <td>
                                    <span className="badge badge-primary">digital marketing</span>
                                </td>
                                <td>
                                    <span className="badge badge-success">Hoàn thành</span>
                                </td>
                                <td>
                                    <span className="text-secondary">06/02/2026</span>
                                </td>
                                <td>
                                    <div className={styles.actions}>
                                        <button className="btn btn-ghost btn-sm">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        </button>
                                        <button className="btn btn-ghost btn-sm">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    <div className={styles.articleTitle}>
                                        Cách xây dựng thương hiệu cá nhân trên LinkedIn
                                    </div>
                                </td>
                                <td>
                                    <span className="badge badge-primary">personal branding</span>
                                </td>
                                <td>
                                    <span className="badge badge-warning">Đang xử lý</span>
                                </td>
                                <td>
                                    <span className="text-secondary">07/02/2026</span>
                                </td>
                                <td>
                                    <div className={styles.actions}>
                                        <div className="spinner spinner-sm"></div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
