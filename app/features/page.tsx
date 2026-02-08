'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import styles from './features.module.css'
import LandingNavbar from '@/components/LandingNavbar'
import LandingFooter from '@/components/LandingFooter'

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
}

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.6, ease: "easeOut" as const }
    }
}

export default function FeaturesPage() {
    return (
        <div className={styles.container}>
            <LandingNavbar />

            {/* Hero */}
            <section className={styles.hero}>
                <motion.div
                    className={styles.heroContent}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className={styles.badge}>
                        <span className={styles.badgePulse}></span>
                        Tính Năng Toàn Diện
                    </div>
                    <h1>Mọi Công Cụ Bạn Cần<br />Để <span className={styles.gradient}>Thống Trị SEO</span></h1>
                    <p>Từ nghiên cứu từ khóa đến xuất bản bài viết - tất cả tự động</p>
                </motion.div>
            </section>

            {/* Main Features */}
            <motion.section
                className={styles.mainFeatures}
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
            >
                {/* Feature 1 */}
                <motion.div className={styles.featureRow} variants={itemVariants}>
                    <div className={styles.featureContent}>
                        <div className={styles.featureBadge}>🔍 Research</div>
                        <h2>Phân Tích Đối Thủ Thông Minh</h2>
                        <p>SERP API tự động crawl top 10 kết quả tìm kiếm, phân tích độ dài nội dung, heading structure, từ khóa liên quan và tìm ra content gaps mà đối thủ chưa cover.</p>
                        <ul className={styles.featureList}>
                            <li>
                                <span className={styles.checkIcon}>✓</span>
                                <div><strong>Auto SERP Crawl:</strong> Phân tích dữ liệu thực tế từ Google</div>
                            </li>
                            <li>
                                <span className={styles.checkIcon}>✓</span>
                                <div><strong>Content Gaps:</strong> Tìm kiếm những gì đối thủ bỏ sót</div>
                            </li>
                            <li>
                                <span className={styles.checkIcon}>✓</span>
                                <div><strong>Strategy Suggestion:</strong> Đề xuất chiến lược nội dung tối ưu</div>
                            </li>
                        </ul>
                    </div>
                    <div className={styles.featureVisual}>
                        <div className={styles.mockupContainer}>
                            <div className={styles.mockup}>
                                <div className={styles.mockupHeader}>
                                    <div className={styles.dots}><span /><span /><span /></div>
                                    <div className={styles.addressBar}>google.com/search?q=seo+automation</div>
                                </div>
                                <div className={styles.mockupContent}>
                                    {[85, 72, 68, 92].map((w, i) => (
                                        <div key={i} className={styles.mockupItem}>
                                            <div className={styles.itemLabel}>Competitor #{i + 1}</div>
                                            <motion.div
                                                className={styles.bar}
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${w}%` }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className={styles.decorativeElement + ' ' + styles.element1}>📊</div>
                        </div>
                    </div>
                </motion.div>

                {/* Feature 2 */}
                <motion.div className={styles.featureRow + ' ' + styles.reverse} variants={itemVariants}>
                    <div className={styles.featureContent}>
                        <div className={styles.featureBadge}>🤖 AI Writing</div>
                        <h2>Nội Dung Chất Lượng 2000+ Từ</h2>
                        <p>Groq AI với Llama 3.3 70B tạo bài viết dài, chi tiết và có chiều sâu. Không chỉ là mặt chữ, bài viết còn được tối ưu hóa theo đúng giọng điệu thương hiệu của bạn.</p>
                        <ul className={styles.featureList}>
                            <li>
                                <span className={styles.checkIcon}>✓</span>
                                <div><strong>Deep Context:</strong> Hiểu rõ ngữ cảnh và chuyên môn</div>
                            </li>
                            <li>
                                <span className={styles.checkIcon}>✓</span>
                                <div><strong>Natural Links:</strong> Tự động chèn link nội bộ tự nhiên</div>
                            </li>
                            <li>
                                <span className={styles.checkIcon}>✓</span>
                                <div><strong>Perfect SEO:</strong> Tối ưu heading, mật độ từ khóa và meta</div>
                            </li>
                        </ul>
                    </div>
                    <div className={styles.featureVisual}>
                        <div className={styles.mockupContainer}>
                            <div className={styles.mockup}>
                                <div className={styles.mockupHeader}>
                                    <div className={styles.dots}><span /><span /><span /></div>
                                    <div className={styles.addressBar}>editor.seoaaa.com</div>
                                </div>
                                <div className={styles.mockupContent}>
                                    <div className={styles.writingLines}>
                                        {[100, 90, 95, 40, 100, 85, 30].map((w, i) => (
                                            <motion.div
                                                key={i}
                                                className={styles.textLine}
                                                style={{ width: `${w}%` }}
                                                initial={{ opacity: 0, x: -10 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.decorativeElement + ' ' + styles.element2}>✍️</div>
                        </div>
                    </div>
                </motion.div>

                {/* Feature 3 */}
                <motion.div className={styles.featureRow} variants={itemVariants}>
                    <div className={styles.featureContent}>
                        <div className={styles.featureBadge}>🎨 Visuals</div>
                        <h2>Tự Động Tạo Hình Ảnh Minh Họa</h2>
                        <p>Hệ thống tự động phân tích bài viết và tạo ra các hình ảnh minh họa, thumbnails phù hợp. Đảm bảo bài viết của bạn sinh động và thu hút người đọc.</p>
                        <ul className={styles.featureList}>
                            <li>
                                <span className={styles.checkIcon}>✓</span>
                                <div><strong>Contextual Images:</strong> Hình ảnh khớp với từng đoạn nội dung</div>
                            </li>
                            <li>
                                <span className={styles.checkIcon}>✓</span>
                                <div><strong>High Quality:</strong> Độ phân giải cao, phong cách hiện đại</div>
                            </li>
                            <li>
                                <span className={styles.checkIcon}>✓</span>
                                <div><strong>Auto Thumbnail:</strong> Tạo ảnh đại diện chuẩn SEO Facebook/Google</div>
                            </li>
                        </ul>
                    </div>
                    <div className={styles.featureVisual}>
                        <div className={styles.imageGridContainer}>
                            <div className={styles.imageGrid}>
                                {[
                                    { icon: '📸', color: '#3b82f6' },
                                    { icon: '🎨', color: '#10b981' },
                                    { icon: '🖼️', color: '#f59e0b' },
                                    { icon: '✨', color: '#8b5cf6' }
                                ].map((img, i) => (
                                    <motion.div
                                        key={i}
                                        className={styles.imgCard}
                                        whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 2 : -2 }}
                                        style={{ borderColor: img.color }}
                                    >
                                        <span className={styles.imgIcon}>{img.icon}</span>
                                    </motion.div>
                                ))}
                            </div>
                            <div className={styles.decorativeElement + ' ' + styles.element3}>🎨</div>
                        </div>
                    </div>
                </motion.div>
            </motion.section>

            {/* Additional Features Grid */}
            <section className={styles.moreFeatures}>
                <motion.div
                    className={styles.sectionHeader}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2>Và Nhiều Hơn Nữa...</h2>
                    <p>Các công cụ bổ trợ giúp quy trình content của bạn mượt mà hơn</p>
                </motion.div>

                <motion.div
                    className={styles.grid}
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    {[
                        { icon: '⚡', title: 'Batch Processing', desc: 'Tạo hàng chục bài viết cùng lúc với queue system.' },
                        { icon: '🔄', title: 'Content Rewrite', desc: 'Cải thiện bài viết cũ với AI recommendations.' },
                        { icon: '📊', title: 'SEO Analysis', desc: 'Kiểm tra mật độ từ khóa và meta tags tự động.' },
                        { icon: '💼', title: 'Brand Voice', desc: 'Lưu giữ giọng điệu đặc trưng của thương hiệu.' },
                        { icon: '🌐', title: 'Multi-platform', desc: 'Dễ dàng chuyển đổi format cho mạng xã hội.' },
                        { icon: '📝', title: 'Rich Editor', desc: 'Hỗ trợ Markdown với preview thời gian thực.' }
                    ].map((feature, i) => (
                        <motion.div key={i} className={styles.card} variants={itemVariants}>
                            <div className={styles.cardIcon}>{feature.icon}</div>
                            <h3>{feature.title}</h3>
                            <p>{feature.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* CTA */}
            <section className={styles.cta}>
                <div className={styles.ctaCard}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2>Sẵn Sàng Thống Trị SERP?</h2>
                        <p>Trải nghiệm sức mạnh của tự động hóa content ngay hôm nay.</p>
                        <Link href="/contact" className={styles.ctaButton}>
                            Liên Hệ Ngay
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </motion.div>
                </div>
            </section>

            <LandingFooter />
        </div>
    )
}
