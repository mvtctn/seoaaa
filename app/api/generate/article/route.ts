import { NextRequest, NextResponse } from 'next/server'
import { AIOrchestrator } from '@/lib/ai/orchestrator'
import { generateSlug } from '@/lib/seo/utils'
import { createArticle, getDefaultBrand } from '@/lib/db/database'

export const maxDuration = 300 // 5 minutes timeout

export async function POST(req: NextRequest) {
    try {
        console.log('--- [API] /api/generate/article CALLED ---')
        const body = await req.json()
        const { keyword, researchBrief, contentStrategy, researchId, keywordId } = body

        if (!keyword || !researchBrief || !contentStrategy) {
            console.error('[API] Missing required parameters')
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
        }

        // 1. Get Brand Context
        console.log('[API] Fetching brand context...')
        const brand = await getDefaultBrand()
        console.log(`[API] Using brand: ${brand ? brand.name : 'NONE (Using Generic)'}`)

        const brandContextForAI = brand ? {
            id: brand.id,
            name: brand.name,
            coreValues: Array.isArray(brand.core_values) ? brand.core_values : (typeof brand.core_values === 'string' ? JSON.parse(brand.core_values) : []),
            toneOfVoice: typeof brand.tone_of_voice === 'object' ? brand.tone_of_voice?.description : (typeof brand.tone_of_voice === 'string' ? JSON.parse(brand.tone_of_voice).description : 'Professional'),
            articleTemplate: brand.article_template || undefined,
            internalLinks: Array.isArray(brand.internal_links) ? brand.internal_links : (typeof brand.internal_links === 'string' ? JSON.parse(brand.internal_links) : [])
        } : undefined

        // 2. Generate Article Content (Using Orchestrator)
        console.log(`[API] ✍️ Generating article for: "${keyword}" using AI Orchestrator...`)
        const generationResult = await AIOrchestrator.generateArticle({
            keyword,
            researchBrief,
            contentStrategy,
            brandContext: brandContextForAI
        })
        const rawContent = generationResult.content
        console.log('[API] ✓ Raw content generated')

        // --- PARSE AI OUTPUT ---
        const sections = {
            article: '',
            summary: '',
            meta: { title: '', description: '', slug: '' },
            schema: ''
        }

        // Parse Article
        const articleMatch = rawContent.match(/\[ARTICLE\]\s*([\s\S]*?)(?=\[SUMMARY\]|\[META\]|\[SCHEMA\]|$)/i)
        if (articleMatch) {
            sections.article = articleMatch[1].trim()
        } else {
            sections.article = rawContent.replace(/\[SUMMARY\][\s\S]*|\[META\][\s\S]*|\[SCHEMA\][\s\S]*/i, '').trim()
        }

        // Parse Summary
        const summaryMatch = rawContent.match(/\[SUMMARY\]\s*([\s\S]*?)(?=\[META\]|\[SCHEMA\]|$)/i)
        if (summaryMatch) sections.summary = summaryMatch[1].trim()

        // Fallback if parsing failed to extract meaningful article content
        if (!sections.article.trim()) {
            console.warn('[API] Parsing failed to find [ARTICLE] block, using raw content as fallback')
            // Remove meta blocks if possible to clean up
            sections.article = rawContent
                .replace(/\[SUMMARY\][\s\S]*/i, '')
                .replace(/\[META\][\s\S]*/i, '')
                .replace(/\[SCHEMA\][\s\S]*/i, '')
                .trim()
        }

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
        const schemaMatch = rawContent.match(/\[SCHEMA\]\s*([\s\S]*)/i)
        if (schemaMatch) {
            const jsonMatch = schemaMatch[1].match(/```json\s*([\s\S]*?)\s*```/i)
            sections.schema = jsonMatch ? jsonMatch[1].trim() : schemaMatch[1].trim()
        }

        const content = sections.article

        // 3. Post-processing & SEO
        let title = sections.meta.title || researchBrief.recommendedOutline.title
        const h1Match = content.match(/^#\s+(.+)$/m)
        if (h1Match) {
            title = h1Match[1]
        }

        if (!title) title = keyword

        let slug = sections.meta.slug
        if (!slug || slug.length < 5) {
            slug = generateSlug(title)
        }

        // 4. Finalize Metadata (Using Orchestrator)
        console.log('[API] Finalizing metadata...')
        const metaTitleResult = sections.meta.title ? { content: sections.meta.title } : await AIOrchestrator.generateMetaTitle(title, keyword, brandContextForAI)
        const metaDescResult = sections.meta.description ? { content: sections.meta.description } : await AIOrchestrator.generateMetaDescription(title, keyword, content, brandContextForAI)

        const metaTitle = metaTitleResult.content
        const metaDesc = metaDescResult.content

        // 5. Save Artifact
        console.log('[API] Saving article to DB...')
        const dbResult = await createArticle({
            keyword_id: keywordId || 0,
            title,
            slug,
            content,
            meta_title: metaTitle,
            meta_description: metaDesc,
            status: 'draft',
            research_id: researchId || undefined,
            brand_id: brand?.id
        })

        const articleId = dbResult.lastInsertRowid

        console.log(`[API] ✅ Article generation complete (ID: ${articleId})`)

        return NextResponse.json({
            success: true,
            data: {
                id: articleId,
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

    } catch (error: any) {
        console.error('❌ [API] Generation API Error:', error)
        return NextResponse.json(
            {
                error: error.message || 'Internal Server Error',
                details: error.stack
            },
            { status: 500 }
        )
    }
}
