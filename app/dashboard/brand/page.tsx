
'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import styles from './brand.module.css'

interface InternalLink {
    text: string
    url: string
    keywords: string[]
}

interface BrandSettings {
    id?: number
    name: string
    core_values: string[]
    tone_of_voice: {
        id: string
        name: string
        description: string
        icon?: string
    }
    article_template: string
    internal_links: InternalLink[]
    is_default: boolean
    wp_url?: string
    wp_username?: string
    wp_password?: string
    created_at?: string
}

const TONE_OPTIONS = [
    { id: 'professional', name: 'Chuyên Nghiệp', icon: '👔', description: 'Trang trọng, đáng tin cậy, chuyên sâu' },
    { id: 'friendly', name: 'Thân Thiện', icon: '🤝', description: 'Gần gũi, dễ hiểu, ấm áp' },
    { id: 'technical', name: 'Kỹ Thuật', icon: '⚙️', description: 'Chính xác, chi tiết, hướng dẫn cụ thể' },
    { id: 'casual', name: 'Thoải Mái', icon: '😎', description: 'Đời thường, vui vẻ, không gò bó' },
    { id: 'authoritative', name: 'Quyền Uy', icon: '📢', description: 'Mạnh mẽ, khẳng định, dẫn dắt' },
    { id: 'storyteller', name: 'Kể Chuyện', icon: '📖', description: 'Dẫn dắt cảm xúc, tường thuật' },
]

const DEFAULT_TEMPLATE = `# {{title}}

## Giới Thiệu
{{intro}}

## {{main_content}}

## Kết Luận
{{conclusion}}`

// API Functions
const getBrands = async (): Promise<BrandSettings[]> => {
    const res = await fetch('/api/brand')
    if (!res.ok) throw new Error('Failed to fetch brands')
    const data = await res.json()
    return data.brands || []
}

const saveBrandApi = async (brand: BrandSettings) => {
    const res = await fetch('/api/brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brand)
    })
    if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save')
    }
    return res.json()
}

