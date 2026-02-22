import { NextRequest, NextResponse } from 'next/server'
import { getArticleById, getBrandById, updateArticle, getDefaultBrand, getKeywordById } from '@/lib/db/database'
import { publishToWordPress, uploadImageToWordPress } from '@/lib/wordpress/client'
import { publishToCustomWebhook } from '@/lib/custom-integration/client'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { handleApiError } from '@/lib/api-error-handler'

export async function POST(req: NextRequest) {
    try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { articleId, status = 'publish' } = await req.json()

        if (!articleId) {
            return NextResponse.json({ error: 'Article ID is required' }, { status: 400 })
        }

        // 1. Get Article
        const article = await getArticleById(Number(articleId), user.id)
        if (!article) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 })
        }

        // 2. Get Brand for Credentials
        let brandId = article.brand_id
        if (!brandId && article.keyword_id) {
            const keyword = await getKeywordById(article.keyword_id, user.id)
            brandId = keyword?.brand_id
        }

        let brand = brandId ? await getBrandById(Number(brandId), user.id) : null

        // Final fallback: use default brand
        if (!brand || !brand.wp_url || !brand.wp_password) {
            const defaultBrand = await getDefaultBrand(user.id)
            if (defaultBrand) {
                brand = defaultBrand
            }
        }

        if (!brand || !brand.wp_url || !brand.wp_password) {
            return NextResponse.json({
                error: 'Cấu hình đăng bài bị thiếu (URL, API Code). Vui lòng kiểm tra Quản Lý Thương Hiệu.'
            }, { status: 400 })
        }

        // 3. Extract Meta & Schema from content (Frontend parser logic)
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

        // Convert MD to HTML only if needed (WP does it client side usually, but API needs HTML content usually)
        const MarkdownIt = require('markdown-it')
        const md = new MarkdownIt({ html: true })
        let htmlBody = md.render(contentToWP)

        let resultLink = null

        // --- BRANCHING LOGIC ---
        if (brand.wp_username === 'custom_webhook') {
            // CUSTOM INTEGRATION
            logger.info(`[Publishing] Custom Webhook to ${brand.wp_url}`)

            const payload = {
                title: meta.title || article.meta_title || article.title,
                content: htmlBody, // Sending rendered HTML
                slug: article.slug,
                excerpt: meta.description || article.meta_description,
                thumbnail_url: article.thumbnail_url,
                meta_title: meta.title || article.meta_title,
                meta_description: meta.description || article.meta_description,
                schema: schema ? JSON.parse(schema) : undefined,
                status: status || 'publish'
            }

            const result = await publishToCustomWebhook(brand.wp_url, brand.wp_password, payload as any)
            resultLink = result.link

        } else {
            // WORDPRESS INTEGRATION
            const wpConfig = {
                url: brand.wp_url,
                username: brand.wp_username, // Required for WP application password auth
                applicationPassword: brand.wp_password
            }

            logger.info(`[Publishing] WordPress Post to ${wpConfig.url}`)

            // Handle Image Upload
            let featuredMediaId: number | undefined = undefined
            if (article.thumbnail_url) {
                try {
                    featuredMediaId = await uploadImageToWordPress(wpConfig, article.thumbnail_url, article.title)
                } catch (imgError) {
                    logger.error('[WordPress] Failed to upload featured image:', imgError)
                }
            }

            if (schema) {
                htmlBody += `\n\n<script type="application/ld+json">\n${schema}\n</script>`
            }

            const postData: any = {
                title: meta.title || article.meta_title || article.title,
                content: htmlBody,
                status: status as any,
                slug: article.slug,
                featured_media: featuredMediaId,
                excerpt: meta.description || article.meta_description || ''
            }

            postData.meta = {
                _yoast_wpseo_metadesc: postData.excerpt,
                rank_math_description: postData.excerpt,
                _yoast_wpseo_title: postData.title,
                rank_math_title: postData.title
            }

            const result = await publishToWordPress(wpConfig, postData)
            resultLink = result.link
        }

        // 8. Update article status
        if (resultLink) {
            await updateArticle(Number(articleId), user.id, {
                status: 'PUBLISHED',
                wp_post_url: resultLink
            })
        }

        return NextResponse.json({
            success: true,
            message: 'Published successfully!',
            url: resultLink
        })

    } catch (error: any) {
        return handleApiError(error, 'PublishService')
    }
}
