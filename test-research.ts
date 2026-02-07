import { analyzeCompetitors, generateContentStrategy } from './lib/ai/groq'
import { fetchSERPResults, scrapeURL } from './lib/scraper/web-scraper'
import dotenv from 'dotenv'

// Load .env.local
dotenv.config({ path: '.env.local' })

async function testResearch() {
    console.log('--- Testing Research Process ---')
    const keyword = 'test keyword 123'

    try {
        console.log('1. Checking Env...')
        console.log('GROQ_KEY:', process.env.GROQ_API_KEY ? 'OK' : 'MISSING')
        console.log('SERP_KEY:', process.env.SERP_API_KEY ? 'OK' : 'MISSING')

        console.log('\n2. Fetching SERP...')
        const serpResults = await fetchSERPResults(keyword, 3)
        console.log(`✓ Fetched ${serpResults.length} results`)

        console.log('\n3. Scraping Competitors (Mock mode if scrape fails)...')
        // Mock a competitor for speed/safety
        const competitors = [{
            url: 'https://example.com',
            title: 'Example Guide',
            content: 'This is a sample content about the keyword. It covers main topics and strategies.',
            wordCount: 500,
            headings: ['Intro', 'Strategy', 'Conclusion']
        }]

        console.log('\n4. Analyzing with AI...')
        const brief = await analyzeCompetitors(keyword, competitors)
        console.log('✓ Analysis complete:', brief.targetAudience.substring(0, 50) + '...')

        console.log('\n5. Generating Strategy...')
        const strategy = await generateContentStrategy(keyword, brief)
        console.log('✓ Strategy generated')

        console.log('\n--- SUCCESS ---')

    } catch (error) {
        console.error('\n❌ FAILED:', error)
    }
}

testResearch()
