import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json({
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'missing',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'set' : 'missing',
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'missing',
        DATABASE_PATH: process.env.DATABASE_PATH,
        NODE_ENV: process.env.NODE_ENV
    })
}
