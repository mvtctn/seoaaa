'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './rewrite.module.css'

export default function RewritePage() {
    const [url, setUrl] = useState('')
    const [targetKeyword, setTargetKeyword] = useState('')
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [isRewriting, setIsRewriting] = useState(false)
    const [analysis, setAnalysis] = useState<any>(null)
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    const handleAnalyze = async () => {
        if (!url.trim()) {
            setError('Vui lòng nhập URL bài viết')
            return
        }

        setIsAnalyzing(true)
        setError(null)
        setAnalysis(null)

        try {
            const res = await fetch('/api/rewrite/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: url.trim() })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Phân tích thất bại')
            }

            if (data.success) {
                setAnalysis(data.data)
            } else {
                throw new Error('Không nhận được dữ liệu phân tích')
            }
        } catch (e: any) {
            console.error('Analysis error:', e)
            setError(e.message || 'Không thể phân tích URL này. Vui lòng kiểm tra lại.')
        } finally {
            setIsAnalyzing(false)
        }
    }

    const handleRewrite = async () => {
        if (!analysis) return

        setIsRewriting(true)
        setError(null)

        try {
            const res = await fetch('/api/rewrite/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    originalUrl: url,
                    originalContent: analysis.rawContent,
                    targetKeyword: targetKeyword.trim() || analysis.title,
                    analysis: {
                        title: analysis.title,
                        wordCount: analysis.wordCount,
                        headings: analysis.headings,
                        keywords: analysis.keywords,
                        gaps: analysis.gaps
                    }
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Viết lại thất bại')
            }

            if (data.success) {
                setResult(data.data)
            } else {
                throw new Error('Không nhận được kết quả')
            }
        } catch (e: any) {
            console.error('Rewrite error:', e)
            setError(e.message || 'Có lỗi xảy ra khi viết lại nội dung.')
        } finally {
            setIsRewriting(false)
        }
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h2>Viết Lại Nội Dung</h2>
                    <p className="text-secondary">
                        Phân tích và cải thiện bài viết hiện có hoặc của đối thủ
                    </p>
                </div>
            </header>

            {error && (
                <div className={styles.alert + ' ' + styles.alertError}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                </div>
            )}

            {!analysis && !result && (
                <div className={styles.inputSection}>
                    <div className="form-group">
                        <label className="form-label form-label-required">
                            URL Bài Viết Cần Viết Lại
                        </label>
                        <input
                            type="url"
                            className="form-input"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com/bai-viet-cu"
                            disabled={isAnalyzing}
                        />
                        <p className="form-hint">
                            Nhập URL bài viết của bạn hoặc đối thủ để AI phân tích và viết lại tốt hơn
                        </p>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Từ Khóa Mục Tiêu (Tùy chọn)
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            value={targetKeyword}
                            onChange={(e) => setTargetKeyword(e.target.value)}
                            placeholder="VD: SEO content marketing"
                            disabled={isAnalyzing}
                        />
                        <p className="form-hint">
                            Nếu bạn muốn tối ưu cho từ khóa khác với bài gốc
                        </p>
                    </div>

                    <div className={styles.actions}>
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || !url.trim()}
                        >
                            {isAnalyzing ? (
                                <>
                                    <div className="spinner spinner-sm border-white"></div>
                                    Đang Phân Tích...
                                </>
                            ) : (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="11" cy="11" r="8" />
                                        <path d="m21 21-4.35-4.35" />
                                    </svg>
                                    Phân Tích Bài Viết
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {analysis && !result && (
                <div className={styles.analysisSection}>
                    <div className={styles.analysisCard}>
                        <div className={styles.cardHeader}>
                            <h3>Kết Quả Phân Tích</h3>
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => {
                                    setAnalysis(null)
                                    setUrl('')
                                    setTargetKeyword('')
                                }}
                            >
                                Phân tích lại
                            </button>
                        </div>

                        <div className={styles.analysisGrid}>
                            <div className={styles.statBox}>
                                <div className={styles.statLabel}>Số từ</div>
                                <div className={styles.statValue}>{analysis.wordCount}</div>
                            </div>
                            <div className={styles.statBox}>
                                <div className={styles.statLabel}>Headings</div>
                                <div className={styles.statValue}>{analysis.headings?.length || 0}</div>
                            </div>
                            <div className={styles.statBox}>
                                <div className={styles.statLabel}>Keywords</div>
                                <div className={styles.statValue}>{analysis.keywords?.length || 0}</div>
                            </div>
                        </div>

                        <div className={styles.gapsSection}>
                            <h4>Khoảng Trống Nội Dung (Content Gaps)</h4>
                            <ul className={styles.gapsList}>
                                {(analysis.gaps || []).map((gap: string, idx: number) => (
                                    <li key={idx}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 8v4l3 3" />
                                            <circle cx="12" cy="12" r="10" />
                                        </svg>
                                        {gap}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className={styles.rewriteActions}>
                            <button
                                className="btn btn-primary btn-lg w-full"
                                onClick={handleRewrite}
                                disabled={isRewriting}
                            >
                                {isRewriting ? (
                                    <>
                                        <div className="spinner spinner-sm border-white"></div>
                                        Đang Viết Lại...
                                    </>
                                ) : (
                                    <>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                        Viết Lại Bài Viết
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {result && (
                <div className={styles.resultSection}>
                    <div className={styles.successCard}>
                        <div className={styles.successIcon}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        </div>
                        <h3>Bài Viết Đã Được Viết Lại Thành Công!</h3>
                        <p className="text-secondary">
                            Bài viết mới đã được tạo với nội dung tốt hơn, cấu trúc rõ ràng hơn và tối ưu SEO tốt hơn.
                        </p>

                        {result.improvements && (
                            <div className={styles.improvementsList}>
                                <h4>Cải thiện:</h4>
                                <ul>
                                    {result.improvements.map((improvement: string, idx: number) => (
                                        <li key={idx}>✓ {improvement}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className={styles.resultActions}>
                            <Link
                                href={`/dashboard/articles/${result.id}`}
                                className="btn btn-primary"
                            >
                                Xem Bài Viết Mới
                            </Link>
                            <button
                                className="btn btn-outline"
                                onClick={() => {
                                    setResult(null)
                                    setAnalysis(null)
                                    setUrl('')
                                    setTargetKeyword('')
                                }}
                            >
                                Viết Lại Bài Khác
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Feature Info */}
            {!analysis && !result && (
                <div className={styles.infoSection}>
                    <h3>Tính Năng Nổi Bật</h3>
                    <div className={styles.featureGrid}>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>🔍</div>
                            <h4>Phân Tích Sâu</h4>
                            <p>AI đọc và phân tích toàn bộ nội dung, cấu trúc, từ khóa của bài viết gốc</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>🎯</div>
                            <h4>Tìm Content Gap</h4>
                            <p>Xác định những phần còn thiếu hoặc yếu trong bài viết gốc</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>✨</div>
                            <h4>Viết Lại Tốt Hơn</h4>
                            <p>Tạo bài viết mới với nội dung đầy đủ hơn, cấu trúc tốt hơn, SEO tối ưu hơn</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>🚀</div>
                            <h4>Giữ Phong Cách</h4>
                            <p>Viết theo giọng điệu thương hiệu của bạn đã cài đặt</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
