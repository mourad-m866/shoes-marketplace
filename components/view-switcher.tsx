'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const VIEWS = [
  {
    href: '/',
    label: 'معرض الزبون',
    description: 'تصفَّح المعروضات',
  },
  {
    href: '/seller',
    label: 'لوحة العارض (البائع)',
    description: 'إدارة معروضاتك',
  },
] as const

/**
 * The header switch that toggles between the customer showroom and the
 * seller dashboard. It is a client component because it highlights the
 * active view based on the current route.
 */
export function ViewSwitcher() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="تبديل الواجهة"
      className="flex items-center gap-1 rounded-full border border-brand-100 bg-white p-1 shadow-sm"
    >
      {VIEWS.map((view) => {
        const isActive =
          view.href === '/' ? pathname === '/' : pathname.startsWith(view.href)

        return (
          <Link
            key={view.href}
            href={view.href}
            aria-current={isActive ? 'page' : undefined}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              isActive
                ? 'bg-brand-900 text-white shadow-sm'
                : 'text-brand-700 hover:bg-brand-50'
            }`}
          >
            {view.label}
          </Link>
        )
      })}
    </nav>
  )
}
