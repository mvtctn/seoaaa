
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

// Load both .env and .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

async function createAdmin() {
    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('❌ NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing')
        return
    }

    console.log('🚀 Connecting to Supabase...')
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    const email = 'mvtctn@gmail.com'
    const password = 'Abc@123!'

    console.log(`👤 Creating admin user: ${email}...`)

    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: 'admin' }
    })

    if (error) {
        if (error.message.includes('already exists') || error.message.includes('email_exists')) {
            console.log('✅ User already exists. Updating user to admin...')

            // Get user list to find the ID
            const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
            const user = users.find(u => u.email === email)

            if (user) {
                const { error: updateError } = await supabase.auth.admin.updateUserById(
                    user.id,
                    {
                        password,
                        user_metadata: { role: 'admin' }
                    }
                )
                if (updateError) {
                    console.error('❌ Error updating user:', updateError.message)
                } else {
                    console.log('✅ User updated to admin and password reset!')
                }
            } else {
                console.error('❌ Could not find user in list even though it exists?')
            }
        } else {
            console.error('❌ Error creating user:', error.message)
        }
    } else {
        console.log('✅ Admin user created successfully!')
        console.log('UserID:', data.user.id)
    }
}

createAdmin()
