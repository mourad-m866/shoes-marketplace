'use client'

import Image from 'next/image'
import { useState, useTransition } from 'react'

import { formatPrice } from '@/lib/constants'
import type { ActionResult, Shoe } from '@/lib/types'
import { sanityImageLoader } from '@/sanity/lib/image'

import { deleteShoe } from '@/sanity/actions/shoes'

interface ShoesTableProps {
  shoes: Shoe[]
  onEdit: (shoe: Shoe) => void
}

export function ShoesTable({shoes, onEdit}: ShoesTableProps) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<ActionResult | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)

  function handleDelete(shoe: Shoe) {
    const confirmed = window.confirm(
      `هل تريد حذف «${shoe.title}» نهائيًا؟ لا يمكن التراجع عن هذا الإجراء.`,
    )
    if (!confirmed) return

    setPendingId(shoe._id)

    startTransition(async () => {
      const result = await deleteShoe(shoe._id)
      setMessage(result)
      setPendingId(null)
    })
  }

  if (shoes.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-brand-200 bg-white p-10 text-center">
        <p className="text-lg font-bold text-brand-900">
          لا توجد أحذية معروضة في هذا المعرض بعد
        </p>
        <p className="mt-2 text-sm text-brand-500">
          استخدم زر «+ إضافة حذاء جديد للمعرض» لإضافة أول منتج.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[46rem] text-right text-sm">
          <thead className="bg-brand-50 text-xs font-bold text-brand-700">
            <tr>
              <th scope="col" className="px-5 py-4">
                الصورة
              </th>
              <th scope="col" className="px-5 py-4">
                اسم الحذاء
              </th>
              <th scope="col" className="px-5 py-4">
                الفئة
              </th>
              <th scope="col" className="px-5 py-4">
                السعر
              </th>
              <th scope="col" className="px-5 py-4">
                المقاسات
              </th>
              <th scope="col" className="px-5 py-4">
                الحالة
              </th>
              <th scope="col" className="px-5 py-4">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {shoes.map((shoe) => {
              return (
                <tr key={shoe._id} className="transition hover:bg-brand-50/50">
                  <td className="px-5 py-3">
                    <div className="relative size-16 overflow-hidden rounded-xl border border-brand-100 bg-brand-50">
                      {shoe.imageRef ? (
                        <Image
                          src={shoe.imageRef}
                          alt={shoe.title}
                          fill
                          loader={sanityImageLoader}
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex size-full items-center justify-center text-[0.6rem] font-semibold text-brand-300">
                          لا صورة
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-bold text-brand-950">{shoe.title}</p>
                    {shoe.description && (
                      <p className="mt-0.5 max-w-xs text-xs text-brand-500">
                        {shoe.description}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                      {shoe.category}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-bold text-brand-900">
                    {formatPrice(shoe.price)}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(shoe.sizes ?? []).length === 0 ? (
                        <span className="text-xs text-brand-400">—</span>
                      ) : (
                        (shoe.sizes ?? []).map((size) => (
                          <span
                            key={size}
                            className="rounded-md border border-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700"
                          >
                            {size}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                        shoe.isAvailable
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`size-1.5 rounded-full ${
                          shoe.isAvailable ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      />
                      {shoe.isAvailable ? 'متاح' : 'غير متاح'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(shoe)}
                        disabled={isPending}
                        className="rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-bold text-brand-700 transition hover:border-brand-400 hover:bg-brand-50 disabled:opacity-50"
                      >
                        تعديل
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(shoe)}
                        disabled={isPending}
                        className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50 disabled:opacity-50"
                      >
                        {isPending && pendingId === shoe._id ? 'جارٍ الحذف…' : 'حذف'}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {message && (
        <p
          role="status"
          className={`border-t px-5 py-3 text-sm font-semibold ${
            message.status === 'success'
              ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
              : 'border-rose-100 bg-rose-50 text-rose-700'
          }`}
        >
          {message.message}
        </p>
      )}
    </div>
  )
}
