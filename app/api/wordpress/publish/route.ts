
import { NextRequest, NextResponse } from 'next/server'
import { getArticleById, getBrandById } from '@/lib/db/database'
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

        // 3. Handle Featured Image (Optional but recommended)
        let featuredMediaId: number | undefined = undefined
        if (article.thumbnail_url) {
            try {
                featuredMediaId = await uploadImageToWordPress(wpConfig, article.thumbnail_url, article.title)
            } catch (imgError) {
                console.error('[WordPress] Failed to upload featured image:', imgError)
            }
        }

        // 4. Publish
        const postData = {
            title: article.title,
            content: article.content, // This is Markdown, WP might need conversion or a plugin that handles MD. 
            // Default WP REST API expects HTML. 
            // Let's convert MD to HTML if needed.
            status: status as any,
            slug: article.slug,
            featured_media: featuredMediaId
        }

        // Optional: Convert Markdown to HTML for better WP compatibility
        // WP REST API really wants HTML.
        const MarkdownIt = require('markdown-it')
        const md = new MarkdownIt()
        postData.content = md.render(article.content)

        const result = await publishToWordPress(wpConfig, postData)

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
