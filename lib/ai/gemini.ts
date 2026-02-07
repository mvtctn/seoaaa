// Gemini AI Integration
// https://aistudio.google.com/

import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY || ''

// Initialize Gemini
// Use gemini-1.5-flash for speed and cost efficiency (highly recommended over Groq free tier)
const genAI = new GoogleGenerativeAI(apiKey)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

export interface CompetitorData {
    url: string
    title: string
    content: string
    wordCount: number
    headings: string[]
}

/**
 * Call Gemini API with retry logic
 */
async function callGemini(prompt: string, temperature: number = 0.7): Promise<string> {
    if (!apiKey) {
        console.error('[Gemini] ERROR: No API key found in process.env.GEMINI_API_KEY')
        throw new Error('Missing Gemini API Key')
    }

    try {
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                temperature,
                maxOutputTokens: 8000,
            }
        })

        const response = await result.response
        return response.text()
    } catch (e: any) {
        console.error(`[Gemini] Exception:`, e)
        throw new Error(`Gemini API Error: ${e.message}`)
    }
}

/**
 * Analyze competitors to find content gaps and patterns
 */
export async function analyzeCompetitors(
    keyword: string,
    competitors: CompetitorData[],
    brandContext?: any
) {
    const prompt = `
  Analyze the following top ranking articles for the keyword: "${keyword}".
  
  Competitors Data:
  ${JSON.stringify(competitors.map(c => ({ title: c.title, headings: c.headings })), null, 2)}

  Brand Context: ${JSON.stringify(brandContext || {})}

  Identify:
  1. Common themes and structure directly from the headings.
  2. Content gaps (what is missing?).
  3. Recommended word count range.
  4. User intent (Informational, Transactional, etc.).
  5. A winning outline structure that is better than all competitors.

  Return ONLY valid JSON directly without markdown formatting (start with { and end with }):
  {
    "userIntent": "string",
    "commonThemes": ["string"],
    "contentGaps": ["string"],
    "recommendedWordCount": "string",
    "recommendedOutline": {
      "title": "string",
      "headings": [
        { "level": 2, "text": "string", "desc": "string" }
      ]
    }
  }
  `

    try {
        const response = await callGemini(prompt, 0.4)
        // Clean markdown block if present
        const jsonStr = response.replace(/```json\n?|\n?```/g, '').trim()
        return JSON.parse(jsonStr)
    } catch (error) {
        console.error('Gemini Analysis Error:', error)
        // Fallback structure
        return {
            userIntent: 'Informational',
            commonThemes: ['Introduction', 'Benefits', 'How-to'],
            contentGaps: ['Detailed examples', 'Expert quotes'],
            recommendedWordCount: '1500-2000',
            recommendedOutline: {
                title: `Complete Guide to ${keyword}`,
                headings: [
                    { level: 2, text: 'Introduction', desc: 'Overview of the topic' },
                    { level: 2, text: 'Main Benefits', desc: 'Why it matters' },
                    { level: 2, text: 'Step-by-Step Guide', desc: 'How to do it' },
                    { level: 2, text: 'Conclusion', desc: 'Summary' }
                ]
            }
        }
    }
}

/**
 * Generate Content Strategy
 */
export async function generateContentStrategy(
    keyword: string,
    researchBrief: any,
    brandContext?: any
) {
    const prompt = `
  Based on the research brief for "${keyword}", create a specific content strategy.
  
  Brief: ${JSON.stringify(researchBrief)}
  Brand: ${JSON.stringify(brandContext || {})}

  Provide a concise paragraph explaining the angle, tone, and unique selling proposition for this article.
  `

    try {
        return await callGemini(prompt, 0.7)
    } catch (e) {
        return `Focus on creating a comprehensive guide that addresses user intent for "${keyword}" better than competitors.`
    }
}

/**
 * Generate Full Article
 */
