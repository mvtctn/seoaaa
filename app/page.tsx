import Link from 'next/link'
import styles from './page.module.css'
import LandingNavbar from '@/components/LandingNavbar'
import LandingFooter from '@/components/LandingFooter'
import AnimateEntrance from '@/components/AnimateEntrance'
import GlowingCard from '@/components/GlowingCard'
import SparkleBackground from '@/components/SparkleBackground'
import ShinyText from '@/components/ShinyText'
import { motion } from 'framer-motion'

export default function Home() {
    return (
        <div className={styles.landingContainer}>
            <LandingNavbar />

            {/* Hero Section */}
            <section className={styles.hero}>
                <SparkleBackground />
                <div className={styles.heroBackground}>
                    <div className={styles.gradientOrb1}></div>
                    <div className={styles.gradientOrb2}></div>
                </div>

                <div className={styles.heroContent}>
                    <AnimateEntrance delay={0.2} distance={20}>
                        <div className={styles.badge}>
                            <span className={styles.badgePulse}></span>
                            Powered by Next-Gen AI
                        </div>
                    </AnimateEntrance>

                    <AnimateEntrance delay={0.4} distance={30}>
                        <h1 className={styles.heroTitle}>
                            Tạo Nội Dung SEO Với{' '}
                            <span className={styles.gradientText}>Sức Mạnh AI</span>
                        </h1>
                    </AnimateEntrance>

                    <AnimateEntrance delay={0.6} distance={20}>
                        <p className={styles.heroSubtitle}>
                            Từ nghiên cứu từ khóa đến bài viết hoàn chỉnh.
                            Được hỗ trợ bởi <ShinyText text="mô hình Groq AI siêu tốc" /> và hệ thống phân tích đối thủ chuyên sâu.
                        </p>
                    </AnimateEntrance>

                    <AnimateEntrance delay={0.8} distance={20}>
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
                    </AnimateEntrance>

                    <AnimateEntrance delay={1.0} distance={10}>
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
                    </AnimateEntrance>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className={styles.features}>
                <AnimateEntrance>
                    <div className={styles.sectionHeader}>
                        <h2>Tính Năng Đầy Đủ</h2>
                        <p>Mọi thứ bạn cần để chiếm lĩnh SERP</p>
                    </div>
                </AnimateEntrance>

                <div className={styles.featureGrid}>
                    <AnimateEntrance delay={0.1}>
                        <GlowingCard className={styles.featureCard}>
                            <div style={{ padding: '2rem' }}>
                                <div className={styles.featureIcon}>🔍</div>
                                <h3>Nghiên Cứu AI</h3>
                                <p>Phân tích top 10 đối thủ, tìm content gaps và cơ hội xếp hạng tự động</p>
                            </div>
                        </GlowingCard>
                    </AnimateEntrance>

                    <AnimateEntrance delay={0.2}>
                        <GlowingCard className={styles.featureCard}>
                            <div style={{ padding: '2rem' }}>
                                <div className={styles.featureIcon}>✍️</div>
                                <h3>Viết Nội Dung</h3>
                                <p>Groq AI tạo bài viết dài, chất lượng cao theo giọng điệu thương hiệu</p>
                            </div>
                        </GlowingCard>
                    </AnimateEntrance>

                    <AnimateEntrance delay={0.3}>
                        <GlowingCard className={styles.featureCard}>
                            <div style={{ padding: '2rem' }}>
                                <div className={styles.featureIcon}>🎨</div>
                                <h3>Tạo Hình Ảnh</h3>
                                <p>Tự động generate thumbnail và hình ảnh minh họa phù hợp</p>
                            </div>
                        </GlowingCard>
                    </AnimateEntrance>

                    <AnimateEntrance delay={0.4}>
                        <GlowingCard className={styles.featureCard}>
                            <div style={{ padding: '2rem' }}>
                                <div className={styles.featureIcon}>📊</div>
                                <h3>Phân Tích SEO</h3>
                                <p>Kiểm tra độ dài, mật độ từ khóa, readability score tự động</p>
                            </div>
                        </GlowingCard>
                    </AnimateEntrance>

                    <AnimateEntrance delay={0.5}>
                        <GlowingCard className={styles.featureCard}>
                            <div style={{ padding: '2rem' }}>
                                <div className={styles.featureIcon}>⚡</div>
                                <h3>Batch Processing</h3>
                                <p>Tạo hàng chục bài viết cùng lúc với queue system</p>
                            </div>
                        </GlowingCard>
                    </AnimateEntrance>

                    <AnimateEntrance delay={0.6}>
                        <GlowingCard className={styles.featureCard}>
                            <div style={{ padding: '2rem' }}>
                                <div className={styles.featureIcon}>🔄</div>
                                <h3>Content Rewrite</h3>
                                <p>Cải thiện bài viết cũ không xếp hạng tốt với AI analysis</p>
                            </div>
                        </GlowingCard>
                    </AnimateEntrance>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className={styles.howItWorks}>
                <AnimateEntrance>
                    <div className={styles.sectionHeader}>
                        <h2>Quy Trình 4 Bước</h2>
                        <p>Từ từ khóa đến bài viết SEO chỉ trong vài phút</p>
                    </div>
                </AnimateEntrance>

                <div className={styles.timeline}>
                    {[1, 2, 3, 4].map((step, idx) => (
                        <AnimateEntrance key={step} delay={idx * 0.2} direction="right">
                            <div className={styles.timelineItem}>
                                <div className={styles.timelineNumber}>{step}</div>
                                <div className={styles.timelineContent}>
                                    <h3>{['Nhập Từ Khóa', 'AI Nghiên Cứu', 'Tạo Nội Dung', 'Xuất Bản'][idx]}</h3>
                                    <p>{[
                                        'Chỉ cần nhập chủ đề và từ khóa bạn muốn xếp hạng',
                                        'Hệ thống tự động phân tích đối thủ và lập kế hoạch nội dung',
                                        'AI viết bài theo outline và brand voice đã thiết lập',
                                        'Nhận bài viết hoàn chỉnh với hình ảnh và metadata'
                                    ][idx]}</p>
                                </div>
                            </div>
                        </AnimateEntrance>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className={styles.cta}>
                <AnimateEntrance scale={0.9}>
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
                </AnimateEntrance>
            </section>

            <LandingFooter />
        </div>
    )
}
