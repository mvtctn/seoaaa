import type { Metadata } from 'next'
import './globals.css'
import LayoutWrapper from '@/components/LayoutWrapper'

export const metadata: Metadata = {
    title: 'SEO Content Engine - Automated SEO Solution',
    description: 'Complete automated SEO solution - from keyword research to published articles with AI-generated images',
    keywords: ['SEO', 'Content Generation', 'AI Writing', 'Competitor Analysis', 'Automation'],
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="vi">
            <body>
                <LayoutWrapper>
                    {children}
                </LayoutWrapper>
            </body>
        </html>
    )
}
