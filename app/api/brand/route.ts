import { NextRequest, NextResponse } from 'next/server'
import { createBrand, getBrandById, updateBrand, getAllBrands } from '@/lib/db/database'

export async function GET() {
    try {
        console.log('[API Brand] Fetching brand settings...')
        const brands = getAllBrands()
        console.log('[API Brand] Found brands:', brands.length)

        if (brands.length === 0) {
            return NextResponse.json({ brand: null })
        }

        const brand = brands[0]

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

        // Parse JSON fields
        const parsedBrand = {
            ...brand,
            core_values: parseJSON(brand.core_values, []),
            tone_of_voice: parseJSON(brand.tone_of_voice, ''),
            internal_links: parseJSON(brand.internal_links, [])
        }

        console.log('[API Brand] Returning brand:', parsedBrand.name)

        return NextResponse.json({
            brand: parsedBrand
        })
    } catch (error) {
        console.error('[API Brand] Error fetching brand:', error)
        return NextResponse.json(
            { error: 'Failed to fetch brand settings' },
            { status: 500 }
        )
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        console.log('[API Brand] Saving brand settings:', body.name)

        const { name, core_values, tone_of_voice, article_template, internal_links } = body

        // Check if a brand already exists
        const brands = getAllBrands()
        console.log('[API Brand] Existing brands count:', brands.length)

        let result
        if (brands.length > 0) {
            // Update existing
            const id = brands[0].id
            console.log('[API Brand] Updating brand ID:', id)

            result = updateBrand(Number(id), {
                name,
                core_values: JSON.stringify(core_values),
                tone_of_voice: JSON.stringify(tone_of_voice),
                article_template,
                internal_links: JSON.stringify(internal_links)
            })
            console.log('[API Brand] Update result:', result)
        } else {
            // Create new
            console.log('[API Brand] Creating new brand')
            result = createBrand({
                name,
                core_values: JSON.stringify(core_values),
                tone_of_voice: JSON.stringify(tone_of_voice),
                article_template,
                internal_links: JSON.stringify(internal_links)
            })
            console.log('[API Brand] Create result:', result)
        }

        return NextResponse.json({ success: true, result })
    } catch (error) {
        console.error('[API Brand] Error saving brand:', error)
        return NextResponse.json(
            { error: 'Failed to save brand settings' },
            { status: 500 }
        )
    }
}
