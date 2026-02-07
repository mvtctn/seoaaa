
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

async function checkUser() {
    console.log('URL:', supabaseUrl)
    console.log('Key exists:', !!supabaseServiceKey)
    if (supabaseServiceKey) {
        console.log('Key starts with:', supabaseServiceKey.substring(0, 5))
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)
    const { data: { users }, error } = await supabase.auth.admin.listUsers()

    if (error) {
        console.error('Error fetching users:', error)
        return
    }

    console.log('Total users:', users.length)
}

checkUser()
