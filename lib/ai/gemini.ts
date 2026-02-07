import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export interface CompetitorData {
    url: string
    title: string
    content: string
    wordCount: number
    headings: string[]
}

export interface ResearchBrief {
    commonThemes: string[]
    contentGaps: string[]
    strategicPositioning: string
    recommendedOutline: {
        title: string
        sections: Array<{
            heading: string
            subheadings: string[]
            keyPoints: string[]
        }>
    }
    targetWordCount: number
    keyTopics: string[]
}

/**
 * Analyze competitor content and generate research brief using Gemini
 */
export async function analyzeCompetitors(
    keyword: string,
    competitors: CompetitorData[],
    brandContext?: {
        name: string
        coreValues: string[]
        toneOfVoice: string
    }
): Promise<ResearchBrief> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

        const competitorSummary = competitors.map((comp, idx) => `
### Competitor ${idx + 1}: ${comp.title}
URL: ${comp.url}
Word Count: ${comp.wordCount}
Main Headings: ${comp.headings.slice(0, 10).join(', ')}
Content Preview: ${comp.content.substring(0, 500)}...
    `).join('\n')

        const prompt = `You are an expert SEO research analyst. Analyze the following competitor content for the keyword "${keyword}" and provide a comprehensive research brief.

${brandContext ? `
Brand Context:
- Name: ${brandContext.name}
- Core Values: ${brandContext.coreValues.join(', ')}
- Tone: ${brandContext.toneOfVoice}
` : ''}

Competitor Analysis:
${competitorSummary}

Provide a detailed JSON response with the following structure:
{
  "commonThemes": ["theme1", "theme2", ...],
  "contentGaps": ["gap1", "gap2", ...],
  "strategicPositioning": "how to position our content differently",
  "recommendedOutline": {
    "title": "Recommended article title",
    "sections": [
      {
        "heading": "H2 heading",
        "subheadings": ["H3 subheading 1", "H3 subheading 2"],
        "keyPoints": ["point1", "point2"]
      }
    ]
  },
  "targetWordCount": 2000,
  "keyTopics": ["topic1", "topic2", ...]
}

Focus on:
1. What ALL competitors are covering (common themes)
2. What NONE or FEW competitors are covering (content gaps - opportunities!)
3. How we can position our content uniquely
4. A comprehensive outline that covers everything competitors have PLUS fills the gaps
5. Recommended word count to be competitive

Return ONLY valid JSON, no markdown formatting.`

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        // Remove markdown code blocks if present
        const jsonText = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()

        const brief: ResearchBrief = JSON.parse(jsonText)
        return brief
    } catch (error) {
        console.error('Error analyzing competitors:', error)
        throw new Error(`Failed to analyze competitors: ${error}`)
    }
}

/**
 * Generate content strategy and positioning
 */
export async function generateContentStrategy(
    keyword: string,
    researchBrief: ResearchBrief,
    brandContext?: {
        name: string
        coreValues: string[]
        toneOfVoice: string
    }
): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

        const prompt = `You are a content strategist. Based on the research brief below, create a detailed content strategy and writing guidelines.

Keyword: ${keyword}

Research Brief:
- Common Themes: ${researchBrief.commonThemes.join(', ')}
- Content Gaps: ${researchBrief.contentGaps.join(', ')}
- Strategic Positioning: ${researchBrief.strategicPositioning}
- Target Word Count: ${researchBrief.targetWordCount}

${brandContext ? `
Brand Context:
- Name: ${brandContext.name}
- Core Values: ${brandContext.coreValues.join(', ')}
- Tone: ${brandContext.toneOfVoice}
` : ''}

Provide:
1. Content angle and unique value proposition
2. Key messages to emphasize
3. Topics to cover in detail
4. Topics to mention briefly
5. SEO best practices to follow
6. Call-to-action suggestions
7. Internal linking opportunities

Be specific and actionable.`

        const result = await model.generateContent(prompt)
        const response = await result.response
        return response.text()
    } catch (error) {
        console.error('Error generating content strategy:', error)
        throw new Error(`Failed to generate content strategy: ${error}`)
    }
}

/**
 * Generate meta title based on article content
 */
export async function generateMetaTitle(articleTitle: string, keyword: string): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

        const prompt = `Create an SEO-optimized meta title (max 60 characters) for an article.

Article Title: ${articleTitle}
Primary Keyword: ${keyword}

Requirements:
- Include the primary keyword naturally
- 50-60 characters
- Compelling and click-worthy
- Follow SEO best practices

Return ONLY the meta title, nothing else.`

        const result = await model.generateContent(prompt)
        const response = await result.response
        return response.text().trim()
    } catch (error) {
        console.error('Error generating meta title:', error)
        return articleTitle.substring(0, 60)
    }
}

/**
 * Generate meta description
 */
export async function generateMetaDescription(
    articleTitle: string,
    keyword: string,
    contentPreview: string
): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

        const prompt = `Create an SEO-optimized meta description (max 160 characters) for an article.

Article Title: ${articleTitle}
Primary Keyword: ${keyword}
Content Preview: ${contentPreview.substring(0, 300)}

Requirements:
- Include the primary keyword naturally
- 150-160 characters
- Compelling and informative
- Encourage clicks
- Follow SEO best practices

Return ONLY the meta description, nothing else.`

        const result = await model.generateContent(prompt)
        const response = await result.response
        return response.text().trim()
    } catch (error) {
        console.error('Error generating meta description:', error)
        return `Learn about ${keyword}. ${contentPreview.substring(0, 100)}...`
    }
}

/**
 * Generate image prompts for article sections
 */
export async function generateImagePrompts(
    articleOutline: ResearchBrief['recommendedOutline']
): Promise<Array<{ section: string; prompt: string }>> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

        const outlineText = articleOutline.sections.map(section =>
            `- ${section.heading}: ${section.keyPoints.slice(0, 3).join(', ')}`
        ).join('\n')

        const prompt = `Generate image prompts for a blog article with the following outline:

Title: ${articleOutline.title}

Sections:
${outlineText}

For each section, create a concise image generation prompt that:
- Describes a professional, modern illustration or graphic
- Relates to the section content
- Is suitable for a blog article
- Avoids text in the image
- Is clean and informative

Return a JSON array in this format:
[
  {
    "section": "Section heading",
    "prompt": "Image generation prompt"
  }
]

Return ONLY valid JSON, no markdown formatting.`

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        const jsonText = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
        return JSON.parse(jsonText)
    } catch (error) {
        console.error('Error generating image prompts:', error)
        return []
    }
}
