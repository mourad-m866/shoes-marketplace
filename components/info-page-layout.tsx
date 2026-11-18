import type { ReactNode } from 'react'

import { SiteHeader } from '@/components/site-header'

interface InfoPageLayoutProps {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}

export function InfoPageLayout({
  eyebrow,
  title,
  description,
  children,
}: InfoPageLayoutProps) {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative isolate overflow-hidden bg-brand-950 text-white">
          <div
            aria-hidden="true"
            className="absolute -top-24 start-1/4 -z-10 size-72 rounded-full bg-accent-500/15 blur-3xl"
          />
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
            <p className="text-sm font-bold text-accent-400">{eyebrow}</p>
            <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">{title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-brand-100 sm:text-lg">
              {description}
            </p>
          </div>
        </section>
        <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
