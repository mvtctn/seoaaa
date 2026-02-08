import { NextRequest, NextResponse } from 'next/server'
import { fetchSERPResults, scrapeURL } from '@/lib/scraper/web-scraper'
import { AIOrchestrator } from '@/lib/ai/orchestrator'
import { createResearch, getDefaultBrand, createKeyword } from '@/lib/db/database'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { handleApiError } from '@/lib/api-error-handler'

export const maxDuration = 300 // 5 minutes timeout for Vercel/Next.js

export async function POST(req: NextRequest) {
    try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        logger.info(`--- [API] /api/research/analyze CALLED by ${user.id} ---`)
        const body = await req.json()
        const { keyword } = body

        if (!keyword) {
            logger.error('[API] Missing keyword')
            return NextResponse.json({ error: 'Keyword is required' }, { status: 400 })
        }

        logger.info(`[API] 🚀 Starting Research for: "${keyword}"`)

        // 1. Get Brand Context
        logger.debug('[API] Step 1: Fetching brand context...')
        const brand = await getDefaultBrand(user.id)
        console.log(`[API] Brand: ${brand ? brand.name : 'No default brand found'}`)

        const brandContextForAI = brand ? {
            id: brand.id,
            name: brand.name,
            coreValues: Array.isArray(brand.core_values) ? brand.core_values : (typeof brand.core_values === 'string' ? JSON.parse(brand.core_values) : []),
            toneOfVoice: typeof brand.tone_of_voice === 'object' ? brand.tone_of_voice?.description : (typeof brand.tone_of_voice === 'string' ? JSON.parse(brand.tone_of_voice).description : 'Professional')
        } : undefined

        // 2. Fetch SERP Results
        console.log('[API] Step 2: Fetching SERP results...')
        const serpResults = await fetchSERPResults(keyword, 3)
        console.log(`[API] ✓ Got ${serpResults.length} SERP results`)

        // 3. Scrape Top Competitors
        console.log(`[API] Step 3: Scraped competitors (limit 3)...`)
        const scrapePromises = serpResults.map(async (result) => {
            try {
                if (result.url.includes('example.com')) return null
                logger.info(`[API] Scraping: ${result.url}`)
                const scraped = await scrapeURL(result.url)
                if (scraped) {
                    return {
                        url: result.url,
                        title: result.title,
                        content: scraped.content,
                        wordCount: scraped.wordCount || 0,
                        headings: scraped.headings || []
                    }
                }
            } catch (e) {
                logger.error(`[API] Scrape error for ${result.url}:`, e)
            }
            return null
        })

        const results = await Promise.all(scrapePromises)
        const validCompetitors = results.filter((c): c is any => c !== null)

        if (validCompetitors.length === 0) {
            console.warn('[API] ⚠️ No competitors scraped. Using fallback data.')
            validCompetitors.push({
                url: 'https://fallback.com',
                title: `${keyword} guide`,
                content: `Comprehensive guide about ${keyword}. Quality is key in content production.`,
                wordCount: 800,
                headings: ['Introduction', 'Summary']
            })
        }

        // 4. Analyze with AI Orchestrator
        console.log('[API] Step 4: Analyzing with AI Orchestrator...')
        const analysisResult = await AIOrchestrator.analyzeCompetitors(keyword, validCompetitors, brandContextForAI, user.id)
        const researchBrief = analysisResult // Keeping the name for compatibility
        console.log('[API] ✓ Research Brief generated')

        // 5. Generate Strategy
        console.log('[API] Step 5: Generating content strategy...')
        const strategyResult = await AIOrchestrator.generateContentStrategy(keyword, researchBrief, brandContextForAI, user.id)
        const strategy = strategyResult.content
        console.log('[API] ✓ Strategy generated')

        // 6. Save to Database
        console.log('[API] Step 6: Saving research results to DB...')

        // Check for existing keyword for THIS user using RLS-enabled client
        const { data: existingKeyword } = await supabase
            .from('keywords')
            .select('id')
            .eq('keyword', keyword)
            .maybeSingle()

        let keywordId: number

        if (existingKeyword) {
            keywordId = existingKeyword.id
            await supabase
                .from('keywords')
                .update({ status: 'researching', updated_at: new Date().toISOString() })
                .eq('id', keywordId)
        } else {
            const keywordResult = await createKeyword({
                keyword: keyword,
                status: 'researching',
                user_id: user.id
            })
            keywordId = Number(keywordResult.lastInsertRowid)
        }

        const researchResult = await createResearch({
            keyword_id: keywordId,
            user_id: user.id,
            serp_data: JSON.stringify(serpResults),
            competitor_analysis: JSON.stringify(validCompetitors.map(c => ({ url: c.url, title: c.title }))),
            content_gaps: JSON.stringify(researchBrief.contentGaps),
            strategic_positioning: strategy,
            gemini_brief: JSON.stringify(researchBrief)
        })

        const researchId = Number(researchResult.lastInsertRowid)
        console.log(`[API] ✅ All steps complete! Research ID: ${researchId}`)

        return NextResponse.json({
            success: true,
            data: {
                researchId,
                keywordId,
                brief: researchBrief,
                strategy,
                competitors: validCompetitors.length
            }
        })

    } catch (error: any) {
        return handleApiError(error, 'ResearchAnalyze')
    }
}
