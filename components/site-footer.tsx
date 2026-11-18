'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const whatsappHref =
  'https://wa.me/212682909970?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D8%8C%20%D8%A3%D9%88%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%AE%D8%B7%D9%88%D8%A7%D8%AA%D9%83%20%D9%84%D9%84%D9%85%D8%B9%D8%A7%D8%B1%D8%B6.'

const linkClassName =
  'inline-flex w-fit rounded-sm text-sm text-slate-300 transition hover:text-amber-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300'

export function SiteFooter() {
  const pathname = usePathname()

  if (pathname === '/studio' || pathname.startsWith('/studio/')) return null

  return (
    <footer className="bg-[#0F172A] text-slate-200" dir="rtl">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-14 md:grid-cols-3 md:gap-8 lg:px-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-3 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300"
          >
            <span
              aria-hidden="true"
              className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-amber-300 text-slate-950"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-6"
              >
                <path d="M2.5 16.5h19" />
                <path d="M4 16.5v-4.2a2 2 0 0 1 .5-1.3l2.6-2.4a2 2 0 0 1 1.3-.6h3.1a2 2 0 0 1 1.7 1l1.1 1.4" />
                <path d="M13.2 9.4 15 6.6a1.6 1.6 0 0 1 1.4-.7h1.4a1.8 1.8 0 0 1 1.7 2.3l-1.5 5.1" />
                <path d="M4 16.5v1.2a1.3 1.3 0 0 0 1.3 1.3h1.4A1.3 1.3 0 0 0 8 17.7v-1.2" />
                <path d="M9 17.7v1.2a1.3 1.3 0 0 0 1.3 1.3h1.4a1.3 1.3 0 0 0 1.3-1.3v-1.2" />
              </svg>
            </span>
            <span>
              <span className="block text-lg font-extrabold text-white">
                خطواتك للمعارض
              </span>
              <span className="mt-0.5 block text-xs text-slate-400">
                منصة معارض الأحذية
              </span>
            </span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-7 text-slate-300">
            وجهتك لاكتشاف معارض الأحذية المحلية ومعروضاتها، ومقارنة الخيارات
            والتواصل مباشرةً مع العارض لإتمام عملية الشراء.
          </p>
        </div>

        <nav aria-labelledby="footer-links-title">
          <h2
            id="footer-links-title"
            className="text-sm font-bold text-white"
          >
            روابط سريعة
          </h2>
          <ul className="mt-5 space-y-3">
            <li>
              <Link href="/" className={linkClassName}>
                معرض الزبون
              </Link>
            </li>
            <li>
              <Link href="/seller" className={linkClassName}>
                بوابة العارضين
              </Link>
            </li>
            <li>
              <Link href="/about" className={linkClassName}>
                من نحن
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-labelledby="footer-support-title">
          <h2
            id="footer-support-title"
            className="text-sm font-bold text-white"
          >
            الدعم والسياسات
          </h2>
          <ul className="mt-5 space-y-3">
            <li>
              <Link href="/faq" className={linkClassName}>
                الأسئلة الشائعة
              </Link>
            </li>
            <li>
              <Link href="/terms" className={linkClassName}>
                شروط الاستخدام
              </Link>
            </li>
            <li>
              <Link href="/privacy" className={linkClassName}>
                سياسة الخصوصية
              </Link>
            </li>
            <li>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className={`${linkClassName} items-center gap-2`}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-4"
                >
                  <path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.45 0 .08 5.37.08 11.98c0 2.11.55 4.17 1.6 5.99L0 24l6.19-1.62a11.97 11.97 0 0 0 5.86 1.49h.01c6.6 0 11.98-5.37 11.98-11.98 0-3.2-1.25-6.21-3.52-8.41Zm-8.46 18.36h-.01a9.96 9.96 0 0 1-5.08-1.39l-.36-.21-3.67.96.98-3.58-.24-.37a9.93 9.93 0 0 1-1.53-5.27C2.15 6.5 6.59 2.06 12.06 2.06c2.65 0 5.14 1.03 7.01 2.9a9.85 9.85 0 0 1 2.91 7.01c0 5.47-4.45 9.87-9.92 9.87Zm5.43-7.4c-.3-.15-1.77-.87-2.05-.97-.28-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.9 1.22 3.1c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.5 1.69.64.71.22 1.36.19 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z" />
                </svg>
                تواصل معنا عبر واتساب
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-center text-xs leading-6 text-slate-400 sm:px-6 sm:text-sm lg:px-8">
          © 2026 خطواتك للمعارض. جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  )
}
