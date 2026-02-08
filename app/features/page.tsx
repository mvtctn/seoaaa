import Link from 'next/link'
import styles from './features.module.css'
import LandingNavbar from '@/components/LandingNavbar'
import LandingFooter from '@/components/LandingFooter'

export default function FeaturesPage() {
    return (
        <div className={styles.container}>
            <LandingNavbar />

            {/* Hero */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <div className={styles.badge}>
                        <span className={styles.badgePulse}></span>
                        Tính Năng Toàn Diện
                    </div>
                    <h1>Mọi Công Cụ Bạn Cần<br />Để <span className={styles.gradient}>Thống Trị SEO</span></h1>
                    <p>Từ nghiên cứu từ khóa đến xuất bản bài viết - tất cả tự động</p>
                </div>
            </section>

            {/* Main Features */}
            <section className={styles.mainFeatures}>
                <div className={styles.featureRow}>
                    <div className={styles.featureContent}>
                        <div className={styles.featureBadge}>🔍 Nghiên Cứu</div>
                        <h2>Phân Tích Đối Thủ Thông Minh</h2>
                        <p>SERP API tự động crawl top 10 kết quả tìm kiếm, phân tích độ dài nội dung, heading structure, từ khóa liên quan và tìm ra content gaps mà đối thủ chưa cover.</p>
                        <ul className={styles.featureList}>
                            <li>✓ Tự động crawl top 10 SERP</li>
                            <li>✓ Phân tích heading và structure</li>
                            <li>✓ Tìm content gaps</li>
                            <li>✓ Suggest từ khóa liên quan</li>
                        </ul>
                    </div>
                    <div className={styles.featureVisual}>
                        <div className={styles.mockup}>
                            <div className={styles.mockupHeader}>
                                <div className={styles.dot}></div>
                                <div className={styles.dot}></div>
                                <div className={styles.dot}></div>
                            </div>
                            <div className={styles.mockupContent}>
                                <div className={styles.mockupItem}>
                                    <span>Competitor #1</span>
                                    <div className={styles.bar} style={{ width: '85%' }}></div>
                                </div>
                                <div className={styles.mockupItem}>
                                    <span>Competitor #2</span>
                                    <div className={styles.bar} style={{ width: '72%' }}></div>
                                </div>
                                <div className={styles.mockupItem}>
                                    <span>Competitor #3</span>
                                    <div className={styles.bar} style={{ width: '68%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.featureRow + ' ' + styles.reverse}>
                    <div className={styles.featureContent}>
                        <div className={styles.featureBadge}>🤖 AI Writing</div>
                        <h2>Tạo Nội Dung Chất Lượng Cao</h2>
                        <p>Groq AI với Llama 3.3 70B tạo bài viết dài, chi tiết và chất lượng cao. Giữ đúng giọng điệu thương hiệu và tối ưu cho SEO.</p>
                        <ul className={styles.featureList}>
                            <li>✓ Bài viết 2000+ từ</li>
                            <li>✓ Heading structure tối ưu</li>
                            <li>✓ Tự động thêm internal links</li>
                            <li>✓ Meta tags SEO friendly</li>
                        </ul>
                    </div>
                    <div className={styles.featureVisual}>
                        <div className={styles.mockup}>
                            <div className={styles.mockupHeader}>
                                <div className={styles.dot}></div>
                                <div className={styles.dot}></div>
                                <div className={styles.dot}></div>
                            </div>
                            <div className={styles.mockupContent}>
                                <div className={styles.textLine} style={{ width: '90%' }}></div>
                                <div className={styles.textLine} style={{ width: '85%' }}></div>
                                <div className={styles.textLine} style={{ width: '70%' }}></div>
                                <div className={styles.textLine} style={{ width: '95%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.featureRow}>
                    <div className={styles.featureContent}>
                        <div className={styles.featureBadge}>🎨 Hình Ảnh</div>
                        <h2>Tự Động Tạo Visual</h2>
                        <p>AI image generation tạo thumbnail và hình ảnh minh họa phù hợp với nội dung bài viết. Không cần designer.</p>
                        <ul className={styles.featureList}>
                            <li>✓ Auto-generate thumbnails</li>
                            <li>✓ Hình ảnh trong bài viết</li>
                            <li>✓ Tùy chỉnh prompt</li>
                            <li>✓ Multiple styles</li>
                        </ul>
                    </div>
                    <div className={styles.featureVisual}>
                        <div className={styles.imageGrid}>
                            <div className={styles.imgPlaceholder}>📸</div>
                            <div className={styles.imgPlaceholder}>🎨</div>
                            <div className={styles.imgPlaceholder}>🖼️</div>
                            <div className={styles.imgPlaceholder}>✨</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Additional Features Grid */}
            <section className={styles.moreFeatures}>
                <h2>Và Nhiều Hơn Nữa...</h2>
                <div className={styles.grid}>
                    <div className={styles.card}>
                        <div className={styles.cardIcon}>⚡</div>
                        <h3>Batch Processing</h3>
                        <p>Tạo hàng chục bài viết cùng lúc với queue system tự động</p>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardIcon}>🔄</div>
                        <h3>Content Rewrite</h3>
                        <p>Cải thiện bài viết cũ với AI analysis và recommendations</p>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardIcon}>📊</div>
                        <h3>SEO Analysis</h3>
                        <p>Kiểm tra readability, keyword density, meta tags tự động</p>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardIcon}>💼</div>
                        <h3>Brand Management</h3>
                        <p>Lưu voice, values và templates để tái sử dụng</p>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardIcon}>🌐</div>
                        <h3>Content Repurpose</h3>
                        <p>Chuyển đổi bài viết sang LinkedIn, Twitter posts</p>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardIcon}>📝</div>
                        <h3>Rich Editor</h3>
                        <p>Markdown editor với preview và export multiple formats</p>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className={styles.cta}>
                <h2>Sẵn Sàng Bắt Đầu?</h2>
                <p>Trải nghiệm toàn bộ tính năng ngay hôm nay</p>
                <Link href="/contact" className={styles.ctaButton}>
                    Liên Hệ Ngay
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </Link>
            </section>

            <LandingFooter />
        </div>
    )
}
