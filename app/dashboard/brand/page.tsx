'use client'

import { useState, useEffect } from 'react'
import styles from './brand.module.css'

interface InternalLink {
    text: string
    url: string
    keywords: string[]
}

interface BrandSettings {
    name: string
    core_values: string[]
    tone_of_voice: {
        id: string
        name: string
        description: string
    }
    article_template: string
    internal_links: InternalLink[]
}

const TONE_OPTIONS = [
    { id: 'professional', name: 'Chuyên Nghiệp', icon: '👔', description: 'Trang trọng, đáng tin cậy, chuyên sâu' },
    { id: 'friendly', name: 'Thân Thiện', icon: '🤝', description: 'Gần gũi, dễ hiểu, ấm áp' },
    { id: 'technical', name: 'Kỹ Thuật', icon: '⚙️', description: 'Chính xác, chi tiết, hướng dẫn cụ thể' },
    { id: 'casual', name: 'Thoải Mái', icon: '😎', description: 'Đời thường, vui vẻ, không gò bó' },
    { id: 'authoritative', name: 'Quyền Uy', icon: '📢', description: 'Mạnh mẽ, khẳng định, dẫn dắt' },
    { id: 'storyteller', name: 'Kể Chuyện', icon: '📖', description: 'Dẫn dắt cảm xúc, tường thuật' },
]

