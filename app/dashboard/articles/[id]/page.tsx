'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import styles from '../../generate/generate.module.css'
import dynamic from 'next/dynamic'

// Dynamically import Markdown Editor to avoid SSR issues
const MdEditor = dynamic(() => import('react-markdown-editor-lite'), {
    ssr: false
});

// Import MarkdownIt for rendering within the editor
import MarkdownIt from 'markdown-it';
import 'react-markdown-editor-lite/lib/index.css';

export default function ArticleDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [article, setArticle] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [activeTab, setActiveTab] = useState('content') // 'content', 'research'
    const [editData, setEditData] = useState({
        content: '',
        meta_title: '',
        meta_description: '',
        slug: ''
    })

    // Image Gen State
    const [imageGenPrompt, setImageGenPrompt] = useState('')
    const [generatedImage, setGeneratedImage] = useState<string | null>(null)
    const [isGeneratingImage, setIsGeneratingImage] = useState(false)

    // SEO & Suggestions State
    const [seoAnalysis, setSeoAnalysis] = useState<any[]>([])
    const [linkSuggestions, setLinkSuggestions] = useState<any[]>([])
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [readabilityReport, setReadabilityReport] = useState<any>(null)
    const [isAnalyzingReadability, setIsAnalyzingReadability] = useState(false)

    // Instance of markdown-it
    const mdParser = new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true,
    });

    useEffect(() => {
        if (params.id) {
            fetchArticle(params.id as string)
        }
    }, [params.id])

    const fetchArticle = async (id: string) => {
        try {
            const res = await fetch(`/api/articles/${id}`)
            const data = await res.json()
            if (data.success) {
                setArticle(data.data)
                setEditData({
                    content: data.data.content,
                    meta_title: data.data.meta_title || data.data.title,
                    meta_description: data.data.meta_description || '',
                    slug: data.data.slug || ''
                })
                // Set default prompt
                setImageGenPrompt(data.data.title || '')
            }
        } catch (error) {
            console.error('Failed to fetch article', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!article) return

        try {
            const res = await fetch(`/api/articles/${article.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...editData,
                    title: editData.meta_title // Sync title with meta_title
                })
            })

            if (res.ok) {
                await res.json()
                // Use built-in alert for now, could be replaced with toast
                alert('✅ Đã lưu thay đổi thành công!')
                setIsEditing(false)
                // Refresh local data
                setArticle((prev: any) => ({ ...prev, ...editData, title: editData.meta_title }))
            } else {
                alert('❌ Lưu thất bại. Vui lòng thử lại.')
            }
        } catch (error) {
            console.error('Save failed', error)
            alert('❌ Lỗi kết nối.')
        }
    }

    const copyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text)
            // alert(`✅ Đã copy ${label}!`) 
        } catch (err) {
            console.error('Copy failed')
        }
    }

    const handleGenerateImage = async () => {
        if (!imageGenPrompt.trim()) return
        setIsGeneratingImage(true)
        setGeneratedImage(null)

        try {
            const res = await fetch('/api/generate/image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: imageGenPrompt,
                    saveToDb: false // Don't auto-set thumbnail
                })
            })

            if (res.ok) {
                const data = await res.json()
                setGeneratedImage(data.data.imageUrl)
            } else {
                const err = await res.json().catch(() => ({}))
                alert(`Tạo ảnh thất bại: ${err.error || 'Lỗi server'}`)
            }
        } catch (error) {
            console.error('Gen Image Failed', error)
            alert('Lỗi kết nối')
        } finally {
            setIsGeneratingImage(false)
        }
    }

    const insertImageToContent = () => {
        if (!generatedImage) return
        const imageMarkdown = `\n![${imageGenPrompt}](${generatedImage})\n`

        // If editing, append to content
        // Better: Insert at cursor position if possible, but appending is safer for now without ref
        setEditData(prev => ({
            ...prev,
            content: prev.content + imageMarkdown
        }))

        if (!isEditing) {
            alert('Chuyển sang chế độ chỉnh sửa để thấy ảnh đã thêm!')
            setIsEditing(true)
        } else {
            alert('Đã thêm ảnh vào cuối bài viết!')
        }
    }

    const setAsThumbnail = async () => {
        if (!generatedImage || !article) return

        // Optimistic update
        setArticle((prev: any) => ({ ...prev, thumbnail_url: generatedImage }))

        try {
            // Call API to update DB specifically for thumbnail or just use the PUT endpoint
            const res = await fetch(`/api/articles/${article.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    thumbnail_url: generatedImage // map to correct field 
                })
            })
            if (res.ok) alert('Đã cập nhật ảnh đại diện!')
        } catch (e) {
            console.error(e)
            alert('Lỗi cập nhật thumbnail')
        }
    }

    const runSEOAnalysis = async (content: string, metaTitle: string, metaDesc: string, keyword: string) => {
        setIsAnalyzing(true)
        const analysis = []

        // 1. Meta Title length
        const titleLen = metaTitle?.length || 0
        analysis.push({
            label: 'Độ dài Meta Title',
            status: titleLen >= 50 && titleLen <= 70 ? 'good' : 'warning',
            value: `${titleLen} ký tự`,
            message: titleLen < 50 ? 'Tiêu đề hơi ngắn' : titleLen > 70 ? 'Tiêu đề quá dài' : 'Tối ưu'
        })

        // 2. Meta Desc length
        const descLen = metaDesc?.length || 0
        analysis.push({
            label: 'Meta Description',
            status: descLen >= 120 && descLen <= 160 ? 'good' : 'warning',
            value: `${descLen} ký tự`,
            message: descLen < 120 ? 'Mô tả nên dài hơn' : descLen > 160 ? 'Mô tả quá dài' : 'Tối ưu'
        })

        // 3. Keyword Density
        if (keyword && content) {
            const cleanContent = content.replace(/[#*`]/g, '')
            const words = cleanContent.split(/\s+/).length
            const matches = (cleanContent.match(new RegExp(keyword, 'gi')) || []).length
            const density = ((matches / words) * 100).toFixed(2)
            analysis.push({
                label: 'Mật độ từ khóa',
                status: parseFloat(density) >= 0.5 && parseFloat(density) <= 2.5 ? 'good' : 'warning',
                value: `${density}%`,
                message: `Xuất hiện ${matches} lần. (Mục tiêu: 0.5% - 2.5%)`
            })
        }

        // 4. Heading structures
        const h1Count = (content.match(/^# /gm) || []).length
        analysis.push({
            label: 'Thẻ H1',
            status: h1Count === 1 ? 'good' : 'error',
            value: `${h1Count} thẻ`,
            message: h1Count === 0 ? 'Thiếu H1' : h1Count > 1 ? 'Chỉ nên có 1 thẻ H1' : 'Tốt'
        })

        // 5. Image Alts
        const totalImgs = (content.match(/!\[.*?\]\(.*?\)/g) || []).length
        const missingAlt = (content.match(/!\[\]\(.*?\)/g) || []).length
        analysis.push({
            label: 'Alt hình ảnh',
            status: totalImgs > 0 && missingAlt === 0 ? 'good' : 'warning',
            value: `${totalImgs - missingAlt}/${totalImgs}`,
            message: missingAlt > 0 ? 'Có ảnh thiếu mô tả' : totalImgs === 0 ? 'Nên thêm ảnh minh họa' : 'Đã tối ưu'
        })

        setSeoAnalysis(analysis)

        // Internal Link Suggestions
        try {
            const res = await fetch('/api/articles')
            const allArticles = await res.json()
            if (allArticles.success) {
                // Find other articles whose keywords appear in current content
                const found = allArticles.data
                    .filter((a: any) => a.id !== article?.id)
                    .filter((a: any) => a.keyword && content.toLowerCase().includes(a.keyword.toLowerCase()))
                    .slice(0, 3)
                setLinkSuggestions(found)
            }
        } catch (e) {
            console.error('Failed to fetch suggestions', e)
        }

        setIsAnalyzing(false)
    }

    useEffect(() => {
        if (article) {
            const content = isEditing ? editData.content : article.content
            const title = isEditing ? editData.meta_title : article.meta_title
            const desc = isEditing ? editData.meta_description : article.meta_description
            runSEOAnalysis(content, title, desc, article.keyword || article.target_keyword)
        }
    }, [article, isEditing, editData.content, editData.meta_title, editData.meta_description])

    const handleReadabilityAnalysis = async () => {
        const content = isEditing ? editData.content : article?.content
        if (!content) return

        setIsAnalyzingReadability(true)
        try {
            const res = await fetch('/api/analyze/readability', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            })
            const data = await res.json()
            if (data.success) {
                setReadabilityReport(data.data)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setIsAnalyzingReadability(false)
        }
    }

    const copyAsHtml = async (markdown: string) => {
        try {
            // Pre-process markdown to ensure headings have spaces (e.g., "###Heading" -> "### Heading")
            // This fixes issues where some AI outputs don't follow strict MD rules
            const processedMarkdown = markdown.replace(/^(#+)([^#\s])/gm, '$1 $2');

            // Render md to html using existing mdParser
            const htmlContent = mdParser.render(processedMarkdown);

            // Create a clean plain text version (without ##, **, etc.) for fallback
            const cleanText = processedMarkdown
                .replace(/^#+\s+/gm, '') // Remove heading symbols
                .replace(/\*\*|__/g, '')   // Remove bold
                .replace(/\*|_/g, '')      // Remove italics
                .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links but keep text
                .replace(/`([^`]+)`/g, '$1'); // Remove code backticks

            // Wrap in a structure for better Word compatibility
            const fullHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; }
                        h1 { color: #1a1a1a; }
                        h2 { color: #2d3748; margin-top: 1.5em; }
                        h3 { color: #4a5568; margin-top: 1.25em; }
                        p { margin-bottom: 1em; }
                    </style>
                </head>
                <body>${htmlContent}</body>
                </html>
            `;

            const blob = new Blob([fullHtml], { type: 'text/html' });
            const textBlob = new Blob([cleanText], { type: 'text/plain' });

            const data = [new ClipboardItem({
                'text/html': blob,
                'text/plain': textBlob
            })];

            await navigator.clipboard.write(data);
            alert('✅ Đã copy định dạng Word!');
        } catch (err) {
            console.error('Copy HTML failed', err);
            alert('❌ Lỗi khi copy định dạng Word.');
        }
    }


    // --- Parser Logic (Shared) ---
    const parseArticleContent = (rawContent: string) => {
        if (!rawContent) return { article: '', summary: '', meta: {}, schema: '' }

        // 1. Extract Schema (Best Effort)
        let schema = ''
        let contentWithoutSchema = rawContent

        // Try explicit [SCHEMA] tag
        if (rawContent.includes('[SCHEMA]')) {
            const parts = rawContent.split('[SCHEMA]')
            contentWithoutSchema = parts[0].trim() // Everything before [SCHEMA] is candidate for content
            schema = parts[1].trim()
        }
        // Try identifying JSON block at the end if no tag
        else {
            const jsonBlockRegex = /```json\s*(\{[\s\S]*?\})\s*```$/
            const match = rawContent.match(jsonBlockRegex)
            if (match) {
                schema = match[1]
                contentWithoutSchema = rawContent.replace(match[0], '').trim()
            } else {
                // Loose JSON at end
                const looseJsonRegex = /(\{\s*"@context"\s*:\s*"https?:\/\/schema\.org"[\s\S]*\})$/
                const looseMatch = rawContent.match(looseJsonRegex)
                if (looseMatch) {
                    schema = looseMatch[1]
                    contentWithoutSchema = rawContent.replace(looseMatch[0], '').trim()
                }
            }
        }

        // Clean Schema
        schema = schema.replace(/```json\n?|\n?```/g, '').trim()

        // 2. Extract Meta (from contentWithoutSchema)
        let meta: any = {}
        let contentWithoutMeta = contentWithoutSchema

        if (contentWithoutSchema.includes('[META]')) {
            const parts = contentWithoutSchema.split('[META]')
            contentWithoutMeta = parts[0].trim()
            const metaText = parts[1].trim()

            // Parse Meta
            const metaLines = metaText.split('\n')
            metaLines.forEach(line => {
                if (line.toLowerCase().includes('title:')) meta.title = line.split(':')[1]?.trim()
                if (line.toLowerCase().includes('description:')) meta.description = line.split(':')[1]?.trim()
                if (line.toLowerCase().includes('slug:')) meta.slug = line.split(':')[1]?.trim()
            })
        }

        // 3. Extract Summary (from contentWithoutMeta)
        let summary = ''
        let finalArticle = contentWithoutMeta

        if (contentWithoutMeta.includes('[SUMMARY]')) {
            const parts = contentWithoutMeta.split('[SUMMARY]')
            finalArticle = parts[0].trim()
            summary = parts[1].trim()
        }

        // 4. Remove [ARTICLE] tag if present
        finalArticle = finalArticle.replace('[ARTICLE]', '').trim()

        return { article: finalArticle, summary, meta, schema }
    }
    // ------------------------------------------------

    if (loading) return <div className="text-center py-20 text-secondary">Đang tải nội dung chuyên sâu...</div>
    if (!article) return <div className="text-center py-20 text-danger">Không tìm thấy bài viết yêu cầu.</div>

    // Parsing logic
    const contentToDisplay = isEditing ? editData.content : article.content
    const parsed = parseArticleContent(contentToDisplay)

    // Display values
    const displayTitle = isEditing ? editData.meta_title : (parsed.meta.title || article.meta_title || article.title)
    const displayDesc = isEditing ? editData.meta_description : (parsed.meta.description || article.meta_description)
    const displaySlug = isEditing ? editData.slug : (parsed.meta.slug || article.slug)

    return (
        <div className={`${styles.container} ${styles.fullWidth}`}>
            {/* Header with quick actions */}
            <header className={styles.header}>
                <div className={styles.headerInfo}>
                    <div className="flex items-center gap-2 mb-1">
                        <Link href="/dashboard/articles" className="text-xs font-semibold text-primary hover:opacity-80">
                            ← THƯ VIỆN
                        </Link>
                        <span className="text-[10px] text-tertiary">|</span>
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20 font-bold uppercase">
                            {article.status || 'DRAFT'}
                        </span>
                    </div>

                    <h2 style={{ fontSize: '1.25rem' }}>
                        {isEditing ? 'Chế độ Chỉnh sửa' : displayTitle}
                    </h2>
                </div>
                <div className="flex gap-2">
                    {isEditing ? (
                        <>
                            <button className="btn btn-ghost btn-sm text-red-400" onClick={() => {
                                setIsEditing(false)
                                // Reset data
                                setEditData({
                                    content: article.content,
                                    meta_title: article.meta_title || article.title,
                                    meta_description: article.meta_description || '',
                                    slug: article.slug || ''
                                })
                            }}>
                                Hủy Bỏ
                            </button>
                            <button className="btn btn-primary btn-sm" onClick={handleSave}>
                                Lưu Thay Đổi
                            </button>
                        </>
                    ) : (
                        <button className="btn btn-primary btn-sm" onClick={() => setIsEditing(true)}>
                            Chỉnh Sửa
                        </button>
                    )}
                </div>
            </header>

            {!isEditing && (
                <div className={styles.tabsContainer}>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'content' ? styles.active : ''}`}
                        onClick={() => setActiveTab('content')}
                    >
                        <div className="flex items-center gap-2">
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 00 2 2h14a2 2 0 00 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Kiến Trúc Nội Dung
                        </div>
                    </button>
                    {article?.research && (
                        <button
                            className={`${styles.tabButton} ${activeTab === 'research' ? styles.active : ''}`}
                            onClick={() => setActiveTab('research')}
                        >
                            <div className="flex items-center gap-2">
                                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Nghiên Cứu & Chiến Lược
                            </div>
                        </button>
                    )}
                </div>
            )}

            <div className={styles.resultLayout}>
                {/* Main Section */}
                <div className={styles.mainContent}>

                    {/* Main Content Area (Hidden if Research Tab is Active) */}
                    {(isEditing || activeTab === 'content') && (
                        <div className="flex flex-col gap-6">
                            {/* Editor / Content Area */}
                            <div className={styles.contentCard} style={isEditing ? { overflow: 'visible' } : {}}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.cardTitle}>
                                        <svg fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h4.586A1 1 0 0111 2.414l4.293 4.293V15a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>
                                        {isEditing ? 'Trình Soạn Thảo' : 'Nội Dung Chi Tiết'}
                                    </div>
                                    {!isEditing && (
                                        <div className="flex gap-2">
                                            <button className={styles.copyButton} onClick={() => copyAsHtml(parsed.article)}>
                                                Copy Word
                                            </button>
                                            <button className={styles.copyButton} onClick={() => copyToClipboard(parsed.article, 'nội dung bài viết')}>
                                                Copy Md
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.cardBody} style={{ padding: isEditing ? 0 : '1.5rem' }}>
                                    {isEditing ? (
                                        <div className="editor-wrapper text-black">
                                            {/* Wrapper to control editor styling, ensuring text is visible (black) on white editor background */}
                                            <MdEditor
                                                style={{ height: '600px' }}
                                                renderHTML={(text) => mdParser.render(text)}
                                                onChange={({ text }) => setEditData({ ...editData, content: text })}
                                                value={editData.content}
                                                config={{
                                                    view: { menu: true, md: true, html: false }, // Only Markdown view by default, can toggle
                                                    canView: { menu: true, md: true, html: true, fullScreen: true, hideMenu: true },
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div className={styles.articlePreview}>
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {parsed.article}
                                            </ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {!isEditing && parsed.summary && (
                                <div className={styles.contentCard}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.cardTitle}>Tóm Tắt</div>
                                    </div>
                                    <div className={styles.cardBody}>
                                        <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>{parsed.summary}</p>
                                    </div>
                                </div>
                            )}

                            {!isEditing && parsed.schema && (
                                <div className={styles.contentCard}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.cardTitle}>Schema Markup (JSON-LD)</div>
                                        <button className={styles.copyButton} onClick={() => copyToClipboard(parsed.schema || '', 'schema code')}>
                                            Copy Code
                                        </button>
                                    </div>
                                    <div className={styles.cardBody} style={{ padding: '0' }}>
                                        <pre className={styles.schemaCode} style={{ margin: 0, borderRadius: 0 }}>
                                            {parsed.schema}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Research Tab Content */}
                    {!isEditing && activeTab === 'research' && article?.research && (
                        <div className="animate-fadeIn flex flex-col gap-6">
                            {/* Strategic Positioning */}
                            {article.research.strategic_positioning && (
                                <div className={styles.contentCard}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.cardTitle}>
                                            <span style={{ color: '#0ea5e9', marginRight: '0.5rem' }}>⚡</span> Định Hướng Chiến Lược
                                        </div>
                                    </div>
                                    <div className={styles.cardBody}>
                                        <div className="prose prose-invert max-w-none prose-sm">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {article.research.strategic_positioning}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Competitor Analysis */}
                                {article.research.competitor_analysis && (
                                    <div className={styles.contentCard}>
                                        <div className={styles.cardHeader}>
                                            <div className={styles.cardTitle}>🔍 Danh Sách Đối Thủ</div>
                                        </div>
                                        <div className={styles.cardBody}>
                                            <ul className="flex flex-col gap-2">
                                                {(() => {
                                                    try {
                                                        const comps = typeof article.research.competitor_analysis === 'string'
                                                            ? JSON.parse(article.research.competitor_analysis)
                                                            : article.research.competitor_analysis;

                                                        if (!Array.isArray(comps)) return <li className="text-xs opacity-50">Dữ liệu không hợp lệ</li>;

                                                        return comps.map((c: any, i: number) => (
                                                            <li key={i} className="text-xs p-2 bg-slate-800/50 rounded border border-slate-700/50 flex flex-col gap-1">
                                                                <span className="font-medium text-white line-clamp-1">{c.title}</span>
                                                                <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 truncate text-[10px]">
                                                                    {c.url}
                                                                </a>
                                                            </li>
                                                        ));
                                                    } catch (e) {
                                                        return <li className="text-xs opacity-50">{typeof article.research.competitor_analysis === 'string' ? article.research.competitor_analysis : 'Error loading competitors'}</li>;
                                                    }
                                                })()}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {/* Content Gaps */}
                                {article.research.content_gaps && (
                                    <div className={styles.contentCard}>
                                        <div className={styles.cardHeader}>
                                            <div className={styles.cardTitle}>🕳️ Lỗ Hổng Nội Dung</div>
                                        </div>
                                        <div className={styles.cardBody}>
                                            <ul className="flex flex-col gap-2">
                                                {(() => {
                                                    try {
                                                        const gaps = typeof article.research.content_gaps === 'string'
                                                            ? JSON.parse(article.research.content_gaps)
                                                            : article.research.content_gaps;

                                                        if (!Array.isArray(gaps)) return <li className="text-xs opacity-50">Không có dữ liệu</li>;

                                                        return gaps.map((gap: string, i: number) => (
                                                            <li key={i} className="text-xs p-3 bg-amber-950/20 border border-amber-900/30 rounded text-amber-200/80 italic">
                                                                &ldquo;{gap}&rdquo;
                                                            </li>
                                                        ));
                                                    } catch (e) {
                                                        return <li className="text-xs italic opacity-50">{typeof article.research.content_gaps === 'string' ? article.research.content_gaps : 'Error loading gaps'}</li>;
                                                    }
                                                })()}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Semantic SEO Section */}
                            {(article.research.entities || article.research.gemini_brief) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className={styles.contentCard}>
                                        <div className={styles.cardHeader}>
                                            <div className={styles.cardTitle}>🧠 Thực Thể (Entities)</div>
                                        </div>
                                        <div className={styles.cardBody}>
                                            <div className="flex flex-wrap gap-2">
                                                {(() => {
                                                    try {
                                                        const brief = JSON.parse(article.research.gemini_brief || '{}');
                                                        const entities = brief.entities || [];
                                                        if (entities.length === 0) return <span className="text-xs text-slate-500 italic">Không tìm thấy thực thể.</span>;
                                                        return entities.map((e: string, i: number) => (
                                                            <span key={i} className="text-[10px] px-2 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-md font-medium">
                                                                {e}
                                                            </span>
                                                        ));
                                                    } catch (e) {
                                                        return <span className="text-xs text-slate-500 italic">Lỗi hiển thị thực thể.</span>;
                                                    }
                                                })()}
                                            </div>
                                            <p className="text-[10px] text-slate-500 mt-3 italic">Các chủ đề, tổ chức, khái niệm mà Google kỳ vọng bài viết phải có.</p>
                                        </div>
                                    </div>

                                    <div className={styles.contentCard}>
                                        <div className={styles.cardHeader}>
                                            <div className={styles.cardTitle}>🏷️ Từ Khóa Ngữ Nghĩa (LSI)</div>
                                        </div>
                                        <div className={styles.cardBody}>
                                            <div className="flex flex-wrap gap-2">
                                                {(() => {
                                                    try {
                                                        const brief = JSON.parse(article.research.gemini_brief || '{}');
                                                        const lsi = brief.lsiKeywords || [];
                                                        if (lsi.length === 0) return <span className="text-xs text-slate-500 italic">Không tìm thấy từ khóa LSI.</span>;
                                                        return lsi.map((k: string, i: number) => (
                                                            <span key={i} className="text-[10px] px-2 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-md font-medium">
                                                                {k}
                                                            </span>
                                                        ));
                                                    } catch (e) {
                                                        return <span className="text-xs text-slate-500 italic">Lỗi hiển thị từ khóa.</span>;
                                                    }
                                                })()}
                                            </div>
                                            <p className="text-[10px] text-slate-500 mt-3 italic">Các thuật ngữ liên quan giúp tăng độ tin cậy và chiều sâu cho nội dung.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* SERP Summary */}
                            {article.research.serp_data && (
                                <div className={styles.contentCard}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.cardTitle}>📊 Chi Tiết SERP (Top 5 Google)</div>
                                    </div>
                                    <div className={styles.cardBody}>
                                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                                            {(() => {
                                                try {
                                                    const serp = typeof article.research.serp_data === 'string'
                                                        ? JSON.parse(article.research.serp_data)
                                                        : article.research.serp_data;

                                                    if (!Array.isArray(serp)) return <div className="text-xs opacity-50">Không có dữ liệu SERP</div>;

                                                    return serp.map((s: any, i: number) => (
                                                        <div key={i} className="p-3 bg-slate-900/80 rounded border border-slate-800 flex flex-col gap-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="bg-slate-800 text-slate-400 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                                                    {i + 1}
                                                                </span>
                                                                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Hạng {i + 1}</span>
                                                            </div>
                                                            <h4 className="text-[11px] font-bold text-slate-200 line-clamp-2 leading-tight h-8">
                                                                {s.title}
                                                            </h4>
                                                            <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed opacity-70">
                                                                {s.snippet}
                                                            </p>
                                                            <a href={s.url || '#'} target="_blank" rel="noopener noreferrer" className="text-[9px] text-indigo-400 hover:underline truncate mt-auto">
                                                                {s.url ? new URL(s.url).hostname : 'N/A'}
                                                            </a>
                                                        </div>
                                                    ));
                                                } catch (e) {
                                                    return <div className="text-xs opacity-50">{typeof article.research.serp_data === 'string' ? article.research.serp_data : 'Error loading SERP'}</div>;
                                                }
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar Section */}
                <div className={styles.sidebar}>
                    {/* SEO Parameters Card */}
                    <div className={styles.sidebarCard}>
                        <div className="flex justify-between items-center mb-4">
                            <div className={styles.sidebarTitle} style={{ marginBottom: 0 }}>Cấu Hình SEO</div>
                        </div>

                        <div className={styles.metaInfoBlock}>
                            <div className={styles.metaField}>
                                <label className={styles.metaLabel}>META TITLE ({(displayTitle?.length || 0)} chars)</label>
                                {isEditing ? (
                                    <input
                                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none transition-colors"
                                        value={displayTitle}
                                        onChange={(e) => setEditData({ ...editData, meta_title: e.target.value })}
                                        placeholder="Nhập tiêu đề SEO chuẩn..."
                                    />
                                ) : (
                                    <span className={styles.metaValue} style={{ fontWeight: 600, color: 'var(--color-primary-light)' }}>
                                        {displayTitle || 'Checking...'}
                                    </span>
                                )}
                            </div>

                            <div className={styles.metaField}>
                                <label className={styles.metaLabel}>META DESCRIPTION ({(displayDesc?.length || 0)} chars)</label>
                                {isEditing ? (
                                    <textarea
                                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white h-24 focus:border-indigo-500 focus:outline-none transition-colors resize-none"
                                        value={displayDesc}
                                        onChange={(e) => setEditData({ ...editData, meta_description: e.target.value })}
                                        placeholder="Mô tả hấp dẫn, chứa từ khóa chính..."
                                    />
                                ) : (
                                    <span className={styles.metaValue} style={{ fontSize: '0.8rem' }}>
                                        {displayDesc || 'Checking...'}
                                    </span>
                                )}
                            </div>

                            <div className={styles.metaField}>
                                <label className={styles.metaLabel}>URL SLUG</label>
                                {isEditing ? (
                                    <div className="flex items-center">
                                        <span className="text-gray-500 text-xs mr-1">/</span>
                                        <input
                                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm font-mono text-cyan-400 focus:border-cyan-500 focus:outline-none transition-colors"
                                            value={displaySlug}
                                            onChange={(e) => setEditData({ ...editData, slug: e.target.value })}
                                            placeholder="duong-dan-than-thien"
                                        />
                                    </div>
                                ) : (
                                    <span className={styles.metaValue} style={{ fontFamily: 'monospace', color: '#38bdf8', fontSize: '0.75rem' }}>
                                        {displaySlug || 'Checking...'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Keyword Info Card */}
                    <div className={styles.sidebarCard}>
                        <div className={styles.sidebarTitle} style={{ marginBottom: '0.5rem' }}>Thông Tin Từ Khóa</div>
                        <div className={styles.metaInfoBlock}>
                            <div className={styles.metaField}>
                                <label className={styles.metaLabel}>TARGET KEYWORD</label>
                                <div className="bg-slate-800/50 px-3 py-2 rounded border border-slate-700/50 text-sm font-medium text-emerald-400 break-words">
                                    {article.keyword || 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SEO Checklist & Internal Link Report */}
                    <div className={styles.sidebarCard}>
                        <div className={styles.sidebarTitle}>Báo Cáo SEO & Link</div>
                        <div className="flex flex-col gap-4">
                            {seoAnalysis.map((item, idx) => (
                                <div key={idx} className="border-b border-slate-700 pb-2 last:border-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs text-slate-400 font-medium">{item.label}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase font-bold ${item.status === 'good' ? 'bg-success/20 text-success' :
                                            item.status === 'warning' ? 'bg-warning/20 text-warning' : 'bg-error/20 text-error'
                                            }`}>
                                            {item.value}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 italic">{item.message}</p>
                                </div>
                            ))}

                            {linkSuggestions.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-slate-700">
                                    <div className="text-xs text-indigo-400 font-bold mb-2">Gợi ý Link Nội Bộ:</div>
                                    <div className="flex flex-col gap-2">
                                        {linkSuggestions.map((s) => (
                                            <div key={s.id} className="text-[11px] p-2 bg-slate-800 rounded border border-slate-700 flex justify-between items-center group">
                                                <span className="truncate flex-1 pr-2">{s.title}</span>
                                                <button
                                                    className="text-indigo-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => {
                                                        const linkMd = ` [${s.keyword}](/dashboard/articles/${s.id}) `
                                                        setEditData(prev => ({ ...prev, content: prev.content + linkMd }))
                                                        if (!isEditing) setIsEditing(true)
                                                    }}
                                                >
                                                    Chèn
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* AI Quality & Readability */}
                    <div className={styles.sidebarCard}>
                        <div className={styles.sidebarTitle}>Đánh giá Chất lượng AI</div>
                        {!readabilityReport ? (
                            <button
                                className="btn btn-outline btn-sm w-full"
                                onClick={handleReadabilityAnalysis}
                                disabled={isAnalyzingReadability}
                            >
                                {isAnalyzingReadability ? 'Đang phân tích...' : 'Phân tích Độ dễ đọc'}
                            </button>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-300">Điểm chất lượng:</span>
                                    <span className={`text-lg font-bold ${readabilityReport.score >= 80 ? 'text-success' :
                                        readabilityReport.score >= 60 ? 'text-warning' : 'text-error'
                                        }`}>
                                        {readabilityReport.score}/100
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-slate-800 p-2 rounded border border-slate-700">
                                        <div className="text-[10px] text-slate-500 uppercase">Giọng văn</div>
                                        <div className="text-xs text-indigo-300 font-medium">{readabilityReport.tone}</div>
                                    </div>
                                    <div className="bg-slate-800 p-2 rounded border border-slate-700">
                                        <div className="text-[10px] text-slate-500 uppercase">Trình độ</div>
                                        <div className="text-xs text-indigo-300 font-medium">{readabilityReport.level}</div>
                                    </div>
                                </div>

                                <div className="mt-1">
                                    <div className="text-xs text-indigo-400 font-bold mb-1">Gợi ý cải thiện:</div>
                                    <ul className="list-disc list-inside flex flex-col gap-1">
                                        {readabilityReport.suggestions.map((s: string, i: number) => (
                                            <li key={i} className="text-[11px] text-slate-400 leading-tight">{s}</li>
                                        ))}
                                    </ul>
                                </div>

                                <button
                                    className="btn btn-ghost btn-xs w-full mt-2 text-slate-500"
                                    onClick={handleReadabilityAnalysis}
                                    disabled={isAnalyzingReadability}
                                >
                                    Phân tích lại
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Image Generator */}
                    <div className={styles.sidebarCard}>
                        <div className={styles.sidebarTitle}>Tạo Ảnh AI</div>
                        <div className="flex flex-col gap-3">
                            <textarea
                                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white resize-none focus:outline-none focus:border-indigo-500"
                                rows={3}
                                placeholder="Mô tả ảnh muốn tạo..."
                                value={imageGenPrompt}
                                onChange={(e) => setImageGenPrompt(e.target.value)}
                            />
                            <button
                                className="btn btn-primary btn-sm w-full"
                                onClick={handleGenerateImage}
                                disabled={isGeneratingImage || !imageGenPrompt.trim()}
                            >
                                {isGeneratingImage ? 'Đang tạo...' : 'Tạo Ảnh Mới'}
                            </button>

                            {generatedImage && (
                                <div className="mt-2 animate-fadeIn">
                                    <div className="relative aspect-video rounded overflow-hidden border border-slate-700 mb-2 group">
                                        <img src={generatedImage} alt="Generated" className="object-cover w-full h-full" referrerPolicy="no-referrer" />
                                        <a href={generatedImage} target="_blank" className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Full Size</a>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button className="btn btn-outline btn-xs" onClick={insertImageToContent}>
                                            + Vào Bài
                                        </button>
                                        <button className="btn btn-outline btn-xs" onClick={setAsThumbnail}>
                                            Làm Thumbnail
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Thumbnail Card (View Only) */}
                    {(article.thumbnail_url || article.image_url) && (
                        <div className={styles.sidebarCard}>
                            <div className={styles.sidebarTitle}>Ảnh Minh Họa</div>
                            <div
                                className={styles.imageBox}
                                style={{ backgroundImage: `url(${article.thumbnail_url || article.image_url})`, cursor: 'pointer' }}
                                onClick={() => window.open(article.thumbnail_url || article.image_url, '_blank')}
                            ></div>
                        </div>
                    )}

                    {/* Quick Navigation Card */}
                    <div className={styles.sidebarCard}>
                        <div className={styles.sidebarTitle} style={{ marginBottom: '0.5rem' }}>Thao Tác</div>
                        <div className={styles.actionStack}>
                            {!isEditing && (
                                <Link href="/dashboard/generate" className="btn btn-outline btn-sm w-full text-center">Tạo Bài Viết Mới</Link>
                            )}
                            <button className="btn btn-ghost btn-sm w-full" onClick={() => router.push('/dashboard/articles')}>Đóng Trình Xem</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
