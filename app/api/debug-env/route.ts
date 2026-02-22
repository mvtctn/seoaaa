import { NextResponse } from 'next/server'

// This route has been removed for security reasons.
// It exposed environment variable names to public requests.
export async function GET() {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
}
