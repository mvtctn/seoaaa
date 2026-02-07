import Link from 'next/link'
import styles from './how-it-works.module.css'
import LandingNavbar from '@/components/LandingNavbar'
import LandingFooter from '@/components/LandingFooter'

export default function HowItWorksPage() {
    return (
        <div className={styles.container}>
            <LandingNavbar />

            {/* Hero */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <div className={styles.badge}>
                        <span className={styles.badgePulse}></span>
                        Quy Trình Đơn Giản
                    </div>
                    <h1>Từ Từ Khóa Đến<br /><span className={styles.gradient}>Bài Viết Hoàn Chỉnh</span></h1>
                    <p>4 bước đơn giản để tạo nội dung SEO chất lượng cao</p>
                </div>
            </section>

            {/* Main Workflow */}
            <section className={styles.workflow}>
                <div className={styles.step}>
                    <div className={styles.stepNumber}>
                        <span>01</span>
                        <div className={styles.connector}></div>
                    </div>
                    <div className={styles.stepContent}>
                        <div className={styles.stepIcon}>⚙️</div>
                        <h2>Thiết Lập Thương Hiệu</h2>
                        <p>Định nghĩa một lần duy nhất về giọng điệu, giá trị cốt lõi và mẫu bài viết của thương hiệu. Hệ thống sẽ nhớ và áp dụng cho tất cả bài viết sau này.</p>
                        <div className={styles.stepDetails}>
                            <div className={styles.detailItem}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                <span>Tên thương hiệu</span>
                            </div>
                            <div className={styles.detailItem}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                <span>Giá trị cốt lõi</span>
                            </div>
                            <div className={styles.detailItem}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                <span>Tone of voice</span>
                            </div>
                            <div className={styles.detailItem}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                <span>Internal links</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.step}>
                    <div className={styles.stepNumber}>
                        <span>02</span>
                        <div className={styles.connector}></div>
                    </div>
                    <div className={styles.stepContent}>
                        <div className={styles.stepIcon}>🔍</div>
                        <h2>AI Nghiên Cứu & Phân Tích</h2>
                        <p>Nhập từ khóa mục tiêu, AI tự động crawl top 10 SERP, phân tích đối thủ và tạo research brief chi tiết với content gaps, recommended outline và strategy.</p>
                        <div className={styles.codeBlock}>
                            <div className={styles.codeHeader}>
                                <span>Research Output</span>
                            </div>
                            <div className={styles.codeContent}>
                                <div className={styles.codeLine}>
                                    <span className={styles.key}>User Intent:</span>
                                    <span className={styles.value}>"Informational"</span>
                                </div>
                                <div className={styles.codeLine}>
                                    <span className={styles.key}>Avg Word Count:</span>
                                    <span className={styles.value}>2,450</span>
                                </div>
                                <div className={styles.codeLine}>
                                    <span className={styles.key}>Content Gaps:</span>
                                    <span className={styles.value}>["Case studies", "FAQ"]</span>
                                </div>
                                <div className={styles.codeLine}>
                                    <span className={styles.key}>Recommended H2s:</span>
                                    <span className={styles.value}>8-10</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.step}>
                    <div className={styles.stepNumber}>
                        <span>03</span>
                        <div className={styles.connector}></div>
                    </div>
                    <div className={styles.stepContent}>
                        <div className={styles.stepIcon}>✍️</div>
                        <h2>Tạo Nội Dung Tự Động</h2>
                        <p>Groq AI với Llama 3.3 70B viết bài theo research brief, content strategy và brand voice. Tự động thêm internal links, tối ưu meta tags và generate hình ảnh.</p>
                        <div className={styles.timeline}>
                            <div className={styles.timelineItem}>
                                <div className={styles.dot}></div>
                                <span>Generate outline (2s)</span>
                            </div>
                            <div className={styles.timelineItem}>
                                <div className={styles.dot}></div>
                                <span>Write content (30s)</span>
                            </div>
                            <div className={styles.timelineItem}>
                                <div className={styles.dot}></div>
                                <span>Create meta tags (5s)</span>
                            </div>
                            <div className={styles.timelineItem}>
                                <div className={styles.dot}></div>
                                <span>Generate images (10s)</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.step}>
                    <div className={styles.stepNumber}>
                        <span>04</span>
                    </div>
                    <div className={styles.stepContent}>
                        <div className={styles.stepIcon}>🚀</div>
                        <h2>Review & Xuất Bản</h2>
                        <p>Nhận bài viết hoàn chỉnh với editor markdown, SEO analysis, readability score. Copy để xuất bản hoặc chỉnh sửa nếu cần.</p>
                        <div className={styles.actionButtons}>
                            <div className={styles.actionButton}>
                                <div className={styles.actionIcon}>📝</div>
                                <span>Edit Content</span>
                            </div>
                            <div className={styles.actionButton}>
                                <div className={styles.actionIcon}>📊</div>
                                <span>SEO Analysis</span>
                            </div>
                            <div className={styles.actionButton}>
                                <div className={styles.actionIcon}>🎨</div>
                                <span>Add Images</span>
                            </div>
                            <div className={styles.actionButton}>
                                <div className={styles.actionIcon}>📋</div>
                                <span>Copy to Publish</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Additional Modes */}
            <section className={styles.modes}>
                <h2>Các Chế Độ Khác</h2>
                <div className={styles.modeGrid}>
                    <div className={styles.modeCard}>
                        <div className={styles.modeIcon}>⚡</div>
                        <h3>Batch Processing</h3>
                        <p>Tạo hàng chục bài viết cùng lúc. Upload file CSV với danh sách từ khóa, hệ thống tự động xử lý từng bài theo queue.</p>
                        <ul>
                            <li>Upload CSV với keywords</li>
                            <li>Auto-process queue</li>
                            <li>Real-time progress tracking</li>
                            <li>Bulk export</li>
                        </ul>
                    </div>

                    <div className={styles.modeCard}>
                        <div className={styles.modeIcon}>🔄</div>
                        <h3>Content Rewrite</h3>
                        <p>Cải thiện bài viết cũ không xếp hạng tốt. AI phân tích URL, tìm content gaps và viết lại bài tốt hơn.</p>
                        <ul>
                            <li>Paste competitor URL</li>
                            <li>AI analyzes structure</li>
                            <li>Find content gaps</li>
                            <li>Generate better version</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className={styles.cta}>
                <h2>Bắt Đầu Tạo Nội Dung Ngay</h2>
                <p>Trải nghiệm quy trình tự động hóa hoàn toàn</p>
                <Link href="/dashboard" className={styles.ctaButton}>
                    Vào Dashboard
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </Link>
            </section>

            <LandingFooter />
        </div>
    )
}
