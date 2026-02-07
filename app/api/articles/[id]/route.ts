import { NextRequest, NextResponse } from 'next/server'
import { getArticleById } from '@/lib/db/database'

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = Number(params.id)
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
        }

        const article = getArticleById(id)
        if (!article) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 })
        }

        let keywordData = null;
        let researchData = null;
        const { getKeywordById, getResearchByKeywordId, getResearchById } = require('@/lib/db/database');

        // Priority 1: Use direct keyword_id (if valid and not 0)
        if (article.keyword_id && article.keyword_id !== 0) {
            keywordData = getKeywordById(article.keyword_id);
            researchData = getResearchByKeywordId(article.keyword_id);
        }

        // Priority 2: Use research_id to find associated keyword (fallback for older articles)
        if (!keywordData && article.research_id) {
            researchData = getResearchById(article.research_id);
            if (researchData && researchData.keyword_id) {
                keywordData = getKeywordById(researchData.keyword_id);
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
    } catch (error) {
        console.error('Fetch error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = Number(params.id)
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
        }

        const body = await req.json()
        const { title, slug, meta_title, meta_description, content, status } = body

        // Validate minimal required fields if necessary, currently flexible

        // Import dynamically to avoid circular deps if any, though standard import is fine usually
        const { updateArticle } = require('@/lib/db/database')

        const result = updateArticle(id, {
            title,
            slug,
            meta_title,
            meta_description,
            content,
            status
        })

        if (!result.changes) {
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
        const id = Number(params.id)
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
        }

        const { deleteArticle } = require('@/lib/db/database')
        const result = deleteArticle(id)

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
