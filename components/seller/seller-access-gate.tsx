'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

import type { ActionResult } from '@/lib/types'
import { authenticateSeller } from '@/sanity/actions/seller-auth'

const ADMIN_EMAIL = 'mourad.3alimdar3333@gmail.com'
const INVALID_CODE_MESSAGE =
  'عذراً، هذا القسم مخصص للعارضين المرخّصين من الإدارة فقط. يرجى التواصل مع الأدمن للحصول على كود التفعيل.'

export function SellerAccessGate() {
  const router = useRouter()
  const [accessCode, setAccessCode] = useState('')
  const [result, setResult] = useState<ActionResult | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    startTransition(async () => {
      const response = await authenticateSeller(accessCode)
      setResult(response)
      if (response.status === 'success') {
        router.refresh()
      }
    })
  }

  return (
    <section className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-extrabold text-brand-950">
          بوابة دخول العارضين
        </h1>
        <p className="mt-2 text-sm leading-7 text-brand-600">
          أدخل كود الترخيص الذي منحته لك الإدارة للتحقق من صلاحية الدخول إلى
          لوحة معرضك.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label
            htmlFor="seller-access-code"
            className="block text-sm font-semibold text-brand-800"
          >
            كود الترخيص
          </label>
          <input
            id="seller-access-code"
            type="password"
            autoComplete="current-password"
            required
            maxLength={128}
            value={accessCode}
            onChange={(event) => setAccessCode(event.target.value)}
            placeholder="أدخل كود التفعيل"
            className="w-full rounded-xl border border-brand-200 bg-brand-50/60 px-4 py-3 text-sm text-brand-950 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
            dir="ltr"
          />
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-brand-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-800 disabled:cursor-wait disabled:opacity-60"
          >
            {isPending ? 'جارٍ التحقق…' : 'دخول لوحة العارض'}
          </button>
        </form>

        {result?.status === 'error' && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm leading-7 text-rose-800"
          >
            <p>{result.message}</p>
            <p className="mt-2">
              للتواصل مع الإدارة:
              {' '}
              <a
                href={`mailto:${ADMIN_EMAIL}`}
                className="font-bold underline underline-offset-2"
                dir="ltr"
              >
                {ADMIN_EMAIL}
              </a>
            </p>
          </div>
        )}

        {!result && (
          <p className="mt-5 rounded-xl bg-brand-50 p-4 text-sm leading-7 text-brand-700">
            {INVALID_CODE_MESSAGE}{' '}
            <br />
            <span>للتواصل مع الإدارة: </span>
            <a
              href={`mailto:${ADMIN_EMAIL}`}
              className="font-bold underline underline-offset-2"
              dir="ltr"
            >
              {ADMIN_EMAIL}
            </a>
            .
          </p>
        )}
      </div>
    </section>
  )
}
