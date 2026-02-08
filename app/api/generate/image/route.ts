import { NextRequest, NextResponse } from 'next/server'
import { generateImage, generateImagePrompt } from '@/lib/ai/image'
import { updateArticleImage } from '@/lib/db/database'
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

        const { articleId, title, keyword, prompt: customPrompt, saveToDb = true } = await req.json()

        // 1. Create a prompt (if not provided)
        let finalPrompt = customPrompt
        if (!finalPrompt) {
            if (!title) return NextResponse.json({ error: 'Missing title for auto-prompt' }, { status: 400 })
            finalPrompt = await generateImagePrompt(title, keyword)
        }

        // 2. Generate Image URL
        logger.info(`Generating image with prompt: ${finalPrompt}`)
        const imageUrl = await generateImage(finalPrompt)

        // 3. Update Article in DB (optional)
        if (articleId && saveToDb) {
            await updateArticleImage(articleId, user.id, imageUrl)
        }

        return NextResponse.json({
            success: true,
            data: {
                imageUrl,
                prompt: finalPrompt
            }
        })

    } catch (error: any) {
        return handleApiError(error, 'GenerateImage')
    }
}
