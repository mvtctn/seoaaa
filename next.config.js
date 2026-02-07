/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['localhost'],
        formats: ['image/webp', 'image/avif'],
    },
}

module.exports = nextConfig
