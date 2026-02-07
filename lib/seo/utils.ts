import slugify from 'slugify'

/**
 * Generate URL-friendly slug from title
 */
export function generateSlug(title: string): string {
    return slugify(title, {
        lower: true,
        strict: true,
        locale: 'vi',
    })
}

/**
 * Calculate reading time based on word count
 */
export function calculateReadingTime(content: string): number {
    const wordsPerMinute = 200
    const wordCount = content.split(/\s+/).length
    return Math.ceil(wordCount / wordsPerMinute)
}

/**
 * Extract headings from markdown content
 */
export function extractHeadings(markdown: string): Array<{ level: number; text: string }> {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm
    const headings: Array<{ level: number; text: string }> = []

    let match
    while ((match = headingRegex.exec(markdown)) !== null) {
        headings.push({
            level: match[1].length,
            text: match[2].trim()
        })
    }

    return headings
}

/**
 * Generate table of contents from headings
 */
export function generateTableOfContents(markdown: string): string {
    const headings = extractHeadings(markdown)

    if (headings.length === 0) return ''

    let toc = '## Mục Lục\n\n'

    headings.forEach((heading) => {
        // Skip H1 (title)
        if (heading.level === 1) return

        const indent = '  '.repeat(heading.level - 2)
        const anchor = generateSlug(heading.text)
        toc += `${indent}- [${heading.text}](#${anchor})\n`
    })

    return toc + '\n'
}

/**
 * Count words in content
 */
export function countWords(content: string): number {
    // Remove markdown syntax for more accurate count
    const plainText = content
        .replace(/#{1,6}\s+/g, '') // Remove heading markers
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
        .replace(/[*_~`]/g, '') // Remove formatting markers
        .replace(/\n/g, ' ') // Replace newlines with spaces
        .trim()

    return plainText.split(/\s+/).filter(word => word.length > 0).length
}

/**
 * Extract keywords from content (simple version)
 */
export function extractKeywords(content: string, limit: number = 10): string[] {
    const plainText = content
        .toLowerCase()
        .replace(/[^a-zà-ỹ0-9\s]/gi, ' ')
        .replace(/\s+/g, ' ')

    const words = plainText.split(' ')
    const wordFreq: Record<string, number> = {}

    // Stop words (Vietnamese common words to ignore)
    const stopWords = new Set([
        'và', 'của', 'là', 'có', 'được', 'trong', 'cho', 'với', 'một', 'các',
        'để', 'này', 'như', 'từ', 'trên', 'về', 'khi', 'hay', 'những', 'nhưng',
        'vì', 'do', 'đã', 'sẽ', 'đang', 'đến', 'được', 'nếu', 'hoặc', 'mà',
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'be', 'been'
    ])

    words.forEach(word => {
        if (word.length > 3 && !stopWords.has(word)) {
            wordFreq[word] = (wordFreq[word] || 0) + 1
        }
    })

    // Sort by frequency and get top keywords
    return Object.entries(wordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(entry => entry[0])
}

/**
 * Optimize meta title for SEO
 */
export function optimizeMetaTitle(title: string, keyword: string): string {
    // Ensure keyword is in title
    if (!title.toLowerCase().includes(keyword.toLowerCase())) {
        title = `${keyword} - ${title}`
    }

    // Truncate if too long
    if (title.length > 60) {
        title = title.substring(0, 57) + '...'
    }

    return title
}

/**
 * Optimize meta description for SEO
 */
export function optimizeMetaDescription(description: string, keyword: string): string {
    // Ensure keyword is in description
    if (!description.toLowerCase().includes(keyword.toLowerCase())) {
        description = `${keyword}: ${description}`
    }

    // Truncate if too long
    if (description.length > 160) {
        description = description.substring(0, 157) + '...'
    }

    return description
}

/**
 * Add internal links to content
 */
export function addInternalLinks(
    content: string,
    links: Array<{ text: string; url: string; keywords: string[] }>
): string {
    let modifiedContent = content

    links.forEach(link => {
        link.keywords.forEach(keyword => {
            // Find first occurrence of keyword (case-insensitive) that's not already a link
            const regex = new RegExp(`(?<!\\[)\\b${keyword}\\b(?!\\])`, 'i')
            const match = modifiedContent.match(regex)

            if (match) {
                const replacement = `[${match[0]}](${link.url})`
                modifiedContent = modifiedContent.replace(match[0], replacement)
            }
        })
    })

    return modifiedContent
}

/**
 * Validate SEO metadata
 */
export function validateSEOMetadata(metadata: {
    title: string
    description: string
    keyword: string
}): { valid: boolean; warnings: string[] } {
    const warnings: string[] = []

    // Title checks
    if (metadata.title.length < 30) {
        warnings.push('Meta title quá ngắn (nên 50-60 ký tự)')
    }
    if (metadata.title.length > 60) {
        warnings.push('Meta title quá dài (nên 50-60 ký tự)')
    }
    if (!metadata.title.toLowerCase().includes(metadata.keyword.toLowerCase())) {
        warnings.push('Meta title không chứa từ khóa chính')
    }

    // Description checks
    if (metadata.description.length < 120) {
        warnings.push('Meta description quá ngắn (nên 150-160 ký tự)')
    }
    if (metadata.description.length > 160) {
        warnings.push('Meta description quá dài (nên 150-160 ký tự)')
    }
    if (!metadata.description.toLowerCase().includes(metadata.keyword.toLowerCase())) {
        warnings.push('Meta description không chứa từ khóa chính')
    }

    return {
        valid: warnings.length === 0,
        warnings
    }
}

/**
 * Calculate keyword density
 */
export function calculateKeywordDensity(content: string, keyword: string): number {
    const totalWords = countWords(content)
    const keywordRegex = new RegExp(keyword.replace(/\s+/g, '\\s+'), 'gi')
    const keywordOccurrences = (content.match(keywordRegex) || []).length

    return totalWords > 0 ? (keywordOccurrences / totalWords) * 100 : 0
}

/**
 * Generate schema.org Article markup
 */
export function generateArticleSchema(article: {
    title: string
    description: string
    content: string
    author?: string
    publishDate: Date
    modifiedDate?: Date
    imageUrl?: string
    url: string
}): object {
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.description,
        image: article.imageUrl || '',
        datePublished: article.publishDate.toISOString(),
        dateModified: (article.modifiedDate || article.publishDate).toISOString(),
        author: {
            '@type': 'Person',
            name: article.author || 'SEO Content Engine'
        },
        publisher: {
            '@type': 'Organization',
            name: 'SEO Content Engine',
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': article.url
        },
        wordCount: countWords(article.content)
    }
}
