import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { handleApiError } from '@/lib/api-error-handler'

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json()

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 })
        }

        // Validate URL format
        try {
            new URL(url)
        } catch {
            return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
        }

        logger.info('[Rewrite Analyze] Fetching content from:', url)

        // Fetch content from URL
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.status}`)
        }

        const html = await response.text()

        // Extract text content from HTML (simple extraction)
        const textContent = extractTextFromHTML(html)
        const title = extractTitle(html)
        const headings = extractHeadings(html)
        const metaDescription = extractMetaDescription(html)

        // Calculate basic metrics
        const wordCount = textContent.split(/\s+/).filter(w => w.length > 0).length
        const keywords = extractKeywords(textContent)

        // Analyze content gaps (simple heuristic)
        const gaps = analyzeContentGaps(textContent, headings)

        return NextResponse.json({
            success: true,
            data: {
                url,
                title,
                metaDescription,
                wordCount,
                headings,
                keywords: keywords.slice(0, 10), // Top 10 keywords
                gaps,
                rawContent: textContent.substring(0, 5000) // First 5000 chars for AI processing
            }
        })

    } catch (error: any) {
        return handleApiError(error, 'RewriteAnalyze')
    }
}

// Helper functions
function extractTextFromHTML(html: string): string {
    // Remove script and style tags
    let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')

    // Remove HTML tags
    text = text.replace(/<[^>]+>/g, ' ')

    // Decode HTML entities
    text = text.replace(/&nbsp;/g, ' ')
    text = text.replace(/&amp;/g, '&')
    text = text.replace(/&lt;/g, '<')
    text = text.replace(/&gt;/g, '>')
    text = text.replace(/&quot;/g, '"')

    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim()

    return text
}

function extractTitle(html: string): string {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    return titleMatch ? titleMatch[1].trim() : 'Untitled'
}

function extractHeadings(html: string): string[] {
    const headings: string[] = []
    const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi) || []
    const h2Matches = html.match(/<h2[^>]*>([^<]+)<\/h2>/gi) || []
    const h3Matches = html.match(/<h3[^>]*>([^<]+)<\/h3>/gi) || []

    h1Matches.forEach(h => {
        const text = h.replace(/<[^>]+>/g, '').trim()
        if (text) headings.push(`H1: ${text}`)
    })

    h2Matches.forEach(h => {
        const text = h.replace(/<[^>]+>/g, '').trim()
        if (text) headings.push(`H2: ${text}`)
    })

    h3Matches.forEach(h => {
        const text = h.replace(/<[^>]+>/g, '').trim()
        if (text) headings.push(`H3: ${text}`)
    })

    return headings
}

function extractMetaDescription(html: string): string {
    const metaMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)
    return metaMatch ? metaMatch[1].trim() : ''
}

function extractKeywords(text: string): string[] {
    // Simple keyword extraction based on word frequency
    const words = text.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 3) // Only words longer than 3 chars

    const frequency: { [key: string]: number } = {}
    words.forEach(word => {
        frequency[word] = (frequency[word] || 0) + 1
    })

    // Sort by frequency
    const sorted = Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .map(([word]) => word)

    return sorted
}

function analyzeContentGaps(text: string, headings: string[]): string[] {
    const gaps: string[] = []

    // Check for common content elements
    if (!text.toLowerCase().includes('ví dụ') && !text.toLowerCase().includes('example')) {
        gaps.push('Thiếu ví dụ minh họa cụ thể')
    }

    if (!text.toLowerCase().includes('case study') && !text.toLowerCase().includes('nghiên cứu')) {
        gaps.push('Chưa có case study thực tế')
    }

    if (headings.length < 3) {
        gaps.push('Cấu trúc heading còn đơn giản, nên thêm phần mục rõ ràng hơn')
    }

    if (text.length < 1000) {
        gaps.push('Nội dung còn ngắn, nên mở rộng thêm')
    }

    if (!text.toLowerCase().includes('kết luận') && !text.toLowerCase().includes('conclusion')) {
        gaps.push('Thiếu phần kết luận tổng kết')
    }

    if (!text.toLowerCase().includes('faq') && !text.toLowerCase().includes('câu hỏi')) {
        gaps.push('Nên thêm phần FAQ để tăng giá trị SEO')
    }

    return gaps.length > 0 ? gaps : ['Bài viết đã khá đầy đủ, có thể cải thiện thêm về độ sâu nội dung']
}
