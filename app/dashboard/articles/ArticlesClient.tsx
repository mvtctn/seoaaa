'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import styles from './articles.module.css'

// API Functions
const getArticles = async () => {
    const res = await fetch('/api/articles')
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Failed to fetch articles')
    return data.data || []
}

const deleteArticleApi = async (id: number) => {
    const res = await fetch(`/api/articles/${id}`, {
        method: 'DELETE'
    })
    if (!res.ok) throw new Error('Failed to delete article')
    return res.json()
}

export default function ArticlesClient() {
    const queryClient = useQueryClient()

    // Query for fetching articles
    const { data: articles = [], isLoading: loading, error } = useQuery({
        queryKey: ['articles'],
        queryFn: getArticles,
        staleTime: 60 * 1000, // 1 minute stale time to prevent immediate refetch on hydration
    })

    // Mutation for deleting articles
    const deleteMutation = useMutation({
        mutationFn: deleteArticleApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['articles'] })
            // Optional: Show a success toast/message here if needed
        },
        onError: (error) => {
            console.error('Failed to delete article', error)
            alert('Xóa thất bại: ' + error.message)
        }
    })

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.')) return
        deleteMutation.mutate(id)
    }

    if (error) {
        return <div className="text-center py-8 text-red-500">Đã có lỗi xảy ra khi tải danh sách bài viết.</div>
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
                <div className="text-center py-8 text-secondary">
                    <div className="spinner spinner-lg mx-auto mb-2"></div>
                    Đang tải danh sách...
                </div>
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
                                <th style={{ width: '20%' }}>Từ Khóa</th>
                                <th style={{ width: '15%' }}>Trạng Thái</th>
                                <th style={{ width: '15%' }}>Ngày Tạo</th>
                                <th style={{ width: '10%' }}>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articles.map((article: any) => (
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
                                                disabled={deleteMutation.isPending}
                                            >
                                                {deleteMutation.isPending ? '...' : 'Xóa'}
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
