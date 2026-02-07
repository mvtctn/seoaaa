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
                    {/* Free Plan */}
                    <div className={styles.pricingCard}>
                        <div className={styles.cardHeader}>
                            <h3>Starter</h3>
                            <p className={styles.cardDesc}>Cho cá nhân và blog nhỏ</p>
                        </div>
                        <div className={styles.price}>
                            <span className={styles.priceAmount}>Free</span>
                            <span className={styles.pricePeriod}>/tháng</span>
                        </div>
                        <ul className={styles.features}>
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                <span>5 bài viết/tháng</span>
                            </li>
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                <span>Nghiên cứu AI cơ bản</span>
                            </li>
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                <span>5 hình ảnh AI</span>
                            </li>
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                <span>SEO analysis cơ bản</span>
                            </li>
                            <li className={styles.disabled}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                                <span>Batch processing</span>
                            </li>
                            <li className={styles.disabled}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                                <span>Priority support</span>
                            </li>
                        </ul>
                        <Link href="/dashboard" className={styles.button}>
                            Bắt Đầu Miễn Phí
                        </Link>
                    </div>

                    {/* Pro Plan - Popular */}
                    <div className={`${styles.pricingCard} ${styles.popular}`}>
                        <div className={styles.popularBadge}>PHỔ BIẾN NHẤT</div>
                        <div className={styles.cardHeader}>
                            <h3>Professional</h3>
                            <p className={styles.cardDesc}>Cho marketers và agencies</p>
                        </div>
                        <div className={styles.price}>
                            <span className={styles.priceAmount}>$49</span>
                            <span className={styles.pricePeriod}>/tháng</span>
                        </div>
                        <ul className={styles.features}>
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                <span><strong>50 bài viết/tháng</strong></span>
                            </li>
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                <span>Nghiên cứu AI nâng cao</span>
                            </li>
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                <span>100 hình ảnh AI</span>
                            </li>
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                <span>Batch processing</span>
                            </li>
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                <span>Content rewrite</span>
                            </li>
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                <span>Priority support</span>
                            </li>
                        </ul>
                        <Link href="/dashboard" className={styles.buttonPrimary}>
                            Bắt Đầu Ngay
                        </Link>
                    </div>

                    {/* Enterprise Plan */}
                    <div className={styles.pricingCard}>
                        <div className={styles.cardHeader}>
                            <h3>Enterprise</h3>
                            <p className={styles.cardDesc}>Cho doanh nghiệp lớn</p>
                        </div>
                        <div className={styles.price}>
                            <span className={styles.priceAmount}>Custom</span>
                        </div>
                        <ul className={styles.features}>
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                <span><strong>Không giới hạn</strong></span>
                            </li>
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                <span>Tất cả tính năng Pro</span>
                            </li>
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                <span>API access</span>
                            </li>
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                <span>Custom integrations</span>
                            </li>
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                <span>Dedicated support</span>
                            </li>
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                <span>SLA guarantee</span>
                            </li>
                        </ul>
                        <a href="mailto:contact@seoengine.com" className={styles.button}>
                            Liên Hệ Sales
                        </a>
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
