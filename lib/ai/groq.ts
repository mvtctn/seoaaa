// Groq AI Integration
// https://console.groq.com/
import { logger } from '@/lib/logger'

const apiKey = process.env.GROQ_API_KEY || ''
const BASE_URL = 'https://api.groq.com/openai/v1'

export interface CompetitorData {
    url: string
    title: string
    content: string
    wordCount: number
    headings: string[]
}

/**
 * Call Groq API (OpenAI-compatible)
 */
async function callGroq(prompt: string, temperature: number = 0.7): Promise<{ content: string, usage: { input_tokens: number, output_tokens: number } }> {
    if (!apiKey) {
        logger.error('[Groq] ERROR: No API key found in process.env.GROQ_API_KEY')
        throw new Error('Missing Groq API Key')
    }

    try {
        const url = `${BASE_URL}/chat/completions`
        const model = 'llama-3.3-70b-versatile'

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey.trim()}`
            },
            body: JSON.stringify({
                model: model,
                messages: [{
                    role: 'user',
                    content: prompt
                }],
                temperature,
                max_tokens: 8000
            })
        })

        if (response.ok) {
            const data = await response.json()
            return {
                content: data.choices[0].message.content,
                usage: {
                    input_tokens: data.usage?.prompt_tokens || 0,
                    output_tokens: data.usage?.completion_tokens || 0
                }
            }
        }

        // Error handling
        const errorText = await response.text()
        logger.error(`[Groq] API Error:`, errorText.substring(0, 500))
        throw new Error(`Groq API Error: ${response.status} - ${errorText}`)

    } catch (e) {
        logger.error(`[Groq] Exception:`, e)
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
  Brand Name: ${brandContext?.name || 'Generic Brand'}

  Identify:
  1. Common themes and structure directly from the headings.
  2. Content gaps (what is missing?).
  3. Recommended word count range.
  4. User intent (Informational, Transactional, etc.).
  5. **Semantic Entities**: Key subject entities (people, places, concepts) important for this topic.
  6. **LSI Keywords**: Latent Semantic Indexing keywords and related terms.
  7. A winning outline structure that is better than all competitors.

  Return ONLY valid JSON directly without markdown formatting (start with { and end with }):
  {
    "userIntent": "string",
    "commonThemes": ["string"],
    "contentGaps": ["string"],
    "recommendedWordCount": "string",
    "entities": ["string"],
    "lsiKeywords": ["string"],
    "recommendedOutline": {
      "title": "string",
      "headings": [
        { "level": 2, "text": "string", "desc": "string" }
      ]
    }
  }
  `

    try {
        const result = await callGroq(prompt, 0.5)
        return {
            ...JSON.parse(cleanJsonString(result.content)),
            usage: result.usage
        }
    } catch (error) {
        logger.error('Groq Analysis Error:', error)
        return {
            ...mockAnalysis(),
            usage: { input_tokens: 0, output_tokens: 0 }
        }
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

  Brand Name: ${brandContext?.name || 'Professional'}
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
        const result = await callGroq(prompt, 0.7)
        return result.content
    } catch (error) {
        console.error('Strategy Error:', error)
        return "Failed to generate strategy."
    }
}

/**
 * Generate full article content using Groq
 */
