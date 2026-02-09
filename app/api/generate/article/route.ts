import { NextRequest, NextResponse } from 'next/server'
import { AIOrchestrator } from '@/lib/ai/orchestrator'
import { generateSlug } from '@/lib/seo/utils'
import { createArticle, getDefaultBrand, updateKeywordStatus } from '@/lib/db/database'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { handleApiError } from '@/lib/api-error-handler'

export const maxDuration = 300 // 5 minutes timeout

export async function POST(req: NextRequest) {
    try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        logger.info(`--- [API] /api/generate/article CALLED by ${user.id} ---`)
        const body = await req.json()
        const { keyword, researchBrief, contentStrategy, researchId, keywordId, options } = body

        if (!keyword || !researchBrief || !contentStrategy) {
            logger.error('[API] Missing required parameters')
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
        }

        // 1. Get Brand Context
        logger.debug('[API] Fetching brand context...')
        const brand = await getDefaultBrand(user.id)
        logger.info(`[API] Using brand: ${brand ? brand.name : 'NONE (Using Generic)'}`)

        const brandContextForAI = brand ? {
            id: brand.id,
            name: brand.name,
            coreValues: Array.isArray(brand.core_values) ? brand.core_values : (typeof brand.core_values === 'string' ? JSON.parse(brand.core_values) : []),
            toneOfVoice: typeof brand.tone_of_voice === 'object' ? brand.tone_of_voice?.description : (typeof brand.tone_of_voice === 'string' ? JSON.parse(brand.tone_of_voice).description : 'Professional'),
            articleTemplate: brand.article_template || undefined,
            internalLinks: Array.isArray(brand.internal_links) ? brand.internal_links : (typeof brand.internal_links === 'string' ? JSON.parse(brand.internal_links) : [])
        } : undefined

        // 2. Generate Article Content (Using Orchestrator Streaming)
        logger.info(`[API] ✍️ Generating article for: "${keyword}" using AI Orchestrator (STREAMING)...`)

        const encoder = new TextEncoder()
        const generator = AIOrchestrator.streamArticle({
            keyword,
            researchBrief,
            contentStrategy,
            brandContext: brandContextForAI,
            userId: user.id,
            options
        })

        const stream = new ReadableStream({
            async start(controller) {
                let fullContent = ''
                try {
                    for await (const chunk of generator) {
                        fullContent += chunk
                        controller.enqueue(encoder.encode(chunk))
                    }

                    // Post-stream processing: Save to DB
                    try {
                        const sections = {
                            article: '',
                            summary: '',
                            meta: { title: '', description: '', slug: '' },
                            schema: ''
                        }

                        const articleMatch = fullContent.match(/\[ARTICLE\]\s*([\s\S]*?)(?=\[SUMMARY\]|\[META\]|\[SCHEMA\]|$)/i)
                        sections.article = articleMatch ? articleMatch[1].trim() : fullContent.replace(/\[SUMMARY\][\s\S]*|\[META\][\s\S]*|\[SCHEMA\][\s\S]*/i, '').trim()

                        const summaryMatch = fullContent.match(/\[SUMMARY\]\s*([\s\S]*?)(?=\[META\]|\[SCHEMA\]|$)/i)
                        if (summaryMatch) sections.summary = summaryMatch[1].trim()

                        const metaMatch = fullContent.match(/\[META\]\s*([\s\S]*?)(?=\[SCHEMA\]|$)/i)
                        if (metaMatch) {
                            const metaText = metaMatch[1]
                            const titleM = metaText.match(/Meta Title:\s*(.*)/i)
                            const descM = metaText.match(/Meta Description:\s*(.*)/i)
                            const slugM = metaText.match(/URL Slug:\s*(.*)/i)
                            if (titleM) sections.meta.title = titleM[1].trim().replace(/^"|"$/g, '')
                            if (descM) sections.meta.description = descM[1].trim().replace(/^"|"$/g, '')
                            if (slugM) sections.meta.slug = slugM[1].trim()
                        }

                        const schemaMatch = fullContent.match(/\[SCHEMA\]\s*([\s\S]*)/i)
                        if (schemaMatch) {
                            const jsonMatch = schemaMatch[1].match(/```json\s*([\s\S]*?)\s*```/i)
                            sections.schema = jsonMatch ? jsonMatch[1].trim() : schemaMatch[1].trim()
                        }

                        // Save Article
                        const result = await createArticle({
                            keyword_id: keywordId ? Number(keywordId) : null,
                            research_id: researchId ? Number(researchId) : undefined,
                            user_id: user.id,
                            title: sections.meta.title || keyword,
                            content: sections.article,
                            meta_title: sections.meta.title,
                            meta_description: sections.meta.description,
                            slug: sections.meta.slug || generateSlug(sections.meta.title || keyword),
                            status: 'draft'
                        })

                        if (result.changes > 0) {
                            logger.info(`[API] Article saved successfully! ID: ${result.lastInsertRowid}`)

                            // Update keyword status
                            if (keywordId) {
                                await updateKeywordStatus(Number(keywordId), 'completed')
                            }
                        } else {
                            logger.error('[API] Article failed to save (no changes)')
                        }

                    } catch (dbErr) {
                        logger.error('[API] Post-stream DB error:', dbErr)
                    }

                    controller.close()
                } catch (error) {
                    logger.error('[API] Stream processing error:', error)
                    controller.error(error)
                }
            }
        })

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
            },
        })

    } catch (error: any) {
        return handleApiError(error, 'GenerateArticle')
    }
}
