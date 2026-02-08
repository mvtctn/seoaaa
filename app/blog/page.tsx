'use client'

import Link from 'next/link'
import styles from './blog.module.css'
import LandingNavbar from '@/components/LandingNavbar'
import LandingFooter from '@/components/LandingFooter'
import { posts } from '@/lib/blog-posts'

export default function BlogPage() {
    return (
        <div className={styles.container}>
            <LandingNavbar />

            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.badge}>
                    <span className={styles.badgePulse}></span>
                    Blog & Tài Nguyên
                </div>
                <h1>Kiến Thức <span className={styles.gradient}>SEO & AI</span></h1>
                <p>Cập nhật những xu hướng và mẹo sử dụng AI để thống trị bảng xếp hạng Google</p>
            </section>

            {/* Blog Grid */}
            <section className={styles.blogGrid}>
                {posts.map((post) => (
                    <div key={post.id} className={styles.postCard}>
                        <div className={styles.postImage}>
                            {post.image}
                        </div>
                        <div className={styles.categoryBadge}>{post.category}</div>
                        <span className={styles.date}>{post.date}</span>
                        <h2>{post.title}</h2>
                        <p>{post.excerpt}</p>
                        <Link href={`/blog/${post.id}`} className={styles.readMore}>
                            Đọc Thêm
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                ))}
            </section>

            {/* Newsletter */}
            <section className={styles.newsletter}>
                <div className={styles.newsContent}>
                    <h2>Đăng Ký Nhận Bản Tin</h2>
                    <p>Nhận những mẹo SEO độc quyền và cập nhật mới nhất từ SEOAAA</p>
                    <div className={styles.formGroup}>
                        <input type="email" placeholder="Email của bạn..." />
                        <button className={styles.subscribeBtn}>Đăng Ký</button>
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className={styles.cta}>
                <div className={styles.ctaContent}>
                    <h2>Bắt đầu hành trình SEO của bạn</h2>
                    <p>Đăng ký ngay hôm nay để nhận 5,000 Credits miễn phí.</p>
                    <Link href="/dashboard" className={styles.ctaButton}>
                        Bắt Đầu Miễn Phí
                    </Link>
                </div>
            </section>

            <LandingFooter />
        </div>
    )
}
