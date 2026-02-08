import Link from 'next/link'
import Image from 'next/image'
import styles from './LandingFooter.module.css'

export default function LandingFooter() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerContent}>
                <div className={styles.footerBrand}>
                    <div className={styles.logo}>
                        <Image src="/logo.svg" alt="SEOAAA Logo" width={32} height={32} />
                        <span>SEOAAA</span>
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
                <p>&copy; 2026 SEOAAA. All rights reserved.</p>
            </div>
        </footer>
    )
}
