import Link from 'next/link'
import styles from './pricing.module.css'
import LandingNavbar from '@/components/LandingNavbar'
import LandingFooter from '@/components/LandingFooter'

export default function PricingPage() {
    return (
        <div className={styles.container}>
            <LandingNavbar />

            {/* Hero */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <div className={styles.badge}>
                        <span className={styles.badgePulse}></span>
                        Giá Cả Minh Bạch
                    </div>
                    <h1>Chọn Gói Phù Hợp<br /><span className={styles.gradient}>Với Nhu Cầu</span></h1>
                    <p>Không có chi phí ẩn. Hủy bất cứ lúc nào.</p>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className={styles.pricing}>
                <div className={styles.pricingGrid}>
                    {/* Trial Plan */}
                    <div className={styles.pricingCard}>
                        <div className={styles.cardHeader}>
                            <h3>Trial</h3>
                            <p className={styles.cardDesc}>Trải nghiệm sức mạnh AI</p>
                        </div>
                        <div className={styles.price}>
                            <span className={styles.priceAmount}>Free</span>
                            <span className={styles.pricePeriod}>/7 ngày</span>
                        </div>
                        <ul className={styles.features}>
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                <span><strong>10,000 Credits</strong></span>
                            </li>
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                <span>2-3 bài viết chất lượng cao</span>
                            </li>
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                <span>Tạo hình ảnh AI cơ bản</span>
                            </li>
                            <li className={styles.disabled}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                                <span>Batch processing</span>
                            </li>
                        </ul>
                        <Link href="/dashboard" className={styles.button}>
                            Dùng Thử Ngay
                        </Link>
                    </div>

                    {/* Eco Plan - Popular */}
                    <div className={`${styles.pricingCard} ${styles.popular}`}>
                        <div className={styles.popularBadge}>PHỔ BIẾN NHẤT</div>
                        <div className={styles.cardHeader}>
                            <h3>Eco</h3>
                            <p className={styles.cardDesc}>Cho cá nhân & Freelancer</p>
                        </div>
                        <div className={styles.price}>
                            <span className={styles.priceAmount}>$29</span>
                            <span className={styles.pricePeriod}>/tháng</span>
                        </div>
                        <ul className={styles.features}>
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                <span><strong>100,000 Credits</strong></span>
                            </li>
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                <span>~20-30 bài viết SEO</span>
                            </li>
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                <span>Nghiên cứu từ khóa AI</span>
                            </li>
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                <span>Batch processing không giới hạn</span>
                            </li>
                        </ul>
                        <Link href="/dashboard/upgrade?plan=eco" className={styles.buttonPrimary}>
                            Nâng Cấp Eco
                        </Link>
                    </div>

                    {/* Business Plan */}
                    <div className={styles.pricingCard}>
                        <div className={styles.cardHeader}>
                            <h3>Business</h3>
                            <p className={styles.cardDesc}>Cho Agency & Team</p>
                        </div>
                        <div className={styles.price}>
                            <span className={styles.priceAmount}>$79</span>
                            <span className={styles.pricePeriod}>/tháng</span>
                        </div>
                        <ul className={styles.features}>
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                <span><strong>500,000 Credits</strong></span>
                            </li>
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                <span>Content Rewrite không giới hạn</span>
                            </li>
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                <span>Priority Support 24/7</span>
                            </li>
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                <span>API Access</span>
                            </li>
                        </ul>
                        <Link href="/dashboard/upgrade?plan=business" className={styles.button}>
                            Nâng Cấp Business
                        </Link>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className={styles.faq}>
                <h2>Câu Hỏi Thường Gặp</h2>
                <div className={styles.faqGrid}>
                    <div className={styles.faqItem}>
                        <h3>Tôi có thể hủy bất cứ lúc nào không?</h3>
                        <p>Có! Không có cam kết dài hạn. Bạn có thể hủy subscription bất cứ lúc nào từ dashboard.</p>
                    </div>
                    <div className={styles.faqItem}>
                        <h3>Tôi có thể nâng cấp/hạ cấp gói không?</h3>
                        <p>Hoàn toàn được. Thay đổi gói sẽ có hiệu lực ngay lập tức và được tính tiền theo tỷ lệ.</p>
                    </div>
                    <div className={styles.faqItem}>
                        <h3>Có giới hạn số lượng từ mỗi bài không?</h3>
                        <p>Không! Mỗi bài viết thường dài 2000-3000 từ tùy thuộc vào từ khóa và research.</p>
                    </div>
                    <div className={styles.faqItem}>
                        <h3>Tôi sở hữu nội dung được tạo ra?</h3>
                        <p>100%! Tất cả nội dung được tạo thuộc về bạn để sử dụng theo bất kỳ cách nào.</p>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className={styles.cta}>
                <h2>Bắt Đầu Miễn Phí Hôm Nay</h2>
                <p>Không cần thẻ tín dụng. Bắt đầu với 5 bài viết miễn phí.</p>
                <Link href="/dashboard" className={styles.ctaButton}>
                    Tạo Bài Viết Đầu Tiên
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </Link>
            </section>

            <LandingFooter />
        </div>
    )
}
