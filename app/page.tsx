import Link from 'next/link'
import styles from './page.module.css'

export default function Home() {
    return (
        <div className={styles.container}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <div className={styles.badge}>
                        <span className={styles.badgeDot}></span>
                        <span>Powered by AI</span>
                    </div>

                    <h1 className={styles.heroTitle}>
                        Bộ Giải Pháp SEO
                        <br />
                        <span className={styles.heroGradient}>Tự Động Hoàn Chỉnh</span>
                    </h1>

                    <p className={styles.heroDescription}>
                        Một từ khóa đầu vào → nghiên cứu đầy đủ, phân tích đối thủ, bài viết tối ưu hóa SEO,
                        siêu dữ liệu và đồ họa AI đầu ra. Mọi thứ đều tự động.
                    </p>

                    <div className={styles.heroActions}>
                        <Link href="/dashboard" className="btn btn-primary btn-lg">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                            </svg>
                            Bắt Đầu Ngay
                        </Link>
                        <Link href="#features" className="btn btn-outline btn-lg">
                            Tìm Hiểu Thêm
                        </Link>
                    </div>

                    <div className={styles.heroStats}>
                        <div className={styles.stat}>
                            <div className={styles.statValue}>5 phút</div>
                            <div className={styles.statLabel}>Tạo 1 bài viết</div>
                        </div>
                        <div className={styles.stat}>
                            <div className={styles.statValue}>10+</div>
                            <div className={styles.statLabel}>Bài/giờ (batch)</div>
                        </div>
                        <div className={styles.stat}>
                            <div className={styles.statValue}>100%</div>
                            <div className={styles.statLabel}>Tự động hóa</div>
                        </div>
                    </div>
                </div>

                <div className={styles.heroVisual}>
                    <div className={styles.floatingCard}>
                        <div className={styles.cardIcon}>🔍</div>
                        <div className={styles.cardContent}>
                            <div className={styles.cardTitle}>Nghiên Cứu Từ Khóa</div>
                            <div className={styles.cardProgress}>
                                <div className={styles.progressBar} style={{ width: '85%' }}></div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.floatingCard} style={{ animationDelay: '0.2s' }}>
                        <div className={styles.cardIcon}>📊</div>
                        <div className={styles.cardContent}>
                            <div className={styles.cardTitle}>Phân Tích Đối Thủ</div>
                            <div className={styles.cardProgress}>
                                <div className={styles.progressBar} style={{ width: '72%' }}></div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.floatingCard} style={{ animationDelay: '0.4s' }}>
                        <div className={styles.cardIcon}>✍️</div>
                        <div className={styles.cardContent}>
                            <div className={styles.cardTitle}>Tạo Nội Dung AI</div>
                            <div className={styles.cardProgress}>
                                <div className={styles.progressBar} style={{ width: '95%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className={styles.features}>
                <div className={styles.sectionHeader}>
                    <h2>Tính Năng Nổi Bật</h2>
                    <p>Tất cả những gì bạn cần để tạo nội dung SEO chất lượng cao</p>
                </div>

                <div className={styles.featuresGrid}>
                    <div className="card card-glass">
                        <div className={styles.featureIcon}>🎯</div>
                        <h3>Nghiên Cứu Thông Minh</h3>
                        <p>SERP API + Firecrawl phân tích top 10 đối thủ, tìm khoảng trống nội dung và cơ hội xếp hạng</p>
                    </div>

                    <div className="card card-glass">
                        <div className={styles.featureIcon}>🤖</div>
                        <h3>AI Đa Tầng</h3>
                        <p>Gemini lập kế hoạch chiến lược, Claude viết nội dung chất lượng theo giọng điệu thương hiệu của bạn</p>
                    </div>

                    <div className="card card-glass">
                        <div className={styles.featureIcon}>🎨</div>
                        <h3>Đồ Họa Tự Động</h3>
                        <p>Tạo thumbnail và hình ảnh trong bài viết phù hợp với nội dung một cách tự động</p>
                    </div>

                    <div className="card card-glass">
                        <div className={styles.featureIcon}>📝</div>
                        <h3>SEO Tối Ưu</h3>
                        <p>Meta tags, URL slugs, internal links - tất cả được tạo tự động theo best practices</p>
                    </div>

                    <div className="card card-glass">
                        <div className={styles.featureIcon}>⚡</div>
                        <h3>Xử Lý Hàng Loạt</h3>
                        <p>Tạo hàng chục bài viết cùng lúc với batch processing mode</p>
                    </div>

                    <div className="card card-glass">
                        <div className={styles.featureIcon}>🔄</div>
                        <h3>Viết Lại Nội Dung</h3>
                        <p>Cải thiện các bài viết hiện có không xếp hạng tốt với AI analysis</p>
                    </div>

                    <div className="card card-glass">
                        <div className={styles.featureIcon}>🌐</div>
                        <h3>Tái Sử Dụng Nội Dung</h3>
                        <p>Chuyển đổi bài viết thành posts cho LinkedIn và Twitter/X tự động</p>
                    </div>

                    <div className="card card-glass">
                        <div className={styles.featureIcon}>💼</div>
                        <h3>Quản Lý Thương Hiệu</h3>
                        <p>Lưu giọng điệu, giá trị cốt lõi và mẫu bài viết để tái sử dụng</p>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className={styles.howItWorks}>
                <div className={styles.sectionHeader}>
                    <h2>Quy Trình Hoạt Động</h2>
                    <p>Từ từ khóa đến bài viết hoàn chỉnh chỉ trong vài bước</p>
                </div>

                <div className={styles.steps}>
                    <div className={styles.step}>
                        <div className={styles.stepNumber}>1</div>
                        <div className={styles.stepContent}>
                            <h3>Thiết Lập Thương Hiệu</h3>
                            <p>Định nghĩa giọng điệu, giá trị cốt lõi và mẫu bài viết một lần duy nhất</p>
                        </div>
                    </div>

                    <div className={styles.stepConnector}></div>

                    <div className={styles.step}>
                        <div className={styles.stepNumber}>2</div>
                        <div className={styles.stepContent}>
                            <h3>Nhập Từ Khóa</h3>
                            <p>Chỉ cần nhập chủ đề và từ khóa bạn muốn xếp hạng</p>
                        </div>
                    </div>

                    <div className={styles.stepConnector}></div>

                    <div className={styles.step}>
                        <div className={styles.stepNumber}>3</div>
                        <div className={styles.stepContent}>
                            <h3>AI Nghiên Cứu</h3>
                            <p>Hệ thống tự động phân tích đối thủ và lập kế hoạch nội dung</p>
                        </div>
                    </div>

                    <div className={styles.stepConnector}></div>

                    <div className={styles.step}>
                        <div className={styles.stepNumber}>4</div>
                        <div className={styles.stepContent}>
                            <h3>Tạo & Xuất Bản</h3>
                            <p>Nhận bài viết hoàn chỉnh với hình ảnh và metadata SEO</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className={styles.cta}>
                <div className={styles.ctaContent}>
                    <h2>Sẵn Sàng Tự Động Hóa SEO?</h2>
                    <p>Dành cả ngày để tạo một bài viết SEO đã là quá khứ. Hãy bắt đầu ngay hôm nay.</p>
                    <Link href="/dashboard" className="btn btn-primary btn-lg">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <path d="M9 3v18M15 3v18" />
                        </svg>
                        Truy Cập Dashboard
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className={styles.footerContent}>
                    <div className={styles.footerBrand}>
                        <h3>SEO Content Engine</h3>
                        <p>Tự động hóa hoàn toàn quy trình tạo nội dung SEO của bạn</p>
                    </div>

                    <div className={styles.footerLinks}>
                        <div className={styles.footerColumn}>
                            <h4>Sản Phẩm</h4>
                            <Link href="/dashboard">Dashboard</Link>
                            <Link href="/dashboard">Tạo Nội Dung</Link>
                            <Link href="/dashboard">Batch Processing</Link>
                            <Link href="/dashboard">Content Rewrite</Link>
                        </div>

                        <div className={styles.footerColumn}>
                            <h4>Tài Nguyên</h4>
                            <Link href="#">Tài Liệu</Link>
                            <Link href="#">API Reference</Link>
                            <Link href="#">Hướng Dẫn</Link>
                            <Link href="#">Blog</Link>
                        </div>

                        <div className={styles.footerColumn}>
                            <h4>Công Ty</h4>
                            <Link href="#">Giới Thiệu</Link>
                            <Link href="#">Liên Hệ</Link>
                            <Link href="#">Privacy</Link>
                            <Link href="#">Terms</Link>
                        </div>
                    </div>
                </div>

                <div className={styles.footerBottom}>
                    <p>&copy; 2026 SEO Content Engine. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}
