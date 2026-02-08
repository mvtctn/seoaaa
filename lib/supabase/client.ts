import { createBrowserClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

let clientInstance: any = null

/**
 * Returns a Supabase client.
 * In the browser, it returns a singleton browser client.
 * On the server, it returns a new client (standard practice for SSR).
 */
export function createClient() {
    const isBrowser = typeof window !== 'undefined'

    if (isBrowser) {
        if (!clientInstance) {
            clientInstance = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                {
                    auth: {
                        persistSession: true,
                        autoRefreshToken: true,
                        detectSessionInUrl: true,
                        flowType: 'pkce'
                    }
                }
            )
        }
        return clientInstance
    }

    // Server-side: use standard createClient if we need Service Role or just Anon
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    return createSupabaseClient(supabaseUrl, supabaseKey)
}

// Export a constant for ease of use in server contexts where a new instance per check is fine
export const supabase = createClient()
