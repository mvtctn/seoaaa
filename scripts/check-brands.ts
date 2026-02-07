
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkBrands() {
    const { data: brands, error } = await supabase.from('brands').select('*')
    if (error) {
        console.error('Error:', error)
    } else {
        console.log('Brands in Supabase:')
        brands.forEach(b => {
            console.log(`- ID: ${b.id}, Name: ${b.name}, Default: ${b.is_default}`)
        })
    }
}

checkBrands()
