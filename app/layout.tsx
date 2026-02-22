import type { Metadata } from 'next'
import './globals.css'
import LayoutWrapper from '@/components/LayoutWrapper'
import { ThemeProvider } from '@/components/ThemeProvider'
import Script from 'next/script'
import { getSetting } from '@/lib/db/database'
import QueryProvider from '@/components/QueryProvider'

export const metadata: Metadata = {
    title: 'SEOAAA - Automated SEO Solution',
    description: 'Complete automated SEO solution - from keyword research to published articles with AI-generated images',
    keywords: ['SEO', 'Content Generation', 'AI Writing', 'Competitor Analysis', 'Automation'],
    icons: {
        icon: '/favicon.svg',
    }
}

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const seoConfig = await getSetting('seo_config')
    const gaId = seoConfig?.google_analytics_id
    const scId = seoConfig?.search_console_id

    return (
        <html lang="vi" data-theme="dark">
            <head>
                {/* Preconnect to Google Fonts for faster loading */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                {scId && <meta name="google-site-verification" content={scId} />}
                {gaId && (
                    <>
                        <Script
                            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
                            strategy="afterInteractive"
                        />
                        <Script id="google-analytics" strategy="afterInteractive">
                            {`
                                window.dataLayer = window.dataLayer || [];
                                function gtag(){dataLayer.push(arguments);}
                                gtag('js', new Date());
                                gtag('config', '${gaId}');
                            `}
                        </Script>
                    </>
                )}
            </head>
            <body>
                <ThemeProvider>
                    <QueryProvider>
                        <LayoutWrapper>
                            {children}
                        </LayoutWrapper>
                    </QueryProvider>
                </ThemeProvider>
            </body>
        </html>
    )
}
