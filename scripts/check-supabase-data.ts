import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkData() {
    console.log('📊 Checking Supabase Data...\n')

    // Count brands
    const { count: brandCount } = await supabase.from('brands').select('*', { count: 'exact', head: true })
    console.log(`✓ Brands: ${brandCount} records`)

    // Count keywords
    const { count: keywordCount } = await supabase.from('keywords').select('*', { count: 'exact', head: true })
    console.log(`✓ Keywords: ${keywordCount} records`)

    // Count research
    const { count: researchCount } = await supabase.from('research').select('*', { count: 'exact', head: true })
    console.log(`✓ Research: ${researchCount} records`)

    // Count articles
    const { count: articleCount } = await supabase.from('articles').select('*', { count: 'exact', head: true })
    console.log(`✓ Articles: ${articleCount} records`)

    // Count batch jobs
    const { count: jobCount } = await supabase.from('batch_jobs').select('*', { count: 'exact', head: true })
    console.log(`✓ Batch Jobs: ${jobCount} records`)

    console.log('\n📋 Sample articles:')
    const { data: articles } = await supabase.from('articles').select('id, title, slug').limit(5)
    articles?.forEach(a => console.log(`  - [${a.id}] ${a.title} (${a.slug})`))
}

checkData()
