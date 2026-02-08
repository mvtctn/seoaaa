import { NextRequest, NextResponse } from 'next/server'
import { getAIUsageLogs, getAISetting, updateAISetting } from '@/lib/db/database'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
    try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const logs = await getAIUsageLogs(100, user.id)
        const priority = await getAISetting('model_priority', user.id)

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
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { key, value } = await req.json()
        if (!key) return NextResponse.json({ error: 'Key is required' }, { status: 400 })

        await updateAISetting(key, value, user.id)

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
