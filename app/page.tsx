import Link from 'next/link'
import styles from './page.module.css'
import LandingNavbar from '@/components/LandingNavbar'
import LandingFooter from '@/components/LandingFooter'

export default function Home() {
    return (
        <div className={styles.landingContainer}>
            <LandingNavbar />

            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroBackground}>
                    <div className={styles.gradientOrb1}></div>
                    <div className={styles.gradientOrb2}></div>
                    <div className={styles.dotsPattern}></div>
                </div>

                <div className={styles.heroContent}>
                    <div className={styles.badge}>
                        <span className={styles.badgePulse}></span>
                        Powered by AI
                    </div>

                    <h1 className={styles.heroTitle}>
                        Tạo Nội Dung SEO Với{' '}
                        <span className={styles.gradientText}>AI Tự Động</span>
                    </h1>

                    <p className={styles.heroSubtitle}>
                        Từ nghiên cứu từ khóa đến bài viết hoàn chỉnh.
                        Được hỗ trợ bởi Groq AI hiện đại và công nghệ phân tích đối thủ.
                    </p>

                    <div className={styles.heroActions}>
                        <Link href="/dashboard" className={styles.primaryButton}>
                            Bắt Đầu Miễn Phí
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>
                        <a href="#features" className={styles.secondaryButton}>
                            Xem Demo
                        </a>
                    </div>

                    <div className={styles.stats}>
                        <div className={styles.stat}>
                            <div className={styles.statValue}>5 phút</div>
                            <div className={styles.statLabel}>Tạo bài viết</div>
                        </div>
                        <div className={styles.statDivider}></div>
                        <div className={styles.stat}>
                            <div className={styles.statValue}>10+</div>
                            <div className={styles.statLabel}>Bài/giờ batch</div>
                        </div>
                        <div className={styles.statDivider}></div>
                        <div className={styles.stat}>
                            <div className={styles.statValue}>100%</div>
                            <div className={styles.statLabel}>Tự động hóa</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className={styles.features}>
                <div className={styles.sectionHeader}>
                    <h2>Tính Năng Đầy Đủ</h2>
                    <p>Mọi thứ bạn cần để chiếm lĩnh SERP</p>
                </div>

                <div className={styles.featureGrid}>
                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>🔍</div>
                        <h3>Nghiên Cứu AI</h3>
                        <p>Phân tích top 10 đối thủ, tìm content gaps và cơ hội xếp hạng tự động</p>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>✍️</div>
                        <h3>Viết Nội Dung</h3>
                        <p>Groq AI tạo bài viết dài, chất lượng cao theo giọng điệu thương hiệu</p>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>🎨</div>
                        <h3>Tạo Hình Ảnh</h3>
                        <p>Tự động generate thumbnail và hình ảnh minh họa phù hợp</p>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>📊</div>
                        <h3>Phân Tích SEO</h3>
                        <p>Kiểm tra độ dài, mật độ từ khóa, readability score tự động</p>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>⚡</div>
                        <h3>Batch Processing</h3>
                        <p>Tạo hàng chục bài viết cùng lúc với queue system</p>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>🔄</div>
                        <h3>Content Rewrite</h3>
                        <p>Cải thiện bài viết cũ không xếp hạng tốt với AI analysis</p>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className={styles.howItWorks}>
                <div className={styles.sectionHeader}>
                    <h2>Quy Trình 4 Bước</h2>
                    <p>Từ từ khóa đến bài viết SEO chỉ trong vài phút</p>
                </div>

                <div className={styles.timeline}>
                    <div className={styles.timelineItem}>
                        <div className={styles.timelineNumber}>1</div>
                        <div className={styles.timelineContent}>
                            <h3>Nhập Từ Khóa</h3>
                            <p>Chỉ cần nhập chủ đề và từ khóa bạn muốn xếp hạng</p>
                        </div>
                    </div>

                    <div className={styles.timelineItem}>
                        <div className={styles.timelineNumber}>2</div>
                        <div className={styles.timelineContent}>
                            <h3>AI Nghiên Cứu</h3>
                            <p>Hệ thống tự động phân tích đối thủ và lập kế hoạch nội dung</p>
                        </div>
                    </div>

                    <div className={styles.timelineItem}>
                        <div className={styles.timelineNumber}>3</div>
                        <div className={styles.timelineContent}>
                            <h3>Tạo Nội Dung</h3>
                            <p>AI viết bài theo outline và brand voice đã thiết lập</p>
                        </div>
                    </div>

                    <div className={styles.timelineItem}>
                        <div className={styles.timelineNumber}>4</div>
                        <div className={styles.timelineContent}>
                            <h3>Xuất Bản</h3>
                            <p>Nhận bài viết hoàn chỉnh với hình ảnh và metadata</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className={styles.cta}>
                <div className={styles.ctaContent}>
                    <h2>Sẵn Sàng Tự Động Hóa SEO?</h2>
                    <p>Tham gia cùng hàng nghìn marketers đang tăng tốc content production</p>
                    <Link href="/dashboard" className={styles.primaryButton}>
                        Truy Cập Dashboard
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </section>

            <LandingFooter />
        </div>
    )
}
