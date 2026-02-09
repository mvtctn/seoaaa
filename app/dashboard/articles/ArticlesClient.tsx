'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import styles from './articles.module.css'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx'
import { saveAs } from 'file-saver'

// API Functions
const getArticles = async () => {
    const res = await fetch('/api/articles')
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Failed to fetch articles')
    return data.data || []
}

const getArticleDetails = async (id: number) => {
    const res = await fetch(`/api/articles/${id}`)
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}...`);
    }
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Failed to fetch article details')
    return data.data
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
    const [downloadingId, setDownloadingId] = useState<number | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    // Query for fetching articles
    const { data: articles = [], isLoading: loading, error } = useQuery({
        queryKey: ['articles'],
        queryFn: getArticles,
        staleTime: 0,
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

    const handleDownload = async (id: number, title: string) => {
        try {
            setDownloadingId(id)
            const article = await getArticleDetails(id)

            // Prepare sections
            const sections = []

            // Title
            sections.push(
                new Paragraph({
                    text: article.title || 'Untitled Article',
                    heading: HeadingLevel.HEADING_1,
                    spacing: { after: 200 }
                })
            )

            // Meta Info Table
            const metaRows = [
                ['Keyword:', article.keyword || 'N/A'],
                ['Slug:', article.slug || 'N/A'],
                ['Status:', article.status?.toUpperCase() || 'DRAFT'],
                ['Created At:', formatDate(article.created_at)],
                ['Meta Title:', article.meta_title || 'N/A'],
                ['Meta Description:', article.meta_description || 'N/A']
            ]

            const table = new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: metaRows.map(row =>
                    new TableRow({
                        children: [
                            new TableCell({
                                width: { size: 30, type: WidthType.PERCENTAGE },
                                children: [new Paragraph({ children: [new TextRun({ text: row[0], bold: true })] })],
                            }),
                            new TableCell({
                                width: { size: 70, type: WidthType.PERCENTAGE },
                                children: [new Paragraph(row[1])],
                            }),
                        ],
                    })
                ),
            })
            sections.push(table)
            sections.push(new Paragraph({ text: '', spacing: { after: 200 } }))

            // Research / Analysis
            if (article.research) {
                sections.push(new Paragraph({ text: 'Research & Analysis', heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }))

                // Try to parse if it's JSON string, or use as object if already parsed
                let researchData = article.research
                if (typeof researchData === 'string') {
                    try { researchData = JSON.parse(researchData) } catch (e) { }
                }

                // Display structured data if available
                const analysisPoints = [
                    { label: 'User Intent', value: researchData.userIntent },
                    { label: 'Word Count', value: researchData.recommendedWordCount },
                    { label: 'Entities', value: Array.isArray(researchData.entities) ? researchData.entities.join(', ') : researchData.entities },
                    { label: 'LSI Keywords', value: Array.isArray(researchData.lsiKeywords) ? researchData.lsiKeywords.join(', ') : researchData.lsiKeywords },
                    { label: 'Content Gaps', value: Array.isArray(researchData.contentGaps) ? researchData.contentGaps.join(', ') : researchData.contentGaps },
                ].filter(p => p.value)

                analysisPoints.forEach(p => {
                    sections.push(new Paragraph({
                        children: [
                            new TextRun({ text: `${p.label}: `, bold: true }),
                            new TextRun(String(p.value))
                        ],
                        bullet: { level: 0 }
                    }))
                })
            }

            // Schema (if extracted or just part of content)
            // Note: Schema is usually inside the content in [SCHEMA] block or similar.
            // We can try to extract it if we want a separate section, but for now dumping content is safer.

            // Article Content
            sections.push(new Paragraph({ text: 'Article Content', heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }))

            // Simple content dump - preserving line breaks
            const contentLines = (article.content || '').split('\n')

            contentLines.forEach((line: string) => {
                // formatting simple headers in markdown
                if (line.startsWith('# ')) {
                    sections.push(new Paragraph({ text: line.replace('# ', ''), heading: HeadingLevel.HEADING_1, spacing: { before: 200 } }))
                } else if (line.startsWith('## ')) {
                    sections.push(new Paragraph({ text: line.replace('## ', ''), heading: HeadingLevel.HEADING_2, spacing: { before: 150 } }))
                } else if (line.startsWith('### ')) {
                    sections.push(new Paragraph({ text: line.replace('### ', ''), heading: HeadingLevel.HEADING_3, spacing: { before: 100 } }))
                } else {
                    sections.push(new Paragraph({ text: line }))
                }
            })

            // Generate
            const doc = new Document({
                sections: [{
                    properties: {},
                    children: sections
                }]
            })

            const blob = await Packer.toBlob(doc)
            saveAs(blob, `${title || 'article'}.docx`)

        } catch (error: any) {
            console.error('Download error fully:', error)
            alert('Lỗi tải bài viết (Xem console để biết chi tiết): ' + error.message)
        } finally {
            setDownloadingId(null)
        }
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
                <div className={styles.headerActions}>
                    <div className={styles.searchBox}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Tìm kiếm tiêu đề, từ khóa..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className={styles.filterSelect}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="published">Đã đăng</option>
                        <option value="draft">Bản nháp</option>
                    </select>
                    <Link href="/dashboard/generate" className="btn btn-primary">
                        + Tạo Mới
                    </Link>
                </div>
            </header>

            {loading ? (
                <div className="text-center py-8 text-secondary">
                    <div className="spinner spinner-lg mx-auto mb-2"></div>
                    Đang tải danh sách...
                </div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th style={{ width: '35%' }}>Bài Viết</th>
                                <th style={{ width: '20%' }}>Từ Khóa</th>
                                <th style={{ width: '10%' }}>Trạng Thái</th>
                                <th style={{ width: '15%' }}>Ngày Tạo</th>
                                <th style={{ width: '20%' }}>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(() => {
                                const filtered = articles.filter((article: any) => {
                                    const matchesSearch =
                                        (article.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        (article.keyword || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        (article.slug || '').toLowerCase().includes(searchTerm.toLowerCase());
                                    const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
                                    return matchesSearch && matchesStatus;
                                });

                                if (filtered.length === 0) {
                                    return (
                                        <tr>
                                            <td colSpan={5} className="text-center py-12 text-secondary">
                                                {articles.length === 0 ? 'Bạn chưa có bài viết nào.' : 'Không tìm thấy bài viết phù hợp.'}
                                                <div className="mt-2">
                                                    <Link href="/dashboard/generate" className="text-primary hover:underline">
                                                        Tạo bài viết mới ngay →
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }

                                return filtered.map((article: any) => (
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
                                                <button
                                                    className="btn btn-sm btn-outline"
                                                    onClick={() => handleDownload(article.id, article.title)}
                                                    disabled={downloadingId === article.id}
                                                    title="Tải về Word"
                                                >
                                                    {downloadingId === article.id ? (
                                                        <span className="spinner spinner-xs"></span>
                                                    ) : (
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                            <polyline points="7 10 12 15 17 10" />
                                                            <line x1="12" y1="15" x2="12" y2="3" />
                                                        </svg>
                                                    )}
                                                </button>

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
                                ))
                            })()}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
