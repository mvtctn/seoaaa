import { NextRequest, NextResponse } from 'next/server'
import { getAllArticles } from '@/lib/db/database'

export async function GET(req: NextRequest) {
    try {
        const { getAllArticles, getKeywordById } = require('@/lib/db/database')
        const articles = await getAllArticles()

        // Enrich articles with keyword data
        const enrichedArticles = await Promise.all(articles.map(async (article: any) => {
            let keyword = 'N/A';
            if (article.keyword_id) {
                const kw = await getKeywordById(article.keyword_id);
                if (kw) keyword = kw.keyword;
            }
            return { ...article, keyword };
        }));

        return NextResponse.json({ success: true, data: enrichedArticles })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch articles' },
            { status: 500 }
        )
    }
}
