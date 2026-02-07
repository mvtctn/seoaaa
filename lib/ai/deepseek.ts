// DeepSeek AI Integration (OpenAI-compatible API)
// https://platform.deepseek.com/

const apiKey = process.env.DEEPSEEK_API_KEY || ''
const BASE_URL = 'https://api.deepseek.com/v1'

export interface CompetitorData {
    url: string
    title: string
    content: string
    wordCount: number
    headings: string[]
}

/**
 * Call DeepSeek API (OpenAI-compatible format)
 */
async function callDeepSeek(prompt: string, temperature: number = 0.7): Promise<string> {
    if (!apiKey) {
        console.error('[DeepSeek] ERROR: No API key found in process.env.DEEPSEEK_API_KEY')
        throw new Error('Missing DeepSeek API Key')
    }

    console.log(`[DeepSeek] API Key loaded: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)} (length: ${apiKey.length})`)

    try {
        const url = `${BASE_URL}/chat/completions`
        console.log(`[DeepSeek] Calling: ${url}`)

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey.trim()}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat', // Main model
                messages: [{
                    role: 'user',
                    content: prompt
                }],
                temperature,
                max_tokens: 8000
            })
        })

        console.log(`[DeepSeek] Response status: ${response.status} ${response.statusText}`)

        if (response.ok) {
            const data = await response.json()
            console.log(`[DeepSeek] ✓ Success`)
            return data.choices[0].message.content
        }

        // Error handling
        const errorText = await response.text()
        console.error(`[DeepSeek] API Error:`, errorText.substring(0, 500))
        throw new Error(`DeepSeek API Error: ${response.status} - ${errorText}`)

    } catch (e) {
        console.error(`[DeepSeek] Exception:`, e)
        throw e
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

  Return ONLY valid JSON directly without markdown formatting:
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
        const text = await callDeepSeek(prompt, 0.5)
        return JSON.parse(cleanJsonString(text))
    } catch (error) {
        console.error('DeepSeek Analysis Error:', error)
        return mockAnalysis()
    }
}

/**
 * Generate a comprehensive content strategy
 */
export async function generateContentStrategy(
    keyword: string,
    researchData: any,
    brandContext?: any
) {
    const prompt = `
  Create a content strategy for "${keyword}" based on this research:
  ${JSON.stringify(researchData)}

  Brand Voice: ${brandContext?.toneOfVoice || 'Professional'}
  Core Values: ${brandContext?.coreValues?.join(', ') || 'N/A'}

  Define:
  1. The unique angle/hook.
  2. Target audience persona.
  3. Key takeaways for the reader.
  4. Call to Action (CTA).

  Output as a concise Markdown string.
  `

    try {
        return await callDeepSeek(prompt, 0.7)
    } catch (error) {
        console.error('Strategy Error:', error)
        return "Failed to generate strategy."
    }
}

/**
 * Generate full article content using DeepSeek
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
  6. Do NOT include any preamble or "Here is the article" text. Start directly with the H1 Title.

  WRITE THE FULL ARTICLE NOW.
  `

    try {
        return await callDeepSeek(prompt, 0.8)
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
        const text = await callDeepSeek(prompt, 0.5)
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
        const text = await callDeepSeek(prompt, 0.5)
        return text.trim().replace(/^"|"$/g, '')
    } catch (e) {
        return `Comprehensive guide about ${keyword}.`
    }
}

// Helper to clean JSON string from Markdown code blocks
function cleanJsonString(text: string) {
    return text.replace(/```json\n?|\n?```/g, '').trim()
}

// Mock data integration
function mockAnalysis() {
    return {
        userIntent: "Informational",
        commonThemes: ["Basic Concepts", "Benefits", "How-to Guide"],
        contentGaps: ["Detailed Case Studies", "Expert Opinions"],
        recommendedWordCount: "1500-2000",
        recommendedOutline: {
            title: "Comprehensive Guide (Mock Data)",
            headings: [
                { level: 2, text: "Giới thiệu", desc: "Mở đầu về chủ đề" },
                { level: 2, text: "Khái niệm chính", desc: "Định nghĩa cốt lõi" },
                { level: 2, text: "Kết luận", desc: "Tổng kết" }
            ]
        }
    }
}
