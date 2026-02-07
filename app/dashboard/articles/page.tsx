'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './articles.module.css'

export default function ArticlesPage() {
    const [articles, setArticles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchArticles()
    }, [])

    const fetchArticles = async () => {
        try {
            const res = await fetch('/api/articles')
            const data = await res.json()
            if (data.success) {
                setArticles(data.data)
            }
        } catch (error) {
            console.error('Failed to fetch articles', error)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.')) return

        try {
            const res = await fetch(`/api/articles/${id}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                setArticles(prev => prev.filter(article => article.id !== id))
            } else {
                alert('Xóa thất bại')
            }
        } catch (error) {
            console.error('Failed to delete article', error)
            alert('Lỗi kết nối')
        }
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h2>Thư Viện Bài Viết</h2>
                    <p className="text-secondary">Quản lý tất cả nội dung đã được tạo.</p>
                </div>
                <Link href="/dashboard/generate" className="btn btn-primary">
                    + Tạo Mới
                </Link>
            </header>

            {loading ? (
                <div className="text-center py-8 text-secondary">Đang tải danh sách...</div>
            ) : articles.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>Chưa có bài viết nào.</p>
                    <Link href="/dashboard/generate" className="text-primary hover:underline mt-2 inline-block">
                        Bắt đầu tạo bài viết đầu tiên ngay!
                    </Link>
                </div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th style={{ width: '40%' }}>Bài Viết</th>
                                <th>Từ Khóa</th>
                                <th>Trạng Thái</th>
                                <th>Ngày Tạo</th>
                                <th>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articles.map((article) => (
                                <tr key={article.id}>
                                    <td>
                                        <Link href={`/dashboard/articles/${article.id}`} className={styles.articleTitle}>
                                            {article.title || 'Untitled Article'}
                                        </Link>
                                        <div className="text-xs text-secondary font-mono">{article.slug}</div>
                                    </td>
                                    <td className="text-sm font-medium text-emerald-400">{article.keyword || 'N/A'}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${article.status === 'published' ? styles.statusPublished : styles.statusDraft}`}>
                                            {article.status || 'Draft'}
                                        </span>
                                    </td>
                                    <td className="text-sm text-secondary">
                                        {formatDate(article.created_at)}
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <Link href={`/dashboard/articles/${article.id}`} className="btn btn-sm btn-outline">
                                                Sửa
                                            </Link>
                                            <button
                                                className="btn btn-sm btn-outline text-error hover:bg-error hover:text-white"
                                                onClick={() => handleDelete(article.id)}
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
