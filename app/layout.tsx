import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'

import { SiteFooter } from '@/components/site-footer'
import { SanityLive } from '@/sanity/lib/live'

import './globals.css'

const cairo = Cairo({
  variable: '--font-cairo',
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'خطواتك للمعارض | منصة معارض الأحذية',
    template: '%s | خطواتك للمعارض',
  },
  description:
    'منصة معارض الأحذية — تصفَّح أفخم الأحذية من أشهر المعارض المحليّة وتواصل مباشرةً مع العارضين.',
}

export default function RootLayout({
  children,
}: LayoutProps<'/'>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full antialiased`}>
      <body className="min-h-full bg-[var(--background)] font-sans text-[var(--foreground)]">
        {children}
        <Suspense fallback={null}>
          <SiteFooter />
        </Suspense>
        {/* Draft preview is not enabled, so `includeDrafts` stays false. */}
        <SanityLive includeDrafts={false} />
      </body>
    </html>
  )
}