export async function generateArticle(params: {
    keyword: string
    researchBrief: any
    contentStrategy: string
    brandContext?: any
}) {
    const { keyword, researchBrief, contentStrategy, brandContext } = params

    const prompt = `
  You are an expert SEO Content Writer. Write a comprehensive, high-ranking article for the keyword: "${keyword}".

  ## Context
  - **Tone of Voice**: ${brandContext?.toneOfVoice || 'Professional, Authoritative'}
  - **Brand Values**: ${brandContext?.coreValues?.join(', ') || 'N/A'}
  - **Article Template**: ${brandContext?.articleTemplate || 'Standard SEO Structure'}
  - **Internal Links to Insert**: ${JSON.stringify(brandContext?.internalLinks || [])}

  ## Research & Strategy
  - **User Intent**: ${researchBrief.userIntent}
  - **Content Strategy**: ${contentStrategy}
  - **Target Word Count**: ${researchBrief.recommendedWordCount}

  ## Outline (Strictly Follow This Structure)
  Title: ${researchBrief.recommendedOutline.title}
  ${researchBrief.recommendedOutline.headings.map((h: any) => `${'#'.repeat(h.level)} ${h.text}: ${h.desc}`).join('\n')}

  ## Writing Instructions
  1. Write in Vietnamese (Tiếng Việt).
  2. Use Markdown formatting (H1, H2, H3, bold, lists).
  3. Make it engaging, easy to read, and comprehensive.
  4. Naturally weave in the provided internal links where appropriate (use [text](url)).
  5. Optimize for SEO but write for humans first.
  6. Structure your response EXACTLY as follows:

  [ARTICLE]
  (Start with H1 Title and full article content here)

  [SUMMARY]
  (Write a 2-3 sentence summary of the article here)

  [META]
  Meta Title: (Best SEO Title)
  Meta Description: (Compelling Meta Description under 160 chars)
  URL Slug: (SEO friendly slug)

  [SCHEMA]
  (Insert valid JSON-LD schema wrapped in \`\`\`json ... \`\`\` here)

  Do NOT include any preamble or "Here is your article" text.
  `

    try {
        return await callGemini(prompt, 0.7)
    } catch (error) {
        console.error('Article Generation Error:', error)
        return `# Error Generating Content\n\n${error instanceof Error ? error.message : 'Unknown error'}`
    }
}

/**
 * Generate Meta Title
 */
export async function generateMetaTitle(title: string, keyword: string) {
    const prompt = `Generate 3 SEO optimized meta titles for "${title}" targeting keyword "${keyword}". 
  Keep under 60 characters. Return only the best one.`

    try {
        const text = await callGemini(prompt, 0.5)
        return text.trim().replace(/^"|"$/g, '')
    } catch (e) {
        return title
    }
}

/**
 * Generate Meta Description
 */
export async function generateMetaDescription(title: string, keyword: string, content: string) {
    const prompt = `Generate a compelling meta description for an article titled "${title}" about "${keyword}".
  Summary: ${content.substring(0, 500)}...
  Keep under 160 characters. Return only the description.`

    try {
        const text = await callGemini(prompt, 0.5)
        return text.trim().replace(/^"|"$/g, '')
    } catch (e) {
        return `Comprehensive guide about ${keyword}.`
    }
}

/**
 * Analyze article readability and quality
 */
export async function analyzeReadability(content: string) {
    const prompt = `
  Analyze the readability and quality of the following Vietnamese article content.
  
  Content:
  ${content.substring(0, 5000)}

  Evaluate based on:
  1. Score (0-100).
  2. Reading ease (Easy/Medium/Hard).
  3. Suggestions for improvement.

  Return JSON: { "score": number, "readingEase": "string", "suggestions": ["string"] }
  `

    try {
        const text = await callGemini(prompt, 0.2)
        const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim()
        return JSON.parse(jsonStr)
    } catch (e) {
        return { score: 70, readingEase: 'Medium', suggestions: ['Check formatting'] }
    }
}