const deleteBrandApi = async (id: number) => {
    const res = await fetch(`/api/brand?id=${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete')
    return res.json()
}

const setDefaultBrandApi = async (id: number) => {
    const res = await fetch(`/api/brand?id=${id}&action=set_default`, { method: 'PATCH' })
    if (!res.ok) throw new Error('Failed to set default')
    return res.json()
}

export default function BrandManagementPage() {
    const queryClient = useQueryClient()
    const [showModal, setShowModal] = useState(false)
    const [selectedBrand, setSelectedBrand] = useState<BrandSettings | null>(null)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    // Form Temporary State
    const [newTag, setNewTag] = useState('')
    const [newLink, setNewLink] = useState({ text: '', url: '', keywords: '' })

    // Queries
    const { data: brands = [], isLoading: loading } = useQuery({
        queryKey: ['brands'],
        queryFn: getBrands,
    })

    // Mutations
    const saveMutation = useMutation({
        mutationFn: saveBrandApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brands'] })
            setShowModal(false)
            showMessage('success', selectedBrand?.id ? 'Đã cập nhật thương hiệu' : 'Đã tạo thương hiệu mới')
        },
        onError: (error: Error) => {
            showMessage('error', error.message)
        }
    })

    const deleteMutation = useMutation({
        mutationFn: deleteBrandApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brands'] })
            showMessage('success', 'Đã xóa thương hiệu')
        },
        onError: () => {
            showMessage('error', 'Lỗi khi xóa')
        }
    })

    const setDefaultMutation = useMutation({
        mutationFn: setDefaultBrandApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brands'] })
        },
        onError: (error) => {
            console.error('Set default failed', error)
        }
    })

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text })
        setTimeout(() => setMessage(null), 3000)
    }

    const openCreateModal = () => {
        setSelectedBrand({
            name: '',
            core_values: [],
            tone_of_voice: TONE_OPTIONS[0],
            article_template: DEFAULT_TEMPLATE,
            internal_links: [],
            is_default: false,
            wp_url: '',
            wp_username: '',
            wp_password: ''
        })
        setShowModal(true)
    }

    const openEditModal = (brand: BrandSettings) => {
        setSelectedBrand({ ...brand })
        setShowModal(true)
    }

    const handleSave = () => {
        if (!selectedBrand) return
        if (!selectedBrand.name.trim()) {
            alert('Vui lòng nhập tên thương hiệu')
            return
        }
        saveMutation.mutate(selectedBrand)
    }

    const handleDelete = (id: number) => {
        if (confirm('Bạn có chắc muốn xóa thương hiệu này?')) {
            deleteMutation.mutate(id)
        }
    }

    const handleSetDefault = (id: number) => {
        setDefaultMutation.mutate(id)
    }

    const updateSelected = (data: Partial<BrandSettings>) => {
        if (selectedBrand) {
            setSelectedBrand({ ...selectedBrand, ...data })
        }
    }

    // Tag and Link Helpers
    const addTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newTag.trim() && selectedBrand) {
            e.preventDefault()
            if (!selectedBrand.core_values.includes(newTag.trim())) {
                updateSelected({ core_values: [...selectedBrand.core_values, newTag.trim()] })
            }
            setNewTag('')
        }
    }

    const removeTag = (tag: string) => {
        if (selectedBrand) {
            updateSelected({ core_values: selectedBrand.core_values.filter(t => t !== tag) })
        }
    }

    const addLink = () => {
        if (newLink.text && newLink.url && selectedBrand) {
            const kw = newLink.keywords ? newLink.keywords.split(',').map(s => s.trim()) : [newLink.text]
            updateSelected({
                internal_links: [...selectedBrand.internal_links, { text: newLink.text, url: newLink.url, keywords: kw }]
            })
            setNewLink({ text: '', url: '', keywords: '' })
        }
    }

    const removeLink = (idx: number) => {
        if (selectedBrand) {
            updateSelected({ internal_links: selectedBrand.internal_links.filter((_, i) => i !== idx) })
        }
    }

    if (loading) {
        return <div className="flex items-center justify-center p-20"><div className="spinner spinner-lg"></div></div>
    }

    return (
        <div className={styles.container}>
            <div className={styles.brandHeader}>
                <div>
                    <h2>Quản Lý Thương Hiệu</h2>
                    <p className="text-secondary text-sm">Quản lý các profile thương hiệu và cấu hình SEO cho AI.</p>
                </div>
                <button className="btn btn-primary" onClick={openCreateModal}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.5rem' }}>
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Tạo Thương Hiệu
                </button>
            </div>

            {message && (
                <div className={`${styles.message} ${message.type === 'success' ? styles.success : styles.error}`} style={{ marginBottom: '1.5rem' }}>
                    {message.text}
                </div>
            )}

            {/* Brands Table */}
            <div className={styles.tableContainer}>
                <table className={styles.brandTable}>
                    <thead>
                        <tr>
                            <th>Thương Hiệu</th>
                            <th>Giọng Điệu</th>
                            <th>Dữ Liệu</th>
                            <th>Trạng Thái</th>
                            <th style={{ textAlign: 'right' }}>Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {brands.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-20 opacity-50">
                                    Chưa có thương hiệu nào. Hãy tạo mới ngay!
                                </td>
                            </tr>
                        ) : (
                            brands.map(brand => (
                                <tr key={brand.id}>
                                    <td>
                                        <div className={styles.brandCell}>
                                            <span className={styles.brandName}>{brand.name}</span>
                                            <span className="text-[10px] text-tertiary">ID: {brand.id}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.toneBadge}>
                                            <span>{brand.tone_of_voice.icon || '🗣️'}</span>
                                            <span>{brand.tone_of_voice.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-xs text-secondary">
                                            {brand.core_values.length} Giá trị • {brand.internal_links.length} Internal Links
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <button
                                                className={`${styles.starBtn} ${brand.is_default ? styles.starActive : ''}`}
                                                onClick={() => !brand.is_default && handleSetDefault(brand.id!)}
                                                title={brand.is_default ? "Đang là mặc định cho AI" : "Đặt làm mặc định cho AI"}
                                            >
                                                {brand.is_default ? '★' : '☆'}
                                            </button>
                                            {brand.is_default && (
                                                <div className={styles.activeAiBadge}>
                                                    <span>AI SELECTED</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div className="flex justify-end gap-2">
                                            <button className="btn btn-sm btn-ghost" onClick={() => openEditModal(brand)}>Chi Tiết</button>
                                            <button className="btn btn-sm btn-ghost text-danger" onClick={() => handleDelete(brand.id!)}>Xóa</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit/Create Modal */}
            {showModal && selectedBrand && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>
                                {selectedBrand.id ? 'Chỉnh Sửa Thương Hiệu' : 'Tạo Thương Hiệu Mới'}
                            </h3>
                            <button className={styles.closeBtn} onClick={() => setShowModal(false)}>&times;</button>
                        </div>

                        <div className={styles.modalBody}>
                            {/* Basic Info */}
                            <div className={styles.brandFormSection}>
                                <div className={styles.sectionTitle}>🏢 Thông Tin Cơ Bản</div>
                                <div className="form-group mb-4">
                                    <label className="form-label form-label-required">Tên Thương Hiệu</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={selectedBrand.name}
                                        onChange={e => updateSelected({ name: e.target.value })}
                                        placeholder="Ví dụ: SeoAAA, VinFast, Samsung..."
                                    />
                                </div>
                                <label className={styles.defaultCheckbox}>
                                    <input
                                        type="checkbox"
                                        checked={selectedBrand.is_default}
                                        onChange={e => updateSelected({ is_default: e.target.checked })}
                                    />
                                    <span>Sử dụng làm thương hiệu mặc định cho toàn hệ thống AI</span>
                                </label>
                            </div>

                            {/* Core Values */}
                            <div className={styles.brandFormSection}>
                                <div className={styles.sectionTitle}>💎 Bản Sắc & Giá Trị</div>
                                <p className="text-xs text-tertiary mb-3">Thêm các từ khóa về giá trị cốt lõi (Nhấn Enter để thêm).</p>
                                <div className={styles.tagInput}>
                                    {selectedBrand.core_values.map(val => (
                                        <div key={val} className={styles.tag}>
                                            {val}
                                            <span className={styles.removeTag} onClick={() => removeTag(val)}>×</span>
                                        </div>
                                    ))}
                                    <input
                                        type="text"
                                        className={styles.inputGhost}
                                        value={newTag}
                                        onChange={e => setNewTag(e.target.value)}
                                        onKeyDown={addTag}
                                        placeholder="Thêm giá trị..."
                                    />
                                </div>
                            </div>

                            {/* Tone grid */}
                            <div className={styles.brandFormSection}>
                                <div className={styles.sectionTitle}>🗣️ Phông Văn & Giọng Điệu</div>
                                <div className={styles.toneGrid}>
                                    {TONE_OPTIONS.map(tone => (
                                        <div
                                            key={tone.id}
                                            className={`${styles.toneCard} ${selectedBrand.tone_of_voice.id === tone.id ? styles.active : ''}`}
                                            onClick={() => updateSelected({ tone_of_voice: tone })}
                                        >
                                            <div className={styles.toneIcon}>{tone.icon}</div>
                                            <div className={styles.toneName}>{tone.name}</div>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[10px] text-tertiary mt-3 italic">Mô tả: {selectedBrand.tone_of_voice.description}</p>
                            </div>

                            {/* Internal Links */}
                            <div className={styles.brandFormSection}>
                                <div className={styles.sectionTitle}>🔗 Internal Links (Tự động chèn)</div>
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <input className="form-input text-sm" placeholder="Anchor Text" value={newLink.text} onChange={e => setNewLink({ ...newLink, text: e.target.value })} />
                                    <input className="form-input text-sm" placeholder="URL (/dich-vu-seo)" value={newLink.url} onChange={e => setNewLink({ ...newLink, url: e.target.value })} />
                                </div>
                                <div className="flex gap-2">
                                    <input className="form-input text-sm flex-1" placeholder="Từ khóa kích hoạt (cách nhau bằng dấu phẩy)" value={newLink.keywords} onChange={e => setNewLink({ ...newLink, keywords: e.target.value })} />
                                    <button className="btn btn-secondary btn-sm" onClick={addLink}>Thêm Link</button>
                                </div>

                                <div className="mt-4 flex flex-col gap-2">
                                    {selectedBrand.internal_links.map((link, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 border border-[var(--color-border)] rounded-lg bg-[rgba(255,255,255,0.02)]">
                                            <div>
                                                <div className="text-sm font-semibold text-primary">{link.text}</div>
                                                <div className="text-[10px] text-tertiary">{link.url} • {link.keywords.join(', ')}</div>
                                            </div>
                                            <button className="text-danger" onClick={() => removeLink(idx)}>&times;</button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Template */}
                            <div className={styles.brandFormSection}>
                                <div className={styles.sectionTitle}>📝 Cấu Trúc Markdown Mẫu</div>
                                <textarea
                                    className="form-textarea font-mono text-xs h-60"
                                    style={{ background: 'var(--color-background)' }}
                                    value={selectedBrand.article_template}
                                    onChange={e => updateSelected({ article_template: e.target.value })}
                                />
                            </div>

                            {/* Integration Settings */}
                            <div className={styles.brandFormSection}>
                                <div className={styles.sectionTitle}>🌐 Cấu Hình Đăng Bài (Integration)</div>
                                <div className="form-group mb-4">
                                    <label className="form-label">Chọn Nền Tảng</label>
                                    <div className="flex gap-4">
                                        <label className={`flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer ${selectedBrand.wp_username !== 'custom_webhook' ? 'bg-primary/10 border-primary' : 'border-border'}`}>
                                            <input
                                                type="radio"
                                                name="platform"
                                                checked={selectedBrand.wp_username !== 'custom_webhook'}
                                                onChange={() => updateSelected({ wp_username: '' })}
                                                className="hidden"
                                            />
                                            <span className="text-xl">W</span>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold">WordPress</span>
                                                <span className="text-[10px] text-tertiary">Site WordPress chuẩn</span>
                                            </div>
                                        </label>
                                        <label className={`flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer ${selectedBrand.wp_username === 'custom_webhook' ? 'bg-primary/10 border-primary' : 'border-border'}`}>
                                            <input
                                                type="radio"
                                                name="platform"
                                                checked={selectedBrand.wp_username === 'custom_webhook'}
                                                onChange={() => updateSelected({ wp_username: 'custom_webhook' })}
                                                className="hidden"
                                            />
                                            <span className="text-xl">⚡</span>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold">Custom Website</span>
                                                <span className="text-[10px] text-tertiary">Next.js, Node, Laravel...</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {selectedBrand.wp_username !== 'custom_webhook' ? (
                                    <>
                                        <p className="text-xs text-tertiary mb-3">Thông tin để tự động đăng bài lên website WordPress của bạn.</p>
                                        <div className="form-group mb-3">
                                            <label className="form-label">WordPress Site URL</label>
                                            <input
                                                type="url"
                                                className="form-input"
                                                value={selectedBrand.wp_url || ''}
                                                onChange={e => updateSelected({ wp_url: e.target.value })}
                                                placeholder="https://yourwebsite.com"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="form-group">
                                                <label className="form-label">Username</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={selectedBrand.wp_username || ''}
                                                    onChange={e => updateSelected({ wp_username: e.target.value })}
                                                    placeholder="admin"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">App Password</label>
                                                <input
                                                    type="password"
                                                    className="form-input"
                                                    value={selectedBrand.wp_password || ''}
                                                    onChange={e => updateSelected({ wp_password: e.target.value })}
                                                    placeholder="xxxx xxxx xxxx xxxx"
                                                />
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-tertiary mt-2 italic">
                                            * Sử dụng <strong>Application Password</strong> (trong WP Admin &gt; Users &gt; Profile), không dùng mật khẩu chính.
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-xs text-tertiary mb-3">Sử dụng Webhook để đăng bài lên bất kỳ website nào (Next.js, React, Node.js...). <a href="#" className="underline text-primary">Xem hướng dẫn code</a></p>
                                        <div className="form-group mb-3">
                                            <label className="form-label">Webhook URL (API Endpoint)</label>
                                            <input
                                                type="url"
                                                className="form-input"
                                                value={selectedBrand.wp_url || ''}
                                                onChange={e => updateSelected({ wp_url: e.target.value })}
                                                placeholder="https://yourwebsite.com/api/receive-article"
                                            />
                                        </div>
                                        <div className="form-group mb-3">
                                            <label className="form-label">Secret Key (Authorization)</label>
                                            <input
                                                type="password"
                                                className="form-input"
                                                value={selectedBrand.wp_password || ''}
                                                onChange={e => updateSelected({ wp_password: e.target.value })}
                                                placeholder="Tự tạo một chuỗi bí mật (ví dụ: my-secret-key-123)"
                                            />
                                        </div>

                                        <div className="bg-[#1e1e1e] p-3 rounded-md border border-[#333] mt-3">
                                            <div className="text-[10px] text-gray-400 mb-2 uppercase font-mono">Example: Next.js App Router (app/api/receive/route.ts)</div>
                                            <pre className="text-[10px] font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap">
                                                {`import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (secret !== '${selectedBrand.wp_password || 'YOUR_SECRET_KEY'}') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const article = await req.json();
  // article contains: title, content, slug, meta_title, etc.
  
  // Save to your database...
  console.log('Received article:', article.title);

  return NextResponse.json({ success: true, link: \`https://your-site.com/\${article.slug}\` });
}`}
                                            </pre>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Hủy</button>
                            <button className="btn btn-primary px-10" onClick={handleSave} disabled={saveMutation.isPending}>
                                {saveMutation.isPending ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
