import { NextRequest, NextResponse } from 'next/server'
import { generateImage, generateImagePrompt } from '@/lib/ai/image'
import { updateArticleImage } from '@/lib/db/database' // We need to add this helper

export async function POST(req: NextRequest) {
    try {
        const { articleId, title, keyword, prompt: customPrompt, saveToDb = true } = await req.json()

        // 1. Create a prompt (if not provided)
        let finalPrompt = customPrompt
        if (!finalPrompt) {
            if (!title) return NextResponse.json({ error: 'Missing title for auto-prompt' }, { status: 400 })
            finalPrompt = await generateImagePrompt(title, keyword)
        }

        // 2. Generate Image URL
        console.log(`Generating image with prompt: ${finalPrompt}`)
        const imageUrl = await generateImage(finalPrompt)

        // 3. Update Article in DB (optional)
        if (articleId && saveToDb) {
            updateArticleImage(articleId, imageUrl)
        }

        return NextResponse.json({
            success: true,
            data: {
                imageUrl,
                prompt: finalPrompt
            }
        })

    } catch (error: any) {
        console.error('Image Gen Error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to generate image' },
            { status: 500 }
        )
    }
}