export default function BrandSetupPage() {
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const [settings, setSettings] = useState<BrandSettings>({
        name: '',
        core_values: [],
        tone_of_voice: TONE_OPTIONS[0],
        article_template: `# {{title}}

## Giới Thiệu
{{intro}}

## {{main_content}}

## Kết Luận
{{conclusion}}`,
        internal_links: []
    })

    // New value states
    const [newValue, setNewValue] = useState('')
    const [newLink, setNewLink] = useState({ text: '', url: '', keywords: '' })

    useEffect(() => {
        fetchBrandSettings()
    }, [])

    const fetchBrandSettings = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/brand')
            const data = await res.json()

            if (data.brand) {
                setSettings({
                    name: data.brand.name || '',
                    core_values: data.brand.core_values || [],
                    tone_of_voice: data.brand.tone_of_voice || TONE_OPTIONS[0],
                    article_template: data.brand.article_template || '',
                    internal_links: data.brand.internal_links || []
                })
            }
        } catch (error) {
            console.error('Failed to load settings', error)
            setMessage({ type: 'error', text: 'Không thể tải cài đặt thương hiệu.' })
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            setMessage(null)

            const res = await fetch('/api/brand', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            })

            if (res.ok) {
                setMessage({ type: 'success', text: 'Đã lưu cài đặt thương hiệu thành công!' })
                // Clear message after 3 seconds
                setTimeout(() => setMessage(null), 3000)
            } else {
                throw new Error('Failed to save')
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Có lỗi xảy ra khi lưu cài đặt.' })
        } finally {
            setSaving(false)
        }
    }

    const addCoreValue = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newValue.trim()) {
            e.preventDefault()
            if (!settings.core_values.includes(newValue.trim())) {
                setSettings(prev => ({
                    ...prev,
                    core_values: [...prev.core_values, newValue.trim()]
                }))
            }
            setNewValue('')
        }
    }

    const removeCoreValue = (value: string) => {
        setSettings(prev => ({
            ...prev,
            core_values: prev.core_values.filter(v => v !== value)
        }))
    }

    const addInternalLink = () => {
        if (newLink.text && newLink.url) {
            const keywords = newLink.keywords
                ? newLink.keywords.split(',').map(k => k.trim())
                : [newLink.text]

            setSettings(prev => ({
                ...prev,
                internal_links: [...prev.internal_links, {
                    text: newLink.text,
                    url: newLink.url,
                    keywords
                }]
            }))
            setNewLink({ text: '', url: '', keywords: '' })
        }
    }

    const removeInternalLink = (index: number) => {
        setSettings(prev => ({
            ...prev,
            internal_links: prev.internal_links.filter((_, i) => i !== index)
        }))
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="spinner spinner-lg"></div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h2>Cài Đặt Thương Hiệu</h2>
                <p className="text-secondary">Định nghĩa giọng điệu và phong cách để AI viết nội dung đúng ý bạn.</p>
            </header>

            {message && (
                <div className={`${styles.message} ${message.type === 'success' ? styles.success : styles.error}`}>
                    {message.type === 'success' ? '✅' : '❌'} {message.text}
                </div>
            )}

            {/* Basic Info */}
            <section className={styles.section}>
                <div className={styles.sectionTitle}>
                    <div className={styles.sectionIcon}>🏢</div>
                    Thông Tin Cơ Bản
                </div>

                <div className="form-group">
                    <label className="form-label form-label-required">Tên Thương Hiệu</label>
                    <input
                        type="text"
                        className="form-input"
                        value={settings.name}
                        onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                        placeholder="VD: SeoAAA, VinFast, ..."
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Giá Trị Cốt Lõi (Nhấn Enter để thêm)</label>
                    <div className={styles.tagInput}>
                        {settings.core_values.map(val => (
                            <div key={val} className={styles.tag}>
                                {val}
                                <span className={styles.removeTag} onClick={() => removeCoreValue(val)}>×</span>
                            </div>
                        ))}
                        <input
                            type="text"
                            className={styles.inputGhost}
                            value={newValue}
                            onChange={(e) => setNewValue(e.target.value)}
                            onKeyDown={addCoreValue}
                            placeholder="VD: Sáng tạo, Tin cậy..."
                        />
                    </div>
                    <p className="form-hint">Những giá trị này sẽ giúp AI hiểu hơn về văn hóa doanh nghiệp của bạn.</p>
                </div>
            </section>

            {/* Tone of Voice */}
            <section className={styles.section}>
                <div className={styles.sectionTitle}>
                    <div className={styles.sectionIcon}>🗣️</div>
                    Giọng Điệu & Phong Cách
                </div>

                <div className={styles.toneGrid}>
                    {TONE_OPTIONS.map(tone => (
                        <div
                            key={tone.id}
                            className={`${styles.toneCard} ${settings.tone_of_voice.id === tone.id ? styles.active : ''}`}
                            onClick={() => setSettings({ ...settings, tone_of_voice: tone })}
                        >
                            <div className={styles.toneIcon}>{tone.icon}</div>
                            <div className={styles.toneName}>{tone.name}</div>
                        </div>
                    ))}
                </div>
                <p className="form-hint mt-3">Mô tả: {settings.tone_of_voice.description}</p>
            </section>

            {/* Internal Links */}
            <section className={styles.section}>
                <div className={styles.sectionTitle}>
                    <div className={styles.sectionIcon}>🔗</div>
                    Chiến Lược Internal Linking
                </div>

                <p className="text-sm text-secondary mb-4">
                    Thêm các bài viết quan trọng. AI sẽ tự động chèn liên kết khi gặp từ khóa phù hợp.
                </p>

                <div className="form-group">
                    <div className={styles.linkRow}>
                        <input
                            className="form-input"
                            placeholder="Anchor Text (VD: Dịch vụ SEO)"
                            value={newLink.text}
                            onChange={e => setNewLink({ ...newLink, text: e.target.value })}
                        />
                        <input
                            className="form-input"
                            placeholder="URL (VD: /dich-vu-seo)"
                            value={newLink.url}
                            onChange={e => setNewLink({ ...newLink, url: e.target.value })}
                        />
                        <button className="btn btn-secondary" onClick={addInternalLink}>Thêm</button>
                    </div>

                    <input
                        className="form-input mb-3"
                        placeholder="Từ khóa kích hoạt (phân cách bằng dấu phẩy). Để trống sẽ dùng Anchor Text."
                        value={newLink.keywords}
                        onChange={e => setNewLink({ ...newLink, keywords: e.target.value })}
                    />

                    <div className="flex flex-col gap-2 mt-4">
                        {settings.internal_links.map((link, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-background)]">
                                <div>
                                    <div className="font-medium text-primary">{link.text}</div>
                                    <div className="text-xs text-secondary">{link.url}</div>
                                    <div className="text-xs text-tertiary mt-1">Keywords: {link.keywords.join(', ')}</div>
                                </div>
                                <button
                                    className="btn btn-icon btn-ghost text-danger"
                                    onClick={() => removeInternalLink(idx)}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Article Template */}
            <section className={styles.section}>
                <div className={styles.sectionTitle}>
                    <div className={styles.sectionIcon}>📝</div>
                    Mẫu Bài Viết (Markdown)
                </div>

                <div className="form-group">
                    <textarea
                        className="form-textarea font-mono text-sm h-64"
                        value={settings.article_template}
                        onChange={(e) => setSettings({ ...settings, article_template: e.target.value })}
                        placeholder="# {{title}}..."
                    ></textarea>
                    <div className="flex gap-2 mt-2 text-xs text-secondary">
                        <span>Variables:</span>
                        <code className="bg-[var(--color-surface-hover)] px-1 rounded">{`{{title}}`}</code>
                        <code className="bg-[var(--color-surface-hover)] px-1 rounded">{`{{intro}}`}</code>
                        <code className="bg-[var(--color-surface-hover)] px-1 rounded">{`{{main_content}}`}</code>
                        <code className="bg-[var(--color-surface-hover)] px-1 rounded">{`{{conclusion}}`}</code>
                    </div>
                </div>
            </section>

            {/* Sticky Actions */}
            <div className={styles.actions}>
                <button className="btn btn-ghost" onClick={fetchBrandSettings}>Hủy Bỏ</button>
                <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <>
                            <div className="spinner spinner-sm border-white"></div>
                            Đang Lưu...
                        </>
                    ) : (
                        <>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                <polyline points="7 3 7 8 15 8"></polyline>
                            </svg>
                            Lưu Cài Đặt
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
