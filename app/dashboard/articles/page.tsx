import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/server'
import { getAllArticles, getKeywordById } from '@/lib/db/database'
import ArticlesClient from './ArticlesClient'

export const dynamic = 'force-dynamic' // Ensure dynamic rendering for latest data

export default async function ArticlesPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen text-secondary">
                Please log in to view articles.
            </div>
        )
    }

    const queryClient = new QueryClient()

    // Prefetch articles on the server
    await queryClient.prefetchQuery({
        queryKey: ['articles'],
        queryFn: async () => {
            const articles = await getAllArticles(user.id)

            // Enrich articles with keyword data manually (matching API logic)
            // Note: This logic must match /app/api/articles/route.ts to ensure consistent data shape
            const enrichedArticles = await Promise.all(articles.map(async (article: any) => {
                let keyword = 'N/A';
                if (article.keyword_id) {
                    const kw = await getKeywordById(article.keyword_id, user.id);
                    if (kw) keyword = kw.keyword;
                }
                return { ...article, keyword };
            }));

            return enrichedArticles
        },
    })

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ArticlesClient />
        </HydrationBoundary>
    )
}
