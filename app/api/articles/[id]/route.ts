import { NextRequest, NextResponse } from 'next/server'
import { getArticleById, getKeywordById, getResearchByKeywordId, getResearchById, updateArticle, deleteArticle } from '@/lib/db/database'
import { createClient } from '@/lib/supabase/server'

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const id = Number(params.id)
        console.log(`[API] Fetching article ID: ${id} (params.id: ${params.id})`)
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
        }

        const article = await getArticleById(id, user.id)
        if (!article) {
            // Debugging: If article exists but user checks fail, it returns null.
            console.warn(`Article ${id} not found for user ${user.id}`)
            return NextResponse.json({ error: 'Article not found' }, { status: 404 })
        }

        let keywordData = null;
        let researchData = null;

        // Priority 1: Use direct keyword_id (if valid and not 0)
        if (article.keyword_id && article.keyword_id !== 0) {
            keywordData = await getKeywordById(article.keyword_id, user.id);
            // Wait, getResearchByKeywordId might return null if not found
            const research = await getResearchByKeywordId(article.keyword_id, user.id);
            researchData = research;
        }

        // Priority 2: Use research_id to find associated keyword (fallback for older articles)
        if (!keywordData && article.research_id) {
            researchData = await getResearchById(article.research_id, user.id);
            if (researchData && researchData.keyword_id) {
                keywordData = await getKeywordById(researchData.keyword_id, user.id);
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                ...article,
                keyword: keywordData ? keywordData.keyword : null,
                research: researchData || null
            }
        })
    } catch (error: any) {
        console.error(`[API Articles ${params.id}] Error:`, error)
        return new Response(JSON.stringify({
            success: false,
            error: error.message || 'Internal Server Error',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const id = Number(params.id)
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
        }

        const body = await req.json()
        const { title, slug, meta_title, meta_description, content, status, thumbnail_url } = body

        const result = await updateArticle(id, user.id, {
            title,
            slug,
            meta_title,
            meta_description,
            content,
            status,
            thumbnail_url
        })

        if (!result || !result.changes) {
            return NextResponse.json({ error: 'Failed to update or article not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true, message: 'Article updated successfully' })
    } catch (error) {
        console.error('Update error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const id = Number(params.id)
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
        }

        const result = await deleteArticle(id, user.id)

        if (!result.changes) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true, message: 'Deleted successfully' })
    } catch (error) {
        console.error('Delete error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
