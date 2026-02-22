/** @type {import('next').NextConfig} */

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: blob: https://image.pollinations.ai https://via.placeholder.com https://*.supabase.co https://lh3.googleusercontent.com;
  connect-src 'self' https://*.supabase.co https://api.groq.com https://api.gemini.google.com https://www.google-analytics.com https://serpapi.com;
  frame-ancestors 'none';
`.replace(/\n/g, ' ')

const securityHeaders = [
    // Content Security Policy
    { key: 'Content-Security-Policy', value: ContentSecurityPolicy },
    // Prevent MIME-type sniffing
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    // Strict HTTPS for 1 year (only on production)
    { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
    // No iframe embedding
    { key: 'X-Frame-Options', value: 'DENY' },
    // Stop browser from sending referrer to external sites
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    // Disable browser features not needed
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
    // Enable XSS protection in old browsers
    { key: 'X-XSS-Protection', value: '1; mode=block' },
]

const nextConfig = {
    reactStrictMode: true,

    // Enable compression
    compress: true,

    // Poweredby header reveals Next.js — remove it
    poweredByHeader: false,

    images: {
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 3600,
        remotePatterns: [
            { protocol: 'https', hostname: 'image.pollinations.ai', pathname: '/**' },
            { protocol: 'https', hostname: 'via.placeholder.com', pathname: '/**' },
            { protocol: 'https', hostname: '*.supabase.co', pathname: '/**' },
            { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
        ],
    },

    // Experimental: enable React Server Component streaming optimization
    experimental: {
        optimizeCss: true,
        optimizePackageImports: ['lucide-react', 'framer-motion'],
    },

    async headers() {
        return [
            // Security headers for all pages
            {
                source: '/(.*)',
                headers: securityHeaders,
            },
            // CORS for API – restrict to same origin for most; only allow cross-origin for specific public endpoints
            {
                source: '/api/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Credentials', value: 'true' },
                    // Changed from wildcard '*' to same-origin for security
                    { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_SITE_URL || 'https://seoaaa.com' },
                    { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,PATCH,DELETE,OPTIONS' },
                    { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Content-Type, Authorization' },
                ],
            },
            // Aggressive caching for static assets
            {
                source: '/fonts/(.*)',
                headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
            },
            {
                source: '/_next/static/(.*)',
                headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
            },
            {
                source: '/images/(.*)',
                headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }],
            },
        ]
    },

    async redirects() {
        return [
            // Block dangerous debug route permanently
            { source: '/api/debug-env', destination: '/404', permanent: false },
        ]
    },
}

module.exports = nextConfig