export async function generateArticle(params: {
    keyword: string
    researchBrief: any
    contentStrategy: string
    brandContext?: any
    options?: any
}) {
    const { keyword, researchBrief, contentStrategy, brandContext, options } = params
    const { articleType, tone, audience, language, length, focusKeywords } = options || {}

    const typePrompts: any = {
        expert_guide: 'Write as a subject matter expert providing deep, technical, yet accessible insights. Focus on being the ultimate search result.',
        pillar: 'Write a comprehensive pillar page that covers every aspect of the topic in detail, intended for long-term SEO authority.',
        news: 'Write in a journalistic style, focusing on current trends, timeliness, and fast-paced delivery.',
        review: 'Write a balanced, analytical review or comparison with clear pros/cons and data-driven evaluations.'
    }

    const prompt = `
  You are an expert SEO Content Writer. Write a comprehensive, high-ranking article for the keyword: "${keyword}".
  Target Language: ${language === 'en' ? 'English (US)' : 'Vietnamese (Tiếng Việt)'}
  Target Word Count: ${length || '1500'} words.
  
  ## Article Type: ${articleType || 'Standard'}
  ${typePrompts[articleType] || ''}

  ## Context
  - **Brand Name**: ${brandContext?.name || 'N/A'}
  - **Tone of Voice**: ${tone || brandContext?.toneOfVoice || 'Professional, Authoritative'}
  - **Target Audience**: ${audience || 'General'}
  - **Focus Keywords**: ${focusKeywords || 'N/A'}
  - **Brand Values**: ${brandContext?.coreValues?.join(', ') || 'N/A'}
  - **Article Template**: ${brandContext?.articleTemplate || 'Standard SEO Structure'}
  - **Internal Links to Insert**: ${JSON.stringify(brandContext?.internalLinks || [])}

  ## Research & Strategy
  - **User Intent**: ${researchBrief.userIntent}
  - **Content Strategy**: ${contentStrategy}
  - **Semantic Entities to Cover**: ${researchBrief.entities?.join(', ') || 'N/A'}
  - **LSI Keywords to Include**: ${researchBrief.lsiKeywords?.join(', ') || 'N/A'}

  ## Outline (Strictly Follow This Structure)
  Title: ${researchBrief.recommendedOutline.title}
  ${researchBrief.recommendedOutline.headings.map((h: any) => `${'#'.repeat(h.level)} ${h.text}: ${h.desc}`).join('\n')}

  ## Writing Instructions
  1. Write in ${language === 'en' ? 'English (US)' : 'Vietnamese (Tiếng Việt)'}.
  2. Use Markdown formatting (H1, H2, H3, bold, lists).
  3. Make it engaging, easy to read, and comprehensive.
  4. Naturally weave in the provided internal links where appropriate (use [text](url)).
  5. Optimize for SEO (including Focus Keywords) but write for humans first.
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
        const result = await callGroq(prompt, 0.7)
        return {
            content: result.content,
            usage: result.usage
        }
    } catch (error) {
        console.error('Article Generation Error:', error)
        return {
            content: `# Error Generating Content\n\n${error instanceof Error ? error.message : 'Unknown error'}`,
            usage: { input_tokens: 0, output_tokens: 0 }
        }
    }
}

/**
 * Generate Meta Title
 */
export async function generateMetaTitle(title: string, keyword: string) {
    const prompt = `Generate 3 SEO optimized meta titles for "${title}" targeting keyword "${keyword}". 
  Keep under 60 characters. Return only the best one.`

    try {
        const result = await callGroq(prompt, 0.5)
        return result.content.trim().replace(/^"|"$/g, '')
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
        const result = await callGroq(prompt, 0.5)
        return result.content.trim().replace(/^"|"$/g, '')
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
  2. Tone of voice (Friendly, Formal, etc.).
  3. Reading level (Basic, Intermediate, Advanced).
  4. 3 specific suggestions for improvement.

  Return ONLY valid JSON directly without markdown formatting:
  {
    "score": number,
    "tone": "string",
    "level": "string",
    "suggestions": ["string"]
  }
  `

    try {
        const result = await callGroq(prompt, 0.3)
        return {
            ...JSON.parse(cleanJsonString(result.content)),
            usage: result.usage
        }
    } catch (error) {
        console.error('Readability Error:', error)
        return {
            score: 70,
            tone: "N/A",
            level: "N/A",
            suggestions: ["Không thể phân tích độ dễ đọc vào lúc này."],
            usage: { input_tokens: 0, output_tokens: 0 }
        }
    }
}

// Helper to clean JSON string from Markdown code blocks
function cleanJsonString(text: string) {
    // If it contains a code block, extract only the content of the block
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
    if (match) {
        return match[1].trim()
    }

    // Fallback: remove markdown symbols and trim
    return text.replace(/```json\n?|```\n?|```/gi, '').trim()
}

// Mock data integration
function mockAnalysis() {
    return {
        userIntent: "Informational",
        commonThemes: ["Basic Concepts", "Benefits", "How-to Guide"],
        contentGaps: ["Detailed Case Studies", "Expert Opinions"],
        recommendedWordCount: "1500-2000",
        entities: ["Khái niệm chính", "Xu hướng thị trường"],
        lsiKeywords: ["hướng dẫn chi tiết", "lợi ích thực tế"],
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
