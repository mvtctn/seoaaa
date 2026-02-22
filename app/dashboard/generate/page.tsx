'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import styles from './generate.module.css'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, Settings, Image as ImageIcon, FileText, Database, Sparkles, ChevronDown } from 'lucide-react'

export default function GeneratePage() {
    const [hasMounted, setHasMounted] = useState(false)
    const [keyword, setKeyword] = useState('')
    const [loading, setLoading] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const [articleData, setArticleData] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [selectedModel, setSelectedModel] = useState('meta-llama/llama-4-scout-17b-16e-instruct')
    const [showModelDropdown, setShowModelDropdown] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Handle clicks outside dropdown to close it
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowModelDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Options state
    const [options, setOptions] = useState({
        articleType: 'expert_guide',
        seoMode: 'advanced',
        language: 'vi',
        tone: 'professional',
        length: '1500',
    })

    const SUGGESTIONS = [
        { label: 'Viết bài Review iPhone 15 Pro Max', icon: <Sparkles size={14} /> },
        { label: 'Hướng dẫn SEO cho người mới', icon: <Database size={14} /> },
        { label: 'Top 10 địa điểm du lịch Đà Lạt', icon: <ImageIcon size={14} /> },
        { label: 'Phân tích giá vàng hôm nay', icon: <FileText size={14} /> },
    ]

    useEffect(() => {
        setHasMounted(true)
    }, [])

    const adjustTextareaHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
        }
    }

    const handleStart = async () => {
        if (!keyword.trim()) return
        setLoading(true)
        setError(null)
        setArticleData(null)

        try {
            // Simulate research delay for UI demo (replace with actual API call)
            // await new Promise(r => setTimeout(r, 1500)) 

            // Call API (using existing logic)
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

            if (!resRes.ok) throw new Error('Research failed')
            const resData = await resRes.json()

            // Call Generate API
            const artRes = await fetch('/api/generate/article', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    keyword,
                    researchBrief: resData.data?.brief || {},
                    contentStrategy: resData.data?.strategy || {},
                    researchId: resData.data?.researchId,
                    keywordId: resData.data?.keywordId,
                    options: { ...options, model: selectedModel }
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

            setLoading(false)

        } catch (err: any) {
            console.error(err)
            setError(err.message || 'Có lỗi xảy ra')
            setLoading(false)
        }
    }

    const handleSuggestionClick = (text: string) => {
        setKeyword(text)
        if (textareaRef.current) textareaRef.current.focus()
    }

    if (!hasMounted) return null

    return (
        <div className={styles.container}>
            {/* Feature Badge */}
            <div className={styles.featureBadge}>
                <span className={styles.newTag}>FEATURE</span>
                <span>Codebase Integrations - Learn More ↗</span>
            </div>

            {/* Main Heading */}
            <h1 className={styles.mainHeading}>
                SeoAAA AI Writer
            </h1>

            {/* Prompt Box */}
            <div className={styles.promptBoxContainer}>
                <div className={styles.loadingLabel}>
                    {loading ? 'AI đang suy nghĩ...' : 'Sẵn sàng sáng tạo'}
                </div>

                <textarea
                    ref={textareaRef}
                    className={styles.promptInput}
                    placeholder="Nhập chủ đề bạn muốn viết..."
                    value={keyword}
                    onChange={(e) => {
                        setKeyword(e.target.value)
                        adjustTextareaHeight()
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleStart()
                        }
                    }}
                    rows={1}
                />

                <div className={styles.actionBar}>
                    <div className={styles.actionLeft}>
                        <button
                            className={`${styles.iconBtn} ${showSettings ? styles.iconBtnActive : ''}`}
                            title="Cài đặt"
                            onClick={() => setShowSettings(!showSettings)}
                        >
                            <Settings size={18} />
                        </button>
                    </div>

                    <div className={styles.actionRight}>
                        <div className={styles.modelSelector} ref={dropdownRef}>
                            <button
                                className={styles.modelSelectBtn}
                                onClick={() => setShowModelDropdown(!showModelDropdown)}
                            >
                                <Sparkles size={14} />
                                <span>
                                    {selectedModel.includes('scout') ? 'Llama 4 Scout (30K)' :
                                        selectedModel.includes('3.3-70b') ? 'Llama 3.3 (12K)' :
                                            selectedModel.includes('kimi') ? 'Kimi K2 (10K)' :
                                                selectedModel.includes('gpt-oss') ? 'GPT-OSS (8K)' :
                                                    selectedModel.includes('maverick') ? 'Llama 4 Mv (6K)' : 'AI Model'}
                                </span>
                                <ChevronDown size={14} />
                            </button>

                            <AnimatePresence>
                                {showModelDropdown && (
                                    <motion.div
                                        className={styles.modelDropdown}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                    >
                                        <button
                                            className={`${styles.modelOption} ${selectedModel === 'meta-llama/llama-4-scout-17b-16e-instruct' ? styles.active : ''}`}
                                            onClick={() => { setSelectedModel('meta-llama/llama-4-scout-17b-16e-instruct'); setShowModelDropdown(false) }}
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-xs text-cyan-400">BEST QUOTA</span>
                                                <span>Llama 4 Scout (30K TPM)</span>
                                            </div>
                                        </button>
                                        <button
                                            className={`${styles.modelOption} ${selectedModel === 'llama-3.3-70b-versatile' ? styles.active : ''}`}
                                            onClick={() => { setSelectedModel('llama-3.3-70b-versatile'); setShowModelDropdown(false) }}
                                        >
                                            Llama 3.3 70B (12K TPM)
                                        </button>
                                        <button
                                            className={`${styles.modelOption} ${selectedModel === 'moonshotai/kimi-k2-instruct' ? styles.active : ''}`}
                                            onClick={() => { setSelectedModel('moonshotai/kimi-k2-instruct'); setShowModelDropdown(false) }}
                                        >
                                            Moonshot Kimi K2 (10K TPM)
                                        </button>
                                        <button
                                            className={`${styles.modelOption} ${selectedModel === 'openai/gpt-oss-120b' ? styles.active : ''}`}
                                            onClick={() => { setSelectedModel('openai/gpt-oss-120b'); setShowModelDropdown(false) }}
                                        >
                                            GPT OSS 120B (8K TPM)
                                        </button>
                                        <button
                                            className={`${styles.modelOption} ${selectedModel === 'meta-llama/llama-4-maverick-17b-128e-instruct' ? styles.active : ''}`}
                                            onClick={() => { setSelectedModel('meta-llama/llama-4-maverick-17b-128e-instruct'); setShowModelDropdown(false) }}
                                        >
                                            Llama 4 Maverick (6K TPM)
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <button
                            className={styles.submitBtn}
                            onClick={handleStart}
                            disabled={!keyword.trim() || loading}
                        >
                            <ArrowUp size={20} />
                        </button>
                    </div>
                </div>

                {showSettings && (
                    <motion.div
                        className={styles.settingsPanel}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                    >
                        <div className={styles.settingGroup}>
                            <label className={styles.settingLabel}>Loại Bài Viết</label>
                            <select
                                className={styles.settingSelect}
                                value={options.articleType}
                                onChange={e => setOptions({ ...options, articleType: e.target.value })}
                            >
                                <option value="expert_guide">Hướng dẫn Chuyên gia</option>
                                <option value="review">Đánh giá Review</option>
                                <option value="news">Tin tức News</option>
                            </select>
                        </div>
                        <div className={styles.settingGroup}>
                            <label className={styles.settingLabel}>Ngôn Ngữ</label>
                            <select
                                className={styles.settingSelect}
                                value={options.language}
                                onChange={e => setOptions({ ...options, language: e.target.value })}
                            >
                                <option value="vi">Tiếng Việt</option>
                                <option value="en">English</option>
                            </select>
                        </div>
                        <div className={styles.settingGroup}>
                            <label className={styles.settingLabel}>Độ Dài</label>
                            <select
                                className={styles.settingSelect}
                                value={options.length}
                                onChange={e => setOptions({ ...options, length: e.target.value })}
                            >
                                <option value="800">ngắn (~800)</option>
                                <option value="1500">Trung bình (~1500)</option>
                                <option value="2500">Dài (~2500)</option>
                            </select>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Suggestions */}
            {!articleData && (
                <div className={styles.chipsContainer}>
                    {SUGGESTIONS.map((s, i) => (
                        <button key={i} className={styles.chip} onClick={() => handleSuggestionClick(s.label)}>
                            <span className={styles.chipIcon}>{s.icon}</span>
                            {s.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Result Display (Simple Version for now) */}
            {articleData && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-4xl mt-8 p-8 rounded-xl border transition-colors"
                    style={{
                        backgroundColor: 'var(--color-surface)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)'
                    }}
                >
                    <div className="prose max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{articleData.content}</ReactMarkdown>
                    </div>
                </motion.div>
            )}

            {error && (
                <div className="mt-4 text-red-400">{error}</div>
            )}
        </div>
    )
}
