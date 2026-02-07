
import { NextRequest, NextResponse } from 'next/server'
import { getArticleById, getBrandById, updateArticle } from '@/lib/db/database'
import { publishToWordPress, uploadImageToWordPress } from '@/lib/wordpress/client'

export async function POST(req: NextRequest) {
    try {
        const { articleId, status = 'draft' } = await req.json()

        if (!articleId) {
            return NextResponse.json({ error: 'Article ID is required' }, { status: 400 })
        }

        // 1. Get Article
        const article = await getArticleById(Number(articleId))
        if (!article) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 })
        }

        // 2. Get Brand for WP Credentials
        let brandId = article.brand_id
        console.log(`[WordPress] Initial brand_id from article: ${brandId}`)

        if (!brandId && article.keyword_id) {
            const { getKeywordById } = require('@/lib/db/database')
            const keyword = await getKeywordById(article.keyword_id)
            brandId = keyword?.brand_id
            console.log(`[WordPress] Found brand_id from keyword: ${brandId}`)
        }

        let brand = brandId ? await getBrandById(Number(brandId)) : null

        // Final fallback: use default brand if no brand found or if specific brand lacks WP config
        if (!brand || !brand.wp_url || !brand.wp_username || !brand.wp_password) {
            console.log('[WordPress] Specific brand missing or lacks WP config, trying default brand...')
            const { getDefaultBrand } = require('@/lib/db/database')
            const defaultBrand = await getDefaultBrand()
            if (defaultBrand) {
                brand = defaultBrand
                console.log(`[WordPress] Using default brand: ${brand.name}`)
            }
        }

        if (!brand || !brand.wp_url || !brand.wp_username || !brand.wp_password) {
            return NextResponse.json({
                error: 'Cấu hình WordPress bị thiếu. Vui lòng vào Quản Lý Thương Hiệu để thiết lập URL, Username và App Password cho thương hiệu này (hoặc thương hiệu mặc định).'
            }, { status: 400 })
        }

        const wpConfig = {
            url: brand.wp_url,
            username: brand.wp_username,
            applicationPassword: brand.wp_password
        }

        console.log(`[WordPress] Publishing article "${article.title}" to ${wpConfig.url}`)

        // 3. Extract Meta & Schema from content (Replicate frontend parser)
        const rawContent = article.content || ''
        let schema = ''
        let meta: any = {}
        let contentToWP = rawContent

        // Extract Schema
        if (rawContent.includes('[SCHEMA]')) {
            const parts = rawContent.split('[SCHEMA]')
            contentToWP = parts[0].trim()
            schema = parts[1].trim()
        } else {
            const jsonBlockRegex = /```json\s*(\{[\s\S]*?\})\s*```$/
            const match = rawContent.match(jsonBlockRegex)
            if (match) {
                schema = match[1]
                contentToWP = rawContent.replace(match[0], '').trim()
            }
        }
        schema = schema.replace(/```json\n?|\n?```/g, '').trim()

        // Extract Meta
        if (contentToWP.includes('[META]')) {
            const parts = contentToWP.split('[META]')
            const metaText = parts[1].trim()
            contentToWP = parts[0].trim()

            const metaLines = metaText.split('\n')
            metaLines.forEach((line: string) => {
                if (line.toLowerCase().includes('title:')) meta.title = line.split(':')[1]?.trim()
                if (line.toLowerCase().includes('description:')) meta.description = line.split(':')[1]?.trim()
            })
        }

        // Clean Summary markers
        if (contentToWP.includes('[SUMMARY]')) {
            contentToWP = contentToWP.split('[SUMMARY]')[0].trim()
        }
        contentToWP = contentToWP.replace('[ARTICLE]', '').trim()

        // 4. Handle Featured Image
        let featuredMediaId: number | undefined = undefined
        if (article.thumbnail_url) {
            try {
                featuredMediaId = await uploadImageToWordPress(wpConfig, article.thumbnail_url, article.title)
            } catch (imgError) {
                console.error('[WordPress] Failed to upload featured image:', imgError)
            }
        }

        // 5. Convert Markdown to HTML
        const MarkdownIt = require('markdown-it')
        const md = new MarkdownIt({ html: true })
        let htmlBody = md.render(contentToWP)

        // Append Schema if found
        if (schema) {
            htmlBody += `\n\n<script type="application/ld+json">\n${schema}\n</script>`
        }

        // 6. Construct Post Data
        const postData: any = {
            title: meta.title || article.meta_title || article.title,
            content: htmlBody,
            status: status as any,
            slug: article.slug,
            featured_media: featuredMediaId,
            excerpt: meta.description || article.meta_description || ''
        }

        // Add RankMath/Yoast meta if possible (as generic meta)
        postData.meta = {
            _yoast_wpseo_metadesc: postData.excerpt,
            rank_math_description: postData.excerpt,
            _yoast_wpseo_title: postData.title,
            rank_math_title: postData.title
        }

        // 7. Publish
        const result = await publishToWordPress(wpConfig, postData)

        // 8. Update article status in our DB
        try {
            await updateArticle(Number(articleId), {
                status: 'PUBLISHED',
                wp_post_url: result.link
            })
            console.log(`[WordPress] Article ${articleId} status updated to PUBLISHED with URL: ${result.link}`)
        } catch (dbError) {
            console.error('[WordPress] Failed to update article status:', dbError)
        }

        return NextResponse.json({
            success: true,
            message: 'Published successfully!',
            url: result.link
        })

    } catch (error: any) {
        console.error('[WordPress API] Error:', error)
        return NextResponse.json({ error: error.message || 'Failed to publish' }, { status: 500 })
    }
}
