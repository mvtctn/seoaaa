import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Need Service Role for bulk insert/overrides

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const dbPath = path.join(process.cwd(), 'data', 'database.json')

async function migrate() {
    if (!fs.existsSync(dbPath)) {
        console.error('Source database.json not found')
        return
    }

    const raw = fs.readFileSync(dbPath, 'utf8')
    const data = JSON.parse(raw)

    console.log('--- Starting Migration ---')

    // 1. Brands
    if (data.brands?.length) {
        console.log(`Migrating ${data.brands.length} brands...`)
        const { error } = await supabase.from('brands').upsert(data.brands)
        if (error) console.error('Error migrating brands:', error)
    }

    // 2. Keywords
    if (data.keywords?.length) {
        console.log(`Migrating ${data.keywords.length} keywords...`)
        const { error } = await supabase.from('keywords').upsert(data.keywords)
        if (error) console.error('Error migrating keywords:', error)
    }

    // 3. Research
    if (data.research?.length) {
        console.log(`Migrating ${data.research.length} research entries...`)
        const { error } = await supabase.from('research').upsert(data.research)
        if (error) console.error('Error migrating research:', error)
    }

    // 4. Articles
    if (data.articles?.length) {
        console.log(`Migrating ${data.articles.length} articles...`)
        const { error } = await supabase.from('articles').upsert(data.articles)
        if (error) console.error('Error migrating articles:', error)
    }

    // 5. Batch Jobs
    if (data.batch_jobs?.length) {
        console.log(`Migrating ${data.batch_jobs.length} batch jobs...`)
        const { error } = await supabase.from('batch_jobs').upsert(data.batch_jobs)
        if (error) console.error('Error migrating batch_jobs:', error)
    }

    console.log('--- Migration Completed ---')
}

migrate()
