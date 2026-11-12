'use client'

import type { Exhibition } from '@/lib/types'

interface ExhibitionSelectProps {
  exhibitions: Exhibition[]
  selectedId: string
  onChange: (id: string) => void
}

/**
 * Dropdown used by the seller to pick the exhibition they are managing.
 */
export function ExhibitionSelect({
  exhibitions,
  selectedId,
  onChange,
}: ExhibitionSelectProps) {
  return (
    <div className="w-full max-w-md">
      <label
        htmlFor="exhibition-select"
        className="mb-1.5 block text-sm font-semibold text-brand-800"
      >
        المعرض الحالي
      </label>
      <select
        id="exhibition-select"
        value={selectedId}
        onChange={(event) => onChange(event.target.value)}
        disabled={exhibitions.length === 0}
        className="w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand-950 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:bg-brand-50"
      >
        {exhibitions.length === 0 ? (
          <option value="">لا توجد معارض مسجّلة بعد</option>
        ) : (
          exhibitions.map((exhibition) => (
            <option key={exhibition._id} value={exhibition._id}>
              {exhibition.storeName} — {exhibition.city}
            </option>
          ))
        )}
      </select>
    </div>
  )
}
