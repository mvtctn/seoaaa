import Link from 'next/link'
import styles from './LandingFooter.module.css'

export default function LandingFooter() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerContent}>
                <div className={styles.footerBrand}>
                    <div className={styles.logo}>
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                            <rect width="32" height="32" rx="8" fill="url(#gradient2)" />
                            <path d="M16 8L24 12V20L16 24L8 20V12L16 8Z" fill="white" opacity="0.9" />
                            <defs>
                                <linearGradient id="gradient2" x1="0" y1="0" x2="32" y2="32">
                                    <stop offset="0%" stopColor="#0ea5e9" />
                                    <stop offset="100%" stopColor="#2563eb" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <span>SEO Engine</span>
                    </div>
                    <p>Tự động hóa hoàn toàn quy trình tạo nội dung SEO của bạn.</p>
                </div>

                <div className={styles.footerLinks}>
                    <div>
                        <h4>Sản Phẩm</h4>
                        <Link href="/dashboard">Dashboard</Link>
                        <Link href="/dashboard/generate">Tạo Nội Dung</Link>
                        <Link href="/dashboard/batch">Xử Lý Hàng Loạt</Link>
                    </div>
                    <div>
                        <h4>Tài Nguyên</h4>
                        <Link href="/how-it-works">Hướng Dẫn</Link>
                        <Link href="/blog">Blog</Link>
                        <Link href="/features">Tính Năng</Link>
                    </div>
                    <div>
                        <h4>Công Ty</h4>
                        <Link href="/contact">Liên Hệ</Link>
                        <Link href="/pricing">Giá Cả</Link>
                        <a href="#">Privacy</a>
                    </div>
                </div>
            </div>

            <div className={styles.footerBottom}>
                <p>&copy; 2026 SEO Content Engine. All rights reserved.</p>
            </div>
        </footer>
    )
}
