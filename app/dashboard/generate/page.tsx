'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './generate.module.css'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const STEPS = [
    { id: 1, label: 'Nhập Từ Khóa', icon: '🔍' },
    { id: 2, label: 'Nghiên Cứu', icon: '📊' },
    { id: 3, label: 'Tạo Bài Viết', icon: '✍️' },
    { id: 4, label: 'Hoàn Tất', icon: '✅' }
]

export default function GeneratePage() {
    const [currentStep, setCurrentStep] = useState(1)
    const [keyword, setKeyword] = useState('')
    const [loading, setLoading] = useState(false)
    const [progressLog, setProgressLog] = useState('')
    const [articleData, setArticleData] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    const copyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text)
            alert(`✅ Đã copy ${label}!`)
        } catch (err) {
            alert('❌ Không thể copy. Vui lòng thử lại.')
        }
    }

    // Helper to extract content between markers
    const extractSection = (content: string, startMarker: string, nextMarker?: string) => {
        if (!content) return null
        const startIdx = content.indexOf(startMarker)
        if (startIdx === -1) return null

        const dataStart = startIdx + startMarker.length
        if (!nextMarker) return content.substring(dataStart).trim()

        const endIdx = content.indexOf(nextMarker, dataStart)
        if (endIdx === -1) return content.substring(dataStart).trim()

        return content.substring(dataStart, endIdx).trim()
    }

    const parseArticleResult = (data: any) => {
        // New API flow: content is already clean, schema/summary provided separately
        if (data.schema || data.summary) {
            return {
                article: data.content,
                summary: data.summary,
                meta: {
                    title: data.metaTitle,
                    description: data.metaDesc,
                    slug: data.slug
                },
                schema: data.schema
            }
        }

        // Legacy flow: parse raw content with tags
        const rawContent = data.content
        const article = extractSection(rawContent, '[ARTICLE]', '[SUMMARY]') || extractSection(rawContent, '[ARTICLE]', '[META]') || rawContent
        const summary = extractSection(rawContent, '[SUMMARY]', '[META]')
        const metaText = extractSection(rawContent, '[META]', '[SCHEMA]')
        const schema = extractSection(rawContent, '[SCHEMA]')?.replace(/```json\n?|\n?```/g, '').trim()

        // Parse meta lines
        const metaLines = metaText?.split('\n') || []
        const meta: any = {}
        if (data.title) meta.title = data.title
        if (data.slug) meta.slug = data.slug

        metaLines.forEach(line => {
            if (line.toLowerCase().includes('title:')) meta.title = line.split(':')[1]?.trim()
            if (line.toLowerCase().includes('description:')) meta.description = line.split(':')[1]?.trim()
            if (line.toLowerCase().includes('slug:')) meta.slug = line.split(':')[1]?.trim()
        })

        return { article, summary, meta, schema }
    }

    const handleStart = async () => {
        if (!keyword.trim()) return

        setLoading(true)
        setError(null)
        setCurrentStep(2)
        setProgressLog('🔍 Đang phân tích top 5 đối thủ trên Google...')

        try {
            // Step 1: Research
            const resRes = await fetch('/api/research/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyword })
            })

            if (!resRes.ok) throw new Error('Research failed')
            const resData = await resRes.json()

            // Step 2: Generate Article
            setCurrentStep(3)
            setProgressLog('✍️ Đang viết bài với Groq AI (Llama 3.3)...')

            const artRes = await fetch('/api/generate/article', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    keyword,
                    researchBrief: resData.data.brief,
                    contentStrategy: resData.data.strategy,
                    researchId: resData.data.researchId,
                    keywordId: resData.data.keywordId
                })
            })

            if (!artRes.ok) throw new Error('Generation failed')
            const artData = await artRes.json()

            // Step 3: Generate Image
            setProgressLog('🎨 Đang tạo ảnh minh họa (Pollinations AI)...')
            try {
                const imgRes = await fetch('/api/generate/image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        articleId: artData.data.id,
                        title: artData.data.title,
                        keyword: keyword
                    })
                })
                if (imgRes.ok) {
                    const imgData = await imgRes.json()
                    artData.data.image_url = imgData.data.imageUrl
                }
            } catch (e) { console.warn('Image gen failed', e) }

            setArticleData(artData.data)
            setCurrentStep(4)
            setProgressLog('✅ Hoàn thành!')
            setLoading(false)

        } catch (err) {
            console.error(err)
            setError('❌ Có lỗi xảy ra. Vui lòng thử lại.')
            setLoading(false)
            setCurrentStep(1)
        }
    }

    const parsed = articleData ? parseArticleResult(articleData) : null

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerInfo}>
                    <h2>Tạo Nội Nội Dung</h2>
                    <p>Sử dụng AI tiên tiến để tạo nội dung chuẩn SEO vượt trội đối thủ</p>
                </div>
            </header>

            {/* Stepper */}
            <div className={styles.stepper}>
                {STEPS.map((step, idx) => (
                    <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
                        <div className={`${styles.step} ${currentStep >= step.id ? styles.active : ''} ${currentStep > step.id ? styles.completed : ''}`}>
                            <div className={styles.stepIcon}>{step.icon}</div>
                            <span className={styles.stepLabel}>{step.label}</span>
                        </div>
                        {idx < STEPS.length - 1 && <div className={styles.stepDivider} />}
                    </div>
                ))}
            </div>

            <div className={styles.content}>
                {/* Step 1: Input */}
                {currentStep === 1 && (
                    <div className={styles.inputStep}>
                        <h3>Bắt đầu từ khóa mới</h3>
                        <p style={{ marginBottom: '2rem' }}>Hệ thống sẽ nghiên cứu đối thủ và viết bài tự động cho bạn.</p>
                        <input
                            type="text"
                            className={styles.keywordInput}
                            placeholder="Nhập từ khóa chính (VD: siphonic drainage system)"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                            autoFocus
                        />
                        {error && <p className="text-danger mb-4">{error}</p>}
                        <button
                            className="btn btn-primary btn-lg w-full"
                            onClick={handleStart}
                            disabled={!keyword.trim() || loading}
                        >
                            Khởi Tạo Nghiên Cứu
                        </button>
                    </div>
                )}

                {/* Step 2 & 3: Loading */}
                {(currentStep === 2 || currentStep === 3) && loading && (
                    <div className={styles.loaderStep}>
                        <div className="spinner spinner-lg mx-auto"></div>
                        <h3 className="mt-6">Đang xử lý dữ liệu...</h3>
                        <p className={styles.progressLog}>{progressLog}</p>
                    </div>
                )}

                {/* Step 4: Results */}
                {currentStep === 4 && articleData && parsed && (
                    <div className={styles.resultLayout}>
                        <div className={styles.mainContent}>
                            {/* Card 1: Article */}
                            <div className={styles.contentCard}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.cardTitle}>
                                        <svg fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h4.586A1 1 0 0111 2.414l4.293 4.293V15a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>
                                        Nội Dung Bài Viết
                                    </div>
                                    <button className={styles.copyButton} onClick={() => copyToClipboard(parsed.article, 'nội dung bài viết')}>
                                        Copy Markdown
                                    </button>
                                </div>
                                <div className={styles.cardBody}>
                                    <div className={styles.articlePreview}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {parsed.article}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>

                            {/* Card Group: Summary & Keywords */}
                            <div className={styles.metaGrid}>
                                <div className={styles.contentCard}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.cardTitle}>Từ Khóa Chính</div>
                                        <button className={styles.copyButton} onClick={() => copyToClipboard(keyword, 'từ khóa')}>Copy</button>
                                    </div>
                                    <div className={styles.cardBody}>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>{keyword}</div>
                                    </div>
                                </div>

                                <div className={styles.contentCard}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.cardTitle}>Tóm Tắt (Summary)</div>
                                        <button className={styles.copyButton} onClick={() => copyToClipboard(parsed.summary || '', 'tóm tắt')}>Copy</button>
                                    </div>
                                    <div className={styles.cardBody}>
                                        <p style={{ margin: 0, fontSize: '0.9375rem', color: '#94a3b8' }}>{parsed.summary || 'Không có tóm tắt.'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Card 4: Schema */}
                            <div className={styles.contentCard}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.cardTitle}>Schema Markup (JSON-LD)</div>
                                    <button className={styles.copyButton} onClick={() => copyToClipboard(parsed.schema || '', 'schema markup')}>Copy JSON</button>
                                </div>
                                <div className={styles.cardBody}>
                                    <pre className={styles.schemaCode}>{parsed.schema || 'N/A'}</pre>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className={styles.sidebar}>
                            {/* Thumbnail */}
                            {articleData.image_url && (
                                <div className={styles.sidebarCard}>
                                    <div className={styles.sidebarTitle}>Ảnh Đại Diện</div>
                                    <div className={styles.imageBox} style={{ backgroundImage: `url(${articleData.image_url})` }}></div>
                                </div>
                            )}

                            {/* SEO Info */}
                            <div className={styles.sidebarCard}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                    <div className={styles.sidebarTitle} style={{ marginBottom: 0 }}>Thông Tin SEO</div>
                                    <button className={styles.copyButton} style={{ padding: '0.25rem 0.5rem' }} onClick={() => {
                                        const txt = `Title: ${parsed.meta.title}\nDesc: ${parsed.meta.description}\nSlug: ${parsed.meta.slug}`
                                        copyToClipboard(txt, 'thông tin SEO')
                                    }}>Copy</button>
                                </div>
                                <div className={styles.metaInfoBlock}>
                                    <div className={styles.metaField}>
                                        <span className={styles.metaLabel}>Meta Title</span>
                                        <span className={styles.metaValue}>{parsed.meta.title || 'N/A'}</span>
                                    </div>
                                    <div className={styles.metaField}>
                                        <span className={styles.metaLabel}>Meta Description</span>
                                        <span className={styles.metaValue}>{parsed.meta.description || 'N/A'}</span>
                                    </div>
                                    <div className={styles.metaField}>
                                        <span className={styles.metaLabel}>URL Slug</span>
                                        <span className={styles.metaValue}>{parsed.meta.slug || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className={styles.sidebarCard}>
                                <div className={styles.sidebarTitle}>Thao Tác</div>
                                <div className={styles.actionStack}>
                                    <Link href={`/dashboard/articles/${articleData.id}`} className="btn btn-primary w-full">Chỉnh Sửa Bài Viết</Link>
                                    <Link href="/dashboard/articles" className="btn btn-outline w-full">Về Thư Viện Bài Viết</Link>
                                    <button className="btn btn-ghost w-full" onClick={() => {
                                        setCurrentStep(1)
                                        setKeyword('')
                                        setArticleData(null)
                                    }}>Tạo Bài Mới</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
