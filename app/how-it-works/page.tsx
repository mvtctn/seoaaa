'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import styles from './how-it-works.module.css'
import LandingNavbar from '@/components/LandingNavbar'
import LandingFooter from '@/components/LandingFooter'

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.3
        }
    }
}

const stepVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.8, ease: "easeOut" as const }
    }
}

export default function HowItWorksPage() {
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
                        Quy Trình Đơn Giản
                    </div>
                    <h1>Từ Từ Khóa Đến<br /><span className={styles.gradient}>Bài Viết Hoàn Chỉnh</span></h1>
                    <p>4 bước đơn giản để tự động hóa hoàn toàn quy trình xây dựng nội dung SEO</p>
                </motion.div>
            </section>

            {/* Main Workflow */}
            <motion.section
                className={styles.workflow}
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
            >
                <div className={styles.workflowContainer}>
                    {/* Step 1 */}
                    <motion.div className={styles.step} variants={stepVariants}>
                        <div className={styles.stepLeft}>
                            <div className={styles.stepNumber}>01</div>
                            <div className={styles.stepLine}></div>
                        </div>
                        <div className={styles.stepContent}>
                            <div className={styles.stepHeader}>
                                <div className={styles.stepIcon}>⚙️</div>
                                <h2>Thiết Lập Thương Hiệu</h2>
                            </div>
                            <p>Định nghĩa một lần duy nhất về giọng điệu, giá trị cốt lõi và mẫu bài viết của thương hiệu. Hệ thống sẽ nhớ và áp dụng cho tất cả nội dung được tạo ra.</p>
                            <div className={styles.stepVisual}>
                                <div className={styles.brandTags}>
                                    {['Professional', 'Authoritative', 'Helpful', 'Tech-focused'].map((tag, i) => (
                                        <motion.span
                                            key={i}
                                            className={styles.brandTag}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.1 }}
                                        >
                                            {tag}
                                        </motion.span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Step 2 */}
                    <motion.div className={styles.step} variants={stepVariants}>
                        <div className={styles.stepLeft}>
                            <div className={styles.stepNumber}>02</div>
                            <div className={styles.stepLine}></div>
                        </div>
                        <div className={styles.stepContent}>
                            <div className={styles.stepHeader}>
                                <div className={styles.stepIcon}>🔍</div>
                                <h2>AI Nghiên Cứu & Phân Tích</h2>
                            </div>
                            <p>Nhập từ khóa mục tiêu, AI tự động crawl top 10 SERP, phân tích đối thủ và tìm ra những khoảng trống nội dung (content gaps) để bạn vượt lên trên.</p>
                            <div className={styles.stepVisual}>
                                <div className={styles.codeBlock}>
                                    <div className={styles.codeHeader}>
                                        <div className={styles.dots}><span /><span /><span /></div>
                                        <span>research_output.json</span>
                                    </div>
                                    <div className={styles.codeContent}>
                                        <code>
                                            <span className={styles.keyword}>"intent"</span>: <span className={styles.string}>"informational"</span>,<br />
                                            <span className={styles.keyword}>"avg_words"</span>: <span className={styles.number}>2450</span>,<br />
                                            <span className={styles.keyword}>"gap_tags"</span>: [<span className={styles.string}>"case_study"</span>, <span className={styles.string}>"expert_tips"</span>]
                                        </code>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Step 3 */}
                    <motion.div className={styles.step} variants={stepVariants}>
                        <div className={styles.stepLeft}>
                            <div className={styles.stepNumber}>03</div>
                            <div className={styles.stepLine}></div>
                        </div>
                        <div className={styles.stepContent}>
                            <div className={styles.stepHeader}>
                                <div className={styles.stepIcon}>✍️</div>
                                <h2>Tạo Nội Dung Tự Động</h2>
                            </div>
                            <p>Llama 3.3 70B viết bài chi tiết dựa trên research brief. Tự động chèn link nội bộ, tối ưu các thẻ meta và tạo hình ảnh minh họa phù hợp độc bản.</p>
                            <div className={styles.stepVisual}>
                                <div className={styles.writingProgress}>
                                    <div className={styles.progressItem}>
                                        <span>Outline Generation</span>
                                        <motion.div className={styles.progressBar} initial={{ width: 0 }} whileInView={{ width: '100%' }} transition={{ duration: 1 }} />
                                    </div>
                                    <div className={styles.progressItem}>
                                        <span>Content Writing</span>
                                        <motion.div className={styles.progressBar} initial={{ width: 0 }} whileInView={{ width: '100%' }} transition={{ duration: 2, delay: 0.5 }} />
                                    </div>
                                    <div className={styles.progressItem}>
                                        <span>Image Creation</span>
                                        <motion.div className={styles.progressBar} initial={{ width: 0 }} whileInView={{ width: '100%' }} transition={{ duration: 1.5, delay: 1 }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Step 4 */}
                    <motion.div className={styles.step} variants={stepVariants}>
                        <div className={styles.stepLeft}>
                            <div className={styles.stepNumber}>04</div>
                        </div>
                        <div className={styles.stepContent}>
                            <div className={styles.stepHeader}>
                                <div className={styles.stepIcon}>🚀</div>
                                <h2>Review & Xuất Bản</h2>
                            </div>
                            <p>Nhận bài viết với đầy đủ điểm số SEO, khả năng đọc và tối ưu hóa. Bạn có thể xuất bản trực tiếp lên WordPress hoặc website của mình chỉ với 1 click.</p>
                            <div className={styles.stepVisual}>
                                <div className={styles.publishAction}>
                                    <motion.button
                                        className={styles.publishBtn}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <span>Xuất bản ngay</span>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.section>

            {/* Modes */}
            <section className={styles.modes}>
                <div className={styles.sectionHeader}>
                    <h2>Các Chế Độ Xử Lý</h2>
                    <p>Linh hoạt cho mọi nhu cầu xây dựng nội dung của bạn</p>
                </div>
                <div className={styles.modeGrid}>
                    <motion.div
                        className={styles.modeCard}
                        whileHover={{ y: -10 }}
                    >
                        <div className={styles.modeIcon}>⚡</div>
                        <h3>Batch Mode</h3>
                        <p>Upload file CSV với hàng trăm từ khóa. SEOAAA sẽ tự động đưa vào hàng đợi và xử lý lần lượt cho đến khi hoàn thành toàn bộ.</p>
                        <ul className={styles.modeList}>
                            <li>Tiết kiệm hàng chục giờ làm việc</li>
                            <li>Theo dõi tiến độ thời gian thực</li>
                            <li>Tải về trọn bộ bài viết</li>
                        </ul>
                    </motion.div>

                    <motion.div
                        className={styles.modeCard}
                        whileHover={{ y: -10 }}
                    >
                        <div className={styles.modeIcon}>🔄</div>
                        <h3>Rewrite Mode</h3>
                        <p>Cung cấp URL bài viết của đối thủ hoặc bài viết cũ của bạn. AI sẽ phân tích cấu trúc bài viết đó và tạo ra một phiên bản tốt hơn, dài hơn và chuẩn SEO hơn.</p>
                        <ul className={styles.modeList}>
                            <li>Phân tích cấu trúc thắng lợi</li>
                            <li>Tự động lấp đầy content gaps</li>
                            <li>Nâng cấp chất lượng nội dung</li>
                        </ul>
                    </motion.div>
                </div>
            </section>

            {/* CTA */}
            <section className={styles.cta}>
                <div className={styles.ctaCard}>
                    <h2>Trải Nghiệm Quy Trình Ngay</h2>
                    <p>Tham gia cùng hàng nghìn doanh nghiệp đang tự động hóa SEO</p>
                    <Link href="/contact" className={styles.ctaButton}>
                        Liên Hệ Để Tư Vấn
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
