import Image from 'next/image'

import { formatPrice } from '@/lib/constants'
import type { Shoe } from '@/lib/types'
import { sanityImageLoader } from '@/sanity/lib/image'

/**
 * A shoe card used in the customer showroom.
 */
export function ShoeCard({shoe}: {shoe: Shoe}) {
  const sizes = shoe.sizes ?? []

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm transition-shadow hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-brand-50">
        {shoe.imageRef ? (
          <Image
            src={shoe.imageRef}
            alt={shoe.title}
            fill
            loader={sanityImageLoader}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-sm font-medium text-brand-400">
            لا توجد صورة
          </div>
        )}

        {!shoe.isAvailable && (
          <span className="absolute top-3 left-3 rounded-full bg-brand-950/85 px-3 py-1 text-xs font-semibold text-white">
            غير متوفر حالياً
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold text-brand-950">{shoe.title}</h3>
          <span className="shrink-0 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            {shoe.category}
          </span>
        </div>

        {shoe.exhibitionName && (
          <p className="text-xs font-medium text-brand-500">
            {shoe.exhibitionName}
            {shoe.exhibitionCity ? ` — ${shoe.exhibitionCity}` : ''}
          </p>
        )}

        {sizes.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {sizes.map((size) => (
              <li
                key={size}
                className="rounded-md border border-brand-100 bg-white px-2 py-0.5 text-xs font-semibold text-brand-700"
              >
                {size}
              </li>
            ))}
          </ul>
        )}

        <p className="mt-auto pt-2 text-lg font-bold text-accent-600">
          {formatPrice(shoe.price)}
        </p>
      </div>
    </article>
  )
}
