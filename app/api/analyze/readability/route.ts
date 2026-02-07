import { NextRequest, NextResponse } from 'next/server'
import { analyzeReadability } from '@/lib/ai/groq'

export async function POST(req: NextRequest) {
    try {
        const { content } = await req.json()

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 })
        }

        const report = await analyzeReadability(content)

        return NextResponse.json({
            success: true,
            data: report
        })
    } catch (error: any) {
        console.error('Readability API Error:', error)
        return NextResponse.json({ error: error.message || 'Analysis failed' }, { status: 500 })
    }
}
