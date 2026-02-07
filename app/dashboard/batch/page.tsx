'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './batch.module.css'

interface BatchItem {
    id: number
    keyword: string
    status: 'pending' | 'processing' | 'success' | 'error'
    progress: string
    resultUrl?: string
    error?: string
}

export default function BatchProcessingPage() {
    const [keywordsInput, setKeywordsInput] = useState('')
    const [batchItems, setBatchItems] = useState<BatchItem[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [processedCount, setProcessedCount] = useState(0)

    const parseKeywords = () => {
        const lines = keywordsInput.split('\n').map(l => l.trim()).filter(l => l.length > 0)
        return lines
    }

    const startBatch = async () => {
        const keywords = parseKeywords()
        if (keywords.length === 0) return

        const initialItems: BatchItem[] = keywords.map((kw, idx) => ({
            id: idx,
            keyword: kw,
            status: 'pending',
            progress: 'Chờ xử lý...'
        }))

        setBatchItems(initialItems)
        setIsProcessing(true)
        setProcessedCount(0)

        // Process sequentially
        for (let i = 0; i < initialItems.length; i++) {
            await processItem(initialItems[i])
            setProcessedCount(prev => prev + 1)
        }

        setIsProcessing(false)
    }

    const updateItemStatus = (id: number, updates: Partial<BatchItem>) => {
        setBatchItems(prev => prev.map(item =>
            item.id === id ? { ...item, ...updates } : item
        ))
    }

    const processItem = async (item: BatchItem) => {
        updateItemStatus(item.id, { status: 'processing', progress: 'Đang nghiên cứu...' })

        try {
            // Step 1: Research
            const researchRes = await fetch('/api/research/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyword: item.keyword })
            })

            if (!researchRes.ok) throw new Error('Lỗi nghiên cứu')
            const researchData = await researchRes.json()

            // Step 2: Generate Article
            updateItemStatus(item.id, { progress: 'Đang viết bài...' })
            const articleRes = await fetch('/api/generate/article', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    keyword: item.keyword,
                    researchBrief: researchData.data.brief,
                    contentStrategy: researchData.data.strategy,
                    researchId: researchData.data.researchId
                })
            })

            if (!articleRes.ok) throw new Error('Lỗi tạo bài viết')
            const articleData = await articleRes.json()

            // Validate Article ID
            const articleId = articleData.data?.id
            if (!articleId) throw new Error('Không nhận được ID bài viết')

            // Step 3: Generate Image (Optional/Async)
            updateItemStatus(item.id, { progress: 'Đang tạo ảnh...' })
            try {
                await fetch('/api/generate/image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        articleId: articleId,
                        title: articleData.data.title,
                        keyword: item.keyword
                    })
                })
            } catch (e) { console.warn('Image gen failed', e) }

            console.log(`Success processing ${item.keyword}: Article ID ${articleId}`)

            updateItemStatus(item.id, {
                status: 'success',
                progress: 'Hoàn thành',
                resultUrl: `/dashboard/articles/${articleId}`
            })

        } catch (error) {
            console.error(`Error processing ${item.keyword}:`, error)
            updateItemStatus(item.id, {
                status: 'error',
                progress: 'Thất bại: ' + (error as Error).message,
                error: (error as Error).message
            })
        }
    }

    return (
        <div className="container mx-auto max-w-4xl">
            <header className="mb-8">
                <h1 className="text-2xl font-bold mb-2">Xử Lý Hàng Loạt</h1>
                <p className="text-secondary">Nhập danh sách từ khóa, hệ thống sẽ tự động nghiên cứu và viết bài cho từng từ khóa.</p>
            </header>

            {!isProcessing && batchItems.length === 0 && (
                <div className="bg-surface p-6 rounded-lg border border-border shadow-sm">
                    <label className="block mb-4 font-medium">Nhập danh sách từ khóa (Mỗi từ 1 dòng):</label>
                    <textarea
                        className={styles.keywordsInput}
                        value={keywordsInput}
                        onChange={(e) => setKeywordsInput(e.target.value)}
                        placeholder="Ví dụ:&#10;Cách học SEO hiệu quả&#10;Google EEAT là gì&#10;Mẹo tối ưu Onpage"
                    ></textarea>

                    <div className="mt-4 flex justify-end">
                        <button
                            className="btn btn-primary"
                            onClick={startBatch}
                            disabled={!keywordsInput.trim()}
                        >
                            Bắt đầu Xử Lý ({parseKeywords().length} từ khóa)
                        </button>
                    </div>
                </div>
            )}

            {(isProcessing || batchItems.length > 0) && (
                <div className={styles.progressContainer}>
                    <div className={styles.progressHeader}>
                        <h3 className="font-bold">Tiến Trình ({processedCount}/{batchItems.length})</h3>
                        {/* Only show "Complete" badge if all done */}
                        {!isProcessing && batchItems.length > 0 && (
                            <span className="badge badge-success">Đã Hoàn Thành</span>
                        )}
                        {/* Cancel/Reset button */}
                        {!isProcessing && (
                            <button className="btn btn-sm btn-ghost" onClick={() => { setBatchItems([]); setProcessedCount(0); }}>
                                Làm Mới
                            </button>
                        )}
                    </div>

                    <div className={styles.progressList}>
                        {batchItems.map((item) => (
                            <div key={item.id} className={styles.progressItem}>
                                <div className={`
                                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                                    ${item.status === 'pending' ? 'bg-gray-200 text-gray-500' : ''}
                                    ${item.status === 'processing' ? 'bg-blue-100 text-blue-600 animate-pulse' : ''}
                                    ${item.status === 'success' ? 'bg-green-100 text-green-600' : ''}
                                    ${item.status === 'error' ? 'bg-red-100 text-red-600' : ''}
                                `}>
                                    {item.status === 'pending' && '•'}
                                    {item.status === 'processing' && '⚡'}
                                    {item.status === 'success' && '✓'}
                                    {item.status === 'error' && '✕'}
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-sm">{item.keyword}</div>
                                    <div className="text-xs text-secondary mt-0.5">{item.progress}</div>
                                </div>
                                {item.status === 'success' && item.resultUrl && (
                                    <Link href={item.resultUrl} target="_blank" className="btn btn-xs btn-outline">
                                        Xem Bài
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
