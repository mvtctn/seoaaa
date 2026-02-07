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
        const brands = await getAllBrands()
        const brand = brands.length > 0 ? brands[0] : null

        const brandContext = brand ? {
            name: brand.name,
            coreValues: brand.core_values ? JSON.parse(brand.core_values as string) : [],
            toneOfVoice: brand.tone_of_voice ? JSON.parse(brand.tone_of_voice as string) : { description: 'Professional' },
            articleTemplate: brand.article_template || undefined,
            internalLinks: brand.internal_links ? JSON.parse(brand.internal_links as string) : []
        } : undefined

        // 2. Generate Article Content (Now using Gemini)
        // 2. Generate Article Content (Now using Gemini/Groq)
        console.log(`Generating article for: ${keyword} using AI...`)
        const rawContent = await generateArticle({
            keyword,
            researchBrief,
            contentStrategy,
            brandContext
        })

        // --- PARSE AI OUTPUT ---
        const sections = {
            article: '',
            summary: '',
            meta: { title: '', description: '', slug: '' },
            schema: ''
        }

        // Parse Article
        // Look for [ARTICLE] tag, or assume start of string if not found
        const articleMatch = rawContent.match(/\[ARTICLE\]\s*([\s\S]*?)(?=\[SUMMARY\]|\[META\]|\[SCHEMA\]|$)/i)
        if (articleMatch) {
            sections.article = articleMatch[1].trim()
        } else {
            // Fallback: cleaning up potential tags if [ARTICLE] missing but others present
            sections.article = rawContent.replace(/\[SUMMARY\][\s\S]*|\[META\][\s\S]*|\[SCHEMA\][\s\S]*/i, '').trim()
        }

        // Parse Summary
        const summaryMatch = rawContent.match(/\[SUMMARY\]\s*([\s\S]*?)(?=\[META\]|\[SCHEMA\]|$)/i)
        if (summaryMatch) sections.summary = summaryMatch[1].trim()

        // Parse Meta
        const metaMatch = rawContent.match(/\[META\]\s*([\s\S]*?)(?=\[SCHEMA\]|$)/i)
        if (metaMatch) {
            const metaText = metaMatch[1]
            const titleMatch = metaText.match(/Meta Title:\s*(.*)/i)
            const descMatch = metaText.match(/Meta Description:\s*(.*)/i)
            const slugMatch = metaText.match(/URL Slug:\s*(.*)/i)

            if (titleMatch) sections.meta.title = titleMatch[1].trim().replace(/^"|"$/g, '')
            if (descMatch) sections.meta.description = descMatch[1].trim().replace(/^"|"$/g, '')
            if (slugMatch) sections.meta.slug = slugMatch[1].trim()
        }

        // Parse Schema
        // TODO: Save Schema to DB when column available
        const schemaMatch = rawContent.match(/\[SCHEMA\]\s*([\s\S]*)/i)
        if (schemaMatch) {
            // Try to extract JSON block only
            const jsonMatch = schemaMatch[1].match(/```json\s*([\s\S]*?)\s*```/i)
            sections.schema = jsonMatch ? jsonMatch[1].trim() : schemaMatch[1].trim()
        }

        const content = sections.article // Clean content

        // 3. Post-processing & SEO
        let title = sections.meta.title || researchBrief.recommendedOutline.title
        const h1Match = content.match(/^#\s+(.+)$/m)
        if (h1Match) {
            // Prefer H1 in content if available, as it's the actual article title
            title = h1Match[1]
        }

        // Fallback title
        if (!title) title = keyword

        let slug = sections.meta.slug
        if (!slug || slug.length < 5) {
            slug = generateSlug(title)
        }

        // 4. Generate Metadata (Use AI extracted first, fallback to separate generation)
        console.log('Finalizing metadata...')
        const metaTitle = sections.meta.title || await generateMetaTitle(title, keyword)
        const metaDesc = sections.meta.description || await generateMetaDescription(title, keyword, content)

        // 5. Save Artifact
        const articleId = await createArticle({
            keyword_id: keywordId || 0,
            title,
            slug,
            content, // Saved clean content only
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
                metaDesc,
                schema: sections.schema,
                summary: sections.summary
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
