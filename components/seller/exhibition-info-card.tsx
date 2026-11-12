import Image from 'next/image'

import type { Exhibition } from '@/lib/types'
import { sanityImageLoader } from '@/sanity/lib/image'

interface ExhibitionInfoCardProps {
  exhibition: Exhibition | undefined
}

/**
 * Summary card describing the exhibition the seller is currently managing.
 */
export function ExhibitionInfoCard({exhibition}: ExhibitionInfoCardProps) {
  if (!exhibition) {
    return (
      <div className="rounded-3xl border border-dashed border-brand-200 bg-white p-10 text-center">
        <p className="text-lg font-bold text-brand-900">لا يوجد معرض لعرضه</p>
        <p className="mt-2 text-sm text-brand-500">
          أضف معارض من داخل لوحة Sanity أولاً، ثم عد إلى هذه الصفحة.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 rounded-3xl border border-brand-100 bg-white p-5 shadow-sm sm:flex-row sm:items-start sm:p-6">
      <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-brand-100 bg-brand-50">
        {exhibition.logoRef ? (
          <Image
            src={exhibition.logoRef}
            alt={`شعار ${exhibition.storeName}`}
            fill
            loader={sanityImageLoader}
            sizes="96px"
            className="object-cover"
          />
        ) : (
          <span className="text-2xl font-bold text-brand-300">
            {exhibition.storeName.slice(0, 1)}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h2 className="text-xl font-bold text-brand-950">{exhibition.storeName}</h2>
        <p className="mt-1 text-sm font-medium text-brand-500">
          البائع: {exhibition.sellerName}
        </p>

        {exhibition.description && (
          <p className="mt-3 text-sm leading-relaxed text-brand-700">
            {exhibition.description}
          </p>
        )}

        <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <div>
            <dt className="text-xs font-semibold text-brand-400">المدينة</dt>
            <dd className="font-bold text-brand-800">{exhibition.city}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-brand-400">الهاتف</dt>
            <dd className="font-bold text-brand-800" dir="ltr">
              {exhibition.phone}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
