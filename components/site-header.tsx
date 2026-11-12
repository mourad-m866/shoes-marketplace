import Link from 'next/link'

import { Logo } from '@/components/logo'
import { ViewSwitcher } from '@/components/view-switcher'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/" className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500">
          <Logo />
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <ViewSwitcher />
        </div>
      </div>
    </header>
  )
}
