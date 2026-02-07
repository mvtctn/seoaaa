import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// tsx automatically loads .env.local and .env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Supabase URL:', supabaseUrl ? '✓ Found' : '✗ Missing')
console.log('Service Role Key:', supabaseKey ? '✓ Found' : '✗ Missing')

if (!supabaseUrl || !supabaseKey) {
    console.error('\n❌ Missing Supabase credentials!')
    console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local\n')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const dbPath = path.join(process.cwd(), 'data', 'database.json')

async function migrateArticlesOnly() {
    if (!fs.existsSync(dbPath)) {
        console.error('Source database.json not found')
        return
    }

    const raw = fs.readFileSync(dbPath, 'utf8')
    const data = JSON.parse(raw)

    console.log('--- Migrating Articles Only ---')

    if (data.articles?.length) {
        console.log(`Found ${data.articles.length} articles to migrate`)

        // Migrate in batches of 5 to avoid rate limits
        const batchSize = 5
        for (let i = 0; i < data.articles.length; i += batchSize) {
            const rawBatch = data.articles.slice(i, i + batchSize)

            // Fix: Convert 0 to null for foreign keys (Supabase doesn't allow FK = 0)
            const batch = rawBatch.map((article: any) => ({
                ...article,
                keyword_id: article.keyword_id === 0 ? null : article.keyword_id,
                research_id: article.research_id === 0 ? null : article.research_id,
                // Parse images if it's a string
                images: typeof article.images === 'string' && article.images
                    ? JSON.parse(article.images)
                    : article.images
            }))

            console.log(`Migrating articles ${i + 1} to ${Math.min(i + batchSize, data.articles.length)}...`)

            const { data: result, error } = await supabase.from('articles').upsert(batch)

            if (error) {
                console.error(`Error in batch ${i / batchSize + 1}:`, error)
                console.error('Sample article that failed:', JSON.stringify(batch[0], null, 2))
            } else {
                console.log(`✓ Batch ${i / batchSize + 1} completed`)
            }
        }
    }

    console.log('--- Migration Completed ---')
}

migrateArticlesOnly()
