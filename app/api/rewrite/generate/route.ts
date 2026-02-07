import { NextRequest, NextResponse } from 'next/server'
import { generateArticle } from '@/lib/ai/groq'
import { createArticleFromRewrite, getDefaultBrand } from '@/lib/db/database'

export async function POST(req: NextRequest) {
    try {
        const {
            originalUrl,
            originalContent,
            targetKeyword,
            analysis
        } = await req.json()

        if (!originalContent) {
            return NextResponse.json({ error: 'Original content is required' }, { status: 400 })
        }

        console.log('[Rewrite Generate] Starting content rewrite...')

        // 1. Get Brand Context
        const brand = await getDefaultBrand()
        const brandContext = brand ? {
            name: brand.name,
            coreValues: Array.isArray(brand.core_values) ? brand.core_values : (typeof brand.core_values === 'string' ? JSON.parse(brand.core_values) : []),
            toneOfVoice: typeof brand.tone_of_voice === 'object' ? (brand.tone_of_voice as any)?.description : (typeof brand.tone_of_voice === 'string' ? JSON.parse(brand.tone_of_voice).description : 'Professional'),
            articleTemplate: brand.article_template || undefined,
            internalLinks: Array.isArray(brand.internal_links) ? brand.internal_links : (typeof brand.internal_links === 'string' ? JSON.parse(brand.internal_links) : [])
        } : undefined

        // Create a research brief based on the analysis
        const researchBrief = {
            userIntent: 'Informational',
            commonThemes: analysis.keywords || [],
            contentGaps: analysis.gaps || [],
            recommendedWordCount: `${Math.max(analysis.wordCount * 1.3, 1500)}-${Math.max(analysis.wordCount * 1.5, 2000)}`,
            recommendedOutline: {
                title: analysis.title || 'Bài viết được viết lại',
                headings: generateImprovedOutline(analysis.headings, analysis.gaps)
            }
        }

        // Create content strategy
        const contentStrategy = `
Viết lại bài viết "${analysis.title}" với những cải tiến sau:

1. **Mở rộng nội dung**: Tăng độ sâu và chi tiết hơn bài gốc
2. **Bổ sung Content Gaps**: ${analysis.gaps.join(', ')}
3. **Tối ưu SEO**: ${targetKeyword ? `Tập trung vào từ khóa "${targetKeyword}"` : 'Cải thiện mật độ từ khóa tự nhiên'}
4. **Cấu trúc rõ ràng**: Sử dụng heading phân cấp tốt hơn
5. **Thêm giá trị**: Bổ sung ví dụ, case study, FAQ nếu thiếu

Bài viết mới phải:
- Dài hơn và đầy đủ hơn bài gốc
- Giữ các thông tin chính xác từ bài gốc
- Viết theo phong cách chuyên nghiệp, dễ đọc
- Tối ưu cho SEO và trải nghiệm người dùng
        `.trim()

        // Generate improved article using Groq AI
        const keyword = targetKeyword || analysis.title
        const articleContent = await generateArticle({
            keyword,
            researchBrief,
            contentStrategy,
            brandContext
        })

        // Save to database using the new helper function
        const newArticle = await createArticleFromRewrite({
            title: analysis.title,
            content: articleContent,
            status: 'draft',
            source_url: originalUrl || null,
            meta_description: analysis.metaDescription || null,
            brand_id: brand?.id
        })

        const articleId = Number(newArticle.lastInsertRowid)
        console.log('[Rewrite Generate] Article created with ID:', articleId)

        return NextResponse.json({
            success: true,
            data: {
                id: articleId,
                title: analysis.title,
                status: 'success',
                improvements: [
                    `Tăng độ dài từ ${analysis.wordCount} lên ~${Math.floor(analysis.wordCount * 1.4)} từ`,
                    `Bổ sung ${analysis.gaps.length} điểm còn thiếu`,
                    'Cải thiện cấu trúc heading',
                    'Tối ưu SEO tốt hơn'
                ]
            }
        })

    } catch (error: any) {
        console.error('[Rewrite Generate] Error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to rewrite content' },
            { status: 500 }
        )
    }
}

// Helper function to generate improved outline
function generateImprovedOutline(originalHeadings: string[], gaps: string[]): any[] {
    const outline = []

    // Add introduction
    outline.push({
        level: 2,
        text: 'Giới Thiệu',
        desc: 'Mở đầu hấp dẫn, giới thiệu vấn đề và giá trị bài viết'
    })

    // Add main sections based on original headings
    originalHeadings.forEach((heading, idx) => {
        const text = heading.replace(/^H[123]:\s*/, '')
        outline.push({
            level: 2,
            text: text,
            desc: `Phát triển chi tiết phần "${text}"`
        })
    })

    // Add missing sections based on gaps
    if (gaps.some(g => g.includes('ví dụ'))) {
        outline.push({
            level: 2,
            text: 'Ví Dụ Thực Tế',
            desc: 'Minh họa bằng các ví dụ cụ thể'
        })
    }

    if (gaps.some(g => g.includes('case study'))) {
        outline.push({
            level: 2,
            text: 'Case Study',
            desc: 'Nghiên cứu tình huống thực tế'
        })
    }

    if (gaps.some(g => g.includes('FAQ'))) {
        outline.push({
            level: 2,
            text: 'Câu Hỏi Thường Gặp (FAQ)',
            desc: 'Giải đáp các thắc mắc phổ biến'
        })
    }

    // Add conclusion
    outline.push({
        level: 2,
        text: 'Kết Luận',
        desc: 'Tổng kết và kêu gọi hành động'
    })

    return outline
}
