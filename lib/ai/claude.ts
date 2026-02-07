import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export interface ArticleGenerationParams {
    keyword: string
    researchBrief: any // ResearchBrief from gemini.ts
    contentStrategy: string
    brandContext?: {
        name: string
        coreValues: string[]
        toneOfVoice: string
        articleTemplate?: string
        internalLinks?: Array<{ text: string; url: string }>
    }
}

/**
 * Generate full article using Claude
 */
export async function generateArticle(params: ArticleGenerationParams): Promise<string> {
    try {
        const {
            keyword,
            researchBrief,
            contentStrategy,
            brandContext
        } = params

        const outlineText = researchBrief.recommendedOutline.sections
            .map((section: any) => `
## ${section.heading}
${section.subheadings.map((sub: string) => `### ${sub}`).join('\n')}
Key points to cover: ${section.keyPoints.join(', ')}
      `).join('\n')

        const internalLinksText = brandContext?.internalLinks
            ? `\nInternal Links to Include (naturally within content):\n${brandContext.internalLinks.map((link: any) => `- ${link.text}: ${link.url}`).join('\n')}`
            : ''

        const templateText = brandContext?.articleTemplate
            ? `\nArticle Template to Follow:\n${brandContext.articleTemplate}`
            : ''

        const prompt = `You are a professional SEO content writer. Write a comprehensive, high-quality article based on the following guidelines.

PRIMARY KEYWORD: ${keyword}

BRAND CONTEXT:
${brandContext ? `
- Brand Name: ${brandContext.name}
- Core Values: ${brandContext.coreValues.join(', ')}
- Tone of Voice: ${brandContext.toneOfVoice}
${templateText}
${internalLinksText}
` : 'Write in a professional, informative tone.'}

CONTENT STRATEGY:
${contentStrategy}

RECOMMENDED OUTLINE:
${outlineText}

TARGET WORD COUNT: ${researchBrief.targetWordCount} words

REQUIREMENTS:
1. Write in Markdown format
2. Use proper heading hierarchy (H1 for title, H2 for main sections, H3 for subsections)
3. Include the primary keyword naturally throughout the content
4. Make the content engaging, valuable, and easy to read
5. Use examples, statistics, or case studies where relevant
6. Include a compelling introduction that hooks the reader
7. Add a strong conclusion with key takeaways
8. If internal links are provided, naturally incorporate them in relevant sections
9. Use bullet points and numbered lists for better readability
10. Ensure the content is original and provides unique value

ADDITIONAL INSTRUCTIONS:
- Write in Vietnamese language
- Focus on providing actionable insights
- Make complex topics easy to understand
- Use transition words for better flow
- Include relevant subheadings to break up content
- Ensure each section is comprehensive and valuable

Begin with the H1 title and write the complete article in Markdown format. Do not include any preamble or explanation, just the article content.
`

        const message = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 8192,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
        })

        const content = message.content[0]
        if (content.type === 'text') {
            return content.text
        }

        throw new Error('Unexpected response format from Claude')
    } catch (error) {
        console.error('Error generating article:', error)
        throw new Error(`Failed to generate article: ${error}`)
    }
}

/**
 * Rewrite existing article with improvements
 */
export async function rewriteArticle(
    originalContent: string,
    improvementSuggestions: string,
    brandContext?: ArticleGenerationParams['brandContext']
): Promise<string> {
    try {
        const prompt = `You are a professional content editor. Rewrite and improve the following article based on the suggestions provided.

ORIGINAL ARTICLE:
${originalContent}

IMPROVEMENT SUGGESTIONS:
${improvementSuggestions}

${brandContext ? `
BRAND CONTEXT:
- Brand Name: ${brandContext.name}
- Core Values: ${brandContext.coreValues.join(', ')}
- Tone of Voice: ${brandContext.toneOfVoice}
` : ''}

REQUIREMENTS:
1. Maintain the core message and structure
2. Improve clarity, flow, and readability
3. Add more value where gaps are identified
4. Ensure SEO optimization
5. Keep the same markdown format
6. Preserve any existing internal links
7. Make the content more engaging

Write in Vietnamese language. Return ONLY the improved article in Markdown format, no preamble.`

        const message = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 8192,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
        })

        const content = message.content[0]
        if (content.type === 'text') {
            return content.text
        }

        throw new Error('Unexpected response format from Claude')
    } catch (error) {
        console.error('Error rewriting article:', error)
        throw new Error(`Failed to rewrite article: ${error}`)
    }
}

/**
 * Generate LinkedIn post from article
 */
export async function generateLinkedInPost(articleContent: string, articleTitle: string): Promise<string> {
    try {
        const prompt = `Convert this blog article into an engaging LinkedIn post.

Article Title: ${articleTitle}

Article Content:
${articleContent.substring(0, 2000)}

Requirements:
- 150-300 words
- Hook in the first sentence
- 3-5 key takeaways with bullet points or emojis
- Professional yet conversational tone
- Call-to-action at the end
- Include relevant hashtags (3-5)
- Make it shareable and engaging

Write in Vietnamese. Return ONLY the LinkedIn post, no explanation.`

        const message = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1024,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
        })

        const content = message.content[0]
        if (content.type === 'text') {
            return content.text
        }

        throw new Error('Unexpected response format from Claude')
    } catch (error) {
        console.error('Error generating LinkedIn post:', error)
        throw new Error(`Failed to generate LinkedIn post: ${error}`)
    }
}

/**
 * Generate Twitter/X thread from article
 */
export async function generateTwitterThread(articleContent: string, articleTitle: string): Promise<string[]> {
    try {
        const prompt = `Convert this blog article into a Twitter/X thread.

Article Title: ${articleTitle}

Article Content:
${articleContent.substring(0, 2000)}

Requirements:
- 5-10 tweets
- First tweet: Hook that grabs attention
- Middle tweets: Key insights and takeaways
- Last tweet: CTA or conclusion
- Each tweet max 280 characters
- Use emojis strategically
- Use thread numbers (1/, 2/, etc.)
- Make each tweet valuable on its own

Write in Vietnamese. Return as a JSON array of tweet strings.
Format: ["tweet 1", "tweet 2", ...]

Return ONLY valid JSON, no markdown formatting.`

        const message = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 2048,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
        })

        const content = message.content[0]
        if (content.type === 'text') {
            const text = content.text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
            return JSON.parse(text)
        }

        throw new Error('Unexpected response format from Claude')
    } catch (error) {
        console.error('Error generating Twitter thread:', error)
        throw new Error(`Failed to generate Twitter thread: ${error}`)
    }
}
