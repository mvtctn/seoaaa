'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from '../blog.module.css'
import LandingNavbar from '@/components/LandingNavbar'
import LandingFooter from '@/components/LandingFooter'
import { posts } from '@/lib/blog-posts'
import { useEffect, useState } from 'react'

export default function BlogPostDetail() {
    const params = useParams()
    const router = useRouter()
    const [post, setPost] = useState<any>(null)

    useEffect(() => {
        const postId = parseInt(params.id as string)
        const foundPost = posts.find(p => p.id === postId)
        if (foundPost) {
            setPost(foundPost)
        } else {
            router.push('/blog')
        }
    }, [params.id, router])

    if (!post) return null

    return (
        <div className={styles.container}>
            <LandingNavbar />

            <article className={styles.postContentContainer}>
                <Link href="/blog" className={styles.backLink}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Quay lại Blog
                </Link>

                <header className={styles.postHeader}>
                    <div className={styles.categoryBadge}>{post.category}</div>
                    <h1>{post.title}</h1>
                    <div className={styles.postMeta}>
                        <span>Ngày đăng: {post.date}</span>
                        <span>•</span>
                        <span>5 phút đọc</span>
                    </div>
                </header>

                <div
                    className={styles.articleBody}
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Related Posts Link */}
                <div style={{ marginTop: '5rem', borderTop: '1px solid var(--color-border)', paddingTop: '2rem' }}>
                    <h3>Xem thêm bài viết khác</h3>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        {posts.filter(p => p.id !== post.id).slice(0, 2).map(p => (
                            <Link
                                key={p.id}
                                href={`/blog/${p.id}`}
                                style={{
                                    flex: 1,
                                    padding: '1.5rem',
                                    background: 'var(--color-surface)',
                                    borderRadius: '12px',
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    border: '1px solid var(--color-border)'
                                }}
                            >
                                <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>{p.category}</div>
                                <h4 style={{ margin: 0 }}>{p.title}</h4>
                            </Link>
                        ))}
                    </div>
                </div>
            </article>

            <LandingFooter />
        </div>
    )
}
