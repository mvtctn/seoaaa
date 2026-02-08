import { NextRequest, NextResponse } from 'next/server'
import { getAllArticles } from '@/lib/db/database'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
    try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { getAllArticles, getKeywordById } = require('@/lib/db/database')
        const articles = await getAllArticles(user.id)

        // Enrich articles with keyword data
        const enrichedArticles = await Promise.all(articles.map(async (article: any) => {
            let keyword = 'N/A';
            if (article.keyword_id) {
                const kw = await getKeywordById(article.keyword_id, user.id);
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
