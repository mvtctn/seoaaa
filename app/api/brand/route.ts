import { NextRequest, NextResponse } from 'next/server'
import { createBrand, updateBrand, getAllBrands, setDefaultBrand, deleteBrand } from '@/lib/db/database'

// Helper to safely parse JSON
const parseJSON = (str: any, fallback: any) => {
    if (typeof str !== 'string') return str || fallback
    try {
        return JSON.parse(str)
    } catch (e) {
        console.error('[API Brand] Parse error:', e)
        return fallback
    }
}

export async function GET() {
    try {
        const brands = await getAllBrands()

        const parsedBrands = brands.map((brand: any) => ({
            ...brand,
            core_values: parseJSON(brand.core_values, []),
            tone_of_voice: parseJSON(brand.tone_of_voice, {}),
            internal_links: parseJSON(brand.internal_links, [])
        }))

        return NextResponse.json({ brands: parsedBrands })
    } catch (error) {
        console.error('[API Brand] Error fetching brands:', error)
        return NextResponse.json({ error: 'Failed to fetch brand settings' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const {
            id,
            name,
            core_values,
            tone_of_voice,
            article_template,
            internal_links,
            is_default,
            wp_url,
            wp_username,
            wp_password
        } = body

        if (id) {
            await updateBrand(Number(id), {
                name,
                core_values: JSON.stringify(core_values),
                tone_of_voice: JSON.stringify(tone_of_voice),
                article_template,
                internal_links: JSON.stringify(internal_links),
                is_default: !!is_default,
                wp_url,
                wp_username,
                wp_password
            })
            return NextResponse.json({ success: true, message: 'Updated' })
        } else {
            const result = await createBrand({
                name,
                core_values: JSON.stringify(core_values),
                tone_of_voice: JSON.stringify(tone_of_voice),
                article_template,
                internal_links: JSON.stringify(internal_links),
                is_default: !!is_default,
                wp_url,
                wp_username,
                wp_password
            })
            return NextResponse.json({ success: true, message: 'Created', id: result.lastInsertRowid })
        }
    } catch (error: any) {
        console.error('[API Brand] Error saving brand:', error)
        return NextResponse.json({ error: error.message || 'Failed to save brand settings' }, { status: 500 })
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        const action = searchParams.get('action')

        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })

        if (action === 'set_default') {
            await setDefaultBrand(Number(id))
            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })

        await deleteBrand(Number(id))
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 })
    }
}
