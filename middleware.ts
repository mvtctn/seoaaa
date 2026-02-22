
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Simple in-memory rate limiter (per worker instance)
const RATE_LIMIT_WINDOW_MS = 60_000  // 1 minute
const MAX_REQUESTS = 100             // per IP per window (for API routes)

const requestCounts = new Map<string, { count: number; resetAt: number }>()

function getRateLimitResult(ip: string, limit: number): { allowed: boolean; remaining: number } {
    const now = Date.now()
    const entry = requestCounts.get(ip)

    if (!entry || now > entry.resetAt) {
        requestCounts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
        return { allowed: true, remaining: limit - 1 }
    }

    if (entry.count >= limit) {
        return { allowed: false, remaining: 0 }
    }

    entry.count++
    return { allowed: true, remaining: limit - entry.count }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // --- Rate limiting for API routes ---
    if (pathname.startsWith('/api/')) {
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || request.headers.get('x-real-ip')
            || 'unknown'

        const { allowed, remaining } = getRateLimitResult(ip, MAX_REQUESTS)

        if (!allowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please slow down.' },
                {
                    status: 429,
                    headers: {
                        'Retry-After': '60',
                        'X-RateLimit-Limit': String(MAX_REQUESTS),
                        'X-RateLimit-Remaining': '0',
                    }
                }
            )
        }

        // Add rate limit headers to allowed requests
        const response = NextResponse.next()
        response.headers.set('X-RateLimit-Limit', String(MAX_REQUESTS))
        response.headers.set('X-RateLimit-Remaining', String(remaining))

        // Still need auth for protected API routes – check below will handle it
    }

    let response = NextResponse.next({
        request: { headers: request.headers },
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
        return response
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    response = NextResponse.next({ request: { headers: request.headers } })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, {
                            ...options,
                            // Harden cookie security
                            httpOnly: true,
                            sameSite: 'lax',
                            secure: process.env.NODE_ENV === 'production',
                        })
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Protect /dashboard and /user routes
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/user')) {
        if (!user) {
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('redirect', pathname)
            return NextResponse.redirect(loginUrl)
        }
    }

    // Redirect /login to /dashboard if already logged in
    if (pathname.startsWith('/login') && user) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json)$).*)',
    ],
}
