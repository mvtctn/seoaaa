import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
const dbPath = path.join(process.cwd(), 'data', 'database.json')

async function migrateArticlesOneByOne() {
    if (!fs.existsSync(dbPath)) {
        console.error('Source database.json not found')
        return
    }

    const raw = fs.readFileSync(dbPath, 'utf8')
    const data = JSON.parse(raw)

    console.log('--- Migrating Articles One by One ---\n')

    if (data.articles?.length) {
        console.log(`Found ${data.articles.length} articles to migrate\n`)

        let successCount = 0
        let skipCount = 0
        let errorCount = 0

        for (const article of data.articles) {
            // Fix: Convert 0 to null for foreign keys
            const cleaned = {
                ...article,
                keyword_id: article.keyword_id === 0 ? null : article.keyword_id,
                research_id: article.research_id === 0 ? null : article.research_id,
                images: typeof article.images === 'string' && article.images
                    ? JSON.parse(article.images)
                    : article.images
            }

            const { error } = await supabase.from('articles').insert([cleaned])

            if (error) {
                if (error.code === '23505') {
                    // Duplicate - skip
                    console.log(`⊘ Skipped (duplicate): ${article.title}`)
                    skipCount++
                } else {
                    console.error(`✗ Error: ${article.title}`)
                    console.error(`  Code: ${error.code}, Message: ${error.message}`)
                    errorCount++
                }
            } else {
                console.log(`✓ Migrated: ${article.title}`)
                successCount++
            }
        }

        console.log(`\n--- Summary ---`)
        console.log(`✓ Success: ${successCount}`)
        console.log(`⊘ Skipped: ${skipCount}`)
        console.log(`✗ Errors: ${errorCount}`)
        console.log(`Total: ${successCount + skipCount + errorCount}`)
    }

    console.log('\n--- Migration Completed ---')
}

migrateArticlesOneByOne()
