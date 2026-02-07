import { NextRequest, NextResponse } from 'next/server'
// Changed from deepseek to groq
import { generateArticle, generateMetaTitle, generateMetaDescription } from '@/lib/ai/groq'
import { generateSlug, calculateReadingTime } from '@/lib/seo/utils'
import { createArticle, getAllBrands } from '@/lib/db/database'

export const maxDuration = 300 // 5 minutes timeout

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { keyword, researchBrief, contentStrategy, researchId, keywordId } = body

        if (!keyword || !researchBrief || !contentStrategy) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
        }

        // 1. Get Brand Context
        const brands = getAllBrands()
        const brand = brands.length > 0 ? brands[0] : null

        const brandContext = brand ? {
            name: brand.name,
            coreValues: brand.core_values ? JSON.parse(brand.core_values as string) : [],
            toneOfVoice: brand.tone_of_voice ? JSON.parse(brand.tone_of_voice as string) : { description: 'Professional' },
            articleTemplate: brand.article_template || undefined,
            internalLinks: brand.internal_links ? JSON.parse(brand.internal_links as string) : []
        } : undefined

        // 2. Generate Article Content (Now using Gemini)
        console.log(`Generating article for: ${keyword} using Gemini...`)
        const content = await generateArticle({
            keyword,
            researchBrief,
            contentStrategy,
            brandContext
        })

        // 3. Post-processing & SEO
        let title = researchBrief.recommendedOutline.title
        const h1Match = content.match(/^#\s+(.+)$/m)
        if (h1Match) {
            title = h1Match[1]
        }

        // Fallback title if none found
        if (!title) title = keyword

        const slug = generateSlug(title)
        // reading_time removed from DB logic for now, but calculated for display if needed

        // 4. Generate Metadata (Gemini)
        console.log('Generating metadata...')
        const metaTitle = await generateMetaTitle(title, keyword)
        const metaDesc = await generateMetaDescription(title, keyword, content)

        // 5. Save Artifact
        const articleId = createArticle({
            keyword_id: keywordId || 0,
            title,
            slug,
            content,
            meta_title: metaTitle,
            meta_description: metaDesc,
            status: 'draft',
            research_id: researchId || undefined
        })

        return NextResponse.json({
            success: true,
            data: {
                articleId,
                title,
                slug,
                content,
                metaTitle,
                metaDesc
            }
        })

    } catch (error) {
        console.error('Generation API Error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal Server Error' },
            { status: 500 }
        )
    }
}
