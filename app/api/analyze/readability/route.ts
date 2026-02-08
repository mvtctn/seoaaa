import { NextRequest, NextResponse } from 'next/server'
import { AIOrchestrator } from '@/lib/ai/orchestrator'
import { getDefaultBrand } from '@/lib/db/database'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
    try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { content } = await req.json()

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 })
        }

        const brand = await getDefaultBrand(user.id)
        const brandContext = brand ? { id: brand.id } : undefined

        const report = await AIOrchestrator.analyzeReadability(content, brandContext, user.id)

        return NextResponse.json({
            success: true,
            data: report
        })
    } catch (error: any) {
        console.error('Readability API Error:', error)
        return NextResponse.json({ error: error.message || 'Analysis failed' }, { status: 500 })
    }
}
