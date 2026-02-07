import Link from 'next/link'
import styles from './blog.module.css'
import LandingNavbar from '@/components/LandingNavbar'
import LandingFooter from '@/components/LandingFooter'

const posts = [
    {
        id: 1,
        title: "Tương lai của SEO trong kỷ nguyên AI",
        excerpt: "AI đang thay đổi cách chúng ta tìm kiếm thông tin. Làm thế nào để nội dung của bạn vẫn duy trì được xếp hạng cao trong năm 2026?",
        date: "05/02/2026",
        category: "Chiến Lược",
        image: "🤖"
    },
    {
        id: 2,
        title: "Cách tạo Research Brief hoàn hảo chỉ trong 5 phút",
        excerpt: "Việc nghiên cứu đối thủ không còn mất hàng giờ đồng hồ nếu bạn biết cách sử dụng các công cụ AI tự động hóa đúng cách.",
        date: "02/02/2026",
        category: "Hướng Dẫn",
        image: "🔍"
    },
    {
        id: 3,
        title: "Tối ưu hóa Content Gap: Bí quyết vượt mặt đối thủ",
        excerpt: "Tìm ra những gì đối thủ đang thiếu chính là cơ hội vàng để bài viết của bạn leo top Google một cách nhanh chóng.",
        date: "28/01/2026",
        category: "Kỹ Thuật SEO",
        image: "📈"
    },
    {
        id: 4,
        title: "Sử dụng Groq AI cho Content Production tốc độ cao",
        excerpt: "Tốc độ xử lý của Groq mang lại khả năng tạo ra hàng chục bài viết chất lượng trong thời gian cực ngắn mà vẫn đảm bảo tính cá nhân hóa.",
        date: "20/01/2026",
        category: "Công Nghệ",
        image: "⚡"
    }
]

export default function BlogPage() {
    return (
        <div className={styles.container}>
            <LandingNavbar />

            {/* Hero */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1>Kiến Thức <span className={styles.gradient}>SEO & AI</span></h1>
                    <p>Cập nhật những xu hướng và kỹ thuật mới nhất về Content Automation và SEO hiện đại.</p>
                </div>
            </section>

            {/* Blog Grid */}
            <section className={styles.blogGrid}>
                {posts.map(post => (
                    <div key={post.id} className={styles.postCard}>
                        <div className={styles.postImage}>{post.image}</div>
                        <div className={styles.postMeta}>
                            <span className={styles.category}>{post.category}</span>
                            <span className={styles.date}>{post.date}</span>
                        </div>
                        <h3>{post.title}</h3>
                        <p>{post.excerpt}</p>
                        <Link href={`/blog/${post.id}`} className={styles.readMore}>
                            Đọc Thêm
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                ))}
            </section>

            {/* Newsletter */}
            <section className={styles.newsletter}>
                <div className={styles.newsContent}>
                    <h2>Đăng ký nhận bản tin</h2>
                    <p>Nhận những bài blog mới nhất và ưu đãi đặc biệt trực tiếp qua email của bạn.</p>
                    <div className={styles.formGroup}>
                        <input type="email" placeholder="Email của bạn..." />
                        <button className={styles.subscribeBtn}>Đăng Ký</button>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className={styles.cta}>
                <h2>Bắt đầu hành trình SEO của bạn</h2>
                <Link href="/dashboard" className={styles.ctaButton}>
                    Trải Nghiệm Dashboard
                </Link>
            </section>

            <LandingFooter />
        </div>
    )
}
