'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './generate.module.css'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { motion, AnimatePresence } from 'framer-motion'

const STEPS = [
    { id: 1, label: 'Nhập Từ Khóa', icon: '🔍' },
    { id: 2, label: 'Nghiên Cứu', icon: '📊' },
    { id: 3, label: 'Tạo Bài Viết', icon: '✍️' },
    { id: 4, label: 'Hoàn Tất', icon: '✅' }
]

export default function GeneratePage() {
    const [hasMounted, setHasMounted] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)
    const [keyword, setKeyword] = useState('')
    const [loading, setLoading] = useState(false)
    const [progressLog, setProgressLog] = useState('')
    const [articleData, setArticleData] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [researchTasks, setResearchTasks] = useState([
        { id: 'serp', name: 'Phân tích Top đối thủ Google', status: 'pending', desc: 'Đang trích xuất dữ liệu từ Top SERP...' },
        { id: 'semantic', name: 'Nghiên cứu ngữ nghĩa & Entity', status: 'pending', desc: 'Xây dựng bản đồ thực thể (Semantic Map)...' },
        { id: 'strategy', name: 'Lập chiến lược nội dung SEO', status: 'pending', desc: 'Tối ưu hóa outline và cấu trúc bài viết...' },
        { id: 'writing', name: 'Viết bài AI đa mô hình', status: 'pending', desc: 'Đang sử dụng Llama 3.3 Versatile...' }
    ])

    useEffect(() => {
        setHasMounted(true)
    }, [])

    const updateTaskStatus = (id: string, status: 'pending' | 'active' | 'completed') => {
        setResearchTasks(tasks => tasks.map(t => t.id === id ? { ...t, status } : t))
    }

    const [options, setOptions] = useState({
        articleType: 'expert_guide',
        seoMode: 'advanced',
        language: 'vi',
        tone: 'professional',
        audience: 'decision_makers',
        length: '1500',
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
        if (!data?.content) return null

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

        const rawContent = data.content
        const article = extractSection(rawContent, '[ARTICLE]', '[SUMMARY]') || extractSection(rawContent, '[ARTICLE]', '[META]') || rawContent
        const summary = extractSection(rawContent, '[SUMMARY]', '[META]')
        const metaText = extractSection(rawContent, '[META]', '[SCHEMA]')
        const schema = extractSection(rawContent, '[SCHEMA]')?.replace(/```json\n?|\n?```/g, '').trim()

        const metaLines = metaText?.split('\n') || []
        const meta: any = { title: data.title, slug: data.slug }

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
        setArticleData(null)
        setResearchTasks(t => t.map(item => ({ ...item, status: 'pending' })))

        try {
            updateTaskStatus('serp', 'active')
            setCurrentStep(2)
            setProgressLog('🔍 Đang phân tích đối thủ...')

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

            updateTaskStatus('serp', 'completed')
            updateTaskStatus('semantic', 'active')
            setProgressLog('🧩 Đang xây dựng cấu trúc ngữ nghĩa...')
            await new Promise(r => setTimeout(r, 800))

            updateTaskStatus('semantic', 'completed')
            updateTaskStatus('strategy', 'active')
            setProgressLog('📋 Đang lập chiến lược nội dung...')
            await new Promise(r => setTimeout(r, 600))

            updateTaskStatus('strategy', 'completed')
            updateTaskStatus('writing', 'active')

            setCurrentStep(3)
            setProgressLog(`✍️ Đang viết bài ${options.articleType}...`)

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

            const reader = artRes.body?.getReader()
            const decoder = new TextDecoder()
            let fullStreamedContent = ''

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break

                    const chunk = decoder.decode(value, { stream: true })
                    fullStreamedContent += chunk
                    setArticleData({ content: fullStreamedContent })
                }
            }

            updateTaskStatus('writing', 'completed')

            // Re-parse with final full content and possible metadata from backend (if we were to add it)
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
            {!loading && (
                <header className={styles.header}>
                    <div className={styles.headerInfo}>
                        <h2>Tạo Nội Dung SEO Cao Cấp</h2>
                        <p>Hệ thống AI đa mô hình phân tích đối thủ và viết bài chuẩn SEO vượt trội</p>
                    </div>
                </header>
            )}

            {!hasMounted ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}>
                    <div className="spinner spinner-lg"></div>
                </div>
            ) : (
                <>
                    {!loading && (
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
                    )}

                    <div className={styles.content}>
                        {currentStep === 1 && (
                            <div className={styles.setupContainer}>
                                <div className={styles.setupGrid}>
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
                                                { id: 'expert_guide', label: 'Hướng dẫn Chuyên gia', desc: 'Bài viết chuyên sâu.' },
                                                { id: 'pillar', label: 'Bài Trụ cột', desc: 'Nội dung bao quát.' },
                                                { id: 'news', label: 'Tin tức', desc: 'Cập nhật nhanh.' },
                                                { id: 'review', label: 'Đánh giá', desc: 'Phân tích kỹ.' }
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
                                    <div className={styles.sidePanel}>
                                        <div className={styles.configGroup}>
                                            <label className={styles.label}>Chế độ SEO</label>
                                            <div className={styles.toggleGroup}>
                                                <button className={`${styles.toggleItem} ${options.seoMode === 'standard' ? styles.toggleActive : ''}`} onClick={() => setOptions({ ...options, seoMode: 'standard' })}>Chuẩn</button>
                                                <button className={`${styles.toggleItem} ${options.seoMode === 'advanced' ? styles.toggleActive : ''}`} onClick={() => setOptions({ ...options, seoMode: 'advanced' })}>VIP</button>
                                            </div>
                                        </div>
                                        <div className={styles.configGroup}>
                                            <label className={styles.label}>Ngôn ngữ</label>
                                            <select className={styles.select} value={options.language} onChange={(e) => setOptions({ ...options, language: e.target.value })}>
                                                <option value="vi">Tiếng Việt</option>
                                                <option value="en">English</option>
                                            </select>
                                        </div>
                                        <div className={styles.configGroup}>
                                            <label className={styles.label}>Độ dài</label>
                                            <select className={styles.select} value={options.length} onChange={(e) => setOptions({ ...options, length: e.target.value })}>
                                                <option value="800">~800 từ</option>
                                                <option value="1500">~1500 từ</option>
                                                <option value="2500">~2500 từ</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                {error && <p className={styles.errorText}>{error}</p>}
                                <div className={styles.actionFooter}>
                                    <button className={styles.generateButton} onClick={handleStart} disabled={!keyword.trim() || loading}>
                                        {loading ? 'Đang khởi tạo...' : 'Bắt Đầu Nghiên Cứu & Viết Bài'}
                                    </button>
                                </div>
                            </div>
                        )}

                        <AnimatePresence>
                            {loading && (currentStep === 2 || (currentStep === 3 && !articleData?.content)) && (
                                <motion.div
                                    className={styles.loadingOverlay}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <div className={styles.hudContainer}>
                                        {/* Left HUD Panel */}
                                        <motion.div
                                            className={styles.sidePanelLeft}
                                            initial={{ x: -100, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            <div className={styles.iconMenu}>
                                                <div className={`${styles.menuIcon} ${styles.menuIconActive}`}>📸</div>
                                                <div className={styles.menuIcon}>🔍</div>
                                                <div className={styles.menuIcon}>🎨</div>
                                                <div className={styles.menuIcon}>👁️</div>
                                                <div className={styles.menuIcon}>🧠</div>
                                            </div>
                                            <div className={styles.dataVisual}>
                                                <div className={styles.visualLabel}>Neural Load</div>
                                                <div className={styles.chartContainer}>
                                                    <svg width="200" height="40" viewBox="0 0 200 40">
                                                        <motion.path
                                                            d="M0 20 Q25 5 50 20 T100 20 T150 20 T200 20"
                                                            stroke="#29b6f6"
                                                            strokeWidth="2"
                                                            fill="none"
                                                            animate={{
                                                                d: [
                                                                    "M0 20 Q25 5 50 20 T100 20 T150 20 T200 20",
                                                                    "M0 20 Q25 35 50 20 T100 20 T150 20 T200 20",
                                                                    "M0 20 Q25 5 50 20 T100 20 T150 20 T200 20"
                                                                ]
                                                            }}
                                                            transition={{ repeat: Infinity, duration: 2 }}
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className={styles.dataVisual}>
                                                <div className={styles.visualLabel}>Context Sync</div>
                                                <div className={styles.chartContainer}>
                                                    <div style={{ display: 'flex', gap: '4px', height: '100%', alignItems: 'flex-end' }}>
                                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                                            <motion.div
                                                                key={i}
                                                                style={{ width: '10px', background: 'rgba(41, 182, 246, 0.5)', borderRadius: '2px' }}
                                                                animate={{ height: ['20%', '80%', '40%', '90%', '20%'] }}
                                                                transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.1 }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>

                                        <div className={styles.centralNodeWrapper}>
                                            {/* Central Node */}
                                            <div className={styles.centralNode}>
                                                <div className={`${styles.hudRing} ${styles.hudRing1}`} />
                                                <div className={`${styles.hudRing} ${styles.hudRing2}`} />
                                                <div className={`${styles.hudRing} ${styles.hudRing3}`} />

                                                <svg className={styles.brainSvg} viewBox="0 0 100 100">
                                                    <defs>
                                                        <radialGradient id="brainGlow" cx="50%" cy="50%" r="50%">
                                                            <stop offset="0%" className={styles.brainCore} />
                                                            <stop offset="100%" stopColor="transparent" />
                                                        </radialGradient>
                                                    </defs>
                                                    <circle cx="50" cy="50" r="40" fill="url(#brainGlow)" opacity="0.2" />
                                                    <motion.path
                                                        d="M50 20C33.4 20 20 33.4 20 50C20 66.6 33.4 80 50 80C66.6 80 80 66.6 80 50C80 33.4 66.6 20 50 20ZM50 72C37.9 72 28 62.1 28 50C28 37.9 37.9 28 50 28C62.1 28 72 37.9 72 50C72 62.1 62.1 72 50 72Z"
                                                        fill="#29b6f6"
                                                        animate={{ opacity: [0.4, 0.8, 0.4] }}
                                                        transition={{ repeat: Infinity, duration: 3 }}
                                                    />
                                                    <motion.circle cx="50" cy="50" r="5" fill="#29b6f6" animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} />
                                                    {/* Simulated Neurons */}
                                                    {[0, 60, 120, 180, 240, 300].map(deg => (
                                                        <motion.line
                                                            key={deg}
                                                            x1="50" y1="50"
                                                            x2={50 + 30 * Math.cos(deg * Math.PI / 180)}
                                                            y2={50 + 30 * Math.sin(deg * Math.PI / 180)}
                                                            stroke="#29b6f6"
                                                            strokeWidth="1"
                                                            strokeDasharray="2,2"
                                                            animate={{ opacity: [0, 1, 0] }}
                                                            transition={{ repeat: Infinity, duration: 2, delay: deg / 100 }}
                                                        />
                                                    ))}
                                                </svg>

                                                <div className={styles.statusContainer}>
                                                    <div className={styles.statusLabel}>AI PROCESSING CORE TASK...</div>
                                                    <div className={styles.progressBarContainer}>
                                                        <motion.div className={styles.progressBarFill} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right HUD Panel - Task List */}
                                        <motion.div
                                            className={styles.sidePanelRight}
                                            initial={{ x: 100, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            <div className={styles.visualLabel}>Project Pipeline</div>
                                            <div className={styles.taskIndicator}>
                                                {researchTasks.map((task) => (
                                                    <div
                                                        key={task.id}
                                                        className={`${styles.miniTask} ${task.status === 'active' ? styles.miniTaskActive : ''}`}
                                                    >
                                                        <div style={{
                                                            width: '6px',
                                                            height: '6px',
                                                            borderRadius: '50%',
                                                            background: task.status === 'completed' ? '#00e676' : task.status === 'active' ? '#29b6f6' : 'rgba(255,255,255,0.1)'
                                                        }} />
                                                        <span className={styles.miniTaskName}>{task.name}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className={styles.dataVisual} style={{ marginTop: 'auto' }}>
                                                <div className={styles.visualLabel}>Semantic Density</div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#29b6f6' }}>
                                                    <motion.span animate={{ opacity: [0.5, 1, 0.5] }}>84.2%</motion.span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {((currentStep === 3 && articleData?.content) || currentStep === 4) && articleData && parsed && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.resultLayout}>
                                <div className={styles.mainContent}>
                                    <div className={styles.contentCard}>
                                        <div className={styles.cardHeader}>
                                            <div className={styles.cardTitle}>Nội Dung Bài Viết {currentStep === 3 && '(Đang tạo...)'}</div>
                                            <button className={styles.copyButton} onClick={() => copyToClipboard(parsed.article, 'nội dung')}>Copy Markdown</button>
                                        </div>
                                        <div className={styles.cardBody}>
                                            <div className={styles.articlePreview}>
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{parsed.article}</ReactMarkdown>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.metaGrid}>
                                        <div className={styles.contentCard}>
                                            <div className={styles.cardHeader}><div className={styles.cardTitle}>Từ Khóa Chính</div></div>
                                            <div className={styles.cardBody}><div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>{keyword}</div></div>
                                        </div>
                                        <div className={styles.contentCard}>
                                            <div className={styles.cardHeader}><div className={styles.cardTitle}>Tóm Tắt</div></div>
                                            <div className={styles.cardBody}><p>{parsed.summary || (currentStep === 3 ? 'Đang tóm tắt...' : 'N/A')}</p></div>
                                        </div>
                                    </div>
                                    <div className={styles.contentCard}>
                                        <div className={styles.cardHeader}><div className={styles.cardTitle}>Schema JSON-LD</div></div>
                                        <div className={styles.cardBody}><pre className={styles.schemaCode}>{parsed.schema || (currentStep === 3 ? 'Đang chuẩn bị...' : 'N/A')}</pre></div>
                                    </div>
                                </div>
                                <div className={styles.sidebar}>
                                    {articleData.image_url && (
                                        <div className={styles.sidebarCard}>
                                            <div className={styles.sidebarTitle}>Ảnh Đại Diện</div>
                                            <div className={styles.imageBox} style={{ backgroundImage: `url(${articleData.image_url})` }}></div>
                                        </div>
                                    )}
                                    <div className={styles.sidebarCard}>
                                        <div className={styles.sidebarTitle}>Thông Tin SEO</div>
                                        <div className={styles.metaInfoBlock}>
                                            <div className={styles.metaField}><span className={styles.metaLabel}>Meta Title</span><span className={styles.metaValue}>{parsed.meta.title || 'N/A'}</span></div>
                                            <div className={styles.metaField}><span className={styles.metaLabel}>Meta Desc</span><span className={styles.metaValue}>{parsed.meta.description || 'N/A'}</span></div>
                                            <div className={styles.metaField}><span className={styles.metaLabel}>Slug</span><span className={styles.metaValue}>{parsed.meta.slug || 'N/A'}</span></div>
                                        </div>
                                    </div>
                                    <div className={styles.sidebarCard}>
                                        <div className={styles.sidebarTitle}>Thao Tác</div>
                                        <div className={styles.actionStack}>
                                            {articleData.id && <Link href={`/dashboard/articles/${articleData.id}`} className="btn btn-primary w-full">Chỉnh Sửa</Link>}
                                            <Link href="/dashboard/articles" className="btn btn-outline w-full">Về Thư Viện</Link>
                                            <button className="btn btn-ghost w-full" onClick={() => { setCurrentStep(1); setKeyword(''); setArticleData(null); setLoading(false); }}>Tạo Bài Mới</button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
