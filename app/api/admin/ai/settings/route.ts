import { NextRequest, NextResponse } from 'next/server'
import { getAIUsageLogs, getAISetting, updateAISetting } from '@/lib/db/database'

export async function GET(req: NextRequest) {
    try {
        const logs = await getAIUsageLogs()
        const priority = await getAISetting('model_priority')

        return NextResponse.json({
            success: true,
            data: {
                logs: logs.slice(0, 100), // Last 100 logs
                priority: priority || ['groq', 'gemini', 'deepseek']
            }
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const { key, value } = await req.json()
        if (!key) return NextResponse.json({ error: 'Key is required' }, { status: 400 })

        await updateAISetting(key, value)

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
