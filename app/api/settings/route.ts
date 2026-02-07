
import { NextRequest, NextResponse } from 'next/server'
import { getSetting, updateSetting } from '@/lib/db/database'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const key = searchParams.get('key')

        if (!key) {
            return NextResponse.json({ error: 'Missing key' }, { status: 400 })
        }

        const value = await getSetting(key)
        return NextResponse.json({ value })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const { key, value } = await req.json()

        if (!key) {
            return NextResponse.json({ error: 'Missing key' }, { status: 400 })
        }

        await updateSetting(key, value)
        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('[API Settings Error]:', error)
        return NextResponse.json({
            error: error.message || 'Failed to update setting',
            details: error.details || error.hint || undefined
        }, { status: 500 })
    }
}
