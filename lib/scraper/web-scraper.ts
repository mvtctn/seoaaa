import { logger } from '@/lib/logger'
import axios from 'axios'
import * as cheerio from 'cheerio'

export interface SERPResult {
    position: number
    title: string
    url: string
    snippet: string
    domain: string
}

export interface ScrapedContent {
    url: string
    title: string
    content: string
    headings: string[]
    wordCount: number
    metaDescription?: string
    metaKeywords?: string
    images: string[]
}

/**
 * Fetch SERP results for a keyword using SerpAPI
 */
export async function fetchSERPResults(keyword: string, limit: number = 10): Promise<SERPResult[]> {
    const apiKey = process.env.SERP_API_KEY

    if (!apiKey) {
        logger.warn('SERP_API_KEY not configured, returning mock data')
        return getMockSERPResults(keyword, limit)
    }

    try {
        const response = await axios.get('https://serpapi.com/search', {
            params: {
                q: keyword,
                api_key: apiKey,
                num: limit,
                hl: 'vi', // Vietnamese
                gl: 'vn', // Vietnam
            }
        })

        const organicResults = response.data.organic_results || []

        return organicResults.slice(0, limit).map((result: any, index: number) => {
            const url = result.link || result.url || ''
            let domain = 'N/A'
            try {
                if (url) domain = new URL(url).hostname
            } catch (e) { }

            return {
                position: index + 1,
                title: result.title || 'Untitled',
                url: url,
                snippet: result.snippet || '',
                domain: domain
            }
        })
    } catch (error) {
        logger.error('Error fetching SERP results:', error)
        return getMockSERPResults(keyword, limit)
    }
}

/**
 * Scrape content from a URL
 */
export async function scrapeURL(url: string): Promise<ScrapedContent | null> {
    try {
        // First try Firecrawl if API key is available
        if (process.env.FIRECRAWL_API_KEY) {
            return await scrapeWithFirecrawl(url)
        }

        // Fallback to basic scraping with cheerio
        return await scrapeWithCheerio(url)
    } catch (error) {
        logger.error(`Error scraping ${url}:`, error)
        return null
    }
}

/**
 * Scrape using Firecrawl API
 */
async function scrapeWithFirecrawl(url: string): Promise<ScrapedContent | null> {
    try {
        const response = await axios.post(
            'https://api.firecrawl.dev/v0/scrape',
            {
                url,
                formats: ['markdown'] // Limit to markdown for speed
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 15000 // 15 second timeout for research
            }
        )

        const data = response.data.data
        const content = data.markdown || ''

        return {
            url,
            title: data.metadata?.title || data.title || '',
            content,
            headings: [], // Headings will be extracted during AI analysis if needed, or we can parse markdown
            wordCount: content.split(/\s+/).length,
            metaDescription: data.metadata?.description || data.description,
            metaKeywords: '',
            images: []
        }
    } catch (error) {
        logger.error('Firecrawl error:', error)
        return scrapeWithCheerio(url)
    }
}

/**
 * Scrape using Cheerio (basic fallback)
 */
async function scrapeWithCheerio(url: string): Promise<ScrapedContent | null> {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
        })

        const $ = cheerio.load(response.data)

        // Remove script and style elements
        $('script, style, nav, header, footer').remove()

        // Extract title
        const title = $('h1').first().text().trim() || $('title').text().trim()

        // Extract headings
        const headings: string[] = []
        $('h1, h2, h3, h4, h5, h6').each((_, el) => {
            const text = $(el).text().trim()
            if (text) headings.push(text)
        })

        // Extract main content
        let content = ''
        const mainSelectors = [
            'article',
            'main',
            '[role="main"]',
            '.post-content',
            '.entry-content',
            '.article-content',
            '.content'
        ]

        for (const selector of mainSelectors) {
            const element = $(selector).first()
            if (element.length > 0) {
                content = element.text()
                break
            }
        }

        // Fallback to body if no main content found
        if (!content || content.trim().length < 200) {
            content = $('body').text()
        }

        // Clean up content
        content = content
            .replace(/\s+/g, ' ')
            .replace(/\n+/g, '\n')
            .trim()

        // Extract images
        const images: string[] = []
        $('img').each((_, el) => {
            const src = $(el).attr('src')
            if (src && !src.includes('logo') && !src.includes('icon')) {
                images.push(src)
            }
        })

        return {
            url,
            title,
            content,
            headings,
            wordCount: content.split(/\s+/).length,
            metaDescription: $('meta[name="description"]').attr('content'),
            metaKeywords: $('meta[name="keywords"]').attr('content'),
            images: images.slice(0, 5)
        }
    } catch (error) {
        logger.error(`Cheerio scraping error for ${url}:`, error)
        return null
    }
}

/**
 * Scrape multiple URLs in parallel
 */
export async function scrapeMultipleURLs(urls: string[]): Promise<ScrapedContent[]> {
    const results = await Promise.allSettled(
        urls.map(url => scrapeURL(url))
    )

    return results
        .filter((result): result is PromiseFulfilledResult<ScrapedContent | null> =>
            result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value as ScrapedContent)
}

/**
 * Mock SERP results for testing without API key
 */
function getMockSERPResults(keyword: string, limit: number): SERPResult[] {
    return Array.from({ length: limit }, (_, i) => ({
        position: i + 1,
        title: `Example Article About ${keyword} - Position ${i + 1}`,
        url: `https://example.com/article-${i + 1}`,
        snippet: `This is a comprehensive guide about ${keyword}. Learn everything you need to know...`,
        domain: 'example.com'
    }))
}

/**
 * Analyze competitor URLs and return structured data
 */
export async function analyzeCompetitors(keyword: string, topN: number = 10) {
    logger.info(`🔍 Fetching SERP results for "${keyword}"...`)
    const serpResults = await fetchSERPResults(keyword, topN)

    logger.info(`📄 Found ${serpResults.length} results. Scraping content...`)
    const urls = serpResults.map(result => result.url)
    const scrapedContent = await scrapeMultipleURLs(urls)

    logger.info(`✅ Successfully scraped ${scrapedContent.length} competitors`)

    return {
        serpResults,
        competitors: scrapedContent.map(content => ({
            url: content.url,
            title: content.title,
            content: content.content,
            wordCount: content.wordCount,
            headings: content.headings
        }))
    }
}
