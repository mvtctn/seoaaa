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
    const [options, setOptions] = useState({
        articleType: 'expert_guide', // expert_guide, pillar, news, review, comparison
        seoMode: 'advanced', // standard, advanced
        language: 'vi', // vi, en
        tone: 'professional', // professional, creative, conversational, clinical
        audience: 'decision_makers', // general, experts, beginners, decision_makers
        length: '1500', // 800, 1500, 2500
        focusKeywords: '',
    })

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
        setProgressLog(options.seoMode === 'advanced' ? '🔍 Đang thực hiện nghiên cứu chuyên sâu (Deep SERP & Semantic Analysis)...' : '🔍 Đang phân tích top 5 đối thủ trên Google...')

        try {
            // Step 1: Research
            const resRes = await fetch('/api/research/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    keyword,
                    options: {
                        seoMode: options.seoMode,
                        language: options.language,
                        competitorCount: options.seoMode === 'advanced' ? 10 : 3
                    }
                })
            })

            if (!resRes.ok) {
                const errData = await resRes.json().catch(() => ({}))
                throw new Error(errData.error || errData.details || `Research failed (${resRes.status})`)
            }
            const resData = await resRes.json()

            // Step 2: Generate Article (STREAMING)
            setCurrentStep(3)
            setProgressLog(`✍️ Đang viết bài ${options.articleType} với Groq AI (Llama 3.3)...`)

            const artRes = await fetch('/api/generate/article', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    keyword,
                    researchBrief: resData.data.brief,
                    contentStrategy: resData.data.strategy,
                    researchId: resData.data.researchId,
                    keywordId: resData.data.keywordId,
                    options: {
                        articleType: options.articleType,
                        tone: options.tone,
                        audience: options.audience,
                        language: options.language,
                        length: options.length,
                        focusKeywords: options.focusKeywords
                    }
                })
            })

            if (!artRes.ok) throw new Error('Generation failed')

            // Consume stream
            const reader = artRes.body?.getReader()
            const decoder = new TextDecoder()
            let fullStreamedContent = ''

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break

                    const chunk = decoder.decode(value, { stream: true })
                    fullStreamedContent += chunk

                    // Update state incrementally for the UI to show progress
                    setArticleData({ content: fullStreamedContent })
                }
            }

            // Step 3: Optional Image or Post-processing
            // Since the backend already saved the article, we just need to transition UI
            // However, we might need the actual ID if we want to show a 'View Article' link
            // For now, let's just mark as done and show the parsed content
            setArticleData({ content: fullStreamedContent })

            setCurrentStep(4)
            setProgressLog('✅ Hoàn thành!')
            setLoading(false)

        } catch (err: any) {
            console.error(err)
            setError(`❌ Lỗi: ${err.message || 'Có lỗi xảy ra. Vui lòng thử lại.'}`)
            setLoading(false)
            setCurrentStep(1)
        }
    }

    const parsed = articleData ? parseArticleResult(articleData) : null

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerInfo}>
                    <h2>Tạo Nội Dung SEO Cao Cấp</h2>
                    <p>Hệ thống AI đa mô hình phân tích đối thủ và viết bài chuẩn SEO vượt trội</p>
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
                {/* Step 1: Input & Configuration */}
                {currentStep === 1 && (
                    <div className={styles.setupContainer}>
                        <div className={styles.setupGrid}>
                            {/* Left Panel: Primary Input */}
                            <div className={styles.mainPanel}>
                                <div className={styles.inputSection}>
                                    <label className={styles.label}>Từ khóa chính cần SEO</label>
                                    <input
                                        type="text"
                                        className={styles.keywordInput}
                                        placeholder="VD: hệ thống thoát nước siphonic là gì?"
                                        value={keyword}
                                        onChange={(e) => setKeyword(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                                        autoFocus
                                    />
                                    <p className={styles.inputHint}>AI sẽ dựa vào từ khóa này để tìm kiếm đối thủ Top 10 Google.</p>
                                </div>

                                <div className={styles.inputSection}>
                                    <label className={styles.label}>Từ khóa phụ / LSI (Tùy chọn)</label>
                                    <textarea
                                        className={styles.textArea}
                                        placeholder="Mỗi từ khóa một dòng..."
                                        rows={3}
                                        value={options.focusKeywords}
                                        onChange={(e) => setOptions({ ...options, focusKeywords: e.target.value })}
                                    />
                                </div>

                                <div className={styles.typeGrid}>
                                    {[
                                        { id: 'expert_guide', label: 'Hướng dẫn Chuyên gia', desc: 'Bài viết chuyên sâu, giàu kiến thức.' },
                                        { id: 'pillar', label: 'Bài viết Trụ cột (Pillar)', desc: 'Nội dung bao quát toàn bộ chủ đề nghách.' },
                                        { id: 'news', label: 'Tin tức / Xu hướng', desc: 'Cập nhật nhanh, mang tính thời sự.' },
                                        { id: 'review', label: 'Đánh giá / So sánh', desc: 'Phân tích ưu nhược điểm bài bản.' }
                                    ].map(type => (
                                        <div
                                            key={type.id}
                                            className={`${styles.typeCard} ${options.articleType === type.id ? styles.typeActive : ''}`}
                                            onClick={() => setOptions({ ...options, articleType: type.id })}
                                        >
                                            <strong>{type.label}</strong>
                                            <span>{type.desc}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Panel: Advanced Config */}
                            <div className={styles.sidePanel}>
                                <div className={styles.configGroup}>
                                    <label className={styles.label}>Chế độ SEO</label>
                                    <div className={styles.toggleGroup}>
                                        <button
                                            className={`${styles.toggleItem} ${options.seoMode === 'standard' ? styles.toggleActive : ''}`}
                                            onClick={() => setOptions({ ...options, seoMode: 'standard' })}
                                        >Chuẩn</button>
                                        <button
                                            className={`${styles.toggleItem} ${options.seoMode === 'advanced' ? styles.toggleActive : ''}`}
                                            onClick={() => setOptions({ ...options, seoMode: 'advanced' })}
                                        >Nâng Cao (VIP)</button>
                                    </div>
                                </div>

                                <div className={styles.configGroup}>
                                    <label className={styles.label}>Ngôn ngữ</label>
                                    <select
                                        className={styles.select}
                                        value={options.language}
                                        onChange={(e) => setOptions({ ...options, language: e.target.value })}
                                    >
                                        <option value="vi">Tiếng Việt</option>
                                        <option value="en">English (US)</option>
                                    </select>
                                </div>

                                <div className={styles.configGroup}>
                                    <label className={styles.label}>Độ dài mong muốn</label>
                                    <select
                                        className={styles.select}
                                        value={options.length}
                                        onChange={(e) => setOptions({ ...options, length: e.target.value })}
                                    >
                                        <option value="800">Ngắn (~800 từ)</option>
                                        <option value="1500">Trung bình (~1500 từ)</option>
                                        <option value="2500">Dài (~2500 từ - Pillar)</option>
                                    </select>
                                </div>

                                <div className={styles.configGroup}>
                                    <label className={styles.label}>Giọng điệu (Tone)</label>
                                    <select
                                        className={styles.select}
                                        value={options.tone}
                                        onChange={(e) => setOptions({ ...options, tone: e.target.value })}
                                    >
                                        <option value="professional">Chuyên nghiệp</option>
                                        <option value="conversational">Trò chuyện, gần gũi</option>
                                        <option value="creative">Sáng tạo, đột phá</option>
                                        <option value="clinical">Hàn lâm, kỹ thuật</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {error && <p className={styles.errorText}>{error}</p>}

                        <div className={styles.actionFooter}>
                            <button
                                className={styles.generateButton}
                                onClick={handleStart}
                                disabled={!keyword.trim() || loading}
                            >
                                {loading ? 'Đang khởi tạo...' : 'Bắt Đầu Nghiên Cứu & Viết Bài'}
                                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </button>
                        </div>
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
